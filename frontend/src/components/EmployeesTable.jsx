import React, { useState } from "react";

function EmployeesTable({
  employees = [],
  deactivateUser,
  handleEmployeeEdit,
}) {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Phonenumber</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.first_name || "None"}</td>
              <td>{employee.last_name || "None"}</td>
              <td>{employee.profile?.phone || "00"}</td>
              <td>{employee.profile?.role || "None"}</td>
              <td>{employee.is_active === true ? "Active" : "Deactivated"}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleEmployeeEdit(employee)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deactivateUser(employee.id)}
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default EmployeesTable;
