import React, { useState, useEffect } from "react"
import {
  IconButton,
  Fab,
  Icon,
  Typography,
  Card,
  CardHeader,
  Menu,
  CardActions,
  CardContent,
  Box,
  makeStyles,
  Theme,
  createStyles,
  Checkbox,
  Link,
  Paper,
  Divider,
  Grid,
  TextField,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
  Button,
} from "@material-ui/core"
import LAMP from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
// Local Imports
import ParticipantName from "./ParticipantName"
import Passive from "./PassiveBubble"
import Active from "./ActiveBubble"
import NotificationSettings from "./NotificationSettings"
import Credentials from "../../Credentials"
import ParticipantDetailsDialog from "./ParticipantDetailsDialog"
import { studycardStyles } from "../Studies/Index"
import { ReactComponent as DeletedIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as SuspendedIcon } from "../../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as LoggedInIcon } from "../../../icons/NewIcons/circle.svg"
import { ReactComponent as SuspendIcon } from "../../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as UserAddFilledIcon } from "../../../icons/NewIcons/user-add-filled.svg"
import { ReactComponent as SuspendFilledIcon } from "../../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import ConfirmationDialog from "../../ConfirmationDialog"
import { ReactComponent as VisualiseIcon } from "../../../icons/NewIcons/arrow-left-to-arc.svg"
import { ReactComponent as VisualiseFilledIcon } from "../../../icons/NewIcons/arrow-left-to-arc.svg"
import { ReactComponent as PasswordIcon } from "../../../icons/NewIcons/password-lock.svg"
import { ReactComponent as PasswordFilledIcon } from "../../../icons/NewIcons/password-lock-filled.svg"
import SetPassword from "../../SetPassword"
import { formatLastUse, getItemFrequency } from "../../Utils"
import { fetchResult } from "../SaveResearcherData"
import { canEditParticipant, canViewParticipant } from "./Index"
import { canViewActivity } from "../ActivityList/Index"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbardashboard: {
      minHeight: 100,
      padding: "0 10px",
      "& h5": {
        color: "rgba(0, 0, 0, 0.75)",
        textAlign: "left",
        fontWeight: "600",
        fontSize: 30,
        width: "calc(100% - 96px)",
      },
    },
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
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    cardMain: {
      borderRadius: 16,
      // boxShadow: "none !important ",
      margin: "11px",
      background: "#E0E0E0",
      "& span.MuiCardHeader-title": { fontSize: "16px", fontWeight: 500 },
    },
    checkboxActive: { color: "#7599FF !important" },
    participantHeader: { padding: "12px 5px 0", wordBreak: "break-all" },
    moreBtn: {},
    participantSub: { padding: "0 5px", "&:last-child": { paddingBottom: 10 } },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",
      "& svg": { marginRight: 8 },
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    settingslink: {
      background: "#fff",
      width: 40,
      height: 40,
      borderRadius: "50%",
      padding: 8,
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
  })
)

export default function ParticipantListItem({
  participant,
  onParticipantSelect,
  studies,
  notificationColumn,
  handleSelectionChange,
  selectedParticipants,
  researcherId,
  onViewParticipant,
  researcherName,
  sharedstudies,
  ...props
}) {
  const classes = useStyles()
  const [checked, setChecked] = React.useState(
    selectedParticipants.filter((d) => d.id === participant.id).length > 0 ? true : false
  )
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const participantcardclasses = studycardStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [user, setName] = useState(participant)
  const [openSettings, setOpenSettings] = useState(false)
  // const pStudy = studies.filter((study) => study.id === participant.study_id)[0]
  const pStudy =
    studies.find((study) => study.id === participant.study_id) ||
    (sharedstudies ? sharedstudies.find((study) => study.id === participant.study_id) : undefined)
  const [selectedTab, setSelectedTab] = useState({ id: null, tab: null })
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const canEdit = canEditParticipant(participant, studies, researcherId, sharedstudies)
  const canView = canViewParticipant(participant, studies, researcherId, sharedstudies)

  const stats = (participant, study) => {
    return [
      {
        value: participant.assessments?.length || study.assessments?.length || 0,
        label: "ASSESSMENTS",
        color: "#f2aa85",
        key: "assessments",
      },
      {
        value: participant.activities?.length || study.activities?.length || 0,
        label: "ACTIVITIES",
        color: "#06B0F0",
        key: "activities",
      },
      {
        value: participant.sensors?.length || study.sensors?.length || 0,
        label: "SENSORS",
        color: "#75d36d",
        key: "sensors",
      },
    ]
  }

  const StudyTabContent = ({ selectedTab, study, participant, participantcardclasses }) => {
    const [items, setItems] = useState([])
    const [participantData, setParticipantData] = useState(null)
    const [activityEvents, setActivityEvents] = useState([])
    const [sensorEvents, setSensorEvents] = useState([])
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
          const result = await fetchResult(authString, study.id, "participant/mode/5", "study")
          const data = result.participants?.find((p) => p.id === participant.id)
          setParticipantData(data)

          let newItems = []
          if (selectedTab.tab === "assessments") {
            newItems = study.activities?.filter((a) => a.category?.includes("assess")) || []
          } else if (selectedTab.tab === "activities") {
            newItems = study.activities || []
          } else if (selectedTab.tab === "sensors") {
            newItems = study.sensors || []
          }
          setItems(newItems)
        } catch (err) {
          console.error("Error fetching participant data:", err)
          setItems([])
          setParticipantData(null)
        }
        try {
          const Aresult = await LAMP.ActivityEvent.allByParticipant(participant.id)
          const Sresult = await LAMP.SensorEvent.allByParticipant(participant.id)
          setActivityEvents(Aresult)
          setSensorEvents(Sresult)
          console.log(Aresult, "Aresult")
          console.log(Sresult, "Sresult")
        } catch (err) {
          console.error("Error fetching event data:", err)
          setActivityEvents([])
          setSensorEvents([])
        }
      }

      fetchStats()
    }, [selectedTab, study, participant])

    const getLastEvent = (item) => {
      if (!participantData) return null

      if (selectedTab.tab === "assessments" || selectedTab.tab === "activities") {
        return participantData.last_activity_events?.find((e) => e.activity_id === item.id)?.last_event || null
      } else if (selectedTab.tab === "sensors") {
        return participantData.last_sensor_events?.find((s) => s.sensor_spec === item.spec)?.last_event || null
      }
      return null
    }

    const formatLastUse = (timestamp) => {
      if (!timestamp) return "Never"
      return new Date(timestamp).toLocaleString()
    }
    const getTotalCompleted = (item) => {
      if (selectedTab.tab === "assessments" || selectedTab.tab === "activities") {
        return activityEvents.filter((event) => event.activity === item.id).length
      } else if (selectedTab.tab === "sensors") {
        return sensorEvents.filter((event) => event.sensor === item.spec).length
      }
      return 0
    }

    return (
      <Box className={participantcardclasses.groupList}>
        {items.length === 0 ? (
          <Typography className={participantcardclasses.groupName}>
            {`No ${selectedTab.tab} present at this moment.`}
          </Typography>
        ) : (
          items.map((item, index) => (
            <Box key={index} className={participantcardclasses.groupItem}>
              <Typography className={participantcardclasses.groupName}>
                {item.name} [ID-{item.id}]: {item.spec}
              </Typography>
              <ul className={participantcardclasses.bulletList}>
                <li>
                  <Typography className={participantcardclasses.groupDesc}>
                    Frequency: {getItemFrequency(item, selectedTab.tab)}
                  </Typography>
                </li>
                <li>
                  <Typography className={participantcardclasses.groupDesc}>
                    Total times completed: {getTotalCompleted(item) || 0}
                  </Typography>
                </li>
                <li>
                  <Typography className={participantcardclasses.groupDesc}>
                    Last Use: {formatLastUse(getLastEvent(item)?.timestamp)}
                  </Typography>
                </li>
              </ul>
            </Box>
          ))
        )}
      </Box>
    )
  }

  const renderStudyTabContent = (selectedTab, study, participantcardclasses, studySubvs?) => {
    let items = []

    switch (selectedTab.tab) {
      case "assessments":
        items = study.activities?.filter((a) => a.category?.includes("assess")) || []
        break
      case "activities":
        items = study.activities || []
        break
      case "sensors":
        items = study.sensors || []
        break
      default:
        return null
    }
    console.log(items, "items", studySubvs)
    const getLastEvent = (item) => {
      if (!studySubvs) return null

      if (selectedTab.tab === "assessments" || selectedTab.tab === "activities") {
        return studySubvs.last_activity_events?.find((e) => e.activity_id === item.id)?.last_event
      } else if (selectedTab.tab === "sensors") {
        return studySubvs.last_sensor_events?.find((s) => s.sensor_spec === item.spec)?.last_event
      }
      return null
    }

    return (
      <Box className={participantcardclasses.groupList}>
        {items.length === 0 ? (
          <Typography className={participantcardclasses.groupName}>
            {`No ${selectedTab.tab} present at this moment.`}
          </Typography>
        ) : (
          items.map((item, index) => (
            <Box key={index} className={participantcardclasses.groupItem}>
              <Typography className={participantcardclasses.groupName}>
                {item.name} [ID-{item.id}]: {item.spec}
              </Typography>
              <ul className={participantcardclasses.bulletList}>
                <li>
                  <Typography className={participantcardclasses.groupDesc}>
                    Frequency: {getItemFrequency(item, selectedTab.tab)}
                  </Typography>
                </li>
                <li>
                  <Typography className={participantcardclasses.groupDesc}>
                    Total times completed: {item.completedCount || 0}
                  </Typography>
                </li>
                <li>
                  <Typography className={participantcardclasses.groupDesc}>
                    Last Use: {formatLastUse(getLastEvent(item)?.timestamp) || "Never"}
                  </Typography>
                </li>
              </ul>
            </Box>
          ))
        )}
      </Box>
    )
  }

  const handleChange = (participant, event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    handleSelectionChange(participant, event.target.checked)
  }

  const updateParticipant = (nameVal: string) => {
    setName({ ...user, name: nameVal })
  }

  useEffect(() => {
    setName(user)
  }, [user])

  useEffect(() => {}, [])

  const handleDelete = async (status) => {
    if (status === "Yes") {
      try {
        const credentials = await LAMP.Credential.list(participant.id)
        const filteredCreds = credentials.filter((c) => c.hasOwnProperty("origin"))
        for (let cred of filteredCreds) {
          await LAMP.Credential.delete(participant.id, cred["access_key"])
        }
        await LAMP.Type.setAttachment(participant.id, "me", "lamp.name", null)
        await LAMP.Participant.delete(participant.id)
        await Service.delete("participants", [participant.id])
        await Service.updateCount("studies", participant.study_id, "participant_count", 1, 1)
        // await props.searchActivities()
        enqueueSnackbar(t("Participant deleted successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error deleting participant:", error)
        enqueueSnackbar(t("Failed to delete participant"), { variant: "error" })
      }
    } else {
      setConfirmationDialog(false)
    }
    setConfirmationDialog(false)
    setActiveButton({ id: null, action: null })
    props.refreshParticipants?.()
  }

  const handleCloseDialog = () => {
    setShowPasswordDialog(false)
    setPasswordError("")
  }

  const handleSubmitPassword = async () => {
    try {
      // Validate passwords
      if (updatedPassword !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      console.log("IN THE UPDATED PASSWORD", confirmPassword)

      try {
        console.log("Attempting to update credential...", activeButton.id, participant)
        const credlist = await LAMP.Credential.list(activeButton.id)
        const response = (await LAMP.Credential.update(activeButton.id, participant.email, {
          ...(credlist[0] as any),
          secret_key: confirmPassword,
        })) as any
        console.log("Update response:", response)

        // Check if response contains error
        if (response && response.error === "404.no-such-credentials") {
          console.log("Attempting to create new credential...")
          await LAMP.Credential.create(activeButton.id, participant.email, confirmPassword)
          enqueueSnackbar("Successfully created new credential", { variant: "success" })
        } else {
          enqueueSnackbar("Successfully updated credential", { variant: "success" })
        }
      } catch (updateError) {
        console.error("Operation error:", updateError)
        throw updateError
      }
      setActiveButton({ id: null, action: null })
      setConfirmPassword("")
      setUpdatedPassword("")
      setPasswordError("")
      setShowPasswordDialog(false)
    } catch (error) {
      console.error("Final error:", error)
      enqueueSnackbar(`Failed to create/update credential: ${error.message || "Unknown error"}`, { variant: "error" })
    }
  }

  return (
    <Paper className={participantcardclasses.dhrCard} elevation={3}>
      <Box display={"flex"} flexDirection={"column"}>
        <Box display={"flex"} flexDirection={"row"}>
          <Checkbox
            checked={checked}
            onChange={(event) => handleChange(participant, event)}
            classes={{ checked: classes.checkboxActive }}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
          <Box flexGrow={1}>
            <Typography className={participantcardclasses.cardTitle}>
              {participant.lastName || participant.firstName
                ? participant.firstName + " " + participant.lastName
                : "No Name provided."}
            </Typography>
            <ParticipantName participant={user} updateParticipant={updateParticipant} openSettings={openSettings} />
          </Box>
          <div className={participantcardclasses.stateChip}>
            {participant.isLoggedIn && <LoggedInIcon className="activeIcon" />}
            {participant.systemTimestamps?.deletedAt && <DeletedIcon />}
            {participant.systemTimestamps?.suspensionTime && <SuspendedIcon />}
          </div>
        </Box>
        {participant.isShared && <Box className={participantcardclasses.sharedBadge}>{t("Shared")}</Box>}
        <Divider className={participantcardclasses.titleDivider} />
        <Grid container className={participantcardclasses.statsGrid}>
          {stats(participant, pStudy).map((stat) => (
            <Grid
              item
              xs={3}
              key={stat.key}
              className={`${participantcardclasses.statItem} ${
                selectedTab.id === participant.id && selectedTab.tab === stat.key ? "selected" : ""
              }`}
              onClick={() => {
                selectedTab.id === participant.id && selectedTab.tab === stat.key
                  ? setSelectedTab({ id: null, tab: null })
                  : setSelectedTab({ id: participant.id, tab: stat.key })
              }}
            >
              <Typography className={participantcardclasses.statNumber} style={{ color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography className={participantcardclasses.statLabel}>{stat.label}</Typography>
            </Grid>
          ))}
        </Grid>
        {selectedTab.id === participant.id && <Divider className={participantcardclasses.gridDivider} />}
        {/* {selectedTab.id === participant.id &&
          renderStudyTabContent(selectedTab, pStudy, participantcardclasses, participant)} */}
        {selectedTab.id === participant.id && (
          <StudyTabContent
            selectedTab={selectedTab}
            study={pStudy}
            participant={participant}
            participantcardclasses={participantcardclasses}
          />
        )}
        <Divider className={participantcardclasses.titleDivider} />
        <Typography className={participantcardclasses.cardSubtitle}>
          {`RESEARCHER - `}
          <strong>{`${researcherName || "No Researcher name found; this is unusual."}`}</strong>
        </Typography>
        <Typography className={participantcardclasses.cardSubtitle}>
          {`STUDY: `}
          <strong>{`${participant.study_name || "Not enrolled in any Study - this is unsual."}`}</strong>
        </Typography>
        <Typography className={participantcardclasses.cardSubtitle}>
          {`GROUP: `}
          <strong>{`${participant.group_name || "Not enrolled in any Group"}`}</strong>
        </Typography>
        <Box display={"flex"} flexDirection={"row"}>
          <Passive participant={participant} />
          <Active participant={participant} />
        </Box>
        <Box className={participantcardclasses.actionButtons}>
          {!!notificationColumn && <NotificationSettings participant={participant} />}
          {activeButton.id === participant.id && activeButton.action === "view" ? (
            <ViewFilledIcon
              className={`${participantcardclasses.actionIcon} active`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "view" })
                onViewParticipant(participant)
                // onParticipantSelect(participant.id)
                setActiveButton({ id: null, action: null })
              }}
            />
          ) : (
            <ViewIcon
              className={`${participantcardclasses.actionIcon} ${
                activeButton.id === participant.id && activeButton.action === "view" ? "active" : ""
              }`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "view" })
                onViewParticipant(participant)
                // onParticipantSelect(participant.id)
                setActiveButton({ id: null, action: null })
              }}
            />
          )}
          {activeButton.id === participant.id && activeButton.action === "enter" ? (
            <VisualiseFilledIcon
              className={`${participantcardclasses.actionIcon} active`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "enter" })
                onParticipantSelect(participant.id)
                setActiveButton({ id: null, action: null })
              }}
            />
          ) : (
            <VisualiseIcon
              className={`${participantcardclasses.actionIcon} ${
                activeButton.id === participant.id && activeButton.action === "enter" ? "active" : ""
              }`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "enter" })
                onParticipantSelect(participant.id)
                setActiveButton({ id: null, action: null })
              }}
            />
          )}
          {/* {activeButton.id === participant.id && activeButton.action === "edit" ? (
            <EditFilledIcon
              className={`${participantcardclasses.actionIcon} active`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "edit" })
                setDetailsDialogOpen(true)
              }}
            />
          ) : (
            <EditIcon
              className={`${participantcardclasses.actionIcon} ${activeButton.id === participant.id && activeButton.action === "edit" ? "active" : ""
                }`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "edit" })
                setDetailsDialogOpen(true)
              }}
            />
          )} */}
          {canEdit && (
            <>
              {activeButton?.id === participant.id && activeButton?.action === "credentials" ? (
                <PasswordFilledIcon
                  className={`${participantcardclasses.actionIcon} active`}
                  onClick={() => {
                    setActiveButton?.({ id: participant.id, action: "credentials" })
                    setShowPasswordDialog(true)
                  }}
                />
              ) : (
                <PasswordIcon
                  className={participantcardclasses.actionIcon}
                  onClick={() => {
                    setActiveButton?.({ id: participant.id, action: "credentials" })
                    setShowPasswordDialog(true)
                  }}
                />
              )}
              {/* <Credentials user={participant} activeButton={activeButton} setActiveButton={setActiveButton} /> */}
              {!participant.systemTimestamps?.suspensionTime ? (
                activeButton.id === participant.id && activeButton.action === "suspend" ? (
                  <SuspendFilledIcon
                    className={`${participantcardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: participant.id, action: "suspend" })
                      props.onSuspend(participant, setActiveButton)
                    }}
                  />
                ) : (
                  <SuspendIcon
                    className={participantcardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: participant.id, action: "suspend" })
                      props.onSuspend(participant, setActiveButton)
                    }}
                  />
                )
              ) : activeButton.id === participant.id && activeButton.action === "suspend" ? (
                <SuspendFilledIcon
                  className={`${participantcardclasses.actionIcon} active`}
                  onClick={() => {
                    setActiveButton({ id: participant.id, action: "suspend" })
                    props.onUnSuspend(participant, setActiveButton)
                  }}
                />
              ) : (
                <SuspendIcon
                  className={participantcardclasses.actionIcon}
                  onClick={() => {
                    setActiveButton({ id: participant.id, action: "suspend" })
                    props.onUnSuspend(participant, setActiveButton)
                  }}
                />
              )}
            </>
          )}
          {!participant.isShared && (
            <>
              {activeButton.id === participant.id && activeButton.action === "delete" ? (
                <DeleteFilledIcon
                  className={`${participantcardclasses.actionIcon} active`}
                  onClick={() => {
                    setActiveButton({ id: participant.id, action: "delete" })
                    setConfirmationDialog(true)
                  }}
                />
              ) : (
                <DeleteIcon
                  className={participantcardclasses.actionIcon}
                  onClick={() => {
                    setActiveButton({ id: participant.id, action: "delete" })
                    setConfirmationDialog(true)
                  }}
                />
              )}
            </>
          )}
          {/* {activeButton.id === participant.id && activeButton.action === "settings" ? (
            <CopyFilledIcon
              className={`${participantcardclasses.actionIcon} active`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "settings" })
                window.location.href = `/#/researcher/${researcherId}/participant/${participant?.id}/settings`
              }}
            />
          ) : (
            <CopyIcon
              className={`${participantcardclasses.actionIcon} ${activeButton.id === participant.id && activeButton.action === "settings" ? "active" : ""
                }`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "settings" })
                window.location.href = `/#/researcher/${researcherId}/participant/${participant?.id}/settings`
              }}
            />
          )} */}
        </Box>
        <ParticipantDetailsDialog
          participant={participant}
          open={detailsDialogOpen}
          onClose={() => {
            setDetailsDialogOpen(false)
            setActiveButton({ id: null, action: null })
          }}
          onSave={async (updatedParticipant) => {
            try {
              await props.onParticipantUpdate(participant.id, updatedParticipant)
              setDetailsDialogOpen(false)
            } catch (error) {
              console.error("Error updating participant:", error)
            } finally {
              setDetailsDialogOpen(false)
              setActiveButton({ id: null, action: null })
            }
          }}
          formatDate={props.formatDate}
          researcherId={researcherId}
          pStudy={pStudy}
        />
        <ConfirmationDialog
          open={confirmationDialog}
          onClose={() => {
            setConfirmationDialog(false)
            setActiveButton({ id: null, action: null })
          }}
          confirmAction={handleDelete}
          confirmationMsg={t(
            `Are you sure you want to delete "${
              participant.lastName || participant.firstName
                ? participant.firstName + " " + participant.lastName
                : "this Participant"
            }"?`
          )}
        />
      </Box>
      <Dialog open={showPasswordDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Reset Participant Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Typography color="error" variant="body2" gutterBottom>
              {passwordError}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="new-password"
            label="New Password"
            type="password"
            fullWidth
            value={updatedPassword}
            onChange={(e) => setUpdatedPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            id="confirm-password"
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleSubmitPassword} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
