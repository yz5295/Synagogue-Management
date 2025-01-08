import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import SendEmail from "../Member/SendEmail";

export default function CheckoutForm({
  dpmCheckerLink,
  onComplete,
  to,
  subject,
  text,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentElementComplete, setIsPaymentElementComplete] =
    useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !isPaymentElementComplete) {
      setMessage("אנא ודא שפרטי התשלום הוזנו בצורה מלאה.");
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              address: {
                country: "IL",
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("אירעה שגיאה לא צפויה בעת ביצוע התשלום.");
        }
        onComplete("error");
      } else {
        if (paymentIntent && paymentIntent.status === "succeeded") {
          setPaymentSucceeded(true);
        } else if (paymentIntent && paymentIntent.status === "processing") {
          setMessage("התשלום בתהליך...");
          onComplete("processing");
        } else {
          setMessage("התשלום לא הצליח או דורש אמצעי תשלום נוסף.");
          onComplete("error");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("אירעה שגיאה לא צפויה בעת ביצוע התשלום.");
      onComplete("error");
    }
  };

  const handlePaymentElementChange = (event) => {
    setIsPaymentElementComplete(event.complete);
  };

  const paymentElementOptions = {
    layout: "accordion",
    fields: {
      billingDetails: {
        address: {
          country: "never",
        },
      },
    },
  };

  return (
    <>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
          onChange={handlePaymentElementChange}
        />

        <button
          disabled={
            isLoading || !stripe || !elements || !isPaymentElementComplete
          }
          id="submit"
        >
          <span id="button-text">
            {isLoading ? (
              <div className="spinner" id="spinner"></div>
            ) : (
              "לחץ לתשלום"
            )}
          </span>
        </button>

        {message && <div id="payment-message">{message}</div>}
      </form>

      {paymentSucceeded && (
        <div>
          <SendEmail
            to={to}
            subject={subject}
            text={text}
            onEmailComplete={(success) => {
              setIsLoading(false);
              if (success) {
                onComplete("success");
                setMessage("פרטי התשלום נשלחו לכם למייל");
              } else {
                onComplete("onlySuccess");
                setMessage("התשלום הצליח אך אירעה שגיאה בשליחת המייל");
              }
            }}
          />
        </div>
      )}
    </>
  );
}
