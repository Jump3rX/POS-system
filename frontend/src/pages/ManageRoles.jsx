import React from "react";
import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import EditRoleModel from "../components/EditRoleModel";
import edt from "../assets/edit.png";
import remove from "../assets/remove.png";

function ManageRoles() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState({});

  const handlePermissionChange = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  function handleSetNewRole(e) {
    e.preventDefault();
    const newRole = {
      name: roleName,
      permission_ids: selectedPermissions,
    };
    console.log(newRole);
    handleCreateRole(newRole);
  }

  function handleCreateRole(newRole) {
    fetch("http://127.0.0.1:8000/api/manage-roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(newRole),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Role created successfuly!");
      });
  }
  useEffect(() => {
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
        //console.log(data);
        setRoles(data);
      });

    fetch("http://127.0.0.1:8000/api/get-permissions", {
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
        //console.log(data);
        setPermissions(data);
      });
  }, []);

  function handleEditRole(role) {
    console.log(role);
    setOpenModel(true);
    setRoleToEdit(role);
  }
  function handleDeleteRole(role) {
    console.log(role);
  }

  function closeModel() {
    setOpenModel(false);
  }
  return (
    <div className="role-container">
      {openModel && <EditRoleModel closeModel={closeModel} role={roleToEdit} />}
      <div className="role-table-container">
        <h2>Current Roles</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Role Name</th>
              <th>N.O Permissions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.id || "None"}</td>
                <td>{role.name || "None"}</td>
                <td>{role.permissions.length || "00"}</td>
                <td>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="delete-btn"
                  >
                    <img src={edt} alt="" className="edit-btn-img" />
                  </button>
                  <button
                    onClick={() => handleEditRole(role)}
                    className="edit-btn"
                  >
                    <img src={remove} alt="" className="edit-btn-img" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="role-form-container">
        <h2 className="role-form-heading">Create New Role</h2>
        <form className="role-form" onSubmit={handleSetNewRole}>
          <label className="role-label">Role Name:</label>
          <input
            type="text"
            className="role-input-text"
            value={roleName.name}
            onChange={(e) => setRoleName(e.target.value)}
            required
          />

          <label>Select Permissions:</label>
          <div className="permissions-list">
            {permissions.map((perm) => (
              <div key={perm.id} className="permission-item">
                <input
                  type="checkbox"
                  id={perm.id}
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => handlePermissionChange(perm.id)}
                />
                <label htmlFor={perm.id}>{perm.name}</label>
              </div>
            ))}
          </div>

          <button type="submit" className="submit-btn">
            Create Role
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManageRoles;
