import React from "react";
import { useState } from "react";

function AddUserForm({ handleAddNewUser }) {
  const [user, setUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    password: "",
  });
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
      fetch("http://127.0.0.1:8000/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
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
        />
        <input
          type="text"
          placeholder="First Name"
          value={user.first_name}
          onChange={(e) => setUser({ ...user, first_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={user.last_name}
          onChange={(e) => setUser({ ...user, last_name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Phonenumber"
          maxLength={13}
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
        />
        <input
          type="role"
          placeholder="Role"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
        />
        <input
          type="password"
          name=""
          id=""
          placeholder="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default AddUserForm;
