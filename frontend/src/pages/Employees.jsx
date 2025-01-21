import React from "react";
import { useState, useEffect } from "react";
import EmployeesTable from "../components/EmployeesTable";
import EmployeeSummaryCards from "../components/EmployeeSummaryCards";
import AddUserForm from "../components/AddUserForm";
import EditEmployeeForm from "../components/EditEmployeeForm";
import { useAsyncError } from "react-router-dom";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
      });
  }, []);
  let empCount = employees.length;
  function handleAddNewUser(newUser) {
    setEmployees((e) => [...e, newUser]);
  }
  function deactivateUser(id) {
    console.log(id);
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      fetch(`http://127.0.0.1:8000/api/deactivate-user/${id}`, {
        method: "POST",
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Error!");
        }
        setEmployees((e) => e.filter((employee) => employee.id !== id));
      });
    }
  }

  function handleEmployeeEdit(employee) {
    setEmployeeToEdit(employee);
    setIsEditModalOpen(true);
  }
  function handleSaveEmployee(updatedEmployee) {
    setEmployees((e) =>
      e.map((employee) =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      )
    );
    console.log(employees);
    setIsEditModalOpen(false);
  }
  return (
    <>
      <div className="employees-list-main-container">
        <div className="employees-table-container">
          <h1>Employees</h1>
          <EmployeesTable
            employees={employees}
            deactivateUser={deactivateUser}
            handleEmployeeEdit={handleEmployeeEdit}
          />
          {isEditModalOpen && (
            <EditEmployeeForm
              employee={employeeToEdit}
              closeModal={() => setIsEditModalOpen(false)}
              handleSaveEmployee={handleSaveEmployee}
            />
          )}
        </div>
        <div className="employee-form-card-container">
          <EmployeeSummaryCards empCount={empCount} />
          <AddUserForm handleAddNewUser={handleAddNewUser} />
        </div>
      </div>
    </>
  );
}

export default Employees;
