import React from "react";

function SettingsModal({
  isSuccessVisible,
  formData,
  confirmPasswordSettings,
  settingsError,
  handleSettingsSubmit,
  handleSettingsChange,
  setConfirmPasswordSettings,
  handleCloseSettingsModal,
}) {
  return (
    <div className="modal-overlay-simple">
      <div className="modal-content-simple2">
        {isSuccessVisible ? (
          <div className="success-message">
            <p>הפרטים נשמרו בהצלחה!</p>
          </div>
        ) : (
          <>
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
              type="text"
              name="synagogueAddress"
              value={formData.synagogueAddress}
              onChange={handleSettingsChange}
              placeholder="כתובת בית הכנסת"
              required
            />
            <input
              type="text"
              name="synagogueCity"
              value={formData.synagogueCity}
              onChange={handleSettingsChange}
              placeholder="עיר בית הכנסת"
              required
            />
            <h5>הגדרת אולמי בית הכנסת</h5>
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
              placeholder="מחיר מנה לאדם"
              required
            />
            <h5>הזן סיסמה</h5>
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
            {settingsError && <p className="error-message">{settingsError}</p>}
            <button onClick={handleSettingsSubmit}>שמור</button>
            <button onClick={handleCloseSettingsModal}>סגור</button>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsModal;
