
import React, { useState, useMemo, useEffect } from "react";
import { InputGroup, FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { parse, subDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {setUsers,setSelectedClient,setSearchQuery,} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";
import * as XLSX from "xlsx";

function Alldata() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [clients, setClients] = useState([]);
  const [dashboardNav, setDashboardNav] = useState("OverAllAmount");
  const dispatch = useDispatch();

  
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

    useEffect(() => {
      const Authorization = localStorage.getItem("authToken");
      if (Authorization) {
        fetch(`${API_URL}/list`, {
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
          .then((data) => dispatch(setEmployees(data)))
  
          .catch((error) => console.error("Fetch error:", error));
      } else {
        console.error("No authorization token found in localStorage");
      }
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
        "Total Amount": `${row.amount}`,
        "Status": row.paid_and_unpaid === 1 ? "Paid" : "Unpaid",
        "Paid Amount in Range": `${paidAmountInRange}`,
        "Total Paid Amount": `${paidAmount}`,
        "Balance Amount": `${balanceAmount} `,
      };
    });
  
    
    const headers = Object.keys(tableData[0]);
    const csvContent = [
      headers.join(","), 
      ...tableData.map((row) => headers.map((header) => row[header]).join(",")), 
    ].join("\n");
  
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
  
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
    link.download = `filtered_data_${timestamp}.csv`;
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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


  const filterDataByDateRange = (data, startDate, endDate) => {
    if (!startDate || !endDate) {
      return data; // Show all data if no date range is selected
    }
  
    return data.map((row) => {
      if (Array.isArray(row.paid_amount_date)) {
        const filteredPayments = row.paid_amount_date.filter((payment) => {
          const paymentDate = new Date(payment.date.split("-").reverse().join("-")); // Convert to Date object
          return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
        });
  
        return { ...row, paid_amount_date: filteredPayments };
      }
      return row;
    });
  };
  
  const filteredDataToShow = filterDataByDateRange(filteredData, startDate, endDate);
  return (


<div className="mt-5">
  <div className="page-header">
    <h1>All Data</h1>
    <small>Alldata / Dash</small>
  </div>


<div className="p-4 bg-white border rounded-3 shadow-lg">
  <h4 className="text-center fw-bold mb-4 text-primary">Dashboard Summary</h4>
  
  <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
    <span className="fw-semibold text-muted">Overall Amount</span>
    <span className="fw-bold fs-5 text-success">{overallAmount} KWD</span>
  </div>
  
  <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
    <span className="fw-semibold text-muted">
      Paid Amount ({startDate} to {endDate})
    </span>
    <span className="fw-bold fs-5 text-primary">{totalPaidAmountInRange} KWD</span>
  </div>

  <div className="py-3 px-4 bg-light rounded-2 d-flex justify-content-between align-items-center">
    <span className="fw-semibold text-muted">Total Paid Clients</span>
    <span className="fw-bold fs-5 text-danger">{totalpaidclientcount}</span>
  </div>
</div>

  <div>
    
     
    </div>
    <div className="records table-responsive">
      <div className="d-flex justify-content-between">
        <div className="add  pt-1">
        <div  className="m-0 p-0">  <button onClick={ exportToCSV} className="btn btn-primary w-auto">
          Export to Excel
        </button></div>
        </div>
       
        <div className="d-flex gap-2 flex-wrap  justify-content-center p-2  ">
        
        <div className="d-flex gap-2  md-flex-wrap pt-2">
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
                <th>Status</th>
                <th>Paid Amount</th>
                <th>paid date </th>
              
              </tr>
            </thead>
            <tbody>

{filteredDataToShow.length > 0 ? (
  filteredDataToShow.flatMap((row, index) => 
    row.paid_amount_date && row.paid_amount_date.length > 0
      ? row.paid_amount_date.map((payment, i) => {
          const agent = employees.find(e => e.user_id === payment.userID);
          return (
            <tr key={`${row.client_id}-${index}-${i}`}>
              <td>{row.client_id}</td>
              <td>{row.client_name.toUpperCase()}</td>
              <td>{row.client_city.toUpperCase()}</td>
              <td>{agent ? agent.username.toUpperCase()  : "Unknown"}</td>
              <td>
                <p
                  className={`badge ${
                    row.paid_and_unpaid === 1 ? "bg-success" : "bg-danger"
                  }`}
                >
                  {row.paid_and_unpaid === 1 ? "Paid" : "Unpaid"}
                </p>
              </td>
              <td>{payment.amount}</td>
              <td>{payment.date}</td>
            </tr>
          );
        })
      : [
          <tr key={`${row.client_id}-${index}`}>
            <td>{index + 1}</td>
            <td>{row.client_name.toUpperCase()}</td>
            <td>{row.client_city.toUpperCase()}</td>
            <td>—</td> {/* No agent if no payments */}
            <td>
              <p
                className={`badge ${
                  row.paid_and_unpaid === 1 ? "bg-success" : "bg-danger"
                }`}
              >
                {row.paid_and_unpaid === 1 ? "Paid" : "Unpaid"}
              </p>
            </td>
            <td>No Payments</td>
            <td>No Payments</td>
          </tr>
        ]
  )
) : (
  <tr>
    <td colSpan="7" className="text-center">
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


  );
}

export default Alldata;
