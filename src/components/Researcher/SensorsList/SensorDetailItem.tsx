import React, { useState, useEffect } from "react"
import {
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  TextField,
  Tooltip,
  IconButton,
  Icon,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import ViewItems, { FieldConfig, TabConfig } from "./ViewItems"
import EditIcon from "@material-ui/icons/Edit"
import { sensorConstraints } from "./SensorDialog"
import { slideStyles } from "../ParticipantList/AddButton"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      maxHeight: "300px",
      overflow: "auto",
      border: "1px solid rgba(224, 224, 224, 1)",
      borderRadius: 4,
    },
    table: {
      minWidth: 300,
    },
    tableCell: {
      fontSize: "0.875rem",
      padding: "8px 16px",
    },
    tableHeader: {
      fontWeight: 600,
      backgroundColor: "#f5f5f5",
    },
    codeBlock: {
      maxHeight: "300px",
      overflow: "auto",
      marginTop: theme.spacing(1),
      padding: theme.spacing(2),
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      fontFamily: "monospace",
      fontSize: "0.875rem",
    },
    developerInfoContainer: {
      marginTop: theme.spacing(1),
    },
    developerInfoItem: {
      marginBottom: theme.spacing(1.5),
    },
    infoLabel: {
      fontWeight: 600,
      display: "inline-block",
      width: "80px",
      fontSize: "0.875rem",
    },
    infoValue: {
      display: "inline-block",
      fontSize: "0.875rem",
    },
    tabContent: {
      padding: theme.spacing(2),
    },
    settingsField: {
      marginBottom: theme.spacing(2),
    },
    settingsContainer: {
      marginTop: theme.spacing(1),
    },
    readOnlyField: {
      backgroundColor: "#f5f5f5",
    },
    fieldLabel: {
      fontWeight: 500,
    },
    rootContainer: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  })
)

interface DeveloperInfo {
  version?: string
  versionNumber?: string
  userIp?: string
  sourceUrl?: string
  browser?: string
  device?: string
  user?: string
  status?: string
  submittedOn?: string
}

interface SensorDetailItemProps {
  sensor: any
  isEditing: boolean
  onSave: (updatedSensor: any) => void
  studies: Array<any>
  triggerSave?: boolean
}

const SensorDetailItem: React.FC<SensorDetailItemProps> = ({ sensor, isEditing, onSave, studies, triggerSave }) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  // Add state for developer info editing
  const [isDeveloperInfoEditing, setIsDeveloperInfoEditing] = useState(false)

  // Form state
  const [editedValues, setEditedValues] = useState<{
    name: string
    description: string
    spec: string
    group: string
    developer_info: DeveloperInfo
    settings: any
  }>({
    name: "",
    description: "",
    spec: "",
    group: "",
    developer_info: {},
    settings: {},
  })

  // Initialize form data
  useEffect(() => {
    setEditedValues({
      name: sensor?.name || "",
      description: sensor?.description || "",
      spec: sensor?.spec || "",
      group: sensor?.group || "",
      developer_info: sensor?.developer_info || {},
      settings: sensor?.settings || {},
    })

    // Load saved developer info from LAMP
    if (sensor?.id) {
      LAMP.Type.getAttachment(sensor.id, "emersive.sensor.developer_info")
        .then((res: any) => {
          if (res.error === undefined && res.data) {
            // Update the developer_info in the state
            setEditedValues((prevValues) => ({
              ...prevValues,
              developer_info: Array.isArray(res.data) ? res.data[0] : res.data,
            }))
            console.log("Loaded developer info:", res.data)
          }
        })
        .catch((err) => {
          console.error("Error loading developer info:", err)
          enqueueSnackbar(`Failed to load developer info: ${err.message}`, { variant: "error" })
        })

      LAMP.Type.getAttachment(sensor.id, "emersive.sensor.description")
        .then((res: any) => {
          if (res.error === undefined && res.data) {
            setEditedValues((prev) => ({
              ...prev,
              description: Array.isArray(res.data) ? res.data[0] : res.data,
            }))
          }
        })
        .catch((err) => {
          console.error("Error loading description:", err)
          enqueueSnackbar(`Failed to load description: ${err.message}`, { variant: "error" })
        })
    }
  }, [sensor])

  // Effect to handle save trigger from header
  useEffect(() => {
    if (triggerSave) {
      if (isEditing) {
        handleSave()
      }
      if (isDeveloperInfoEditing) {
        handleSaveDeveloperInfo()
      }
    }
  }, [triggerSave])
  const fetchUserIp = async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error("Error fetching IP:", error)
      return "Unavailable"
    }
  }
  const handleSaveDeveloperInfo = async () => {
    setLoading(true)
    try {
      // Only save source URL from user edits, other fields are auto-generated
      const currentDate = new Date().toISOString()
      const userip = await fetchUserIp()
      const developerInfo = {
        ...editedValues.developer_info,
        userIp: userip, // Keep existing or default
        browser: navigator.userAgent
          ? navigator.userAgent.match(/chrome|firefox|safari|edge|opera/i)?.[0] || "Chrome"
          : "Chrome",
        device:
          navigator.userAgent && /windows/i.test(navigator.userAgent)
            ? "Windows"
            : navigator.userAgent && /mac/i.test(navigator.userAgent)
            ? "Mac OS"
            : navigator.userAgent && /android/i.test(navigator.userAgent)
            ? "Android"
            : navigator.userAgent && /iphone|ipad/i.test(navigator.userAgent)
            ? "iOS"
            : "Windows",
        submittedOn: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
          new Date().getDate()
        ).padStart(2, "0")} ${String(new Date().getHours()).padStart(2, "0")}:${String(
          new Date().getMinutes()
        ).padStart(2, "0")}:${String(new Date().getSeconds()).padStart(2, "0")}`,
      }

      // Save developer info as an attachment
      await LAMP.Type.setAttachment(sensor.id, "me", "emersive.sensor.developer_info", developerInfo)

      await Service.updateMultipleKeys(
        "sensors",
        {
          sensors: [
            {
              id: sensor.id,
              developer_info: developerInfo,
            },
          ],
        },
        ["developer_info"],
        "id"
      )

      // Update the local state
      setEditedValues((prev) => ({
        ...prev,
        developer_info: developerInfo,
      }))

      enqueueSnackbar(t("Successfully updated developer info."), {
        variant: "success",
      })

      setIsDeveloperInfoEditing(false)
    } catch (error) {
      console.error("Error updating developer info:", error)
      enqueueSnackbar(t("An error occurred while updating the developer info."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (newStatus) => {
    setLoading(true)
    try {
      const developerInfo = {
        ...editedValues.developer_info,
        status: newStatus || "Read",
      }

      // Save developer info with updated status
      await LAMP.Type.setAttachment(sensor.id, "me", "emersive.sensor.developer_info", developerInfo)

      await Service.updateMultipleKeys(
        "sensors",
        {
          sensors: [
            {
              id: sensor.id,
              developer_info: developerInfo,
            },
          ],
        },
        ["developer_info"],
        "id"
      )

      // Update the local state
      setEditedValues((prev) => ({
        ...prev,
        developer_info: developerInfo,
      }))

      enqueueSnackbar(t("Status updated successfully."), {
        variant: "success",
      })
    } catch (error) {
      console.error("Error updating status:", error)
      enqueueSnackbar(t("An error occurred while updating the status."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await LAMP.Sensor.update(sensor.id, {
        name: editedValues.name.trim(),
        spec: editedValues.spec,
        description: editedValues.description,
        group: editedValues.group,
        settings: editedValues.settings,
      } as any)
      // Save developer info as an attachment
      await LAMP.Type.setAttachment(sensor.id, "me", "emersive.sensor.developer_info", editedValues.developer_info)
      await LAMP.Type.setAttachment(sensor.id, "me", "emersive.sensor.description", editedValues.description)

      await Service.updateMultipleKeys(
        "sensors",
        {
          sensors: [
            {
              id: sensor.id,
              name: editedValues.name.trim(),
              spec: editedValues.spec,
              description: editedValues.description,
              group: editedValues.group,
              developer_info: editedValues.developer_info,
              settings: editedValues.settings,
            },
          ],
        },
        ["name", "spec", "description", "group", "developer_info", "settings"],
        "id"
      )

      enqueueSnackbar(t("Successfully updated sensor."), {
        variant: "success",
      })

      onSave({
        ...sensor,
        name: editedValues.name.trim(),
        spec: editedValues.spec,
        description: editedValues.description,
        settings: editedValues.settings,
        group: editedValues.group,
        developer_info: editedValues.developer_info,
      })
    } catch (error) {
      console.error("Error updating sensor:", error)
      enqueueSnackbar(t("An error occurred while updating the sensor."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = (key, value) => {
    setEditedValues((prev) => {
      if (key === "data_collection_timeperiod") {
        return {
          ...prev,
          settings: {
            ...prev.settings,
            data_collection_timeperiod: {
              ...prev.settings.data_collection_timeperiod,
              ...value,
            },
          },
        }
      }

      return {
        ...prev,
        settings: {
          ...prev.settings,
          [key]: key === "frequency" ? Number(value) || 1 : value,
        },
      }
    })
  }
  // Define fields for the ViewItems component
  const fields: FieldConfig[] = [
    {
      id: "name",
      label: t("Name"),
      value: sensor?.name || "",
      editable: true,
    },
    {
      id: "description",
      label: t("Description"),
      value: editedValues?.description || "",
      editable: true,
      type: "multiline",
    },
    {
      id: "group",
      label: t("Group Name"),
      value: sensor?.group || "",
      editable: true,
    },
    {
      id: "study_name",
      label: t("Study Name"),
      value: sensor?.study_name || "",
      editable: false,
    },
    {
      id: "id",
      label: t("Sensor ID"),
      value: sensor?.id || "",
      editable: false,
    },
    {
      id: "spec",
      label: t("Sensor Type"),
      value: sensor?.spec || "",
      editable: false,
    },
  ]

  // Create tab content for settings
  const SettingsContent = () => {
    const sensorSettings = editedValues.settings || {}
    const sliderclasses = slideStyles()

    const isConstraintsSatisfied = () => {
      if (!sensor.spec || !sensorConstraints[sensor.spec]) return true
      if (!sensorSettings?.frequency) return true
      const constraints = sensorConstraints[sensor.spec]
      const frequency = sensorSettings?.frequency || 1

      if (constraints.min !== null && frequency < constraints.min) return false
      if (constraints.max !== null && frequency > constraints.max) return false
      return true
    }

    const isDurationConstraintsSatisfied = () => {
      if (!sensor.spec || !sensorConstraints[sensor.spec]) return true

      if (!sensorSettings?.data_collection_duration) return true
      const constraints = sensorConstraints[sensor.spec]
      const duration = sensorSettings?.data_collection_duration || 0.1

      // if (constraints.min !== null && duration > 1 / (constraints.min*60)) return false
      if (constraints.max !== null && duration < 1 / (constraints.max * 60)) return false
      return true
    }

    return (
      <Box className={classes.tabContent}>
        <Box mt={4}>
          <Typography variant="subtitle1" className={sliderclasses.field}>
            {t("Sensor Settings")}
          </Typography>
          <Box p={2} mt={1} border="1px solid rgba(0, 0, 0, 0.12)" borderRadius="4px" bgcolor="rgba(0, 0, 0, 0.02)">
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="body2" style={{ fontWeight: 500, width: "40%" }}>
                {t("Frequency (Hz")}
              </Typography>
              {sensor.spec && sensorConstraints[sensor.spec] && (
                <Tooltip
                  title={
                    <Box p={1}>
                      <Typography variant="body2">Constraints:</Typography>
                      <Typography variant="body2">
                        {sensorConstraints[sensor.spec].min !== null && `Min: ${sensorConstraints[sensor.spec].min}`}
                        {sensorConstraints[sensor.spec].min !== null &&
                          sensorConstraints[sensor.spec].max !== null &&
                          " | "}
                        {sensorConstraints[sensor.spec].max !== null && `Max: ${sensorConstraints[sensor.spec].max}`}
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                style={{ marginLeft: "auto", width: "50%" }}
              >
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  inputProps={{
                    inputMode: "decimal",
                    min: 0,
                    step: 0.01,
                    style: { appearance: "textfield" },
                  }}
                  InputProps={{
                    classes: {
                      input: !isEditing ? classes.readOnlyField : undefined,
                    },
                    readOnly: !isEditing,
                  }}
                  error={!isConstraintsSatisfied()}
                  value={sensorSettings?.frequency}
                  onChange={(e) => {
                    let freq = null
                    if (typeof e.target.value === "string") {
                      freq = parseFloat(e.target.value)
                    }
                    handleSettingsChange("frequency", freq)
                  }}
                  placeholder={t("Enter frequency")}
                  style={{ width: "100%" }}
                  className={classes.settingsField}
                  helperText={
                    !isConstraintsSatisfied()
                      ? `Frequency must be ${
                          sensorConstraints[sensor.spec]?.min !== null
                            ? `>= ${sensorConstraints[sensor.spec]?.min}`
                            : ""
                        }${
                          sensorConstraints[sensor.spec]?.min !== null && sensorConstraints[sensor.spec]?.max !== null
                            ? " and "
                            : ""
                        }${
                          sensorConstraints[sensor.spec]?.max !== null
                            ? `<= ${sensorConstraints[sensor.spec]?.max}`
                            : ""
                        }`
                      : ""
                  }
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="body2" style={{ fontWeight: 500, width: "40%" }}>
                {t("Data Collection Duration (minutes)")}:
              </Typography>
              {sensor.spec && sensorConstraints[sensor.spec] && (
                <Tooltip
                  title={
                    <Box p={1}>
                      <Typography variant="body2">Value Range:</Typography>
                      <Typography variant="body2">
                        {sensorConstraints[sensor.spec].max !== null &&
                          `Min: ${Math.round((1 / sensorConstraints[sensor.spec].max / 60) * 1000) / 1000}`}
                        {/* {sensorConstraints[sensor.spec].min !== null &&
                          sensorConstraints[sensor.spec].max !== null &&
                          " | "}
                        {sensorConstraints[sensor.spec].min !== null &&
                          `Max: ${Math.round(((1 / sensorConstraints[sensor.spec].min)/60)*1000)/1000}`} */}
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                style={{ marginLeft: "auto", width: "50%" }}
              >
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  error={!isDurationConstraintsSatisfied()}
                  value={sensorSettings?.data_collection_duration}
                  inputProps={{
                    inputMode: "decimal",
                    min: 0,
                    step: 0.01,
                    style: { appearance: "textfield" },
                  }}
                  InputProps={{
                    classes: {
                      input: !isEditing ? classes.readOnlyField : undefined,
                    },
                    readOnly: !isEditing,
                  }}
                  onChange={(e) => {
                    let duration = null
                    if (typeof e.target.value === "string") {
                      duration = parseFloat(e.target.value)
                    }
                    handleSettingsChange("data_collection_duration", duration)
                  }}
                  placeholder={t("Enter duration")}
                  style={{ width: "100%" }}
                  className={classes.settingsField}
                  helperText={
                    !isDurationConstraintsSatisfied()
                      ? `Duration must be ${
                          sensorConstraints[sensor.spec]?.max !== null
                            ? `>= ${Math.round((1 / sensorConstraints[sensor.spec].max / 60) * 1000) / 1000}`
                            : ""
                        }`
                      : ""
                  }
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center">
              <Typography variant="body2" style={{ width: "50%", fontWeight: 500 }}>
                {t("Data Collection Timeperiod")}:
              </Typography>
              <Box style={{ width: "50%" }}>
                <Box display="flex" mb={1}>
                  <Typography variant="caption" style={{ width: "50%" }}>
                    {t("Start Time")}:
                  </Typography>
                  <TextField
                    type="time"
                    size="small"
                    variant="outlined"
                    value={sensorSettings?.data_collection_timeperiod?.start_time || ""}
                    onChange={(e) =>
                      handleSettingsChange("data_collection_timeperiod", {
                        ...(sensorSettings?.data_collection_timeperiod || {}),
                        start_time: e.target.value,
                      })
                    }
                    className={classes.settingsField}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      classes: {
                        input: !isEditing ? classes.readOnlyField : undefined,
                      },
                      readOnly: !isEditing,
                    }}
                  />
                </Box>
                <Box display="flex">
                  <Typography variant="caption" style={{ width: "50%" }}>
                    {t("End Time")}:
                  </Typography>
                  <TextField
                    type="time"
                    size="small"
                    variant="outlined"
                    value={sensorSettings?.data_collection_timeperiod?.end_time || ""}
                    onChange={(e) =>
                      handleSettingsChange("data_collection_timeperiod", {
                        ...(sensorSettings?.data_collection_timeperiod || {}),
                        end_time: e.target.value,
                      })
                    }
                    className={classes.settingsField}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      classes: {
                        input: !isEditing ? classes.readOnlyField : undefined,
                      },
                      readOnly: !isEditing,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  // Create tab content for status in users
  const ParticipantsContent = () => (
    <Box>
      <Box className={classes.tableContainer}>
        <Table size="small" className={classes.table} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Participant ID")}</TableCell>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Last Logged At")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensor?.statusInUsers && sensor.statusInUsers.length > 0 ? (
              sensor.statusInUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className={classes.tableCell}>{user.participant_id}</TableCell>
                  <TableCell className={classes.tableCell}>
                    {user.lastLoggedAt ? new Date(user.lastLoggedAt).toLocaleString() : "Never"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  {t("No participants")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )

  // Create tab content for studies
  const StudiesContent = () => (
    <Box>
      <Box className={classes.tableContainer}>
        <Table size="small" className={classes.table} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Study Name")}</TableCell>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Groups")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensor?.studies && sensor.studies.length > 0 ? (
              sensor.studies.map((study, index) => (
                <TableRow key={index}>
                  <TableCell className={classes.tableCell}>{study.name}</TableCell>
                  <TableCell className={classes.tableCell}>{(study.groups || []).join(", ") || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  {t("No studies")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )

  // Create submission info for the Developer tab
  const getSubmissionInfo = () => {
    // Ensure developer_info has default values to prevent TypeScript errors
    const developerInfo: DeveloperInfo = {
      version: editedValues.developer_info?.version || "1.0",
      versionNumber: editedValues.developer_info?.versionNumber || "0",
      userIp: editedValues.developer_info?.userIp || "NA",
      sourceUrl: editedValues.developer_info?.sourceUrl || "NA",
      browser: editedValues.developer_info?.browser || "NA",
      device: editedValues.developer_info?.device || "NA",
      user: editedValues.developer_info?.user || "NA",
      status: editedValues.developer_info?.status || "Read",
      submittedOn: editedValues.developer_info?.submittedOn || "NA",
    }

    return {
      ...developerInfo,
      onChangeStatus: () => {
        const newStatus = developerInfo.status === "Read" ? "Active" : "Read"
        handleChangeStatus(newStatus)
      },
      isEditing: isDeveloperInfoEditing,
      onEdit: () => setIsDeveloperInfoEditing(true),
      onSave: handleSaveDeveloperInfo,
      // Let the component know which fields are editable
      editableFields: ["sourceUrl", "user"],
    }
  }

  return (
    <div className={classes.rootContainer}>
      <ViewItems
        fields={fields}
        tabs={[
          {
            id: "settings",
            label: t("Settings"),
            content: <SettingsContent />,
          },
          {
            id: "participants",
            label: t("Participants"),
            content: <ParticipantsContent />,
          },
          {
            id: "studies",
            label: t("Studies"),
            content: <StudiesContent />,
          },
        ]}
        isEditing={isEditing}
        onSave={handleSave}
        onEdit={() => console.log("Edit clicked")}
        editedValues={editedValues}
        setEditedValues={setEditedValues}
        loading={loading}
        submissionInfo={getSubmissionInfo()}
      />
    </div>
  )
}

export default SensorDetailItem
