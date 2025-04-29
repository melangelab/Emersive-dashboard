import React, { useState, useMemo, useEffect } from "react"
import ModularTable, { ColumnConfig } from "./ModularTable"
import {
  Box,
  FormControl,
  Icon,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../../icons/NewIcons/floppy-disks-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/copy.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/copy-filled.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { useSnackbar } from "notistack"
import { useModularTableStyles } from "../Studies/Index"
import LAMP from "lamp-core"
import DetailModal from "./DetailModal"
import { sensorConstraints } from "./SensorDialog"
import { set } from "date-fns"

export interface SensorTableProps {
  sensors: any[]
  selectedSensors: any[]
  handleChange: (sensor: any, checked: boolean) => void
  formatDate: (date: any) => string
  onViewSensor: (sensor: any) => void
  onEditSensor: (sensor: any) => void
  onSaveSensor: (sensor: any) => void
  onCopySensor: (sensor: any) => void
  onDeleteSensor: (sensor: any) => void
  visibleColumns?: string[]
  setVisibleColumns?: (columns: string[]) => void
  editingSensor?: any
  onCellValueChange?: (sensorId: string, field: string, value: any) => void
  editableColumns?: string[]
  activeButton: any
  setActiveButton: any
  mode?: string
}

const SensorTable: React.FC<SensorTableProps> = ({
  sensors,
  selectedSensors,
  handleChange,
  formatDate,
  onViewSensor,
  onEditSensor,
  onCopySensor,
  onDeleteSensor,
  onSaveSensor,
  visibleColumns,
  setVisibleColumns,
  editingSensor,
  mode,
  onCellValueChange,
  editableColumns,
  activeButton,
  setActiveButton,
}) => {
  const theme = useTheme()
  const mtstyles = useModularTableStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [sensorSpecs, setSensorSpecs] = useState([])
  const [timeSettings, setTimeSettings] = useState({
    start_time: null,
    end_time: null,
  })
  const [editingSensorFrequency, setEditingSensorFrequency] = useState(null)
  const [editingSensorDuration, setEditingSensorDuration] = useState(null)
  const [editingCellSensorSpec, setEditingCellSensorSpec] = useState(null)

  useEffect(() => {
    if (!sensorSpecs.length || editingSensor) {
      LAMP.SensorSpec.all().then((res) => {
        setSensorSpecs(res)
      })
    }
    if (editingSensor) {
      setTimeSettings({
        start_time: editingSensor.settings?.data_collection_timeperiod?.start_time || null,
        end_time: editingSensor.settings?.data_collection_timeperiod?.end_time || null,
      })
    }
  }, [editingSensor])

  const handleSensorSpecChange = (sensorId, specId) => {
    const selectedSpec = sensorSpecs.find((spec) => spec.id === specId)
    onCellValueChange(sensorId, "spec", specId)
    if (selectedSpec && selectedSpec.settings_schema) {
      const defaultSettings = selectedSpec.settings_schema || {}
      onCellValueChange(sensorId, "settings", defaultSettings)
    }
  }

  const isConstraintsSatisfied = () => {
    if (!editingCellSensorSpec || !sensorConstraints[editingCellSensorSpec]) return true
    if (!editingSensorFrequency) return true
    const constraints = sensorConstraints[editingCellSensorSpec]
    const frequency = editingSensorFrequency || 1

    if (constraints.min !== null && frequency < constraints.min) return false
    if (constraints.max !== null && frequency > constraints.max) return false
    return true
  }

  const isDurationConstraintsSatisfied = () => {
    if (!editingCellSensorSpec || !sensorConstraints[editingCellSensorSpec]) return true

    if (!editingSensorDuration) return true
    const constraints = sensorConstraints[editingCellSensorSpec]
    const duration = editingSensorDuration || 0.1

    // if (constraints.min !== null && duration > 1 / (constraints.min*60)) return false
    if (constraints.max !== null && duration < 1 / (constraints.max * 60)) return false
    return true
  }

  const allColumns: ColumnConfig[] = useMemo(
    () => [
      {
        id: "index",
        label: "#",
        getValue: (sensor) => 0, // filled by itemIndices
        visible: true,
        sortable: true,
        renderCell: (sensor) => <span style={{ fontWeight: 500, textAlign: "center", display: "block" }}></span>,
      },
      {
        id: "name",
        label: "Name",
        getValue: (sensor) => sensor.name,
        visible: true,
        sortable: true,
        renderCell: (sensor) =>
          mode == "edit" && editingSensor && editingSensor.id === sensor.id && editableColumns?.includes("name") ? (
            <input
              type="text"
              defaultValue={sensor.name}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              onChange={(e) => onCellValueChange(sensor.id, "name", e.target.value)}
            />
          ) : (
            <Box
              style={{
                cursor: "copy",
                fontWeight: 500,
                color: "#215F9A",
              }}
              onClick={() => {
                window.navigator?.clipboard?.writeText?.(sensor.id)
                enqueueSnackbar("ID copied to clipboard", {
                  variant: "success",
                  autoHideDuration: 1000,
                })
              }}
            >
              {sensor.name}
            </Box>
          ),
      },
      {
        id: "id",
        label: "ID",
        getValue: (sensor) => sensor.id,
        visible: true,
        sortable: false,
        renderCell: (sensor) => sensor.id,
      },
      {
        id: "spec",
        label: "Sensor Type",
        getValue: (sensor) => sensor.spec,
        visible: true,
        sortable: true,
        renderCell: (sensor) =>
          mode == "edit" && editingSensor && editingSensor.id === sensor.id && editableColumns?.includes("spec") ? (
            <FormControl fullWidth variant="outlined" size="small">
              <Select
                value={sensor.spec}
                onChange={(e) => handleSensorSpecChange(sensor.id, e.target.value)}
                fullWidth
                style={{ minWidth: "150px" }}
              >
                {sensorSpecs.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id}>
                    {spec.id.replace("lamp.", "")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            sensor.spec
          ),
      },

      {
        id: "settings",
        label: "Settings",
        getValue: (sensor) => {
          if (!sensor.settings || Object.keys(sensor.settings).length === 0) {
            return "Default"
          }
          const settingsString = Object.entries(sensor.settings)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
          return settingsString
          // return JSON.stringify(sensor.settings).substring(0, 30) + "..."
        },
        visible: true,
        sortable: false,
        renderCell: (sensor) =>
          mode == "edit" && editingSensor && editingSensor.id === sensor.id && editableColumns?.includes("settings") ? (
            <Box sx={{ width: "100%", padding: "8px" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box sx={{ width: "40%", fontWeight: 500 }}>Frequency(Hz):</Box>
                {editingCellSensorSpec && sensorConstraints[editingCellSensorSpec] && (
                  <Tooltip
                    title={
                      <Box p={1}>
                        <Typography variant="body2">Constraints:</Typography>
                        <Typography variant="body2">
                          {sensorConstraints[editingCellSensorSpec].min !== null &&
                            `Min: ${sensorConstraints[editingCellSensorSpec].min}`}
                          {sensorConstraints[editingCellSensorSpec].min !== null &&
                            sensorConstraints[editingCellSensorSpec].max !== null &&
                            " | "}
                          {sensorConstraints[editingCellSensorSpec].max !== null &&
                            `Max: ${sensorConstraints[editingCellSensorSpec].max}`}
                        </Typography>
                      </Box>
                    }
                    style={{ marginLeft: "10px" }}
                    placement="right"
                  >
                    <IconButton size="small">
                      <Icon>info</Icon>
                    </IconButton>
                  </Tooltip>
                )}
                {/* <div style={{ display:"flex" }}> */}
                <TextField
                  type="number"
                  size="small"
                  variant="outlined"
                  inputProps={{ inputMode: "decimal", min: 0, step: 0.01, style: { appearance: "textfield" } }}
                  defaultValue={sensor.settings?.frequency}
                  error={!isConstraintsSatisfied()}
                  // className=""
                  style={{
                    width: "40%",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginLeft: "auto",
                  }}
                  onChange={(e) => {
                    let freq = null
                    if (typeof e.target.value === "string") {
                      freq = parseFloat(e.target.value)
                    }
                    const newSettings = { ...sensor.settings, frequency: freq }
                    setEditingSensorFrequency(freq)
                    onCellValueChange(sensor.id, "settings", newSettings)
                  }}
                  helperText={
                    !isConstraintsSatisfied()
                      ? `Frequency must be ${
                          sensorConstraints[editingCellSensorSpec]?.min !== null
                            ? `>= ${sensorConstraints[editingCellSensorSpec]?.min}`
                            : ""
                        }${
                          sensorConstraints[editingCellSensorSpec]?.min !== null &&
                          sensorConstraints[editingCellSensorSpec]?.max !== null
                            ? " and "
                            : ""
                        }${
                          sensorConstraints[editingCellSensorSpec]?.max !== null
                            ? `<= ${sensorConstraints[editingCellSensorSpec]?.max}`
                            : ""
                        }`
                      : ""
                  }
                />
                {/* </div> */}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box sx={{ width: "40%", fontWeight: 500 }}>Data Collection Duration(mins):</Box>
                {editingCellSensorSpec && sensorConstraints[editingCellSensorSpec] && (
                  <Tooltip
                    title={
                      <Box p={1}>
                        <Typography variant="body2">Value Range:</Typography>
                        <Typography variant="body2">
                          {sensorConstraints[editingCellSensorSpec].max !== null &&
                            `Min: ${Math.round((1 / sensorConstraints[editingCellSensorSpec].max / 60) * 1000) / 1000}`}
                          {/* {sensorConstraints[editingCellSensorSpec].min !== null &&
                            sensorConstraints[editingCellSensorSpec].max !== null &&
                            " | "}
                          {sensorConstraints[editingCellSensorSpec].min !== null &&
                            `Max: ${Math.round(((1 / sensorConstraints[editingCellSensorSpec].min)/60) * 1000) / 1000}`} */}
                        </Typography>
                      </Box>
                    }
                    style={{ marginLeft: "10px" }}
                    placement="right"
                  >
                    <IconButton size="small">
                      <Icon>info</Icon>
                    </IconButton>
                  </Tooltip>
                )}
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  defaultValue={sensor.settings?.data_collection_duration}
                  inputProps={{ inputMode: "decimal", min: 0, step: 1, style: { appearance: "textfield" } }}
                  error={!isDurationConstraintsSatisfied()}
                  style={{
                    width: "40%",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginLeft: "auto",
                  }}
                  onChange={(e) => {
                    let duration = null
                    if (typeof e.target.value === "string") {
                      duration = parseFloat(e.target.value)
                    }
                    const newSettings = { ...sensor.settings, data_collection_duration: duration }
                    onCellValueChange(sensor.id, "settings", newSettings)
                    setEditingSensorDuration(duration)
                  }}
                  helperText={
                    !isDurationConstraintsSatisfied()
                      ? `Duration must be ${
                          sensorConstraints[editingCellSensorSpec]?.max !== null
                            ? `>= ${Math.round((1 / sensorConstraints[editingCellSensorSpec].max / 60) * 1000) / 1000}`
                            : ""
                        }`
                      : ""
                  }
                />
                {/* </div> */}
              </Box>
              <Box sx={{ fontWeight: 500 }}>Data Collection Timeperiod:</Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "50%" }}>
                  <input
                    type="time"
                    defaultValue={sensor.settings?.data_collection_timeperiod?.start_time ?? null}
                    style={{
                      width: "100%",
                      padding: "4px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    onChange={(e) => {
                      const start_time = e.target.value || null
                      setTimeSettings((prev) => ({
                        ...prev,
                        start_time,
                        end_time: prev.end_time || sensor.settings?.data_collection_timeperiod?.end_time,
                      }))

                      const newSettings = {
                        ...sensor.settings,
                        data_collection_timeperiod: {
                          start_time,
                          end_time: timeSettings.end_time || sensor.settings?.data_collection_timeperiod?.end_time,
                        },
                      }
                      onCellValueChange(sensor.id, "settings", newSettings)
                    }}
                  />
                </Box>
                <Box sx={{ width: "50%" }}>
                  <input
                    type="time"
                    defaultValue={sensor.settings?.data_collection_timeperiod?.end_time}
                    style={{
                      width: "100%",
                      padding: "4px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    onChange={(e) => {
                      const end_time = e.target.value || null
                      setTimeSettings((prev) => ({
                        ...prev,
                        end_time,
                        start_time: prev.start_time || sensor.settings?.data_collection_timeperiod?.start_time,
                      }))

                      const newSettings = {
                        ...sensor.settings,
                        data_collection_timeperiod: {
                          start_time:
                            timeSettings.start_time || sensor.settings?.data_collection_timeperiod?.start_time,
                          end_time,
                        },
                      }
                      onCellValueChange(sensor.id, "settings", newSettings)
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              style={{
                cursor: "pointer",
                color: "#215F9A",
              }}
              onClick={(e) => {
                e.stopPropagation()
                setDetailModal({
                  open: true,
                  title: `Settings for ${sensor.name}`,
                  content: sensor.settings || {},
                  contentType: "json",
                })
              }}
            >
              {!sensor.settings || Object.keys(sensor.settings).length === 0
                ? "Default"
                : JSON.stringify(sensor.settings).substring(0, 30) + "..."}
            </Box>
          ),
      },
      {
        id: "study_name",
        label: "Study",
        getValue: (sensor) => sensor.study_name || "Not assigned",
        visible: true,
        sortable: true,
        renderCell: (sensor) => (
          <Box
            style={{
              cursor: "copy",
              fontWeight: 500,
              color: "#215F9A",
            }}
            onClick={() => {
              window.navigator?.clipboard?.writeText?.(sensor.study_id)
              enqueueSnackbar("Study ID copied to clipboard", {
                variant: "success",
                autoHideDuration: 1000,
              })
            }}
          >
            {sensor.study_name || "Not assigned"}
          </Box>
        ),
      },
      {
        id: "study_id",
        label: "Study",
        getValue: (sensor) => sensor.study_id,
        visible: true,
        sortable: true,
        renderCell: (sensor) => sensor.study_id,
      },
      {
        id: "group",
        label: "Group",
        getValue: (sensor) => sensor.group || "-",
        visible: true,
        sortable: true,
      },
      {
        id: "statusInUsers",
        label: "Status in Participants",
        getValue: (sensor) => {
          if (!sensor.statusInUsers || sensor.statusInUsers.length === 0) {
            return "Not used"
          }
          return `Used by ${sensor.statusInUsers.length} participant(s)`
        },
        visible: true,
        sortable: false,
        renderCell: (sensor) => (
          <Box
            style={{
              cursor: "pointer",
              color: "#215F9A",
            }}
            onClick={(e) => {
              e.stopPropagation()
              setDetailModal({
                open: true,
                title: `Participants using ${sensor.name}`,
                content: sensor.statusInUsers || [],
                contentType: "participants",
              })
            }}
          >
            {!sensor.statusInUsers || sensor.statusInUsers.length === 0
              ? "Not used"
              : `Used by ${sensor.statusInUsers.length} participant(s)`}
          </Box>
        ),
      },
      {
        id: "studies",
        label: "Studies/Groups",
        getValue: (sensor) => {
          if (!sensor.studies || sensor.studies.length === 0) {
            return "-"
          }
          return `${sensor.studies.length} studies`
        },
        visible: true,
        sortable: false,
        renderCell: (sensor) => (
          <Box
            style={{
              cursor: "pointer",
              color: "#215F9A",
            }}
            onClick={(e) => {
              e.stopPropagation()
              setDetailModal({
                open: true,
                title: `Studies associated with ${sensor.name}`,
                content: sensor.studies || [],
                contentType: "studies",
              })
            }}
          >
            {!sensor.studies || sensor.studies.length === 0 ? "-" : `${sensor.studies.length} studies`}
          </Box>
        ),
      },
    ],
    [enqueueSnackbar, editingSensor, editableColumns, sensorSpecs]
  )

  const columns = useMemo(() => {
    if (visibleColumns) {
      return allColumns
        .map((col) => ({
          ...col,
          visible: visibleColumns.includes(col.id) || col.id == "index",
        }))
        .filter((col) => col.visible)
    }
    return allColumns.filter((col) => col.visible)
  }, [allColumns, visibleColumns, editingSensor])

  const categorizeSensors = (sensors) => {
    return {
      Custom: sensors.filter((s) => !s.isCommunity && !s.spec?.startsWith("lamp.")),
      Community: sensors.filter((s) => s.isCommunity),
      Core: sensors.filter((s) => !s.isCommunity && s.spec?.startsWith("lamp.")),
    }
  }

  // Action buttons for sensors
  const sensorActions = (sensor) => {
    return (
      <>
        {sensor.isCommunity ? (
          // Community sensor actions
          <>
            {activeButton.id === sensor.id && activeButton.action === "view" ? (
              <ViewFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "view" })
                  onViewSensor(sensor)
                }}
              />
            ) : (
              <ViewIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "view" })
                  onViewSensor(sensor)
                }}
              />
            )}

            {activeButton.id === sensor.id && activeButton.action === "copy" ? (
              <CopyFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "copy" })
                  onCopySensor(sensor)
                }}
              />
            ) : (
              <CopyIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "copy" })
                  onCopySensor(sensor)
                }}
              />
            )}
          </>
        ) : (
          // Custom sensor actions
          <>
            {activeButton.id === sensor.id && activeButton.action === "view" ? (
              <ViewFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "view" })
                  onViewSensor(sensor)
                }}
              />
            ) : (
              <ViewIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "view" })
                  onViewSensor(sensor)
                }}
              />
            )}

            {activeButton.id === sensor.id && activeButton.action === "edit" ? (
              <EditFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: null, action: null })
                  setEditingCellSensorSpec(null)
                  setEditingSensorDuration(null)
                  setEditingSensorFrequency(null)
                  onEditSensor(sensor)
                  // setEditingCellSensorSpec(sensor.spec)
                }}
              />
            ) : (
              <EditIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "edit" })
                  onEditSensor(sensor)
                  setEditingCellSensorSpec(sensor.spec)
                }}
              />
            )}

            {activeButton.id === sensor.id && activeButton.action === "save" ? (
              <SaveFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "save" })
                  onSaveSensor(sensor)
                }}
              />
            ) : (
              <SaveIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "save" })
                  onSaveSensor(sensor)
                }}
              />
            )}

            {activeButton.id === sensor.id && activeButton.action === "copy" ? (
              <CopyFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "copy" })
                  onCopySensor(sensor)
                }}
              />
            ) : (
              <CopyIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "copy" })
                  onCopySensor(sensor)
                }}
              />
            )}

            {activeButton.id === sensor.id && activeButton.action === "delete" ? (
              <DeleteFilledIcon
                className={`${mtstyles.actionIcon} active`}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "delete" })
                  onDeleteSensor(sensor)
                }}
              />
            ) : (
              <DeleteIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "delete" })
                  onDeleteSensor(sensor)
                }}
              />
            )}
          </>
        )}
      </>
    )
  }
  const [detailModal, setDetailModal] = useState({
    open: false,
    title: "",
    content: null,
    contentType: "json" as "json" | "participants" | "studies",
  })

  return (
    <>
      <ModularTable
        data={sensors}
        columns={columns}
        selectedItems={selectedSensors}
        onSelectionChange={handleChange}
        actions={sensorActions}
        getItemKey={(sensor) => sensor.id}
        categorizeItems={categorizeSensors}
        emptyStateMessage="No sensors found"
      />
      <DetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ ...detailModal, open: false })}
        title={detailModal.title}
        content={detailModal.content}
        contentType={detailModal.contentType}
      />
    </>
  )
}

export default SensorTable
