import React, { useEffect, useState, useRef } from "react";
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
import AddClientForm from "./AddClientForm";
import { authFetch } from "./authFetch";
import AssignModal from "./AssignModal";
import ExportModal from "./ExportModal";


function Client() {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [dashboardNav, setDashboardNav] = useState("todayclient");
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
  const [beneficiaryemailid, setBeneficiaryemailid] = useState()
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
  const [showNewDistributorModal, setShowNewDistributorModal] = useState(false)
  const currentDate = format(new Date(), "dd-MM-yyyy");
  const [distributorname, setDistributorname] = useState("")
  const [distributorcontact, setDistributorcontact] = useState()
  const [todayRate, setTodayrate] = useState()
  const [showupdateamountModal, setShowupdateamountModal] = useState(false)
  const [amountSet, setAmountSet] = useState()
  const [description, setDescription] = useState()
  const conformrole = localStorage.getItem('role');
  const Dtpuserid = localStorage.getItem('user_id');
  const [searchText, setSearchText] = useState('');
  const [showDistList, setShowDistList] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  const distributorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (distributorRef.current && !distributorRef.current.contains(event.target)) {
        setShowDistList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  console.log("user DTP id", Dtpuserid)
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



  useEffect(() => {
    console.log("anumber:", anumber);
    console.log("employees:", employees);

    if (anumber && users.length > 0) {
      const matched = users.find((item) =>
        item.accno?.toString().trim() === anumber.toString().trim()
      );
      console.log("matched:", matched);

      if (matched) {
        setHoldername(matched.name_of_the_beneficiary || "");
        setIfsc(matched.ifsc_code || "");
        setBeneficiaryemailid(
          matched.beneficiary_email_id ? matched.beneficiary_email_id.replace(/"/g, "") : ""
        );
      } else {
        setHoldername("");
        setIfsc("");
        setBeneficiaryemailid("");
      }
    }
  }, [anumber, users]);



  const handleUnauthorizedAccess = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handlemodelClose = () => {
    setShowupdateamountModal(false),
      setShow(true);
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
  const DashboardTodayClient = () => setDashboardNav("todayclient")


  const handleDateChange = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };



  const filteredData = useMemo(() => {
    if (!Array.isArray(users)) return [];

    const today = format(new Date(), "dd-MM-yyyy");
    const conformrole = localStorage.getItem("role");
    const Dtpuserid = localStorage.getItem("user_id");

    const query = searchQuery?.toLowerCase().trim() || "";
    const queryUpper = searchQuery?.toUpperCase().trim() || "";
    const isQueryDate = /^\d{2}-\d{2}-\d{4}$/.test(searchQuery);

    // Step 1: Try to match the searchQuery with an employee username
    const matchedEmployee = employees?.find(
      (emp) => emp.username?.toLowerCase().trim() === query
    );

    return users.filter((row) => {
      const clientName = row.client_name?.toLowerCase().trim() || "";
      const clientContact = row.client_contact || "";
      const employeeName = row.employee_name?.toLowerCase().trim() || "";
      const accountNumbers = row.accno ? String(row.accno).toUpperCase().trim() : "";
      const clientStatus = row.status?.toLowerCase().trim() || "";
      const createdAt = row.date?.trim() || "";

      // 🔍 Get Distributor Name using Distributor_id
      const distributor = employees.find((emp) => emp.user_id === row.Distributor_id);
      const distributorName = distributor?.username?.toLowerCase().trim() || "";

      const paidAndUnpaid = row.paid_and_unpaid;

      const date = row.date

      const matchesQuery = !searchQuery
        ? true
        : isQueryDate
          ? createdAt === searchQuery
          : clientName.includes(query) ||
          clientContact.includes(query) ||
          employeeName.includes(query) ||
          accountNumbers.includes(queryUpper) ||
          distributorName.includes(query);


      const matchesDashboardFilter =
        dashboardNav === "client" ||
        (dashboardNav === "paid" && paidAndUnpaid === 1) ||
        (dashboardNav === "unpaid" && paidAndUnpaid === 0) ||
        (dashboardNav === "todayclient" && date === currentDate) ||
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

      const matchesDtpFilter =
        conformrole === "Dtp" ? String(row.dtp_id) === String(Dtpuserid) : true;

      const matchesDistributorFilter = matchedEmployee
        ? String(row.Distributor_id) === String(matchedEmployee.user_id)
        : true;

      return (
        matchesQuery &&
        matchesDashboardFilter &&
        matchesStatusFilter &&
        matchesDateFilter &&
        matchesBankFilter &&
        matchesDtpFilter &&
        matchesDistributorFilter
      );
    });
  }, [
    users,
    searchQuery,
    dashboardNav,
    selectedDate,
    selectedStatus,
    navselectedBank,
    employees,
  ]);



  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 50);
  };






  const totalLocalPaid = useMemo(() => {
    return filteredData.reduce((total, client) => {
      const clientRate = parseFloat(client.today_rate);

      // Skip if rate is 0, empty, or invalid
      if (!clientRate || clientRate === 0) return total;

      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );

      return total + totalPaidForClient / clientRate;
    }, 0);
  }, [filteredData]);









  const totalDTPLocalPaid = useMemo(() => {
    const Dtpuserid = localStorage.getItem("user_id");

    return filteredData
      .filter(client => String(client.dtp_id) === String(Dtpuserid))
      .reduce((total, client) => {
        return total + (parseFloat(client.amount) || 0);
      }, 0);
  }, [filteredData]);






  const totalTodayDTPLocalPaid = useMemo(() => {
    const DtpUserId = localStorage.getItem("user_id");
    const currentDate = format(new Date(), "dd-MM-yyyy");

    // Count all clients with today's date and matching DTP ID — regardless of rate
    const allTodayClients = filteredData.filter(
      client =>
        String(client.dtp_id) === String(DtpUserId) &&
        client.date === currentDate
    );

    // Only calculate total for valid today_rate
    const total = allTodayClients.reduce((sum, client) => {
      const amount = parseFloat(client.amount) || 0;
      const rate = parseFloat(client.today_rate);
      return rate > 0 ? sum + amount / rate : sum;
    }, 0);

    const clientCount = allTodayClients.length;

    return { total, clientCount };
  }, [filteredData]);




  const totalLocalDTPLocalPaid = useMemo(() => {
    const DtpUserId = localStorage.getItem("user_id");

    return filteredData
      .filter(client =>
        String(client.dtp_id) === String(DtpUserId) &&
        client.today_rate && parseFloat(client.today_rate) > 0
      )
      .reduce((total, client) => {
        const amount = parseFloat(client.amount) || 0;
        const todayRate = parseFloat(client.today_rate);
        return total + amount / todayRate;
      }, 0);
  }, [filteredData]);






  const totalLocalCurrency = useMemo(() => {
    return filteredData.reduce((total, client) => {
      const clientAmount = parseFloat(client.amount);
      const clientRate = parseFloat(client.today_rate);

      // Only include clients with a valid, non-empty, and positive today_rate
      if (!isNaN(clientAmount) && !isNaN(clientRate) && clientRate > 0) {
        return total + clientAmount / clientRate;
      }

      return total;
    }, 0);
  }, [filteredData]);




  const totalLocalBalance = useMemo(() => {
    return filteredData.reduce((total, client) => {
      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );

      const clientAmount = parseFloat(client.amount);
      const clientRate = parseFloat(client.today_rate);
      const clientBalance = (!isNaN(clientAmount) ? clientAmount : 0) - totalPaidForClient;

      // Only include client if today_rate is a valid positive number
      if (!isNaN(clientRate) && clientRate > 0) {
        return total + clientBalance / clientRate;
      }

      return total;
    }, 0);
  }, [filteredData]);





  const totalLocalTodayAmount = useMemo(() => {
    return users.reduce((total, client) => {
      if (client.date === currentDate && client.today_rate > 0) {
        const amount = parseFloat(client.amount) || 0;
        const rate = parseFloat(client.today_rate) || 1;
        return total + amount / rate;
      }
      return total;
    }, 0);
  }, [users, currentDate]);


  const todayClientCount = useMemo(() => {
    return users.filter(
      client => client.date === currentDate
    ).length;
  }, [users, currentDate]);






  const totalINTERNALTodayAmount = useMemo(() => {
    const rawTotal = users.reduce((total, client) => {
      if (client.date === currentDate) {
        const clientAmount = parseFloat(client.amount) || 0;
        return total + clientAmount;
      }
      return total;
    }, 0);

    const decimalPart = rawTotal - Math.floor(rawTotal);
    const roundedTotal = decimalPart >= 0.5 ? Math.ceil(rawTotal) : Math.floor(rawTotal);

    return roundedTotal;
  }, [users, currentDate]);




  // Assuming you use this too
  const [error, setError] = useState(null);




  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const currentDate = format(new Date(), "dd-MM-yyyy");

  //   const dtp_id = conformrole === "Dtp" && Dtpuserid ? Dtpuserid : null;

  //   const clientData = {
  //     client_name: (clientName).toUpperCase(),
  //     client_contact: (contactNumber || "UNKNOWN").toUpperCase(),
  //     client_city: (city || "UNKNOWN").toUpperCase(),
  //     amount: amount || 0,
  //     today_rate: todayrate || 0,
  //     date: currentDate,
  //     sent: false,
  //     message: (message || "").toUpperCase(),
  //     paid_and_unpaid: false,
  //     success_and_unsuccess: false,
  //     bank_name: (bname || "").toUpperCase(),
  //     accno: (anumber || "").toUpperCase().trim(),
  //     ifsc_code: (ifsc || "").toUpperCase(),
  //     accoun_type: (type || "10").toUpperCase(),
  //     Distributor_id: distributorId || null,
  //     name_of_the_beneficiary: (holdername || "").toUpperCase(),
  //     address_of_the_beneficiary: (holderaddress || "CHENNAI").toUpperCase(),
  //     sender_information: (senderinfo || "STOCK").toUpperCase(),
  //     bank_type: (clientType || "STOCK").toUpperCase(),
  //     narration: (narration || "STOCK").toUpperCase(),
  //     description: (description || "STOCK").toUpperCase(),
  //     email_id_beneficiary: (beneficiaryemailid || "").replace(/"/g, ""),
  //     ...(dtp_id && { dtp_id }),
  //   };

  //   try {
  //     // STEP 1: Submit client data
  //     const insertRes = await fetch(`${API_URL}/acc_insertarrays`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(clientData),
  //     });

  //     if (!insertRes.ok) throw new Error("❌ Failed to create client");

  //     const inserted = await insertRes.json();
  //     console.log("✅ Client Created:", inserted);
  //     alert("✅ New Client Created");

  //     // STEP 2: Refresh client list
  //     const listRes = await fetch(`${API_URL}/acc_list`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: localStorage.getItem("authToken"),
  //       },
  //     });

  //     const updatedData = await listRes.json();
  //     dispatch(setUsers(updatedData));
  //     console.log("🔄 Client List Updated");

  //     // STEP 3: Conditionally submit collection data
  //     if (!todayrate || Number(todayrate) === 0) {
  //       alert("⚠️ Amount not added: today rate is missing or zero.");
  //       console.warn("⚠️ todayrate is empty or zero");
  //       return   resetForm();
  //     }

  //     const collectionData = {
  //       Distributor_id: parseInt(distributorId),
  //       collamount: [(parseInt(amount) / todayrate).toFixed(3)],
  //       colldate: [currentDate],
  //       type: "collection",
  //       today_rate: todayrate,
  //       paidamount: "",
  //     };

  //     console.log("Sending Collection Data:", collectionData);

  //     const collectionRes = await fetch(`${API_URL}/collection/addamount`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(collectionData),
  //     });

  //     if (!collectionRes.ok) {
  //       const errorText = await collectionRes.text();
  //       throw new Error(`❌ Collection Add Failed: ${errorText}`);
  //     }

  //     const collectionResult = await collectionRes.json();
  //     console.log("✅ Collection Added:", collectionResult);
  //     alert("✅ Amount added successfully");

  //     // STEP 4: Reset the form only after all succeed

  //    resetForm()
  //   } catch (error) {
  //     console.error("❌ Error:", error.message);
  //     alert(`❌ Submission Failed: ${error.message}`);
  //   }
  // };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   // Assuming setLoading and setError are defined via useState
  //   setError(null);
  //   setLoading(true); // START LOADING 🛠️

  //   // --- Data Preparation (Omitted for brevity, remains the same) ---
  //   const currentDate = format(new Date(), "dd-MM-yyyy");
  //   const dtp_id = conformrole === "Dtp" && Dtpuserid ? Dtpuserid : null;
  //   const  rate = Number(todayrate); // Use Number() for cleaner check

  //   const clientData = {
  //     client_name: (clientName).toUpperCase(),
  //     client_contact: (contactNumber || "UNKNOWN").toUpperCase(),
  //     client_city: (city || "UNKNOWN").toUpperCase(),
  //     amount: amount || 0,
  //     today_rate: todayrate || 0,
  //     date: currentDate,
  //     sent: false,
  //     message: (message || "").toUpperCase(),
  //     paid_and_unpaid: false,
  //     success_and_unsuccess: false,
  //     bank_name: (bname || "").toUpperCase(),
  //     accno: (anumber || "").toUpperCase().trim(),
  //     ifsc_code: (ifsc || "").toUpperCase(),
  //     accoun_type: (type || "10").toUpperCase(),
  //     Distributor_id: distributorId || null,
  //     name_of_the_beneficiary: (holdername || "").toUpperCase(),
  //     address_of_the_beneficiary: (holderaddress || "CHENNAI").toUpperCase(),
  //     sender_information: (senderinfo || "STOCK").toUpperCase(),
  //     bank_type: (clientType || "STOCK").toUpperCase(),
  //     narration: (narration || "STOCK").toUpperCase(),
  //     description: (description || "STOCK").toUpperCase(),
  //     email_id_beneficiary: (beneficiaryemailid || "").replace(/"/g, ""),
  //     ...(dtp_id && { dtp_id }),
  //   };

  //   try {
  //     // STEP 1: Submit client data (Critical Step)
  //     const insertRes = await fetch(`${API_URL}/acc_insertarrays`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(clientData),
  //     });

  //     if (!insertRes.ok) {
  //       const errorText = await insertRes.text();
  //       throw new Error(`❌ Failed to create client: ${errorText}`);
  //     }

  //     const inserted = await insertRes.json();
  //     console.log("✅ Client Created:", inserted);
  //     alert("✅ New Client Created");

  //     // --- UI Feedback & Cleanup (Move earlier) ---
  //     // If client creation succeeds, we can reset the form IMMEDIATELY.
  //     resetForm();
  //     // We can close the modal/form view immediately if the remaining steps are background tasks.



  //     // STEP 2: Refresh client list (Can be a background task, but needed for UI)
  //     try {
  //       const listRes = await fetch(`${API_URL}/acc_list`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: localStorage.getItem("authToken"),
  //         },
  //       });

  //       if (!listRes.ok) throw new Error("Failed to fetch client list for refresh.");

  //       const updatedData = await listRes.json();
  //       dispatch(setUsers(updatedData));
  //       console.log("🔄 Client List Updated");

  //     } catch (listError) {
  //       // Log this error but don't halt the flow, the client was already created.
  //       console.error("⚠️ Failed to refresh client list:", listError.message);
  //     }

  //     // STEP 3: Conditionally submit collection data (Run independently after essential steps)
  //     if (!rate || rate === 0) {
  //       // IMMEDIATE ALERT: The alert here will fire immediately, not wait for Step 4.
  //       // alert("⚠️ Amount not added: today rate is missing or zero."); 
  //       console.warn("⚠️ todayrate is empty or zero");
  //       // The form is already reset and closed (after Step 1 success).
  //       // No need for a return or redundant resetForm here.

  //     } else {
  //       const collectionData = {
  //         Distributor_id: parseInt(distributorId),
  //         collamount: [(parseInt(amount) / rate).toFixed(3)],
  //         colldate: [currentDate],
  //         type: "collection",
  //         today_rate: rate,
  //         paidamount: "",
  //       };

  //       try {
  //         const collectionRes = await fetch(`${API_URL}/collection/addamount`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(collectionData),
  //         });

  //         if (!collectionRes.ok) {
  //           const errorText = await collectionRes.text();
  //           // Log but alert a warning, as client creation was a success
  //           console.error(`❌ Collection Add Failed: ${errorText}`);
  //           alert(`⚠️ Collection Add Failed, but Client was created: ${errorText}`);
  //         } else {
  //           // const collectionResult = await collectionRes.json();
  //           alert("✅ Amount added successfully");
  //         }
  //       } catch (collectionError) {
  //         console.error("❌ Collection API Error:", collectionError.message);
  //         alert(`⚠️ Collection process failed: ${collectionError.message}`);
  //       }
  //     }

  //   } catch (error) {
  //     // This catches errors from STEP 1 (client creation) or critical list update failure
  //     console.error("❌ Critical Error:", error.message);
  //     setError(error.message); // Set error state for UI if applicable
  //     alert(`❌ Submission Failed: ${error.message}`);
  //   } finally {
  //     setLoading(false); // ALWAYS STOP LOADING 🛑
  //   }
  // };

  const generateRandomIndianNumber = () => {
  const prefix = ["9", "8", "7", "6"][Math.floor(Math.random() * 4)];
  const rest = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
  return prefix + rest.toString();
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  // -------------------------
  // 1) Compute & validate all values up-front
  // -------------------------
  const currentDate = format(new Date(), "dd-MM-yyyy");
  const dtp_id = conformrole === "Dtp" && Dtpuserid ? Dtpuserid : null;

  // Normalize numeric values
  const rate = Number(todayrate || 0);          // today rate as number
  const parsedAmount = Number(amount || 0);    // amount as number

  // Basic validations (add more if you want)
  if (!clientName || clientName.trim() === "") {
    setError("Client name is required.");
    setLoading(false);
    return;
  }

  // Prepare payloads completely before any network calls
  const clientData = {
    client_name: (clientName || "UNKNOWN").toUpperCase(),
    client_contact: (contactNumber || generateRandomIndianNumber()).toString(),
    client_city: (city || "KUWAIT").toUpperCase(),
    amount: parsedAmount,
    today_rate: rate,
    date: currentDate,
    sent: false,
    message: (message || "").toUpperCase(),
    paid_and_unpaid: false,
    success_and_unsuccess: false,
    bank_name: (bname || "").toUpperCase(),
    accno: (anumber || "").toUpperCase().trim(),
    ifsc_code: (ifsc || "").toUpperCase(),
    accoun_type: (type || "10").toUpperCase(),
    Distributor_id: distributorId || null,
    name_of_the_beneficiary: (holdername || "").toUpperCase(),
    address_of_the_beneficiary: (holderaddress || "CHENNAI").toUpperCase(),
    sender_information: (senderinfo || "STOCK").toUpperCase(),
    bank_type: (clientType || "STOCK").toUpperCase(),
    narration: (narration || "STOCK").toUpperCase(),
    description: (description || "STOCK").toUpperCase(),
    email_id_beneficiary: (beneficiaryemailid || "").replace(/"/g, ""),
    ...(dtp_id && { dtp_id }),
  };

  // Decide whether we should call collection API
  const shouldAddCollection = rate > 0 && parsedAmount > 0 && !!distributorId;

  // Prepare collection payload (if needed)
  const collectionData = shouldAddCollection
    ? {
        Distributor_id: parseInt(distributorId, 10),
        collamount: [ (parsedAmount / rate).toFixed(3) ],
        colldate: [ currentDate ],
        type: "collection",
        today_rate: rate,
        paidamount: "",
      }
    : null;

  // -------------------------
  // 2) Network calls — sequential, line by line
  // -------------------------
  try {
    // STEP A: Insert client (CRITICAL) — wait for this
    const insertRes = await fetch(`${API_URL}/acc_insertarrays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    if (!insertRes.ok) {
      const errorText = await insertRes.text();
      throw new Error(`Failed to create client: ${errorText || insertRes.status}`);
    }

    const inserted = await insertRes.json();
    console.log("✅ Client Created:", inserted);
    alert("✅ New Client Created");

    // Reset UI immediately after successful client creation
    resetForm();

    // STEP B: If required, add collection (sequentially after insert)
    if (shouldAddCollection && collectionData) {
      try {
        const collectionRes = await fetch(`${API_URL}/collection/addamount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(collectionData),
        });

        if (!collectionRes.ok) {
          const errorText = await collectionRes.text();
          // Collection failure is non-fatal (client is created) — log & show warning
          console.error("Collection add failed:", errorText);
          alert(`⚠️ Collection Add Failed (client created): ${errorText}`);
        } else {
          // optionally read response: const colResult = await collectionRes.json();
          console.log("✅ Collection added");
          alert("✅ Amount added successfully");
        }
      } catch (collectionErr) {
        console.error("Collection API error:", collectionErr.message);
        alert(`⚠️ Collection process failed: ${collectionErr.message}`);
      }
    } else {
      // Log why collection was skipped
      if (!shouldAddCollection) {
        console.log("Skipping collection: rate, amount or distributorId invalid.");
      }
    }

    // STEP C: Refresh client list (sequential)
    try {
      const listRes = await fetch(`${API_URL}/acc_list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authToken"),
        },
      });

      if (!listRes.ok) {
        throw new Error(`Failed to refresh client list: ${listRes.status}`);
      }

      const updatedData = await listRes.json();
      dispatch(setUsers(updatedData));
      console.log("🔄 Client List Updated");
    } catch (listErr) {
      // Non-fatal but important to surface/log
      console.warn("Failed to refresh client list:", listErr.message);
    }

  } catch (err) {
    // Any critical error (like insert failure) ends up here
    console.error("❌ Submission failed:", err.message);
    setError(err.message);
    alert(`❌ Submission Failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
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
    setBeneficiaryemailid("")
  };




  const sortedData = useMemo(() => {
    if (dashboardNav === "todayclient") {
      return [...filteredData].sort((a, b) => {
        const dateA = parse(a.date, "yyyy-MM-dd HH:mm:ss", new Date());
        const dateB = parse(b.date, "yyyy-MM-dd HH:mm:ss", new Date());
        return dateA - dateB; // FIFO: older first
      });
    }

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
  }, [filteredData, dashboardNav]);

  // const handleDelete = (clientId) => {
  //   const Authorization = localStorage.getItem("authToken");

  //   // ✅ Get the client before deleting
  //   const particularClient = users.find(
  //     (user) => user.client_id === clientId
  //   );

  //   if (!particularClient) {
  //     console.warn("❌ Client not found in 'use'");
  //     return;
  //   }

  //   // ✅ Prepare clientData BEFORE deletion
  //   const clientData = {
  //     Distributor_id: parseInt(particularClient.Distributor_id),
  //     colldate: particularClient.date,
  //     amount: parseFloat(
  //       (particularClient.amount / particularClient.today_rate).toFixed(3)
  //     ),
  //     type: "collection",
  //   };

  //   console.log("📝 Prepared clientData:", clientData);

  //   // ✅ DELETE client
  //   fetch(`${API_URL}/acc_delete/${clientId}`, {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization,
  //     },
  //   })
  //     .then(async (response) => {
  //       if (!response.ok) {
  //         throw new Error("Failed to delete client");
  //       }

  //       const data = await response.json();
  //       console.log("✅ Client deleted:", data);
  //       setShowConfirmModal(false);
  //       setToastMessage(`Client ${clientNameToDelete} deleted successfully!`);
  //       setShowToast(true);

  //       // ✅ UPDATE amount after successful delete
  //       try {
  //         const updateRes = await fetch(`${API_URL}/collection/update`, {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(clientData),
  //         });

  //         const updateData = await updateRes.json();
  //         if (updateRes.ok) {
  //           console.log("✅ Amount updated:", updateData);
  //         } else {
  //           console.error("❌ Update failed:", updateData.message || updateData.error);
  //         }
  //       } catch (error) {
  //         console.error("❌ Error during update:", error.message);
  //       }

  //       // ✅ Refresh user list
  //       fetch(`${API_URL}/acc_list`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: localStorage.getItem("authToken"),
  //         },
  //       })
  //         .then((res) => res.json())
  //         .then((updatedData) => dispatch(setUsers(updatedData)))
  //         .catch((err) => console.error("❌ Error fetching updated data:", err));
  //     })
  //     .catch((error) => {
  //       console.error("❌ Error deleting client:", error);
  //     });
  // };


//   const handleDelete = (clientId) => {
//   const Authorization = localStorage.getItem("authToken");

//   // Find the specific client
//   const particularClient = users.find(
//     (user) => user.client_id === clientId
//   );

//   if (!particularClient) {
//     console.warn("❌ Client not found in 'users'");
//     return;
//   }

//   // Prepare the data *before* deleting
//   const clientData = {
//     Distributor_id: parseInt(particularClient.Distributor_id),
//     colldate: particularClient.date,
//     amount: parseFloat(
//       (particularClient.amount / particularClient.today_rate).toFixed(3)
//     ),
//     type: "collection",
//   };

//   console.log("📝 Prepared clientData:", clientData);

//   // --- STEP 1: Delete client ---
//   fetch(`${API_URL}/acc_delete/${clientId}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization,
//     },
//   })
//     .then(async (response) => {
//       if (!response.ok) {
//         throw new Error("Failed to delete client");
//       }

//       const data = await response.json();
//       console.log("✅ Client deleted:", data);

//       // --- STEP 2: Close modal + show toast immediately ---
//       setShowConfirmModal(false);
//       setToastMessage(`Client ${particularClient.client_name} deleted successfully!`);
//       setShowToast(true);

//       // --- STEP 3: Delay update + refresh for smooth UX ---
//       setTimeout(async () => {
//         try {
//           // ✅ Update collection
//           const updateRes = await fetch(`${API_URL}/collection/update`, {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(clientData),
//           });

//           const updateData = await updateRes.json();
//           if (updateRes.ok) {
//             console.log("✅ Amount updated:", updateData);
//           } else {
//             console.error(
//               "❌ Update failed:",
//               updateData.message || updateData.error
//             );
//           }

//           // ✅ Refresh list after update
//           const listRes = await fetch(`${API_URL}/acc_list`, {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: localStorage.getItem("authToken"),
//             },
//           });

//           const updatedData = await listRes.json();
//           dispatch(setUsers(updatedData));
//           console.log("🔄 Client List Updated (after delay)");

//         } catch (error) {
//           console.error("❌ Error during update or refresh:", error.message);
//         }
//       }, 4000); // ⏳ Wait 4 seconds before updating view
//     })
//     .catch((error) => {
//       console.error("❌ Error deleting client:", error);
//     });
// };


const handleDelete = async (clientId) => {
  const Authorization = localStorage.getItem("authToken");

  const particularClient = users.find(
    (user) => user.client_id === clientId
  );

  if (!particularClient) {
    console.warn("❌ Client not found in 'users'");
    return;
  }

  const clientData = {
    Distributor_id: parseInt(particularClient.Distributor_id),
    colldate: particularClient.date,
    amount: parseFloat(
      (particularClient.amount / particularClient.today_rate).toFixed(3)
    ),
    type: "collection",
  };

  console.log("📝 Prepared clientData:", clientData);

  try {
    // --- STEP 1: Delete client ---
    const deleteRes = await fetch(`${API_URL}/acc_delete/${clientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
    });

    if (!deleteRes.ok) throw new Error("Failed to delete client");

    const data = await deleteRes.json();
    console.log("✅ Client deleted:", data);

    // --- STEP 2: UI feedback immediately ---
    setShowConfirmModal(false);
    setToastMessage(`Client ${particularClient.client_name} deleted successfully!`);
    setShowToast(true);

    // --- STEP 3: Do both update + refresh in parallel for speed ---
    const [updateRes, listRes] = await Promise.all([
      fetch(`${API_URL}/collection/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      }),
      fetch(`${API_URL}/acc_list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      }),
    ]);

    // --- Handle update ---
    const updateData = await updateRes.json();
    if (updateRes.ok) {
      console.log("✅ Amount updated:", updateData);
    } else {
      console.error("❌ Update failed:", updateData.message || updateData.error);
    }

    // --- Handle refresh ---
    const updatedData = await listRes.json();
    dispatch(setUsers(updatedData));
    console.log("🔄 Client List Updated (fast refresh)");
  } catch (error) {
    console.error("❌ Error deleting client:", error);
  }
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

  const bankNames = {
    bank1: "IOB ONLY",
    bank2: "IOB OTHERS",
    bank3: "IDBANK OTHERS",
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
        " AMOUNT": ` ${client.amount.toFixed(2)}`,
      };

      if (selectedBank === "bank1") {
        clientData[" NARRATION"] = ` ${client.narration}` || "";
      } else if (selectedBank === "bank2") {
        clientData = {
          "IFSC CODE": `${client.ifsc_code}`,
          " ACCOUNT TYPE": ` ${client.accoun_type}` || "",
          " ACCOUNT NUMBER": ` ${client.accno}`,
          " BENEFICIARY NAME": ` ${client.name_of_the_beneficiary?.toUpperCase() || "UNKNOWN BENEFICIARY NAME"}`,
          " BENEFICIARY ADDRESS": ` ${client.address_of_the_beneficiary?.toUpperCase() || "UNKNOWN BENEFICIARY ADDRESS"}`,
          " SENDER INFORMATION": ` ${client.sender_information?.toUpperCase() || "UNKNOWN SENDER INFORMATION"}`,
          // " ACCOUNT NUMBER": ` ${client.accno}` ,
          " AMOUNT": ` ${client.amount.toFixed(2)}`,
        };
      } else if (selectedBank === "bank3") {
        clientData = {
          "CUSTOMER_NAME": `${client.name_of_the_beneficiary?.toUpperCase() || "UNKNOWN BENEFICIARY NAME"}`,
          " CITY": ` ${client.client_city?.toUpperCase() || "UNKNOWN CITY NAME"}`,
          " ACCOUNT_NUMBER": ` ${client.accno}`,
          " AMOUNT": ` ${client.amount.toFixed(2)}`,
          " DESCRIPTION": ` ${client.description?.toUpperCase() || "UNKNOWN NAME"}`,
          " IFSC_CODE": ` ${client.ifsc_code}`,
          " BANK_NAME": ` ${client.bank_name?.toUpperCase() || "UNKNOWN NAME"}`,
          " BENEFICIARY_EMAIL_ID": ` ${client.beneficiary_email_id?.toLowerCase() || "UNKNOWN EMAIL ID"}`,
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
      setAmounts()
      handlemodelClose();
      fetchEmployees();

    } catch (error) {
      console.error("Error updating rates:", error);
      alert("An error occurred.");
    }
  };


  const handleDistributorSubmit = async (event) => {
  event.preventDefault();

  // ✅ 1. Validate input before sending
  if (!distributorname.trim() || !distributorcontact.trim() || !todayRate.trim()) {
    alert("Please fill all required fields (Name, Contact, and Today Rate).");
    return;
  }

  const Authorization = localStorage.getItem("authToken");
  const currentDate = format(new Date(), "dd-MM-yyyy");

  if (!Authorization) {
    alert("Authorization token is missing. Please log in again.");
    return;
  }

  try {
    // ✅ 2. Prepare clean JSON payload
    const distributorData = {
      username: distributorname.trim(),
      phone_number: distributorcontact.trim(),
      role: "Distributor",
      today_rate_date: currentDate,
      Distributor_today_rate: todayRate.trim(),
    };

    console.log("Sending distributor data:", distributorData);

    // ✅ 3. Send safe JSON request
    const signupResponse = await fetch(`${API_URL}/distrbutorCreated`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Authorization,
      },
      body: JSON.stringify(distributorData),
    });

    // ✅ 4. Handle non-OK responses gracefully
    if (!signupResponse.ok) {
      const errText = await signupResponse.text();
      console.error("Server returned error:", errText);
      alert("⚠️ Unable to add distributor. The server is temporarily unavailable.");
      return;
    }

    const data = await signupResponse.json();

    // ✅ 5. Success handling
    alert("✅ New Distributor successfully created!");
    setDistributorname("");
    setDistributorcontact("");
    setTodayrate("");
    setShow(true);
    setShowNewDistributorModal(!showNewDistributorModal);

    // Refresh employee list if needed
    if (Authorization) {
      await fetch(`${API_URL}/list`, {
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
    }

    // ✅ Optional: refresh page after success
    window.location.reload();

  } catch (error) {
    // ✅ 6. Catch network or unexpected issues
    console.error("Unexpected error:", error);
    alert("🚨 Something went wrong while adding the distributor. Please try again later.");
  }
};




  // const handleDistributorSubmit = async (event) => {
  //   event.preventDefault();

  //   if (!distributorname.trim() || !distributorcontact.trim()) {
  //     alert("Please fill in all required fields (Name and Contact).");
  //     return;
  //   }

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

  //     const signupResponse = await fetch(`${API_URL}/distrbutorCreated`, {
  //       method: "POST",
  //       body: distributorData,
  //       headers: {
  //         Authorization: Authorization,
  //       },
  //     });

  //     if (!signupResponse.ok) {
  //       throw new Error("Something went wrong while adding the distributor!");
  //     }

  //     const data = await signupResponse.json();
  //     alert("New Distributor successfully created!");
  //     setDistributorname("");
  //     setDistributorcontact("");
  //     setTodayrate("");
  //     setShow(true);
  //     setShowNewDistributorModal(!showNewDistributorModal);

  //     if (Authorization) {
  //       await fetch(`${API_URL}/list`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: Authorization,
  //         },
  //       })
  //         .then((response) => {
  //           if (response.status === 401) {
  //             console.error("Unauthorized access - redirecting to login");
  //             handleUnauthorizedAccess();
  //             return;
  //           }
  //           return response.json();
  //         })
  //         .then((data) => dispatch(setEmployees(data)))
  //         .catch((error) => console.error("Fetch error:", error));
  //     } else {
  //       console.error("No authorization token found in localStorage");
  //     }

  //     // ✅ Refresh page after all done
  //     window.location.reload();

  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };



  // const handleDistributorChange = (e) => {
  //   const selectedId = e.target.value;
  //   setDistributorId(selectedId);

  //   const selectedDistributor = employees.find(emp => emp.user_id === parseInt(selectedId));

  //   const currentDate = format(new Date(), "dd-MM-yyyy");

  //   if (selectedDistributor) {
  //     if (selectedDistributor.today_rate_date === currentDate) {
  //       setTodayRate(parseFloat(selectedDistributor.Distributor_today_rate) || 0);
  //     } else {
  //       setTodayRate(0);
  //     }
  //   } else {
  //     setTodayRate(0);
  //   }
  // };
 
 
  const [showRateInput, setShowRateInput] = useState(false);

  const handleDistributorChange = (e) => {
    const selectedId = e.target.value;
    setDistributorId(selectedId);

    const selectedDistributor = employees.find(emp => emp.user_id === parseInt(selectedId));
    const currentDate = format(new Date(), "dd-MM-yyyy");

    if (selectedDistributor) {
      if (selectedDistributor.today_rate_date === currentDate) {
        setTodayRate(parseFloat(selectedDistributor.Distributor_today_rate) || 0);
        setShowRateInput(true); // ✅ Show rate input
      } else {
        setTodayRate(""); // or 0 if you prefer
        setShowRateInput(false); // ❌ Hide rate input
      }
    } else {
      setTodayRate("");
      setShowRateInput(false);
    }
  };


















  return (
    <div style={{ marginTop: "50px", width: '100%' }}>
      <div className="page-header">
        <h1>Client</h1>
        <small>Client / Dash</small>
      </div>
      {
        conformrole === "Admin" ? (
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
                <small> ALL CLIENT</small>
              </div>
            </div>
            {/* 
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
          </div> */}

            {/* <div className="cardAction  cardgreen  bg-success" >
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
          </div> */}


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


            <div className={dashboardNav === "todayclient" ? "cardAction" : "card"} onClick={DashboardTodayClient} >
              <div className="card-head  ">
                <div className="d-flex flex-column">
                  <h2>{totalLocalTodayAmount.toFixed(3)}</h2>
                  <h2>{totalINTERNALTodayAmount.toFixed(2)}</h2>
                </div>
                <span className="las la-user-friends">
                  <GiReceiveMoney />
                  <HiUsers />
                </span>
              </div>
              <div className="card-progress">
                <small>TODAY ORDER CLIENT {`    (${todayClientCount})`}</small>
              </div>
            </div>




          </div>
        ) : (<div className="analytics" >

          <div className="cardAction  cardgreen  bg-primary" >
            <div className="card-head">
              <h2>{totalLocalDTPLocalPaid.toFixed(3)}</h2>
              <span className="las la-user-friends">
                <GiReceiveMoney />
                <HiUsers />
              </span>
            </div>
            <div className="card-progress">
              <small>TOTAL YOUR ORDER CLIENT</small>
            </div>
          </div>

          <div className="cardAction  cardgreen  bg-success" >
            <div className="card-head">
              <h2>{totalTodayDTPLocalPaid.total.toFixed(3)}</h2>
              <span className="las la-user-friends">
                <GiReceiveMoney />
                <HiUsers />
              </span>
            </div>
            <div className="card-progress">
              <small>TODAY YOUR ORDER CLIENT{`    (${totalTodayDTPLocalPaid.clientCount})`}</small>
            </div>
          </div>


        </div>)
      }

      <div className="">
        <div className="record-header d-flex justify-content-between align-items-center flex-wrap gap-1 py-2 px-1">
          <div className="d-flex align-items-center gap-2 ">

            {conformrole === "Admin" ? (
              <button
                onClick={handleSelectAll}
                className={`btn ${selectAll ? "btn-danger" : "btn-success"} btn-sm`}
                style={{ minWidth: "100px" }}
              >
                {selectAll ? "Deselect All" : "Select All"}
              </button>
            ) : (<span></span>)}



            <Button className="btn btn-primary btn-sm" style={{ minWidth: "80px" }} onClick={handleShow}>
              Add New
            </Button>


            {/* <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            Add New
          </Button> */}

            {/* {
              conformrole === "Admin" ? (
                <Button className="btn btn-primary position-relative text-nowrap" style={{ minWidth: "80px" }} onClick={() => setAllClient(true)} >
                  Assign{selectedRows.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {selectedRows.length}
                    </span>
                  )}
                </Button>
              ) : (<span></span>)
            } */}

            {conformrole === "Admin" && (
            <Button  className="btn btn-primary position-relative text-nowrap" style={{ minWidth: "80px" }}
             
           
              onClick={() => setShowAssign(true)}
              disabled={!selectedRows.length}
            >
            Assign{selectedRows.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {selectedRows.length}
                    </span> )}
            </Button>
          )}




          </div>


          <div className="d-flex align-items-center gap-2 ">
            {/* {
              conformrole === "Admin" ? (
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
              ) : (<span></span>)
            } */}

            {conformrole === "Admin" && (
                <Button
                   onClick={() => setShowExport(true)}
                  className="btn btn-primary position-relative text-nowrap"
                  style={{ minWidth: "120px" }} >
                  Export to CSV
                  {selectedRows.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {selectedRows.length}
                    </span>
                  )}
                </Button>
          
          )}



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
                <th>REF NO</th>
                <th>DISTRIBUTOR NAME</th>
                <th>IFSC NUMBER</th>
                <th>TOTAL</th>
                <th>RATE</th>
                <th>STATUS</th>
                <th>DATE</th>
                {/* <th>PAID AMOUNT</th>
                <th>BALANCE AMOUNT</th> */}
                <th>AGENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>

              {sortedData.length > 0 ? (
                (dashboardNav === "todayclient" ? sortedData : sortedData.slice(0, visibleCount)).map((row, index) => (
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


                    {row.ifsc_code ? (
                      <td>{row.ifsc_code}</td>
                    ) : (<td>------</td>)}


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
                <p>Total Selected Client : <span className="text-danger">{selectedRows.length}</span> </p>


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
                        <strong style={{ color: ' #1246ac' }}>{emp.username.toUpperCase()}</strong>
                      </p>

                      <input
                        type="number"
                        min="1"
                        placeholder={`Date: ${emp.today_rate_date || 'N/A'}, Rate: ${emp.Distributor_today_rate || 'N/A'}`}
                        value={amounts?.[emp.user_id] || ''}
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




                <div className="txt_field col-lg-5 col-md-10 col-sm-10" ref={distributorRef} style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="SELECT DISTRIBUTOR"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setShowDistList(true);

                    }}
                    onFocus={() => setShowDistList(true)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'black',
                      fontWeight: 'bold',
                      outline: 'none',
                      boxShadow: 'none',
                      margin: '0px',
                      padding: '0px',
                      paddingTop: '20px',
                      width: '100%',

                    }}
                  />
                  {showDistList && (
                    <ul
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        listStyle: 'none',
                        padding: 0,
                        marginTop: '4px',
                      }}
                    >
                      {employees
                        .filter(
                          (emp) =>
                            emp.role === 'Distributor' &&
                            emp.username.toLowerCase().startsWith(searchText.toLowerCase())
                        )
                        .map((emp) => (
                          <li
                            key={emp.user_id}
                            onClick={() => {
                              const fakeEvent = { target: { value: emp.user_id } };
                              handleDistributorChange(fakeEvent);
                              setSearchText(emp.username);
                              setShowDistList(false);
                            }}
                            style={{
                              padding: '10px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                            }}
                          >
                            {emp.username.toUpperCase()}
                          </li>
                        ))}
                      {employees.filter(
                        (emp) =>
                          emp.role === 'Distributor' &&
                          emp.username.toLowerCase().startsWith(searchText.toLowerCase())
                      ).length === 0 && (
                          <li style={{ padding: '10px', color: '#999' }}>No match found</li>
                        )}
                    </ul>
                  )}
                </div>
                {showRateInput && (
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
                )}


                {/* <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                <input
                  type="number"
                  value={todayrate}
                  step="0.01"
                  onChange={(e) => setTodayRate(parseFloat(e.target.value) || "")}
                  required
                />
                <label>TODAY RATE</label>
              </div> */}
              </div>
              <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  // required
                  />
                  <label>ORDER NO / CLIENT NAME</label>
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
                    style={{
                      appearance: "textfield",
                      MozAppearance: "textfield",
                    }}
                    onWheel={(e) => e.target.blur()}
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


                {/* <Button className={!showupdateamountModal ? "btn-primary w-auto" : "btn-danger w-auto"} onClick={handlemodelShow}>
                {showupdateamountModal ? "Clear " : "Distributor Today Rate"}
              </Button> */}


              </div>
              {
                showNewDistributorModal ? (
                  <>
                    <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={distributorname}
                          onChange={(e) => setDistributorname(e.target.value)}
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

                    <Button variant="primary" onClick={handleDistributorSubmit} className="w-15" >
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
                          value={anumber}
                          step="0.01"
                          onChange={(e) => setAnumber(e.target.value.trim())
                          }
                        // required
                        />
                        <label>ACCOUNT NUMBER</label>
                      </div>
                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={holdername}
                          onChange={(e) => setHoldername(e.target.value)}
                        // required
                        />
                        <label>NAME OF THE  BENEFICIARY</label>
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

                      <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                        <input
                          type="text"
                          value={beneficiaryemailid}
                          onChange={(e) => setBeneficiaryemailid(e.target.value)}
                        // required
                        />
                        <label>BENEFICIARY EMAIL_ID</label>
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

      {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Bank</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clientsWithMissingDetails.length > 0 ? (
            <div className="alert alert-warning text-center">
              <strong className="text-danger">Clients with Missing accountNumber and IFSC code:</strong>
              <ul className="mt-2 text-left">
                {clientsWithMissingDetails.map((client, index) => (
                  <li key={client.id || client.client_name || Math.random()}>
                    {index + 1} {client.client_name?.trim() ? client.client_name : "Unknown Client"}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-success text-center">All clients have complete details.</p>
          )}



          <div className="d-flex justify-content-center mt-3">
            {Object.entries(bankNames).map(([bankKey, bankLabel]) => (
              <Button
                key={bankKey}
                variant={selectedBank === bankKey ? "primary" : "secondary"}
                onClick={() => handleBankSelection(bankKey)}
                className="mx-2"
              >
                {bankLabel}
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
      </Modal> */}


      {showAdd && (
        <AddClientForm
          onClose={() => setShowAdd(false)}
          employees={employees}
          authFetch={authFetch}
          dispatch={dispatch}
        />
      )}

      {showAssign && (
        <AssignModal
          selectedRows={selectedRows}
          employees={employees}
          employeeId={employeeId}
          setEmployeeId={setEmployeeId}
          onClose={() => setShowAssign(false)}
          authFetch={authFetch}
          dispatch={dispatch}
        />
      )}

      {showExport && (
        <ExportModal selectedRows={selectedRows} onClose={() => setShowExport(false)} />
      )}

    </div>
  );
}

export default Client;
