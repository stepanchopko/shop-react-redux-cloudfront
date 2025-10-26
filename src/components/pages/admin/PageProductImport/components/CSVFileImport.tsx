import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | undefined>();
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      setError("");
      setSuccess(false);
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setError("");
    setSuccess(false);
  };

  const uploadFile = async () => {
    if (!file) return;

    setError("");
    setSuccess(false);

    try {
      const authToken = localStorage.getItem("authorization_token");

      if (!authToken) {
        throw new Error("No authorization token.");
      }

      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: {
          Authorization: `Basic ${authToken}`,
        },
      });

      const uploadResult = await fetch(response.data, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "text/csv",
        },
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.status}`);
      }

      setSuccess(true);
      setFile(undefined);
    } catch (err: any) {
      console.error("Upload error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError("Unauthorized: No authorization token.");
        } else if (err.response.status === 403) {
          setError("Forbidden: Invalid credentials.");
        } else {
          setError("Server error");
        }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          File uploaded
        </Alert>
      )}

      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
