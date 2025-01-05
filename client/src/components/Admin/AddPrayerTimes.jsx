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
  Modal,
  message as antdMessage,
} from "antd";
import {
  ClockCircleOutlined,
  UpOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import API_URL from "../../config";

const { Option } = Select;

const AddPrayerTimes = () => {
  const [prayerName, setPrayerName] = useState("");
  const [prayerTime, setPrayerTime] = useState("");
  const [dayType, setDayType] = useState("weekday");
  const [prayerList, setPrayerList] = useState({ weekday: [], shabbat: [] });
  const [loading, setLoading] = useState(true);
  const [addTimeError, setAddTimeError] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editPrayer, setEditPrayer] = useState({
    id: null,
    name: "",
    time: "",
  });
  const [editTimeError, setEditTimeError] = useState("");

  const handleTimeInput = (value, oldValue, setter, errorSetter) => {
    if (value === "") {
      setter("");
      errorSetter("");
      return;
    }

    if (
      value.length === 2 &&
      !value.includes(":") &&
      value.length > (oldValue || "").length
    ) {
      value = `${value}:`;
    }
    if (value.length === 2 && (oldValue || "").length > value.length) {
      value = value.slice(0, value.length - 1);
    }

    setter(value);
    errorSetter(
      /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? "" : "יש להזין שעה תקינה"
    );
  };

  const fetchPrayerTimes = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/prayer-times`);
      setPrayerList(data);
    } catch (error) {
      antdMessage.error("שגיאה בטעינת רשימת התפילות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const addPrayer = async () => {
    if (!prayerName || !prayerTime || addTimeError) {
      antdMessage.warning("אנא מלא את כל הפרטים (או תקן את השעה)");
      return;
    }
    const newPrayer = {
      name: prayerName,
      time: prayerTime,
      dayType,
    };

    try {
      await axios.post(`${API_URL}/prayer-times`, newPrayer);
      antdMessage.success("התפילה נוספה בהצלחה");
      fetchPrayerTimes();
      setPrayerName("");
      setPrayerTime("");
      setDayType("weekday");
      setAddTimeError("");
    } catch (error) {
      antdMessage.error("שגיאה בהוספת התפילה");
    }
  };

  const removePrayer = async (name, dayType) => {
    try {
      await axios.delete(`${API_URL}/prayer-times/${name}?dayType=${dayType}`);
      antdMessage.success("התפילה הוסרה בהצלחה");
      fetchPrayerTimes();
    } catch (error) {
      antdMessage.error("שגיאה בהסרת התפילה");
    }
  };

  const updatePrayerTimesOrder = async (updatedList, dayType) => {
    try {
      await axios.put(`${API_URL}/prayer-times/order?dayType=${dayType}`, {
        prayers: updatedList,
      });
      antdMessage.success("סדר התפילות עודכן בהצלחה");
    } catch (err) {
      antdMessage.error("שגיאה בעדכון סדר התפילות");
    }
  };

  const movePrayer = (dayType, index, direction) => {
    const listCopy = [...prayerList[dayType]];

    if (direction === "up" && index > 0) {
      const temp = listCopy[index];
      listCopy[index] = listCopy[index - 1];
      listCopy[index - 1] = temp;
    } else if (direction === "down" && index < listCopy.length - 1) {
      const temp = listCopy[index];
      listCopy[index] = listCopy[index + 1];
      listCopy[index + 1] = temp;
    } else {
      return;
    }

    const updatedPrayerList = {
      ...prayerList,
      [dayType]: listCopy,
    };
    setPrayerList(updatedPrayerList);
    updatePrayerTimesOrder(listCopy, dayType);
  };

  const onEditClick = (item) => {
    setEditPrayer({ id: item.id, name: item.name, time: item.time });
    setEditTimeError("");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editPrayer.name || !editPrayer.time || editTimeError) {
      antdMessage.warning("אנא מלא את כל הפרטים (או תקן את השעה)");
      return;
    }

    try {
      await axios.put(`${API_URL}/prayer-times/${editPrayer.id}`, {
        name: editPrayer.name,
        time: editPrayer.time,
      });

      antdMessage.success("התפילה עודכנה בהצלחה");
      setEditModalVisible(false);
      fetchPrayerTimes();
    } catch (error) {
      antdMessage.error("שגיאה בעדכון התפילה");
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
              onChange={(e) =>
                handleTimeInput(
                  e.target.value,
                  prayerTime,
                  setPrayerTime,
                  setAddTimeError
                )
              }
              placeholder="שעת תפילה"
              suffix={<ClockCircleOutlined />}
              style={{ width: 150 }}
              maxLength={5}
            />
            {addTimeError && (
              <div style={{ color: "red", marginTop: "5px" }}>
                {addTimeError}
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
              loading={loading}
              locale={{ emptyText: "אין נתונים להצגה" }}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      key="up"
                      type="link"
                      icon={<UpOutlined />}
                      disabled={index === 0}
                      onClick={() => movePrayer("weekday", index, "up")}
                    />,
                    <Button
                      key="down"
                      type="link"
                      icon={<DownOutlined />}
                      disabled={index === prayerList.weekday.length - 1}
                      onClick={() => movePrayer("weekday", index, "down")}
                    />,
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => onEditClick(item)}
                    />,
                    <Button
                      key="remove"
                      type="link"
                      icon={<DeleteOutlined style={{ color: "red" }} />}
                      onClick={() => removePrayer(item.name, "weekday")}
                    />,
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
              loading={loading}
              locale={{ emptyText: "אין נתונים להצגה" }}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      key="up"
                      type="link"
                      icon={<UpOutlined />}
                      disabled={index === 0}
                      onClick={() => movePrayer("shabbat", index, "up")}
                    />,
                    <Button
                      key="down"
                      type="link"
                      icon={<DownOutlined />}
                      disabled={index === prayerList.shabbat.length - 1}
                      onClick={() => movePrayer("shabbat", index, "down")}
                    />,
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => onEditClick(item)}
                    />,
                    <Button
                      key="remove"
                      type="link"
                      icon={<DeleteOutlined style={{ color: "red" }} />}
                      onClick={() => removePrayer(item.name, "shabbat")}
                    />,
                  ]}
                >
                  {`${item.name} - ${item.time}`}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="עריכת תפילה"
        visible={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="שמור"
        cancelText="ביטול"
      >
        <div style={{ marginBottom: 10 }}>
          <label>שם התפילה:</label>
          <Input
            value={editPrayer.name}
            onChange={(e) =>
              setEditPrayer({ ...editPrayer, name: e.target.value })
            }
          />
        </div>
        <div>
          <label>שעת תפילה:</label>
          <Input
            value={editPrayer.time}
            onChange={(e) =>
              handleTimeInput(
                e.target.value,
                editPrayer.time,
                (newVal) => setEditPrayer({ ...editPrayer, time: newVal }),
                setEditTimeError
              )
            }
            maxLength={5}
            suffix={<ClockCircleOutlined />}
          />
        </div>
        {editTimeError && (
          <div style={{ color: "red", marginTop: "5px" }}>{editTimeError}</div>
        )}
      </Modal>
    </Space>
  );
};

export default AddPrayerTimes;
