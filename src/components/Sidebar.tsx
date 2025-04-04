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

import { ReactComponent as Envelope } from "../icons/NewIcons/envelope.svg"
import { ReactComponent as Web } from "../icons/NewIcons/site-alt.svg"
import { ReactComponent as WebFilled } from "../icons/NewIcons/site-alt-filled.svg"
import { ReactComponent as Logout } from "../icons/NewIcons/power.svg"
import { ReactComponent as SidebarCollapse } from "../icons/NewIcons/sidebar-collapse.svg"
import { ReactComponent as SidebarExpand } from "../icons/NewIcons/sidebar-expand.svg"
import { makeStyles } from "@material-ui/core/styles"
import { ReactComponent as LogOutIcon } from "../icons/NewIcons/exit.svg"
import { ReactComponent as SwitchRoleIcon } from "../icons/NewIcons/replace.svg"

import { Service } from "./DBService/DBService"
import locale_lang from "../locale_map.json"
import { useTranslation } from "react-i18next"
import { Redirect } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "auto",
  },
  logoutOption: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    cursor: "pointer",
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  optionText: {
    fontSize: "15px",
    color: "#666",
    fontWeight: 400,
  },
  activeOption: {
    backgroundColor: "#FADCD3",
  },
  popoverContent: {
    pointerEvents: "auto",
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(2),
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    width: "180px",
    position: "relative",
    overflow: "visible",
    "&::after": {
      content: '""',
      position: "absolute",
      top: -8,
      left: "50%",
      marginLeft: -8,
      borderWidth: 8,
      borderStyle: "solid",
      borderColor: "transparent transparent #fff transparent",
    },
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
  onLogout: any
  setIdentity: any
  // onComplete: any
}

const bottomNavigationItems = [
  { text: "Mail", icon: <Envelope />, filledIcon: <Envelope /> },
  { text: "Web", icon: <Web />, filledIcon: <WebFilled /> },
  { text: "Logout", icon: <Logout />, filledIcon: <Logout /> },
  { text: "expand-collapse", icon: <SidebarExpand />, filledIcon: <SidebarCollapse /> },
]

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  history,
  activeRoute,
  setActiveRoute,
  onLogout,
  setIdentity,
  // onComplete
}) => {
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [activeIndex, setActiveIndex] = useState(0)
  const [activeBottomIndex, setActiveBottomIndex] = useState(0)
  const [sidebarCollapse, setSidebarCollapse] = useState(true)
  const [logoutAnchorEl, setLogoutAnchorEl] = useState<HTMLElement | null>(null)
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
      try {
        if (LAMP.Auth._type === "admin") {
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
          try {
            const response: any = await LAMP.Type.getAttachment(temp.id, "emersive.profile")
            const admin = response.data
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
    } else if (text === "Logout") {
      if (logoutAnchorEl) {
        setLogoutAnchorEl(null)
      } else {
        setLogoutAnchorEl(event.currentTarget)
      }
    }
  }

  const handleLogoutPopoverClose = () => {
    setLogoutAnchorEl(null)
  }

  const handleRoleDetailsPopoverClose = () => {
    setRoleDetailsAnchorEl(null)
  }

  const handleLogOut = () => {
    onLogout()
    handleLogoutPopoverClose()
  }

  const timezoneVal = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  const handleSwitchRole = async () => {
    try {
      setIsLoading(true)
      console.log("Switching role...", otherRole)
      handleRoleDetailsPopoverClose()
      handleLogoutPopoverClose()

      if (!otherRole.origin || !otherRole.email) {
        throw new Error("Missing origin or email for role switch")
      }

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
        })

        console.log("Identity set result:", res)

        if (res.authType === "participant") {
          localStorage.setItem("lastTab" + res.identity.id, JSON.stringify(new Date().getTime()))

          await LAMP.SensorEvent.create(res.identity.id, {
            timestamp: Date.now(),
            sensor: "lamp.analytics",
            data: {
              type: "login",
              device_type: "Dashboard",
              user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
            },
          } as any)

          await LAMP.Type.setAttachment(res.identity.id, "me", "lamp.participant.timezone", timezoneVal())

          const part_full = (await LAMP.Participant.view(res.identity.id)) as any
          const partici = {
            ...part_full,
            isLoggedIn: true,
            systemTimestamps: {
              ...part_full.systemTimestamps,
              lastLoginTime: new Date(),
            },
          }

          await LAMP.Participant.update(res.identity.id, partici)
        }

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
        }

        await Service.deleteDB()
        await Service.deleteUserDB()

        if (otherRole.role === "Researcher") {
          // history.replace(`/researcher/${otherRole.id}/studies`)
          // history.replace(`/`)
          // <Redirect to={`/researcher/${otherRole.id}/studies`} />
          // setTimeout(() => {
          //     history.replace(`/researcher/${otherRole.id}/studies`);
          // }, 500);
          console.log("Auth after switch:", LAMP.Auth._me, LAMP.Auth._auth, LAMP.Auth._type)
          // window.location.href = `/#/researcher/${otherRole.id}/studies`;
          window.location.replace(`/#/researcher/${otherRole.id}/studies`)
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

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.text === "Admins") {
      return LAMP.Auth._type === "admin"
    }
    return true
  })

  return (
    <div className={`sidebar ${sidebarCollapse ? "collapse" : ""}`}>
      <div className="logo-component">
        <Logo />
      </div>

      {sidebarCollapse ? null : <span className="platform-name">emersive</span>}
      {sidebarCollapse ? null : <span className="platform-desc">MOBILE SENSING RESEARCH</span>}

      <div className="list-container">
        <List className="sidebar-list">
          {filteredMenuItems.map((item, index) => (
            <ListItem key={index} className={`sidebar-item`} onClick={() => handleSidebarNavigation(item, index)}>
              <ListItemIcon className={`sidebar-icon ${item.path.includes(activeRoute) ? "active" : ""}`}>
                {item.path.includes(activeRoute) ? item.filledIcon : item.icon}
              </ListItemIcon>
              {sidebarCollapse ? null : <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </div>
      <div className="bottom-list-container">
        <List className={`bottom-list ${sidebarCollapse ? "collapse" : ""}`}>
          {bottomNavigationItems.map((item, index) =>
            sidebarCollapse && (item.text === "Web" || item.text === "Mail") ? null : (
              <ListItem
                className="sidebar-bottom-item"
                key={index}
                onClick={(event) => handleBottomNavigation(item.text, index, event)}
              >
                <ListItemIcon className="sidebar-bottom-icon">
                  {index === activeBottomIndex
                    ? item.text === "expand-collapse"
                      ? sidebarCollapse
                        ? item.icon
                        : item.filledIcon
                      : item.filledIcon
                    : item.text === "expand-collapse"
                    ? sidebarCollapse
                      ? item.icon
                      : item.filledIcon
                    : item.icon}
                </ListItemIcon>
              </ListItem>
            )
          )}
        </List>
      </div>

      {/* Logout Popover */}
      <Popover
        open={Boolean(logoutAnchorEl)}
        anchorEl={logoutAnchorEl}
        onClose={handleLogoutPopoverClose}
        className={classes.popover}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        disableRestoreFocus
        PaperProps={{
          style: {
            overflowY: "visible",
            overflowX: "visible",
          },
        }}
      >
        <Paper className={classes.popoverContent}>
          <Box
            className={`${classes.logoutOption} ${activeOption === "logout" ? classes.activeOption : ""}`}
            onClick={() => {
              setActiveOption(activeOption === "logout" ? null : "logout")
              handleLogOut()
            }}
          >
            <LogOutIcon className={classes.optionIcon} />
            <Typography className={classes.optionText}>Log Out</Typography>
          </Box>

          <Box
            className={`${classes.switchRoleOption} ${activeOption === "switchRole" ? classes.activeOption : ""}`}
            onClick={(event) => {
              setActiveOption(activeOption === "switchRole" ? null : "switchRole")
              handleSwitchRoleClick(event)
            }}
          >
            <SwitchRoleIcon className={classes.optionIcon} />
            <Typography className={classes.optionText}>Switch Role</Typography>
          </Box>
        </Paper>
      </Popover>

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
