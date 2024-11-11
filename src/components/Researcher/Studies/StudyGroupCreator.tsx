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

export default function StudyGroupCreator({ studies, researcherId, handleNewStudy, closePopUp, ...props }: any) {
  const [studyName, setStudyName] = useState("")
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const classes = useStyles()
  const [duplicateCnt, setCount] = useState(0)
  const [groupName, setGroupName] = useState("")
  const [duplicateStudyName, setDuplicateStudyName] = useState<any>("")

  const validate = () => {
    console.log(duplicateCnt, studyName, groupName)
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
  useEffect(() => {
    console.log(studies)
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

  const createGroup = async (studyName: string) => {
    setLoading(true)
    const newStudy = new Study()
    newStudy.name = studyName
    LAMP.Study.create(researcherId, newStudy)
      .then((res) => {
        const result = JSON.parse(JSON.stringify(res))
        if (result?.data) {
          const newStudyData = {
            id: result.data,
            name: studyName,
            participant_count: 1,
            activity_count: 0,
            sensor_count: 0,
          }

          Service.addData("studies", [newStudyData])
          enqueueSnackbar(t("Successfully created new group - {{groupName}}.", { groupName }), { variant: "success" })

          newStudyData.participant_count = 0
          handleNewStudy(newStudyData)
          // handleEnter()
          setStudyName("")
          setGroupName("")
          setDuplicateStudyName("")
          setCount(0)
          closePopUp(3)
        } else {
          enqueueSnackbar(t("Error creating group."), { variant: "error" })
        }
      })
      .catch(() => {
        enqueueSnackbar(t("An error occurred while creating new group - {{groupName}}.", { groupName }), {
          variant: "error",
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Dialog
      {...props}
      onClose={() => {
        setStudyName("")
        setGroupName("")
        setDuplicateStudyName("")
        setCount(0)
        closePopUp(3)
      }}
    >
      <DialogTitle>{t("Create New Group")}</DialogTitle>
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
        <Button onClick={() => createGroup(studyName)} color="primary" disabled={!studyName || loading}>
          {loading ? <CircularProgress size={24} /> : t("Confirm")}
        </Button>
      </DialogActions>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  )
}
