import React, { useEffect, useState, useMemo } from 'react'
import { setUsers, setSelectedClient } from "../Slicers/clientSlice";

import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { format, parse } from "date-fns";

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
      setAssign(unassigned);
      console.log("Unassigned Users:", unassigned);
    }
  }, [users]);
 

  const handleClientClick = (client) => {
    dispatch(setSelectedClient(client));
    setSendModal(true);
  };
  const handlesend = async (client_id) => {

       const currentDate = format(new Date(), "dd-MM-yyyy");
    console.log(employeeId)
    const sendData = {
      client_id,
      user_id: employeeId,
      sent: 1,
      assigned_date: currentDate, 
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
  const sortedData = useMemo(() => {
    return [...assign].sort((a, b) => {
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
  }, [assign]);
  return (
    <div> {sortedData.length > 0 ? (
      <div className=" ">
        <div className="record-header">
          <div className="add">
            <h4 style={{ textAlign: 'center', padding: '10px' }}>Assign Employee</h4>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>CLIENT</th>
              <th>CITY</th>
              <th>AMOUNT</th>
              <th>TODAY RATE</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          {sortedData.map((row, index) => (
            <tbody key={index}>
              <tr>
                <td>{index +1}</td>
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
                      <h4>{row.client_name ? row.client_name.toUpperCase() : "UNKNOWN CLIENT"}</h4>
                      <small>{row.client_contact ? row.client_contact.toUpperCase() : "NO CONTACT AVAILABLE"}</small>
                    </div>
                  </div>
                </td>
                <td>{row.client_city ? row.client_city.toUpperCase() : "UNKNOWN CITY"}</td>

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
               <td>{parseFloat(row.today_rate).toFixed(2)}</td>
                <td>{row.date ? row.date.toUpperCase() : "UNKNOWN DATE"}</td>
                <td>
                  <div className="actions">
<<<<<<< HEAD
                    <span className=""
                      style={{cursor: "pointer",fontSize: "11px",backgroundColor: "#00bbf0",padding: "5px 10px 5px 10px",color: "white",borderRadius: "10px",}}
=======
                    <span
                      className=""
                      style={{
                        cursor: "pointer",
                        fontSize: "11px",
                        backgroundColor: "#00bbf0",
                        padding: "5px 10px 5px 10px",
                        color: "white",
                        borderRadius: "10px",
                      }}
>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d
                      onClick={() => handleClientClick(row)}
                    >
                      SEND
                    </span>
<<<<<<< HEAD
=======

>>>>>>> 1417db9a4452ca8493c93a158eccf617932b5f4d
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