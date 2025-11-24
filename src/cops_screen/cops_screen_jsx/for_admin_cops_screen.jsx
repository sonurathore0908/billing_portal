import { useState, useEffect, useRef } from "react";
const Config={'counts_ap':"https://biiling_portal.mfilterit.net/cops_counts",
    "show_data":"https://biiling_portal.mfilterit.net/cops_data_show",
    "create_bill":"https://biiling_portal.mfilterit.net/insert_cops_bill"}
// ========== DATA TABLE COMPONENT ==========
const DataShow = ({ onEdit }) => {
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
  
  // Column definitions
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
    { key: "cost", label: "Cost" },
    { key: "slab1", label: "Slab 1" },
    { key: "slab2", label: "Slab 2" },
    { key: "slab3", label: "Slab 3" },
    { key: "affiliate_lead", label: "Affiliate Lead" },
    { key: "bu_email", label: "BU Email" },
    { key: "user_email", label: "User Email" },
    { key: "billing_date", label: "Billing Date" }
  ];
  
  // Handle Edit Action
  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    }
  };
  
  // Handle Delete Action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.billing_id !== id));
      alert("Record deleted successfully!");
    }
  };
  
  // Handle View Action
  const handleView = (item) => {
    const details = `
      Billing ID: ${item.billing_id}
      Status: ${item.billing_status}
      Country: ${item.country}
      Product: ${item.product_type}
      Customer OPS: ${item.customer_ops_user}
      Package: ${item.package_name}
      Cost: ${item.cost}
    `;
    alert(details);
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
        const response = await fetch(Config.show_data, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "sonu.rathore@mfilterit.com" // Changed to "username"
          }),
        });

        const result = await response.json();
        console.log("API Response:_1", result);
        
        // Check if result has error or is array
        if (result.error) {
          console.error("API Error:", result.error);
          setRecords([]);
        } else if (Array.isArray(result)) {
          setRecords(result);
        } else {
          // If single object, convert to array
          setRecords([result]);
        }
        setLoading(false);
      } catch (err) {
        console.error("API error:", err);
        setRecords([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort records
  const sortedRecords = [...records].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    // Handle null values
    if (valA === null) return 1;
    if (valB === null) return -1;
    
    // Convert to lowercase for strings
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Filter records based on search - FIXED
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
      (item.user_email && item.user_email.toLowerCase().includes(searchLower))
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
    maxHeight: "400px",
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
          placeholder="Search by ID, Status, Country, Product, User..."
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
                      label="Edit"
                      color="black"
                      onClick={() => handleEdit(item)}
                    />
                    <ActionButton
                      label="Delete"
                      color="red"
                      onClick={() => handleDelete(item.billing_id)}
                    />
                    <ActionButton
                      label="View"
                      color="green"
                      onClick={() => handleView(item)}
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
const CopsScreen = ({user_name}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(Config.counts_ap, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "sonu.rathore@mfilterit.com" }),
        });

        const result = await response.json();
        console.log("count api result:",result)
        setData(result);
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    fetchData();
  }, []);  // <<< Only one time when dashboard loads
 
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
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
    billingDate:"",
    cost:"",
    slab1:"",
    slab2:"",
    slab3:"",
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

  // Handle month selection
  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartMonth(value);
    console.log("Selected Month:", value);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form data
  const handleSubmit = async () => {
    try {
      const payload = {
        email_id: formData.userMail,       // user email (login user)
        country: formData.country,
        product_type: formData.productType,
        sales_person: formData.salesPerson,
        packages_name: formData.packageName,
        client_package_status: formData.clientStatus,
        payout_model: formData.payoutModel,
        billing_number: formData.billingNumbers,
        cost: formData.cost,
        slab1: formData.slab1,
        slab2: formData.slab2,
        slab3: formData.slab3,
        billing_date:formData.billingDate,
        affiliate_lead: formData.affiliateLead || 0  // default 0
      };

      const res = await fetch(Config.create_bill, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log("API Response:", responseData);

      if (responseData.status === "success") {
        alert("✅ Bill Inserted Successfully!");
      } else {
        alert("⚠️ " + responseData.message);
      }

      // Reset form
      setShowForm(false);
      setFormData({
        country: "",
        productType: "",
        salesPerson: "",
        packageName: "",
        clientStatus: "",
        payoutModel: "",
        billingNumbers: "",
        cost: "",
        slab1: "",
        slab2: "",
        slab3: "",
        affiliateLead: "",
        billingDate:""
      });

    } catch (err) {
      console.error("Error:", err);
      alert("❌ Something went wrong!");
    }
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
          const response = await fetch('https://biiling_portal.mfilterit.net/insert_cops_bill', {
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
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecord),
      });

      const responseData = await res.json();
      console.log("Edit API Response:", responseData);

      alert("✅ Record Updated Successfully!");
      setShowEditModal(false);
      setEditingRecord(null);
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Something went wrong!");
    }
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
        {/* Box 1: Total Active Records */}
        <div style={boxStyle}>
          <h3 style={{ fontSize: "18px", margin: "0 0 5px", color: "#333" }}>
            Total Active Records
          </h3>
          <p style={textStyle}>{data?.totalRecords || 0}</p>
        </div>

        {/* Box 2: Total Billing Numbers */}
        <div style={boxStyle}>
          <h3 style={{ fontSize: "18px", margin: "0 0 5px", color: "#333" }}>
            Total Billing Numbers
          </h3>
          <p style={textStyle}>{data?.totalBillingNumbers || 0}</p>
        </div>

        {/* Box 3: Processed Bill */}
        <div style={boxStyle}>
          <h3 style={{ fontSize: "18px", margin: "0 0 5px", color: "#d12222ff" }}>
            Processed Bill
          </h3>
          <p style={textStyle}>{data?.processedBill || 0}</p>
        </div>

        {/* Box 4: Month Selector */}
        <div style={boxStyle}>
          <h3 style={{ fontSize: "18px", margin: "0 0 10px", fontWeight: "600", color: "#333" }}>
            Select Month
          </h3>
          <select
            value={startMonth}
            onChange={handleStartChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #8B00FF",
              backgroundColor: "#fff",
              fontSize: "14px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">-- Select Month --</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
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
        <div style={modalOverlayStyle} onClick={handleCancel}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center", color: "#8B00FF" }}>
              Create New Billing Record
            </h2>
            <div style={formGridStyle}>
              {Object.keys(formData).map((field) => (
                <label key={field} style={{ display: "flex", flexDirection: "column" }}>
                  {field.replace(/([A-Z])/g, " $1").trim()}*
                  {field !== "payoutModel" ? (
                  <input
                    type={
                      field === "billingDate"
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
                      <option value="Impression">Impression</option>
                      <option value="Media Spend">Media Spend</option>
                      <option value="Install">Install</option>
                      <option value="Others">Others</option>
                    </select>

                    {/* Show Affiliate Leads input ONLY if payoutModel = Event */}
                    {formData.payoutModel === "Event" && (
                      <input
                        type="number"
                        name="affiliateLeads"
                        placeholder="Affiliate Leads"
                        value={formData.affiliateLeads || ""}
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
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center", color: "#8B00FF", marginBottom: "20px" }}>
              ✏️ Edit Record
            </h2>
            
            <div style={formGridStyle}>
              <label style={{ display: "flex", flexDirection: "column" }}>
                ID
                <input
                  type="text"
                  value={editingRecord.id}
                  disabled
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                    backgroundColor: "#f0f0f0",
                    cursor: "not-allowed",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column" }}>
                Name*
                <input
                  type="text"
                  name="name"
                  value={editingRecord.name}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column" }}>
                Email*
                <input
                  type="email"
                  name="email"
                  value={editingRecord.email}
                  onChange={handleEditChange}
                  required
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column" }}>
                City*
                <input
                  type="text"
                  name="city"
                  value={editingRecord.address?.city || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingRecord((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: value }
                    }));
                  }}
                  required
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #8B00FF",
                    marginTop: "5px",
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
        <DataShow onEdit={handleEditRecord} />
      </div>
    </div>
  );
};

export default CopsScreen;