import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export default function PayModal({ employeeid, employeename, onClose, type = "paid" }) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const API_URL = import.meta.env.VITE_API_URL;
  // Get current date as YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };
  console.log(employeeid)

  const updatetheamount = async () => {
    const paidAmount =  amount

    setIsLoading(true);

    const clientData = {
      Distributor_id: parseInt(employeeid),
      collamount: "",
      colldate: [getCurrentDate()],
      type: type,
      today_rate: null,
      paidamount: [paidAmount],
      distname: employeename,
      agent_id: 744,
      collection_id: null,
    };

    console.log("Sending to:", `${API_URL}/collection/addamount`);
    console.log("Payload:", clientData);

    try {
      const response = await fetch(`${API_URL}/collection/addamount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      const text = await response.text(); // Read raw response first

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${text || "Unknown error"}`);
      }

      // Try to parse JSON, but don't fail if empty
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("Response not JSON, but status OK:", text);
      }

      console.log("Success:", data);
      alert("Amount added successfully");
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Request Failed:", error.message);
      alert(`Request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  
  const showConfirm = (clientId, clientName) => {
    setClientIdToDelete(clientId);
    setClientNameToDelete(clientName);
    setShowConfirmModal(true);
  };

  return (
    <Modal show onHide={onClose} centered backdrop="static">
      <Modal.Header
        closeButton
        className="border-0 pb-2"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Modal.Title className="w-100 text-center">
          <h5
            className="mb-0 fw-bold d-inline"
            style={{ color: "#1e40af", fontSize: "1.25rem" }}
          >
            {employeename} {employeeid}
          </h5>{" "}
          <span
            className="badge rounded-pill ms-2 px-3 py-1"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "600",
            }}
          >
            PAID
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-4" style={{ backgroundColor: "#ffffff" }}>
        <p className="mb-2 fw-semibold" style={{ color: "#1e293b" }}>
          Enter the Amount
        </p>
        <div className="position-relative">
          <span
            className="position-absolute top-50 start-0 translate-middle-y ps-3"
            style={{ color: "#64748b", fontWeight: "600", fontSize: "1.1rem" }}
          >
            KWD
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-control ps-5 py-3"
            style={{
              border: "2px solid #bfdbfe",
              borderRadius: "12px",
              fontSize: "1.1rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              outline: "none",
              appearance: "textfield",
              MozAppearance: "textfield",
            }}
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={isLoading}
            onWheel={(e) => e.target.blur()}
          />
        </div>
        <small className="text-muted d-block mt-1 ms-1">
          Enter amount in KUWAIT DINAR
        </small>
      </Modal.Body>

      <Modal.Footer
        className="border-0 pt-2 justify-content-center"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Button
          variant="light"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 fw-medium"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            color: "#475569",
          }}
        >
          Close
        </Button>

        <Button
          variant="primary"
          onClick={updatetheamount}
          disabled={isLoading || !amount}
          className="px-4 py-2 fw-medium shadow-sm"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            border: "none",
            borderRadius: "10px",
          }}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Adding…
            </>
          ) : (
            "Pay"
          )}
        </Button>
      </Modal.Footer>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          border: none;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);
          overflow: hidden;
        }
        input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25) !important;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </Modal>
  );
}