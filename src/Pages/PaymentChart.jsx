
// import React, { useState, useEffect } from 'react';
// import { parse } from 'date-fns';
// import { Line, Bar } from 'react-chartjs-2'; // Import both Line and Bar charts
// import { useDispatch, useSelector } from 'react-redux';
// import { setUsers, setSelectedClient, setSearchQuery } from '../Slicers/clientSlice';
// import { setEmployees } from '../Slicers/employeeSlice';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import { Button, Modal, InputGroup, FormControl } from "react-bootstrap";

// // Registering Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
 
// );

// const formatDate = (date) => {
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
// };

// const parseDate = (dateStr) => {
//   const [day, month, year] = dateStr.split("-");
//   return new Date(year, month - 1, day);
// };

// const PaymentChart = ({ selectedMonth, selectedYear }) => {
//   const [dates, setDates] = useState([]);
//   const [paidAmounts, setPaidAmounts] = useState([]);
//   const [chartType, setChartType] = useState('line'); // Track the chart type
//   const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
//   const currentYear = new Date().getFullYear();
//   const API_URL = import.meta.env.VITE_API_URL;
//   const dispatch = useDispatch();
//   const users = useSelector((state) => state.clients.users);
//   const employees = useSelector((state) => state.employees.employees);
//   const selectedClient = useSelector((state) => state.clients.selectedClient);
//   const searchQuery = useSelector((state) => state.clients.searchQuery);
//   const selectedEmployee = useSelector((state) => state.employees.selectedEmployee);

//   useEffect(() => {
//     const Authorization = localStorage.getItem("authToken");
//     if (!Authorization) {
//       navigate("/login");
//       return;
//     }
//     fetchAccountList();
//     fetchEmployeeList();
//   }, [dispatch]);

//   const fetchAccountList = async () => {
//     const Authorization = localStorage.getItem("authToken");
//     if (!Authorization) {
//       console.error("No authorization token found in localStorage");
//       return;
//     }
//     try {
//       const response = await fetch(`${API_URL}/acc_list`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization,
//         },
//       });
//       const data = await response.json();
//       dispatch(setUsers(data));
//     } catch (error) {
//       console.error("Fetch error in fetchAccountList:", error);
//       handleUnauthorizedAccess();
//     }
//   };

//   const fetchEmployeeList = async () => {
//     const Authorization = localStorage.getItem("authToken");
//     if (!Authorization) {
//       console.error("No authorization token found in localStorage");
//       return;
//     }
//     try {
//       const response = await fetch(`${API_URL}/list`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization,
//         },
//       });
//       const data = await response.json();
//       dispatch(setEmployees(data));
//     } catch (error) {
//       console.error("Fetch error in fetchEmployeeList:", error);
//       handleUnauthorizedAccess();
//     }
//   };

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

//     // Aggregating payment data
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
//       // For "All" months, aggregate payment data by month
//       months.forEach((month, monthIndex) => {
//         const startDate = new Date(selectedYear, monthIndex, 1);
//         const endDate = new Date(selectedYear, monthIndex + 1, 0);
//         let totalPaidAmount = 0;

//         // Loop through all days of the month
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
//       // For a specific month, aggregate by day
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

//   // Generate random color for each bar
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
//         backgroundColor: paidAmounts.map(() => generateRandomColor()), // Generate random color for each bar
//         fill: chartType === 'line', // Fill only for line chart
//         borderWidth: 2,
//         animation: {
//           duration: 300, // Duration in milliseconds (300ms = 0.3s)
//         },
//       },
//     ],
//   };

//   const options = {
//     animation: {
//       duration: 100, // Graph drawing animation speed
//     },
//     responsive: true,
//     plugins: {
//       tooltip: {
//         animation: false,
//         mode: "index", // Show tooltips for the nearest point on hover
//         intersect: false, // Tooltip will show even if hovering near the point
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

//   // Toggle between Line and Bar Chart
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
//     <div  style={{width:'95%'}} >
//       <span>
//         <Button  className='w-auto' onClick={toggleChartType}>Toggle Chart Type</Button>
//       </span>
//       {chartType === 'line' ? (
//         <Line data={data} options={options} />
//       ) : (
//         <Bar data={data} options={options} />
//       )}
//     </div>
//   );
// };

// export default PaymentChart;



import React, { useState, useEffect } from 'react';
import { parse } from 'date-fns';
import { Line, Bar } from 'react-chartjs-2'; // Import both Line and Bar charts
import { useDispatch, useSelector } from 'react-redux';
import { setUsers, setSelectedClient, setSearchQuery } from '../Slicers/clientSlice';
import { setEmployees } from '../Slicers/employeeSlice';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';  // Import Filler plugin
import { Button } from "react-bootstrap";

// Registering Chart.js components including the Filler plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler plugin
);

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-");
  return new Date(year, month - 1, day);
};

const PaymentChart = ({ selectedMonth, selectedYear }) => {
  const [dates, setDates] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState([]);
  const [chartType, setChartType] = useState('line'); // Track the chart type
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const currentYear = new Date().getFullYear();
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const users = useSelector((state) => state.clients.users);
 

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  useEffect(() => {
    const paidData = {};
    const isAllMonthsSelected = selectedMonth === "All";

    const filteredUsers = users.filter((user) =>
      Array.isArray(user.paid_amount_date) && user.paid_amount_date.some((payment) => {
        const paymentDate = parseDate(payment.date); // Use the parseDate function
        return (
          paymentDate.getFullYear() === selectedYear &&
          (isAllMonthsSelected ||
            String(paymentDate.getMonth() + 1).padStart(2, "0") === selectedMonth)
        );
      })
    );

    // Aggregating payment data
    filteredUsers.forEach((user) => {
      user.paid_amount_date.forEach((payment) => {
        const paymentDate = parseDate(payment.date);
        const formattedDate = formatDate(paymentDate);
        paidData[formattedDate] =
          (paidData[formattedDate] || 0) + parseFloat(payment.amount);
      });
    });

    const labels = [];
    const aggregatedPaidAmounts = [];

    if (isAllMonthsSelected) {
      // For "All" months, aggregate payment data by month
      months.forEach((month, monthIndex) => {
        const startDate = new Date(selectedYear, monthIndex, 1);
        const endDate = new Date(selectedYear, monthIndex + 1, 0);
        let totalPaidAmount = 0;

        // Loop through all days of the month
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
      // For a specific month, aggregate by day
      const daysInMonth = new Date(
        selectedYear,
        selectedMonth - 1 + 1,
        0
      ).getDate();
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

  // Generate random color for each bar
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Paid Amount",
        data: paidAmounts,
        borderColor: "#1246ac",
        backgroundColor: chartType === 'bar' ? paidAmounts.map(() => generateRandomColor()) : 'rgba(18, 70, 172, 0.2)', // Bar chart gets random colors
        fill: chartType === 'line', // Fill only for line chart
        borderWidth: 2,
        animation: {
          duration: 300, // Duration in milliseconds (300ms = 0.3s)
        },
      },
    ],
  };

  const options = {
    animation: {
      duration: 100, // Graph drawing animation speed
    },
    responsive: true,
    plugins: {
      tooltip: {
        animation: false,
        mode: "index", // Show tooltips for the nearest point on hover
        intersect: false, // Tooltip will show even if hovering near the point
        callbacks: {
          title: function (context) {
            return `Date: ${context[0].label}`;
          },
          label: function (context) {
            return `Amount Paid: ${context.raw} KWD`;
          },
        },
      },
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Payments Overview for ${
          selectedMonth === "All" ? "All Months" : months[selectedMonth - 1]
        } ${selectedYear}`,
        color: "#1246ac",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days/Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount (in KWD)",
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  // Toggle between Line and Bar Chart
  const toggleChartType = () => {
    setChartType((prevType) => (prevType === 'line' ? 'bar' : 'line'));
  };

  const handleUnauthorizedAccess = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div style={{ width: '95%' }}>
      <div  className='text-center d-flex justify-content-center align-items-end'>
        <Button className="w-auto text-center" onClick={toggleChartType}>bar Chart Type</Button>
      </div>
      {chartType === 'line' ? (
        <Line data={data} options={options} />
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default PaymentChart;
