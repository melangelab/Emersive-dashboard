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
import Credentials from "./Credentials"
import LAMP from "lamp-core"
import { useSnackbar } from "notistack"
import ParticipantTableRow from "./ParticipantTableRow"
import { Link } from "@material-ui/core"
import { useQuery } from "../../Utils"

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
interface TableColumn {
  id: string
  label: string
  value: (participant: any) => string | number
  visible: boolean
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

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const { t } = useTranslation()

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

  const handleOpenSuspendDialog = (study) => {
    setParticipantToSuspend(study)
    setSuspendDialogOpen(true)
  }

  const handleCloseSuspendDialog = () => {
    setSuspendDialogOpen(false)
    setParticipantToSuspend(null)
  }
  const handleOpenUnSuspendDialog = (p) => {
    setParticipantToUnSuspend(p)
    setUnSuspendDialogOpen(true)
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
    { id: "age", label: "Age", value: (p) => p.userAge || "-", visible: false },
    { id: "gender", label: "Gender", value: (p) => p.gender || "-", visible: false },
    { id: "caregiver", label: "Caregiver", value: (p) => p.caregiverName || "-", visible: false },
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
  const TableView = ({ participants, handleChange, selectedParticipants, onParticipantSelect }) => (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <ColumnSelector columns={columns} setColumns={setColumns} />
      <TableContainer component={Paper} style={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns
                .filter((column) => column.visible)
                .map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              <TableCell
                style={{
                  position: "sticky",
                  right: 0,
                  background: "white",
                  zIndex: 2,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants?.map((participant) => (
              <TableRow key={participant.id}>
                {columns
                  .filter((column) => column.visible)
                  .map((column) => (
                    <TableCell key={column.id}>{column.value(participant)}</TableCell>
                  ))}
                <TableCell
                  style={{
                    position: "sticky",
                    right: 0,
                    background: "white",
                    zIndex: 1,
                  }}
                >
                  <Box display="flex">
                    <Fab
                      size="small"
                      className={classes.btnWhite}
                      onClick={() => {
                        console.log(participant)
                        onParticipantSelect(participant.id)
                      }}
                    >
                      <Icon>visibility</Icon>
                    </Fab>
                    <Credentials user={participant} participant={participant.id} />
                    {props.authType === "admin" && !participant.systemTimestamps?.suspensionTime ? (
                      <Fab
                        size="small"
                        className={classes.btnWhite}
                        onClick={() => handleOpenSuspendDialog(participant)}
                      >
                        {/* <Icon>block</Icon> */}
                        <Icon> {"block_outline"} </Icon>
                      </Fab>
                    ) : null}
                  </Box>
                  <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
                    <DialogTitle>Suspend Study</DialogTitle>
                    <DialogContent>
                      <Typography>
                        Are you sure you want to suspend the study "{participantToSuspend?.name}"?
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

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

  // new table view wit each user entry handled separately in own module
  const TableView_rows = ({ participants, handleChange, selectedParticipants, onParticipantSelect, ...props }) => (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <ColumnSelector columns={columns} setColumns={setColumns} />
      <TableContainer component={Paper} style={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedParticipants.length > 0 && selectedParticipants.length < paginatedParticipants.length
                  }
                  checked={selectAll}
                  onChange={handleSelectAllClick}
                  className={classes.checkboxActive}
                />
              </TableCell>
              {columns
                .filter((column) => column.visible)
                .map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              <TableCell
                style={{
                  position: "sticky",
                  right: 0,
                  background: "white",
                  zIndex: 2,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants?.map((participant) => (
              <ParticipantTableRow
                key={participant.id}
                participant={participant}
                visibleColumns={columns.filter((c) => c.visible)}
                selectedParticipants={selectedParticipants}
                handleChange={handleChange}
                onParticipantSelect={onParticipantSelect}
                researcherId={researcherId}
                authType={props.authType}
                notificationColumn={notificationColumn}
                onSuspend={handleOpenSuspendDialog}
                onUnSuspend={handleOpenUnSuspendDialog}
                onParticipantUpdate={handleUpdateParticipant}
                formatDate={formatDate}
                setParticipants={setParticipants}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  // const TableView_comp = ({ participants, columns, ...props }) => (
  //   <TableContainer component={Paper}>
  //     <Table stickyHeader>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell padding="checkbox">
  //             <Checkbox /* ... header checkbox logic ... */ />
  //           </TableCell>
  //           {columns
  //             .filter(column => column.visible)
  //             .map(column => (
  //               <TableCell key={column.id}>{column.label}</TableCell>
  //             ))}
  //           <TableCell className={classes.actionCell}>Actions</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {participants?.map((participant) => (
  //           <ParticipantTableCell
  //             key={participant.id}
  //             participant={participant}
  //             visibleColumns={columns.filter(c => c.visible)}
  //             useStyles={useStyles}
  //             {...props}
  //           />
  //         ))}
  //       </TableBody>
  //     </Table>
  //   </TableContainer>
  // );

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
      <Header
        studies={studies}
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
      />
      <Box
        className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
      >
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
                      onParticipantUpdate={handleUpdateParticipant}
                      formatDate={formatDate}
                      onSuspend={handleOpenSuspendDialog}
                      onUnSuspend={handleOpenUnSuspendDialog}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              // <TableView
              //   participants={paginatedParticipants}
              //   handleChange={handleChange}
              //   selectedParticipants={selectedParticipants}
              //   onParticipantSelect={onParticipantSelect}
              // />
              <TableView_rows
                participants={paginatedParticipants}
                handleChange={handleChange}
                selectedParticipants={selectedParticipants}
                onParticipantSelect={onParticipantSelect}
              />
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
            <Pagination
              data={participants}
              updatePage={handleChangePage}
              rowPerPage={[2, 5, 10, 20, 40, 60, 80]}
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
      </Box>
    </React.Fragment>
  )
}
