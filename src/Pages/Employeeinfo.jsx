


import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, InputGroup, FormControl, Modal, Form } from "react-bootstrap";
import * as XLSX from 'xlsx';
import { MdEmail } from "react-icons/md";
import { IoMdCall } from "react-icons/io";
import { setUsers, setSelectedClient } from '../Slicers/clientSlice';
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import { format, parse } from "date-fns";
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
   const [amountData, setAmountData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);


  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('selectedEmployee');
    if (storedEmployee) {
      setSelectedEmployee(JSON.parse(storedEmployee));
      fetchEmployees();
      console.log("employee data ", storedEmployee)
    } else {
      navigate("/employee");
    }
  }, [navigate]);

  const [selectedaDate, setSelectedaDate] = useState(null)

  const handleDateChange = (e) => {
    setSelectedaDate(e.target.value)
    const formattedDate = formatDateToDDMMYYYY(selectedaDate);
    setSelectedClientDate(formattedDate);
    console.log(formattedDate);
  };


  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };






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


  const filteredClients = employeeClients
    .map(client => {
      let filteredPayments = [];

      if (Array.isArray(client.paid_amount_date)) {
        filteredPayments = client.paid_amount_date
          .filter(payment => {
            if (!payment?.date || !payment?.userID) return false;

            const [year, month, day] = selectedDate?.split("-") || [];
            const matchesDate = selectedDate ? payment.date === `${day}-${month}-${year}` : true;
            const matchesEmployee = selectedEmployee ? payment.userID === selectedEmployee.user_id : true;

            return matchesDate && matchesEmployee;
          })
          // Optional: Sort inside paid_amount_date if needed
          .sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split("-");
            const [dayB, monthB, yearB] = b.date.split("-");
            const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
            const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
            return dateB - dateA;
          });
      }

      return { ...client, paid_amount_date: filteredPayments };
    })
    // Keep only clients with at least one valid payment
    .filter(client => client.paid_amount_date.length > 0)
    // ✅ Sort clients by latest paid_amount_date (descending)
    .sort((a, b) => {
      const getLatestDate = arr => {
        const latest = arr[0]; // Already sorted above
        if (!latest?.date) return new Date(0);
        const [day, month, year] = latest.date.split("-");
        return new Date(`${year}-${month}-${day}`);
      };

      return getLatestDate(b.paid_amount_date) - getLatestDate(a.paid_amount_date);
    });


  console.log(filteredClients);

  const [paiddisdata,setPaiddidata] = useState()
  
  
      useEffect(() => {
        const token = localStorage.getItem("authToken");
    
        fetch(`${API_URL}/collection/paid`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          }
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Error ${res.status} - ${res.statusText}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log("✅ Received paid amount data:", data);
            setPaiddidata(data)
          })
          .catch((error) => {
            console.error("❌ Fetch failed:", error.message);
          });
      }, []);
    





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




//   const sendCSVToWhatsApp = () => {
//     if (!selectedEmployee?.phone_number) {
//       alert("No phone number available for the employee.");
//       return;
//     }
//     const formattedDate = selectedDate.split('-').reverse().join('-');
//     let message = "🔹 *Agent Report*\n";
//     message += `Agent Name : ${selectedEmployee?.username.toUpperCase() || 'Unknown'} \n`;
//     message += `Collection Date : ${selectedDate || 'Unknown'} \n\n`;

//     let TotalCollectionAmount = 0;
//     let TotalCollectionLocalAmount = 0;
    
//     filteredData.forEach((client, index) => {
//       const totalAmount = parseFloat(client.paidAmount || 0);

//    const distributor = employees.find(
//   (value) => value.user_id === client.Distributor_id
// );

// const Distributorname = distributor ? distributor.username : "Unknown";
        
      
//       // Calculate Collection International Amount
//       // const collectionAmount = (client.paid_amount_date || []).reduce(
//       //   (sum, payment) => sum + parseFloat(payment.amount || 0),
//       //   0
//       // );

//       // Calculate Collection Local Amount
//       // let collectionLocalamount = 0;
//       // const todayRate = parseFloat(client.today_rate) || 1; // Avoid division by zero
//       // if (Array.isArray(client.paid_amount_date)) {
//       //   client.paid_amount_date.forEach(payment => {
//       //     if (todayRate > 0) {
//       //       collectionLocalamount += (parseFloat(payment.amount) / todayRate) || 0;
//       //     }
//       //   });
//       // }

//       // // Calculate balance
//       // const balance = totalAmount - collectionAmount;

//       // // Accumulate totals
//       // TotalCollectionAmount += collectionAmount;
//       // TotalCollectionLocalAmount += collectionLocalamount;
//        TotalCollectionLocalAmount += totalAmount

//       // Append client details
//       message += `${index + 1}  | Distributor Name : ${Distributorname.toUpperCase() || 'Unknown'}, \n`;
//       message += `      Collection Date :  ${selectedDate}, \n`;
//       message += `      Total Local  Amount :   ${(totalAmount.toFixed(3))}, \n`;
//       // message += `      Collection Local Amount : ${collectionLocalamount.toFixed(3)}\n`;
//       message += "------------------------------------------------------------\n\n";
//     });


//     message += `🔹 *TOTAL COLLECTION LOCAL  AMOUNT:* ${TotalCollectionLocalAmount.toFixed(3)} \n`;

//     console.log(message);

//     const phone = selectedEmployee.phone_number;
//     const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

//     window.open(whatsappLink, "_blank");
//   };

  const sendCSVToWhatsApp = () => {
  if (!selectedEmployee?.phone_number) {
    alert("No phone number available for the employee.");
    return;
  }

  const formattedDate = selectedDate.split('-').reverse().join('-');
  let message = "🔹 *Agent Report*\n";
  message += `👤 Agent Name : ${selectedEmployee?.username?.toUpperCase() || 'Unknown'}\n`;
  message += `📅 Collection Date : ${selectedDate || 'Unknown'}\n\n`;

  let TotalCollectionLocalAmount = 0;

  if (!filteredData.length) {
    message += "⚠️ No collection data available for this date.\n";
  }

  filteredData.forEach((client, index) => {
    const paidArray = Array.isArray(client.paidamount) ? client.paidamount : [0];
    const totalAmount = parseFloat(paidArray[0] || 0);

    // Find distributor by user_id
    const distributor = employees.find(
      (emp) => emp.user_id === client.Distributor_id
    );
    const Distributorname = distributor ? distributor.username : "Unknown";

    // Accumulate total
    TotalCollectionLocalAmount += totalAmount;

    // Append to message
    message += `🔸 *Entry ${index + 1}*\n`;
    message += `• Distributor Name : ${(Distributorname || 'Unknown').toUpperCase()}\n`;
    message += `• Collection Date  : ${selectedDate}\n`;
    message += `• Local Amount     : ₹${totalAmount.toFixed(3)}\n`;
    message += `------------------------------------------------------------\n\n`;
  });

  message += `🔹 *TOTAL COLLECTION LOCAL AMOUNT:* ₹${TotalCollectionLocalAmount.toFixed(3)}\n`;

  console.log(message); // For debugging

  const phone = selectedEmployee.phone_number;
  if (phone) {
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  } else {
    alert("Phone number is invalid.");
  }
};



  const sendDistributorCSVToWhatsApp = () => {
    if (!selectedEmployee?.phone_number) {
      alert("No phone number available for the employee.");
      return;
    }

           const distributorId = selectedEmployee.user_id;
    const distributorCollections = paiddisdata.filter(
    (e) => e.Distributor_id === distributorId 
  );

    
      const totalCollAmount = distributorCollections.reduce((sum, item) => {
    const amounts = Array.isArray(item.paidamount) ? item.paidamount : [item.paidamount];
    const itemTotal = amounts.reduce((subSum, val) => subSum + (parseFloat(val) || 0), 0);
    return sum + itemTotal;
  }, 0);

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

    const balanceKD =  currentKD.toFixed(3) - totalCollAmount.toFixed(3)

    message += `🔹 * INR: ${totalINR.toFixed(2)}\n`;
    message += `🔹 * KD: ${currentKD.toFixed(3)} \n`;
    message += `🔹 * OLD KD:  ${totalCollAmount.toFixed(3)}\n`;
    message += `🔹 * TOTAL KD:  ${ balanceKD.toFixed(3)}\n`;

    const phone = selectedEmployee.phone_number;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappLink, "_blank");
  };




  const overallCollectionAmount = users.reduce((total, client) => {
    return (
      total +
      (Array.isArray(client.paid_amount_date)
        ? client.paid_amount_date.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
        : 0)
    );
  }, 0);



  const thisAgentCollectionAmount = filteredClients.reduce((total, client) => {
    const clientRate = parseFloat(client.today_rate);

    // Skip if rate is missing, zero, or invalid
    if (!clientRate || isNaN(clientRate) || clientRate <= 0) return total;

    const clientTotal = Array.isArray(client.paid_amount_date)
      ? client.paid_amount_date
        .filter((p) => p.userID === selectedEmployee.user_id)
        .reduce((sum, p) => {
          const paidAmount = parseFloat(p.amount) || 0;
          return sum + paidAmount / clientRate;
        }, 0)
      : 0;

    return total + clientTotal;
  }, 0);




  const thisDistributorCollectionAmount = filteredUsers
    .filter((client) => {
      const isDistributorMatch = client.Distributor_id === selectedEmployee?.user_id;
      const rate = parseFloat(client.today_rate);
      return isDistributorMatch && !isNaN(rate) && rate > 0;
    })
    .reduce((total, client) => {
      const clientAmount = parseFloat(client.amount) || 0;
      const clientRate = parseFloat(client.today_rate);
      return total + (clientAmount / clientRate);
    }, 0);


    // const  thisDistributorpaidamount = amountData
    // .filter((paidamount) =>{
    //   const paiddata = paidamount.Distributor_id === selectedEmployee?.user_id
    // }).reduce((total,amount) =>{
    //    return total +amount.paidAmount
    // },0)

    const thisDistributorpaidamount = amountData
  .filter((paidamount) => paidamount.Distributor_id === selectedEmployee?.user_id)
  .reduce((total, amount) => {
    const sumOfPaid = Array.isArray(amount.paidamount)
      ? amount.paidamount.reduce((a, b) => a + b, 0)
      : parseFloat(amount.paidamount) || 0;
    return total + sumOfPaid;
  }, 0);
     

    console.log("paidamount",thisDistributorpaidamount.toFixed(3))



  const handlenav = (client) => {
    dispatch(setSelectedClient(client));
    navigate("/clientinfo");
  };


  const customRound = (value) => {
    const decimalPart = value % 1; // Extract decimal part
    return decimalPart >= 0.50 ? Math.ceil(value) : Math.floor(value);
  };

 


  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(`${API_URL}/collection/paid`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Received paid amount data:", data);
        setAmountData(data);
      })
      .catch((error) => {
        console.error("❌ Fetch failed:", error.message);
      });
  }, []); 



  useEffect(() => {
    const storedEmployee = JSON.parse(sessionStorage.getItem("selectedEmployee"));
    const formattedDate = formatDateToDDMMYYYY(selectedDate);

    const filtered = amountData.filter((item) => {
      const matchAgent =
        storedEmployee && storedEmployee.user_id
          ? item.agent_id === storedEmployee.user_id
          : true;

      const matchDate = formattedDate ? item.colldate === formattedDate : true;

      return matchAgent && matchDate;
    });

    setFilteredData(filtered);
    console.log("filter data", filtered)
  }, [amountData, selectedDate]);


   const [collectiondata,setCollectiondata] = useState()

   const [collectionamount,setCollectionamount] = useState(null)

    useEffect(() => {
      const token = localStorage.getItem("authToken");
  
      fetch(`${API_URL}/collection/collection`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        }
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error ${res.status} - ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ Received Collection amount data:", data);
          setCollectiondata(data);
        })
        .catch((error) => {
          console.error("❌ Fetch failed:", error.message);
        });
    }, []);



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


      {(selectedEmployee?.role === "Distributor" || selectedEmployee?.role === "Collection Agent") && (
        <div className="d-flex justify-content-end px-2">
          <h4 className="px-4 py-3" style={{ backgroundColor: "#1246ac", color: "white" }}>
            COLLECTION AMOUNT
            <span style={{ backgroundColor: "white", color: "black" }} className="px-2 py-2 mx-1">
              {selectedEmployee.role === "Distributor"
                ? thisDistributorCollectionAmount.toFixed(3)
                : thisAgentCollectionAmount.toFixed(3)}
            </span>
          </h4>
          {selectedEmployee.role === "Distributor"?
           <h4 className="px-4 py-3" style={{ backgroundColor: "#1246ac", color: "white" }}>
            PAID AMOUNT
            <span style={{ backgroundColor: "white", color: "black" }} className="px-2 py-2 mx-1">             
                {thisDistributorpaidamount.toFixed(3)}
            </span>
          </h4>
          :(<span></span>)}
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
                <th>Distributer Name</th>
                <th>DATE</th>
                <th>TODAY RATE</th>
                <th>TOTAL AMOUNT</th>
                <th>COLLECTION AMOUNT</th>
                <th>BALANCE AMOUNT</th>
                {/* {selectedDate ? <th>COLLECTION DATE</th> : <></>} */}
              </tr>
            </thead>

            <tbody>
  {(() => {
    const collectionMap = {};

    filteredData.forEach((item) => {
      const { collection_id, paidamount } = item;
      const paid = Array.isArray(paidamount) ? paidamount[0] : 0;

      if (!collectionMap[collection_id]) {
        collectionMap[collection_id] = {
          ...item,
          paidamountSum: paid,
        };
      } else {
        collectionMap[collection_id].paidamountSum += paid;
      }
    });

    const groupedData = Object.values(collectionMap);

    return groupedData.length > 0 ? (
      groupedData.map((value, index) => (
        <tr key={value.collection_id}>
  <td>{index + 1}</td>
  <td>
    <div className="client">
      <div
        className="client-img bg-img"
        style={{
          backgroundImage:
          'url("https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg")',
        }}
      ></div>
      <div className="client-info">
        {(() => {
          const emp = employees.find(
            (e) => e.user_id === value.Distributor_id
          );
          return emp ? (
            <>
              <h4>{emp.username}</h4>
              <small>{emp.phone_number}</small>
            </>
          ) : null;
        })()}
      </div>
    </div>
  </td>
  <td>{value.colldate}</td>
  <td>{value.today_rate}</td>

  {/* Fetch collamount from collectiondata and compute balance */}
  {(() => {
    const distributorId = value.Distributor_id;
    const distributorCollections = collectiondata.filter(
    (e) => e.Distributor_id === distributorId 
  );

    if (distributorCollections) {
      const totalCollAmount = distributorCollections.reduce((sum, item) => {
    const amounts = Array.isArray(item.collamount) ? item.collamount : [item.collamount];
    const itemTotal = amounts.reduce((subSum, val) => subSum + (parseFloat(val) || 0), 0);
    return sum + itemTotal;
  }, 0);
  


      // const collAmount = parseFloat(coll.collamount) || 0;
      const paidAmount = parseFloat(value.paidamountSum) || 0;
      const balance = totalCollAmount - paidAmount;

      return (
        <>
          
           <td>
                    <div className="client-info">
                      <h4 style={{ color: "blue", fontWeight: "500" }}>
                        LOCAL: <span>{totalCollAmount? (parseFloat(totalCollAmount)).toFixed(3) : "0.00"}</span>
                      </h4>
                      <h4 style={{ color: "red", fontWeight: "500" }}>
                       INTER:{" "}
                        <span>
                          {totalCollAmount && value.today_rate
                            ? (parseFloat(totalCollAmount)*parseFloat(value.today_rate)).toFixed(2)
                            : "0.000"}
                        </span>
                      </h4>
                    </div>
                  </td>
          <td>
              <div className="client-info">
              <h4 style={{ color: "red", fontWeight: "500" }}>
                          LOCAL:{" "}
                          <span>
                            {paidAmount.toFixed(3)}
                          </span>
                        </h4>
                        </div>
          </td>
           <td>
              <div className="client-info">
              <h4 style={{ color: "red", fontWeight: "500" }}>
                          LOCAL:{" "}
                          <span>
                           {(balance).toFixed(3)}
                          </span>
                        </h4>
                        </div>
          </td>
         
        </>
      );
    } else {
      return (
        <>
          <td>N/A</td>
          <td>{value.paidamountSum}</td>
          <td>N/A</td>
        </>
      );
    }
  })()}
</tr>

      ))
    ) : (
      <tr>
        <td colSpan="5" className="text-center">
          No data available
        </td>
      </tr>
    );
  })()}
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
                <FormControl type="date" value={selectedaDate} onChange={handleDateChange} />
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
        selectedEmployee?.role === "Dtp" ? (
          <div>

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
        ) : (<p>no client  </p>)
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


