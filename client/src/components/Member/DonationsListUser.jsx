import React, { useEffect, useState } from "react";
import { Table, Select, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/he";
import axios from "axios";
import API_URL from "../../config";

dayjs.locale("he");

const { Option } = Select;
const { Title } = Typography;

const DonationsListUser = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const monthParam = parseInt(urlParams.get("month"), 10);
    const yearParam = parseInt(urlParams.get("year"), 10);

    if (monthParam && monthParam >= 1 && monthParam <= 12) {
      setSelectedMonth(monthParam);
    }
    if (yearParam && yearParam >= 1900 && yearParam <= 2100) {
      setSelectedYear(yearParam);
    }

    const fetchDonations = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token"));
        if (!token) {
          throw new Error("שגיאה: פרטי משתמש חסרים. התחבר מחדש ונסה שוב.");
        }

        const userResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.status !== 200) {
          throw new Error("שגיאה בשליפת פרטי המשתמש");
        }

        const userId = userResponse.data.user.id;

        const donationResponse = await fetch(`${API_URL}/donation`);
        if (!donationResponse.ok) {
          throw new Error(
            `בקשה נכשלה בשל תקלה בשרת סטטוס: ${donationResponse.status}`
          );
        }

        const donations = await donationResponse.json();

        const userDonations = donations.filter(
          (donation) => donation.user_id === userId
        );

        setDonations(userDonations);

        filterDonations(
          userDonations,
          monthParam || selectedMonth,
          yearParam || selectedYear
        );
      } catch (error) {
        console.error("שגיאה בטעינת התרומות:");
      }
    };

    fetchDonations();
  }, []);

  useEffect(() => {
    filterDonations(donations, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, donations]);

  const filterDonations = (donationsList, month, year) => {
    const filtered = donationsList.filter((donation) => {
      const donationDate = dayjs(donation.date);
      return (
        donationDate.isValid() &&
        donationDate.month() + 1 === month &&
        donationDate.year() === year
      );
    });
    setFilteredDonations(filtered);
    updateURL(month, year);
  };

  const updateURL = (month, year) => {
    const url = new URL(window.location);
    url.searchParams.set("month", month);
    url.searchParams.set("year", year);
    window.history.pushState({}, "", url);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const columns = [
    {
      title: "תאריך",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "מטרה",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "סכום",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount} ש"ח`,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>רשימת התרומות שלי</Title>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Select
          placeholder="בחר חודש"
          value={selectedMonth}
          style={{ width: 120 }}
          onChange={handleMonthChange}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i} value={i + 1}>
              {dayjs().month(i).format("MMMM")}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="בחר שנה"
          onChange={handleYearChange}
          style={{ width: 120 }}
          value={selectedYear}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const year = dayjs().year() - 5 + i;
            return (
              <Option key={year} value={year}>
                {year}
              </Option>
            );
          })}
        </Select>
      </div>
      <Table
        dataSource={filteredDonations}
        columns={columns}
        rowKey={(record) => record.donation_id}
        locale={{ emptyText: "אין תרומות להצגה" }}
      />
    </div>
  );
};

export default DonationsListUser;
