import React, { useState } from "react";
import edt from "../assets/edit.png";
import remove from "../assets/remove.png";

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
            {/* <th>Status</th> */}
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
              {/* <td>{employee.is_active === true ? "Active" : "Deactivated"}</td> */}
              <td>
                <button
                  type="button"
                  onClick={() => handleEmployeeEdit(employee)}
                  className="edit-btn"
                >
                  <img src={edt} alt="" className="edit-btn-img" />
                </button>
                <button
                  type="button"
                  onClick={() => deactivateUser(employee.id)}
                  className="deactivate-btn"
                >
                  <img src={remove} alt="" className="deactivate-btn-img" />
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
