import { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Pencil, Trash2, CheckCircle,Copy,Check } from "lucide-react";

// ========== DATA TABLE COMPONENT ==========
const DataShow = ({ onEdit,onCopy,username, startDate, endDate, refreshTrigger  }) => {
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
  const columns = [
        { key: "billing_id", label: "Billing ID" },
        { key: "billing_status", label: "Billing Status" },
        { key: "country", label: "Country" },
        { key: "product_type", label: "Product Type" },
        { key: "customer_ops_user", label: "Customer OPS User" },
        { key: "bu_head_name", label: "BU Head Name" },
        { key: "sales_person", label: "Sales Person" },
        { key: "package_name", label: "Package Name" },
        { key: "client_package_status", label: "Client Package Status" },
        { key: "payout_model", label: "Payout Model" },
        { key: "billing_numbers", label: "Billing Numbers" },
        { key: "date_created", label: "Date Created" },
        { key: "last_updated_date", label: "Last Updated Date" },
        { key: "affiliate_lead", label: "Affiliate Lead" },
        { key: "nonaffiliatenumber", label: "Non Affiliate Number" },
        { key: "number", label: "Number" },
        { key: "bu_email", label: "BU Email" },
        { key: "user_email", label: "User Email" },
        { key: "start_billing_date", label: "Start Billing Date" },
        { key: "end_billing_date", label: "End Billing Date" },
        { key: "crm_number", label: "CRM ID" },
        
      ];

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this record?")) {
        return;
      }

      try {
        const response = await fetch("https://biiling_portal.mfilterit.net/delete_billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billing_id: id
          }),
        });

        const result = await response.json();
        console.log("Delete API Response:", result);

        if (result.status === "success" || result.message.includes("success")) {
          alert("✅ Record deleted successfully!");
          
          // ✅ Remove from local state
          setRecords((prev) => prev.filter((record) => record.billing_id !== id));
        } else {
          alert("⚠️ " + (result.message || "Failed to delete"));
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("❌ Error deleting record!");
      }
    };
    const handleCopy = (item) => {
    if (onCopy) {
      onCopy(item);
    }
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
  
  // Handle Edit Action
  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  // Toggle column visibility
  const toggleColumn = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowColumnFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data from API

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Build payload with date range
        const payload = {
          username: username
        };

        // Add dates if both are selected
        if (startDate && endDate) {
          payload.start_date = startDate;
          payload.end_date = endDate;
        }

        console.log("📅 Fetching data with payload:", payload);

        const response = await fetch("https://biiling_portal.mfilterit.net/cops_data_show", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("API Response with date filter:", result);
        
        if (result.error) {
          console.error("API Error:", result.error);
          setRecords([]);
        } else if (Array.isArray(result)) {
          setRecords(result);
        } else {
          setRecords([result]);
        }
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
  }, [username, startDate, endDate,refreshTrigger]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort records
  const filterRecordsByDate = (records) => {
    if (!startDate || !endDate) {
      return records; // No date filter, return all
    }

    return records.filter((record) => {
      // Check if record has date_created field
      if (!record.date_created) return true;

      const recordDate = new Date(record.date_created);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set time to start/end of day for accurate comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return recordDate >= start && recordDate <= end;
    });
  };

  // ✅ UPDATE SORTED RECORDS - Apply date filter first
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

  // Search filter stays same
  const filteredRecords = sortedRecords.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.billing_id && item.billing_id.toString().includes(searchLower)) ||
      (item.billing_status && item.billing_status.toLowerCase().includes(searchLower)) ||
      (item.country && item.country.toLowerCase().includes(searchLower)) ||
      (item.product_type && item.product_type.toLowerCase().includes(searchLower)) ||
      (item.customer_ops_user && item.customer_ops_user.toLowerCase().includes(searchLower)) ||
      (item.package_name && item.package_name.toLowerCase().includes(searchLower)) ||
      (item.bu_email && item.bu_email.toLowerCase().includes(searchLower)) ||
      (item.user_email && item.user_email.toLowerCase().includes(searchLower)) ||
      (item.crm_number && item.crm_number.toLowerCase().includes(searchLower))
    );
  });
  // Action Button Component
  const ActionButton = ({ label, color, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle = {
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
    };

    return (
      <button
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {label}
      </button>
    );
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Styles
  const fullContainerStyle = {
    backgroundColor: "#fff",
    border: "2px solid #8B00FF",
    borderRadius: "10px",
    height: "440px",
    width: "100%",
    margin: "20px auto",
    marginRight: "0px",
    padding: "5px",
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
    marginTop: "10px",
    marginBottom: "10px",
    marginLeft: "10px",
    borderRadius: "5px",
    border: "1px solid #8B00FF",
    outline: "none",
    fontSize: "14px",
  };

  const filterButton = {
    padding: "10px 10px",
    backgroundColor: "#8B00FF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
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

        {/* Dropdown filter */}
        <div ref={filterRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowColumnFilter(!showColumnFilter)}
            style={filterButton}
          >
            🔧 Filter Columns
          </button>

          {showColumnFilter && (
            <div style={dropdownStyle}>
              <p
                style={{
                  margin: "0 0 10px",
                  fontWeight: "600",
                  color: "#6A0DAD",
                }}
              >
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
                    style={{ cursor: "pointer" }}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p
          style={{
            textAlign: "center",
            color: "#8B00FF",
            fontWeight: "bold",
            marginTop: "50px",
          }}
        >
          Loading...
        </p>
      ) : filteredRecords.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginTop: "50px",
          }}
        >
          No records found
        </p>
      ) : (
        <div style={{ overflowY: "auto", overflowX: "auto", maxHeight: "380px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead>
              <tr>
                {columns.map((col) =>
                  visibleColumns.includes(col.key) ? (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={HeaderStyle}
                    >
                      {col.label}{" "}
                      {sortConfig.key === col.key &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
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
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#faf5ff",
                  }}
                >
                  {columns.map((col) =>
                    visibleColumns.includes(col.key) ? (
                      <td
                        key={col.key}
                        style={{
                          padding: "10px",
                          textAlign: "left",
                          wordWrap: "break-word",
                          minWidth: "120px",
                        }}
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
                          onClick={() => handleSubmitButton(item)}
                        />

                        <ActionButton
                          label={
                            <span
                              className="flex items-center gap-1"
                              title="Copy"
                            >
                              <Copy size={16} strokeWidth={3}  />
                            </span>
                          }
                          color="blue"
                          onClick={() => onCopy(item)}
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
const CopsScreen = ({ userData }) => {
  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];  // yyyy-mm-dd only
  };
  const username = userData?.username || "guest@mfilterit.com";
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const todayStr = formatDate(today);
const lastMonthStr = formatDate(lastMonth);
  const [startDate, setStartDate] = useState(lastMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const calendarRef = useRef(null);
  const [range, setRange] = useState([
  {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  },
]);
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
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingRecord, setCopyingRecord] = useState(null);
  
  // Month selection
  const [startMonth, setStartMonth] = useState("");

  // Form modal visibility
  const [showForm, setShowForm] = useState(false);

  // Form fields data
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
    crmId:""
  });

  // Month list
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Close modal
  const handleCancel = () => {
    setShowForm(false);
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

  const handleSubmit = async () => {
    try {
      const payload = {
        email_id: username,  // ✅ Use logged-in user's email
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
        crm_number:formData.crmId
      };
      console.log('cen_number_1',payload.crm_number);

      const res = await fetch("https://biiling_portal.mfilterit.net/insert_cops_bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log("API Response:", responseData);

      if (responseData === "Successfully bill inserted in dashboard") {
        window.location.reload();
        alert("✅ Bill Inserted Successfully!");
      } else {
        alert("⚠️ " + responseData.message);
      }

      setShowForm(false);
      setFormData({
        country: "",
        productType: "",
        salesPerson: "",
        packageName: "",
        clientStatus: "",
        payoutModel: "",
        billingNumbers: "",
        affiliateLead: "",
        nonAffiliateNumber: "",
        number: "",
        startBillingDate: "",
        endBillingDate: "",
        crmId:""
      });

    } catch (err) {
      console.error("Error:", err);
      alert("❌ Something went wrong!");
    }
  };
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
          const response = await fetch('https://biiling_portal.mfilterit.net/insert_cops_bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData[i]),
          });

          if (response.ok) {
            window.location.reload();
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
        crmNumber:editingRecord.crm_id
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
        //   setRecords(prev =>
        //   prev.map(r =>
        //     r.billing_id === editingRecord.billing_id
        //       ? { ...r, ...editingRecord } // updated values
        //       : r
        //   )
        // );
        setShowEditModal(false);
        setEditingRecord(null);
        setRefreshTrigger(prev => prev + 1);
        
        // ✅ Refresh data by re-fetching
        window.location.reload(); // Simple approach, or trigger re-fetch
      } else {
        console.log(result)
        alert("⚠️ " + (result.message || "Failed to update"));
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("❌ Something went wrong!");
    }
  };
  // ✅ COPY HANDLERS
  const handleCopy = (record) => {
    console.log("📋 Copying record:", record);
    setCopyingRecord(record);
    setShowCopyModal(true);
  };

  const handleCopyChange = (e) => {
    const { name, value } = e.target;
    setCopyingRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopySubmit = async () => {
    if (!copyingRecord) return;

    try {
      const payload = {
        email_id: username,  // ✅ Logged-in user's email
        country: copyingRecord.country,
        product_type: copyingRecord.product_type,
        sales_person: copyingRecord.sales_person,
        packages_name: copyingRecord.package_name,
        client_package_status: copyingRecord.client_package_status,
        payout_model: copyingRecord.payout_model,
        billing_number: copyingRecord.billing_numbers,
        StartBilling_date: copyingRecord.start_billing_date?.split('T')[0],
        endBilling_date: copyingRecord.end_billing_date?.split('T')[0],
        affiliate_lead: copyingRecord.affiliate_lead || 0,
        nonAffiliateNumber: copyingRecord.nonaffiliatenumber || 0,
        number: copyingRecord.number || 0,
        crm_number: copyingRecord.crm_number || ""
      };

      console.log("📤 Copying record with payload:", payload);

      const response = await fetch("https://biiling_portal.mfilterit.net/insert_cops_bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Copy API Response:", result);

      if (result === "Successfully bill inserted in dashboard" || result.status === "success") {
        alert("✅ Record Copied Successfully!");
        setShowCopyModal(false);
        setCopyingRecord(null);
        window.location.reload();
      } else {
        alert("⚠️ " + (result.message || "Failed to copy"));
      }
    } catch (error) {
      console.error("Copy error:", error);
      alert("❌ Something went wrong!");
    }
  };

  const handleCancelCopy = () => {
    setShowCopyModal(false);
    setCopyingRecord(null);
  };
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingRecord(null);
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
    width: "220px",
  };

  const textStyle = {
    fontSize: "20px",
    margin: "0 0 10px",
    color: "#333",
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
                 {/* ✅ Clear Date Filter Button */}
                  
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
          <button style={createNewBillingRecord} onClick={() => setShowForm(true)}>
            + Create New Billing Record
          </button>
          <button
            style={createNewBillingRecord}
            onClick={() => setShowBulkUpload(true)}
          >
            📤 Bulk Upload
          </button>
          
         
        </div>
      </div>

      {/* MODAL - Create Billing Form */}
      {showForm && (
        <div style={modalOverlayStyle} onClick={handleChange}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center", color: "#8B00FF" }}>
              Create New Billing Record
            </h2>
            <div style={formGridStyle}>
              {Object.keys(formData).filter(field => !["affiliateLead", "nonAffiliateNumber", "number","affiliateNumber"].includes(field)).map((field) => (
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
                        name="affiliateNumber"
                        placeholder="Affiliate Number"
                        value={formData.affiliateNumber || ""}
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
                onClick={handleSubmit}
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
      {/* COPY MODAL - EXACT SAME AS EDIT BUT CREATES NEW RECORD */}
      {showCopyModal && copyingRecord && (
        <div style={modalOverlayStyle} onClick={handleCancelCopy}>
          <div 
            style={{
              ...modalContentStyle,
              width: "70%",
              maxHeight: "85vh"
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ textAlign: "center", color: "#8B00FF", marginBottom: "20px" }}>
              📋 Copy & Create New Billing Record
            </h2>
            
            <div style={{
              background: "#fffbcc",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              border: "2px solid #ffc107"
            }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
                ℹ️ <strong>Note:</strong> This will create a NEW record with the same data. You can modify any field before creating.
              </p>
            </div>

            <div style={formGridStyle}>
              {/* Country */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                Country*
                <input
                  type="text"
                  name="country"
                  value={copyingRecord.country || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.product_type || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.sales_person || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.package_name || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.client_package_status || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.payout_model || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.billing_numbers || ""}
                  onChange={handleCopyChange}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              {/* CRM Number */}
              <label style={{ display: "flex", flexDirection: "column" }}>
                CRM ID
                <input
                  type="text"
                  name="crm_number"
                  value={copyingRecord.crm_number || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.start_billing_date?.split('T')[0] || ""}
                  onChange={handleCopyChange}
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
                  value={copyingRecord.end_billing_date?.split('T')[0] || ""}
                  onChange={handleCopyChange}
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
              {copyingRecord.payout_model === "Event" && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Affiliate Lead
                  <input
                    type="number"
                    name="affiliate_lead"
                    value={copyingRecord.affiliate_lead || ""}
                    onChange={handleCopyChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #8B00FF",
                      marginTop: "5px",
                    }}
                  />
                </label>
              )}

              {copyingRecord.payout_model === "Visit" && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Non Affiliate Number
                  <input
                    type="number"
                    name="nonaffiliatenumber"
                    value={copyingRecord.nonaffiliatenumber || ""}
                    onChange={handleCopyChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #8B00FF",
                      marginTop: "5px",
                    }}
                  />
                </label>
              )}

              {(copyingRecord.payout_model === "Click" || copyingRecord.payout_model === "Install") && (
                <label style={{ display: "flex", flexDirection: "column" }}>
                  Number
                  <input
                    type="number"
                    name="number"
                    value={copyingRecord.number || ""}
                    onChange={handleCopyChange}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #8B00FF",
                      marginTop: "5px",
                    }}
                  />
                </label>
              )}
            </div>

            <div style={btnGroupStyle}>
              <button
                onClick={handleCancelCopy}
                style={{ ...btnStyle, backgroundColor: "#fa0d0dff", color: "#fff" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCopySubmit}
                style={{ ...btnStyle, backgroundColor: "#8B00FF", color: "#fff" }}
              >
                Create Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div style={dataTableContainer}>
        <DataShow 
          onEdit={handleEditRecord} 
          onCopy={handleCopy}
          username={username}
          startDate={startDate}
          endDate={endDate}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default CopsScreen;