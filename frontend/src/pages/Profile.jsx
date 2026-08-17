import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";

import { useTheme } from "@mui/material/styles";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Profile() {
  const theme = useTheme();

  // =========================================================
  // STATE
  // =========================================================

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // =========================================================
  // LOAD PROFILE + HISTORY
  // =========================================================

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;

      setUser(userData);
      setFullName(userData?.full_name || "");
      setEmail(userData?.email || "");
    } catch (error) {
      console.error("Profile loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    }
  };

  // =========================================================
  // GET TEXTILE HISTORY
  // =========================================================

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get("/textiles/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(response.data?.data || []);
    } catch (error) {
      console.error("History loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalUploads = history.length;

  const predictions = history.filter(
    (item) => item.prediction || item.category
  ).length;

  const recyclableCount = history.filter((item) => {
    const value = String(item.recyclable || "").toLowerCase();

    return (
      value === "high" ||
      value === "true" ||
      value === "yes" ||
      value.includes("high")
    );
  }).length;

  const confidenceValues = history
    .map((item) => Number(item.confidence))
    .filter((value) => !Number.isNaN(value) && value > 0);

  const averageConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum, value) => sum + value, 0) /
        confidenceValues.length
      : 0;

  // =========================================================
  // EDIT PROFILE
  // =========================================================

  const handleEdit = () => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
    setEditing(true);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancel = () => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
    setEditing(false);
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("access_token");

      /*
       * This assumes your backend supports:
       *
       * PUT /users/me
       *
       * with:
       * {
       *    full_name: "..."
       * }
       *
       * If your backend currently does not have this endpoint,
       * the UI will still work, but you will need to add the
       * corresponding backend route.
       */

      const response = await api.put(
        "/users/me",
        {
          full_name: fullName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);

      setFullName(response.data?.full_name || fullName);
      setEmail(response.data?.email || email);

      setEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);

      /*
       * If PUT /users/me is not implemented yet,
       * don't crash the page.
       */
      alert(
        error.response?.data?.detail ||
          "Unable to update profile. Please check your backend API."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // INITIAL
  // =========================================================

  const initial =
    user?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "G";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: theme.palette.background.default,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <Box
        sx={{
          ml: {
            xs: 0,
            md: "295px",
          },

          pt: {
            xs: 10,
            md: "100px",
          },

          px: {
            xs: 2,
            sm: 3,
            md: 5,
            lg: 7,
          },

          pb: 6,

          width: {
            xs: "100%",
            md: "calc(100% - 295px)",
          },

          boxSizing: "border-box",

          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* ===================================================
            CONTENT WRAPPER
        ==================================================== */}

        <Box
          sx={{
            width: "100%",
            maxWidth: "1250px",
          }}
        >
          {/* =================================================
              PAGE TITLE
          ================================================== */}

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: {
                  xs: "2rem",
                  md: "2.6rem",
                },
                color: theme.palette.text.primary,
              }}
            >
              My Profile
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: "1.05rem",
                color: theme.palette.text.secondary,
              }}
            >
              Manage your account and view your textile analysis
              statistics.
            </Typography>
          </Box>

          {/* =================================================
              PROFILE HERO
          ================================================== */}

          <Card
            sx={{
              borderRadius: 5,
              overflow: "visible",
              boxShadow:
                "0 15px 45px rgba(15, 23, 42, 0.10)",
              mb: 3,
              position: "relative",
            }}
          >
            {/* Gradient Banner */}

            <Box
              sx={{
                height: {
                  xs: 140,
                  md: 165,
                },

                borderRadius: "20px 20px 0 0",

                background:
                  "linear-gradient(110deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",

                position: "relative",

                overflow: "hidden",

                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: "500px",
                  height: "200px",
                  borderRadius: "50%",
                  background:
                    "rgba(255,255,255,0.08)",
                  right: "-100px",
                  top: "-100px",
                },
              }}
            />

            {/* Profile Content */}

            <Box
              sx={{
                position: "relative",
                px: {
                  xs: 3,
                  md: 5,
                },

                pb: 4,
                pt: 0,
              }}
            >
              {/* Avatar */}

              <Avatar
                sx={{
                  width: {
                    xs: 92,
                    md: 112,
                  },

                  height: {
                    xs: 92,
                    md: 112,
                  },

                  fontSize: {
                    xs: 36,
                    md: 46,
                  },

                  fontWeight: 700,

                  bgcolor: "#2563eb",

                  border:
                    "6px solid white",

                  position: "absolute",

                  top: {
                    xs: -46,
                    md: -58,
                  },

                  left: {
                    xs: 28,
                    md: 48,
                  },

                  boxShadow:
                    "0 8px 25px rgba(0,0,0,.18)",
                }}
              >
                {initial}
              </Avatar>

              {/* Profile Information */}

              <Box
                sx={{
                  pt: {
                    xs: 7,
                    md: 8,
                  },

                  display: "flex",

                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },

                  justifyContent: "space-between",

                  alignItems: {
                    xs: "flex-start",
                    md: "center",
                  },

                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: {
                        xs: "1.5rem",
                        md: "1.8rem",
                      },
                    }}
                  >
                    {user?.full_name || "Gauresh Dwivedi"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <EmailIcon
                      sx={{
                        fontSize: 20,
                        color: "text.secondary",
                      }}
                    />

                    <Typography color="text.secondary">
                      {user?.email || "No email available"}
                    </Typography>
                  </Box>

                  <Chip
                    label="Active Account"
                    size="small"
                    sx={{
                      mt: 1.5,
                      fontWeight: 700,
                      bgcolor: "#dcfce7",
                      color: "#15803d",
                    }}
                  />
                </Box>

                {/* Edit Button */}

                {!editing && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Card>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <Grid
            container
            spacing={2.5}
            sx={{ mb: 3 }}
          >
            {/* Uploads */}

            <Grid item xs={12} md={4}>
              <StatCard
                icon={
                  <CloudUploadIcon
                    sx={{ fontSize: 27 }}
                  />
                }
                iconBg="#dbeafe"
                iconColor="#2563eb"
                title="Total Uploads"
                value={totalUploads}
                subtitle="All time uploads"
              />
            </Grid>

            {/* Predictions */}

            <Grid item xs={12} md={4}>
              <StatCard
                icon={
                  <PsychologyIcon
                    sx={{ fontSize: 27 }}
                  />
                }
                iconBg="#ede9fe"
                iconColor="#7c3aed"
                title="AI Predictions"
                value={predictions}
                subtitle="Total AI predictions made"
              />
            </Grid>

            {/* Recyclable */}

            <Grid item xs={12} md={4}>
              <StatCard
                icon={
                  <RecyclingIcon
                    sx={{ fontSize: 27 }}
                  />
                }
                iconBg="#dcfce7"
                iconColor="#16a34a"
                title="Highly Recyclable"
                value={recyclableCount}
                subtitle="High recyclable textiles"
              />
            </Grid>
          </Grid>

          {/* =================================================
              ACCOUNT SECTION
          ================================================== */}

          <Grid
            container
            spacing={2.5}
          >
            {/* =================================================
                ACCOUNT INFORMATION
            ================================================== */}

            <Grid item xs={12} md={7}>
              <Card
                sx={{
                  p: {
                    xs: 3,
                    md: 4,
                  },

                  borderRadius: 4,

                  boxShadow:
                    "0 10px 30px rgba(15,23,42,.07)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#dbeafe",
                      color: "#2563eb",
                    }}
                  >
                    <PersonIcon />
                  </Box>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Account Information
                  </Typography>
                </Box>

                {/* Full Name */}

                <TextField
                  fullWidth
                  label="Full Name"
                  value={fullName}
                  disabled={!editing}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  sx={{
                    mb: 2.5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                    },
                  }}
                />

                {/* Email */}

                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  disabled
                  sx={{
                    mb: 3,

                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                    },
                  }}
                />

                {/* Buttons */}

                {editing && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                      sx={{
                        borderRadius: 2.5,
                        px: 2.5,
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={
                        saving ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        borderRadius: 2.5,
                        px: 2.5,
                      }}
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* =================================================
                ACCOUNT SUMMARY
            ================================================== */}

            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  p: {
                    xs: 3,
                    md: 4,
                  },

                  borderRadius: 4,

                  height: "100%",

                  boxSizing: "border-box",

                  boxShadow:
                    "0 10px 30px rgba(15,23,42,.07)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#ede9fe",
                      color: "#7c3aed",
                    }}
                  >
                    <BarChartIcon />
                  </Box>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Account Summary
                  </Typography>
                </Box>

                <SummaryRow
                  label="Account Status"
                  value={
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#15803d",
                        fontWeight: 700,
                      }}
                    />
                  }
                />

                <SummaryRow
                  label="Total Uploads"
                  value={totalUploads}
                />

                <SummaryRow
                  label="AI Predictions"
                  value={predictions}
                />

                <SummaryRow
                  label="Highly Recyclable"
                  value={recyclableCount}
                />

                <SummaryRow
                  label="Average AI Confidence"
                  value={
                    confidenceValues.length > 0
                      ? `${averageConfidence.toFixed(1)}%`
                      : "--"
                  }
                  last
                />
              </Card>
            </Grid>
          </Grid>

          {/* =================================================
              LOGOUT
          ================================================== */}

          <Box
            sx={{
              mt: 4,
              display: {
                xs: "flex",
                md: "none",
              },
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => {
                localStorage.removeItem(
                  "access_token"
                );
                window.location.href = "/";
              }}
              sx={{
                borderRadius: 3,
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ==========================================================
   STAT CARD
========================================================== */

function StatCard({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  subtitle,
}) {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 4,
        height: "100%",
        boxSizing: "border-box",

        display: "flex",
        alignItems: "center",
        gap: 2,

        boxShadow:
          "0 8px 25px rgba(15,23,42,.07)",

        transition: "transform .2s, box-shadow .2s",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow:
            "0 14px 30px rgba(15,23,42,.12)",
        },
      }}
    >
      <Box
        sx={{
          minWidth: 58,
          width: 58,
          height: 58,
          borderRadius: "50%",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          bgcolor: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          fontWeight={600}
          color="text.secondary"
          sx={{
            fontSize: ".95rem",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: "2rem",
            lineHeight: 1.1,
            fontWeight: 800,
            color: iconColor,
            mt: 0.4,
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Card>
  );
}

/* ==========================================================
   SUMMARY ROW
========================================================== */

function SummaryRow({
  label,
  value,
  last = false,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,

        borderBottom: last
          ? "none"
          : "1px solid rgba(0,0,0,.08)",
      }}
    >
      <Typography
        color="text.secondary"
        fontSize=".92rem"
      >
        {label}
      </Typography>

      <Typography
        fontWeight={700}
        sx={{
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}