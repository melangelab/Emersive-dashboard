import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Grid,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Card,
  CardContent,
  makeStyles,
  Theme,
  createStyles,
  Backdrop,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core"
import {
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  SortByAlpha as SortIcon,
} from "@material-ui/icons"
import { ReactComponent as Sensors } from "../../../icons/Sensor.svg"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { fetchPostData, fetchResult } from "../SaveResearcherData"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(3),
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing(3),
    },
    searchBar: {
      display: "flex",
      alignItems: "center",
      background: "#f5f5f5",
      borderRadius: 50,
      padding: theme.spacing(0.5, 2),
      marginBottom: theme.spacing(3),
      "& input": {
        border: "none",
        outline: "none",
        background: "transparent",
        padding: theme.spacing(1),
        flexGrow: 1,
        fontSize: 16,
      },
    },
    tabRoot: {
      backgroundColor: theme.palette.background.paper,
      marginBottom: theme.spacing(3),
      borderRadius: theme.spacing(1),
    },
    tabIndicator: {
      backgroundColor: theme.palette.primary.main,
      height: 4,
    },
    itemCard: {
      borderRadius: theme.spacing(1.5),
      marginBottom: theme.spacing(2),
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        transform: "translateY(-2px)",
      },
    },
    cardContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing(2, 3),
    },
    itemType: {
      background: "#7599FF",
      color: "white",
      marginRight: theme.spacing(1),
    },
    itemInfo: {
      display: "flex",
      alignItems: "center",
      flexGrow: 1,
    },
    deleteDate: {
      fontSize: 12,
      color: "#666",
      marginLeft: theme.spacing(1),
    },
    actionButtons: {
      display: "flex",
      gap: theme.spacing(1),
    },
    restoreButton: {
      backgroundColor: "#76C7EE",
      color: "white",
      minWidth: "unset",
      padding: theme.spacing(1),
      "&:hover": {
        backgroundColor: "#0063D6",
      },
    },
    deleteButton: {
      backgroundColor: "#F44336",
      color: "white",
      minWidth: "unset",
      padding: theme.spacing(1),
      "&:hover": {
        backgroundColor: "#d32f2f",
      },
    },
    noItems: {
      textAlign: "center",
      padding: theme.spacing(6),
      color: "#757575",
    },
    filterChip: {
      margin: theme.spacing(0, 0.5),
      "&.active": {
        backgroundColor: theme.palette.primary.main,
        color: "white",
      },
    },
    studyHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      backgroundColor: "#f0f4ff",
      marginBottom: theme.spacing(2),
      "& .avatar": {
        backgroundColor: "#7599FF",
        marginRight: theme.spacing(2),
      },
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },
    loaderText: {
      marginTop: theme.spacing(2),
      color: "white",
    },
    chipGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(0.5),
      marginTop: theme.spacing(1),
    },
    deleteWarning: {
      color: "#F44336",
      fontWeight: "bold",
      fontSize: "0.8rem",
      marginTop: theme.spacing(0.5),
    },
    moreButton: {
      padding: theme.spacing(0.5),
    },
    countBadge: {
      fontWeight: 500,
      marginLeft: theme.spacing(1),
      backgroundColor: theme.palette.primary.main,
      color: "white",
      padding: theme.spacing(0.25, 1),
      borderRadius: 12,
      fontSize: "0.75rem",
    },
    dateSorter: {
      display: "flex",
      alignItems: "center",
      marginLeft: "auto",
      marginRight: theme.spacing(2),
      "& select": {
        border: "none",
        background: "transparent",
        padding: theme.spacing(0.5),
        fontSize: "0.9rem",
        outline: "none",
        cursor: "pointer",
      },
    },
  })
)

// Tab interface
interface TabPanelProps {
  children: React.ReactNode
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`archived-tabpanel-${index}`}
      aria-labelledby={`archived-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: any) {
  return {
    id: `archived-tab-${index}`,
    "aria-controls": `archived-tabpanel-${index}`,
  }
}

function Empty({ message }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        color: "#757575",
        textAlign: "center",
      }}
    >
      <DeleteForeverIcon style={{ fontSize: 64, color: "#bdbdbd", marginBottom: 16 }} />
      <Typography variant="h6">{message}</Typography>
      <Typography variant="body2">Items remain in the archive for 30 days before being permanently deleted.</Typography>
    </Box>
  )
}

export default function ArchivedItemsView({ researcherId, searchFilter, selectedStudies, studies, ...props }) {
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [archivedStudies, setArchivedStudies] = useState([])
  const [archivedParticipants, setArchivedParticipants] = useState([])
  const [archivedActivities, setArchivedActivities] = useState([])
  const [archivedSensors, setArchivedSensors] = useState([])
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [processingItem, setProcessingItem] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string; id: string; action: string }>({
    open: false,
    type: "",
    id: "",
    action: "",
  })
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<{ el: any; type: string; id: string } | null>(null)

  useEffect(() => {
    loadArchivedItems()
    const savedTabState = localStorage.getItem("archivedTabState")
    if (savedTabState) {
      setTabValue(parseInt(savedTabState))
    }
  }, [])

  useEffect(() => {
    if (searchFilter !== null && searchFilter !== undefined) {
      setSearchValue(searchFilter)
    }
  }, [searchFilter])

  // useEffect(() => {
  //   if (selectedStudies && selectedStudies.length > 0 && studies && studies.length > 0) {
  //     filterBySelectedStudies()
  //   }
  // }, [selectedStudies, studies])

  useEffect(() => {
    localStorage.setItem("archivedTabState", tabValue.toString())
  }, [tabValue])

  // const filterBySelectedStudies = () => {
  //   if (!studies || studies.length === 0) return
  //   if (!selectedStudies || selectedStudies.length === 0) {
  //     return
  //   }

  //   const studyIds = studies
  //     .filter(study => selectedStudies.includes(study.name))
  //     .map(study => study.id)

  //   if (studyIds.length > 0) {
  //     setArchivedStudies(prevStudies =>
  //       prevStudies.filter(study => studyIds.includes(study.id))
  //     )

  //     setArchivedParticipants(prevParticipants =>
  //       prevParticipants.filter(participant => studyIds.includes(participant.study_id))
  //     )

  //     setArchivedActivities(prevActivities =>
  //       prevActivities.filter(activity => studyIds.includes(activity.study_id))
  //     )
  //   }
  // }

  const loadArchivedItems = async () => {
    setLoading(true)
    try {
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const studiesResponse = await fetchResult(authString, researcherId, "archived/study", "researcher")
      console.log(studiesResponse, authString, researcherId)
      setArchivedStudies(studiesResponse.data?.studies || [])

      // Fetch archived participants
      const participantsResponse = await fetchResult(authString, researcherId, "archived/participants", "researcher")
      console.log(participantsResponse)
      setArchivedParticipants(participantsResponse.data?.participants || [])

      // Fetch archived activities
      const activitiesResponse = await fetchResult(authString, researcherId, "archived/activities", "researcher")
      setArchivedActivities(activitiesResponse.data?.activities || [])
      const sensorsResponse = await fetchResult(authString, researcherId, "archived/sensors", "researcher")
      console.log("sensorsResponse", sensorsResponse)
      setArchivedSensors(sensorsResponse.data?.sensors || [])
      // if (selectedStudies && selectedStudies.length > 0 && studies && studies.length > 0) {
      //   filterBySelectedStudies()
      // }
    } catch (error) {
      console.error("Error loading archived items:", error)
      enqueueSnackbar(t("Failed to load archived items"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const handleRestore = async (type: string, id: string) => {
    setProcessingItem(id)
    try {
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

      const result = await fetchPostData(authString, researcherId, `restore/${type}/${id}`, "researcher", "POST", {})
      console.log("result", result)

      enqueueSnackbar(t("Item restored successfully"), { variant: "success" })

      if (type === "study") {
        setArchivedStudies(archivedStudies.filter((study) => study.id !== id))
      } else if (type === "participant") {
        setArchivedParticipants(archivedParticipants.filter((participant) => participant.id !== id))
      } else if (type === "activity") {
        setArchivedActivities(archivedActivities.filter((activity) => activity.id !== id))
      } else if (type === "sensor") {
        setArchivedSensors(archivedSensors.filter((sensor) => sensor.id !== id))
      }
    } catch (error) {
      console.error("Error restoring item:", error)
      enqueueSnackbar(t("Failed to restore item"), { variant: "error" })
    } finally {
      setProcessingItem(null)
    }
  }

  const handlePermanentDelete = async (type: string, id: string) => {
    setConfirmDialog({
      open: true,
      type,
      id,
      action: "delete",
    })
  }

  const confirmDelete = async () => {
    const { type, id } = confirmDialog
    setProcessingItem(id)
    setConfirmDialog({ open: false, type: "", id: "", action: "" })

    try {
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

      await fetchPostData(authString, researcherId, `permanent-delete/${type}/${id}`, "researcher", "POST", {})

      enqueueSnackbar(t("Item permanently deleted"), { variant: "success" })

      if (type === "study") {
        setArchivedStudies(archivedStudies.filter((study) => study.id !== id))
      } else if (type === "participant") {
        setArchivedParticipants(archivedParticipants.filter((participant) => participant.id !== id))
      } else if (type === "activity") {
        setArchivedActivities(archivedActivities.filter((activity) => activity.id !== id))
      } else if (type === "sensor") {
        setArchivedSensors(archivedSensors.filter((sensor) => sensor.id !== id))
      }
    } catch (error) {
      console.error("Error permanently deleting item:", error)
      enqueueSnackbar(t("Failed to delete item"), { variant: "error" })
    } finally {
      setProcessingItem(null)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 0

    const deleteDate = new Date(deletedAt)
    const thirtyDaysLater = new Date(deleteDate)
    thirtyDaysLater.setDate(deleteDate.getDate() + 30)

    const today = new Date()
    const diffTime = thirtyDaysLater.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  // Sort function for all data types
  const sortByDate = (items) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.deletedAt || 0).getTime()
      const dateB = new Date(b.deletedAt || 0).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
  }

  // Filter and search functions
  const filterStudies = () => {
    let filtered = archivedStudies?.filter?.((study) => {
      const matchesSearch =
        searchValue.trim() === "" ||
        study.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        study.id?.toLowerCase().includes(searchValue?.toLowerCase())
      const matchesFilters = activeFilters.length === 0 || activeFilters.some((filter) => study.type === filter)

      return matchesSearch && matchesFilters
    })

    return sortByDate(filtered)
  }

  const filterParticipants = () => {
    let filtered = archivedParticipants.filter((participant) => {
      const fullName = `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
      const matchesSearch =
        searchValue.trim() === "" ||
        fullName.toLowerCase().includes(searchValue?.toLowerCase()) ||
        participant.id?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        (participant.username && participant.username.toLowerCase().includes(searchValue?.toLowerCase()))

      const matchesFilters = activeFilters.length === 0 || (activeFilters.includes("study") && participant.study_id)

      return matchesSearch && matchesFilters
    })

    return sortByDate(filtered)
  }

  const filterActivities = () => {
    let filtered = archivedActivities.filter((activity) => {
      const matchesSearch =
        searchValue.trim() === "" ||
        activity.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        activity.id?.toLowerCase().includes(searchValue?.toLowerCase())

      const matchesFilters = activeFilters.length === 0 || (activeFilters.includes("study") && activity.study_id)

      return matchesSearch && matchesFilters
    })

    return sortByDate(filtered)
  }

  const filterSensors = () => {
    let filtered = archivedSensors.filter((sensor) => {
      const matchesSearch =
        searchValue.trim() === "" ||
        sensor.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        sensor.id?.toLowerCase().includes(searchValue?.toLowerCase())

      const matchesFilters = activeFilters.length === 0 || (activeFilters.includes("study") && sensor.study_id)

      return matchesSearch && matchesFilters
    })

    return sortByDate(filtered)
  }

  const getStudyNameById = (studyId) => {
    if (!studies) return null
    const study = studies.find((s) => s.id === studyId)
    return study ? study.name : null
  }

  return (
    <Box className={classes.container}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
        {loading && <Typography className={classes.loaderText}>{t("Loading archived items...")}</Typography>}
      </Backdrop>

      <Box className={classes.header}>
        <Typography variant="h5">{t("Archived Items")}</Typography>
        <Box display="flex" alignItems="center">
          <Box className={classes.dateSorter}>
            <Typography variant="body2">{t("Sort:")}</Typography>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}>
              <option value="newest">{t("Newest First")}</option>
              <option value="oldest">{t("Oldest First")}</option>
            </select>
          </Box>
          <Button variant="contained" color="primary" onClick={loadArchivedItems} startIcon={<RestoreIcon />}>
            {t("Refresh")}
          </Button>
        </Box>
      </Box>

      {/* <Box className={classes.searchBar}>
        <SearchIcon />
        <input 
          type="text" 
          placeholder={t("Search archived items...")} 
          value={searchValue}
          onChange={handleSearchChange}
        />
      </Box> */}

      {/* <Box mb={2} display="flex" alignItems="center">
        <FilterIcon style={{ marginRight: 8 }} />
        <Typography variant="subtitle2" style={{ marginRight: 16 }}>{t("Filters:")}</Typography>
        <Chip 
          label={t("Study")} 
          onClick={() => toggleFilter('study')}
          className={`${classes.filterChip} ${activeFilters.includes('study') ? 'active' : ''}`}
        />
        <Chip 
          label={t("Participant")} 
          onClick={() => toggleFilter('participant')}
          className={`${classes.filterChip} ${activeFilters.includes('participant') ? 'active' : ''}`}
        />
        <Chip 
          label={t("Activity")} 
          onClick={() => toggleFilter('activity')}
          className={`${classes.filterChip} ${activeFilters.includes('activity') ? 'active' : ''}`}
        />
      </Box> */}

      <Paper className={classes.tabRoot}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          classes={{ indicator: classes.tabIndicator }}
          variant="fullWidth"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center">
                {t("Studies")}
                <span className={classes.countBadge}>{filterStudies().length}</span>
              </Box>
            }
            {...a11yProps(0)}
          />
          <Tab
            label={
              <Box display="flex" alignItems="center">
                {t("Participants")}
                <span className={classes.countBadge}>{filterParticipants().length}</span>
              </Box>
            }
            {...a11yProps(1)}
          />
          <Tab
            label={
              <Box display="flex" alignItems="center">
                {t("Activities")}
                <span className={classes.countBadge}>{filterActivities().length}</span>
              </Box>
            }
            {...a11yProps(2)}
          />
          <Tab
            label={
              <Box display="flex" alignItems="center">
                {t("Sensor")}
                <span className={classes.countBadge}>{filterSensors().length}</span>
              </Box>
            }
            {...a11yProps(3)}
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {filterStudies().length > 0 ? (
          filterStudies().map((study) => (
            <Card key={study.id} className={classes.itemCard}>
              <CardContent className={classes.cardContent}>
                <Box className={classes.itemInfo}>
                  <Avatar className="avatar">
                    <SchoolIcon />
                  </Avatar>
                  <Box ml={1}>
                    <Typography variant="h6">{study.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {study.id}
                      <span className={classes.deleteDate}>
                        {t("Deleted on")} {formatDate(study.deletedAt)}
                      </span>
                    </Typography>
                    <Typography variant="caption" className={classes.deleteWarning}>
                      {t("Will be permanently deleted in")} {calculateDaysRemaining(study.deletedAt)} {t("days")}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.actionButtons}>
                  <Tooltip title={t("Restore")}>
                    <IconButton
                      className={classes.restoreButton}
                      onClick={() => handleRestore("study", study.id)}
                      disabled={processingItem === study.id}
                    >
                      {processingItem === study.id ? <CircularProgress size={24} color="inherit" /> : <RestoreIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete permanently")}>
                    <IconButton
                      className={classes.deleteButton}
                      onClick={() => handlePermanentDelete("study", study.id)}
                      disabled={processingItem === study.id}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Empty message={t("No archived studies found")} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {filterParticipants().length > 0 ? (
          filterParticipants().map((participant) => (
            <Card key={participant.id} className={classes.itemCard}>
              <CardContent className={classes.cardContent}>
                <Box className={classes.itemInfo}>
                  <Avatar className="avatar">
                    <PersonIcon />
                  </Avatar>
                  <Box ml={1}>
                    <Typography variant="h6">
                      {`${participant.firstName || ""} ${participant.lastName || ""}`.trim() || participant.id}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {participant.id}
                      <span className={classes.deleteDate}>
                        {t("Deleted on")} {formatDate(participant.deletedAt)}
                      </span>
                    </Typography>

                    <Box className={classes.chipGroup}>
                      {participant.study_name && <Chip size="small" label={participant.study_name} />}
                      {participant.username && <Chip size="small" label={`@${participant.username}`} />}
                    </Box>

                    <Typography variant="caption" className={classes.deleteWarning}>
                      {t("Will be permanently deleted in")} {calculateDaysRemaining(participant.deletedAt)} {t("days")}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.actionButtons}>
                  <Tooltip title={t("Restore")}>
                    <IconButton
                      className={classes.restoreButton}
                      onClick={() => handleRestore("participant", participant.id)}
                      disabled={processingItem === participant.id}
                    >
                      {processingItem === participant.id ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RestoreIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete permanently")}>
                    <IconButton
                      className={classes.deleteButton}
                      onClick={() => handlePermanentDelete("participant", participant.id)}
                      disabled={processingItem === participant.id}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Empty message={t("No archived participants found")} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {filterActivities().length > 0 ? (
          filterActivities().map((activity) => (
            <Card key={activity.id} className={classes.itemCard}>
              <CardContent className={classes.cardContent}>
                <Box className={classes.itemInfo}>
                  <Avatar className="avatar">
                    <AssignmentIcon />
                  </Avatar>
                  <Box ml={1}>
                    <Typography variant="h6">{activity.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {activity.id}
                      <span className={classes.deleteDate}>
                        {t("Deleted on")} {formatDate(activity.deletedAt)}
                      </span>
                    </Typography>

                    <Box className={classes.chipGroup}>
                      {activity.study_name && <Chip size="small" label={activity.study_name} />}
                      {activity.spec && (
                        <Chip
                          size="small"
                          label={activity.spec.replace("lamp.", "")}
                          style={{ backgroundColor: "#f0f4ff" }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" className={classes.deleteWarning}>
                      {t("Will be permanently deleted in")} {calculateDaysRemaining(activity.deletedAt)} {t("days")}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.actionButtons}>
                  <Tooltip title={t("Restore")}>
                    <IconButton
                      className={classes.restoreButton}
                      onClick={() => handleRestore("activity", activity.id)}
                      disabled={processingItem === activity.id}
                    >
                      {processingItem === activity.id ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RestoreIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete permanently")}>
                    <IconButton
                      className={classes.deleteButton}
                      onClick={() => handlePermanentDelete("activity", activity.id)}
                      disabled={processingItem === activity.id}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Empty message={t("No archived activities found")} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {filterSensors().length > 0 ? (
          filterSensors().map((sensor) => (
            <Card key={sensor.id} className={classes.itemCard}>
              <CardContent className={classes.cardContent}>
                <Box className={classes.itemInfo}>
                  <Avatar className="avatar">
                    <Sensors />
                  </Avatar>
                  <Box ml={1}>
                    <Typography variant="h6">{sensor.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {sensor.id}
                      <span className={classes.deleteDate}>
                        {t("Deleted on")} {formatDate(sensor.deletedAt)}
                      </span>
                    </Typography>

                    <Box className={classes.chipGroup}>
                      {sensor.study_name && <Chip size="small" label={sensor.study_name} />}
                      {sensor.spec && (
                        <Chip
                          size="small"
                          label={sensor.spec.replace("lamp.", "")}
                          style={{ backgroundColor: "#f0f4ff" }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" className={classes.deleteWarning}>
                      {t("Will be permanently deleted in")} {calculateDaysRemaining(sensor.deletedAt)} {t("days")}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.actionButtons}>
                  <Tooltip title={t("Restore")}>
                    <IconButton
                      className={classes.restoreButton}
                      onClick={() => handleRestore("sensor", sensor.id)}
                      disabled={processingItem === sensor.id}
                    >
                      {processingItem === sensor.id ? <CircularProgress size={24} color="inherit" /> : <RestoreIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete permanently")}>
                    <IconButton
                      className={classes.deleteButton}
                      onClick={() => handlePermanentDelete("sensor", sensor.id)}
                      disabled={processingItem === sensor.id}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Empty message={t("No archived Sensors found")} />
        )}
      </TabPanel>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle>{t("Confirm Permanent Deletion")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "Are you sure you want to permanently delete this item? This action cannot be undone and all associated data will be lost forever."
            )}
          </DialogContentText>
          <DialogContentText style={{ color: "#f44336", fontWeight: "bold", marginTop: 16 }}>
            {t("Warning: This data cannot be recovered after deletion.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} color="primary">
            {t("Cancel")}
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            {t("Permanently Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
