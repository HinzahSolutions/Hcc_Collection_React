
import React, { useState, useEffect } from "react";
import "../Css/dashboard.css";
import { HiUsers } from "react-icons/hi2";
import { FaUserTie } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, setSelectedClient } from "../Slicers/clientSlice";
import { setEmployees } from "../Slicers/employeeSlice";

import Assignemploye from "./Assignemploye";
import PaymentChart from "./PaymentChart";
import Todaycollection from "./Todaycollection";

import {Mosaic } from "react-loading-indicators";




function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const users = useSelector((state) => state.clients.users);
  const employees = useSelector((state) => state.employees.employees);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
const [employeesLoaded, setEmployeesLoaded] = useState(false);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [totalBalanceAmount, setTotalBalanceAmount] = useState(0);
  const [todayCollections, setTodayCollections] = useState([]);
  const [overallAmount, setOverallAmount] = useState(0);
  const [overallPaidAmount, setOverallPaidAmount] = useState(0); 


  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() : null;
  };

  const fetchAccountList = async () => {
    setLoading(true);
    const Authorization = localStorage.getItem("authToken");
    
    try {
      const response = await fetch(`${API_URL}/acc_list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      });
  
      if (response.status === 401) {
        console.error("Unauthorized access - redirecting to login");
        handleUnauthorizedAccess();
        return;
      }
  
      const data = await response.json();
      dispatch(setUsers(data));
    } catch (error) {
      console.error("Error fetching client list:", error);
      handleUnauthorizedAccess();
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEmployeeList = async () => {
    setLoading(true);
    const Authorization = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${API_URL}/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
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
      console.error("Error fetching employee list:", error);
      handleUnauthorizedAccess();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountList();
    fetchEmployeeList();
  }, []);




useEffect(() => {
  if (users.length > 0) {
   
    const internationalPaid = users.reduce((total, client) => {
      return total + (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );
    }, 0);

    
    const internationalBalance = users.reduce((total, client) => {
      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );

      const clientBalance = (parseFloat(client.amount) || 0) - totalPaidForClient;
      return total + clientBalance;
    }, 0);

  
    const totalRate = users.reduce(
      (sum, client) => sum + (parseFloat(client.today_rate) || 0),
      0
    );

    
    const overallAmount = users.reduce(
      (total, client) => total + (parseFloat(client.amount) || 0),
      0
    );

  
    const totalLocalCurrency = users.reduce((total, client) => {
      const clientAmount = parseFloat(client.amount) || 0;
      const clientRate = parseFloat(client.today_rate) || 1; // Avoid division by zero
      return total + (clientRate > 0 ? clientAmount / clientRate : 0);
    }, 0);

    
    const totalLocalPaid = users.reduce((total, client) => {
      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );
      const clientRate = parseFloat(client.today_rate) || 1; 
      return total + (clientRate > 0 ? totalPaidForClient / clientRate : 0);
    }, 0);

   
    const totalLocalBalance = users.reduce((total, client) => {
      const totalPaidForClient = (client.paid_amount_date || []).reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );
      const clientBalance = (parseFloat(client.amount) || 0) - totalPaidForClient;
      const clientRate = parseFloat(client.today_rate) || 1; 
      return total + (clientRate > 0 ? clientBalance / clientRate : 0);
    }, 0);

  
    setOverallAmount(totalLocalCurrency.toFixed(3)); 
    setOverallPaidAmount(totalLocalPaid.toFixed(3)); 
    setTotalBalanceAmount(totalLocalBalance.toFixed(3));
  }
}, [users]);

  
  const clientCount = users.length;
  const collectionManagerCount = employees.filter((e) => e.role === "Collection Manager").length;
  const adminCount = employees.filter((e) => e.role === "Admin").length;
  const collectionAgentCount = employees.filter((e) => e.role === "Collection Agent").length;

  useEffect(() => {
    if (users.length > 0) {
      const paidAmountTotal = users.reduce((total, client) => {
        if (client.paid_amount_date) {
          const totalPaidForClient = client.paid_amount_date.reduce(
            (sum, payment) => sum + (parseInt(payment.amount, 10) || 0),
            0
          );
          return total + totalPaidForClient;
        }
        return total;
      }, 0);
      setTotalPaidAmount(paidAmountTotal);
    }
  }, [users]);

 

  


  const handleUnauthorizedAccess = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  
  return (



<div>
  {loading ? (
    <div className="loadingscreen">  
     <Mosaic color="#1246ac" size="large" text="" textColor="#1246ac" />
    </div>
  ) : (
    <div className="mt-5">
      <div className="page-header">
        <h1>Dashboard</h1>
        <small>Employee/ Dashboard</small>
      </div>
      <div className="analytics ">
        <div className="card" onClick={() => navigate("/alldata")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{overallAmount} </h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
            </span>
          </div>
          <div className="card-progress">
            <small>overallAmount</small>
          </div>
        </div>
        <div className="card" onClick={() => navigate("/alldata")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{overallPaidAmount} </h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
            </span>
          </div>
          <div className="card-progress">
            <small>Paid Amount</small>
          </div>
        </div>
        <div className="card" onClick={() => navigate("/alldata")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{totalBalanceAmount}</h2>
            <span className="las la-user-friends">
              <GiReceiveMoney />
            </span>
          </div>
          <div className="card-progress">
            <small>Unpaid Amount</small>
          </div>
        </div>
        <div className="card" onClick={() => navigate("/employee")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{adminCount}</h2>
            <span className="las la-user-friends">
              <FaUserTie />
            </span>
          </div>
          <div className="card-progress">
            <small>Admin</small>
          </div>
        </div>
        <div className="card" onClick={() => navigate("/client")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{clientCount}</h2>
            <span className="las la-user-friends">
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>Client</small>
          </div>

          
        </div>


        <div className="card" onClick={() => navigate("/employee")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{collectionManagerCount}</h2>
            <span className="las la-user-friends">
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>Collection Manager</small>
          </div>
        </div>


        <div className="card" onClick={() => navigate("/employee")}> 
          <div className="card-head d-flex justify-content-between align-items-center">
            <h2>{collectionAgentCount}</h2>
            <span className="las la-user-friends">
              <HiUsers />
            </span>
          </div>
          <div className="card-progress">
            <small>Collection Agent</small>
          </div>
        </div>
      </div>
      <div>
        <Assignemploye />
      </div>
      <Todaycollection />
      <div>
        <div className="chart-header text-center">
          <h4 className="pt-2">Payment Chart</h4>
          <div className="d-flex gap-3 justify-content-center">
            <select className="form-select w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="All">All</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {new Date(currentYear, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <select className="form-select w-auto" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = currentYear - i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
        </div>
        <div  className="" style={{height:'100vh'}}>
          <PaymentChart users={users} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
       
      </div>
    </div>
  )}
</div>


  )
}




export default Dashboard;

