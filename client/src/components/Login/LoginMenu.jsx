import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../style/LoginMenu.css";
import axios from "axios";
import API_URL from "../../config";
import { useUser } from "../../contexts/UserContext";
import { useSettings } from "../../contexts/SettingsContext";

import AdminLoginModal from "./AdminLoginModal";
import SettingsModal from "./SettingsModal";
import MemberLoginModal from "./MemberLoginModal";
import RegisterModal from "./RegisterModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

function LoginMenu({ menuOpen, toggleMenu }) {
  const navigate = useNavigate();
  const { setGetToken } = useUser();
  const { setSettings } = useSettings();

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
    synagogueAddress: "",
    synagogueCity: "",
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
    setConfirmPasswordSettings("");
    setFormData({
      synagogueName: "",
      managerName: "",
      synagogueAddress: "",
      synagogueCity: "",
      hallPricePerHour: "",
      pricePerPerson: "",
      administratorPassword: "",
    });
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
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setAdminError(err.response.data.message || "סיסמה שגויה, נסה שוב.");
        } else {
          setAdminError("שגיאה בחיבור לשרת. נסה שוב מאוחר יותר.");
        }
      } else {
        setAdminError("שגיאה בחיבור לשרת. נסה שוב מאוחר יותר.");
      }
      console.error("Error during admin login:", err);
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
        setGetToken(result.token);
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
      !formData.synagogueAddress ||
      !formData.synagogueCity ||
      !formData.administratorPassword ||
      formData.hallPricePerHour < 0 ||
      formData.pricePerPerson < 0
    ) {
      setSettingsError("אנא מלא את כל השדות.");
      return;
    }

    if (formData.administratorPassword !== confirmPasswordSettings) {
      {
        console.log("opo");
      }
      setSettingsError("הסיסמאות אינן תואמות.");
      return;
    }

    if (formData.administratorPassword.length < 6) {
      setSettingsError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/settings`, formData);
      if (response.status === 200) {
        setSettings(formData);
        setIsSettingsModalOpen(false);
        setIsSuccessVisible(true);
        setSettingsError("");
        setTimeout(() => {
          setIsSuccessVisible(false);
          setIsSavedSettings(true);
          setIsSettingsModalOpen(false);
        }, 3000);
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

    if (password.length < 6) {
      setRegisterError("הסיסמה חייבת להכיל לפחות 6 תווים.");
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
        setIsMemberModalOpen(false);
        setRegistrationSuccess(true);
        setRegisterError("");
        setTimeout(() => {
          setIsRegisterModalOpen(false);
          setRegistrationSuccess(false);
        }, 3000);
      } else {
        setRegisterError("שגיאה בהוספת המתפלל.");
      }
    } catch (error) {
      console.error("שגיאה:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "המייל כבר קיים במערכת"
      ) {
        setRegisterError("כתובת המייל כבר קיימת במערכת.");
      } else {
        setRegisterError("שגיאה בהוספת המתפלל.");
      }
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
    setIsMemberModalOpen(false);
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
        <AdminLoginModal
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          adminError={adminError}
          handleAdminPasswordSubmit={handleAdminPasswordSubmit}
          handleCloseAdminModal={handleCloseAdminModal}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isSuccessVisible={isSuccessVisible}
          formData={formData}
          confirmPasswordSettings={confirmPasswordSettings}
          settingsError={settingsError}
          handleSettingsSubmit={handleSettingsSubmit}
          handleSettingsChange={handleSettingsChange}
          setConfirmPasswordSettings={setConfirmPasswordSettings}
          handleCloseSettingsModal={handleCloseSettingsModal}
        />
      )}

      {isMemberModalOpen && (
        <MemberLoginModal
          fullName={fullName}
          setFullName={setFullName}
          passwordMember={passwordMember}
          setPasswordMember={setPasswordMember}
          memberError={memberError}
          handleMemberSubmit={handleMemberSubmit}
          handleCloseMemberModal={handleCloseMemberModal}
          handleOpenRegisterModal={handleOpenRegisterModal}
          handleOpenForgotPasswordModal={handleOpenForgotPasswordModal}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          registerForm={registerForm}
          registerError={registerError}
          registrationSuccess={registrationSuccess}
          handleRegisterInputChange={handleRegisterInputChange}
          handleRegisterSubmit={handleRegisterSubmit}
          handleCloseRegisterModal={handleCloseRegisterModal}
        />
      )}

      {isForgotPasswordModalOpen && (
        <ForgotPasswordModal
          handleCloseForgotPasswordModal={handleCloseForgotPasswordModal}
        />
      )}
    </div>
  );
}

export default LoginMenu;
