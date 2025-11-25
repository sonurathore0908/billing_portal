import { useRef,useState, useEffect } from "react";
import Cops_sreen from "./Cops_sreen";
import BuScreen from "./BuScreen";
import SalesScreen from "./Sales_screen";


const Topbar = ({ userData, onLogout }) => {
  const validDepartments = ["cops", "customer ops", "bu", "bu head", "sales", "finance", "all"];
  const [selectedDashboard, setSelectedDashboard] = useState("Customer Ops");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  // ⭐ Auto-select dashboard based on user department
  useEffect(() => {
    if (!userData || !userData.department) return;

    const dept = userData.department.toLowerCase();
    // const hasValidDept = validKeywords.some(key => dept.includes(key));

    if (dept !== "all") {
      // Department user → direct dashboard load
      if (dept.includes("cops") || dept.includes("customer ops")) {
        setSelectedDashboard("Customer Ops");
      } else if (dept.includes("bu")) {
        setSelectedDashboard("BU Head");
      } else if (dept.includes("sales")) {
        setSelectedDashboard("Sales");
      } else if (dept.includes("finance")) {
        setSelectedDashboard("Finance");
      }
    }
  }, [userData]);

  // ⭐ Dashboard loader (ALL department me dropdown chalega)
  const renderComponent = () => {
    const dept = userData?.department?.toLowerCase() || "";

    // ⭐ VALID KEYWORDS
    const validKeywords = ["cops", "sales", "finance", "bu", "all"];

    // ❌ If user department does not contain any valid department keyword
    const hasValidDept = validKeywords.some(key => dept.includes(key));

    if (!hasValidDept) {
      return (
        <div style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "600",
          color: "#8b0000"
        }}>
          🚫 You are not eligible for this Billing Portal.
        </div>
      );
    }

    //  If “ALL”
    if (dept.includes("all")) {
      switch (selectedDashboard) {
        case "Customer Ops":
          return <Cops_sreen userData={userData} />;
        case "BU Head":
          return <BuScreen userData={userData} />;
        case "Sales":
          return <SalesScreen userData={userData} />;
        case "Finance":
          return <div>Finance Dashboard Coming Soon</div>;
        default:
          return <Cops_sreen userData={userData} />;
      }
    }

    // COPS
    if (dept.includes("cops")) {
      return <Cops_sreen userData={userData} />;
    }

    // BU
    if (dept.includes("bu")) {
      return <BuScreen userData={userData} />;
    }

    // Sales
    if (dept.includes("sales")) {
      return <SalesScreen userData={userData} />;
    }

    // Finance
    if (dept.includes("finance")) {
      return <div>Finance Dashboard Coming Soon</div>;
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false); // outside click → close menu
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Styles
  const dropdownFont = {
    fontFamily: "'Poppins', 'Inter', sans-serif",
    fontSize: "14.5px",
    fontWeight: 500,
    color: "#3B0A45",
    padding: "10px 14px",
    letterSpacing: "0.3px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderRadius: "6px",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "55px",
    left: "5%",
    background: "rgba(247, 194, 242, 0.85)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(51, 3, 41, 0.4)",
    borderRadius: "12px",
    width: "220px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    padding: "10px 10px",
    zIndex: 100,
    transition: "all 0.25s ease-in-out",
  };

  const topbarStyle = {
    width: "100%",
    height: "50px",
    backgroundColor: "#ffffff",
    borderBottom: "3px solid #e879f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
    boxSizing: "border-box",
  };

  const logoutBtnStyle = {
    backgroundColor: "#a21caf",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  const userInfoStyle = {
    fontSize: "14px",
    color: "#666",
    marginRight: "20px",
    fontWeight: 500,
  };

  return (
    <div>
      <div className="topbar" style={topbarStyle}>
        <div className="left-section" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/single_logo.png"
            alt="logo"
            onClick={() => setShowMenu(!showMenu)}
            style={{ height: "35px", cursor: "pointer" }}
          />
          
          {/* ⭐ Dropdown sirf ALL department ke liye */}
          {showMenu && userData?.department?.toLowerCase() === "all" && (
            <div ref={menuRef} style={dropdownStyle}>
              <div
                className="dropdown-item"
                onClick={() => {
                  setSelectedDashboard("Customer Ops");
                  setShowMenu(false);
                }}
                style={dropdownFont}
              >
                Customer Ops Dashboard
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setSelectedDashboard("BU Head");
                  setShowMenu(false);
                }}
                style={dropdownFont}
              >
                BU Head Dashboard
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setSelectedDashboard("Sales");
                  setShowMenu(false);
                }}
                style={dropdownFont}
              >
                Sales Dashboard
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setSelectedDashboard("Finance");
                  setShowMenu(false);
                }}
                style={dropdownFont}
              >
                Finance Dashboard
              </div>
            </div>
          )}

          <h2 style={{ marginLeft: "20px" }}>{selectedDashboard} Dashboard</h2>
        </div>

        <div className="right-section" style={{ display: "flex", alignItems: "center" }}>
          {userData && (
            <span style={userInfoStyle}>
              👤 {userData.username} | {userData.department}
            </span>
          )}
          <button
            style={logoutBtnStyle}
            onClick={handleLogout}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#86198f")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#a21caf")}
          >
            Logout
          </button>
        </div>
      </div>

      {renderComponent()}
    </div>
  );
};

export default Topbar;
