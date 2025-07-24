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
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // if (!response.ok) {
      //   throw new Error("Invalid email or password.");
       
      // }

      const data = await response.json();
      const { token, user } = data;
       console.log("",data)
      if (user.role !== "Admin" && user.role !== "Dtp") {
        setError("Wrong user login.");
        alert("Wrong User Login"); 

        return;
      }
        
      dispatch(login({ token, role: user.role }));
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.username); 
       localStorage.setItem("user_id", user.user_id);
       console.log("vhvbnvbx",user)  
      if (user.role === "Admin") {
  navigate("/dashboard");
} else if (user.role === "Dtp") {
  navigate("/client");
} else {
  navigate("/login");
   // Fallback route if role is unrecognized
}
    } catch (error) {
      console.error("Login Error:", error.message);
      if (error.message === "Failed to fetch") {
        setError("No internet connection. Please check your network.");
      } else {
        setError(error.message);
        console.log(error)
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mainbody">
      <div className="center">
        <h1>Login</h1>
        {error && <div className="error-message" style={{ textAlign: "center", color: "red" }}>{error}</div>}
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
  );
}

export default LoginPage;

