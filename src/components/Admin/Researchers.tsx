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
import AdminHeader from "../Header"
import ViewResearcherHeader from "../ViewElementHeader"
import ViewElement from "../ViewElement"
import { useLayoutStyles } from "../GlobalStyles"
import ResearcherTable from "./ResearchersTable"

import "./admin.css"
import ActionsComponent from "./ActionsComponent"
import AddUpdateResearcher from "./AddUpdateResearcher"

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
  const [filteredResearchers, setFilteredResearchers] = useState([])
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

  const [crrViewResearcher, setCrrViewResearcher] = useState({ researcher: null, idx: null })
  const [actionOnViewResearcher, setActionOnViewResearcher] = useState(null)
  const [isEditing4View, setIsEditing4View] = useState(false)

  const [tabularView, setTabularView] = useState(false)

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  console.log("reached researcher")

  const [columns, setColumns] = useState([
    { id: "id", label: "ID", value: (s) => s.id, visible: true, sortable: true },
    { id: "firstName", label: "First Name", value: (s) => s.firstName, visible: true, sortable: true },
    { id: "lastName", label: "Last Name", value: (s) => s.lastName, visible: true, sortable: true },
    { id: "username", label: "Username", value: (s) => s.username, visible: true, sortable: true },
    { id: "email", label: "Email", value: (s) => s.email, visible: true, sortable: true },
    { id: "mobile", label: "Mobile", value: (s) => s.mobile, visible: true, sortable: true },
    { id: "loggedIn", label: "Logged In", value: (s) => (s.loggedIn ? "Yes" : "No"), visible: true, sortable: true },
    { id: "institution", label: "Institution", value: (s) => s.institution || "-", visible: true, sortable: true },
    { id: "adminNote", label: "Admin Note", value: (s) => s.adminNote || "-", visible: false, sortable: true },
    {
      id: "noProjectAccess",
      label: "No of Projects Access",
      value: (s) => s.noProjectAccess ?? "-",
      visible: false,
      sortable: true,
    },
    { id: "address", label: "Address", value: (s) => s.address || "-", visible: false, sortable: true },
    { id: "studies", label: "Studies", value: (s) => s.studies?.join(", ") || "-", visible: false, sortable: false },
    { id: "status", label: "Status", value: (s) => s.status, visible: true, sortable: true },
    { id: "timestamp", label: "Time of Account creation", value: (s) => s.timestamp, visible: true, sortable: true },
    {
      id: "timestamps.lastLoginAt",
      label: "Time of last login",
      value: (s) => s.timestamps?.lastLoginAt || "-",
      visible: false,
      sortable: true,
    },
    {
      id: "timestamps.lastActivityAt",
      label: "Time of last activity",
      value: (s) => s.timestamps?.lastActivityAt || "-",
      visible: false,
      sortable: true,
    },
    {
      id: "timestamps.suspendedAt",
      label: "Time of suspension",
      value: (s) => s.timestamps?.suspendedAt || "-",
      visible: false,
      sortable: true,
    },
    {
      id: "actions",
      label: "Actions",
      value: (s) => "", // Action buttons rendered separately
      visible: true,
      sortable: false,
    },
  ])

  const columnsNames = {
    id: "ID",
    firstName: "First Name",
    lastName: "last Name",
    username: "Username",
    email: "Email",
    mobile: "Mobile",
    loggedIn: "Logged In",
    institution: "Institution",
    adminNote: "Admin Note",
    noProjectAccess: "No of Projects Access",
    address: "Address",
    studies: "Studies",
    status: "Status",
    timestamp: "Time of Account creation",
    "timestamps.lastLoginAt": "Time of last login",
    "timestamps.lastActivityAt": "Time of last activity",
    "timestamps.suspendedAt": "Time of suspension",
    actions: "Actions",
  }

  const visible_columns = {
    id: "ID",
    firstName: "First Name",
    lastName: "last Name",
    username: "Username",
    email: "Email",
    mobile: "Mobile",
    loggedIn: "Logged In",
    actions: "Actions",
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

  const originalColumnKeys = Object.keys(columns)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(Object.keys(visible_columns))

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
    // setPaginatedResearchers([])
    // setResearchers([])
    setPage(0)

    if (search.trim().length > 0) {
      console.log("Searching researchers with:", search)
      console.log("Researchers before filtering:", researchers, "\n")
      const data = researchers.filter((researcher) => researcher.name?.toLowerCase()?.includes(search?.toLowerCase()))
      setFilteredResearchers(data)
      console.log("Filtered researchers:", data)
      setIsLoading(false)
    } else {
      LAMP.Researcher.all()
        .then((data) => {
          setResearchers(data)
          setFilteredResearchers(data)
          // if (search.trim().length > 0) {
          //   data = data.filter((researcher) => researcher.name?.toLowerCase()?.includes(search?.toLowerCase()))
          //   setResearchers(data)
          // } else {
          //   setResearchers(data)
          // }
          setPaginatedResearchers(data.slice(0, rowCount))
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
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

  useEffect(() => {
    if (researchers.length > 0) {
      setCrrViewResearcher((prev) => ({ ...prev, researcher: researchers[crrViewResearcher.idx] }))
    }
  }, [crrViewResearcher.idx])

  const handleChangePage = (page: number, rowCount: number) => {
    setPage(page)
    setRowCount(rowCount)
    setPaginatedResearchers(researchers.slice(page * rowCount, page * rowCount + rowCount))
  }

  const handleRowClick = (researcher: Researcher) => {
    console.log("Researcher clicked:", researcher)
  }

  useEffect(() => {
    console.log("Researchers data use effect call", researchers)
    if (search.trim().length > 0) {
      const data = researchers.filter((researcher) => researcher.name?.toLowerCase()?.includes(search?.toLowerCase()))
      setFilteredResearchers(data)
    }
  }, [researchers])

  const handleResearchersUpdate = (updatedResearchers) => {
    setResearchers((prevResearchers) => {
      // Create a copy of the current researchers array
      const newResearchers = [...prevResearchers]

      // Update each researcher that was changed
      updatedResearchers.forEach((updatedResearcher) => {
        const index = newResearchers.findIndex((r) => r.id === updatedResearcher.id)
        if (index !== -1) {
          newResearchers[index] = updatedResearcher
        }
      })

      return newResearchers
    })
  }

  return (
    <React.Fragment>
      {!crrViewResearcher.researcher ? (
        <>
          <AdminHeader
            adminType={adminType}
            authType={authType}
            title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
            pageLocation="Researchers"
          />
          <div className="body-container">
            <ActionsComponent
              searchData={(data) => setSearch(data)}
              refreshElements={refreshResearchers}
              addComponent={<AddUpdateResearcher refreshResearchers={refreshResearchers} researchers={researchers} />}
              actions={["refresh", "search", "grid", "table", "filter-cols", "download"]}
              tabularView={tabularView}
              setTabularView={setTabularView}
              VisibleColumns={columns}
              setVisibleColumns={setColumns}
              researchers={researchers}
              downloadTarget={"researchers"}
            />
            <ResearcherTable
              researchers={researchers}
              editable_columns={editable_columns}
              data={filteredResearchers}
              onRowClick={handleRowClick}
              emptyStateMessage="No researchers found"
              isLoading={isLoading}
              className="shadow-sm"
              adminType={adminType}
              history={history}
              originalColumnKeys={originalColumnKeys}
              selectedColumns={columns.filter((col) => col.visible)}
              refreshResearchers={refreshResearchers}
              updateStore={updateStore}
              changeElement={setCrrViewResearcher}
              onResearchersUpdate={handleResearchersUpdate}
              searchData={(data) => setSearch(data)}
              refreshElements={refreshResearchers}
            />
          </div>
        </>
      ) : (
        <>
          <AdminHeader
            authType={LAMP.Auth._type}
            title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
            pageLocation={`Researchers > ${crrViewResearcher.researcher.firstName} ${crrViewResearcher.researcher.lastName}`}
          />
          {/* <ViewResearcherHeader
            length={researchers.length}
            elementType={"Researchers"}
            element={crrViewResearcher}
            changeElement={setCrrViewResearcher}
            actionOnViewElement={actionOnViewResearcher}
            searchData={(data) => setSearch(data)}
            title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
            authType={authType}
            setActionOnViewElement={setActionOnViewResearcher}
            isEditing={isEditing4View}
            setIsEditing={setIsEditing4View}
          /> */}
          <div className="body-container">
            <ActionsComponent
              actions={["edit", "save", "passwordEdit", "left", "right", "cancel"]}
              onEdit={() => {
                actionOnViewResearcher === "edit" ? setActionOnViewResearcher(null) : setActionOnViewResearcher("edit")
              }}
              onSave={() => setActionOnViewResearcher("save")}
              onPasswordEdit={() => setActionOnViewResearcher("passwordEdit")}
              onPrevious={() =>
                setCrrViewResearcher((prev) => ({
                  ...prev,
                  idx: (prev.idx - 1 + researchers.length) % researchers.length,
                }))
              }
              onNext={() => setCrrViewResearcher((prev) => ({ ...prev, idx: (prev.idx + 1) % researchers.length }))}
              onClose={() => {
                setIsEditing4View(false)
                setCrrViewResearcher({ researcher: null, idx: null })
              }}
              tabularView={tabularView}
            />
            <ViewElement
              elementType={"researchers"}
              element={crrViewResearcher.researcher}
              changeElement={setCrrViewResearcher}
              columns={columnsNames}
              editableColumns={editable_columns}
              actionOnViewElement={actionOnViewResearcher}
              setActionOnViewElement={setActionOnViewResearcher}
              isEditing={isEditing4View}
              setIsEditing={setIsEditing4View}
            />
          </div>
        </>
      )}
    </React.Fragment>
  )
}
