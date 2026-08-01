import { useEffect, useState } from "react";
import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
} from "@mui/material";

export default function History() {
  const [textiles, setTextiles] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get("/textiles/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTextiles(response.data.data);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this textile?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("access_token");

    await api.delete(`/textiles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchHistory();

  } catch (error) {
    console.error(error);
    alert("Delete Failed");
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
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            mb={4}
          >
            Upload History
          </Typography>

          <Grid container spacing={3}>

            {textiles.map((item) => (

              <Grid item xs={12} md={6} lg={4} key={item.id}>

                <Card>

                  <img
                    src={`http://127.0.0.1:8000/${item.image_path}`}
                    alt={item.textile_name}
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                    }}
                  />

                  <CardContent>

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      {item.textile_name}
                    </Typography>

                    <Typography
                      color="gray"
                      mt={1}
                    >
                      {item.description}
                    </Typography>

                    <Typography
                      mt={2}
                      fontSize={13}
                    >
                      Uploaded:
                      {" "}
                      {new Date(
                        item.uploaded_at
                      ).toLocaleString()}
                    </Typography>

                    <Button
                      color="error"
                      varient="contained"
                      sx={{ mt: 2 }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>

                  </CardContent>

                </Card>

              </Grid>

            ))}

          </Grid>

        </Box>
      </Box>
    </>
  );
}