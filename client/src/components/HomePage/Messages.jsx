import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "../../style/Messages.css";
import API_URL from "../../config";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
          setIsAnimating(false);
        }, 1000);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messageAdmin`);
      let allMessages = response.data;
      const holidayMessages = await checkJewishHoliday();
      if (holidayMessages && holidayMessages.length > 0) {
        const holidayMsgsToAdd = holidayMessages.map((msg) => ({
          content: msg,
        }));
        allMessages = [...allMessages, ...holidayMsgsToAdd];
      }
      setMessages(allMessages);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const checkJewishHoliday = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const date = now.toISOString().split("T")[0];

      const sunsetResponse = await fetch(
        `https://www.hebcal.com/zmanim?cfg=json&latitude=31.7683&longitude=35.2137&date=${date}`
      );
      const sunsetData = await sunsetResponse.json();
      const sunsetTime = new Date(sunsetData.times.sunset);

      const isAfterSunset = now > sunsetTime;

      const response = await fetch(
        `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&nx=on&year=${year}&geonameid=281184`
      );
      const holidaysData = await response.json();

      const currentJewishDate = isAfterSunset
        ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        : date;

      const todayHolidays = holidaysData.items.filter((item) => {
        const holidayDateTime = dayjs(item.date);

        if (item.date.includes("T")) {
          const nextDay = holidayDateTime.add(1, "day").format("YYYY-MM-DD");
          return nextDay === currentJewishDate;
        }

        const holidayDate = holidayDateTime.format("YYYY-MM-DD");
        return holidayDate === currentJewishDate;
      });

      if (todayHolidays.length > 0) {
        const holidayMessages = todayHolidays
          .map((holiday) => {
            const title = holiday.title || "";
            if (
              title.includes("Rosh Chodesh") ||
              title.includes("Pesach") ||
              title.includes("Sukkot") ||
              title.includes("Shavuot")
            ) {
              return "יעלה ויבוא";
            } else if (title.includes("Chanukah") || title.includes("Purim")) {
              return "על הניסים";
            }
            return null;
          })
          .filter(Boolean);

        return holidayMessages;
      }

      return [];
    } catch (error) {
      console.error("שגיאה בקבלת נתונים", error);
      return [];
    }
  };

  const currentMessage = messages[currentIndex] || null;

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  return (
    <div className="messages-container">
      {currentMessage ? (
        <div className={`message-card ${isAnimating ? "fade-out" : "fade-in"}`}>
          <h1 className="message-content">{currentMessage.content}</h1>
        </div>
      ) : (
        <div className="no-messages">אין הודעות להצגה</div>
      )}
    </div>
  );
};

export default Messages;
