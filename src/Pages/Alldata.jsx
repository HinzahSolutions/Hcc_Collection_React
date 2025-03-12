
import React, { useState, useMemo, useEffect } from "react";
import { InputGroup, FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { parse, subDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {setUsers,setSelectedClient,setSearchQuery,} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";

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

  const overallAmount = useMemo(() => {
    return Array.isArray(users)
      ? users.reduce((total, value) => {
          const clientAmount = parseFloat(value.amount) || 0;
          const clientRate = parseFloat(value.today_rate) || 1; // Avoid division by zero
          return total + (clientRate > 0 ? clientAmount / clientRate : 0);
        }, 0)
      : 0;
  }, [users]);
  
  console.log(overallAmount);
  
  const totalPaidAmountInRange = useMemo(() => {
    return Array.isArray(filteredData)
      ? filteredData.reduce((sum, row) => {
          const totalPaid = getPaidAmountInRange(row, startDate, endDate);
          const clientRate = parseFloat(row.today_rate) || 1;
          return sum + (clientRate > 0 ? totalPaid / clientRate : 0);
        }, 0)
      : 0;
  }, [filteredData, startDate, endDate]);
  
 
  const roundedTotalPaidAmount = useMemo(() => {
    return Math.round((totalPaidAmountInRange + Number.EPSILON) * 1000) / 1000;
  }, [totalPaidAmountInRange]);

  const handlenav = (client) => {
    dispatch(setSelectedEmployee(client));
    console.log("employee detail",client)
    navigate("/employeeinfo");
  };

  const handlenav1 = (client) => {
    dispatch(setSelectedClient(client));
    console.log("client detail",client)
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
      return data; 
    }
  
    return data.map((row) => {
      if (Array.isArray(row.paid_amount_date)) {
        const filteredPayments = row.paid_amount_date.filter((payment) => {
          const paymentDate = new Date(payment.date.split("-").reverse().join("-")); 
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
    <span className="fw-bold fs-5 text-success">{overallAmount.toFixed(3)}</span>
  </div>
  
  <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
    <span className="fw-semibold text-muted">
      Paid Amount ({startDate} to {endDate})
    </span>
    <span className="fw-bold fs-5 text-primary">{ roundedTotalPaidAmount.toFixed(3)}</span>
  </div>

  <div className="py-3 px-4 bg-light rounded-2 d-flex justify-content-between align-items-center">
    <span className="fw-semibold text-muted">Total Paid Clients</span>
    <span className="fw-bold fs-5 text-danger">{totalpaidclientcount}</span>
  </div>
</div>

  <div>
    
     
    </div>
    <div className="">
      <div className="record-header d-flex justify-content-between">
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
                <th>CLIENT NAME</th>
                <th>CITY</th>
                <th>AGENT NAME</th>               
                <th>STATUS</th>
                <th>RATE</th>
                <th>PAID AMOUNT</th>
                <th>PAID DATE</th>
              
              </tr>
            </thead>
         
            <tbody>
  {filteredDataToShow.length > 0 ? (
    filteredDataToShow
      .flatMap((row) =>
        row.paid_amount_date && row.paid_amount_date.length > 0
          ? row.paid_amount_date.map((payment) => ({
              ...payment,
              client_name: row.client_name,
              client_city: row.client_city,
              paid_and_unpaid: row.paid_and_unpaid,
              today_rate: row.today_rate,
              user_id: payment.userID,
            }))
          : [
              {
                client_name: row.client_name,
                client_city: row.client_city,
                paid_and_unpaid: row.paid_and_unpaid,
                today_rate: row.today_rate,
                noPayment: true,
              },
            ]
      )
      .sort((a, b) => {
        const dateA = new Date(a.date.split("-").reverse().join("-"));
        const dateB = new Date(b.date.split("-").reverse().join("-"));
        return dateA - dateB;
      })
      .map((payment, index) => {
        const agent = employees.find((e) => e.user_id === payment.user_id);
        return (
          <tr key={`${payment.client_name}-${index}`}>
            <td>{index + 1}</td>
            <td  onClick={() => handlenav1(payment)} >{payment.client_name.toUpperCase()}</td>
            <td>{payment.client_city.toUpperCase()}</td>
            <td  onClick={() => handlenav(agent)}>{agent ? agent.username.toUpperCase() : "Unknown"}</td>
            <td>
              <p
                className={`badge ${payment.paid_and_unpaid === 1 ? "bg-success" : "bg-danger"}`}
              >
                {payment.paid_and_unpaid === 1 ? "Paid" : "Unpaid"}
              </p>
            </td>
            <td>{payment.today_rate}</td>
           
            <td>
  <div className="client-info">
    <h4 style={{ color: "blue", fontWeight: "500" }}>
      INTER:{" "}
      <span>
        {payment.amount
          ? Math[parseFloat(payment.amount) % 1 >= 0.5 ? "ceil" : "floor"](parseFloat(payment.amount)).toFixed(2)
          : "0.00"}
      </span>
    </h4>
    <h4 style={{ color: "red", fontWeight: "500" }}>
      LOCAL:{" "}
      <span>
        {payment.amount && payment.today_rate
          ? (parseFloat(payment.amount) / parseFloat(payment.today_rate)).toFixed(3)
          : "0.000"}
      </span>
    </h4>
  </div>
</td>
            <td>{payment.date || "No Payment"}</td>
          </tr>
        );
      })
  ) : (
    <tr>
      <td colSpan="8" className="text-center">
        No data found for the selected date range
      </td>
    </tr>
  )}
</tbody>
          </table>
          <div className="d-flex justify-content-end p-3">
            <p>
              <strong>Total Paid Amount for the selected range: </strong>
              {totalPaidAmountInRange.toFixed(3)}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

export default Alldata;
