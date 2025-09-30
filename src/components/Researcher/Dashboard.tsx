import React, { useState, useEffect } from "react"
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  makeStyles,
  Theme,
  createStyles,
  CircularProgress,
  Backdrop,
} from "@material-ui/core"

import { useRouteMatch, useLocation } from "react-router-dom"

import ParticipantList from "./ParticipantList/Index"
import ActivityList from "./ActivityList/Index"
import SensorsList from "./SensorsList/Index"
import StudiesList from "./Studies/Index"
import SharedStudiesList from "./Studies/SharedStudy"
import { ResponsivePaper } from "../Utils"
import { ReactComponent as Logo } from "../../icons/Logo.svg"

import { ReactComponent as Patients } from "../../icons/NewIcons/users-thin.svg"
import { ReactComponent as PatientsFilled } from "../../icons/NewIcons/users.svg"

import { ReactComponent as Activities } from "../../icons/NewIcons/time-fast.svg"
import { ReactComponent as ActivitiesFilled } from "../../icons/NewIcons/time-fast-filled.svg"

import { ReactComponent as Sensors } from "../../icons/NewIcons/sensor-on.svg"
import { ReactComponent as SensorsFilled } from "../../icons/NewIcons/sensor-on-filled.svg"

import { ReactComponent as Studies } from "../../icons/NewIcons/flask-gear.svg"
import { ReactComponent as StudiesFilled } from "../../icons/NewIcons/flask-gear-filled.svg"

import { ReactComponent as AccountIcon } from "../../icons/NewIcons/shield-check.svg"
import { ReactComponent as AccountIconFilled } from "../../icons/NewIcons/shield-check-filled.svg"

import { useTranslation } from "react-i18next"
import { Service } from "../DBService/DBService"
import LAMP from "lamp-core"
import useInterval from "../useInterval"
import DataPortal from "../data_portal/DataPortal"
import { ReactComponent as DeleteSweepIcon } from "../../icons/recycle-bin-filled.svg"
import { ReactComponent as DeleteSweepOutlinedIcon } from "../../icons/recycle-bin.svg"

import ArchivedView from "./ArchiveList/ArchivedItemsView"
import ArchivedItemsView from "./ArchiveList/ArchivedItemsView"
import ArchivedList from "./ArchiveList/Index"
import { useHeaderStyles } from "./SharedStyles/HeaderStyles"

import Sidebar from "../Sidebar"
import { useLayoutStyles } from "../GlobalStyles"

import { styled } from "@mui/material/styles"
import "../Admin/admin.css"
import Account from "../Admin/Account"

const IconWrapper = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
})

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    researcherMenu: {
      background: "#F8F8F8",
      maxWidth: 100,
      border: 0,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "100%",
      },
      "& span": { fontSize: 12 },
      "& div.Mui-selected": { backgroundColor: "transparent", color: "#5784EE", "& path": { fill: "#5784EE" } },
    },
    menuItems: {
      display: "inline-block",
      textAlign: "center",
      color: "rgba(0, 0, 0, 0.4)",
      paddingTop: 40,
      paddingBottom: 30,
      [theme.breakpoints.down("sm")]: {
        paddingTop: 16,
        paddingBottom: 9,
      },
      [theme.breakpoints.down("xs")]: {
        padding: 6,
      },
    },
    root: {
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      padding: "0px",
    },
    menuIcon: {
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "50px",
      height: "50px",
      "& svg": {
        fill: "#FFFFFF",
        width: "26px",
        height: "26px",
      },
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
    backdrop: {
      zIndex: 111111,
      color: "#fff",
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
    dataPortalPaper: {
      height: "100%",
      // width: "100%"
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
      marginTop: 50,
      zIndex: 1111,
      [theme.breakpoints.up("md")]: {
        height: "calc(100vh - 55px)",
      },
      [theme.breakpoints.down("sm")]: {
        borderBottom: "#7599FF solid 5px",
        borderRight: "#7599FF solid 5px",
      },
    },
    stickyDrawerPaper: {
      position: "sticky",
      top: 0,
      alignSelf: "flex-start",
      zIndex: 1200,
    },
    logo: {
      // width: theme.spacing(10), // Scales dynamically (5 * 8px = 40px)
      // height: theme.spacing(10),
      borderRadius: "50%",
    },
    btnCursor: {
      "&:hover div": {
        cursor: "pointer !important",
      },
      "&:hover div > svg": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > path": {
        cursor: "pointer !important",
      },
      "&:hover div > span": {
        cursor: "pointer !important",
      },
    },
  })
)
const sortStudies = (studies, order) => {
  return (studies || []).sort((a, b) => {
    return !!order
      ? a["name"] > b["name"]
        ? 1
        : a["name"] < b["name"]
        ? -1
        : 0
      : a["name"] < b["name"]
      ? 1
      : a["name"] > b["name"]
      ? -1
      : 0
  })
}

export const sortData = (data, studies, key) => {
  let result = []
  ;(studies || []).map((study) => {
    let filteredData = data.filter((d) => d.study_name === study)
    filteredData.sort((a, b) => {
      return a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
    })
    result = result.concat(filteredData)
  })
  return [...new Map(result.map((item) => [item["id"], item])).values()]
}
// export interface Study {
//   id?: string
//   name?: string
//   participant_count?: number
//   activity_count?: number
//   sensor_count?: number
// }
export default function Dashboard({ onParticipantSelect, researcherId, mode, tab, onLogout, ...props }) {
  const [studies, setStudies] = useState(null)
  const [notificationColumn, setNotification] = useState(false)
  const [selectedStudies, setSelectedStudies] = useState([])
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [updatedData, setUpdatedData] = useState(null)
  const [deletedData, setDeletedData] = useState(null)
  const [newStudy, setNewStudy] = useState(null)
  const [search, setSearch] = useState(null)
  const [researcher, setResearcher] = useState(null)
  const [order, setOrder] = useState(localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : true)
  const classes = useStyles()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  const headerclasses = useHeaderStyles()
  const [sharedstudies, setsharedStudies] = useState(null)

  const layoutClasses = useLayoutStyles()

  const { path } = useRouteMatch()
  const location = useLocation()
  const currPath = location.pathname
  const pathSegments = currPath.split("/")
  pathSegments.pop()
  const currentBaseRoute = pathSegments.join("/") || "/"

  const [activeRoute, setActiveRoute] = useState(() => {
    const currPath = location.pathname
    console.log("Active Route in the researcher dashboard:", currPath.split("/").pop())
    console.log("Path variable in researcher and adding something to it:", path, `${path}/dev-lab`)
    return currPath.split("/").pop() || "dashboard"
  })

  // const [currentBaseRoute, setCurrentBaseRoute] = useState(() => {
  //   const currPath = location.pathname
  //   console.log("Active Route in researcher dashboard", currPath.split("/").pop())
  //   const pathSegments = currPath.split("/");
  //   pathSegments.pop();
  //   console.log("Excluding Active Route in researcher dashboard", pathSegments.join("/") || "/")
  //   console.log("Path variable and Adding something to the path variable", path, `${path}/participants`)
  //   return pathSegments.join("/") || "/"
  // })

  const menuItems = [
    { text: "Studies", path: `${currentBaseRoute}/studies`, icon: <Studies />, filledIcon: <StudiesFilled /> },
    { text: "Participants", path: `${currentBaseRoute}/users`, icon: <Patients />, filledIcon: <PatientsFilled /> },
    { text: "Sensors", path: `${currentBaseRoute}/sensors`, icon: <Sensors />, filledIcon: <SensorsFilled /> },
    {
      text: "Activities",
      path: `${currentBaseRoute}/activities`,
      icon: <Activities />,
      filledIcon: <ActivitiesFilled />,
    },
    {
      text: "Archived",
      path: `${currentBaseRoute}/archived`,
      icon: <DeleteSweepOutlinedIcon />,
      filledIcon: <DeleteSweepIcon />,
    },
    {
      text: "Account",
      path: `${currentBaseRoute}/account`,
      icon: <AccountIcon />,
      filledIcon: <AccountIconFilled />,
    },
  ]

  useInterval(
    () => {
      setLoading(true)
      getDBStudies()
    },
    (!studies || studies.length === 0) && (!sharedstudies || sharedstudies.length === 0) ? 60000 : null,
    true
  )

  useEffect(() => {
    LAMP.Researcher.view(researcherId).then(setResearcher)
    console.log("LAMP.Auth._me.", LAMP.Auth._me, LAMP.Auth._auth)
  }, [])

  useEffect(() => {
    getAllStudies()
  }, [researcher])

  useEffect(() => {
    if (!!newStudy) getAllStudies()
  }, [newStudy])

  useEffect(() => {
    if (updatedData !== null) {
      getAllStudies()
      // Reset the updatedData after processing
      setUpdatedData(null)
    }
  }, [updatedData])

  useEffect(() => {
    if (deletedData !== null) getAllStudies()
  }, [deletedData])

  const getDBStudies = async () => {
    // TODO Add researcherId to the Service.getAll calls for studies , sharedstudies
    Service.getAll("studies", researcherId).then((studies) => {
      setStudies(sortStudies(studies, order))
      setLoading(false)
      Service.getAll("researcher").then((data) => {
        let researcherNotification = !!data ? data[0]?.notification ?? false : false
        setNotification(researcherNotification)
      })
    })
    Service.getAll("sharedstudies", researcherId).then((study_data) => {
      setsharedStudies(sortStudies(study_data, order))
    })
    try {
      const [studiesData, sharedStudiesData, researcherData] = await Promise.all([
        Service.getAll("studies", researcherId),
        Service.getAll("sharedstudies", researcherId),
        Service.getAll("researcher"),
      ])
      setStudies(sortStudies(studiesData, order))
      setsharedStudies(sortStudies(sharedStudiesData, order))

      let researcherNotification = !!researcherData ? researcherData[0]?.notification ?? false : false
      setNotification(researcherNotification)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching studies:", error)
      setLoading(false)
    }
  }

  const getAllStudies = async () => {
    Service.getAll("studies", researcherId).then((studies) => {
      setStudies(sortStudies(studies, order))
      console.log("STUDIES FETCHED FROM getAllStudies,", studies)
    })

    Service.getAll("sharedstudies", researcherId).then((study_data) => {
      setsharedStudies(sortStudies(study_data, order))
    })
  }

  useEffect(() => {
    localStorage.setItem("order", JSON.stringify(order))
    getAllStudies()
  }, [order])

  // useEffect(() => {
  //   filterStudies(studies)
  // }, [studies])

  useEffect(() => {
    filterStudies(studies, sharedstudies)
  }, [studies, sharedstudies])

  const filterStudies = async (studies, sharedstudies) => {
    if (!!researcherId && studies !== null && (studies || []).length > 0) {
      let selected =
        localStorage.getItem("studies_" + researcherId) !== null
          ? JSON.parse(localStorage.getItem("studies_" + researcherId))
          : []
      if (selected.length > 0) {
        let filteredstudies = selected.filter((o) => studies.some(({ name }) => o === name))
        let filteredsharedstudies = selected.filter((o) => (sharedstudies || []).some(({ name }) => o === name))
        let filtered = [...filteredstudies, ...filteredsharedstudies]
        selected =
          selected.length === 0 || filtered.length === 0
            ? (studies ?? []).map((study) => {
                return study.name
              })
            : filtered
      }
      selected.sort()
      if (!order) selected.reverse()
      console.log("selected studies %%$%$%,", selected)
      setSelectedStudies(selected)
    }
  }

  return (
    // <Container className={layoutClasses.mainContent}>
    // <Container className={layoutClasses.mainContent}>
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container className={layoutClasses.mainContent}>
        <Sidebar
          menuItems={menuItems}
          history={props.history}
          activeRoute={activeRoute}
          setActiveRoute={setActiveRoute}
          setIdentity={props.setIdentity}
        />

        <div className="display-content-container">
          {!!studies && (
            <>
              {tab === "users" && (
                <ParticipantList
                  title={null}
                  onParticipantSelect={onParticipantSelect}
                  researcherId={researcherId}
                  studies={studies}
                  notificationColumn={notificationColumn}
                  selectedStudies={selectedStudies}
                  setSelectedStudies={setSelectedStudies}
                  getAllStudies={getAllStudies}
                  mode={mode}
                  setOrder={() => setOrder(!order)}
                  order={order}
                  authType={props.authType}
                  ptitle={props.ptitle}
                  goBack={props.goBack}
                  onLogout={props.onLogout}
                  resemail={researcher?.email}
                  sharedstudies={sharedstudies}
                  setSharedStudies={setsharedStudies}
                  adminName={props.adminName}
                  setIdentity={props.setIdentity}
                />
              )}
              {tab === "activities" && (
                <ActivityList
                  title={null}
                  researcherId={researcherId}
                  studies={studies}
                  selectedStudies={selectedStudies}
                  setSelectedStudies={setSelectedStudies}
                  setOrder={() => setOrder(!order)}
                  getAllStudies={getAllStudies}
                  order={order}
                  authType={props.authType}
                  ptitle={props.ptitle}
                  goBack={props.goBack}
                  onLogout={props.onLogout}
                  sharedstudies={sharedstudies}
                  setSharedStudies={setsharedStudies}
                  adminName={props.adminName}
                  setIdentity={props.setIdentity}
                />
              )}
              {tab === "sensors" && (
                <SensorsList
                  title={null}
                  researcherId={researcherId}
                  studies={studies}
                  selectedStudies={selectedStudies}
                  setSelectedStudies={setSelectedStudies}
                  setOrder={() => {
                    console.log("setting order", !order)
                    setOrder(!order)
                  }}
                  getAllStudies={getAllStudies}
                  order={order}
                  authType={props.authType}
                  ptitle={props.ptitle}
                  goBack={props.goBack}
                  onLogout={props.onLogout}
                  sharedstudies={sharedstudies}
                  setSharedStudies={setsharedStudies}
                  adminName={props.adminName}
                  setIdentity={props.setIdentity}
                />
              )}
              {tab === "studies" && (
                <StudiesList
                  title={null}
                  researcherId={researcherId}
                  studies={studies}
                  upatedDataStudy={(data) => setUpdatedData(data)}
                  deletedDataStudy={(data) => setDeletedData(data)}
                  searchData={(data) => setSearch(data)}
                  newAdddeStudy={setNewStudy}
                  getAllStudies={getAllStudies}
                  authType={props.authType}
                  ptitle={props.ptitle}
                  goBack={props.goBack}
                  onLogout={props.onLogout}
                  resins={researcher?.institution}
                  sharedstudies={sharedstudies}
                  setSharedStudies={setsharedStudies}
                  adminName={props.adminName}
                  setIdentity={props.setIdentity}
                />
              )}
              {tab === "sharedstudies" && (
                <SharedStudiesList
                  title={null}
                  researcherId={researcherId}
                  studies={studies}
                  upatedDataStudy={(data) => setUpdatedData(data)}
                  deletedDataStudy={(data) => setDeletedData(data)}
                  searchData={(data) => setSearch(data)}
                  newAdddeStudy={setNewStudy}
                  getAllStudies={getAllStudies}
                  adminName={props.adminName}
                />
              )}
              {tab === "archived" && (
                <ArchivedList
                  title={null}
                  researcherId={researcherId}
                  studies={studies}
                  upatedDataStudy={(data) => setUpdatedData(data)}
                  deletedDataStudy={(data) => setDeletedData(data)}
                  searchData={(data) => setSearch(data)}
                  newAdddeStudy={setNewStudy}
                  getAllStudies={getAllStudies}
                  setOrder={() => setOrder(!order)}
                  order={order}
                  authType={props.authType}
                  ptitle={props.ptitle}
                  goBack={props.goBack}
                  onLogout={props.onLogout}
                  selectedStudies={selectedStudies}
                  setSelectedStudies={setSelectedStudies}
                  adminName={props.adminName}
                  setIdentity={props.setIdentity}
                />
              )}
              {tab === "portal" && (
                <DataPortal
                  onLogout={null}
                  token={{
                    username: LAMP.Auth._auth.id,
                    password: LAMP.Auth._auth.password,
                    server: LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital",
                    type: "Researcher",
                    id: researcher.id,
                    name: researcher.name,
                  }}
                  data={LAMP.Auth}
                />
              )}
              {tab === "account" && (
                <Account
                  pageLocation={`${props.adminName ? props.adminName + " >" : ""} ${props.ptitle} > Account`}
                  onLogout={onLogout}
                  title={props.ptitle}
                  setIdentity={props.setIdentity}
                  userType={"Researcher"}
                  userId={researcherId}
                />
              )}
            </>
          )}
        </div>
      </Container>
      {/* <Container
        className={
          tab !== "portal"
            ? window.innerWidth >= 1280 && window.innerWidth <= 1350
              ? layoutClasses.tableContainerWidthPad
              : layoutClasses.tableContainerWidth
            : layoutClasses.tableContainerDataPortalWidth
        }
        style={{ backgroundColor: "pink", padding: 0, position: "relative" }}
      >
      </Container> */}
    </div>
  )
}
