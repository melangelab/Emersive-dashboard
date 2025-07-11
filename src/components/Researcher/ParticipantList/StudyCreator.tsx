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
  Slide,
  Divider,
} from "@material-ui/core"

import { useSnackbar } from "notistack"
import LAMP, { Study } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"
import { createPortal } from "react-dom"

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
  open,
  onclose,
  activeModal,
  setActiveModal,
  setSlideOpen,
  ...props
}: {
  studies: any
  researcherId: any
  handleNewStudy: Function
  closePopUp: Function
  resins: any
  open: any
  onclose: Function
  activeModal?: string
  setActiveModal?: Function
  setSlideOpen?: Function
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
  console.log("resins", resins)
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const [duplicateCnt, setCount] = useState(0)
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const validate = () => {
    return !(
      duplicateCnt > 0 ||
      !studyDetails.name?.trim() ||
      !studyDetails.purpose ||
      !studyDetails.piInstitution?.trim()
    )
  }
  const [studyCreated, setStudyCreated] = useState(false)

  useEffect(() => {
    setStudyDetails((prev) => ({
      ...prev,
      piInstitution: resins || "",
    }))
  }, [resins])

  useEffect(() => {
    let duplicateCount = 0
    // if (!(typeof studyName === "undefined" || (typeof studyName !== "undefined" && studyName?.trim() === ""))) {
    duplicateCount = studies?.filter(
      (study) => study.name?.trim().toLowerCase() === studyDetails.name?.trim().toLowerCase()
    ).length
    // }
    setCount(duplicateCount)
  }, [studyName, studyDetails])

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

        // DEBUG: Check current studies in IndexDB before adding
        const currentStudies = await Service.getAll("studies", researcherId)
        console.log("Current studies in IndexDB BEFORE adding:", currentStudies)

        // Wait for IndexDB update to complete
        await Service.addData("studies", [studiesData], researcherId)

        // DEBUG: Check studies in IndexDB after adding
        const updatedStudies = await Service.getAll("studies", researcherId)
        console.log("Updated studies in IndexDB AFTER adding:", updatedStudies)

        enqueueSnackbar(`${t("Successfully created new study - studyName.", { studyName: studyName })}`, {
          variant: "success",
        })
        studiesData.participant_count = 0
        handleNewStudy(studiesData)
        setLoading(false)
        setStudyCreated(true)
      })
      .catch((e) => {
        enqueueSnackbar(`${t("An error occured while creating new study - studyName.", { studyName: studyName })}`, {
          variant: "error",
        })
        setLoading(false)
      })
    setLoading(false)
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
      handleClose()
    })
  }

  const handleClose = () => {
    setStudyName("")
    setCount(0)
    setLoading(false)
    setStudyDetails({
      name: "",
      purpose: StudyPurpose.P,
      piInstitution: resins || "",
      collaboratingInstitutions: [],
      hasFunding: false,
      hasEthicsPermission: false,
      state: StudyState.DEV,
      description: "",
    })
    setStudyCreated(false)
    onclose()
    closePopUp(2)
    // if (setActiveModal) {
    //   setActiveModal('none')
    // }
    // if (setSlideOpen) {
    //   setSlideOpen(false)
    // }
  }

  const handleEnter = () => {
    setStudyName("")
  }

  return (
    <>
      {open &&
        createPortal(
          <>
            {!studyCreated ? (
              <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <Box className={sliderclasses.slidePanel} onClick={(e) => e.stopPropagation()}>
                  <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose as any}>
                    <Icon>close</Icon>
                  </IconButton>
                  <Box className={sliderclasses.icon}>
                    <UserIcon />
                  </Box>
                  <Typography variant="h6">{`${t("Add a new study")}`}</Typography>
                  <TextField
                    className={sliderclasses.field}
                    error={!studyDetails.name?.trim() || duplicateCnt > 0}
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
                  <Divider className={sliderclasses.divider} />
                  <TextField
                    fullWidth
                    className={sliderclasses.field}
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
                  <Divider className={sliderclasses.divider} />
                  <TextField
                    className={sliderclasses.field}
                    error={!studyDetails.piInstitution?.trim()}
                    required
                    fullWidth
                    variant="outlined"
                    label={t("PI Institution")}
                    value={studyDetails.piInstitution}
                    onChange={(e) => setStudyDetails((prev) => ({ ...prev, piInstitution: e.target.value }))}
                    helperText={!studyDetails.piInstitution?.trim() && t("PI Institution is required")}
                  />
                  <Divider className={sliderclasses.divider} />
                  <TextField
                    className={sliderclasses.field}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    label={t("Description")}
                    value={studyDetails.description}
                    onChange={(e) => setStudyDetails((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <Box display="flex" justifyContent="flex-start" style={{ gap: 8 }} mt={2}>
                    <Button onClick={handleClose} color="primary" className={sliderclasses.button}>
                      {`${t("Cancel")}`}
                    </Button>
                    <Button
                      onClick={() => {
                        createNewStudy(studyName)
                      }}
                      color="primary"
                      variant="contained"
                      className={sliderclasses.submitbutton}
                      disabled={!validate()}
                    >
                      {loading ? <CircularProgress size={24} /> : t("Save")}
                    </Button>
                  </Box>
                </Box>
              </Slide>
            ) : (
              <Slide direction="left" in={studyCreated} mountOnEnter unmountOnExit>
                <Box className={sliderclasses.slidePanel} onClick={(e) => e.stopPropagation()}>
                  <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
                    <Icon>close</Icon>
                  </IconButton>
                  <Box className={sliderclasses.icon}>
                    <UserIcon />
                  </Box>
                  <Typography variant="h5" className={sliderclasses.headings}>
                    {t("New Study Created")}
                  </Typography>
                  <Divider className={sliderclasses.divider}></Divider>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                      {studyDetails.name}
                    </Typography>

                    <Box my={2}>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {t("Study Details")}
                      </Typography>
                      <Divider light />

                      <Box
                        mt={2}
                        display="grid"
                        style={{
                          gridTemplateColumns: "200px 1fr",
                          rowGap: 2,
                        }}
                      >
                        <Typography variant="body2" color="textPrimary">
                          {t("Purpose")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {(() => {
                            switch (studyDetails.purpose) {
                              case StudyPurpose.P:
                                return t("Practice")
                              case StudyPurpose.S:
                                return t("Support")
                              case StudyPurpose.R:
                                return t("Research")
                              case StudyPurpose.O:
                                return t("Other")
                              default:
                                return studyDetails.purpose
                            }
                          })()}
                        </Typography>

                        <Typography variant="body2" color="textPrimary">
                          {t("PI Institution")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {studyDetails.piInstitution}
                        </Typography>

                        <Typography variant="body2" color="textPrimary">
                          {t("Study State")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {(() => {
                            switch (studyDetails.state) {
                              case StudyState.DEV:
                                return t("Development")
                              case StudyState.PROD:
                                return t("Production")
                              case StudyState.COMP:
                                return t("Complete")
                              default:
                                return studyDetails.state
                            }
                          })()}
                        </Typography>

                        {studyDetails.description && (
                          <>
                            <Typography variant="body2" color="textPrimary">
                              {t("Description")}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" style={{ whiteSpace: "pre-line" }}>
                              {studyDetails.description}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClose}
                    className={sliderclasses.submitbutton}
                    style={{ marginTop: 16 }}
                  >
                    {t("Exit")}
                  </Button>
                </Box>
              </Slide>
            )}
          </>,
          document.body
        )}
    </>
  )
}
