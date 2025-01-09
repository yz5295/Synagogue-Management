import React from "react";

function MemberLoginModal({
  fullName,
  setFullName,
  passwordMember,
  setPasswordMember,
  memberError,
  handleMemberSubmit,
  handleCloseMemberModal,
  handleOpenRegisterModal,
  handleOpenForgotPasswordModal,
}) {
  return (
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
              alignItems: "center",
            }}
          >
            <a
              href="#"
              onClick={handleOpenRegisterModal}
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
  );
}

export default MemberLoginModal;
