import React, { useState, useEffect } from "react"
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
import { Service } from "./DBService/DBService"

export default function Header({ authType, title, ...props }) {
  console.log("PROPS ORIGINAL KEYS", props.originalColumnKeys)
  console.log("PROPS auth type", props.authType)
  const routeMatch = useRouteMatch()
  const { path } = routeMatch || { path: "/" }

  const userType = LAMP.Auth._type
  console.log("Logging userType from the Header component:", userType)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [otherRole, setOtherRole] = useState({
    email: null,
    role: null,
    id: null,
    firstName: null,
    lastName: null,
    origin: null,
  })
  const menuOpen = Boolean(anchorEl)

  useEffect(() => {
    const fetchOtherUser = async () => {
      console.log("INSIDE FetchOtherUser-", LAMP.Auth._auth)
      const userType = LAMP.Auth._type
      try {
        if (userType === "admin") {
          const temp: any = LAMP.Auth._me

          const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
          const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
          const params = new URLSearchParams({
            emailId: temp.id,
          }).toString()
          const response = await fetch(`${baseURL}/researcher-view-emailId?${params}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${btoa(authString)}`,
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          const researcher = data.data
          console.log("Fetched researcher data:", researcher)

          if (researcher) {
            const researcherRole = {
              email: researcher.email,
              role: "Researcher",
              id: researcher._id,
              firstName: researcher.firstName,
              lastName: researcher.lastName,
              origin: researcher._id,
            }
            setOtherRole(researcherRole)

            // Store researcher data in sessionStorage for role switching
            try {
              ;(global as any).sessionStorage?.setItem(
                "LAMP._otherRole",
                JSON.stringify({
                  ...researcherRole,
                  _id: researcher._id,
                  name: `${researcher.firstName} ${researcher.lastName}`,
                })
              )
              console.log("DEBUG: Stored researcher data in sessionStorage")
            } catch (e) {
              console.log("DEBUG: Failed to store researcher data in sessionStorage")
            }
          }
        } else {
          const temp: any = LAMP.Auth._me
          console.log("temp in fetchOtherUser:", temp)
          try {
            const response: any = await LAMP.Type.getAttachment(temp?.email || temp?.emailAddress, "emersive.profile")
            console.log("Response from emersive profile:", temp?.email || temp?.emailAddress, response)
            const admin = response.data[0]
            if (admin) {
              setOtherRole({
                email: admin.emailAddress,
                role: "Admin",
                id: null,
                firstName: admin.firstName,
                lastName: admin.lastName,
                origin: null,
              })
            }
            console.log("Fetched admin data:", admin, temp)
          } catch (error) {
            console.error("Error fetching emersive profile:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching other user:", error)
      }
    }

    fetchOtherUser()
  }, [])

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

  const handleSwitchRole = async () => {
    console.log("Switch role clicked")
    console.log("Switching role...", otherRole)
    console.log("Current LAMP.Auth._auth:", LAMP.Auth._auth)
    console.log("Server address:", LAMP.Auth._auth.serverAddress)

    if (!otherRole.email) {
      console.warn("No other role available to switch to")
      return
    }

    try {
      const currentUserType = LAMP.Auth._type

      // Update credential origin
      const temp: any = LAMP.Auth._me
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")

      console.log("Using baseURL:", baseURL)
      console.log("Auth string (first 10 chars):", authString.substring(0, 10) + "...")

      const requestBody = {
        origin: otherRole.origin,
        access_key: otherRole.email,
      }

      if (currentUserType === "admin") {
        try {
          console.log("Making credential update API call for admin to researcher switch")
          const updateResponse = await fetch(`${baseURL}/credential-update-origin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${btoa(authString)}`,
            },
            body: JSON.stringify(requestBody),
          })

          if (!updateResponse.ok) {
            console.warn(`Credential update API failed: ${updateResponse.status}, continuing with role switch`)
          } else {
            const updateResult = await updateResponse.json()
            console.log("Updated origin:", updateResult)
          }
        } catch (error) {
          console.warn("Error updating origin (continuing anyway):", error)
        }
      } else {
        // For researcher switching to admin, use PUT request with query parameters
        try {
          const params = new URLSearchParams({
            origin: null,
            access_key: otherRole.email,
          }).toString()

          const updateResponse = await fetch(`${baseURL}/credential-update-origin?${params}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${btoa(authString)}`,
            },
          })

          if (!updateResponse.ok) {
            throw new Error(`Failed to update origin: ${updateResponse.status}`)
          }

          console.log("Updated origin for researcher to admin switch")
        } catch (error) {
          console.error("Error updating origin:", error)
        }

        // Delete databases before role switch
        try {
          await Service.deleteDB()
          await Service.deleteUserDB()
          console.log("Deleted local databases")
        } catch (error) {
          console.error("Error deleting databases:", error)
        }
      }

      // Now switch role using setIdentity
      console.log("Checking setIdentity availability...")
      console.log("props object:", props)
      console.log("props.setIdentity:", props.setIdentity)
      console.log("typeof props.setIdentity:", typeof props.setIdentity)

      if (props && props.setIdentity && typeof props.setIdentity === "function") {
        console.log("Calling setIdentity with switchRole=true")
        const result = await props.setIdentity({
          id: LAMP.Auth._auth.id,
          password: LAMP.Auth._auth.password,
          serverAddress: LAMP.Auth._auth.serverAddress,
          switchRole: true,
        })
        console.log("Switch role result:", result)

        // Navigate based on the actual result from the role switch
        if (result && result.authType) {
          console.log("Role switched successfully to:", result.authType)

          if (result.authType === "researcher" && otherRole) {
            console.log("Switching to researcher role, navigating to researcher dashboard")
            window.location.href = `/#/researcher/${otherRole.id}/studies`
          } else if (result.authType === "admin") {
            console.log("Switching to admin role, navigating to admin dashboard")
            window.location.href = "/#/admin"
          } else {
            console.log("Role switch completed but unexpected authType:", result.authType)
          }

          console.log(`Successfully switched to ${result.authType} role`)
        } else {
          console.error("Role switch failed - no result or authType in result:", result)
        }
      } else {
        console.warn("setIdentity prop not available or not a function:", typeof props.setIdentity)
        console.log("Available props:", Object.keys(props))
        console.log("Full props object:", props)
      }
    } catch (error) {
      console.error("Switch role error:", error)
      // Don't stop execution, just log the error
      console.log("Role switch encountered errors but may have partially succeeded")

      // Check if the role actually changed despite the error by checking userType after a delay
      setTimeout(() => {
        console.log("Checking if role switch succeeded despite errors...")
        const currentUserType = LAMP.Auth._type
        console.log("Current authType after error:", currentUserType)

        // If the role did change, proceed with navigation
        if (currentUserType === "researcher" && otherRole) {
          console.log("Role switch succeeded despite errors, navigating to researcher dashboard")
          window.location.href = `/#/researcher/${otherRole.id}/studies`
        } else if (currentUserType === "admin") {
          console.log("Role switch succeeded despite errors, navigating to admin dashboard")
          window.location.href = "/#/admin"
        } else {
          console.log("Role switch failed completely")
        }
      }, 1000)
    }

    handleMenuClose()
  }

  return (
    <div className="header-container">
      <div className="page-title-container">
        {path && !path.startsWith("/admin") && !["researcher", "participant"].includes(userType) && (
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
        <p className="page-name">{props?.pageLocation || ""}</p>
      </div>
      <div className="profile-container" onClick={handleProfileClick} role="button" tabIndex={0}>
        <ProfileIcon className="profile-icon" />
        <div className="profile-text-container">
          <p className="profile-text">{title || ""}</p>
          <p className="profile-sub-text">{authType || ""}</p>
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
        {otherRole?.email && [
          <MenuItem key="switch-role" onClick={handleSwitchRole} style={{ gap: 12 }}>
            <SwapVertIcon style={{ color: "#6b7280" }} />
            <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Switch Role</span>
          </MenuItem>,
          <Divider key="switch-role-divider" />,
        ]}
        <MenuItem onClick={handleLogout} style={{ gap: 12 }}>
          <PowerIcon style={{ color: "#6b7280" }} />
          <span style={{ flex: 1, color: "#374151", fontWeight: 500 }}>Log out</span>
        </MenuItem>
      </Menu>
    </div>
  )
}
