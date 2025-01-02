import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  DollarOutlined,
  InboxOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  GiftOutlined,
  MenuOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../style/MemberPage.css";
import API_URL from "../../config";

const { Header, Sider, Content } = Layout;

function MemberPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("שגיאה בשליפת פרטי משתמש:", error);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    fetchUser();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(`${user.first_name} ${user.last_name}`);
    }
  }, [user]);

  const menuItems = [
    {
      key: "donate",
      label: "תרומה לבית כנסת",
      icon: <DollarOutlined />,
      onClick: () => {
        navigate("donation-form");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "donations-list-user",
      label: "רשימת תרומות",
      icon: <GiftOutlined />,
      onClick: () => {
        navigate("donations-list-user");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "hallBooking",
      label: "הזמנת אולם האירועים",
      icon: <AppstoreOutlined />,
      onClick: () => {
        navigate("event-booking");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "sendMessage",
      label: "שליחת הודעות לגבאי",
      icon: <InboxOutlined />,
      onClick: () => {
        navigate("send-message");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "editMember",
      label: "שינוי פרטים",
      icon: <EditOutlined />,
      onClick: () => {
        navigate("edit-member");
        if (isMobile) setDrawerVisible(false);
      },
    },
  ];

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          theme="dark"
          style={{ textAlign: "right" }}
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            theme="dark"
            mode="inline"
            style={{ height: "100%", paddingTop: "20%" }}
          >
            {menuItems.map((item) => (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            ))}
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined style={{ color: "red" }} />}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
              style={{
                position: "fixed",
                bottom: 0,
                width: "auto",
                zIndex: 1000,
              }}
            >
              <span style={{ color: "red" }}>יציאה</span>
            </Menu.Item>
          </Menu>
        </Sider>
      )}

      <Layout>
        <Header
          style={{
            padding: 0,
            textAlign: "right",
            paddingRight: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isMobile ? "#00152a" : "#fff",
            color: isMobile ? "#fff" : "#00152a",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? "18px" : "24px",
              textAlign: isMobile ? "center" : "right",
              marginRight: isMobile ? "-10px" : "10px",
              display: "block",
              width: "100%",
              direction: "rtl",
              paddingLeft: isMobile ? "0" : "10px",
              textAlignLast: isMobile ? "center" : "right",
            }}
          >
            שלום {fullName}
          </h2>

          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleDrawer}
              style={{
                fontSize: "24px",
                position: "absolute",
                right: 20,
                top: 17,
                color: "#fff",
              }}
            />
          )}
        </Header>
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "auto",
            height: "calc(100vh - 80px)",
            textAlign: "right",
          }}
        >
          {location.pathname === "/member" ||
          location.pathname === "/member/" ? (
            <div
              style={{
                fontSize: "18px",
                color: "#555",
                textAlign: "right",
                display: "block",
              }}
            >
              אנא בחר פעולה מהתפריט
            </div>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>

      <Drawer
        // title={`שלום ${fullName}`}
        placement="right"
        onClose={toggleDrawer}
        visible={drawerVisible}
        // bodyStyle={{ padding: 0 }}
        width={210}
        headerStyle={{ backgroundColor: "#00152a" }}
        bodyStyle={{ padding: 0 }}
        style={{ direction: "rtl" }}
        closeIcon={
          <span
            style={{ color: "#fff", fontSize: "24px", fontWeight: "lighter" }}
          >
            ×
          </span>
        }
      >
        <Menu theme="dark" mode="inline" style={{ height: "100%" }}>
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined style={{ color: "red" }} />}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
              setDrawerVisible(false);
            }}
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              zIndex: 1000,
            }}
          >
            <span style={{ color: "red" }}>יציאה</span>
          </Menu.Item>
        </Menu>
      </Drawer>
    </Layout>
  );
}

export default MemberPage;
