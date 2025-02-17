

// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import '../Css/info.css';
// import { MdEmail } from "react-icons/md";
// import { IoMdCall } from "react-icons/io";
// import { Button , Modal,Form} from 'react-bootstrap';
// import { setUsers, setSelectedClient } from '../Slicers/clientSlice';
// import { useNavigate } from 'react-router-dom';
// import * as XLSX from 'xlsx';

// function Employeeinfo() {
//   const users = useSelector((state) => state.clients.users);
//   const [employeeClients, setEmployeeClients] = useState([]);
//   const [overallAmount, setOverallAmount] = useState(0);
//   const [overallCollection, setOverallCollection] = useState(0);
//   const [balanceAmount, setBalanceAmount] = useState(0);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [email, setEmail] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Retrieve selectedEmployee from sessionStorage on component mount
//   useEffect(() => {
//     const storedEmployee = sessionStorage.getItem('selectedEmployee');
//     if (storedEmployee) {
//       setSelectedEmployee(JSON.parse(storedEmployee));
//     } else {
//       navigate("/employee");
//     }
//   }, [navigate]);

//   // Fetch employee data once component mounts
//   useEffect(() => {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const Authorization = localStorage.getItem("authToken");

//     if (Authorization) {
//       fetch(`${API_URL}/acc_list`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: Authorization,
//         },
//       })
//         .then((response) => {
//           if (response.status === 401) {
//             handleUnauthorizedAccess();
//             throw new Error("Unauthorized access - 401");
//           }
//           return response.json();
//         })
//         .then((data) => dispatch(setUsers(data), console.log(data)))
//         .catch((error) => console.error("Fetch error:", error));
//     } else {
//       console.error("No authorization token found in localStorage");
//     }
//   }, [dispatch]);

//   const handleUnauthorizedAccess = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userName");
//     navigate("/login");
//   };

//   // Calculate totals when selectedEmployee or users change
//   useEffect(() => {
//     if (selectedEmployee && users.length > 0) {
//       const clients = users.filter(client => client.user_id === selectedEmployee.user_id);
//       setEmployeeClients(clients);

//       const totalAmount = clients.reduce((sum, client) => sum + parseFloat(client.amount || 0), 0);
//       const totalCollection = clients.reduce((sum, client) => {
//         const paidAmountDate = Array.isArray(client.paid_amount_date) ? client.paid_amount_date : [];
//         return sum + paidAmountDate.reduce((innerSum, payment) => innerSum + parseFloat(payment.amount || 0), 0);
//       }, 0);
      

//       setOverallAmount(totalAmount);
//       console.log(overallAmount)
//       setOverallCollection(totalCollection);
//       setBalanceAmount(totalAmount - totalCollection);
//     }
//   }, [selectedEmployee, users]);

//   const handlenav1 = (client) => {
//     dispatch(setSelectedClient(client));
//     navigate('/clientinfo');
//   };

//   const exportToExcel = () => {
//     const wb = XLSX.utils.book_new();
//     const tableData = employeeClients.map((client, index) => {
//       const totalAmount = parseFloat(client.amount || 0);
//       const collectionAmount = (client.paid_amount_date || []).reduce(
//         (sum, payment) => sum + parseFloat(payment.amount || 0),
//         0
//       );
//       const balance = totalAmount - collectionAmount;

//       return {
//         "#": index + 1,
//         "Employee Name": selectedEmployee?.username || 'Unknown Employee',
//         "Client Name": client.client_name || 'Unknown Client',
//         "Total Amount": totalAmount + ' KWD',
//         "Collection Amount": collectionAmount + ' KWD',
//         "Balance Amount": balance + ' KWD',
//       };
//     });


//     const ws = XLSX.utils.json_to_sheet(tableData);

//     const headerStyle = {
//       font: { bold: true, sz: 10 },
//       alignment: { horizontal: "center" },
//       fill: { fgColor: { rgb: "F2F2F2" } },
//     };

//     const cellStyle = {
//       font: { sz: 8 },
//       alignment: { wrapText: true },
//     };

//     Object.keys(ws).forEach(cell => {
//       if (cell.match(/^[A-Z]+\d+$/)) {
//         if (cell.endsWith('1')) {
//           ws[cell].s = headerStyle;
//         } else {
//           ws[cell].s = cellStyle;
//         }
//       }
//     });

//     ws['!cols'] = [
//       { wch: 5 },
//       { wch: 20 },
//       { wch: 20 },
//       { wch: 25 },
//       { wch: 20 },
//       { wch: 20 },
//       { wch: 20 },
//     ];

//     XLSX.utils.book_append_sheet(wb, ws, "Employee_details");
//     XLSX.writeFile(wb, `Employee_details_${new Date().toISOString()}.xlsx`);
//   };

//   const handlenavform=() =>{
//       navigate("/employeeform")
//   }


  
//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     if (!newPassword.trim()) {
//       alert("Please enter a new password");
//       return;
//     }

//     setLoading(true);
//     try {
//       const API_URL = import.meta.env.VITE_API_URL;
//       const Authorization = localStorage.getItem("authToken");
//       console.log( selectedEmployee.email)

//       if (!Authorization) {
//         console.error("No authorization token found");
//         return;
//       }

//       const response = await fetch(`${API_URL}/passwordupdated`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization,
//         },
//         body: JSON.stringify({ email: selectedEmployee.email,password: newPassword }),
//       });

//       const result = await response.json();
//       if (!response.ok) {
//         throw new Error(result.message || "Failed to change password");
//       }

//       alert("Password updated successfully!");
//       setShowPasswordModal(false);
//       setNewPassword('');
//     } catch (error) {
//       console.error("Error updating password:", error);
//       alert(error.message || "Error updating password. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };



//   return (
//     <div style={{ marginTop: '50px' }}>
//       <div className="page-header">
//         <h1>Employee</h1>
//         <small>Employee Info</small>
//       </div>

//       <div className="showimage" style={{ display: 'flex', padding: '50px 0px 0px 100px', gap: '30px' }}>
//         <div style={{ width: '200px', height: '200px' }}>
//           <img
//             style={{ width: '100%', height: '100%' }}
//             src="https://www.corporatephotographylondon.com/wp-content/uploads/2019/11/HKstrategies-846.jpg"
//             alt="Employee"
//           />
//         </div>

//         <div className="d-flex flex-column gap-2">
//           <h2 className="fw-bold">
//             {selectedEmployee?.username || 'No Employee Selected'}
//           </h2>

//           <div className="d-flex flex-column pb-3 gap-3">
//             <small className="fs-5">
//               <span className="text-primary fs-3 me-3">
//                 <MdEmail />
//               </span>
//               {selectedEmployee?.email || 'N/A'}
//               <span className="text-primary fs-3 ms-5">
//                 <IoMdCall />
//               </span>
//               {selectedEmployee?.phone_number || 'N/A'}
//             </small>

//             <small className="text-primary fw-bold fs-5">
//               {selectedEmployee?.role || 'N/A'}
//             </small>
//           </div>

//           <div className="d-flex gap-2 ">
//             <Button className="w-auto btn btn-primary"   onClick={handlenavform}>Edit The Employee</Button>
//             <Button className="w-auto btn btn-danger"  onClick={() => setShowPasswordModal(true)} >Password Change</Button>
//           </div>

          
//         </div>
//       </div>

//       {selectedEmployee?.role === "Collection Agent" && (
//         <div>
//           <div className="d-flex gap-4 justify-content-center text-center align-items-center py-3 px-4">
//             <div className="d-flex">
//               <h4 className="totalamount pt-2">Total Amount:</h4>
//               <div className="totalbox ms-2">
//                 <h4>{overallAmount} KWD</h4>
//               </div>
//             </div>
//             <div className="d-flex">
//               <h4 className="totalamount pt-2">Paid Amount:</h4>
//               <div className="totalbox ms-2">
//                 <h4>{overallCollection} KWD</h4>
//               </div>
//             </div>
//             <div className="d-flex">
//               <h4 className="totalamount pt-2">Balance Amount:</h4>
//               <div className="totalbox ms-2">
//                 <h4>{balanceAmount} KWD</h4>
//               </div>
//             </div>
//           </div>

//           <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button>

//           <div className="records table-responsive">
//             <div className="record-header">
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Client Name</th>
//                     <th>Total Amount</th>
//                     <th>Collection Amount</th>
//                     <th>Balance Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeClients.map((client, index) => {
//                     const collectionAmount = client.paid_amount_date?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0;
//                     const balanceAmount = parseFloat(client.amount || 0) - collectionAmount;

//                     return (
//                       <tr key={index}>
//                         <td>{index + 1}</td>
//                         <td   onClick={ () => handlenav1(client) }>{client.client_name || 'Unknown Client'}</td>
//                         <td>{parseFloat(client.amount || 0)} KWD</td>
//                         <td>{collectionAmount} KWD</td>
//                         <td>{balanceAmount >= 0 ? balanceAmount : 0} KWD</td>
//                       </tr>
//                     );
//                   })}

//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Change Password</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handlePasswordChange}>
//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control type="email" value={selectedEmployee?.email || 'N/A'} readOnly />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>New Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Button variant="primary" type="submit" disabled={loading}>
//               {loading ? "Updating..." : "Change Password"}
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// }

// export default Employeeinfo;



// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import '../Css/info.css';
// import { MdEmail } from "react-icons/md";
// import { IoMdCall } from "react-icons/io";
// import { Button, Modal, Form } from 'react-bootstrap';
// import { setUsers, setSelectedClient } from '../Slicers/clientSlice';
// import { useNavigate } from 'react-router-dom';
// import { InputGroup, FormControl } from "react-bootstrap";
// import * as XLSX from 'xlsx';

// function Employeeinfo() {
//   const users = useSelector((state) => state.clients.users);
//   const [employeeClients, setEmployeeClients] = useState([]);
//   const [overallAmount, setOverallAmount] = useState(0);
//   const [overallCollection, setOverallCollection] = useState(0);
//   const [balanceAmount, setBalanceAmount] = useState(0);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const storedEmployee = sessionStorage.getItem('selectedEmployee');
//     if (storedEmployee) {
//       setSelectedEmployee(JSON.parse(storedEmployee));
//     } else {
//       navigate("/employee");
//     }
//   }, [navigate]);

//   useEffect(() => {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const Authorization = localStorage.getItem("authToken");

//     if (Authorization) {
//       fetch(`${API_URL}/acc_list`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: Authorization,
//         },
//       })
//         .then((response) => {
//           if (response.status === 401) {
//             handleUnauthorizedAccess();
//             throw new Error("Unauthorized access - 401");
//           }
//           return response.json();
//         })
//         .then((data) => dispatch(setUsers(data)))
//         .catch((error) => console.error("Fetch error:", error));
//     } else {
//       console.error("No authorization token found in localStorage");
//     }
//   }, [dispatch]);

//   const handleUnauthorizedAccess = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userName");
//     navigate("/login");
//   };

//   useEffect(() => {
//     if (selectedEmployee && users.length > 0) {
//       const clients = users.filter(client => client.user_id === selectedEmployee.user_id);
//       setEmployeeClients(clients);

//       const totalAmount = clients.reduce((sum, client) => sum + parseFloat(client.amount || 0), 0);
//       const totalCollection = clients.reduce((sum, client) => {
//         const paidAmountDate = Array.isArray(client.paid_amount_date) ? client.paid_amount_date : [];
//         return sum + paidAmountDate.reduce((innerSum, payment) => innerSum + parseFloat(payment.amount || 0), 0);
//       }, 0);

//       setOverallAmount(totalAmount);
//       setOverallCollection(totalCollection);
//       setBalanceAmount(totalAmount - totalCollection);
//     }
//   }, [selectedEmployee, users]);

//   const handlenav1 = (client) => {
//     dispatch(setSelectedClient(client));
//     navigate('/clientinfo');
//   };

//   const exportToExcel = () => {
//     const wb = XLSX.utils.book_new();
//     const tableData = employeeClients.map((client, index) => {
//       const totalAmount = parseFloat(client.amount || 0);
//       const collectionAmount = (client.paid_amount_date || []).reduce(
//         (sum, payment) => sum + parseFloat(payment.amount || 0),
//         0
//       );
//       const balance = totalAmount - collectionAmount;

//       return {
//         "#": index + 1,
//         "Employee Name": selectedEmployee?.username || 'Unknown Employee',
//         "Client Name": client.client_name || 'Unknown Client',
//         "Total Amount": totalAmount + ' KWD',
//         "Collection Amount": collectionAmount + ' KWD',
//         "Balance Amount": balance + ' KWD',
//       };
//     });

//     const ws = XLSX.utils.json_to_sheet(tableData);
//     XLSX.utils.book_append_sheet(wb, ws, "Employee_details");
//     XLSX.writeFile(wb, `Employee_details_${new Date().toISOString()}.xlsx`);
//   };

//   const handlenavform = () => {
//     navigate("/employeeform");
//   };
//   const [selectedDate, setSelectedDate] = useState("");

// const filteredClients = selectedDate
//   ? employeeClients.filter(client =>
//       client.paid_amount_date?.some(payment => payment.date === selectedDate)
//     )
//   : employeeClients;

 

// useEffect(() => {
//   if (selectedDate) {
//     const filteredClients = employeeClients
//       .map(client => ({
//         client_name: client.client_name,
//         payments: client.paid_amount_date?.filter(payment => payment.date === selectedDate) || []
//       }))
//       .filter(client => client.payments.length > 0);

//     console.log("Filtered Clients on:", selectedDate);
//     filteredClients.forEach(client => {
//       client.payments.forEach(payment => {
//         console.log(`Client: ${client.client_name}, Date: ${selectedDate}, Amount: ${payment.amount} KWD`);
//       });
//     });
//   }
// }, [selectedDate, employeeClients]);

//   return (
//     <div style={{ marginTop: '50px' }}>
//       <div className="page-header">
//         <h1>Employee</h1>
//         <small>Employee Info</small>
//       </div>

//       <div className="showimage" style={{ display: 'flex', padding: '50px 0px 0px 100px', gap: '30px' }}>
//         <div style={{ width: '200px', height: '200px' }}>
//           <img
//             style={{ width: '100%', height: '100%' }}
//             src="https://www.corporatephotographylondon.com/wp-content/uploads/2019/11/HKstrategies-846.jpg"
//             alt="Employee"
//           />
//         </div>

//         <div className="d-flex flex-column gap-2">
//           <h2 className="fw-bold">{selectedEmployee?.username || 'No Employee Selected'}</h2>

//           <div className="d-flex flex-column pb-3 gap-3">
//             <small className="fs-5">
//               <span className="text-primary fs-3 me-3">
//                 <MdEmail />
//               </span>
//               {selectedEmployee?.email || 'N/A'}
//               <span className="text-primary fs-3 ms-5">
//                 <IoMdCall />
//               </span>
//               {selectedEmployee?.phone_number || 'N/A'}
//             </small>

//             <small className="text-primary fw-bold fs-5">{selectedEmployee?.role || 'N/A'}</small>
//           </div>

//           <div className="d-flex gap-2 ">
//             <Button className="w-auto btn btn-primary" onClick={handlenavform}>Edit The Employee</Button>
//             <Button className="w-auto btn btn-danger" onClick={() => setShowPasswordModal(true)}>Password Change</Button>
//           </div>
//         </div>
//       </div>

//       {selectedEmployee?.role === "Collection Agent" && (
//         <div>
//           <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button>
//           <InputGroup className="mb-auto w-50">
//   <FormControl
//     type="date"
//     value={selectedDate}
//     onChange={(e) => setSelectedDate(e.target.value)}
//   />
// </InputGroup>


//           <div className="records table-responsive">
//             <table className="table table-striped">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Client Name</th>
//                   <th>Total Amount</th>
//                   <th>Collection Amount</th>
//                   <th>Balance Amount</th>
//                   <th>Collection Date</th>
//                 </tr>
//               </thead>
//               {/* <tbody>
//                 {employeeClients.map((client, index) => {
//                   const collectionAmount = client.paid_amount_date?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0;
//                   const balanceAmount = parseFloat(client.amount || 0) - collectionAmount;
//                   const collectionDates = client.paid_amount_date?.length
//                     ? client.paid_amount_date.map(payment => payment.date).join(" | ")
//                     : "No Collection";

//                   return (
//                     <tr key={index}>
//                       <td>{index + 1}</td>
//                       <td onClick={() => handlenav1(client)}>{client.client_name || 'Unknown Client'}</td>
//                       <td>{parseFloat(client.amount || 0)} KWD</td>
//                       <td>{collectionAmount} KWD</td>
//                       <td>{balanceAmount >= 0 ? balanceAmount : 0} KWD</td>
//                       <td>{collectionDates}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody> */}

//               <tbody>
//   {filteredClients.map((client, index) => {
//     const collectionAmount = client.paid_amount_date?.reduce(
//       (sum, payment) => sum + parseFloat(payment.amount || 0),
//       0
//     ) || 0;
//     const balanceAmount = parseFloat(client.amount || 0) - collectionAmount;
//     const collectionDates = client.paid_amount_date?.length
//       ? client.paid_amount_date.map(payment => payment.date).join(" | ")
//       : "No Collection";

//     return (
//       <tr key={index}>
//         <td>{index + 1}</td>
//         <td onClick={() => handlenav1(client)}>{client.client_name || 'Unknown Client'}</td>
//         <td>{parseFloat(client.amount || 0)} KWD</td>
//         <td>{collectionAmount} KWD</td>
//         <td>{balanceAmount >= 0 ? balanceAmount : 0} KWD</td>
//         <td>{collectionDates}</td>
//       </tr>
//     );
//   })}
// </tbody>



//               {/* <tbody>
//   {employeeClients.map((client, index) => {
//     return (
//       <>
//         {client.paid_amount_date?.length > 0 ? (
//           client.paid_amount_date.map((payment, i) => (
//             <tr key={`${index}-${i}`}>
//               {i === 0 && <td rowSpan={client.paid_amount_date.length}>{index + 1}</td>}
//               {i === 0 && <td rowSpan={client.paid_amount_date.length} onClick={() => handlenav1(client)}>{client.client_name || 'Unknown Client'}</td>}
//               {i === 0 && <td rowSpan={client.paid_amount_date.length}>{parseFloat(client.amount || 0)} KWD</td>}
//               <td>{payment.amount} KWD</td>
//               {i === 0 && (
//                 <td rowSpan={client.paid_amount_date.length}>
//                   {parseFloat(client.amount || 0) - client.paid_amount_date.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)} KWD
//                 </td>
//               )}
//               <td>{payment.date}</td>
//             </tr>
//           ))
//         ) : (
//           <tr key={index}>
//             <td>{index + 1}</td>
//             <td onClick={() => handlenav1(client)}>{client.client_name || 'Unknown Client'}</td>
//             <td>{parseFloat(client.amount || 0)} KWD</td>
//             <td>0 KWD</td>
//             <td>{parseFloat(client.amount || 0)} KWD</td>
//             <td>No Collection</td>
//           </tr>
//         )}
//       </>
//     );
//   })}
// </tbody> */}
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Employeeinfo;

// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import '../Css/info.css';
// import { MdEmail } from "react-icons/md";
// import { IoMdCall } from "react-icons/io";
// import { Button, InputGroup, FormControl } from "react-bootstrap";
// import * as XLSX from 'xlsx';
// import { setUsers, setSelectedClient } from '../Slicers/clientSlice';
// import { useNavigate } from 'react-router-dom';

// function Employeeinfo() {
//   const users = useSelector((state) => state.clients.users);
//   const [employeeClients, setEmployeeClients] = useState([]);
//   const [overallAmount, setOverallAmount] = useState(0);
//   const [overallCollection, setOverallCollection] = useState(0);
//   const [balanceAmount, setBalanceAmount] = useState(0);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedDate, setSelectedDate] = useState("");

//   useEffect(() => {
//     const storedEmployee = sessionStorage.getItem('selectedEmployee');
//     if (storedEmployee) {
//       setSelectedEmployee(JSON.parse(storedEmployee));
//     } else {
//       navigate("/employee");
//     }
//   }, [navigate]);

//   useEffect(() => {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const Authorization = localStorage.getItem("authToken");

//     if (Authorization) {
//       fetch(`${API_URL}/acc_list`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: Authorization,
//         },
//       })
//         .then((response) => {
//           if (response.status === 401) {
//             handleUnauthorizedAccess();
//             throw new Error("Unauthorized access - 401");
//           }
//           return response.json();
//         })
//         .then((data) => dispatch(setUsers(data)))
//         .catch((error) => console.error("Fetch error:", error));
//     } else {
//       console.error("No authorization token found in localStorage");
//     }
//   }, [dispatch]);

//   const handleUnauthorizedAccess = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userName");
//     navigate("/login");
//   };

//   useEffect(() => {
//     if (selectedEmployee && users.length > 0) {
//       const clients = users.filter(client => client.user_id === selectedEmployee.user_id);
//       setEmployeeClients(clients);

//       const totalAmount = clients.reduce((sum, client) => sum + parseFloat(client.amount || 0), 0);
//       const totalCollection = clients.reduce((sum, client) => {
//         const paidAmountDate = Array.isArray(client.paid_amount_date) ? client.paid_amount_date : [];
//         return sum + paidAmountDate.reduce((innerSum, payment) => innerSum + parseFloat(payment.amount || 0), 0);
//       }, 0);

//       setOverallAmount(totalAmount);
//       setOverallCollection(totalCollection);
//       setBalanceAmount(totalAmount - totalCollection);
//     }
//   }, [selectedEmployee, users]);

//   const handlenav1 = (client) => {
//     dispatch(setSelectedClient(client));
//     navigate('/clientinfo');
//   };

//   const exportToExcel = () => {
//     const wb = XLSX.utils.book_new();
//     const tableData = employeeClients.map((client, index) => {
//       const totalAmount = parseFloat(client.amount || 0);
//       const collectionAmount = (client.paid_amount_date || []).reduce(
//         (sum, payment) => sum + parseFloat(payment.amount || 0),
//         0
//       );
//       const balance = totalAmount - collectionAmount;

//       return {
//         "#": index + 1,
//         "Employee Name": selectedEmployee?.username || 'Unknown Employee',
//         "Client Name": client.client_name || 'Unknown Client',
//         "Total Amount": totalAmount + ' KWD',
//         "Collection Amount": collectionAmount + ' KWD',
//         "Balance Amount": balance + ' KWD',
//       };
//     });

//     const ws = XLSX.utils.json_to_sheet(tableData);
//     XLSX.utils.book_append_sheet(wb, ws, "Employee_details");
//     XLSX.writeFile(wb, `Employee_details_${new Date().toISOString()}.xlsx`);
//   };

//   // Filter clients based on selected date
//   const filteredClients = selectedDate
//     ? employeeClients.map(client => ({
//         ...client,
//         paid_amount_date: client.paid_amount_date?.filter(payment => payment.date === selectedDate) || []
//       })).filter(client => client.paid_amount_date.length > 0)
//     : employeeClients;

//     useEffect(() => {
//       if (selectedDate) {
//         // Convert 'YYYY-MM-DD' (selectedDate) to 'DD-MM-YYYY'
//         const [year, month, day] = selectedDate.split("-");
//         const formattedDate = `${day}-${month}-${year}`;
    
//         console.log("Selected Date:", selectedDate);  // Debugging
//         console.log("Formatted Date:", formattedDate); // Debugging
//         console.log("Employee Clients Data:", employeeClients); // Debugging
    
//         // Filter clients who have payments on the selected date
//         const filteredClients = employeeClients
//           .map(client => ({
//             client_name: client.client_name,
//             payments: client.paid_amount_date?.filter(payment => {
//               console.log(`Checking Payment: ${payment.date} == ${formattedDate}`); // Debugging
//               return payment.date === formattedDate;  // Fix: Match converted date
//             }) || []
//           }))
//           .filter(client => client.payments.length > 0);
    
//         console.log(`Filtered Clients on: ${formattedDate}`);
//         console.log(filteredClients);
//       }
//     }, [selectedDate, employeeClients]);
    
    

//   return (
//     <div style={{ marginTop: '50px' }}>
//       <div className="page-header">
//         <h1>Employee</h1>
//         <small>Employee Info</small>
//       </div>

//       <div className="showimage" style={{ display: 'flex', padding: '50px 0px 0px 100px', gap: '30px' }}>
//         <div style={{ width: '200px', height: '200px' }}>
//           <img
//             style={{ width: '100%', height: '100%' }}
//             src="https://www.corporatephotographylondon.com/wp-content/uploads/2019/11/HKstrategies-846.jpg"
//             alt="Employee"
//           />
//         </div>
//         <div className="d-flex flex-column gap-2">
//           <h2 className="fw-bold">{selectedEmployee?.username || 'No Employee Selected'}</h2>
//           <small className="fs-5">
//             <span className="text-primary fs-3 me-3"><MdEmail /></span>
//             {selectedEmployee?.email || 'N/A'}
//             <span className="text-primary fs-3 ms-5"><IoMdCall /></span>
//             {selectedEmployee?.phone_number || 'N/A'}
//           </small>
//           <small className="text-primary fw-bold fs-5">{selectedEmployee?.role || 'N/A'}</small>
//         </div>
//       </div>

//       {selectedEmployee?.role === "Collection Agent" && (
//         <div>
//           <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button>
//           <InputGroup className="mb-auto w-50">
//             <FormControl
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//             />
//           </InputGroup>

//           <div className="records table-responsive">
//             <table className="table table-striped">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Client Name</th>
//                   <th>Total Amount</th>
//                   <th>Collection Amount</th>
//                   <th>Balance Amount</th>
//                   <th>Collection Date</th>
//                 </tr>
//               </thead>
//               {/* <tbody>
//                 {filteredClients.map((client, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td onClick={() => handlenav1(client)}>{client.client_name || 'Unknown Client'}</td>
//                     <td>{parseFloat(client.amount || 0)} KWD</td>
//                     <td>{client.paid_amount_date?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)} KWD</td>
//                     <td>{parseFloat(client.amount || 0) - (client.paid_amount_date?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0)} KWD</td>
//                     <td>{client.paid_amount_date?.map(payment => payment.date).join(" | ") || "No Collection"}</td>
//                   </tr>
//                 ))}
//               </tbody> */}
//               <tbody>
//                 {filteredClients.length > 0 ? (
//                   filteredClients.map((client, index) => (
//                     <tr key={index}>
//                       <td>{index + 1}</td>
//                       <td>{client.client_name || "Unknown Client"}</td>
//                       <td>{parseFloat(client.amount || 0)} KWD</td>
//                       <td>
//                         {client.paid_amount_date?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)} KWD
//                       </td>
//                       <td>
//                         {parseFloat(client.amount || 0) -
//                           (client.paid_amount_date?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0)}{" "}
//                         KWD
//                       </td>
//                       <td>{client.paid_amount_date?.map((payment) => payment.date).join(" | ") || "No Collection"}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="text-center">
//                       No Data Found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Employeeinfo;


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

  // Fetch selected employee from sessionStorage
  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('selectedEmployee');
    if (storedEmployee) {
      setSelectedEmployee(JSON.parse(storedEmployee));
    } else {
      navigate("/employee");
    }
  }, [navigate]);

  // Fetch Employee Clients Data
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

  // Handle Unauthorized Access
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
      const clients = users.filter(client => client.user_id === selectedEmployee.user_id);
      setEmployeeClients(clients);
  
      const totalAmount = clients.reduce((sum, client) => sum + parseFloat(client.amount || 0), 0);
  
      const totalCollection = clients.reduce((sum, client) => {
        // Ensure `paid_amount_date` is always an array
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
       : [] // Ensure it's always an array
   })).filter(client => client.paid_amount_date.length > 0) // Extra check for empty arrays
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
        "Total Amount": totalAmount + ' KWD',
        "Collection Amount": collectionAmount + ' KWD',
        "Balance Amount": balance + ' KWD',
      };
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, "Employee_details");
    XLSX.writeFile(wb, `Employee_details_${new Date().toISOString()}.xlsx`);
  };


  // const sendCSVToWhatsApp = () => {
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
  
    // Generate CSV-like text format
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
  
      message += `${index + 1} | ${selectedEmployee?.username || 'Unknown'} | ${client.client_name || 'Unknown'} | ${totalAmount} KWD | ${collectionAmount} KWD | ${balance} KWD | ${selectedDate}\n`;
    });
  
    // Encode the message for WhatsApp
    const phone = selectedEmployee.phone_number;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  
    // Open WhatsApp
    window.open(whatsappLink, "_blank");
  };
  

  return (
    <div style={{ marginTop: '50px' }}>
      <div className="page-header">
        <h1>Employee</h1>
        <small>Employee Info</small>
      </div>
{/* 
      <div className="showimage" style={{ display: 'flex', padding: '50px 0px 0px 100px', gap: '30px' }}>
        <div style={{ width: '200px', height: '200px' }}>
          <img
            style={{ width: '100%', height: '100%' }}
            src="https://www.corporatephotographylondon.com/wp-content/uploads/2019/11/HKstrategies-846.jpg"
            alt="Employee"
          />
        </div>
        <div className="d-flex flex-column gap-2">
          <h2 className="fw-bold">{selectedEmployee?.username || 'No Employee Selected'}</h2>
          <small className="fs-5">
            <span className="text-primary fs-3 me-3"><MdEmail /></span>
            {selectedEmployee?.email || 'N/A'}
            <span className="text-primary fs-3 ms-5"><IoMdCall /></span>
            {selectedEmployee?.phone_number || 'N/A'}
          </small>
          <small className="text-primary fw-bold fs-5">{selectedEmployee?.role || 'N/A'}</small>
        </div>

        <div className="d-flex gap-2 ">
            <Button className="w-auto btn btn-primary" onClick={handlenavform}>Edit The Employee</Button>
             <Button className="w-auto btn btn-danger" onClick={() => setShowPasswordModal(true)}>Password Change</Button>
          </div>
      </div> */}
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

      {selectedEmployee?.role === "Collection Agent" && (
        <div>
        <div  className='d-flex justify-content-end align-item-center'>

        <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button>
          <InputGroup className="mb-auto  mt-3"  style={{width:'200px'}}>
            <FormControl type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </InputGroup>
          <Button onClick={sendCSVToWhatsApp} className='mB-3 w-auto' variant="success">
  Send to WhatsApp
</Button>
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
                  <th>Collection Date</th>
                </tr>
              </thead>
              {/* <tbody>
                {filteredClients.length > 0 ? filteredClients.map((client, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td onClick={() => handleClientClick(client)}>{client.client_name || "Unknown Client"}</td>
                    <td>{client.amount} KWD</td>
                    <td>{client.paid_amount_date.reduce((sum, p) => sum + parseFloat(p.amount), 0)} KWD</td>
                    <td>{client.amount - client.paid_amount_date.reduce((sum, p) => sum + parseFloat(p.amount), 0)} KWD</td>
                   
                    <td>{selectedDate}</td>
                  </tr>
                )) : <tr><td colSpan="6" className="text-center">No Data Found</td></tr>}
              </tbody> */}

              <tbody>
  {filteredClients.length > 0 ? filteredClients.map((client, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td onClick={() => handleClientClick(client)}>{client.client_name || "Unknown Client"}</td>
      <td>{client.amount} </td>
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
  )) : <tr><td colSpan="6" className="text-center">No Data Found</td></tr>}
</tbody>
            </table>
          </div>
        </div>
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


