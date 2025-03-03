import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Icon,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core"

import { useSnackbar } from "notistack"
import LAMP, { Participant } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import NewPatientDetail from "./NewPatientDetail"

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
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    activityContent: {
      padding: "25px 25px 0",
    },
    errorMsg: { color: "#FF0000", fontSize: 12 },
    addNewDialog: {
      maxWidth: 350,
      [theme.breakpoints.up("sm")]: {
        maxWidth: "auto",
        minWidth: 400,
      },
    },
  })
)

export default function AddUser({
  researcherId,
  studies,
  setParticipants,
  handleNewStudy,
  closePopUp,
  ...props
}: {
  researcherId: any
  studies: any
  setParticipants?: Function
  handleNewStudy: Function
  closePopUp: Function
} & DialogProps) {
  const classes = useStyles()
  const [selectedStudy, setSelectedStudy] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [showErrorMsg, setShowErrorMsg] = useState(true)
  const [studyBtnClicked, setStudyBtnClicked] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [newId, setNewId] = useState(null)

  const validate = (element) => {
    return !(typeof element === "undefined" || (typeof element !== "undefined" && element?.trim() === ""))
  }
  const handleChangeStudy = (event) => {
    setShowErrorMsg(false)
    setSelectedStudy(event.target.value)
    setSelectedGroup("")
  }
  const handleChangeGroup = (event) => {
    setSelectedGroup(event.target.value)
  }

  let createStudy = async () => {
    if (selectedStudy === "") {
      setShowErrorMsg(true)
      return false
    } else {
      setStudyBtnClicked(true)
      let newCount = 1
      let ids = []
      for (let i = 0; i < newCount; i++) {
        let idData = ((await LAMP.Participant.create(selectedStudy, { study_code: "001" } as any)) as any).data
        let id = typeof idData === "object" ? idData.id : idData
        let newParticipant: any = {}
        if (typeof idData === "object") {
          newParticipant = idData
        } else {
          newParticipant["id"] = idData
        }
        if (!!((await LAMP.Credential.create(id, `${id}@lamp.com`, id, "Temporary Login")) as any).error) {
          enqueueSnackbar(`${t("Could not create credential for id.", { id: id })}`, { variant: "error" })
        } else {
          newParticipant.study_id = selectedStudy
          newParticipant.study_name = studies.filter((study) => study.id === selectedStudy)[0]?.name
          newParticipant.group_name = selectedGroup
          Service.addData("participants", [newParticipant])
          Service.updateCount("studies", selectedStudy, "participant_count")
          Service.getData("studies", selectedStudy).then((studiesObject) => {
            handleNewStudy(studiesObject)
          })
          console.log("LAMP.Participant.allByStudy", await LAMP.Participant.allByStudy(selectedStudy))
          setNewId(newParticipant.id)
          // const updParticipant : Participant = {
          //   ...newParticipant,
          //   group_name: selectedGroup,
          // }
          console.log("here", newParticipant, idData)
          Service.getDataByKey("participants", [newParticipant.id], "id").then((data) => {
            console.log("updated participants", data)
          })
          await LAMP.Type.setAttachment(id, "me", "lamp.group_name", selectedGroup)
          await LAMP.Participant.update(newParticipant.id, newParticipant).then((res) =>
            console.log("updaqted partiicpant", res)
          )
          const currentStudy = studies.find((study) => study.id === selectedStudy)
          const timestamps = currentStudy.timestamps || {}
          const updatedTimestamps = {
            ...timestamps,
            lastEnrollmentAt: new Date(),
            firstEnrollmentAt: timestamps.firstEnrollmentAt || new Date(), // Set only if not already set
          }
          const updatedStudy = {
            ...currentStudy,
            timestamps: updatedTimestamps,
          }
          const fieldsToUpdate = ["timestamps"]
          LAMP.Study.update(selectedStudy, updatedStudy).then((res) => {
            Service.update(
              "studies",
              {
                studies: [
                  {
                    id: selectedStudy,
                    ...updatedStudy,
                  },
                ],
              },
              "name",
              "id"
            )
            Service.updateMultipleKeys(
              "studies",
              {
                studies: [
                  {
                    id: selectedStudy,
                    ...updatedStudy,
                  },
                ],
              },
              fieldsToUpdate,
              "id"
            )
          })
          await Service.updateMultipleKeys(
            "studies",
            {
              studies: [
                {
                  id: selectedStudy,
                  timestamps: updatedTimestamps,
                },
              ],
            },
            ["timestamps"],
            "id"
          )
        }
        // const _owner = await LAMP.Type.parent(id)
        // await LAMP.Researcher.update(_owner.data.Researcher, {"timestamps.lastActivityAt": new Date()} as any).then(()=>console.log("successfully updated for participant", id))
        ids = [...ids, id]
      }
      setParticipants()
    }
    setSelectedStudy("")
    closePopUp(2)
    props.onClose as any
  }

  const createNewStudy = () => {
    let lampAuthId = LAMP.Auth._auth.id
    if (
      LAMP.Auth._type === "researcher" &&
      (lampAuthId === "researcher@demo.lamp.digital" || lampAuthId === "clinician@demo.lamp.digital")
    ) {
      createDemoStudy()
    } else {
      createStudy()
    }
  }

  const createDemoStudy = () => {
    if (selectedStudy === "") {
      setShowErrorMsg(true)
      return false
    } else {
      let studyName = studies.filter((study) => study.id === selectedStudy)[0]?.name
      setStudyBtnClicked(true)
      let newParticipant: any = {}
      newParticipant.id = "U" + crypto.getRandomValues(new Uint32Array(1))[0].toString().substring(0, 8)
      newParticipant.study_id = selectedStudy
      newParticipant.study_name = studyName
      Service.addData("participants", [newParticipant])
      Service.updateCount("studies", selectedStudy, "participant_count")
      Service.getData("studies", selectedStudy).then((studiesObject) => {
        handleNewStudy(studiesObject)
      })
      setNewId(newParticipant.id)
      closePopUp(2)
      setSelectedStudy("")
      setParticipants()
    }
    setSelectedStudy("")
    closePopUp(2)
    props.onClose as any
  }

  const handleEnter = () => {
    setSelectedStudy("")
    setSelectedGroup("")
    setShowErrorMsg(true)
  }

  return (
    <React.Fragment>
      <Dialog
        {...props}
        onEnter={handleEnter}
        scroll="paper"
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        classes={{ paper: classes.addNewDialog }}
      >
        <DialogTitle id="alert-dialog-slide-title" disableTypography>
          <Typography variant="h6">{`${t("Create a new user")}`}</Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={props.onClose as any}
            disabled={!!studyBtnClicked ? true : false}
          >
            <Icon>close</Icon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
          <Box mt={2} mb={3}>
            <Typography variant="body2">{`${t("Choose the Study you want to save this participant.")}`}</Typography>
          </Box>
          <TextField
            error={!validate(selectedStudy)}
            select
            autoFocus
            fullWidth
            variant="outlined"
            label={`${t("Study")}`}
            value={selectedStudy}
            onChange={handleChangeStudy}
            helperText={!validate(selectedStudy) ? `${t("Please select the Study")}` : ""}
          >
            {(studies || []).map((study) => (
              <MenuItem key={study.id} value={study.id}>
                {study.name}
              </MenuItem>
            ))}
          </TextField>
          {/* {!showErrorMsg && !selectedStudy && (
            <Box mt={1}>
              <Typography className={classes.errorMsg}>{`${t("Select a Study to create a participant.")}`}</Typography>
            </Box>
          )} */}
          <Box mt={2} mb={3}>
            <Typography variant="body2">{`${t("Choose the Group you want to save this participant.")}`}</Typography>
          </Box>
          <TextField
            error={!validate(selectedGroup)}
            select
            autoFocus
            fullWidth
            variant="outlined"
            label={`${t("Group")}`}
            value={selectedGroup}
            onChange={handleChangeGroup}
            disabled={!selectedStudy}
            helperText={!validate(selectedGroup) && !showErrorMsg ? `${t("Please select the Group")}` : ""}
          >
            {((selectedStudy && studies.find((study) => study.id === selectedStudy)?.gname) || []).map(
              (groupName, index) => (
                <MenuItem key={index} value={groupName}>
                  {groupName}
                </MenuItem>
              )
            )}
          </TextField>
          {showErrorMsg && (
            <Box mt={1}>
              <Typography className={classes.errorMsg}>{`${t(
                "Select a Study first for choosing groups."
              )}`}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Box textAlign="right" width={1} mt={3} mb={3} mx={3}>
            <Button
              color="primary"
              onClick={() => {
                closePopUp(2)
              }}
            >
              {`${t("Cancel")}`}
            </Button>
            <Button
              //onClick={() => addParticipant()}
              onClick={() => {
                createNewStudy()
              }}
              color="primary"
              autoFocus
              //disabled={!!studyBtnClicked ? true : false}
              disabled={!validate(selectedStudy)}
            >
              {`${t("Save")}`}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {!!newId && <NewPatientDetail id={newId} />}
    </React.Fragment>
  )
}
