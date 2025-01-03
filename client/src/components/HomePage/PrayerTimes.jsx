import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "../../style/PrayerTimes.css";
import API_URL from "../../config";

const PrayerTimes = ({ type }) => {
  const [prayerList, setPrayerList] = useState({ weekday: [], shabbat: [] });
  const [loading, setLoading] = useState(true);

  const fetchPrayerTimes = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/prayer-times`);
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
      <div style={{ textAlign: "center" }}>
        <Spin indicator={<LoadingOutlined spin />} />
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
