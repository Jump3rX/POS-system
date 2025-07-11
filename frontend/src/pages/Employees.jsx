import React, { useState, useEffect, useContext } from "react";
import EmployeesTable from "../components/EmployeesTable";
import EmployeeSummaryCards from "../components/EmployeeSummaryCards";
import AddUserForm from "../components/AddUserForm";
import EditEmployeeForm from "../components/EditEmployeeForm";
import AuthContext from "../context/AuthContext";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  let { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
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
      .then((data) => {
        setEmployees(data);
      });
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name} ${emp.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  let empCount = employees.length;

  function handleAddNewUser(newUser) {
    setEmployees((e) => [...e, newUser]);
  }

  function deactivateUser(id) {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      fetch(`http://127.0.0.1:8000/api/deactivate-user/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + String(authTokens.access),
        },
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update!");
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        } else {
          setEmployees((e) => e.filter((employee) => employee.id !== id));
        }
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
    setIsEditModalOpen(false);
  }

  return (
    <>
      <div className="employees-list-main-container">
        <div className="employees-table-container">
          <h1>Employees</h1>

          {/* 🔍 Search input */}
          <input
            type="text"
            placeholder="Search employee by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px", marginBottom: "15px", width: "100%" }}
          />

          <EmployeesTable
            employees={filteredEmployees}
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
