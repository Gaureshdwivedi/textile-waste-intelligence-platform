import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "access_token",
      response.data.access_token
    );

    alert("Login Successful!");

    navigate("/dashboard");
  } catch (error) {
    alert("Invalid Email or Password");
    console.error(error);
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
        <Card sx={{ width: "100%", borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              fontWeight="bold"
            >
              🧵 TextileAI
            </Typography>

            <Typography
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              AI Powered Textile Waste Intelligence Platform
            </Typography>

            <Typography align="center" sx={{ mt: 2 }}>
                Don't have an account?
            </Typography>

            <Button
                onClick={() => navigate("/register")}
            >
                Register
            </Button>

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={handleLogin}
            >
                Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}