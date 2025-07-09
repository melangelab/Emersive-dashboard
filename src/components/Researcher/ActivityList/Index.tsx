import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
  IconButton,
  TextField,
  Divider,
} from "@material-ui/core"
import { Service } from "../../DBService/DBService"
import { useTranslation } from "react-i18next"
import ActivityItem from "./ActivityItem"
import { sortData } from "../Dashboard"
import Pagination from "../../PaginatedElement"
import useInterval from "../../useInterval"
import LAMP from "lamp-core"
import { useLayoutStyles } from "../../GlobalStyles"
import ActivityTableRow from "./ActivityTableRow"
import { useSnackbar } from "notistack"
import { useQuery } from "../../Utils"
import { fetchGetData, fetchPostData, fetchResult } from "../SaveResearcherData"
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward"
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward"
import { ACCESS_LEVELS, getResearcherAccessLevel, useModularTableStyles } from "../Studies/Index"
import ItemViewHeader from "../SharedStyles/ItemViewHeader"
import ActivityDetailItem from "./ActivityDetailItem"
import CreateActivity from "./CreateActivity"
import Header from "../../Header"
import ActionsComponent from "../../Admin/ActionsComponent"
import AddActivity from "./AddActivity"
import "../researcher.css"

import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as HistoryIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as HistoryFilledIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as ShareCommunityIcon } from "../../../icons/NewIcons/refer.svg"
import { ReactComponent as ShareCommunityFilledIcon } from "../../../icons/NewIcons/refer-filled.svg"
import { ReactComponent as RemoveCommunityIcon } from "../../../icons/NewIcons/user-xmark.svg"
import { ReactComponent as RemoveCommunityFilledIcon } from "../../../icons/NewIcons/user-xmark-filled.svg"
import { ReactComponent as VersionThisIcon } from "../../../icons/NewIcons/code-merge.svg"
import { ReactComponent as VersionThisFilledIcon } from "../../../icons/NewIcons/code-merge-filled.svg"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../../icons/NewIcons/floppy-disks-filled.svg"
import CommonTable, { TableColumn } from "../CommonTable"
import { ca } from "date-fns/locale"
import { FilterMatchMode } from "primereact/api"
import ConfirmationDialog from "../../ConfirmationDialog"
import VersionHistoryDialog from "./VersionHistoryDialog"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[1],
    },

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
export const extendedStyles = makeStyles((theme: Theme) =>
  createStyles({
    // ...existing styles
    categoryHeader: {
      backgroundColor: "#f5f5f5",
      padding: theme.spacing(1, 2),
    },
    customCategory: {
      "& > td": {
        borderBottom: `2px solid ${theme.palette.primary.light}`,
      },
    },
    communityCategory: {
      "& > td": {
        borderBottom: `2px solid #4F95DA`,
      },
    },
    coreCategory: {
      "& > td": {
        borderBottom: `2px solid #EB8367`,
      },
    },
    idCell: {
      fontWeight: 500,
      color: theme.palette.primary.main,
    },
  })
)
export const useTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRoot: {
      height: "100%",
      backgroundColor: "pink",
      "& .MuiTableContainer-root": {
        backgroundColor: "#fff",
        borderRadius: 4,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
      },
      "& .MuiTable-root": {
        borderCollapse: "separate",
        borderSpacing: 0,
      },
      "& .MuiTableHead-root": {
        backgroundColor: "#fff",
        "& .MuiTableCell-head": {
          padding: "16px",
          color: "rgba(0, 0, 0, 0.87)",
          fontWeight: 500,
          borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 2,
          "&.indexColumn": {
            left: 48, // Space for checkbox
          },
          "&.actionsColumn": {
            right: 0,
            zIndex: 3,
          },
        },
      },
      "& .MuiTableBody-root": {
        "& .MuiTableRow-root:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
      },
      "& .MuiTableCell-body": {
        padding: "12px 16px",
        fontSize: "0.875rem",
        color: "rgba(0, 0, 0, 0.87)",
        borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
        "&.indexColumn": {
          left: 48,
          backgroundColor: "inherit",
          width: 48,
          textAlign: "center",
          color: "#4F95DA",
          fontWeight: 500,
        },
        "&.actionsColumn": {
          position: "sticky",
          right: 0,
          backgroundColor: "#fff",
          zIndex: 1,
          minWidth: 200,
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 100%)",
          },
        },
      },
      "& .categoryHeader": {
        "& .categoryHeader": {
          padding: "24px 16px", // Increase padding for more height
          backgroundColor: "#fafafa",
          borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
          marginTop: "16px", // Add margin top
          "& .MuiTypography-root": {
            color: "rgba(0, 0, 0, 0.87)",
            fontWeight: 500,
            fontSize: "1rem",
            lineHeight: "1.5", // Better line height
            paddingLeft: "8px", // Add left padding
          },
          "&:first-of-type": {
            marginTop: 0, // Remove margin for first category
          },
        },
      },
    },
    checkboxColumn: {
      width: 48,
      padding: "0 12px !important",
      left: 0,
      zIndex: 2,
      backgroundColor: "inherit",
    },
    actionsColumn: {
      position: "sticky",
      right: 0,
      backgroundColor: "#fff",
      zIndex: 1,
      minWidth: 200,
    },
    headerCell: {
      backgroundColor: "#fff",
      color: theme.palette.text.primary,
      fontWeight: 500,
      position: "sticky",
      top: 0,
      zIndex: 10,
      "&.sticky-left": {
        left: 0,
        zIndex: 11,
      },
      "&.sticky-right": {
        right: 0,
        zIndex: 11,
      },
    },
    indexCell: {
      width: 80,
      color: "#4F95DA",
      fontWeight: 500,
      left: 0,
      backgroundColor: "inherit",
    },
    actionCell: {
      position: "sticky",
      right: 0,
      backgroundColor: "inherit",
      zIndex: 5,
      minWidth: 160,
    },
    sortButton: {
      padding: 4,
      marginLeft: 4,
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    categoryHeader: {
      backgroundColor: "#F5F5F5",
      padding: theme.spacing(1, 2),
      "& .MuiTypography-root": {
        fontWeight: 500,
        color: "rgba(0, 0, 0, 0.87)",
      },
    },
    scrollShadow: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: 20,
      background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
      pointerEvents: "none",
      zIndex: 12,
    },
    stickyLeftCell: {
      position: "sticky",
      left: 0,
      backgroundColor: "inherit",
      zIndex: 5,
    },
    stickyRightCell: {
      position: "sticky",
      right: 0,
      backgroundColor: "inherit",
      zIndex: 5,
    },
    sortIcon: {
      fontSize: "1rem",
      marginLeft: theme.spacing(0.5),
      transition: "transform 0.2s",
      verticalAlign: "middle",
    },
    sortActive: {
      color: theme.palette.primary.main,
    },
    divider: {
      margin: theme.spacing(0, 2),
    },
    scrollIndicator: {
      position: "absolute",
      right: 8,
      bottom: 16,
      padding: theme.spacing(0.5),
      backgroundColor: "rgba(255,255,255,0.8)",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      zIndex: 20,
    },
    ellipsisCell: {
      maxWidth: 100,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      cursor: "pointer",
      "&:hover": {
        textDecoration: "underline",
      },
    },
  })
)

export const devLabCardStyles = makeStyles((theme: Theme) =>
  createStyles({
    version: {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#EB8367",
      marginLeft: theme.spacing(1),
    },
    studiesNumber: {
      fontSize: "2rem",
      fontWeight: 500,
      color: "#EB8367",
    },
    studiesLabel: {
      fontSize: "0.75rem",
      color: "rgba(0, 0, 0, 0.6)",
    },
    baseTypeDeveloper: {
      color: "rgba(39, 101, 156, 0.8)",
    },
    baseTypeDeveloperLabel: {
      color: "#27659c",
    },
  })
)

export const getActivityAccessLevel = (activity, studies, researcherId, sharedStudies = []) => {
  if (!activity.isShared) return ACCESS_LEVELS.ALL // Owner has full rights
  const activityStudyId = activity.study_id
  let activityStudy = studies.find((study) => study.id === activityStudyId)
  if (!activityStudy && Array.isArray(sharedStudies)) {
    activityStudy = sharedStudies.find((study) => study.id === activityStudyId)
  }
  if (!activityStudy) {
    console.log("Study not found for activity", activity.id, activityStudyId)
    return ACCESS_LEVELS.VIEW
  }
  const accessLevel = getResearcherAccessLevel(activityStudy, researcherId)
  return accessLevel
}

export const canEditActivity = (activity, studies, researcherId, sharedStudies = []) => {
  if (!activity.isShared) return true // Owner has full rights
  const accessLevel = getActivityAccessLevel(activity, studies, researcherId, sharedStudies)
  return accessLevel === ACCESS_LEVELS.EDIT || accessLevel === ACCESS_LEVELS.ALL
}

export const canViewActivity = (activity, studies, researcherId, sharedStudies = []) => {
  if (!activity.isShared) return true // Owner has full rights
  const accessLevel = getActivityAccessLevel(activity, studies, researcherId, sharedStudies)
  return accessLevel >= ACCESS_LEVELS.VIEW
}

export const availableActivitySpecs = [
  "lamp.form_builder",
  "lamp.survey",
  "lamp.cbt_thought_record",
  "lamp.group",
  "lamp.survey",
  "lamp.journal",
  "lamp.jewels_a",
  "lamp.jewels_b",
  "lamp.breathe",
  "lamp.spatial_span",
  "lamp.tips",
  "lamp.cats_and_dogs",
  "lamp.scratch_image",
  "lamp.dbt_diary_card",
  "lamp.pop_the_bubbles",
  "lamp.balloon_risk",
  "lamp.recording",
  "lamp.spin_wheel",
  "lamp.maze_game",
  "lamp.emotion_recognition",
  "lamp.symbol_digit_substitution",
]
export const games = [
  "lamp.jewels_a",
  "lamp.jewels_b",
  "lamp.spatial_span",
  "lamp.cats_and_dogs",
  "lamp.pop_the_bubbles",
  "lamp.balloon_risk",
  "lamp.spin_wheel",
  "lamp.maze_game",
  "lamp.emotion_recognition",
  "lamp.symbol_digit_substitution",
  "lamp.gyroscope",
  "lamp.dcog",
]
export default function ActivityList({
  researcherId,
  title,
  studies,
  selectedStudies,
  setSelectedStudies,
  setOrder,
  order,
  getAllStudies,
  ...props
}) {
  const [activities, setActivities] = useState(null)
  const { t } = useTranslation()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const classes = useStyles()
  const [selectedActivities, setSelectedActivities] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [paginatedActivities, setPaginatedActivities] = useState([])
  const [selected, setSelected] = useState(selectedStudies)
  const [allActivities, setAllActivities] = useState(null)
  const [rowCount, setRowCount] = useState(40)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(null)
  const layoutClasses = useLayoutStyles()
  const [viewMode, setViewMode] = useState("grid")
  const query = useQuery()
  const filterParam = query.get("filter")
  const [communityActivities, setCommunityActivities] = useState([])
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [viewingActivity, setViewingActivity] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)
  const [creatingActivity, setCreatingActivity] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [editingActivity, setEditingActivity] = useState(null)
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({})
  const [rowMode, setRowMode] = useState("view")
  const [sharedActivities, setSharedActivities] = useState([])
  const [allresearchers, setAllResearchers] = useState([])
  const [tabularView, setTabularView] = useState(false)
  // const [versionHistoryActivity, setVersionHistoryActivity] = useState(null)
  // New state variables for table editing
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [dialogActivity, setDialogActivity] = useState(null)
  const [selectedStudyForDuplicate, setSelectedStudyForDuplicate] = useState("")
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null })
  const [confirmationVersionDialog, setConfirmationVersionDialog] = useState(false)
  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
    },
    (!studies || studies.length === 0) && (!props.sharedstudies || props.sharedstudies.length === 0) ? 60000 : null,
    true
  )

  useEffect(() => {
    // LAMP.ActivitySpec.all().then((res) => console.log(res))
    let params = JSON.parse(localStorage.getItem("activities"))
    setPage(params?.page ?? 0)
    setRowCount(params?.rowCount ?? 40)
    // setFilters(initFilters())
  }, [])

  useEffect(() => {
    if (selected !== selectedStudies) setSelected(selectedStudies)
  }, [selectedStudies])

  useEffect(() => {
    if ((selected || []).length > 0) {
      searchActivities()
    } else {
      setActivities([])
      setLoading(false)
    }
  }, [selected])

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        const response = await fetchGetData(authString, `researcher/others/list`, "researcher")
        setAllResearchers(response.data)
        console.warn("All researchers:", response.data)
      } catch (error) {
        console.error("Error fetching researchers:", error)
      }
    }

    fetchResearchers()
  }, [])

  const getParentResearcher = (parentResearcherId) => {
    const researcher = allresearchers.find((r) => r.id === parentResearcherId)
    // console.log("getParentResearcher", parentResearcherId, researcher)
    return researcher ? researcher.name : parentResearcherId
  }

  const handleChange = (activity, checked) => {
    if (checked) {
      setSelectedActivities((prevState) => [...prevState, activity])
    } else {
      let selected = selectedActivities.filter((item) => item.id != activity.id)
      setSelectedActivities(selected)
    }
  }

  const searchActivities = async (searchVal?: string) => {
    const searchTxt = searchVal ?? search
    // const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    const selectedstudiesData = selected?.filter((o) => studies?.some(({ name }) => o === name)) || []
    const selectedsharedData = props.sharedstudies
      ? selected.filter((o) => props.sharedstudies?.some(({ name }) => o === name))
      : []
    const selectedData = [...selectedstudiesData, ...selectedsharedData]
    if (selectedData.length > 0) {
      setLoading(true)
      try {
        const activitiesData = await Service.getAll("activities")
        setAllActivities(activitiesData)
        console.log("activitiesData", activitiesData)
        const resylt = Array.isArray(activitiesData) ? activitiesData : []
        const ids = resylt.map((activity) => activity.id)
        const detailedActivities = await Promise.all(
          ids.map((id) => Service.getDataByKey("activities", [id], "id").then((data) => data[0]))
        )
        console.log("Detailed Activities:", detailedActivities)
        // const detailedLActivities = await Promise.all(ids.map((id) => LAMP.Activity.view(id)))
        // console.log("Detailed L Activities:", detailedLActivities)

        let filteredData = activitiesData || []
        if (filterParam) {
          filteredData = filteredData.filter((factivity) => factivity.id === filterParam)
        } else if (!!searchTxt && searchTxt.trim?.().length > 0) {
          filteredData = filteredData.filter(
            (factivity) =>
              factivity.name?.toLowerCase().includes(searchTxt?.toLowerCase?.()) ||
              factivity.id?.toLowerCase().includes(searchTxt?.toLowerCase?.())
          )
        }
        const sortedData = sortData(filteredData, selectedData, "name")
        setActivities(sortedData)
        const fetchedCommunityActivities = await fetchCommunityActivities()
        const filteredCommunityActivities = fetchedCommunityActivities.filter(
          (activity) =>
            !searchTxt ||
            activity.name?.toLowerCase().includes(searchTxt?.toLowerCase?.()) ||
            activity.id?.toLowerCase().includes(searchTxt?.toLowerCase?.())
        )
        const combinedActivities = [...sortedData, ...filteredCommunityActivities]
        setPaginatedActivities(combinedActivities.slice(page * rowCount, page * rowCount + rowCount))
        console.log(
          "setPaginatedActivities",
          combinedActivities,
          combinedActivities.slice(page * rowCount, page * rowCount + rowCount)
        )
        // enqueueSnackbar("Fetched all activities", {variant:"success",autoHideDuration:1000})
      } catch (error) {
        console.error("Error searching activities:", error)
        enqueueSnackbar(t("Failed to search activities"), { variant: "error" })
      } finally {
        setLoading(false)
      }
    } else {
      setActivities([])
      setPaginatedActivities([])
      setLoading(false)
    }
    setSelectedActivities([])
    setLoading(false)
  }

  const handleSearchData = (val: string) => {
    setSearch(val)
    searchActivities(val)
  }

  const handleChangePage = (page: number, rowCount: number) => {
    setLoading(true)
    setRowCount(rowCount)
    setPage(page)
    localStorage.setItem("activities", JSON.stringify({ page: page, rowCount: rowCount }))
    // const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    const selectedstudiesData = selected?.filter((o) => studies?.some(({ name }) => o === name)) || []
    const selectedsharedData = props.sharedstudies
      ? selected.filter((o) => props.sharedstudies?.some(({ name }) => o === name))
      : []
    const selectedData = [...selectedstudiesData, ...selectedsharedData]

    const combinedActivities = [...activities, ...communityActivities]
    setPaginatedActivities(
      sortData(combinedActivities, selectedData, "name").slice(page * rowCount, page * rowCount + rowCount)
    )
    setLoading(false)
  }

  const handleUpdateActivity = async (activityId, updatedActivity) => {
    try {
      const activity = activities.find((a) => a.id === activityId)
      if (activity && !canEditActivity(activity, studies, researcherId, props.sharedStudies)) {
        enqueueSnackbar(t("You don't have permission to update this activity"), { variant: "error" })
        return
      }
      setLoading(true)
      const currentActivity = activities.find((a) => a.id === activityId)
      // Update in LAMP backend
      const updActivity = (await LAMP.Activity.update(activityId, updatedActivity)) as any
      console.log("after updating", updActivity)
      updatedActivity.currentVersion = updActivity["data"].currentVersion
      updatedActivity.versionHistory = updActivity["data"].versionHistory
      console.log("here", updatedActivity.currentVersion, updatedActivity.versionHistory)
      // Update in local service
      await Service.updateMultipleKeys(
        "activities",
        { activities: [{ id: activityId, ...updatedActivity }] },
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
      await searchActivities()
      enqueueSnackbar(t("Activity updated successfully."), { variant: "success" })
    } catch (err) {
      console.error("Error updating activity:", err)
      enqueueSnackbar(t("Failed to update activity: ") + err.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityActivities = async () => {
    try {
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const response = await fetchGetData(
        authString,
        `researcher/${researcherId}/activity/community-shared`,
        "researcher"
      )

      const transformedActivities = (response.data || []).map((activity) => ({
        ...activity,
        isCommunityActivity: true,
        originalId: activity.id,
      }))
      console.log("community shared", transformedActivities)
      setCommunityActivities(transformedActivities)
      return transformedActivities
    } catch (error) {
      console.error("Error fetching community activities:", error)
      enqueueSnackbar(t("Failed to load community activities"), { variant: "error" })
      return []
    }
  }

  const allActivitiesForDisplay = [...paginatedActivities, ...communityActivities]
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "Not available"
  }

  const formatSchedule = (schedule) => {
    if (!schedule || !Array.isArray(schedule)) return "-"

    return schedule
      .map((item) => {
        const startDate = new Date(item.start_date).toLocaleDateString()
        const time = new Date(item.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        const interval = item.repeat_interval || "none"
        const customTimes = item.custom_time
          ? Array.isArray(item.custom_time)
            ? item.custom_time.map((t) => new Date(t).toLocaleTimeString()).join(", ")
            : "No custom times"
          : "No custom times"

        return `${startDate} at ${time}, Repeats: ${interval}, ${customTimes}`
      })
      .join("\n")
  }

  const [selectAll, setSelectAll] = useState(false)
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedActivities(paginatedActivities)
      setSelectAll(true)
    } else {
      setSelectedActivities([])
      setSelectAll(false)
    }
  }

  const handleCellValueChange = (activityId: string, field: string, value: any) => {
    console.log("handleCellValueChange", activityId, field, value, editedValues)
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditActivityView = () => {
    if (!viewingActivity || !canEditActivity(viewingActivity, studies, researcherId, props.sharedstudies)) {
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

  const handleSaveActivityView = () => {
    if (!viewingActivity || !canEditActivity(viewingActivity, studies, researcherId, props.sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to save changes to this activity"), { variant: "error" })
      return
    }

    setTriggerSave(true)
  }

  // const activityActions = useCallback((activity: any) => {
  const activityActions = (activity: any) => {
    const canEdit = canEditActivity(activity, studies, researcherId, props.sharedstudies)
    const isCommunity = activity.isCommunityActivity

    return (
      <span className="p-datatable-action-buttons">
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
        {/* Copy button */}
        {isCommunity && (
          <>
            {activeButton.id === activity.id && activeButton.action === "copy" ? (
              <CopyFilledIcon
                className="actionIcon"
                onClick={() => {
                  setActiveButton({ id: activity.id, action: "copy" })
                  setDialogActivity(activity)
                  setDuplicateDialogOpen(true)
                }}
              />
            ) : (
              <CopyIcon
                className="actionIcon"
                onClick={() => {
                  setActiveButton({ id: activity.id, action: "copy" })
                  setDialogActivity(activity)
                  setDuplicateDialogOpen(true)
                }}
              />
            )}
          </>
        )}
        {!isCommunity && (
          <>
            {/* Edit/Save buttons */}
            {canEdit && (
              <>
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
              </>
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

            {/* Share/Unshare button */}
            {canEdit && !activity.isShared && (
              <>
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
              </>
            )}

            {/* Version button */}
            {canEdit && (
              <>
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
              </>
            )}
          </>
        )}
        {/* Delete button */}
        {!isCommunity &&
          !activity.isShared &&
          canEdit &&
          (activeButton.id === activity.id && activeButton.action === "delete" ? (
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
          ))}
      </span>
    )
  }
  // , [activeButton, studies, researcherId, props.sharedstudies])

  const handleVersioning = async (status) => {
    try {
      if (status === "Yes") {
        const updatedActivity = { ...dialogActivity, versionThis: true }
        await handleUpdateActivity(dialogActivity.id, updatedActivity)
        enqueueSnackbar(t("Successfully versioned the activity."), { variant: "success", autoHideDuration: 2000 })
      } else {
        setConfirmationVersionDialog(false)
      }
    } catch {
      enqueueSnackbar(t("Error in versioning the activity."), { variant: "error", autoHideDuration: 2000 })
      console.log(`Activity ID ${dialogActivity.id} failed for versioning ${dialogActivity}`)
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

  const handlePreviewVersion = async (version, activity) => {
    try {
      setPreviewDialogOpen(true)
      setSelectedVersion(version)
    } catch (error) {
      console.error("Error previewing version:", error)
      enqueueSnackbar(t("Failed to preview version"), { variant: "error" })
    }
  }

  const confirmShareActivity = async (val: string, activity) => {
    try {
      if (val == "Yes") {
        console.log("Sharing activity with community:", activity)
        const updatedActivity = {
          ...activity,
          shareTocommunity: !activity.shareTocommunity,
        }

        await handleUpdateActivity(activity.id, updatedActivity)
        setShareDialogOpen(false)
        setActiveButton({ id: null, action: null })
        enqueueSnackbar(t("Activity published in community successfully"), {
          variant: "success",
          autoHideDuration: 1000,
        })
      }
    } catch (error) {
      console.error("Error sharing activity:", error)
      enqueueSnackbar(t("Failed to publish activity in community."), { variant: "error" })
    } finally {
      setShareDialogOpen(false)
      setActiveButton({ id: null, action: null })
    }
  }

  const handleDuplicateActivity = async (activity) => {
    if (!selectedStudyForDuplicate) {
      enqueueSnackbar(t("Please select a study"), { variant: "error" })
      return
    }

    setDuplicateLoading(true)
    try {
      const newActivity = {
        ...activity,
        name: `${activity.name} (Copy)`,
        spec: activity.spec,
        settings: activity.settings,
        schedule: [],
        category: activity.category,
        sharingStudies: [],
        scoreInterpretation: activity.scoreInterpretation || {},
        activityGuide: activity.activityGuide || null,
        versionHistory: [],
        shareTocommunity: false,
        currentVersion: null,
      }
      const newActivityId = await LAMP.Activity.create(selectedStudyForDuplicate, newActivity)
      await Service.addData("activities", [
        {
          id: newActivityId,
          ...newActivity,
          study_id: selectedStudyForDuplicate,
        },
      ])
      setDuplicateDialogOpen(false)
      searchActivities()
      enqueueSnackbar(t("Activity duplicated successfully"), { variant: "success" })
    } catch (error) {
      console.error("Error duplicating activity:", error)
      enqueueSnackbar(t("Failed to duplicate activity"), { variant: "error" })
    } finally {
      setDuplicateLoading(false)
      setActiveButton({ id: null, action: null })
    }
  }

  const handleDeleteActivity = async (status) => {
    if (status === "Yes") {
      try {
        if (dialogActivity.spec === "lamp.survey") {
          await LAMP.Type.setAttachment(dialogActivity.id, "me", "lamp.dashboard.survey_description", null)
        } else {
          await LAMP.Type.setAttachment(dialogActivity.id, "me", "emersive.activity.details", null)
        }
        await LAMP.Activity.delete(dialogActivity.id)
        await Service.delete("activities", [dialogActivity.id])
        await Service.updateCount("studies", dialogActivity.study_id, "activity_count", 1, 1)
        setActivities((prev) => prev.filter((a) => a.id !== dialogActivity.id))
        await searchActivities()
        enqueueSnackbar(t("Activity deleted successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error deleting activity:", error)
        enqueueSnackbar(t("Failed to delete activity"), { variant: "error" })
      }
    } else {
      setConfirmationDialog(false)
    }
    setConfirmationDialog(false)
    setActiveButton({ id: null, action: null })
  }

  useEffect(() => {
    console.warn("Active button changed:", activeButton)
  }, [activeButton])

  useEffect(() => {
    console.warn("editingActivity changed:", editingActivity)
  }, [editingActivity])

  // const [columns, setColumns] = useState<TableColumn[]>([
  const columngenerator = useCallback(
    () => [
      {
        id: "id",
        label: "ID",
        key: `id-${editingActivity?.id || "view"}-${rowMode}`,
        value: (a) => a.id,
        visible: false,
        sortable: false,
        filterable: true,
        filterType: "text",
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
        filterType: "text",
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
          console.warn(
            "rendercell inside activity loist",
            activity.name,
            " Mode : " + rowMode + " Editing Activity: " + editingActivity
          )
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
        filterType: "dropdown",
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
        filterType: "text",
        filterPlaceholder: "Filter by Creator",
        renderCell: (activity) => {
          const creator = allresearchers.find((r) => r.id === activity.creator)?.name || activity.creator
          return (
            <Box
              className={classes.copyableCell}
              onClick={() => {
                window.navigator?.clipboard?.writeText?.(creator)
                enqueueSnackbar("Creator copied to clipboard", {
                  variant: "success",
                  autoHideDuration: 1000,
                })
              }}
            >
              {creator}
            </Box>
          )
        },
      },
      {
        id: "createdAt",
        label: "Created At",
        value: (a) => formatDate(a.createdAt),
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "date",
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
      // { id: 'schedule', label: 'Schedule',
      //   value: (a) => formatSchedule(a.schedule),
      //   visible: true
      // },
      {
        id: "groups",
        label: "Groups",
        key: `groups-${editingActivity?.id || "view"}-${rowMode}`,
        value: (a) => a.groups || [],
        visible: true,
        sortable: false,
        renderCell: (activity) => {
          if (rowMode === "edit" && editingActivity?.id === activity.id) {
            const availableGroups = activity.study_id
              ? studies.find((s) => s.id === activity.study_id)?.gname || []
              : []
            return (
              <FormControl fullWidth size="small" variant="outlined">
                <Select
                  multiple
                  value={editedValues.groups ?? activity.groups ?? []}
                  onChange={(e) => handleCellValueChange(activity.id, "groups", e.target.value)}
                  renderValue={(selected: string[]) => (
                    <Box style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  className={classes.editableField}
                >
                  {availableGroups.map((group) => (
                    <MenuItem key={group} value={group}>
                      <Checkbox checked={(editedValues.groups ?? activity.groups ?? []).includes(group)} />
                      <ListItemText primary={group} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          }
          return (
            <Box style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(activity.groups || []).map((group) => (
                <Chip key={group} label={group} size="small" />
              ))}
            </Box>
          )
        },
      },
      {
        id: "study",
        label: "Study",
        value: (a) => ({
          name: a.study_name,
          id: a.study_id,
        }),
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
        filterPlaceholder: "Filter by Study",
        renderCell: (activity) => (
          <Box
            className={classes.studyCell}
            onClick={() => {
              window.navigator?.clipboard?.writeText?.(activity.study_id)
              enqueueSnackbar("Study ID copied to clipboard", {
                variant: "success",
                autoHideDuration: 1000,
              })
            }}
          >
            {activity.study_name || "No Study Name"}
          </Box>
        ),
      },
      {
        id: "ownership",
        label: "Ownership",
        // value: (a) => a.isShared ? `Shared` : "Owner",
        value: (a) => getParentResearcher(a.parentResearcher) || getParentResearcher(researcherId),
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
        filterPlaceholder: "Filter by Owner",
        renderCell: (activity) => getParentResearcher(activity.parentResearcher) || getParentResearcher(researcherId),
      },
      // { id: 'studyId', label: 'Study', value: (a) => a.study_id, visible: true },
      {
        id: "device",
        label: "Device",
        value: (a) => a.device || "-",
        visible: false,
        sortable: true,
        renderCell: (a) => a.device || "-",
        key: `device-${editingActivity?.id || "view"}-${rowMode}`,
      },
      // { id:"tableV", label:"Table Version", value: editingActivity ? `${editingActivity.id}-${rowMode}` : null, visible: false, sortable: false},
    ],
    [rowMode, editingActivity, allresearchers, activeButton]
  )
  const [columns, setColumns] = useState<TableColumn[]>([])

  useEffect(() => {
    const cols = [...columngenerator()] as TableColumn[]
    setColumns(cols)
  }, [columngenerator, editingActivity, rowMode]) //

  // Memoize columns for DataTable to ensure new reference on columns update
  const columnsTable = useMemo(() => {
    console.warn("New columns for Datatable")
    return [...columns]
  }, [columns, editingActivity, rowMode]) // editingActivity, rowMode

  const handleViewActivity = (activity) => {
    if (!canViewActivity(activity, studies, researcherId, props.sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to view this activity"), { variant: "error" })
      return
    }
    setViewingActivity(activity)
    setIsEditing(false)
    setTriggerSave(false)
  }

  const handleCloseViewActivity = () => {
    setViewingActivity(null)
    setIsEditing(false)
    setTriggerSave(false)
    // setActiveButton({ id: null, action: null }); TODO
  }

  const handleEditActivity = () => {
    if (!viewingActivity || !canEditActivity(viewingActivity, studies, researcherId, props.sharedstudies)) {
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

  const handleSaveActivity = () => {
    if (!viewingActivity || !canEditActivity(viewingActivity, studies, researcherId, props.sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to save changes to this activity"), { variant: "error" })
      return
    }

    setTriggerSave(true)
  }

  const handleEditActivityTable = (activity: any) => {
    // const handleEditActivityTable = (activity: any) => {
    console.warn("Editing activity in table:", activity?.id, editingActivity?.id, rowMode, activeButton)
    if (!canEditActivity(activity, studies, researcherId, props.sharedstudies)) {
      enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
      return
    }

    if (editingActivity?.id === activity.id) {
      // Cancel edit mode
      setRowMode("view")
      setEditingActivity(null)
      setEditedValues({})
      setActiveButton({ id: null, action: null })
      console.warn("Canceling edit mode for:", activity?.id, editingActivity?.id, rowMode, activeButton)
    } else {
      // Start editing
      setEditingActivity(activity)
      setRowMode("edit")
      setEditedValues({
        name: activity.name,
        groups: activity.groups || [],
      })
      setActiveButton({ id: activity.id, action: "edit" })
      console.warn("Starting edit mode for:", activity?.id, editingActivity?.id, rowMode, activeButton)
    }
  }
  const handleSaveActivityTable = async (activity: any) => {
    if (Object.keys(editedValues).length > 0) {
      try {
        const updatedActivity = {
          ...activity,
          ...editedValues,
        }
        await handleUpdateActivity(activity.id, updatedActivity)
        setEditingActivity(null)
        setEditedValues({})
        setRowMode("view")
        setActiveButton({ id: null, action: null })
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

  const handleSaveComplete = (updatedActivity) => {
    console.log("Save complete:", updatedActivity)
    setViewingActivity(updatedActivity)
    setIsEditing(false)
    setTriggerSave(false)
    searchActivities()
  }

  const handleEditRowActivity = (activity) => {
    console.log("Editing activity:", activity?.id)
    if (editingActivity?.id === activity.id) {
      // Cancel edit mode
      setRowMode("view")
      setEditingActivity(null)
      setEditedValues({})
    } else {
      if (!canEditActivity(activity, studies, researcherId, props.sharedStudies)) {
        enqueueSnackbar(t("You don't have permission to edit this activity"), { variant: "error" })
        return
      }
      // Enter edit mode
      setEditingActivity(activity)
      setRowMode("edit")
      setEditedValues({
        name: activity.name,
        spec: activity.spec,
        creator: activity.creator,
        groups: activity.groups || [],
      })
    }
  }

  const handleSaveRowActivity = async (activity) => {
    if (Object.keys(editedValues).length > 0) {
      try {
        const updatedActivity = {
          ...activity,
          ...editedValues,
        }
        await handleUpdateActivity(activity.id, updatedActivity)
        setEditingActivity(null)
        setEditedValues({})
        setRowMode("view")
        enqueueSnackbar(t("Activity updated successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error updating activity:", error)
        enqueueSnackbar(t("Failed to update activity"), { variant: "error" })
      }
    } else {
      enqueueSnackbar(t("No changes to save"), { variant: "info" })
      setEditingActivity(null)
      setRowMode("view")
    }
  }

  const categorizeActivities = (activities) => {
    return {
      // Shared: activities.filter((a) => a.isShared),
      Custom: activities.filter((a) => !a.isCommunityActivity),
      Community: activities.filter((a) => a.isCommunityActivity),
      Core: activities.filter((a) => !a.isCommunityActivity && a.category === "core"),
    }
  }

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
    return [...(activities || []), ...(communityActivities || [])].reduce((acc, activity, index) => {
      acc[activity.id] = index
      return acc
    }, {})
  }, [activities, communityActivities])

  useEffect(() => {
    if (filterParam) {
      console.log("Filter param changed:", filterParam)
      setSearch(null)
      searchActivities()
    }
  }, [filterParam])
  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || activities === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {viewingActivity ? (
        <Header
          authType={LAMP.Auth._type}
          title={props.ptitle}
          pageLocation={`${props.ptitle} > Activities > ${viewingActivity.name}`}
        />
      ) : (
        // <ItemViewHeader
        //   ItemTitle="Activity"
        //   ItemName={viewingActivity.name}
        //   // ItemCategory={viewingActivity.isCommunityActivity}
        //   searchData={handleSearchData}
        //   authType={props.authType}
        //   onEdit={handleEditActivity}
        //   onSave={() => {
        //     if (isEditing) {
        //       handleSaveActivity()
        //     }
        //   }}
        //   onPrevious={() => {
        //     const allActivitiesList = [...activities, ...communityActivities]
        //     const currentIndex = allActivitiesList.findIndex((a) => a.id === viewingActivity.id)
        //     if (currentIndex > 0) {
        //       setViewingActivity(allActivitiesList[currentIndex - 1])
        //     }
        //   }}
        //   onNext={() => {
        //     const allActivitiesList = [...activities, ...communityActivities]
        //     const currentIndex = allActivitiesList.findIndex((a) => a.id === viewingActivity.id)
        //     if (currentIndex < allActivitiesList.length - 1) {
        //       setViewingActivity(allActivitiesList[currentIndex + 1])
        //     }
        //   }}
        //   onClose={handleCloseViewActivity}
        //   disabledBtns={
        //     viewingActivity.isCommunityActivity ||
        //     !canEditActivity(viewingActivity, studies, researcherId, props.sharedstudies)
        //   }
        // />
        <Header authType={LAMP.Auth._type} title={props.ptitle} pageLocation={`${props.ptitle} > Activities`} />
        // <Header
        //   studies={studies}
        //   researcherId={researcherId}
        //   activities={allActivities}
        //   selectedActivities={selectedActivities}
        //   searchData={handleSearchData}
        //   selectedStudies={selected}
        //   setSelectedStudies={setSelectedStudies}
        //   setActivities={searchActivities}
        //   setOrder={setOrder}
        //   order={order}
        //   title={props.ptitle}
        //   authType={props.authType}
        //   onLogout={props.onLogout}
        //   onViewModechanged={setViewMode}
        //   viewMode={viewMode}
        //   VisibleColumns={columns}
        //   setVisibleColumns={setColumns}
        //   showCreateForm={creatingActivity}
        //   setShowCreateForm={setCreatingActivity}
        //   setSelectedSpec={setSelectedSpec}
        // />
      )}
      {viewingActivity ? (
        <div className="body-container">
          <ActionsComponent
            actions={["edit", "save", "left", "right", "cancel"]}
            onEdit={handleEditActivity}
            onSave={handleSaveActivity}
            onPrevious={() => {
              const allActivitiesList = [...activities, ...communityActivities]
              const currentIndex = allActivitiesList.findIndex((a) => a.id === viewingActivity.id)
              if (currentIndex > 0) {
                setViewingActivity(allActivitiesList[currentIndex - 1])
              }
            }}
            onNext={() => {
              const allActivitiesList = [...activities, ...communityActivities]
              const currentIndex = allActivitiesList.findIndex((a) => a.id === viewingActivity.id)
              if (currentIndex < allActivitiesList.length - 1) {
                setViewingActivity(allActivitiesList[currentIndex + 1])
              }
            }}
            onClose={handleCloseViewActivity}
            disabledBtns={
              viewingActivity.isCommunityActivity ||
              !canEditActivity(viewingActivity, studies, researcherId, props.sharedstudies)
            }
          />
          <ActivityDetailItem
            activity={viewingActivity}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            studies={studies}
            triggerSave={triggerSave}
          />
        </div>
      ) : creatingActivity ? (
        <CreateActivity
          studies={studies}
          selectedSpec={selectedSpec}
          researcherId={researcherId}
          onSave={(newActivity) => {
            setActivities((prev) => [...prev, newActivity])
            searchActivities()
            setCreatingActivity(false)
          }}
          onCancel={() => setCreatingActivity(false)}
          sharedstudies={props.sharedstudies}
        />
      ) : (
        <div className="body-container">
          <ActionsComponent
            searchData={handleSearchData}
            refreshElements={searchActivities}
            setSelectedColumns={setColumns}
            VisibleColumns={columns}
            setVisibleColumns={setColumns}
            addComponent={
              <AddActivity
                activities={activities}
                studies={studies}
                studyId={null}
                setActivities={setActivities}
                researcherId={researcherId}
                showCreateForm={creatingActivity}
                setShowCreateForm={setCreatingActivity}
                setSelectedSpec={setSelectedSpec}
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
            tabType={"activities"}
            downloadTarget={"activities"}
          />
          {!tabularView ? (
            <div className="" style={{ overflow: "auto" }}>
              <Grid container spacing={3} className="cards-grid">
                {!!activities && activities.length > 0 ? (
                  <>
                    {paginatedActivities.map((activity) => (
                      <Grid item xs={12} sm={12} md={6} lg={4} key={activity.id}>
                        <ActivityItem
                          activity={activity}
                          researcherId={researcherId}
                          studies={studies}
                          activities={activities}
                          handleSelectionChange={handleChange}
                          selectedActivities={selectedActivities}
                          setActivities={searchActivities}
                          updateActivities={setActivities}
                          sharedstudies={props.sharedstudies}
                          onActivityUpdate={handleUpdateActivity}
                          formatDate={formatDate}
                          searchActivities={searchActivities}
                          onViewActivity={handleViewActivity}
                          allresearchers={allresearchers}
                        />
                      </Grid>
                    ))}
                    <Pagination
                      data={[...activities, ...communityActivities]}
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
                      {`${t("No Records Found")}`}
                    </Box>
                  </Box>
                )}
              </Grid>
            </div>
          ) : (
            <>
              <CommonTable
                data={[...activities, ...communityActivities]}
                columns={columnsTable}
                actions={activityActions}
                indexmap={originalIndexMap}
                sortConfig={sortConfig}
                onSort={(field) => {
                  setSortConfig({
                    field,
                    direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
                  })
                }}
                categorizeItems={categorizeActivities}
                showCategoryHeaders={true}
                filters={filters}
                onFilter={(newFilters) => setFilters(newFilters)}
                filterDisplay="row"
                key={editingActivity ? `${editingActivity.id}-${rowMode}` : null}
                // dataKeyprop={"name"}
              />
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

              {/* Duplicate Activity Dialog */}
              <Dialog
                open={duplicateDialogOpen}
                onClose={() => {
                  setDuplicateDialogOpen(false)
                  setSelectedStudyForDuplicate("")
                }}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>
                  <Box display="flex" alignItems="center">
                    <Icon style={{ marginRight: 8 }}>content_copy</Icon>
                    {t("Duplicate Community Activity")}
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Typography variant="body1" gutterBottom>
                    {t("You're about to make a copy of")}: <b>{dialogActivity?.name}</b>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t("This will create a new activity in your selected study, which you can then customize.")}
                  </Typography>
                  <Box mt={3}>
                    <FormControl fullWidth>
                      <InputLabel>{t("Select Destination Study")}</InputLabel>
                      <Select
                        value={selectedStudyForDuplicate}
                        onChange={(e) => setSelectedStudyForDuplicate(e.target.value as string)}
                      >
                        {studies.map((study) => (
                          <MenuItem key={study.id} value={study.id}>
                            {study.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setDuplicateDialogOpen(false)
                      setSelectedStudyForDuplicate("")
                    }}
                    color="secondary"
                  >
                    {t("Cancel")}
                  </Button>
                  <Button
                    onClick={() => handleDuplicateActivity(dialogActivity)}
                    color="primary"
                    disabled={duplicateLoading || !selectedStudyForDuplicate}
                    variant="contained"
                    startIcon={
                      duplicateLoading ? <CircularProgress size={20} color="inherit" /> : <Icon>content_copy</Icon>
                    }
                  >
                    {duplicateLoading ? t("Duplicating...") : t("Duplicate")}
                  </Button>
                </DialogActions>
              </Dialog>
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
            // <TableView
            //   activities={[...activities, ...communityActivities]}
            //   handleChange={handleChange}
            //   selectedActivities={selectedActivities}
            //   researcherId={researcherId}
            //   studies={studies}
            //   onActivityUpdate={handleUpdateActivity}
            // />
            // <TableView_Mod />
          )}
        </div>
      )}
      {/* <Dialog open={!!versionHistoryActivity} onClose={() => setVersionHistoryActivity(null)} maxWidth="md" fullWidth>
        <DialogTitle>Version History - {versionHistoryActivity?.name}</DialogTitle>
        <DialogContent>
          {versionHistoryActivity?.versionHistory?.map((version, index) => (
            <Box key={version.id} mb={2}>
              <Typography variant="subtitle1">
                {version.name} - {formatDate(version.date)} {version.time}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionHistoryActivity(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog> */}
    </React.Fragment>
  )
}
