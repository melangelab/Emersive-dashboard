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

import { ReactComponent as ProfileIcon } from "../icons/NewIcons/ProfileIcon.svg"

import "./Admin/admin.css"
import { useRouteMatch } from "react-router-dom"

export default function Header({ authType, title, ...props }) {
  console.log("PROPS ORIGINAL KEYS", props.originalColumnKeys)
  console.log("PROPS auth type", props.authType)
  const { path } = useRouteMatch()

  return (
    <div className="header-container">
      <div className="page-title-container">
        {authType === "admin" && !path.startsWith("/admin") && (
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
      <div className="profile-container">
        <ProfileIcon className="profile-icon" />
        <div className="profile-text-container">
          <p className="profile-text">{title}</p>
          <p className="profile-sub-text">{authType}</p>
        </div>
      </div>
    </div>
  )
}
