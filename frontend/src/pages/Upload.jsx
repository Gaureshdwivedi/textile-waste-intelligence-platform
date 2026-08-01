import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [textileName, setTextileName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleImage = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("textile_name", textileName);
      formData.append("description", description);

      const token = localStorage.getItem("access_token");
      console.log("TOKEN:", token);
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
      });
      await api.post("/textiles/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ Upload Successful!");
      setTimeout(() => {
          navigate("/history");
      }, 1500);
      setFile(null);
      setPreview("");
      setTextileName("");
      setDescription("");

    } catch (err) {
      console.error(err);
      setMessage("❌ Upload Failed");
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidebar />

        <Container
          maxWidth="md"
          sx={{
            ml: "280px",
            mt: "100px",
          }}
        >
          <Card sx={{ p: 2 }}>
            <CardContent>

              <Typography variant="h4" fontWeight="bold">
                Upload Textile
              </Typography>

              <Typography color="gray" mb={3}>
                Upload a textile image for AI analysis
              </Typography>

              {message && (
                <Alert sx={{ mb: 3 }}>
                  {message}
                </Alert>
              )}

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Choose Image

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                />
              </Button>

              {preview && (
                <Box mt={3}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      width: 300,
                      borderRadius: 12,
                    }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                label="Textile Name"
                sx={{ mt: 3 }}
                value={textileName}
                onChange={(e) =>
                  setTextileName(e.target.value)
                }
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                sx={{ mt: 3 }}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <Button
                fullWidth
                sx={{ mt: 4 }}
                size="large"
                variant="contained"
                onClick={handleUpload}
              >
                Upload Textile
              </Button>

            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}