import React, { useState, useEffect } from "react"
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Icon,
  Box,
  Link,
  makeStyles,
  Theme,
  createStyles,
  Fab,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@material-ui/core"
import LAMP from "lamp-core"
import ActivityDetailsDialog from "./ActivityDetailsDialog"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import ScheduleActivity from "./ScheduleActivity"
import UpdateActivity from "./UpdateActivity"
import ConfirmationDialog from "../../ConfirmationDialog"
import { Service } from "../../DBService/DBService"
import VersionHistoryDialog from "./VersionHistoryDialog"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",
      "& svg": { marginRight: 8 },
      "&:hover": {
        color: "#5680f9",
        background: "#fff",
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      },
    },
    actionCell: {
      position: "sticky",
      right: 0,
      background: "white",
      zIndex: 1,
      padding: theme.spacing(1),
    },
    versionBadge: {
      display: "inline-flex",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#e3f2fd",
      color: "#1976d2",
      alignItems: "center",
      gap: theme.spacing(0.5),
    },
    scoreBox: {
      padding: theme.spacing(1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#f5f5f5",
      marginTop: theme.spacing(1),
    },
    checkboxActive: {
      color: "#7599FF !important",
    },
    copyableCell: {
      cursor: "copy",
      position: "relative",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      "&::after": {
        content: '""', // Empty content for background
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        width: "16px",
        height: "16px",
        backgroundImage: 'url("path/to/copy-icon.svg")', // Or use Material UI icon
        backgroundSize: "contain",
        opacity: 0,
        transition: "opacity 0.2s",
      },
      "&:hover::after": {
        opacity: 1,
      },
    },
    studyCell: {
      cursor: "copy",
      position: "relative",
      display: "inline-block",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      "&:hover .studyId": {
        display: "block",
      },
    },
    studyName: {
      position: "relative",
      zIndex: 1,
    },
    studyId: {
      display: "none",
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      padding: theme.spacing(1),
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      borderRadius: theme.shape.borderRadius,
      fontSize: "0.75rem",
      color: theme.palette.text.secondary,
      zIndex: 2,
      marginTop: "4px",
    },
    versionItem: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
    versionFlag: {
      display: "inline-flex",
      alignItems: "center",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      marginRight: theme.spacing(1),
    },
    versionInfo: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
    versionActions: {
      display: "flex",
      gap: theme.spacing(1),
    },
    btnVersion: {
      fill: "33e9ff",
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      minWidth: "32px",
      width: "32px",
      height: "32px",
      "&:hover": {
        background: "#fff",
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      },
    },
    communityRow: {
      backgroundColor: "#F0F7FF !important",
    },
    communityBadge: {
      display: "inline-flex",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#7599FF",
      color: "white",
      alignItems: "center",
      gap: theme.spacing(0.5),
      marginLeft: theme.spacing(1),
    },
  })
)

interface ScoreRange {
  min: number
  max: number
  interpretation: string
  severity?: "low" | "moderate" | "high" | "severe"
  recommendedAction?: string
}

interface ScoreInterpretationSchema {
  type: "numeric" | "categorical" | "percentage"
  unit?: string
  ranges: ScoreRange[]
  defaultInterpretation?: string
  notes?: string
}

export default function ActivityTableRow({
  activity,
  visibleColumns,
  selectedActivities,
  handleChange,
  researcherId,
  studies,
  onActivityUpdate,
  activities,
  setActivities,
  ...props
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [checked, setChecked] = useState(selectedActivities.filter((d) => d.id === activity.id).length > 0)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedStudies, setSelectedStudies] = useState(activity.sharingStudies || [])
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [confirmationVersionDialog, setConfirmationVersionDialog] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [selectedStudyForDuplicate, setSelectedStudyForDuplicate] = useState("")
  const [duplicateLoading, setDuplicateLoading] = useState(false)

  const handlePreviewVersion = async (version) => {
    try {
      setPreviewDialogOpen(true)
      setSelectedVersion(version)
    } catch (error) {
      console.error("Error previewing version:", error)
      enqueueSnackbar(t("Failed to preview version"), { variant: "error" })
    }
  }
  const handleVersioning = async () => {
    try {
      const updatedActivity = { ...activity, versionThis: true }
      await onActivityUpdate(activity.id, updatedActivity)
      enqueueSnackbar(t("Successfully versioned the activity."), { variant: "success", autoHideDuration: 2000 })
    } catch {
      enqueueSnackbar(t("Error in versioning the activity."), { variant: "error", autoHideDuration: 2000 })
      console.log(`Activity ID ${activity.id} failed for versioning ${activity}`)
    }
  }
  const handleRestoreVersion = async (version) => {
    try {
      const updatedActivity = {
        ...activity,
        settings: version.details?.settings,
        name: version.details?.name,
        // Add other fields to restore
      }
      await onActivityUpdate(activity.id, updatedActivity)
      enqueueSnackbar(t("Version restored successfully"), { variant: "success" })
      setVersionHistoryOpen(false)
    } catch (error) {
      console.error("Error restoring version:", error)
      enqueueSnackbar(t("Failed to restore version"), { variant: "error" })
    }
  }

  useEffect(() => {
    setChecked(selectedActivities.filter((d) => d.id === activity.id).length > 0)
  }, [selectedActivities, activity.id])

  const handleCheckChange = (event) => {
    setChecked(event.target.checked)
    handleChange(activity, event.target.checked)
  }

  // const formatDate = (date) => {
  //   return date ? new Date(date).toLocaleDateString() : 'Not available'
  // }

  const confirmShareActivity = async (val: string) => {
    try {
      // TODO : make this activity discoverable to other researchers i.e. set a flag on activities for communitybuild
      if (val == "Yes") {
        console.log("confirmShareActivity", val)
        const updatedActivity = {
          ...activity,
          shareTocommunity: !activity.shareTocommunity,
        }
        await onActivityUpdate(activity.id, updatedActivity)
        setShareDialogOpen(false)
        enqueueSnackbar(t("Activity published in community successfully"), {
          variant: "success",
          autoHideDuration: 1000,
        })
      }
    } catch (error) {
      console.error("Error sharing activity:", error)
      enqueueSnackbar(t("Failed to publish activity in community."), { variant: "error" })
    }
  }
  const handleShareActivity = async () => {
    try {
      const updatedActivity = {
        ...activity,
        sharingStudies: selectedStudies,
      }
      await onActivityUpdate(activity.id, updatedActivity)
      setShareDialogOpen(false)
      enqueueSnackbar(t("Activity shared successfully"), { variant: "success" })
    } catch (error) {
      console.error("Error sharing activity:", error)
      enqueueSnackbar(t("Failed to share activity"), { variant: "error" })
    }
  }

  const handleDeleteActivity = async (status) => {
    if (status === "Yes") {
      try {
        // Delete activity tags if they exist
        if (activity.spec === "lamp.survey") {
          await LAMP.Type.setAttachment(activity.id, "me", "lamp.dashboard.survey_description", null)
        } else {
          await LAMP.Type.setAttachment(activity.id, "me", "lamp.dashboard.activity_details", null)
        }
        await LAMP.Activity.delete(activity.id)
        await Service.delete("activities", [activity.id])
        await Service.updateCount("studies", activity.study_id, "activity_count", 1, 1)
        setActivities((prev) => prev.filter((a) => a.id !== activity.id))
        await props.searchActivities()
        enqueueSnackbar(t("Activity deleted successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error deleting activity:", error)
        enqueueSnackbar(t("Failed to delete activity"), { variant: "error" })
      }
    }
    setConfirmationDialog(false)
  }

  const handleDuplicateActivity = async () => {
    if (!selectedStudyForDuplicate) {
      enqueueSnackbar(t("Please select a study"), { variant: "error" })
      return
    }

    setDuplicateLoading(true)
    try {
      const newActivity = {
        ...activity,
        name: `${activity.name} (Copy)`,
        spec: activity.spec,
        settings: activity.settings,
        schedule: [],
        category: activity.category,
        sharingStudies: [],
        scoreInterpretation: activity.scoreInterpretation || {},
        activityGuide: activity.activityGuide || null,
        versionHistory: [],
        shareTocommunity: false,
        currentVersion: null,
      }
      const newActivityId = await LAMP.Activity.create(selectedStudyForDuplicate, newActivity)
      await Service.addData("activities", [
        {
          id: newActivityId,
          ...newActivity,
          study_id: selectedStudyForDuplicate,
        },
      ])
      setDuplicateDialogOpen(false)
      if (props.searchActivities) {
        props.searchActivities()
      }
      enqueueSnackbar(t("Activity duplicated successfully"), { variant: "success" })
    } catch (error) {
      console.error("Error duplicating activity:", error)
      enqueueSnackbar(t("Failed to duplicate activity"), { variant: "error" })
    } finally {
      setDuplicateLoading(false)
    }
  }

  return (
    <>
      <TableRow
        hover
        role="checkbox"
        aria-checked={checked}
        selected={checked}
        className={activity.shareTocommunity ? classes.communityRow : ""}
      >
        <TableCell padding="checkbox">
          {!activity.isCommunityActivity && (
            <Checkbox checked={checked} onChange={handleCheckChange} className={classes.checkboxActive} />
          )}
          {activity.isCommunityActivity && <Box className={classes.communityBadge}>{t("Community")}</Box>}
        </TableCell>

        {visibleColumns.map((column) => (
          <TableCell key={column.id}>
            {column.id === "id" ? (
              <Box
                className={classes.copyableCell}
                onClick={() => {
                  window.navigator?.clipboard?.writeText?.(activity.id)
                  enqueueSnackbar("ID copied to clipboard", {
                    variant: "success",
                    autoHideDuration: 1000,
                  })
                }}
              >
                {activity.id}
              </Box>
            ) : column.id === "study" ? (
              <Box
                className={classes.studyCell}
                onClick={() => {
                  window.navigator?.clipboard?.writeText?.(activity.study_id)
                  enqueueSnackbar("Study ID copied to clipboard", {
                    variant: "success",
                    autoHideDuration: 1000,
                  })
                }}
              >
                <Typography className={classes.studyName}>{activity.study_name || "No Study Name"}</Typography>
                <Box className={classes.studyId}>{`ID: ${activity.study_id}`}</Box>
              </Box>
            ) : column.id === "version" ? (
              <Box className={classes.versionBadge}>
                <Icon fontSize="small">flag</Icon>
                {activity.currentVersion?.name || "v1"}
              </Box>
            ) : column.id === "scoreInterpretation" ? (
              <Box className={classes.scoreBox}>
                {Object.entries(activity.scoreInterpretation || {}).map(([key, schema]) => (
                  <Typography key={key} variant="body2">
                    {key}: {(schema as ScoreInterpretationSchema).ranges.length} ranges
                  </Typography>
                ))}
              </Box>
            ) : (
              column.value(activity)
            )}
          </TableCell>
        ))}

        <TableCell className={classes.actionCell}>
          <Box display="flex" style={{ gap: 8 }}>
            {activity.isCommunityActivity ? (
              <Fab size="small" className={classes.btnWhite} onClick={() => setDuplicateDialogOpen(true)}>
                <Icon>content_copy</Icon>
              </Fab>
            ) : (
              <>
                <UpdateActivity
                  activity={activity}
                  activities={activities}
                  studies={studies}
                  setActivities={setActivities}
                  profile={0}
                  researcherId={researcherId}
                />
                <ScheduleActivity activity={activity} setActivities={setActivities} activities={activities} />
                <Fab size="small" className={classes.btnWhite} onClick={() => setDetailsDialogOpen(true)}>
                  <Icon>app_registration</Icon>
                </Fab>
                <Fab size="small" className={classes.btnWhite} onClick={() => setVersionHistoryOpen(true)}>
                  <Icon>history</Icon>
                </Fab>
                <Fab size="small" className={classes.btnWhite} onClick={() => setShareDialogOpen(true)}>
                  <Icon>{!activity.shareTocommunity ? "share" : "remove_circle"}</Icon>
                </Fab>
                <Fab size="small" className={classes.btnWhite} onClick={() => setConfirmationVersionDialog(true)}>
                  <Icon>loupe</Icon>
                  {/* <Icon>save_alt</Icon> */}
                </Fab>
                <Fab size="small" className={classes.btnWhite} onClick={() => setConfirmationDialog(true)}>
                  <Icon>delete</Icon>
                </Fab>
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <ConfirmationDialog
        open={confirmationVersionDialog}
        onClose={() => setConfirmationVersionDialog(false)}
        confirmAction={handleVersioning}
        confirmationMsg={t("Are you sure you want to version this Activity?")}
      />
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        confirmAction={handleDeleteActivity}
        confirmationMsg={t("Are you sure you want to delete this Activity?")}
      />
      <ActivityDetailsDialog
        activity={activity}
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        onSave={async (updatedActivity) => {
          try {
            await onActivityUpdate(activity.id, updatedActivity)
            setDetailsDialogOpen(false)
          } catch (error) {
            console.error("Error updating activity:", error)
          }
        }}
      />
      <VersionHistoryDialog
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        activity={activity}
        formatDate={props.formatDate}
        onPreviewVersion={handlePreviewVersion}
        onRestoreVersion={handleRestoreVersion}
      />
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Icon style={{ marginRight: 8 }}>content_copy</Icon>
            {t("Duplicate Community Activity")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {t("You're about to make a copy of")}: <b>{activity.name}</b>
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {t("This will create a new activity in your selected study, which you can then customize.")}
          </Typography>

          <Box mt={3}>
            <FormControl fullWidth>
              <InputLabel>{t("Select Destination Study")}</InputLabel>
              <Select
                value={selectedStudyForDuplicate}
                onChange={(e) => setSelectedStudyForDuplicate(e.target.value as string)}
              >
                {studies.map((study) => (
                  <MenuItem key={study.id} value={study.id}>
                    {study.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)} color="secondary">
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleDuplicateActivity}
            color="primary"
            disabled={duplicateLoading || !selectedStudyForDuplicate}
            variant="contained"
            startIcon={duplicateLoading ? <CircularProgress size={20} color="inherit" /> : <Icon>content_copy</Icon>}
          >
            {duplicateLoading ? t("Duplicating...") : t("Duplicate")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* <Dialog open={versionHistoryOpen} onClose={() => setVersionHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
        <Box display="flex" alignItems="center">
          <Icon style={{ marginRight: 8 }}>history</Icon>
          {t("Version History")}
        </Box>
        </DialogTitle>
        <DialogContent>
          {activity.versionHistorybuild?.map((version, index) => (
            <Paper key={version.id} className={classes.versionItem} elevation={0}>
              <Box className={classes.versionInfo}>
                <Box className={classes.versionFlag}>
                  <Icon fontSize="small" style={{ marginRight: 4 }}>flag</Icon>
                  {`v${index + 1}`}
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {version.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {props.formatDate(version.date)} {version.time}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.versionActions}>
                <Fab
                  size="small"
                  className={classes.btnVersion}
                  onClick={() => handlePreviewVersion(version)}
                  title={t("Preview Version")}
                >
                  <Icon fontSize="small">visibility</Icon>
                </Fab>
                <Fab
                  size="small"
                  className={classes.btnVersion}
                  onClick={() => handleRestoreVersion(version)}
                  title={t("Restore Version")}
                >
                  <Icon fontSize="small">restore_page</Icon>
                </Fab>
              </Box>
            </Paper>
          ))}
          {!activity.versionHistorybuild?.length && (
            <Typography color="textSecondary" align="center">
              {t("No version history available")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionHistoryOpen(false)} color="primary">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog> */}
      <ConfirmationDialog
        confirmAction={confirmShareActivity}
        confirmationMsg={
          !activity.shareTocommunity
            ? "Are you sure you want to share this Activity in Community"
            : "Are you sure you want to remove this Activity from Community"
        }
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      ></ConfirmationDialog>
      <Dialog open={false} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>{t("Share Activity")}</DialogTitle>
        <DialogContent>
          {studies.map(
            (study) =>
              study.id != activity.study_id && (
                <Box key={study.id} display="flex" alignItems="center" my={1}>
                  <Checkbox
                    checked={selectedStudies.includes(study.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudies([...selectedStudies, study.id])
                      } else {
                        setSelectedStudies(selectedStudies.filter((id) => id !== study.id))
                      }
                    }}
                    className={classes.checkboxActive}
                  />
                  <Typography>{study.name}</Typography>
                </Box>
              )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)} color="secondary">
            {t("Cancel")}
          </Button>
          <Button onClick={handleShareActivity} color="primary">
            {t("Share")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* add gamecreator.tsx function here todo */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Icon style={{ marginRight: 8 }}>visibility</Icon>
            {t("Version Preview")}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVersion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedVersion.name}
              </Typography>
              <Divider style={{ margin: "16px 0" }} />
              <Typography variant="body1" gutterBottom>
                {t("Settings")}:
              </Typography>
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 16,
                  borderRadius: 4,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(selectedVersion.details?.settings, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)} color="secondary">
            {t("Close")}
          </Button>
          <Button
            onClick={() => {
              handleRestoreVersion(selectedVersion)
              setPreviewDialogOpen(false)
            }}
            color="primary"
          >
            {t("Restore This Version")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
