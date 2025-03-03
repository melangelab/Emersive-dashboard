import React, { useState, useEffect } from "react"
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Icon,
  Badge,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Container,
  Backdrop,
  CircularProgress,
  colors,
  useTheme,
  useMediaQuery,
  Popover,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import LAMP from "lamp-core"
import { Service } from "./DBService/DBService"
import { sensorEventUpdate } from "./BottomMenu"
import { CredentialManager } from "./CredentialManager"
import { ResponsiveMargin } from "./Utils"
import { getHeaderComponents } from "./Headercomps"
import SearchBox from "./SearchBox"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      marginTop: 0,
      width: "100%",
      overflowY: "hidden",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(2, 3),
      backgroundColor: "#fff",
      borderRadius: 20,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
      marginTop: theme.spacing(2),
    },
    appbarResearcher: {
      zIndex: 1111,
      position: "relative",
      boxShadow: "none",
      background: "transparent",
    },
    logResearcherToolbar: {
      background: "#7599FF",
      position: "fixed",
      width: "100%",
      zIndex: 1,
      minHeight: 50,
      justifyContent: "center",
      "& $backbtn": { color: "#fff" },
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
    logo: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      backgroundColor: "#f1f3f4",
    },
    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
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
        color: theme.palette.text.primary,
      },
      "& .role": {
        color: theme.palette.text.secondary,
        fontSize: "0.875rem",
      },
    },
    backButton: {
      marginRight: theme.spacing(2),
      color: "#5f6368",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    backbtn: {
      [theme.breakpoints.down("xs")]: {
        paddingLeft: 0,
      },
    },
    headerRight: {
      "& span": {
        color: "rgba(0, 0, 0, 0.54)",
      },
      [theme.breakpoints.down("xs")]: {
        display: "block",
        float: "right",
      },
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
    scroll: {
      position: "absolute",
      width: "100%",
      height: "100%",
      overflowY: "auto",
      left: 0,
      top: 0,
      paddingTop: 120,
      paddingBottom: 100,
      [theme.breakpoints.down("sm")]: {
        paddingTop: 94,
      },
    },
    logResearcherBorder: {
      paddingTop: 46,
      top: 50,
      height: "calc(100% - 50px)",
    },
    logParticipantBorder: {
      border: "#7599FF solid 5px",
      borderTop: 0,
      paddingTop: 110,
      top: 50,
      height: "calc(100% - 50px)",
    },
    toolbarResearcher: {
      minHeight: 50,
      width: "100%",
      background: "transparent",
      "& h5": {
        padding: "55px 0 25px",
        [theme.breakpoints.down("sm")]: {
          paddingTop: 38,
          paddingBottom: 20,
        },
      },
    },
    tableContainerWidth: {
      maxWidth: 1055,
      width: "80%",
      [theme.breakpoints.down("md")]: {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    tableContainerDataPortalWidth: {
      width: "calc(100vw - 100px)",
      height: "calc(100vh - 50px)",
      paddingLeft: "0px",
      paddingRight: "0px",
      maxWidth: "100vw",
      maxHeight: "100vh",
      top: "0px",
      left: "100px",
      overflow: "scroll",
      position: "absolute",
      [theme.breakpoints.down("sm")]: {
        left: "0px",
        width: "100vw",
        height: "calc(100vh - 150px)",
      },
    },
    thumbContainer: {
      maxWidth: 1055,
      left: 0,
      right: 0,
      position: "absolute",
      height: 50,
      "& h5": {
        fontWeight: "bold",
        color: "rgba(0, 0, 0, 0.75)",
        fontSize: 30,
        padding: "15px 0",
        background: "#fff",
      },
      [theme.breakpoints.up("md")]: {
        width: "80%",
      },
      [theme.breakpoints.up("lg")]: {
        paddingLeft: 15,
      },
    },
  })
)

interface NavigationBarProps {
  title?: string
  id?: string
  authType: string
  noToolbar?: boolean
  goBack?: () => void
  onLogout?: () => void
  activeTab?: string
  sameLineTitle?: boolean
  mode?: string
  tab?: string
  children?: React.ReactNode
}

interface HeaderComponentProps {
  researcherId: string
  studies: any[]
  mode: string
  tab: string
  order: boolean
  setOrder: (order: boolean) => void
  searchData: (query: string) => void
  title: string
  authType: string
  handleMenu: (event: React.MouseEvent<HTMLElement>) => void
}

interface HeaderBarProps {
  title?: string
  id?: string
  authType: string
  noToolbar?: boolean
  goBack?: () => void
  onLogout?: () => void
  activeTab?: string
  sameLineTitle?: boolean
  mode?: string
  tab?: string
  children?: React.ReactNode
  headerConfig?: {
    addButtonProps?: any
    filterProps?: {
      setShowFilterStudies?: (show: boolean) => void
      selectedStudies?: string[]
      setSelectedStudies?: (studies: string[]) => void
      order?: boolean
      setOrder?: (order: boolean) => void
    }
    searchProps?: {
      searchData: (query: string) => void
    }
    studies?: any[]
  }
}

const DynamicHeader: React.FC<{
  researcherId: string
  headerConfig?: HeaderBarProps["headerConfig"]
  mode: string
  tab: string
  title: string
  authType: string
  handleMenu: (event: React.MouseEvent<HTMLElement>) => void
}> = ({
  researcherId,
  headerConfig,
  mode,
  tab,
  title,
  authType,
  handleMenu,
  // React.FC<HeaderComponentProps> = ({
  //     researcherId,
  //     studies,
  //     mode,
  //     tab,
  //     order,
  //     setOrder,
  //     searchData,
  //     title,
  //     authType,
  //     handleMenu
}) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { AddComponent, FilterComponent } = getHeaderComponents(tab, mode)
  // const [anchorEl, setAnchorEl] = React.useState(null)
  // const handleClose = () => {
  //     setAnchorEl(null)
  // }
  // const [passwordChange, setPasswordChange] = useState(false)
  // const [confirmLogout, setConfirmLogout] = useState(false)
  // const [showCustomizeMenu, setShowCustomizeMenu] = useState<Element>()
  const roles = ["Administrator", "User Administrator", "Practice Lead"]
  // const open = Boolean(anchorEl)
  // const idp = open ? "simple-popover" : undefined
  // const handleClick = (event) => {
  //     setAnchorEl(event.currentTarget)
  // }

  return (
    <Box className={classes.header}>
      <Box className={classes.titleSection}>
        <Box className={classes.logo} />
        <Typography variant="h5">{tab ? t(tab.charAt(0).toUpperCase() + tab.slice(1)) : t("Investigators")}</Typography>
        {authType === "admin" && !roles.includes(title) && (
          <IconButton
            className={classes.backButton}
            onClick={() => {
              window.location.href = `/#/researcher`
            }}
          >
            <Icon>arrow_back</Icon>
          </IconButton>
        )}
      </Box>

      <Box className={classes.actionGroup}>
        <SearchBox searchData={headerConfig?.searchProps?.searchData ?? (() => {})} />

        {FilterComponent && (
          <FilterComponent
            setShowFilterStudies={headerConfig?.filterProps?.setShowFilterStudies}
            setOrder={headerConfig?.filterProps?.setOrder}
            order={headerConfig?.filterProps?.order}
          />
        )}

        {AddComponent && (
          <AddComponent researcherId={researcherId} studies={headerConfig?.studies} {...headerConfig?.addButtonProps} />
        )}

        <Box className={classes.profileSection} onClick={handleMenu}>
          <Avatar className={classes.avatar}>{title?.charAt(0) || "U"}</Avatar>
          <Box className={classes.profileInfo}>
            <Typography className="name">
              {title?.startsWith("User") && title !== "User Administrator"
                ? t("User number", { number: title.split(" ")[1] })
                : title}
            </Typography>
            <Typography className="role">{authType}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function HeaderBar({
  title,
  id,
  authType,
  noToolbar,
  goBack,
  onLogout,
  activeTab,
  sameLineTitle,
  mode,
  tab,
  headerConfig,
  children,
  ...props
}: HeaderBarProps) {
  const classes = useStyles()
  const { t } = useTranslation()
  const theme = useTheme()
  const supportsSidebar = useMediaQuery(theme.breakpoints.up("md"))
  const print = useMediaQuery("print")

  // States
  const [loading, setLoading] = useState(true)
  const [researcherId, setResId] = useState<string | null>(null)
  const [sensorData, setSensorData] = useState(null)
  const [conversations, setConversations] = useState<any>({})
  const [msgCount, setMsgCount] = useState(0)
  const [isDeleted, setIsDeleted] = useState(false)
  const [studies, setStudies] = useState<any[]>([])
  const [order, setOrder] = useState(localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")!) : true)

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [showCustomizeMenu, setShowCustomizeMenu] = useState<Element | undefined>()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const dashboardMenus = ["Learn", "Manage", "Assess", "Portal", "Feed", "Researcher"]
  const hideNotifications = ["Researcher", "Administrator"]

  const open = Boolean(anchorEl)
  const idp = open ? "simple-popover" : undefined

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
          setResId(researcher[0]?.id ?? null)
          setLoading(false)
        })
        if (id) {
          Service.getDataByKey("participants", [id], "id").then((data) => {
            setIsDeleted(data[0]?.is_deleted ?? false)
          })
        }
      } else {
        setLoading(false)
      }
      refresh()
    }
    return () => {
      isMounted = false
    }
  }, [])

  const refresh = async () => {
    if (id && id !== "me" && !sensorData) {
      let data = await LAMP.SensorEvent.allByParticipant(id, "lamp.analytics")
      data = Array.isArray(data) ? data.filter((d) => d.data.page === "conversations") : null
      setSensorData(data ? data[0] : [])
    }
  }

  useEffect(() => {
    if (sensorData !== null && id !== "me") refreshMessages()
  }, [sensorData])

  useEffect(() => {
    if (sensorData !== null && id !== "me") setMsgCount(getMessageCount())
  }, [conversations])

  const refreshMessages = async () => {
    const conversationsData = await Promise.all(
      [id || ""].map(async (x) => {
        try {
          const attachment = await LAMP.Type.getAttachment(x, "lamp.messaging")
          return [x, attachment]
        } catch (e) {
          return [x, []]
        }
      })
    )

    setConversations(
      Object.fromEntries(
        conversationsData.filter((x: any) => x[1].message !== "404.object-not-found").map((x: any) => [x[0], x[1].data])
      )
    )
  }

  const getMessageCount = () => {
    const messages = conversations[id] || []
    return Array.isArray(messages)
      ? messages.filter((a) => a.from === "researcher" && new Date(a.date).getTime() > (sensorData?.timestamp ?? 0))
          .length
      : 0
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const participantBack = () => {
    if (!researcherId) {
      Service.getAll("researcher").then((researcher) => {
        const id = researcher[0]?.id
        setResId(id)
        window.location.href = `/#/researcher/${id}/users`
      })
    } else {
      window.location.href = `/#/researcher/${researcherId}/users`
    }
  }

  const onDeleteAccount = async () => {
    if (!id) return

    await LAMP.Type.setAttachment(id, "me", "lamp.is_deleted", true)
    const credentials = await LAMP.Credential.list(id)
    for (const cred of credentials.filter((c) => c.hasOwnProperty("origin"))) {
      await LAMP.Credential.delete(id, cred.accessKey)
    }
    await LAMP.Type.setAttachment(id, "me", "lamp.name", null)

    await Service.updateValue("participants", { participants: [{ is_deleted: true, id }] }, "is_deleted", "id")

    if (authType === "researcher" || authType === "admin") {
      participantBack()
    } else {
      onLogout?.()
    }
  }

  const updateAnalytics = async () => {
    if (!id) return
    setSensorData(null)
    window.location.href = `/#/participant/${id}/messages`
    await sensorEventUpdate("conversations", id, null)
    let data = await LAMP.SensorEvent.allByParticipant(id, "lamp.analytics")
    data = data.filter((d) => d.data.page === "conversations")
    setSensorData(data[0] || [])
  }

  return (
    <Box className={classes.mainContainer}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {!noToolbar && !print && (
        <AppBar position="static" className={classes.appbarResearcher}>
          {(authType === "researcher" || authType === "admin") && (
            <Toolbar className={classes.logResearcherToolbar}>
              {title?.startsWith("User") && title !== "User Administrator" ? (
                <Box>
                  <IconButton className={classes.backbtn} onClick={participantBack} color="default">
                    <Icon>arrow_back</Icon>
                  </IconButton>
                  {`${t("Patient View")}`}: {id}
                </Box>
              ) : (
                <DynamicHeader
                  researcherId={researcherId!}
                  // studies={studies}
                  headerConfig={headerConfig}
                  mode={mode!}
                  tab={tab!}
                  // order={order}
                  // setOrder={setOrder}
                  // searchData={query => {/* Implement search */}}
                  title={title!}
                  authType={authType}
                  handleMenu={handleMenu}
                />
              )}
            </Toolbar>
          )}

          {typeof title !== "undefined" &&
            title.startsWith("User") &&
            title !== "User Administrator" &&
            !hideNotifications.includes(activeTab || "") && (
              <Box className={classes.headerRight}>
                <Tooltip title={t("Notifications")}>
                  <Badge
                    badgeContent={msgCount > 0 ? msgCount : undefined}
                    color="primary"
                    onClick={() => {
                      localStorage.setItem(`lastTab${id}`, JSON.stringify(Date.now()))
                      updateAnalytics()
                    }}
                  >
                    <Icon>comment</Icon>
                  </Badge>
                </Tooltip>
              </Box>
            )}
        </AppBar>
      )}
      <Popover
        classes={{ root: classes.customPopover, paper: classes.customPaper }}
        id={idp}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {authType === "admin" && (
          <MenuItem onClick={() => setPasswordChange(true)}>{`${t("Manage Credentials")}`}</MenuItem>
        )}
        <MenuItem divider onClick={() => setConfirmLogout(true)}>
          {`${t("Logout")}`}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(undefined)
            window.open("https://docs.lamp.digital", "_blank")
          }}
        >
          {`${t("Help & Support")}`}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(undefined)
            window.open("https://community.lamp.digital", "_blank")
          }}
        >
          {`${t("LAMP Community")}`}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(undefined)
            window.open("mailto:abhijeet.singh@ihub-anubhuti-iiitd.org", "_blank")
          }}
        >
          {`${t("Contact Us")}`}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(undefined)
            window.open("https://docs.lamp.digital/privacy/", "_blank")
          }}
        >
          <b style={{ color: colors.grey["600"] }}>{`${t("Privacy Policy")}`}</b>
        </MenuItem>
      </Popover>

      {/* Main content */}
      <Box className={classes.contentContainer}>{children}</Box>

      {/* Dialogs */}
      <Dialog
        open={confirmLogout || confirmDelete}
        onClose={() => {
          setConfirmLogout(false)
          setConfirmDelete(false)
        }}
      >
        <DialogTitle>{t(confirmDelete ? "Confirmation" : "Are you sure you want to log out?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              confirmDelete ? "Are you sure you want to delete account?" : "Please save any changes before logging out."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {confirmLogout && (
            <Button onClick={() => setConfirmLogout(false)} color="secondary">
              {t("Go Back")}
            </Button>
          )}
          <Button
            onClick={() => {
              if (confirmLogout) {
                onLogout?.()
                setConfirmLogout(false)
              } else {
                onDeleteAccount()
                setConfirmDelete(false)
              }
            }}
            color="primary"
            autoFocus
          >
            {t(confirmDelete ? "Delete" : "Logout")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordChange} onClose={() => setPasswordChange(false)}>
        <DialogContent>
          <CredentialManager id={id || LAMP.Auth._auth.id} type={title} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
