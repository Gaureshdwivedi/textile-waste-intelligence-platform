import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  useTheme,
} from "@mui/material";

import {
  LightMode,
  DarkMode,
  NotificationsNone,
} from "@mui/icons-material";

import { useContext } from "react";
import { ColorModeContext } from "../theme/ColorModeContext";

export default function Navbar() {

  const theme = useTheme();

  const { toggleColorMode } =
    useContext(ColorModeContext);

  return (

    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        background:
          theme.palette.mode === "dark"
            ? "rgba(15,23,42,0.85)"
            : "rgba(255,255,255,0.85)",

        borderBottom:
          "1px solid rgba(255,255,255,0.08)",

        color:
          theme.palette.text.primary,
      }}
    >

      <Toolbar>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          🧵 TextileAI
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Notifications">

          <IconButton>

            <NotificationsNone />

          </IconButton>

        </Tooltip>

        <Tooltip title="Change Theme">

          <IconButton
            onClick={toggleColorMode}
          >

            {
              theme.palette.mode === "dark"

                ?

                <LightMode />

                :

                <DarkMode />
            }

          </IconButton>

        </Tooltip>

        <Avatar
          sx={{
            ml: 2,
            bgcolor: "#2563eb",
            cursor: "pointer",
          }}
        >
          G
        </Avatar>

      </Toolbar>

    </AppBar>

  );
}