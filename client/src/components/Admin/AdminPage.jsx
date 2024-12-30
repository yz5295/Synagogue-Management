import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer, Typography } from "antd";
import {
  ClockCircleOutlined,
  BulbOutlined,
  MessageOutlined,
  UserOutlined,
  DollarOutlined,
  InboxOutlined,
  LogoutOutlined,
  SmileOutlined,
  SettingOutlined,
  CalendarOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [synagogueName, setSynagogueName] = useState("ממשק גבאי");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSynagogueName = () => {
      const settings = JSON.parse(localStorage.getItem("settings"));
      if (settings?.synagogueName) {
        setSynagogueName(`בית הכנסת ${settings.synagogueName}`);
        document.title = `בית הכנסת ${settings.synagogueName}`;
      }
    };

    fetch("/settings")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("settings", JSON.stringify(data));
        window.dispatchEvent(new Event("settingsUpdated"));
      })
      .catch((error) => {
        console.error("שגיאה בטעינת הגדרות");
      });

    const handleSettingsUpdate = () => {
      updateSynagogueName();
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdate);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const menuItems = [
    {
      key: "prayer-times",
      label: "בחירת זמני תפילה",
      icon: <ClockCircleOutlined />,
      onClick: () => {
        navigate("prayer-times");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "add-messages",
      label: "הוספת הודעות למתפללים",
      icon: <MessageOutlined />,
      onClick: () => {
        navigate("add-messages");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "add-congratulations",
      label: "הוספת מזל טובים",
      icon: <SmileOutlined />,
      onClick: () => {
        navigate("add-congratulations");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "member-list",
      label: "רשימת המתפללים",
      icon: <UserOutlined />,
      onClick: () => {
        navigate("member-list");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "donation-list",
      label: "רשימת התרומות",
      icon: <DollarOutlined />,
      onClick: () => {
        navigate("donation-list");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "event-list",
      label: "רשימת הזמנת אירועים",
      icon: <CalendarOutlined />,
      onClick: () => {
        navigate("event-list");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "finance-manager",
      label: "ניהול הכנסות והוצאות",
      icon: <BulbOutlined />,
      onClick: () => {
        navigate("finance-manager");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "inbox",
      label: "תיבת הודעות מהמתפללים",
      icon: <InboxOutlined />,
      onClick: () => {
        navigate("inbox");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "settings",
      label: "הגדרות ניהול",
      icon: <SettingOutlined />,
      onClick: () => {
        navigate("settings");
        if (isMobile) setDrawerVisible(false);
      },
    },
  ];

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const isBasePath = () => {
    return location.pathname === "/admin" || location.pathname === "/admin/";
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
          onCollapse={(collapsed) => setCollapsed(collapsed)}
          collapsed={collapsed}
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
                localStorage.removeItem("settings");
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
            {synagogueName}
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
          }}
        >
          {isBasePath() ? (
            <div
              style={{
                height: "100%",
                fontSize: "18px",
                color: "#555",
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
        placement="right"
        onClose={toggleDrawer}
        visible={drawerVisible}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ backgroundColor: "#00152a" }}
        width={240}
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
              localStorage.removeItem("settings");
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

export default AdminPage;
