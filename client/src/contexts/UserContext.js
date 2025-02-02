import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import API_URL from "../config";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [getToken, setGetToken] = useState(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token")) || getToken;

    const fetchData = async () => {
      try {
        if (!token) {
          return;
        }

        const userResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data.user);

        const settingsResponse = await fetch(`${API_URL}/settings`);
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      } catch (error) {
        console.error("שגיאה בשליפת נתונים:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setLoading(true);
    }
  }, [getToken]);

  return (
    <UserContext.Provider
      value={{ user, setUser, setGetToken, settings, setSettings, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
