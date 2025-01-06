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
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [information, setInformation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month"));
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

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
    filterData(data, dateRange);
    if (dateRange) {
      updateURL(dateRange[0], dateRange[1]);
    }
  }, [data, dateRange]);

  const fetchData = async () => {
    try {
      await updateFinanceManager();
      const response = await axios.get(`${API_URL}/financemanager`);
      const sortedData = response.data.sort(
        (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
      );
      setData(sortedData);
      filterData(sortedData, dateRange);
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

    setStartDate(startD);
    setEndDate(endD);

    const filtered = data.filter((item) => {
      const itemDate = dayjs(item.date);
      const isInDateRange = itemDate.isBetween(startD, endD, null, "[]");
      return isInDateRange;
    });

    const sortedFiltered = filtered.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );

    setFilteredData(sortedFiltered);
    calculateTotals(sortedFiltered);
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
    addForm.resetFields();
    const newEntry = {
      id: Date.now(),
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      readOnly: false,
    };
    try {
      await axios.post(`${API_URL}/financemanager`, newEntry);
      fetchData();

      setIsAddModalVisible(false);
      message.success("נתונים נשמרו בהצלחה");
    } catch (error) {
      message.error("שגיאה בהוספת נתונים");
    }
  };

  const handleEditSave = async (values) => {
    try {
      const updatedEntry = {
        ...currentDetails,
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      };
      await axios.put(
        `${API_URL}/financemanager/${currentDetails.id}`,
        updatedEntry
      );
      fetchData();
      setIsEditModalVisible(false);
      setCurrentDetails(null);
      message.success("נתונים עודכנו בהצלחה");
    } catch (error) {
      message.error("שגיאה בעדכון הנתונים");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/financemanager/${id}`);
      fetchData();
      message.success("הנתון נמחק בהצלחה");
    } catch (error) {
      message.error("שגיאה במחיקת הנתון");
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
      } else {
        console.error("עדכון נתונים נכשל");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDetails = async (record) => {
    setIsViewModalVisible(true);
    setLoadingData(true);
    setInformation(null);

    const orginalid = record.original_id;

    try {
      if (record.category === "תרומה") {
        const response = await axios.get(`${API_URL}/donation`);
        const data = response.data;
        const matchedDonation = data.find(
          (donation) => donation.donation_id === orginalid
        );
        if (matchedDonation) {
          setInformation(matchedDonation);
        } else {
          console.warn("No matching donation found for the given ID");
        }
      } else if (record.category === "הזמנת אולם") {
        const response = await axios.get(`${API_URL}/eventlist/events`);
        const data = response.data;
        const matchedEvent = data.find((event) => event.id === orginalid);
        if (matchedEvent) {
          setInformation(matchedEvent);
        } else {
          console.warn("No matching event found for the given ID");
        }
      }
    } catch (error) {
      console.error("שגיאה בטעינת מידע");
    } finally {
      setLoadingData(false);
    }
  };

  const handleEdit = (record) => {
    setCurrentDetails(record);
    editForm.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : undefined,
    });
    setIsEditModalVisible(true);
  };

  const exportToExcel = () => {
    const XLSX = require("xlsx");
    const modifiedData = filteredData.map((item) => {
      const { readOnly, original_id, ...rest } = item;
      return rest;
    });
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finance");
    XLSX.writeFile(workbook, "הכנסות והוצאות.xlsx");
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
      width: 150,
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
        <Button
          type="primary"
          onClick={() => {
            setIsAddModalVisible(true);
            addForm.resetFields();
          }}
        >
          הוספה
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <RangePicker
            value={dateRange}
            format="DD/MM/YYYY"
            placeholder={["בחר תאריך התחלתי", "בחר תאריך סופי"]}
            onChange={(dates) => {
              setDateRange(dates);
            }}
            style={{ width: "100%" }}
          />
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
        bordered={true}
        loading={loading}
        style={{
          margin: "2px auto",
          background: "#f7f7f7",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {(totalIncome === 0 ||
          totalIncome === undefined ||
          isNaN(totalIncome)) &&
        (totalExpense === 0 ||
          totalExpense === undefined ||
          isNaN(totalExpense)) ? (
          <Title level={5} style={{ textAlign: "center", color: "#888" }}>
            אין נתונים להצגה
          </Title>
        ) : (
          <>
            <Title
              level={4}
              style={{
                textAlign: "center",
                color: "#333",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              הוצאות והכנסות מ-{startDate.format("DD-MM-YYYY")} עד{" "}
              {endDate.format("DD-MM-YYYY")}
            </Title>
            <Row gutter={24} justify="center">
              <Col span={8} style={{ textAlign: "center", padding: "10px" }}>
                <h3
                  style={{
                    color: "#2e7d32",
                    fontWeight: "600",
                    fontSize: "18px",
                  }}
                >
                  סה"כ הכנסות:{" "}
                  <Text
                    style={{
                      color: "#2e7d32",
                      fontWeight: "500",
                      fontSize: "18px",
                    }}
                  >
                    {totalIncome}
                  </Text>
                </h3>
              </Col>
              <Col
                span={8}
                style={{
                  textAlign: "center",
                  padding: "10px",
                }}
              >
                <h3
                  style={{
                    color: "#d32f2f",
                    fontWeight: "600",
                    fontSize: "18px",
                  }}
                >
                  סה"כ הוצאות:{" "}
                  <Text
                    style={{
                      color: "#d32f2f",
                      fontWeight: "500",
                      fontSize: "18px",
                    }}
                  >
                    {totalExpense}-
                  </Text>
                </h3>
              </Col>
              <Col span={8} style={{ textAlign: "center", padding: "10px" }}>
                <h3
                  style={{
                    color:
                      totalIncome - totalExpense >= 0 ? "#2e7d32" : "#d32f2f", // צבע שונה לפי יתרה חיובית או שלילית
                    fontWeight: "600",
                    fontSize: "18px",
                  }}
                >
                  יתרה:{" "}
                  <Text
                    style={{
                      color:
                        totalIncome - totalExpense >= 0 ? "#2e7d32" : "#d32f2f",
                      fontWeight: "500",
                      fontSize: "18px",
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

      {/* מודל הצגת מידע */}
      <Modal
        title={`מידע`}
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
      >
        {loadingData ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="טוען נתונים..." />
          </div>
        ) : information ? (
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
              {dayjs(information.date).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="סכום">{`${information.amount} ₪`}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Title level={4} style={{ textAlign: "center" }}>
            אין נתונים להצגה
          </Title>
        )}
      </Modal>

      {/* מודל הוספת פריט חדש */}
      <Modal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: "right" }}>
          <Title level={4} style={{ textAlign: "center" }}>
            הוספת פריט חדש
          </Title>
          <Form form={addForm} onFinish={handleAdd} layout="vertical">
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

      {/* מודל עריכת פריט */}
      <Modal
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setCurrentDetails(null);
        }}
        footer={null}
      >
        <div style={{ textAlign: "right" }}>
          <Title level={4} style={{ textAlign: "center" }}>
            עריכת פריט
          </Title>
          <Form form={editForm} onFinish={handleEditSave} layout="vertical">
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
