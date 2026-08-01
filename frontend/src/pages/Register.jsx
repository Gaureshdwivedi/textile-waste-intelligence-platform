import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setMessage("");
    setError("");
    if (!fullName || !email || !password) {
        setError("Please fill in all fields.");
        return;
    }

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email: email,
        password: password,
      });

      setMessage("✅ Registration Successful!");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration Failed");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>

            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              gutterBottom
            >
              🧵 TextileAI
            </Typography>

            <Typography
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Create Your Account
            </Typography>

            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Full Name"
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <TextField
              fullWidth
              required
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              required
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              onClick={handleRegister}
            >
              Register
            </Button>

            <Typography
              align="center"
              sx={{ mt: 3 }}
            >
              Already have an account?
            </Typography>

            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate("/")}
            >
              Login
            </Button>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}