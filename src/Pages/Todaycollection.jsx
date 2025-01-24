// import React,{useEffect,useState} from 'react'
// import { useDispatch, useSelector } from "react-redux";
// import * as XLSX from "xlsx"; 
// import Button from "react-bootstrap/Button";
// import { format } from "date-fns";

// function Todaycollection() {
//     const [todayCollections, setTodayCollections] = useState([]);
//      const [todayOverallAmount, setTodayOverallAmount] = useState(0);
//      const users = useSelector((state) => state.clients.users);
// const employees = useSelector((state) => state.employees.employees);

//     useEffect(() => {
//         const today = format(new Date(), "dd-MM-yyyy");
//         const filteredCollections = users.filter((client) =>
//           client.paid_amount_date?.some((payment) => payment.date === today)
//         );
//         const totalAmount = filteredCollections.reduce((sum, client) => {
//           const clientTotal = client.paid_amount_date.reduce((clientSum, payment) => {
//             return payment.date === today ? clientSum + parseFloat(payment.amount || 0) : clientSum;
//           }, 0);
//           return sum + clientTotal;
//         }, 0);
//         setTodayCollections(filteredCollections);
//         setTodayOverallAmount(totalAmount);
//       }, [users]);



//       const exportToExcel = () => {
//           const wb = XLSX.utils.book_new();
//           const tableData = todayCollections.flatMap((client, index) =>
//             client.paid_amount_date
//               .filter((payment) => payment.date === format(new Date(), "dd-MM-yyyy"))
//               .map((payment) => {
//                 const employee = employees.find((e) => e.user_id === client.user_id);
//                 return {
//                   "#": index + 1,
//                   "Employee Name": employee?.username || "Unknown Employee",
//                   "Client Name": client.client_name || "Unknown Client",
//                   "Client City": client.client_city || "Unknown City",
//                   "Agent Name": employee?.username || "Unknown",
//                   "Paid Date": payment.date,
//                   "Paid Amount": payment.amount,
//                 };
//               })
//           );
      
//           const ws = XLSX.utils.json_to_sheet(tableData);


//           const headerStyle = {
//             font: { bold: true, sz: 10 }, 
//             alignment: { horizontal: "center" },
//             fill: { fgColor: { rgb: "F2F2F2" } }, 
//           };
        
//           const cellStyle = {
//             font: { sz: 8 }, 
//             alignment: { wrapText: true },
//           };
        
          
//           Object.keys(ws).forEach(cell => {
           
//             if (cell.match(/^[A-Z]+\d+$/)) { 
//               if (cell.endsWith('1')) {
//                 ws[cell].s = headerStyle; 
//               } else {
//                 ws[cell].s = cellStyle; 
//               }
//             }
//           });
        
         
//           ws['!cols'] = [
//             { wch: 5 }, 
//             { wch: 20 }, 
//             { wch: 20 },
//             { wch: 25 },
//             { wch: 20 }, 
//             { wch: 20 },
//             { wch: 20 },

//           ];
        
//           XLSX.utils.book_append_sheet(wb, ws, "Today's Collection");
//           XLSX.writeFile(wb, `Today's_Collection_${new Date().toISOString()}.xlsx`);
//         };



//   return (
//     <div>
//          <div  className="today collection list">
//                 <div className="records table-responsive">
//                   <div className="record-header">
//                   <div className="add"   style={{display:'flex',justifyContent:'center',alignItems:"center"}}>
//                       <h4>Today Collection</h4>
//                       <Button onClick={exportToExcel} style={{ marginBottom: '20px' }}>Export to Excel</Button>
//                     </div>
//                     <div>
                   
        
//                       <div
//                         style={{
//                           width: "400px",
//                           display: "flex",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <h4 className="totalamount" style={{ paddingTop: "10px" }}>
//                           Total Amount :
//                         </h4>
//                         <div className="totalbox">
//                           <h4>{todayOverallAmount} KWD</h4>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
        
//                   <div>
//                     <table className="table table-striped">
//                       <thead>
//                         <tr>
//                           <th>#</th>
//                           <th>Client Name</th>
//                           <th>Agent Name</th>
//                           <th>City</th>
//                           <th>Amount</th>
//                           <th>Date</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {todayCollections.length > 0 ? (
//                           todayCollections.map((client, index) =>
//                             client.paid_amount_date.map((payment, pIndex) => {
//                               if (payment.date === format(new Date(), "dd-MM-yyyy")) {
//                                 return (
//                                   <tr>
//                                     <td>{index + 1}</td>
//                                     <td onClick={() => handlenav1(client)}>
//                                       {client.client_name || "null"}
//                                     </td>
//                                     <td>
//                                       {employees.map((eid) =>
//                                         eid.user_id == client.user_id ? (
//                                           <span onClick={() => handlenav(eid)}>
//                                             {eid.username}
//                                           </span>
//                                         ) : (
//                                           <span></span>
//                                         )
//                                       )}
//                                     </td>
//                                     <td>{client.client_city}</td>
//                                     <td>{parseFloat(payment.amount).toFixed(2)} KWD</td>
//                                     <td>{payment.date}</td>
//                                   </tr>
//                                 );
//                               }
//                               return null;
//                             })
//                           )
//                         ) : (
//                           <tr>
//                             <td colSpan="6" className="text-center">
//                               No data found for today
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//     </div>
//   )
// }

// export default Todaycollection



import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx"; 
import Button from "react-bootstrap/Button";
import { format } from "date-fns";

function Todaycollection() {
    const [todayCollections, setTodayCollections] = useState([]);
    const [todayOverallAmount, setTodayOverallAmount] = useState(0);
    const users = useSelector((state) => state.clients.users);
    const employees = useSelector((state) => state.employees.employees);

    useEffect(() => {
        const today = format(new Date(), "dd-MM-yyyy");
        const filteredCollections = users.filter((client) =>
          client.paid_amount_date?.some((payment) => payment.date === today)
        );
        const totalAmount = filteredCollections.reduce((sum, client) => {
          const clientTotal = client.paid_amount_date.reduce((clientSum, payment) => {
            return payment.date === today ? clientSum + parseFloat(payment.amount || 0) : clientSum;
          }, 0);
          return sum + clientTotal;
        }, 0);
        setTodayCollections(filteredCollections);
        setTodayOverallAmount(totalAmount);
      }, [users]);

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const tableData = todayCollections.flatMap((client, index) =>
          client.paid_amount_date
            .filter((payment) => payment.date === format(new Date(), "dd-MM-yyyy"))
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
    
        const ws = XLSX.utils.json_to_sheet(tableData);

        const headerStyle = {
            font: { bold: true, sz: 10 }, 
            alignment: { horizontal: "center" },
            fill: { fgColor: { rgb: "F2F2F2" } }, 
        };
    
        const cellStyle = {
            font: { sz: 8 }, 
            alignment: { wrapText: true },
        };
    
        Object.keys(ws).forEach(cell => {
            if (cell.match(/^[A-Z]+\d+$/)) { 
                if (cell.endsWith('1')) {
                    ws[cell].s = headerStyle; 
                } else {
                    ws[cell].s = cellStyle; 
                }
            }
        });
    
        ws['!cols'] = [
            { wch: 5 }, 
            { wch: 20 }, 
            { wch: 20 },
            { wch: 25 },
            { wch: 20 }, 
            { wch: 20 },
            { wch: 20 },
        ];
    
        XLSX.utils.book_append_sheet(wb, ws, "Today's Collection");
        XLSX.writeFile(wb, `Today's_Collection_${new Date().toISOString()}.xlsx`);
    };

    return (
        <div>
            <div className="today collection list">
                <div className="records table-responsive">
                    <div className="record-header  justify-content-between">
                        <div className="add d-flex justify-content-start align-items-center  "  style={{width:'100%'}}>
                            <h4  className='w-auto mt-3'>Today Collection</h4>
                            <Button onClick={exportToExcel} className='w-auto mb-1'>Export to Excel</Button>
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
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Client Name</th>
                                    <th>Agent Name</th>
                                    <th>City</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayCollections.length > 0 ? (
                                    todayCollections.map((client, index) =>
                                        client.paid_amount_date.map((payment, pIndex) => {
                                            if (payment.date === format(new Date(), "dd-MM-yyyy")) {
                                                return (
                                                    <tr key={pIndex}>
                                                        <td>{index + 1}</td>
                                                        <td onClick={() => handlenav1(client)}>
                                                            {client.client_name || "null"}
                                                        </td>
                                                        <td>
                                                            {employees.map((eid) =>
                                                                eid.user_id === client.user_id ? (
                                                                    <span key={eid.user_id} onClick={() => handlenav(eid)}>
                                                                        {eid.username}
                                                                    </span>
                                                                ) : (
                                                                    <span key={eid.user_id}></span>
                                                                )
                                                            )}
                                                        </td>
                                                        <td>{client.client_city}</td>
                                                        <td>{parseFloat(payment.amount).toFixed(2)} KWD</td>
                                                        <td>{payment.date}</td>
                                                    </tr>
                                                );
                                            }
                                            return null;
                                        })
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            No data found for today
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Todaycollection;
