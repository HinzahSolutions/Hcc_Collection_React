
import React, { useState, useMemo, useEffect } from "react";
import { InputGroup, FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { parse, subDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  setUsers,
  setSelectedClient,
  setSearchQuery,
} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import * as XLSX from "xlsx";

function Alldata() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [clients, setClients] = useState([]);
  const [dashboardNav, setDashboardNav] = useState("OverAllAmount");
  const dispatch = useDispatch();

  // Calculate yesterday's date
  const yesterday = subDays(new Date(), 1);
  const formattedYesterday = format(yesterday, "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(formattedYesterday);
  const [endDate, setEndDate] = useState(formattedYesterday);

  const users = useSelector((state) => state.clients.users);
  const navigate = useNavigate();
  const employees = useSelector((state) => state.employees.employees);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  useEffect(() => {
    const Authorization = localStorage.getItem("authToken");

    fetch(`${API_URL}/acc_list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: Authorization,
      },
    })
      .then((response) => response.json())
      .then((data) => dispatch(setUsers(data)))
      .catch((error) => console.error("Fetch error:", error));
  }, [dispatch]);

  const getPaidAmountInRange = (row, startDate, endDate) => {
    if (Array.isArray(row.paid_amount_date)) {
      const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
      const endParsed = parse(endDate, "yyyy-MM-dd", new Date());

      const filteredPayments = row.paid_amount_date.filter((payment) => {
        const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());

        return (
          paymentDateParsed >= startParsed && paymentDateParsed <= endParsed
        );
      });

      return filteredPayments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0
      );
    }
    return 0;
  };

  const filteredData = useMemo(() => {
    if (startDate && endDate) {
      return users.filter((row) => {
        if (Array.isArray(row.paid_amount_date)) {
          const totalPaidInRange = getPaidAmountInRange(
            row,
            startDate,
            endDate
          );
          return totalPaidInRange > 0;
        }
        return false;
      });
    }
    return users;
  }, [users, startDate, endDate]);

  const overallAmount = Array.isArray(users)
    ? users.reduce(
        (total, value) =>
          total + (value.amount ? parseInt(value.amount, 10) : 0),
        0
      )
    : 0;

  const totalPaidAmountInRange = filteredData.reduce((sum, row) => {
    return sum + getPaidAmountInRange(row, startDate, endDate);
  }, 0);

  const handlenav = (client) => {
    dispatch(setSelectedEmployee(client));
    navigate("/employeeinfo");
  };

  const handlenav1 = (client) => {
    dispatch(setSelectedClient(client));
    navigate("/clientinfo");
  };

  const exportToCSV = () => {
    const tableData = filteredData.map((row, index) => {
      const paidAmountInRange = getPaidAmountInRange(row, startDate, endDate);
      const paidAmount = Array.isArray(row.paid_amount_date)
        ? row.paid_amount_date.reduce(
            (sum, payment) => sum + parseFloat(payment.amount),
            0
          )
        : 0;
      const balanceAmount = row.amount - paidAmount;
  
      return {
        "#": index + 1,
        "Client Name": row.client_name || "N/A",
        "City": row.client_city || "N/A",
        "Agent Name": employees.find((eid) => eid.user_id === row.user_id)?.username || "N/A",
        "Total Amount": `${row.amount} KWD`,
        "Status": row.paid_and_unpaid === 1 ? "Paid" : "Unpaid",
        "Paid Amount in Range": `${paidAmountInRange} KWD`,
        "Total Paid Amount": `${paidAmount} KWD`,
        "Balance Amount": `${balanceAmount} KWD`,
      };
    });
  
    // Convert JSON data to CSV format
    const headers = Object.keys(tableData[0]);
    const csvContent = [
      headers.join(","), // Add CSV header
      ...tableData.map((row) => headers.map((header) => row[header]).join(",")), // Add CSV rows
    ].join("\n");
  
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
  
    // Generate file name with current timestamp
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
    link.download = `filtered_data_${timestamp}.csv`;
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  



  // const exportToExcel = () => {
  //   const tableData = filteredData.map((row, index) => {
  //     const paidAmountInRange = getPaidAmountInRange(row, startDate, endDate);
  //     const paidAmount = Array.isArray(row.paid_amount_date)
  //       ? row.paid_amount_date.reduce(
  //           (sum, payment) => sum + parseFloat(payment.amount),
  //           0
  //         )
  //       : 0;
  //     const balanceAmount = row.amount - paidAmount;
  
  //     return {
  //       "#": index + 1,
  //       "Client Name": row.client_name,
  //       "City": row.client_city,
  //       "Agent Name": employees.find((eid) => eid.user_id === row.user_id)?.username || "N/A",
  //       "Total Amount": `${row.amount} KWD`,
  //       "Status": row.paid_and_unpaid === 1 ? "Paid" : "Unpaid",
  //       "Paid Amount in Range": `${paidAmountInRange} KWD`,
  //       "Total Paid Amount": `${paidAmount} KWD`,
  //       "Balance Amount": `${balanceAmount} KWD`,
  //     };
  //   });
  
  //   // Convert JSON data to a worksheet
  //   const ws = XLSX.utils.json_to_sheet(tableData);
  
  //   // Set column widths for better spacing in Excel
  //   ws["!cols"] = [
  //     { wch: 5 },  // "#" column width
  //     { wch: 20 }, // Client Name
  //     { wch: 15 }, // City
  //     { wch: 20 }, // Agent Name
  //     { wch: 15 }, // Total Amount
  //     { wch: 10 }, // Status
  //     { wch: 25 }, // Paid Amount in Range
  //     { wch: 20 }, // Total Paid Amount
  //     { wch: 20 }, // Balance Amount
  //   ];
  
  //   // Create a new workbook and append the worksheet
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
  
  //   // Generate file name with current timestamp
  //   const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
  //   XLSX.writeFile(wb, `filtered_data_${timestamp}.xlsx`);
  // };





  return (
//     <div style={{ marginTop: "50px" }}>
//       <div className="page-header">
//         <h1>All Data</h1>
//         <small>Alldata / Dash</small>
//       </div>
//       <div className="analytics">
//         <div
//           className={dashboardNav === "OverAllAmount" ? "cardAction" : "card"}
//           onClick={() => setDashboardNav("OverAllAmount")}
//         >
//           <div className="card-head">
//             <h2>{overallAmount}</h2>
//           </div>
//           <div className="card-progress">
//             <small>Over All Amount</small>
//           </div>
//         </div>

//         {startDate && endDate && (
//           <div
//             className={dashboardNav === "OverAllAmount" ? "cardAction" : "card"}
//             onClick={() => setDashboardNav("OverAllAmount")}
//           >
//             <div className="card-head">
//               <h2>{totalPaidAmountInRange}</h2>
//             </div>
//             <div className="card-progress">
//               <small>
//                 Total paid Amount {startDate} to {endDate}
//               </small>
//             </div>
//           </div>
//         )}
//       </div>
//       <div>
//         <div className="date-filter">
//           <p>Search by Date Range</p>
//         </div>
//         <div className="records table-responsive">
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <div style={{ margin: "20px" }}>
//               <h4 style={{ color: "black" }}>
//                 Collection List from{" "}
//                 <span style={{ color: " #1246ac" }}>{startDate} </span>to{" "}
//                 <span style={{ color: " #1246ac" }}>{endDate}</span>
//               </h4>{" "}
//             </div>
//             <button onClick={exportToExcel} className="btn btn-primary  w-auto">
//   Export to Excel
// </button>
//             <div style={{ display: "flex", margin: "20px", gap: "10px" }}>
//               <InputGroup className="mb-auto" style={{ width: "200px" }}>
//                 <FormControl
//                   type="date"
//                   value={startDate}
//                   onChange={handleStartDateChange}
//                   placeholder="Start Date"
//                 />
//               </InputGroup>
//               <InputGroup className="mb-auto" style={{ width: "200px" }}>
//                 <FormControl
//                   type="date"
//                   value={endDate}
//                   onChange={handleEndDateChange}
//                   placeholder="End Date"
//                 />
//               </InputGroup>
//             </div>
//           </div>
//           {/* {startDate && endDate && (
//             <div>
              
//             </div>
//           )} */}
//           {startDate && endDate && (
//             <div>
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Client Name</th>
//                     <th>City</th>
//                     <th>Agent Name</th>
//                     <th>Total</th>
//                     <th>Status</th>
//                     <th>Paid Amount</th>
//                     <th>Total Paid Amount in Range</th>
//                     <th>Balance Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredData.length > 0 ? (
//                     filteredData.map((row, index) => {
//                       const paidAmount = Array.isArray(row.paid_amount_date)
//                         ? row.paid_amount_date.reduce(
//                             (sum, payment) => sum + parseFloat(payment.amount),
//                             0
//                           )
//                         : 0;
//                       const balanceAmount = row.amount - paidAmount;
//                       const paidAmountInRange = getPaidAmountInRange(
//                         row,
//                         startDate,
//                         endDate
//                       );
//                       return (
//                         <tr key={row.client_id}>
//                           <td>{index + 1}</td>
//                           <td>
//                             <div className="client">
//                               <div
//                                 className="client-img bg-img"
//                                 style={{
//                                   backgroundImage:
//                                     "url(https://i.pinimg.com/564x/8d/ff/49/8dff49985d0d8afa53751d9ba8907aed.jpg)",
//                                 }}
//                               ></div>
//                               <div className="client-info">
//                                 <h4 onClick={() => handlenav1(row)}>
//                                   {row.client_name}
//                                 </h4>
//                                 <small>{row.phone_number}</small>
//                               </div>
//                             </div>
//                           </td>
//                           <td>{row.client_city}</td>
//                           <td>
//                             {employees.map((eid) =>
//                               eid.user_id == row.user_id ? (
//                                 <span onClick={() => handlenav(eid)}>
//                                   {eid.username}
//                                 </span>
//                               ) : (
//                                 <span></span>
//                               )
//                             )}
//                           </td>
//                           <td>{row.amount}</td>
//                           <td className={row.paid_and_unpaid ? "green" : "red"}>
//                     {row.paid_and_unpaid == 1 ? "paid" : "unpaid"}
//                   </td>
//                           <td>{paidAmountInRange}</td>
//                           <td>{paidAmount}</td>
//                           <td>{balanceAmount}</td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="text-center">
//                         No data found for the selected date range
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//               <div
//                 className="total-paid-amount"
//                 style={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   padding: "20px",
//                 }}
//               >
//                 <p>
//                   <strong>Total Paid Amount for the selected range: </strong>
//                   {totalPaidAmountInRange}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>


<div className="mt-5">
  <div className="page-header">
    <h1>All Data</h1>
    <small>Alldata / Dash</small>
  </div>
  <div className="analytics">
    <div
      className={dashboardNav === "OverAllAmount" ? "cardAction" : "card"}
      onClick={() => setDashboardNav("OverAllAmount")}
    >
      <div className="card-head">
        <h2>{overallAmount}</h2>
      </div>
      <div className="card-progress">
        <small>Over All Amount</small>
      </div>
    </div>

    {startDate && endDate && (
      <div
        className={dashboardNav === "OverAllAmount" ? "cardAction" : "card"}
        onClick={() => setDashboardNav("OverAllAmount")}
      >
        <div className="card-head">
          <h2>{totalPaidAmountInRange}</h2>
        </div>
        <div className="card-progress">
          <small>
            paid Amount {startDate} to {endDate}
          </small>
        </div>
      </div>
    )}
  </div>
  <div>
    <div className="date-filter">
     
    </div>
    <div className="records table-responsive">
      <div className="d-flex justify-content-between">
        <div className="m-4">
          {/* <h4 className="text-black fs-5  md-fs-6  alldata_h4">
            Collection List from{" "}
            <span className="text-primary fs-5  md-fs-7  ms-fs-7">{startDate} </span>to{" "}
            <span className="text-primary  fs-5  md-fs-7">{endDate}</span>
          </h4> */}
        </div>
       
        <div className="d-flex gap-2 flex-wrap  justify-content-center p-2  ">
        <div>  <button onClick={ exportToCSV} className="btn btn-primary w-auto">
          Export to Excel
        </button></div>
        <div className="d-flex gap-2 mt-3 md-flex-wrap">
          <InputGroup className="mb-auto w-50">
            <FormControl
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start Date"
            />
          </InputGroup>
          <InputGroup className="mb-auto w-50">
            <FormControl
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End Date"
            />
          </InputGroup>
          </div>
        </div>
      </div>
      {startDate && endDate && (
        <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>City</th>
                <th>Agent Name</th>
                <th>Total</th>
                <th>Status</th>
                <th>Paid Amount</th>
                <th>Total Paid Amount in Range</th>
                <th>Balance Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => {
                  const paidAmount = Array.isArray(row.paid_amount_date)
                    ? row.paid_amount_date.reduce(
                        (sum, payment) => sum + parseFloat(payment.amount),
                        0
                      )
                    : 0;
                  const balanceAmount = row.amount - paidAmount;
                  const paidAmountInRange = getPaidAmountInRange(
                    row,
                    startDate,
                    endDate
                  );
                  return (
                    <tr key={row.client_id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="client d-flex align-items-center">
                          <div
                            className="client-img bg-img"
                            style={{
                              backgroundImage:
                                "url(https://i.pinimg.com/564x/8d/ff/49/8dff49985d0d8afa53751d9ba8907aed.jpg)",
                            }}
                          ></div>
                          <div className="client-info ms-2">
                            <h4 onClick={() => handlenav1(row)}>
                              {row.client_name}
                            </h4>
                            <small>{row.phone_number}</small>
                          </div>
                        </div>
                      </td>
                      <td>{row.client_city}</td>
                      <td>
                        {employees.map((eid) =>
                          eid.user_id == row.user_id ? (
                            <span onClick={() => handlenav(eid)}>
                              {eid.username}
                            </span>
                          ) : (
                            <span></span>
                          )
                        )}
                      </td>
                      <td>{row.amount}</td>
                      <td>
            <p
              className={`badge ${
                row.paid_and_unpaid == 1 ? "bg-success" : "bg-danger"
              }`}
            >
              {row.paid_and_unpaid == 1 ? "Paid" : "Unpaid"}
            </p>
          </td>
                      <td>{paidAmountInRange}</td>
                      <td>{paidAmount}</td>
                      <td>{balanceAmount}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No data found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="d-flex justify-content-end p-3">
            <p>
              <strong>Total Paid Amount for the selected range: </strong>
              {totalPaidAmountInRange}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

  );
}

export default Alldata;
