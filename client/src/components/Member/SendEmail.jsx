import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_URL from "../../config";

function SendEmail({ to, subject, text, onEmailComplete }) {
  const [senderName, setSenderName] = useState("");
  const hasSentEmail = useRef(false);

  useEffect(() => {
    const sendEmail = async () => {
      if (hasSentEmail.current) return;
      hasSentEmail.current = true;

      try {
        console.log("Sending email:", { to, subject, text, senderName });

        const settingsResponse = await fetch(`${API_URL}/settings`);
        if (!settingsResponse.ok) throw new Error("Failed to fetch settings");
        const settingsData = await settingsResponse.json();

        const updatedSenderName = `בית כנסת ${settingsData.synagogueName}`;
        setSenderName(updatedSenderName);

        const formattedMessage = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; text-align: right; direction: rtl;">
            <p>${text}</p>
          </div>
        `;

        const response = await axios.post(`${API_URL}/sendmail/email`, {
          to,
          subject,
          text: formattedMessage,
          senderName: updatedSenderName,
        });
        if (onEmailComplete) onEmailComplete(true);
        console.log("Response:", response.data);
      } catch (error) {
        if (onEmailComplete) onEmailComplete(false);
        console.error("שגיאה בשליחת האיימל", error);
      }
    };

    sendEmail();
  }, [to, subject, text]);

  return null;
}

export default SendEmail;
