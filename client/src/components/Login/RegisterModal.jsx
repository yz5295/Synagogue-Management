import React from "react";
import { Modal, Box, Typography, Alert } from "@mui/material";

function RegisterModal({
  registerForm,
  registerError,
  registrationSuccess,
  handleRegisterInputChange,
  handleRegisterSubmit,
  handleCloseRegisterModal,
}) {
  return (
    <div className="modal-overlay-simple">
      <div className="modal-content-simple2">
        {registrationSuccess ? (
          <div className="success-message">
            <p>הרשמה בוצעה בהצלחה!</p>
          </div>
        ) : (
          <>
            <h3>הרשמה למערכת</h3>
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
              minLength={6}
            />
            <input
              type="password"
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleRegisterInputChange}
              placeholder="אימות סיסמה"
              required
            />
            {registerError && (
              <div className="error-message">{registerError}</div>
            )}
            <button onClick={handleRegisterSubmit}>הרשמה</button>
            <button onClick={handleCloseRegisterModal}>סגור</button>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterModal;
