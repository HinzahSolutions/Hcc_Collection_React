import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, InputGroup, FormControl, Toast, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import "../Css/dashboard.css";
import { FaUserTie } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { useNavigate } from "react-router-dom";
import { parse, subDays, format, parseISO } from "date-fns";
import { GiReceiveMoney } from "react-icons/gi";

function Allemployee() {
    const [loading, setLoading] = useState(false)
    const API_URL = import.meta.env.VITE_API_URL;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const employees = useSelector((state) => state.employees.employees);
    const users = useSelector((state) => state.clients.users || []);
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [Confirmpassword, setConfirmpassword] = useState("");
    const [username, setUsername] = useState("");
    const [phone_number, setPhone_number] = useState("");
    const [dashboardnav, setDashboardnav] = useState("Admin");
    const [role, setRole] = useState("");
    const [city, setCity] = useState("");
    const [search, setSearch] = useState("")
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [employeeIdToDelete, setemployeeIdToDelete] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [employeeNameToDelete, setemployeeNameToDelete] = useState('');


    const handleClose = () => {
        setShow(false)
    }

    const Dashboardadmin = () => setDashboardnav("Admin");
    const Dashboardcollection = () => setDashboardnav("Collection Manager");
    const Dashboardagent = () => setDashboardnav("Collection Agent");
    const Dashboardother = () => setDashboardnav("Dtp");



    const showConfirm = (clientId, clientName) => {
        setemployeeIdToDelete(clientId);
        setemployeeNameToDelete(clientName);
        setShowConfirmModal(true);
    };

    const handlenav = (client) => {
        dispatch(setSelectedEmployee(client));
        console.log(client)
        navigate("/employee/employeeinfo");
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

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
                console.log("employee list", data)
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

    const [filteredEmployees, setFilteredEmployees] = useState([]);

    useEffect(() => {
        const filtered = employees
            .filter((emp) => emp.role === dashboardnav)
            .filter((emp) =>
                emp.username?.toLowerCase().includes(search.toLowerCase()) ||
                emp.phone_number?.includes(search)
            );
        console.log("filter data", filtered)
        setFilteredEmployees(filtered);
    }, [employees, dashboardnav, search]);


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


  const roleCounts = useMemo(() => {
  const counts = {
    Admin: 0,
    "Collection Manager": 0,
    "Collection Agent": 0,
    Dtp: 0,
  };

  employees.forEach((emp) => {
    if (counts.hasOwnProperty(emp.role)) {
      counts[emp.role]++;
    }
  });

  return counts;
}, [employees]);


  const imageExists = (url) => {
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      return "/images/fallback.jpg";
    };
    return url;
  };


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




    return (
        <div style={{ marginTop: "50px", width: '100%' }}>
            <div className="page-header">
                <h1>Admin Page</h1>
                <small>Admin / Dash</small>
            </div>
            <div className="analytics">
                <div className={
                    dashboardnav === "Admin" ? "cardAction" : "card"
                }
                    onClick={Dashboardadmin}
                >
                    <div className="card-head">
                        <h2>{roleCounts.Admin}</h2>
                        <span className="las la-user-friends">
                            <FaUserTie />
                        </span>
                    </div>
                    <div className="card-progress">
                        <small>Admin</small>
                    </div>
                </div>
                <div className={
                    dashboardnav === "Collection Manager" ? "cardAction" : "card"
                }
                    onClick={Dashboardcollection}  >
                    <div className="card-head">
                        <h2>{roleCounts["Collection Manager"]}</h2>
                        <span className="las la-user-friends">
                            <FaUserTie />
                        </span>
                    </div>
                    <div className="card-progress">
                        <small>Collection Manager</small>
                    </div>
                </div>
                <div className={
                    dashboardnav === "Collection Agent" ? "cardAction" : "card"
                }
                    onClick={Dashboardagent}  >
                    <div className="card-head">
                        <h2>{roleCounts["Collection Agent"]}</h2>
                        <span className="las la-user-friends">
                            <FaUserTie />
                        </span>
                    </div>
                    <div className="card-progress">
                        <small>Collection Agent</small>
                    </div>
                </div>
                <div className={
                    dashboardnav === "Dtp" ? "cardAction" : "card"
                }
                    onClick={Dashboardother}  >
                    <div className="card-head">
                        <h2>{roleCounts.Dtp}</h2>
                        <span className="las la-user-friends">
                            <FaUserTie />
                        </span>
                    </div>
                    <div className="card-progress">
                        <small>DTP</small>
                    </div>
                </div>
            </div>
            <div className="record-header">
                <div className="add">
                    <Button className="w-auto" onClick={() => setShow(true)} >NEW</Button>
                </div>
                <div className="browse">
                    <div style={{ paddingTop: "15px" }}>
                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Name OR phoneNumber"
                                aria-label="Search"
                                className="record-search"
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
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
                            <th>EMPLOYEE NAME</th>
                            <th>ROLE</th>
                            <th>CITY</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((value, index) => (
                            <tr key={value.user_id}>
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
                                  <h4>{value.username ? value.username.toUpperCase() : "UNKNOWN"}</h4>
                                  <small>{value.phone_number ? value.phone_number.toUpperCase() : "NO PHONE NUMBER"}</small>
                                </div>
                              </div>
                            </td>

                                <td>{value.role}</td>
                                <td>{value.city}</td>
                                <td>
                                    <div className="actions d-flex justify-content-start align-items-center pt-3 gap-1">
                                        <span
                                            style={{
                                                cursor: "pointer",
                                                fontSize: "11px",
                                                backgroundColor: "#42b883",
                                                padding: "3px 5px",
                                                color: "white",
                                                borderRadius: "4px",
                                            }}
                                            onClick={() => handlenav(value)}
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
                                            onClick={() => showConfirm(value.user_id, value.username)}
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

            <Modal show={show} onHide={() => setShow(!show)} dialogClassName="custom-modal1"  >
                <div className="dio" style={{ width: '70vw', }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Employee</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit} >
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



        </div>
    )
}

export default Allemployee
