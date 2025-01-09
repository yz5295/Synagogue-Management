import React from "react";

function AdminLoginModal({
  adminPassword,
  setAdminPassword,
  adminError,
  handleAdminPasswordSubmit,
  handleCloseAdminModal,
}) {
  return (
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
  );
}

export default AdminLoginModal;
