import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
      loadHistory();
      loadUser();
  }, []);

  const loadHistory = async () => {
      try {
          const token = localStorage.getItem("access_token");

          const response = await api.get("/textiles/history", {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });

          setHistory(response.data.data);

      } catch (error) {
          console.error(error);
       }
  };

  const loadUser = async () => {
    try {
        const token = localStorage.getItem("access_token");

        const response = await api.get("/users/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setUser(response.data);

    } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            alert("Session expired. Please login again.");
            window.location.href = "/";
        }
    }
};
  return (
    <>
      <Navbar />

      <Box sx={{ display: "flex" }}>
        <Sidebar />

        <Box
           sx={{
              flexGrow: 1,
              ml: "260px",
              mt: "80px",
              p: 4,
              bgcolor: "#0f172a",
              minHeight: "100vh",
            }}
        >
          <Box mb={4}>

          <Typography
          variant="h4"
          fontWeight="bold"
          >
          Welcome {user?.full_name || "User"} 👋
          </Typography>

          <Typography color="gray">
          AI Powered Textile Waste Intelligence Platform
          </Typography>

          </Box>

          <Grid container spacing={3}>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Uploads"
                value={history.length}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Predictions"
                value="0"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Recyclable"
                value="0"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <StatCard
                title="Accuracy"
                value="--%"
              />
            </Grid>

          </Grid>

          <Box
            sx={{
              mt: 5,
              background: "#1e293b",
              p: 3,
              borderRadius: 4,

            }}
          >
            <Typography
              variant="h6"
              mb={2}
              fontWeight="bold"
            >
              Recent Uploads
            </Typography>  
            {history.length === 0 ? (
                <Typography color="gray">
                    No uploads yet.
                </Typography>
            ) : (
                history.slice(0, 3).map((item) => (
                    <Typography
                        key={item.id}
                        sx={{ py: 1 }}
                    >
                        🧵 {item.textile_name}
                    </Typography>
            ))

            )}
         </Box>

        </Box>
      </Box>
    </>
  );
}