import React from "react";
import { Result, Button } from "antd";
import "antd/dist/reset.css";
// import "./App.css";

export default function CompletePage({ paymentStatus }) {
  let resultStatus, resultTitle, resultMessage;

  switch (paymentStatus) {
    case "success":
      resultStatus = "success";
      resultTitle = "תשלום התקבל";
      resultMessage = "פרטי התשלום נשלחו לכם למייל";
      break;
    case "processing":
      resultStatus = "info";
      resultTitle = "התשלום בתהליך";
      resultMessage = "התשלום שלך בעיבוד.";
      break;
    case "error":
    default:
      resultStatus = "error";
      resultTitle = "שגיאה בתשלום";
      resultMessage = "משהו השתבש, אנא נסה שוב.";
      break;
  }

  const resetForm = () => {
    window.location.href = "/member";
  };

  return (
    <div id="payment-status">
      <Result
        status={resultStatus}
        title={resultTitle}
        subTitle={resultMessage}
        // extra={
        //   <Button type="primary" onClick={resetForm}>
        //     חזור
        //   </Button>
        // }
      />
    </div>
  );
}
