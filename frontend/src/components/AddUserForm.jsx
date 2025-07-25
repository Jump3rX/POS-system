import React from "react";
import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";

function AddUserForm({ handleAddNewUser }) {
  let { authTokens, logoutUser } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [user, setUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    password: "",
  });

  function getRoles() {
    fetch("http://127.0.0.1:8000/api/manage-roles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else if (res.statusText === "Unauthorized") {
          logoutUser();
        }
      })
      .then((data) => {
        setRoles(data);
      });
  }

  useEffect(() => {
    getRoles();
  }, []);
  function handleAddUser(e) {
    e.preventDefault();

    if (
      user.username &&
      user.first_name &&
      user.last_name &&
      user.phone &&
      user.role &&
      user.password
    ) {
      console.log(user);
      fetch("http://127.0.0.1:8000/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(user),
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
        .then((newUserData) => {
          handleAddNewUser(newUserData);

          setUser({
            username: "",
            first_name: "",
            last_name: "",
            phone: "",
            role: "",
            password: "",
          });
        });
    } else {
      alert("Check value again!");
    }
  }
  return (
    <div className="add-employee-form-container">
      <h2>Add New User</h2>
      <form action="" onSubmit={handleAddUser} className="create-user-form">
        <input
          type="text"
          placeholder="Username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          className="create-user-form-input"
        />
        <input
          type="text"
          placeholder="First Name"
          value={user.first_name}
          onChange={(e) => setUser({ ...user, first_name: e.target.value })}
          className="create-user-form-input"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={user.last_name}
          onChange={(e) => setUser({ ...user, last_name: e.target.value })}
          className="create-user-form-input"
        />
        <input
          type="number"
          placeholder="Phonenumber"
          maxLength={13}
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          className="create-user-form-input"
        />

        <select
          name="role"
          id="employee-role"
          className="create-user-form-input"
          onChange={(e) => setUser({ ...user, role: parseInt(e.target.value) })}
          defaultValue="placeholder"
          value={user.role}
        >
          <option value="" disabled>
            Select employee role
          </option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <input
          type="password"
          name=""
          id=""
          placeholder="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="create-user-form-input"
        />
        <button type="submit" className="save-btn">
          Create
        </button>
      </form>
    </div>
  );
}

export default AddUserForm;
