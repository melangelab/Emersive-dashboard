import React, { useState, useEffect, useRef } from "react"
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
} from "@material-ui/core"
import { Service } from "../../DBService/DBService"
import { useTranslation } from "react-i18next"
import ActivityItem from "./ActivityItem"
import Header from "./Header"
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
import { useModularTableStyles } from "../Studies/Index"
import ItemViewHeader from "../SharedStyles/ItemViewHeader"
import ActivityDetailItem from "./ActivityDetailItem"

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

interface TableColumn {
  id: string
  label: string
  value: (activity: any) => string | number | React.ReactNode
  visible: boolean
  sortable: boolean
}

export const availableActivitySpecs = [
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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const query = useQuery()
  const filterParam = query.get("filter")
  const [communityActivities, setCommunityActivities] = useState([])
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [viewingActivity, setViewingActivity] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
    },
    studies !== null && (studies || []).length > 0 ? null : 2000,
    true
  )

  useEffect(() => {
    // LAMP.ActivitySpec.all().then((res) => console.log(res))
    let params = JSON.parse(localStorage.getItem("activities"))
    setPage(params?.page ?? 0)
    setRowCount(params?.rowCount ?? 40)
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

  const handleChange = (activity, checked) => {
    if (checked) {
      setSelectedActivities((prevState) => [...prevState, activity])
    } else {
      let selected = selectedActivities.filter((item) => item.id != activity.id)
      setSelectedActivities(selected)
    }
  }

  // const searchActivities = (searchVal?: string) => {
  //   const searchTxt = searchVal ?? search
  //   const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
  //   if (selectedData.length > 0) {
  //     setLoading(true)
  //     let result = []
  //     Service.getAll("activities").then((activitiesData) => {
  //       setAllActivities(activitiesData)
  //       let filteredData = activitiesData || []
  //       if (filterParam) {
  //         filteredData = filteredData.filter(factivity => factivity.id === filterParam)
  //       }
  //       else if (!!searchTxt && searchTxt.trim().length > 0) {
  //         filteredData = filteredData.filter(
  //           (factivity) =>
  //             factivity.name?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
  //           factivity.id?.toLowerCase().includes(searchTxt?.toLowerCase())
  //         )
  //       }
  //       // if (!!searchTxt && searchTxt.trim().length > 0) {
  //       //   result = result.concat(activitiesData)
  //       //   result = result.filter((i) => i.name?.toLowerCase()?.includes(searchTxt?.toLowerCase()))
  //       //   setActivities(sortData(result, selectedData, "name"))
  //       // } else {
  //       //   result = result.concat(activitiesData)
  //       //   setActivities(sortData(result, selectedData, "name"))
  //       // }

  //       const sortedData = sortData(filteredData, selectedData, "name")
  //       setActivities(sortedData)
  //       // setPaginatedActivities(
  //       //   // sortData(result, selectedData, "name").slice(page * rowCount, page * rowCount + rowCount)
  //       //   sortedData.slice(page * rowCount, page * rowCount + rowCount)
  //       // )
  //       fetchCommunityActivities().then(() => {
  //         const allActivities = [...sortedData, ...communityActivities]
  //         const filteredCommunityActivities = communityActivities.filter(activity =>
  //           !searchTxt ||
  //           activity.name?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
  //           activity.id?.toLowerCase().includes(searchTxt?.toLowerCase())
  //         )
  //         const combinedActivities = [...sortedData, ...filteredCommunityActivities]
  //         setPaginatedActivities(
  //           combinedActivities.slice(page * rowCount, page * rowCount + rowCount)
  //         )
  //       })
  //     setLoading(false)

  //     })
  //   } else {
  //     setActivities([])
  //     setPaginatedActivities([])
  //     setLoading(false)
  //   }
  //   setSelectedActivities([])
  // }

  const searchActivities = async (searchVal?: string) => {
    const searchTxt = searchVal ?? search
    const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    if (selectedData.length > 0) {
      setLoading(true)
      try {
        const activitiesData = await Service.getAll("activities")
        setAllActivities(activitiesData)

        let filteredData = activitiesData || []
        if (filterParam) {
          filteredData = filteredData.filter((factivity) => factivity.id === filterParam)
        } else if (!!searchTxt && searchTxt.trim().length > 0) {
          filteredData = filteredData.filter(
            (factivity) =>
              factivity.name?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
              factivity.id?.toLowerCase().includes(searchTxt?.toLowerCase())
          )
        }
        const sortedData = sortData(filteredData, selectedData, "name")
        setActivities(sortedData)
        const fetchedCommunityActivities = await fetchCommunityActivities()
        const filteredCommunityActivities = fetchedCommunityActivities.filter(
          (activity) =>
            !searchTxt ||
            activity.name?.toLowerCase().includes(searchTxt?.toLowerCase()) ||
            activity.id?.toLowerCase().includes(searchTxt?.toLowerCase())
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
    const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    const combinedActivities = [...activities, ...communityActivities]
    setPaginatedActivities(
      sortData(combinedActivities, selectedData, "name").slice(page * rowCount, page * rowCount + rowCount)
    )
    setLoading(false)
  }

  const handleUpdateActivity = async (activityId, updatedActivity) => {
    try {
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
  const [versionHistoryActivity, setVersionHistoryActivity] = useState(null)

  const [columns, setColumns] = useState<TableColumn[]>([
    { id: "id", label: "ID", value: (a) => a.id, visible: false, sortable: false },
    { id: "name", label: "Name", value: (a) => a.name, visible: true, sortable: true },
    { id: "type", label: "Type", value: (a) => a.spec, visible: true, sortable: true },
    { id: "creator", label: "Creator", value: (a) => a.creator, visible: true, sortable: true },
    { id: "createdAt", label: "Created At", value: (a) => formatDate(a.createdAt), visible: true, sortable: true },
    { id: "version", label: "Version", value: (a) => a.currentVersion?.name || "v1", visible: true, sortable: false },
    // { id: 'schedule', label: 'Schedule',
    //   value: (a) => formatSchedule(a.schedule),
    //   visible: true
    // },
    { id: "groups", label: "Groups", value: (a) => a.groups?.join(", ") || "-", visible: true, sortable: false },
    {
      id: "study",
      label: "Study",
      value: (a) => ({
        name: a.study_name,
        id: a.study_id,
      }),
      visible: true,
      sortable: true,
    },
    // { id: 'studyId', label: 'Study', value: (a) => a.study_id, visible: true },
    { id: "device", label: "Device", value: (a) => a.device || "-", visible: false, sortable: true },
  ])

  const handleViewActivity = (activity) => {
    setViewingActivity(activity)
    setIsEditing(false)
    setTriggerSave(false)
  }

  const handleCloseViewActivity = () => {
    setViewingActivity(null)
    setIsEditing(false)
    setTriggerSave(false)
    // setActiveButton({ id: null, action: null });
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
    searchActivities()
  }

  const TableView = ({ activities, handleChange, researcherId, studies, selectedActivities, onActivityUpdate }) => {
    const modtabclasses = useModularTableStyles() // Using the modular table styles
    const tabclasses = useTableStyles()
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
    const calculateCategoryStartIndex = (activities) => {
      let startIndex = 0
      const indexMap = new Map()

      Object.entries(categorizeActivities(activities)).forEach(([category, items]) => {
        items.forEach((activity, idx) => {
          indexMap.set(activity.id, startIndex + idx + 1)
        })
        startIndex += items.length
      })

      return indexMap
    }

    const handleSort = (key) => {
      let direction = "asc"
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc"
      }
      setSortConfig({ key, direction })
    }
    const categorizeActivities = (activities) => {
      return {
        Custom: activities.filter((a) => !a.isCommunityActivity),
        Community: activities.filter((a) => a.isCommunityActivity),
        Core: activities.filter((a) => !a.isCommunityActivity && a.category === "core"),
      }
    }
    const activityIndexMap = calculateCategoryStartIndex(activities)
    const visibleColumns = React.useMemo(() => {
      return [
        { id: "index", label: "#", value: (a) => activityIndexMap[a.id] + 1, visible: true, sortable: true },
        ...columns.filter((column) => column.visible),
      ]
    }, [columns, activityIndexMap])
    const sortedActivities = React.useMemo(() => {
      if (!sortConfig.key) return activities
      if (sortConfig.key === "index") {
        const sortedByIndex = [...activities]
        if (sortConfig.direction === "desc") {
          return sortedByIndex.reverse()
        }
        return sortedByIndex
      }
      return [...activities].sort((a, b) => {
        const column = visibleColumns.find((col) => col.id === sortConfig.key)
        if (!column) return 0
        const aValue = column.value(a)
        const bValue = column.value(b)

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }, [activities, sortConfig])

    const categorizedActivities = categorizeActivities(sortedActivities)

    const SortIcon = ({ column }) => {
      if (!column.sortable) return null

      const isActive = sortConfig.key === column.id
      return (
        <IconButton className={tabclasses.sortButton} size="small" onClick={() => handleSort(column.id)}>
          {isActive ? (
            sortConfig.direction === "asc" ? (
              <ArrowUpwardIcon fontSize="small" />
            ) : (
              <ArrowDownwardIcon fontSize="small" />
            )
          ) : (
            <ArrowUpwardIcon fontSize="small" style={{ opacity: 0.3 }} />
          )}
        </IconButton>
      )
    }

    return (
      <TableContainer component={Paper} className={tabclasses.tableRoot}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedActivities.length > 0 && selectedActivities.length < activities.length}
                  checked={selectedActivities.length == activities.length}
                  onChange={handleSelectAllClick}
                  className={classes.checkboxActive}
                />
              </TableCell>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  className={`${tabclasses.headerCell}  ${column.sortable ? "sortable" : ""}`}
                  align={column.id === "index" ? "center" : "left"}
                >
                  <Box className={modtabclasses.columnHeader}>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <IconButton size="small" className={tabclasses.sortButton} onClick={() => handleSort(column.id)}>
                        {sortConfig.key === column.id ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUpwardIcon style={{ width: 15, height: 15 }} />
                          ) : (
                            <ArrowDownwardIcon style={{ width: 15, height: 15 }} />
                          )
                        ) : (
                          <ArrowUpwardIcon style={{ width: 15, height: 15, opacity: 0.3 }} />
                        )}
                      </IconButton>
                    )}
                    {/* <Box display="flex" alignItems="center">
                    {column.label}
                    <SortIcon column={column} /> */}
                  </Box>
                </TableCell>
              ))}
              <TableCell className={`${tabclasses.headerCell} sticky-right actionCell`}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(categorizedActivities).map(
              ([category, categoryActivities]) =>
                categoryActivities.length > 0 && (
                  <React.Fragment key={category}>
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + 1} className={modtabclasses.categoryHeader}>
                        <Typography variant="subtitle1">{category}</Typography>
                      </TableCell>
                    </TableRow>
                    {categoryActivities.map((activity, index) => (
                      <ActivityTableRow
                        key={activity.id}
                        activity={activity}
                        index={activityIndexMap.get(activity.id)}
                        visibleColumns={visibleColumns}
                        selectedActivities={selectedActivities}
                        handleChange={handleChange}
                        researcherId={researcherId}
                        studies={studies}
                        // onActivityUpdate={onActivityUpdate}
                        parentClasses={classes}
                        onActivityUpdate={handleUpdateActivity}
                        formatDate={formatDate}
                        setActivities={setActivities}
                        activities={activities}
                        searchActivities={searchActivities}
                        onViewActivity={handleViewActivity}
                      />
                    ))}
                  </React.Fragment>
                )
            )}
            {/* {activities?.map((activity) => (
              <ActivityTableRow
                key={activity.id}
                activity={activity}
                visibleColumns={columns.filter((c) => c.visible)}
                selectedActivities={selectedActivities}
                handleChange={handleChange}
                researcherId={researcherId}
                studies={studies}
                onActivityUpdate={handleUpdateActivity}
                formatDate={formatDate}
                setActivities={setActivities}
                activities={activities}
                searchActivities={searchActivities}
              />
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>
      // <div className={modtabclasses.scrollShadow} />
    )
  }

  useEffect(() => {
    if (filterParam) {
      console.log("Filter param changed:", filterParam)
      setSearch(null)
      searchActivities()
    }
  }, [filterParam])
  // useEffect(() => {
  //   if ((selected || []).length > 0) {
  //     searchActivities()
  //     fetchCommunityActivities()
  //   } else {
  //     setActivities([])
  //     setCommunityActivities([])
  //     setLoading(false)
  //   }
  // }, [selected])

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || activities === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {viewingActivity ? (
        <ItemViewHeader
          ItemTitle="Activity"
          ItemName={viewingActivity.name}
          // ItemCategory={viewingActivity.isCommunityActivity}
          searchData={handleSearchData}
          authType={props.authType}
          onEdit={handleEditActivity}
          onSave={() => {
            if (isEditing) {
              handleSaveActivity()
            }
          }}
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
          disabledBtns={viewingActivity.isCommunityActivity}
        />
      ) : (
        <Header
          studies={studies}
          researcherId={researcherId}
          activities={allActivities}
          selectedActivities={selectedActivities}
          searchData={handleSearchData}
          selectedStudies={selected}
          setSelectedStudies={setSelectedStudies}
          setActivities={searchActivities}
          setOrder={setOrder}
          order={order}
          title={props.ptitle}
          authType={props.authType}
          onLogout={props.onLogout}
          onViewModechanged={setViewMode}
          viewMode={viewMode}
          VisibleColumns={columns}
          setVisibleColumns={setColumns}
        />
      )}
      <Box
        className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
        style={{ overflowX: "hidden" }}
      >
        {viewingActivity ? (
          <ActivityDetailItem
            activity={viewingActivity}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            studies={studies}
            triggerSave={triggerSave}
          />
        ) : (
          <>
            {!!activities && activities.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <>
                    <Grid container spacing={3}>
                      <Grid container spacing={3} xs={12}>
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
                              onActivityUpdate={handleUpdateActivity}
                              formatDate={formatDate}
                              searchActivities={searchActivities}
                              onViewActivity={handleViewActivity}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <Pagination
                        data={[...activities, ...communityActivities]}
                        updatePage={handleChangePage}
                        rowPerPage={[20, 40, 60, 80]}
                        currentPage={page}
                        currentRowCount={rowCount}
                      />
                    </Grid>
                  </>
                ) : (
                  <TableView
                    activities={[...activities, ...communityActivities]}
                    handleChange={handleChange}
                    selectedActivities={selectedActivities}
                    researcherId={researcherId}
                    studies={studies}
                    onActivityUpdate={handleUpdateActivity}
                  />
                )}
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
      <Dialog open={!!versionHistoryActivity} onClose={() => setVersionHistoryActivity(null)} maxWidth="md" fullWidth>
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
      </Dialog>
    </React.Fragment>
  )
}
