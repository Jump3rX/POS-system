import React from "react";

function EmployeeSummaryCards({ empCount }) {
  return (
    <div className="employee-card">
      <div className="employee-card-body">
        <h2>Summary</h2>
        <p>
          Total Employees: <span>{empCount}</span>
        </p>
        <p>
          Active: <span>{empCount}</span>
        </p>
        <p>
          Inactive: <span>2</span>
        </p>
      </div>
    </div>
  );
}

export default EmployeeSummaryCards;
