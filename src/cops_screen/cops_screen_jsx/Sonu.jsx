import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InputSession = ({ type, email, setEmail, syntax_lines }) => {
  const FormInput = {
    width: "90%",
    padding: "10px 14px",
    border: "1px solid #d8b4fe",
    borderRadius: "8px",
    backgroundColor: "#f9f5ff",
    fontSize: "0.95rem",
    marginBottom: "1.2rem",
    transition: "0.2s",
    textAlign: "left",
  };

  return (
    <input
      type={type}
      placeholder={syntax_lines}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      style={FormInput}
    />
  );
};

const Sonu = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [buheadname, setBuHeadName] = useState("");
  const [ResponseMessage, setResponseMessage] = useState("");
  const [UserName, setUserName] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setBuHeadName("");
    setUserName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      let response;

      if (activeTab === "signup") {
        response = await axios.post(
          "https://biiling_portal.mfilterit.net/create-user",
          {
            email_id: email,
            bu_name: buheadname,
            password: password,
            permission: "User",
          }
        );
        
        const msg = response.data.message || "Account created successfully!";
        toast.success(typeof msg === "string" ? msg : "Account created successfully!");
        setResponseMessage("Account created successfully!");
        setActiveTab("signin");
        resetForm();
        return;
        
      } else {
        // LOGIN REQUEST
        response = await axios.post(
          "https://biiling_portal.mfilterit.net/login",
          {
            username: UserName,
            password: password,
          }
        );
      }

      const data = response.data;
      console.log("✅ API Response:", data);

      // ------------------ LOGIN HANDLING ------------------
      if (activeTab === "signin") {
        const msg = data.message;
        let parsedUser = null;
        let finalMessage = "";

        // Backend sends object directly
        if (typeof msg === "object" && msg !== null && msg.username) {
          parsedUser = {
            username: msg.username,
            department: msg.department
          };
          finalMessage = `Welcome ${parsedUser.username}`;
        } 
        // Fallback for string responses
        else if (typeof msg === "string") {
          const lowerMsg = msg.toLowerCase();
          
          // Check for error messages
          if (
            lowerMsg.includes("not exist") ||
            lowerMsg.includes("incorrect") ||
            lowerMsg.includes("wrong") ||
            lowerMsg.includes("failed") ||
            lowerMsg.includes("invalid")
          ) {
            toast.error(msg);
            setResponseMessage(msg);
            return;
          }
          
          finalMessage = msg;
        }

        // Validate parsed user
        if (!parsedUser || !parsedUser.username) {
          toast.error("Login failed - invalid response from server");
          return;
        }

        // Success!
        toast.success(finalMessage);
        setResponseMessage(finalMessage);

        // Save to localStorage
        try {
          localStorage.setItem("loggedUser", JSON.stringify(parsedUser));
          console.log("✅ User data saved:", parsedUser);
        } catch (e) {
          console.warn("⚠️ localStorage not available:", e);
        }

        // 🎯 Call onLoginSuccess to update MainBar state
        if (onLoginSuccess) {
          onLoginSuccess(parsedUser);
        }

        resetForm();
      }

    } catch (error) {
      console.error("❌ API Error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to process request!";
      toast.error(errMsg);
      setResponseMessage(errMsg);
    }
  };

  // Styles (same as before)
  const SonuHeading = {
    fontFamily: "'Poppins', sans-serif",
    color: "#8B00FF",
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginTop: "0",
    textAlign: "center",
  };
  const SonuSubHeading = {
    fontFamily: "'Poppins', sans-serif",
    color: "#8B00FF",
    fontSize: "1rem",
    fontWeight: 500,
    marginTop: "0.3rem",
    letterSpacing: "0.5px",
    textAlign: "center",
  };
  const SonuTabContainer = {
    display: "flex",
    border: "1px solid #f3ccff",
    borderRadius: "8px",
    backgroundColor: "#fdeaff",
    marginBottom: "1.5rem",
    overflow: "hidden",
    width: "97%",
    justifyContent: "center"
  };
  const TabButton = {
    border: "none",
    background: "transparent",
    color: "#5f1ab2",
    fontWeight: 500,
    width: "50%",
    padding: "10px",
    cursor: "pointer",
    transition: "0.2s"
  };

  const TabButtonActive = {
    backgroundColor: "#ffffff",
    color: "#000000",
    fontWeight: 600,
    boxShadow: "0 0 3px rgba(155, 50, 255, 0.3)",
    width: "50%",
    padding: "10px",
    cursor: "pointer",
    border: "none"
  };

  const formButtonStyle = {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(to right, #7e22ce, #a21caf)",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
    width: "96%",
  };
  const formLabelStyle = {
    width: "100%",
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#333",
    marginBottom: 5,
    textAlign: "left",
    flex: 1,
    whiteSpace: "nowrap",
  };
  const logo = {
    width: "150px",
    height: "auto",
    display: "block",
    margin: "0 auto 0px",
  };
  const logoContainer = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
  };
  const logform = {
    margin: "auto",
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "40%",
    minWidth: "320px",
    border: "1px solid #cae8ebff",
  };

  return (
    <div style={logform}>
      <div style={logoContainer}>
        <img
          src="https://www.mfilterit.com/wp-content/uploads/2024/05/Final-Logo-png-1-1536x235.png"
          alt="mFilterit"
          style={logo}
        />
      </div>

      <h2 style={SonuHeading}>Billing Portal</h2>
      <p style={SonuSubHeading}>Access your dashboard</p>

      <div style={SonuTabContainer}>
        <button
          style={activeTab === "signin" ? TabButtonActive : TabButton}
          onClick={() => {
            setActiveTab("signin");
            resetForm();
          }}
        >
          Sign In
        </button>

        <button
          style={activeTab === "signup" ? TabButtonActive : TabButton}
          onClick={() => {
            setActiveTab("signup");
            resetForm();
          }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "signin" ? (
          <>
            <label style={formLabelStyle}>Mail Id</label>
            <InputSession
              type="email"
              email={UserName}
              setEmail={setUserName}
              syntax_lines="Enter your mail id..."
            />
          </>
        ) : (
          <>
            <label style={formLabelStyle}>Email</label>
            <InputSession
              type="email"
              email={email}
              setEmail={setEmail}
              syntax_lines="Enter your email"
            />
          </>
        )}

        <label style={formLabelStyle}>Password</label>
        <InputSession
          type="password"
          email={password}
          setEmail={setPassword}
          syntax_lines="Enter your password"
        />

        {activeTab === "signup" && (
          <>
            <label style={formLabelStyle}>Confirm Password</label>
            <InputSession
              type="password"
              email={confirmPassword}
              setEmail={setConfirmPassword}
              syntax_lines="Confirm your password"
            />

            <label style={formLabelStyle}>BU Head</label>
            <InputSession
              type="text"
              email={buheadname}
              setEmail={setBuHeadName}
              syntax_lines="Enter Your BU Name"
            />
          </>
        )}

        <button type="submit" style={formButtonStyle}>
          {activeTab === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Sonu;