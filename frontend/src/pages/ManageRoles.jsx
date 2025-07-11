import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import EditRoleModel from "../components/EditRoleModel";
import edt from "../assets/edit.png";
import remove from "../assets/remove.png";

function ManageRoles() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState({});

  const handlePermissionChange = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSetNewRole = (e) => {
    e.preventDefault();
    const newRole = {
      name: roleName,
      permission_ids: selectedPermissions,
    };
    handleCreateRole(newRole);
  };

  const handleCreateRole = (newRole) => {
    fetch("http://127.0.0.1:8000/api/manage-roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(newRole),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Role created successfully!");
        fetchRoles(); // Refresh the list after creation
        setRoleName(""); // Clear the input field
        setSelectedPermissions([]); // Clear selected permissions
      });
  };

  const fetchRoles = () => {
    fetch("http://127.0.0.1:8000/api/manage-roles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        if (res.statusText === "Unauthorized") logoutUser();
      })
      .then((data) => {
        setRoles(data);
        setFilteredRoles(data); // Initial filtered set
      });
  };

  const fetchPermissions = () => {
    fetch("http://127.0.0.1:8000/api/get-permissions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        if (res.statusText === "Unauthorized") logoutUser();
      })
      .then((data) => {
        setPermissions(data);
      });
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    const filtered = roles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchQuery, roles]);

  const handleEditRole = (role) => {
    setOpenModel(true);
    setRoleToEdit(role);
  };

  const handleDeleteRole = (role) => {
    if (
      window.confirm(`Are you sure you want to delete the role: ${role.name}?`)
    ) {
      fetch(`http://127.0.0.1:8000/api/delete-role/${role.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
      })
        .then((res) => {
          if (res.status === 401 || res.statusText === "Unauthorized") {
            logoutUser();
          } else if (!res.ok) {
            throw new Error("Failed to delete role");
          }
          return res.json();
        })
        .then((data) => {
          alert(data.message);
          fetchRoles();
          fetchPermissions();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while deleting the role.");
        });
    }
  };

  const closeModel = () => {
    setOpenModel(false);
  };

  return (
    <div className="role-container">
      {openModel && <EditRoleModel closeModel={closeModel} role={roleToEdit} />}

      <div className="role-table-container">
        <h2>Current Roles</h2>

        <input
          type="text"
          placeholder="Search by role name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginBottom: "10px",
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "250px",
          }}
        />

        <table>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>N.O Permissions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role.id}>
                <td>{role.name || "None"}</td>
                <td>{role.permissions.length || "00"}</td>
                <td>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="delete-btn"
                  >
                    <img src={remove} alt="" className="edit-btn-img" />
                  </button>
                  <button
                    onClick={() => handleEditRole(role)}
                    className="edit-btn"
                  >
                    <img src={edt} alt="" className="edit-btn-img" />
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
            value={roleName}
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
