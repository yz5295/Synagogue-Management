import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSettings } from "../../contexts/SettingsContext";
import API_URL from "../../config";
import BeatLoader from "react-spinners/BeatLoader";

function ForgotPasswordModal({ handleCloseForgotPasswordModal }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { settings, loading } = useSettings();

  const synagogueName = settings?.synagogueName;

  if (loading || !settings) {
    return null;
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
        synagogueName,
      });

      if (response.status === 200) {
        setMessageType("success");
        setMessage("המייל לאיפוס נשלח בהצלחה!");
        setTimeout(() => {
          handleCloseForgotPasswordModal();
        }, 3000);
      } else {
        setMessageType("error");
        setMessage(response.data.error || "שגיאה בהגשת הבקשה");
      }
    } catch (error) {
      setMessageType("error");
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("שגיאה בשליחת הבקשה. נסה שנית.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay-simple">
      <div className="modal-content-simple2" style={{ position: "relative" }}>
        <div
          style={{
            padding: "8px",
            marginTop: "20px",
            maxWidth: "400px",
            margin: "auto",
          }}
        >
          {messageType === "success" ? (
            <div className="success-message" style={{ fontSize: "12px" }}>
              <p>{message}</p>
            </div>
          ) : (
            <>
              <h3 style={{ textAlign: "center" }}>שכחת את הסיסמה?</h3>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label htmlFor="email">
                  הכנס את כתובת הדואר האלקטרוני שלך:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="המייל שלך"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                    width: "100%",
                  }}
                />
                <button type="submit" disabled={isLoading}>
                  שלח קישור לאיפוס סיסמה
                </button>
              </form>
            </>
          )}

          {isLoading && (
            <div className="spinner-overlay">
              <BeatLoader color="#3498db" loading={true} />
            </div>
          )}

          {messageType === "error" && (
            <div
              className={`message error`}
              style={{
                marginTop: "20px",
                color: "red",
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              {message}
            </div>
          )}
        </div>

        {messageType !== "success" && (
          <button
            className="close-button-forgat"
            onClick={handleCloseForgotPasswordModal}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
