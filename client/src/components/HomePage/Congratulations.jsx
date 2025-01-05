import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import "../../style/Congratulations.css";
// import API_URL from "../../config";

const Congratulations = () => {
  const [congratulations, setCongratulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `https://synagogue-management-production.up.railway.app/congratulations`
      );
      setCongratulations(response.data);
    } catch (error) {
      message.error("שגיאה בטעינת הודעות");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  return (
    <div className="congratulations-container">
      {congratulations.length > 0 ? (
        congratulations.map((item) => (
          <div key={item.id} className="congratulation-item">
            {item.message}
          </div>
        ))
      ) : (
        <p className="no-messages">אין הודעות מזל טוב כרגע</p>
      )}
    </div>
  );
};

export default Congratulations;
