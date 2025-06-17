// Core Imports
import React, { useState, useEffect } from "react"
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  Box,
  Paper,
} from "@material-ui/core"

import { Switch, Route, useRouteMatch, Redirect, HashRouter, useLocation } from "react-router-dom"

import LAMP from "lamp-core"
import { ResponsivePaper } from "../Utils"
import { useTranslation } from "react-i18next"
import { ReactComponent as Researcher } from "../../icons/Researcher.svg"
import { ReactComponent as DataPortalIcon } from "../../icons/DataPortal.svg"
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import locale_lang from "../../locale_map.json"
import { Service } from "../DBService/DBService"
import Researchers from "./Researchers"
import DataPortal from "../data_portal/DataPortal"
import NavigationBar from "../NavigationBar"
import { useLayoutStyles } from "../GlobalStyles"
import Sidebar from "../Sidebar"
import Admins from "./Admins"

import { ReactComponent as DashboardIcon } from "../../icons/NewIcons/dashboard-panel.svg"
import { ReactComponent as DashboardIconFilled } from "../../icons/NewIcons/dashboard-panel-filled.svg"
import { ReactComponent as ResearcherIcon } from "../../icons/NewIcons/crown-line.svg"
import { ReactComponent as ResearcherIconFilled } from "../../icons/NewIcons/crown.svg"
import { ReactComponent as ParticipantsIcon } from "../../icons/NewIcons/users-thin.svg"
import { ReactComponent as ParticipantsIconFilled } from "../../icons/NewIcons/users.svg"
import { ReactComponent as DevLabIcon } from "../../icons/NewIcons/tools.svg"
import { ReactComponent as DevLabIconFilled } from "../../icons/NewIcons/tools-filled.svg"
import { ReactComponent as AccountIcon } from "../../icons/NewIcons/shield-check.svg"
import { ReactComponent as AccountIconFilled } from "../../icons/NewIcons/shield-check-filled.svg"
import { ReactComponent as AdminsIcon } from "../../icons/NewIcons/admin-alt.svg"
import { ReactComponent as AdminsIconFilled } from "../../icons/NewIcons/admin-alt.svg"

import AdminDashboard from "./AdminDashboard"
import Account from "./Account"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    researcherMenu: {
      background: "#F8F8F8",
      width: "100%",
      maxWidth: 120,
      border: 0,
      borderRadius: "20px",
      margin: theme.spacing(2),
      "& span": {
        fontSize: 14,
        whiteSpace: "normal",
      },
      "& div.Mui-selected": {
        backgroundColor: "#5784EE",
        color: "#fff",
        borderRadius: "12px",
        margin: "0 8px",
        "& path": { fill: "#fff" },
      },
    },
    menuItems: {
      width: "100%",
      margin: 0,
      borderRadius: "12px",
      "&.Mui-selected": {
        width: "100%",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 80,
      // padding: theme.spacing(2),
    },

    menuItemsBottom: {
      // backgroundColor: "pink",
      height: "100%",
      margin: 0,
      borderRadius: "12px",
      "&.Mui-selected": {
        height: "100%",
      },
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 80,
      padding: theme.spacing(2),
    },

    drawerContainer: {
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
    },
    contentContainer: {
      padding: theme.spacing(3),
      marginLeft: 136,
      [theme.breakpoints.down("sm")]: {
        marginLeft: 0,
        marginBottom: 100,
      },
    },
    mainPaper: {
      borderRadius: 20,
      backgroundColor: "#f8f8f8",
      padding: theme.spacing(2),
    },
    researcherCard: {
      padding: theme.spacing(2),
      backgroundColor: "#fff",
      marginBottom: theme.spacing(2),
      borderRadius: 16,
      "& .MuiTypography-root": {
        marginBottom: theme.spacing(1),
      },
    },
    // researcherMenu: {
    //   background: "#F8F8F8",
    //   maxWidth: 100,
    //   border: 0,
    //   [theme.breakpoints.down("sm")]: {
    //     maxWidth: "100%",
    //   },
    //   "& span": { fontSize: 12 },
    //   "& div.Mui-selected": { backgroundColor: "transparent", color: "#5784EE", "& path": { fill: "#5784EE" } },
    // },
    // menuItems: {
    //   display: "inline-block",
    //   textAlign: "center",
    //   color: "rgba(0, 0, 0, 0.4)",
    //   paddingTop: 40,
    //   paddingBottom: 30,
    //   [theme.breakpoints.down("sm")]: {
    //     paddingTop: 16,
    //     paddingBottom: 9,
    //   },
    //   [theme.breakpoints.down("xs")]: {
    //     padding: 6,
    //   },
    // },
    menuIcon: {
      minWidth: "auto",
      [theme.breakpoints.down("xs")]: {
        top: 5,
        position: "relative",
      },
      "& path": { fill: "rgba(0, 0, 0, 0.4)", fillOpacity: 0.7 },
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
    tableContainerWidthPad: {
      maxWidth: 1055,
      paddingLeft: 0,
      paddingRight: 0,
    },
    tableContainerDataPortalWidth: {
      width: "calc(100vw - 100px)",
      height: "calc(100vh - 50px)",
      paddingLeft: "0px",
      paddingRight: "0px",
      maxWidth: "100%",
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
    dataPortalPaper: {
      height: "100%",
    },
    menuOuter: {
      paddingTop: 0,
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        padding: 0,
      },
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      padding: 0,
      height: "auto",
      gap: theme.spacing(2),
    },
    menuOuterBottom: {
      // backgroundColor:"pink",
      flexDirection: "row",
      height: "100%",
      width: "98%",
    },
    logResearcher: {
      height: "100vh",
      position: "fixed",
      width: 120,
      padding: theme.spacing(2),
      overflowY: "hidden",
    },
    btnCursor: {
      "&:hover div": {
        cursor: "pointer !important",
      },
      "&:hover div > svg": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > g > rect": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > g > g > path": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > g > g > circle": {
        cursor: "pointer !important",
      },
      "&:hover div > span": {
        cursor: "pointer !important",
      },
    },
    root: {
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      padding: "0px",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      marginLeft: 240, // Expanded sidebar width
      width: "calc(100% - 240px)",
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    contentShift: {
      marginLeft: 64, // Collapsed sidebar width
      width: "calc(100% - 64px)",
    },
  })
)

export default function Root({ updateStore, adminType, authType, goBack, onLogout, setIdentity, ...props }) {
  const { t, i18n } = useTranslation()
  const [currentTab, setCurrentTab] = useState(0)
  const classes = useStyles()
  const layoutClasses = useLayoutStyles()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  // const { path } = useRouteMatch(); // This will give us the current base path (/admin)
  const { path } = useRouteMatch() // This will give us the current base path

  const location = useLocation()
  console.log("^^$E^#", location)
  const [activeRoute, setActiveRoute] = useState(() => {
    const path = location.pathname
    return path.split("/").pop() || "dashboard"
  })

  console.log("active route", activeRoute)
  useEffect(() => {
    console.log("Current location:", location)
    console.log("Current path:", path)
    console.log("Current active route:", activeRoute)
  }, [location, path, activeRoute])
  useEffect(() => {
    console.log("Active Route:", activeRoute)
    console.log("Current Path:", location.pathname)
  }, [activeRoute, location])

  const menuItems = [
    { text: "Dashboard", path: `${path}/dashboard`, icon: <DashboardIcon />, filledIcon: <DashboardIconFilled /> },
    { text: "Admins", path: `${path}/admins`, icon: <AdminsIcon />, filledIcon: <AdminsIconFilled /> },
    {
      text: "Researchers",
      path: `${path}/researchers`,
      icon: <ResearcherIcon />,
      filledIcon: <ResearcherIconFilled />,
    },
    { text: "Dev Lab", path: `${path}/dev-lab`, icon: <DevLabIcon />, filledIcon: <DevLabIconFilled /> },
    { text: "Account", path: `${path}/account`, icon: <AccountIcon />, filledIcon: <AccountIconFilled /> },
  ]

  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : lang ? lang : "en-US"
  }

  useEffect(() => {
    Service.deleteDB()
    localStorage.setItem("participants", JSON.stringify({ page: 0, rowCount: 40 }))
    localStorage.setItem("activities", JSON.stringify({ page: 0, rowCount: 40 }))
    if (LAMP.Auth._type !== "admin") return
  }, [])

  useEffect(() => {
    let authId = LAMP.Auth._auth.id
    let language = !!localStorage.getItem("LAMP_user_" + authId)
      ? JSON.parse(localStorage.getItem("LAMP_user_" + authId)).language
      : getSelectedLanguage()
      ? getSelectedLanguage()
      : "en"
    i18n.changeLanguage(language)
  }, [])

  useEffect(() => {
    console.log(
      "Available Routes:",
      menuItems.map((item) => item.path)
    )
    console.log("Current Location:", window.location.hash)
  }, [menuItems])

  return (
    <div className={classes.root}>
      <Container className={layoutClasses.mainContent}>
        <Sidebar
          menuItems={menuItems}
          history={props.history}
          activeRoute={activeRoute}
          setActiveRoute={setActiveRoute}
          onLogout={onLogout}
          setIdentity={setIdentity}
        />

        <div className="display-content-container">
          <Switch>
            {console.log("Rendering Switch with routes")}

            <Route exact path={path}>
              <Redirect to={`${path}/dashboard`} />
            </Route>

            <Route
              path={`${path}/dashboard`}
              render={(routeProps) => (
                <AdminDashboard
                  history={props.history}
                  adminType={adminType}
                  authType={authType}
                  title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
                />
              )}
            />

            <Route
              path={`${path}/researchers`}
              render={(routeProps) => (
                <Researchers
                  {...routeProps}
                  history={props.history}
                  updateStore={updateStore}
                  adminType={adminType}
                  authType={authType}
                  onLogout={onLogout}
                />
              )}
            />

            <Route path={`${path}/dev-lab`} render={(routeProps) => <AdminDashboard {...routeProps} {...props} />} />

            <Route
              path={`${path}/admins`}
              render={(routeProps) => (
                <Admins
                  history={props.history}
                  adminType={adminType}
                  authType={authType}
                  title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
                />
              )}
            />

            <Route
              path={`${path}/account`}
              render={(routeProps) => (
                <Account
                  {...routeProps}
                  {...props}
                  history={props.history}
                  updateStore={updateStore}
                  adminType={adminType}
                  authType={authType}
                  onLogout={onLogout}
                  setIdentity={setIdentity}
                  title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
                />
              )}
            />
          </Switch>
        </div>
      </Container>
    </div>
  )
}
