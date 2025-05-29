import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, InputGroup, FormControl, Modal, Form } from "react-bootstrap";
import * as XLSX from 'xlsx';
import { MdEmail } from "react-icons/md";
import { IoMdCall } from "react-icons/io";
import { setUsers, setSelectedClient } from '../Slicers/clientSlice';
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { format,parse } from "date-fns";
import '../Css/info.css';

const EmployeeInfo = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.clients.users);
  const employees = useSelector((state) => state.employees.employees);
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
  const [selectedClientDate, setSelectedClientDate] = useState("");


  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('selectedEmployee');
    if (storedEmployee) {
      setSelectedEmployee(JSON.parse(storedEmployee));
      fetchEmployees();
      console.log(employees)
    } else {
      navigate("/employee");
    }
  }, [navigate]);



  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const formattedDate = formatDateToDDMMYYYY(selectedDate);
    setSelectedClientDate(formattedDate);
    console.log(formattedDate);
  };


  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };


  // const filteredUsers = users.filter(
  //   (eid) =>
  //     selectedEmployee?.user_id && 
  //     eid.Distributor_id === selectedEmployee.user_id &&  eid.dtp_id === selectedEmployee.user_id &&
  //     (!selectedClientDate || eid.date === selectedClientDate),
      
  // );

//   const filteredUsers = users.filter(
//   (eid) =>
//     selectedEmployee?.user_id &&
//     (eid.Distributor_id === selectedEmployee.user_id || eid.dtp_id === selectedEmployee.user_id) &&
//     (!selectedClientDate || eid.date === selectedClientDate)
// );




const filteredUsers = users
  .filter(
    (eid) =>
      selectedEmployee?.user_id &&
      (eid.Distributor_id === selectedEmployee.user_id || eid.dtp_id === selectedEmployee.user_id) &&
      (!selectedClientDate || eid.date === selectedClientDate)
  )
  .sort((a, b) => {
    const dateA = parse(a.date, "dd-MM-yyyy", new Date());
    const dateB = parse(b.date, "dd-MM-yyyy", new Date());
    return dateB - dateA; // Descending: newest first
  });





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
            console.error("Unauthorized access - redirecting to login");
            handleUnauthorizedAccess();
            return;
          }
          return response.json();
        })
        .then((data) => dispatch(setUsers(data)))
        .then((data) => console.log(data))
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

  const handlenavform = () => {
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

  // const filteredClients = selectedDate
  //   ? employeeClients.map(client => ({
  //     ...client,
  //     paid_amount_date: Array.isArray(client.paid_amount_date)
  //       ? client.paid_amount_date.filter(payment => {
  //         const [year, month, day] = selectedDate.split("-");
  //         return payment?.date === `${day}-${month}-${year}`;
  //       })
  //       : []
  //   })).filter(client => client.paid_amount_date.length > 0)
  //   : employeeClients;

  const filteredClients = employeeClients
  .map(client => ({
    ...client,
    paid_amount_date: Array.isArray(client.paid_amount_date)
      ? client.paid_amount_date.filter(payment => {
          if (!payment?.date || !payment?.userID) return false; // Ensure valid data

          const [year, month, day] = selectedDate?.split("-") || [];
          const matchesDate = selectedDate ? payment.date === `${day}-${month}-${year}` : true;
          const matchesEmployee = selectedEmployee ? payment.userID === selectedEmployee.user_id : true;
          
          return matchesDate && matchesEmployee;
        })
      : []
  }))
  .filter(client => client.paid_amount_date.length > 0); // Keep only clients with valid payments

console.log(filteredClients);

  

    

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
      console.log(selectedEmployee.email)

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
        body: JSON.stringify({ email: selectedEmployee.email, password: newPassword }),
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
  console.log(filteredClients)

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



  // const sendCSVToWhatsApp = () => {
  //   if (!selectedEmployee?.phone_number) {
  //     alert("No phone number available for the employee.");
  //     return;
  //   }


  //   let message = "🔹 *Clients Report*\n";
  //   message += ` Agent Name : ${selectedEmployee?.username.toUpperCase() || 'Unknown'} \n\n`
   
  

  //   filteredClients.forEach((client, index) => {
  //     const totalAmount = parseFloat(client.amount || 0);
  //     const collectionAmount = (client.paid_amount_date || []).reduce(
  //       (sum, payment) => sum + parseFloat(payment.amount || 0),
  //       0
  //     );
  //     const balance = totalAmount - collectionAmount;

  //     message += `${index + 1}  | Client Name : ${client.client_name.toUpperCase() || 'Unknown'}, \n      Collection Date :  ${selectedDate}, \n      Total Amount :   ${totalAmount.toFixed(2)}, \n      Collection  International Amount :  ${collectionAmount.toFixed(2)}, \n      Collection Local Amount : ${collectionLocalamount} `;
  //     message += "------------------------------------------------------------\n\n";
  //   });
     
  //    message += `Total Collection Amount : ${TotalCollectionAmount} \n`
  //    message += `Total Collection Amount : ${TotalCollectionLocalAmount}`
      
  //   const phone = selectedEmployee.phone_number;
  //   const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  //   window.open(whatsappLink, "_blank");
  // };

  const sendCSVToWhatsApp = () => {
    if (!selectedEmployee?.phone_number) {
        alert("No phone number available for the employee.");
        return;
    }
    const formattedDate = selectedDate.split('-').reverse().join('-');
    let message = "🔹 *Agent Report*\n";
    message += `Agent Name : ${selectedEmployee?.username.toUpperCase() || 'Unknown'} \n`;
    message += `Collection Date : ${formattedDate  || 'Unknown'} \n\n`;
  
    let TotalCollectionAmount = 0;
    let TotalCollectionLocalAmount = 0;

    filteredClients.forEach((client, index) => {
        const totalAmount = parseFloat(client.amount || 0);
        
        // Calculate Collection International Amount
        const collectionAmount = (client.paid_amount_date || []).reduce(
            (sum, payment) => sum + parseFloat(payment.amount || 0),
            0
        );

        // Calculate Collection Local Amount
        let collectionLocalamount = 0;
        const todayRate = parseFloat(client.today_rate) || 1; // Avoid division by zero
        if (Array.isArray(client.paid_amount_date)) {
            client.paid_amount_date.forEach(payment => {
                if (todayRate > 0) {
                    collectionLocalamount += (parseFloat(payment.amount) / todayRate) || 0;
                }
            });
        }
    
        // Calculate balance
        const balance = totalAmount - collectionAmount;
      
        // Accumulate totals
        TotalCollectionAmount += collectionAmount;
        TotalCollectionLocalAmount += collectionLocalamount;

        // Append client details
        message += `${index + 1}  | Client Name : ${client.client_name.toUpperCase() || 'Unknown'}, \n`;
        message += `      Collection Date :  ${ formattedDate}, \n`;     
        message += `      Total Local  Amount :   ${(totalAmount/client.today_rate).toFixed(3)}, \n`;
        message += `      Collection Local Amount : ${collectionLocalamount.toFixed(3)}\n`;
        message += "------------------------------------------------------------\n\n";
    });

  
    message += `🔹 *TOTAL COLLECTION LOCAL  AMOUNT:* ${TotalCollectionLocalAmount.toFixed(3)} \n`;

    console.log(message);

    const phone = selectedEmployee.phone_number;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, "_blank");
};




//  const sendDistributorCSVToWhatsApp = () => {
//   if (!selectedEmployee?.phone_number) {
//     alert("No phone number available for the employee.");
//     return;
//   }

//   const today = new Date();
//   const formattedDate = today.toLocaleDateString("en-GB"); // e.g., 27-05-2025

//   let message = "🔹 *Distributor Report*\n\n";
//   message += `Distributor Name :  ${selectedEmployee?.username || "Unknown"}\n`;
//   message += `Date : ${formattedDate}, \n`;

//   const todayRate = filteredUsers?.[0]?.today_rate ? parseFloat(filteredUsers[0].today_rate) : 1;
//   message += `Today Rate : ${todayRate.toFixed(2)}, \n\n\n`;

//   let totalINR = 0;
//   let paidAmountSum = 0;

//   filteredUsers.forEach((client, index) => {
//     const amount = parseFloat(client.amount) || 0;
//     totalINR += amount;

//     // Accumulate paid amounts
//     if (Array.isArray(client.paid_amount_date)) {
//       client.paid_amount_date.forEach(payment => {
//         paidAmountSum += parseFloat(payment.amount) || 0;
//       });
//     }

//     message += `${index + 1} |  INR : ${amount.toFixed(2)},      \n`;
//   });

//   message += "--------------------------\n\n";

//   const totalKD = totalINR / todayRate;
//   const paidKD = paidAmountSum / todayRate;
//   const balanceKD = totalKD - paidKD;

//   message += `🔹 INR: ${totalINR.toFixed(2)}\n`;
//   message += `🔹 TOTAL KD:  ${totalKD.toFixed(2)}\n`;
//   message += `🔹 *PAID KD:  ${paidKD.toFixed(2)}\n`;
//   message += `🔹 *BALANCE KD: ${balanceKD.toFixed(2)}\n`;

//   const phone = selectedEmployee.phone_number;
//   const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

//   window.open(whatsappLink, "_blank");
// };

   
//  const sendDistributorCSVToWhatsApp = () => {
//   if (!selectedEmployee?.phone_number) {
//     alert("No phone number available for the employee.");
//     return;
//   }

//   let message = "🔹 *Distributor Report*\n\n";
//   message += `Distributor Name :  ${selectedEmployee?.username || "Unknown"}\n\n`;

//   const todayRate = filteredUsers?.[0]?.today_rate ? parseFloat(filteredUsers[0].today_rate) : 1;
//   message += `Today Rate : ${todayRate.toFixed(2)}, \n\n\n`;

//   let totalINR = 0;
//   let paidAmountSum = 0;

//   filteredUsers.forEach((client, index) => {
//     const amount = parseFloat(client.amount) || 0;
//     totalINR += amount;

//     // Accumulate paid amounts
//     if (Array.isArray(client.paid_amount_date)) {
//       client.paid_amount_date.forEach(payment => {
//         paidAmountSum += parseFloat(payment.amount) || 0;
//       });
//     }

//     const clientDate = client.date || 'Unknown';

//     message += `${index + 1} |  INR : ${amount.toFixed(2)}, `;
//   });

//   message += "--------------------------\n\n";

//   const totalKD = totalINR / todayRate;
//   const paidKD = paidAmountSum / todayRate;
//   const balanceKD = totalKD - paidKD;

//   message += `🔹 INR: ${totalINR.toFixed(2)}\n`;
//   message += `🔹 TOTAL KD:  ${totalKD.toFixed(2)}\n`;
//   message += `🔹 *PAID KD:  ${paidKD.toFixed(2)}\n`;
//   message += `🔹 *BALANCE KD: ${balanceKD.toFixed(2)}\n`;

//   const phone = selectedEmployee.phone_number;
//   const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

//   window.open(whatsappLink, "_blank");
// };
  


const sendDistributorCSVToWhatsApp = () => {
  if (!selectedEmployee?.phone_number) {
    alert("No phone number available for the employee.");
    return;
  }

  // Get date from the first client
  const formattedDate = filteredUsers?.[0]?.date || "Unknown Date";

  let message = "🔹 *Distributor Report*\n\n";
  message += `Distributor Name :  ${selectedEmployee?.username || "Unknown"}\n`;
  message += `Date : ${formattedDate}, \n`;

  const todayRate = filteredUsers?.[0]?.today_rate ? parseFloat(filteredUsers[0].today_rate) : 1;
  message += `Today Rate : ${todayRate.toFixed(2)}, \n\n\n`;

  let totalINR = 0;
  let paidAmountSum = 0;

  filteredUsers.forEach((client, index) => {
    const amount = parseFloat(client.amount) || 0;
    totalINR += amount;

    if (Array.isArray(client.paid_amount_date)) {
      client.paid_amount_date.forEach(payment => {
        paidAmountSum += parseFloat(payment.amount) || 0;
      });
    }

    message += `${index + 1} |  INR : ${amount.toFixed(2)},      \n`;
  });

  message += "--------------------------\n\n";

  const currentKD = totalINR / todayRate;
  const oldKD = paidAmountSum / todayRate;
  const totalKD = currentKD + oldKD;

  message += `🔹TOTAL INR: ${totalINR.toFixed(2)}\n`;
  message += `🔹TOTAL KD: ${currentKD.toFixed(2)} \n`;
  message += `🔹 *OLD KD:  ${oldKD.toFixed(2)}\n`;
  message += `🔹 *TOTAL KD:  ${totalKD.toFixed(2)}\n`;

  const phone = selectedEmployee.phone_number;
  const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  window.open(whatsappLink, "_blank");
};



  const overallamount = filteredClients.reduce((total, client) => {
    return (
      total +
      (Array.isArray(client.paid_amount_date)
        ? client.paid_amount_date
          .filter((p) => p.userID === selectedEmployee.user_id)
          .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        : 0)
    );
  }, 0)

  const overallCollectionAmount = users.reduce((total, client) => {
    return (
      total +
      (Array.isArray(client.paid_amount_date)
        ? client.paid_amount_date.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
        : 0)
    );
  }, 0);

  const thisAgentCollectionAmount = filteredClients.reduce((total, client) => {
    return (
      total +
      (Array.isArray(client.paid_amount_date)
        ? client.paid_amount_date
          .filter((p) => p.userID === selectedEmployee.user_id)
          .reduce((sum, p) => {
            const paidAmount = parseFloat(p.amount) || 0;
            const clientRate = parseFloat(client.today_rate) || 1;
            return sum + (clientRate > 0 ? paidAmount / clientRate : 0);
          }, 0)
        : 0)
    );
  }, 0);

  const thisDistributorCollectionAmount = filteredUsers
    .filter((client) => client.Distributor_id === selectedEmployee?.user_id)
    .reduce((total, client) => {
      const clientAmount = parseFloat(client.amount) || 0;
      const clientRate = parseFloat(client.today_rate) || 1;
      return total + (clientRate > 0 ? clientAmount / clientRate : 0);
    }, 0);


  const otherAgentsCollectionAmount = overallCollectionAmount - thisAgentCollectionAmount;

  const totalbalanceAmount = overallAmount - thisAgentCollectionAmount;

  const handlenav = (client) => {
    dispatch(setSelectedClient(client));
    navigate("/clientinfo");
  };


  const customRound = (value) => {
    const decimalPart = value % 1; // Extract decimal part
    return decimalPart >= 0.50 ? Math.ceil(value) : Math.floor(value);
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
            <Button className="w-auto btn btn-primary" onClick={handlenavform}>Edit The Employee</Button>
            <Button className="w-auto btn btn-danger" onClick={() => setShowPasswordModal(true)} >Password Change</Button>
          </div>
        </div>
      </div>
      {/* <div className="d-flex justify-content-end px-2">
        <h4 className="px-4 py-3" style={{ backgroundColor: "#1246ac", color: "white" }}>
          COLLECTION AMOUNT
          <span style={{ backgroundColor: "white", color: "black" }} className="px-2 py-2 mx-1">
            {selectedEmployee?.role === "Distributor"
              ? thisDistributorCollectionAmount.toFixed(3)
              : thisAgentCollectionAmount.toFixed(3)}
          </span>
        </h4>
      </div> */}

      {(selectedEmployee?.role === "Distributor" || selectedEmployee?.role === "Agent") && (
  <div className="d-flex justify-content-end px-2">
    <h4 className="px-4 py-3" style={{ backgroundColor: "#1246ac", color: "white" }}>
      COLLECTION AMOUNT
      <span style={{ backgroundColor: "white", color: "black" }} className="px-2 py-2 mx-1">
        {selectedEmployee.role === "Distributor"
          ? thisDistributorCollectionAmount.toFixed(3)
          : thisAgentCollectionAmount.toFixed(3)}
      </span>
    </h4>
  </div>
)}

      {selectedEmployee?.role === "Collection Agent" ? (
        <div>
          <div className='record-header d-flex justify-content-end align-items-center  py-4 ' style={{ backgroundColor: 'rgb(119, 162, 207)' }}>
            <div>  <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button></div>
            <div> <InputGroup className="mb-auto" style={{ width: '200px' }}>
              <FormControl type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </InputGroup></div>
            <div>  <Button onClick={sendCSVToWhatsApp} className='mB-3 w-auto' variant="success">
              Send to WhatsApp
            </Button></div>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>CLIENT NAME</th>
                <th>DATE</th>
                <th>TODAY RATE</th>
                <th>TOTAL AMOUNT</th>
                <th>COLLECTION AMOUNT</th>
                <th>BALANCE AMOUNT</th>
                {selectedDate ? <th>COLLECTION DATE</th> : <></>}
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => {
                  const collectedAmount = Array.isArray(client.paid_amount_date)
                    ? client.paid_amount_date
                      .filter((p) => p.userID === selectedEmployee.user_id)
                      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                    : 0;
                  return (
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
                            <h4 onClick={() => handlenav(client)}>
                              {(client.client_name || "Unknown Client").toUpperCase()}
                            </h4>
                            <small>
                              {client.client_contact
                                ? client.client_contact.toUpperCase()
                                : "NO CONTACT AVAILABLE"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{client.date}</td>
                      <td>{client.today_rate}</td>
                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER: <span>{client.amount ? parseFloat(client.amount).toFixed(2) : "0.00"}</span>
                          </h4>
                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {client.amount && client.today_rate
                                ? (parseFloat(client.amount) / parseFloat(client.today_rate)).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td>

                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER:{" "}
                            <span>
                              {client.amount
                                ? parseFloat(collectedAmount).toFixed(2)
                                : "0.00"}
                            </span>
                          </h4>

                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {collectedAmount && client.today_rate
                                ? (
                                  parseFloat(collectedAmount) /
                                  parseFloat(client.today_rate)
                                ).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td>


                      {/* <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER:{" "}
                            <span>
                              {client.amount
                                ? parseFloat(client.amount - collectedAmount) >= 0.50
                                  ? Math.ceil(parseFloat(client.amount - collectedAmount)).toFixed(2)
                                  : "0.00"
                                : "0.00"}
                            </span>
                          </h4>
                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {collectedAmount && client.today_rate
                                ? (
                                  (parseFloat(client.amount - collectedAmount) /
                                    parseFloat(client.today_rate)) || 0
                                ).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td> */}



                      {/* <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER:{" "}
                            <span>
                              {client.amount
                                ? parseFloat(client.amount - collectedAmount) >= 0.50
                                  ? customRound(parseFloat(client.amount - collectedAmount)).toFixed(2)
                                  : "0.00"
                                : "0.00"}
                            </span>
                          </h4>

                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {collectedAmount && client.today_rate
                                ? (
                                  parseFloat(client.amount - collectedAmount) /
                                  parseFloat(client.today_rate)
                                ).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td> */}


                      <td>
  <div className="client-info">
    <h4 style={{ color: "blue", fontWeight: "500" }}>
      INTER:{" "}
      <span>
        {client.amount
          ? Math.max(parseFloat(client.amount - collectedAmount), 0.00) >= 0.50
            ? customRound(Math.max(parseFloat(client.amount - collectedAmount), 0.00)).toFixed(2)
            : "0.00"
          : "0.00"}
      </span>
    </h4>

    <h4 style={{ color: "red", fontWeight: "500" }}>
      LOCAL:{" "}
      <span>
        {collectedAmount && client.today_rate
          ? Math.max(
              parseFloat(client.amount - collectedAmount) / parseFloat(client.today_rate),
              0.000
            ).toFixed(3)
          : "0.000"}
      </span>
    </h4>
  </div>
</td>



                      <td>
                        {selectedDate ? format(new Date(selectedDate), "dd-MM-yyyy") : <></>}
                      </td>
                    </tr>
                  );
                })
              ) : (<tr><td colSpan="7" className="text-center">No Data Found</td></tr>)}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end">
                  <strong>Total Collection:</strong>
                </td>
                <td>
                  <strong>
                    {thisAgentCollectionAmount.toFixed(3)}
                  </strong>
                </td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : selectedEmployee?.role === "Distributor" ? (
        <div>
          <div>
            <div className='d-flex justify-content-end align-items-center  py-4 ' style={{ backgroundColor: 'rgb(119, 162, 207)' }}>
              <div>  <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button></div>
              <div> <InputGroup className="mb-auto" style={{ width: '200px' }}>
                <FormControl type="date" value={selectedClientDate} onChange={handleDateChange} />
              </InputGroup></div>
              <div>  <Button className='mB-3 w-auto' variant="success" onClick={sendDistributorCSVToWhatsApp} >
                Send to WhatsApp
              </Button></div>
            </div>

          </div>
          <table className="table table-striped w-70">
            <thead>
              <tr>
                <th>#</th>
                <th>CLIENT NAME</th>
                <th>DATE</th>
                <th>AGENT</th>
                <th>AMOUNT</th>
                <th>TODAY RATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((eid, index) => {
                  const matchedEmployee = employees.find((ename) => ename.user_id === eid.user_id);
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{eid.client_name ? eid.client_name.toUpperCase() : "UNKNOWN CLIENT"}</td>
                      <td>{eid.date}</td>
                      <td>{matchedEmployee ? matchedEmployee.username.toUpperCase() : "---"}</td>
                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER: <span>{eid.amount ? parseFloat(eid.amount).toFixed(2) : "0.00"}</span>
                          </h4>
                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {eid.amount && eid.today_rate
                                ? (parseFloat(eid.amount) / parseFloat(eid.today_rate)).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td>
                      <td>{eid.today_rate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      ) : (
       selectedEmployee?.role === "Dtp" ?(
                       <div>
          {/* <div>
            <div className='d-flex justify-content-end align-items-center  py-4 ' style={{ backgroundColor: 'rgb(119, 162, 207)' }}>
              <div>  <Button onClick={exportToExcel} className='mB-3 w-auto'>Export to Excel</Button></div>
              <div> <InputGroup className="mb-auto" style={{ width: '200px' }}>
                <FormControl type="date" value={selectedClientDate} onChange={handleDateChange} />
              </InputGroup></div>
              <div>  <Button className='mB-3 w-auto' variant="success" onClick={sendDistributorCSVToWhatsApp} >
                Send to WhatsApp
              </Button></div>
            </div>

          </div> */}
          <table className="table table-striped w-70">
            <thead>
              <tr>
                <th>#</th>
                <th>CLIENT NAME</th>
                <th>DATE</th>
                <th>AGENT</th>
                <th>AMOUNT</th>
                <th>TODAY RATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((eid, index) => {
                  const matchedEmployee = employees.find((ename) => ename.user_id === eid.user_id);
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{eid.client_name ? eid.client_name.toUpperCase() : "UNKNOWN CLIENT"}</td>
                      <td>{eid.date}</td>
                      <td>{matchedEmployee ? matchedEmployee.username.toUpperCase() : "---"}</td>
                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER: <span>{eid.amount ? parseFloat(eid.amount).toFixed(2) : "0.00"}</span>
                          </h4>
                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {eid.amount && eid.today_rate
                                ? (parseFloat(eid.amount) / parseFloat(eid.today_rate)).toFixed(3)
                                : "0.000"}
                            </span>
                          </h4>
                        </div>
                      </td>
                      <td>{eid.today_rate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
       ) :(<p>no client  </p>)
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


