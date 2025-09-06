import React, { useState } from "react"
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Fab,
  Icon,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  colors,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core"
import AccountCircleIcon from "@material-ui/icons/AccountCircle"
import PeopleIcon from "@material-ui/icons/People"
import BookIcon from "@material-ui/icons/Book"
import SwapVertIcon from "@material-ui/icons/SwapVert"
import PowerIcon from "@material-ui/icons/PowerSettingsNew"

import { ReactComponent as ProfileIcon } from "../icons/NewIcons/ProfileIcon.svg"

import "./Admin/admin.css"
import { useRouteMatch } from "react-router-dom"
import LAMP from "lamp-core"

export default function Header({ authType, title, ...props }) {
  console.log("PROPS ORIGINAL KEYS", props.originalColumnKeys)
  console.log("PROPS auth type", props.authType)
  const { path } = useRouteMatch()

  const userType = LAMP.Auth._type
  console.log("Logging userType from the Header component:", userType)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      // Prefer parent-provided logout (App.reset) so the full app cleanup runs.
      if (props && typeof props.onLogout === "function") {
        // Call logout with no parameters to trigger the logout path in reset()
        await props.onLogout()
      } else {
        // Some builds of lamp-core may not expose a typed logout method. Use a runtime check.
        const maybeLogout: any = (LAMP && (LAMP as any).Auth && (LAMP as any).Auth.logout) || null
        if (typeof maybeLogout === "function") await maybeLogout()
        // Force redirect to login
        window.location.href = window.location.origin + "/#/"
      }
    } catch (e) {
      console.error("Logout error:", e)
      // If anything fails, force redirect to login
      window.location.href = window.location.origin + "/#/"
    }
    handleMenuClose()
  }

  return (
    <div className="header-container">
      <div className="page-title-container">
        {!path.startsWith("/admin") && !["researcher", "participant"].includes(userType) && (
          <IconButton
            size="medium"
            // className=""
            onClick={() => {
              window.location.href = `/`
            }}
          >
            <Icon>arrow_back</Icon>
          </IconButton>
        )}
        <p className="page-name">{props.pageLocation}</p>
      </div>
      <div className="profile-container" onClick={handleProfileClick} role="button" tabIndex={0}>
        <ProfileIcon className="profile-icon" />
        <div className="profile-text-container">
          <p className="profile-text">{title}</p>
          <p className="profile-sub-text">{authType}</p>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ style: { borderRadius: 10, padding: "8px 0", minWidth: 200 } }}
      >
        <MenuItem
          onClick={() => {
            /* account action */ handleMenuClose()
          }}
          style={{ gap: 12 }}
        >
          <AccountCircleIcon style={{ color: "#6b7280" }} />
          <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Account</span>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            /* community */ handleMenuClose()
          }}
          style={{ gap: 12 }}
        >
          <PeopleIcon style={{ color: "#6b7280" }} />
          <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Community</span>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            /* docs */ window.open("https://docs.lamp.digital", "_blank")
            handleMenuClose()
          }}
          style={{ gap: 12 }}
        >
          <BookIcon style={{ color: "#6b7280" }} />
          <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Documentation</span>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            /* switch role */ handleMenuClose()
          }}
          style={{ gap: 12 }}
        >
          <SwapVertIcon style={{ color: "#6b7280" }} />
          <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Switch Role</span>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} style={{ gap: 12 }}>
          <PowerIcon style={{ color: "#6b7280" }} />
          <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Log out</span>
        </MenuItem>
      </Menu>
    </div>
  )
}
