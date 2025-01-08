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
import "../../style/MemberPage.css";
import { useUser } from "../../contexts/UserContext";

const { Header, Sider, Content } = Layout;

function MemberPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentMenuKey, setCurrentMenuKey] = useState(null);
  const { user, loading } = useUser();

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

  useEffect(() => {
    if (loading || !user) {
      return;
    } else {
      setFullName(`${user.first_name} ${user.last_name}`);
    }
  }, [user, loading]);

  const menuItems = [
    {
      key: "donation-form",
      label: "תרומה לבית כנסת",
      icon: <DollarOutlined />,
      onClick: () => {
        navigate("donation-form");
        setCurrentMenuKey("donation-form");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "donations-list-user",
      label: "רשימת תרומות",
      icon: <GiftOutlined />,
      onClick: () => {
        navigate("donations-list-user");
        setCurrentMenuKey("donations-list-user");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "event-booking",
      label: "הזמנת אולם האירועים",
      icon: <AppstoreOutlined />,
      onClick: () => {
        navigate("event-booking");
        setCurrentMenuKey("event-booking");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "send-message",
      label: "שליחת הודעות לגבאי",
      icon: <InboxOutlined />,
      onClick: () => {
        navigate("send-message");
        setCurrentMenuKey("send-message");
        if (isMobile) setDrawerVisible(false);
      },
    },
    {
      key: "edit-member",
      label: "שינוי פרטים",
      icon: <EditOutlined />,
      onClick: () => {
        navigate("edit-member");
        setCurrentMenuKey("edit-member");
        if (isMobile) setDrawerVisible(false);
      },
    },
  ];

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const isBasePath = () => {
    return location.pathname === "/member" || location.pathname === "/member/";
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
                localStorage.removeItem("token");
                navigate("/");
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
          {isBasePath() ? (
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
              localStorage.removeItem("token");
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

export default MemberPage;
