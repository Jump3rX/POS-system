import React from "react";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
function BulkUploadForm({ getProducts }) {
  const { authTokens } = useContext(AuthContext);
  const [file, setFile] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select file CSV to upload");
      return;
    } else {
      const formData = new FormData();
      formData.append("file", file);
      fetch("http://127.0.0.1:8000/api/bulk-upload", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + String(authTokens.access),
        },
        body: formData,
      })
        .then((res) => (!res.ok ? alert(`Error: ${res.message}`) : res.json()))
        .then((data) => {
          alert(`Success: ${data.message}`);
          setFile(null);
          getProducts();
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <div>
      <h3>Bulk Product Upload</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          name="file"
          className="form-input"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default BulkUploadForm;
