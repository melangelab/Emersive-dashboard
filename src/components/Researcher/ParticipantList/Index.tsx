import React, { useState, useEffect, useMemo, useRef } from "react"
import {
  Box,
  Grid,
  Backdrop,
  CircularProgress,
  Icon,
  makeStyles,
  Theme,
  createStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Chip,
  MenuItem,
  Checkbox,
  ListItemText,
  Dialog,
  DialogActions,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
  TextField,
  Tooltip,
  Popover,
} from "@material-ui/core"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import da from "javascript-time-ago/locale/da"
import de from "javascript-time-ago/locale/de"
import zh from "javascript-time-ago/locale/zh"
import ko from "javascript-time-ago/locale/ko"
import es from "javascript-time-ago/locale/es"
import it from "javascript-time-ago/locale/it"
import hi from "javascript-time-ago/locale/hi"
import zhHK from "javascript-time-ago/locale/zh-Hans-HK"
import fr from "javascript-time-ago/locale/fr"
import ParticipantListItem from "./ParticipantListItem"
import { Service } from "../../DBService/DBService"
import { sortData } from "../Dashboard"
import { useTranslation } from "react-i18next"
import Pagination from "../../PaginatedElement"
import useInterval from "../../useInterval"
import { useLayoutStyles } from "../../GlobalStyles"
import ParticipantTableCell from "./ParticipantTableCell"
// import Credentials from "./Credentials"
import LAMP from "lamp-core"
import { useSnackbar } from "notistack"
import ParticipantTableRow from "./ParticipantTableRow"
import { Link } from "@material-ui/core"
import { useQuery, formatDate_alph } from "../../Utils"
import { ACCESS_LEVELS, getResearcherAccessLevel, useModularTableStyles } from "../Studies/Index"
import { ReactComponent as ArrowDropDownIcon } from "../../../icons/NewIcons/sort-circle-down.svg"
import { ReactComponent as ArrowDropUpIcon } from "../../../icons/NewIcons/sort-circle-up.svg"
import ParticipantName from "./ParticipantName"
import NotificationSettings from "./NotificationSettings"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as SuspendIcon } from "../../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as SuspendFilledIcon } from "../../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/arrow-circle-down-filled.svg"
import Credentials from "../../Credentials"
import ParticipantDetailsDialog from "./ParticipantDetailsDialog"
import ConfirmationDialog from "../../ConfirmationDialog"
import ItemViewHeader from "../SharedStyles/ItemViewHeader"
import ParticipantDetailItem from "./ParticipantDetailItem"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../../icons/NewIcons/floppy-disks-filled.svg"
import { ReactComponent as VisualiseIcon } from "../../../icons/NewIcons/arrow-left-to-arc.svg"
import { ReactComponent as VisualiseFilledIcon } from "../../../icons/NewIcons/arrow-left-to-arc.svg"
import { fetchCredentialsOfSharedParticipant, fetchGetData } from "../SaveResearcherData"
import CommonTable, { TableColumn as CommonTableColumn } from "../CommonTable"

import Header from "../../Header"
import "../../Admin/admin.css"
import ActionsComponent from "../../Admin/ActionsComponent"
import AddButton from "./AddButton"

import "../researcher.css"
import { FilterMatchMode } from "primereact/api"
import EmersiveTable, { ColumnConfig } from "../EmersiveTable"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      marginTop: theme.spacing(2),
      "& .MuiTableCell-stickyHeader": {
        backgroundColor: theme.palette.background.paper,
      },
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: 21,
          height: 19,
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
      [theme.breakpoints.down("sm")]: {
        marginBottom: 80,
      },
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    norecordsmain: {
      minHeight: "calc(100% - 114px)",
      position: "absolute",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      margin: theme.spacing(0, 1),
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    tableCell: {
      padding: theme.spacing(1, 2),
    },
    columnSelector: {
      marginBottom: theme.spacing(2),
    },
    checkboxActive: {
      color: "#7599FF !important",
    },
  })
)

function getCurrentLanguage(language) {
  let lang
  switch (language) {
    case "en_US":
      lang = "en-US"
      break
    case "hi_IN":
      lang = "hi-IN"
      break
    case "es_ES":
      lang = "es-ES"
      break
    case "it_IT":
      lang = "it-IT"
      break
    case "de_DE":
      lang = "de-DE"
      break
    case "da_DK":
      lang = "da-DK"
      break
    case "fr_FR":
      lang = "fr-FR"
      break
    case "zh_CN":
      lang = "zh-CN"
      break
    case "zh_HK":
      lang = "zh-HK"
      break
    case "ko_KR":
      lang = "ko-KR"
      break
    default:
      lang = "en-US"
      break
  }
  return lang
}

function getCurrentLanguageCode(language) {
  let langCode
  switch (language) {
    case "en_US":
      langCode = en
      break
    case "hi_IN":
      langCode = hi
      break
    case "es_ES":
      langCode = es
      break
    case "it_IT":
      langCode = it
      break
    case "de_DE":
      langCode = de
      break
    case "da_DK":
      langCode = da
      break
    case "fr_FR":
      langCode = fr
      break
    case "ko_KR":
      langCode = ko
      break
    case "zh_CN":
      langCode = zh
      break
    case "zh_HK":
      langCode = zhHK
      break
    default:
      langCode = en
      break
  }
  return langCode
}

// dynamic columns type defined here XO
export interface TableColumn {
  id: string
  label: string
  value: (participant: any) => string | number
  visible: boolean
  sortable?: boolean
}

export function getTimeAgo(language) {
  const currentLanguage = getCurrentLanguage(language)
  const currentLanguageCode = getCurrentLanguageCode(language)
  TimeAgo.addLocale(currentLanguageCode)
  return new TimeAgo(currentLanguage)
}

export const getParticipantAccessLevel = (Participant, studies, researcherId, sharedStudies = []) => {
  if (!Participant.isShared) return ACCESS_LEVELS.ALL // Owner has full rights
  const ParticipantStudyId = Participant.study_id
  let ParticipantStudy = studies.find((study) => study.id === ParticipantStudyId)
  if (!ParticipantStudy && Array.isArray(sharedStudies)) {
    ParticipantStudy = sharedStudies.find((study) => study.id === ParticipantStudyId)
  }
  if (!ParticipantStudy) {
    console.log("Study not found for Participant", Participant.id, ParticipantStudyId)
    return ACCESS_LEVELS.VIEW
  }
  const accessLevel = getResearcherAccessLevel(ParticipantStudy, researcherId)
  return accessLevel
}

export const canEditParticipant = (Participant, studies, researcherId, sharedStudies = []) => {
  if (!Participant.isShared) return true // Owner has full rights
  const accessLevel = getParticipantAccessLevel(Participant, studies, researcherId, sharedStudies)
  return accessLevel === ACCESS_LEVELS.EDIT || accessLevel === ACCESS_LEVELS.ALL
}

export const canViewParticipant = (Participant, studies, researcherId, sharedStudies = []) => {
  if (!Participant.isShared) return true // Owner has full rights
  const accessLevel = getParticipantAccessLevel(Participant, studies, researcherId, sharedStudies)
  return accessLevel >= ACCESS_LEVELS.VIEW
}

// TODO: Traffic Lights with Last Survey Date + Login+device + # completed events
export default function ParticipantList({
  studies,
  title,
  onParticipantSelect,
  researcherId,
  notificationColumn,
  selectedStudies,
  setSelectedStudies,
  getAllStudies,
  mode,
  setOrder,
  order,
  sharedstudies,
  ...props
}) {
  const classes = useStyles()
  const [participants, setParticipants] = useState(null)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [paginatedParticipants, setPaginatedParticipants] = useState([])
  const [rowCount, setRowCount] = useState(40)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(null)
  const layoutClasses = useLayoutStyles()
  const [viewMode, setViewMode] = useState("grid")
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [participantToSuspend, setParticipantToSuspend] = useState(null)
  const [unsuspendDialogOpen, setUnSuspendDialogOpen] = useState(false)
  const [participantToUnSuspend, setParticipantToUnSuspend] = useState(null)
  const query = useQuery()
  const filterParam = query.get("filter")
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [researcherName, setResearcherName] = useState(null)
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const { t } = useTranslation()
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [selectedTab, setSelectedTab] = useState({ id: null, tab: null })
  const [allresearchers, setAllResearchers] = useState([])
  console.log("sharedstudies", sharedstudies)

  const [tabularView, setTabularView] = useState(false)

  const stats = (participant, study) => {
    return [
      {
        value: participant.assessments?.length || study?.assessments?.length || 0,
        label: "ASSESSMENTS",
        color: "#f2aa85",
        key: "assessments",
      },
      {
        value: participant.activities?.length || study?.activities?.length || 0,
        label: "ACTIVITIES",
        color: "#06B0F0",
        key: "activities",
      },
      {
        value: participant.sensors?.length || study?.sensors?.length || 0,
        label: "SENSORS",
        color: "#75d36d",
        key: "sensors",
      },
    ]
  }

  const getParentResearcher = (parentResearcherId) => {
    const researcher = allresearchers.find((r) => r.id === parentResearcherId)
    // console.log("researcher", researcher, allresearchers)
    return researcher ? researcher.name : parentResearcherId
  }

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        const response = await fetchGetData(authString, `researcher/others/list`, "researcher")
        setAllResearchers(response.data)
      } catch (error) {
        console.error("Error fetching researchers:", error)
      }
    }
    fetchResearchers()
  }, [])

  useEffect(() => {
    const fetchresearchername = async () => {
      const res = await LAMP.Researcher.view(researcherId)
      setResearcherName(res.name)
    }
    fetchresearchername()
  }, [researcherId])

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
      setLoading(false)
    },
    // studies !== null && (studies || []).length > 0 ? null : 60000,
    (!studies || studies.length === 0) && (!sharedstudies || sharedstudies.length === 0) ? 60000 : null,
    true
  )

  useEffect(() => {
    let params = JSON.parse(localStorage.getItem("participants"))
    setPage(params?.page ?? 0)
    setRowCount(params?.rowCount ?? 40)
  }, [])

  useEffect(() => {
    if (selected !== selectedStudies) setSelected(selectedStudies)
  }, [selectedStudies])

  useEffect(() => {
    if ((selected || []).length > 0) {
      searchParticipants()
    } else {
      setParticipants([])
      setLoading(false)
    }
  }, [selected])

  const handleChange = (participant, checked) => {
    if (checked) {
      setSelectedParticipants((prevState) => [...prevState, participant])
    } else {
      let selected = selectedParticipants.filter((item) => item.id != participant.id)
      setSelectedParticipants(selected)
    }
  }

  const searchParticipants = (searchVal?: string) => {
    let searchTxt = searchVal ?? search
    const selectedstudiesData = selected.filter((o) => studies.some(({ name }) => o === name))
    const selectedsharedData = sharedstudies
      ? selected.filter((o) => sharedstudies?.some(({ name }) => o === name))
      : []
    const selectedData = [...selectedstudiesData, ...selectedsharedData]
    if (selectedData.length > 0) {
      setLoading(true)
      Service.getAll("participants").then((participantData) => {
        let filteredData = participantData || []
        if (filterParam) {
          filteredData = filteredData.filter((participant) => participant.id === filterParam)
        } else if (!!searchTxt && searchTxt.trim().length > 0) {
          filteredData = filteredData.filter(
            (participant) =>
              participant.name?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
              participant.username?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
              participant.id?.toLowerCase().includes(searchTxt?.toLowerCase())
          )
        }
        const sortedData = sortData(filteredData, selectedData, "id")
        console.log("sortedData", sortedData, selectedData, filteredData)
        console.log("participantData", participantData)
        setParticipants(sortedData)
        setPaginatedParticipants(sortedData.slice(page * rowCount, page * rowCount + rowCount))
        // setPaginatedParticipants(
        //   sortData(participantData, selectedData, "id").slice(page * rowCount, page * rowCount + rowCount)
        // )
        setPage(page)
        setRowCount(rowCount)
        setLoading(false)
      })
    } else {
      setParticipants([])
      setPaginatedParticipants([])
      setLoading(false)
    }
    setSelectedParticipants([])
    setLoading(false)
  }

  const handleSearchData = (val: string) => {
    setSearch(val)
    searchParticipants(val)
  }

  const handleChangePage = (page: number, rowCount: number) => {
    setLoading(true)
    setRowCount(rowCount)
    setPage(page)
    const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    setPaginatedParticipants(
      sortData(participants, selectedData, "name").slice(page * rowCount, page * rowCount + rowCount)
    )
    localStorage.setItem("participants", JSON.stringify({ page: page, rowCount: rowCount }))
    setLoading(false)
  }

  const handleOpenSuspendDialog = (study, setActiveButton) => {
    setParticipantToSuspend(study)
    setSuspendDialogOpen(true)
    setActiveButton({ id: null, action: null })
  }

  const handleCloseSuspendDialog = () => {
    setSuspendDialogOpen(false)
    setParticipantToSuspend(null)
  }
  const handleOpenUnSuspendDialog = (p, setActiveButton) => {
    setParticipantToUnSuspend(p)
    setUnSuspendDialogOpen(true)
    setActiveButton({ id: null, action: null })
  }

  const handleCloseUnSuspendDialog = () => {
    setUnSuspendDialogOpen(false)
    setParticipantToUnSuspend(null)
  }
  const handleUpdateParticipant = async (pid, up) => {
    const participant = participants.find((a) => a.id === pid)
    if (participant && !canEditParticipant(participant, studies, researcherId, sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to update this activity"), { variant: "error" })
      return
    }
    try {
      setLoading(true)
      LAMP.Participant.update(pid, up)
        .then((res) => {
          Service.updateMultipleKeys(
            "participants",
            { participants: [{ id: pid, ...up }] },
            [
              "firstName",
              "lastName",
              "username",
              "email",
              "mobile",
              "language",
              "theme",
              "emergency_contact",
              "helpline",
              "group_name",
              "researcherNote",
              "userAge",
              "gender",
              "address",
              "caregiverName",
              "caregiverRelation",
              "caregiverMobile",
              "caregiverEmail",
              "researcherNote",
              "hospitalId",
              "otherHealthIds",
              "isSuspended",
              "systemTimestamps",
            ],
            "id"
          )
        })
        .catch((error) => {
          console.log("Error updating participant", error)
        })
      await LAMP.Participant.update(pid, up)
      const fieldlist = [
        "firstName",
        "lastName",
        "username",
        "email",
        "mobile",
        "language",
        "theme",
        "emergency_contact",
        "helpline",
        "group_name",
        "researcherNote",
        "userAge",
        "gender",
        "address",
        "caregiverName",
        "caregiverRelation",
        "caregiverMobile",
        "caregiverEmail",
        "researcherNote",
        "hospitalId",
        "otherHealthIds",
        "isSuspended",
        "systemTimestamps",
      ]
      await Service.updateMultipleKeys("participants", { participants: [{ id: pid, ...up }] }, fieldlist, "id")
      await getAllStudies()
      getAllStudies()
      enqueueSnackbar(t("Participant updated successfully"), { variant: "success" })
    } catch (err) {
      enqueueSnackbar(t("Failed to update participant: ") + err.message, { variant: "error" })
    }
  }

  const confirmSuspend = () => {
    if (participantToSuspend) {
      const updatedParticipant = {
        ...participantToSuspend,
        systemTimestamps: {
          ...participantToSuspend.systemTimestamps,
          suspensionTime: new Date(),
        },
      }
      handleUpdateParticipant(participantToSuspend.id, updatedParticipant)
      handleCloseSuspendDialog()
    }
  }
  const confirmUnSuspend = () => {
    if (participantToUnSuspend) {
      const updatedParticipant = {
        ...participantToUnSuspend,
        systemTimestamps: {
          ...participantToUnSuspend.systemTimestamps,
          suspensionTime: null,
        },
      }
      handleUpdateParticipant(participantToUnSuspend.id, updatedParticipant)
      handleCloseUnSuspendDialog()
    }
  }

  // Choose columns and values here btw we can do this later
  const [columns, setColumns] = useState<ColumnConfig[]>([
    {
      id: "id",
      label: "ID",
      value: (p) => p.id,
      visible: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by ID",
    },
    {
      id: "name",
      label: "Name",
      value: (p) => `${p.firstName} ${p.lastName}`,
      visible: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Name",
    },
    {
      id: "username",
      label: "Username",
      value: (p) => p.username,
      visible: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Username",
      renderCell: (p) => (
        <ParticipantName
          participant={p}
          updateParticipant={(nameVal) => {
            setParticipants((prevParticipants) =>
              prevParticipants.map((participant) =>
                participant.id === p.id ? { ...participant, username: nameVal } : participant
              )
            )
          }}
          openSettings={false}
        />
      ),
    },
    {
      id: "email",
      label: "Email",
      value: (p) => p.email,
      visible: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Email",
    },
    {
      id: "mobile",
      label: "Mobile",
      value: (p) => p.mobile,
      visible: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Mobile",
    },
    {
      id: "group",
      label: "Group",
      value: (p) => p.group_name || "-",
      visible: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Group",
    },
    {
      id: "study",
      label: "Study",
      value: (p) => p.study_name,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Study",
    },
    {
      id: "ownership",
      label: "Ownership",
      // value: (a) => a.isShared ? `Shared` : "Owner",
      value: (p) => getParentResearcher(p.parentResearcher) || getParentResearcher(researcherId) || "Owner",
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
      filterPlaceholder: "Filter by Owner",
    },
    {
      id: "userAge",
      label: "Age",
      value: (p) => p.userAge || "-",
      visible: false,
      filterable: true,
      filterType: "numeric",
      filterPlaceholder: "Filter by Age",
    },
    {
      id: "gender",
      label: "Gender",
      value: (p) => p.gender || "-",
      visible: false,
      filterable: true,
      filterType: "dropdown",
      filterOptions: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
      filterPlaceholder: "Filter by Gender",
    },
    { id: "caregiverName", label: "Caregiver", value: (p) => p.caregiverName || "-", visible: false },
    {
      id: "lastLogin",
      label: "Last Login",
      value: (p) => (p.systemTimestamps?.lastLoginTime ? formatDate(p.systemTimestamps.lastLoginTime) : "-"),
      visible: true,
      filterable: true,
      filterType: "date",
      filterPlaceholder: "Filter by Last Login",
    },
    {
      id: "isLoggedIn",
      label: "Login Status",
      value: (p) => p.isLoggedIn,
      visible: true,
      renderCell: (p) => (
        <Chip
          label={p.isLoggedIn ? "Online" : "Offline"}
          size="small"
          color={p.isLoggedIn ? "primary" : "default"}
          variant={p.isLoggedIn ? "default" : "outlined"}
          style={{
            backgroundColor: p.isLoggedIn ? "#e8f5e8" : "#f5f5f5",
            color: p.isLoggedIn ? "#2e7d32" : "#757575",
            fontWeight: 500,
          }}
        />
      ),
      filterable: true,
      filterType: "dropdown",
      filterOptions: [
        { label: "Online", value: true },
        { label: "Offline", value: false },
      ],
      filterPlaceholder: "Filter by Status",
    },
  ])

  useEffect(() => {
    if (allresearchers && allresearchers.length > 0) {
      setColumns((prevColumns) => {
        // Find if ownership column already exists
        const ownershipColIndex = prevColumns.findIndex((col) => col.id === "ownership")

        if (ownershipColIndex >= 0) {
          // Update existing ownership column
          const updatedColumns = [...prevColumns]
          updatedColumns[ownershipColIndex] = {
            id: "ownership",
            label: "Ownership",
            value: (p) => getParentResearcher(p.parentResearcher) || getParentResearcher(researcherId),
            visible: true,
            sortable: true,
          }
          return updatedColumns
        } else {
          // Add ownership column
          return [
            ...prevColumns,
            {
              id: "ownership",
              label: "Ownership",
              value: (p) => getParentResearcher(p.parentResearcher) || getParentResearcher(researcherId),
              visible: true,
              sortable: true,
            },
          ]
        }
      })
    }
  }, [allresearchers])

  // and here we provide them here custom view for selected columns ps are we really doing that edit on click :/
  const ColumnSelector = ({ columns, setColumns }) => {
    return (
      <Box>
        <FormControl>
          <InputLabel>Visible Columns</InputLabel>
          <Select
            multiple
            value={columns.filter((c) => c.visible).map((c) => c.id)}
            onChange={(e) => {
              const selectedIds = e.target.value as string[]
              setColumns(
                columns.map((col) => ({
                  ...col,
                  visible: selectedIds.includes(col.id),
                }))
              )
            }}
            renderValue={(selected) => (
              <Box style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((id) => (
                  <Chip key={id} label={columns.find((c) => c.id === id)?.label} size="small" />
                ))}
              </Box>
            )}
          >
            {columns.map((column) => (
              <MenuItem key={column.id} value={column.id}>
                <Checkbox checked={column.visible} />
                <ListItemText primary={column.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    )
  }
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "Not available"
  }
  const formatDate_detailed = (date) => {
    return date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "Not available"
  }

  const [selectAll, setSelectAll] = useState(false)
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedParticipants(paginatedParticipants)
      setSelectAll(true)
    } else {
      setSelectedParticipants([])
      setSelectAll(false)
    }
  }
  const [viewingParticipant, setViewingParticipant] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)

  const handleViewParticipant = (participant) => {
    setViewingParticipant(participant)
    setIsEditing(false)
    setTriggerSave(false)
  }

  const handleCloseViewParticipant = () => {
    setViewingParticipant(null)
    setIsEditing(false)
    setTriggerSave(false)
    setActiveButton({ id: null, action: null })
  }

  const handleEditParticipant = () => {
    if (!viewingParticipant || !canEditParticipant(viewingParticipant, studies, researcherId, sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
      return
    }
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTriggerSave(false)
    }
  }

  const handleSaveParticipant = () => {
    if (!viewingParticipant || !canEditParticipant(viewingParticipant, studies, researcherId, sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
      return
    }
    setTriggerSave(true)
  }

  const handleSaveComplete = (updatedParticipant) => {
    setViewingParticipant(updatedParticipant)
    setIsEditing(false)
    setTriggerSave(false)
    searchParticipants()
  }

  // huzzing login status every 30 seconds bcoz why not
  useEffect(() => {
    const statusInterval = setInterval(() => {
      if (participants?.length) {
        participants.forEach((participant) => {
          // Refresh participant data periodically
          LAMP.Participant.view(participant.id).then((updatedParticipant: any) => {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === participant.id
                  ? {
                      ...p,
                      isLoggedIn: updatedParticipant.isLoggedIn,
                      systemTimestamps: updatedParticipant.systemTimestamps,
                    }
                  : p
              )
            )
          })
        })
      }
    }, 60 * 60 * 1000)
    return () => clearInterval(statusInterval)
  }, [participants])

  const [currentPage, setCurrentPage] = useState(0)
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(5)
  const [hasCredentials, setHasCredentials] = useState({})
  const [credentialTooltipOpen, setCredentialTooltipOpen] = useState({})
  const [tooltipTimeouts, setTooltipTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({})

  useEffect(() => {
    console.warn("hasCredentials changed", hasCredentials)
  }, [hasCredentials])
  useEffect(() => {
    console.warn("credentialTooltipOpen changed", credentialTooltipOpen)
  }, [credentialTooltipOpen])

  const TableView_Mod = () => {
    console.log("sharedstudies table", sharedstudies)
    const [sortConfig, setSortConfig] = useState({ field: "index", direction: "asc" as "desc" | "asc" })
    const [selectedRows, setSelectedRows] = useState([])
    const classes = useModularTableStyles()
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [selectedParticipant, setSelectedParticipant] = useState(null)
    const [editingParticipant, setEditingParticipant] = useState(null)
    const [editedData, setEditedData] = useState({})
    const editableColumns = [
      "firstName",
      "lastName",
      "username",
      "email",
      "mobile",
      "userAge",
      "gender",
      "caregiverName",
    ]
    const fieldConfigs = {
      gender: {
        type: "select",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
      },
      userAge: {
        type: "number",
      },
    }

    const handleEditClick = (participant) => {
      if (!canEditParticipant(participant, studies, researcherId, sharedstudies)) {
        enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
        return
      }
      if (activeButton.id === participant.id && activeButton.action === "edit") {
        // Cancel edit mode
        setEditingParticipant(null)
        setEditedData({})
        setActiveButton({ id: null, action: null })
      } else {
        // Start editing
        setEditingParticipant(participant)
        setEditedData({})
        setActiveButton({ id: participant.id, action: "edit" })
      }
    }

    const handleSaveClick = async (participant) => {
      if (!canEditParticipant(participant, studies, researcherId, sharedstudies)) {
        enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
        return
      }
      if (Object.keys(editedData).length > 0) {
        const errors = validateFields(editedData)

        if (errors.length > 0) {
          errors.forEach((error) => {
            enqueueSnackbar(error, { variant: "error" })
          })
          return
        }

        // Prepare updated participant data
        const updatedParticipant = {
          ...participant,
          ...editedData,
        }

        try {
          await handleUpdateParticipant(participant.id, updatedParticipant)
          setEditingParticipant(null)
          setEditedData({})
          setActiveButton({ id: null, action: null })
          enqueueSnackbar("Participant updated successfully", { variant: "success" })
        } catch (error) {
          enqueueSnackbar("Failed to update participant", { variant: "error" })
        }
      }
    }

    const validateFields = (data) => {
      const errors = []

      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Invalid email format")
      }

      if (data.mobile && !/^\+?[\d\s-]{10,}$/.test(data.mobile)) {
        errors.push("Invalid phone number format")
      }

      if (data.userAge && (isNaN(data.userAge) || data.userAge < 0)) {
        errors.push("Invalid age")
      }

      return errors
    }

    useEffect(() => {
      console.log("confirmation dialog  value ", confirmationDialog, selectedParticipant)
    }, [confirmationDialog])
    const handleDeleteClick = (participant) => {
      if (!canEditParticipant(participant, studies, researcherId, sharedstudies)) {
        enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
        return
      }
      setSelectedParticipant(participant)
      setConfirmationDialog(true)
      setActiveButton({ id: participant.id, action: "delete" })
      console.log("deleting participant", participant, confirmationDialog)
    }

    const handleDelete = async (status) => {
      if (status === "Yes") {
        try {
          const credentials = await LAMP.Credential.list(selectedParticipant.id)
          const filteredCreds = credentials.filter((c) => c.hasOwnProperty("origin"))
          for (let cred of filteredCreds) {
            await LAMP.Credential.delete(selectedParticipant.id, cred["access_key"])
          }
          await LAMP.Type.setAttachment(selectedParticipant.id, "me", "lamp.name", null)
          await LAMP.Participant.delete(selectedParticipant.id)
          await LAMP.Credential.list(selectedParticipant.id).then((cred) => {
            cred = cred.filter((c) => c.hasOwnProperty("origin"))
            cred.map((each) => {
              LAMP.Credential.delete(selectedParticipant.id, each["access_key"])
            })
          })
          await Service.delete("participants", [selectedParticipant.id])
          await Service.updateCount("studies", selectedParticipant.study_id, "participant_count", 1, 1)
          enqueueSnackbar(t("Participant deleted successfully"), { variant: "success" })
          searchParticipants()
        } catch (error) {
          console.error("Error deleting participant:", error)
          enqueueSnackbar(t("Failed to delete participant"), { variant: "error" })
        }
      }
      setConfirmationDialog(false)
      setActiveButton({ id: null, action: null })
    }
    const renderCellContent = (column, row) => {
      const columnKey = column.id
      const value = column.value(row)
      const isEditable =
        editableColumns.includes(columnKey) &&
        // editingParticipant?.id === row.id &&
        activeButton.id === row.id &&
        activeButton.action === "edit" &&
        canEditParticipant(row, studies, researcherId, sharedstudies)

      if (!isEditable) {
        if (column.renderCell) {
          return column.renderCell(row)
        }
        return <div className={classes.cellContent}>{value}</div>
      }
      const fieldConfig = fieldConfigs[columnKey]

      if (fieldConfig?.type === "select") {
        return (
          <Select
            value={editedData[columnKey] ?? value}
            onChange={(e) => {
              setEditedData((prev) => ({
                ...prev,
                [columnKey]: e.target.value,
              }))
            }}
            className={classes.editableSelect}
            fullWidth
          >
            {fieldConfig.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )
      }

      if (fieldConfig?.type === "number") {
        return (
          <TextField
            type="number"
            value={editedData[columnKey] ?? value}
            onChange={(e) => {
              setEditedData((prev) => ({
                ...prev,
                [columnKey]: e.target.value,
              }))
            }}
            className={classes.editableInput}
            fullWidth
          />
        )
      }

      return (
        <TextField
          value={editedData[columnKey] ?? value}
          onChange={(e) => {
            setEditedData((prev) => ({
              ...prev,
              [columnKey]: e.target.value,
            }))
          }}
          className={classes.editableInput}
          fullWidth
        />
      )
    }

    const originalIndexMap = useMemo(() => {
      return (participants || []).reduce((acc, participant, index) => {
        acc[participant.id] = index + 1
        return acc
      }, {})
    }, [participants])

    const sortedData = useMemo(() => {
      if (!participants) return []

      const sortableData = [...participants]
      if (sortConfig.field === "index") {
        sortableData.sort((a, b) => {
          const aIndex = originalIndexMap[a.id]
          const bIndex = originalIndexMap[b.id]
          return sortConfig.direction === "asc" ? aIndex - bIndex : bIndex - aIndex
        })
      } else if (sortConfig.field) {
        sortableData.sort((a, b) => {
          const aValue = a[sortConfig.field] || ""
          const bValue = b[sortConfig.field] || ""

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
          }

          return sortConfig.direction === "asc" ? (aValue > bValue ? 1 : -1) : bValue > aValue ? 1 : -1
        })
      }
      return sortableData
    }, [participants, sortConfig, originalIndexMap])

    const checkCredentials = async (participantId, isShared = false) => {
      try {
        let credentials
        if (isShared) {
          const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
          const result = await fetchCredentialsOfSharedParticipant(authString, participantId)
          credentials = result.data
        } else {
          credentials = await LAMP.Credential.list(participantId)
        }
        const hasValidCredentials =
          credentials &&
          Array.isArray(credentials) &&
          credentials.length > 0 &&
          credentials.some((cred) => cred && Object.keys(cred).length > 0)
        setHasCredentials((prev) => ({
          ...prev,
          [participantId]: hasValidCredentials,
        }))
        return hasValidCredentials
      } catch (error) {
        console.error("Error checking credentials:", error)
        setHasCredentials((prev) => ({
          ...prev,
          [participantId]: false,
        }))
        return false
      }
    }

    const clearTooltipTimeout = (participantId: string) => {
      if (tooltipTimeouts[participantId]) {
        clearTimeout(tooltipTimeouts[participantId])
        setTooltipTimeouts((prev) => {
          const { [participantId]: removed, ...rest } = prev
          return rest
        })
      }
    }

    const handleVisualize = async (participantId, isShared, event) => {
      setActiveButton({ id: participantId, action: "enter" })
      clearTooltipTimeout(participantId)
      const credentialsExist = await checkCredentials(participantId, isShared)
      // if (!credentialsExist) {
      //   setCredentialTooltipOpen(prev => ({
      //     ...prev,
      //     [participantId]: true
      //   }))
      //   setTimeout(() => {
      //     setCredentialTooltipOpen(prev => ({
      //       ...prev,
      //       [participantId]: false
      //     }))
      //     setActiveButton({ id: null, action: null })
      //   }, 1000)
      //   return
      // }
      if (!credentialsExist) {
        setCredentialTooltipOpen((prev) => ({
          ...prev,
          [participantId]: true,
        }))
        const timeoutId = setTimeout(() => {
          setCredentialTooltipOpen((prev) => ({
            ...prev,
            [participantId]: false,
          }))
          setActiveButton({ id: null, action: null })
          setTooltipTimeouts((prev) => {
            const { [participantId]: removed, ...rest } = prev
            return rest
          })
        }, 3000)
        setTooltipTimeouts((prev) => ({
          ...prev,
          [participantId]: timeoutId,
        }))
        setActiveButton({ id: null, action: null })
        return
      }
      onParticipantSelect(participantId)
      setActiveButton({ id: null, action: null })
    }

    const actions = (participant) => {
      const pStudy = studies.filter((study) => study.id === participant.study_id)[0]

      return (
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          {/* <Box component="span" className={classes.actionIcon}>
            {notificationColumn && <NotificationSettings participant={participant} />}
          </Box> */}
          <Tooltip
            title="This participant has not created their credentials yet"
            open={hasCredentials[participant.id] === false && credentialTooltipOpen[participant.id]}
            arrow
            disableFocusListener={true}
            disableHoverListener={true}
            disableTouchListener={true}
            enterDelay={0}
            leaveDelay={0}
            PopperProps={{
              style: { zIndex: 9999 },
              modifiers: {
                preventOverflow: {
                  enabled: true,
                  boundariesElement: "viewport",
                  padding: 8,
                },
                flip: {
                  enabled: true,
                  behavior: ["top", "bottom", "left", "right"],
                },
                hide: {
                  enabled: false,
                },
              },
              placement: "top",
            }}
          >
            <Box component="span" className={classes.actionIcon}>
              {activeButton.id === participant.id && activeButton.action === "view" ? (
                <VisualiseFilledIcon
                  className={`${hasCredentials[participant.id] === false ? "alert" : "active"}`}
                  onClick={(event) => {
                    // setActiveButton({ id: participant.id, action: "view" })
                    // onParticipantSelect(participant.id)
                    // setActiveButton({ id: null, action: null })
                    event.preventDefault()
                    event.stopPropagation()
                    console.log("Visualize active clicked for participant", participant.id, event)
                    handleVisualize(participant.id, participant.isShared, event)
                  }}
                  style={{ transform: "scaleX(-1)" }}
                />
              ) : (
                <VisualiseIcon
                  className={`${hasCredentials[participant.id] === false ? "alert" : ""}`}
                  onClick={(event) => {
                    // setActiveButton({ id: participant.id, action: "view" })
                    // onParticipantSelect(participant.id)
                    // setActiveButton({ id: null, action: null })
                    handleVisualize(participant.id, participant.isShared, event)
                  }}
                  style={{ transform: "scaleX(-1)" }}
                />
              )}
            </Box>
          </Tooltip>
          <Box component="span" className={classes.actionIcon}>
            {activeButton.id === participant.id && activeButton.action === "view" ? (
              <ViewFilledIcon
                className="active"
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "view" })
                  handleViewParticipant(participant)
                  // onParticipantSelect(participant.id)
                  setActiveButton({ id: null, action: null })
                }}
              />
            ) : (
              <ViewIcon
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "view" })
                  // onParticipantSelect(participant.id)
                  handleViewParticipant(participant)
                  setActiveButton({ id: null, action: null })
                }}
              />
            )}
          </Box>

          {canEditParticipant(participant, studies, researcherId, sharedstudies) && (
            <>
              <Box component="span" className={classes.actionIcon}>
                {activeButton.id === participant.id && activeButton.action === "edit" ? (
                  <EditFilledIcon className="active" onClick={() => handleEditClick(participant)} />
                ) : (
                  <EditIcon onClick={() => handleEditClick(participant)} />
                )}
              </Box>
              <Box component="span" className={classes.actionIcon}>
                <SaveIcon
                  className={!Object.keys(editedData).length ? classes.disabledIcon : ""}
                  onClick={() => {
                    if (Object.keys(editedData).length > 0) {
                      handleSaveClick(participant)
                    } else {
                      enqueueSnackbar("No changes to save.", { variant: "info", autoHideDuration: 1000 })
                    }
                  }}
                />
              </Box>
              <Box component="span" className={classes.actionIcon}>
                <Credentials user={participant} />
              </Box>
              <Box component="span" className={classes.actionIcon}>
                {!participant.systemTimestamps?.suspensionTime ? (
                  activeButton.id === participant.id && activeButton.action === "suspend" ? (
                    <SuspendFilledIcon
                      className="active"
                      onClick={() => {
                        setActiveButton({ id: participant.id, action: "suspend" })
                        handleOpenSuspendDialog(participant, setActiveButton)
                      }}
                      style={{ cursor: "pointer", width: 24, height: 24 }}
                    />
                  ) : (
                    <SuspendIcon
                      onClick={() => {
                        setActiveButton({ id: participant.id, action: "suspend" })
                        handleOpenSuspendDialog(participant, setActiveButton)
                      }}
                      style={{ cursor: "pointer", width: 24, height: 24 }}
                    />
                  )
                ) : activeButton.id === participant.id && activeButton.action === "suspend" ? (
                  <SuspendFilledIcon
                    className="active"
                    onClick={() => {
                      setActiveButton({ id: participant.id, action: "suspend" })
                      handleOpenUnSuspendDialog(participant, setActiveButton)
                    }}
                    style={{ cursor: "pointer", width: 24, height: 24 }}
                  />
                ) : (
                  <SuspendFilledIcon
                    onClick={() => {
                      setActiveButton({ id: participant.id, action: "suspend" })
                      handleOpenUnSuspendDialog(participant, setActiveButton)
                    }}
                    style={{ cursor: "pointer", width: 24, height: 24 }}
                  />
                )}
              </Box>
            </>
          )}

          {!participant.isShared && (
            <>
              <Box component="span" className={classes.actionIcon}>
                {activeButton.id === participant.id && activeButton.action === "delete" ? (
                  <DeleteFilledIcon className="active" onClick={() => handleDeleteClick(participant)} />
                ) : (
                  <DeleteIcon onClick={() => handleDeleteClick(participant)} />
                )}
              </Box>
            </>
          )}
          {/* <Box component="span" className={classes.actionIcon}>
            {activeButton.id === participant.id && activeButton.action === "settings" ? (
              <CopyFilledIcon
                className="active"
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "settings" })
                  window.location.href = `/#/researcher/${researcherId}/participant/${participant?.id}/settings`
                }}
              />
            ) : (
              <CopyIcon
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "settings" })
                  window.location.href = `/#/researcher/${researcherId}/participant/${participant?.id}/settings`
                }}
              />
            )}
          </Box> */}
        </Box>
      )
    }

    const columns_table = useMemo(() => {
      return columns.map((col) => {
        if (editableColumns.includes(col.id)) {
          return {
            ...col,
            renderCell: (row) => renderCellContent(col, row),
          }
        }
        return col
      })
    }, [columns, editableColumns, activeButton, editedData])

    const initFilters = () => {
      const baseFilters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
      columns.forEach((col) => {
        baseFilters[col.id] = { value: null, matchMode: FilterMatchMode.CONTAINS }
      })
      console.log("Initial filters:", baseFilters)
      return baseFilters
    }
    const [filters, setFilters] = useState(initFilters())

    useEffect(() => {
      setFilters(initFilters())
    }, [columns])

    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage)
    }

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
      setCurrentRowsPerPage(newRowsPerPage)
      setCurrentPage(0) // Reset to first page when changing rows per page
    }

    return (
      <>
        <EmersiveTable
          data={participants || []} // sortedData ||
          columns={columns_table.filter((col) => col.visible).map((col) => ({ ...col, sortable: true }))}
          actions={actions}
          getItemKey={(participant) => participant.id}
          selectable={true}
          selectedRows={selectedRows}
          onSelectRow={(ids) => {
            setSelectedRows(ids)
          }}
          onSelectAll={() => {
            setSelectedRows((prev) => (prev.length === participants.length ? [] : participants.map((p) => p.id)))
          }}
          sortConfig={sortConfig}
          onSort={(field) => {
            setSortConfig({
              field,
              direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
            })
          }}
          indexmap={originalIndexMap}
          categorizeItems={null}
          showCategoryHeaders={false}
          filters={filters}
          onFilter={(newFilters) => setFilters({ ...initFilters(), ...newFilters })}
          filterDisplay="row"
          emptyStateMessage="No participants found"
          itemclass="participants"
          paginator={true}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rows={currentRowsPerPage}
        />

        {/* <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
          <DialogTitle>Suspend Participant</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to suspend the participant "{participantToSuspend?.name || participantToSuspend?.username || participantToSuspend?.id}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSuspendDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={confirmSuspend} color="primary">
              Suspend
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={unsuspendDialogOpen} onClose={handleCloseUnSuspendDialog}>
          <DialogTitle>Removal of Participant from Suspension</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to undo suspension of the participant "{participantToUnSuspend?.name || participantToUnSuspend?.username || participantToUnSuspend?.id }"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUnSuspendDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={confirmUnSuspend} color="primary">
              Undo Suspension
            </Button>
          </DialogActions>
        </Dialog> */}
        <Dialog
          open={confirmationDialog}
          onClose={() => {
            setConfirmationDialog(false)
            setSelectedParticipant(null)
            setActiveButton({ id: null, action: null })
          }}
        >
          <DialogTitle>Removal of Participant from Study</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the participant "
              {selectedParticipant?.username || selectedParticipant?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setConfirmationDialog(false)
                setSelectedParticipant(null)
                setActiveButton({ id: null, action: null })
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        {/* <ConfirmationDialog
          open={confirmationDialog}
          onClose={() => {
            setConfirmationDialog(false)
            setSelectedParticipant(null)
            setActiveButton({ id: null, action: null })
          }}
          confirmAction={handleDelete}
          confirmationMsg={t("Are you sure you want to delete this Participant?")}
        /> */}

        {selectedParticipant && (
          <>
            <ParticipantDetailsDialog
              participant={selectedParticipant}
              open={detailsDialogOpen}
              onClose={() => {
                setDetailsDialogOpen(false)
                setSelectedParticipant(null)
                setActiveButton({ id: null, action: null })
              }}
              onSave={async (updatedParticipant) => {
                try {
                  await handleUpdateParticipant(selectedParticipant.id, updatedParticipant)
                  setDetailsDialogOpen(false)
                  setSelectedParticipant(null)
                  setActiveButton({ id: null, action: null })
                } catch (error) {
                  console.error("Error  updating participant:", error)
                }
              }}
              formatDate={formatDate}
              researcherId={researcherId}
              pStudy={
                studies.find((s) => s.id === selectedParticipant.study_id) ||
                sharedstudies.find((s) => s.id === selectedParticipant.study_id)
              }
            />
          </>
        )}
      </>
    )
  }

  useEffect(() => {
    if (filterParam) {
      console.log("Filter param changed:", filterParam)
      setSearch(null)
      searchParticipants()
    }
  }, [filterParam])

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || participants === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {viewingParticipant ? (
        <Header
          authType={"Researcher"}
          title={props.ptitle}
          pageLocation={`${props.adminName ? props.adminName + " >" : ""} ${
            props.ptitle
          } (Researcher) > Participants > ${viewingParticipant.firstName} ${viewingParticipant.lastName}`}
          setIdentity={props.setIdentity}
        />
      ) : (
        // <ItemViewHeader
        //   ItemTitle="Participant"
        //   ItemName={`${viewingParticipant.firstName} ${viewingParticipant.lastName}`}
        //   searchData={handleSearchData}
        //   authType={props.authType}
        //   onEdit={handleEditParticipant}
        //   onSave={() => {
        //     if (isEditing) {
        //       handleSaveParticipant()
        //     }
        //   }}
        //   onPrevious={() => {
        //     const currentIndex = participants.findIndex((p) => p.id === viewingParticipant.id)
        //     if (currentIndex > 0) {
        //       setViewingParticipant(participants[currentIndex - 1])
        //     }
        //   }}
        //   onNext={() => {
        //     const currentIndex = participants.findIndex((p) => p.id === viewingParticipant.id)
        //     if (currentIndex < participants.length - 1) {
        //       setViewingParticipant(participants[currentIndex + 1])
        //     }
        //   }}
        //   onClose={handleCloseViewParticipant}
        // />
        // <Header
        //   studies={studies}
        //   participants={participants}
        //   researcherId={researcherId}
        //   selectedParticipants={selectedParticipants}
        //   searchData={handleSearchData}
        //   selectedStudies={selected}
        //   setSelectedStudies={setSelectedStudies}
        //   setParticipants={searchParticipants}
        //   setData={getAllStudies}
        //   mode={mode}
        //   setOrder={setOrder}
        //   order={order}
        //   title={props.ptitle}
        //   authType={props.authType}
        //   onLogout={props.onLogout}
        //   onViewModechanged={setViewMode}
        //   viewMode={viewMode}
        //   VisibleColumns={columns}
        //   setVisibleColumns={setColumns}
        //   resemail={props.resemail}
        //   refresh={searchParticipants}
        // />

        <Header
          authType={"Researcher"}
          title={props.ptitle}
          pageLocation={`${props.adminName ? props.adminName + " >" : ""} ${props.ptitle} (Researcher) > Participants`}
          setIdentity={props.setIdentity}
        />
      )}
      {viewingParticipant ? (
        <div className="body-container">
          <ActionsComponent
            actions={["edit", "save", "passwordEdit", "left", "right", "cancel"]}
            onEdit={handleEditParticipant}
            onSave={() => {
              if (isEditing) {
                handleSaveParticipant()
              }
            }}
            onPrevious={() => {
              const currentIndex = participants.findIndex((p) => p.id === viewingParticipant.id)
              if (currentIndex > 0) {
                setViewingParticipant(participants[currentIndex - 1])
              }
            }}
            onNext={() => {
              const currentIndex = participants.findIndex((p) => p.id === viewingParticipant.id)
              if (currentIndex < participants.length - 1) {
                setViewingParticipant(participants[currentIndex + 1])
              }
            }}
            onClose={handleCloseViewParticipant}
          />
          <ParticipantDetailItem
            participant={viewingParticipant}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            studies={studies}
            triggerSave={triggerSave}
            stats={stats}
            sharedstudies={sharedstudies}
          />
        </div>
      ) : (
        <>
          {/* {!!participants && participants.length > 0 ? ( */}
          <div className="body-container">
            <ActionsComponent
              searchData={handleSearchData}
              refreshElements={searchParticipants}
              setSelectedColumns={setColumns}
              VisibleColumns={columns}
              setVisibleColumns={setColumns}
              addComponent={
                <AddButton
                  researcherId={researcherId}
                  studies={studies}
                  participants={participants}
                  setParticipants={setParticipants}
                  setSelectedStudies={setSelectedStudies}
                  setData={getAllStudies}
                  mode={mode}
                  title={props.title}
                  resemail={props.resemail}
                  sharedstudies={sharedstudies}
                />
              }
              actions={["refresh", "search", "grid", "table", "filter", "download"]}
              tabularView={tabularView}
              setTabularView={setTabularView}
              studies={studies}
              selectedStudies={selectedStudies}
              setSelectedStudies={setSelectedStudies}
              researcherId={researcherId}
              order={order}
              setOrder={setOrder}
              tabType={"participants"}
              downloadTarget={"participants"}
            />
            {!tabularView ? (
              <div className="content-container">
                <Grid container spacing={3} className="cards-grid">
                  {!!participants && participants.length > 0 ? (
                    <>
                      {paginatedParticipants.map((eachParticipant, index) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} key={eachParticipant.id}>
                          <ParticipantListItem
                            participant={eachParticipant}
                            onParticipantSelect={onParticipantSelect}
                            studies={studies}
                            notificationColumn={notificationColumn}
                            handleSelectionChange={handleChange}
                            selectedParticipants={selectedParticipants}
                            researcherId={researcherId}
                            onViewParticipant={handleViewParticipant}
                            onParticipantUpdate={handleUpdateParticipant}
                            formatDate={formatDate}
                            onSuspend={handleOpenSuspendDialog}
                            onUnSuspend={handleOpenUnSuspendDialog}
                            refreshParticipants={searchParticipants}
                            researcherName={
                              !eachParticipant.isShared
                                ? researcherName
                                : getParentResearcher(eachParticipant.parentResearcher)
                            }
                            sharedstudies={sharedstudies}
                          />
                        </Grid>
                      ))}
                      <Pagination
                        data={participants}
                        updatePage={handleChangePage}
                        rowPerPage={[5, 10, 20, 40, 60, 80]}
                        currentPage={page}
                        currentRowCount={rowCount}
                      />
                    </>
                  ) : (
                    <Box className={classes.norecordsmain}>
                      <Box display="flex" p={2} alignItems="center" className={classes.norecords}>
                        <Icon>info</Icon>
                        {`${t("No Records Found")}`}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </div>
            ) : (
              <TableView_Mod />
            )}
            <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
              <DialogTitle>Suspend Participant</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to suspend the participant "
                  {participantToSuspend?.name || participantToSuspend?.username || participantToSuspend?.id}"?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseSuspendDialog} color="secondary">
                  Cancel
                </Button>
                <Button onClick={confirmSuspend} color="primary">
                  Suspend
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog open={unsuspendDialogOpen} onClose={handleCloseUnSuspendDialog}>
              <DialogTitle>Removal of Participant from Suspension</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to undo suspension of the participant "
                  {participantToUnSuspend?.name || participantToUnSuspend?.username || participantToUnSuspend?.id}"?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseUnSuspendDialog} color="secondary">
                  Cancel
                </Button>
                <Button onClick={confirmUnSuspend} color="primary">
                  Undo Suspension
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </>
      )}
    </React.Fragment>
  )
}
