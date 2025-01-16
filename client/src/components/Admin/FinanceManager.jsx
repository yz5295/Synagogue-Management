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
  Typography,
  Row,
  Col,
  message,
} from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/he";
import isBetween from "dayjs/plugin/isBetween";
import SyncLoader from "react-spinners/SyncLoader";
import API_URL from "../../config";

dayjs.extend(isBetween);
dayjs.locale("he");

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const FinanceManager = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
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

    const formatDate = (date) => {
      const d = new Date(date);
      const day = ("0" + d.getDate()).slice(-2);
      const month = ("0" + (d.getMonth() + 1)).slice(-2);
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const incomeData = filteredData
      .filter((item) => item.type === "income")
      .map((item) => {
        const { readOnly, original_id, ...rest } = item;
        if (rest.date) {
          rest.date = formatDate(rest.date);
        }
        return rest;
      });

    const expenseData = filteredData
      .filter((item) => item.type === "expense")
      .map((item) => {
        const { readOnly, original_id, ...rest } = item;
        if (rest.date) {
          rest.date = formatDate(rest.date);
        }
        rest.amount = -rest.amount;
        return rest;
      });

    const combinedData = [...incomeData, ...expenseData];
    const combinedWorksheet = XLSX.utils.json_to_sheet(combinedData);
    const incomeWorksheet = XLSX.utils.json_to_sheet(incomeData);
    const expenseWorksheet = XLSX.utils.json_to_sheet(expenseData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, combinedWorksheet, "הכנסות והוצאות");
    XLSX.utils.book_append_sheet(workbook, incomeWorksheet, "הכנסות");
    XLSX.utils.book_append_sheet(workbook, expenseWorksheet, "הוצאות");
    XLSX.writeFile(
      workbook,
      `הכנסות והוצאות ${startDate.format("DD-MM-YYYY")}-${endDate.format(
        "DD-MM-YYYY"
      )}.xlsx`
    );
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
      width: 100,
      render: (_, record) => (
        <Space size="small" style={{ justifyContent: "center", gap: "2px" }}>
          {!record.readOnly ? (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ color: "blue" }}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                style={{ color: "red" }}
              />
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  const ExpandedRow = ({ record }) => {
    const [loadingData, setLoadingData] = useState(true);
    const [information, setInformation] = useState(null);

    useEffect(() => {
      const fetchDetails = async () => {
        const originalId = record.original_id;
        const [prefix, id] = originalId.split("_");

        const endpoints = {
          donation: `${API_URL}/donation`,
          event: `${API_URL}/eventlist/events`,
        };

        try {
          if (endpoints[prefix]) {
            const response = await axios.get(endpoints[prefix]);
            const data = response.data;

            const matchedData = data.find((item) =>
              prefix === "donation"
                ? item.donation_id === parseInt(id)
                : item.id === parseInt(id)
            );

            if (matchedData) {
              setInformation(matchedData);
            } else {
              console.warn(`No matching ${prefix} found for the given ID`);
            }
          } else {
            console.warn("Unsupported prefix in original_id:", prefix);
          }
        } catch (error) {
          console.error("שגיאה בטעינת מידע");
        } finally {
          setLoadingData(false);
        }
      };

      fetchDetails();
    }, [record]);

    if (loadingData)
      return (
        <div
          style={{
            // padding: "5px",
            paddingRight: "50px",
            height: "22px",
          }}
        >
          <SyncLoader color="gray" size={10} />
        </div>
      );

    if (record.readOnly && information) {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            borderRadius: "8px",
            color: "#666",
            paddingRight: "50px",
          }}
        >
          <div style={{ width: "33%", padding: "5px 10px" }}>
            <strong>שם:</strong> {information.first_name || "לא זמין"}{" "}
            {information.last_name || "לא זמין"}
          </div>
          <div style={{ width: "33%", padding: "5px 10px" }}>
            <strong>אימייל:</strong> {information.email || "לא זמין"}
          </div>
          <div style={{ width: "33%", padding: "5px 10px" }}>
            <strong>טלפון:</strong> {information.phone || "לא זמין"}
          </div>
          <div style={{ width: "33%", padding: "5px 10px" }}>
            <strong>תאריך:</strong>{" "}
            {information.date
              ? dayjs(information.date).format("DD/MM/YYYY")
              : "לא זמין"}
          </div>
          <div style={{ width: "33%", padding: "5px 10px" }}>
            <strong>מטרה:</strong>{" "}
            {information.purpose || information.eventType || "לא זמין"}
          </div>
          <div style={{ width: "33%", padding: "5px 10px" }}>
            <strong>סכום:</strong> {`${information.amount || 0} ₪`}
          </div>
        </div>
      );
    }

    return null;
  };

  const expandedRowRender = (record) => {
    return <ExpandedRow record={record} />;
  };

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

      <div
        style={{
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title
          level={4}
          style={{
            textAlign: "center",
            color: "#4a4a4a",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          הוצאות והכנסות מ-{startDate.format("DD-MM-YYYY")} עד{" "}
          {endDate.format("DD-MM-YYYY")}
        </Title>

        <Row justify="center" gutter={[16, 16]}>
          <Col span={8} style={{ textAlign: "center" }}>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#388e3c",
                }}
              >
                סה"כ הכנסות
              </Text>
              <Text
                style={{ display: "block", fontSize: "20px", color: "#388e3c" }}
              >
                {totalIncome}
              </Text>
            </div>
          </Col>
          <Col span={8} style={{ textAlign: "center" }}>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#ffebee",
                borderRadius: "8px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#d32f2f",
                }}
              >
                סה"כ הוצאות
              </Text>
              <Text
                style={{ display: "block", fontSize: "20px", color: "#d32f2f" }}
              >
                {totalExpense}
              </Text>
            </div>
          </Col>
          <Col span={8} style={{ textAlign: "center" }}>
            <div
              style={{
                padding: "10px",
                backgroundColor:
                  totalIncome - totalExpense >= 0 ? "#e8f5e9" : "#ffebee",
                borderRadius: "8px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color:
                    totalIncome - totalExpense >= 0 ? "#388e3c" : "#d32f2f",
                }}
              >
                יתרה
              </Text>
              <Text
                style={{
                  display: "block",
                  fontSize: "20px",
                  color:
                    totalIncome - totalExpense >= 0 ? "#388e3c" : "#d32f2f",
                }}
              >
                {Math.abs(totalIncome - totalExpense)}
              </Text>
            </div>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: "אין נתונים להצגה",
            filterConfirm: "אישור",
            filterReset: "איפוס",
          }}
          expandable={{
            expandedRowRender: expandedRowRender,
            rowExpandable: (record) => record.readOnly,
          }}
          pagination={false}
        />
      </div>

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
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="בחר תאריך"
              />
            </Form.Item>
            <Form.Item
              name="amount"
              label="סכום"
              rules={[
                { required: true, message: "הכנס סכום" },
                {
                  validator: (_, value) => {
                    if (value > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("הסכום חייב להיות מספר חיובי")
                    );
                  },
                },
              ]}
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
