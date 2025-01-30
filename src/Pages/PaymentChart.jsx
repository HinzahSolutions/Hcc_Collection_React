// import React, { useState, useEffect } from 'react';
// import { parse } from 'date-fns';
// import { Line, Bar } from 'react-chartjs-2'; // Import both Line and Bar charts
// import { useDispatch, useSelector } from 'react-redux';
// import { setUsers, setSelectedClient, setSearchQuery } from '../Slicers/clientSlice';
// import { setEmployees } from '../Slicers/employeeSlice';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';  // Import Filler plugin
// import { Button } from "react-bootstrap";


// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler 
// );

// const formatDate = (date) => {
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`; 
// };

// const parseDate = (dateStr) => {
//   const [day, month, year] = dateStr.split("-");
//   return new Date(year, month - 1, day);
// };

// const PaymentChart = ({ selectedMonth, selectedYear }) => {
//   const [dates, setDates] = useState([]);
//   const [paidAmounts, setPaidAmounts] = useState([]);
//   const [chartType, setChartType] = useState('line'); 
//   const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
//   const currentYear = new Date().getFullYear();
//   const API_URL = import.meta.env.VITE_API_URL;
//   const dispatch = useDispatch();
//   const users = useSelector((state) => state.clients.users);
 

//   const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//   ];

//   useEffect(() => {
//     const paidData = {};
//     const isAllMonthsSelected = selectedMonth === "All";

//     const filteredUsers = users.filter((user) =>
//       Array.isArray(user.paid_amount_date) && user.paid_amount_date.some((payment) => {
//         const paymentDate = parseDate(payment.date); // Use the parseDate function
//         return (
//           paymentDate.getFullYear() === selectedYear &&
//           (isAllMonthsSelected ||
//             String(paymentDate.getMonth() + 1).padStart(2, "0") === selectedMonth)
//         );
//       })
//     );

    
//     filteredUsers.forEach((user) => {
//       user.paid_amount_date.forEach((payment) => {
//         const paymentDate = parseDate(payment.date);
//         const formattedDate = formatDate(paymentDate);
//         paidData[formattedDate] =
//           (paidData[formattedDate] || 0) + parseFloat(payment.amount);
//       });
//     });

//     const labels = [];
//     const aggregatedPaidAmounts = [];

//     if (isAllMonthsSelected) {
     
//       months.forEach((month, monthIndex) => {
//         const startDate = new Date(selectedYear, monthIndex, 1);
//         const endDate = new Date(selectedYear, monthIndex + 1, 0);
//         let totalPaidAmount = 0;

        
//         for (let day = startDate.getDate(); day <= endDate.getDate(); day++) {
//           const dateStr = `${String(day).padStart(2, "0")}-${String(
//             monthIndex + 1
//           ).padStart(2, "0")}-${selectedYear}`;
//           totalPaidAmount += paidData[dateStr] || 0;
//         }

//         labels.push(month);
//         aggregatedPaidAmounts.push(totalPaidAmount);
//       });
//     } else {
     
//       const daysInMonth = new Date(
//         selectedYear,
//         selectedMonth - 1 + 1,
//         0
//       ).getDate();
//       for (let i = 1; i <= daysInMonth; i++) {
//         const dateStr = `${String(i).padStart(2, "0")}-${String(
//           selectedMonth
//         ).padStart(2, "0")}-${selectedYear}`;
//         labels.push(dateStr);
//         aggregatedPaidAmounts.push(paidData[dateStr] || 0);
//       }
//     }

//     setDates(labels);
//     setPaidAmounts(aggregatedPaidAmounts);
//   }, [users, selectedMonth, selectedYear]);

  
//   const generateRandomColor = () => {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//       color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   };

//   const data = {
//     labels: dates,
//     datasets: [
//       {
//         label: "Paid Amount",
//         data: paidAmounts,
//         borderColor: "#1246ac",
//         backgroundColor: chartType === 'bar' ? paidAmounts.map(() => generateRandomColor()) : 'rgba(18, 70, 172, 0.2)', 
//         fill: chartType === 'line', 
//         borderWidth: 2,
//         animation: {
//           duration: 300, 
//         },
//       },
//     ],
//   };

//   const options = {
//     animation: {
//       duration: 100, 
//     },
//     responsive: true,
//     plugins: {
//       tooltip: {
//         animation: false,
//         mode: "index", 
//         intersect: false, 
//         callbacks: {
//           title: function (context) {
//             return `Date: ${context[0].label}`;
//           },
//           label: function (context) {
//             return `Amount Paid: ${context.raw} KWD`;
//           },
//         },
//       },
//       legend: {
//         position: "top",
//       },
//       title: {
//         display: true,
//         text: `Payments Overview for ${
//           selectedMonth === "All" ? "All Months" : months[selectedMonth - 1]
//         } ${selectedYear}`,
//         color: "#1246ac",
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: "Days/Months",
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Amount (in KWD)",
//         },
//         ticks: {
//           beginAtZero: true,
//         },
//       },
//     },
//   };

 
//   const toggleChartType = () => {
//     setChartType((prevType) => (prevType === 'line' ? 'bar' : 'line'));
//   };

//   const handleUnauthorizedAccess = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userName");
//     navigate("/login");
//   };

//   return (
//     <div style={{ width: '95%',height:'100vh' }}>
//       <div  className='text-center d-flex justify-content-center align-items-end'>
//         <Button className="w-auto text-center" onClick={toggleChartType}>bar Chart Type</Button>
//       </div>
//          <div  className='chartup'>
//          {chartType === 'line' ? (
//         <Line data={data} options={options} />
//       ) : (
//         <Bar data={data} options={options} />
//       )}

//          </div>
     
//     </div>
//   );
// };

// export default PaymentChart;



import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "react-bootstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler 
);

const formatDate = (date) => `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-");
  return new Date(year, month - 1, day);
};

const PaymentChart = ({ selectedMonth, selectedYear }) => {
  const [dates, setDates] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState([]);
  const [chartType, setChartType] = useState('line'); 
  const users = useSelector((state) => state.clients.users);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const paidData = {};
    const isAllMonthsSelected = selectedMonth === "All";
    
    const filteredUsers = users.filter((user) =>
      Array.isArray(user.paid_amount_date) && user.paid_amount_date.some((payment) => {
        const paymentDate = parseDate(payment.date);
        return (
          paymentDate.getFullYear() === selectedYear &&
          (isAllMonthsSelected ||
            String(paymentDate.getMonth() + 1).padStart(2, "0") === selectedMonth)
        );
      })
    );

    filteredUsers.forEach((user) => {
      user.paid_amount_date.forEach((payment) => {
        const paymentDate = parseDate(payment.date);
        const formattedDate = formatDate(paymentDate);
        paidData[formattedDate] = (paidData[formattedDate] || 0) + parseFloat(payment.amount);
      });
    });

    const labels = [];
    const aggregatedPaidAmounts = [];

    if (isAllMonthsSelected) {
      months.forEach((month, monthIndex) => {
        const startDate = new Date(selectedYear, monthIndex, 1);
        const endDate = new Date(selectedYear, monthIndex + 1, 0);
        let totalPaidAmount = 0;
        
        for (let day = startDate.getDate(); day <= endDate.getDate(); day++) {
          const dateStr = `${String(day).padStart(2, "0")}-${String(
            monthIndex + 1
          ).padStart(2, "0")}-${selectedYear}`;
          totalPaidAmount += paidData[dateStr] || 0;
        }

        labels.push(month);
        aggregatedPaidAmounts.push(totalPaidAmount);
      });
    } else {
      const daysInMonth = new Date(selectedYear, selectedMonth - 1 + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${String(i).padStart(2, "0")}-${String(
          selectedMonth
        ).padStart(2, "0")}-${selectedYear}`;
        labels.push(dateStr);
        aggregatedPaidAmounts.push(paidData[dateStr] || 0);
      }
    }

    setDates(labels);
    setPaidAmounts(aggregatedPaidAmounts);
  }, [users, selectedMonth, selectedYear]);

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Paid Amount",
        data: paidAmounts,
        borderColor: "#1246ac",
        backgroundColor: chartType === 'bar' ? paidAmounts.map(() => '#1246ac') : 'rgba(18, 70, 172, 0.2)',
        fill: chartType === 'line',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Payments Overview`, color: "#1246ac" },
    },
    scales: {
      x: { title: { display: true, text: "Days/Months" } },
      y: { title: { display: true, text: "Amount (in KWD)" }, beginAtZero: true },
    },
  };

  return (
    <div style={{ width: '95%',height:'100%' }}>
      <style>
        {`@media (max-width: 458px) { .chartup { height: 100vh; } }`}
      </style>
      <div className='text-center d-flex justify-content-center align-items-end'>
        <Button className="w-auto" onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}>Toggle Chart</Button>
      </div>
      <div className='chartup'>
        {chartType === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}
      </div>
    </div>
  );
};

export default PaymentChart;

