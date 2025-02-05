


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import Button from "react-bootstrap/Button";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";


function Todaycollection() {
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL;
    const [todayCollections, setTodayCollections] = useState([]);
    const [todayOverallAmount, setTodayOverallAmount] = useState(0);
    const users = useSelector((state) => state.clients.users);
    const employees = useSelector((state) => state.employees.employees);


    useEffect(() => { 
       
        const Authorization = localStorage.getItem("authToken");
      
       
        if (Authorization) {
          fetch(`${API_URL}/list`, {
            method: "GET", 
            headers: {
              "Content-Type": "application/json",
              Authorization: Authorization, 
            },
          })
            .then((response) => {
              if (response.status === 401) {
                console.error("Unauthorized access - redirecting to login");
                handleUnauthorizedAccess();
                return;
              }
              return response.json();
            })
            .then((data) => dispatch(setEmployees(data)))
              
            .catch((error) => console.error("Fetch error:", error));
        } else {
          console.error("No authorization token found in localStorage");
        }
      }, [dispatch]);

    // useEffect(() => {
    //     const today = format(new Date(), "dd-MM-yyyy");
    //     const filteredCollections = users.filter((client) =>
    //       client.paid_amount_date?.some((payment) => payment.date === today)
    //     );
    //     const totalAmount = filteredCollections.reduce((sum, client) => {
    //       const clientTotal = client.paid_amount_date.reduce((clientSum, payment) => {
    //         return payment.date === today ? clientSum + parseFloat(payment.amount || 0) : clientSum;
    //       }, 0);
    //       return sum + clientTotal;
    //     }, 0);
    //     setTodayCollections(filteredCollections);
    //     console.log(todayCollections)
    //     setTodayOverallAmount(totalAmount);
    //   }, [users]);
  
    useEffect(() => {
      const today = format(new Date(), "dd-MM-yyyy");
    
      const filteredCollections = users.filter((client) =>
        client.paid_amount_date?.some((payment) => payment.date === today)
      );
    
      // Sorting clients by latest paid_amount_time (descending order)
      filteredCollections.sort((a, b) => {
        const latestPaymentA = new Date(a.paid_amount_time || "1970-01-01");
        const latestPaymentB = new Date(b.paid_amount_time || "1970-01-01");
        return latestPaymentB - latestPaymentA; // Descending order
      });
    
      const totalAmount = filteredCollections.reduce((sum, client) => {
        const clientTotal = client.paid_amount_date.reduce((clientSum, payment) => {
          return payment.date === today ? clientSum + parseFloat(payment.amount || 0) : clientSum;
        }, 0);
        return sum + clientTotal;
      }, 0);
    
      setTodayCollections(filteredCollections);
      setTodayOverallAmount(totalAmount);
    }, [users]);
    


    const exportToCSV = () => {
        const today = format(new Date(), "dd-MM-yyyy");
        const tableData = todayCollections.flatMap((client, index) =>
          client.paid_amount_date
            .filter((payment) => payment.date === today)
            .map((payment) => {
              const employee = employees.find((e) => e.user_id === client.user_id);
              return {
                "#": index + 1,
                "Employee Name": employee?.username || "Unknown Employee",
                "Client Name": client.client_name || "Unknown Client",
                "Client City": client.client_city || "Unknown City",
                "Agent Name": employee?.username || "Unknown",
                "Paid Date": payment.date,
                "Paid Amount": payment.amount,
              };
            })
        );
    
        const csvContent = [
          ["#", "Employee Name", "Client Name", "Client City", "Agent Name", "Paid Date", "Paid Amount"],
          ...tableData.map((row) => Object.values(row))
        ]
          .map((e) => e.join(","))
          .join("\n");
    
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Today's_Collection_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    return (
        <div>
            <div className="today collection list">
                <div className="records table-responsive">
                    <div className="record-header w-100 ">
                        <div className="add d-flex justify-content-start align-items-center p-1 gap-1 " >
                            <h4 className='w-auto mt-3 fs-5 '>Today Collection</h4>
                            <Button onClick={exportToCSV} className='w-auto mb-1 '>Export to CSV</Button>
                        </div>
                        <div>
                            <div className="d-flex justify-content-center" style={{ width: "400px" }}>
                                <h4 className="totalamount pt-2">Total Amount :</h4>
                                <div className="totalbox">
                                    <h4>{todayOverallAmount} KWD</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="table-responsive-md table-responsive-sm">
                        <table className="table table-striped">
  <thead>
    <tr>
      <th>#</th>
      <th>CLIENT NAME</th>
      <th>AGENT NAME</th>
      <th>CITY</th>
      <th>AMOUNT</th>
      <th>DATE</th>
    </tr>
  </thead>
  <tbody>
    {todayCollections.length > 0 ? (
      todayCollections.map((client, index) =>
        client.paid_amount_date.map((payment, pIndex) => {
          if (payment.date === format(new Date(), "dd-MM-yyyy")) {
            return (
              <tr key={pIndex}>
                <td>{client.client_id}</td>
                {/* <td>{client.client_name ? client.client_name.toUpperCase() : "NULL"}</td> */}
                <td>
                    <div className="client">
                      <div
                        className="client-img bg-img"
                        style={{
                          backgroundImage:
                            "url(https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg)",
                        }}
                      ></div>
                      <div className="client-info">
                        <h4>{client.client_name ? client.client_name.toUpperCase() : "NULL"}</h4>
                        <small>{client.client_contact}</small>
                      </div>
                    </div>
                  </td>
                <td>
                  {employees.map((eid) =>
                    eid.user_id === client.user_id ? (
                      <span key={eid.user_id}>{eid.username?eid.username:"null"}</span>
                    ) : null
                  )}
                </td>
                <td>{client.client_city ? client.client_city.toUpperCase() : "NULL"}</td>
                <td>{parseFloat(payment.amount).toFixed(2)} KWD</td>
                <td>{payment.date.toUpperCase()}</td>
              </tr>
            );
          }
          return null;
        })
      )
    ) : (
      <tr>
        <td colSpan="6" className="text-center">
          NO DATA FOUND FOR TODAY
        </td>
      </tr>
    )}
  </tbody>
</table>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Todaycollection;

