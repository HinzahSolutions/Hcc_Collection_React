


import React, { useState, useMemo, useEffect } from "react";
import { InputGroup, FormControl, Form, Table, Button, Modal } from "react-bootstrap";


import { useDispatch, useSelector } from "react-redux";
import { parse, subDays, format, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  setUsers,
  setSelectedClient,
} from "../Slicers/clientSlice";
import { setEmployees, setSelectedEmployee } from "../Slicers/employeeSlice";

function Alldata() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedAgent, setSelectedAgent] = useState("");
  const [paidmodel, setPaidmodel] = useState(false)
  const [disid, setDisid] = useState()
  const [disamount, setDisamount] = useState()
  const [type, setType] = useState("paid")
  const AddNewClientDate = format(new Date(), "dd-MM-yyyy");
 const [amountData, setAmountData] = useState([]);

  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  console.log(AddNewClientDate, disid, disamount)
  const users = useSelector((state) => state.clients.users) || [];
  const employees = useSelector((state) => state.employees.employees) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [changetable, setChangetable] = useState("paid")

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const Authorization = localStorage.getItem("authToken");
      try {
        // Fetch clients
        const clientsRes = await fetch(`${API_URL}/acc_list`, {
          headers: { Authorization }
        });
        const clientsData = await clientsRes.json();
        dispatch(setUsers(clientsData));

        // Fetch employees
        const employeesRes = await fetch(`${API_URL}/list`, {
          headers: { Authorization }
        });
        const employeesData = await employeesRes.json();
        dispatch(setEmployees(employeesData));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [dispatch]);



  const getPaidAmountInRange = (row, startDate, endDate) => {
    if (!Array.isArray(row.paid_amount_date)) return 0;

    const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
    const endParsed = parse(endDate, "yyyy-MM-dd", new Date());

    if (!isValid(startParsed) || !isValid(endParsed)) return 0;

    const filteredPayments = row.paid_amount_date.filter((payment) => {
      const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());

      return isValid(paymentDateParsed) &&
        paymentDateParsed >= startParsed &&
        paymentDateParsed <= endParsed;
    });

    return filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  };

  // Enhanced filtering function
  const getFilteredData = () => {
    if (!startDate || !endDate) return users;

    return users.filter(client => {
      // Check if client has payments in date range
      const hasPaymentsInRange = client.paid_amount_date?.some(payment => {
        const paymentDate = parse(payment.date, "dd-MM-yyyy", new Date());
        const start = parse(startDate, "yyyy-MM-dd", new Date());
        const end = parse(endDate, "yyyy-MM-dd", new Date());

        if (!isValid(paymentDate)) return false;

        const inDateRange = paymentDate >= start && paymentDate <= end;

        // If agent is selected, check if payment matches agent
        if (selectedAgent) {
          return inDateRange && payment.userID == selectedAgent;
        }

        return inDateRange;
      });

      // If no agent selected, just check date range
      if (!selectedAgent) return hasPaymentsInRange;

      // If agent selected, check if client is assigned to agent OR has payments by agent
      return hasPaymentsInRange || client.user_id == selectedAgent;
    });
  };

  const filteredData = useMemo(getFilteredData, [users, startDate, endDate, selectedAgent]);



  const {
    overallAmount,
    totalPaidInRange,
    paidClientCount,
    paidinterAmount,
    totalinteramount,
    totalOrderLocalInRange,
    totalOrderInterAmount
  } = useMemo(() => {
    const result = {
      overallAmount: 0,
      totalPaidInRange: 0,
      paidClientCount: 0,
      paidinterAmount: 0,
      totalinteramount: 0,
      totalOrderLocalInRange: 0,
      totalOrderInterAmount: 0,
    };

    if (!users || users.length === 0) return result;

    try {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = parse(endDate, "yyyy-MM-dd", new Date());
      const isValidDateRange = isValid(start) && isValid(end);

      amountData.forEach(client => {
        try {
          const clientAmount = parseFloat(client.paidamount) || 0;
          const clientRate = parseFloat(client.today_rate) || 0;

          if (clientRate > 0) {
            result.overallAmount += clientAmount / clientRate;
          }
          result.totalinteramount += clientAmount;

          // Calculate paid amounts in range
          if (client.colldate && isValidDateRange) {
            const paidInRange = client.paid_amount_date.reduce((sum, payment) => {
              try {
             

           

                return sum + (parseFloat(payment.paidamount) || 0);
              } catch (e) {
                console.error('Error processing payment:', payment, e);
                return sum;
              }
            }, 0);

            if (paidInRange > 0) {
              result.paidinterAmount += paidInRange;
              if (clientRate > 0) {
                result.totalPaidInRange += paidInRange / clientRate;
              }
              result.paidClientCount++;
            }
          }

          const assignedDate = parse(client.date, "dd-MM-yyyy", new Date());
          if (isValid(assignedDate) && assignedDate >= start && assignedDate <= end) {
            result.totalOrderInterAmount += clientAmount;

            // Add to local total only if today_rate is valid
            if (client.today_rate && clientRate > 0) {
              result.totalOrderLocalInRange += clientAmount / clientRate;
            }
          }

        } catch (e) {
          console.error('Error processing client:', client, e);
        }
      });
    } catch (e) {
      console.error('Error in calculation:', e);
    }

    result.overallAmount = Math.round(result.overallAmount * 1000) / 1000;
    result.totalPaidInRange = Math.round(result.totalPaidInRange * 1000) / 1000;
    result.paidinterAmount = Math.round(result.paidinterAmount * 100) / 100;
    result.totalinteramount = Math.round(result.totalinteramount * 100) / 100;
    result.totalOrderInterAmount = Math.round(result.totalOrderInterAmount * 100) / 100;
    result.totalOrderLocalInRange = Math.round(result.totalOrderLocalInRange * 1000) / 1000;

    return result;
  }, [users, startDate, endDate, selectedAgent]);






  const totalPaidAmountInRange = useMemo(() => {
    return (filteredData || []).reduce((sum, row) => {
      const totalPaid = getPaidAmountInRange(row, startDate, endDate);
      const clientRate = parseFloat(row.today_rate) || 1;
      return sum + (clientRate > 0 ? totalPaid / clientRate : 0);
    }, 0);
  }, [filteredData, startDate, endDate]);


  const roundedTotalPaidAmount = useMemo(() => {
    return Math.round((totalPaidAmountInRange + Number.EPSILON) * 1000) / 1000;
  }, [totalPaidAmountInRange]);

  // Navigation handlers
  const handleClientClick = (client) => {
    dispatch(setSelectedClient(client));
    navigate("/clientinfo");
  };

  const handleAgentClick = (agentId) => {
    const agent = employees.find(e => e.user_id == agentId);
    if (agent) {
      dispatch(setSelectedEmployee(agent));
      navigate("/employee/employeeinfo");
    }
  };


  const getTotalPaidClientCount = (users, startDate, endDate) => {
    return users.filter((row) => {
      if (Array.isArray(row.paid_amount_date)) {
        return row.paid_amount_date.some((payment) => {
          const paymentDateParsed = parse(payment.date, "dd-MM-yyyy", new Date());
          const startParsed = parse(startDate, "yyyy-MM-dd", new Date());
          const endParsed = parse(endDate, "yyyy-MM-dd", new Date());
          return paymentDateParsed >= startParsed && paymentDateParsed <= endParsed;
        });
      }
      return false;
    }).length;
  };

  const totalpaidclientcount = getTotalPaidClientCount(users, startDate, endDate);

  // Export to CSV

  const [disfullname, setDisfullname] = useState("")

  const updatetheamount = () => {
    const clientData = {
      Distributor_id: parseInt(disid),            // Convert to number
      collamount: "",         // Wrap in array
      colldate: [AddNewClientDate],              // Wrap in array
      type: type,
      today_rate: "270",
      paidamount: [parseInt(disamount)],
      distname: disfullname,
      agent_id: null,
      collection_id: null

    };
    console.log("Sending:", clientData);

    fetch(`${API_URL}/collection/addamount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            // Create a custom error with status and server message
            const errorMessage = `Error ${response.status} - ${response.statusText}: ${text}`;
            throw new Error(errorMessage);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response data:", data);
        alert("Amount added successfully");
      })
      .catch((error) => {
        // Show full message including 404 or any other
        console.error("Request Failed:", error.message);
        alert(`Request failed: ${error.message}`);
      });
  };

 

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(`${API_URL}/collection/getamount`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Received amount data:", data);
        setAmountData(data);
      })
      .catch((error) => {
        console.error("❌ Fetch failed:", error.message);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(`${API_URL}/collection/collection`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Received Collection amount data:", data);
       
      })
      .catch((error) => {
        console.error("❌ Fetch failed:", error.message);
      });
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch(`${API_URL}/collection/paid`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Received paid amount data:", data);
      
      })
      .catch((error) => {
        console.error("❌ Fetch failed:", error.message);
      });
  }, []);

  const handleUpdateAmount = async () => {
    const clientData = {
      Distributor_id: parseInt(disid),
      colldate: AddNewClientDate,
      amount: parseInt(disamount),
      type: type
    };

    try {
      const response = await fetch(`${API_URL}/collection/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(clientData)
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Amount updated:", data);
      } else {
        console.error("❌ Update failed:", data.message || data.error);
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
  };

  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localdisid, setLocaldisid] = useState(113)

  useEffect(() => {
    const distributorId = localdisid; // assume this comes from localStorage or props
    const token = localStorage.getItem("authToken");

    if (!distributorId) {
      console.error("❌ Distributor ID not found in localStorage");
      return;
    }

    fetch(`${API_URL}/collection/Distributer-collection/${distributorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`❌ HTTP ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Received collection data:", data);
        setCollectionData(data);
      })
      .catch((error) => {
        console.error("❌ Fetch failed:", error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [filldata, setFilldata] = useState([]);
  const [totalpaidnewamount,setTotalpaidnewamount] = useState()
  const [totalcollnewamount,setTotalcollnewamount] = useState()
  const [totalcolltodayrate,setTotalcolltodayrate] = useState()


 useEffect(() => {
  runFilter();
}, [amountData, startDate, endDate, changetable, selectedAgent]);



  
  
  
 useEffect(() => {
  runFilter();
}, [amountData, startDate, endDate, changetable, selectedAgent]);
 
const runFilter = () => {
  console.log("🔎 Filtering started...");
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  console.log("Type Filter:", changetable);
  console.log("Selected Agent:", selectedAgent);

  const filteredData = amountData.filter((item) => {
    const rawColldate = Array.isArray(item.colldate)
      ? item.colldate[0]
      : typeof item.colldate === "string"
        ? item.colldate.replace(/[\[\]"]+/g, "")
        : "";

    const parts = rawColldate.split("-");
    const formattedDate =
      parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : null;

    const isInDateRange =
      !startDate || !endDate || (formattedDate >= startDate && formattedDate <= endDate);

    const matchesType = item.type.trim() === changetable.trim();
  const matchesAgent =
      selectedAgent === "" || selectedAgent === null
        ? true
        : String(item.agent_id) === String(selectedAgent);

    return isInDateRange && matchesType && matchesAgent;
  });

  // ✅ Calculate totals
  let totalPaid = 0;
  let totalColl = 0;
  let totalCollRate = 0;

  filteredData.forEach((item) => {
    const paid = Array.isArray(item.paidamount) ? item.paidamount[0] : item.paidamount;
    const coll = Array.isArray(item.collamount) ? item.collamount[0] : item.collamount;
    const rate = parseFloat(item.today_rate);

    const paidNum = parseFloat(paid) || 0;
    const collNum = parseFloat(coll) || 0;

    totalPaid += paidNum;
    totalColl += collNum;

    if (rate && rate !== 0) {
      totalCollRate += collNum * rate;
    }
  });

  // ⬆️ Set all states
  setFilldata(filteredData);
  setTotalpaidnewamount(totalPaid);
  setTotalcollnewamount(totalColl.toFixed(2));
  setTotalcolltodayrate(totalCollRate.toFixed(3));

  // 🧾 Logs
  console.log("✅ Final Filtered Result:", filteredData);
  console.log("💰 Total Paid Amount:", totalPaid);
  console.log("📦 Total Collection Amount:", totalColl);
  console.log("📉 Total Collection ÷ Today Rate:", totalCollRate);
};


  console.log("fdissdfkjb", amountData)

  console.log(filldata)

const handleRemovePayment = async () => {
 

  try {
    const response = await fetch(`${API_URL}/collection/paid/delete/${ parseInt(disid)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Delete failed');
    }

    // Check if response has content before parsing JSON
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    console.log('deleted', data);

  } catch (error) {
    console.error('Error:', error.message);
  }
};

 const imageExists = (url) => {
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      return "/images/fallback.jpg";
    };
    return url;
  };



  return (
    <div className="mt-5 ">
      <div className="page-header mb-4">
        <h1>All Data</h1>
        <small>Payments Dashboard</small>
      </div>



      <div className="p-4  border rounded-3 shadow-lg">
        <h4 className="text-center fw-bold mb-4 text-primary">Dashboard Summary</h4>

        <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted"> Overall Amount</span>
          {/* <div style={{ display: 'flex', flexDirection: 'column', columnGap: '5px' }} >
            <span className="fw-bold fs-5 text-primary"><span className="text-primary">Local Amount : </span>{overallAmount.toFixed(3)}</span>
            <span className="fw-bold fs-5 text-danger" >Inter Amount :{totalinteramount.toFixed(2)}</span>
          </div> */}
        </div>

        <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted">
            Paid Amount ({startDate} to {endDate})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', columnGap: '5px' }}>
            <span className="fw-bold fs-5 text-primary"  > <span className="text-primary"> Local Amount :</span>{totalpaidnewamount} </span>
           
          </div>

        </div>

        <div className="py-3 px-4 mb-3 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted">
            New Order Client  ({startDate} to {endDate})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', columnGap: '5px' }}>
            <span className="fw-bold fs-5 text-primary"  > <span className="text-primary"> Total Client Order Local Amount :</span>   {totalcollnewamount}</span>
            <span className="fw-bold fs-5 text-danger " > Total Client Order Inter Amount : {totalcolltodayrate}</span>
          </div>

        </div>

        {/* <div className="py-3 px-4 bg-light rounded-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-muted">Total paid +
            Distributer</span>
          <span className="fw-bold fs-5 text-danger">{totalpaidclientcount}</span>
        </div> */}
      </div>



      {/* Filters */}



    

      <div className="record-header d-flex justify-content-between">
        <div className="">
          <div className="d-flex gap-2">
            <Button
              variant={changetable === "collection" ? "primary" : "outline-primary"}

              onClick={() => setChangetable("collection")}
            >
              Collection
            </Button>

            <Button
              variant={changetable === "paid" ? "primary" : "outline-primary"}

              onClick={() => setChangetable("paid")}
            >
              Paid
            </Button>


             {/* <button onClick={() => setPaidmodel(true)} className="btn btn-primary w-auto">
                     distributer Amount update
             </button>  */}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap  justify-content-center p-2  ">
          <div className="d-flex gap-2  md-flex-wrap pt-2">
            <Form.Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{ minWidth: "180px", }}
            >
              <option value="" style={{ paddingBottom: "20px" }}>All Agents</option>
              {employees
                .filter(e => e.role === "Collection Agent")
                .map(agent => (
                  <option key={agent.user_id} value={agent.user_id}>
                    {agent.username}
                  </option>
                ))}
            </Form.Select>
            <InputGroup style={{ width: "180px" }}>
              <FormControl
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </InputGroup>
            <InputGroup style={{ width: "180px" }}>
              <FormControl
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </InputGroup>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-responsive-md table-responsive-sm">
       {
  changetable === "collection" ? (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Distributer Name</th>
          <th>Date</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {filldata.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>
              {
                employees.find(emp => emp.user_id == item.Distributor_id)?.username ||
                item.Distributor_id
              }
            </td>
            <td>{Array.isArray(item.colldate) ? item.colldate[0] : item.colldate}</td>
            <td>{item.today_rate}</td>
            <td>
              <div className="client-info">
                <h4 style={{ color: "blue", fontWeight: "500" }}>
                  Local:{" "}
                  <span>
                    {item.collamount?.[0]
                      ? parseFloat(item.collamount[0]).toFixed(3)
                      : "0.00"}
                  </span>
                </h4>
                 <h4 style={{ color: "red", fontWeight: "500" }}>
                  Inter:{" "}
                  <span>
                    {item.collamount?.[0]
                      ? (parseFloat(item.collamount[0]).toFixed(2)*item.today_rate).toFixed(2)
                      : "0.00"}
                  </span>
                </h4>
           
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : changetable === "paid" ? (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Distributer Name</th>
          <th>Agent</th>
          <th>Date</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {filldata.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>
                              <div className="client">
                                <div
                                  className="client-img bg-img"
                                  style={{
                                    backgroundImage: 
                                     `url(${imageExists(
                                      "https://i.pinimg.com/564x/8d/ff/49/8dff49985d0d8afa53751d9ba8907aed.jpg"
                                    )})`
                                   ,
                                  }}
                                ></div>
                                <div className="client-info">
                                  <h4> {
                employees.find(emp => emp.user_id == item.Distributor_id)?.username ||
                item.Distributor_id
              }</h4>
                                 
                                </div>
                              </div>
                            </td>
     
            <td>{ employees.find(emp => emp.user_id === item.agent_id)?.username ||
                item.agent_id}</td>
            <td>{Array.isArray(item.colldate) ? item.colldate[0] : item.colldate}</td>
            <td>{item.today_rate}</td>
            <td>
              <div className="client-info">
                <h4 style={{ color: "blue", fontWeight: "500" }}>
                  Local:{" "}
                  <span>
                    {item.paidamount?.[0]
                      ? parseFloat(item.paidamount[0]).toFixed(3)
                      : "0.00"}
                  </span>
                </h4>
               
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div>No Data</div>
  )
}

        <div className="d-flex justify-content-end p-3">
          <p>
            <strong>Total Paid Amount for the selected range: </strong>
            {totalPaidInRange.toFixed(3)}
          </p>
        </div>
      </div>

      <Modal show={paidmodel} onHide={() => setPaidmodel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input placeholder="enter the Distributer id " value={disid} onChange={(e) => setDisid(e.target.value)} type="number" ></input>
          <input placeholder="enter the Amount" value={disamount} onChange={(e) => setDisamount(e.target.value)} type="" ></input>
          <input placeholder="enter the name" value={disfullname} onChange={(e) => setDisfullname(e.target.value)} type="" ></input>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={updatetheamount} > update the amount </button>
          <button onClick={handleUpdateAmount} > remove amount </button>
            <button onClick={handleRemovePayment} > remove </button>
         
        </Modal.Footer>

      </Modal>
    </div>



  );
}

export default Alldata;