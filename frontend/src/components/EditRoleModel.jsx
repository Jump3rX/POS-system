import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

function EditRoleModel({ closeModel, role }) {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [permissions, setPermissions] = useState([]);
  const [newPermissions, setNewPermissions] = useState([]);

  const [editRole, setEditRole] = useState({
    name: role.name,
    permissions: role.permissions,
  });

  useEffect(() => {
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

  function handleNameChange(e) {
    setEditRole((prev) => ({ ...prev, name: e.target.value }));
  }

  function handlePermissionChange(permissionId) {
    setEditRole((prev) => {
      const updatedPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId) // Remove if already present
        : [...prev.permissions, permissionId]; // Add if not present
      return { ...prev, permissions: updatedPermissions };
    });
  }
  console.log(editRole);
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Role</h2>
        <button onClick={() => closeModel()}>Close</button>
        <hr />
        <form>
          <label htmlFor="role-name">Role Name</label>
          <input
            type="text"
            value={editRole.name}
            onChange={handleNameChange}
          />
          <div className="permissions-container">
            {permissions.map((p) => (
              <div key={p.id} className="permission-item">
                <input
                  type="checkbox"
                  id={p.id}
                  checked={editRole.permissions.includes(p.id)}
                  onChange={() => handlePermissionChange(p.id)}
                />
                <label htmlFor={p.id}>{p.name}</label>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRoleModel;
