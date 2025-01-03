import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import "../../style/ZmaniHayom.css";

const ZmaniHayom = () => {
  const [zmanim, setZmanim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [holidayTimes, setHolidayTimes] = useState(null);
  const [dafYomi, setDafYomi] = useState(null);

  useEffect(() => {
    const fetchZmanim = async () => {
      try {
        const zmanimUrl = `https://www.hebcal.com/zmanim?cfg=json&geonameid=281184`;
        const response = await axios.get(zmanimUrl);
        const zmanimData = response.data.times;
        setZmanim(zmanimData);
        setLoading(false);
      } catch (err) {
        setError("הייתה בעיה בהבאת המידע");
        setLoading(false);
      }
    };

    const fetchDafYomi = async () => {
      try {
        const now = new Date();
        const adjustedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const today = adjustedTime.toISOString().split("T")[0];
        const dafYomiUrl = `https://www.hebcal.com/hebcal?v=1&cfg=json&F=on&start=${today}&end=${today}`;
        const response = await axios.get(dafYomiUrl);
        const dafYomiData = response.data.items.find(
          (item) => item.category === "dafyomi"
        );
        setDafYomi(dafYomiData);
      } catch (err) {
        setError("הייתה בעיה בהבאת הדף היומי");
      }
    };
    const fetchShabbatTimes = async () => {
      try {
        const shabbatUrl = `https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&m=50`;
        const response = await axios.get(shabbatUrl);
        const shabbatData = response.data.items.reduce((acc, item) => {
          if (item.category === "candles") {
            acc.candleLighting = item.date;
          } else if (item.category === "havdalah") {
            acc.havdalah = item.date;
          }
          return acc;
        }, {});
        setShabbatTimes(shabbatData);
        // const holidayData = response.data.items.reduce((acc, item) => {
        //   console.log(item.candleLighting);
        //   console.log(item.havdalah);

        //   if (item.category === "candles") {
        //     acc.candleLighting = item.date;
        //   } else if (item.category === "havdalah") {
        //     acc.havdalah = item.date;
        //   }
        //   return acc;
        // }, {});
        // setHolidayTimes(holidayData);
      } catch (err) {
        setError("הייתה בעיה בהבאת זמני השבת והחג");
      }
    };

    fetchZmanim();
    fetchDafYomi();
    fetchShabbatTimes();
  }, []);

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("he-IL", options).format(date);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="zmani">
      <div className="zmanim-container">
        <h2 className="title">זמני היום</h2>
        <div className="zmanim-list">
          <div className="zmanim-item">
            <span className="zmanim-label">עלות השחר: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["alotHaShachar"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">זמן ציצית: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["misheyakir"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">נץ החמה: </span>
            <span className="zmanim-time">{formatTime(zmanim["sunrise"])}</span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">סוף זמן קריאת שמע מג"א: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["sofZmanShmaMGA"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">סוף זמן קריאת שמע גר"א: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["sofZmanShma"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">סוף זמן תפילה מג"א: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["sofZmanTfillaMGA"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">סוף זמן תפילה גר"א: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["sofZmanTfilla"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">חצות היום: </span>
            <span className="zmanim-time">{formatTime(zmanim["chatzot"])}</span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">מנחה גדולה: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["minchaGedola"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">מנחה קטנה: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["minchaKetana"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">פלג מנחה: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["plagHaMincha"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">שקיעת החמה: </span>
            <span className="zmanim-time">{formatTime(zmanim["sunset"])}</span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">בין השמשות: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["beinHaShmashos"])}
            </span>
          </div>
          <div className="zmanim-item">
            <span className="zmanim-label">חצות הלילה: </span>
            <span className="zmanim-time">
              {formatTime(zmanim["chatzotNight"])}
            </span>
          </div>
        </div>
      </div>
      {dafYomi && (
        <div className="daf-yomi-item">
          <span className="daf-yomi-label">הדף היומי:</span>{" "}
          <span className="daf-yomi-text">{dafYomi.hebrew}</span>
        </div>
      )}
      {shabbatTimes && (
        <div className="shabbat-times-container">
          <h2 className="title">זמני כניסת ויציאת שבת</h2>
          <div className="shabbat-time-item">
            <span className="shabbat-time-label">כניסת שבת: </span>
            <span className="shabbat-time">
              {formatTime(shabbatTimes["candleLighting"])}
            </span>
          </div>
          <div className="shabbat-time-item">
            <span className="shabbat-time-label">יציאת שבת: </span>
            <span className="shabbat-time">
              {" "}
              {formatTime(shabbatTimes["havdalah"])}
            </span>
          </div>
        </div>
      )}
      {/* {holidayTimes && (
        <div className="shabbat-times-container">
          <h2 className="title">זמני כניסת ויציאת החג</h2>
          <div className="shabbat-time-item">
            <span className="shabbat-time-label">כניסת החג: </span>
            <span className="shabbat-time">
              {formatTime(shabbatTimes["candleLighting"])}
            </span>
          </div>
          <div className="shabbat-time-item">
            <span className="shabbat-time-label">יציאת החג: </span>
            <span className="shabbat-time">
              {" "}
              {formatTime(shabbatTimes["havdalah"])}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ZmaniHayom;
