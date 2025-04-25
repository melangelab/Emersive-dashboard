// Core Imports
import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  Button,
  Icon,
  TextField,
  MenuItem,
  Checkbox,
  DialogProps,
  Backdrop,
  CircularProgress,
  Typography,
  makeStyles,
  Slide,
  Divider,
  Chip,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP, { Study } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { fetchPostData, fetchResult } from "../SaveResearcherData"
import { updateActivityData, addActivity } from "../ActivityList/ActivityMethods"
import NewPatientDetail from "./NewPatientDetail"
import { slideStyles } from "./AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"
import { StudyPurpose, StudyState } from "./StudyCreator"

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
  chip: {
    margin: theme.spacing(0.5),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  checkboxActive: { color: "#7599FF !important" },
}))

export default function PatientStudyCreator({
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
  researcherId: string
  handleNewStudy: Function
  closePopUp: Function
  resins: string
  open: any
  onclose: Function
  activeModal?: string
  setActiveModal?: Function
  setSlideOpen?: Function
} & DialogProps) {
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const [duplicateCnt, setDuplicateCnt] = useState(0)
  const [gduplicateCnt, setGDuplicateCnt] = useState(0)
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [duplicateStudyName, setDuplicateStudyName] = useState<any>("")
  const [createPatient, setCreatePatient] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newId, setNewId] = useState(null)
  const [studyDetails, setStudyDetails] = useState({
    name: "",
    purpose: StudyPurpose.P,
    piInstitution: resins || "",
    collaboratingInstitutions: [],
    hasFunding: false,
    hasEthicsPermission: false,
    state: StudyState.DEV,
    description: "",
  })
  const [groupNames, setGroupNames] = useState<string[]>([])
  const [currentGroupName, setCurrentGroupName] = useState("")
  const [studyCreated, setStudyCreated] = useState(false)

  const validateGroupNames = () => {
    const uniqueGroupNames = new Set(groupNames)
    return uniqueGroupNames.size === groupNames.length && groupNames.length > 0
  }

  const handleAddGroupName = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentGroupName.trim()) {
      const trimmedGroupName = currentGroupName.trim()
      if (!groupNames.includes(trimmedGroupName)) {
        setGroupNames([...groupNames, trimmedGroupName])
        setCurrentGroupName("")
      } else {
        enqueueSnackbar(t("Group name must be unique"), { variant: "error" })
      }
    }
  }
  const handleRemoveGroupName = (groupToRemove: string) => {
    setGroupNames(groupNames.filter((group) => group !== groupToRemove))
  }

  const validate = (names: string[], count: number) => {
    return !(count > 0 || names.length === 0 || names.some((name) => !name?.trim()))
  }

  const saveStudyData = async (result, type) => {
    for (let resultData of result) {
      Service.addData(type, [resultData])
    }
  }

  useEffect(() => {
    let duplicateCount = 0
    if (
      !(
        typeof studyDetails === "undefined" ||
        (typeof studyDetails !== "undefined" && studyDetails.name?.trim() === "")
      )
    ) {
      duplicateCount = studies?.filter(
        (study) => study.name?.trim().toLowerCase() === studyDetails.name?.trim().toLowerCase()
      ).length
    }
    setDuplicateCnt(duplicateCount)
  }, [studyDetails])

  const createNewStudy = (groupNames, studyName) => {
    let lampAuthId = LAMP.Auth._auth.id
    if (
      LAMP.Auth._type === "researcher" &&
      (lampAuthId === "researcher@demo.lamp.digital" || lampAuthId === "clinician@demo.lamp.digital")
    ) {
      createDemoStudy(studyName)
    } else {
      createStudy(studyName, groupNames)
      // createStudy("Group : " + groupName + " , Study : "+ studyName)
    }
  }

  const createDemoStudy = (studyName) => {
    let shouldAddParticipant = createPatient ?? false
    setLoading(true)
    let newStudyObj: any = {}
    let study = new Study()
    study.name = studyName

    LAMP.Study.create(researcherId, study).then(async (res) => {
      let result = JSON.parse(JSON.stringify(res))
      if (!!result.error) {
        enqueueSnackbar(`${t("Encountered an error: .")}` + result?.error, {
          variant: "error",
        })
      } else {
        Service.getData("studies", duplicateStudyName).then((studyData) => {
          let studyId = result.data
          let studiesData = {
            id: result.data,
            name: studyName,
            participant_count: 0,
            activity_count: duplicateStudyName ? studyData.activity_count : 0,
            sensor_count: duplicateStudyName ? studyData.sensor_count : 0,
          }
          Service.addData("studies", [studiesData])
          if (duplicateStudyName) {
            Service.getDataByKey("activities", [duplicateStudyName], "study_id").then((activityData) => {
              let newActivities = activityData
              newActivities.map((activity) => {
                ;(async () => {
                  activity.studyID = studyId
                  let result = await updateActivityData(activity, true, null)
                  if (result.data) {
                    delete activity["studyID"]
                    activity["id"] = result.data
                    activity.study_id = studyId
                    activity.study_name = studyName
                    addActivity(activity, studies)
                  }
                })()
              })
            })
            Service.getDataByKey("sensors", [duplicateStudyName], "study_id").then((SensorData) => {
              let newSensors = SensorData
              newSensors.map((sensor) => {
                ;(async () => {
                  sensor.studyID = studyId
                  await LAMP.Sensor.create(studyId, sensor).then((res) => {
                    let result = JSON.parse(JSON.stringify(res))
                    delete sensor["studyID"]
                    sensor.study_id = studyId
                    sensor.study_name = studyName
                    sensor.id = result.data
                    Service.addData("sensors", [sensor])
                  })
                })()
              })
            })
          }

          if (shouldAddParticipant) {
            ;(async () => {
              let idData = ((await LAMP.Participant.create(studyId, { study_code: "001" } as any)) as any).data
              let id = typeof idData === "object" ? idData.id : idData
              let newParticipant: any = {}
              if (typeof idData === "object") {
                newParticipant = idData
              } else {
                newParticipant["id"] = idData
              }
              Service.updateCount("studies", newStudyObj.id, "participant_count")
              newParticipant.id = "U" + crypto.getRandomValues(new Uint32Array(1))[0].toString().substring(0, 8)
              newParticipant.study_id = newStudyObj.id
              newParticipant.study_name = studyName
              Service.addData("participants", [newParticipant])
            })()
          }
        })
      }
    })
    setLoading(false)
    handleNewStudy(newStudyObj)
    closePopUp(1)
  }

  const updateStudyLocalStorage = async (authId: string, studyName: string) => {
    let studiesSelected =
      localStorage.getItem("studies_" + authId) !== null ? JSON.parse(localStorage.getItem("studies_" + authId)) : []
    studiesSelected.push(studyName)
    localStorage.setItem("studies_" + authId, JSON.stringify(studiesSelected))
  }

  const createStudy = async (studyName: string, groupNames?: string) => {
    setLoading(true)
    let authId = researcherId
    let authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
    let bodyData = {
      study_id: duplicateStudyName, //old study id
      should_add_participant: createPatient ? createPatient : false,
      name: studyName,
    }
    fetchPostData(authString, authId, "study/clone", "researcher", "POST", bodyData).then((studyData) => {
      let newStudyId = studyData.data
      let newUriStudyID = "?study_id=" + newStudyId
      if (duplicateStudyName) {
        Service.getDataByKey("studies", duplicateStudyName, "id").then((studyAllData: any) => {
          let gnameArray = Array.isArray(studyAllData[0]?.gname) ? [...studyAllData[0].gname] : []
          if (groupNames && groupNames.length > 0) {
            gnameArray.push(...groupNames)
          }
          let newStudyData = {
            id: studyData.data,
            name: studyName,
            gname: gnameArray,
            participant_count: 0,
            activity_count: studyAllData.length > 0 ? studyAllData[0].activity_count : 0,
            sensor_count: studyAllData.length > 0 ? studyAllData[0].sensor_count : 0,
          }
          Service.addData("studies", [newStudyData])
          console.log("checking psc", newStudyData)
          fetchResult(authString, authId, "activity" + newUriStudyID, "researcher").then((result) => {
            let filteredActivities = (result?.activities || []).filter(
              (eachActivities) => eachActivities.study_id === newStudyId
            )
            saveStudyData(filteredActivities, "activities")
          })

          fetchResult(authString, authId, "sensor" + newUriStudyID, "researcher").then((resultData) => {
            let filteredSensors = (resultData?.sensors || []).filter((eachSensors) => {
              return eachSensors.study_id === newStudyId
            })
            saveStudyData(filteredSensors, "sensors")
          })
          let updatedNewStudy = newStudyData
          if (createPatient) {
            fetchResult(authString, authId, "participant" + newUriStudyID, "researcher").then((results) => {
              if (results.studies[0].participants.length > 0) {
                let filteredParticipants = results.studies[0].participants.filter(
                  (eachParticipant) => eachParticipant.study_id === newStudyId
                )
                if (filteredParticipants.length > 0) {
                  filteredParticipants[0].name = studyName
                  saveStudyData(filteredParticipants, "participants").then((d) => {
                    updateStudyLocalStorage(authId, studyName)
                  })
                  setNewId(filteredParticipants[0]?.id)
                  LAMP.Type.setAttachment(filteredParticipants[0]?.id, "me", "lamp.name", studyName ?? null)
                }
              }
              studyUpdate(newStudyData, null, createPatient)
            })
          } else {
            studyUpdate(newStudyData, studyName, createPatient)
          }
        })
      } else {
        let newStudyData = {
          id: studyData.data,
          name: studyName,
          gname: groupNames || [],
          participant_count: 0,
          activity_count: 0,
          sensor_count: 0,
        }
        if (createPatient) {
          fetchResult(authString, authId, "participant" + newUriStudyID, "researcher").then((results) => {
            if (results.studies[0].participants.length > 0) {
              let filteredParticipants = results.studies[0].participants.filter(
                (eachParticipant) => eachParticipant.study_id === newStudyId
              )
              if (filteredParticipants.length > 0) {
                filteredParticipants[0].name = studyName
                saveStudyData(filteredParticipants, "participants").then((d) => {
                  updateStudyLocalStorage(authId, studyName)
                })
                setNewId(filteredParticipants[0]?.id)
                LAMP.Type.setAttachment(filteredParticipants[0]?.id, "me", "lamp.name", studyName ?? null)
              }
            }
            studyUpdate(newStudyData, null, createPatient)
          })
        } else {
          studyUpdate(newStudyData, studyName, createPatient)
        }
      }
    })
  }

  const studyUpdate = (newStudyData, studyName, createPatient) => {
    let authId = researcherId
    newStudyData.participant_count = !!createPatient ? 1 : 0
    setLoading(false)
    if (createPatient) {
      const timestamps = {
        ...newStudyData.timestamps,
        lastEnrollmentAt: new Date(),
        firstEnrollmentAt: new Date(),
      }
      newStudyData.timestamps = timestamps
    }
    Service.addData("studies", [newStudyData])
    if (!!studyName) updateStudyLocalStorage(authId, studyName)
    handleNewStudy(newStudyData)

    LAMP.Study.update(newStudyData.id, newStudyData)
      .then((res) => {
        console.log(res)
      })
      .catch((error) => {
        console.log("error updating group to newly created study", error)
      })

    setStudyCreated(true)
    // handleClose()
  }

  const handleClose = () => {
    setDuplicateStudyName("")
    setCreatePatient(false)
    props.onClose as any
    closePopUp(1)
    setLoading(false)
    setGroupNames([])
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
    closePopUp(1)
    // if (setActiveModal) {
    //   setActiveModal('none')
    // }
    // if (setSlideOpen) {
    //   setSlideOpen(false)
    // }
  }
  const validateStudyDetails = () => {
    return (
      studyDetails.name?.trim() !== "" &&
      studyDetails.piInstitution.trim() !== "" &&
      groupNames.length > 0 &&
      duplicateCnt === 0
    )
  }

  return (
    <React.Fragment>
      {!studyCreated ? (
        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
          <Box className={sliderclasses.slidePanel} onClick={(e) => e.stopPropagation()}>
            <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose as any}>
              <Icon>close</Icon>
            </IconButton>
            <Box className={sliderclasses.icon}>
              <UserIcon />
            </Box>
            <Typography variant="h6">{`${t("Create a new Study. ")}`}</Typography>
            <TextField
              className={sliderclasses.field}
              error={!validate([studyDetails.name], duplicateCnt)}
              autoFocus
              fullWidth
              variant="outlined"
              label={`${t("Study Name")}`}
              value={studyDetails.name}
              onChange={(e) => {
                // setStudyName(e.target.value)
                setStudyDetails((prev) => ({ ...prev, name: e.target.value }))
              }}
              inputProps={{ maxLength: 80 }}
              helperText={
                duplicateCnt > 0
                  ? `${t("Unique Study name required")}`
                  : !validate([studyDetails.name], duplicateCnt)
                  ? `${t("Please enter new Study name.")}`
                  : ""
              }
            />
            <Divider className={sliderclasses.divider} />
            <TextField
              className={sliderclasses.field}
              error={!validate(groupNames, gduplicateCnt)}
              fullWidth
              variant="outlined"
              label={`${t("Group Name")}`}
              value={currentGroupName}
              onChange={(e) => {
                setCurrentGroupName(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentGroupName.trim()) {
                  // Prevent duplicate group names
                  if (!groupNames.includes(currentGroupName.trim())) {
                    setGroupNames([...groupNames, currentGroupName.trim()])
                    setCurrentGroupName("")
                  } else {
                    enqueueSnackbar(t("Group name must be unique"), { variant: "error" })
                  }
                }
              }}
              inputProps={{ maxLength: 80 }}
              helperText={
                !validate(groupNames, gduplicateCnt)
                  ? `${
                      t("Please enter group name.") +
                      "\n" +
                      t("In order to add group name press enter after you finish typing.")
                    }`
                  : t("Press Enter to add group name")
              }
            />
            <Box display="flex" flexWrap="wrap">
              {groupNames.map((group, index) => (
                <Chip
                  key={index}
                  label={group}
                  onDelete={() => {
                    const newGroupNames = [...groupNames]
                    newGroupNames.splice(index, 1)
                    setGroupNames(newGroupNames)
                  }}
                  className={classes.chip}
                />
              ))}
            </Box>
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
            <Divider className={sliderclasses.divider} />
            <TextField
              className={sliderclasses.field}
              select
              autoFocus
              fullWidth
              variant="outlined"
              label={`${t("Duplicate from")}`}
              value={duplicateStudyName}
              onChange={(e) => {
                setDuplicateStudyName(e.target.value)
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
            {/* <Box ml={-1}>
              <Checkbox
                checked={createPatient}
                onChange={(event) => {
                  setCreatePatient(event.target.checked)
                }}
                classes={{ checked: classes.checkboxActive }}
                inputProps={{ "aria-label": "primary checkbox" }}
              />
              {`${t("Create a new user under this group")}`}
            </Box>
            {!!createPatient && (
              <Typography variant="caption">{`${t("Group name and user name will be same.")}`}</Typography>
            )} */}
            <Box display="flex" justifyContent="flex-start" style={{ gap: 8 }} mt={2}>
              <Button color="primary" onClick={handleClose} className={sliderclasses.button}>
                {`${t("Cancel")}`}
              </Button>
              <Button
                onClick={() => {
                  createNewStudy(groupNames, studyDetails.name)
                }}
                color="primary"
                className={sliderclasses.submitbutton}
                autoFocus
                disabled={
                  !validate(groupNames, gduplicateCnt) ||
                  !validate([studyDetails.name], duplicateCnt) ||
                  !validateStudyDetails()
                }
              >
                {loading ? <CircularProgress size={24} /> : `${t("Confirm")}`}
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
                <Typography variant="subtitle1" color="textSecondary">
                  {t("Study Details")}
                </Typography>
                <Divider light />

                <Box display="flex" justifyContent="space-between" my={1}>
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
                </Box>

                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography variant="body2" color="textPrimary">
                    {t("PI Institution")}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {studyDetails.piInstitution}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" my={1}>
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
                </Box>
              </Box>

              <Box my={2}>
                <Typography variant="subtitle1" color="textSecondary">
                  {t("Groups")}
                </Typography>
                <Divider light />
                {groupNames.map((group, index) => (
                  <Chip key={index} label={group} variant="outlined" style={{ margin: "4px" }} />
                ))}
              </Box>
              {studyDetails.description && (
                <Box my={2}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {t("Description")}
                  </Typography>
                  <Divider light />
                  <Typography variant="body2" color="textSecondary">
                    {studyDetails.description}
                  </Typography>
                </Box>
              )}
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
      {!!newId && <NewPatientDetail id={newId} />}
    </React.Fragment>
  )
}
