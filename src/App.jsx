// import React from "react";
// import "./App.css";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Sidebar from "./Pages/Sidebar";
// import Dashboard from "./Pages/Dashboard";
// import LoginPage from "./Pages/LoginPage";
// import PrivateRoute from "./Pages/PrivateRoute";
// import Client from "./Pages/Client";
// import Alldata from "./Pages/Alldata";
// import ClientInfo from "./Pages/Clinentinfo";
// import { Provider } from "react-redux";
// import store from "./Pages/store";
// import Employee from "./Pages/Employee";
// import Employeeinfo from "./Pages/Employeeinfo";
// import axios from "axios";

// function App() {
//   const token = localStorage.getItem("authToken");
//   return (
//     <Provider store={store}>
//       {" "}
    
//       <BrowserRouter>
//         <div style={{ display: "flex" }}>
//           <Sidebar />
//           <div style={{ width: "100%" }}>
//             <Routes>
//               <Route path="/login" element={<LoginPage />} />
//               <Route element={<PrivateRoute />}></Route>

             
//               <Route element={<PrivateRoute requiredRole="Admin" />}>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/client" element={<Client />} />
//                 <Route path="/alldata" element={<Alldata />} />
//                 <Route path="/clientinfo" element={<ClientInfo />} />
//                 <Route path="/employee" element={<Employee />} />
//                 <Route path="/employeeinfo" element={<Employeeinfo />} />
//               </Route>
//             </Routes>
//           </div>
//         </div>
//       </BrowserRouter>
//     </Provider>
//   );
// }

// export default App;


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
import axios from "axios";
import {Mosaic } from "react-loading-indicators";

// App component wrapped inside BrowserRouter
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
  const [loading, setLoading] = useState(true);  // To handle the loading state
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();  // Now within BrowserRouter context

  useEffect(() => {
    // Simulate a delay to show the loading screen (you can remove this if not needed)
    setTimeout(() => {
      if (!token) {
        navigate("/login");  // If token doesn't exist, redirect to login page
      }
      setLoading(false);  // Once checked, stop the loading screen
    }, 1000);  // You can adjust this delay time as needed (2 seconds in this case)
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        {/* Replace this with your logo screen */}
       {/* <div
        // style="width: 99vw; height: 90vh; display: flex; justify-content: center; align-items: center;"  
        style={{width:'99vw',height:'90vh',display:'flex',justifyContent:'center',alignItems:'center'}}
      >
        <img
          src="https://assets.upstox.com/content/assets/images/logos/NSE_EQ%7CINE549A01026.png"
          alt="HCC Logo"
          // style="width: 100px; height: auto;"
          style={{width:'100px',height:'auto'}}
        />
      </div>  */}
      {/* <div
        // style="width: 99vw; height: 90vh; display: flex; justify-content: center; align-items: center;"  
        style={{width:'99vw',height:'90vh',display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',gap:'5px'}}
      >
         <Mosaic color=" #1246ac" size=" large" text="" textColor=" #1246ac"  />
         <h1  className="primary">HCC</h1>
      </div>
     
      </div> */}
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
          <Route element={<PrivateRoute />}></Route>
          <Route element={<PrivateRoute requiredRole="Admin" />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/client" element={<Client />} />
            <Route path="/alldata" element={<Alldata />} />
            <Route path="/clientinfo" element={<ClientInfo />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/employeeinfo" element={<Employeeinfo />} />
            <Route path="/formdata" element={<Formdata />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;

