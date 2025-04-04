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
  Slide,
  Divider,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP, { Study } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { fetchPostData, fetchResult } from "../SaveResearcherData"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"

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

export default function StudyGroupCreator({
  studies,
  researcherId,
  handleNewStudy,
  closePopUp,
  open,
  onClose,
  ...props
}: any) {
  const [studyName, setStudyName] = useState("")
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const [duplicateCnt, setCount] = useState(0)
  const [groupName, setGroupName] = useState("")
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

  // const saveGroupData = async (studyId: string, groupName: string) => {
  //   const groupData = {
  //     study_id: studyId,
  //     name: groupName,
  //   };
  //   Service.addData("groups", [groupData]);
  // };

  // const handleEnter = () => {
  //   setStudyName("")
  //   setGroupName("")
  //   setCount(0)
  // }
  // useEffect(() => {
  //   console.log("chnaging studies on groupnaem", studies)
  //   let duplicateCount = 0
  //   if (!(typeof studyName === "undefined" || (typeof studyName !== "undefined" && studyName?.trim() === ""))) {
  //     studies.forEach((study) => {
  //       duplicateCount += study.gname?.some((gn) => gn?.trim().toLowerCase() === groupName?.trim().toLowerCase())
  //         ? 1
  //         : 0
  //     })
  //   }
  //   setCount(duplicateCount)
  // }, [groupName])

  useEffect(() => {
    let duplicateCount = 0
    if (groupName.trim() !== "" && studyName) {
      const selectedStudy = studies.find((study) => study.id === studyName)
      if (selectedStudy && selectedStudy.gname) {
        duplicateCount = selectedStudy.gname.some((gn) => gn?.trim().toLowerCase() === groupName.trim().toLowerCase())
          ? 1
          : 0
      }
    }
    setCount(duplicateCount)
  }, [groupName, studies, studyName])

  const createGroup = async (sName: string, groupName: string) => {
    setLoading(true)
    // let authId = researcherId
    // let authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
    // let bodyData = {
    //   study_id: sName, //old study id
    //   name: duplicateStudyName,
    // }
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
        // enqueueSnackbar(t("Successfully updated study with new group - {{groupName}}.", { groupName }), { variant: "success" })
        setStudyName("")
        setGroupName("")
        setDuplicateStudyName("")
        setCount(0)
        handleNewStudy(updatedStudy)
        console.log("checl after habndle", updatedStudies, studies)
        onClose()
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
    // LAMP.Study.create(researcherId, newStudy)
    // .then((res) => {
    //   const result = JSON.parse(JSON.stringify(res))
    //   if (result?.data) {
    //     const newStudyData = {
    //       id: result.data,
    //       name: sName,
    //       gname: result.gname ? result.gname + [groupName] : [groupName],
    //       participant_count: 1,
    //       activity_count: 0,
    //       sensor_count: 0,
    //     }
    //     Service.addData("studies", [newStudyData])
    //     enqueueSnackbar(t("Successfully created new group - {{groupName}}.", { groupName }), { variant: "success" })

    //     newStudyData.participant_count = 0
    //     handleNewStudy(newStudyData)
    //     // handleEnter()
    //     setStudyName("")
    //     setGroupName("")
    //     setDuplicateStudyName("")
    //     setCount(0)
    //     closePopUp(3)
    //   } else {
    //     enqueueSnackbar(t("Error creating group."), { variant: "error" })
    //   }
    // })
    // .catch(() => {
    //   enqueueSnackbar(t("An error occurred while creating new group - {{groupName}}.", { groupName }), {
    //     variant: "error",
    //   })
    // })
    // .finally(() => {
    //   setLoading(false)
    // })
  }
  const handleClose = () => {
    setStudyName("")
    setGroupName("")
    setDuplicateStudyName("")
    setCount(0)
    onClose()
    closePopUp(3)
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Box className={sliderclasses.slidePanel} onClick={(e) => e.stopPropagation()}>
        <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
          <Icon>close</Icon>
        </IconButton>
        <Box className={sliderclasses.icon}>
          <UserIcon />
        </Box>
        <Typography variant="h6" className={sliderclasses.headings}>{`${t("Create a new group")}`}</Typography>
        <TextField
          select
          className={sliderclasses.field}
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
            <MenuItem key={study.id} value={study.id}>
              {study.name}
            </MenuItem>
          ))}
        </TextField>
        <Divider className={sliderclasses.divider} />
        <TextField
          className={sliderclasses.field}
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
        <Box display="flex" justifyContent="flex-start" style={{ gap: 8 }} mt={2}>
          <Button onClick={handleClose} color="primary" className={sliderclasses.button}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => createGroup(studyName, groupName)}
            color="primary"
            variant="contained"
            className={sliderclasses.submitbutton}
            disabled={!studyName || !validate() || loading}
          >
            {loading ? <CircularProgress size={24} /> : t("Confirm")}
          </Button>
        </Box>
        {/* <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop> */}
      </Box>
    </Slide>
  )
}
