import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../style/LoginMenu.css";
import axios from "axios";
import API_URL from "../../config";
import ForgotPassword from "./ForgotPassword";

function LoginMenu({ menuOpen, toggleMenu }) {
  const navigate = useNavigate();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isSavedSettings, setIsSavedSettings] = useState(false);

  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const [fullName, setFullName] = useState("");
  const [passwordMember, setPasswordMember] = useState("");
  const [memberError, setMemberError] = useState("");

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    synagogueName: "",
    managerName: "",
    administratorPassword: "",
    hallPricePerHour: 0,
    pricePerPerson: 0,
  });
  const [confirmPasswordSettings, setConfirmPasswordSettings] = useState("");
  const [settingsError, setSettingsError] = useState("");

  const checkSettingsOnOpenAdmin = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      if (response.data && response.data.settingsExist) {
        setIsSavedSettings(true);
        setIsAdminModalOpen(true);
      } else {
        setIsSavedSettings(false);
        setIsSettingsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setIsSavedSettings(false);
      setIsSettingsModalOpen(true);
    }
  };

  const handleOpenAdminModal = () => {
    checkSettingsOnOpenAdmin();
    setAdminPassword("");
    setAdminError("");
  };

  const handleCloseAdminModal = () => {
    setIsAdminModalOpen(false);
    setAdminError("");
    setAdminPassword("");
  };

  const handleOpenMemberModal = () => {
    setIsMemberModalOpen(true);
    setFullName("");
    setPasswordMember("");
    setMemberError("");
  };

  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false);
  };

  const handleOpenRegisterModal = () => {
    console.log("API URL:", process.env.REACT_APP_API_URL);
    console.log("API URL 2:", API_URL);
    console.log("ENV VARIABLES:", process.env);

    setIsRegisterModalOpen(true);
    setRegisterForm({
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setRegisterError("");
    setRegistrationSuccess(false);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setRegistrationSuccess(false);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const handleAdminPasswordSubmit = async () => {
    if (!adminPassword) {
      setAdminError("אנא הזן סיסמה.");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/settings/login`, {
        password: adminPassword,
      });

      if (response.status === 200) {
        navigate("/admin");
      } else {
        setAdminError(response.data.message || "סיסמה שגויה, נסה שוב.");
      }
    } catch (err) {
      console.error("Error during admin login:", err);
      setAdminError("שגיאה בחיבור לשרת. נסה שוב מאוחר יותר.");
    }
  };

  const handleMemberSubmit = async () => {
    if (!fullName || !passwordMember) {
      setMemberError("אנא מלא את כל השדות.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, passwordMember }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", JSON.stringify(result.token));
        navigate("/member");
      } else {
        setMemberError(result.error || "פרטים שגויים, נסה שוב.");
      }
    } catch (error) {
      console.error("שגיאה בעת התחברות:", error);
      setMemberError("שגיאה בשרת, נסה שוב מאוחר יותר.");
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.synagogueName ||
      !formData.managerName ||
      !formData.administratorPassword ||
      formData.hallPricePerHour < 0 ||
      formData.pricePerPerson < 0
    ) {
      setSettingsError("אנא מלא את כל השדות כראוי.");
      return;
    }

    if (formData.administratorPassword !== confirmPasswordSettings) {
      setSettingsError("הסיסמאות אינן תואמות.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/settings`, formData);
      if (response.status === 200) {
        setIsSuccessVisible(true);
        setSettingsError("");
        setTimeout(() => {
          setIsSuccessVisible(false);
          setIsSavedSettings(true);
          setIsSettingsModalOpen(false);
        }, 2000);
      } else {
        setSettingsError("שגיאה בשמירת ההגדרות.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSettingsError("שגיאה בשמירת ההגדרות, אנא נסה שוב.");
    }
  };

  const handleRegisterSubmit = async () => {
    const {
      firstName,
      lastName,
      address,
      city,
      phone,
      email,
      password,
      confirmPassword,
    } = registerForm;

    if (
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setRegisterError("אנא מלא את כל השדות.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegisterError("כתובת המייל אינה תקינה.");
      return;
    }

    const phoneRegex = /^\d{9,}$/;
    if (!phoneRegex.test(phone)) {
      setRegisterError("מספר טלפון אינו תקין.");
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError("הסיסמאות אינן תואמות.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users`, {
        firstName,
        lastName,
        address,
        city,
        phone,
        email,
        password,
      });

      if (response.status === 201) {
        setRegistrationSuccess(true);
        setRegisterError("");
        setTimeout(() => {
          setIsRegisterModalOpen(false);
          setRegistrationSuccess(false);
        }, 2000);
      } else {
        setRegisterError("שגיאה בהוספת המתפלל.");
      }
    } catch (error) {
      console.error("שגיאה:", error);
      setRegisterError("שגיאה בהוספת המתפלל.");
    }
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    if (name === "hallPricePerHour" || name === "pricePerPerson") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: Number(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleOpenForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
  };

  return (
    <div className="login-icon">
      <FaUserCircle
        size={50}
        className="icon"
        onClick={() => toggleMenu(!menuOpen)}
      />

      {menuOpen && (
        <div className="login-options">
          <button className="entry-link" onClick={handleOpenAdminModal}>
            כניסת גבאי
          </button>
          <button className="entry-link" onClick={handleOpenMemberModal}>
            כניסת מתפלל
          </button>
        </div>
      )}

      {isAdminModalOpen && (
        <div className="modal-overlay-simple">
          <div className="modal-content-simple">
            <h3>נא להזין סיסמת מנהל</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="סיסמה"
            />
            {adminError && <p className="error-message">{adminError}</p>}
            <button onClick={handleAdminPasswordSubmit}>כניסה</button>
            <button onClick={handleCloseAdminModal}>סגור</button>
          </div>
        </div>
      )}

      {isSettingsModalOpen && (
        <div className="modal-overlay-simple">
          <div className="modal-content-simple2">
            {isSuccessVisible ? (
              <div className="success-message">
                <p>הפרטים נשמרו בהצלחה!</p>
              </div>
            ) : (
              <form
                onSubmit={handleSettingsSubmit}
                className="settings-form .modal-content-simple"
              >
                <h4>לא נמצאו הגדרות, אנא הזן פרטי בית הכנסת להגדרה ראשונית:</h4>
                <input
                  type="text"
                  name="synagogueName"
                  value={formData.synagogueName}
                  onChange={handleSettingsChange}
                  placeholder="שם בית הכנסת"
                  required
                />
                <input
                  type="text"
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleSettingsChange}
                  placeholder="שם הגבאי"
                  required
                />
                <input
                  type="password"
                  name="administratorPassword"
                  value={formData.administratorPassword}
                  onChange={handleSettingsChange}
                  placeholder="סיסמת ניהול"
                  required
                />
                <input
                  type="password"
                  name="confirmPasswordSettings"
                  value={confirmPasswordSettings}
                  onChange={(e) => setConfirmPasswordSettings(e.target.value)}
                  placeholder="אימות סיסמה"
                  required
                />
                {formData.administratorPassword &&
                  confirmPasswordSettings &&
                  formData.administratorPassword !==
                    confirmPasswordSettings && (
                    <p style={{ color: "red" }}>הסיסמאות אינן תואמות</p>
                  )}
                <input
                  type="number"
                  name="hallPricePerHour"
                  value={formData.hallPricePerHour || ""}
                  onChange={handleSettingsChange}
                  placeholder="מחיר האולם לשעה"
                  required
                />
                <input
                  type="number"
                  name="pricePerPerson"
                  value={formData.pricePerPerson || ""}
                  onChange={handleSettingsChange}
                  placeholder="מחיר למנה לאדם"
                  required
                />
                {settingsError && (
                  <p className="error-message">{settingsError}</p>
                )}
                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    formData.administratorPassword !== confirmPasswordSettings
                  }
                >
                  שמור
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCloseSettingsModal}
                >
                  סגור
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className="modal-overlay-simple">
          <div className="modal-content-simple">
            <h3>כניסת מתפלל</h3>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="שם מלא"
              required
            />
            <input
              type="password"
              value={passwordMember}
              onChange={(e) => setPasswordMember(e.target.value)}
              placeholder="סיסמה"
              required
            />
            {memberError && <p className="error-message">{memberError}</p>}
            <div
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <button onClick={handleMemberSubmit}>כניסה</button>
              <button onClick={handleCloseMemberModal}>סגור</button>
              <div
                style={{
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <a
                  href="#"
                  onClick={handleOpenRegisterModal}
                  onMouseEnter={(e) => (e.target.style.color = "#888")}
                  onMouseLeave={(e) => (e.target.style.color = "#000")}
                  style={{
                    fontSize: "15px",
                    color: "#000",
                    transition: "color 0.3s ease",
                  }}
                >
                  הרשמה למערכת
                </a>
                <a
                  href="#"
                  onClick={handleOpenForgotPasswordModal}
                  onMouseEnter={(e) => (e.target.style.color = "#888")}
                  onMouseLeave={(e) => (e.target.style.color = "#000")}
                  style={{
                    fontSize: "15px",
                    color: "#000",
                    transition: "color 0.3s ease",
                  }}
                >
                  שכחת את הסיסמה?
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="modal-overlay-simple">
          <div className="modal-content-simple2">
            <h3>הרשמה למערכת</h3>
            {registrationSuccess ? (
              <div className="success-message">
                <p>הרשמה בוצעה בהצלחה!</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="firstName"
                  value={registerForm.firstName}
                  onChange={handleRegisterInputChange}
                  placeholder="שם פרטי"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={registerForm.lastName}
                  onChange={handleRegisterInputChange}
                  placeholder="שם משפחה"
                  required
                />
                <input
                  type="text"
                  name="address"
                  value={registerForm.address}
                  onChange={handleRegisterInputChange}
                  placeholder="כתובת"
                  required
                />
                <input
                  type="text"
                  name="city"
                  value={registerForm.city}
                  onChange={handleRegisterInputChange}
                  placeholder="עיר"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleRegisterInputChange}
                  placeholder="טלפון"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterInputChange}
                  placeholder="כתובת מייל"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterInputChange}
                  placeholder="סיסמה"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterInputChange}
                  placeholder="אימות סיסמה"
                  required
                />
                {registerForm.password !== registerForm.confirmPassword && (
                  <p className="error-message">הסיסמאות אינן תואמות.</p>
                )}
                {registerError && (
                  <p className="error-message">{registerError}</p>
                )}
                <button onClick={handleRegisterSubmit}>הרשמה</button>
                <button onClick={handleCloseRegisterModal}>סגור</button>
              </>
            )}
          </div>
        </div>
      )}

      {isForgotPasswordModalOpen && (
        <div className="modal-overlay-simple">
          <div
            className="modal-content-simple2"
            style={{ position: "relative" }}
          >
            <ForgotPassword onClose={handleCloseForgotPasswordModal} />
            <button
              className="close-button-forgat"
              onClick={handleCloseForgotPasswordModal}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginMenu;
