import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

function SendEmail({ to, subject, text }) {
  const [senderName, setSenderName] = useState("");
  const hasSentEmail = useRef(false);

  useEffect(() => {
    const sendEmail = async () => {
      if (hasSentEmail.current) return;
      hasSentEmail.current = true;

      try {
        console.log("Sending email:", { to, subject, text, senderName });

        const settingsResponse = await fetch("/settings");
        if (!settingsResponse.ok) throw new Error("Failed to fetch settings");
        const settingsData = await settingsResponse.json();

        const updatedSenderName = `בית כנסת ${settingsData.synagogueName}`;
        setSenderName(updatedSenderName);

        const formattedMessage = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; text-align: right; direction: rtl;">
            <p>${text}</p>
          </div>
        `;

        const response = await axios.post(
          "http://localhost:5000/sendmail/email",
          {
            to,
            subject,
            text: formattedMessage,
            senderName: updatedSenderName,
          }
        );

        console.log("Response:", response.data);
      } catch (error) {
        console.error("שגיאה בשליחת האיימל", error);
      }
    };

    sendEmail();
  }, [to, subject, text]);

  return null;
}

export default SendEmail;
