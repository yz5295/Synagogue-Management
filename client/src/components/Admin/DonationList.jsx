import React, { useEffect, useState } from "react";
import { Table, message, Select, Space, Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import API_URL from "../../config";

const { Option } = Select;
const { Title } = Typography;

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(`${API_URL}/donation`);
        const data = response.data;
        const processedData = data.map((donation) => ({
          id: donation.donation_id,
          amount: donation.amount,
          purpose: donation.purpose,
          date: donation.date,
          user: {
            first_name: donation.first_name,
            last_name: donation.last_name,
            phone: donation.phone,
            email: donation.email,
            address: donation.address,
            city: donation.city,
          },
        }));

        setDonations(processedData);
        const urlMonth =
          parseInt(searchParams.get("month")) || dayjs().month() + 1;
        const urlYear = parseInt(searchParams.get("year")) || dayjs().year();

        setSelectedMonth(urlMonth);
        setSelectedYear(urlYear);

        const initialFiltered = filterDonations(
          processedData,
          urlMonth,
          urlYear,
          null
        );
        setFilteredDonations(initialFiltered);
        setSearchParams({ month: urlMonth, year: urlYear });
      } catch (error) {
        message.error("שגיאה בהבאת תרומות:");
      }
    };

    fetchDonations();
  }, []);

  const DATE_FORMAT = "DD/MM/YYYY";

  const generateYearOptions = (range = 10) => {
    const currentYear = dayjs().year();
    return Array.from(
      { length: range },
      (_, i) => currentYear - Math.floor(range / 2) + i
    );
  };

  const filterDonations = (donations, month, year, purpose) => {
    return donations.filter((donation) => {
      const donationDate = dayjs(donation.date);
      const matchesMonth = donationDate.month() + 1 === month;
      const matchesYear = donationDate.year() === year;
      const matchesPurpose =
        !purpose || donation.purpose === purpose || purpose === "כל המטרות";

      return matchesMonth && matchesYear && matchesPurpose;
    });
  };

  const handleFilterChange = (key, value) => {
    const filters = {
      month: key === "month" ? value : selectedMonth,
      year: key === "year" ? value : selectedYear,
      purpose:
        key === "month" || key === "year" ? "כל המטרות" : selectedPurpose,
      [key]: value,
    };

    setSelectedMonth(filters.month);
    setSelectedYear(filters.year);
    setSelectedPurpose(filters.purpose);

    const updatedFiltered = filterDonations(
      donations,
      filters.month,
      filters.year,
      filters.purpose
    );
    setFilteredDonations(updatedFiltered);
    setSearchParams({
      month: filters.month,
      year: filters.year,
      purpose: filters.purpose,
    });
  };

  const columns = [
    {
      title: "שם פרטי",
      dataIndex: ["user", "first_name"],
      key: "firstName",
    },
    {
      title: "שם משפחה",
      dataIndex: ["user", "last_name"],
      key: "lastName",
    },
    {
      title: "כתובת",
      dataIndex: ["user", "address"],
      key: "address",
    },
    {
      title: "עיר",
      dataIndex: ["user", "city"],
      key: "city",
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
    },
    {
      title: "תאריך",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format(DATE_FORMAT),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>רשימת תרומות</Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="בחר חודש"
          style={{ width: 120 }}
          value={selectedMonth}
          onChange={(value) => handleFilterChange("month", value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i + 1} value={i + 1}>
              {dayjs().month(i).format("MMMM")}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="בחר שנה"
          style={{ width: 120 }}
          value={selectedYear}
          onChange={(value) => handleFilterChange("year", value)}
        >
          {generateYearOptions().map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="בחר מטרה"
          style={{ width: 200 }}
          value={selectedPurpose}
          onChange={(value) => handleFilterChange("purpose", value)}
          allowClear
        >
          <Option value={null}>כל המטרות</Option>
          <Option value="נדרים ונדבות">נדרים ונדבות</Option>
          <Option value="עליות וכיבודים">עליות וכיבודים</Option>
          <Option value="אבות ובנים">אבות ובנים</Option>
          <Option value="פינת קפה">פינת קפה</Option>
          <Option value="אוצר הספרים">אוצר הספרים</Option>
          <Option value="החזקה כללית">החזקה כללית</Option>
        </Select>
      </Space>
      <Table
        dataSource={filteredDonations}
        columns={columns}
        rowKey={(record) => `${record.date}-${record.purpose}`}
        bordered
        locale={{ emptyText: "אין נתונים להצגה" }}
        style={{ overflowX: "auto" }}
      />
    </div>
  );
};

export default DonationList;
