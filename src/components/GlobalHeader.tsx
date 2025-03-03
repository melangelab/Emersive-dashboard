import React, { useState, useEffect } from "react"
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
  Icon,
  Badge,
  Tooltip,
  Popover,
  makeStyles,
  Theme,
  createStyles,
  Backdrop,
  CircularProgress,
  colors,
} from "@material-ui/core"
import { Add as AddIcon, FilterList as FilterListIcon, Search as SearchIcon } from "@material-ui/icons"
import { useTranslation } from "react-i18next"
import { CredentialManager } from "./CredentialManager"
import { Service } from "./DBService/DBService"
import LAMP from "lamp-core"

const dashboardMenus = ["Learn", "Manage", "Assess", "Portal", "Feed", "Researcher"]
const hideNotifications = ["Researcher", "Administrator"]
const roles = ["Administrator", "User Administrator", "Practice Lead"]

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(2, 3),
      backgroundColor: "#fff",
      borderRadius: 20,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(2),
    },
    backButton: {
      marginRight: theme.spacing(2),
      color: "#5f6368",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    titleSection: {
      display: "flex",
      alignItems: "center",
      "& h5": {
        fontSize: "24px",
        fontWeight: 500,
        marginLeft: theme.spacing(2),
      },
    },
    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
    },
    addButton: {
      backgroundColor: "#4285f4",
      color: "#fff",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "#3367d6",
      },
    },
    filterButton: {
      backgroundColor: "#f1f3f4",
      color: "#5f6368",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#e8eaed",
      },
    },
    searchButton: {
      padding: 8,
      backgroundColor: "#fff",
      border: "1px solid #dadce0",
      borderRadius: 20,
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    profileSection: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      borderRadius: 20,
      padding: "4px 8px",
      display: "flex",
      alignItems: "center",
      marginLeft: theme.spacing(2),
    },
    avatar: {
      width: 36,
      height: 36,
      marginRight: theme.spacing(1),
    },
    profileInfo: {
      display: "flex",
      flexDirection: "column",
      "& .name": {
        fontWeight: 500,
      },
      "& .role": {
        color: theme.palette.text.secondary,
        fontSize: "0.875rem",
      },
    },
    mainContainer: {
      marginTop: 0,
      paddingBottom: 56,
      width: "100%",
      overflowY: "hidden",
    },
    contentContainer: {
      width: "80%",
      margin: "20px auto",
      position: "relative",
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    notifications: {
      marginRight: theme.spacing(2),
    },
    customPopover: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    customPaper: {
      maxWidth: 380,
      maxHeight: 600,
      marginTop: 25,
      minWidth: 320,
      marginLeft: 15,
      borderRadius: 10,
      padding: "10px 0",
      "& h6": { fontSize: 16, fontWeight: 600 },
      "& li": {
        display: "inline-block",
        width: "100%",
        padding: "15px 30px",
        fontSize: 16,
        fontWeight: 600,
        "&:hover": { backgroundColor: "#ECF4FF" },
      },
      "& *": { cursor: "pointer" },
    },
  })
)

export default function GlobalHeader({ title, id, authType, goBack, onLogout, activeTab, ...props }) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const [passwordChange, setPasswordChange] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loading, setLoading] = useState(true)
  const [researcherId, setResId] = useState(null)
  const [msgCount, setMsgCount] = useState(0)
  const [conversations, setConversations] = useState({})
  const [sensorData, setSensorData] = useState(null)

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      if (
        (authType === "researcher" || authType === "admin") &&
        typeof title != "undefined" &&
        title.startsWith("User") &&
        title !== "User Administrator"
      ) {
        Service.getAll("researcher").then((researcher) => {
          setResId(researcher[0] && researcher[0]["id"] ? researcher[0]["id"] : "")
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
      refresh()
    }
    return () => {
      isMounted = false
    }
  }, [])

  const refresh = () => {
    if (!!id && id !== "me") {
      if (sensorData === null) {
        ;(async () => {
          let data = await LAMP.SensorEvent.allByParticipant(id, "lamp.analytics")
          data = Array.isArray(data) ? (data || []).filter((d) => d.data.page === "conversations") : null
          setSensorData(!!data ? data[0] : [])
        })()
      }
    }
  }

  useEffect(() => {
    if (sensorData !== null && id !== "me") refreshMessages()
  }, [sensorData])

  useEffect(() => {
    if (sensorData !== null && id !== "me") setMsgCount(getMessageCount())
  }, [conversations])

  const refreshMessages = async () => {
    setConversations(
      Object.fromEntries(
        (
          await Promise.all(
            [id || ""].map(async (x) => [x, await LAMP.Type.getAttachment(x, "lamp.messaging").catch((e) => [])])
          )
        )
          .filter((x: any) => x[1].message !== "404.object-not-found")
          .map((x: any) => [x[0], x[1].data])
      )
    )
  }

  const getMessageCount = () => {
    let x = (conversations || {})[id || ""] || []
    return !Array.isArray(x)
      ? 0
      : x.filter((a) => a.from === "researcher" && new Date(a.date).getTime() > (sensorData?.timestamp ?? 0)).length
  }

  const handleMenu = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleLogoutClick = () => {
    handleClose()
    setConfirmLogout(true)
  }

  const participantBack = () => {
    if (researcherId === null) {
      Service.getAll("researcher").then((researcher) => {
        setResId(researcher[0]["id"])
        window.location.href = `/#/researcher/${researcher[0]["id"]}/users`
      })
    } else {
      window.location.href = `/#/researcher/${researcherId}/users`
    }
  }

  const updateAnalytics = async () => {
    setSensorData(null)
    window.location.href = `/#/participant/${id}/messages`
    // await LAMP.SensorEvent.create(id, "lamp.analytics", {
    //   page: "conversations",
    //   timestamp: new Date().getTime(),
    // })
    let data = await LAMP.SensorEvent.allByParticipant(id, "lamp.analytics")
    data = (data || []).filter((d) => d.data.page === "conversations")
    setSensorData(data ? data[0] : [])
  }

  return (
    <Box className={classes.mainContainer}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container maxWidth={false}>
        <Box className={classes.header}>
          <Box className={classes.titleSection}>
            {((authType === "admin" && !roles.includes(title)) ||
              (typeof title != "undefined" && title.startsWith("User") && title !== "User Administrator")) && (
              <IconButton
                className={classes.backButton}
                onClick={() => {
                  if (authType === "admin" && !roles.includes(title)) {
                    window.location.href = `/#/researcher`
                  } else {
                    participantBack()
                  }
                }}
              >
                <Icon>arrow_back</Icon>
              </IconButton>
            )}

            <Avatar className={classes.avatar}>{title?.charAt(0) || "U"}</Avatar>

            <Typography variant="h5">
              {(authType === "researcher" || authType === "admin") &&
              typeof title != "undefined" &&
              title.startsWith("User") &&
              title !== "User Administrator"
                ? `${t("Patient View")}: ${id}`
                : activeTab || "Investigators"}
            </Typography>
          </Box>

          <Box className={classes.actionGroup}>
            {/* Show actions only if not in patient view */}
            {!(title?.startsWith("User") && title !== "User Administrator") && (
              <>
                <IconButton className={classes.searchButton}>
                  <SearchIcon />
                </IconButton>

                <Button variant="contained" className={classes.filterButton} startIcon={<FilterListIcon />}>
                  Filter
                </Button>

                <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />}>
                  Add
                </Button>
              </>
            )}

            {/* Notifications */}
            {typeof title != "undefined" &&
              title.startsWith("User") &&
              title !== "User Administrator" &&
              hideNotifications.indexOf(activeTab) < 0 && (
                <Tooltip title={t("Notifications")}>
                  <Badge
                    badgeContent={msgCount > 0 ? msgCount : undefined}
                    color="primary"
                    className={classes.notifications}
                    onClick={updateAnalytics}
                  >
                    <Icon>comment</Icon>
                  </Badge>
                </Tooltip>
              )}

            {/* Profile Section */}
            <Box className={classes.profileSection} onClick={handleMenu}>
              <Avatar className={classes.avatar}>{title?.charAt(0) || "U"}</Avatar>
              <Box className={classes.profileInfo}>
                <Typography className="name">
                  {title?.startsWith("User") && title !== "User Administrator"
                    ? t("User number", { number: title.split(" ")[1] })
                    : title}
                </Typography>
                <Typography className="role">{authType || "Role"}</Typography>
              </Box>
            </Box>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              classes={{
                paper: classes.customPaper,
              }}
            >
              {authType === "admin" && (
                <MenuItem onClick={() => setPasswordChange(true)}>{t("Manage Credentials")}</MenuItem>
              )}
              <MenuItem onClick={handleLogoutClick}>{t("Logout")}</MenuItem>
              <MenuItem onClick={() => window.open("https://docs.lamp.digital", "_blank")}>
                {t("Help & Support")}
              </MenuItem>
              <MenuItem onClick={() => window.open("https://community.lamp.digital", "_blank")}>
                {t("LAMP Community")}
              </MenuItem>
              <MenuItem onClick={() => window.open("mailto:team@digitalpsych.org", "_blank")}>
                {t("Contact Us")}
              </MenuItem>
              <MenuItem onClick={() => window.open("https://docs.lamp.digital/privacy/", "_blank")}>
                <b style={{ color: colors.grey["600"] }}>{t("Privacy Policy")}</b>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Main Content */}
        <Box>{props.children}</Box>

        {/* Dialogs */}
        <Dialog open={passwordChange} onClose={() => setPasswordChange(false)}>
          <DialogContent>
            <CredentialManager id={id || LAMP.Auth._auth.id} type={title} />
          </DialogContent>
        </Dialog>

        <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
          <DialogTitle>{t("Are you sure you want to log out of LAMP right now?")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("If you've made some changes, make sure they're saved before you continue to log out.")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmLogout(false)} color="secondary">
              {t("Go Back")}
            </Button>
            <Button
              onClick={() => {
                onLogout()
                setConfirmLogout(false)
              }}
              color="primary"
              autoFocus
            >
              {t("Logout")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
