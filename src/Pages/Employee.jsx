
import React, { useState, useEffect } from "react";
import { Button, Modal, InputGroup, FormControl, Toast, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import "../Css/dashboard.css";
import { FaUserTie } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { parse, subDays, format, parseISO } from "date-fns";


function Employee() {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [city, setCity] = useState("");
  const [username, setUsername] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [dashboardnav, setDashboardnav] = useState("All");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState(null);
  const [distributormodal, setDistributormodal] = useState(false)
  const [amountSet, setAmountSet] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Confirmpassword, setConfirmpassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  const employees = useSelector((state) => state.employees.employees);
  const users = useSelector((state) => state.clients.users || []);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [employeeIdToDelete, setemployeeIdToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [employeeNameToDelete, setemployeeNameToDelete] = useState('');
  const currentDate = format(new Date(), "dd-MM-yyyy");
  const date = new Date();  // Current date
  const formattedDate = date.toISOString(); 
  console.log(formattedDate);
  console.log(employees)

  const selectedDistributor = employees.find(emp => emp.role === "Distributor");
  const [visibleCount, setVisibleCount] = useState(30);

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


  useEffect(() => {
    fetchEmployees();
  }, [dispatch]);


  useEffect(() => {
    if (employees.length > 0) {
      dispatch(setEmployees(employees));
    }
  }, [employees, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);



  const handleSubmit = async (event) => {
    event.preventDefault();

    const Authorization = localStorage.getItem("authToken");

    if (!Authorization) {
      console.error("Authorization token is missing");
      return;
    }

    try {

      const response = await fetch(`${API_URL}/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employee list");
      }


      const employeeData = new FormData();
      employeeData.append("username", username);
      employeeData.append("email", email);
      employeeData.append("password", password);
      employeeData.append("phone_number", phone_number);
      employeeData.append("city", city);
      employeeData.append("role", role);


      const signupResponse = await fetch(`${API_URL}/signup`, {
        method: "POST",
        body: employeeData,
      });

      if (!signupResponse.ok) {
        throw new Error("Something went wrong!");
      }

      const data = await signupResponse.json();
      alert("New Employee successfully created");
      setUsername("");
      setPhone_number("");
      setCity("");
      setPassword("");
      setEmail("");
      setConfirmpassword("")
      setShow(false);
      fetchEmployees();


    } catch (error) {
      console.error("Error:", error);
    }
  };


  const handleDistributorSubmit = async (event) => {
    event.preventDefault();

    const Authorization = localStorage.getItem("authToken");

    if (!Authorization) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      // First API call (if needed, similar to employee list fetch)
      const response = await fetch(`${API_URL}/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch distributor list");
      }

      // Creating FormData for distributor
      const distributorData = new FormData();
      distributorData.append("username", username);
      distributorData.append("phone_number", phone_number);
      distributorData.append("role", "Distributor"); // Default role

      // Sending request to the Distributor API
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
      setDebouncedSearchQuery(false)
      setUsername("");
      setPhone_number("");
      fetchEmployees();
      setDistributormodal(false) // Refresh the list

    } catch (error) {
      console.error("Error:", error);
    }
  };



  const Dashboardclient = () => setDashboardnav("Admin");
  const Dashboardpaid = () => setDashboardnav("Collection Manager");
  const Dashboardunpaid = () => setDashboardnav("Collection Agent");
  const DashboardAll = () => setDashboardnav("All");
  const Dashboardother = () => setDashboardnav("Distributor");


  // distributor_today_rate , today_rate_date

  const imageExists = (url) => {
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      return "/images/fallback.jpg";
    };
    return url;
  };

  const filteredData = useMemo(() => {
    return employees.filter((row) => {
      const username = row.username || "";
      const phonenumber = row.phone_number || "";
      const query = searchQuery || "";

      return (
        (username.toLowerCase().includes(query.toLowerCase()) ||
          phonenumber.includes(query)) &&
        (dashboardnav === "All" ||
          (dashboardnav === "Admin" && row.role === "Admin") ||
          (dashboardnav === "Collection Manager" &&
            row.role === "Collection Manager") ||
          (dashboardnav === "Collection Agent" &&
            row.role === "Collection Agent") ||
          (dashboardnav === "Distributor" &&
            row.role === "Distributor"
          ))
      );
    });
  });
  




   
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlenav = (client) => {
    dispatch(setSelectedEmployee(client));
    navigate("/employee/employeeinfo");
  };
  const collectionManagerCount = employees.filter(
    (employee) => employee.role === "Collection Manager"
  ).length;
  const adminCount = employees.filter(
    (employee) => employee.role === "Admin"
  ).length;
  const collectionAgentCount = employees.filter(
    (employee) => employee.role === "Collection Agent"
  ).length;
  const Distributor = employees.filter(
    (employee) => employee.role === "Distributor"
  ).length;
  const allEmployeeCount = employees.filter((e1) => e1.user_id).length;

  const handleDelete = async (clientId) => {
    try {
      const Authorization = localStorage.getItem("authToken");

      const deleteResponse = await fetch(`${API_URL}/delete/${clientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization,
        },
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete Employee");
      }

      const deleteData = await deleteResponse.json();
      console.log("Client deleted successfully:", deleteData);

      setShowConfirmModal(false);
      setToastMessage(`Client ${employeeNameToDelete} deleted successfully!`);
      setShowToast(true);


      const listResponse = await fetch(`${API_URL}/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization,
        },
      });

      if (!listResponse.ok) {
        throw new Error("Failed to fetch updated employee list");
      }

      const updatedEmployees = await listResponse.json();
      dispatch(setEmployees(updatedEmployees));

    } catch (error) {
      console.error("Error deleting client:", error);
      sessionStorage.removeItem("selectedEmployee");
    }
  };








  const showConfirm = (clientId, clientName) => {
    setemployeeIdToDelete(clientId);
    setemployeeNameToDelete(clientName);
    setShowConfirmModal(true);
  };


  const handleUnauthorizedAccess = () => {

    sessionStorage.clear();
    localStorage.clear()
    navigate("/login");
  };

  useEffect(() => {
    sessionStorage.clear();
  }, []);



  

  // const sortedData = useMemo(() => {
  //   return [...filteredData].sort((a, b) => {

  //     if (b.client_id !== a.client_id) {
  //       return b.client_id - a.client_id;
  //     }


  //     return a.sent ? 1 : -1;
  //   });
  // }, [filteredData]);
  

  const sortedData = useMemo(() => {
    const currentDateObj = new Date(); // current date object
  
    return [...filteredData].sort((a, b) => {
      // Parse dates (null dates will be pushed to end)
      const aDate = a.today_rate_date
        ? new Date(a.today_rate_date.split("-").reverse().join("-"))
        : null;
      const bDate = b.today_rate_date
        ? new Date(b.today_rate_date.split("-").reverse().join("-"))
        : null;
  
      // First, push nulls to bottom
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
  
      // Then sort by most recent date first
      return bDate - aDate;
    });
  }, [filteredData]);
  

  


  const sendtodayWA = (row) => {
    // Find all clients for this distributor and today's date
    const filteredClients = users.filter(client =>
      client.Distributor_id === row.user_id &&
      client.date === currentDate
    );
  
    if (!row.phone_number) {
      alert("No phone number available for the distributor.");
      return;
    }
  
    if (filteredClients.length === 0) {
      alert("No clients found for today.");
      return;
    }
  
    let message = "🔹 *Distributor Report*\n\n";
    message += `Distributor Name : ${row.username}\n\n`;
  
    let totalLocalAmount = 0;
    let totalInterAmount = 0;
    let totalCollectionLocalAmount = 0;
    let totalCollectionInterAmount = 0;
  
    filteredClients.forEach((client, index) => {
      const todayRate = client.today_rate ? parseFloat(client.today_rate) : 1;
      const localAmount = client.amount && client.today_rate
        ? (parseFloat(client.amount) / todayRate).toFixed(3)
        : "N/A";
  
      const interAmount = parseFloat(client.amount) || 0;
      totalLocalAmount += parseFloat(localAmount) || 0;
      totalInterAmount += interAmount;
  
      let collectionLocalAmount = 0;
      let collectionInterAmount = 0;
  
      if (Array.isArray(client.paid_amount_date)) {
        client.paid_amount_date.forEach(payment => {
          collectionInterAmount += parseFloat(payment.amount) || 0;
          if (todayRate > 0) {
            collectionLocalAmount += (parseFloat(payment.amount) / todayRate) || 0;
          }
        });
      }
  
      totalCollectionLocalAmount += collectionLocalAmount;
      totalCollectionInterAmount += collectionInterAmount;
  
      message += `${index + 1} | Client Name : ${client.client_name || 'Unknown'}, \n     Date : ${client.date}, \n     Today Rate : ${todayRate.toFixed(2)}, \n     Local Amount : ${localAmount}, \n     International Amount : ${interAmount.toFixed(2)}, \n     Collection Local Amount : ${collectionLocalAmount.toFixed(3)}, \n     Collection Inter Amount : ${collectionInterAmount.toFixed(2)}.\n`;
      message += "------------------------------------------------------------------------------------------------\n";
    });
  
    // Append totals
    message += "\n🔹 *TOTAL CLIENT LOCAL AMOUNT:* " + totalLocalAmount.toFixed(3) + "\n";
    message += "🔹 *TOTAL CLIENT INTERNATIONAL AMOUNT:* " + totalInterAmount.toFixed(2) + "\n";
    message += "🔹 *TOTAL COLLECTION LOCAL AMOUNT:* " + totalCollectionLocalAmount.toFixed(3) + "\n";
    message += "🔹 *TOTAL COLLECTION INTERNATIONAL AMOUNT:* " + totalCollectionInterAmount.toFixed(2) + "\n";
  
    console.log(message);
  
    const phone = row.phone_number;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  
    window.open(whatsappLink, "_blank");
  };
  



  const [todayRateModal, setTodayRateModal] = useState(false);
  const [showData, setShowData] = useState(null);
  const [amount, setAmount] = useState("");

  const openTodayRateModal = (row) => {
    setTodayRateModal(true);
    setShowData(row);
  };


  // const handleSubmitupdate = async () => {
  //   if (!amount || !showData) {
  //     alert("Please enter an amount");
  //     return;
  //   }

  //   const currentDate = format(new Date(), "dd-MM-yyyy");

  //   const data = {
  //     user_id: showData.user_id,
  //     today_rate_date: currentDate,
  //     Distributor_today_rate: amount,
  //   };

  //   console.log("Sending data:", data);

  //   try {
  //     const response = await fetch(
  //       `${API_URL}/update-distributor-amount/${showData.user_id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(data),
  //       }
  //     );

  //     if (response.ok) {
  //       alert("Rate updated successfully!");
  //       setTodayRateModal(false);
  //       setAmount("");
  //       fetchEmployees();
  //     } else {
  //       const errorText = await response.text();
  //       console.error("Failed to update rate:", errorText);
  //       alert(`Failed to update rate: ${errorText}`);
  //     }
  //   } catch (error) {
  //     console.error("Error updating rate:", error);
  //     alert("An error occurred.");
  //   }
  // };
 

  const handleSubmitupdate = async () => {
    if (!amount || !showData) {
      alert("Please enter an amount");
      return;
    }
  
    const currentDate = format(new Date(), "dd-MM-yyyy");
  
    const data = {
      user_id: showData.user_id,
      today_rate_date: currentDate,
      Distributor_today_rate: amount,
    };
  
    console.log("Sending data:", data);
  
    try {
      const response = await fetch(
        `${API_URL}/update-distributor-amount/${showData.user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update rate:", errorText);
        alert(`Failed to update rate: ${errorText}`);
        return;
      }
  
      alert("Rate updated successfully!");
      setTodayRateModal(false);
      setAmount("");
      fetchEmployees();
  
      // 🟡 Step 2: Fetch clients
      const authToken = localStorage.getItem("authToken");
      const clientRes = await fetch(`${API_URL}/acc_list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      });
  
      if (!clientRes.ok) {
        console.error("Failed to fetch clients");
        return;
      }
  
      const clients = await clientRes.json();
  
      const targetClients = clients.filter(
        (client) =>
          client.Distributor_id === showData.user_id &&
          client.date === currentDate &&
          !client.today_rate
      );
  
     
      const updatePromises = targetClients.map((client) =>
        fetch(`${API_URL}/acc_clientupdated/${client.client_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          body: JSON.stringify({
            ...client,
            today_rate: amount,
          }),
        })
      );
  
      await Promise.all(updatePromises);
      console.log("Updated clients with new today_rate");
  
    } catch (error) {
      console.error("Error updating rate:", error);
      alert("An error occurred.");
    }
  };
  


  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 20);
  };



  const [amounts, setAmounts] = useState(() =>
    employees.reduce((acc, emp) => ({ ...acc, [emp.user_id]: "" }), {})
  );

  const handleAmountChange = (userId, value) => {
    setAmounts((prev) => ({ ...prev, [userId]: value }));
  };

  
  

// const handleSubmitUpdate2 = async () => {
 

//   const data = employees
//     .filter((emp) => emp.role === "Distributor" && emp.user_id)
//     .map((emp) => ({
//       user_id: emp.user_id,
//       today_rate_date: amounts[emp.user_id] 
//         ? currentDate
//         : emp.today_rate_date,
//       Distributor_today_rate: parseFloat(amounts[emp.user_id]) || emp.Distributor_today_rate,
//     }));

//   console.log("Sending data:", data);

//   try {
//     const response = await fetch(`${API_URL}/update-distributor-amounts`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     if (response.ok) {
//       alert("Rates updated successfully!");
//       setAmountSet(false);
//       fetchEmployees();
//       setSearchQuery("");
//     } else {
//       const errorText = await response.text();
//       console.error("Failed to update rates:", errorText);
//       alert(`Failed to update rates`);
//     }
//   } catch (error) {
//     console.error("Error updating rates:", error);
//     alert("An error occurred.");
//   }
// };



const handleSubmitUpdate2 = async () => {
  const currentDate = format(new Date(), "dd-MM-yyyy");

  // Step 1: Prepare distributor update data
  const data = employees
    .filter((emp) => emp.role === "Distributor" && emp.user_id)
    .map((emp) => ({
      user_id: emp.user_id,
      today_rate_date: amounts[emp.user_id] ? currentDate : emp.today_rate_date,
      Distributor_today_rate: parseFloat(amounts[emp.user_id]) || emp.Distributor_today_rate,
    }));

  console.log("Sending data to update distributors:", data);

  try {
    // Step 2: Update distributor rates
    const response = await fetch(`${API_URL}/update-distributor-amounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Distributor update response status:", response.status);
    if (response.ok) {
      const errorText = await response.text();
      console.error("Failed to update distributor rates:", errorText);
      alert("Failed to update distributor rates");
      return;
    }

    alert("Distributor rates updated successfully!");
    setAmountSet(false);
    fetchEmployees();
    setSearchQuery("");

    // Step 3: Fetch all clients
    const authToken = localStorage.getItem("authToken");
    const clientRes = await fetch(`${API_URL}/acc_list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    });

    if (!clientRes.ok) {
      console.error("Failed to fetch clients");
      alert("Client fetch failed");
      return;
    }

    const clients = await clientRes.json();
    console.log("Fetched clients:", clients);

    // Step 4: Filter and prepare client update requests
    const updatePromises = [];

    data.forEach((dist) => {
      const distributorClients = clients.filter((client) => {
        const clientDateFormatted = client.date
          ? format(new Date(client.date), "dd-MM-yyyy")
          : null;

        return (
          String(client.Distributor_id) === String(dist.user_id) &&
          clientDateFormatted === currentDate &&
          (client.today_rate === null ||
            client.today_rate === "" ||
            client.today_rate === 0)
        );
      });

      console.log(
        `Clients to update for distributor ${dist.user_id}:`,
        distributorClients
      );

      distributorClients.forEach((client) => {
        updatePromises.push(
          fetch(`${API_URL}/acc_clientupdated/${client.client_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: authToken,
            },
            body: JSON.stringify({
              ...client,
              today_rate: dist.Distributor_today_rate,
            }),
          })
        );
      });
    });

    // Step 5: Execute all client update requests
    await Promise.all(updatePromises);
    console.log("All relevant clients updated with new today_rate");

  } catch (error) {
    console.error("Error during multi-rate update:", error);
    // alert("An error occurred while updating rates or clients.");
  }
};




const autosetamount =() => {
         
}
 
  return (
    <div style={{ marginTop: "50px" }}>

      {loading ? (
        <div></div>
      ) : (
        <div style={{ marginTop: "50px" }}>
          <div className="page-header">
            <h1>Employee</h1>
            <small>Employee / Dash</small>
          </div>

          <div className="analytics">
            <div
              className={dashboardnav === "All" ? "cardAction" : "card"}
              onClick={DashboardAll}
            >
              <div className="card-head">
                <h2>{allEmployeeCount}</h2>
                <span className="las la-user-friends">
                  <FaUserTie />
                </span>
              </div>
              <div className="card-progress">
                <small>ALL</small>
              </div>
            </div>

            <div
              className={dashboardnav === "Admin" ? "cardAction" : "card"}
              onClick={Dashboardclient}
            >
              <div className="card-head">
                <h2>{adminCount}</h2>
                <span className="las la-user-friends">
                  <FaUserTie />
                </span>
              </div>
              <div className="card-progress">
                <small>ADMIN</small>
              </div>
            </div>

            <div
              className={
                dashboardnav === "Collection Manager" ? "cardAction" : "card"
              }
              onClick={Dashboardpaid}
            >
              <div className="card-head">
                <h2>{collectionManagerCount}</h2>
                <span className="las la-user-friends">
                  <FaUserTie />
                </span>
              </div>
              <div className="card-progress">
                <small>COLLECTION MANAGER</small>
              </div>  
            </div>

            <div
              className={
                dashboardnav === "Collection Agent" ? "cardAction" : "card"
              }
              onClick={Dashboardunpaid}
            >
              <div className="card-head">
                <h2>{collectionAgentCount}</h2>
                <span className="las la-user-friends">
                  <FaUserTie />
                </span>
              </div>
              <div className="card-progress">
                <small>COLLECTION AGENT</small>
              </div>
            </div>

            <div
              className={dashboardnav === "Distributor" ? "cardAction" : "card"}
              onClick={Dashboardother}
            >
              <div className="card-head">
                <h2>{Distributor}</h2>
                <span className="las la-user-friends">
                  <FaUserTie />
                </span>
              </div>
              <div className="card-progress">
                <small>DISTRIBUTOR</small>
              </div>
            </div>
          </div>

          <div className="">
            <div className="record-header">
              <div className="add">
                <Button className="w-auto" onClick={handleShow} >
                  Add New Employee
                </Button>
                <Button className="w-auto text-white" variant="info" onClick={() => setDistributormodal(!distributormodal)} >
                  Add New Distributor
                </Button>

                <Button className="w-auto text-white" onClick={() => setAmountSet(true)} >
                  Set Amount
                </Button>


                <Modal show={show} onHide={() => setShow(!show)} dialogClassName="custom-modal1"  >
                  <div className="dio" style={{ width: '70vw', }}>
                    <Modal.Header closeButton>
                      <Modal.Title>Add New Employee</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <form onSubmit={handleSubmit}>
                        <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                            />
                            <label>Employee Name</label>
                          </div>

                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="text"
                              value={phone_number}
                              onChange={(e) => setPhone_number(e.target.value)}
                              required
                            />
                            <label>Employee Contact Number</label>
                          </div>
                        </div>
                        <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              required
                            />
                            <label>City</label>
                          </div>

                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <select
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              style={{ border: 'none', background: 'none', color: 'black', fontWeight: 'bold', outline: 'none', boxShadow: 'none', margin: '0px', padding: '0px', paddingTop: '20px' }} >
                              <option value="">Employee Role</option>
                              <option value="Admin">Admin</option>
                              <option value="Collection Manager">
                                Collection Manager
                              </option>
                               <option value="Dtp">
                                Dtp
                              </option>
                              <option value="Collection Agent">Collection Agent</option>
                            </select>
                          </div>
                        </div>


                        <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="text"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                            <label>Enter The Email</label>
                          </div>

                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                            <label>Enter the Password</label>
                          </div>
                        </div>
                        <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="password"
                              value={Confirmpassword}
                              onChange={(e) => setConfirmpassword(e.target.value)}
                              required
                            />
                            <label>Confirm the Password</label>
                          </div>
                        </div>

                        <Modal.Footer className=" w-100 justify-content-center">
                          <Button variant="secondary" onClick={handleClose}>
                            Close
                          </Button>
                          <Button variant="primary" type="submit">
                            Save
                          </Button>
                        </Modal.Footer>
                      </form>
                    </Modal.Body>
                  </div>
                </Modal>



                <Modal show={distributormodal} onHide={() => setDistributormodal(!distributormodal)} dialogClassName="custom-modal1"  >
                  <div className="dio" style={{ width: '70vw', }}>
                    <Modal.Header closeButton>
                      <Modal.Title>Add New Distributor</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <form onSubmit={handleDistributorSubmit}>
                        <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-xxl-12 col-xl-12 col-md-12 col-12">
                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                            />
                            <label>Distributor Name</label>
                          </div>

                          <div className="txt_field col-xxl-5 col-xl-5 col-lg-5 col-md-10 col-sm-10">
                            <input
                              type="text"
                              value={phone_number}
                              onChange={(e) => setPhone_number(e.target.value)}
                              required
                            />
                            <label>Distributor Contact Number</label>
                          </div>
                        </div>
                        <Modal.Footer className=" w-100 justify-content-center">
                          <Button variant="secondary" onClick={() => setDistributormodal(!distributormodal)}>
                            Close
                          </Button>
                          <Button variant="primary" type="submit">
                            Save
                          </Button>
                        </Modal.Footer>
                      </form>
                    </Modal.Body>
                  </div>
                </Modal>
              </div>

              <div className="browse">
                <div style={{ paddingTop: "15px" }}>
                  <InputGroup className="mb-3">
                    <FormControl
                      placeholder="Name OR phoneNumber"
                      aria-label="Search"
                      className="record-search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            <div>
              <div className="table-responsive-md table-responsive-sm">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>EMPLOYEE NAME</th>
                      <th>ROLE</th>
                      <th>CITY</th>
                      <th>EMAIL</th>
                      <th>Today Rate</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                sortedData.length > 0 ? (
                  sortedData.slice(0, visibleCount).map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="client">
                            <div
                              className="client-img bg-img"
                              style={{
                                backgroundImage: `url(${imageExists(
                                  "https://i.pinimg.com/564x/8d/ff/49/8dff49985d0d8afa53751d9ba8907aed.jpg"
                                )})`,
                              }}
                            ></div>
                            <div className="client-info">
                              <h4>{row.username ? row.username.toUpperCase() : "UNKNOWN"}</h4>
                              <small>{row.phone_number ? row.phone_number.toUpperCase() : "NO PHONE NUMBER"}</small>
                            </div>
                          </div>
                        </td>
                        <td>{row.role ? row.role.toUpperCase() : "UNKNOWN ROLE"}</td>
                        <td>{row.city ? row.city.toUpperCase() : "UNKNOWN CITY"}</td>
                        <td>{row.email ? row.email : "UNKNOWN EMAIL"}</td>
                        <td>
                          {row.role === "Distributor" && row.today_rate_date
                            ? (row.today_rate_date === currentDate)
                              ? row.Distributor_today_rate || "0"
                              : "0"
                            : "-"}
                        </td>
                        <td>
                          <div className="actions d-flex justify-content-start align-items-center pt-2">
                            <span
                              className=""
                              style={{
                                cursor: "pointer",
                                fontSize: "11px",
                                backgroundColor: "#42b883",
                                padding: "5px 10px",
                                color: "white",
                                borderRadius: "10px",
                              }}
                              onClick={() => handlenav(row)}
                            >
                              VIEW
                            </span>
                            <span
                              className=""
                              style={{
                                cursor: "pointer",
                                fontSize: "11px",
                                backgroundColor: "#dc2f2f",
                                padding: "5px 10px",
                                color: "white",
                                borderRadius: "10px",
                              }}
                              onClick={() => showConfirm(row.user_id, row.username)}
                            >
                              DELETE
                            </span>
                            {
                              row.role === "Distributor" ? (<span
                                className=""
                                style={{
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  backgroundColor: "#6957fc",
                                  padding: "5px 10px",
                                  color: "white",
                                  borderRadius: "10px",
                                }}
                                // onClick={() => showConfirm(row.user_id, row.username)}
                                onClick={() => openTodayRateModal(row)}
                              >
                                Today Rate
                              </span>) : (<span></span>)
                            }
                            {/* {
                              row.role === "Distributor" && row.today_rate_date === currentDate ? (
                            <span
                              className=""
                              style={{
                                cursor: "pointer",
                                fontSize: "11px",
                                backgroundColor: "#42b894",
                                padding: "5px 10px",
                                color: "white",
                                borderRadius: "10px",
                              }}
                              onClick={() => sendtodayWA()}
                            >
                              WhatsApp
                            </span>):(<span></span>)
                            } */}
                            {row.role === "Distributor" && row.today_rate_date === currentDate ? (
  <span
    style={{
      cursor: "pointer",
      fontSize: "11px",
      backgroundColor: "#42b894",
      padding: "5px 10px",
      color: "white",
      borderRadius: "10px",
    }}
    onClick={() => sendtodayWA(row)}  // PASS the row to the function
  >
    WhatsApp
  </span>
) : (
  <span></span>
)}


                          </div>
                        </td>
                      </tr>
                    ))):<tr>
                    <td colSpan="11" className="text-center">No data available</td>
                  </tr>}
                  </tbody>
                </table>
                {visibleCount < sortedData.length && (
            <div className="d-flex  justify-content-end  mt-3 px-2"><p onClick={handleShowMore} className="nextData">Show More {">>"}</p></div>
          )}
              </div>
            </div>
          </div>


          <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete the client "<span className="fw-bold">{employeeNameToDelete}</span>"?              </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (employeeIdToDelete) {
                    handleDelete(employeeIdToDelete);
                  }
                }}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={todayRateModal} onHide={() => setTodayRateModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Update Today's Rate</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="todayRateAmount">
                  <Form.Label>Enter Amount</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setTodayRateModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleSubmitupdate}>
                Update
              </Button>
            </Modal.Footer>
          </Modal>



      


        


<Modal show={amountSet} onHide={() => { setAmountSet(false); setSearchQuery(""); }}>
  <Modal.Header closeButton>
    <Modal.Title>Amount Set</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Search Bar for Filtering Distributors */}
    <input   style={{border:" solid  #1246ac", color:'#1246ac'}}
      
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
      className="form-control mb-3 custom-placeholder "
      placeholder="Search Distributor"
    />

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
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => {
        setAmountSet(false);
        setSearchQuery("");
      }}
    >
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSubmitUpdate2}>
      Update
    </Button>
  </Modal.Footer>
</Modal>

          <Toast
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 9999,
              backgroundColor: " #1246ac",
              color: "white",
            }}
            show={showToast} onClose={() => setShowToast(false)}
            delay={3000}
            autohide
          >
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </div>
      )}


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
    </div>
  );
}

export default Employee;

