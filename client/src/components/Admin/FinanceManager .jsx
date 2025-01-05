import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Select,
  Form,
  Input,
  DatePicker,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Descriptions,
  message,
  Spin,
} from "antd";

import { DownloadOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/he";
import isBetween from "dayjs/plugin/isBetween";
import API_URL from "../../config";

dayjs.extend(isBetween);
dayjs.locale("he");

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const FinanceManager = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [totalIncome, setTotalIncome] = useState();
  const [totalExpense, setTotalExpense] = useState();
  const [information, setInformation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [dateRange, setDateRange] = useState();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentMonthStart = dayjs().startOf("month").format("YYYY-MM-DD");
    const currentMonthEnd = dayjs().endOf("month").format("YYYY-MM-DD");
    const params = new URLSearchParams(location.search);

    updateURL(currentMonthStart, currentMonthEnd);

    fetchData();
  }, []);

  useEffect(() => {
    if (currentDetails) {
      form.setFieldsValue({
        ...currentDetails,
        date: currentDetails.date ? dayjs(currentDetails.date) : undefined,
      });
    }
    filterData(data, dateRange);
    if (dateRange) {
      updateURL(dateRange[0], dateRange[1]);
    }
    updateFinanceManager();
  }, [data, month, year, dateRange, currentDetails, form, dateRange]);

  const fetchData = async () => {
    try {
      await updateFinanceManager();
      const response = await axios.get(`${API_URL}/financemanager`);
      setData(response.data);
      filterData(response.data, [startDate, endDate]);
    } catch (error) {
      message.error("שגיאה בהבאת נתונים:");
    } finally {
      setLoading(false);
    }
  };

  const filterData = (data, dateRange) => {
    if (!dateRange || dateRange.length !== 2) return;

    const [start, end] = dateRange;
    const startD = dayjs(start).startOf("day");
    const endD = dayjs(end).endOf("day");

    setStartDate(startD.format("DD-MM-YYYY"));
    setEndDate(endD.format("DD-MM-YYYY"));

    const filtered = data.filter((item) => {
      const itemDate = dayjs(item.date);
      const isInDateRange = itemDate.isBetween(startD, endD, null, "[]");
      return isInDateRange;
    });

    setFilteredData(filtered);
    calculateTotals(filtered);
  };

  const updateURL = (start, end) => {
    const formattedStart = start ? dayjs(start).format("YYYY-MM-DD") : "";
    const formattedEnd = end ? dayjs(end).format("YYYY-MM-DD") : "";
    const queryString = `?startDate=${formattedStart}&endDate=${formattedEnd}`;
    navigate(queryString, { replace: true });
  };

  const calculateTotals = (data) => {
    const income = data
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const expense = data
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    setTotalIncome(income);
    setTotalExpense(expense);
  };

  const handleAdd = async (values) => {
    form.resetFields();
    const newEntry = {
      id: Date.now(),
      ...values,
      date: values.date.toISOString(),
      readOnly: false,
    };
    try {
      await axios.post(`${API_URL}/financemanager`, newEntry);
      fetchData();

      setIsAddModalVisible(false);
    } catch (error) {
      message.error("שגיאה בהוספת ערך");
    }
  };

  const handleEditSave = async (values) => {
    try {
      const updatedEntry = {
        ...currentDetails,
        ...values,
        date: values.date.toISOString(),
      };
      await axios.put(
        `${API_URL}/financemanager/${currentDetails.id}`,
        updatedEntry
      );
      fetchData();
      setIsEditModalVisible(false);
      setCurrentDetails(null);
    } catch (error) {
      message.error("שגיאה בעדכון הערך");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/financemanager/${id}`);
      fetchData();
    } catch (error) {
      message.error("שגיאה במחיקת הערך");
    }
  };

  async function updateFinanceManager() {
    try {
      const response = await fetch(`${API_URL}/financemanager/update-finance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
      } else {
        console.error("עדכון נתונים נכשל");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDetails = (record) => {
    const orginalid = record.original_id;
    if (record.category === "תרומה") {
      const fetchDonations = async () => {
        try {
          const response = await axios.get(`${API_URL}/donation`);
          const data = response.data;
          const matchedDonation = data.find(
            (donation) => donation.donation_id === orginalid
          );
          if (matchedDonation) {
            setInformation(matchedDonation);
            console.log(information);
          } else {
            console.warn("No matching donation found for the given ID");
          }
        } catch (error) {
          console.error("שגיאה בטעינת תרומות");
        } finally {
          setLoadingData(false);
        }
      };
      fetchDonations();
    }

    if (record.category === "הזמנת אולם") {
      const fetchEvents = async () => {
        try {
          const response = await axios.get(`${API_URL}/eventlist/events`);
          const data = response.data;

          const matchedEvents = data.find((event) => event.id === orginalid);
          if (matchedEvents) {
            setInformation(matchedEvents);
          } else {
            console.warn("No matching event found for the given ID");
          }
        } catch (error) {
          console.error("שגיאה בטעינת אירועים");
        } finally {
          setLoadingData(false);
        }
      };
      fetchEvents();
    }

    setCurrentDetails(record);
    setIsViewModalVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentDetails(record);
    setIsEditModalVisible(true);
  };

  const exportToExcel = () => {
    const XLSX = require("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finance");
    XLSX.writeFile(workbook, "FinanceData.xlsx");
  };

  const columns = [
    {
      title: "סוג",
      dataIndex: "type",
      key: "type",
      render: (type) => (type === "income" ? "הכנסה" : "הוצאה"),
      filters: [
        { text: "הכנסות", value: "income" },
        { text: "הוצאות", value: "expense" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "קטגוריה",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "פרטים",
      dataIndex: "details",
      key: "details",
    },
    {
      title: "תאריך",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "סכום",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) =>
        record.type === "income" ? (
          <span style={{ color: "green" }}>{amount}</span>
        ) : (
          <span style={{ color: "red" }}>{amount}-</span>
        ),
    },
    {
      title: "פעולות",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {!record.readOnly ? (
            <>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Button
                  size="small"
                  color="default"
                  variant="filled"
                  onClick={() => handleEdit(record)}
                >
                  תיקון
                </Button>
              </div>
              <Button
                size="small"
                color="danger"
                variant="filled"
                onClick={() => handleDelete(record.id)}
              >
                מחק
              </Button>
            </>
          ) : (
            <Button
              size="small"
              color="primary"
              variant="filled"
              onClick={() => handleDetails(record)}
            >
              מידע
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ direction: "rtl", padding: "20px" }}>
      <Title level={3}>ניהול כספים</Title>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          direction: "rtl",
        }}
      >
        <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
          הוספה
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <RangePicker
            placeholder={["בחר תאריך התחלתי", "בחר תאריך סופי"]}
            onChange={(dates) => {
              setDateRange(dates);
            }}
            style={{ width: "100%" }}
          />{" "}
          {console.log("12")}
        </div>

        <Button
          onClick={exportToExcel}
          icon={<DownloadOutlined />}
          style={{
            backgroundColor: "#4CAF50",
            borderColor: "#4CAF50",
            color: "white",
          }}
        >
          ייצוא לאקסל
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "אין נתונים להצגה" }}
      />
      <Card
        bordered={false}
        loading={loading}
        style={{ width: 600, margin: "2px auto", background: "" }}
      >
        {(totalIncome === 0 ||
          totalIncome === undefined ||
          isNaN(totalIncome)) &&
        (totalExpense === 0 ||
          totalExpense === undefined ||
          isNaN(totalExpense)) ? (
          <Title level={4} style={{ textAlign: "center" }}>
            אין נתונים להצגה
          </Title>
        ) : (
          <>
            <Title level={4} style={{ textAlign: "center" }}>
              הוצאות והכנסות מ-{startDate} עד {endDate}
            </Title>
            <Row gutter={24} justify="center" style={{ marginTop: "28px" }}>
              <Col span={8} style={{ textAlign: "center" }}>
                <h3>
                  סה"כ הכנסות:{" "}
                  <Text style={{ color: "green", fontWeight: "500" }}>
                    {totalIncome}
                  </Text>
                </h3>
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <h3>
                  סה"כ הוצאות:{" "}
                  <Text style={{ color: "red", fontWeight: "500" }}>
                    {totalExpense}-
                  </Text>
                </h3>
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <h3>
                  יתרה:{" "}
                  <Text
                    style={{
                      color: totalIncome - totalExpense >= 0 ? "green" : "red",
                      fontWeight: "500",
                    }}
                  >
                    {totalIncome - totalExpense < 0
                      ? `${Math.abs(totalIncome - totalExpense)}-`
                      : totalIncome - totalExpense}
                  </Text>
                </h3>
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Modal
        title={`מידע`} // מודל תצוגת פריט
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
      >
        {loadingData ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="טוען נתונים..." />
          </div>
        ) : (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="שם פרטי">
              {information.first_name}
            </Descriptions.Item>
            <Descriptions.Item label="שם משפחה">
              {information.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="אימייל">
              {information.email}
            </Descriptions.Item>
            <Descriptions.Item label="טלפון">
              {information.phone}
            </Descriptions.Item>
            <Descriptions.Item label="מטרה">
              {information.purpose || information.eventType}
            </Descriptions.Item>
            <Descriptions.Item label="תאריך">
              {new Date(information.date).toLocaleDateString("he-IL")}
            </Descriptions.Item>
            <Descriptions.Item label="סכום">{`${information.amount} ₪`}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        visible={isAddModalVisible} // מודל הוספת פריט חדש
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: "right" }}>
          <h3 style={{ textAlign: "center" }}>הוספת פריט חדש</h3>
          <Form form={form} onFinish={handleAdd} style={{ gap: "10px" }}>
            <Form.Item
              name="type"
              label="סוג"
              rules={[{ required: true, message: "בחר סוג" }]}
            >
              <Select>
                <Option value="income">הכנסה</Option>
                <Option value="expense">הוצאה</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="category"
              label="קטגוריה"
              rules={[{ required: true, message: "הכנס קטגוריה" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="details"
              label="פרטים"
              rules={[{ required: true, message: "הכנס פרטים" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="date"
              label="תאריך"
              rules={[{ required: true, message: "בחר תאריך" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="amount"
              label="סכום"
              rules={[{ required: true, message: "הכנס סכום" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                שמירה
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        visible={isEditModalVisible} // מודל עריכת פריט
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: "right" }}>
          <h3 style={{ textAlign: "center" }}>עריכת פריט</h3>
          <Form
            form={form}
            initialValues={{
              ...currentDetails,
              date: currentDetails ? dayjs(currentDetails.date) : undefined,
            }}
            onFinish={handleEditSave}
            style={{ gap: "10px" }}
          >
            <Form.Item
              name="type"
              label="סוג"
              rules={[{ required: true, message: "בחר סוג" }]}
            >
              <Select>
                <Option value="income">הכנסה</Option>
                <Option value="expense">הוצאה</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="category"
              label="קטגוריה"
              rules={[{ required: true, message: "הכנס קטגוריה" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="details"
              label="פרטים"
              rules={[{ required: true, message: "הכנס פרטים" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="date"
              label="תאריך"
              rules={[{ required: true, message: "בחר תאריך" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="amount"
              label="סכום"
              rules={[{ required: true, message: "הכנס סכום" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                שמירה
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceManager;
