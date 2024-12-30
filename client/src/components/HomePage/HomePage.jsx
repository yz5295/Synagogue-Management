import React, { useEffect, useState } from "react";
import ZmaniHayom from "./ZmaniHayom";
import Date from "./Date";
import LoginMenu from "./LoginMenu";
import PrayerTimes from "./PrayerTimes";
import Messages from "./Messages";
import Congratulations from "./Congratulations";
import axios from "axios";
import "../../style/HomePage.css";

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showDayTimes, setShowDayTimes] = useState(false);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get("/Settings");
        const data = response.data;
        document.title = `בית הכנסת ${data.synagogueName}`;
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchDonations();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const Modal = ({ title, children, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="homepage-container mobile">
        <div className="login-container">
          <LoginMenu
            menuOpen={menuOpen}
            toggleMenu={() => setMenuOpen((prev) => !prev)}
          />
        </div>

        <div className="header-container">
          <Date />
        </div>

        <div className="buttons-container">
          <button
            className="button day-times-button"
            onClick={() => setShowDayTimes(true)}
          >
            זמני היום
          </button>
        </div>

        <div className="prayer-times-mobile-container">
          <div className="prayer-column weekday-column">
            <PrayerTimes type="weekday" />
          </div>
          <div className="prayer-column shabbat-column">
            <PrayerTimes type="shabbat" />
          </div>
        </div>

        <div className="messages-congratulations">
          <div className="messages-box">
            <Messages />
          </div>

          <div className="congratulations-box">
            <Congratulations />
          </div>
        </div>

        {showDayTimes && (
          <Modal title="זמני היום" onClose={() => setShowDayTimes(false)}>
            <ZmaniHayom />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="homepage-container">
      <LoginMenu
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((prev) => !prev)}
      />

      <div className="date-container">
        <Date />
      </div>

      <div className="main-content">
        <div className="box boxright">
          <PrayerTimes />
        </div>

        <div className="box-content">
          <div className="box boxtop">
            <div className="messages-container">
              <Messages />
            </div>
          </div>

          <div className="box boxbottom">
            <Congratulations />
          </div>
        </div>

        <div className="box boxleft">
          <ZmaniHayom />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
