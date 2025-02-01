// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { login } from "../Slicers/authSlice";
// import "../Css/loginpage.css";
// import axios from "axios";

// function LoginPage() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   console.log("console",API_URL);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();


//   useEffect(() =>{
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('role');
//     localStorage.removeItem('userName');
//   },[])

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     if (!email.trim() || !password.trim()) {
//       setError("Please provide both email and password.");
//       return;
//     }
  
//     try {
//       const response = await fetch(`${API_URL}/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });
  
//       if (!response.ok) {
//         throw new Error("Invalid email or password.");
//       }
  
//       const data = await response.json();
  
//       // Assuming the response includes a token and role
//       const { token, user } = data;
  
//       const role = user.role;
//       localStorage.setItem("userName", user.username);
  
//       if (role === "Admin") {
//         dispatch(login({ token, role }));
  
//         localStorage.setItem("authToken", token);
//         localStorage.setItem("role", role);
//         navigate("/dashboard");
//       } else {
//         setError("Wrong user login.");
//         alert("Wrong User Login");
//         navigate("/login");
//       }
//     } catch (error) {
//       console.error("Login Error:", error.message);
//       setError("Invalid email or password.");
//     }
//   };
  

//   return (
//     <>
//       <div className="mainbody">
//         <div className="center">
//           <h1>Login</h1>
//           {/* Display error message if there's any */}
//           {error && (
//             <div
//               style={{ textAlign: "center", color: "red" }}
//               className="error-message"
//             >
//               {error}
//             </div>
//           )}
//           <form onSubmit={handleSubmit}>
//             <div className="txt_field">
//               <input
//                 type="text"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//               <span></span>
//               <label>Email</label>
//             </div>
//             <div className="txt_field">
//               <input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <span></span>
//               <label>Password</label>
//             </div>
//             <div>
//               <button className="inputs" type="submit">
//                 Login
//               </button>
//             </div>
//             <div className="signup_link"></div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

// export default LoginPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../Slicers/authSlice";
import "../Css/loginpage.css";

function LoginPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL:", API_URL);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- Added Loading State

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true); // <-- Start Loading

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password.");
      }

      const data = await response.json();
      const { token, user } = data;
      const role = user.role;

      localStorage.setItem("userName", user.username);

      if (role === "Admin") {
        dispatch(login({ token, role }));
        localStorage.setItem("authToken", token);
        localStorage.setItem("role", role);
        navigate("/dashboard");
      } else {
        setError("Wrong user login.");
        alert("Wrong User Login");
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      setError("Invalid email or password.");
    } finally {
      setLoading(false); // <-- Stop Loading
    }
  };

  return (
    <>
      <div className="mainbody">
        <div className="center">
          <h1>Login</h1>
          {error && (
            <div style={{ textAlign: "center", color: "red" }} className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="txt_field">
              <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <span></span>
              <label>Email</label>
            </div>
            <div className="txt_field">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <span></span>
              <label>Password</label>
            </div>
            <div>
            <button className="inputs" type="submit" disabled={loading}>
  {loading ? <span className="spinner"></span> : "Login"}
</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

