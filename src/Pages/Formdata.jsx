import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedClient } from '../Slicers/clientSlice';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

function Formdata() {
  const API_URL = import.meta.env.VITE_API_URL;
  const selectedClient = useSelector((state) => state.clients.selectedClient);
  const [clientData, setClientData] = useState(selectedClient);
  const [otherEmployees, setOtherEmployees] = useState([]);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const employees = useSelector((state) => state.employees.employees);


  const handleAdditionalAmount = (e) => {
    setAdditionalAmount(Number(e.target.value)); 
  };

  const handleDistributorChange = (e) => {
    console.log(e.target.value)
    setClientData((prevData) => ({
      ...prevData,
      Distributor_id: Number(e.target.value),
    }));
  };
  



  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const Authorization = localStorage.getItem("authToken");
      if (!Authorization) {
        console.error("No authorization token found in localStorage");
        return;
      }

      const updatedClientData = {
        ...clientData,
      
        amount: (Number(clientData.amount) || 0) + additionalAmount,
        employees: [...(clientData.employees || []), ...otherEmployees],
      };
          
      const response = await fetch(`${API_URL}/acc_clientupdated/${clientData.client_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify(updatedClientData),
       
      });

      if (!response.ok) {
        throw new Error("Failed to update client");
      }

      const updatedClient = await response.json();
      console.log(updatedClientData)
      dispatch(setSelectedClient(updatedClient));
      alert("Client updated successfully");
      navigate("/client");
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };


  return (
    <div className="container mt-5">
      <div>
        
        <h2 className="text-center pt-3 pb-5">Edit Client</h2>
        <Form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-center flex-wrap justify-item-center w-100 p-1">
            <div className="d-flex flex-wrap justify-item-center col-6 col-sm-6 col-xl-4 col-xxl-6 w-100 p-2" style={{ gap: '20px', paddingLeft: '60px' }}>
              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-4 col-xl-4">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="client_name"
                  value={clientData.client_name || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="text"
                  name="client_contact"
                  value={clientData.client_contact || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="client_city"
                  value={clientData.client_city || ''}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              
              
              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
              <Form.Label>Select Distributor</Form.Label>
              <Form.Select
                // value={clientData.Distributor_id || ''}
                type="number"
                value={clientData?.Distributor_id || ''} 
                onChange={handleDistributorChange} 
              
              >
                <option value="">Select Distributor</option>
                {employees
                  .filter((emp) => emp.role === "Distributor")
                  .map((emp) => (
                    <option key={emp.user_id} value={emp.user_id}>
                      {emp.username}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>Add Amount</Form.Label>
                <Form.Control
                  type="number"
                    name="amount"
                  value={additionalAmount}
                  onChange={handleAdditionalAmount}
                />
              </Form.Group>
              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  name="amount"
                  value={clientData.amount || ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>Today Rate</Form.Label>
                <Form.Control
                  type="number"
                  name="today_rate"
                  value={clientData.today_rate|| ''}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  type="text"
                  name="accno"
                  value={clientData.accno || ''}
                  onChange={handleChange}
                />
              </Form.Group>     
                  <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                    <Form.Label>Bank Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="bank_name"
                      value={clientData.bank_name || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                    <Form.Label>Name of the Beneficiary</Form.Label>
                    <Form.Control
                      type="text"
                      name="name_of_the_beneficiary"
                      value={clientData.name_of_the_beneficiary || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                    <Form.Label>Address of the Beneficiary</Form.Label>
                    <Form.Control
                      type="text"
                      name="address_of_the_beneficiary"
                      value={clientData.address_of_the_beneficiary || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                    <Form.Label>IFSC Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="ifsc_code"
                      value={clientData.ifsc_code || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                    <Form.Label>Account Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="accoun_type"
                      value={clientData.accoun_type || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                    <Form.Label>Sender Information</Form.Label>
                    <Form.Control
                      type="text"
                      name="sender_information"
                      value={clientData.sender_information || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                <Form.Group className="mb-6 col-xxl-5 col-md-12 col-lg-5 col-xl-4">
                  <Form.Label>Narration</Form.Label>
                  <Form.Control
                    type="text"
                    name="narration"
                    value={clientData.narration || ''}
                    onChange={handleChange}
                  />
                </Form.Group>  
            </div>
            <div className="d-flex gap-3">
              <Button variant="primary" type="submit">Save Changes</Button>
              <Button variant="secondary" onClick={() => navigate('/clientinfo')}>Cancel</Button>
            </div>
          </div>
        </Form>
      </div>
    </div>)
}

export default Formdata

 