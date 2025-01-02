import React, { useState, useEffect } from "react";
import "../../style/DateComponent.css";

const DateComponent = () => {
  const [time, setTime] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState("");
  const [parasha, setParasha] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showParasha, setShowParasha] = useState(true);
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    const fetchHebrewDate = async () => {
      try {
        const date = time.toISOString().split("T")[0];

        const sunsetResponse = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&latitude=31.7683&longitude=35.2137&date=${date}`
        );
        const sunsetData = await sunsetResponse.json();
        const sunsetTime = new Date(sunsetData.times.sunset);
        const isAfterSunset = time > sunsetTime;

        const response = await fetch(
          `https://www.hebcal.com/converter?cfg=json&date=${date}&g2h=1${
            isAfterSunset ? "&gs=on" : ""
          }`
        );
        const data = await response.json();
        setHebrewDate(removeNikud(data.hebrew));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchParasha = async () => {
      try {
        const response = await fetch(
          "https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&m=50"
        );
        const data = await response.json();
        const upcomingParasha = data.items.find(
          (item) => item.category === "parashat"
        );
        if (upcomingParasha) {
          setParasha(upcomingParasha.hebrew);
        }
      } catch (error) {
        console.error("שגיאה בטעינת הפרשה", error);
      }
    };

    const checkJewishHoliday = async () => {
      const today = new Date();
      let year = today.getFullYear();
      const now = new Date();
      // const now = new Date("2024-12-31T17:00:52+02:00");
      // console.log(now);

      // if (now.getMonth() === 0 && now.getDate() === 1) {
      //   year -= 1;
      // }

      try {
        const response = await fetch(
          `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&nx=on&year=${year}&geonameid=281184`
        );
        const data = await response.json();

        const todayHolidays = data.items.filter((item) => {
          const itemDate = new Date(item.date);

          const isHolidayOrRoshChodesh =
            item.category === "holiday" || item.category === "roshchodesh";

          return (
            isHolidayOrRoshChodesh &&
            now >= itemDate &&
            now < new Date(itemDate.getTime() + 24 * 60 * 60 * 1000)
          );
        });

        if (todayHolidays.length > 0) {
          const currentHoliday = todayHolidays.map((holiday) => holiday.hebrew);

          setHolidays(currentHoliday);
        } else {
          setHolidays([]);
        }
      } catch (error) {
        console.error("שגיאה בטעינת החגים", error);
      }
    };

    fetchHebrewDate();
    fetchParasha();
    checkJewishHoliday();

    return () => clearInterval(interval);
  }, [time]);

  useEffect(() => {
    let intervalId;

    intervalId = setInterval(() => {
      if (showParasha) {
        setShowParasha(false);
      } else if (holidays.length > 0) {
        setCurrentHolidayIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % holidays.length;
          if (nextIndex === 0) {
            setShowParasha(true);
          }
          return nextIndex;
        });
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [showParasha, holidays.length]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const removeNikud = (text) => text.replace(/[֑-ׇ]/g, "");

  const getFormattedTime = (date) => ({
    hours: date.getHours().toString().padStart(2, "0"),
    minutes: date.getMinutes().toString().padStart(2, "0"),
    seconds: date.getSeconds().toString().padStart(2, "0"),
  });

  const { hours, minutes, seconds } = getFormattedTime(time);

  return (
    <div className={`date-container ${isMobile ? "mobile" : "desktop"}`}>
      {isMobile ? (
        <div>
          <div className="time-container">{`${hours}:${minutes}:${seconds}`}</div>
          <div className="title-box">
            <div className="date">{hebrewDate || "טוען תאריך עברי..."}</div>
            <div className="parashaholday">
              {showParasha || holidays.length === 0
                ? parasha || "טוען פרשת השבוע..."
                : holidays.length > 0
                ? holidays[currentHolidayIndex]
                : "טוען חגים..."}
            </div>
          </div>
        </div>
      ) : (
        <div className="content-box">
          <div className="side-content hebrew-date">
            {hebrewDate || "טוען תאריך עברי..."}
          </div>
          <div className="main-contentt">
            <h1>
              {hours}:{minutes}:{seconds}
            </h1>
          </div>
          <div
            className={`side-content parasha side ${
              showParasha ? "fade-in" : "fade-out"
            }`}
          >
            {showParasha
              ? parasha || "טוען פרשת השבוע..."
              : holidays.length > 0
              ? holidays[currentHolidayIndex]
              : "טוען חגים..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateComponent;
