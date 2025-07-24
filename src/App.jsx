import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "./Pages/Sidebar";
import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import PrivateRoute from "./Pages/PrivateRoute";
import Client from "./Pages/Client";
import Alldata from "./Pages/Alldata";
import ClientInfo from "./Pages/Clinentinfo";
import { Provider } from "react-redux";
import store from "./Pages/store";
import Employee from "./Pages/Employee";
import Employeeinfo from "./Pages/Employeeinfo";
import Formdata from "./Pages/Formdata";
import { Mosaic } from "react-loading-indicators";
import EmployeeForm from "./Pages/EmployeeForm";
import Allemployee from "./Pages/Allemployee";


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </Provider>
  );
}

function MainApp() {
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      if (!token) {
        navigate("/login");
      }
      setLoading(false);
    }, 1000);
  }, [token, navigate]);
  if (loading) {
    return (
      <div className="loading-screen">
        <div
          className="d-flex justify-content-center align-items-center flex-column gap-4"
          style={{ width: '99vw', height: '90vh' }}
        >
          <Mosaic color="#1246ac" size="large" text="" textColor="#1246ac" />
          <h1 className="text-primary  fw-bold">HCC</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ width: "100vw", }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute requiredRole={["Admin", "Dtp"]} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/client" element={<Client />} />
            <Route path="/alldata" element={<Alldata />} />
            <Route path="/clientinfo" element={<ClientInfo />} />
            <Route path="/employee">
              <Route index element={<Employee />} />
              <Route path="employeeinfo" element={<Employeeinfo />} />
              <Route path="form" element={<EmployeeForm />} />
            </Route>
            <Route path="/allemployee" element={<Allemployee />} />
            <Route path="/formdata" element={<Formdata />} />
            <Route path="/employeeform" element={<EmployeeForm />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;

