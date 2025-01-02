import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Modal,
  Button,
  Typography,
  Select,
  message,
  Descriptions,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/he";
import API_URL from "../../config";

dayjs.locale("he");

const { Title } = Typography;
const { Option } = Select;

const DATE_FORMAT = "DD/MM/YYYY";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentYear = dayjs().year();

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/eventlist/events`);
      const eventsData = response.data;

      setEvents(eventsData);

      const urlMonth = searchParams.get("month");
      const urlYear = searchParams.get("year");
      const month = urlMonth ? parseInt(urlMonth) : dayjs().month() + 1;
      const year = urlYear ? parseInt(urlYear) : currentYear;

      setSearchParams({ month, year });
      filterEventsByDate(eventsData, month, year);
    } catch (error) {
      message.error("שגיאה בהבאת אירועים");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  const filterEventsByDate = (eventsList, month, year) => {
    const filtered = eventsList.filter(
      (event) =>
        dayjs(event.date).month() === month - 1 &&
        dayjs(event.date).year() === year
    );
    setFilteredEvents(filtered);
  };

  const handleDateChange = (month, year) => {
    setSearchParams({ month, year });
    filterEventsByDate(events, month, year);
  };

  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  const columns = [
    {
      title: "תאריך",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format(DATE_FORMAT),
    },
    {
      title: "סוג אירוע",
      dataIndex: "eventType",
      key: "eventType",
    },
    {
      title: "שעת התחלה",
      dataIndex: "startTime",
      key: "startTime",
    },
    {
      title: "שעת סיום",
      dataIndex: "endTime",
      key: "endTime",
    },
    {
      title: "מחיר כולל",
      dataIndex: "amount",
      key: "amount",
      render: (price) => `${price} ₪`,
    },
    {
      title: "פעולה",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => showEventDetails(record)}>
          פרטים
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", direction: "rtl" }}>
      <Title level={3}>רשימת אירועים</Title>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Select
          placeholder="בחר חודש"
          defaultValue={
            parseInt(searchParams.get("month")) || dayjs().month() + 1
          }
          onChange={(value) =>
            handleDateChange(
              value,
              parseInt(searchParams.get("year")) || currentYear
            )
          }
          style={{ width: "150px" }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i + 1} value={i + 1}>
              {dayjs().month(i).format("MMMM")}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="בחר שנה"
          defaultValue={parseInt(searchParams.get("year")) || currentYear}
          onChange={(value) =>
            handleDateChange(
              parseInt(searchParams.get("month")) || dayjs().month() + 1,
              value
            )
          }
          style={{ width: "100px" }}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const year = currentYear - 5 + i;
            return (
              <Option key={year} value={year}>
                {year}
              </Option>
            );
          })}
        </Select>
      </div>
      <Table
        dataSource={filteredEvents}
        columns={columns}
        rowKey="id"
        locale={{ emptyText: "אין נתונים להצגה" }}
      />
      {selectedEvent && (
        <Modal
          title={`פרטי אירוע - ${selectedEvent.eventType}`}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="שם מזמין">
              {selectedEvent.first_name || selectedEvent.last_name
                ? `${selectedEvent.first_name || ""} ${
                    selectedEvent.last_name || ""
                  }`
                : "לא זמין"}
            </Descriptions.Item>
            <Descriptions.Item label="טלפון">
              {selectedEvent.phone || "לא זמין"}
            </Descriptions.Item>
            <Descriptions.Item label="אימייל">
              {selectedEvent.email || "לא זמין"}
            </Descriptions.Item>
            <Descriptions.Item label="תאריך">
              {dayjs(selectedEvent.date).format(DATE_FORMAT)}
            </Descriptions.Item>
            <Descriptions.Item label="שעת התחלה">
              {selectedEvent.startTime}
            </Descriptions.Item>
            <Descriptions.Item label="שעת סיום">
              {selectedEvent.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="כמות ארוחות">
              {selectedEvent.mealCount}
            </Descriptions.Item>
            <Descriptions.Item label="מחיר כולל">
              {selectedEvent.amount} ₪
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </div>
  );
};

export default EventList;
