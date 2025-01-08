import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";
import API_URL from "../../config";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const { settings } = useUser();

  const synagogueName = settings.synagogueName;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
        synagogueName,
      });

      if (response.status === 200) {
        setMessageType("success");
        setMessage("המייל לאיפוס נשלח בהצלחה!");
        setTimeout(() => {
          if (onClose) onClose();
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
    }
  };

  return (
    <div
      style={{
        padding: "8px",
        marginTop: "20px",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h3 style={{ textAlign: "center" }}>שכחת את הסיסמה?</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <label htmlFor="email">הכנס את כתובת הדואר האלקטרוני שלך:</label>
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
        <button type="submit">שלח קישור לאיפוס סיסמה</button>
      </form>
      {message && (
        <div
          style={{
            marginTop: "20px",
            color: messageType === "success" ? "green" : "red",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;