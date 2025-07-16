import React, { useState, useEffect } from "react"
import {
  Grid,
  Paper,
  Box,
  CircularProgress,
  Backdrop,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core"
import { studycardStyles } from "../Researcher/Studies/Index"
import LAMP from "lamp-core"
import { ReactComponent as DeletedIcon } from "../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as SuspendedIcon } from "../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as LoggedInIcon } from "../../icons/NewIcons/circle.svg"
import { ReactComponent as ViewIcon } from "../../icons/NewIcons/overview.svg"
import { ReactComponent as EditIcon } from "../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as DeleteIcon } from "../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as SuspendIcon } from "../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as SuspendFilledIcon } from "../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as PasswordEdit } from "../../icons/NewIcons/password-lock.svg"
import { ReactComponent as VisualizeResearcher } from "../../icons/NewIcons/arrow-left-to-arc.svg"
import Credentials from "../Credentials"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"

import { useCardViewStyles, useFullWidthDividerStyles } from "./ResearcherCardViewStyles"
import { Password } from "@mui/icons-material"

interface ResearcherWithStats {
  id: string
  name?: string
  email?: string
  studyCount?: number
  participantCount?: number
  sensorCount?: number
  activityCount?: number
  isLoggedIn?: boolean
  isShared?: boolean
  systemTimestamps?: {
    deletedAt?: number
    suspensionTime?: number
  }
}

export default function ResearcherCardView({
  loading,
  studyDetails,
  detailedResearchers,
  studyCounts,
  history,
  changeElement,
  ...props
}) {
  const participantcardclasses = studycardStyles()
  const classes = useCardViewStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState<{ id: string | null; tab: string | null }>({ id: null, tab: null })
  const [activeButton, setActiveButton] = useState<{ id: string | null; action: string | null }>({
    id: null,
    action: null,
  })
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [editingResearcher, setEditingResearcher] = useState<ResearcherWithStats | null>(null)
  const fullWidthDividerClasses = useFullWidthDividerStyles()
  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [selectedResearcher, setSelectedResearcher] = useState<ResearcherWithStats | null>(null)

  console.log("INSIDE THE researcher card view", detailedResearchers)

  const handleEdit = (researcher: ResearcherWithStats) => {
    setEditingResearcher(researcher)
    setEditDialog(true)
    setActiveButton({ id: researcher.id, action: "edit" })
  }

  const handleEditSave = async (updatedData: any) => {}

  const handleVisualise = (researcher: ResearcherWithStats) => {
    enqueueSnackbar("Opening researcher visualization", { variant: "info" })
    // Implement navigation or modal as needed
  }

  const handleSuspendUnsuspend = async (researcher) => {
    try {
      let status
      if (researcher.status === "SUSPENDED") {
        status = "ACTIVE"
      } else {
        status = "SUSPENDED"
      }
      const updatedResearcher = {
        ...researcher,
        status: status,
        timestamps: { ...researcher.timestamps, uspendedAt: new Date().getTime() },
      }
      await LAMP.Researcher.update(researcher.id, updatedResearcher)
      props.onResearchersUpdate([updatedResearcher])
    } catch (error) {
      enqueueSnackbar("Failed to update suspension status", { variant: "error" })
    }
  }

  // Expansion logic
  const handleStatClick = (researcher: ResearcherWithStats, statKey: string) => {
    if (selectedTab.id === researcher.id && selectedTab.tab === statKey) {
      setSelectedTab({ id: null, tab: null })
    } else {
      setSelectedTab({ id: researcher.id, tab: statKey })
    }
  }

  const StudyTabContent = ({
    selectedTab,
    researcher,
  }: {
    selectedTab: { id: string | null; tab: string | null }
    researcher: ResearcherWithStats
  }) => {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchTabData = async () => {
        setLoading(true)
        try {
          if (selectedTab.tab === "studies") {
            const allStudies = studyDetails[researcher.id]?.all || []
            setItems(allStudies)
          } else if (selectedTab.tab === "participants") {
            // Use the pre-computed study list that already contains both self-created and joined/shared studies.
            const studies = studyDetails[researcher.id]?.all || []
            console.log(
              "[ResearcherCardView] Participant tab – studies considered:",
              studies.map((s) => s.id)
            )
            let allParticipants: any[] = []
            // Prepare sets to classify study categories
            const selfIds = new Set(studyDetails[researcher.id]?.self.map((s: any) => s.id) || [])
            const sharedIds = new Set(studyDetails[researcher.id]?.shared.map((s: any) => s.id) || [])
            const joinedIds = new Set(studyDetails[researcher.id]?.joined.map((s: any) => s.id) || [])

            // Aggregate participants across all studies and tag them with category.
            for (const study of studies) {
              try {
                const participants = await LAMP.Participant.allByStudy(study.id)
                const groups = study["gname"] || []
                // Determine ownership: if the study creator is different from current researcher, mark participants as external.
                let creatorId =
                  study._parent || study.parent || study.researcher || study.creator || study.createdBy || study.owner
                if (typeof creatorId === "object" && creatorId !== null)
                  creatorId = creatorId.id || creatorId.ResearcherID || ""
                let category: "self" | "shared" | "joined" = "self"
                if (joinedIds.has(study.id)) category = "joined"
                else if (sharedIds.has(study.id)) category = "shared"
                const isExternalStudy = category === "joined"
                if (Array.isArray(participants)) {
                  allParticipants.push(
                    ...participants.map((p) => ({
                      ...p,
                      study_name: study.name,
                      groups: Array.isArray(groups) ? groups : groups ? [groups] : [],
                      category,
                    }))
                  )
                }
              } catch (err) {
                console.error("[ResearcherCardView] Failed to fetch participants for study", study.id, err)
              }
            }
            setItems(allParticipants)
          }
        } catch (err) {
          setItems([])
        } finally {
          setLoading(false)
        }
      }
      fetchTabData()
    }, [selectedTab, researcher])

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" style={{ margin: "16px 0" }}>
          <Typography style={{ fontWeight: 700, fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>Loading...</Typography>
        </Box>
      )
    }

    return (
      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          zIndex: 1,
          paddingBottom: 24,
        }}
      >
        {items.length === 0 ? (
          <Typography>
            {selectedTab.tab === "studies"
              ? "No studies at the present moment."
              : "No participants at the present moment."}
          </Typography>
        ) : selectedTab.tab === "studies" ? (
          items.map((item, index) => (
            <Box key={index} style={{ marginBottom: 8 }}>
              <Typography style={{ fontWeight: 700 }}>{`Study ${index + 1}: ${item.name}`}</Typography>
              {item.description && (
                <Typography style={{ marginBottom: 4 }}>
                  Description: <strong>{item.description}</strong>
                </Typography>
              )}
              <ul style={{ paddingLeft: 16 }}>
                <li>
                  <Typography>
                    Groups: <strong>{Array.isArray(item.gname) ? item.gname.length : item.gname ? 1 : 0}</strong>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Patients: <strong>{item.participants?.length || 0}</strong> | Sensors:{" "}
                    <strong>{item.sensors?.length || 0}</strong> | Activities:{" "}
                    <strong>{item.activities?.length || 0}</strong>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Status: <strong>{item.state || "Production"}</strong>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Creator:{" "}
                    <strong
                      style={{
                        color:
                          item.creatorName && item.creatorName.toLowerCase() === (researcher.name || "").toLowerCase()
                            ? "rgb(202,116,200)"
                            : "#000000",
                      }}
                    >
                      {item.creatorName}
                    </strong>
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Shared with:{" "}
                    {item.sharedWithNames && item.sharedWithNames.length > 0 ? (
                      item.sharedWithNames.map((name: string, i: number) => (
                        <strong
                          key={i}
                          style={{
                            color:
                              name.toLowerCase() === (researcher.name || "").toLowerCase()
                                ? "rgb(202,116,200)"
                                : "#000000",
                          }}
                        >
                          {name}
                          {i < item.sharedWithNames.length - 1 ? ", " : ""}
                        </strong>
                      ))
                    ) : (
                      <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>None</span>
                    )}
                  </Typography>
                </li>
              </ul>
            </Box>
          ))
        ) : (
          items.map((item, index) => (
            <Box key={index} style={{ marginBottom: 8 }}>
              <Typography className={classes.indentText}>
                Participant Name:{" "}
                <strong style={{ color: item.category === "joined" ? "rgb(202,116,200)" : undefined }}>
                  {(() => {
                    const firstName = item.firstName || ""
                    const lastName = item.lastName || ""
                    const fullName = `${firstName} ${lastName}`.trim()
                    return fullName || item.name || item.username || "No Name Available"
                  })()}
                </strong>
              </Typography>
              <Typography className={classes.indentText}>
                Participant ID:{" "}
                <strong style={{ color: item.category === "joined" ? "rgb(202,116,200)" : undefined }}>
                  {item.id}
                </strong>
              </Typography>
              <Typography className={classes.indentText}>
                Groups:{" "}
                <strong style={{ color: item.category === "joined" ? "rgb(202,116,200)" : undefined }}>
                  {item.groups && item.groups.length > 0 ? item.groups.join(", ") : "No Groups Assigned"}
                </strong>
              </Typography>
            </Box>
          ))
        )}
      </div>
    )
  }

  const handleSubmitPassword = async () => {
    try {
      if (updatedPassword !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }
      console.log("IN THE UPDATED PASSWORD", confirmPassword)
      try {
        const tagResponse: any = await LAMP.Type.getAttachment(selectedResearcher.email, "emersive.profile")
        let typeId = null
        if (tagResponse.error) {
          typeId = selectedResearcher.id
        }
        console.log("Credential list, inside researcherCardView", !tagResponse.error, tagResponse)

        const response = (await LAMP.Credential.update(
          typeId,
          selectedResearcher.email,
          JSON.stringify({
            secret_key: confirmPassword,
          })
        )) as any
        console.log("Update response:", response)
        if (response && response.error === "404.no-such-credentials") {
          console.log("Attempting to create new credential...")
          await LAMP.Credential.create(selectedResearcher.id, selectedResearcher.email, confirmPassword)
          enqueueSnackbar("Successfully created new credential", { variant: "success" })
        } else {
          enqueueSnackbar("Successfully updated credential", { variant: "success" })
        }
      } catch (updateError) {
        console.error("Operation error:", updateError)
        throw updateError
      }
      setShowPasswordDialog(false)
      setSelectedResearcher(null)
      setUpdatedPassword("")
      setConfirmPassword("")
      setPasswordError("")
    } catch (error) {
      console.error("Final error:", error)
      enqueueSnackbar(`Failed to create/update credential: ${error.message || "Unknown error"}`, { variant: "error" })
    }
  }

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false)
    setPasswordError("")
    setUpdatedPassword("")
    setConfirmPassword("")
    setSelectedResearcher(null)
  }

  const handleAction = (props) => {
    const { action, researcher, index } = props
    setActiveButton({ id: researcher.id, action })
    switch (action) {
      case "view":
        changeElement({ researcher: researcher, idx: index })
        break
      case "edit":
        handleEdit(researcher) // Needs to see what needs to be done...
        break
      case "passwordEdit":
        setShowPasswordDialog(true)
        setSelectedResearcher(researcher)
        break
      case "suspend":
      case "unsuspend":
        handleSuspendUnsuspend(researcher)
        break
      case "delete":
        setConfirmationDialog(true)
        setSelectedResearcher(researcher)
        break
      case "arrow_forward":
        history?.push(`/researcher/${researcher.id}/studies`)
        break
      default:
        console.warn("Unknown action:", action)
    }
  }

  const handleDelete = async () => {
    let typeId
    const tagResponse: any = await LAMP.Type.getAttachment(selectedResearcher.email, "emersive.profile")
    if (tagResponse.error) {
      typeId = selectedResearcher.id
      await LAMP.Credential.delete(typeId, selectedResearcher.email).catch((error) => {
        enqueueSnackbar(`Failed to delete credential of the Researcher${selectedResearcher.email}:`, {
          variant: "error",
        })
      })
    }
    const deleteResult: any = await LAMP.Researcher.delete(selectedResearcher.id)
    if (deleteResult.error === undefined) {
      enqueueSnackbar(t("Successfully deleted the researcher and all associated credentials."), {
        variant: "success",
      })
    } else {
      enqueueSnackbar(t("Failed to delete the researcher."), {
        variant: "error",
      })
    }
    setConfirmationDialog(false)
    setSelectedResearcher(null)
    props.refreshResearchers()
  }

  return (
    <>
      <Backdrop open={loading} style={{ zIndex: 111111, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="content-container">
        <Grid container spacing={3}>
          {detailedResearchers.map((researcher, idx) => (
            <Grid item xs={12} sm={12} md={6} lg={4} key={researcher.id}>
              <Paper className={participantcardclasses.dhrCard} elevation={3}>
                <Box display="flex" flexDirection="column">
                  <Box display="flex" flexDirection="row" alignItems="flex-start" style={{ marginBottom: "6px" }}>
                    <Box flexGrow={1}>
                      <Typography
                        className={participantcardclasses.cardTitle}
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 500,
                          color: "rgba(0, 0, 0, 0.87)",
                          marginBottom: "2px",
                        }}
                      >
                        {researcher.name || "No Name provided"}
                      </Typography>
                      <Box display="flex" alignItems="center" style={{ marginBottom: "2px" }}>
                        <Typography style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)", marginRight: "8px" }}>
                          {researcher.email}
                        </Typography>
                      </Box>
                    </Box>
                    <div className={participantcardclasses.stateChip}>
                      {researcher.isLoggedIn && <LoggedInIcon className="activeIcon" />}
                      {researcher.systemTimestamps?.deletedAt && <DeletedIcon />}
                      {researcher.systemTimestamps?.suspensionTime && <SuspendedIcon />}
                    </div>
                  </Box>
                  <Divider className={participantcardclasses.titleDivider} />
                  <Grid
                    container
                    className={participantcardclasses.statsGrid}
                    style={{ padding: "6px 0", marginBottom: "8px" }}
                  >
                    <Grid
                      item
                      xs={6}
                      style={{ textAlign: "center", cursor: "pointer" }}
                      onClick={() => handleStatClick(researcher, "studies")}
                    >
                      <Typography
                        className={participantcardclasses.statNumber}
                        style={{ color: "#f2aa85", fontSize: "2rem", fontWeight: 500, lineHeight: 1 }}
                      >
                        {researcher.studyCount || 0}
                      </Typography>
                      <Typography
                        className={participantcardclasses.statLabel}
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.6)",
                          textTransform: "uppercase",
                          marginTop: "2px",
                        }}
                      >
                        STUDIES
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      style={{ textAlign: "center", cursor: "pointer" }}
                      onClick={() => handleStatClick(researcher, "participants")}
                    >
                      <Typography
                        className={participantcardclasses.statNumber}
                        style={{ color: "#06B0F0", fontSize: "2rem", fontWeight: 500, lineHeight: 1 }}
                      >
                        {researcher.participantCount || 0}
                      </Typography>
                      <Typography
                        className={participantcardclasses.statLabel}
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.6)",
                          textTransform: "uppercase",
                          marginTop: "2px",
                        }}
                      >
                        PARTICIPANTS
                      </Typography>
                    </Grid>
                  </Grid>
                  {selectedTab.id === researcher.id ? (
                    <>
                      <Divider className={participantcardclasses.gridDivider} style={{ margin: "16px 0" }} />
                      <StudyTabContent selectedTab={selectedTab} researcher={researcher} />
                      <Divider className={participantcardclasses.titleDivider} />
                    </>
                  ) : (
                    <Divider
                      className={participantcardclasses.gridDivider + " " + fullWidthDividerClasses.fullWidthDivider}
                    />
                  )}
                  <div className={classes.researcherCardStudiesCountCotainer}>
                    <Typography variant="subtitle1" align="center">
                      Studies Count
                    </Typography>
                    <div className={classes.researcherCardStudiesCountContent}>
                      <Typography
                        className={participantcardclasses.cardSubtitle}
                        style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)", marginBottom: "4px" }}
                      >
                        SELF: <strong>{studyCounts[researcher.id]?.self ?? 0}</strong>
                      </Typography>
                      <Typography
                        className={participantcardclasses.cardSubtitle}
                        style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)", marginBottom: "4px" }}
                      >
                        SHARED: <strong>{studyCounts[researcher.id]?.shared ?? 0}</strong>
                      </Typography>
                      <Typography
                        className={participantcardclasses.cardSubtitle}
                        style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)", marginBottom: "4px" }}
                      >
                        JOINED: <strong>{studyCounts[researcher.id]?.joined ?? 0}</strong>
                      </Typography>
                    </div>
                  </div>
                  <Box
                    className={participantcardclasses.actionButtons}
                    display="flex"
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    style={{ gap: 8, marginTop: 16 }}
                  >
                    <VisualizeResearcher
                      className={participantcardclasses.actionIcon}
                      style={{ transform: "scaleX(-1)" }}
                      onClick={() => handleAction({ action: "arrow_forward", researcher, index: idx })}
                    />
                    <ViewIcon
                      className={participantcardclasses.actionIcon}
                      onClick={() => handleAction({ action: "view", researcher, index: idx })}
                    />
                    {/* <EditIcon className={participantcardclasses.actionIcon} onClick={() => handleAction({ action: "edit", researcher, index: idx })} /> */}
                    <PasswordEdit
                      className={participantcardclasses.actionIcon}
                      onClick={() => handleAction({ action: "passwordEdit", researcher, index: idx })}
                    />
                    {researcher.status === "SUSPENDED" ? (
                      <SuspendFilledIcon
                        className={participantcardclasses.actionIcon}
                        onClick={() => handleAction({ action: "suspend", researcher, index: idx })}
                      />
                    ) : (
                      <SuspendIcon
                        className={participantcardclasses.actionIcon}
                        onClick={() => handleAction({ action: "unsuspend", researcher, index: idx })}
                      />
                    )}
                    <DeleteIcon
                      className={participantcardclasses.actionIcon}
                      onClick={() => handleAction({ action: "delete", researcher, index: idx })}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialog} onClose={() => setConfirmationDialog(false)}>
        <DialogTitle>Delete Researcher</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this researcher? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleDelete()} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showPasswordDialog} onClose={handleClosePasswordDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Reset Researcher Password</DialogTitle>
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
          <Button onClick={handleClosePasswordDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleSubmitPassword} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
