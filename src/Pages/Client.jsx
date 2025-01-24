import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, InputGroup, FormControl, Toast  } from "react-bootstrap";
import { HiUsers } from "react-icons/hi2";
import { GiReceiveMoney } from "react-icons/gi";
import { FaTelegramPlane } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import {
  setUsers,
  setSelectedClient,
  setSearchQuery,
} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MdDelete } from "react-icons/md";

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
  const [todayrate,setTodayRate] = useState();
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [bname,setBname] = useState("")
  const [anumber,setAnumber] = useState("")
  const [ifsc,setIfsc] = useState("")
  const [holdername,setHoldername] = useState("")
  const [holderaddress,setHolderadderss] = useState("")
  const [type,setType] = useState("")
  const [senderinfo,setSenderinfo] = useState("")

  const users = useSelector((state) => state.clients.users || []);

  const employees = useSelector((state) => state.employees.employees);
  const selectedClient = useSelector((state) => state.clients.selectedClient);
  const searchQuery = useSelector((state) => state.clients.searchQuery);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false); 
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameToDelete, setClientNameToDelete] = useState('');

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
        .then((response) =>{ if (response.status === 401) {
          console.error("Unauthorized access - redirecting to login");
          handleUnauthorizedAccess();
          return;
        } 
        return response.json();
      })
        .then((data) => dispatch(setUsers(data)))
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
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login");
  };
  
  // useEffect(() => {
  //   const Authorization = localStorage.getItem("authToken");
  //   if (Authorization) {
  //     fetch(`${API_URL}/acc_list`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: Authorization,
  //       },
  //     })

  //       .then((response) => response.json())
  //       .then((data) => dispatch(setUsers(data)))
  //       .catch((error) => console.error("Fetch error:", error));
  //   } else {
  //     console.error("No authorization token found in localStorage");
  //   }
  // }, [dispatch, users]); 
  
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

  // const filteredData = useMemo(() => {
  //   return users.filter((row) => {
  //     const clientName = row.client_name || "";
  //     const clientContact = row.client_contact || "";
  //     const query = searchQuery || "";
  //     const paid_and_unpaid = row.paid_and_unpaid;

  //     return (
  //       (clientName.toLowerCase().includes(query.toLowerCase()) ||
  //         clientContact.includes(query)) &&
  //       (dashboardNav === "client" ||
  //         (dashboardNav === "paid" && paid_and_unpaid == 1) ||
  //         (dashboardNav === "unpaid" && paid_and_unpaid == 0))
  //     );
  //   });
  // }, [users, searchQuery, dashboardNav]);


  const filteredData = useMemo(() => {
    if (!Array.isArray(users)) return []; // Ensure users is an array
    
    return users.filter((row) => {
      const clientName = row.client_name || "";
      const clientContact = row.client_contact || "";
      const query = searchQuery || "";
      const paid_and_unpaid = row.paid_and_unpaid;
  
      return (
        (clientName.toLowerCase().includes(query.toLowerCase()) ||
          clientContact.includes(query)) &&
        (dashboardNav === "client" ||
          (dashboardNav === "paid" && paid_and_unpaid == 1) ||
          (dashboardNav === "unpaid" && paid_and_unpaid == 0))
      );
    });
  }, [users, searchQuery, dashboardNav]);
  


  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDate = format(new Date(), "dd-MM-yyyy");
  
    const clientData = {
      client_name: clientName,
      client_contact: contactNumber,
      client_city: city,
      amount: amount,
      today_rate: todayrate,
      date: currentDate,
      sent: false,
      message: message,
      paid_and_unpaid: false,
      success_and_unsuccess: false,
      bank_name: bname,
      accno: anumber,
      ifsc_code: ifsc,
      accoun_type: type,
      name_of_the_beneficiary: holdername,
      address_of_the_beneficiary: holderaddress,
      sender_information: senderinfo,
    };
  
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
      return a.sent === b.sent ? 0 : a.sent ? 1 : -1;
    });
  }, [filteredData]);


  const handleDelete = (clientId) => {
    
    fetch(`${API_URL}/acc_delete/${clientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        
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
        dispatch(setUsers(updatedData));
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
        
        // Close the modal
        setSendModal(false);
        alert("Employee assignment successful");
    
        // Re-fetch updated client data
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
  
  
  return (
    <div style={{ marginTop: "50px",width:'100%' }}>
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

      <div className="records table-responsive">
        <div className="record-header">
          <div className="add">
            <Button   className="w-auto"  onClick={handleShow}>
              Add New
            </Button>
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

        {/* <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>City</th>
                <th>Total</th>
                <th>Status</th>
                <th>Last Paid Date</th>
                <th>Totally Paid Amount </th>
                <th>Balance Amount</th>
                <th>Collection Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index}>
                  <td>{row.client_id}</td>
                  <td>
                    <div className="client">
                      <div
                        className="client-img bg-img"
                        style={{
                          backgroundImage:
                            "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
                        }}
                      ></div>
                      <div className="client-info">
                        <h4>
                          {row.client_name
                            ? row.client_name.replace(/"/g, "")
                            : ""}
                        </h4>
                        <small>{row.client_contact}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {row.client_city ? row.client_city.replace(/"/g, "") : ""}
                  </td>
                  <td>
                    {row.amount ? row.amount : 0}{" "}
                    <span style={{ fontWeight: "bolder", color: "black" }}>
                      KWD
                    </span>
                  </td>
                  <td>
  <p
    className={`badge ${
      row.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"
    }`}
  >
    {row.paid_and_unpaid == 1 ? "Paid" : "Unpaid"}
  </p>
</td>
                  <td  className="">
                    {Array.isArray(row.paid_amount_date) &&
                      row.paid_amount_date.length > 0 ? (
                      <div>
                        <div>
                          {
                            row.paid_amount_date[
                              row.paid_amount_date.length - 1
                            ].date
                          }
                        </div>
                      </div>
                    ) : (
                      <span  className="text-">-</span>
                    )}
                  </td>

                  <td>
                    {Array.isArray(row.paid_amount_date) &&
                      row.paid_amount_date.length > 0 ? (
                      <>
                        {row.paid_amount_date.map((entry, idx) => (
                          <div key={idx}></div>
                        ))}
                        <div>
                          {" "}
                          {row.paid_amount_date
                            .reduce(
                              (total, entry) =>
                                total + parseFloat(entry.amount || 0),
                              0
                            )
                            .toFixed(2)}{" "}
                          <span
                            style={{ fontWeight: "bolder", color: "black" }}
                          >
                            KWD
                          </span>
                        </div>
                      </>
                    ) : (
                      <span>No payments yet</span>
                    )}
                  </td>
                  <td>
                    {Array.isArray(row.paid_amount_date) &&
                      row.paid_amount_date.length > 0 ? (
                      <>
                        <div>
                          {" "}
                          {(
                            (row.amount ? parseFloat(row.amount) : 0) -
                            row.paid_amount_date.reduce(
                              (total, entry) =>
                                total + parseFloat(entry.amount || 0),
                              0
                            )
                          ).toFixed(2)}
                          <span
                            style={{ fontWeight: "bolder", color: "black" }}
                          >
                            KWD
                          </span>
                        </div>
                      </>
                    ) : (
                      <span>No payments yet</span>
                    )}
                  </td>
                 
                  <td>
  {employees.length > 0 && row.user_id ? (
    employees.some((eid) => eid.user_id === row.user_id) ? (
      employees
        .filter((eid) => eid.user_id === row.user_id)
        .map((eid, idx) => (
          <span key={idx} onClick={() => handlenav1(eid)}>
            {eid.username}
          </span>
        ))
    ) : (
      <span>No agent assigned</span>
    )
  ) : (
    <span>No agent</span>
  )}
</td>
                  <td>
                    <div className="actions">
                      {row.sent == false ? (
                        <span
                          className="lab la-telegram-plane"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleClientClick(row)}
                        >
                          <FaTelegramPlane />
                        </span>
                      ) : (
                        <span></span>
                      )}

                      <span
                        className="las la-eye"
                        style={{ cursor: "pointer" }}
                        onClick={() => handlenav(row)}
                      >
                        <IoEyeSharp />
                      </span>
                      <span
                        className="bi bi-trash3"
                        style={{ cursor: "pointer" }}
                        onClick={() => showConfirm(row.client_id,row.client_name)}
                      >
                       <MdDelete />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}

        <div className="table-responsive-md table-responsive-sm">
  <table className="table table-striped">
    <thead>
      <tr>
        <th>#</th>
        <th>Client</th>
        <th>City</th>
        <th>Total</th>
        <th>Status</th>
        <th>Last Paid Date</th>
        <th>Totally Paid Amount</th>
        <th>Balance Amount</th>
        <th>Collection Agent</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {sortedData.map((row, index) => (
        <tr key={index}>
          <td>{row.client_id}</td>
          <td>
            <div className="client">
              <div
                className="client-img bg-img"
                style={{
                  backgroundImage:
                    "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
                }}
              ></div>
              <div className="client-info">
                <h4>{row.client_name ? row.client_name.replace(/"/g, "") : ""}</h4>
                <small>{row.client_contact}</small>
              </div>
            </div>
          </td>
          <td>{row.client_city ? row.client_city.replace(/"/g, "") : ""}</td>
          <td>
            {row.amount ? row.amount : 0}{" "}
            <span style={{ fontWeight: "bolder", color: "black" }}>KWD</span>
          </td>
          <td>
            <p
              className={`badge ${
                row.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"
              }`}
            >
              {row.paid_and_unpaid == 1 ? "Paid" : "Unpaid"}
            </p>
          </td>
          <td>
            {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
              <div>{row.paid_amount_date[row.paid_amount_date.length - 1].date}</div>
            ) : (
              <span>-</span>
            )}
          </td>
          <td>
            {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
              <>
                <div>
                  {row.paid_amount_date
                    .reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
                    .toFixed(2)}{" "}
                  <span style={{ fontWeight: "bolder", color: "black" }}>KWD</span>
                </div>
              </>
            ) : (
              <span>No payments yet</span>
            )}
          </td>
          <td>
            {Array.isArray(row.paid_amount_date) && row.paid_amount_date.length > 0 ? (
              <>
                <div>
                  {(
                    (row.amount ? parseFloat(row.amount) : 0) -
                    row.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
                  ).toFixed(2)}
                  <span style={{ fontWeight: "bolder", color: "black" }}>KWD</span>
                </div>
              </>
            ) : (
              <span>No payments yet</span>
            )}
          </td>
          <td>
            {employees.length > 0 && row.user_id ? (
              employees.some((eid) => eid.user_id === row.user_id) ? (
                employees
                  .filter((eid) => eid.user_id === row.user_id)
                  .map((eid, idx) => (
                    <span key={idx} onClick={() => handlenav1(eid)}>
                      {eid.username}
                    </span>
                  ))
              ) : (
                <span>No agent assigned</span>
              )
            ) : (
              <span>No agent</span>
            )}
          </td>
          <td>
            <div className="actions">
              {row.sent == false ? (
                <span
                  className="lab la-telegram-plane"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClientClick(row)}
                >
                  <FaTelegramPlane />
                </span>
              ) : (
                <span></span>
              )}
              <span
                className="las la-eye"
                style={{ cursor: "pointer" }}
                onClick={() => handlenav(row)}
              >
                <IoEyeSharp />
              </span>
              <span
                className="bi bi-trash3"
                style={{ cursor: "pointer" }}
                onClick={() => showConfirm(row.client_id, row.client_name)}
              >
                <MdDelete />
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
                  style={{ padding: "0px 0px 0px 0px", border: "none" }}
                >
                 {employees.map(
                          (emp) =>
                            emp.role === "Collection Agent" && (
                              <option
                                key={emp.user_id}
                                value={emp.user_id}
                                style={{ fontSize: "15px" }}
                              >
                                {emp.username}
                              </option>
                            )
                        )}
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


      <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Client</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={handleSubmit}>
                <div className="txt_field">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                  <label>Client Name</label>{" "}
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                  <label>Client Contact Number</label>
                </div>

                <div className="txt_field">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <label>city</label>
                </div>

                <div className="txt_field">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <label>Amount</label>
                </div>

                <div className="txt_field">
                  <input
                    type="number"
                    value={todayrate}
                    onChange={(e) => setTodayRate(e.target.value)}
                    required
                  />
                  <label>Today Rate</label>
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={bname}
                    onChange={(e) => setBname(e.target.value)}
                    required
                  />
                  <label>Bank Name</label>
                </div>
                
                <div className="txt_field">
                  <input
                    type="text"
                    value={anumber}
                    onChange={(e) => setAnumber(e.target.value)}
                    required
                  />
                  <label>Account Number</label>
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    required
                  />
                  <label>Ifsc code</label>
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={holdername}
                    onChange={(e) =>  setHoldername(e.target.value)}
                    required
                  />
                  <label>Name of the beneficiary</label>
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={holderaddress}
                    onChange={(e) => setHolderadderss(e.target.value)}
                    required
                  />
                  <label>Address of the beneficiary</label>
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  />
                  <label>Account type</label>
                </div>
                <div className="txt_field">
                  <input
                    type="text"
                    value={senderinfo}
                    onChange={(e) => setSenderinfo(e.target.value)}
                    required
                  />
                  <label>Sender Informattion</label>
                </div>



                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Body>
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
          backgroundColor:"green",
          color:"white",
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

export default Client;
