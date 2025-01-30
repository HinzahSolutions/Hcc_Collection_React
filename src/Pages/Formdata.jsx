import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedClient } from '../Slicers/clientSlice';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

function Formdata() {
   const API_URL = import.meta.env.VITE_API_URL;
    const selectedClient = useSelector((state) => state.clients.selectedClient);
    const [clientData, setClientData] = useState(selectedClient);
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!selectedClient) {
        navigate('/clientinfo');
      }
    }, [selectedClient, navigate]);
  
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
  
        const response = await fetch(`${API_URL}/update_client/${clientData.client_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization,
          },
          body: JSON.stringify(clientData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update client');
        }
  
        const updatedClient = await response.json();
        dispatch(setSelectedClient(updatedClient));
        alert('Client updated successfully');
        navigate('/clientinfo');
      } catch (error) {
        console.error('Error updating client:', error);
      }
    };
  
    return (
      <div className="container mt-5">
      <div>
        <h2  style={{textAlign:'center',paddingTop:'20px',paddingBottom:'50px'}}>Edit Client</h2>
        <Form onSubmit={handleSubmit}>
        <div  className='d-flex justify-content-center flex-wrap justify-item-center w-100 '>
        <div className="d-flex flex-wrap  justify-item-center  col-6 col-sm-6 col-xl-4 col-xxl-6  w-100  gap-row-5 "  style={{gap:'20px',paddingLeft:'90px'}}>
          <Form.Group className="mb-6  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>Client Name</Form.Label>
            <Form.Control
              type="text"
              name="client_name"
              value={clientData.client_name || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
         
          <Form.Group className="mb-6 col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              name="client_contact"
              value={clientData.client_contact || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6 ">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.client_city || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>amount</Form.Label>
            <Form.Control
              type="text"
              name="amount"
              value={clientData.amount || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>Bank name</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.bank_name || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label> Name of the beneficiary</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.name_of_the_beneficiary|| ''}
              onChange={handleChange}
            />
{/* 
client_name: clientName,
      client_contact: contactNumber,
      client_city: city,
      amount: amount,
      today_rate: todayrate,
      date: currentDate,
      sent: false,
      message: message,
      paid_and_unpaid: false,
      success_and_unsuccess: false,
      bank_name: bname,
      accno: anumber,
      ifsc_code: ifsc,
      accoun_type: type,
      name_of_the_beneficiary: holdername,
      address_of_the_beneficiary: holderaddress,
      sender_information: senderinfo, */}
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>Address of the beneficiary</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.address_of_the_beneficiary || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>Account number</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.accno || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>IFSC number</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.ifsc_code || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label>Account Type</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.accoun_type || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3  col-xxl-5  col-md-12  col-xl-6">
            <Form.Label> Sender information</Form.Label>
            <Form.Control
              type="text"
              name="client_city"
              value={clientData.sender_information || ''}
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
       
      </div>
    );
}

export default Formdata