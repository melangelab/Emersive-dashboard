import React, { useState, useEffect } from "react"
import { Box, Fab, Icon, makeStyles, createStyles, Button, useMediaQuery, useTheme } from "@material-ui/core"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import SensorDialog from "./SensorDialog"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { Add as AddIcon } from "@material-ui/icons"

const useStyles = makeStyles((theme) =>
  createStyles({
    addButton: {
      backgroundColor: "#4285f4",
      color: "#fff",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "#3367d6",
      },
    },
    addButtonCompact: {
      width: theme.spacing(5), // Ensures some width
      height: theme.spacing(5),
      flexShrink: 0,
      minWidth: "unset",
      fontSize: "1.5rem",

      // boxSizing: "content-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    btnBlue: {
      background: "#7599FF",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#fff",
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#5680f9" },
      [theme.breakpoints.up("md")]: {
        position: "absolute",
      },
      [theme.breakpoints.down("sm")]: {
        minWidth: "auto",
      },
    },
    addText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
  })
)
export function addSensorItem(x, studies) {
  Service.updateCount("studies", x.studyID, "sensor_count")
  x["study_id"] = x.studyID
  x["study_name"] = studies.filter((study) => study.id === x.studyID)[0]?.name
  delete x["studyID"]
  Service.addData("sensors", [x])
}

interface SensorSettings {
  frequency?: number
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

export default function AddSensor({
  studies,
  studyId,
  setSensors,
  settingsInfo,
  ...props
}: {
  studies?: Array<Object>
  studyId?: string
  setSensors?: Function
  settingsInfo?: SettingsInfo
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [sensorDialog, setSensorDialog] = useState(false)

  const [allSensors, setAllSensors] = useState<Array<Object>>([])
  const headerclasses = useHeaderStyles()

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  useEffect(() => {
    getAllStudies()
  }, [])

  useEffect(() => {
    getAllStudies()
  }, [sensorDialog])

  const getAllStudies = () => {
    Service.getAll("sensors").then((sensorObj: any) => {
      setAllSensors(sensorObj)
    })
  }

  const addOrUpdateSensor = () => {
    setSensorDialog(false)
    setSensors()
  }

  return (
    <Box>
      {/* <Fab variant="extended" color="primary" classes={{ root: classes.btnBlue }} onClick={() => setSensorDialog(true)}>
        <Icon>add</Icon> <span className={classes.addText}>{`${t("Add")}`}</span>
      </Fab> */}
      {/* <Button
        variant="contained"
        className={headerclasses.addButton}
        startIcon={<AddIcon />}
        onClick={(event) => setSensorDialog(true)}
      >
        {t("Add")}
      </Button> */}
      <Button
        variant="contained"
        className={`${classes.addButton} ${!supportsSidebar ? classes.addButtonCompact : ""}`}
        onClick={(event) => setSensorDialog(true)}
      >
        {supportsSidebar ? t("+ Add") : "+"}
      </Button>
      <SensorDialog
        studies={studies}
        onClose={() => setSensorDialog(false)}
        open={sensorDialog}
        type="add"
        studyId={studyId ?? null}
        addOrUpdateSensor={addOrUpdateSensor}
        allSensors={allSensors}
        settingsInfo={settingsInfo}
      />
    </Box>
  )
}
