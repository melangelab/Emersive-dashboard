import { ReactComponent as Logo } from "../icons/Logo.svg"
import React, { useState, useEffect } from "react"
import "./global.css"
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Button,
  ListItem,
  Popover,
  Paper,
  Box,
  Typography,
} from "@material-ui/core"
import { useSnackbar } from "notistack"

import LAMP from "lamp-core"

import { ReactComponent as SidebarCollapse } from "../icons/NewIcons/sidebar-collapse.svg"
import { ReactComponent as SidebarExpand } from "../icons/NewIcons/sidebar-expand.svg"
import { makeStyles } from "@material-ui/core/styles"
import { ReactComponent as SwitchRoleIcon } from "../icons/NewIcons/replace.svg"

import { Service } from "./DBService/DBService"
import locale_lang from "../locale_map.json"
import { useTranslation } from "react-i18next"
import { Redirect } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "auto",
  },
  optionText: {
    fontSize: "15px",
    color: "#666",
    fontWeight: 400,
  },
  activeOption: {
    backgroundColor: "#FADCD3",
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1.5),
    "& path, & rect": {
      stroke: "#EB8367",
      fill: "none",
    },
  },
  switchRoleOption: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    cursor: "pointer",
    borderRadius: theme.spacing(1),
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  roleDetailsPopover: {
    pointerEvents: "auto",
  },
  roleDetailsContent: {
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(2),
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    width: "180px",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      left: -8,
      top: "50%",
      marginTop: -8,
      borderWidth: 8,
      borderStyle: "solid",
      borderColor: "transparent #fff transparent transparent",
    },
  },
  roleDetailsContainer: {
    padding: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },
  roleName: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
  },
  rolePosition: {
    fontSize: "12px",
    color: "#888",
    marginTop: theme.spacing(0.5),
  },
}))

interface MenuItem {
  text: string
  path: any
  icon: React.ReactElement
  filledIcon: React.ReactElement
}

interface SidebarProps {
  menuItems: MenuItem[]
  history: any
  activeRoute: any
  setActiveRoute: any
  setIdentity: any
  // onComplete: any
}

const bottomNavigationItems = [{ text: "expand-collapse", icon: <SidebarExpand />, filledIcon: <SidebarCollapse /> }]

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  history,
  activeRoute,
  setActiveRoute,
  setIdentity,
  // onComplete
}) => {
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [activeIndex, setActiveIndex] = useState(0)
  const [activeBottomIndex, setActiveBottomIndex] = useState(0)
  const [sidebarCollapse, setSidebarCollapse] = useState(false)
  const [roleDetailsAnchorEl, setRoleDetailsAnchorEl] = useState<HTMLElement | null>(null)
  const [activeOption, setActiveOption] = useState<string | null>(null)
  const [otherRole, setOtherRole] = useState({
    email: null,
    role: null,
    id: null,
    firstName: null,
    lastName: null,
    origin: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchOtherUser = async () => {
      console.log("INSIDE FetchOtherUser-", LAMP.Auth._auth)
      const userType = LAMP.Auth._type
      console.log("Current userType in fetchOtherUser:", userType)
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
              Authorization: "Basic " + authString,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch researcher data")
          }

          const data = await response.json()
          const researcher = data.data
          console.log("Fetched researcher data:", researcher)

          if (researcher) {
            setOtherRole({
              email: researcher.email,
              role: "Researcher",
              id: researcher._id,
              firstName: researcher.firstName,
              lastName: researcher.lastName,
              origin: researcher._id,
            })
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
        enqueueSnackbar("Failed to load role information", { variant: "error" })
      }
    }

    fetchOtherUser()
  }, [enqueueSnackbar])

  const handleSidebarNavigation = (item: MenuItem, index: number) => {
    setActiveIndex(index)
    const newRoute = item.path.split("/").pop() || "dashboard"
    setActiveRoute(newRoute)
    history.replace(item.path)
  }

  const handleBottomNavigation = (text, index, event) => {
    setActiveBottomIndex(index)
    if (text === "expand-collapse") {
      setSidebarCollapse(!sidebarCollapse)
    }
  }

  const handleRoleDetailsPopoverClose = () => {
    setRoleDetailsAnchorEl(null)
  }

  const timezoneVal = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  const handleSwitchRole = async () => {
    try {
      setIsLoading(true)
      console.log("Switching role...", otherRole)
      console.log("Current user type:", LAMP.Auth._type)
      console.log("Current auth:", LAMP.Auth._auth)
      console.log("setIdentity prop available:", typeof setIdentity === "function")
      handleRoleDetailsPopoverClose()

      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

      const params = new URLSearchParams({
        origin: otherRole.origin,
        access_key: otherRole.email,
      }).toString()

      const response = await fetch(`${baseURL}/credential-update-origin?${params}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + authString,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to update origin")
      }

      const result = await response.json()
      console.log("Origin update result:", result)

      try {
        const res = await setIdentity({
          id: LAMP.Auth._auth.id,
          password: LAMP.Auth._auth.password,
          serverAddress: LAMP.Auth._auth.serverAddress,
          switchRole: true,
        })

        console.log("Identity set result:", res)

        if (res.authType === "researcher") {
          if (res.auth.serverAddress === "demo.lamp.digital") {
            let studiesSelected =
              localStorage.getItem("studies_" + res.identity.id) !== null
                ? JSON.parse(localStorage.getItem("studies_" + res.identity.id))
                : []
            if (studiesSelected.length === 0) {
              let studiesList = [res.identity.name]
              localStorage.setItem("studies_" + res.identity.id, JSON.stringify(studiesList))
              localStorage.setItem("studyFilter_" + res.identity.id, JSON.stringify(1))
            }
          } else {
            let researcherT = res.identity
            researcherT.timestamps.lastLoginAt = new Date().getTime()
            researcherT.loggedIn = true
            await LAMP.Researcher.update(researcherT.id, researcherT)
          }
          const params = new URLSearchParams({
            origin: null,
            access_key: otherRole.email,
          }).toString()

          const response = await fetch(`${baseURL}/credential-update-origin?${params}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + authString,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to update origin")
          }
        }

        await Service.deleteDB()
        await Service.deleteUserDB()

        if (otherRole.role === "Researcher") {
          console.log("Auth after switch:", LAMP.Auth._me, LAMP.Auth._auth, LAMP.Auth._type)
          window.location.replace(`/#/researcher/${otherRole.id}/studies`)
        } else {
          window.location.replace(`/`)
        }

        enqueueSnackbar(`Successfully switched to ${otherRole.role} role`, { variant: "success" })
      } catch (err) {
        console.error("Error with auth request:", err)
        enqueueSnackbar(t("Incorrect username, password, or server address."), { variant: "error" })
      }
    } catch (error) {
      console.error("Error switching role:", error)
      enqueueSnackbar(`Failed to switch role: ${error.message}`, { variant: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchRoleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (otherRole.email) {
      console.log("Opening role details popover", otherRole)
      setRoleDetailsAnchorEl(event.currentTarget)
    } else {
      console.log("No other role available")
      enqueueSnackbar("No alternate role available", { variant: "info" })
    }
  }

  // Helper to get the final segment of a path (eg. '/admin/dashboard' -> 'dashboard')
  const getRouteName = (path: string) => {
    try {
      const parts = path.split("/")
      const last = parts.pop()
      return last || "dashboard"
    } catch (e) {
      return "dashboard"
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.text === "Admins") {
      return LAMP.Auth._type === "admin"
    }
    return true
  })

  return (
    <div className={`sidebar ${sidebarCollapse ? "collapse" : ""}`}>
      <div className="logo">
        <Logo className="logo-icon" />
        {sidebarCollapse ? null : <span className="platform-name">emersive</span>}
        {sidebarCollapse ? null : <span className="platform-tag">MOBILE SENSING FOR RESEARCH</span>}
      </div>

      <div className="list-container">
        <List className="sidebar-list">
          {filteredMenuItems.map((item, index) => {
            const routeName = getRouteName(item.path)
            const isActive = routeName === activeRoute
            return (
              <ListItem
                key={index}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => handleSidebarNavigation(item, index)}
              >
                <ListItemIcon className={`sidebar-icon`}>{isActive ? item.filledIcon : item.icon}</ListItemIcon>
                {sidebarCollapse ? null : <ListItemText primary={item.text} />}
              </ListItem>
            )
          })}
        </List>
      </div>
      <div className="bottom-list-container">
        <List className={`bottom-list ${sidebarCollapse ? "collapse" : ""}`}>
          {bottomNavigationItems.map((item, index) => (
            <ListItem
              className="sidebar-bottom-item"
              key={index}
              onClick={(event) => handleBottomNavigation(item.text, index, event)}
            >
              <ListItemIcon className="sidebar-bottom-icon">
                {item.text === "expand-collapse" ? (sidebarCollapse ? item.icon : item.filledIcon) : item.icon}
              </ListItemIcon>
              {!sidebarCollapse && item.text === "expand-collapse" && (
                <ListItemText primary="COLLAPSE" className="sidebar-bottom-text" />
              )}
            </ListItem>
          ))}
        </List>
      </div>

      {/* Role Details Popover */}
      <Popover
        open={Boolean(roleDetailsAnchorEl) && otherRole.email !== null}
        anchorEl={roleDetailsAnchorEl}
        onClose={handleRoleDetailsPopoverClose}
        className={classes.roleDetailsPopover}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        disableRestoreFocus
        PaperProps={{
          style: {
            overflowY: "visible",
            overflowX: "visible",
          },
        }}
      >
        <Paper className={classes.roleDetailsContent}>
          <Box className={classes.roleDetailsContainer} onClick={handleSwitchRole}>
            <Typography className={classes.roleName}>
              {otherRole.firstName} {otherRole.lastName}
            </Typography>
            <Typography className={classes.rolePosition}>{otherRole.role}</Typography>
          </Box>
        </Paper>
      </Popover>
    </div>
  )
}

export default Sidebar
