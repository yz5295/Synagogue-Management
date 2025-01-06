import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../../config";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessageType("error");
      setMessage("הטוקן לא נמצא.");
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessageType("error");
      setMessage("יש להכניס סיסמה חדשה ואישור סיסמה");
      return;
    }

    if (newPassword.length < 6) {
      setMessageType("error");
      setMessage("הסיסמה חייבת להכיל לפחות 6 ספרות");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("הסיסמאות אינן תואמות");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/forgot-password/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage(data.message);
      } else {
        setMessageType("error");
        setMessage(data.error);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("שגיאה באיפוס הסיסמה. נסה שנית.");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit} className="reset-password-form">
        <h2>הכנס סיסמה חדשה</h2>
        <label htmlFor="newPassword">סיסמה חדשה</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={newPassword}
          onChange={handlePasswordChange}
          required
          placeholder="סיסמה חדשה"
        />
        <label htmlFor="confirmPassword">אשר סיסמה חדשה</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          placeholder="אשר סיסמה חדשה"
        />
        <button type="submit" className="submit-button">
          אפס סיסמה
        </button>

        {message && <div className={`message ${messageType}`}>{message}</div>}
      </form>
      <button className="go-home-button" onClick={handleGoHome}>
        חזור לעמוד הראשי
      </button>
    </div>
  );
};

export default ResetPassword;
