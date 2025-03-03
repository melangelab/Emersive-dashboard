// Core Imports
import React, { useState, useEffect } from "react"
import { Box, Backdrop, CircularProgress, DialogContent, Grid, Icon, useMediaQuery, useTheme } from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP, { Researcher } from "lamp-core"
import { CredentialManager } from "../CredentialManager"
import { useTranslation } from "react-i18next"
import { MuiThemeProvider, makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import locale_lang from "../../locale_map.json"
import Pagination from "../PaginatedElement"
import ResearcherRow from "./ResearcherRow"
import Header from "./Header"
import { useLayoutStyles } from "../GlobalStyles"
import DynamicTable from "./DynamicTable"

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
    backdrop: {
      zIndex: 111111,
      color: "#fff",
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
    menuIcon: {
      minWidth: "auto",
      [theme.breakpoints.down("xs")]: {
        top: 5,
        position: "relative",
      },
      "& path": { fill: "rgba(0, 0, 0, 0.4)", fillOpacity: 0.7 },
    },

    // tableContainer: {
    //   "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
    //   "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
    //   "& div.MuiInput-underline": {
    //     "& span.material-icons": {
    //       width: '100%',
    //       // height: 19,
    //       fontSize: 27,
    //       lineHeight: "23PX",
    //       color: "rgba(0, 0, 0, 0.4)",
    //     },
    //     "& button": { display: "none" },
    //   },
    // },
    btnBlue: {
      background: "#7599FF",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#fff",
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#5680f9" },
      [theme.breakpoints.up("md")]: {
        position: "absolute",
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
    tableContainerWidthPad: {
      maxWidth: 1055,
      paddingLeft: 0,
      paddingRight: 0,
    },
    menuOuter: {
      paddingTop: 0,
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        padding: 0,
      },
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
    btnFilter: {
      color: "rgba(0, 0, 0, 0.4)",
      fontSize: 14,
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      boxShadow: "none",
      background: "transparent",
      margin: "0 15px",
      paddingRight: 0,
      "& svg": { marginRight: 10 },
    },
    tableOuter: {
      width: "100vw",
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50.6vw",
      marginRight: "-50.6vw",
      marginBottom: 30,
      marginTop: -20,
      // paddingTop: 40,
      "& input": {
        width: 350,
        [theme.breakpoints.down("md")]: {
          width: 200,
        },
      },
      "& div.MuiToolbar-root": { maxWidth: 1232, width: "100%", margin: "0 auto" },
      "& h6": { fontSize: 30, fontWeight: 600, marginLeft: 10 },
      "& button": {
        marginRight: 15,
        "& span": { color: "#7599FF" },
      },
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
    norecords: {
      "& span": { marginRight: 5 },
    },
    tableContainer: {
      position: "fixed",
      top: "100px", // Equivalent to mt={14}
      height: "calc(100vh - 102.2px)",
      left: "140px",
      width: "89%",
      borderRadius: 20,
      padding: "0 5px 0 5px", // Set top padding to 0
      zIndex: 20,
      // overflowY: "auto",
      backgroundColor: "white",
      // padding: theme.spacing(0, 2),
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: "100%",
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
    },
    tableContainerMobile: {
      // Reset the left property from the parent
      left: "50%",
      // Center using transform
      transform: "translateX(-50%)",
      // Adjust width for mobile view
      width: "98%",
      // Add some margin to account for any potential sidebar
      margin: "0 auto",
      padding: "0 5px 0 5px",
      height: "calc(100vh - 222px)",
    },
  })
)

export default function Researchers({ history, updateStore, adminType, authType, onLogout, ...props }) {
  const [researchers, setResearchers] = useState([])
  const [paginatedResearchers, setPaginatedResearchers] = useState([])
  const [page, setPage] = useState(0)
  const [rowCount, setRowCount] = useState(40)
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const layoutClasses = useLayoutStyles()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [error, setError] = useState(null)

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const columns = {
    id: "ID",
    firstName: "First Name",
    lastName: "last Name",
    username: "Username",
    email: "Email",
    mobile: "Mobile",
    institution: "Institution",
    adminNote: "Admin Note",
    loggedIn: "Logged In",
    noProjectAccess: "No of Projects Access",
    address: "Address",
    studies: "Studies",
    status: "Status",
    timestamp: "Time of Account creation",
    "timestamps.lastLoginAt": "Time of last login",
    "timestamps.lastActivityAt": "Time of last activity",
    "timestamps.suspendedAt": "Time of suspension",
  }

  const editable_columns = [
    "firstName",
    "lastName",
    "username",
    "email",
    "mobile",
    "institution",
    "adminNote",
    "address",
  ]

  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : lang ? lang : "en-US"
  }

  useEffect(() => {
    refreshResearchers()
  }, [])

  const refreshResearchers = () => {
    setIsLoading(true)
    setPaginatedResearchers([])
    setPage(0)
    setResearchers([])

    LAMP.Researcher.all()
      .then((data) => {
        if (search.trim().length > 0) {
          data = data.filter((researcher) => researcher.name?.toLowerCase()?.includes(search?.toLowerCase()))
          setResearchers(data)
        } else {
          setResearchers(data)
        }
        setPaginatedResearchers(data.slice(0, rowCount))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    refreshResearchers()
  }, [search])

  useEffect(() => {
    let eventSource

    const connectSSE = () => {
      // Get the authorization token
      const authToken = localStorage.getItem("authToken")

      // Create EventSource with full URL
      const fullUrl = `${
        "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")
      }/researcher/stream`
      console.log("Connecting to:", fullUrl)

      class EventSourceWithAuth extends EventSource {
        constructor(url, configuration) {
          super(url, configuration)
        }
      }

      eventSource = new EventSourceWithAuth(fullUrl, {
        headers: {
          Authorization: "Basic " + LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password,
        },
        withCredentials: true,
      })

      eventSource.onopen = () => {
        setConnectionStatus("connected")
        setError(null)
        console.log("SSE Connection opened")
      }

      eventSource.onmessage = (event) => {
        try {
          console.log("Received SSE data:", event.data)
          const data = JSON.parse(event.data)
          setResearchers(data)
        } catch (err) {
          console.error("Error parsing SSE data:", err)
        }
      }

      eventSource.onerror = (error) => {
        console.error("SSE Connection Error:", error)
        setConnectionStatus("error")
        setError("Connection failed. Retrying...")
      }
    }

    connectSSE()

    return () => {
      if (eventSource) {
        console.log("Closing SSE connection")
        eventSource.close()
      }
    }
  }, [])

  useEffect(() => {
    let authId = LAMP.Auth._auth.id
    let language = !!localStorage.getItem("LAMP_user_" + authId)
      ? JSON.parse(localStorage.getItem("LAMP_user_" + authId)).language
      : getSelectedLanguage()
      ? getSelectedLanguage()
      : "en-US"
    i18n.changeLanguage(language)
  }, [])

  const handleChangePage = (page: number, rowCount: number) => {
    setPage(page)
    setRowCount(rowCount)
    setPaginatedResearchers(researchers.slice(page * rowCount, page * rowCount + rowCount))
  }

  const handleRowClick = (researcher: Researcher) => {
    console.log("Researcher clicked:", researcher)
    // Handle row click
  }

  return (
    <React.Fragment>
      <Header
        researchers={researchers}
        searchData={(data) => setSearch(data)}
        refreshResearchers={refreshResearchers}
        adminType={adminType}
        authType={authType}
        title={
          adminType === "admin"
            ? "Administrator"
            : adminType === "practice_lead"
            ? "Practice Lead"
            : "User Administrator"
        }
        onLogout={onLogout}
      />
      <Box
        className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
      >
        {/* <Box className="fixed top-24 left-36 w-10/12 rounded-lg bg-white shadow-sm p-0 z-20"> */}
        <DynamicTable
          columns={columns}
          editable_columns={editable_columns}
          data={researchers}
          onRowClick={handleRowClick}
          emptyStateMessage="No researchers found"
          isLoading={isLoading}
          className="shadow-sm"
          adminType={adminType}
          history={history}
          refreshResearchers={refreshResearchers}
          updateStore={updateStore}
        />
      </Box>
      {/* <Box className={layoutClasses.tableContainer}>
        <Grid container >
          {researchers.length > 0 ? (
            <Grid container spacing={3} xs={12}>
              {(paginatedResearchers ?? []).map((item, index) => (
                <Grid item xs={12} sm={12} md={6} lg={4} key={item.id}>
                  <ResearcherRow
                    researcher={item}
                    history={history}
                    refreshResearchers={refreshResearchers}
                    researchers={researchers}
                    updateStore={updateStore}
                    adminType={adminType}
                  />
                </Grid>
              ))}
              <Pagination data={researchers} updatePage={handleChangePage} rowPerPage={[20, 40, 60, 80]} />
            </Grid>
          ) : (
            <Grid item lg={6} xs={12}>
              <Box display="flex" alignItems="center" className={classes.norecords}>
                <Icon>info</Icon>
                {`${t("No Records Found")}`}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box> */}
    </React.Fragment>
  )
}
