
// import React, { useState, useMemo, useEffect } from "react";
// import { InputGroup, FormControl, Form } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { parse, subDays, format,isValid } from "date-fns";
// import { useNavigate } from "react-router-dom";
// import {setUsers,setSelectedClient,setSearchQuery,} from "../Slicers/clientSlice";
// import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";


// function Alldata() {
//   const API_URL = import.meta.env.VITE_API_URL;

//   const [clients, setClients] = useState([]);
//   const [dashboardNav, setDashboardNav] = useState("OverAllAmount");
//   const dispatch = useDispatch();
//   const handleAgentChange = (e) => setSelectedAgent(e.target.value);
//   const [selectedAgent, setSelectedAgent] = useState("");
//   const yesterday = subDays(new Date(), 1);
//   const formattedYesterday = format(yesterday, "yyyy-MM-dd");

//   const [startDate, setStartDate] = useState(formattedYesterday);
//   const [endDate, setEndDate] = useState(formattedYesterday);

//   const users = useSelector((state) => state.clients.users);
//   const navigate = useNavigate();
//   const employees = useSelector((state) => state.employees.employees);

//   const handleStartDateChange = (e) => {
//     setStartDate(e.target.value);
//   };

//   const handleEndDateChange = (e) => {
//     setEndDate(e.target.value);
//   };

//   useEffect(() => {
//     const Authorization = localStorage.getItem("authToken");

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
//   }, [dispatch]);

//     useEffect(() => {
//       const Authorization = localStorage.getItem("authToken");
//       if (Authorization) {
//         fetch(`${API_URL}/list`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: Authorization,
//           },
//         })
//           .then((response) => {
//             if (response.status === 401) {
//               console.error("Unauthorized access - redirecting to login");
//               handleUnauthorizedAccess();
//               return;
//             }
//             return response.json();
//           })
//           .then((data) => dispatch(setEmployees(data)))

//           .catch((error) => console.error("Fetch error:", error));
//       } else {
//         console.error("No authorization token found in localStorage");
//       }
//     }, [dispatch]);
//     const getPaidAmountInRange = (row, startDate, endDate) => {
//       if (!Array.isArray(row.paid_amount_date)) return 0;

//       const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
//       const endParsed = parse(endDate, "yyyy-MM-dd", new Date());

//       if (!isValid(startParsed) || !isValid(endParsed)) return 0;

//       const filteredPayments = row.paid_amount_date.filter((payment) => {
//         const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());

//         return isValid(paymentDateParsed) && 
//                paymentDateParsed >= startParsed && 
//                paymentDateParsed <= endParsed;
//       });

//       return filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
//     };

//     const filteredData = useMemo(() => {
//       if (!startDate || !endDate) return users || [];

//       return (users || []).filter((row) => {
//         const totalPaidInRange = getPaidAmountInRange(row, startDate, endDate);

//         // Check if any payment record in paid_amount_date matches selectedAgent
//         const hasMatchingAgent = row.paid_amount_date?.some(
//           (payment) => payment.userID === selectedAgent
//         );

//         return selectedAgent ? hasMatchingAgent && totalPaidInRange > 0 : totalPaidInRange > 0;
//       });
//     }, [users, startDate, endDate, selectedAgent]);

//     const overallAmount = useMemo(() => {
//       return (users || []).reduce((total, value) => {
//         const clientAmount = parseFloat(value.amount) || 0;
//         const clientRate = parseFloat(value.today_rate) || 1;
//         return total + (clientRate > 0 ? clientAmount / clientRate : 0);
//       }, 0);
//     }, [users]);

//     console.log("Overall Amount:", overallAmount);

//     const totalPaidAmountInRange = useMemo(() => {
//       return (filteredData || []).reduce((sum, row) => {
//         const totalPaid = getPaidAmountInRange(row, startDate, endDate);
//         const clientRate = parseFloat(row.today_rate) || 1;
//         return sum + (clientRate > 0 ? totalPaid / clientRate : 0);
//       }, 0);
//     }, [filteredData, startDate, endDate]);

//     const roundedTotalPaidAmount = useMemo(() => {
//       return Math.round((totalPaidAmountInRange + Number.EPSILON) * 1000) / 1000;
//     }, [totalPaidAmountInRange]);

//     const handlenav = (client) => {
//       dispatch(setSelectedEmployee(client));
//       console.log("Employee detail:", client);
//       navigate("/employee/employeeinfo");
//     };

//     const handlenav1 = (client) => {
//       dispatch(setSelectedClient(client));
//       console.log("Client detail:", client);
//       navigate("/clientinfo");
//     };


//   const exportToCSV = () => {
//     const tableData = filteredData.map((row, index) => {
//       const paidAmountInRange = getPaidAmountInRange(row, startDate, endDate);
//       const paidAmount = Array.isArray(row.paid_amount_date)
//         ? row.paid_amount_date.reduce(
//             (sum, payment) => sum + parseFloat(payment.amount),
//             0
//           )
//         : 0;
//       const balanceAmount = row.amount - paidAmount;

//       return {
//         "#": index + 1,
//         "Client Name": row.client_name || "N/A",
//         "City": row.client_city || "N/A",
//         "Agent Name": employees.find((eid) => eid.user_id === row.user_id)?.username || "N/A",
//         "Total Amount": `${row.amount}`,
//         "Status": row.paid_and_unpaid === 1 ? "Paid" : "Unpaid",
//         "Paid Amount in Range": `${paidAmountInRange}`,
//         "Total Paid Amount": `${paidAmount}`,
//         "Balance Amount": `${balanceAmount} `,
//       };
//     });


//     const headers = Object.keys(tableData[0]);
//     const csvContent = [
//       headers.join(","), 
//       ...tableData.map((row) => headers.map((header) => row[header]).join(",")), 
//     ].join("\n");


//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);

//     const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
//     link.download = `filtered_data_${timestamp}.csv`;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };
//   const getTotalPaidClientCount = (users, startDate, endDate) => {
//     return users.filter((row) => {
//       if (Array.isArray(row.paid_amount_date)) {
//         return row.paid_amount_date.some((payment) => {
//           const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());
//           const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
//           const endParsed = parse(endDate, "yyyy-MM-dd", new Date());
//           return paymentDateParsed >= startParsed && paymentDateParsed <= endParsed;
//         });
//       }
//       return false;
//     }).length;
//   };


//   const totalpaidclientcount = getTotalPaidClientCount(users, startDate, endDate);


//   const filterDataByDateRange = (data, startDate, endDate) => {
//     if (!startDate || !endDate) {
//       return data; 
//     }

//     return data.map((row) => {
//       if (Array.isArray(row.paid_amount_date)) {
//         const filteredPayments = row.paid_amount_date.filter((payment) => {
//           const paymentDate = new Date(payment.date.split("-").reverse().join("-")); 
//           return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
//         });

//         return { ...row, paid_amount_date: filteredPayments };
//       }
//       return row;
//     });
//   };

//   const filteredDataToShow = filterDataByDateRange(filteredData, startDate, endDate);
//   return (


// <div className="mt-5">
//   <div className="page-header">
//     <h1>All Data</h1>
//     <small>Alldata / Dash</small>
//   </div>


// <div className="p-4 bg-white border rounded-3 shadow-lg">
//   <h4 className="text-center fw-bold mb-4 text-primary">Dashboard Summary</h4>

//   <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
//     <span className="fw-semibold text-muted">Overall Amount</span>
//     <span className="fw-bold fs-5 text-success">{overallAmount.toFixed(3)}</span>
//   </div>

//   <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
//     <span className="fw-semibold text-muted">
//       Paid Amount ({startDate} to {endDate})
//     </span>
//     <span className="fw-bold fs-5 text-primary">{ roundedTotalPaidAmount.toFixed(3)}</span>
//   </div>

//   <div className="py-3 px-4 bg-light rounded-2 d-flex justify-content-between align-items-center">
//     <span className="fw-semibold text-muted">Total Paid Clients</span>
//     <span className="fw-bold fs-5 text-danger">{totalpaidclientcount}</span>
//   </div>
// </div>

//   <div>


//     </div>
//     <div className="">
//       <div className="record-header d-flex justify-content-between">
//         <div className="add  pt-1">
//         <div  className="m-0 p-0">  <button onClick={ exportToCSV} className="btn btn-primary w-auto">
//           Export to Excel
//         </button></div>
//         </div>

//         <div className="d-flex gap-2 flex-wrap  justify-content-center p-2  ">

//         <div className="d-flex gap-2  md-flex-wrap pt-2">

//         <Form.Select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
//   <option value="">All Agents</option>
//   {employees
//     .filter((employee) => employee.role === "Collection Agent") // Filter agents only
//     .map((employee) => (
//       <option key={employee.user_id} value={employee.user_id}>
//         {employee.username}
//       </option>
//     ))}
// </Form.Select>
//           <InputGroup className="mb-auto w-50">
//             <FormControl
//               type="date"
//               value={startDate}
//               onChange={handleStartDateChange}
//               placeholder="Start Date"
//             />
//           </InputGroup>
//           <InputGroup className="mb-auto w-50">
//             <FormControl
//               type="date"
//               value={endDate}
//               onChange={handleEndDateChange}
//               placeholder="End Date"
//             />
//           </InputGroup>
//           </div>
//         </div>
//       </div>
//       {startDate && endDate && (
//         <div>
//           <table className="table table-striped">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>CLIENT NAME</th>
//                 <th>CITY</th>
//                 <th>AGENT NAME</th>               
//                 <th>STATUS</th>
//                 <th>RATE</th>
//                 <th>PAID AMOUNT</th>
//                 <th>PAID DATE</th>

//               </tr>
//             </thead>

//             <tbody>
//   {filteredDataToShow.length > 0 ? (
//     filteredDataToShow
//       .flatMap((row) =>
//         row.paid_amount_date && row.paid_amount_date.length > 0
//           ? row.paid_amount_date.map((payment) => ({
//               ...payment,
//               client_name: row.client_name,
//               client_city: row.client_city,
//               paid_and_unpaid: row.paid_and_unpaid,
//               today_rate: row.today_rate,
//               user_id: payment.userID,
//             }))
//           : [
//               {
//                 client_name: row.client_name,
//                 client_city: row.client_city,
//                 paid_and_unpaid: row.paid_and_unpaid,
//                 today_rate: row.today_rate,
//                 noPayment: true,
//               },
//             ]
//       )
//       .sort((a, b) => {
//         const dateA = new Date(a.date.split("-").reverse().join("-"));
//         const dateB = new Date(b.date.split("-").reverse().join("-"));
//         return dateA - dateB;
//       })
//       .map((payment, index) => {
//         const agent = employees.find((e) => e.user_id === payment.user_id);
//         return (
//           <tr key={`${payment.client_name}-${index}`}>
//             <td>{index + 1}</td>
//             <td  onClick={() => handlenav1(payment)} >{payment.client_name.toUpperCase()}</td>
//             <td>{payment.client_city.toUpperCase()}</td>
//             <td  onClick={() => handlenav(agent)}>{agent ? agent.username.toUpperCase() : "Unknown"}</td>
//             <td>
//               <p
//                 className={`badge ${payment.paid_and_unpaid === 1 ? "bg-success" : "bg-danger"}`}
//               >
//                 {payment.paid_and_unpaid === 1 ? "Paid" : "Unpaid"}
//               </p>
//             </td>
//             <td>{payment.today_rate}</td>

//             <td>
//   <div className="client-info">
//     <h4 style={{ color: "blue", fontWeight: "500" }}>
//       INTER:{" "}
//       <span>
//         {payment.amount
//           ? Math[parseFloat(payment.amount) % 1 >= 0.5 ? "ceil" : "floor"](parseFloat(payment.amount)).toFixed(2)
//           : "0.00"}
//       </span>
//     </h4>
//     <h4 style={{ color: "red", fontWeight: "500" }}>
//       LOCAL:{" "}
//       <span>
//         {payment.amount && payment.today_rate
//           ? (parseFloat(payment.amount) / parseFloat(payment.today_rate)).toFixed(3)
//           : "0.000"}
//       </span>
//     </h4>
//   </div>
// </td>
//             <td>{payment.date || "No Payment"}</td>
//           </tr>
//         );
//       })
//   ) : (
//     <tr>
//       <td colSpan="8" className="text-center">
//         No data found for the selected date range
//       </td>
//     </tr>
//   )}
// </tbody>
//           </table>
//           <div className="d-flex justify-content-end p-3">
//             <p>
//               <strong>Total Paid Amount for the selected range: </strong>
//               {totalPaidAmountInRange.toFixed(3)}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   </div>
//   );
// }

// export default Alldata;


import React, { useState, useMemo, useEffect } from "react";
import { InputGroup, FormControl, Form, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { parse, subDays, format, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  setUsers,
  setSelectedClient,
} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";

function Alldata() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedAgent, setSelectedAgent] = useState("");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), "yyyy-MM-dd"));

  const users = useSelector((state) => state.clients.users) || [];
  const employees = useSelector((state) => state.employees.employees) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const Authorization = localStorage.getItem("authToken");
      try {
        // Fetch clients
        const clientsRes = await fetch(`${API_URL}/acc_list`, {
          headers: { Authorization }
        });
        const clientsData = await clientsRes.json();
        dispatch(setUsers(clientsData));

        // Fetch employees
        const employeesRes = await fetch(`${API_URL}/list`, {
          headers: { Authorization }
        });
        const employeesData = await employeesRes.json();
        dispatch(setEmployees(employeesData));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [dispatch]);



  const getPaidAmountInRange = (row, startDate, endDate) => {
    if (!Array.isArray(row.paid_amount_date)) return 0;

    const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
    const endParsed = parse(endDate, "yyyy-MM-dd", new Date());

    if (!isValid(startParsed) || !isValid(endParsed)) return 0;

    const filteredPayments = row.paid_amount_date.filter((payment) => {
      const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());

      return isValid(paymentDateParsed) &&
        paymentDateParsed >= startParsed &&
        paymentDateParsed <= endParsed;
    });

    return filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  };

  // Enhanced filtering function
  const getFilteredData = () => {
    if (!startDate || !endDate) return users;

    return users.filter(client => {
      // Check if client has payments in date range
      const hasPaymentsInRange = client.paid_amount_date?.some(payment => {
        const paymentDate = parse(payment.date, "dd-MM-yyyy", new Date());
        const start = parse(startDate, "yyyy-MM-dd", new Date());
        const end = parse(endDate, "yyyy-MM-dd", new Date());

        if (!isValid(paymentDate)) return false;

        const inDateRange = paymentDate >= start && paymentDate <= end;

        // If agent is selected, check if payment matches agent
        if (selectedAgent) {
          return inDateRange && payment.userID == selectedAgent;
        }

        return inDateRange;
      });

      // If no agent selected, just check date range
      if (!selectedAgent) return hasPaymentsInRange;

      // If agent selected, check if client is assigned to agent OR has payments by agent
      return hasPaymentsInRange || client.user_id == selectedAgent;
    });
  };

  const filteredData = useMemo(getFilteredData, [users, startDate, endDate, selectedAgent]);

  const { 
    overallAmount, 
    totalPaidInRange, 
    paidClientCount, 
    paidinterAmount, 
    totalinteramount 
  } = useMemo(() => {
    const result = {
      overallAmount: 0,
      totalPaidInRange: 0,
      paidClientCount: 0,
      paidinterAmount: 0,
      totalinteramount: 0
    };
  
    // Return early if no users
    if (!users || users.length === 0) return result;
  
    try {
      // Pre-parse dates once for better performance
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = parse(endDate, "yyyy-MM-dd", new Date());
      const isValidDateRange = isValid(start) && isValid(end);
  
      users.forEach(client => {
        try {
          // Calculate overall amounts
          const clientAmount = parseFloat(client.amount) || 0;
          const clientRate = parseFloat(client.today_rate) || 1;
          
          result.overallAmount += clientRate > 0 ? clientAmount / clientRate : 0;
          result.totalinteramount += clientAmount; // INTER amount is just the raw amount
  
          // Calculate paid amounts in range
          if (client.paid_amount_date && isValidDateRange) {
            const paidInRange = client.paid_amount_date.reduce((sum, payment) => {
              try {
                if (!payment) return sum;
                
                const paymentDate = parse(payment.date, "dd-MM-yyyy", new Date());
                if (!isValid(paymentDate)) return sum;
                if (paymentDate < start || paymentDate > end) return sum;
                if (selectedAgent && payment.userID != selectedAgent) return sum;
  
                return sum + (parseFloat(payment.amount) || 0);
              } catch (e) {
                console.error('Error processing payment:', payment, e);
                return sum;
              }
            }, 0);
  
            if (paidInRange > 0) {
              result.paidinterAmount += paidInRange;
              result.totalPaidInRange += clientRate > 0 ? paidInRange / clientRate : 0;
              result.paidClientCount++;
            }
          }
        } catch (e) {
          console.error('Error processing client:', client, e);
        }
      });
    } catch (e) {
      console.error('Error in calculation:', e);
    }
  
    // Round values to avoid floating point precision issues
    result.overallAmount = Math.round(result.overallAmount * 1000) / 1000;
    result.totalPaidInRange = Math.round(result.totalPaidInRange * 1000) / 1000;
    result.paidinterAmount = Math.round(result.paidinterAmount * 100) / 100;
    result.totalinteramount = Math.round(result.totalinteramount * 100) / 100;
  
    return result;
  }, [users, startDate, endDate, selectedAgent]);

    

  // Calculate totals
  // const { overallAmount, totalPaidInRange, paidClientCount, paidinterAmount, totalinteramount } = useMemo(() => {
  //   const result = {
  //     overallAmount: 0,
  //     totalPaidInRange: 0,
  //     paidClientCount: 0,
  //     paidinterAmount: 0,
  //     totalinteramount: 0
  //   };

  //   users.forEach(client => {
  //     // Calculate overall amount
  //     const clientAmount = parseFloat(client.amount) || 0;
  //     const clientRate = parseFloat(client.today_rate) || 1;
  //     result.overallAmount += clientRate > 0 ? clientAmount / clientRate : 0;
  //     result.totalinteramount += clientRate > 0 ? clientAmount : 0;

  //     // Calculate paid amount in range
  //     if (client.paid_amount_date) {
  //       const paidInRange = client.paid_amount_date.reduce((sum, payment) => {
  //         const paymentDate = parse(payment.date, "dd-MM-yyyy", new Date());
  //         const start = parse(startDate, "yyyy-MM-dd", new Date());
  //         const end = parse(endDate, "yyyy-MM-dd", new Date());

  //         if (!isValid(paymentDate)) return sum;
  //         if (paymentDate < start || paymentDate > end) return sum;
  //         if (selectedAgent && payment.userID != selectedAgent) return sum;

  //         return sum + parseFloat(payment.amount);
  //       }, 0);

  //       if (paidInRange > 0) {
  //         result.paidinterAmount += paidInRange;
  //         result.totalPaidInRange += paidInRange / clientRate;
  //         result.paidClientCount++;
          
  //       }
  //     }
  //   });

  //   return result;
  // }, [users, startDate, endDate, selectedAgent]);


  const totalPaidAmountInRange = useMemo(() => {
    return (filteredData || []).reduce((sum, row) => {
      const totalPaid = getPaidAmountInRange(row, startDate, endDate);
      const clientRate = parseFloat(row.today_rate) || 1;
      return sum + (clientRate > 0 ? totalPaid / clientRate : 0);
    }, 0);
  }, [filteredData, startDate, endDate]);


  const roundedTotalPaidAmount = useMemo(() => {
    return Math.round((totalPaidAmountInRange + Number.EPSILON) * 1000) / 1000;
  }, [totalPaidAmountInRange]);

  // Navigation handlers
  const handleClientClick = (client) => {
    dispatch(setSelectedClient(client));
    navigate("/clientinfo");
  };

  const handleAgentClick = (agentId) => {
    const agent = employees.find(e => e.user_id == agentId);
    if (agent) {
      dispatch(setSelectedEmployee(agent));
      navigate("/employee/employeeinfo");
    }
  };


  const getTotalPaidClientCount = (users, startDate, endDate) => {
    return users.filter((row) => {
      if (Array.isArray(row.paid_amount_date)) {
        return row.paid_amount_date.some((payment) => {
          const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());
          const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
          const endParsed = parse(endDate, "yyyy-MM-dd", new Date());
          return paymentDateParsed >= startParsed && paymentDateParsed <= endParsed;
        });
      }
      return false;
    }).length;
  };

  const totalpaidclientcount = getTotalPaidClientCount(users, startDate, endDate);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "#", "Client", "City", "Agent", "Status",
      "Rate", "Amount (INTER)", "Amount (LOCAL)", "Date"
    ];

    const rows = filteredData.flatMap((client, idx) =>
      client.paid_amount_date
        ?.filter(payment => {
          const paymentDate = parse(payment.date, "dd-MM-yyyy", new Date());
          const start = parse(startDate, "yyyy-MM-dd", new Date());
          const end = parse(endDate, "yyyy-MM-dd", new Date());
          return isValid(paymentDate) &&
            paymentDate >= start &&
            paymentDate <= end &&
            (!selectedAgent || payment.userID == selectedAgent);
        })
        .map((payment, pIdx) => [
          idx + 1,
          client.client_name,
          client.client_city,
          employees.find(e => e.user_id == payment.userID)?.username || "Unknown",
          client.paid_and_unpaid === 1 ? "Paid" : "Unpaid",
          client.today_rate,
          payment.amount,
          (payment.amount / (client.today_rate || 1)).toFixed(3),
          payment.date
        ]) || []
    );

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  return (
    <div className="mt-5 ">
      <div className="page-header mb-4">
        <h1>All Data</h1>
        <small>Payments Dashboard</small>
      </div>

      {/* Summary Cards */}
      {/* <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-light p-3">
            <h5 className="text-muted">Total Clients</h5>
            <h3>{users.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light p-3">
            <h5 className="text-muted">Total Amount</h5>
            <h3 className="text-primary">{overallAmount.toFixed(3)}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light p-3">
            <h5 className="text-muted">Paid Clients ({startDate} to {endDate})</h5>
            <h3 className="text-success">{paidClientCount}</h3>
          </div>
        </div>
      </div> */}

      <div className="p-4  border rounded-3 shadow-lg">
        <h4 className="text-center fw-bold mb-4 text-primary">Dashboard Summary</h4>

        <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted"> Overall Amount</span>
          <div style={{ display: 'flex', flexDirection: 'column', columnGap: '5px' }} >
            <span className="fw-bold fs-5 text-primary"><span className="text-primary">Local Amount : </span>{overallAmount.toFixed(3)}</span>
            <span className="fw-bold fs-5 text-danger" >Inter Amount :{totalinteramount.toFixed(2)}</span>
          </div>
        </div>

        <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted">
            Paid Amount ({startDate} to {endDate})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', columnGap: '5px' }}>
            <span className="fw-bold fs-5 text-primary"  > <span className="text-primary"> Local Amount :</span>   {totalPaidInRange.toFixed(3)}</span>
            <span className="fw-bold fs-5 text-danger " > Inter Amount : {paidinterAmount.toFixed(2)}</span>
          </div>

        </div>

        <div className="py-3 px-4 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted">Total Paid Clients</span>
          <span className="fw-bold fs-5 text-danger">{totalpaidclientcount}</span>
        </div>
      </div>



      {/* Filters */}





      <div className="record-header d-flex justify-content-between">
        <div className="add  pt-1">
          <div className="m-0 p-0">
            <button onClick={exportToCSV} className="btn btn-primary w-auto">
              Export to CSV
            </button>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap  justify-content-center p-2  ">
          <div className="d-flex gap-2  md-flex-wrap pt-2">
            <Form.Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{ minWidth: "180px", }}
            >
              <option value="" style={{ paddingBottom: "20px" }}>All Agents</option>
              {employees
                .filter(e => e.role === "Collection Agent")
                .map(agent => (
                  <option key={agent.user_id} value={agent.user_id}>
                    {agent.username}
                  </option>
                ))}
            </Form.Select>
            <InputGroup style={{ width: "180px" }}>
              <FormControl
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </InputGroup>
            <InputGroup style={{ width: "180px" }}>
              <FormControl
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </InputGroup>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-responsive-md table-responsive-sm">
        <table className="table table-striped" >
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>City</th>
              <th>Agent</th>
              <th>Date</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData
                .flatMap(client => {
                  // Safely get payments array or default to empty array
                  const payments = client.paid_amount_date || [];

                  return payments
                    .filter(payment => {
                      if (!payment) return false;

                      try {
                        const paymentDate = parse(payment.date, "dd-MM-yyyy", new Date());
                        const start = parse(startDate, "yyyy-MM-dd", new Date());
                        const end = parse(endDate, "yyyy-MM-dd", new Date());

                        return isValid(paymentDate) &&
                          paymentDate >= start &&
                          paymentDate <= end &&
                          (!selectedAgent || payment.userID == selectedAgent);
                      } catch (e) {
                        console.error("Error parsing payment date:", e);
                        return false;
                      }
                    })
                    .map(payment => ({ payment, client }));
                })
                .map(({ payment, client }, index) => {
                  // Safely get agent info
                  const agent = employees.find(e => e.user_id == payment?.userID);

                  return (
                    <tr key={`${client.client_id}-${payment?.date}-${index}`}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="client">
                          <div className="client-info">
                            <h4 onClick={() => handleClientClick(client)}>
                              {client.client_name?.toUpperCase() || 'N/A'}
                            </h4>
                            <small>{client.client_contact || ''}</small>
                          </div>
                        </div>
                      </td>
                      <td>{client.client_city?.toUpperCase() || 'N/A'}</td>
                      <td>
                        <span
                          className=" cursor-pointer"
                          onClick={() => handleAgentClick(payment?.userID)}
                        >
                          {agent?.username?.toUpperCase() || "Unknown"}
                        </span>
                      </td>
                      <td>{payment?.date || 'N/A'}</td>
                      <td>{client.today_rate || 'N/A'}</td>
                      <td>
                        <div className="client-info">
                          <h4 style={{ color: "blue", fontWeight: "500" }}>
                            INTER:{" "}
                            <span>
                              {parseFloat(payment?.amount || 0).toFixed(2)}
                            </span>
                          </h4>
                          <h4 style={{ color: "red", fontWeight: "500" }}>
                            LOCAL:{" "}
                            <span>
                              {(
                                parseFloat(payment?.amount || 0) /
                                parseFloat(client.today_rate || 1)
                              ).toFixed(3)}
                            </span>
                          </h4>
                        </div>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No data found for the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="d-flex justify-content-end p-3">
          <p>
            <strong>Total Paid Amount for the selected range: </strong>
            {totalPaidInRange.toFixed(3)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Alldata;