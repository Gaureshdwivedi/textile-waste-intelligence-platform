import { useState } from "react";
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecyclingIcon from "@mui/icons-material/Recycling";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Upload() {
  const theme = useTheme();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [textileName, setTextileName] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  // AI result
  const [analysis, setAnalysis] = useState(null);

  const navigate = useNavigate();

  // ======================================================
  // Image Selection
  // ======================================================

  const handleImage = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    // Clear previous AI result
    setAnalysis(null);
    setMessage("");
  };

  // ======================================================
  // Drag Events
  // ======================================================

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.type === "dragenter" ||
      e.type === "dragover"
    ) {
      setDragActive(true);
    }

    if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // ======================================================
  // Drop
  // ======================================================

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      const selected =
        e.dataTransfer.files[0];

      setFile(selected);
      setPreview(
        URL.createObjectURL(selected)
      );

      setAnalysis(null);
      setMessage("");
    }
  };

  // ======================================================
  // Upload + AI Analysis
  // ======================================================

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setAnalysis(null);

      const formData = new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "textile_name",
        textileName
      );

      formData.append(
        "description",
        description
      );

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await api.post(
        "/textiles/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      // ==================================================
      // Get AI Analysis
      // ==================================================

      const aiResult =
        response.data?.ai_analysis;

      if (aiResult) {
        setAnalysis(aiResult);
      }

      setMessage(
        "🎉 Textile uploaded and analyzed successfully!"
      );

      // Keep the image and information visible
      // so mentor can see the AI result.

    } catch (err) {
      console.error(
        "Upload error:",
        err
      );

      const errorMessage =
        err.response?.data?.detail ||
        "Upload Failed. Please try again.";

      setMessage(
        `❌ ${errorMessage}`
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // New Analysis
  // ======================================================

  const handleNewAnalysis = () => {
    setFile(null);
    setPreview("");
    setTextileName("");
    setDescription("");
    setMessage("");
    setAnalysis(null);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <>
      <Navbar />

      <Box
        sx={{
          display: "flex",
        }}
      >
        <Sidebar />

        <Container
          maxWidth="md"
          sx={{
            ml: "280px",
            mt: "100px",
            mb: 5,
          }}
        >
          {/* ==================================================
              Main Upload Card
          ================================================== */}

          <Card
            sx={{
              p: 4,
              borderRadius: 5,
              boxShadow:
                "0 15px 35px rgba(0,0,0,.15)",
            }}
          >
            <CardContent>

              {/* ==================================================
                  Header
              ================================================== */}

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                Upload Textile
              </Typography>

              <Typography
                color="text.secondary"
                mb={4}
              >
                Upload a textile image for
                AI-powered fabric analysis
              </Typography>

              {/* ==================================================
                  Message
              ================================================== */}

              {message && (
                <Alert
                  severity={
                    analysis
                      ? "success"
                      : message.startsWith("❌")
                      ? "error"
                      : "info"
                  }
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {message}
                </Alert>
              )}

              {/* ==================================================
                  Drag & Drop Area
              ================================================== */}

              {!analysis && (
                <Paper
                  elevation={0}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    p: 5,
                    width: "100%",
                    boxSizing: "border-box",
                    maxWidth: "100%",
                    mt: 2,

                    border: dragActive
                      ? `3px solid ${theme.palette.primary.main}`
                      : `3px dashed ${theme.palette.divider}`,

                    borderRadius: 4,

                    textAlign: "center",

                    cursor: "pointer",

                    bgcolor: dragActive
                      ? theme.palette.mode === "dark"
                        ? "rgba(37, 99, 235, 0.18)"
                        : "#dbeafe"
                      : theme.palette.background.paper,

                    transition: ".3s",

                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(37, 99, 235, 0.12)"
                          : "#eff6ff",
                    },
                  }}
                >
                  <label
                    htmlFor="upload-image"
                    style={{
                      cursor:
                        "pointer",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      width: "100%",

                      height: "100%",
                    }}
                  >
                    <CloudUploadIcon
                      sx={{
                        fontSize: 80,
                        color:
                          "#2563eb",
                      }}
                    />

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      mt={2}
                    >
                      {dragActive
                        ? "Drop Image Here"
                        : "Drag & Drop Textile Image"}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      mt={1}
                    >
                      or Click to Browse
                      Files
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={2}
                    >
                      Supports JPG,
                      JPEG & PNG
                    </Typography>
                  </label>

                  <input
                    id="upload-image"
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImage
                    }
                  />
                </Paper>
              )}

              {/* ==================================================
                  Image Preview
              ================================================== */}

              {preview && (
                <Box
                  mt={5}
                  sx={{
                    textAlign:
                      "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                  >
                    Textile Preview
                  </Typography>

                  <Box
                    sx={{
                      display:
                        "flex",

                      justifyContent:
                        "center",
                    }}
                  >
                    <img
                      src={preview}
                      alt="Textile Preview"
                      style={{
                        width: "100%",
                        maxWidth:
                          "400px",

                        height: "240px",

                        objectFit:
                          "cover",

                        borderRadius:
                          "20px",

                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 15px 35px rgba(0,0,0,.45)"
                            : "0 15px 35px rgba(0,0,0,.25)",
                      }}
                    />
                  </Box>

                  <Typography
                    mt={2}
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    {file?.name}
                  </Typography>
                </Box>
              )}

              {/* ==================================================
                  Textile Details
              ================================================== */}

              {!analysis && (
                <>
                  <TextField
                    fullWidth
                    label="Textile Name"
                    sx={{ mt: 4 }}
                    value={
                      textileName
                    }
                    onChange={(e) =>
                      setTextileName(
                        e.target.value
                      )
                    }
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    sx={{ mt: 3 }}
                    value={
                      description
                    }
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                  />

                  {/* ==================================================
                      Analyze Button
                  ================================================== */}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={
                      !loading && (
                        <AutoAwesomeIcon />
                      )
                    }
                    sx={{
                      mt: 4,
                      py: 1.6,
                      borderRadius: 3,
                      fontWeight:
                        "bold",
                      fontSize: 17,
                    }}
                    onClick={
                      handleUpload
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <CircularProgress
                          size={24}
                          color="inherit"
                          sx={{
                            mr: 1,
                          }}
                        />

                        AI Analyzing
                        Textile...
                      </>
                    ) : (
                      "Start AI Analysis"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* ======================================================
              AI ANALYSIS RESULT
          ====================================================== */}

          {analysis && (
            <Card
              sx={{
                mt: 4,
                borderRadius: 5,
                overflow: "hidden",
                bgcolor: theme.palette.background.paper,

                boxShadow:
                  "0 15px 40px rgba(37,99,235,.18)",

                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* ==================================================
                  AI Header
              ================================================== */}

              <Box
                sx={{
                  p: 3,

                  background:
                    "linear-gradient(135deg, #2563eb, #4f46e5)",

                  color: "white",

                  textAlign:
                    "center",
                }}
              >
                <AutoAwesomeIcon
                  sx={{
                    fontSize: 40,
                    mb: 1,
                  }}
                />

                <Typography
                  variant="h5"
                  fontWeight="bold"
                >
                  AI Analysis Complete
                </Typography>

                <Typography
                  sx={{
                    opacity: 0.9,
                    mt: 0.5,
                  }}
                >
                  Fabric classification
                  powered by
                  MobileNetV2
                </Typography>
              </Box>

              <CardContent
                sx={{ p: 4 }}
              >
                {/* ==================================================
                    Primary Prediction
                ================================================== */}

                <Box
                  sx={{
                    textAlign:
                      "center",
                    mb: 4,
                  }}
                >
                  <Typography
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    DETECTED FABRIC
                  </Typography>

                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      mt: 1,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {analysis.fabric}
                  </Typography>

                  <Chip
                    icon={
                      <CheckCircleIcon />
                    }
                    label={`${analysis.confidence}% Confidence`}
                    color="primary"
                    sx={{
                      mt: 2,
                      fontWeight:
                        "bold",
                      fontSize: 15,
                      py: 2.5,
                    }}
                  />
                </Box>

                {/* ==================================================
                    Confidence Bar
                ================================================== */}

                <Typography
                  fontWeight="bold"
                  mb={1}
                >
                  AI Confidence
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    Number(
                      analysis.confidence
                    ),
                    100
                  )}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 4,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.12)"
                        : undefined,
                  }}
                />

                <Divider
                  sx={{ mb: 3 }}
                />

                {/* ==================================================
                    Top 3 Predictions
                ================================================== */}

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                >
                  Other Possible Fabrics
                </Typography>

                <Box>
                  {(
                    analysis.top_predictions ||
                    []
                  )
                    .slice(1)
                    .map(
                      (
                        prediction,
                        index
                      ) => (
                        <Box
                          key={
                            prediction.fabric
                          }
                          sx={{
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display:
                                "flex",

                              justifyContent:
                                "space-between",

                              mb: 0.5,
                            }}
                          >
                            <Typography
                              fontWeight="bold"
                            >
                              {index +
                                2}
                              .{" "}
                              {
                                prediction.fabric
                              }
                            </Typography>

                            <Typography
                              fontWeight="bold"
                              color="primary"
                            >
                              {
                                prediction.confidence
                              }
                              %
                            </Typography>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={Math.min(
                              Number(
                                prediction.confidence
                              ),
                              100
                            )}
                            sx={{
                              height: 7,
                              borderRadius: 5,
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.12)"
                                  : undefined,
                            }}
                          />
                        </Box>
                      )
                    )}
                </Box>

                <Divider
                  sx={{
                    my: 3,
                  }}
                />

                {/* ==================================================
                    Fabric Information
                ================================================== */}

                <Box
                  sx={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },

                    gap: 2,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(37, 99, 235, 0.12)"
                          : "#eff6ff",
                      border: `1px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(96, 165, 250, 0.25)"
                          : "#dbeafe"
                      }`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      CATEGORY
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      mt={0.5}
                      sx={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      {analysis.category || "Not available"}
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(34, 197, 94, 0.12)"
                          : "#f0fdf4",
                      border: `1px solid ${
                        theme.palette.mode === "dark"
                          ? "rgba(74, 222, 128, 0.25)"
                          : "#bbf7d0"
                      }`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      RECYCLABILITY
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      mt={0.5}
                      sx={{
                        color:
                          theme.palette.mode === "dark"
                            ? "#4ade80"
                            : theme.palette.success.main,
                      }}
                    >
                      {analysis.recyclability || "Not available"}
                    </Typography>
                  </Paper>
                </Box>

                {/* ==================================================
                    Recommendation
                ================================================== */}

                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#f8fafc",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <RecyclingIcon
                      sx={{
                        color:
                          theme.palette.mode === "dark"
                            ? "#4ade80"
                            : theme.palette.success.main,
                      }}
                    />

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        color: theme.palette.text.primary,
                      }}
                    >
                      Recycling Recommendation
                    </Typography>
                  </Box>

                  <Typography
                    lineHeight={1.7}
                    sx={{
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {analysis.recommendation || "No recommendation available."}
                  </Typography>
                </Paper>

                {/* ==================================================
                    Actions
                ================================================== */}

                <Box
                  sx={{
                    display:
                      "flex",

                    gap: 2,

                    mt: 4,

                    flexDirection:
                      {
                        xs: "column",
                        sm: "row",
                      },
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={
                      handleNewAnalysis
                    }
                    sx={{
                      py: 1.4,
                      borderRadius: 3,
                      fontWeight:
                        "bold",
                    }}
                  >
                    Analyze Another
                    Textile
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() =>
                      navigate(
                        "/history"
                      )
                    }
                    sx={{
                      py: 1.4,
                      borderRadius: 3,
                      fontWeight:
                        "bold",
                    }}
                  >
                    View History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </>
  );
}