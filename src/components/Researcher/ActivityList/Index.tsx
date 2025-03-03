import React, { useState, useEffect } from "react"
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
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
    },
  })
)
interface TableColumn {
  id: string
  label: string
  value: (activity: any) => string | number | React.ReactNode
  visible: boolean
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
    { id: "id", label: "ID", value: (a) => a.id, visible: true },
    { id: "name", label: "Name", value: (a) => a.name, visible: true },
    { id: "type", label: "Type", value: (a) => a.spec, visible: true },
    { id: "creator", label: "Creator", value: (a) => a.creator, visible: true },
    { id: "createdAt", label: "Created At", value: (a) => formatDate(a.createdAt), visible: true },
    { id: "version", label: "Version", value: (a) => a.currentVersion?.name || "v1", visible: true },
    // { id: 'schedule', label: 'Schedule',
    //   value: (a) => formatSchedule(a.schedule),
    //   visible: true
    // },
    { id: "groups", label: "Groups", value: (a) => a.groups?.join(", ") || "-", visible: true },
    {
      id: "study",
      label: "Study",
      value: (a) => ({
        name: a.study_name,
        id: a.study_id,
      }),
      visible: true,
    },
    // { id: 'studyId', label: 'Study', value: (a) => a.study_id, visible: true },
    { id: "device", label: "Device", value: (a) => a.device || "-", visible: false },
  ])

  const ColumnSelector = ({ columns, setColumns }) => {
    return (
      <FormControl className={classes.columnSelector}>
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
                <Chip key={id} label={columns.find((c) => c.id === id)?.label} />
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
    )
  }
  const TableView = ({ activities, handleChange, researcherId, studies, selectedActivities, onActivityUpdate }) => (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <ColumnSelector columns={columns} setColumns={setColumns} />
      <TableContainer component={Paper} style={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedActivities.length > 0 && selectedActivities.length < paginatedActivities.length
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
            {activities?.map((activity) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
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
      />
      <Box
        className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
      >
        <Grid container spacing={3}>
          {!!activities && activities.length > 0 ? (
            <>
              {viewMode === "grid" ? (
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
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TableView
                  activities={paginatedActivities}
                  handleChange={handleChange}
                  selectedActivities={selectedActivities}
                  researcherId={researcherId}
                  studies={studies}
                  onActivityUpdate={handleUpdateActivity}
                />
              )}
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
