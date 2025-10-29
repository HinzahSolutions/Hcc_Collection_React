// src/modals/ExportModal.jsx
import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { format } from "date-fns";

const BANK_LABELS = {
  bank1: "IOB ONLY",
  bank2: "IOB OTHERS",
  bank3: "IDBANK OTHERS",
};

export default function ExportModal({ selectedRows, onClose }) {
  const [selectedBank, setSelectedBank] = useState("");

  // ── Find rows that are missing required fields
  const missing = selectedRows.filter(
    (c) => !c.accno?.trim() || !c.ifsc_code?.trim()
  );

  // ── Build CSV rows for the selected bank
  const buildRows = () => {
    const valid = selectedRows.filter(
      (c) => c.accno?.trim() && c.ifsc_code?.trim()
    );

    return valid.map((c) => {
      const amount = ` ${parseFloat(c.amount || 0).toFixed(2)}`;

      // ── bank1 – IOB ONLY
      if (selectedBank === "bank1") {
        return {
          "ACCOUNT NUMBER": c.accno,
          " AMOUNT": amount,
          " NARRATION": ` ${c.narration || ""}`,
        };
      }

      // ── bank2 – IOB OTHERS
      if (selectedBank === "bank2") {
        return {
          "IFSC CODE": c.ifsc_code,
          " ACCOUNT TYPE": ` ${c.accoun_type || ""}`,
          " ACCOUNT NUMBER": ` ${c.accno}`,
          " BENEFICIARY NAME": ` ${
            c.name_of_the_beneficiary?.toUpperCase() ||
            "UNKNOWN BENEFICIARY NAME"
          }`,
          " BENEFICIARY ADDRESS": ` ${
            c.address_of_the_beneficiary?.toUpperCase() ||
            "UNKNOWN BENEFICIARY ADDRESS"
          }`,
          " SENDER INFORMATION": ` ${
            c.sender_information?.toUpperCase() ||
            "UNKNOWN SENDER INFORMATION"
          }`,
          " AMOUNT": amount,
        };
      }

      // ── bank3 – IDBANK OTHERS
      return {
        CUSTOMER_NAME: `${
          c.name_of_the_beneficiary?.toUpperCase() ||
          "UNKNOWN BENEFICIARY NAME"
        }`,
        CITY: ` ${c.client_city?.toUpperCase() || "UNKNOWN CITY NAME"}`,
        ACCOUNT_NUMBER: ` ${c.accno}`,
        AMOUNT: amount,
        DESCRIPTION: ` ${c.description?.toUpperCase() || "UNKNOWN NAME"}`,
        IFSC_CODE: c.ifsc_code,
        BANK_NAME: ` ${c.bank_name?.toUpperCase() || "UNKNOWN NAME"}`,
        BENEFICIARY_EMAIL_ID: ` ${
          c.beneficiary_email_id?.toLowerCase() || "UNKNOWN EMAIL ID"
        }`,
      };
    });
  };

  // ── Export handler
  const confirmExport = () => {
    if (!selectedBank) {
      alert("Please select a bank before exporting.");
      return;
    }

    if (missing.length > 0) {
      alert(
        "Some clients have missing account numbers or IFSC codes. Please check before exporting."
      );
      return;
    }

    if (selectedRows.length === 0) {
      alert("No clients selected.");
      return;
    }

    const rows = buildRows();
    if (rows.length === 0) {
      alert("No valid clients to export.");
      return;
    }

    const headers = [...new Set(rows.flatMap(Object.keys))];
    const csv = [
      headers,
      ...rows.map((r) => headers.map((h) => r[h] ?? "")),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_clients_${selectedBank}_${format(
      new Date(),
      "dd-MM-yyyy"
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onClose();
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Bank for Export</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ── Warning for missing data */}
        {missing.length > 0 && (
          <Alert variant="warning">
            <strong>Missing Account / IFSC:</strong>
            <ul className="mb-0 mt-2">
              {missing.map((c, i) => (
                <li key={i}>{c.client_name || "Unnamed client"}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* ── Bank selection buttons */}
        <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
          {Object.entries(BANK_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedBank === key ? "primary" : "outline-primary"}
              onClick={() => setSelectedBank(key)}
              className="flex-fill"
            >
              {label}
            </Button>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={confirmExport}
          disabled={!selectedBank || missing.length > 0}
        >
          Export CSV
        </Button>
      </Modal.Footer>
    </Modal>
  );
}