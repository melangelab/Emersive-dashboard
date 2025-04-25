import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Slide,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Icon,
  Backdrop,
  CircularProgress,
  Divider,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as SensorIcon } from "../../../icons/NewIcons/sensor-on-filled.svg"

export default function CopySensor({ sensor, studies, setSensors, allSensors, open, onclose, ...props }) {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const sliderclasses = slideStyles()

  // State variables
  const [selectedStudy, setSelectedStudy] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [sensorName, setSensorName] = useState(`${sensor.name} (Copy)`)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [createdSensor, setCreatedSensor] = useState(null)
  const [duplicateCnt, setDuplicateCnt] = useState(0)

  // Update groups when study is selected
  useEffect(() => {
    const study = studies?.find((study) => study?.id === selectedStudy)
    setGroups(study?.gname || [])
  }, [selectedStudy])

  // Check for duplicate sensor names
  useEffect(() => {
    if (selectedStudy && sensorName) {
      const duplicateCount = allSensors.filter(
        (sensorData) =>
          sensorData.study_id === selectedStudy &&
          sensorData.name?.trim().toLowerCase() === sensorName?.trim().toLowerCase()
      ).length
      setDuplicateCnt(duplicateCount)
    }
  }, [sensorName, selectedStudy])

  // Validation method
  const validate = () => {
    return !!(selectedStudy && selectedGroup && sensorName && sensorName.trim() !== "" && duplicateCnt === 0)
  }

  // Copy sensor method
  const copySensor = async () => {
    setLoading(true)
    const newsensordetails = {
      name: sensorName.trim(),
      spec: sensor.spec,
      group: selectedGroup,
      settings: sensor.settings,
    } as any
    await LAMP.Sensor.create(selectedStudy, newsensordetails)
      .then((res: any) => {
        let result = JSON.parse(JSON.stringify(res.data))
        const sensorObj = {
          id: result._id,
          name: sensorName.trim(),
          spec: sensor.spec,
          study_id: selectedStudy,
          study_name: studies.find((s) => s.id === selectedStudy)?.name,
          settings: result.settings,
          group: result.gname || selectedGroup,
          statusInUsers: result.statusInUsers,
        }
        Service.addData("sensors", [sensorObj])
        Service.getData("studies", selectedStudy).then((res: any) => {
          Service.updateMultipleKeys(
            "studies",
            {
              studies: [
                {
                  id: res.id,
                  sensor_count: (res.sensor_count || 0) + 1,
                },
              ],
            },
            ["sensor_count"],
            "id"
          )
        })
        setCreatedSensor({
          name: sensorName.trim(),
          spec: sensor.spec,
          study: studies.find((s) => s.id === selectedStudy)?.name,
          group: selectedGroup,
        })
        enqueueSnackbar(t("Sensor copied successfully"), { variant: "success" })
        setConfirmationOpen(true)
        setSensors()
      })
      .catch((error) => {
        console.error("Error copying sensor:", error)
        enqueueSnackbar(t("Failed to copy sensor"), { variant: "error" })
      })
    setLoading(false)
  }

  // Close handler
  const handleClose = () => {
    onclose()
  }

  // Confirmation close handler
  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    onclose()
  }

  return (
    <>
      {/* Copy Sensor Slide */}
      <Slide direction="left" in={open && !confirmationOpen} mountOnEnter unmountOnExit>
        <Box
          className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton aria-label="close" className={sliderclasses.closeButton} onClick={handleClose}>
            <Icon>close</Icon>
          </IconButton>

          <Box className={sliderclasses.icon}>
            <SensorIcon />
          </Box>

          <Typography variant="h6" className={sliderclasses.headings}>
            {t("Copy Sensor")}
          </Typography>

          <Divider className={sliderclasses.divider} />

          {/* Study Selection */}
          <Box mt={4}>
            <TextField
              select
              label={t("Study")}
              value={selectedStudy}
              onChange={(e) => setSelectedStudy(e.target.value)}
              variant="filled"
              className={sliderclasses.field}
              required
            >
              {studies?.map((study) => (
                <MenuItem key={study.id} value={study.id}>
                  {study.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Group Selection */}
          <Box mt={4}>
            <TextField
              select
              label={t("Group")}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              variant="filled"
              className={sliderclasses.field}
              disabled={!selectedStudy}
              required
            >
              {groups?.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Sensor Name */}
          <Box mt={4}>
            <TextField
              value={sensorName}
              label={t("Sensor Name")}
              variant="filled"
              className={sliderclasses.field}
              onChange={(e) => setSensorName(e.target.value)}
              error={duplicateCnt > 0}
              helperText={
                duplicateCnt > 0 ? t("Unique name required") : t("Default name is original sensor name with (Copy)")
              }
              required
            />
          </Box>

          <Divider className={sliderclasses.divider} />

          {/* Submit Button */}
          <Box textAlign="center" mt={2}>
            <Button onClick={copySensor} disabled={!validate()} className={sliderclasses.button}>
              {t("Copy Sensor")}
            </Button>
          </Box>
        </Box>
      </Slide>

      {/* Confirmation Slide */}
      <Slide direction="left" in={confirmationOpen} mountOnEnter unmountOnExit>
        <Box className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}>
          <Box className={sliderclasses.icon}>
            <SensorIcon />
          </Box>

          <Typography variant="h6">{t("Sensor Copied")}</Typography>

          <Divider className={sliderclasses.divider} />

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
            <strong>{t("Group")}:</strong> {createdSensor?.group}
          </Typography>

          <Divider className={sliderclasses.divider} />

          <Button className={sliderclasses.button} onClick={handleConfirmationClose}>
            {t("Close")}
          </Button>
        </Box>
      </Slide>

      {/* Loading Backdrop */}
      <Backdrop open={loading} style={{ zIndex: 9999, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}
