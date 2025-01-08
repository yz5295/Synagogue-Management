import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import CompletePage from "./CompletePage";
import API_URL from "../../config";
import { Spin } from "antd";

import "../../style/payment.css";

export default function CreditCard({
  amount,
  onPaymentSuccess,
  customerDetails,
  subject,
  text,
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [dpmCheckerLink, setDpmCheckerLink] = useState("");
  const [currentPage, setCurrentPage] = useState("checkout");
  const [stripePromise, setStripePromise] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const numericAmount = parseInt(amount);

  const handleCheckoutComplete = (status) => {
    setPaymentStatus(status);
    setCurrentPage("complete");
    console.log(status);

    if (status === "success") {
      onPaymentSuccess();
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/payment/publishable-key`)
      .then((res) => res.json())
      .then((data) => {
        setStripePromise(loadStripe(data.publishableKey));
      })
      .catch((err) => console.error("Error fetching publishable key:", err));
  }, []);

  useEffect(() => {
    if (numericAmount > 2) {
      fetch(`${API_URL}/payment/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ numericAmount }],
          customerDetails: customerDetails,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setDpmCheckerLink(data.dpmCheckerLink);
          // console.log("dpmCheckerLink:", data.dpmCheckerLink);
          // console.log("clientSecret:", data.clientSecret);
        })
        .catch((err) => console.error("Error creating payment intent:", err));
    } else {
      console.log("מינימום תרומה 3 שח");
    }
  }, [numericAmount]);

  const appearance = {
    theme: "stripe",
  };
  const loader = "auto";

  return (
    <div className="credit-card-wrapper">
      {clientSecret ? (
        <Elements
          key={clientSecret}
          stripe={stripePromise}
          options={{ clientSecret, appearance, loader }}
        >
          {currentPage === "checkout" && (
            <CheckoutForm
              dpmCheckerLink={dpmCheckerLink}
              onComplete={handleCheckoutComplete}
              to={customerDetails.email}
              subject={subject}
              text={text}
            />
          )}
          {currentPage === "complete" && (
            <CompletePage paymentStatus={paymentStatus} />
          )}
        </Elements>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            direction: "rtl",
            marginTop: "15px",
          }}
        >
          <Spin size="large" style={{ marginBottom: "10px" }} />
          <p
            style={{
              textAlign: "center",
              fontSize: "16px",
            }}
          >
            טוען אמצעי תשלום...
          </p>
        </div>
      )}
    </div>
  );
}
