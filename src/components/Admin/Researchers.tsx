// Core Imports
import React, { useState, useEffect } from "react"
import { Box, Backdrop, CircularProgress, DialogContent, Grid, Icon, useMediaQuery, useTheme } from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP, { Researcher } from "lamp-core"
import { CredentialManager } from "../CredentialManager"
import { useTranslation } from "react-i18next"
import { MuiThemeProvider, makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import locale_lang from "../../locale_map.json"
import AdminHeader from "../Header"
import ViewElement from "../ViewElement"
import { useLayoutStyles } from "../GlobalStyles"
import ResearcherTable from "./ResearchersTable"

import "./admin.css"
import ActionsComponent from "./ActionsComponent"
import AddUpdateResearcher from "./AddUpdateResearcher"
import ResearcherCardView from "./ResearcherCardView"
import { is } from "date-fns/locale"

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

interface ResearcherWithStats {
  id: string
  name?: string
  email?: string
  studyCount?: number
  participantCount?: number
  sensorCount?: number
  activityCount?: number
  isLoggedIn?: boolean
  isShared?: boolean
  systemTimestamps?: {
    deletedAt?: number
    suspensionTime?: number
  }
}

export default function Researchers({ history, updateStore, adminType, authType, onLogout, setIdentity, ...props }) {
  const [researchers, setResearchers] = useState([])
  const [filteredResearchers, setFilteredResearchers] = useState([])
  const [detailedResearchers, setDetailedResearchers] = useState<ResearcherWithStats[]>([])
  const [filteredDetailedResearchers, setFilteredDetailedResearchers] = useState<ResearcherWithStats[]>([])
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

  const [studyCounts, setStudyCounts] = useState<{ [id: string]: { self: number; shared: number; joined: number } }>({})
  const [studyDetails, setStudyDetails] = useState<{
    [id: string]: { self: any[]; shared: any[]; joined: any[]; all: any[] }
  }>({})

  const [loading, setLoading] = useState(false)

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
    // {
    //   id: "actions",
    //   label: "Actions",
    //   value: (s) => "", // Action buttons rendered separately
    //   visible: true,
    //   sortable: false,
    // },
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

  const refreshResearchers = () => {
    setIsLoading(true)
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
          setPaginatedResearchers(data.slice(0, rowCount))
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  useEffect(() => {
    refreshResearchers()
  }, [])

  // const fetchStudies = async () => {
  //   try {
  //     setIsLoading(true)
  //     const studies = await LAMP.Study.all()
  //     console.log("Fetched studies:", studies)
  //     setStudies(studies)
  //   } catch (error) {
  //     console.error("Error fetching studies:", error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  useEffect(() => {
    refreshResearchers()
  }, [search])

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

  function getSelfStudies(researcher, allStudies) {
    // Self: all studies created by the researcher (regardless of sharing)
    return allStudies.filter((study) => {
      let creatorId = study._parent || study.researcher || study.creator || study.createdBy || study.owner
      if (typeof creatorId === "object" && creatorId !== null) creatorId = creatorId.id || creatorId.ResearcherID || ""
      const researcherId = String(researcher.id).trim()
      const researcherName = (researcher.name || "").trim().toLowerCase()
      const researcherEmail = (researcher.email || "").trim().toLowerCase()
      const creatorStr = String(creatorId).trim()
      // Match by ID, name, or email (case-insensitive)
      return (
        creatorStr === researcherId ||
        creatorStr.toLowerCase() === researcherName ||
        creatorStr.toLowerCase() === researcherEmail
      )
    })
  }

  function getJoinedStudies(researcher, allStudies) {
    // Joined: researcher is not the creator but is in the sharedWith/collaborators/sub_researchers list
    return allStudies.filter((study) => {
      let creatorId = study.creator || study.createdBy || study.owner || study.researcher
      if (typeof creatorId === "object" && creatorId !== null) creatorId = creatorId.id || creatorId.ResearcherID || ""
      if (String(creatorId) === String(researcher.id)) return false
      const sharedWith = study.sharedWith || study.shared || study.collaborators || study.sub_researchers
      if (!Array.isArray(sharedWith) || sharedWith.length === 0) return false
      return sharedWith.some((item) => {
        const id = typeof item === "string" ? item : item.ResearcherID || item.id
        return String(id) === String(researcher.id)
      })
    })
  }

  // Robust async function to get creator and sharedWith names for a study
  async function enrichStudyWithCreatorAndShared(study, allResearchers) {
    const creatorId =
      study._parent || study.parent || study.researcher || study.creator || study.createdBy || study.owner
    let creatorName = "Unknown"
    if (!allResearchers || allResearchers.length === 0) {
      console.error("allResearchers is empty!")
    }
    if (!creatorId) {
      creatorName = "Unknown"
    } else {
      let creator = allResearchers.find((r) => r.id === creatorId)
      if (!creator) {
        const creatorIdStr = String(creatorId).trim().toLowerCase()
        creator = allResearchers.find((r) => {
          const researcherName = (r.name || "").trim().toLowerCase()
          const researcherEmail = (r.email || "").trim().toLowerCase()
          return creatorIdStr === researcherName || creatorIdStr === researcherEmail
        })
      }
      // If found, set creatorName
      if (creator) {
        creatorName = creator.name || creator.email || creator.id
      } else {
        // If not found, show the raw ID (but not 'NoCreatorId')
        creatorName = String(creatorId)
      }
    }
    // Find sharedWith
    const sharedWith = study.sharedWith || study.shared || study.collaborators || study.sub_researchers || []
    const sharedWithNames = sharedWith.map((item) => {
      const id = typeof item === "string" ? item : item.ResearcherID || item.id
      if (!id) return "Unknown"
      // Try to find researcher by exact ID match first
      let researcher = allResearchers.find((r) => r.id === id)
      // If not found by exact ID, try matching by name or email (case-insensitive)
      if (!researcher) {
        const idStr = String(id).trim().toLowerCase()
        researcher = allResearchers.find((r) => {
          const researcherName = (r.name || "").trim().toLowerCase()
          const researcherEmail = (r.email || "").trim().toLowerCase()
          return idStr === researcherName || idStr === researcherEmail
        })
      }
      // If found, return researcher name or email or ID
      return researcher ? researcher.name || researcher.email || researcher.id : id
    })
    return { ...study, creatorName, sharedWithNames }
  }

  const makeDetailedResearchers = async () => {
    setLoading(true)
    try {
      // Fetch all researchers for name/id mapping
      const allResearchers = researchers || []
      const studies = await LAMP.Study.all()
      console.log("Inside the makeDetailedResearchers function and the studies function", studies)
      const allStudies = studies || []
      // setStudies(studies)

      // Debug: Log all researchers
      console.log("DEBUG: All Researchers:")
      allResearchers.forEach((r) => console.log(`ID: '${r.id}', Name: '${r.name}', Email: '${r.email}'`))
      // Debug: Log all studies with creator/sharedWith
      console.log("DEBUG: All Studies:")
      allStudies.forEach((s) => {
        const creatorId = s["parent"] || s["researcher"] || s["creator"] || s["createdBy"] || s["owner"]
        const sharedWith = s["sharedWith"] || s["shared"] || s["collaborators"] || s["sub_researchers"]
        console.log(`Study: '${s.name}', ID: '${s.id}', Creator: '${creatorId}', SharedWith:`, sharedWith)
      })
      if (Array.isArray(allResearchers) && Array.isArray(allStudies)) {
        // Enhance researchers with study and participant counts
        const enrichedStudies = await Promise.all(
          allStudies.map((study) => enrichStudyWithCreatorAndShared(study, allResearchers))
        )
        const enhancedResearchers = await Promise.all(
          allResearchers.map(async (researcher) => {
            try {
              // Self: studies where researcher is creator
              const selfStudies = getSelfStudies(researcher, enrichedStudies)
              // Joined: studies where researcher is a member but not creator (robust)
              const joinedStudiesRaw = getJoinedStudies(researcher, enrichedStudies)
              // Remove any joined studies that are also in self (by id)
              const selfStudyIds = new Set(selfStudies.map((s) => s.id))
              const joinedStudies = joinedStudiesRaw.filter((s) => !selfStudyIds.has(s.id))
              // Shared: self studies with other researchers in shared fields
              const sharedStudies = selfStudies.filter((study) => {
                const sharedWith =
                  study.sharedWith || study.shared || study.collaborators || study.sub_researchers || []
                const sharedIds = sharedWith
                  .map((item) => (typeof item === "string" ? item : item.ResearcherID || item.id))
                  .filter(Boolean)
                return sharedIds.some((id) => String(id) !== String(researcher.id))
              })
              // All studies: any study where researcher is creator (any field) OR in any sharedWith/collaborators/sub_researchers field
              const allStudiesSet = new Map()
              for (const study of enrichedStudies) {
                // Check creator fields
                let creatorId =
                  study._parent || study.parent || study.researcher || study.creator || study.createdBy || study.owner
                if (typeof creatorId === "object" && creatorId !== null)
                  creatorId = creatorId.id || creatorId.ResearcherID || ""
                const researcherId = String(researcher.id).trim()
                const researcherName = (researcher.name || "").trim().toLowerCase()
                const researcherEmail = (researcher.email || "").trim().toLowerCase()
                const creatorStr = String(creatorId).trim()
                const isCreator =
                  creatorStr === researcherId ||
                  creatorStr.toLowerCase() === researcherName ||
                  creatorStr.toLowerCase() === researcherEmail
                // Check member fields
                const sharedWith =
                  study.sharedWith || study.shared || study.collaborators || study.sub_researchers || []
                const isMember = sharedWith.some((item) => {
                  const id = typeof item === "string" ? item : item.ResearcherID || item.id
                  return (
                    String(id) === researcherId ||
                    String(id).toLowerCase() === researcherName ||
                    String(id).toLowerCase() === researcherEmail
                  )
                })
                if (isCreator || isMember) {
                  allStudiesSet.set(study.id, study)
                }
              }
              const allStudiesForResearcher = Array.from(allStudiesSet.values())
              // Participant count: sum of participants in all these studies
              let participantCount = 0
              for (const study of allStudiesForResearcher) {
                try {
                  const participants = await LAMP.Participant.allByStudy(study.id)
                  participantCount += Array.isArray(participants) ? participants.length : 0
                } catch (err) {}
              }
              setStudyCounts((prev) => ({
                ...prev,
                [researcher.id]: {
                  self: selfStudies.length,
                  shared: sharedStudies.length,
                  joined: joinedStudies.length,
                },
              }))
              setStudyDetails((prev) => ({
                ...prev,
                [researcher.id]: {
                  self: selfStudies,
                  shared: sharedStudies,
                  joined: joinedStudies,
                  all: allStudiesForResearcher,
                },
              }))
              return {
                ...researcher,
                id: researcher.id || "",
                studyCount: allStudiesForResearcher.length,
                participantCount,
              }
            } catch (err) {
              setStudyCounts((prev) => ({
                ...prev,
                [researcher.id]: { self: 0, shared: 0, joined: 0 },
              }))
              setStudyDetails((prev) => ({
                ...prev,
                [researcher.id]: { self: [], shared: [], joined: [], all: [] },
              }))
              return {
                ...researcher,
                id: researcher.id || "",
                studyCount: 0,
                participantCount: 0,
              }
            }
          })
        )
        console.log("setting enhanced researchers", enhancedResearchers)
        setDetailedResearchers(enhancedResearchers)
        setFilteredDetailedResearchers(enhancedResearchers)
      } else {
        setDetailedResearchers([])
      }
    } catch (err) {
      setDetailedResearchers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (researchers.length > 0) makeDetailedResearchers()
  }, [researchers])

  useEffect(() => {
    const filteredResearcherIds = new Set(filteredResearchers.map((r) => r.id))
    const filteredDetailedResearchersTemp = detailedResearchers.filter((researcher) =>
      filteredResearcherIds.has(researcher.id)
    )
    setFilteredDetailedResearchers(filteredDetailedResearchersTemp)
  }, [filteredResearchers])

  return (
    <React.Fragment>
      {!crrViewResearcher.researcher ? (
        <>
          <AdminHeader
            adminType={adminType}
            authType={authType}
            title={props.title}
            pageLocation="Researchers"
            onLogout={onLogout}
            setIdentity={setIdentity}
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
            {tabularView ? (
              <ResearcherTable
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
                refreshElements={refreshResearchers}
              />
            ) : (
              <ResearcherCardView
                refreshResearchers={refreshResearchers}
                onResearchersUpdate={handleResearchersUpdate}
                studyDetails={studyDetails}
                detailedResearchers={filteredDetailedResearchers}
                studyCounts={studyCounts}
                loading={loading || isLoading}
                changeElement={setCrrViewResearcher}
                history={history}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <AdminHeader
            authType={LAMP.Auth._type}
            title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
            pageLocation={`Researchers > ${crrViewResearcher.researcher.firstName} ${crrViewResearcher.researcher.lastName}`}
            onLogout={onLogout}
            setIdentity={setIdentity}
          />
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
