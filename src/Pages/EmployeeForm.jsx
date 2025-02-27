

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSelectedEmployee } from '../Slicers/employeeSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Form } from 'react-bootstrap';

function EmployeeForm() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedEmployee = useSelector((state) => state.employees.selectedEmployee);

  
  const [employeeData, setEmployeeData] = useState(() => {
    return JSON.parse(sessionStorage.getItem('employeeData')) || selectedEmployee || {};
  });

  
  useEffect(() => {
    if (employeeData) {
      sessionStorage.setItem('employeeData', JSON.stringify(employeeData));
    }
  }, [employeeData]);

  
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     sessionStorage.removeItem('employeeData');
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  // }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      navigate('/employee');
    } else {
      setEmployeeData(selectedEmployee);
    }
  }, [selectedEmployee, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const Authorization = localStorage.getItem('authToken');
      if (!Authorization) {
        console.error('No authorization token found in localStorage');
        return;
      }

      const response = await fetch(`${API_URL}/updated/${employeeData.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization,
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      const updatedEmployee = await response.json();
      dispatch(setSelectedEmployee(updatedEmployee));

      
      sessionStorage.removeItem('employeeData');

      alert('Employee updated successfully');
      navigate('/employee');
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div>
        <h2 style={{ textAlign: 'center', paddingTop: '20px', paddingBottom: '50px' }}>Edit Client</h2>
        <Form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-center flex-wrap justify-item-center w-100">
            <div className="d-flex flex-wrap justify-item-center col-6 col-sm-6 col-xl-4 col-xxl-6 w-100" style={{ gap: '20px', paddingLeft: '0px' }}>
              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-4 col-xl-4">
                <Form.Label>Client Name</Form.Label>
                <Form.Control type="text" name="username" value={employeeData.username || ''} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>Email</Form.Label>
                <Form.Control type="text" name="email" value={employeeData.email || ''} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3 col-xxl-5 col-md-12 col-lg-6 col-xl-6">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control type="number" name="phone_number" value={employeeData.phone_number || ''} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3 col-xxl-5 col-md-12 col-lg-6 col-xl-6">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" name="city" value={employeeData.city || ''} onChange={handleChange} required />
              </Form.Group>
            </div>
            <div className="d-flex gap-3">
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => navigate('/employeeinfo')}>
                Cancel
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default EmployeeForm;
