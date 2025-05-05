import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Grid,
  Icon,
  Backdrop,
  CircularProgress,
  makeStyles,
  Theme,
  createStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import LAMP, { Sensor } from "lamp-core"
import SensorListItem from "./SensorListItem"
import { Service } from "../../DBService/DBService"
import { sortData } from "../Dashboard"
import Pagination from "../../PaginatedElement"
import useInterval from "../../useInterval"
import { useLayoutStyles } from "../../GlobalStyles"
import DynamicTableSensors, { ColumnConfig } from "./DynamicTableSensors"
import { formatDate, useQuery } from "../../Utils"
import { TableColumn } from "../ParticipantList/Index"
import ItemViewHeader from "../SharedStyles/ItemViewHeader"
import SensorDetailView from "./SensorDetailView"
import SensorTable from "./SensorTable"
import { useSnackbar } from "notistack"
import SensorDialog from "./SensorDialog"
import CopySensor from "./CopySensor"
import ConfirmationDialog from "../../ConfirmationDialog"
import SensorChangesConfirmationSlide from "./SensorChangesConfirmationSlide"
import SensorDetailItem from "./SensorDetailItem"
import { fetchGetData } from "../SaveResearcherData"
import { ACCESS_LEVELS, getResearcherAccessLevel } from "../Studies/Index"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
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
      zIndex: 1111,
      color: "#fff",
    },
    norecordsmain: {
      minHeight: "calc(100% - 114px)",
      position: "absolute",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
  })
)

export const getSensorAccessLevel = (sensor, studies, researcherId, sharedStudies = []) => {
  if (!sensor.isShared) return ACCESS_LEVELS.ALL // Owner has full rights
  const sensorStudyId = sensor.study_id
  let sensorStudy = studies.find((study) => study.id === sensorStudyId)
  if (!sensorStudy && Array.isArray(sharedStudies)) {
    sensorStudy = sharedStudies.find((study) => study.id === sensorStudyId)
  }
  if (!sensorStudy) {
    console.log("Study not found for sensor", sensor.id, sensorStudyId)
    return ACCESS_LEVELS.VIEW
  }
  const accessLevel = getResearcherAccessLevel(sensorStudy, researcherId)
  return accessLevel
}

export const canEditSensor = (sensor, studies, researcherId, sharedStudies = []) => {
  if (!sensor.isShared) return true // Owner has full rights
  const accessLevel = getSensorAccessLevel(sensor, studies, researcherId, sharedStudies)
  return accessLevel === ACCESS_LEVELS.EDIT || accessLevel === ACCESS_LEVELS.ALL
}

export const canViewSensor = (sensor, studies, researcherId, sharedStudies = []) => {
  if (!sensor.isShared) return true // Owner has full rights
  const accessLevel = getSensorAccessLevel(sensor, studies, researcherId, sharedStudies)
  return accessLevel >= ACCESS_LEVELS.VIEW
}

export default function SensorsList({
  title,
  researcherId,
  studies,
  selectedStudies,
  setSelectedStudies,
  setOrder,
  getAllStudies,
  order,
  authType,
  ptitle,
  goBack,
  onLogout,
  ...props
}: {
  title?: string
  researcherId?: string
  studies: Array<any>
  selectedStudies: Array<any>
  setSelectedStudies?: Function
  getAllStudies?: Function
  setOrder?: Function
  order?: boolean
  authType?: string
  ptitle?: string
  goBack?: () => void
  onLogout?: () => void
  [key: string]: any
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [sensors, setSensors] = useState(null)
  const [selectedSensors, setSelectedSensors] = useState([])
  const [paginatedSensors, setPaginatedSensors] = useState([])
  const [selected, setSelected] = useState(selectedStudies)
  const [rowCount, setRowCount] = useState(40)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(null)
  const layoutClasses = useLayoutStyles()
  const query = useQuery()
  const filterParam = query.get("filter")
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [allresearchers, setAllResearchers] = useState([])

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
    },
    studies !== null && (studies || []).length > 0 ? null : 2000,
    true
  )

  useEffect(() => {
    let params = JSON.parse(localStorage.getItem("sensors"))
    setPage(params?.page ?? 0)
    setRowCount(params?.rowCount ?? 40)
  }, [])

  useEffect(() => {
    if (selected !== selectedStudies) setSelected(selectedStudies)
  }, [selectedStudies])

  useEffect(() => {
    if ((selected || []).length > 0) {
      searchFilterSensors()
    } else {
      setSensors([])
      setLoading(false)
    }
  }, [selected])

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

  const handleChange = (sensorData, checked) => {
    if (checked) {
      setSelectedSensors((prevState) => [...prevState, sensorData])
    } else {
      let selected = selectedSensors.filter((item) => item.id != sensorData.id)
      setSelectedSensors(selected)
    }
  }

  const searchFilterSensors = (searchVal?: string) => {
    const searchTxt = searchVal ?? search
    // const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    const selectedstudiesData = selected.filter((o) => studies.some(({ name }) => o === name))
    const selectedsharedData = props.sharedstudies
      ? selected.filter((o) => props.sharedstudies?.some(({ name }) => o === name))
      : []
    const selectedData = [...selectedstudiesData, ...selectedsharedData]
    if (selectedData.length > 0) {
      setLoading(true)
      let result = []

      Service.getAll("sensors").then((sensorData) => {
        if ((sensorData || []).length > 0) {
          result = result.concat(sensorData)
          if (filterParam) {
            console.log("Filtering by sensor ID:", filterParam)
            result = result.filter((sensor) => sensor.id === filterParam)
          } else if (!!searchTxt && searchTxt.trim().length > 0) {
            result = result.filter((i) => i.name?.toLowerCase().includes(searchTxt?.toLowerCase()))
          }
          const sortedData = sortData(result, selectedData, "name")
          setSensors(sortedData)
          setPaginatedSensors(sortedData.slice(page * rowCount, page * rowCount + rowCount))
          setPage(page)
          setRowCount(rowCount)
        } else {
          setSensors([])
          setPaginatedSensors([])
        }
        setLoading(false)
      })
    } else {
      setSensors([])
      setPaginatedSensors([])
      setLoading(false)
    }
    setSelectedSensors([])
  }

  useEffect(() => {
    if (filterParam) {
      console.log("Filter param changed:", filterParam)
      setSearch(null)
      searchFilterSensors()
    }
  }, [filterParam])
  const handleSearchData = (val: string) => {
    setSearch(val)
    searchFilterSensors(val)
  }

  const handleChangePage = (page: number, rowCount: number) => {
    setLoading(true)
    setRowCount(rowCount)
    setPage(page)
    localStorage.setItem("sensors", JSON.stringify({ page: page, rowCount: rowCount }))
    const selectedData = selected.filter((o) => studies.some(({ name }) => o === name))
    setPaginatedSensors(sortData(sensors, selectedData, "name").slice(page * rowCount, page * rowCount + rowCount))
    setLoading(false)
  }

  const [columns, setColumns] = useState<TableColumn[]>([
    { id: "id", label: "ID", value: (p) => p.id, visible: false },
    { id: "name", label: "Name", value: (p) => p.name, visible: true },
    { id: "spec", label: "Sensor Type", value: (p) => p.spec, visible: true },
    { id: "settings", label: "Settings", value: (p) => p.settings, visible: true },
    { id: "study_id", label: "Study ID", value: (p) => p.study_id, visible: false },
    { id: "study_name", label: "Study", value: (p) => p.study_name, visible: true },
    { id: "group", label: "Group", value: (p) => p.group, visible: true },
    { id: "statusInUsers", label: "Status in Participants", value: (p) => p.statusInUsers, visible: true },
    { id: "studies", label: "Studies/Groups", value: (p) => p.studies, visible: true },
  ])

  // const columns = {
  //   id: "ID",
  //   name: "Name",
  //   spec: "Sensor Type",
  //   settings: "Settings",
  //   study_id: "Study ID",
  //   group: "Group",
  //   statusInUsers: "Status in participants",
  //   studies: "Studies/Groups",
  // }
  const selectedColumns = useMemo(() => columns.filter((col) => col.visible).map((col) => col.id), [columns])
  const columnsConfig = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.id] = col.label
      return acc
    }, {} as ColumnConfig)
  }, [columns])

  const handleRowClick = (sensor: Sensor) => {
    console.log("Researcher clicked:", sensor)
    // Handle row click
  }
  const [viewingSensor, setViewingSensor] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)

  const handleViewSensor = (sensor) => {
    setViewingSensor(sensor)
    setIsEditing(false)
    setTriggerSave(false)
    setActiveButton({ id: sensor.id, action: "view" })
  }

  const handleCloseViewSensor = () => {
    setViewingSensor(null)
    setIsEditing(false)
    setTriggerSave(false)
    setActiveButton({ id: null, action: null })
  }

  const handleEditSensor = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTriggerSave(false)
    }
  }

  const handleSaveSensor = () => {
    setTriggerSave(true)
  }

  const handleSaveComplete = (updatedSensor) => {
    setViewingSensor(updatedSensor)
    setIsEditing(false)
    setTriggerSave(false)
    searchFilterSensors()
  }

  const [sensorDialog, setSensorDialog] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState(0)
  const [copySensorOpen, setCopySensorOpen] = useState(false)
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [confirmationSlideOpen, setConfirmationSlideOpen] = useState(false)
  const [pendingChanges, setPendingChanges] = useState({})
  const [sensorToUpdate, setSensorToUpdate] = useState(null)
  const [editingSensor, setEditingSensor] = useState(null)
  const [RowMode, setRowMode] = useState(null)
  const [editedValues, setEditedValues] = useState({})
  const handleEditSensorRow = (sensor) => {
    if (editingSensor && editingSensor.id === sensor.id) {
      setRowMode("view")
      setEditingSensor(null)
      setEditedValues({})
      setActiveButton({ id: null, action: null })
    } else {
      setEditingSensor(sensor)
      setRowMode("edit")
      setEditedValues({})
      setActiveButton({ id: sensor.id, action: "edit" })
    }
  }

  const handleSaveSensorRow = async (sensor) => {
    if (Object.keys(editedValues).length > 0) {
      setSensorToUpdate(sensor)
      setPendingChanges({ ...editedValues })
      setConfirmationSlideOpen(true)
    } else {
      enqueueSnackbar(t("No changes to save"), { variant: "info" })
      setEditingSensor(null)
      setRowMode("view")
      setActiveButton({ id: null, action: null })
    }
  }

  const handleConfirmChanges = async () => {
    try {
      setLoading(true)

      const updatedSensor = { ...sensorToUpdate, ...pendingChanges }

      // Update the sensor in the backend
      await LAMP.Sensor.update(sensorToUpdate.id, updatedSensor)

      // Update in the local database
      await Service.updateMultipleKeys("sensors", { sensors: [updatedSensor] }, Object.keys(pendingChanges), "id")

      enqueueSnackbar(t("Sensor updated successfully"), { variant: "success" })

      // Refresh the sensors list
      searchFilterSensors()

      // Reset states
      setEditingSensor(null)
      setEditedValues({})
      setActiveButton({ id: null, action: null })
      setConfirmationSlideOpen(false)
      setSensorToUpdate(null)
      setPendingChanges({})
    } catch (error) {
      console.error("Error saving sensor:", error)
      enqueueSnackbar(t("Failed to update sensor"), { variant: "error" })
    } finally {
      setLoading(false)
      setRowMode("view")
    }
  }

  const handleCancelChanges = () => {
    setConfirmationSlideOpen(false)
    setSensorToUpdate(null)
    setPendingChanges({})
  }

  // const handleSaveSensorRow = async (sensor) => {
  //   try {
  //     setLoading(true);

  //     // Only update if there are changes
  //     if (Object.keys(editedValues).length > 0) {
  //       const updatedSensor = { ...sensor, ...editedValues };

  //       // Update the sensor in the backend
  //       await LAMP.Sensor.update(sensor.id, updatedSensor);

  //       // Update in the local database
  //       await Service.updateMultipleKeys(
  //         "sensors",
  //         { sensors: [updatedSensor] },
  //         Object.keys(editedValues),
  //         "id"
  //       );

  //       enqueueSnackbar("Sensor updated successfully", { variant: "success" });

  //       // Refresh the sensors list
  //       searchFilterSensors();
  //     }

  //     // Reset editing state
  //     setEditingSensor(null);
  //     setEditedValues({});
  //     setActiveButton({ id: null, action: null });
  //   } catch (error) {
  //     console.error("Error saving sensor:", error);
  //     enqueueSnackbar("Failed to update sensor", { variant: "error" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Add this handler for updating cell values
  const handleCellValueChange = (sensorId, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCopySensor = (sensor) => {
    setEditingSensor(sensor)
    setCopySensorOpen(true)
    setActiveButton({ id: sensor.id, action: "copy" })
  }

  const handleDeleteSensor = (sensor) => {
    setEditingSensor(sensor)
    setConfirmationDialog(5)
    setActiveButton({ id: sensor.id, action: "delete" })
  }

  const handleCloseCopyDialog = () => {
    setCopySensorOpen(false)
    setActiveButton({ id: null, action: null })
  }

  const confirmDelete = async (status) => {
    if (status === "Yes" && editingSensor) {
      try {
        setLoading(true)

        // Delete the sensor
        await LAMP.Sensor.delete(editingSensor.id).then((data: any) => {
          if (!data.error) {
            searchFilterSensors()

            if (editingSensor.study_id) {
              Service.getData("studies", editingSensor.study_id).then((studyData: any) => {
                Service.updateMultipleKeys(
                  "studies",
                  {
                    studies: [
                      {
                        id: editingSensor.study_id,
                        sensor_count: (studyData.sensor_count || 1) - 1,
                      },
                    ],
                  },
                  ["sensor_count"],
                  "id"
                )
              })
            }

            Service.delete("sensors", [editingSensor.id])
            enqueueSnackbar("Sensor deleted successfully", { variant: "success" })
          } else {
            enqueueSnackbar("Failed to delete sensor", { variant: "error" })
          }
        })
      } catch (error) {
        console.error("Error deleting sensor:", error)
        enqueueSnackbar("An error occurred while deleting the sensor", { variant: "error" })
      } finally {
        setLoading(false)
        setActiveButton({ id: null, action: null })
        setConfirmationDialog(0)
        setEditingSensor(null)
      }
    } else {
      setConfirmationDialog(0)
      setActiveButton({ id: null, action: null })
    }
  }

  const addOrUpdateSensor = (updatedSensor?: any) => {
    setSensorDialog(false)
    searchFilterSensors()
    setActiveButton({ id: null, action: null })
    setEditingSensor(null)
  }

  return (
    <React.Fragment>
      {/* <Backdrop className={classes.backdrop} open={loading || sensors === null}>
        <CircularProgress color="inherit" />
      </Backdrop> */}
      {viewingSensor ? (
        <ItemViewHeader
          ItemTitle="Sensor"
          ItemName={viewingSensor.name}
          searchData={handleSearchData}
          authType={authType}
          onEdit={handleEditSensor}
          onSave={() => {
            if (isEditing) {
              handleSaveSensor()
            }
          }}
          onPrevious={() => {
            const currentIndex = sensors.findIndex((s) => s.id === viewingSensor.id)
            if (currentIndex > 0) {
              setViewingSensor(sensors[currentIndex - 1])
            }
          }}
          onNext={() => {
            const currentIndex = sensors.findIndex((s) => s.id === viewingSensor.id)
            if (currentIndex < sensors.length - 1) {
              setViewingSensor(sensors[currentIndex + 1])
            }
          }}
          onClose={handleCloseViewSensor}
          disabledBtns={!canEditSensor(viewingSensor, studies, researcherId, props.sharedstudies)}
        />
      ) : (
        <Header
          studies={studies}
          researcherId={researcherId}
          selectedSensors={selectedSensors}
          searchData={handleSearchData}
          setSelectedStudies={setSelectedStudies}
          selectedStudies={selected}
          setSensors={searchFilterSensors}
          setOrder={setOrder}
          order={order}
          title={ptitle}
          authType={authType}
          onLogout={onLogout}
          onViewModechanged={setViewMode}
          viewMode={viewMode}
          VisibleColumns={columns}
          setVisibleColumns={setColumns}
          resemail={props.resemail}
        />
      )}
      <Box
        className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
        style={{ overflowX: "hidden" }}
      >
        {viewingSensor ? (
          <SensorDetailItem
            sensor={viewingSensor}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            studies={studies}
            triggerSave={triggerSave}
          />
        ) : (
          <>
            {sensors !== null && sensors.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <Grid container spacing={3}>
                    {(paginatedSensors ?? []).map((item, index) => (
                      <Grid item xs={12} sm={12} md={6} lg={5} key={item.id}>
                        <SensorListItem
                          sensor={item}
                          studies={studies}
                          handleSelectionChange={handleChange}
                          selectedSensors={selectedSensors}
                          setSensors={searchFilterSensors}
                          researcherId={researcherId}
                          formatDate={formatDate}
                          onViewSensor={handleViewSensor}
                          allresearchers={allresearchers}
                          sharedstudies={props.sharedstudies}
                        />
                      </Grid>
                    ))}
                    <Pagination
                      data={sensors}
                      updatePage={handleChangePage}
                      rowPerPage={[20, 40, 60, 80]}
                      currentPage={page}
                      currentRowCount={rowCount}
                    />
                  </Grid>
                ) : (
                  <>
                    <SensorTable
                      sensors={sensors}
                      selectedSensors={selectedSensors}
                      handleChange={(sensor, checked) => handleChange(sensor, checked)}
                      formatDate={formatDate}
                      onViewSensor={handleViewSensor}
                      onEditSensor={handleEditSensorRow}
                      onSaveSensor={handleSaveSensorRow}
                      onCopySensor={handleCopySensor}
                      onDeleteSensor={handleDeleteSensor}
                      visibleColumns={columns.filter((col) => col.visible).map((col) => col.id)}
                      setVisibleColumns={(newColumns) => {
                        setColumns((prevColumns) =>
                          prevColumns.map((col) => ({
                            ...col,
                            visible: newColumns.includes(col.id),
                          }))
                        )
                      }}
                      editingSensor={editingSensor}
                      mode={RowMode}
                      onCellValueChange={handleCellValueChange}
                      editableColumns={["name", "spec", "settings"]}
                      activeButton={activeButton}
                      setActiveButton={setActiveButton}
                      allresearchers={allresearchers}
                      sharedstudies={props.sharedstudies}
                      studies={studies}
                      researcherId={researcherId}
                    />
                    {editingSensor && (
                      <>
                        {/* <SensorDialog
                sensor={editingSensor}
                onclose={() => handleCloseSensorDialog()}
                studies={studies}
                open={sensorDialog}
                type="edit"
                studyId={editingSensor.study_id ?? null}
                addOrUpdateSensor={addOrUpdateSensor}
                allSensors={sensors || []}
              /> */}
                        <SensorChangesConfirmationSlide
                          open={confirmationSlideOpen}
                          originalSensor={sensorToUpdate || {}}
                          editedValues={pendingChanges}
                          onConfirm={handleConfirmChanges}
                          onCancel={handleCancelChanges}
                        />
                        <CopySensor
                          sensor={editingSensor}
                          studies={studies}
                          setSensors={searchFilterSensors}
                          open={copySensorOpen}
                          onclose={() => handleCloseCopyDialog()}
                          studyId={editingSensor.study_id ?? null}
                          allSensors={sensors || []}
                        />

                        <ConfirmationDialog
                          confirmationDialog={confirmationDialog}
                          open={confirmationDialog === 5}
                          onClose={() => setConfirmationDialog(0)}
                          confirmAction={confirmDelete}
                          confirmationMsg={`Are you sure you want to delete ${editingSensor.name}?`}
                        />
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <Box className={classes.norecordsmain}>
                <Box display="flex" p={2} alignItems="center" className={classes.norecords}>
                  <Icon>info</Icon>
                  {`${t("No Sensors Found")}`}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </React.Fragment>
  )
}
