// Core Imports
import React, { useState, useEffect } from "react"
import {
  Box,
  Icon,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  Backdrop,
  CircularProgress,
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
    padding: "25px 25px 0",
  },
  backdrop: {
    zIndex: 111111,
    color: "#fff",
  },
  addNewDialog: {
    maxWidth: 350,
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
}))

export enum StudyPurpose {
  P = "practice",
  S = "support",
  R = "research",
  O = "other",
}

export enum StudyType {
  DE = "descriptive",
  CC = "case_control",
  CO = "cohort",
  OB = "observational",
  RCT = "randomized_controlled_trial",
  OC = "other_clinical_trial",
}

export enum StudyState {
  DEV = "development",
  PROD = "production",
  COMP = "complete",
}

export default function StudyCreator({
  studies,
  researcherId,
  handleNewStudy,
  closePopUp,
  resins,
  ...props
}: {
  studies: any
  researcherId: any
  handleNewStudy: Function
  closePopUp: Function
  resins: any
} & DialogProps) {
  const [studyName, setStudyName] = useState("")
  const [studyDetails, setStudyDetails] = useState({
    name: "",
    purpose: StudyPurpose.P, // Default - Practice
    piInstitution: resins || "",
    collaboratingInstitutions: [],
    hasFunding: false,
    hasEthicsPermission: false,
    state: StudyState.DEV, // Default - Development
    description: "",
  })
  const classes = useStyles()
  const [duplicateCnt, setCount] = useState(0)
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const validate = () => {
    // return !(
    //   duplicateCnt > 0 ||
    //   typeof studyName === "undefined" ||
    //   (typeof studyName !== "undefined" && studyName?.trim() === "")
    // )
    return !(
      duplicateCnt > 0 ||
      !studyDetails.name?.trim() ||
      !studyDetails.purpose ||
      !studyDetails.piInstitution?.trim()
    )
  }

  useEffect(() => {
    let duplicateCount = 0
    if (!(typeof studyName === "undefined" || (typeof studyName !== "undefined" && studyName?.trim() === ""))) {
      duplicateCount = studies.filter((study) => study.name?.trim().toLowerCase() === studyName?.trim().toLowerCase())
        .length
    }
    setCount(duplicateCount)
  }, [studyName])

  const createStudy = async (studyName: string) => {
    setLoading(true)
    let study = new Study()
    study.name = studyName
    Object.assign(study, {
      ...studyDetails,
      timestamps: {
        sharedAt: null,
        productionAt: null,
        completedAt: null,
        firstEnrollmentAt: null,
        lastEnrollmentAt: null,
        suspendedAt: null,
      },
    })
    LAMP.Study.create(researcherId, study)
      .then(async (res) => {
        let result = JSON.parse(JSON.stringify(res))
        // let studiesData = { id: result.data, name: studyName, participant_count: 1, activity_count: 0, sensor_count: 0 }
        const studiesData = {
          id: result.data,
          ...studyDetails,
          participant_count: 0,
          activity_count: 0,
          sensor_count: 0,
        }
        console.log("studies created here", study, studiesData, result)
        Service.addData("studies", [studiesData])
        enqueueSnackbar(`${t("Successfully created new study - studyName.", { studyName: studyName })}`, {
          variant: "success",
        })
        studiesData.participant_count = 0
        handleNewStudy(studiesData)
        closePopUp(2)
        setStudyName("")
        setStudyDetails({
          name: "",
          purpose: StudyPurpose.P,
          piInstitution: "",
          collaboratingInstitutions: [],
          hasFunding: false,
          hasEthicsPermission: false,
          state: StudyState.DEV,
          description: "",
        })
        setLoading(false)
      })
      .catch((e) => {
        enqueueSnackbar(`${t("An error occured while creating new study - studyName.", { studyName: studyName })}`, {
          variant: "error",
        })
        setLoading(false)
      })
  }

  const createNewStudy = (studyName) => {
    let lampAuthId = LAMP.Auth._auth.id
    if (
      LAMP.Auth._type === "researcher" &&
      (lampAuthId === "researcher@demo.lamp.digital" || lampAuthId === "clinician@demo.lamp.digital")
    ) {
      createDemoStudy(studyName)
    } else {
      createStudy(studyName)
    }
  }

  const createDemoStudy = async (studyName: string) => {
    setLoading(true)
    Service.getAll("studies").then((allStudies: any) => {
      let studiesCount = allStudies.length
      let newStudyObj = {
        "#parent": "researcher1",
        "#type": "Study",
        id: "study" + parseInt(studiesCount + 1),
        name: studyName,
        participant_count: 0,
        sensor_count: 0,
        activity_count: 0,
      }
      Service.addData("studies", [newStudyObj])
      enqueueSnackbar(`${t("Successfully created new study - studyName.", { studyName: studyName })}`, {
        variant: "success",
      })
      handleNewStudy(newStudyObj)
      closePopUp(2)
      setStudyName("")
      setLoading(false)
    })
  }

  const handleEnter = () => {
    setStudyName("")
  }

  return (
    <Dialog
      {...props}
      onEnter={handleEnter}
      scroll="paper"
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      classes={{ paper: classes.addNewDialog }}
    >
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <DialogTitle id="alert-dialog-slide-title" disableTypography>
        <Typography variant="h6">{`${t("Add a new study")}`}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={() => {
            setStudyName("")
            closePopUp(2)
          }}
        >
          <Icon>close</Icon>
        </IconButton>
      </DialogTitle>
      {/* <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
        <TextField
          error={!validate()}
          autoFocus
          fullWidth
          variant="outlined"
          label={`${t("study Name")}`}
          value={studyName}
          onChange={(e) => {
            setStudyName(e.target.value)
          }}
          inputProps={{ maxLength: 80 }}
          helperText={
            duplicateCnt > 0
              ? `${t("Unique study name required")}`
              : !validate()
              ? `${t("Please enter study name.")}`
              : ""
          }
        />
      </DialogContent>
      */}
      <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
        <Box mb={2}>
          <TextField
            error={!studyDetails.name?.trim()}
            autoFocus
            fullWidth
            variant="outlined"
            label={t("Study Name")}
            value={studyDetails.name}
            onChange={(e) => setStudyDetails((prev) => ({ ...prev, name: e.target.value }))}
            inputProps={{ maxLength: 80 }}
            helperText={
              duplicateCnt > 0
                ? t("Unique study name required")
                : !studyDetails.name?.trim()
                ? t("Please enter study name.")
                : ""
            }
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            required
            select
            variant="outlined"
            label={t("Study Purpose")}
            value={studyDetails.purpose}
            onChange={(e) => setStudyDetails((prev) => ({ ...prev, purpose: e.target.value as StudyPurpose }))}
          >
            <MenuItem value={StudyPurpose.P}>{t("Practice")}</MenuItem>
            <MenuItem value={StudyPurpose.S}>{t("Support")}</MenuItem>
            <MenuItem value={StudyPurpose.R}>{t("Research")}</MenuItem>
            <MenuItem value={StudyPurpose.O}>{t("Other")}</MenuItem>
          </TextField>
        </Box>

        <Box mb={2}>
          <TextField
            error={!studyDetails.piInstitution?.trim()}
            required
            fullWidth
            variant="outlined"
            label={t("PI Institution")}
            value={studyDetails.piInstitution}
            onChange={(e) => setStudyDetails((prev) => ({ ...prev, piInstitution: e.target.value }))}
            helperText={!studyDetails.piInstitution?.trim() && t("PI Institution is required")}
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label={t("Description")}
            value={studyDetails.description}
            onChange={(e) => setStudyDetails((prev) => ({ ...prev, description: e.target.value }))}
          />
        </Box>
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
            onClick={() => {
              createNewStudy(studyName)
            }}
            color="primary"
            autoFocus
            disabled={!validate()}
          >
            {`${t("Save")}`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
