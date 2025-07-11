import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

function EditRoleModel({ closeModel, role }) {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [permissions, setPermissions] = useState([]);

  // ✅ Extract permission IDs from role.permissions
  const [editRole, setEditRole] = useState({
    name: role.name || "",
    permissions: role.permissions?.map((perm) => perm.id) || [],
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/get-permissions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    })
      .then((res) => {
        if (res.status === 401 || res.statusText === "Unauthorized") {
          logoutUser();
        }
        return res.json();
      })
      .then((data) => {
        setPermissions(data);
      });
  }, [authTokens, logoutUser]);

  const handleNameChange = (e) => {
    setEditRole((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePermissionChange = (permId) => {
    setEditRole((prev) => {
      const updatedPermissions = prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: updatedPermissions };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const payload = {
      name: editRole.name,
      permission_ids: editRole.permissions,
    };

    fetch(`http://127.0.0.1:8000/api/edit-role/${role.id}`, {
      method: "PUT", // or PATCH depending on your view
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.status === 401 || res.statusText === "Unauthorized") {
          logoutUser();
        } else if (!res.ok) {
          throw new Error("Failed to update role");
        }
        return res.json();
      })
      .then((data) => {
        alert("Role updated successfully");
        closeModel();
      })
      .catch((error) => {
        console.error("Error updating role:", error);
        alert("Error updating role");
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Role</h2>
        <button onClick={closeModel}>Close</button>
        <hr />
        <form onSubmit={handleSave}>
          <label htmlFor="role-name">Role Name</label>
          <input
            type="text"
            id="role-name"
            value={editRole.name}
            onChange={handleNameChange}
          />
          <div className="permissions-container">
            {permissions.map((p) => (
              <div key={p.id} className="permission-item">
                <input
                  type="checkbox"
                  id={`perm-${p.id}`}
                  checked={editRole.permissions.includes(p.id)}
                  onChange={() => handlePermissionChange(p.id)}
                />
                <label htmlFor={`perm-${p.id}`}>{p.name}</label>
              </div>
            ))}
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default EditRoleModel;
