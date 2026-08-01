import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";

import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import RecyclingIcon from "@mui/icons-material/Recycling";

import { Link, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Upload", icon: <CloudUploadIcon />, path: "/upload" },
    { text: "History", icon: <HistoryIcon />, path: "/history" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("access_token");
        navigate("/");
    }    
  };
  useEffect(() => {
    fetchUser();
}, []);

const fetchUser = async () => {
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
    }
};

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          bgcolor: "#111827",
          color: "white",
          borderRight: "1px solid #1f2937",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "#22c55e" }}>
            <RecyclingIcon />
          </Avatar>

          <Box>
            <Typography fontWeight="bold" fontSize={24}>
              TextileAI
            </Typography>

            <Typography variant="body2" color="gray">
              AI Waste Intelligence
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              mx: 2,
              my: 1,
              borderRadius: 2,
              "&.Mui-selected": {
                bgcolor: "#22c55e",
                color: "white",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography fontWeight="bold">
          {user?.full_name || "User"}
        </Typography>

        <Typography variant="body2" color="gray">
          {user?.email || ""}
        </Typography>

        <ListItemButton
          onClick={logout}
          sx={{
            mt: 2,
            borderRadius: 2,
          }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}