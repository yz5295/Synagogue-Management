import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  List,
  Card,
  Row,
  Col,
  Space,
  message as antdMessage,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import API_URL from "../../config";

const { Option } = Select;

const AddPrayerTimes = () => {
  const [prayerName, setPrayerName] = useState("");
  const [prayerTime, setPrayerTime] = useState(null);
  const [dayType, setDayType] = useState("weekday");
  const [prayerList, setPrayerList] = useState({ weekday: [], shabbat: [] });
  const [error, setError] = useState("");

  const fetchPrayerTimes = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/prayer-times`);
      setPrayerList(data);
      console.log(data);
    } catch (error) {
      antdMessage.error("שגיאה בטעינת רשימת התפילות");
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const addPrayer = async () => {
    if (!prayerName || !prayerTime) {
      antdMessage.warning("אנא מלא את כל הפרטים");
      return;
    }
    const newPrayer = {
      name: prayerName,
      time: prayerTime,
      dayType,
    };

    try {
      await axios.post(`${API_URL}/prayer-times`, newPrayer);
      fetchPrayerTimes();
      setPrayerName("");
      setPrayerTime(null);
      setDayType("weekday");
      antdMessage.success("התפילה נוספה בהצלחה");
    } catch (error) {
      antdMessage.error("שגיאה בהוספת התפילה");
    }
  };

  const removePrayer = async (name, dayType) => {
    try {
      await axios.delete(`${API_URL}/prayer-times/${name}?dayType=${dayType}`);
      fetchPrayerTimes();
      antdMessage.success("התפילה הוסרה בהצלחה");
    } catch (error) {
      antdMessage.error("שגיאה בהסרת התפילה");
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Card title="הוספת תפילה">
        <Row gutter={16}>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Input
              placeholder="שם התפילה"
              value={prayerName}
              onChange={(e) => setPrayerName(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Select
              value={dayType}
              onChange={setDayType}
              style={{ width: "100%" }}
            >
              <Option value="weekday">יום חול</Option>
              <Option value="shabbat">שבת</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Input
              value={prayerTime}
              onChange={(e) => {
                const value = e.target.value;
                const updatedValue =
                  value.length === 2 && !value.includes(":")
                    ? `${value}:`
                    : value;
                setPrayerTime(updatedValue);
                setError(
                  /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(updatedValue)
                    ? ""
                    : "יש להזין שעה תקינה"
                );
              }}
              placeholder="שעת תפילה"
              suffix={<ClockCircleOutlined />}
              style={{ width: 150 }}
              maxLength={5}
            />
            {error && (
              <div
                style={{
                  color: "red",
                  position: "absolute",
                  marginTop: "5px",
                }}
              >
                {error}
              </div>
            )}
          </Col>
        </Row>
        <Button
          type="primary"
          style={{ marginTop: "10px" }}
          onClick={addPrayer}
        >
          הוסף תפילה
        </Button>
      </Card>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Card title="תפילות יום חול">
            <List
              dataSource={prayerList.weekday}
              locale={{ emptyText: "אין נתונים להצגה" }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => removePrayer(item.name, "weekday")}
                    >
                      הסר
                    </Button>,
                  ]}
                >
                  {`${item.name} - ${item.time}`}
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Card title="תפילות שבת">
            <List
              dataSource={prayerList.shabbat}
              locale={{ emptyText: "אין נתונים להצגה" }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => removePrayer(item.name, "shabbat")}
                    >
                      הסר
                    </Button>,
                  ]}
                >
                  {`${item.name} - ${item.time}`}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default AddPrayerTimes;
