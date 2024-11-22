import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  Button,
  Icon,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  DialogProps,
  Backdrop,
  CircularProgress,
  Typography,
  makeStyles,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP, { Study } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { fetchPostData, fetchResult } from "../SaveResearcherData"
import NewPatientDetail from "./NewPatientDetail"

const useStyles = makeStyles((theme) => ({
  dataQuality: {
    margin: "4px 0",
    backgroundColor: "#E9F8E7",
    color: "#FFF",
  },
  switchLabel: { color: "#4C66D6" },
  activityContent: {
    padding: "15px 25px 0",
  },
  backdrop: {
    zIndex: 111111,
    color: "#fff",
  },
  addNewDialog: {
    maxWidth: 500,
    [theme.breakpoints.up("sm")]: {
      maxWidth: "auto",
      minWidth: 400,
    },
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  checkboxActive: { color: "#7599FF !important" },
}))

export default function AddUserGroup({
  studies,
  researcherId,
  setParticipants,
  handleNewStudy,
  closePopUp,
  ...props
}: any) {
  const [studyName, setStudyName] = useState("")
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const classes = useStyles()
  const [duplicateCnt, setCount] = useState(0)
  const [groupName, setGroupName] = useState("")
  const [newId, setNewId] = useState(null)
  const [studyBtnClicked, setStudyBtnClicked] = useState(false)
  const [duplicateStudyName, setDuplicateStudyName] = useState<any>("")

  const validate = () => {
    return !(
      duplicateCnt > 0 ||
      typeof studyName === "undefined" ||
      (typeof studyName !== "undefined" && studyName.trim() === "") ||
      typeof groupName === "undefined" ||
      (typeof groupName !== "undefined" && groupName.trim() === "")
    )
  }

  const createParticipant = async (studyId: string) => {
    let idData = ((await LAMP.Participant.create(studyId, { study_code: "001" } as any)) as any).data
    let id = typeof idData === "object" ? idData.id : idData
    let newParticipant: any = {}
    if (typeof idData === "object") {
      newParticipant = idData
    } else {
      newParticipant["id"] = idData
    }
    if (!!((await LAMP.Credential.create(id, `${id}@lamp.com`, id, "Temporary Login")) as any).error) {
      enqueueSnackbar(`${t("Could not create credential for id.", { id })}`, { variant: "error" })
    } else {
      newParticipant.study_id = studyId
      newParticipant.study_name = studies.find((study) => study.id === studyId)?.name
      newParticipant.group_name = groupName
      Service.addData("participants", [newParticipant])
      Service.updateCount("studies", studyId, "participant_count")
      Service.getData("studies", studyId).then((studiesObject) => {
        handleNewStudy(studiesObject)
      })
      console.log("here", newParticipant, idData)
      Service.getDataByKey("participants", [newParticipant.id], "id").then((data) => {
        console.log("updated participants", data)
      })
      setNewId(newParticipant.id)
    }
    handleEnter()
    setParticipants()
  }

  const handleEnter = () => {
    setStudyName("")
    setGroupName("")
    setCount(0)
    setNewId(null)
  }

  useEffect(() => {
    console.log("chnaging studies on groupnaem", studies)
    let duplicateCount = 0
    if (!(typeof studyName === "undefined" || (typeof studyName !== "undefined" && studyName?.trim() === ""))) {
      studies.forEach((study) => {
        duplicateCount += study.gname?.some((gn) => gn?.trim().toLowerCase() === groupName?.trim().toLowerCase())
          ? 1
          : 0
      })
    }
    setCount(duplicateCount)
  }, [groupName])

  const createGroup = async (sName: string, groupName: string) => {
    setLoading(true)
    setStudyBtnClicked(true)
    console.log("created group", sName, groupName)
    const studyToUpdate = studies.find((study) => study.id === sName)
    if (studyToUpdate) {
      // Append the new group name to the gname array
      const updatedStudy: Study = {
        ...studyToUpdate,
        gname: studyToUpdate.gname ? [...studyToUpdate.gname, groupName] : [groupName],
      }
      try {
        // Update the study with the new group appended
        await LAMP.Study.update(sName, updatedStudy)
          .then((res) => {
            console.log("result", res)
            Service.addData("studies", [updatedStudy])
            let selectedStudies =
              localStorage.getItem("studies_" + researcherId) !== null
                ? JSON.parse(localStorage.getItem("studies_" + researcherId))
                : []
            let data = selectedStudies.filter((d) => d !== studyToUpdate.name)
            localStorage.setItem("studies_" + researcherId, JSON.stringify(data))
            enqueueSnackbar(`${t("Successfully updated group in Study.", { studyId: sName })}`, { variant: "success" })
            console.log(LAMP.Study.allByResearcher(researcherId))
            createParticipant(sName)
            console.log("created new user")
          })
          .catch((error) => {
            console.log("error", error)
            enqueueSnackbar(`${t("An error occured while updating group in Study. Please try again.")}`, {
              variant: "error",
            })
          })
        LAMP.Study.view(sName).then((obj) => {
          console.log("after LAMP.Study.update", obj)
        })
        // await Service.addData("studies", [updatedStudy])
        // await Service.update("studies", updatedStudy, "id", studyToUpdate.id)
        // Service.update("studies", { studies: [{ id: sName, name: aliasStudyName }] }, "name", "id")
        const updatedStudies = studies.map((study) => (study.id === sName ? updatedStudy : study))
        console.log("updatedStudy", updatedStudies, studies)
        Service.getData("studies", sName).then((studiesObject) => {
          console.log("getting db ", studiesObject)
        })
        setStudyName("")
        setGroupName("")
        setDuplicateStudyName("")
        setCount(0)
        handleNewStudy(updatedStudy)
        console.log("checl after habndle", updatedStudies, studies)
        closePopUp(3)
      } catch (error) {
        enqueueSnackbar(
          t("An error occurred while updating the study with new group - {{groupName}}.", { groupName }),
          {
            variant: "error",
          }
        )
      } finally {
        setLoading(false)
      }
    } else {
      enqueueSnackbar(t("Study not found."), { variant: "error" })
      setLoading(false)
    }
  }

  return (
    <React.Fragment>
      <Dialog
        {...props}
        onEnter={handleEnter}
        onClose={() => {
          setStudyName("")
          setGroupName("")
          setDuplicateStudyName("")
          setCount(0)
          setNewId(null)
          closePopUp(3)
        }}
      >
        <DialogTitle id="alert-dialog-slide-title" disableTypography>
          <Typography variant="h6">{`${t("Create a new group")}`}</Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={props.onClose as any}
            disabled={!!studyBtnClicked ? true : false}
          >
            <Icon>close</Icon>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <TextField
              error={!validate()}
              label={t("Group Name")}
              fullWidth
              variant="outlined"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              helperText={
                duplicateCnt > 0
                  ? `${t("Unique group name required")}`
                  : !validate()
                  ? `${t("Please enter group name.")}`
                  : ""
              }
            />
          </Box>
          <Box>
            <TextField
              select
              autoFocus
              fullWidth
              variant="outlined"
              label={`${t("Select Study")}`}
              value={studyName}
              onChange={(e) => {
                // const { id, name } = JSON.parse(e.target.value) // Parse JSON to get id and name
                // setDuplicateStudyName(name)
                setStudyName(e.target.value)
              }}
              inputProps={{ maxLength: 80 }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {(studies || []).map((study) => (
                <MenuItem
                  key={study.id}
                  value={study.id}
                  // value={JSON.stringify({ id: study.id, name: study.name })}
                >
                  {study.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setStudyName("")
              setGroupName("")
              setDuplicateStudyName("")
              setCount(0)
              closePopUp(3)
            }}
            color="primary"
          >
            {t("Cancel")}
          </Button>
          <Button onClick={() => createGroup(studyName, groupName)} color="primary" disabled={!studyName || loading}>
            {loading ? <CircularProgress size={24} /> : t("Confirm")}
          </Button>
        </DialogActions>
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>
      {!!newId && <NewPatientDetail id={newId} />}
    </React.Fragment>
  )
}
