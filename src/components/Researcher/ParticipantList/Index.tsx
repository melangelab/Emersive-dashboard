import React, { useState, useEffect, useMemo } from "react"
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
import Header from "./Header"
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
import { ModularTable, useModularTableStyles } from "../Studies/Index"
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
    },
    studies !== null && (studies || []).length > 0 ? null : 2000,
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
    const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    if (selectedData.length > 0) {
      setLoading(true)
      Service.getAll("participants").then((participantData) => {
        let filteredData = participantData || []
        // // participantData = (participantData || []).filter((p) => p.is_deleted != true)
        // if (!!searchTxt && searchTxt.trim().length > 0) {
        //   participantData = (participantData || []).filter(
        //     (i) => i.name?.includes(searchTxt) || i.id?.includes(searchTxt)
        //   )
        //   setParticipants(sortData(participantData, selectedData, "id"))
        // } else {
        //   setParticipants(sortData(participantData, selectedData, "id"))
        // }
        if (filterParam) {
          filteredData = filteredData.filter((participant) => participant.id === filterParam)
        } else if (!!searchTxt && searchTxt.trim().length > 0) {
          filteredData = filteredData.filter(
            (participant) =>
              participant.name?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
              participant.id?.toLowerCase().includes(searchTxt?.toLowerCase())
          )
        }
        const sortedData = sortData(filteredData, selectedData, "id")
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
  const [columns, setColumns] = useState<TableColumn[]>([
    { id: "id", label: "ID", value: (p) => p.id, visible: true },
    { id: "name", label: "Name", value: (p) => `${p.firstName} ${p.lastName}`, visible: true },
    { id: "username", label: "Username", value: (p) => p.username, visible: true },
    { id: "email", label: "Email", value: (p) => p.email, visible: true },
    { id: "mobile", label: "Mobile", value: (p) => p.mobile, visible: true },
    { id: "group", label: "Group", value: (p) => p.group_name || "-", visible: true },
    { id: "study", label: "Study", value: (p) => p.study_name, visible: true },
    { id: "userAge", label: "Age", value: (p) => p.userAge || "-", visible: false },
    { id: "gender", label: "Gender", value: (p) => p.gender || "-", visible: false },
    { id: "caregiverName", label: "Caregiver", value: (p) => p.caregiverName || "-", visible: false },
    {
      id: "lastLogin",
      label: "Last Login",
      value: (p) => (p.systemTimestamps?.lastLoginTime ? formatDate(p.systemTimestamps.lastLoginTime) : "-"),
      visible: true,
    },
    { id: "isLoggedIn", label: "Login Status", value: (p) => p.isLoggedIn, visible: true },
  ])

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

  // old table view - shizz 2015
  // const TableView = ({ participants, handleChange, selectedParticipants, ...props }) => (
  //   <TableContainer component={Paper}>
  //     <Table>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell>ID</TableCell>
  //           <TableCell>Name</TableCell>
  //           <TableCell>Study</TableCell>
  //           <TableCell>Group</TableCell>
  //           <TableCell>Last Active</TableCell>
  //           <TableCell>Actions</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {participants?.map((participant) => (
  //           <TableRow key={participant.id}>
  //             <TableCell>{participant.id}</TableCell>
  //             <TableCell>{participant.name}</TableCell>
  //             <TableCell>{participant.study_name}</TableCell>
  //             <TableCell>{participant.group_name || '-'}</TableCell>
  //             <TableCell>{getTimeAgo(participant.timestamp)}</TableCell>
  //             <TableCell>
  //               <Box display="flex">
  //                 <Fab
  //                   size="small"
  //                   className={classes.btnWhite}
  //                   onClick={() => onParticipantSelect(participant)}
  //                 >
  //                   <Icon>visibility</Icon>
  //                 </Fab>
  //               </Box>
  //             </TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   </TableContainer>
  // )

  // fw New TableView
  // const TableView = ({ participants, handleChange, selectedParticipants, onParticipantSelect }) => (
  //   <Box sx={{ width: "100%", overflow: "hidden" }}>
  //     <ColumnSelector columns={columns} setColumns={setColumns} />
  //     <TableContainer component={Paper} style={{ maxHeight: 440 }}>
  //       <Table stickyHeader>
  //         <TableHead>
  //           <TableRow>
  //             {columns
  //               .filter((column) => column.visible)
  //               .map((column) => (
  //                 <TableCell key={column.id}>{column.label}</TableCell>
  //               ))}
  //             <TableCell
  //               style={{
  //                 position: "sticky",
  //                 right: 0,
  //                 background: "white",
  //                 zIndex: 2,
  //               }}
  //             >
  //               Actions
  //             </TableCell>
  //           </TableRow>
  //         </TableHead>
  //         <TableBody>
  //           {participants?.map((participant) => (
  //             <TableRow key={participant.id}>
  //               {columns
  //                 .filter((column) => column.visible)
  //                 .map((column) => (
  //                   <TableCell key={column.id}>{column.value(participant)}</TableCell>
  //                 ))}
  //               <TableCell
  //                 style={{
  //                   position: "sticky",
  //                   right: 0,
  //                   background: "white",
  //                   zIndex: 1,
  //                 }}
  //               >
  //                 <Box display="flex">
  //                   <Fab
  //                     size="small"
  //                     className={classes.btnWhite}
  //                     onClick={() => {
  //                       console.log(participant)
  //                       onParticipantSelect(participant.id)
  //                     }}
  //                   >
  //                     <Icon>visibility</Icon>
  //                   </Fab>
  //                   <Credentials user={participant} participant={participant.id} />
  //                   {props.authType === "admin" && !participant.systemTimestamps?.suspensionTime ? (
  //                     <Fab
  //                       size="small"
  //                       className={classes.btnWhite}
  //                       onClick={() => handleOpenSuspendDialog(participant)}
  //                     >
  //                       {/* <Icon>block</Icon> */}
  //                       <Icon> {"block_outline"} </Icon>
  //                     </Fab>
  //                   ) : null}
  //                 </Box>
  //                 <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
  //                   <DialogTitle>Suspend Study</DialogTitle>
  //                   <DialogContent>
  //                     <Typography>
  //                       Are you sure you want to suspend the study "{participantToSuspend?.name}"?
  //                     </Typography>
  //                   </DialogContent>
  //                   <DialogActions>
  //                     <Button onClick={handleCloseSuspendDialog} color="secondary">
  //                       Cancel
  //                     </Button>
  //                     <Button onClick={confirmSuspend} color="primary">
  //                       Suspend
  //                     </Button>
  //                   </DialogActions>
  //                 </Dialog>
  //               </TableCell>
  //             </TableRow>
  //           ))}
  //         </TableBody>
  //       </Table>
  //     </TableContainer>
  //   </Box>
  // )

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
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTriggerSave(false)
    }
  }

  const handleSaveParticipant = () => {
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

  const TableView_Mod = () => {
    const [sortConfig, setSortConfig] = useState({ field: "index", direction: "asc" })
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

      if (column.id === "username") {
        return (
          <ParticipantName
            participant={row}
            updateParticipant={(nameVal) => {
              setParticipants((prevParticipants) =>
                prevParticipants.map((p) => (p.id === row.id ? { ...p, name: nameVal } : p))
              )
            }}
            openSettings={false}
          />
        )
      } else if (column.id === "isLoggedIn") {
        return (
          <Typography
            variant="body2"
            style={{
              color: row.isLoggedIn ? "#2e7d32" : "#c62828",
              fontWeight: 500,
            }}
          >
            {row.isLoggedIn ? "Online" : "Offline"}
          </Typography>
        )
      }
      // else {
      //   return column.value(row)
      // }

      const isEditable =
        editableColumns.includes(columnKey) &&
        // editingParticipant?.id === row.id &&
        activeButton.id === row.id &&
        activeButton.action === "edit"

      if (!isEditable) {
        // Handle special non-editable displays
        if (column.id === "isLoggedIn") {
          return (
            <Typography
              variant="body2"
              style={{
                color: row.isLoggedIn ? "#2e7d32" : "#c62828",
                fontWeight: 500,
              }}
            >
              {row.isLoggedIn ? "Online" : "Offline"}
            </Typography>
          )
        } else if (column.id === "username") {
          return (
            <ParticipantName
              participant={row}
              updateParticipant={(nameVal) => {
                setParticipants((prevParticipants) =>
                  prevParticipants.map((p) => (p.id === row.id ? { ...p, name: nameVal } : p))
                )
              }}
              openSettings={false}
            />
          )
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
        acc[participant.id] = index
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

    const actions = (participant) => {
      const pStudy = studies.filter((study) => study.id === participant.study_id)[0]

      return (
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          {/* <Box component="span" className={classes.actionIcon}>
            {notificationColumn && <NotificationSettings participant={participant} />}
          </Box> */}
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
          <Box component="span" className={classes.actionIcon}>
            {activeButton.id === participant.id && activeButton.action === "view" ? (
              <VisualiseFilledIcon
                className="active"
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "view" })
                  onParticipantSelect(participant.id)
                  setActiveButton({ id: null, action: null })
                }}
              />
            ) : (
              <VisualiseIcon
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "view" })
                  onParticipantSelect(participant.id)
                  setActiveButton({ id: null, action: null })
                }}
              />
            )}
          </Box>
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
                />
              ) : (
                <SuspendIcon
                  onClick={() => {
                    setActiveButton({ id: participant.id, action: "suspend" })
                    handleOpenSuspendDialog(participant, setActiveButton)
                  }}
                />
              )
            ) : activeButton.id === participant.id && activeButton.action === "suspend" ? (
              <SuspendFilledIcon
                className="active"
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "suspend" })
                  handleOpenUnSuspendDialog(participant, setActiveButton)
                }}
              />
            ) : (
              <SuspendIcon
                onClick={() => {
                  setActiveButton({ id: participant.id, action: "suspend" })
                  handleOpenUnSuspendDialog(participant, setActiveButton)
                }}
              />
            )}
          </Box>
          <Box component="span" className={classes.actionIcon}>
            {activeButton.id === participant.id && activeButton.action === "delete" ? (
              <DeleteFilledIcon className="active" onClick={() => handleDeleteClick(participant)} />
            ) : (
              <DeleteIcon onClick={() => handleDeleteClick(participant)} />
            )}
          </Box>
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

    return (
      <>
        <ModularTable
          data={sortedData || participants || []}
          columns={columns.filter((col) => col.visible).map((col) => ({ ...col, sortable: true }))}
          actions={actions}
          selectable={true}
          selectedRows={selectedRows}
          onSelectRow={(id) => {
            setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
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
          renderCell={renderCellContent}
        />

        <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
          <DialogTitle>Suspend Participant</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to suspend the participant "{participantToSuspend?.name}"?</Typography>
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
              Are you sure you want to undo suspension of the participant "{participantToUnSuspend?.name}"?
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
            <Typography>Are you sure you want to delete the participant "{selectedParticipant?.name}"?</Typography>
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
              pStudy={studies.find((s) => s.id === selectedParticipant.study_id)}
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
        <ItemViewHeader
          ItemTitle="Participant"
          ItemName={`${viewingParticipant.firstName} ${viewingParticipant.lastName}`}
          searchData={handleSearchData}
          authType={props.authType}
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
      ) : (
        <Header
          studies={studies}
          participants={participants}
          researcherId={researcherId}
          selectedParticipants={selectedParticipants}
          searchData={handleSearchData}
          selectedStudies={selected}
          setSelectedStudies={setSelectedStudies}
          setParticipants={searchParticipants}
          setData={getAllStudies}
          mode={mode}
          setOrder={setOrder}
          order={order}
          title={props.ptitle}
          authType={props.authType}
          onLogout={props.onLogout}
          onViewModechanged={setViewMode}
          viewMode={viewMode}
          VisibleColumns={columns}
          setVisibleColumns={setColumns}
          resemail={props.resemail}
          refresh={searchParticipants}
        />
      )}
      <Box
        className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
        style={{ overflowX: "hidden" }}
      >
        {viewingParticipant ? (
          <ParticipantDetailItem
            participant={viewingParticipant}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            studies={studies}
            triggerSave={triggerSave}
            stats={stats}
          />
        ) : (
          <>
            {!!participants && participants.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  // <Grid container spacing={3}>
                  <Grid container spacing={3} xs={12}>
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
                          researcherName={researcherName}
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
                  </Grid>
                ) : (
                  // <TableView
                  //   participants={paginatedParticipants}
                  //   handleChange={handleChange}
                  //   selectedParticipants={selectedParticipants}
                  //   onParticipantSelect={onParticipantSelect}
                  // />
                  <TableView_Mod />
                  // <TableView_rows
                  //   participants={paginatedParticipants}
                  //   handleChange={handleChange}
                  //   selectedParticipants={selectedParticipants}
                  //   onParticipantSelect={onParticipantSelect}
                  // />
                )}
                <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
                  <DialogTitle>Suspend Participant</DialogTitle>
                  <DialogContent>
                    <Typography>
                      Are you sure you want to suspend the participant "{participantToSuspend?.name}"?
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
                      Are you sure you want to undo suspension of the participant "{participantToUnSuspend?.name}"?
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
              </>
            ) : (
              <Box className={classes.norecordsmain}>
                <Box display="flex" p={2} alignItems="center" className={classes.norecords}>
                  <Icon>info</Icon>
                  {`${t("No Records Found")}`}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </React.Fragment>
  )
}
