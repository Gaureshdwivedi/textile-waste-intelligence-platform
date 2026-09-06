import { useEffect, useState } from "react";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import RecyclingIcon from "@mui/icons-material/Recycling";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloudIcon from "@mui/icons-material/Cloud";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import api from "../services/api";
import StatCard from "../components/StatCard";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#db2777",
];

const ROLE_LABELS = {
  recycling_operator: "Recycling Operator",
  sustainability_manager: "Sustainability Manager",
  manufacturer: "Manufacturer",
  admin: "Administrator",
};

const ROLE_COLORS = {
  recycling_operator: "primary",
  sustainability_manager: "success",
  manufacturer: "warning",
  admin: "secondary",
};

export default function AdminDashboard() {
  const theme = useTheme();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [dashboardResponse, usersResponse] = await Promise.all([
        api.get("/dashboard/admin", { headers }),
        api.get("/dashboard/admin/users", { headers }),
      ]);

      setData(dashboardResponse.data?.data || null);
      setUsers(usersResponse.data?.data || []);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this dashboard."
        );
      } else if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load admin dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) {
    return <Typography>No platform data available.</Typography>;
  }

  const { platform_analytics: analytics } = data;

  const roleData = Object.entries(data.users_by_role || {}).map(
    ([role, count]) => ({
      name: ROLE_LABELS[role] || role,
      value: count,
    })
  );

  const fabricData = Object.entries(
    analytics.fabric_distribution || {}
  ).map(([name, value]) => ({ name, value }));

  const environmental = analytics.environmental_impact || {};

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Admin Dashboard
          </Typography>

          <Typography color="text.secondary">
            Platform-wide activity across all users
          </Typography>
        </Box>

        <Chip
          icon={<AdminPanelSettingsIcon />}
          label="Administrator View"
          color="secondary"
          variant="outlined"
        />
      </Box>

      {/* TOP-LEVEL STATS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Users"
            value={data.total_users}
            icon={<GroupIcon fontSize="large" />}
            color="linear-gradient(135deg,#2563eb,#1d4ed8)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Textiles Analyzed"
            value={data.total_textiles}
            icon={<InventoryIcon fontSize="large" />}
            color="linear-gradient(135deg,#7c3aed,#5b21b6)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg. Sustainability"
            value={`${analytics.average_sustainability_score}%`}
            icon={<RecyclingIcon fontSize="large" />}
            color="linear-gradient(135deg,#059669,#047857)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg. Circularity"
            value={`${analytics.average_circularity_score}%`}
            icon={<AutorenewIcon fontSize="large" />}
            color="linear-gradient(135deg,#0891b2,#0e7490)"
          />
        </Grid>
      </Grid>

      {/* ENVIRONMENTAL IMPACT */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Platform-Wide Environmental Impact
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Combined estimated impact across all users' textile analyses.
        </Typography>

        <Grid container spacing={3}>
          {[
            [
              "CO₂ Savings",
              `${environmental.estimated_co2_savings_kg ?? 0} kg`,
              <CloudIcon key="co2" />,
            ],
            [
              "Water Savings",
              `${environmental.estimated_water_savings_liters ?? 0} L`,
              <WaterDropIcon key="water" />,
            ],
            [
              "Landfill Diversion",
              `${environmental.estimated_landfill_diversion_kg ?? 0} kg`,
              <DeleteIcon key="landfill" />,
            ],
            [
              "Resource Recovery",
              `${environmental.estimated_resource_recovery_kg ?? 0} kg`,
              <RecyclingIcon key="recovery" />,
            ],
          ].map(([label, value]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: "action.hover",
                }}
              >
                <Typography color="text.secondary">
                  {label}
                </Typography>

                <Typography variant="h5" fontWeight="bold">
                  {value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* USERS BY ROLE + FABRIC DISTRIBUTION */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Users by Role
            </Typography>

            {roleData.length > 0 ? (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      label
                    >
                      {roleData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend verticalAlign="bottom" height={45} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No user data available.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Platform Fabric Distribution
            </Typography>

            {fabricData.length > 0 ? (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fabricData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Analyses"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No fabric data available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* TOP CONTRIBUTORS */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EmojiEventsIcon color="warning" />

          <Typography variant="h6" fontWeight="bold">
            Top Contributors
          </Typography>
        </Box>

        {data.top_contributors.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography color="text.secondary">
              No uploads yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Uploads</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.top_contributors.map((contributor) => (
                  <TableRow key={contributor.user_id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Avatar>
                          {contributor.full_name?.[0]?.toUpperCase() ||
                            "?"}
                        </Avatar>

                        <Typography>
                          {contributor.full_name}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        label={contributor.upload_count}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ALL USERS TABLE */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          mb: 2,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GroupIcon color="primary" />

          <Typography variant="h6" fontWeight="bold">
            All Users
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.full_name}</TableCell>

                  <TableCell>{u.email}</TableCell>

                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[u.role] || u.role}
                      color={ROLE_COLORS[u.role] || "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}