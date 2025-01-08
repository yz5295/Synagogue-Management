import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
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
import { useSettings } from "../../contexts/SettingsContext";

const { Header, Sider, Content } = Layout;

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [synagogueName, setSynagogueName] = useState("ממשק גבאי");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentMenuKey, setCurrentMenuKey] = useState(null);

  const { settings, loading } = useSettings();

  useEffect(() => {
    if (loading || !settings) {
      return;
    }
    setSynagogueName(`בית הכנסת ${settings.synagogueName}`);
    document.title = `בית הכנסת ${settings.synagogueName}`;
  }, [settings, loading]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
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
        setCurrentMenuKey("prayer-times");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "add-messages",
      label: "הוספת הודעות למתפללים",
      icon: <MessageOutlined />,
      onClick: () => {
        navigate("add-messages");
        setCurrentMenuKey("add-messages");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "add-congratulations",
      label: "הוספת מזל טובים",
      icon: <SmileOutlined />,
      onClick: () => {
        navigate("add-congratulations");
        setCurrentMenuKey("add-congratulations");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "member-list",
      label: "רשימת המתפללים",
      icon: <UserOutlined />,
      onClick: () => {
        navigate("member-list");
        setCurrentMenuKey("member-list");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "donation-list",
      label: "רשימת התרומות",
      icon: <DollarOutlined />,
      onClick: () => {
        navigate("donation-list");
        setCurrentMenuKey("donation-list");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "event-list",
      label: "רשימת הזמנת אירועים",
      icon: <CalendarOutlined />,
      onClick: () => {
        navigate("event-list");
        setCurrentMenuKey("event-list");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "finance-manager",
      label: "ניהול הכנסות והוצאות",
      icon: <BulbOutlined />,
      onClick: () => {
        navigate("finance-manager");
        setCurrentMenuKey("finance-manager");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "inbox",
      label: "תיבת הודעות מהמתפללים",
      icon: <InboxOutlined />,
      onClick: () => {
        navigate("inbox");
        setCurrentMenuKey("inbox");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "settings",
      label: "הגדרות ניהול",
      icon: <SettingOutlined />,
      onClick: () => {
        navigate("settings");
        setCurrentMenuKey("settings");
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
            selectedKeys={isBasePath() ? [] : [currentMenuKey]}
          >
            {menuItems.map((item) => (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            ))}
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined style={{ color: "#ff4d4f" }} />}
              onClick={() => {
                navigate("/");
                setDrawerVisible(false);
              }}
              style={{
                position: "fixed",
                bottom: "10px",
                right: "5px",
                width: "auto",
                zIndex: 1000,
                padding: "15px",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontWeight: "600",
                  color: "#ff4d4f",
                  letterSpacing: "1px",
                }}
              >
                יציאה
              </span>
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
        <Menu
          theme="dark"
          mode="inline"
          style={{ height: "100%" }}
          selectedKeys={isBasePath() ? [] : [currentMenuKey]}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => {
              navigate("/");
              setDrawerVisible(false);
            }}
            style={{
              position: "fixed",
              bottom: "10px",
              right: "5px",
              width: "auto",
              zIndex: 1000,
              padding: "15px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontWeight: "600",
                color: "#ff4d4f",
                letterSpacing: "1px",
              }}
            >
              יציאה
            </span>
          </Menu.Item>
        </Menu>
      </Drawer>
    </Layout>
  );
}

export default AdminPage;
