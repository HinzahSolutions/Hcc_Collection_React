
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/info.css';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployees, setSelectedEmployee } from '../Slicers/employeeSlice';
import { setSelectedClient } from '../Slicers/clientSlice';
import * as XLSX from 'xlsx';
import { Button, Modal, InputGroup, FormControl } from "react-bootstrap";


function Clinentinfo() {
  const API_URL = import.meta.env.VITE_API_URL;
  const selectedClient = useSelector((state) => state.clients.selectedClient);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const employees = useSelector((state) => state.employees.employees);
  const [editModal, setEditModal] = useState(false);
  const [editableClient, setEditableClient] = useState(null);


  useEffect(() => {
    const storedClient = sessionStorage.getItem('selectedClient');
    if (storedClient) {
      dispatch(setSelectedClient(JSON.parse(storedClient)));
    }
  }, [dispatch]);


  const totalPaidAmount = useMemo(() => {
    if (!selectedClient?.paid_amount_date) return 0;

    return selectedClient.paid_amount_date.reduce((sum, payment) => {
      const paymentAmount = parseFloat(payment.amount) || 0;
      const clientRate = parseFloat(selectedClient.today_rate) || 1;
      return sum + (clientRate > 0 ? paymentAmount / clientRate : 0);
    }, 0);
  }, [selectedClient]);

  const balanceAmount = useMemo(() => {
    if (!selectedClient) return 0;
    const clientAmount = parseFloat(selectedClient.amount) || 0;
    const clientRate = parseFloat(selectedClient.today_rate) || 1;
    return clientAmount / clientRate - totalPaidAmount;
  }, [selectedClient, totalPaidAmount]);



  useEffect(() => {
    const fetchEmployeeList = async () => {
      const Authorization = localStorage.getItem("authToken");
      if (!Authorization) {
        console.error("No authorization token found in localStorage");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization,
          },
        });
        const data = await response.json();
        dispatch(setEmployees(data));
      } catch (error) {
        console.error("Fetch error in fetchEmployeeList:", error);
      }
    };
    fetchEmployeeList()
  }, [dispatch]);






  const handlenav = (client) => {
    dispatch(setSelectedEmployee(client));
    navigate('/employee/employeeinfo')
  }


  const handlenavform = (client) => {
    navigate('/formdata')
  }


  const exportToCSV = () => {
    try {
      console.log("Exporting to CSV...");
      const wb = XLSX.utils.book_new();

      let tableData = [];

      if (selectedClient.bank_type === "bank1") {
        tableData = [
          {
            "#": selectedClient.client_id,
            "Client Name": selectedClient.client_name || "Unknown Client",
            "Client Number": selectedClient.client_contact || "Unknown Client",
            "Amount": selectedClient.amount || 0,
            "Account Number": selectedClient.accno || "Unknown Account",
            "Narration": selectedClient.narration || "UNDEFINED",
          },
        ];
      } else {
        tableData = [
          {
            "#": selectedClient.client_id,
            "Client Name": selectedClient.client_name || "Unknown Client",
            "Client Number": selectedClient.client_contact || "Unknown Client",
            "Amount": selectedClient.amount || 0,
            "Bank Name": selectedClient.bank_name || "Unknown Bank",
            "IFSC Code": selectedClient.ifsc_code || "Unknown IFSC",
            "Account Number": selectedClient.accno || "Unknown Account",
            "Beneficiary Name": selectedClient.name_of_the_beneficiary || "Unknown Beneficiary",
            "Beneficiary Address": selectedClient.address_of_the_beneficiary || "Unknown Address",
            "Sender Information": selectedClient.sender_information || "Unknown Sender",
          },
        ];
      }


      const ws = XLSX.utils.json_to_sheet(tableData);
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvOutput], { type: "text/csv" });
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
      link.href = URL.createObjectURL(blob);
      link.download = `client_info_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const Authorization = localStorage.getItem("authToken");
      if (!Authorization) {
        console.error("No authorization token found in localStorage");
        return;
      }
      const response = await fetch(`${API_URL}/update_client/${editableClient.client_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify(editableClient),
      });
      if (!response.ok) {
        throw new Error("Failed to update client");
      }
      const updatedClient = await response.json();
      console.log("Client updated successfully:", updatedClient);
      alert("Client updated successfully");
      dispatch(setSelectedClient(updatedClient));
      setEditModal(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };




  return (
    <div className="mt-5">
      <div className="page-header  d-flex justify-content-between">
        <div>
          <h1>Client</h1>
          <small>Client Info</small>
        </div>
        <div>
          <Button onClick={exportToCSV} className='w-auto'>
            Export to Excel
          </Button>
          <Button onClick={() => window.print()} className="w-auto">
            Print Page
          </Button>
        </div>

      </div>

      <div className="showimage">
        <div className="imagecolor  d-flex justify-content-between  w-100">
          <p className="p-4 text-white">ID : #{selectedClient.client_id}</p>


        </div>

        <div className="imageholder">
          <div
            className="profile-img1 bg-img1"
            style={{
              backgroundImage: 'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")',
            }}
          ></div>
        </div>
      </div>

      <div className="w-100 text-center">
        <div className="container mt-4">
          <div className="cards shadow p-4">
            <h2 className="mb-4 text-center text-primary">Client Details <span> <Button onClick={handlenavform} variant="primary" className=' w-auto'>
              Edit Client
            </Button></span></h2>

            <div className="row gy-3">
              <div className="col-md-6">
                <h4 className="fw-bold">Name:</h4>
                <p className="text-muted fw-bold">
                  {(selectedClient?.client_name ? selectedClient.client_name.replace(/"/g, "") : "-----").toUpperCase()}
                </p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Contact Number:</h4>
                <p className="text-muted fw-bold">{(selectedClient.client_contact || " -----  ")}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">City:</h4>
                <p className="text-muted fw-bold">{(selectedClient.client_city || " -----  ").toUpperCase()}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Status:</h4>
                <p className={`badge ${selectedClient.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"} fw-bold`} >
                  {selectedClient.paid_and_unpaid == 1 ? "Paid" : "Unpaid"}
                </p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Today Rate:</h4>
                <p className="text-muted fw-bold">{selectedClient.today_rate || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Account Number:</h4>
                <p className="text-muted fw-bold">{selectedClient.accno || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Bank Name:</h4>
                <p className="text-muted fw-bold">{selectedClient.bank_name || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">IFSC Code:</h4>
                <p className="text-muted fw-bold">{selectedClient.ifsc_code || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Name of Beneficiary:</h4>
                <p className="text-muted fw-bold">{selectedClient.name_of_the_beneficiary || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Address of Beneficiary:</h4>
                <p className="text-muted fw-bold">{selectedClient.address_of_the_beneficiary || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Account Type:</h4>
                <p className="text-muted fw-bold">{selectedClient.accoun_type || " -----  "}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Sender Information:</h4>
                <p className="text-muted fw-bold">{(selectedClient.sender_information || " -----  ").toUpperCase()}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Narration:</h4>
                <p className="text-muted fw-bold">{(selectedClient.narration || " ----- ").toUpperCase()}</p>
              </div>
              <div className="col-md-6">
                <h4 className="fw-bold">Bank Type:</h4>
                <p className="text-muted fw-bold">{selectedClient.bank_type || " ----- "}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex gap-4   justify-content-center align-items-center py-3 px-5" style={{ flexWrap: 'wrap' }}>
          <div className="d-flex">
            <h4 className='totalamount pt-2'>Total Amount :</h4>
            <div className='totalbox'><h4>{selectedClient.amount && selectedClient.today_rate ? ((selectedClient.amount / selectedClient.today_rate).toFixed(3)) : "0.000"} </h4></div>
          </div>
          <div className="d-flex">
            <h4 className='totalamount pt-2'>Paid Amount :</h4>
            <div className='totalbox'><h4>{totalPaidAmount.toFixed(3) || "0.00"} </h4></div>
          </div>
          <div className="d-flex">
            <h4 className='totalamount pt-2'>Balance Amount :</h4>
            <div className='totalbox'><h4>{balanceAmount.toFixed(3) || "0.00"}</h4></div>
          </div>
        </div>
      </div>
      <div className="records table-responsive">
        <div className="record-header">
          <div className="add">
            <h3 className="totalamount">#History</h3>
          </div>
        </div>
        <div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>COLLECTION AGENT NAME</th>
                <th>DATE</th>
                <th>TODAY RATE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
      
            <tbody>
  {selectedClient.paid_amount_date && selectedClient.paid_amount_date.length > 0 ? (
    selectedClient.paid_amount_date
      .filter((data) => employees.some((e1) => e1.user_id === data.userID))
      // ✅ Sort descending by date (e.g., 19-03-2025 comes before 15-03-2025)
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("-");
        const [dayB, monthB, yearB] = b.date.split("-");
        const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
        const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
        return dateB - dateA; // Newest first
      })
      .map((data, index) => {
        const agent = employees.find((e1) => e1.user_id === data.userID);

        return (
          <tr key={index}>
            <td>{index + 1}</td>
            <td onClick={() => agent && handlenav(agent)}>
              {agent ? agent.username.toUpperCase() : "Unknown Agent"}
            </td>
            <td>{data.date || "N/A"}</td>
            <td>{selectedClient.today_rate}</td>
            <td>
              <div className="client-info">
                <h4 style={{ color: "blue", fontWeight: "500" }}>
                  INTER: <span>{data.amount ? parseFloat(data.amount).toFixed(2) : "0.00"}</span>
                </h4>
                <h4 style={{ color: "red", fontWeight: "500" }}>
                  LOCAL:{" "}
                  <span>
                    {data.amount && selectedClient.today_rate
                      ? (parseFloat(data.amount) / parseFloat(selectedClient.today_rate)).toFixed(3)
                      : "0.000"}
                  </span>
                </h4>
              </div>
            </td>
          </tr>
        );
      })
  ) : (
    <tr>
      <td colSpan="5" className="text-center">No data available</td>
    </tr>
  )}
</tbody>

          </table>
        </div>
      </div>


      <Modal show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Client Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editableClient && (
            <form onSubmit={handleEditSubmit}>
              <div className="txt_field">

                <input
                  type="text"
                  value={editableClient.client_name}
                  onChange={(e) =>
                    setEditableClient({ ...editableClient, client_name: e.target.value })
                  }
                  required
                />
                <label>Client Name</label>
              </div>

              <div className="txt_field">

                <input
                  type="text"
                  value={editableClient.client_contact}
                  onChange={(e) =>
                    setEditableClient({ ...editableClient, client_contact: e.target.value })
                  }
                  required
                />
                <label>Contact Number</label>
              </div>

              <div className="txt_field">

                <input
                  type="text"
                  value={editableClient.client_city}
                  onChange={(e) =>
                    setEditableClient({ ...editableClient, client_city: e.target.value })
                  }
                />
                <label>City</label>
              </div>

              <div className="txt_field">
                <input
                  type="text"
                  value={editableClient.client_city}
                  onChange={(e) => setEditableClient({ ...editableClient, client_city: e.target.value })}
                  required
                />
                <label>city</label>
              </div>

              <Modal.Footer>
                <Button variant="secondary" onClick={() => setEditModal(false)}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Modal.Footer>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>

  );
}

export default Clinentinfo;
