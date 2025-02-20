


import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, InputGroup, FormControl,Modal,Form } from "react-bootstrap";
import * as XLSX from 'xlsx';
import { MdEmail } from "react-icons/md";
import { IoMdCall } from "react-icons/io";
import { setUsers, setSelectedClient } from '../Slicers/clientSlice';
import '../Css/info.css';

const EmployeeInfo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.clients.users);

  const [employeeClients, setEmployeeClients] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [overallAmount, setOverallAmount] = useState(0);
  const [overallCollection, setOverallCollection] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('selectedEmployee');
    if (storedEmployee) {
      setSelectedEmployee(JSON.parse(storedEmployee));
    } else {
      navigate("/employee");
    }
  }, [navigate]);

  
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
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
            handleUnauthorizedAccess();
            throw new Error("Unauthorized access - 401");
          }
          return response.json();
        })
        .then((data) => dispatch(setUsers(data)))
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

    const handlenavform=() =>{
      navigate("/employeeform")
  }

  useEffect(() => {
    if (selectedEmployee && users.length > 0) {
      const clients = users.filter(client => 
        client.paid_amount_date?.some(payment => payment.userID === selectedEmployee.user_id)
      );
      setEmployeeClients(clients);
  
      const totalAmount = clients.reduce((sum, client) => sum + parseFloat(client.amount || 0), 0);
  
      const totalCollection = clients.reduce((sum, client) => {
        
        const paidAmountDate = Array.isArray(client.paid_amount_date) ? client.paid_amount_date : [];
  
        return sum + paidAmountDate.reduce((innerSum, payment) => 
          innerSum + parseFloat(payment?.amount || 0), 0
        );
      }, 0);
  
      setOverallAmount(totalAmount);
      setOverallCollection(totalCollection);
      setBalanceAmount(totalAmount - totalCollection);
    }
  }, [selectedEmployee, users]);

 // Filter Clients Based on Selected Date
 const filteredClients = selectedDate
 ? employeeClients.map(client => ({
     ...client,
     paid_amount_date: Array.isArray(client.paid_amount_date) 
       ? client.paid_amount_date.filter(payment => {
           const [year, month, day] = selectedDate.split("-");
           return payment?.date === `${day}-${month}-${year}`;
         }) 
       : [] 
   })).filter(client => client.paid_amount_date.length > 0) 
 : employeeClients;




  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert("Please enter a new password");
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const Authorization = localStorage.getItem("authToken");
      console.log( selectedEmployee.email)

      if (!Authorization) {
        console.error("No authorization token found");
        return;
      }

      const response = await fetch(`${API_URL}/passwordupdated`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify({ email: selectedEmployee.email,password: newPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.message || "Error updating password. Try again.");
    } finally {
      setLoading(false);
    }
  };





  const handleClientClick = (client) => {
    dispatch(setSelectedClient(client));
    navigate('/clientinfo');
  };

  
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const tableData = filteredClients.map((client, index) => {
      const totalAmount = parseFloat(client.amount || 0);
      const collectionAmount = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + parseFloat(payment.amount || 0),
        0
      );
      const balance = totalAmount - collectionAmount;

      return {
        "#": index + 1,
        "Employee Name": selectedEmployee?.username || 'Unknown Employee',
        "  Client Name": client.client_name || 'Unknown Client',
        "Total Amount": totalAmount + ' ',
        "Collection Amount": collectionAmount + '',
        "Balance Amount": balance + '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, "Employee_details");
    XLSX.writeFile(wb, `Employee_details_${new Date().toISOString()}.xlsx`);
  };


  //   if (!selectedEmployee?.phone_number) {
  //     alert("Employee does not have a phone number.");
  //     return;
  //   }
  
  //   // Generate CSV Data
  //   const csvData = filteredClients.map(client => ([
  //     client.client_name || "Unknown Client",
  //     `${client.amount} KWD`,
  //     `${(client.paid_amount_date || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)} KWD`,
  //     `${client.amount - (client.paid_amount_date || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)} KWD`
  //   ]));
  
  //   // Convert CSV Data to a String
  //   let csvContent = "Client Name,Total Amount,Collection Amount,Balance Amount\n";
  //   csvData.forEach(row => {
  //     csvContent += row.join(",") + "\n";
  //   });
  
  //   // Convert to a Blob
  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  
  //   // WhatsApp Message with Pre-Filled Text
  //   const message = encodeURIComponent("Here is the CSV report of your clients.");
  //   const phone = selectedEmployee.phone_number.replace(/\D/g, ""); // Ensure only digits
  //   const whatsappLink = `https://wa.me/${phone}?text=${message}`;
  
  //   // Open WhatsApp with Pre-filled Message (User will need to manually send the file)
  //   window.open(whatsappLink, "_blank");
  
  //   // Download CSV (User will have to attach it manually in WhatsApp)
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `Employee_Report_${new Date().toISOString()}.csv`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };
  
  
  // const sendCSVToWhatsApp = async () => {
  //   // Convert filtered clients to CSV format
  //   const csvContent = [
  //     ["#", "Employee Name", "Client Name", "Total Amount", "Collection Amount", "Balance Amount"],
  //     ...filteredClients.map((client, index) => {
  //       const totalAmount = parseFloat(client.amount || 0);
  //       const collectionAmount = (Array.isArray(client.paid_amount_date) 
  //         ? client.paid_amount_date.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) 
  //         : 0);
  //       const balance = totalAmount - collectionAmount;
  
  //       return [
  //         index + 1,
  //         selectedEmployee?.username || 'Unknown Employee',
  //         client.client_name || 'Unknown Client',
  //         `${totalAmount} KWD`,
  //         `${collectionAmount} KWD`,
  //         `${balance} KWD`
  //       ];
  //     })
  //   ].map(e => e.join(",")).join("\n");
  
  //   // Create a Blob and a URL for the CSV file
  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const fileUrl = URL.createObjectURL(blob);
  
  //   // Generate a WhatsApp message link
  //   const phone = selectedEmployee?.phone_number || ''; // Ensure this is a valid phone number
  //   const message = encodeURIComponent("Here is the CSV report of your clients.");
  //   const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
  
  //   // Open WhatsApp in a new tab
  //   window.open(whatsappLink, "_blank");
  
  //   // Create a download link for the CSV file
  //   const a = document.createElement("a");
  //   a.href = fileUrl;
  //   a.download = `Employee_Report_${new Date().toISOString()}.csv`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };
  
  // const sendCSVToWhatsApp = () => {
  //   if (!selectedEmployee?.phone_number) {
  //     alert("No phone number available for the employee.");
  //     return;
  //   }
  
  //   // Generate CSV content
  //   const tableData = filteredClients.map((client, index) => {
  //     const totalAmount = parseFloat(client.amount || 0);
  //     const collectionAmount = (client.paid_amount_date || []).reduce(
  //       (sum, payment) => sum + parseFloat(payment.amount || 0),
  //       0
  //     );
  //     const balance = totalAmount - collectionAmount;
  
  //     return [
  //       index + 1,
  //       selectedEmployee?.username || 'Unknown Employee',
  //       client.client_name || 'Unknown Client',
  //       totalAmount + ' KWD',
  //       collectionAmount + ' KWD',
  //       balance + ' KWD'
  //     ];
  //   });
  
  //   const csvContent = [
  //     ["#", "Employee Name", "Client Name", "Total Amount", "Collection Amount", "Balance Amount"],
  //     ...tableData
  //   ].map(e => e.join(",")).join("\n");
  
  //   // Create a Blob and URL
  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const fileURL = URL.createObjectURL(blob);
  
  //   // WhatsApp message
  //   const phone = selectedEmployee.phone_number;
  //   const message = encodeURIComponent("Here is the CSV report of your clients. Download it from the link below:");
  //   const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${message}%20${encodeURIComponent(fileURL)}`;
  
  //   // Open WhatsApp
  //   window.open(whatsappLink, "_blank");
  // };
  

  // const sendCSVToWhatsApp = () => {
  //   if (!selectedEmployee?.phone_number) {
  //     alert("No phone number available for the employee.");
  //     return;
  //   }
  
  //   // Generate CSV content
  //   const tableData = filteredClients.map((client, index) => {
  //     const totalAmount = parseFloat(client.amount || 0);
  //     const collectionAmount = (client.paid_amount_date || []).reduce(
  //       (sum, payment) => sum + parseFloat(payment.amount || 0),
  //       0
  //     );
  //     const balance = totalAmount - collectionAmount;
  
  //     return [
  //       index + 1,
  //       selectedEmployee?.username || 'Unknown Employee',
  //       client.client_name || 'Unknown Client',
  //       totalAmount + ' KWD',
  //       collectionAmount + ' KWD',
  //       balance + ' KWD'
  //     ];
  //   });
  
  //   const csvContent = [
  //     ["#", "Employee Name", "Client Name", "Total Amount", "Collection Amount", "Balance Amount"],
  //     ...tableData
  //   ].map(e => e.join(",")).join("\n");
  
  //   // Create a Blob and URL
  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const fileURL = URL.createObjectURL(blob);
  
  //   // Create a temporary link and trigger download
  //   const link = document.createElement("a");
  //   link.href = fileURL;
  //   link.download = `Clients_Report_${Date.now()}.csv`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  
  //   alert("CSV downloaded. Please share it manually on WhatsApp.");
  // };
  

  const sendCSVToWhatsApp = () => {
    if (!selectedEmployee?.phone_number) {
      alert("No phone number available for the employee.");
      return;
    }
  
    
    let message = "🔹 *Clients Report*\n\n";
    message += " # | Employee | Client | Total Amount | Collection | Balance | Date \n";
    message += "---|-----------|---------|--------------|-------------|----------\n";
  
    filteredClients.forEach((client, index) => {
      const totalAmount = parseFloat(client.amount || 0);
      const collectionAmount = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + parseFloat(payment.amount || 0),
        0
      );
      const balance = totalAmount - collectionAmount;
  
      message += `${index + 1} | ${selectedEmployee?.username || 'Unknown'} | ${client.client_name || 'Unknown'} | ${totalAmount} | ${collectionAmount} | ${balance} | ${selectedDate}\n`;
    });
  
   
    const phone = selectedEmployee.phone_number;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  
    window.open(whatsappLink, "_blank");
  };
  

  return (
    <div style={{ marginTop: '50px' }}>
      <div className="page-header">
        <h1>Employee</h1>
        <small>Employee Info</small>
      </div>
             <div className="showimage" style={{ display: 'flex', padding: '50px 0px 0px 100px', gap: '30px' }}>
        <div style={{ width: '200px', height: '200px' }}>
           <img
            style={{ width: '100%', height: '100%' }}
            src="https://www.corporatephotographylondon.com/wp-content/uploads/2019/11/HKstrategies-846.jpg"
            alt="Employee"
          />
        </div>

        <div className="d-flex flex-column gap-2">
          <h2 className="fw-bold">
            {selectedEmployee?.username || 'No Employee Selected'}
          </h2>

          <div className="d-flex flex-column pb-3 gap-3">
            <small className="fs-5">
              <span className="text-primary fs-3 me-3">
                <MdEmail />
              </span>
              {selectedEmployee?.email || 'N/A'}
              <span className="text-primary fs-3 ms-5">
                <IoMdCall />
              </span>
              {selectedEmployee?.phone_number || 'N/A'}
            </small>

            <small className="text-primary fw-bold fs-5">
              {selectedEmployee?.role || 'N/A'}
            </small>
          </div>

          <div className="d-flex gap-2 ">
            <Button className="w-auto btn btn-primary"   onClick={handlenavform}>Edit The Employee</Button>
            <Button className="w-auto btn btn-danger"  onClick={() => setShowPasswordModal(true)} >Password Change</Button>
          </div>

          
        </div>
      </div>

      


      {selectedEmployee?.role === "Collection Agent" ? (
  <div>
    <div className='d-flex justify-content-end align-items-center  ' style={{backgroundColor:'rgb(119, 162, 207)'}}>
    <div>  <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button></div>
    <div> <InputGroup className="mb-auto" style={{ width: '200px' }}>
        <FormControl type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </InputGroup></div>
     <div>  <Button onClick={sendCSVToWhatsApp} className='mB-3 w-auto' variant="success">
        Send to WhatsApp
      </Button></div>
    
    </div>

    <div className="records table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Client Name</th>
            <th>Total Amount</th>
            <th>Collection Amount</th>
            <th>Balance Amount</th>
            {selectedDate?<th>Collection Date</th>:<span></span>}
          </tr>
        </thead>
        <tbody>
          {filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
          <div className="client">
            <div
              className="client-img bg-img"
              style={{
                backgroundImage: client.client_image
                  ? `url(${client.client_image})`
                  : "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
              }}
            ></div>
            <div className="client-info">
              <h4>{client.client_name ? client.client_name.toUpperCase() : "UNKNOWN CLIENT"}</h4>
              <small>{client.client_contact ? client.client_contact.toUpperCase() : "NO CONTACT AVAILABLE"}</small>
            </div>
          </div>
        </td>
                <td>{client.amount}</td>
                <td>
                  {Array.isArray(client.paid_amount_date) 
                    ? client.paid_amount_date.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) 
                    : 0}
                </td>
                <td>
                  {client.amount - (Array.isArray(client.paid_amount_date) 
                    ? client.paid_amount_date.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) 
                    : 0)}
                </td>
                <td>{selectedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No Data Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
) : selectedEmployee?.role === "Distributor" ? (
  // Distributor Table
  <div>
    <h4>Distributor Dashboard</h4>
    {/* <div className="records table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Distributor Name</th>
            <th>Total Clients</th>
            <th>Total Collection</th>
            <th>Remaining Balance</th>
          </tr>
        </thead>
        <tbody>
          {distributorData.length > 0 ? (
            distributorData.map((distributor, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{distributor.name || "Unknown Distributor"}</td>
                <td>{distributor.totalClients}</td>
                <td>{distributor.totalCollection}</td>
                <td>{distributor.remainingBalance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No Data Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div> */}
    <table className="table table-striped w-70">
  <thead>
    <tr>
      <th>#</th>
      <th>Client Name</th>
      <th> Amount</th>
    </tr>
  </thead>
  <tbody>
    {users.filter(eid => eid.Distributor_id === selectedEmployee.user_id).length > 0 ? (
      users
        .filter(eid => eid.Distributor_id === selectedEmployee.user_id)
        .map((eid, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>
          <div className="client">
            <div
              className="client-img bg-img"
              style={{
                backgroundImage: eid.client_image
                  ? `url(${eid.client_image})`
                  : "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
              }}
            ></div>
            <div className="client-info">
              <h4 onClick={() => handleClientClick(eid)} >{eid.client_name ? eid.client_name.toUpperCase() : "UNKNOWN CLIENT"}</h4>
              <small>{eid.client_contact ? eid.client_contact.toUpperCase() : "NO CONTACT AVAILABLE"}</small>
            </div>
          </div>
        </td>
            <td>{eid.amount}</td>
          </tr>
        ))
    ) : (
      <tr>
        <td colSpan="3" className="text-center">No Data Found</td>
      </tr>
    )}
  </tbody>
</table>

  </div>
) : (
  <p>No valid role assigned</p>
)}


             <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
           <Modal.Title>Change Password</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <Form onSubmit={handlePasswordChange}>
             <Form.Group className="mb-3">
               <Form.Label>Email</Form.Label>
               <Form.Control type="email" value={selectedEmployee?.email || 'N/A'} readOnly />
             </Form.Group>

             <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeInfo;


