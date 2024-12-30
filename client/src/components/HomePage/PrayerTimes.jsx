import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/PrayerTimes.css";

const PrayerTimes = ({ type }) => {
  const [prayerList, setPrayerList] = useState({ weekday: [], shabbat: [] });
  const [loading, setLoading] = useState(true);

  const fetchPrayerTimes = async () => {
    try {
      const { data } = await axios.get("/prayer-times");
      setPrayerList(data);
    } catch (error) {
      console.error("שגיאה בטעינת זמני התפילה");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">טוען...</div>
      </div>
    );
  }

  return (
    <div className="prayer-times-container">
      <div className="scrolling-content">
        {(type === "weekday" || !type) && (
          <>
            <h1 className="section-title">תפילות יום חול</h1>
            {prayerList.weekday.length > 0 ? (
              prayerList.weekday.map((prayer, index) => (
                <h2 className="prayer-title" key={index}>
                  {`${prayer.name} - ${prayer.time}`}
                </h2>
              ))
            ) : (
              <p className="no-prayers">אין תפילות ליום חול</p>
            )}
          </>
        )}

        {(type === "shabbat" || !type) && (
          <>
            <h1 className="section-title">תפילות שבת</h1>
            {prayerList.shabbat.length > 0 ? (
              prayerList.shabbat.map((prayer, index) => (
                <h2 className="prayer-title" key={index}>
                  {`${prayer.name} - ${prayer.time}`}
                </h2>
              ))
            ) : (
              <p className="no-prayers">אין תפילות לשבת</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrayerTimes;
