import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, InputGroup, FormControl, Toast } from "react-bootstrap";
import { HiUsers } from "react-icons/hi2";
import { GiReceiveMoney } from "react-icons/gi";
import { setUsers, setSelectedClient, setSearchQuery, } from "../Slicers/clientSlice";
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
  const [distributor, setDistributor] = useState(null);
  const [type, setType] = useState("")
  const [senderinfo, setSenderinfo] = useState("")
  const [clientType, setClientType] = useState("");
  const [narration, setNarration] = useState("")
  const users = useSelector((state) => state.clients.users || []);
  const employees = useSelector((state) => state.employees.employees);
  const selectedClient = useSelector((state) => state.clients.selectedClient);
  const searchQuery = useSelector((state) => state.clients.searchQuery);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameToDelete, setClientNameToDelete] = useState('');
  const [navselectedBank, setNavSelectedBank] = useState("");
  const [distributorId, setDistributorId] = useState();
  const [selectAmount, setSelectAmount] = useState()
  const AddNewClientDate = format(new Date(), "dd-MM-yyyy");
  const [showBankModal, setShowBankModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [sentAgent, setSentAgent] = useState(false)
  const [allClient, setAllClient] = useState(false)
  const [showNewDistributorModal,setShowNewDistributorModal] = useState(false)
  const currentDate = format(new Date(), "dd-MM-yyyy");
  const [distributorname,setDistributorname] = useState("")
  const [distributorcontact,setDistributorcontact] = useState()
  const [todayRate,setTodayrate] = useState()
  const [showupdateamountModal,setShowupdateamountModal] = useState(false)
  const [amountSet,setAmountSet] = useState()
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
  const handlemodelClose = () => {
    setShowupdateamountModal(false), 
    setShow(true) ;
  }
  const handlemodelShow = () => {
                             setShowupdateamountModal(true),
                             setShow(false)
                            }
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


   const [amounts, setAmounts] = useState(() =>
      employees.reduce((acc, emp) => ({ ...acc, [emp.user_id]: "" }), {})
    );

  const handlenav1 = (client) => {
    dispatch(setSelectedEmployee(client));
    navigate("/employee/employeeinfo");
  };

  const DashboardClient = () => setDashboardNav("client");
  const DashboardPaid = () => setDashboardNav("paid");
  const DashboardUnpaid = () => setDashboardNav("unpaid");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");


  const handleDateChange = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };




  const filteredData = useMemo(() => {
    if (!Array.isArray(users)) return [];

    const today = format(new Date(), "dd-MM-yyyy"); // Format today's date

    return users.filter((row) => {
      const clientName = row.client_name?.toLowerCase().trim() || "";
      const clientContact = row.client_contact || "";
      const employeeName = row.employee_name?.toLowerCase().trim() || "";
      const accountNumbers = row.accno ? String(row.accno).toUpperCase().trim() : "";
      const clientStatus = row.status?.toLowerCase().trim() || "";
      const createdAt = row.date?.trim() || "";
      const query = searchQuery?.toLowerCase().trim() || "";
      const queryUpper = searchQuery?.toUpperCase().trim() || "";
      const paidAndUnpaid = row.paid_and_unpaid;
      const isQueryDate = /^\d{2}-\d{2}-\d{4}$/.test(searchQuery);


      const matchesQuery = !searchQuery
        ? true
        : isQueryDate
          ? createdAt === searchQuery
          : clientName.includes(query) ||
          clientContact.includes(query) ||
          employeeName.includes(query) ||
          accountNumbers.includes(queryUpper);


      const matchesDashboardFilter =
        dashboardNav === "client" ||
        (dashboardNav === "paid" && paidAndUnpaid === 1) ||
        (dashboardNav === "unpaid" && paidAndUnpaid === 0) ||
        !dashboardNav;


      const matchesStatusFilter = selectedStatus
        ? clientStatus === selectedStatus.toLowerCase()
        : true;


      const matchesDateFilter =
        selectedDate instanceof Date && !isNaN(selectedDate.getTime())
          ? createdAt === format(selectedDate, "dd-MM-yyyy")
          : true;


      const matchesBankFilter = navselectedBank
        ? row.bank_type?.toLowerCase() === navselectedBank.toLowerCase()
        : true;

      return (matchesQuery && matchesDashboardFilter && matchesStatusFilter && matchesDateFilter && matchesBankFilter);
    });
  }, [users, searchQuery, dashboardNav, selectedDate, selectedStatus, navselectedBank]);


   


  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 50);
  };



  const totalLocalPaid = useMemo(() => {
    return filteredData.reduce((total, client) => {
      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );
      const clientRate = parseFloat(client.today_rate) || 1;
      return total + (clientRate > 0 ? totalPaidForClient / clientRate : 0);
    }, 0);
  }, [filteredData]);


  const totalLocalCurrency = useMemo(() => {
    return filteredData.reduce((total, client) => {
      const clientAmount = parseFloat(client.amount) || 0;
      const clientRate = parseFloat(client.today_rate) || 1;
      return total + (clientRate > 0 ? clientAmount / clientRate : 0);
    }, 0);
  }, [filteredData]);


  const totalLocalBalance = useMemo(() => {
    return filteredData.reduce((total, client) => {
      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );
      const clientBalance = (parseFloat(client.amount) || 0) - totalPaidForClient;
      const clientRate = parseFloat(client.today_rate) || 1;

      return total + (clientRate > 0 ? clientBalance / clientRate : 0);
    }, 0);
  }, [filteredData]);


  const totalLocalTodayAmount = useMemo(() => {
    return users.reduce((total, client) => {
      if (client.date === currentDate) {
        const clientAmount = parseFloat(client.amount) || 0;
        const clientRate = parseFloat(client.today_rate) || 1;
        return total + (clientRate > 0 ? clientAmount / clientRate : 0);
      }
      return total;
    }, 0);
  }, [filteredData, currentDate]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDate = format(new Date(), "dd-MM-yyyy");

    const clientData = {
      client_name: (clientName || "UNKNOWN").toUpperCase(),
      client_contact: (contactNumber || "UNKNOWN").toUpperCase(),
      client_city: (city || "UNKNOWN").toUpperCase(),
      amount: amount || 0,
      today_rate: todayrate || 0,
      date: currentDate || new Date().toISOString(),
      sent: false,
      message: (message || "").toUpperCase(),
      paid_and_unpaid: false,
      success_and_unsuccess: false,
      bank_name: (bname || "").toUpperCase(),
      accno: (anumber || "").toUpperCase(),
      ifsc_code: (ifsc || "").toUpperCase(),
      accoun_type: (type || "10").toUpperCase(),
      Distributor_id: distributorId || null,
      name_of_the_beneficiary: (holdername || "").toUpperCase(),
      address_of_the_beneficiary: (holderaddress || "CHENNAI").toUpperCase(),
      sender_information: (senderinfo || "STOCK").toUpperCase(),
      bank_type: (clientType || "").toUpperCase(),
      narration: (narration || "STOCK").toUpperCase(),
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

        resetForm();

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
        setShowConfirmModal(false);
        setToastMessage(`Client ${clientNameToDelete} deleted successfully!`);
        setShowToast(true);

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
        console.error("Error deleting client:", error);
      });
  };

  const showConfirm = (clientId, clientName) => {
    setClientIdToDelete(clientId);
    setClientNameToDelete(clientName);
    setShowConfirmModal(true);
  };
  const handlesend = async (client_id) => {
    const currentDate = format(new Date(), "dd-MM-yyyy");
    const sendData = { client_id, user_id: employeeId, sent: true, assigned_date: currentDate, };
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
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectAll, setSelectAll] = useState(false);


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
        console.log(selectedClient)
        return updatedSelection;
      } else {
        const updatedSelection = [...prevSelected, client];
        console.log(selectedClient)
        setSelectAll(updatedSelection.length === sortedData.length);
        console.log(selectedClient)
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
    console.log(selectedClient)
  };

  const handleBankSelection = (bankType) => {
    setSelectedBank(bankType);
  };



  const confirmExport = () => {
    if (!selectedBank) {
      alert("Please select a bank before exporting.");
      return;
    }


    const filteredRows = selectedRows.filter(client => client.accno && client.ifsc_code);

    if (filteredRows.length !== selectedRows.length) {
      alert("Some clients have missing account numbers or IFSC codes. Please check before exporting.");
      return;
    }

    if (filteredRows.length === 0) {
      alert("No valid clients to export. Please check account numbers and IFSC codes.");
      return;
    }

    const csvData = filteredRows.map((client) => {
      let clientData = {
        "ACCOUNT NUMBER": `${client.accno}`,
        "AMOUNT": `${client.amount.toFixed(2)}`,
      };

      if (selectedBank === "bank1") {
        clientData["NARRATION"] = `${client.narration || ""}`;
      } else if (selectedBank === "bank2") {
        clientData = {
          "IFSC CODE": `${client.ifsc_code}`,
          "ACCOUNT TYPE": `${client.accoun_type || ""}`,
          "ACCOUNT NUMBER": `${client.accno}`,
          "BENEFICIARY NAME": `${client.name_of_the_beneficiary?.toUpperCase() || "UNKNOWN BENEFICIARY NAME"}`,
          "BENEFICIARY ADDRESS": `${client.address_of_the_beneficiary?.toUpperCase() || "UNKNOWN BENEFICIARY ADDRESS"}`,
          "SENDER INFORMATION": `${client.sender_information?.toUpperCase() || "UNKNOWN SENDER INFORMATION"}`,
          ...clientData,
        };
      }

      return clientData;
    });

    const headers = [...new Set(csvData.flatMap((row) => Object.keys(row)))];
    const csvContent = [headers, ...csvData.map((row) => headers.map((header) => row[header] || "")),]
      .map((e) => e.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `selected_clients_${selectedBank}_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
    setShowModal(false);
  };



  useEffect(() => {
    sessionStorage.clear();
  }, []);


  // const handleDistributorChange = (e) => {
  //   const selectedId = e.target.value;
  //   setDistributorId(selectedId);
  //   const selectedDistributor = employees.find(emp => emp.user_id === parseInt(selectedId));
  //   if (selectedDistributor) {
  //     setTodayRate(parseFloat(selectedDistributor.Distributor_today_rate) || 0);
  //   } else {
  //     setTodayRate("");
  //   }
  // };


  const handleAmountChange = (userId, value) => {
    setAmounts((prev) => ({ ...prev, [userId]: value }));
  };




  const handleAssignsend = async () => {
    const currentDate = format(new Date(), "dd-MM-yyyy");

    const sendData = selectedRows.map((client) => ({
      client_id: client.client_id,
      user_id: employeeId,
      assigned_date: currentDate,
      sent: true
    }));

    try {
      const response = await fetch(`${API_URL}/client_IDupdateds`, {
        method: "POST",
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


  const clientsWithMissingDetails = Array.isArray(selectedRows)
  ? selectedRows.filter(client => !client.accno || !client.ifsc_code)
  : [];



  // const handleDistributorSubmit = async (event) => {
  //   event.preventDefault();
  
  //   const Authorization = localStorage.getItem("authToken");
  //   const currentDate = format(new Date(), "dd-MM-yyyy");
  
  //   if (!Authorization) {
  //     console.error("Authorization token is missing");
  //     return;
  //   }
  
  //   try {
  //     const distributorData = new FormData();
  //     distributorData.append("username", distributorname);
  //     distributorData.append("phone_number", distributorcontact);
  //     distributorData.append("role", "Distributor"); 
  //     distributorData.append("today_rate_date", currentDate);
  //     distributorData.append("Distributor_today_rate", todayRate);
  
  //     const signupResponse = await fetch(
  //       `${API_URL}/distrbutorCreated`,
  //       {
  //         method: "POST",
  //         body: distributorData,
  //         headers: {
  //           Authorization: Authorization,
  //         },
  //       }
  //     );
  
  //     if (!signupResponse.ok) {
  //       throw new Error("Something went wrong while adding the distributor!");
  //     }
  
  //     const data = await signupResponse.json();
  //     alert("New Distributor successfully created!"); 
  //       setDistributorname("")
  //       setDistributorcontact("")
  //       setTodayrate("")
  //     setShow(true);
  //     setShowNewDistributorModal(!showNewDistributorModal)
       
  //   //  const Authorization  = localStorage.getItem("authToken");
  //    if (Authorization) {
  //      fetch(`${API_URL}/list`, {
  //        method: "GET",
  //        headers: {
  //          "Content-Type": "application/json",
  //          Authorization: Authorization,
  //        },
  //      })
  //        .then((response) => {
  //          if (response.status === 401) {
  //            console.error("Unauthorized access - redirecting to login");
  //            handleUnauthorizedAccess();
  //            return;
  //          }
  //          return response.json();
  //        })
  //        .then((data) => dispatch(setEmployees(data)))
  //        .catch((error) => console.error("Fetch error:", error));
  //    } else {
  //      console.error("No authorization token found in localStorage");
  //    }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };



   const fetchEmployees = async () => {
      setLoading(true);
      const Authorization = localStorage.getItem("authToken");
  
  
      if (Authorization) {
        try {
          const response = await fetch(`${API_URL}/list`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: Authorization,
            },
  
          });
  
          if (response.status === 401) {
            console.error("Unauthorized access - redirecting to login");
            handleUnauthorizedAccess();
            return;
          }
          const data = await response.json();
  
          dispatch(setEmployees(data));
        } catch (error) {
          console.error("Fetch error:", error);
  
        } finally {
          setLoading(false);
        }
      } else {
        console.error("No authorization token found in localStorage");
        setLoading(false);
      }
    };
    
  const handleSubmitUpdate2 = async () => {
 

    const data = employees
      .filter((emp) => emp.role === "Distributor" && emp.user_id)
      .map((emp) => ({
        user_id: emp.user_id,
        today_rate_date: amounts[emp.user_id] // Check if amount is changed
          ? currentDate
          : emp.today_rate_date, // Retain previous date if no change
        Distributor_today_rate: parseFloat(amounts[emp.user_id]) || emp.Distributor_today_rate,
      }));
  
    console.log("Sending data:", data);
  
    try {
      const response = await fetch(`${API_URL}/update-distributor-amounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      alert("Rates updated successfully!");
      setAmount("");
      handlemodelClose();
      fetchEmployees();

    } catch (error) {
      console.error("Error updating rates:", error);
      alert("An error occurred.");
    }
  };




  const handleDistributorSubmit = async (event) => {
    event.preventDefault();
  
    // Check for empty distributorname or distributorcontact
    if (!distributorname.trim() || !distributorcontact.trim()) {
      alert("Please fill in all required fields (Name and Contact).");
      return; // Stop the function if fields are empty
    }
  
    const Authorization = localStorage.getItem("authToken");
    const currentDate = format(new Date(), "dd-MM-yyyy");
  
    if (!Authorization) {
      console.error("Authorization token is missing");
      return;
    }
  
    try {
      const distributorData = new FormData();
      distributorData.append("username", distributorname);
      distributorData.append("phone_number", distributorcontact);
      distributorData.append("role", "Distributor"); 
      distributorData.append("today_rate_date", currentDate);
      distributorData.append("Distributor_today_rate", todayRate);
  
      const signupResponse = await fetch(
        `${API_URL}/distrbutorCreated`,
        {
          method: "POST",
          body: distributorData,
          headers: {
            Authorization: Authorization,
          },
        }
      );
  
      if (!signupResponse.ok) {
        throw new Error("Something went wrong while adding the distributor!");
      }
  
      const data = await signupResponse.json();
      alert("New Distributor successfully created!"); 
      setDistributorname("");
      setDistributorcontact("");
      setTodayrate("");
      setShow(true);
      setShowNewDistributorModal(!showNewDistributorModal);
  
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
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const handleDistributorChange = (e) => {
    const selectedId = e.target.value;
    setDistributorId(selectedId);
  
    const selectedDistributor = employees.find(emp => emp.user_id === parseInt(selectedId));
    
    const currentDate = format(new Date(), "dd-MM-yyyy");
  
    if (selectedDistributor) {
      if (selectedDistributor.today_rate_date === currentDate) {
        setTodayRate(parseFloat(selectedDistributor.Distributor_today_rate) || 0);
      } else {
        setTodayRate(0); // Not today's rate, so empty
      }
    } else {
      setTodayRate(0);
    }
  };
  

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
            <small>CLIENT</small>
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
            <small> PAID CLIENT</small>
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
            <small>PENDING CLIENT</small>
          </div>
        </div>


        <div className="cardAction  bg-warning Cardyellow">
          <div className="card-head">
            <h2>{totalLocalCurrency.toFixed(3)}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small> TOTAL AMOUNT</small>
          </div>
        </div>

        <div className="cardAction  cardgreen  bg-success" >
          <div className="card-head">
            <h2>{totalLocalPaid.toFixed(3)}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>TOTAL PAID AMOUNT</small>
          </div>
        </div>


        <div className="cardAction bg-danger cardred" >
          <div className="card-head">
            <h2>{totalLocalBalance.toFixed(3)}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>BALANCE PAID AMOUNT</small>
          </div>
        </div>


        <div className="cardAction  cardgreen  bg-primary" >
          <div className="card-head">
            <h2>{totalLocalTodayAmount.toFixed(3)}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>TODAY ORDER CLIENT</small>
          </div>
        </div>


      </div>
      <div className="">
        <div className="record-header d-flex justify-content-between align-items-center flex-wrap gap-1 py-2 px-1">
          <div className="d-flex align-items-center gap-2 ">
            <button
              onClick={handleSelectAll}
              className={`btn ${selectAll ? "btn-danger" : "btn-success"} btn-sm`}
              style={{ minWidth: "100px" }}
            >
              {selectAll ? "Deselect All" : "Select All"}
            </button>


            <Button className="btn btn-primary btn-sm" style={{ minWidth: "80px" }} onClick={handleShow}>
              Add New
            </Button>

            <Button className="btn btn-primary position-relative text-nowrap" style={{ minWidth: "80px" }} onClick={() => setAllClient(true)} >
              Assign{selectedRows.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {selectedRows.length}
                </span>
              )}
            </Button>


          </div>


          <div className="d-flex align-items-center gap-2 ">

            <Button
              onClick={exportToCSV}
              className="btn btn-primary position-relative text-nowrap"
              style={{ minWidth: "120px" }} >
              Export to CSV
              {selectedRows.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {selectedRows.length}
                </span>
              )}
            </Button>


            <InputGroup className="d-flex gap-2 flex-wrap align-items-center">
              <DatePicker
                selected={selectedDate || null}
                onChange={handleDateChange}
                placeholderText="Select Date"
                dateFormat="dd-MM-yyyy"
                className="form-control date-input w-auto"
                isClearable
                customInput={<button style={{ zIndex: '999' }} className="calendar-icon-btn"><FaRegCalendarAlt /></button>}
              />
              <FormControl
                placeholder="Name, phone number, Acc_number"
                aria-label="Search"
                className="record-search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </div>
        </div>


        <div className="table-responsive-md table-responsive-sm">
          <table className="table table-striped">
            <thead>
              <tr>
                <th># </th>
                <th>CLIENT</th>
                <th>Distributor Name</th>
                <th>TOTAL</th>
                <th>RATE</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>PAID AMOUNT</th>
                <th>BALANCE AMOUNT</th>
                <th>AGENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {
                sortedData.length > 0 ? (
                  sortedData.slice(0, visibleCount).map((row, index) => (
                    <tr 
  key={index}
  className={row.date === currentDate ? "table-success" : ""}
>
                      <td>
                        <input
                          type="checkbox"
                          style={{ width: "20px", height: "15px", paddingRight: "10px" }}
                          onChange={() => handleCheckboxChange(row)}
                          checked={selectedRows.some((item) => item.client_id === row.client_id)}
                        />
                        {index + 1}
                      </td>
                      <td>
                        <div className="client">
                          <div className="client-info">
                            <h4>{row.client_name ? row.client_name.replace(/"/g, "").toUpperCase() : ""}</h4>
                            <small>{row.client_contact}</small>
                          </div>
                        </div>
                      </td>
                      {/* <td>{row.client_city ? row.client_city.replace(/"/g, "").toUpperCase() : "---"}</td> */}

                      <td>
                        {employees.length > 0 && row.Distributor_id ? (
                          employees.some((eid) => eid.user_id === row.Distributor_id) ? (
                            employees
                              .filter((eid) => eid.user_id === row.Distributor_id)
                              .map((eid, idx) => (
                                <span key={idx} onClick={() => handlenav1(eid)}>
                                  {eid.username.toUpperCase()}
                                </span>
                              ))
                          ) : (
                            <span>------</span>
                          )
                        ) : (
                          <span style={{ textAlign: "center" }}>------</span>
                        )}
                      </td>

                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER: <span>{row.amount ? parseFloat(row.amount).toFixed(2) : "0.00"}</span>
                          </h4>
                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {row.amount && row.today_rate
                                ? (parseFloat(row.amount) / parseFloat(row.today_rate)).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td>
                      <td>{row.today_rate ? parseFloat(row.today_rate).toFixed(2) : "---"}</td>
                      
                      <td>
                        <p className={`badge ${row.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"}`}>
                          {row.paid_and_unpaid == 1 ? "PAID" : "UNPAID"}
                        </p>
                      </td>
                      <td>{row.date || "---"}</td>
                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER:{" "}
                            <span>
                              {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0
                                ? (
                                  Math.round(
                                    row.paid_amount_date.reduce(
                                      (total, entry) => total + parseFloat(entry.amount || 0),
                                      0
                                    )
                                  )
                                ).toFixed(2)
                                : "0.00"}
                            </span>
                          </h4>

                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {Array.isArray(row.paid_amount_date) &&
                                row.paid_amount_date.length > 0 &&
                                row.today_rate
                                ? (
                                  row.paid_amount_date.reduce(
                                    (total, entry) => total + parseFloat(entry.amount || 0),
                                    0
                                  ) / parseFloat(row.today_rate)
                                ).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td>
                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER:{" "}
                            <span>
                              {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0
                                ? (
                                  parseFloat(row.amount || 0) -
                                  row.paid_amount_date.reduce(
                                    (total, entry) => total + parseFloat(entry.amount || 0),
                                    0
                                  )
                                ) >= 0.50
                                  ? Math.ceil(
                                    parseFloat(row.amount || 0) -
                                    row.paid_amount_date.reduce(
                                      (total, entry) => total + parseFloat(entry.amount || 0),
                                      0
                                    )
                                  ).toFixed(2)
                                  : "0.00"
                                : parseFloat(row.amount || 0) === 0
                                  ? "0.00"
                                  : Math.ceil(parseFloat(row.amount || 0)).toFixed(2)}
                            </span>
                          </h4>

                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {Array.isArray(row.paid_amount_date) &&
                                row.paid_amount_date.length > 0 &&
                                row.today_rate
                                ? (
                                  Math.max(
                                    (parseFloat(row.amount || 0) -
                                      row.paid_amount_date.reduce(
                                        (total, entry) => total + parseFloat(entry.amount || 0),
                                        0
                                      )) /
                                    parseFloat(row.today_rate),
                                    0
                                  )
                                ).toFixed(3)
                                : parseFloat(row.amount || 0) === 0
                                  ? "0.000"
                                  : (
                                    Math.max(
                                      parseFloat(row.amount || 0) / parseFloat(row.today_rate || 1),0)).toFixed(3)}
                            </span>
                          </h4>
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
                          <span style={{ textAlign: "center" }}>------</span>
                        )}
                      </td>
                      <td>
                        <div className="actions d-flex justify-content-start align-items-center pt-3 gap-1">
                          <span
                            style={{
                              cursor: "pointer",
                              fontSize: "11px",
                              backgroundColor: "#00bbf0",
                              padding: "3px 5px",
                              color: "white",
                              borderRadius: "4px",
                            }}
                            onClick={() => handleClientClick(row)}
                          >
                            SEND
                          </span>

                          <span
                            style={{
                              cursor: "pointer",
                              fontSize: "11px",
                              backgroundColor: "#42b883",
                              padding: "3px 5px",
                              color: "white",
                              borderRadius: "4px",
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
                              padding: "3px 5px",
                              color: "white",
                              borderRadius: "4px",
                            }}
                            onClick={() => showConfirm(row.client_id, row.client_name)}
                          >
                            DELETE
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))) : (
                  <tr>
                    <td colSpan="11" className="text-center">No data available</td>
                  </tr>
                )}
            </tbody>
          </table>
          {visibleCount < sortedData.length && (
            <div className="d-flex  justify-content-end  mt-3 px-2"><p onClick={handleShowMore} className="nextData">Show More {">>"}</p></div>
          )}
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
                      ? selectedClient.client_name.replace(/"/g, "").toUpperCase()
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
                      ? selectedClient.client_contact
                      : ""
                  }
                  readOnly
                />
              </div>
              <div>
                <h4>Assign Employee</h4>
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={{ padding: "0px", border: "none" }} >
                  <option value="" disabled>
                    Select Employee
                  </option>
                  {employees
                    .filter((emp) => emp.role === "Collection Agent")
                    .map((emp) => (
                      <option key={emp.user_id} value={emp.user_id} style={{ fontSize: "15px" }}>
                        {emp.username.toUpperCase()}
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



      <Modal show={allClient} onHide={() => setAllClient(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(
            <form>
            <div>
                   <p>Total Selected Client : <span  className="text-danger">{selectedRows.length}</span> </p> 


                  <div>
                      
                  </div>
            </div>
              <div>
                <h4>Assign Employee</h4>
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={{ padding: "0px", border: "none" }} >
                  <option value="" disabled>
                    SELECT EMPLOYEE
                  </option>
                  {employees
                    .filter((emp) => emp.role === "Collection Agent")
                    .map((emp) => (
                      <option key={emp.user_id} value={emp.user_id} style={{ fontSize: "15px" }}>
                        {emp.username.toUpperCase()}
                      </option>
                    ))}
                </select>

              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAllClient(false)}>
            CLOSE
          </Button>
          <Button
            variant="primary"
            onClick={() => handleAssignsend()}
          >
           ASSIGN
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showupdateamountModal} onHide={handlemodelClose} dialogClassName="custom-modal">
        <div className="dio" style={{ width: '50vw' }}>
          <Modal.Header closeButton className="d-flex justify-content-between py-3 ">
            <div className="d-flex justify-content-between w-100" >
              <Modal.Title  >Update Amount</Modal.Title>  </div>
          </Modal.Header>
          <Modal.Body>
          <form onSubmit={handleDistributorSubmit}>
                   <div> 
                    {employees
      .filter(
        (emp) =>
          emp.role === 'Distributor' &&
          emp.username.toLowerCase().includes(searchQuery)
      )
      .map((emp) => (
        <div key={emp.user_id} className="mb-3">
          <p>
            <strong  style={{color:' #1246ac'}}>{emp.username.toUpperCase()}</strong>
          </p>
          <input  
            type="number"
            placeholder={ ` Date ${emp.today_rate_date}, Rate: ${emp.Distributor_today_rate || 'N/A'}`}
            value={amounts[emp.user_id] || ''}
            onChange={(e) => handleAmountChange(emp.user_id, e.target.value)}
            className="form-control"
          />
        </div>
      ))} 
         
      </div>          
          <Modal.Footer className="w-100 justify-content-center">
                <Button variant="secondary" className="w-15" onClick={handlemodelClose}  >
                  Close
                </Button>
                <Button variant="primary" onClick={handleSubmitUpdate2} className="w-15" >
                  Save Changes
                </Button>
              </Modal.Footer>
          </form>
          </Modal.Body>
        </div>
      </Modal>




      <Modal show={show} onHide={handleClose} dialogClassName="custom-modal">
        <div className="dio" style={{ width: '70vw' }}>
          <Modal.Header closeButton className="d-flex justify-content-between py-3 ">
            <div className="d-flex justify-content-between w-100" >
              <Modal.Title  >Add New Client</Modal.Title>     <h5 className="pt-2">Date : {AddNewClientDate}</h5></div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit} className="custom-form">

              <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12  " style={{ backgroundColor: "rgb(251, 243, 243)", borderRadius: '10px' }}>

                <div className="txt_field col-lg-5 col-md-10 col-sm-10 ">
                  <select
                    value={distributorId}
                    onChange={handleDistributorChange}
                    style={{ border: 'none', background: 'none', color: 'black', fontWeight: 'bold', outline: 'none', boxShadow: 'none', margin: '0px', padding: '0px', paddingTop: '20px' }}
                  >
                    <option value="">SELECT DISTRIBUTOR</option>
                    {employees
                      .filter((emp) => emp.role === "Distributor")
                      .map((emp) => (
                        <option key={emp.user_id} value={emp.user_id}>
                          {emp.username.toUpperCase()}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input
                    type="number"
                    value={todayrate}
                    step="0.01"
                    onChange={(e) => setTodayRate(parseFloat(e.target.value) || "")}
                    required
                  />
                  <label>TODAY RATE</label>
                </div>
              </div>
              <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    // required
                  />
                  <label>CLIENT NAME</label>
                </div>
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  // required
                  />
                  <label>CLIENT CONTACT NUMBER</label>
                </div>
              </div>
              <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  //  required 

                  />
                  <label>City</label>
                </div>
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input
                    type="number"
                    value={amount}
                    step="0.01"
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  // required
                  />
                  <label>AMOUNT</label>
                </div>
              </div>
              <div className="row d-flex  justify-content-end col-12">
                <Button className={!showBankModal ? "btn-primary w-auto" : "btn-danger w-auto"} onClick={() => setShowBankModal(!showBankModal)}>
                {showBankModal ? "Clear Bank" : "Add Bank"}
                 </Button>

                 <Button className={!showNewDistributorModal ? "btn-primary w-auto" : "btn-danger w-auto"} onClick={() => setShowNewDistributorModal(!showNewDistributorModal)}>
                 {showNewDistributorModal ? "Clear Distributor" : "Add New Distributor"}
                  </Button>


                  <Button className={!showupdateamountModal ? "btn-primary w-auto" : "btn-danger w-auto"} onClick={handlemodelShow }>
                 {showupdateamountModal ? "Clear " : "Distributor Today Rate"}
                  </Button>


              </div>
              {
                showNewDistributorModal  ? (
                  <>
                    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={distributorname}
                          onChange={(e) =>setDistributorname(e.target.value)}
                        // required
                        />
                        <label>ENTER THE DISTRIBUTOR NAME</label>
                      </div>
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={distributorcontact}
                          step="0.01"
                          onChange={(e) => setDistributorcontact(e.target.value)}
                        // required
                        />
                        <label>CONTACT NUMBER</label>
                      </div>
                    </div>
                    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="number"
                          value={todayRate}
                          onChange={(e) => setTodayrate(e.target.value)}
                        // required
                        />
                        <label>TODAY RATE</label>
                      </div>
                    </div>

                    <Button variant="primary"  onClick={handleDistributorSubmit} className="w-15" >
                  Save Distributor 
                </Button>
                  </>
                ) : (<>
                </>)}

                {
                  showBankModal ? (
                  <>
                    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={holdername}
                          onChange={(e) =>setHoldername(e.target.value)}
                        // required
                        />
                        <label>NAME OF THE  BENEFICIARY</label>
                      </div>
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={anumber}
                          step="0.01"
                          onChange={(e) => setAnumber(e.target.value)}
                        // required
                        />
                        <label>ACCOUNT NUMBER</label>
                      </div>
                    </div>
                    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value)}
                        // required
                        />
                        <label>IFSC CODE</label>
                      </div>
                    </div>
                  </>
                ) : (<>
                </>)}

                {/* {
                  showupdateamountModal ? (
                  <>
                  
                   
                  <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12  "  style={{height:'300px',overflow:'scroll',backgroundColor:'black'}}>
                     <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12  ">
                    {employees
      .filter(
        (emp) =>
          emp.role === 'Distributor' &&
          emp.username.toLowerCase().includes(searchQuery)
      )
      .map((emp) => (
        <div key={emp.user_id} className="mb-3">
          <p>
            <strong  style={{color:' #1246ac'}}>{emp.username.toUpperCase()}</strong>
          </p>
          <input  
            type="number"
            placeholder={ ` Date ${emp.today_rate_date}, Rate: ${emp.Distributor_today_rate || 'N/A'}`}
            value={amounts[emp.user_id] || ''}
            onChange={(e) => handleAmountChange(emp.user_id, e.target.value)}
            className="form-control"
          />
        </div>
      ))} 
      </div>
            </div>        
                  </>
                ) : (<>
                </>)} */}


              <Modal.Footer className="w-100 justify-content-center">
                <Button variant="secondary" onClick={handleClose} className="w-15">
                  Close
                </Button>
                <Button variant="primary" type="submit" className="w-15" >
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
            onClick={() => { if (clientIdToDelete) { handleDelete(clientIdToDelete); } }}>
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

<Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Select Bank</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {clientsWithMissingDetails.length > 0 ? (
      <div className="alert alert-warning text-center">
        <strong  className="text-danger">Clients with Missing accountNumber and IFSC code:</strong>
        <ul className="mt-2 text-left">
          {clientsWithMissingDetails.map((client,index) => (
            <li key={client.id || client.client_name || Math.random()}>
             {index+1 } {client.client_name?.trim() ? client.client_name : "Unknown Client"}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="text-success text-center">All clients have complete details.</p>
    )}

    {/* Bank selection buttons */}
    <div className="d-flex justify-content-center mt-3">
      {["bank1", "bank2"].map(bank => (
        <Button
          key={bank}
          variant={selectedBank === bank ? "primary" : "secondary"}
          onClick={() => handleBankSelection(bank)}
          className="mx-2"
        >
          {bank.charAt(0).toUpperCase() + bank.slice(1)}
        </Button>
      ))}
    </div>
  </Modal.Body>
  <Modal.Footer className="d-flex justify-content-center">
    <Button variant="danger" onClick={() => setShowModal(false)}>Cancel</Button>
    <Button variant="success" onClick={confirmExport} disabled={!selectedBank}>
      Confirm & Export
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
}

export default Client;
