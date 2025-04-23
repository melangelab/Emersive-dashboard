import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  Button,
  TextField,
  Popover,
  MenuItem,
  Tooltip,
  Grid,
  Fab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputBase,
  DialogProps,
  Backdrop,
  CircularProgress,
  makeStyles,
  Theme,
  createStyles,
  withStyles,
  Slide,
  Icon,
  Divider,
} from "@material-ui/core"

import { useSnackbar } from "notistack"

import QRCode from "qrcode.react"
// Local Imports
import LAMP, { Study } from "lamp-core"

import SnackMessage from "../../SnackMessage"

import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { ReactComponent as SensorIcon } from "../../../icons/NewIcons/sensor-on-filled.svg"
import { slideStyles } from "../ParticipantList/AddButton"

const _qrLink = (credID, password) =>
  window.location.href.split("#")[0] +
  "#/?a=" +
  btoa([credID, password, LAMP.Auth._auth.serverAddress].filter((x) => !!x).join(":"))

const CssTextField = withStyles({
  root: {
    "label + &": {},
  },
  input: {
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.75)",
  },
})(InputBase)

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    buttonText: {
      fontWeight: "bold",
      fontSize: 16,
      color: "white",
    },
    PopupButton: {
      marginTop: 35,
      width: 168,
      height: 50,
      background: "#7599FF",
      boxShadow: "0px 10px 15px rgba(96, 131, 231, 0.2)",
      borderRadius: 25,
      marginBottom: 40,
      "&:hover": { background: "#5680f9" },
    },
    popWidth: { width: "95%", maxWidth: "500px", padding: "0 40px" },
    dialogTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "rgba(0, 0, 0, 0.75)",
      marginTop: 30,
    },
    disabled: {
      color: "rgba(0, 0, 0, 0.26)",
      boxShadow: "none",
      backgroundColor: "rgba(0, 0, 0, 0.12)",
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    settingsField: {
      width: "100%",
    },
  })
)

interface SensorSettings {
  frequency?: number
  data_collection_duration?: number
  data_collection_timeperiod?: { start_time: string; end_time: string } | null
}

interface SettingsInfo {
  "lamp.analytics": SensorSettings
  "lamp.gps": SensorSettings
  "lamp.accelerometer": SensorSettings
  "lamp.accelerometer.motion": SensorSettings
  "lamp.accelerometer.device_motion": SensorSettings
  "lamp.device_state": SensorSettings
  "lamp.steps": SensorSettings
  "lamp.nearby_device": SensorSettings
  "lamp.telephony": SensorSettings
  "lamp.sleep": SensorSettings
  "lamp.ambient": SensorSettings
}

export interface Sensors {
  id?: string
  study_id?: string
  name?: string
  group?: string
  spec?: string
  settings?: SensorSettings
}
export default function SensorDialog({
  sensor,
  studies,
  studyId,
  type,
  addOrUpdateSensor,
  allSensors,
  settingsInfo,
  open,
  onclose,
  ...props
}: {
  sensor?: Sensors
  studies?: Array<any>
  studyId?: string
  type?: string
  addOrUpdateSensor?: Function
  allSensors?: Array<any>
  settingsInfo?: SettingsInfo
  open: any
  onclose: Function
} & DialogProps) {
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const [selectedStudy, setSelectedStudy] = useState(sensor ? sensor.study_id : studyId ?? "")
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [selectedSensor, setSelectedSensor] = useState(sensor ?? null)
  const [sensorName, setSensorName] = useState(sensor ? sensor.name : "")
  const [sensorSpecs, setSensorSpecs] = useState(null)
  const [sensorSpec, setSensorSpec] = useState(sensor ? sensor.spec : null)
  const [loading, setLoading] = useState(false)
  const [duplicateCnt, setDuplicateCnt] = useState(0)
  const [oldSensorName, setOldSensorName] = useState(sensor ? sensor.name : "")
  const [allSensorData, setAllSensorData] = useState([])
  const [groups, setGroups] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(sensor ? sensor.group : "")
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [createdSensor, setCreatedSensor] = useState(null)
  const [sensorSettings, setSensorSettings] = useState(
    sensor?.settings || {
      frequency: 1,
      data_collection_duration: null,
      data_collection_timeperiod: { start_time: null, end_time: null },
    }
  )

  useEffect(() => {
    LAMP.SensorSpec.all().then((res) => {
      setSensorSpecs(res)
      console.log("SENSOR SPECS SET", res)
      setSensorSpec(sensor ? sensor.spec : null)
    })
  }, [])

  useEffect(() => {
    setAllSensorData(allSensors)
  }, [allSensors])

  useEffect(() => {
    if (type === "add") {
      setSelectedSensor(null)
      setSelectedStudy(sensor ? sensor.study_id : studyId ?? "")
      setSensorName("")
      setSensorSpec("")
      setSensorSettings({
        frequency: 1,
        data_collection_duration: null,
        data_collection_timeperiod: { start_time: null, end_time: null },
      })
    } else {
      setSelectedStudy(sensor ? sensor.study_id : studyId ?? "")
      setSelectedSensor(sensor ?? null)
      setSensorName(sensor ? sensor.name : "")
      setSensorSpec(sensor ? sensor.spec : null)
      if (sensor?.settings) {
        setSensorSettings(sensor.settings)
      } else {
        setSensorSettings({
          frequency: 1,
          data_collection_duration: null,
          data_collection_timeperiod: { start_time: null, end_time: null },
        })
      }
    }
  }, [open])

  useEffect(() => {
    let duplicateCount = 0
    if (!(typeof sensorName === "undefined" || (typeof sensorName !== "undefined" && sensorName?.trim() === ""))) {
      if (allSensorData) {
        selectedSensor
          ? (duplicateCount = allSensorData.filter((sensorData) => {
              if (sensorData.name !== oldSensorName) {
                return (
                  sensorData.study_id === selectedStudy &&
                  sensorData.name?.trim().toLowerCase() === sensorName?.trim().toLowerCase()
                )
              }
            }).length)
          : (duplicateCount = allSensorData.filter(
              (sensorData) =>
                sensorData.study_id === selectedStudy &&
                sensorData.name?.trim().toLowerCase() === sensorName?.trim().toLowerCase()
            ).length)
      }
      setDuplicateCnt(duplicateCount)
    }
  }, [sensorName])

  useEffect(() => {
    let duplicateCount = 0
    if (!(typeof sensorName === "undefined" || (typeof sensorName !== "undefined" && sensorName?.trim() === ""))) {
      if (allSensors) {
        duplicateCount = allSensors.filter(
          (sensorData) =>
            sensorData.study_id === selectedStudy &&
            sensorData.name?.trim().toLowerCase() === sensorName?.trim().toLowerCase()
        ).length
      }
      setDuplicateCnt(duplicateCount)
    }
  }, [selectedStudy])

  useEffect(() => {
    const study = studies?.find((study) => study?.id === selectedStudy)
    console.log("&&#$#&$#^$ grps", studies, study?.gname)
    setGroups(study?.gname)
  }, [selectedStudy])

  const handleSettingsChange = (key, value) => {
    setSensorSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }))
  }

  const validate = () => {
    return !(
      duplicateCnt > 0 ||
      typeof selectedStudy == "undefined" ||
      selectedStudy === null ||
      selectedStudy === "" ||
      typeof sensorName == "undefined" ||
      sensorName === null ||
      sensorName.trim() === "" ||
      typeof sensorSpec == "undefined" ||
      sensorSpec === null ||
      sensorSpec === ""
    )
  }

  const updateSensor = async () => {
    setLoading(true)
    const result = await LAMP.Sensor.update(selectedSensor.id, {
      name: sensorName.trim(),
      spec: sensorSpec,
      settings: sensorSettings,
    })
      .then((res) => {
        Service.updateMultipleKeys(
          "sensors",
          { sensors: [{ id: selectedSensor.id, name: sensorName.trim(), spec: sensorSpec, settings: sensorSettings }] },
          ["name", "spec", "settings"],
          "id"
        )
        enqueueSnackbar(`${t("Successfully updated a sensor.")}`, {
          variant: "success",
        })
        setLoading(false)
        addOrUpdateSensor()
        setCreatedSensor({
          name: sensorName.trim(),
          spec: sensorSpec,
          settings: sensorSettings,
          study: studies.find((s) => s.id === selectedStudy)?.name,
        })
        setConfirmationOpen(true)
      })
      .catch((e) => {
        enqueueSnackbar(`${t("An error occured while updating the sensor.")}`, {
          variant: "error",
        })
        setLoading(false)
      })
  }

  const saveSensor = async () => {
    setLoading(true)
    await LAMP.Sensor.create(selectedStudy, {
      name: sensorName.trim(),
      spec: sensorSpec,
      group: selectedGroup,
      settings: sensorSettings,
      // settings: sensorSpecs.find((sensorElem) => sensorElem.id === sensorSpec)?.settings_schema,
    } as any)
      .then((res: any) => {
        console.log("THE RESULT", res)
        let result = JSON.parse(JSON.stringify(res.data))
        Service.getData("studies", selectedStudy).then((studiesObject) => {
          let sensorObj = {
            id: result._id,
            name: sensorName.trim(),
            spec: sensorSpec,
            study_id: selectedStudy,
            study_name: studies.filter((study) => study.id === selectedStudy)[0]?.name,
            // settings: result.settings,
            settings: sensorSettings,
            studies: result.studies,
            group: result.gname || selectedGroup,
            statusInUsers: result.statusInUsers,
          }
          console.log("SENSOR OBJ in save sensor", sensorObj)
          Service.addData("sensors", [sensorObj])
          Service.updateMultipleKeys(
            "studies",
            {
              studies: [
                { id: studiesObject.id, sensor_count: studiesObject.sensor_count ? studiesObject.sensor_count + 1 : 1 },
              ],
            },
            ["sensor_count"],
            "id"
          )
          enqueueSnackbar(`${t("Successfully created a sensor.")}`, {
            variant: "success",
          })
          setLoading(false)
          addOrUpdateSensor()
          setCreatedSensor({
            name: sensorName.trim(),
            spec: sensorSpec,
            settings: sensorSettings,
            study: studies.find((s) => s.id === selectedStudy)?.name,
          })
          setConfirmationOpen(true)
        })
      })
      .catch((e) => {
        enqueueSnackbar(`${t("An error occured while creating the sensor.")}`, {
          variant: "error",
        })
        setLoading(false)
      })
  }
  const handleClose = () => {
    onclose()
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    onclose()
    addOrUpdateSensor()
  }

  return (
    <>
      <Slide direction="left" in={open && !confirmationOpen} mountOnEnter unmountOnExit>
        <Box
          className={`${sliderclasses.slidePanel} ${type === "edit" ? sliderclasses.TabSlidePanel : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose as any}>
            <Icon>close</Icon>
          </IconButton>
          <Box className={sliderclasses.icon}>
            <SensorIcon />
          </Box>
          <Typography variant="h6" className={sliderclasses.headings}>
            {selectedSensor ? t("Update Sensor") : t("Add Sensor")}
          </Typography>
          <Divider className={sliderclasses.divider} />
          <Box mt={4}>
            <TextField
              error={typeof selectedStudy == "undefined" || selectedStudy === null || selectedStudy === ""}
              id="filled-select-currency"
              select
              label={`${t("Study")}`}
              value={selectedStudy}
              //disabled={!!studyId ? true : false}
              disabled={!!sensor ? true : false}
              onChange={(e) => {
                setSelectedStudy(e.target.value)
              }}
              helperText={
                typeof selectedStudy == "undefined" || selectedStudy === null || selectedStudy === ""
                  ? `${t("Please select the study")}.`
                  : ""
              }
              variant="filled"
              className={sliderclasses.field}
            >
              {(studies || []).map((option) => (
                <MenuItem key={option.id} value={option.id} data-selected-study-name={t(option.name)}>
                  {t(option.name)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box mt={4}>
            <TextField
              error={typeof selectedStudy == "undefined" || selectedStudy === null || selectedStudy === ""}
              id="filled-select-currency"
              select
              label={`${t("Group")}`}
              value={selectedGroup}
              //disabled={!!studyId ? true : false}
              disabled={!!sensor ? true : false}
              onChange={(e) => {
                setSelectedGroup(e.target.value)
              }}
              helperText={
                typeof selectedStudy == "undefined" || selectedStudy === null || selectedStudy === ""
                  ? `${t("Please select the group")}.`
                  : ""
              }
              variant="filled"
              className={sliderclasses.field}
            >
              {(groups || []).map((option, idx) => (
                <MenuItem key={idx} value={option} data-selected-study-name={t(option)}>
                  {t(option)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box mt={4}>
            <TextField
              error={
                duplicateCnt > 0 || typeof sensorName == "undefined" || sensorName === null || sensorName.trim() === ""
                  ? true
                  : false
              }
              value={sensorName}
              variant="filled"
              label={`${t("Name")}`}
              onChange={(event) => setSensorName(event.target.value)}
              placeholder={`${t("Name")}`}
              helperText={
                duplicateCnt > 0
                  ? `${t("Unique name required.")}`
                  : typeof sensorName == "undefined" || sensorName === null || sensorName.trim() === ""
                  ? `${t("Please enter name.")}`
                  : ""
              }
              className={sliderclasses.field}
            />
          </Box>
          <Box mt={4}>
            <TextField
              error={typeof sensorSpec == "undefined" || sensorSpec === null || sensorSpec === "" ? true : false}
              id="filled-select-currency"
              select
              label={`${t("Sensor spec")}`}
              value={`${t(sensorSpec)}`}
              onChange={(e) => {
                setSensorSpec(e.target.value)
              }}
              helperText={
                typeof sensorSpec == "undefined" || sensorSpec === null || sensorSpec === ""
                  ? `${t("Please select the sensor spec.")}`
                  : ""
              }
              variant="filled"
              className={sliderclasses.field}
            >
              {!!sensorSpecs &&
                sensorSpecs.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {t(option.id.replace("lamp.", ""))}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
          <Box mt={4}>
            <Typography variant="subtitle1" className={sliderclasses.field}>
              {t("Sensor Settings")}
            </Typography>
            <Box p={2} mt={1} border="1px solid rgba(0, 0, 0, 0.12)" borderRadius="4px" bgcolor="rgba(0, 0, 0, 0.02)">
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body2" style={{ width: "50%", fontWeight: 500 }}>
                  {t("Data Collection Duration")}:
                </Typography>
                <TextField
                  size="small"
                  variant="outlined"
                  value={sensorSettings?.data_collection_duration || ""}
                  onChange={(e) => handleSettingsChange("data_collection_duration", e.target.value)}
                  placeholder={t("Enter duration")}
                  style={{ width: "50%" }}
                  className={classes.settingsField}
                />
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body2" style={{ width: "50%", fontWeight: 500 }}>
                  {t("Frequency")}:
                </Typography>
                <TextField
                  size="small"
                  variant="outlined"
                  type="number"
                  value={sensorSettings?.frequency || 1}
                  onChange={(e) => handleSettingsChange("frequency", Number(e.target.value) || 1)}
                  placeholder={t("Enter frequency")}
                  style={{ width: "50%" }}
                  className={classes.settingsField}
                />
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
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider className={sliderclasses.divider} />
          <Box textAlign="center" mt={2}>
            <Button
              onClick={() => (selectedSensor ? updateSensor() : saveSensor())}
              disabled={!validate()}
              className={!validate() ? classes.disabled + " " + sliderclasses.button : sliderclasses.button}
            >
              {selectedSensor ? t("Update") : t("Add")}
            </Button>
          </Box>
        </Box>
      </Slide>
      <Slide direction="left" in={confirmationOpen} mountOnEnter unmountOnExit>
        <Box className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}>
          <Box className={sliderclasses.icon}>
            <SensorIcon />
          </Box>
          <Typography variant="h6">{selectedSensor ? t("Sensor Updated") : t("Sensor Added")}</Typography>
          <Divider className={sliderclasses.divider} />

          <Typography variant="body2" paragraph>
            {selectedSensor ? t("Sensor has been successfully updated") : t("New sensor has been successfully created")}
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>{t("Name")}:</strong> {createdSensor?.name}
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>{t("Spec")}:</strong> {createdSensor?.spec}
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>{t("Study")}:</strong> {createdSensor?.study}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>{t("Settings")}:</strong>{" "}
            {createdSensor?.settings
              ? Object.keys(createdSensor.settings).length > 0
                ? JSON.stringify(createdSensor.settings)
                : t("Default")
              : t("Default")}
          </Typography>

          <Divider className={sliderclasses.divider} />
          <Button className={sliderclasses.button} onClick={handleConfirmationClose}>
            {t("Close")}
          </Button>
        </Box>
      </Slide>

      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}
