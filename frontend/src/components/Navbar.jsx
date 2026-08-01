import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#111827",
        width: "calc(100% - 260px)",
        ml: "260px",
        borderBottom: "1px solid #1f2937",
      }}
    >
      <Toolbar>

        <IconButton color="inherit">
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
          }}
        >
          🧵 TextileAI Dashboard
        </Typography>

        <Badge badgeContent={3} color="error">
          <NotificationsIcon />
        </Badge>

        <Box sx={{ width: 20 }} />

        <Avatar sx={{ bgcolor: "#22c55e" }}>
          G
        </Avatar>

      </Toolbar>
    </AppBar>
  );
}