import { useState, useContext } from "react";
import React from "react";
import stop from "../assets/stop.png";
import AuthContext from "../context/AuthContext";
function AdminConfirmModal({ handleCloseAdminConfirm, handleSetConfirm }) {
  const { authTokens } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/admin-confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || "Authorization failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        handleSetConfirm(true); // Success: Admin authorized
        handleCloseAdminConfirm();
      })
      .catch((error) => {
        console.log(error.message); // Display error in modal
        handleSetConfirm(false); // Ensure false on failure
      });
  }
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="admin-confirm-modal-content">
          <h1 className="wait-heading">HOLD!!</h1>
          <div className="stop-icon-container">
            <img src={stop} alt="stop" className="stop-icon" />
          </div>
        </div>

        <h3>Admin Authorization Required!</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Admin Username</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="admin-username-confirm-input"
          />
          <label htmlFor="admin-password">Admin Password</label>
          <input
            type="password"
            name="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-password-confirm-input"
          />
          <button type="submit" className="confirm-btn">
            Confirm
          </button>
          <button
            className="cancel-btn"
            onClick={() => handleCloseAdminConfirm()}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminConfirmModal;
