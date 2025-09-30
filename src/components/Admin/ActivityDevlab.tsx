import React, { useEffect, useMemo, useState } from "react"
import ActivityList, { availableActivitySpecs } from "../Researcher/ActivityList/Index"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import { useQuery } from "../Utils"
import LAMP from "lamp-core"
import { sortData } from "../Researcher/Dashboard"
import { ReactComponent as ViewIcon } from "../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as CopyIcon } from "../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as DeleteIcon } from "../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as DeleteFilledIcon } from "../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as EditIcon } from "../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as HistoryIcon } from "../../icons/NewIcons/version-history.svg"
import { ReactComponent as HistoryFilledIcon } from "../../icons/NewIcons/version-history.svg"
import { ReactComponent as ShareCommunityIcon } from "../../icons/NewIcons/refer.svg"
import { ReactComponent as ShareCommunityFilledIcon } from "../../icons/NewIcons/refer-filled.svg"
import { ReactComponent as RemoveCommunityIcon } from "../../icons/NewIcons/user-xmark.svg"
import { ReactComponent as RemoveCommunityFilledIcon } from "../../icons/NewIcons/user-xmark-filled.svg"
import { ReactComponent as VersionThisIcon } from "../../icons/NewIcons/code-merge.svg"
import { ReactComponent as VersionThisFilledIcon } from "../../icons/NewIcons/code-merge-filled.svg"
import { ReactComponent as SaveIcon } from "../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../icons/NewIcons/floppy-disks-filled.svg"
import EmersiveTable, { ColumnConfig } from "../Researcher/EmersiveTable"
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Backdrop,
  Icon,
  Divider,
  makeStyles,
  createStyles,
  Theme,
} from "@material-ui/core"
import { FilterMatchMode } from "primereact/api"
import { useMediaQuery, useTheme } from "@material-ui/core"
import { useLayoutStyles } from "../GlobalStyles"
import { Service } from "../DBService/DBService"
import ActionsComponent from "./ActionsComponent"
import ActivityDetailItem from "../Researcher/ActivityList/ActivityDetailItem"
import ConfirmationDialog from "../ConfirmationDialog"
import VersionHistoryDialog from "../Researcher/ActivityList/VersionHistoryDialog"
import Pagination from "../PaginatedElement"
import AddActivity from "../Researcher/ActivityList/AddActivity"
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    tableContainer: {
      maxHeight: "calc(100vh - 200px)", // Adjust based on your layout
      // overflow: 'auto',
      "& .MuiTableCell-root": {
        borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
        padding: theme.spacing(1.5),
      },
    },
    norecordsmain: {
      minHeight: "calc(100% - 114px)",
      position: "absolute",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
    columnSelector: {
      marginBottom: theme.spacing(2),
    },
    checkboxActive: {
      color: "#7599FF !important",
      padding: theme.spacing(0.5),
      // color: "#ccc",
      "&.Mui-checked": {
        color: "#7599FF",
      },
      "& .MuiSvgIcon-root": {
        borderRadius: "4px",
        width: "18px",
        height: "18px",
      },
    },
    copyableCell: {
      cursor: "copy",
      fontWeight: 500,
      color: "#215F9A",
    },
    editableField: {
      "& .MuiInputBase-input": {
        padding: theme.spacing(1),
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: theme.palette.primary.main,
        },
      },
    },
    versionBadge: {
      display: "inline-flex",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#FDEDE8",
      color: "#EB8367",
      alignItems: "center",
      gap: theme.spacing(0.5),
      fontWeight: 500,
    },
    studyCell: {
      cursor: "pointer",
      fontWeight: 500,
      color: "#215F9A",
    },
  })
)

// Import your existing components and utilities
export default function ActivityDevLab({ assessments, refreshData, isLoading, search, setSearch, ...props }) {
  const [activities, setActivities] = useState([])
  const [allActivities, setAllActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedActivities, setSelectedActivities] = useState([])
  const [paginatedActivities, setPaginatedActivities] = useState([])
  const [page, setPage] = useState(0)
  const [rowCount, setRowCount] = useState(40)
  const [viewMode, setViewMode] = useState("grid")
  const [creatingActivity, setCreatingActivity] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState(null)
  console.log("ActivityDevLab - Initializing component with:", props.selectedStudies, props.studies)
  // Activity viewing and editing states
  const [viewingActivity, setViewingActivity] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({})
  const [rowMode, setRowMode] = useState("view")

  // Dialog states
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [dialogActivity, setDialogActivity] = useState(null)
  const [confirmationVersionDialog, setConfirmationVersionDialog] = useState(false)

  // Table states
  const [selectedRows, setSelectedRows] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [currentRowsPerPage, setCurrentRowsPerPage] = useState(5)
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null })

  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const layoutClasses = useLayoutStyles()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  // Fetch all activities for DevLab
  const fetchAllActivities = async () => {
    try {
      setLoading(true)

      // Fetch all activities from LAMP API
      const allActivitiesData = await LAMP.Activity.all()
      console.log("DevLab - All activities fetched:", allActivitiesData)

      // Save to ServiceDB with devlabactivities collection
      if (allActivitiesData && allActivitiesData.length > 0) {
        await Service.addData(
          "devlabactivities",
          allActivitiesData.map((activity) => ({
            ...activity,
            // Add any additional metadata needed for DevLab
            fetchedAt: new Date().toISOString(),
            isDevLabItem: true,
          }))
        )
      }

      setAllActivities(allActivitiesData || [])
      setActivities(allActivitiesData || [])
    } catch (error) {
      console.error("Error fetching all activities for DevLab:", error)
      enqueueSnackbar(t("Failed to fetch activities"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Search and filter activities
  const searchActivities = async (searchVal) => {
    const searchTxt = searchVal || search

    try {
      setLoading(true)

      // Get activities from ServiceDB devlabactivities collection
      let activitiesData = await Service.getAll("devlabactivities")

      if (!activitiesData || activitiesData.length === 0) {
        // Fallback to fetch from LAMP API if ServiceDB is empty
        await fetchAllActivities()
        activitiesData = await Service.getAll("devlabactivities")
      }

      let filteredData = activitiesData || []

      // Apply search filter
      if (searchTxt && searchTxt.trim().length > 0) {
        filteredData = filteredData.filter(
          (activity) =>
            activity.name?.toLowerCase().includes(searchTxt.toLowerCase()) ||
            activity.id?.toLowerCase().includes(searchTxt.toLowerCase()) ||
            activity.spec?.toLowerCase().includes(searchTxt.toLowerCase()) ||
            activity.creator?.toLowerCase().includes(searchTxt.toLowerCase())
        )
      }

      setFilteredActivities(filteredData)
      setActivities(filteredData)
      setPaginatedActivities(filteredData.slice(page * rowCount, page * rowCount + rowCount))
    } catch (error) {
      console.error("Error searching activities:", error)
      enqueueSnackbar(t("Failed to search activities"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Initialize and refresh data
  useEffect(() => {
    fetchAllActivities()
  }, [])

  useEffect(() => {
    if (search !== null) {
      searchActivities(search)
    }
  }, [search])

  useEffect(() => {
    if (activities.length > 0) {
      setPaginatedActivities(activities.slice(page * rowCount, page * rowCount + rowCount))
    }
  }, [activities, page, rowCount])

  // Handle pagination
  const handleChangePage = (newPage, newRowCount) => {
    setLoading(true)
    setRowCount(newRowCount)
    setPage(newPage)
    localStorage.setItem("devlab_activities", JSON.stringify({ page: newPage, rowCount: newRowCount }))

    setPaginatedActivities(activities.slice(newPage * newRowCount, newPage * newRowCount + newRowCount))
    setLoading(false)
  }

  // Activity actions for admin
  const handleUpdateActivity = async (activityId, updatedActivity) => {
    try {
      setLoading(true)

      // Update in LAMP backend
      const updActivity = await LAMP.Activity.update(activityId, updatedActivity)
      console.log("Activity updated:", updActivity)

      // Update the updated activity with version info
      updatedActivity.currentVersion = updActivity["data"]?.currentVersion
      updatedActivity.versionHistory = updActivity["data"]?.versionHistory

      // Update in ServiceDB devlabactivities collection
      await Service.updateMultipleKeys(
        "devlabactivities",
        { devlabactivities: [{ id: activityId, ...updatedActivity }] },
        [
          "name",
          "spec",
          "schedule",
          "settings",
          "category",
          "creator",
          "createdAt",
          "currentVersion",
          "versionHistory",
          "device",
          "reminder",
          "groups",
          "sharingStudies",
          "scoreInterpretation",
          "activityGuide",
          "formula4Fields",
          "shareTocommunity",
        ],
        "id"
      )

      // Refresh activities
      await searchActivities("")
      enqueueSnackbar(t("Activity updated successfully."), { variant: "success" })
    } catch (err) {
      console.error("Error updating activity:", err)
      enqueueSnackbar(t("Failed to update activity: ") + err.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteActivity = async (status) => {
    if (status === "Yes") {
      try {
        setLoading(true)

        // Delete from LAMP backend
        if (dialogActivity.spec === "lamp.survey") {
          await LAMP.Type.setAttachment(dialogActivity.id, "me", "lamp.dashboard.survey_description", null)
        } else {
          await LAMP.Type.setAttachment(dialogActivity.id, "me", "emersive.activity.details", null)
        }
        await LAMP.Activity.delete(dialogActivity.id)

        // Delete from ServiceDB
        await Service.delete("devlabactivities", [dialogActivity.id])

        // Update local state
        setActivities((prev) => prev.filter((a) => a.id !== dialogActivity.id))
        await searchActivities("")

        enqueueSnackbar(t("Activity deleted successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error deleting activity:", error)
        enqueueSnackbar(t("Failed to delete activity"), { variant: "error" })
      } finally {
        setLoading(false)
      }
    }
    setConfirmationDialog(false)
    setActiveButton({ id: null, action: null })
  }

  // Cell value change handler for table editing
  const handleCellValueChange = (activityId, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Activity actions renderer
  const activityActions = (activity) => {
    return (
      <span className="action-buttons">
        {/* View button */}
        {activeButton.id === activity.id && activeButton.action === "view" ? (
          <ViewFilledIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "view" })
              handleViewActivity(activity)
            }}
          />
        ) : (
          <ViewIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "view" })
              handleViewActivity(activity)
            }}
          />
        )}

        {/* Edit/Save buttons */}
        {activeButton.id === activity.id && activeButton.action === "edit" ? (
          <EditFilledIcon className="actionIcon" onClick={() => handleEditActivityTable(activity)} />
        ) : (
          <EditIcon className="actionIcon" onClick={() => handleEditActivityTable(activity)} />
        )}
        {activeButton.id === activity.id && activeButton.action === "save" ? (
          <SaveFilledIcon className="actionIcon" onClick={() => handleSaveActivityTable(activity)} />
        ) : (
          <SaveIcon className="actionIcon" onClick={() => handleSaveActivityTable(activity)} />
        )}

        {/* History button */}
        {activeButton.id === activity.id && activeButton.action === "history" ? (
          <HistoryFilledIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "history" })
              setDialogActivity(activity)
              setVersionHistoryOpen(true)
            }}
          />
        ) : (
          <HistoryIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "history" })
              setDialogActivity(activity)
              setVersionHistoryOpen(true)
            }}
          />
        )}

        {/* Share button */}
        {activeButton.id === activity.id && activeButton.action === "share" ? (
          !activity.shareTocommunity ? (
            <ShareCommunityFilledIcon
              className="actionIcon"
              onClick={() => {
                setActiveButton({ id: activity.id, action: "share" })
                setDialogActivity(activity)
                setShareDialogOpen(true)
              }}
            />
          ) : (
            <RemoveCommunityFilledIcon
              className="actionIcon"
              onClick={() => {
                setActiveButton({ id: activity.id, action: "share" })
                setDialogActivity(activity)
                setShareDialogOpen(true)
              }}
            />
          )
        ) : activity.shareTocommunity ? (
          <RemoveCommunityIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "share" })
              setDialogActivity(activity)
              setShareDialogOpen(true)
            }}
          />
        ) : (
          <ShareCommunityIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "share" })
              setDialogActivity(activity)
              setShareDialogOpen(true)
            }}
          />
        )}

        {/* Version button */}
        {activeButton.id === activity.id && activeButton.action === "version" ? (
          <VersionThisFilledIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "version" })
              setDialogActivity(activity)
              setConfirmationVersionDialog(true)
            }}
          />
        ) : (
          <VersionThisIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "version" })
              setDialogActivity(activity)
              setConfirmationVersionDialog(true)
            }}
          />
        )}

        {/* Delete button */}
        {activeButton.id === activity.id && activeButton.action === "delete" ? (
          <DeleteFilledIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "delete" })
              setDialogActivity(activity)
              setConfirmationDialog(true)
            }}
          />
        ) : (
          <DeleteIcon
            className="actionIcon"
            onClick={() => {
              setActiveButton({ id: activity.id, action: "delete" })
              setDialogActivity(activity)
              setConfirmationDialog(true)
            }}
          />
        )}
      </span>
    )
  }

  // Table editing handlers
  const handleEditActivityTable = (activity) => {
    if (editingActivity?.id === activity.id) {
      // Cancel edit mode
      setRowMode("view")
      setEditingActivity(null)
      setEditedValues({})
      setActiveButton({ id: null, action: null })
    } else {
      // Start editing
      setEditingActivity(activity)
      setRowMode("edit")
      setEditedValues({
        name: activity.name,
        groups: activity.groups || [],
      })
      setActiveButton({ id: activity.id, action: "edit" })
    }
  }

  const handleSaveActivityTable = async (activity) => {
    if (Object.keys(editedValues).length > 0) {
      try {
        const updatedActivity = {
          ...activity,
          ...editedValues,
        }
        setEditingActivity(null)
        setEditedValues({})
        setRowMode("view")
        setActiveButton({ id: null, action: null })
        await handleUpdateActivity(activity.id, updatedActivity)
        enqueueSnackbar(t("Activity updated successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error updating activity:", error)
        enqueueSnackbar(t("Failed to update activity"), { variant: "error" })
      }
    } else {
      enqueueSnackbar(t("No changes to save"), { variant: "info" })
      setEditingActivity(null)
      setRowMode("view")
      setActiveButton({ id: null, action: null })
    }
  }

  // Activity view handlers
  const handleViewActivity = (activity) => {
    setViewingActivity(activity)
    setIsEditing(false)
    setTriggerSave(false)
  }

  const handleSearchData = (val: string) => {
    setSearch(val)
    searchActivities(val)
  }

  const handleCloseViewActivity = () => {
    setViewingActivity(null)
    setIsEditing(false)
    setTriggerSave(false)
  }

  const handleEditActivity = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTriggerSave(false)
    }
  }

  const handleSaveActivity = () => {
    setTriggerSave(true)
  }

  const handleSaveComplete = (updatedActivity) => {
    setViewingActivity(updatedActivity)
    setIsEditing(false)
    setTriggerSave(false)
    searchActivities("")
  }

  // Other handlers
  const handleVersioning = async (status) => {
    try {
      if (status === "Yes") {
        const updatedActivity = { ...dialogActivity, versionThis: true }
        await handleUpdateActivity(dialogActivity.id, updatedActivity)
        enqueueSnackbar(t("Successfully versioned the activity."), { variant: "success", autoHideDuration: 2000 })
      }
    } catch {
      enqueueSnackbar(t("Error in versioning the activity."), { variant: "error", autoHideDuration: 2000 })
    } finally {
      setConfirmationVersionDialog(false)
      setActiveButton({ id: null, action: null })
    }
  }

  const handleRestoreVersion = async (version, activity) => {
    try {
      const updatedActivity = {
        ...activity,
        settings: version.details?.settings,
        name: version.details?.name,
      }
      await handleUpdateActivity(activity.id, updatedActivity)
      enqueueSnackbar(t("Version restored successfully"), { variant: "success" })
      setVersionHistoryOpen(false)
    } catch (error) {
      console.error("Error restoring version:", error)
      enqueueSnackbar(t("Failed to restore version"), { variant: "error" })
    } finally {
      setVersionHistoryOpen(false)
      setActiveButton({ id: null, action: null })
    }
  }

  const confirmShareActivity = async (val, activity) => {
    try {
      if (val === "Yes") {
        const updatedActivity = {
          ...activity,
          shareTocommunity: !activity.shareTocommunity,
        }
        await handleUpdateActivity(activity.id, updatedActivity)
        setShareDialogOpen(false)
        setActiveButton({ id: null, action: null })
        enqueueSnackbar(t("Activity shared successfully"), {
          variant: "success",
          autoHideDuration: 1000,
        })
      }
    } catch (error) {
      console.error("Error sharing activity:", error)
      enqueueSnackbar(t("Failed to share activity"), { variant: "error" })
    } finally {
      setShareDialogOpen(false)
      setActiveButton({ id: null, action: null })
    }
  }

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "Not available"
  }

  // Column definitions for table view
  const ALL_ACTIVITY_COLUMNS = [
    {
      id: "id",
      label: "ID",
      key: `id-${editingActivity?.id || "view"}-${rowMode}`,
      value: (a) => a.id,
      visible: false,
      sortable: false,
      filterable: true,
      filterType: "text" as const,
      filterPlaceholder: "Filter by ID",
      renderCell: (activity) => (
        <Box
          className={classes.copyableCell}
          onClick={() => {
            window.navigator?.clipboard?.writeText?.(activity.id)
            enqueueSnackbar("ID copied to clipboard", {
              variant: "success",
              autoHideDuration: 1000,
            })
          }}
        >
          {activity.id}
        </Box>
      ),
    },
    {
      id: "name",
      label: "Name",
      key: `name-${editingActivity?.id || "view"}-${rowMode}`,
      value: (a) => a.name,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text" as const,
      filterPlaceholder: "Filter by Name",
      renderCell: (activity) => {
        if (rowMode === "edit" && editingActivity?.id === activity.id) {
          return (
            <TextField
              value={editedValues.name ?? activity.name}
              onChange={(e) => handleCellValueChange(activity.id, "name", e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.editableField}
            />
          )
        }
        return activity.name
      },
    },
    {
      id: "spec",
      label: "Spec",
      value: (a) => a.spec,
      visible: true,
      sortable: true,
      filterable: true,
      filterField: "spec",
      filterType: "dropdown" as const,
      filterOptions: availableActivitySpecs.map((spec) => ({
        label: spec.replace("lamp.", ""),
        value: spec,
      })),
      renderCell: (a) => a.spec,
    },
    {
      id: "creator",
      label: "Creator",
      value: (a) => a.creator,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text" as const,
      filterPlaceholder: "Filter by Creator",
      renderCell: (activity) => (
        <Box
          className={classes.copyableCell}
          onClick={() => {
            window.navigator?.clipboard?.writeText?.(activity.creator)
            enqueueSnackbar("Creator copied to clipboard", {
              variant: "success",
              autoHideDuration: 1000,
            })
          }}
        >
          {activity.creator}
        </Box>
      ),
    },
    {
      id: "createdAt",
      label: "Created At",
      value: (a) => formatDate(a.createdAt),
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "date" as const,
      filterPlaceholder: "Filter by Date",
      renderCell: (activity) => formatDate(activity.createdAt),
    },
    {
      id: "version",
      label: "Version",
      value: (a) => a.currentVersion?.name || "v1",
      visible: true,
      sortable: false,
      renderCell: (activity) => (
        <Box className={classes.versionBadge}>
          <Icon fontSize="small">flag</Icon>
          {activity.currentVersion?.name || "v1.0"}
        </Box>
      ),
    },
    {
      id: "study_name",
      label: "Study",
      value: (a) => a.study_name || "Unknown",
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text" as const,
      filterPlaceholder: "Filter by Study",
      renderCell: (activity) => activity.study_name || "Unknown Study",
    },
  ]

  const [visibleColumns, setVisibleColumns] = useState([
    { id: "id", label: "ID", visible: false },
    { id: "name", label: "Name", visible: true },
    { id: "spec", label: "Spec", visible: true },
    { id: "creator", label: "Creator", visible: true },
    { id: "createdAt", label: "Created At", visible: true },
    { id: "version", label: "Version", visible: true },
    { id: "study_name", label: "Study", visible: true },
  ])

  const columns = useMemo(() => {
    return ALL_ACTIVITY_COLUMNS.map((col) => {
      const found = visibleColumns.find((vc) => vc.id === col.id)
      return {
        ...col,
        visible: found ? found.visible : col.visible,
      }
    })
  }, [visibleColumns, activeButton, editingActivity, rowMode, editedValues])

  const initFilters = () => {
    const baseFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
    columns.forEach((col) => {
      baseFilters[col.id] = { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
    return baseFilters
  }

  const [filters, setFilters] = useState(initFilters())

  useEffect(() => {
    setFilters(initFilters())
  }, [columns])

  const originalIndexMap = useMemo(() => {
    return activities.reduce((acc, activity, index) => {
      acc[activity.id] = index + 1
      return acc
    }, {})
  }, [activities])

  const categorizeActivities = (activities) => {
    return {
      Core: activities.filter((a) => a.category === "core"),
      Custom: activities.filter((a) => a.category !== "core"),
      Community: activities.filter((a) => a.shareTocommunity),
    }
  }

  if (loading || isLoading) {
    return (
      <Backdrop className={classes.backdrop} open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  }

  return (
    <React.Fragment>
      {viewingActivity ? (
        <div className="body-container">
          <ActionsComponent
            actions={["edit", "save", "left", "right", "cancel"]}
            onEdit={handleEditActivity}
            onSave={handleSaveActivity}
            onPrevious={() => {
              const currentIndex = activities.findIndex((a) => a.id === viewingActivity.id)
              if (currentIndex > 0) {
                setViewingActivity(activities[currentIndex - 1])
              }
            }}
            onNext={() => {
              const currentIndex = activities.findIndex((a) => a.id === viewingActivity.id)
              if (currentIndex < activities.length - 1) {
                setViewingActivity(activities[currentIndex + 1])
              }
            }}
            onClose={handleCloseViewActivity}
          />
          <ActivityDetailItem
            activity={viewingActivity}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            triggerSave={triggerSave}
            studies={[]}
          />
        </div>
      ) : (
        <div className="body-container">
          <ActionsComponent
            searchData={handleSearchData}
            refreshElements={searchActivities}
            setSelectedColumns={setVisibleColumns}
            VisibleColumns={columns}
            setVisibleColumns={setVisibleColumns}
            addLabel={t("Add Activity")}
            addComponent={
              <AddActivity
                activities={activities}
                studies={props.studies}
                studyId={null}
                setActivities={setActivities}
                researcherId={null}
                showCreateForm={creatingActivity}
                setShowCreateForm={setCreatingActivity}
                setSelectedSpec={setSelectedSpec}
              />
            }
            actions={["refresh", "search", "grid", "table", "filter", "download"]}
            tabularView={props.tabularView}
            setTabularView={props.setTabularView}
            studies={props.studies}
            selectedStudies={props.selectedStudies}
            setSelectedStudies={props.setSelectedStudies}
            researcherId={null}
            order={props.order}
            setOrder={props.setOrder}
            tabType={"activities"}
            downloadTarget={"activities"}
          />
          {!props.tabularView ? (
            <div className="content-container">
              <Grid container spacing={3} className="cards-grid">
                {activities && activities.length > 0 ? (
                  <>
                    {paginatedActivities.map((activity) => (
                      <Grid item xs={12} sm={12} md={6} lg={4} key={activity.id}>
                        <div className="activity-card" onClick={() => handleViewActivity(activity)}>
                          <Typography variant="h6">{activity.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {activity.spec}
                          </Typography>
                          <Typography variant="caption">Created: {formatDate(activity.createdAt)}</Typography>
                          <Typography variant="caption">Creator: {activity.creator}</Typography>
                        </div>
                      </Grid>
                    ))}
                    <Pagination
                      data={activities}
                      updatePage={handleChangePage}
                      rowPerPage={[20, 40, 60, 80]}
                      currentPage={page}
                      currentRowCount={rowCount}
                    />
                  </>
                ) : (
                  <Box className={classes.norecordsmain}>
                    <Box display="flex" p={2} alignItems="center" className={classes.norecords}>
                      <Icon>info</Icon>
                      {t("No Activities Found")}
                    </Box>
                  </Box>
                )}
              </Grid>
            </div>
          ) : (
            <>
              <EmersiveTable
                data={activities}
                columns={columns}
                actions={activityActions}
                getItemKey={(activity) => activity.id}
                indexmap={originalIndexMap}
                sortConfig={sortConfig}
                onSort={(field) => {
                  setSortConfig({
                    field,
                    direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
                  })
                }}
                selectedRows={selectedRows}
                onSelectRow={(ids) => {
                  setSelectedRows(ids)
                }}
                onSelectAll={() => {
                  setSelectedRows((prev) => (prev.length === activities.length ? [] : activities.map((p) => p.id)))
                }}
                categorizeItems={categorizeActivities}
                showCategoryHeaders={true}
                filters={filters}
                onFilter={(newFilters) => setFilters({ ...initFilters(), ...newFilters })}
                filterDisplay="row"
                dataKeyprop={"id"}
                emptyStateMessage={t("No activities found")}
                rowsPerPageOptions={[2, 5, 10, 25, 50, 100]}
                currentPage={currentPage}
                onPageChange={(newPage) => {
                  setCurrentPage(newPage)
                }}
                onRowsPerPageChange={(newRowsPerPage) => {
                  setCurrentRowsPerPage(newRowsPerPage)
                  setCurrentPage(0)
                }}
                rows={currentRowsPerPage}
              />

              {/* Dialogs */}
              <ConfirmationDialog
                open={confirmationVersionDialog}
                onClose={() => {
                  setConfirmationVersionDialog(false)
                  setActiveButton({ id: null, action: null })
                }}
                confirmAction={handleVersioning}
                confirmationMsg={t("Are you sure you want to version this Activity?")}
              />

              <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => {
                  setConfirmationDialog(false)
                  setActiveButton({ id: null, action: null })
                }}
                confirmAction={handleDeleteActivity}
                confirmationMsg={t("Are you sure you want to delete this Activity?")}
              />

              {/* Version History Dialog */}
              {versionHistoryOpen && (
                <VersionHistoryDialog
                  open={versionHistoryOpen}
                  onClose={() => {
                    setVersionHistoryOpen(false)
                    setDialogActivity(null)
                  }}
                  activity={dialogActivity}
                  formatDate={formatDate}
                  onPreviewVersion={(version) => {
                    setSelectedVersion(version)
                    setPreviewDialogOpen(true)
                  }}
                  onRestoreVersion={(version) => {
                    handleRestoreVersion(version, dialogActivity)
                    setVersionHistoryOpen(false)
                  }}
                />
              )}

              {/* Version Preview Dialog */}
              <Dialog
                open={previewDialogOpen}
                onClose={() => {
                  setPreviewDialogOpen(false)
                  setActiveButton({ id: null, action: null })
                }}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>
                  <Box display="flex" alignItems="center">
                    <Icon style={{ marginRight: 8 }}>visibility</Icon>
                    {t("Version Preview")}
                  </Box>
                </DialogTitle>
                <DialogContent>
                  {selectedVersion && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {selectedVersion.name}
                      </Typography>
                      <Divider style={{ margin: "16px 0" }} />
                      <Typography variant="body1" gutterBottom>
                        {t("Settings")}:
                      </Typography>
                      <pre
                        style={{
                          backgroundColor: "#f5f5f5",
                          padding: 16,
                          borderRadius: 4,
                          overflow: "auto",
                        }}
                      >
                        {JSON.stringify(selectedVersion.details?.settings, null, 2)}
                      </pre>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setPreviewDialogOpen(false)
                      setActiveButton({ id: null, action: null })
                    }}
                    color="secondary"
                  >
                    {t("Close")}
                  </Button>
                  <Button
                    onClick={() => {
                      handleRestoreVersion(selectedVersion, dialogActivity)
                      setPreviewDialogOpen(false)
                      setActiveButton({ id: null, action: null })
                    }}
                    color="primary"
                  >
                    {t("Restore This Version")}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Share Activity Dialog */}
              <ConfirmationDialog
                confirmAction={(val) => confirmShareActivity(val, dialogActivity)}
                confirmationMsg={
                  !dialogActivity?.shareTocommunity
                    ? t("Are you sure you want to share this Activity in Community")
                    : t("Are you sure you want to remove this Activity from Community")
                }
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </React.Fragment>
  )
}
