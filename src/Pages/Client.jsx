import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, InputGroup, FormControl, Toast } from "react-bootstrap";
import { HiUsers } from "react-icons/hi2";
import { GiReceiveMoney } from "react-icons/gi";
import {setUsers,setSelectedClient,setSearchQuery,} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parse } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";


function Client() {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dashboardNav, setDashboardNav] = useState("client");
  const [show, setShow] = React.useState(false);
  const [sendModal, setSendModal] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState("");
  const [clientName, setClientName] = useState();
  const [contactNumber, setContactNumber] = useState();
  const [amount, setAmount] = useState();
  const [todayrate, setTodayRate] = useState();
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [bname, setBname] = useState("")
  const [anumber, setAnumber] = useState("")
  const [ifsc, setIfsc] = useState("")
  const [holdername, setHoldername] = useState("")
  const [holderaddress, setHolderadderss] = useState("")
  const [type, setType] = useState("")
  const [senderinfo, setSenderinfo] = useState("")
  const [clientType, setClientType] = useState("");
  const [narration,setNarration] = useState("")
  const users = useSelector((state) => state.clients.users || []);
  const employees = useSelector((state) => state.employees.employees);
  const selectedClient = useSelector((state) => state.clients.selectedClient);
  const searchQuery = useSelector((state) => state.clients.searchQuery);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameToDelete, setClientNameToDelete] = useState('');
  const [navselectedBank, setNavSelectedBank] = useState(""); // Bank selection state

  useEffect(() => {
    const Authorization = localStorage.getItem("authToken");
    if (Authorization) {
      fetch(`${API_URL}/acc_list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            console.error("Unauthorized access - redirecting to login");
            handleUnauthorizedAccess();
            return;
          }
          return response.json();
        })
        .then((data) => dispatch(setUsers(data)))
        .then((data) => console.log(data))
        .catch((error) => console.error("Fetch error:", error));
    } else {
      console.error("No authorization token found in localStorage");
    }
  }, [dispatch]);

  useEffect(() => {
    const Authorization = localStorage.getItem("authToken");
    if (Authorization) {
      fetch(`${API_URL}/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            console.error("Unauthorized access - redirecting to login");
            handleUnauthorizedAccess();
            return;
          }
          return response.json();
        })
        .then((data) => dispatch(setEmployees(data)))

        .catch((error) => console.error("Fetch error:", error));
    } else {
      console.error("No authorization token found in localStorage");
    }
  }, [dispatch]);

  const handleUnauthorizedAccess = () => {
     localStorage.clear();
     sessionStorage.clear();
    navigate("/login");
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handlemodelClose = () => setSendModal(false);
  const handlemodelShow = () => setSendModal(true);
  const handleClientClick = (client) => {
    dispatch(setSelectedClient(client));
    setSendModal(true);
  };

  const totalCount = users.length;
  const paidCount = users.filter((paid) => paid.paid_and_unpaid == true).length;
  const unpaidCount = users.filter(
    (unpaid) => unpaid.paid_and_unpaid == false
  ).length;

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handlenav = (client) => {
    dispatch(setSelectedClient(client));
    navigate("/clientinfo");
  };

  const handlenav1 = (client) => {
    dispatch(setSelectedEmployee(client));
    navigate("/employeeinfo");
  };

  const DashboardClient = () => setDashboardNav("client");
  const DashboardPaid = () => setDashboardNav("paid");
  const DashboardUnpaid = () => setDashboardNav("unpaid");



  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");


  const handleDateChange = (date) => {
    setSelectedDate(date ? format(date, "dd-MM-yyyy") : null);
  };

  
  const filteredData = useMemo(() => {
    if (!Array.isArray(users)) return [];
  
    return users.filter((row) => {
      const clientName = row.client_name?.toLowerCase().trim() || "";
      const clientContact = row.client_contact?.toLowerCase().trim() || "";
      const employeeName = row.employee_name?.toLowerCase().trim() || "";
      const accountNumbers = row.accno ? String(row.accno).toUpperCase().trim() : "";
      const clientStatus = row.status?.toLowerCase().trim() || "";
      const createdAt = row.date?.trim() || "";
      const query = searchQuery?.toLowerCase().trim() || "";
      const paidAndUnpaid = row.paid_and_unpaid;
      const queryUpper = searchQuery?.toUpperCase().trim() || "";
  
      
      const matchesQuery =
        clientName.includes(query) ||
        clientContact.includes(query) ||
        employeeName.includes(query) ||
        accountNumbers.includes(queryUpper);
  
     
      const matchesDashboardFilter =
        dashboardNav === "client" ||
        (dashboardNav === "paid" && paidAndUnpaid === 1) ||
        (dashboardNav === "unpaid" && paidAndUnpaid === 0);
  
      
      const matchesStatusFilter = selectedStatus
        ? clientStatus === selectedStatus.toLowerCase()
        : true;
  
      
      const matchesDateFilter = selectedDate
        ? createdAt === selectedDate.trim()
        : true;
  
      
      const matchesBankFilter = navselectedBank
        ? row.bank_type?.toLowerCase() === navselectedBank.toLowerCase()
        : true;
  
      return (
        matchesQuery &&
        matchesDashboardFilter &&
        matchesStatusFilter &&
        matchesDateFilter &&
        matchesBankFilter
      );
    });
  }, [users, searchQuery, dashboardNav, selectedDate, selectedStatus, navselectedBank]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDate = format(new Date(), "dd-mm-yyyy");

  
    const clientData = {
      client_name: clientName || "N/A",
      client_contact: contactNumber || "N/A",
      client_city: city || "N/A",
      amount: amount || 0,
      today_rate: todayrate || 0,
      date: currentDate || new Date().toISOString(),
      sent: false,
      message: message || "",
      paid_and_unpaid: false,
      success_and_unsuccess: false,
      bank_name: bname || "N/A",
      accno: anumber || "N/A",
      ifsc_code: ifsc || "N/A",
      accoun_type: type || "N/A",
      name_of_the_beneficiary: holdername || "N/A",
      address_of_the_beneficiary: holderaddress || "N/A",
      sender_information: senderinfo || "N/A",
      bank_type: clientType || "N/A",
      narration: narration || "N/A",
    };
     console.log(clientData)    

    fetch(`${API_URL}/acc_insertarrays`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Something went wrong!");
      })
      .then((data) => {
        console.log("Response data:", data);
        alert("New Client Created");
        setShow(false);
        resetForm();
        // Re-fetch client list to show updated data
        fetch(`${API_URL}/acc_list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("authToken"),
          },
        })
          .then((response) => response.json())
          .then((updatedData) => dispatch(setUsers(updatedData)))
          .catch((error) => console.error("Error fetching updated data:", error));

      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
 
 
  const resetForm = () => {
    setClientName("");
    setContactNumber("");
    setAmount("");
    setTodayRate("");
    setCity("");
    setMessage("");
    setBname("");
    setAnumber("");
    setIfsc("");
    setHoldername("");
    setHolderadderss("");
    setType("");
    setSenderinfo("");
  };
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      
      if (b.client_id !== a.client_id) {
        return b.client_id - a.client_id;
      }

    
      const dateA = parse(a.date, "yyyy-MM-dd HH:mm:ss", new Date());
      const dateB = parse(b.date, "yyyy-MM-dd HH:mm:ss", new Date());

      
      if (a.sent === b.sent) {
        return dateB - dateA;
      }
      return a.sent ? 1 : -1;
    });
  }, [filteredData]);

  const handleDelete = (clientId) => {
    const Authorization = localStorage.getItem("authToken");

    fetch(`${API_URL}/acc_delete/${clientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: Authorization,

      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete client");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Client deleted successfully:", data);
        setShowConfirmModal(false); // Close the modal
        setToastMessage(`Client ${clientNameToDelete} deleted successfully!`);
        setShowToast(true); // Show the success notification
        // dispatch(setUsers(updatedData));
        fetch(`${API_URL}/acc_list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("authToken"),
          },
        })
          .then((response) => response.json())
          .then((updatedData) => dispatch(setUsers(updatedData)))
          .catch((error) => console.error("Error fetching updated data:", error)); // Update the list of clients
      })
      .catch((error) => {
        console.error("Error deleting client:", error);
      });
  };

  const showConfirm = (clientId, clientName) => {
    setClientIdToDelete(clientId);
    setClientNameToDelete(clientName);
    setShowConfirmModal(true);
  };



  const handlesend = async (client_id) => {
    const sendData = {
      client_id,
      user_id: employeeId,
      sent: true,
    };

    try {
      const response = await fetch(`${API_URL}/client_IDupdated/${client_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      if (!response.ok) {
        throw new Error("Failed to update client");
      }
      const result = await response.json();
      console.log("Updated client response:", result);
      setSendModal(false);
      alert("Employee assignment successful");
      fetch(`${API_URL}/acc_list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authToken"),
        },
      })
        .then((response) => response.json())
        .then((updatedData) => dispatch(setUsers(updatedData)))
        .catch((error) => console.error("Error fetching updated data:", error));

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };


  const [selectedRows, setSelectedRows] = useState([]);
  // const handleCheckboxChange = (client) => {
  //   setSelectedRows((prevSelected) => {
  //     if (prevSelected.some((item) => item.client_id === client.client_id)) {
  //       return prevSelected.filter((item) => item.client_id !== client.client_id);
  //     } else {
  //       return [...prevSelected, client];
  //     }
  //   });
  // };
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  // const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleCheckboxChange = (client) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.some((item) => item.client_id === client.client_id)) {
        const updatedSelection = prevSelected.filter(
          (item) => item.client_id !== client.client_id
        );
        setSelectAll(updatedSelection.length === sortedData.length);
        return updatedSelection;
      } else {
        const updatedSelection = [...prevSelected, client];
        setSelectAll(updatedSelection.length === sortedData.length);
        return updatedSelection;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedData);
    }
    setSelectAll(!selectAll);
  };

  const exportToCSV = () => {
    if (selectedRows.length === 0) {
      alert("No rows selected to export.");
      return;
    }
    setShowModal(true);
  };

  const handleBankSelection = (bankType) => {
    setSelectedBank(bankType);
  };

  const confirmExport = () => {
    if (!selectedBank) {
      alert("Please select a bank before exporting.");
      return;
    }

    const csvData = selectedRows.map((client) => {
      let clientData = {
        Amount: client.amount || 0,
        "Account Number": client.accno || "Unknown Account",
      };

      if (selectedBank === "bank1") {
        clientData["Sender Information"] = client.sender_information || "N/A";
      } else if (selectedBank === "bank2") {
        clientData = {
          "IFSC Code": client.ifsc_code || "Unknown IFSC",
          "Account Type": client.accoun_type || "Unknown Type",
          "Account Number": client.accno || "Unknown Account",
          "Beneficiary Name": client.name_of_the_beneficiary || "Unknown Beneficiary",
          "Beneficiary Address": client.address_of_the_beneficiary || "Unknown Address",
          "Sender Information": client.sender_information || "Unknown Sender",
          ...clientData,
        };
      }

      return clientData;
    });

    const headers = [...new Set(csvData.flatMap((row) => Object.keys(row)))];
    const csvContent = [
      headers,
      ...csvData.map((row) => headers.map((header) => row[header] || "")),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `selected_clients_${selectedBank}_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();

    setShowModal(false);
  };

//   const [showModal, setShowModal] = useState(false); 
//   const [selectedBank, setSelectedBank] = useState("bank1"); 
//   const [selectAll, setSelectAll] = useState(false);




// const handleCheckboxChange = (client) => {
//   setSelectedRows((prevSelected) => {
//     if (prevSelected.some((item) => item.client_id === client.client_id)) {
//       const updatedSelection = prevSelected.filter((item) => item.client_id !== client.client_id);
//       setSelectAll(updatedSelection.length === sortedData.length);
//       return updatedSelection;
//     } else {
//       const updatedSelection = [...prevSelected, client];
//       setSelectAll(updatedSelection.length === sortedData.length);
//       return updatedSelection;
//     }
//   });
// };

// const handleSelectAll = () => {
//   if (selectAll) {
//     setSelectedRows([]);
//   } else {
//     setSelectedRows(sortedData);
//   }
//   setSelectAll(!selectAll);
// };
  


//   const exportToCSV = () => {
//     if (selectedRows.length === 0) {
//       alert("No rows selected to export.");
//       return;
//     }

//     setShowModal(true); 
//   };

//   const handleBankSelection = (bankType) => {
//     setSelectedBank(bankType);
//     setShowModal(false); 

//     const csvData = selectedRows.map((client, index) => {
//       let clientData = {
//         "Amount": client.amount || 0,
//         "Account Number": client.accno || "Unknown Account",
//       };

//       if (selectedBank === "bank1") {
//         clientData["Sender Information"] = client.sender_information || "N/A";
//       } else if (selectedBank === "bank2") {
//         clientData = {
          
//           "IFSC Code": client.ifsc_code || "Unknown IFSC",
//           "Account type":client.accoun_type || "Unknown Acc No",
//           "Account Number": client.accno || "Unknown Account",
//           "Beneficiary Name": client.name_of_the_beneficiary || "Unknown Beneficiary",
//           "Beneficiary Address": client.address_of_the_beneficiary || "Unknown Address",
//           "Sender Information": client.sender_information || "Unknown Sender",
//           ...clientData,
          
//         };
//       }

//       return clientData;
//     });

//     // IFCODE,ACCTYPE,ACCNO,NAMEOFBENIFIERY,ADDRESSOFBENEFICERY,SENDERINFOMRATION,AMOUNT


//     const headers = [...new Set(csvData.flatMap((row) => Object.keys(row)))];
//     const csvContent = [
//       headers,
//       ...csvData.map((row) => headers.map((header) => row[header] || "")),
//     ]
//       .map((e) => e.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `selected_clients_${selectedBank}_${format(new Date(), "dd-MM-yyyy")}.csv`;
//     link.click();
//   };

  useEffect(() => {
    sessionStorage.clear(); 
  }, []);
  
  
  return (
    <div style={{ marginTop: "50px", width: '100%' }}>
      <div className="page-header">
        <h1>Client</h1>
        <small>Client / Dash</small>
      </div>
      <div className="analytics">
        <div
          className={dashboardNav === "client" ? "cardAction" : "card"}
          onClick={DashboardClient}
        >
          <div className="card-head">
            <h2>{totalCount}</h2>{" "}
            <span className="las la-user-friends">
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>Client</small>
          </div>
        </div>

        <div
          className={dashboardNav === "paid" ? "cardAction" : "card"}
          onClick={DashboardPaid}
        >
          <div className="card-head">
            <h2>{paidCount}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>Money Paid Client</small>
          </div>
        </div>

        <div
          className={dashboardNav === "unpaid" ? "cardAction" : "card"}
          onClick={DashboardUnpaid}
        >
          <div className="card-head">
            <h2>{unpaidCount}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>Money Pending Client</small>
          </div>
        </div>
      </div>
      <div className="records table-responsive  table-responsive-md table-responsive-sm">
       
        <div className="record-header">
  <div className="d-flex ">
{/* 
  <div className="bank-buttons d-flex justify-content-start align-items-center">
  <Button
    variant="primary"
    onClick={() => setNavSelectedBank("bank1")}
    className={`w-auto h-auto ${navselectedBank === "bank1" ? "btn-active" : ""}`}
  >
    Bank 1
  </Button>
  <Button
    variant="primary"
    onClick={() => setNavSelectedBank("bank2")}
    className={`w-auto h-auto ${navselectedBank === "bank2" ? "btn-active" : ""}`}
  >
    Bank 2
  </Button>
  <Button
    variant="primary"
    onClick={() => setNavSelectedBank("")}
    style={{ marginLeft: "10px" }}
    className={`w-auto hh-auto ${navselectedBank === "" ? "btn-active" : ""}`}
  >
    All
  </Button>
</div> */}
<button
  onClick={handleSelectAll}
  style={{
    marginBottom: "10px",
    padding: "8px 15px",
    backgroundColor: selectAll ? "#dc2f2f" : "#42b883",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width:'auto'
  }}
>
  {selectAll ? "Deselect All" : "Select All"}
</button>
<div>
<Button className="w-100 " onClick={handleShow}>
      Add New
    </Button>
</div>
   
    
  </div>
  <div className="browse">
    <Button onClick={exportToCSV} className="w-auto mb-1 h-auto">
      Export to CSV
    </Button>
    <div style={{ paddingTop: "10px" }}>
      <InputGroup className="d-flex gap-2 align-items-center">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        placeholderText="Select Date"
        dateFormat="dd-MM-yyyy"
        className="form-control date-input  w-auto " // Hide this input field
        isClearable
        customInput={<button className="calendar-icon-btn"><FaRegCalendarAlt /></button>} // Calendar icon button
      />
        <FormControl
          placeholder="Name,phoneNumber,Acc_number"
          aria-label="Search"
          className="record-search "
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>
    </div>
  
    
  </div>
</div>

        <div className="table-responsive-md table-responsive-sm">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>CLIENT</th>
                <th>CITY</th>
                <th>TOTAL</th>
                <th>RATE</th>
                <th>STATUS</th>
                <th> DATE</th>
                <th> PAID AMOUNT</th>
                <th>BALANCE AMOUNT</th>
                <th>AGENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      style={{ width: "20px", height: "15px", paddingRight: '10px' }}
                      onChange={() => handleCheckboxChange(row)}
                      checked={selectedRows.some((item) => item.client_id === row.client_id)}
                    />
                    {row.client_id}
                  </td>
                  <td>
                    <div className="client">
                      {/* <div
                        className="client-img bg-img"
                        style={{
                          backgroundImage:
                            "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
                        }}
                      ></div> */}
                      <div className="client-info">
                        <h4>{row.client_name ? row.client_name.replace(/"/g, "").toUpperCase() : ""}</h4>
                        <small>{row.client_contact.toUpperCase()}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.client_city ? row.client_city.replace(/"/g, "").toUpperCase() : ""}</td>
                  <td>
                    <div className="client">
                      <div className="client-info">
                      
                      <h4  style={{color:'black',fontWeight:'500'}}>
                      INTER :  <span  >{row.amount ? row.amount : 0}{" "}</span>
                         
                         </h4>
                       {/* <h4 style={{color:'black',fontWeight:'500',color:'red'}}>INTER : -</h4> */}
                       <h4 style={{ color: 'red', fontWeight: '500' }}>
                       LOCAL : <span> {row.amount && row.today_rate ? (row.amount / row.today_rate).toFixed(3) : "-"}</span>
</h4>
                      </div>
                    </div>
                  </td>
                  <td>
                    {row.today_rate }
                  </td>
              
                  <td>
                    <p className={`badge ${row.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"}`}>
                      {row.paid_and_unpaid == 1 ? "PAID" : "UNPAID"}
                    </p>
                  </td>
                  <td>
                    {/* {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
                      <div>{row.paid_amount_date[row.paid_amount_date.length - 1].date.toUpperCase()}</div>
                    ) : (
                      <span>-</span>
                    )} */}
                    {row.date}
                  </td>
                 
                  {/* <td>
                    <div className="client">
                      <div className="client-info">
                      {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
                      <h4  style={{color:'black',fontWeight:'500',color:'blue'}}>
                         LOCAL : <span  style={{}}>{row.paid_amount_date
                          .reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
                          .toFixed(2)}{" "}</span>
                       
                      </h4>
                    ) : (
                      <h4  style={{color:'black',fontWeight:'500',color:'blue'}} >LOCAL : -</h4>
                    )}
                       <h4 style={{color:'black',fontWeight:'500',color:'red'}}>INTER : -</h4>
                      </div>
                    </div>
                  </td> */}
                  <td>
  <div className="client">
    <div className="client-info">
      {/* Local Paid Amount */}
      {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
        <h4 style={{ color: 'blue', fontWeight: '500' }}>
        INTER : <span>
            {row.paid_amount_date
              .reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
              .toFixed(2)}
          </span>
        </h4>
      ) : (
        <h4 style={{ color: 'blue', fontWeight: '500' }}> INTER : </h4>
      )}

      {/* International Paid Amount */}
      {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 && row.today_rate ? (
        <h4 style={{ color: 'red', fontWeight: '500' }}>
        LOCAL :<span>
            {(row.paid_amount_date
              .reduce((total, entry) => total + parseFloat(entry.amount || 0), 0) / row.today_rate)
              .toFixed(3)}
          </span>
        </h4>
      ) : (
        <h4 style={{ color: 'red', fontWeight: '500' }}>INTER : -</h4>
      )}
    </div>
  </div>
</td>
{/* 
                  <td>
                    <div className="client">
                      <div className="client-info">
                      {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
                      <h4   style={{color:'black',fontWeight:'500'}}>
                        LOCAL : {(
                          (row.amount ? parseFloat(row.amount) : 0) -
                          row.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
                        ).toFixed(2)}
                       
                      </h4>
                    ) : (
                      <h4   style={{color:'black',fontWeight:'500'}}>LOCAL : -</h4>
                    )}
                       <h4 style={{color:'black',fontWeight:'500'}}>INTER : -</h4>
                      </div>
                    </div>
                  </td> */}
                  <td>
  <div className="client">
    <div className="client-info">
      {/* Local Balance Amount */}
      {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
        <h4 style={{ color: 'blue', fontWeight: '500',}}>
        INTER :<span>{(
            (row.amount ? parseFloat(row.amount) : 0) -
            row.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
          ).toFixed(3)}</span> 
        </h4>
      ) : (
        <h4 style={{ color: 'black', fontWeight: '500' }}>  INTER : -</h4>
      )}

      {/* International Balance Amount */}
      {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 && row.today_rate ? (
        <h4 style={{ color: 'red', fontWeight: '500', }}>
        LOCAL : {(
            ((row.amount ? parseFloat(row.amount) : 0) -
              row.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)) /
            row.today_rate
          ).toFixed(3)}
        </h4>
      ) : (
        <h4 style={{ color: 'red', fontWeight: '500' }}> LOCAL : -</h4>
      )}
    </div>
  </div>
</td>

                  <td>
                    {employees.length > 0 && row.user_id ? (
                      employees.some((eid) => eid.user_id === row.user_id) ? (
                        employees
                          .filter((eid) => eid.user_id === row.user_id)
                          .map((eid, idx) => (
                            <span key={idx} onClick={() => handlenav1(eid)}>
                              {eid.username.toUpperCase()}
                            </span>
                          ))
                      ) : (
                        <span>NO AGENT ASSIGNED</span>
                      )
                    ) : (
                      <span style={{textAlign:'center'}}>------</span>
                    )}
                  </td>
                  <td>
                    <div className="actions d-flex justify-content-start align-items-center pt-3 gap-1">
                      {row.sent == false ? (
                        <span
                          className=""
                          style={{
                            cursor: "pointer",
                            fontSize: "11px",
                            backgroundColor: "#00bbf0",
                            padding: "3px 5px 3px 5px",
                            color: "white",
                            borderRadius:"4px",
                          }}
                          onClick={() => handleClientClick(row)}
                        >
                          SEND
                        </span>
                      ) : (
                        <span></span>
                      )}
                      <span
                        className=""
                        style={{
                          cursor: "pointer",
                          fontSize: "11px",
                          backgroundColor: "#42b883",
                          padding: "3px 5px 3px 5px",
                          color: "white",
                          borderRadius:"4px",
                        }}
                        onClick={() => handlenav(row)}
                      >
                        VIEW
                      </span>
                      <span
                        style={{
                          cursor: "pointer",
                          fontSize: "11px",
                          backgroundColor: "#dc2f2f",
                          padding: "3px 5px 3px 5px",
                          color: "white",
                          borderRadius:"4px",
                        }}
                        onClick={() => showConfirm(row.client_id, row.client_name)}
                      >
                        DELETE
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal show={sendModal} onHide={() => setSendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient ? (
            <form>
              <div className="txt_field">
                <h4>Client Name</h4>
                <input
                  type="text"
                  value={
                    selectedClient.client_name
                      ? selectedClient.client_name.replace(/"/g, "")
                      : ""
                  }
                  readOnly
                />
              </div>
              <div className="txt_field">
                <h4>Client Contact Number</h4>
                <input
                  type="text"
                  value={
                    selectedClient.client_contact
                      ? selectedClient.client_contact.replace(/"/g, "")
                      : ""
                  }
                  readOnly
                />
              </div>
              <div>
                <h4>Assign Employee</h4>
               
                <select
  value={employeeId}
  onChange={(e) => setEmployeeId(e.target.value)}
  style={{ padding: "0px", border: "none" }}
>
  
  <option value="" disabled>
    Select Employee
  </option>

 
  {employees
    .filter((emp) => emp.role === "Collection Agent")
    .map((emp) => (
      <option key={emp.user_id} value={emp.user_id} style={{ fontSize: "15px" }}>
        {emp.username}
      </option>
    ))}
</select>

              </div>
            </form>
          ) : (
            <p>No client selected</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSendModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => handlesend(selectedClient.client_id)}
          >
            Assign
          </Button>
        </Modal.Footer>
      </Modal>

      
      <Modal show={show} onHide={handleClose} dialogClassName="custom-modal">
        <div className="dio" style={{ width: '70vw' }}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Client</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit} className="custom-form">
              <div className="row d-flex  gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12 ">
                <div className=" txt_field col-xxl-5 col-xl-5  col-lg-5 col-md-10  col-sm-10  ">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                  <label>Client Name</label>
                </div>
                <div className=" txt_field  col-xxl-5 col-xl-5  col-md-10  col-lg-5 col-sm-10">
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                  <label>Client Contact Number</label>
                </div>
              </div>
              <div className="row d-flex  gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12 ">
                <div className="txt_field col-xxl-5 col-xl-5  col-lg-5 col-md-10  col-sm-10 ">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <label>City</label>
                </div>
                <div className="txt_field col-xxl-5 col-xl-5  col-lg-5 col-md-10  col-sm-10 ">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <label>Amount</label>
                </div>
              </div>


             
    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="number"
          value={todayrate}
          onChange={(e) => setTodayRate(e.target.value)}
          required
        />
        <label>Today Rate</label>
      </div>
      </div>
              
              {/* <div className="row d-flex  gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12 ">
                <div className="row col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12">
                  <label className="form-label">Client Account Type</label>
                  <select
                    className="form-select"
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                  >
                    <option value="bank1">Bank 1</option>
                    <option value="bank2">Bank 2</option>
                  </select>
                </div>
              </div> */}
{/* 
  <div className="col-xxl-12 col-xl-12 col-md-12 col-12">
    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={bname}
          onChange={(e) => setBname(e.target.value)}
          required
        />
        <label>Bank Name</label>
      </div>
    </div>

    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={anumber}
          onChange={(e) => setAnumber(e.target.value)}
          required
        />
        <label>Account Number</label>
      </div>

      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
          required
        />
        <label>IFSC Code</label>
      </div>
    </div>

    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={holdername}
          onChange={(e) => setHoldername(e.target.value)}
          required
        />
        <label>Name of the Beneficiary</label>
      </div>

      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={holderaddress}
          onChange={(e) => setHolderadderss(e.target.value)}
          required
        />
        <label>Address of the Beneficiary</label>
      </div>
    </div>

    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <label>Account Type</label>
      </div>
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={senderinfo}
          onChange={(e) => setSenderinfo(e.target.value)}
          required
        />
        <label>Sender Information</label>
      </div>
    </div>
  </div> */}

  {/* <div className="col-xxl-12 col-xl-12 col-md-12 col-12">
    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={anumber}
          onChange={(e) => setAnumber(e.target.value)}
          required
        />
        <label>Account Number</label>
      </div>

      <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
        <input
          type="text"
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          required
        />
        <label>NARRATION</label>
      </div>
    </div>
  </div> */}


              <Modal.Footer className=" w-100 justify-content-center">
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </div>
      </Modal>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the client "<span className="fw-bold">{clientNameToDelete}</span>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (clientIdToDelete) {
                handleDelete(clientIdToDelete);
              }
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Toast
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          backgroundColor: "green",
          color: "white",
        }}
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
      >
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Bank</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button
            variant="primary"
            onClick={() => handleBankSelection("bank1")}
            className="mr-2"
          >
            Bank1
          </Button>
          <Button
            variant="primary"
            onClick={() => handleBankSelection("bank2")}
          >
            Bank2
          </Button>
        </Modal.Body>
      </Modal> */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Bank</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button
            variant={selectedBank === "bank1" ? "primary" : "secondary"}
            onClick={() => handleBankSelection("bank1")}
            className="mr-2"
          >
            Bank1
          </Button>
          <Button
            variant={selectedBank === "bank2" ? "primary" : "secondary"}
            onClick={() => handleBankSelection("bank2")}
          >
            Bank2
          </Button>
        </Modal.Body>
        <Modal.Footer  className="d-flex justify-content-center align-items-center">
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmExport}>
            Confirm & Export
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Client;
