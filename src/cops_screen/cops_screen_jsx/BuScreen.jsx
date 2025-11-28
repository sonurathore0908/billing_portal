import { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Pencil, Trash2,Check, Undo2} from "lucide-react";

// ========== DATA TABLE COMPONENT ==========
const DataShow = ({ onEdit, onSubmit, onRevoke, username, startDate, endDate }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "billing_id", 
    "billing_status", 
    "country", 
    "product_type",
    "customer_ops_user",
    "package_name"
  ]);
  const filterRef = useRef(null);

  // const columns = [
  //   { key: "billing_id", label: "Billing ID" },
  //   { key: "billing_status", label: "Billing Status" },
  //   { key: "country", label: "Country" },
  //   { key: "product_type", label: "Product Type" },
  //   { key: "customer_ops_user", label: "Customer OPS User" },
  //   { key: "bu_head_name", label: "BU Head Name" },
  //   { key: "sales_person", label: "Sales Person" },
  //   { key: "package_name", label: "Package Name" },
  //   { key: "client_package_status", label: "Client Package Status" },
  //   { key: "payout_model", label: "Payout Model" },
  //   { key: "billing_numbers", label: "Billing Numbers" },
  //   { key: "date_created", label: "Date Created" },
  //   { key: "last_updated_date", label: "Last Updated Date" },
  //   { key: "affiliate_lead", label: "Affiliate Lead" },
  //   { key: "nonaffiliatenumber", label: "Non Affiliate Number" },
  //   { key: "number", label: "Number" },
  //   { key: "bu_email", label: "BU Email" },
  //   { key: "user_email", label: "User Email" },
  //   { key: "start_billing_date", label: "Start Billing Date" },
  //   { key: "end_billing_date", label: "End Billing Date" },
  // ];
  const columns = [
    { key: "id", label: "ID" },
    { key: "billing_id", label: "Billing ID" },
    { key: "crm_number", label: "CRM Number" },
    { key: "country", label: "Country" },
    { key: "product_type", label: "Product Type" },
    { key: "package_name", label: "Package Name" },
    { key: "client_package_status", label: "Client Package Status" },
    { key: "payout_model", label: "Payout Model" },
    { key: "billing_numbers", label: "Billing Numbers" },
    { key: "billing_status", label: "Billing Status" },
    { key: "affiliate_lead", label: "Affiliate Lead" },
    { key: "media_spend_percent", label: "Media Spend %" },
    { key: "media_spend_number", label: "Media Spend Number" },
    { key: "nonaffiliatenumber", label: "Non Affiliate Number" },
    { key: "number", label: "Number" },
    { key: "username", label: "Username" },
    { key: "platform_fee", label: "Platform Fee" },
    { key: "slab_1", label: "Slab 1" },
    { key: "slab_2", label: "Slab 2" },
    { key: "slab_3", label: "Slab 3" },
    { key: "setup_fee_onetime", label: "Setup Fee (One-time)" },
    { key: "monthly_recurring_cost", label: "Monthly Recurring Cost" },
    { key: "monthly_subscription_fee", label: "Monthly Subscription Fee" },
    { key: "additional_platform_marketplace_fee", label: "Additional Platform/Marketplace Fee" },
    { key: "additional_user_login_per_month", label: "Additional User Login/Month" },
    { key: "count_from_last_screen", label: "Count From Last Screen" },
    { key: "submission_date", label: "Submission Date" },
    { key: "date_created", label: "Date Created" },
    { key: "start_billing_date", label: "Start Billing Date" },
    { key: "end_billing_date", label: "End Billing Date" },
    { key: "last_updated_date", label: "Last Updated Date" },
    { key: "customer_ops_user", label: "Customer OPS User" },
    { key: "user_email", label: "User Email" },
    { key: "bu_head_name", label: "BU Head Name" },
    { key: "bu_email", label: "BU Email" },
    { key: "sales_person", label: "Sales Person" },
    { key: "sales_mail_id", label: "Sales Mail ID" }
  ];


  // ✅ DELETE HANDLER
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const response = await fetch("https://biiling_portal.mfilterit.net/delete_billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing_id: id }),
      });

      const result = await response.json();
      console.log("Delete API Response:", result);

      if (result.status === "success" || result.message.includes("success")) {
        alert("✅ Record deleted successfully!");
        setRecords((prev) => prev.filter((record) => record.billing_id !== id));
      } else {
        alert("⚠️ " + (result.message || "Failed to delete"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Error deleting record!");
    }
  };

  // ✅ EDIT HANDLER
  const handleEdit = (item) => {
    console.log("🔵 Edit button clicked");
    if (onEdit) {
      onEdit(item);
    }
  };

  // ✅ SUBMIT HANDLER - BU FORM OPEN KAREGA
  const handleSubmit = (item) => {
    console.log("🟢 handleSubmit called!");
    console.log("🟢 Item:", item);
    console.log("🟢 onSubmit function:", onSubmit);
    
    if (onSubmit) {
      console.log("✅ Calling onSubmit");
      onSubmit(item);
    } else {
      console.log("❌ onSubmit is undefined!");
    }
  };

  // ✅ TOGGLE COLUMN
  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  // ✅ CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(
            "https://biiling_portal.mfilterit.net/fetch-bu-details",
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          const result = await response.json();
          console.log("API Response:", result);

          // ⭐ FIX: Correct data extraction
          setRecords(result.data || []);

          setLoading(false);
        } catch (err) {
          console.error("API error:", err);
          setRecords([]);
          setLoading(false);
        }
      };

      if (username) {
        fetchData();
      }
  }, [username, startDate, endDate]);

  // ✅ SORTING
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ FILTER BY DATE
  // const filterRecordsByDate = (records) => {
  //   if (!startDate || !endDate) return records;

  //   return records.filter((record) => {
  //     if (!record.date_created) return true;

  //     const recordDate = new Date(record.date_created);
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);

  //     start.setHours(0, 0, 0, 0);
  //     end.setHours(23, 59, 59, 999);

  //     return recordDate >= start && recordDate <= end;
  //   });
  // };
  // ✅ Safe filterRecordsByDate
  const filterRecordsByDate = (records_0) => {
    // Handle null, undefined, object, or array
    let dataArray = [];
    
    if (Array.isArray(records_0)) {
      dataArray = records_0;
    } else if (records_0 && records_0.data && Array.isArray(records_0.data)) {
      dataArray = records_0.data;
    }
    
    if (!startDate || !endDate) return dataArray;

    return dataArray.filter((record) => {
      if (!record || !record.date_created) return true;

      const recordDate = new Date(record.date_created);
      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return recordDate >= start && recordDate <= end;
    });
  };


  const dateFilteredRecords = filterRecordsByDate(records);
  
  const sortedRecords = [...dateFilteredRecords].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    if (valA === null) return 1;
    if (valB === null) return -1;
    
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // ✅ SEARCH FILTER
  const filteredRecords = sortedRecords.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.billing_id && item.billing_id.toString().includes(searchLower)) ||
      (item.billing_status && item.billing_status.toLowerCase().includes(searchLower)) ||
      (item.country && item.country.toLowerCase().includes(searchLower)) ||
      (item.product_type && item.product_type.toLowerCase().includes(searchLower)) ||
      (item.customer_ops_user && item.customer_ops_user.toLowerCase().includes(searchLower)) ||
      (item.package_name && item.package_name.toLowerCase().includes(searchLower))
    );
  });

  // ✅ ACTION BUTTON COMPONENT
  const ActionButton = ({ label, color, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        style={{
          backgroundColor: "transparent",
          color: isHovered ? color : "#8B00FF",
          border: "none",
          borderRadius: "5px",
          padding: "5px 10px",
          cursor: "pointer",
          marginRight: "6px",
          transition: "color 0.3s ease",
          fontWeight: "bold",
          fontSize: "12px",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {label}
      </button>
    );
  };

  // ✅ FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ STYLES
  const fullContainerStyle = {
    backgroundColor: "#fff",
    border: "2px solid #8B00FF",
    borderRadius: "10px",
    height: "440px",
    width: "100%",
    margin: "40px auto",
    padding: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
    overflow: "hidden",
  };

  const searchBarColumnFilter = {
    display: "flex",
    alignItems: "center",
    position: "relative",
  };

  const searchBar = {
    width: "80%",
    padding: "8px",
    margin: "10px",
    borderRadius: "5px",
    border: "1px solid #8B00FF",
    outline: "none",
    fontSize: "14px",
  };

  const filterButton = {
    padding: "10px",
    backgroundColor: "#8B00FF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginLeft: "20px",
    width: "200px",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "55px",
    right: "0",
    backgroundColor: "#faf5ff",
    border: "1px solid #8B00FF",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
    padding: "15px",
    zIndex: 1000,
    width: "260px",
    maxHeight: "350px",
    overflowY: "auto",
  };

  const HeaderStyle = {
    background: "#7b2ff7",
    color: "white",
    padding: "10px 12px",
    cursor: "pointer",
    position: "sticky",
    top: 0,
    zIndex: 2,
    textAlign: "left",
    borderBottom: "2px solid white",
    fontWeight: "400",
    letterSpacing: "0.5px",
    minWidth: "120px",
  };

  return (
    <div style={fullContainerStyle}>
      <div style={searchBarColumnFilter}>
        <input
          type="text"
          placeholder="This is Universal Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchBar}
        />

          <div ref={filterRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowColumnFilter(!showColumnFilter)}
            style={filterButton}
          >
            🔧 Filter Columns
          </button>

          {showColumnFilter && (
            <div style={dropdownStyle}>
              <p style={{ margin: "0 0 10px", fontWeight: "600", color: "#6A0DAD" }}>
                Select Columns:
              </p>
              {columns.map((col) => (
                <label
                  key={col.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    marginBottom: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#8B00FF", fontWeight: "bold", marginTop: "50px" }}>
          Loading...
        </p>
      ) : filteredRecords.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", marginTop: "50px" }}>
          No records found
        </p>
      ) : (
        <div style={{ overflowY: "auto", overflowX: "auto", maxHeight: "380px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {columns.map((col) =>
                  visibleColumns.includes(col.key) ? (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={HeaderStyle}>
                      {col.label}{" "}
                      {sortConfig.key === col.key && (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
                  ) : null
                )}
                <th style={HeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item, index) => (
                <tr
                  key={item.billing_id || index}
                  style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#faf5ff" }}
                >
                  {columns.map((col) =>
                    visibleColumns.includes(col.key) ? (
                      <td
                        key={col.key}
                        style={{ padding: "10px", textAlign: "left", minWidth: "120px" }}
                      >
                        {col.key.includes("date") 
                          ? formatDate(item[col.key])
                          : item[col.key] !== null && item[col.key] !== undefined
                          ? item[col.key]
                          : "N/A"}
                      </td>
                    ) : null
                  )}
                  <td style={{ padding: "10px", textAlign: "left", minWidth: "180px" }}>
                      <ActionButton
                          label={
                            <span
                              className="flex items-center gap-1"
                              title="Edit"
                            >
                              <Pencil size={16} strokeWidth={3}  />
                            </span>
                          }
                          color="black"
                          onClick={() => handleEdit(item)}
                        />

                        <ActionButton
                          label={
                            <span
                              className="flex items-center gap-1"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={3} />
                            </span>
                          }
                          color="red"
                          onClick={() => handleDelete(item.billing_id)}
                        />

                        <ActionButton
                          label={
                            <span
                              className="flex items-center gap-1"
                              title="Submit"
                            >
                              <Check size={20} strokeWidth={3} />
                            </span>
                          }
                          color="green"
                          onClick={() => handleSubmit(item)}
                        />
                        <ActionButton
                          label={
                            <span
                              className="flex items-center gap-1"
                              title="Revoke"
                            >
                              <Undo2 size={16} strokeWidth={3}  />
                            </span>
                          }
                          color=""
                          onClick={() => {
                                if (onRevoke) {
                                  onRevoke(item);  // ✅ Call parent's function
                                } else {
                                  console.log("❌ onRevoke not passed as prop");
                                }
                              }}
                        />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
// ========== MAIN COMPONENT ==========
const BuScreen = ({ userData }) => {
  const username = userData?.username || "guest@mfilterit.com";

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const calendarRef = useRef(null);
  const [copyingRecord, setCopyingRecord] = useState(null);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);  // 30 days ago

    setStartDate(formatDate(lastMonth));
    setEndDate(formatDate(today));
  }, []);
  useEffect(() => {
      const handleClickOutside = (event) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://biiling_portal.mfilterit.net/cops_counts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username }),
        });

        const result = await response.json();
        console.log("count api result:",result)
        setData(result);
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    fetchData();
  }, [username]);  // <<< Only one time when dashboard loads
 
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [startMonth, setStartMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    country: "",
    productType: "",
    salesPerson: "",
    packageName: "",
    clientStatus: "",
    payoutModel: "",
    billingNumbers: "",
    startBillingDate:"",
    endBillingDate:"",
    affiliateLead: "",
    nonAffiliateNumber:"",
    number:"",
    crmNumber: "",
  });

  const [showBuForm, setShowBuForm] = useState(false);
  const [selectedBillingRow, setSelectedBillingRow] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]); // Which fields user selected
  const [buFormValues, setBuFormValues] = useState({}); 
  // ✅ REVOKE HANDLER - Undo/Revoke submission
  const handleRevoke = async (item) => {
    // ✅ Confirmation dialog
    if (!window.confirm(
      `Revoke submission for Billing ID ${item.billing_id}?\n\n` +
      `This will:\n` +
      `• Delete BU record\n` +
      `• Update COPS status\n` +
      `• Reset billing status`
    )) {
      return;
    }

    try {
      const payload = { billing_id: item.billing_id };
      
      console.log("📤 Revoking billing ID:", payload);

      const response = await fetch("https://biiling_portal.vmon.net/bu_revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Revoke API Response:", result);

      if (result.status === "success") {
        alert("✅ " + (result.message || "BU Deleted & COPS Updated Successfully!"));
        
        // ✅ Refresh data to show updated state
        window.location.reload();
      } else {
        alert("❌ Error: " + (result.message || "Failed to revoke"));
      }
    } catch (err) {
      console.error("❌ Revoke API Error:", err);
      alert("❌ Something went wrong: " + err.message);
    }
  };
  // ✅ NEW FUNCTION - For creating brand new records
  const handleCreateNewRecord = async () => {
    try {
      const payload = {
        email_id: username,  // ✅ Logged-in user's email
        country: formData.country,
        product_type: formData.productType,
        sales_person: formData.salesPerson,
        packages_name: formData.packageName,
        client_package_status: formData.clientStatus,
        payout_model: formData.payoutModel,
        billing_number: formData.billingNumbers,
        StartBilling_date: formData.startBillingDate,
        endBilling_date: formData.endBillingDate,
        affiliate_lead: formData.affiliateLead || 0,
        nonAffiliateNumber: formData.nonAffiliateNumber || 0,
        number: formData.number || 0,
        crm_number: formData.crmNumber || ""
      };

      console.log("📤 Creating new record with payload:", payload);

      const response = await fetch("https://biiling_portal.mfilterit.net/insert_bu_bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Create API Response:", result);

      if (result === "Successfully bill inserted in dashboard" || result.status === "success") {
        alert("✅ Record Created Successfully!");
        setShowForm(false);
        // Reset form
        setFormData({
          country: "",
          productType: "",
          salesPerson: "",
          packageName: "",
          clientStatus: "",
          payoutModel: "",
          billingNumbers: "",
          startBillingDate: "",
          endBillingDate: "",
          affiliateLead: "",
          nonAffiliateNumber: "",
          number: "",
        });
        window.location.reload();
      } else {
        alert("⚠️ " + (result.message || "Failed to create"));
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("❌ Something went wrong!");
    }
  };
  const months = [
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 },
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // ✅ Open BU form when Submit button clicked
  const openBuForm = (row) => {
    console.log("🔵 openBuForm called with row:", row);
    setSelectedBillingRow(row);
    setShowBuForm(true);
    setSelectedFields([]);
    setBuFormValues({});
  };
  const BU_FIELDS = [
    {
      key: "countLast",
      label: "Count from last Screen",
      inputs: [
        { name: "countLastNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "mediaSpend",
      label: "Media Spend",
      inputs: [
        { name: "mediaSpendPercent", label: "%age", type: "number" },
        { name: "mediaSpendNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "platformFee",
      label: "Platform Fee",
      inputs: [
        { name: "platformFeeNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "slab",
      label: "Slab",
      inputs: [
        { name: "slab1Number", label: "Slab 1 - Numbers", type: "number" },
        { name: "slab2Number", label: "Slab 2 - Numbers", type: "number" },
        { name: "slab3Number", label: "Slab 3 - Numbers", type: "number" }
      ]
    },
    {
      key: "setupFee",
      label: "Set up Fee (One-time)",
      inputs: [
        { name: "setupFeeNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "monthlySubscription",
      label: "Monthly subscription fee",
      inputs: [
        { name: "monthlySubscriptionNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "additionalUserLogin",
      label: "Additional User Login (Per Month)",
      inputs: [
        { name: "additionalUserLoginNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "monthlyRecurringCost",
      label: "Monthly Recurring Cost",
      inputs: [
        { name: "monthlyRecurringCostNumber", label: "Numbers", type: "number" }
      ]
    },
    {
      key: "additionalPlatform",
      label: "Up to 1 Additional Platforms/Marketplaces",
      inputs: [
        { name: "additionalPlatformNumber", label: "Numbers", type: "number" }
      ]
    }
  ];

  // ✅ Toggle field selection
  const toggleField = (fieldName) => {
    if (selectedFields.includes(fieldName)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldName));
    } else {
      setSelectedFields([...selectedFields, fieldName]);
    }
  };

  // ✅ Handle input change
  const handleBuInput = (e) => {
  setBuFormValues({
    ...buFormValues,
    [e.target.name]: e.target.value
  });
};

  // ✅ Submit form
  // ✅ UPDATED - Submit BU form with status update
  const submitBuForm = async () => {
    try {
      // ✅ Prepare payload with all selected field values
      const payload = {
        // Row se basic values
        billing_id: selectedBillingRow.billing_id,
        country: selectedBillingRow.country,
        product_type: selectedBillingRow.product_type,
        package_name: selectedBillingRow.package_name,
        billing_numbers: selectedBillingRow.billing_numbers,
        customer_ops_user: selectedBillingRow.customer_ops_user,
        count_from_last_screen: buFormValues.countLastNumber || null,
        media_spend_percent: buFormValues.mediaSpendPercent || null,
        media_spend_number: buFormValues.mediaSpendNumber || null,
        platform_fee: buFormValues.platformFeeNumber || null,
        slab_1: buFormValues.slab1Number || null,
        slab_2: buFormValues.slab2Number || null,
        slab_3: buFormValues.slab3Number || null,
        setup_fee_onetime: buFormValues.setupFeeNumber || null,
        monthly_subscription_fee: buFormValues.monthlySubscriptionNumber || null,
        additional_user_login_per_month: buFormValues.additionalUserLoginNumber || null,
        monthly_recurring_cost: buFormValues.monthlyRecurringCostNumber || null,
        additional_platform_marketplace_fee: buFormValues.additionalPlatformNumber || null,
        billing_status: "Submitted by BU"
      };

      console.log("📤 Sending BU submission payload:", payload);

      // ✅ Call update API (not submit_bu_senior, use update_billing)
      const response = await fetch("https://biiling_portal.mfilterit.net/update-bu-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log("✅ BU Submit Response:", result);
      
      if (result.status === "success" || result.message?.includes("success")) {
        alert("✅ Submitted successfully! Status updated to 'Submitted by BU'");
        setShowBuForm(false);
        setSelectedFields([]);
        setBuFormValues({});
        
        // ✅ Refresh data
        window.location.reload();
      } else {
        alert("⚠️ " + (result.message || "Failed to submit"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Error: " + error.message);
    }
  };
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadFile(file);
      } else {
        alert('❌ Please upload only CSV or Excel files!');
        e.target.value = null;
      }
    }
  };

  // Process CSV file
  const processCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] ? values[index].trim() : '';
        });
        data.push(obj);
      }
    }
    return data;
  };

  // Process Excel file (basic implementation)
  const processExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // For demo, treating as CSV
          // In production, use library like 'xlsx' or 'read-excel-file'
          const text = e.target.result;
          const data = processCSV(text);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Handle bulk upload submission
  const handleBulkUpload = async () => {
    if (!uploadFile) {
      alert('❌ Please select a file first!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let jsonData = [];

      // Process file based on type
      if (uploadFile.name.endsWith('.csv')) {
        const text = await uploadFile.text();
        jsonData = processCSV(text);
      } else if (uploadFile.name.endsWith('.xlsx') || uploadFile.name.endsWith('.xls')) {
        jsonData = await processExcel(uploadFile);
      }

      console.log('Parsed JSON Data:', jsonData);

      // Upload each row to API
      const totalRows = jsonData.length;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const response = await fetch('https://biiling_portal.mfilterit.net/insert_bu_bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData[i]),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }

          // Update progress
          setUploadProgress(Math.round(((i + 1) / totalRows) * 100));
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error uploading row ${i + 1}:`, error);
          failCount++;
        }
      }

      // Show result
      alert(`✅ Upload Complete!\n\nSuccess: ${successCount}\nFailed: ${failCount}\nTotal: ${totalRows}`);
      
      // Reset
      setShowBulkUpload(false);
      setUploadFile(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('❌ Error processing file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Close bulk upload modal
  const handleCancelBulkUpload = () => {
    setShowBulkUpload(false);
    setUploadFile(null);
    setUploadProgress(0);
  };

  // EDIT HANDLERS - DEFINED ONLY ONCE
  const handleEditRecord = (record) => {
    console.log("📝 Editing record:", record);
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editingRecord) return;

    try {
      const payload = {
        billing_id: editingRecord.billing_id,
        country: editingRecord.country,
        product_type: editingRecord.product_type,
        sales_person: editingRecord.sales_person,
        package_name: editingRecord.package_name,
        client_package_status: editingRecord.client_package_status,
        payout_model: editingRecord.payout_model,
        billing_numbers: editingRecord.billing_numbers,
        start_billing_date: editingRecord.start_billing_date,
        end_billing_date: editingRecord.end_billing_date,
        affiliate_lead: editingRecord.affiliate_lead || 0,
        nonAffiliateNumber: editingRecord.nonaffiliatenumber || 0,
        number: editingRecord.number || 0,
        // Add other fields as needed
      };

      console.log("📤 Updating record with payload:", payload);

      const response = await fetch("https://biiling_portal.mfilterit.net/update_billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Edit API Response:", result);

      if (result.status === "success" || result.message.includes("success")) {
        alert("✅ Record Updated Successfully!");
        setShowEditModal(false);
        setEditingRecord(null);
        
        // ✅ Refresh data by re-fetching
        window.location.reload(); // Simple approach, or trigger re-fetch
      } else {
        alert("⚠️ " + (result.message || "Failed to update"));
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("❌ Something went wrong!");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingRecord(null);
  };
  const handleCancel = () => {
    setShowForm(false);
  };
  const handleSubmitButton = async (item) => {
    if (!window.confirm(`Submit billing ID ${item.billing_id}? This will mark it as PROCESSED.`)) {
      return;
    }

    try {
      const response = await fetch("https://biiling_portal.mfilterit.net/update_billing_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_id: item.billing_id,
          billing_status: "Processed"  // ✅ Status update to Processed
        }),
      });

      const result = await response.json();
      console.log("Submit API Response:", result);

      if (result.status === "success" || result.message.includes("success")) {
        alert("✅ Billing record submitted successfully!");
        
        // ✅ Update local state to reflect change immediately
        setRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.billing_id === item.billing_id
              ? { ...record, billing_status: "Processed" }
              : record
          )
        );
      } else {
        alert("⚠️ " + (result.message || "Failed to submit"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Error submitting record!");
    }
  };
  

  // Styles
  const dataTableContainer = {
    marginTop: "-20px",
    width: "100%",
    overflowX: "auto",
    display: "flex",
    height: "100%",
    justifyContent: "center",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "#f3dff7ff",
    borderRadius: "10px",
    padding: "20px",
    width: "60%",
    maxHeight: "80vh",
    overflowY: "auto",
    border: "2px solid #8B00FF",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  };

  const btnGroupStyle = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    gap: "10px",
  };

  const btnStyle = {
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    border: "none",
  };

  const bulkUploadModalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const bulkUploadContentStyle = {
    backgroundColor: "#f3dff7ff",
    borderRadius: "10px",
    padding: "20px",
    width: "60%",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    border: "2px solid #8B00FF",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  const boxStyle = {
    backgroundColor: "#ffffff",
    border: "2px solid #8B00FF",
    borderRadius: "10px",
    height: "70px",
    textAlign: "center",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    width: "17.34%",
  };

  const textStyle = {
    fontSize: "20px",
    margin: "0 0 10px",
    color: "#070707ff",
    fontWeight: "bold",
  };

  const createNewBillingRecord = {
    backgroundColor: "#8b00ffff",
    color: "white",
    padding: "5px 10px",
    width: "107%",
    height: "50px",
    marginBottom: "10px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  };
  const CheckBoxsStyle = ({ label, fieldKey, selectedFields, toggleField }) => {
      return (
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            padding: "8px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: selectedFields.includes(fieldKey) ? "#f3e5ff" : "transparent",
            border: selectedFields.includes(fieldKey)
              ? "2px solid #8B00FF"
              : "2px solid transparent"
          }}
        >
          <input
            type="checkbox"
            checked={selectedFields.includes(fieldKey)}
            onChange={() => toggleField(fieldKey)}
            style={{ marginRight: "8px" }}
          />
          <strong>{label}</strong>
        </label>
      );
    };

  return (
    <div
      style={{
        width: "98%",
        minHeight: "100vh",
        backgroundColor: "#faedf6ff",
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
      }}
    >
      {/* TOP ROW - Statistics and Actions */}
      <div style={{ justifyContent: "center", display: "flex", gap: "15px" }}>
        

        {/* Box 2: Total Billing Numbers */}
        <div style={boxStyle}>
          <h3 style={{ fontSize: "18px", margin: "0 0 5px", color: "#070707ff" }}>
            Total Billing Numbers
          </h3>
          <p style={textStyle}>{data?.totalBillingNumbers || 0}</p>
        </div>
              {/* Box 1: Total Active Records */}
              <div style={boxStyle}>
                <h3 style={{ fontSize: "18px", margin: "0 0 5px", color: "#070707ff" }}>
                  Total Active Records
                </h3>
                <p style={textStyle}>{data?.totalRecords || 0}</p>
              </div>
              {/* Box 3: Processed Bill */}
              <div style={boxStyle}>
                <h3 style={{ fontSize: "18px", margin: "0 0 5px", color: "#070707ff" }}>
                  Processed Bill
                </h3>
                <p style={textStyle}>{data?.processedBill || 0}</p>
              </div>

            <div style={boxStyle}>
              <h3
                style={{
                  fontSize: "18px",
                  margin: "0 0 0%",
                  marginTop:"0%",
                  marginBottom:"5%",
                  fontWeight: "600",
                  color: "#070707ff",
                }}
              >
                Select Date Range
              </h3>

              <input
                readOnly
                onClick={() => setOpen(!open)}
                value={
                  startDate && endDate
                    ? `${startDate} → ${endDate}`
                    : "dd-mm-yyyy → dd-mm-yyyy"
                }
                style={{
                  width: "90%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: startDate && endDate ? "2px solid #10b981" : "2px solid #8B00FF",  // ✅ Green border when active
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  transition: "0.2s",
                }}
              />

              {/* Calendar popup stays same */}
              {open && (
                <div
                  ref={calendarRef}
                  style={{
                    position: "absolute",
                    marginTop: "70%",
                    zIndex: 999,
                    background: "#fbfdfdff",
                    padding: "5px",
                    borderRadius: "10px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    border: "3px solid #8B00FF",
                  }}
                >
                  <DateRange
                    editableDateInputs={true}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                    onChange={(e) => {
                      const s = format(e.selection.startDate, "yyyy-MM-dd");
                      const e2 = format(e.selection.endDate, "yyyy-MM-dd");

                      setStartDate(s);
                      setEndDate(e2);
                      setRange([e.selection]);

                      const isSecondClick = e.selection.startDate !== e.selection.endDate;

                      if (isSecondClick) {
                        setOpen(false);
                        console.log("✅ Date range selected:", s, "to", e2);
                      }
                    }}
                  />
                </div>
              )}
            </div>
        {/* Box 5: Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button style={{...createNewBillingRecord, height:"30%"}} onClick={() => setShowForm(true)}>
            Create New Billing
          </button>
          <button
            style={{...createNewBillingRecord, height:"30%"}}
            onClick={() => setShowBulkUpload(true)}
          >
          Bulk Upload
          </button>
          <button style={{...createNewBillingRecord, height:"30%"}} onClick={() => setShowForm(true)}>
            Summary
          </button>
         
        </div>
      </div>

      {/* MODAL - Create Billing Form */}
      {showForm && (
        <div style={modalOverlayStyle} onClick={handleCancel}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center", color: "#8B00FF" }}>
              Create New Billing Record
            </h2>
            <div style={formGridStyle}>
              {Object.keys(formData).filter(field => !["affiliateLead", "nonAffiliateNumber", "number"].includes(field)).map((field) => (
                <label key={field} style={{ display: "flex", flexDirection: "column" }}>
                  {field.replace(/([A-Z])/g, " $1").trim()}*
                  {field !== "payoutModel" ? (
                  <input
                    type={
                      field === "startBillingDate" || field === "endBillingDate"
                        ? "date"
                        : field === "billingNumbers" 
                        ? "number"
                        : "text"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #8B00FF", marginTop: "5px", }}
                  />
                ) : (
                  <>
                    {/* Dropdown for payoutModel */}
                    <select
                      name="payoutModel"
                      value={formData.payoutModel}
                      onChange={handleChange}
                      required
                      style={{ padding: "10px", borderRadius: "5px", border: "1px solid #8B00FF", marginTop: "5px", }}
                    >
                      <option value="">Select Payout Model</option>
                      <option value="Visit">Visit</option>
                      <option value="Event">Event</option>
                      <option value="Click">Click</option>
                      <option value="Install">Install</option>
                      
                    </select>

                    {/* Show Affiliate Leads input ONLY if payoutModel = Event */}
                    {formData.payoutModel === "Event" && (
                      <input
                        type="number"
                        name="affiliateLeads"
                        placeholder="Affiliate Number"
                        value={formData.affiliateLead || ""}
                        onChange={handleChange}
                        required
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #8B00FF", marginTop: "5px", }}
                      />
                    )}
                    {formData.payoutModel === "Visit" && (
                      <input
                        type="number"
                        name="nonAffiliateNumber"
                        placeholder="Non Affiliate-Number"
                        value={formData.nonAffiliateNumber || ""}
                        onChange={handleChange}
                        required
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #8B00FF", marginTop: "5px", }}
                      />
                    )}
                    {formData.payoutModel === "Click" && (
                      <input
                        type="number"
                        name="number"
                        placeholder="Number"
                        value={formData.number || ""}
                        onChange={handleChange}
                        required
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #8B00FF", marginTop: "5px", }}
                      />
                    )}
                    {formData.payoutModel === "Install" && (
                      <input
                        type="number"
                        name="number"
                        placeholder="Number"
                        value={formData.number || ""}
                        onChange={handleChange}
                        required
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #8B00FF", marginTop: "5px", }}
                      />
                    )}
                  </>
                )}

                </label>
              ))}
            </div>

            <div style={btnGroupStyle}>
              <button
                onClick={handleCancel}
                style={{ ...btnStyle, backgroundColor: "#fa0d0dff", color: "#ebf2f3ff" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewRecord}
                style={{ ...btnStyle, backgroundColor: "#8B00FF", color: "#fff" }}
              >
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkUpload && (
        <div style={bulkUploadModalStyle} onClick={handleCancelBulkUpload}>
          <div style={bulkUploadContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center", color: "#8B00FF", marginBottom: "20px" }}>
              📤 Bulk Upload
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ marginBottom: "10px", fontWeight: "600", color: "#333" }}>
                Upload CSV or Excel File:
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isUploading}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px dashed #8B00FF",
                  borderRadius: "5px",
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              />
              {uploadFile && (
                <p style={{ marginTop: "10px", color: "#666", fontSize: "14px" }}>
                  Selected: <strong>{uploadFile.name}</strong>
                </p>
              )}
            </div>

            {isUploading && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ marginBottom: "5px", color: "#666" }}>
                  Uploading... {uploadProgress}%
                </p>
                <div style={{
                  width: "100%",
                  height: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    backgroundColor: "#8B00FF",
                    transition: "width 0.3s ease",
                  }} />
                </div>
              </div>
            )}

            <div style={{
              padding: "15px",
              backgroundColor: "#faf5ff",
              borderRadius: "5px",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "13px", color: "#666", margin: "0 0 8px" }}>
                <strong>📋 Instructions:</strong>
              </p>
              <ul style={{ fontSize: "12px", color: "#666", margin: 0, paddingLeft: "20px" }}>
                <li>CSV format: Headers in first row</li>
                <li>Excel format: Data in first sheet</li>
                <li>Each row will be sent as separate API call</li>
                <li>Progress will be shown during upload</li>
              </ul>
            </div>

            <div style={btnGroupStyle}>
              <button
                onClick={handleCancelBulkUpload}
                disabled={isUploading}
                style={{
                  ...btnStyle,
                  backgroundColor: "#e0e0e0",
                  color: "#333",
                  opacity: isUploading ? 0.5 : 1,
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!uploadFile || isUploading}
                style={{
                  ...btnStyle,
                  backgroundColor: "#8B00FF",
                  color: "#fff",
                  opacity: !uploadFile || isUploading ? 0.5 : 1,
                  cursor: !uploadFile || isUploading ? "not-allowed" : "pointer",
                }}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingRecord && (
        <div style={modalOverlayStyle} onClick={handleCancelEdit}>
          <div 
            style={{
              ...modalContentStyle,
              width: "70%",
              maxHeight: "85vh"
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ textAlign: "center", color: "#8B00FF", marginBottom: "20px" }}>
              ✏️ Edit Billing Record - ID: {editingRecord.billing_id}
            </h2>
            
            <div style={formGridStyle}>
              {/* Billing ID - Read Only */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Billing ID
                <input
                  type="text"
                  value={editingRecord.billing_id}
                  disabled
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                    backgroundColor: "#f0f0f0",
                    cursor: "not-allowed",
                  }}
                />
              </label>

              {/* Country */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Country*
                <input
                  type="text"
                  name="country"
                  value={editingRecord.country || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Product Type */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Product Type*
                <input
                  type="text"
                  name="product_type"
                  value={editingRecord.product_type || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Sales Person */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Sales Person*
                <input
                  type="text"
                  name="sales_person"
                  value={editingRecord.sales_person || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Package Name */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Package Name*
                <input
                  type="text"
                  name="package_name"
                  value={editingRecord.package_name || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Client Package Status */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Client Status*
                <input
                  type="text"
                  name="client_package_status"
                  value={editingRecord.client_package_status || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Payout Model */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Payout Model*
                <select
                  name="payout_model"
                  value={editingRecord.payout_model || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                >
                  <option value="">Select Payout Model</option>
                  <option value="Visit">Visit</option>
                  <option value="Event">Event</option>
                  <option value="Click">Click</option>
                  <option value="Install">Install</option>
                </select>
              </label>

              {/* Billing Numbers */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Billing Numbers*
                <input
                  type="number"
                  name="billing_numbers"
                  value={editingRecord.billing_numbers || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Start Billing Date */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Start Billing Date*
                <input
                  type="date"
                  name="start_billing_date"
                  value={editingRecord.start_billing_date?.split('T')[0] || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* End Billing Date */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                End Billing Date*
                <input
                  type="date"
                  name="end_billing_date"
                  value={editingRecord.end_billing_date?.split('T')[0] || ""}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* Conditional Fields Based on Payout Model */}
              {editingRecord.payout_model === "Event" && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Affiliate Lead
                  <input
                    type="number"
                    name="affiliate_lead"
                    value={editingRecord.affiliate_lead || ""}
                    onChange={handleEditChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #8B00FF",
                      marginTop: "5px",
                    }}
                  />
                </label>
              )}

              {editingRecord.payout_model === "Visit" && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Non Affiliate Number
                  <input
                    type="number"
                    name="nonaffiliatenumber"
                    value={editingRecord.nonaffiliatenumber || ""}
                    onChange={handleEditChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #8B00FF",
                      marginTop: "5px",
                    }}
                  />
                </label>
              )}

              {(editingRecord.payout_model === "Click" || editingRecord.payout_model === "Install") && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Number
                  <input
                    type="number"
                    name="number"
                    value={editingRecord.number || ""}
                    onChange={handleEditChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #8B00FF",
                      marginTop: "5px",
                    }}
                  />
                </label>
              )}

              {/* Billing Status - Display Only */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Current Status
                <input
                  type="text"
                  value={editingRecord.billing_status || ""}
                  disabled
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                    backgroundColor: "#f0f0f0",
                    cursor: "not-allowed",
                  }}
                />
              </label>
            </div>

            <div style={btnGroupStyle}>
              <button
                onClick={handleCancelEdit}
                style={{ ...btnStyle, backgroundColor: "#fa0d0dff", color: "#fff" }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                style={{ ...btnStyle, backgroundColor: "#8B00FF", color: "#fff" }}
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div style={dataTableContainer}>
        {/* <DataShow 
          onEdit={handleEditRecord} 
          
          username={username}
          startDate={startDate}
          endDate={endDate}
        /> */}
      </div>
      {showBuForm && selectedBillingRow && (
      <div 
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
        onClick={() => setShowBuForm(false)}
      >
        <div 
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "10px",
            width: "600px",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ Updated Header */}
          <h2 style={{ color: "#8B00FF", textAlign: "center", marginBottom: "20px" }}>
            📝 Submit to BU/Senior
          </h2>
          
          {/* Show billing info with current status */}
          <div style={{ 
            background: "#f0f0f0", 
            padding: "15px", 
            borderRadius: "5px",
            marginBottom: "20px"
          }}>
            <p style={{ margin: "5px 0" }}><strong>Billing ID:</strong> {selectedBillingRow.billing_id}</p>
            <p style={{ margin: "5px 0" }}><strong>Country:</strong> {selectedBillingRow.country}</p>
            <p style={{ margin: "5px 0" }}><strong>Package:</strong> {selectedBillingRow.package_name}</p>
            <p style={{ margin: "5px 0" }}><strong>Billing Numbers:</strong> {selectedBillingRow.billing_numbers}</p>
            <p style={{ margin: "5px 0", color: "#8B00FF" }}>
              <strong>Current Status:</strong> {selectedBillingRow.billing_status}
            </p>
            <p style={{ margin: "5px 0", color: "#10b981", fontWeight: "600" }}>
              → Will become: "Submitted by BU"
            </p>
          </div>

      {/* STEP 1: Field Selection Checkboxes */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #8B00FF", paddingBottom: "15px" }}>
        <p style={{ fontWeight: "bold", marginBottom: "10px", color: "#8B00FF", fontSize: "16px" }}>
          📋 Step 1: Select fields you want to fill
        </p>
          {BU_FIELDS.map((item) => (
            <CheckBoxsStyle 
              key={item.key}
              label={item.label}
              fieldKey={item.key}
              selectedFields={selectedFields}
              toggleField={toggleField}
            />
          ))}
      </div>

        {selectedFields.map((fieldKey) => {
            const field = BU_FIELDS.find((f) => f.key === fieldKey);
            if (!field) return null;

            return (
              <div key={fieldKey} style={{ marginBottom: "25px" }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}>
                  {field.label}
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  {field.inputs.map((inp) => (
                    <input
                      key={inp.name}
                      type={inp.type}
                      name={inp.name}
                      value={buFormValues[inp.name] || ""}
                      onChange={handleBuInput}
                      placeholder={inp.label}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "2px solid #8B00FF",
                        borderRadius: "5px"
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
          <button
            onClick={() => {
              setShowBuForm(false);
              setSelectedFields([]);
              setBuFormValues({});
            }}
            style={{
              padding: "12px 24px",
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            Cancel
          </button>
              <button
                onClick={() => {
                  // ✅ Add confirmation before submitting
                  if (window.confirm(
                    `Submit billing ID ${selectedBillingRow.billing_id} to BU/Senior?\n\n` +
                    `This will update the status to "Submitted by BU" and save all filled values.`
                  )) {
                    submitBuForm();
                  }
                }}
                disabled={selectedFields.length === 0}
                style={{
                  padding: "12px 24px",
                  backgroundColor: selectedFields.length === 0 ? "#ccc" : "#8B00FF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: selectedFields.length === 0 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Submit to BU/Senior
              </button>
        </div>
      </div>
    </div>
  )}

    {/* DATA TABLE */}
    <div style={dataTableContainer}>
      <DataShow
          onEdit={handleEditRecord}
          onSubmit={openBuForm}  
          onRevoke={handleRevoke} 
          username={username}
          startDate={startDate}
          endDate={endDate}
        />
    </div>
  </div>
  );
};

export default BuScreen;