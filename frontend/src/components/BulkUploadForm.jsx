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
    }

    if (file.type !== "text/csv") {
      alert("Only CSV files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:8000/api/bulk-upload", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + String(authTokens.access),
      },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          alert(`Error: ${errorData.message || "Upload failed"}`);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          alert(`Success: ${data.message || "Products uploaded successfully"}`);
          setFile(null);
          getProducts();
        }
      })
      .catch((err) => {
        console.error("Upload error:", err);
        alert("An unexpected error occurred.");
      });
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
