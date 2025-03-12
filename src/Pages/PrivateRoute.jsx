import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ requiredRole }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (requiredRole && requiredRole !== role) {    
    return <Navigate to="/dashboard" />;
  }
return <Outlet />; 
};

export default PrivateRoute;


