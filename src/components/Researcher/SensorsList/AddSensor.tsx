import React, { useState, useEffect } from "react"
import {
  Box,
  Fab,
  Icon,
  makeStyles,
  createStyles,
  Button,
  useMediaQuery,
  useTheme,
  Backdrop,
  Slide,
  Typography,
  Divider,
} from "@material-ui/core"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import SensorDialog from "./SensorDialog"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
// import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as SensorIcon } from "../../../icons/NewIcons/sensor-on-filled.svg"
import { createPortal } from "react-dom"
import "../../Admin/admin.css"
import AddIcon from "@material-ui/icons/Add"
import { Refresh } from "@mui/icons-material"

const useStyles = makeStyles((theme) =>
  createStyles({
    addButton: {
      backgroundColor: "#4CAF50",
      padding: theme.spacing(1),
      borderRadius: "40%",
      width: 40,
      height: 40,
      minWidth: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      "& path": {
        fill: "#FFFFFF",
      },
      "&:hover": {
        backgroundColor: "#45a049",
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

export default function AddSensor({
  studies,
  studyId,
  setSensors,
  ...props
}: {
  studies?: Array<Object>
  studyId?: string
  setSensors?: Function
  [key: string]: any
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [sensorDialog, setSensorDialog] = useState(false)

  const [allSensors, setAllSensors] = useState<Array<Object>>([])
  const headerclasses = useHeaderStyles()
  const sliderclasses = slideStyles()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [slideOpen, setSlideOpen] = useState(false)

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
    // setSensors()
    props.refreshSensors?.()
  }

  return (
    <div className="add-icon-container">
      <Fab
        className="add-fab-btn"
        onClick={(event) => setSlideOpen(true)}
        style={{ backgroundColor: "#008607", color: "white" }}
      >
        <AddIcon className="add-icon" />
      </Fab>
      {slideOpen &&
        createPortal(
          <>
            <Backdrop
              className={sliderclasses.backdrop}
              open={slideOpen}
              onClick={(e) => !sensorDialog && setSlideOpen(false)}
            />
            <Slide direction="left" in={slideOpen} mountOnEnter unmountOnExit>
              <Box className={sliderclasses.slidePanel}>
                <Box className={sliderclasses.icon}>
                  <SensorIcon />
                </Box>
                <Typography variant="h6">ADD NEW SENSOR</Typography>
                <Divider className={sliderclasses.divider} />
                <Typography variant="body2" paragraph>
                  Sensors are <strong>study-specific</strong> data collection tools.
                </Typography>
                <Divider className={sliderclasses.divider} />
                <Typography variant="body1" paragraph>
                  Add a new Sensor under researcher <strong>{props.title}</strong>.
                </Typography>
                <Typography variant="body2" paragraph>
                  Choose the appropriate sensor type for your study.
                </Typography>
                <Divider className={sliderclasses.divider} />
                <Button className={sliderclasses.button} onClick={() => setSensorDialog(true)}>
                  Next
                </Button>
              </Box>
            </Slide>
            <SensorDialog
              studies={studies}
              onclose={() => setSensorDialog(false)}
              open={sensorDialog}
              type="add"
              studyId={studyId ?? null}
              addOrUpdateSensor={addOrUpdateSensor}
              allSensors={allSensors}
              sharedstudies={props.sharedstudies}
            />
          </>,
          document.body
        )}
    </div>
  )
}
