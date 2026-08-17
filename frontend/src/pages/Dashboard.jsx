import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";

import PieChartIcon from "@mui/icons-material/PieChart";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PsychologyIcon from "@mui/icons-material/Psychology";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const navigate = useNavigate();

  // ==========================================================
  // CHART COLORS
  // ==========================================================

  const chartColors = [
    "#2563eb",
    "#16a34a",
    "#7c3aed",
    "#ea580c",
    "#0891b2",
    "#db2777",
    "#65a30d",
    "#9333ea",
    "#dc2626",
    "#0f766e",
  ];

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [historyResponse, userResponse, analyticsResponse] =
        await Promise.all([
          api.get("/textiles/history", {
            headers,
          }),

          api.get("/users/me", {
            headers,
          }),

          api.get("/textiles/analytics", {
            headers,
          }),
        ]);

      setHistory(historyResponse.data?.data || []);
      setUser(userResponse.data);
      setAnalytics(analyticsResponse.data?.data || null);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DASHBOARD STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const totalUploads = history.length;

    const predictions = history.filter(
      (item) =>
        item.prediction &&
        String(item.prediction).trim() !== ""
    );

    const totalPredictions = predictions.length;

    const highlyRecyclable = history.filter(
      (item) =>
        item.recyclable &&
        String(item.recyclable).toLowerCase() === "high"
    ).length;

    const confidenceValues = history
      .map((item) => {
        const value = parseFloat(item.confidence);

        return Number.isFinite(value) ? value : null;
      })
      .filter((value) => value !== null);

    const averageConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce(
            (sum, value) => sum + value,
            0
          ) / confidenceValues.length
        : 0;

    // ========================================================
    // MOST FREQUENT FABRIC
    // ========================================================

    const fabricCounts = {};

    predictions.forEach((item) => {
      const fabric = item.prediction;

      if (!fabric) return;

      fabricCounts[fabric] =
        (fabricCounts[fabric] || 0) + 1;
    });

    let mostFrequentFabric = "No data";
    let mostFrequentCount = 0;

    Object.entries(fabricCounts).forEach(
      ([fabric, count]) => {
        if (count > mostFrequentCount) {
          mostFrequentFabric = fabric;
          mostFrequentCount = count;
        }
      }
    );

    return {
      totalUploads,
      totalPredictions,
      highlyRecyclable,
      averageConfidence,
      mostFrequentFabric,
      mostFrequentCount,
    };
  }, [history]);

  // ==========================================================
  // FABRIC DISTRIBUTION
  // ==========================================================

  const fabricDistribution = useMemo(() => {
    const counts = {};

    history.forEach((item) => {
      const fabric = item.prediction;

      if (!fabric) return;

      counts[fabric] =
        (counts[fabric] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [history]);

  // ==========================================================
  // RECENT ANALYSES
  // ==========================================================

  const recentAnalyses = useMemo(() => {
    return [...history]
      .sort(
        (a, b) =>
          new Date(b.uploaded_at) -
          new Date(a.uploaded_at)
      )
      .slice(0, 5);
  }, [history]);

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================================
  // CONFIDENCE COLOR
  // ==========================================================

  const getConfidenceColor = (confidence) => {
    const value = parseFloat(confidence);

    if (!Number.isFinite(value)) {
      return "default";
    }

    if (value >= 80) return "success";

    if (value >= 60) return "warning";

    return "error";
  };

  // ==========================================================
  // RECYCLE COLOR
  // ==========================================================

  const getRecycleColor = (value) => {
    if (!value) return "default";

    const recyclable =
      String(value).toLowerCase();

    if (recyclable === "high") {
      return "success";
    }

    if (recyclable === "medium") {
      return "warning";
    }

    return "error";
  };

  // ==========================================================
  // PIE CHART
  // ==========================================================

  const pieChartBackground = useMemo(() => {
    if (fabricDistribution.length === 0) {
      return theme.palette.action.hover;
    }

    const total = fabricDistribution.reduce(
      (sum, item) => sum + item.value,
      0
    );

    let currentAngle = 0;

    const segments = fabricDistribution.map(
      (item, index) => {
        const percentage =
          (item.value / total) * 100;

        const start = currentAngle;

        currentAngle += percentage;

        const color =
          chartColors[
            index % chartColors.length
          ];

        return `${color} ${start}% ${currentAngle}%`;
      }
    );

    return `conic-gradient(${segments.join(", ")})`;
  }, [fabricDistribution, theme.palette.action.hover]);

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Navbar />

        <Sidebar />

        <Box
          sx={{
            ml: {
              xs: 0,
              md: "260px",
            },
            mt: "80px",
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
          >
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          theme.palette.background.default,
      }}
    >
      {/* =====================================================
          NAVBAR
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
            md: "260px",
          },
          mt: "80px",
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        {/* ===================================================
            HEADER
        ==================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
            >
              Welcome{" "}
              {user?.full_name || "User"} 👋
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              AI Powered Textile Waste
              Intelligence Platform
            </Typography>
          </Box>

          {/* ANALYZE BUTTON */}

          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/upload")}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.4,
              fontWeight: "bold",
              fontSize: 15,
              textTransform: "none",
              boxShadow:
                "0 8px 20px rgba(37,99,235,.25)",
            }}
          >
            Analyze Textile
          </Button>
        </Box>

        {/* ===================================================
            STAT CARDS
        ==================================================== */}

        <Grid
          container
          spacing={3}
        >
          {/* TOTAL UPLOADS */}

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
          >
            <StatCard
              title="Total Uploads"
              value={
                statistics.totalUploads
              }
              icon={
                <CloudUploadIcon fontSize="large" />
              }
              color="linear-gradient(135deg,#2563eb,#1d4ed8)"
            />
          </Grid>

          {/* AI PREDICTIONS */}

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
          >
            <StatCard
              title="AI Predictions"
              value={
                statistics.totalPredictions
              }
              icon={
                <PsychologyIcon fontSize="large" />
              }
              color="linear-gradient(135deg,#7c3aed,#5b21b6)"
            />
          </Grid>

          {/* RECYCLABLE */}

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
          >
            <StatCard
              title="Highly Recyclable"
              value={
                statistics.highlyRecyclable
              }
              icon={
                <RecyclingIcon fontSize="large" />
              }
              color="linear-gradient(135deg,#16a34a,#15803d)"
            />
          </Grid>

          {/* CONFIDENCE */}

          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
          >
            <StatCard
              title="Avg. AI Confidence"
              value={
                statistics.totalPredictions > 0
                  ? `${statistics.averageConfidence.toFixed(
                      1
                    )}%`
                  : "--"
              }
              icon={
                <InsightsIcon fontSize="large" />
              }
              color="linear-gradient(135deg,#ea580c,#c2410c)"
            />
          </Grid>
        </Grid>

        {/* ===================================================
            MILESTONE 3 - SUSTAINABILITY OVERVIEW
        ==================================================== */}

        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Sustainability Overview
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Circular-economy intelligence generated from your textile
              analysis history.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Avg. Sustainability"
                value={
                  analytics &&
                  analytics.average_sustainability_score > 0
                    ? `${analytics.average_sustainability_score}%`
                    : "--"
                }
                icon={<InsightsIcon fontSize="large" />}
                color="linear-gradient(135deg,#059669,#047857)"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Avg. Circularity"
                value={
                  analytics &&
                  analytics.average_circularity_score > 0
                    ? `${analytics.average_circularity_score}%`
                    : "--"
                }
                icon={<RecyclingIcon fontSize="large" />}
                color="linear-gradient(135deg,#0891b2,#0e7490)"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="High Recovery"
                value={analytics ? analytics.high_recovery_count : "--"}
                icon={<RecyclingIcon fontSize="large" />}
                color="linear-gradient(135deg,#16a34a,#15803d)"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Most Detected"
                value={
                  analytics && analytics.most_detected_fabric !== "None"
                    ? analytics.most_detected_fabric
                    : "--"
                }
                icon={<PsychologyIcon fontSize="large" />}
                color="linear-gradient(135deg,#7c3aed,#5b21b6)"
              />
            </Grid>
          </Grid>
        </Box>

        {/* ===================================================
            MILESTONE 3 - ENVIRONMENTAL IMPACT
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 4,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Estimated Environmental Impact
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Model-based estimates from textile sustainability factors.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              [
                "CO₂ Savings",
                `${analytics?.environmental_impact?.estimated_co2_savings_kg ?? 0} kg`,
              ],
              [
                "Water Savings",
                `${analytics?.environmental_impact?.estimated_water_savings_liters ?? 0} L`,
              ],
              [
                "Landfill Diversion",
                `${analytics?.environmental_impact?.estimated_landfill_diversion_kg ?? 0} kg`,
              ],
              [
                "Resource Recovery",
                `${analytics?.environmental_impact?.estimated_resource_recovery_kg ?? 0} kg`,
              ],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: theme.palette.action.hover,
                    height: "100%",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ mt: 0.5 }}
                  >
                    {analytics ? value : "--"}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 3 }}
          >
            These values are estimates based on the sustainability model and
            should not be interpreted as direct physical measurements.
          </Typography>
        </Paper>

        {/* ===================================================
            ANALYTICS SECTION
        ==================================================== */}

        <Grid
          container
          spacing={3}
          sx={{ mt: 1 }}
        >
          {/* =================================================
              FABRIC DISTRIBUTION
          ================================================== */}

          <Grid
            item
            xs={12}
            lg={7}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${
                  theme.palette.divider
                }`,
              }}
            >
              {/* HEADER */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <PieChartIcon color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                  >
                    Textile Distribution
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Distribution of detected
                    textile types
                  </Typography>
                </Box>
              </Box>

              {fabricDistribution.length === 0 ? (
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    color="text.secondary"
                  >
                    Upload textile images to
                    generate distribution
                    analytics.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  {/* ===============================
                      PIE CHART
                  ================================ */}

                  <Box
                    sx={{
                      position: "relative",
                      width: {
                        xs: 220,
                        sm: 260,
                      },
                      height: {
                        xs: 220,
                        sm: 260,
                      },
                      borderRadius: "50%",
                      background:
                        pieChartBackground,
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* INNER CIRCLE */}

                    <Box
                      sx={{
                        width: {
                          xs: 120,
                          sm: 145,
                        },
                        height: {
                          xs: 120,
                          sm: 145,
                        },
                        borderRadius: "50%",
                        bgcolor:
                          theme.palette
                            .background
                            .paper,
                        display: "flex",
                        flexDirection:
                          "column",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        boxShadow:
                          "0 3px 15px rgba(0,0,0,.08)",
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                      >
                        {history.length}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Analyses
                      </Typography>
                    </Box>
                  </Box>

                  {/* ===============================
                      LEGEND
                  ================================ */}

                  <Box
                    sx={{
                      minWidth: 220,
                      maxWidth: 300,
                      width: "100%",
                    }}
                  >
                    {fabricDistribution.map(
                      (item, index) => {
                        const total =
                          fabricDistribution.reduce(
                            (sum, fabric) =>
                              sum + fabric.value,
                            0
                          );

                        const percentage = (
                          (item.value / total) *
                          100
                        ).toFixed(1);

                        return (
                          <Box
                            key={item.name}
                            sx={{
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              py: 0.8,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius:
                                    "50%",
                                  backgroundColor:
                                    chartColors[
                                      index %
                                        chartColors.length
                                    ],
                                  flexShrink: 0,
                                }}
                              />

                              <Typography
                                variant="body2"
                              >
                                {item.name}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              fontWeight="bold"
                            >
                              {percentage}%
                            </Typography>
                          </Box>
                        );
                      }
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* =================================================
              AI PERFORMANCE
          ================================================== */}

          <Grid
            item
            xs={12}
            lg={5}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${
                  theme.palette.divider
                }`,
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <InsightsIcon color="primary" />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  AI Performance
                </Typography>
              </Box>

              {/* CONFIDENCE */}

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Average Confidence
                  </Typography>

                  <Typography fontWeight="bold">
                    {statistics.totalPredictions >
                    0
                      ? `${statistics.averageConfidence.toFixed(
                          1
                        )}%`
                      : "--"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 10,
                    borderRadius: 10,
                    bgcolor:
                      theme.palette.action
                        .hover,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${Math.min(
                        statistics.averageConfidence,
                        100
                      )}%`,
                      borderRadius: 10,
                      background:
                        "linear-gradient(90deg,#2563eb,#7c3aed)",
                      transition:
                        "width .6s ease",
                    }}
                  />
                </Box>
              </Box>

              {/* TOTAL PREDICTIONS */}

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.action
                      .hover,
                  mb: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total AI Predictions
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ mt: 0.5 }}
                >
                  {statistics.totalPredictions}
                </Typography>
              </Box>

              {/* RECYCLABLE */}

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.action
                      .hover,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Highly Recyclable Textiles
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ mt: 0.5 }}
                >
                  {statistics.highlyRecyclable}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ===================================================
            AI INSIGHTS + MODEL INFORMATION
        ==================================================== */}

        <Grid
          container
          spacing={3}
          sx={{ mt: 1 }}
        >
          {/* AI INSIGHTS */}

          <Grid
            item
            xs={12}
            lg={7}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${
                  theme.palette.divider
                }`,
                minHeight: 260,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <AutoAwesomeIcon
                  color="primary"
                />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  AI Insights
                </Typography>
              </Box>

              <Typography
                color="text.secondary"
              >
                Most frequently detected
                textile
              </Typography>

              <Typography
                variant="h2"
                fontWeight="bold"
                color="primary"
                sx={{
                  mt: 1,
                  mb: 0.5,
                  fontSize: {
                    xs: "3rem",
                    md: "4rem",
                  },
                }}
              >
                {statistics.mostFrequentFabric}
              </Typography>

              {statistics.mostFrequentCount >
              0 ? (
                <Typography
                  color="text.secondary"
                >
                  Detected{" "}
                  {statistics.mostFrequentCount}{" "}
                  times
                </Typography>
              ) : (
                <Typography
                  color="text.secondary"
                >
                  Upload textile images to
                  generate AI insights.
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography
                color="text.secondary"
                fontSize={14}
                lineHeight={1.7}
              >
                The platform analyzes
                uploaded textile images
                using the trained
                MobileNetV2-based AI
                classification model.
              </Typography>
            </Paper>
          </Grid>

          {/* MODEL INFORMATION */}

          <Grid
            item
            xs={12}
            lg={5}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${
                  theme.palette.divider
                }`,
                minHeight: 260,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <ScienceIcon
                  color="primary"
                />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  Textile AI Model
                </Typography>
              </Box>

              <Typography
                color="text.secondary"
                fontSize={14}
                lineHeight={1.7}
              >
                MobileNetV2-based textile
                classification model trained
                to identify 10 fabric
                categories.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 3,
                }}
              >
                {[
                  "Corduroy",
                  "Cotton",
                  "Denim",
                  "Fleece",
                  "Leather",
                  "Linen",
                  "Nylon",
                  "Polyester",
                  "Silk",
                  "Velvet",
                ].map((fabric) => (
                  <Chip
                    key={fabric}
                    label={fabric}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ===================================================
            RECENT ANALYSES
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {/* TABLE HEADER */}

          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HistoryIcon />

              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Recent Analyses
              </Typography>
            </Box>

            <Button
              endIcon={
                <ArrowForwardIcon />
              }
              onClick={() =>
                navigate("/history")
              }
              sx={{
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              View All History
            </Button>
          </Box>

          <Divider sx={{ borderColor: theme.palette.divider }} />

          {/* NO DATA */}

          {recentAnalyses.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Typography
                color="text.secondary"
              >
                No textile analyses yet.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderRadius: 2,
                }}
                onClick={() =>
                  navigate("/upload")
                }
              >
                Analyze Your First Textile
              </Button>
            </Box>
          ) : (
            <TableContainer
              sx={{
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  bgcolor: theme.palette.background.paper,
                  "& .MuiTableCell-root": {
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                  },
                  "& .MuiTableHead-root .MuiTableCell-root": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? theme.palette.background.default
                        : theme.palette.grey[50],
                    color: theme.palette.text.primary,
                    fontWeight: 700,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Textile
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Prediction
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Confidence
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Recyclability
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Date
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentAnalyses.map(
                    (item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          bgcolor: theme.palette.background.paper,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                          },
                          "& .MuiTableCell-root": {
                            color: theme.palette.text.primary,
                            borderColor: theme.palette.divider,
                          },
                        }}
                        onClick={() =>
                          navigate(
                            `/history/${item.id}`
                          )
                        }
                      >
                        {/* TEXTILE */}

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: 2,
                            }}
                          >
                            {item.image_path ? (
                              <Avatar
                                src={`${api.defaults.baseURL}/${item.image_path.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                variant="rounded"
                                sx={{
                                  width: 42,
                                  height: 42,
                                  bgcolor: theme.palette.action.hover,
                                }}
                              />
                            ) : (
                              <Avatar
                                variant="rounded"
                                sx={{
                                  width: 42,
                                  height: 42,
                                }}
                              >
                                🧵
                              </Avatar>
                            )}

                            <Typography
                              fontWeight="medium"
                            >
                              {item.textile_name ||
                                "Unnamed Textile"}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* PREDICTION */}

                        <TableCell>
                          <Typography
                            fontWeight="bold"
                            color="primary"
                          >
                            {item.prediction ||
                              "Pending"}
                          </Typography>
                        </TableCell>

                        {/* CONFIDENCE */}

                        <TableCell>
                          {item.confidence ? (
                            <Chip
                              label={`${parseFloat(
                                item.confidence
                              ).toFixed(
                                1
                              )}%`}
                              color={getConfidenceColor(
                                item.confidence
                              )}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                ...(theme.palette.mode === "dark" && {
                                  "& .MuiChip-label": {
                                    color: "inherit",
                                  },
                                }),
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* RECYCLABILITY */}

                        <TableCell>
                          {item.recyclable ? (
                            <Chip
                              icon={
                                <CheckCircleIcon />
                              }
                              label={
                                item.recyclable
                              }
                              color={getRecycleColor(
                                item.recyclable
                              )}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                ...(theme.palette.mode === "dark" && {
                                  "& .MuiChip-label": {
                                    color: "inherit",
                                  },
                                }),
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* DATE */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {formatDate(
                              item.uploaded_at
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* ===================================================
            FOOTER STATUS
        ==================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            gap: 1,
            mt: 4,
            mb: 2,
          }}
        >
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 18 }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            AI Classification System
            Active
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}