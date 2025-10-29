// src/modals/AddClientForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { format } from "date-fns";

const randomIndianNumber = () => {
  const p = ["9", "8", "7", "6"][Math.floor(Math.random() * 4)];
  return p + Math.floor(100000000 + Math.random() * 900000000);
};

export default function AddClientForm({ onClose, employees, authFetch, dispatch }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const role = localStorage.getItem("role");
  const dtpId = localStorage.getItem("user_id");
  const currentDate = format(new Date(), "dd-MM-yyyy");

  // ── States
  const [clientName, setClientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [city, setCity] = useState("KUWAIT");
  const [amount, setAmount] = useState("");

  const [distributorId, setDistributorId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showDistList, setShowDistList] = useState(false);
  const distributorRef = useRef(null);

  const [showRateInput, setShowRateInput] = useState(false);
  const [todayRate, setTodayRate] = useState("");

  const [showBank, setShowBank] = useState(false);
  const [accNumber, setAccNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");

  const [showNewDistributor, setShowNewDistributor] = useState(false);
  const [newDistName, setNewDistName] = useState("");
  const [newDistContact, setNewDistContact] = useState("");
  const [newDistRate, setNewDistRate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingDistributor, setIsCreatingDistributor] = useState(false);

  const isLoading = isSubmitting || isCreatingDistributor;

  // ── Click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (distributorRef.current && !distributorRef.current.contains(e.target)) {
        setShowDistList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Select distributor
  const selectDistributor = (emp) => {
    setDistributorId(emp.user_id);
    setSearchText(emp.username);
    setShowDistList(false);
    setShowRateInput(true);

    if (emp.today_rate_date === currentDate) {
      setTodayRate(parseFloat(emp.Distributor_today_rate) || "");
    } else {
      setTodayRate("");
    }
  };

  // ── Create Distributor (Parallel & Fast)
  const handleDistributorSubmit = async () => {
    if (!newDistName.trim() || !newDistContact.trim() || !newDistRate.trim()) {
      return alert("Please fill Name, Contact, and Today Rate");
    }

    setIsCreatingDistributor(true);
    try {
      const payload = {
        username: newDistName.trim(),
        contact: newDistContact.trim(),
        role: "Distributor",
        today_rate: Number(newDistRate),
        today_rate_date: currentDate,
      };

      const [_, listRes] = await Promise.all([
        authFetch(`${API_URL}/register`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
        authFetch(`${API_URL}/list`),
      ]);

      const data = await listRes.json();
      dispatch({ type: "employees/setEmployees", payload: data });

      setNewDistName("");
      setNewDistContact("");
      setNewDistRate("");
      setShowNewDistributor(false);
      alert("Distributor created successfully!");
    } catch (e) {
      alert(e.message || "Failed to create distributor");
    } finally {
      setIsCreatingDistributor(false);
    }
  };

  // ── Reset client fields only
  const resetForm = () => {
    setClientName("");
    setContactNumber("");
    setAmount("");
    setAccNumber("");
    setHolderName("");
    setIfsc("");
    setBeneficiaryEmail("");
    setShowBank(false);
  };

  // ── Submit Client (ULTRA-FAST: Parallel)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distributorId) return alert("Please select a distributor");
    if (!todayRate) return alert("Please enter today rate");

    setIsSubmitting(true);
    const rate = Number(todayRate);
    const amt = Number(amount) || 0;

    const payload = {
      client_name: (clientName || "UNKNOWN").toUpperCase(),
      client_contact: (contactNumber || randomIndianNumber()).toString(),
      client_city: (city || "KUWAIT").toUpperCase(),
      amount: amt,
      today_rate: rate,
      date: currentDate,
      sent: false,
      message: "",
      paid_and_unpaid: false,
      success_and_unsuccess: false,
      bank_name: "",
      accno: accNumber.trim().toUpperCase(),
      ifsc_code: ifsc.toUpperCase(),
      accoun_type: "10",
      Distributor_id: Number(distributorId),
      name_of_the_beneficiary: holderName.toUpperCase(),
      address_of_the_beneficiary: "CHENNAI",
      sender_information: "STOCK",
      bank_type: "STOCK",
      narration: "STOCK",
      description: "STOCK",
      email_id_beneficiary: beneficiaryEmail.replace(/"/g, ""),
      ...(role === "Dtp" && { dtp_id: dtpId }),
    };

    try {
      const [insertRes, collectionRes, listRes] = await Promise.all([
        authFetch(`${API_URL}/acc_insertarrays`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
        rate > 0 && amt > 0
          ? authFetch(`${API_URL}/collection/addamount`, {
              method: "POST",
              body: JSON.stringify({
                Distributor_id: Number(distributorId),
                collamount: [(amt / rate).toFixed(3)],
                colldate: [currentDate],
                type: "collection",
                today_rate: rate,
                paidamount: "",
              }),
            })
          : Promise.resolve(null),
        authFetch(`${API_URL}/acc_list`),
      ]);

      // Critical: check insert
      if (!insertRes.ok) {
        const err = await insertRes.text();
        throw new Error(`Failed to save client: ${err}`);
      }

      // Non-critical: warn if collection fails
      if (collectionRes && !collectionRes.ok) {
        console.warn("Collection add failed (non-critical)");
      }

      const list = await listRes.json();
      dispatch({ type: "clients/setUsers", payload: list });
      resetForm();
      alert("Client saved successfully!");

    } catch (err) {
      console.error("Submit error:", err);
      alert(err.message || "Failed to save client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="xl" backdrop="static">
      <div>
        <Modal.Header closeButton className="d-flex justify-content-between py-3">
          <div className="d-flex justify-content-between w-100">
            <Modal.Title>Add New Client</Modal.Title>
            <h5 className="pt-2">Date: {currentDate}</h5>
          </div>
        </Modal.Header>

        <Modal.Body className="position-relative">
          {/* Loading Overlay */}
          {/* {isLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-95"
              style={{ zIndex: 1050 }}
            >
              < recipes animation="border" variant="primary" />
              <span className="ms-2">
                {isSubmitting ? "Saving client..." : "Creating distributor..."}
              </span>
            </div>
          )} */}

          <form onSubmit={handleSubmit} className="custom-form">
            {/* Distributor + Rate */}
            <div
              className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12"
              style={{ backgroundColor: "rgb(251, 243, 243)", borderRadius: "10px" }}
            >
              <div className="txt_field col-lg-5 col-md-10 col-sm-10" ref={distributorRef} style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="SELECT DISTRIBUTOR"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowDistList(true);
                  }}
                  onFocus={() => setShowDistList(true)}
                  disabled={isLoading}
                  style={{
                    border: "none",
                    background: "none",
                    color: "black",
                    fontWeight: "bold",
                    outline: "none",
                    boxShadow: "none",
                    margin: 0,
                    padding: 0,
                    paddingTop: "20px",
                    width: "100%",
                  }}
                />
                {showDistList && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ccc",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      listStyle: "none",
                      padding: 0,
                      marginTop: "4px",
                    }}
                  >
                    {employees
                      .filter(
                        (emp) =>
                          emp.role === "Distributor" &&
                          emp.username.toLowerCase().includes(searchText.toLowerCase())
                      )
                      .map((emp) => (
                        <li
                          key={emp.user_id}
                          onClick={() => selectDistributor(emp)}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {emp.username.toUpperCase()}
                        </li>
                      ))}
                    {employees.filter(
                      (emp) =>
                        emp.role === "Distributor" &&
                        emp.username.toLowerCase().includes(searchText.toLowerCase())
                    ).length === 0 && (
                      <li style={{ padding: "10px", color: "#999" }}>No match found</li>
                    )}
                  </ul>
                )}
              </div>

              {showRateInput && (
                <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                  <input
                    type="number"
                    step="0.01"
                    value={todayRate}
                    onChange={(e) => setTodayRate(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ paddingTop: "20px" }}
                  />
                  <label>TODAY RATE</label>
                </div>
              )}
            </div>

            {/* Client Fields */}
            <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12 mt-3">
              <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isLoading}
                />
                <label>ORDER NO / CLIENT NAME</label>
              </div>
              <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  disabled={isLoading}
                />
                <label>CLIENT CONTACT NUMBER</label>
              </div>
            </div>

            <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
              <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                />
                <label>City</label>
              </div>
              <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  disabled={isLoading}
                />
                <label>AMOUNT</label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mb-4" style={{ width: "100%" }}>
              <Button
                variant={showBank ? "danger" : "primary"}
                onClick={() => setShowBank(!showBank)}
                disabled={isLoading}
                style={{ width: "100%" }}
              >
                {showBank ? "Clear Bank" : "Add Bank"}
              </Button>
              <Button
                variant={showNewDistributor ? "danger" : "primary"}
                onClick={() => setShowNewDistributor(!showNewDistributor)}
                disabled={isLoading}
                style={{ width: "100%" }}
              >
                {showNewDistributor ? "Clear Distributor" : "Add New Distributor"}
              </Button>
            </div>

            {/* New Distributor */}
            {showNewDistributor && (
              <>
                <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="text"
                      value={newDistName}
                      onChange={(e) => setNewDistName(e.target.value)}
                      disabled={isLoading}
                    />
                    <label>ENTER THE DISTRIBUTOR NAME</label>
                  </div>
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="text"
                      value={newDistContact}
                      onChange={(e) => setNewDistContact(e.target.value)}
                      disabled={isLoading}
                    />
                    <label>CONTACT NUMBER</label>
                  </div>
                </div>
                <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="number"
                      step="0.01"
                      value={newDistRate}
                      onChange={(e) => setNewDistRate(e.target.value)}
                      disabled={isLoading}
                    />
                    <label>TODAY RATE</label>
                  </div>
                </div>
                <Button
                  variant="success"
                  onClick={handleDistributorSubmit}
                  disabled={isLoading}
                  className="w-auto"
                >
                  {isCreatingDistributor ? "Creating..." : "Save Distributor"}
                </Button>
              </>
            )}

            {/* Bank */}
            {showBank && (
              <>
                <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="text"
                      value={accNumber}
                      onChange={(e) => setAccNumber(e.target.value.trim())}
                      disabled={isLoading}
                    />
                    <label>ACCOUNT NUMBER</label>
                  </div>
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="text"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      disabled={isLoading}
                    />
                    <label>NAME OF THE BENEFICIARY</label>
                  </div>
                </div>
                <div className="row d-flex gap-5 xl-gap-1 justify-content-center align-items-center col-12">
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      disabled={isLoading}
                    />
                    <label>IFSC CODE</label>
                  </div>
                  <div className="txt_field col-lg-5 col-md-10 col-sm-10">
                    <input
                      type="text"
                      value={beneficiaryEmail}
                      onChange={(e) => setBeneficiaryEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    <label>BENEFICIARY EMAIL_ID</label>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <Modal.Footer className="w-100 justify-content-center mt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="w-15 px-5"
              >
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="w-15 px-5"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </div>
    </Modal>
  );
}