
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/info.css';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployees,setSelectedEmployee } from '../Slicers/employeeSlice';
import { setSelectedClient } from '../Slicers/clientSlice';
import * as XLSX from 'xlsx'; 
import { Button, Modal, InputGroup, FormControl } from "react-bootstrap";


function Clinentinfo() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
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

  useEffect(() => {
    if (selectedClient?.paid_amount_date) {
      const totalPaid = selectedClient.paid_amount_date.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount || 0);
      }, 0);

      setTotalPaidAmount(totalPaid);
      setBalanceAmount(selectedClient.amount - totalPaid);
    }
  }, [selectedClient]);

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

 
  
  


   const handlenav =(client) =>{
        dispatch( setSelectedEmployee(client)); 
        navigate('/employeeinfo')
      }


      const handlenavform =(client) =>{
       
        navigate('/formdata')
      }



    //   const exportToExcel = () => {
    //     try{
    //       console.log("dtfghjk")
    //    const wb = XLSX.utils.book_new();
       
    //    // Collect the data into an array
    //    const tableData = [
    //      {
    //        "#": 1,
    //        "Client Name": selectedClient.client_name || 'Unknown Client',
    //        "Client Number": selectedClient.client_contact || 'Unknown Client',
    //        "Amount": selectedClient.amount || 0,
    //        "Bank Name": selectedClient.bank_name || 'Unknown Bank',
    //        "IFSC Code": selectedClient.ifsc_code || 'Unknown IFSC',
    //        "Account Number": selectedClient.accno || 'Unknown Account',
    //        "Beneficiary Name": selectedClient.name_of_the_beneficiary || 'Unknown Beneficiary',
    //        "Beneficiary Address": selectedClient.address_of_the_beneficiary || 'Unknown Address',
    //        "Sender Information": selectedClient.sender_information || 'Unknown Sender',
    //      }
    //    ];
       
    //    // Create the worksheet
    //    const ws = XLSX.utils.json_to_sheet(tableData);
       
    //    // Style the worksheet headers
    //    const headerStyle = {
    //      font: { bold: true, sz: 10 },
    //      alignment: { horizontal: "center" },
    //      fill: { fgColor: { rgb: "F2F2F2" } },
    //    };
       
    //    const cellStyle = {
    //      font: { sz: 8 },
    //      alignment: { wrapText: true },
    //    };
       
      
    //    Object.keys(ws).forEach(cell => {
    //      if (cell.match(/^[A-Z]+\d+$/)) {
    //        if (cell.endsWith('1')) {
    //          ws[cell].s = headerStyle;
    //        } else {
    //          ws[cell].s = cellStyle;
    //        }
    //      }
    //    });
       
      
    //    ws['!cols'] = [
    //      { wch: 5 },{ wch: 20 },{ wch: 20 },{ wch: 25 },{ wch: 20 },{ wch: 20 },{ wch: 20 },{ wch: 30 },{ wch: 30 },
    //    ];
    //    XLSX.utils.book_append_sheet(wb, ws, 'Client Information');
    //    const timestamp = new Date().toISOString().replace(/[-:T]/g, '_').split('.')[0];
    //    XLSX.writeFile(wb, `client_info_${timestamp}.xlsx`);
    //     }
    //     catch(error){
    //       console.error("Export failed:", error);
    //     }
    //  };
      
    
    const exportToExcel = () => {
      try {
        console.log("Exporting to Excel...");
        const wb = XLSX.utils.book_new();
        
        let tableData = [];
    
        if (selectedClient.bank_type === "bank1") {
          // Only include specific fields for bank_type === 1
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
          // Default fields for other bank types
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
    
        // Create the worksheet
        const ws = XLSX.utils.json_to_sheet(tableData);
    
        // Adjust column widths
        ws["!cols"] = [
          { wch: 5 },  { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
        ];
    
        XLSX.utils.book_append_sheet(wb, ws, "Client Information");
    
        // Generate a timestamp for the file name
        const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
    
        // Save the file
        XLSX.writeFile(wb, `client_info_${timestamp}.xlsx`);
      } catch (error) {
        console.error("Export failed:", error);
      }
    };
    
     
    const handleEditClick = () => {
      setEditableClient(selectedClient);
      setEditModal(true);
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
    <Button onClick={exportToExcel} className='w-auto'>
  Export to Excel 
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
    <h2 className="mb-4 text-center text-primary">Client Details <span> <Button onClick={handlenavform} variant="primary"  className=' w-auto'>
  Edit Client
</Button></span></h2>
    {/* <div className="row gy-3">
      <div className="col-md-6">
        <h4 className="fw-bold">Name:</h4>
        <p className="text-muted fw-bold">{selectedClient.client_name.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Contact Number:</h4>
        <p className="text-muted fw-bold">{selectedClient.client_contact}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">City:</h4>
        <p className="text-muted fw-bold">{selectedClient.client_city.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Status:</h4>
        <p
          className={`badge ${
            selectedClient.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"
          } fw-bold`}
        >
          {selectedClient.paid_and_unpaid == 1 ? "Paid" : "Unpaid"}
        </p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Bank Name:</h4>
        <p className="text-muted fw-bold">{selectedClient.bank_name.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Account Number:</h4>
        <p className="text-muted fw-bold">{selectedClient.accno}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">IFSC Code:</h4>
        <p className="text-muted  fw-bold">{selectedClient.ifsc_code}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Name of Beneficiary:</h4>
        <p className="text-muted  fw-bold">{selectedClient.name_of_the_beneficiary.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Address of Beneficiary:</h4>
        <p className="text-muted  fw-bold">{selectedClient.address_of_the_beneficiary.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Account Type:</h4>
        <p className="text-muted  fw-bold">{selectedClient.accoun_type.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Sender Information:</h4>
        <p className="text-muted  fw-bold">{selectedClient.sender_information.toUpperCase() }</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">bank Type:</h4>
        <p className="text-muted  fw-bold">{selectedClient.bank_type.toUpperCase() }</p>
      </div>
    </div> */}
    <div className="row gy-3">
  <div className="col-md-6">
    <h4 className="fw-bold">Name:</h4>
    <p className="text-muted fw-bold">{selectedClient.client_name?.toUpperCase() || "UNDEFINED"}</p>
  </div>
  <div className="col-md-6">
    <h4 className="fw-bold">Contact Number:</h4>
    <p className="text-muted fw-bold">{selectedClient.client_contact || "UNDEFINED"}</p>
  </div>
  <div className="col-md-6">
    <h4 className="fw-bold">City:</h4>
    <p className="text-muted fw-bold">{selectedClient.client_city?.toUpperCase() || "UNDEFINED"}</p>
  </div>
  <div className="col-md-6">
    <h4 className="fw-bold">Status:</h4>
    <p
      className={`badge ${
        selectedClient.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"
      } fw-bold`}
    >
      {selectedClient.paid_and_unpaid == 1 ? "Paid" : "Unpaid"}
    </p>
  </div>
  <div className="col-md-6">
    <h4 className="fw-bold">Today Rate:</h4>
    <p className="text-muted fw-bold">{selectedClient.today_rate || "UNDEFINED"}</p>
  </div>
  <div className="col-md-6">
    <h4 className="fw-bold">Account Number:</h4>
    <p className="text-muted fw-bold">{selectedClient.accno || "UNDEFINED"}</p>
  </div>

  {/* Conditionally hide fields when bank_type === "Bank1" */}
  {selectedClient.bank_type && selectedClient.bank_type !== "bank1" && (
    <>
      <div className="col-md-6">
        <h4 className="fw-bold">Bank Name:</h4>
        <p className="text-muted fw-bold">{selectedClient.bank_name?.toUpperCase() || "UNDEFINED"}</p>
      </div>
      
      <div className="col-md-6">
        <h4 className="fw-bold">IFSC Code:</h4>
        <p className="text-muted fw-bold">{selectedClient.ifsc_code || "undefined"}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Name of Beneficiary:</h4>
        <p className="text-muted fw-bold">{selectedClient.name_of_the_beneficiary?.toUpperCase() || "UNDEFINED"}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Address of Beneficiary:</h4>
        <p className="text-muted fw-bold">{selectedClient.address_of_the_beneficiary?.toUpperCase() || "UNDEFINED"}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Account Type:</h4>
        <p className="text-muted fw-bold">{selectedClient.accoun_type?.toUpperCase() || "UNDEFINED"}</p>
      </div>
      <div className="col-md-6">
        <h4 className="fw-bold">Sender Information:</h4>
        <p className="text-muted fw-bold">{selectedClient.sender_information?.toUpperCase() || "UNDEFINED"}</p>
      </div>
    </>
  )}

  {/* Conditionally hide narration when bank_type === "Bank2" */}
  {selectedClient.bank_type !== "bank2" && (
    <div className="col-md-6">
      <h4 className="fw-bold">Narration:</h4>
      <p className="text-muted fw-bold">{selectedClient.narration?.toUpperCase() || "UNDEFINED"}</p>
    </div>
  )}

  <div className="col-md-6">
    <h4 className="fw-bold">Bank Type:</h4>
    <p className="text-muted fw-bold">{selectedClient.bank_type?.toUpperCase() || "UNDEFINED"}</p>
  </div>
</div>

  </div>
</div>

   

    <div className="d-flex gap-4 justify-content-center align-items-center py-3 px-5">
      <div className="d-flex">
        <h4 className='totalamount pt-2'>Total Amount :</h4>
        <div className='totalbox'><h4>{selectedClient.amount} KWD</h4></div>
      </div>
      <div className="d-flex">
        <h4 className='totalamount pt-2'>Paid Amount :</h4>
        <div className='totalbox'><h4>{totalPaidAmount} KWD</h4></div>
      </div>
      <div className="d-flex">
        <h4 className='totalamount pt-2'>Balance Amount :</h4>
        <div className='totalbox'><h4>{balanceAmount} KWD</h4></div>
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
      {/* <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Collection Agent Name</th>
            <th>Date and Time</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {selectedClient.paid_amount_date?.map((data, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              {employees.map((e1) =>
                e1.user_id === selectedClient.user_id ? (
                  <td key={e1.user_id} onClick={() => handlenav(e1)}>{e1.username}</td>
                ) : null
              )}
              <td>{data.date}</td>
              <td>{data.amount}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      <table className="table table-striped">
  <thead>
    <tr>
      <th>#</th>
      <th>Collection Agent Name</th>
      <th>Date and Time</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    {selectedClient.paid_amount_date && selectedClient.paid_amount_date.length > 0 ? (
      selectedClient.paid_amount_date.map((data, index) => {
        const agent = employees.find((e1) => e1.user_id === selectedClient.user_id);
        return (
          <tr key={index}>
            <td>{index + 1}</td>
            <td onClick={() => agent && handlenav(agent)}>
              {agent ? agent.username : "Unknown Agent"}
            </td>
            <td>{data.date || "N/A"}</td>
            <td>{data.amount || "N/A"}</td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="4" className="text-center">No data available</td>
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
