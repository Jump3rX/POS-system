import React from "react";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function EditEmployeeForm({ employee, handleSaveEmployee, closeModal }) {
  let { authTokens, logoutUser } = useContext(AuthContext);
  const [newData, setNewData] = useState({
    username: employee.username,
    first_name: employee.first_name,
    last_name: employee.last_name,
    phone: employee.profile.phone,
    role: employee.profile.role,
  });

  function updateEmployee(e) {
    e.preventDefault();
    fetch(`http://127.0.0.1:8000/api/edit-employee/${employee.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(newData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update!");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          return res.json();
        }
      })
      .then((data) => handleSaveEmployee(data));
  }
  return (
    <>
      <div className="employee-edit-form-container">
        <h2>Edit Employee</h2>
        <form action="" onSubmit={updateEmployee}>
          <input
            type="text"
            placeholder="Username"
            value={employee.username}
            onChange={(e) =>
              setNewData({ ...newData, username: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Firstname"
            value={newData.first_name}
            onChange={(e) =>
              setNewData({ ...newData, first_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Lastname"
            value={newData.last_name}
            onChange={(e) =>
              setNewData({ ...newData, last_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Phone"
            value={newData.phone}
            onChange={(e) => setNewData({ ...newData, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Role"
            value={newData.role}
            onChange={(e) => setNewData({ ...newData, role: e.target.value })}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
        </form>
      </div>
    </>
  );
}

export default EditEmployeeForm;
