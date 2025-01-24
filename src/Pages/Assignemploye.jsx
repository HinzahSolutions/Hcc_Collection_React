import React,{useEffect,useState} from 'react'
import { setUsers, setSelectedClient } from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaTelegramPlane } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

function Assignemploye() {
    const API_URL = import.meta.env.VITE_API_URL;
    const dispatch = useDispatch();
    const users = useSelector((state) => state.clients.users);
     const employees = useSelector((state) => state.employees.employees);
    const [assign, setAssign] = useState([]);
    const [employeeId, setEmployeeId] = useState("");
    const [sendModal, setSendModal] = useState(false);
    const selectedClient = useSelector((state) => state.clients.selectedClient);
  

     useEffect(() => {
          const unassigned = users.filter((assigns) => assigns.sent == false);
        
          if (unassigned.length > 0) {
            setAssign(unassigned); // Update state with all unassigned users
            console.log("Unassigned Users:", unassigned); // Log them directly
          }
        }, [users]);

        
          const handleClientClick = (client) => {
            dispatch(setSelectedClient(client));
            setSendModal(true);
          };


        
//   const handlesend = async (client_id) => {
//     const sendData = {
//       client_id,
//       user_id: employeeId,
//       sent: true,
//     };

//     try {
//       const response = await fetch(`${API_URL}/client_IDupdated/${client_id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(sendData),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update client");
//       }

//       const result = await response.json();
//      console.log(result)
//       setSendModal(false);
//       alert("Employee assignment successful");
//     } catch (error) {
//       console.error("Fetch error:", error);
//     }
//   };




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
    <div> {assign.length > 0 ? (
        <div className="records table-responsive">
        <div className="record-header">
        <div className="add">
        <h4  style={{textAlign:'center',padding:'10px'}}>Assign Employee</h4>
        </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>City</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          {assign.map((row, index) => (
            <tbody>
              <tr key={index}>
                <td>{row.client_id || "N/A"}</td>
                <td>
                  <div className="client">
                    <div
                      className="client-img bg-img"
                      style={{
                        backgroundImage: row.client_image
                          ? `url(${row.client_image})`
                          : "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
                      }}
                    ></div>
                    <div className="client-info">
                      <h4>{row.client_name || "Unknown Client"}</h4>
                      <small>
                        {row.client_contact || "No contact available"}
                      </small>
                    </div>
                  </div>
                </td>
                <td>{row.client_city || "Unknown City"}</td>
                <td>
                  {row.amount && row.amount !== "null"
                    ? `${row.amount}  KWD `
                    : "0  KWD"}
                </td>
                <td>{row.date}</td>
                <td>
                  <div className="actions">
                    <span
                      className="lab la-telegram-plane"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleClientClick(row)}
                    >
                      {" "}
                      <FaTelegramPlane />{" "}
                    </span>
                    <span
                      className="bi bi-trash3"
                      style={{ cursor: "pointer" }}
                    >
                      {" "}
                      <MdEdit />{" "}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          ))}
         
        </table>
        </div>
      ) : (
        <span></span>
      )}
      
      <Modal show={sendModal} onHide={() => setSendModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Assign Employee</Modal.Title>
              </Modal.Header>
              {selectedClient ? (
                <Modal.Body>
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
                    <div className="txt_field">
                      <h4>Amount</h4>
                      <input type="number" value={selectedClient.amount} readOnly />
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
                </Modal.Body>
              ) : (
                <p>No client selected</p>
              )}
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
            </Modal></div>
  )
}

export default Assignemploye