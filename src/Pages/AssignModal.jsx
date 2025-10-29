import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function AssignModal({
  selectedRows,
  employees,
  employeeId,
  setEmployeeId,
  onClose,
  authFetch,
  dispatch,
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "-");

  const assign = async () => {
    if (!employeeId) return alert("Select an employee");
    const payload = selectedRows.map((c) => ({
      client_id: c.client_id,
      user_id: Number(employeeId),
      assigned_date: currentDate,
      sent: true,
    }));

    try {
      await authFetch(`${API_URL}/client_IDupdateds`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res = await authFetch(`${API_URL}/acc_list`);
      dispatch({ type: "clients/setUsers", payload: await res.json() });
      onClose();
      alert("Assigned successfully");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Employee (Bulk)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>{selectedRows.length}</strong> client(s) selected
        </p>
        <select
          className="form-select"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="" disabled>
            SELECT EMPLOYEE
          </option>
          {employees
            .filter((e) => e.role === "Collection Agent")
            .map((e) => (
              <option key={e.user_id} value={e.user_id}>
                {e.username.toUpperCase()}
              </option>
            ))}
        </select>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={assign}>
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
}