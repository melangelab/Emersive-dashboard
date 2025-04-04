import React, { useState, useMemo, useEffect } from "react"
import ModularTable, { ColumnConfig } from "./ModularTable"
import { Box, FormControl, MenuItem, Select, useTheme } from "@material-ui/core"
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

  useEffect(() => {
    if (!sensorSpecs.length || editingSensor) {
      LAMP.SensorSpec.all().then((res) => {
        setSensorSpecs(res)
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
          return JSON.stringify(sensor.settings).substring(0, 30) + "..."
        },
        visible: true,
        sortable: false,
        renderCell: (sensor) =>
          mode == "edit" && editingSensor && editingSensor.id === sensor.id && editableColumns?.includes("settings") ? (
            <textarea
              defaultValue={JSON.stringify(sensor.settings || {}, null, 2)}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minHeight: "60px",
              }}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  onCellValueChange(sensor.id, "settings", parsed)
                } catch (error) {
                  console.error("Invalid JSON:", error)
                }
              }}
            />
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
                  setActiveButton({ id: sensor.id, action: "edit" })
                  onEditSensor(sensor)
                }}
              />
            ) : (
              <EditIcon
                className={mtstyles.actionIcon}
                onClick={() => {
                  setActiveButton({ id: sensor.id, action: "edit" })
                  onEditSensor(sensor)
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
