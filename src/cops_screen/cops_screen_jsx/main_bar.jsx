import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import Sonu from "./Sonu";

const MainBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("loggedUser");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserData(user);
        setIsLoggedIn(true);
        console.log("✅ User restored:", user);
      }
    } catch (e) {
      console.warn("⚠️ Could not restore session:", e);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    console.log("✅ Login success:", user);
    setUserData(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("loggedUser");
    } catch (e) {
      console.warn("⚠️ Could not clear localStorage:", e);
    }
    setUserData(null);
    setIsLoggedIn(false);
  };

  const copsScreenStyle = {
    backgroundColor: "#f5e7efff",
    minHeight: "100vh"
  };

  return (
    <div className="cops_screen" style={copsScreenStyle}>
      {!isLoggedIn ? (
        <Sonu onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Topbar userData={userData} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default MainBar;