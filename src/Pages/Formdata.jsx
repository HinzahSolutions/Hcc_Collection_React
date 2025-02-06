
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

  useEffect(() => {
    if (!selectedClient) {
      navigate('/clientinfo');
    }
  }, [selectedClient, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = (e) => {
    setOtherEmployees((prev) => [...prev, e.target.value]);
  };

  const handleAdditionalAmount = (e) => {
    setAdditionalAmount(Number(e.target.value) || 0);
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

      await fetch(`${API_URL}/acc_clientupdated/${clientData.client_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify(updatedClientData),
      });

      dispatch(setSelectedClient(updatedClientData));
      alert("Client updated successfully");
      sessionStorage.clear();
      navigate("/client");
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center py-4">Edit Client</h2>
      <Form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-center flex-wrap w-100 p-1">
          <div className="d-flex flex-wrap col-6 col-sm-6 col-xl-4 col-xxl-6 w-100 p-2" style={{ gap: '20px', paddingLeft: '30px' }}>
            
            {/* Always visible fields */}
            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                name="client_name"
                defaultValue={clientData.client_name}
                onBlur={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="client_contact"
                defaultValue={clientData.client_contact}
                onBlur={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="client_city"
                defaultValue={clientData.client_city}
                onBlur={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Add Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                defaultValue={additionalAmount}
                onChange={handleAdditionalAmount}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Add Other Employee</Form.Label>
              <Form.Control type="text" onChange={handleAddEmployee} />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="text"
                name="amount"
                defaultValue={clientData.amount}
                onBlur={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Today Rate</Form.Label>
              <Form.Control
                type="number"
                name="today_rate"
                defaultValue={clientData.today_rate}
                onBlur={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-xxl-5 col-md-12">
              <Form.Label>Client Account Type</Form.Label>
              <select className="form-select" value={clientData.bank_type} onChange={handleChange} name="bank_type">
                <option value="bank1">Bank 1</option>
                <option value="bank2">Bank 2</option>
              </select>
            </Form.Group>

            {/* Conditionally render fields based on bank_type */}
            {clientData.bank_type !== "bank1" && (
              <>
                <Form.Group className="mb-3 col-xxl-5 col-md-12">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="bank_name"
                    defaultValue={clientData.bank_name}
                    onBlur={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-xxl-5 col-md-12">
                  <Form.Label>IFSC Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="ifsc_code"
                    defaultValue={clientData.ifsc_code}
                    onBlur={handleChange}
                  />
                </Form.Group>
              </>
            )}

            {/* Show narration only if bank_type is "bank1" */}
            {clientData.bank_type === "bank1" && (
              <Form.Group className="mb-3 col-xxl-5 col-md-12">
                <Form.Label>Narration</Form.Label>
                <Form.Control
                  type="text"
                  name="narration"
                  defaultValue={clientData.narration}
                  onBlur={handleChange}
                />
              </Form.Group>
            )}
          </div>

          <div className="d-flex gap-3">
            <Button variant="primary" type="submit">Save Changes</Button>
            <Button variant="secondary" onClick={() => navigate('/clientinfo')}>Cancel</Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default Formdata;
