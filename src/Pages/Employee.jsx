
import React, { useState, useEffect } from "react";
import { Button, Modal, InputGroup, FormControl, Toast } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import "../Css/dashboard.css";

import { FaUserTie } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

import { IoEyeSharp } from "react-icons/io5";

import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { MdDelete } from "react-icons/md";


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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Confirmpassword, setConfirmpassword] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [users, setUsers] = useState([]);

  const employees = useSelector((state) => state.employees.employees);
  const [loading, setLoading] = useState(false); // Loading state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [employeeIdToDelete, setemployeeIdToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false); // State to control the toast notification
  const [toastMessage, setToastMessage] = useState('');
  const [employeeNameToDelete, setemployeeNameToDelete] = useState('');

  // Fetch Employees function
  const fetchEmployees = async () => {
    setLoading(true); // Set loading to true when fetching starts
    const Authorization = localStorage.getItem("authToken");

    // Ensure the token exists before making the request
    if (Authorization) {
      try {
        const response = await fetch(`${API_URL}/list`, {
          method: "GET", // Use GET method for fetching data
          headers: {
            "Content-Type": "application/json",
            Authorization: Authorization, // Include token in the Authorization header
          },
          
        });

        if (response.status === 401) {
          console.error("Unauthorized access - redirecting to login");
          handleUnauthorizedAccess();
          return;
        }
        const data = await response.json();

        dispatch(setEmployees(data)); // Dispatch to update the employees list in Redux
      } catch (error) {
        console.error("Fetch error:", error);
       
      } finally {
        setLoading(false); // Set loading to false when fetching is done
      }
    } else {
      console.error("No authorization token found in localStorage");
      setLoading(false); // Set loading to false if no token is found
    }
  };

  // Call the fetchEmployees function inside useEffect
  useEffect(() => {
    fetchEmployees();
  }, [dispatch]);

  // Dispatch the fetched data to Redux once it is loaded
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

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //    // Prevent the default form submission behavior

  //   const employeeData = new FormData();

  //   // Append all fields to FormData
  //   employeeData.append("username", username);
  //   employeeData.append("email", email);
  //   employeeData.append("password", password);
  //   employeeData.append("phone_number", phone_number);
  //   employeeData.append("city", city);
  //   employeeData.append("role", role);

  //   // Send the POST request with FormData
  //   fetch(`${API_URL}/signup`, {
  //     method: "POST",
  //     body: employeeData,
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         return response.json();
  //       }
  //       throw new Error("Something went wrong!");
  //     })
  //     .then((data) => {
  //       alert("New Employee successfully created");
  //       setShow(false);
        
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };


  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    const Authorization = localStorage.getItem("authToken");
  
    if (!Authorization) {
      console.error("Authorization token is missing");
      return;
    }
  
    try {
      // First, fetch the employee list
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
  
      // Assuming you want to create an employee after fetching the list
      const employeeData = new FormData();
      employeeData.append("username", username);
      employeeData.append("email", email);
      employeeData.append("password", password);
      employeeData.append("phone_number", phone_number);
      employeeData.append("city", city);
      employeeData.append("role", role);
  
      // Send the POST request to create a new employee
      const signupResponse = await fetch(`${API_URL}/signup`, {
        method: "POST",
        body: employeeData,
      });
  
      if (!signupResponse.ok) {
        throw new Error("Something went wrong!");
      }
  
      const data = await signupResponse.json();
      alert("New Employee successfully created");
      setShow(false);
  
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  const Dashboardclient = () => setDashboardnav("Admin");
  const Dashboardpaid = () => setDashboardnav("Collection Manager");
  const Dashboardunpaid = () => setDashboardnav("Collection Agent");
  const DashboardAll = () => setDashboardnav("All");
  const Dashboardother = () => setDashboardnav("other");

  const imageExists = (url) => {
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      return "/images/fallback.jpg"; // Fallback image
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
            row.role === "Collection Agent"))
      );
    });
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlenav = (client) => {
    dispatch(setSelectedEmployee(client));
    navigate("/employeeinfo");
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
  
      // Fetch updated employee list
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
             <small>All</small>
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
            <small>Admin</small>
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
             <small>Collection Manager</small>
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
             <small>Collection Agents</small>
           </div>
         </div>

        <div
         className={dashboardnav === "other" ? "cardAction" : "card"}
           onClick={Dashboardother}
         >
           <div className="card-head">
            <h2>0</h2>
             <span className="las la-user-friends">
               <FaUserTie />
             </span>
           </div>
           <div className="card-progress">
             <small>Distributor</small>
           </div>
         </div>
       </div>

       <div className="records table-responsive">
         <div className="record-header">
           <div className="add">
             <Button className="w-auto" onClick={handleShow}>
              Add New Employee
            </Button>

            <Modal show={show} onHide={handleClose}    dialogClassName="custom-modal1"  >
            <div className="dio" style={{ width: '70vw',}}>
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
                       style={{ border: "none" }}
                     >
                       <option value="">Employee Role</option>
                       <option value="Admin">Admin</option>
                       <option value="Collection Manager">
                         Collection Manager
                       </option>
                       <option value="Collection Agent">Collection Agent</option>
                       <option value="Distributor">Distributor</option>
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

                  <Modal.Footer  className=" w-100 justify-content-center">
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
      <th>ACTIONS</th>
    </tr>
  </thead>
  <tbody>
    {filteredData.map((row, index) => (
      <tr key={index}>
        <td>{row.user_id ? row.user_id.toString().toUpperCase() : "N/A"}</td>
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
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

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
     

      
       <Toast
         style={{
           position: 'fixed',
          top: 20,
          right: 20,
           zIndex: 9999,
           backgroundColor:" #1246ac",
           color:"white",
         }}
         show={showToast}         onClose={() => setShowToast(false)}
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

