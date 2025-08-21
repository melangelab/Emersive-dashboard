import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Checkbox,
  Paper,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  Icon,
  DialogTitle,
  Button,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@material-ui/core"
import ScheduleActivity from "./ScheduleActivity"
import UpdateActivity from "./UpdateActivity"
import { updateSchedule } from "./ActivityMethods"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import DuplicateActivity from "./DuplicateActivity"
import { studycardStyles, useModularTableStyles } from "../Studies/Index"
import { canEditActivity, canViewActivity, devLabCardStyles, getActivityAccessLevel } from "./Index"
import { ReactComponent as HistoryIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as HistoryFilledIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as ShareCommunityIcon } from "../../../icons/NewIcons/refer.svg"
import { ReactComponent as ShareCommunityFilledIcon } from "../../../icons/NewIcons/refer-filled.svg"
import { ReactComponent as RemoveCommunityIcon } from "../../../icons/NewIcons/user-xmark.svg"
import { ReactComponent as RemoveCommunityFilledIcon } from "../../../icons/NewIcons/user-xmark-filled.svg"
import { ReactComponent as VersionThisIcon } from "../../../icons/NewIcons/code-merge.svg"
import { ReactComponent as VersionThisFilledIcon } from "../../../icons/NewIcons/code-merge-filled.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import VersionHistoryDialog from "./VersionHistoryDialog"
import ConfirmationDialog from "../../ConfirmationDialog"
import ActivityDetailsDialog from "./ActivityDetailsDialog"
import { useSnackbar } from "notistack"
import { Service } from "../../DBService/DBService"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { Tooltip } from "@material-ui/core"

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
    activityHeader: { padding: "12px 5px" },
    cardMain: {
      borderRadius: 16,
      boxShadow: "none !important ",
      background: "#E0E0E0",
      margin: "11px",
      "& span.MuiCardHeader-title": { fontSize: "16px", fontWeight: 500 },
    },
    checkboxActive: { color: "#7599FF !important" },
    communityCard: {
      background: "#F0F7FF", // Light blue background
      border: "1px solid #7599FF",
      position: "relative",
    },
    communityBadge: {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      background: "#7599FF",
      color: "white",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
    },
    creatorInfo: {
      fontSize: "0.75rem",
      color: "#666",
      marginTop: "4px",
    },
    sharedCard: {
      background: "#F8F4FF",
      border: "1px solid #d8aedf",
      position: "relative",
    },
    sharedBadge: {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      background: "#d8aedf",
      color: "white",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
    },
  })
)
export default function ActivityItem({
  activity,
  researcherId,
  studies,
  activities,
  handleSelectionChange,
  selectedActivities,
  setActivities,
  updateActivities,
  onActivityUpdate,
  onViewActivity,
  ...props
}) {
  const classes = useStyles()
  const mtstyles = useModularTableStyles()
  const activitycardclasses = studycardStyles()
  const customStyles = devLabCardStyles()
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [checked, setChecked] = useState(
    selectedActivities.filter((d) => d.id === activity.id).length > 0 ? true : false
  )
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const handleChange = (activity, event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    handleSelectionChange(activity, event.target.checked)
  }
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const [confirmationVersionDialog, setConfirmationVersionDialog] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [selectedStudyForDuplicate, setSelectedStudyForDuplicate] = useState("")
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const canEdit = canEditActivity(activity, studies, researcherId, props.sharedstudies)
  const canView = canViewActivity(activity, studies, researcherId, props.sharedstudies)

  const getParentResearcher = (parentResearcherId) => {
    const researcher = props.allresearchers.find((r) => r.id === parentResearcherId)
    return researcher ? researcher.name : parentResearcherId
  }

  const getCardClass = () => {
    if (activity.isCommunityActivity) return classes.communityCard
    if (activity.isShared) return classes.sharedCard
    return ""
  }
  const handlePreviewVersion = async (version) => {
    try {
      setPreviewDialogOpen(true)
      setSelectedVersion(version)
    } catch (error) {
      console.error("Error previewing version:", error)
      enqueueSnackbar(t("Failed to preview version"), { variant: "error" })
    }
  }
  const handleVersioning = async (status) => {
    try {
      if (status === "Yes") {
        const updatedActivity = { ...activity, versionThis: true }
        await onActivityUpdate(activity.id, updatedActivity)
        enqueueSnackbar(t("Successfully versioned the activity."), { variant: "success", autoHideDuration: 2000 })
      } else {
        setConfirmationVersionDialog(false)
      }
    } catch {
      enqueueSnackbar(t("Error in versioning the activity."), { variant: "error", autoHideDuration: 2000 })
      console.log(`Activity ID ${activity.id} failed for versioning ${activity}`)
    } finally {
      setConfirmationVersionDialog(false)
      setActiveButton({ id: null, action: null })
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
    } finally {
      setVersionHistoryOpen(false)
      setActiveButton({ id: null, action: null })
    }
  }
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
        setActiveButton({ id: null, action: null })
        enqueueSnackbar(t("Activity published in community successfully"), {
          variant: "success",
          autoHideDuration: 1000,
        })
      }
    } catch (error) {
      console.error("Error sharing activity:", error)
      enqueueSnackbar(t("Failed to publish activity in community."), { variant: "error" })
    } finally {
      setShareDialogOpen(false)
      setActiveButton({ id: null, action: null })
    }
  }
  const handleDeleteActivity = async (status) => {
    if (status === "Yes") {
      try {
        // Delete activity tags if they exist
        if (activity.spec === "lamp.survey") {
          await LAMP.Type.setAttachment(activity.id, "me", "lamp.dashboard.survey_description", null)
        } else {
          await LAMP.Type.setAttachment(activity.id, "me", "emersive.activity.details", null)
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
    } else {
      setConfirmationDialog(false)
    }
    setConfirmationDialog(false)
    setActiveButton({ id: null, action: null })
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
      setActiveButton({ id: null, action: null })
    }
  }

  return (
    <Paper className={`${activitycardclasses.dhrCard} ${getCardClass()}`} elevation={3}>
      <Box display={"flex"} flexDirection={"row"}>
        {/* <Card className={`${classes.cardMain} ${activity.isCommunityActivity ? classes.communityCard : ""}`}> */}
        {activity.isCommunityActivity && <Box className={classes.communityBadge}>{t("Community")}</Box>}
        {activity.isShared && <Box className={classes.sharedBadge}>{t("Shared")}</Box>}
        <Box display="flex" p={1}>
          {!activity.isCommunityActivity && (
            <Box>
              <Checkbox
                disabled={activity.isShared && !canEdit}
                checked={checked}
                onChange={(event) => handleChange(activity, event)}
                classes={{ checked: classes.checkboxActive }}
                inputProps={{ "aria-label": "primary checkbox" }}
              />
            </Box>
          )}
          <Typography className={activitycardclasses.cardTitle}>{activity.name || "No Name provided."}</Typography>
          <Typography className={customStyles.version}>{`${activity.currentVersion?.name || "v1.0"}`}</Typography>
        </Box>
      </Box>
      <Divider className={activitycardclasses.titleDivider} />
      <Typography className={activitycardclasses.cardSubtitle}>
        <strong>{t("Name")}:</strong> {activity.name}
      </Typography>
      <Typography className={activitycardclasses.cardSubtitle}>
        <strong>{t("Description")}:</strong> {activity.study_name}
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography className={activitycardclasses.cardSubtitle}>
            <strong className={customStyles.baseTypeDeveloperLabel}>{t("Base")}:</strong>{" "}
            <span className={customStyles.baseTypeDeveloper}>{activity.spec?.replace("lamp.", "")}</span>
          </Typography>
          <Typography className={activitycardclasses.cardSubtitle}>
            <strong className={customStyles.baseTypeDeveloperLabel}>{t("Type")}:</strong>{" "}
            <span className={customStyles.baseTypeDeveloper}>
              {activity.isCommunityActivity ? "Community" : "Custom"}
            </span>
          </Typography>
          {activity.isCommunityActivity && (
            <Typography className={activitycardclasses.cardSubtitle}>
              <strong className={customStyles.baseTypeDeveloperLabel}>{t("Developer")}:</strong>{" "}
              <span className={customStyles.baseTypeDeveloper}>{activity.creator}</span>
            </Typography>
          )}
          {activity.isShared && (
            <>
              <Typography className={activitycardclasses.cardSubtitle}>
                <strong className={customStyles.baseTypeDeveloperLabel}>{t("Shared By")}:</strong>{" "}
                <span className={customStyles.baseTypeDeveloper}>{getParentResearcher(activity.parentResearcher)}</span>
              </Typography>
            </>
          )}
        </Box>
        <Box>
          <Typography className={customStyles.studiesNumber}>{activity.sharingStudies?.length + 1}</Typography>
          <Typography className={customStyles.studiesLabel}>STUDIES</Typography>
        </Box>
      </Box>

      <Box className={activitycardclasses.actionButtons}>
        {activity.isCommunityActivity ? (
          <>
            {activeButton.id === activity.id && activeButton.action === "view" ? (
              <Tooltip title="View Activity">
                <span>
                  <ViewFilledIcon
                    className={`${mtstyles.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      onViewActivity(activity)
                    }}
                  />
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="View Activity">
                <span>
                  <ViewIcon
                    className={mtstyles.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      onViewActivity(activity)
                    }}
                  />
                </span>
              </Tooltip>
            )}
            <Tooltip title="Duplicate Activity">
              <span>
                <DuplicateActivity
                  activity={activity}
                  studies={studies}
                  researcherId={researcherId}
                  searchActivities={setActivities}
                  activeButton={activeButton}
                  setActiveButton={setActiveButton}
                />
              </span>
            </Tooltip>
          </>
        ) : (
          <>
            {activeButton.id === activity.id && activeButton.action === "view" ? (
              <Tooltip title="View Activity">
                <span>
                  <ViewFilledIcon
                    className={`${mtstyles.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      setDetailsDialogOpen(true)
                      onViewActivity(activity)
                    }}
                  />
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="View Activity">
                <span>
                  <ViewIcon
                    className={mtstyles.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      setDetailsDialogOpen(true)
                      onViewActivity(activity)
                    }}
                  />
                </span>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Schedule Activity">
                <span>
                  <ScheduleActivity
                    activity={activity}
                    setActivities={setActivities}
                    activities={activities}
                    activeButton={activeButton}
                  />
                </span>
              </Tooltip>
            )}
            {/* <UpdateActivity
              activity={activity}
              activities={activities}
              studies={studies}
              setActivities={setActivities}
              profile={0}
              researcherId={researcherId}
              activeButton={activeButton}
              setActiveButton={setActiveButton}
            /> */}
            {canView && (
              <>
                {activeButton.id === activity.id && activeButton.action === "history" ? (
                  <Tooltip title="View Version History">
                    <span>
                      <HistoryFilledIcon
                        className={`${mtstyles.actionIcon} active`}
                        onClick={() => {
                          setActiveButton({ id: activity.id, action: "history" })
                          setVersionHistoryOpen(true)
                        }}
                      />
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="View Version History">
                    <span>
                      <HistoryIcon
                        className={mtstyles.actionIcon}
                        onClick={() => {
                          setActiveButton({ id: activity.id, action: "history" })
                          setVersionHistoryOpen(true)
                        }}
                      />
                    </span>
                  </Tooltip>
                )}
              </>
            )}
            {canEdit && !activity.isShared && (
              <>
                {activeButton.id === activity.id && activeButton.action === "share" ? (
                  !activity.shareTocommunity ? (
                    <Tooltip title="Share to Community">
                      <span>
                        <ShareCommunityFilledIcon
                          className={`${mtstyles.actionIcon} active`}
                          onClick={() => {
                            setActiveButton({ id: activity.id, action: "history" })
                            setShareDialogOpen(true)
                          }}
                        />
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Remove from Community">
                      <span>
                        <RemoveCommunityFilledIcon
                          className={`${mtstyles.actionIcon} active`}
                          onClick={() => {
                            setActiveButton({ id: activity.id, action: "share" })
                            setShareDialogOpen(true)
                          }}
                        />
                      </span>
                    </Tooltip>
                  )
                ) : activity.shareTocommunity ? (
                  <Tooltip title="Remove from Community">
                    <span>
                      <RemoveCommunityIcon
                        className={`${mtstyles.actionIcon} active`}
                        onClick={() => {
                          setActiveButton({ id: activity.id, action: "share" })
                          setShareDialogOpen(true)
                        }}
                      />
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Share to Community">
                    <span>
                      <ShareCommunityIcon
                        className={mtstyles.actionIcon}
                        onClick={() => {
                          setActiveButton({ id: activity.id, action: "share" })
                          setShareDialogOpen(true)
                        }}
                      />
                    </span>
                  </Tooltip>
                )}
              </>
            )}
            {activeButton.id === activity.id && activeButton.action === "version" ? (
              <Tooltip title="Version This Activity">
                <span>
                  <VersionThisFilledIcon
                    className={`${mtstyles.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "version" })
                      setConfirmationVersionDialog(true)
                    }}
                  />
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="Version This Activity">
                <span>
                  <VersionThisIcon
                    className={mtstyles.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "version" })
                      setConfirmationVersionDialog(true)
                    }}
                  />
                </span>
              </Tooltip>
            )}
            {!activity.isShared && (
              <>
                {activeButton.id === activity.id && activeButton.action === "delete" ? (
                  <Tooltip title="Delete Activity">
                    <span>
                      <DeleteFilledIcon
                        className={`${mtstyles.actionIcon} active`}
                        onClick={() => {
                          setActiveButton({ id: activity.id, action: "delete" })
                          setConfirmationDialog(true)
                        }}
                      />
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Delete Activity">
                    <span>
                      <DeleteIcon
                        className={mtstyles.actionIcon}
                        onClick={() => {
                          setActiveButton({ id: activity.id, action: "delete" })
                          setConfirmationDialog(true)
                        }}
                      />
                    </span>
                  </Tooltip>
                )}
              </>
            )}
          </>
        )}
      </Box>
      {/* </Card> */}
      <ConfirmationDialog
        open={confirmationVersionDialog}
        onClose={() => {
          setConfirmationVersionDialog(false)
          setActiveButton({ id: null, action: null })
        }}
        confirmAction={handleVersioning}
        confirmationMsg={t("Are you sure you want to version this Activity?")}
      />
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => {
          setConfirmationDialog(false)
          setActiveButton({ id: null, action: null })
        }}
        confirmAction={handleDeleteActivity}
        confirmationMsg={t("Are you sure you want to delete this Activity?")}
      />
      <ActivityDetailsDialog
        activity={activity}
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false)
          setActiveButton({ id: null, action: null })
        }}
        onSave={async (updatedActivity) => {
          try {
            await onActivityUpdate(activity.id, updatedActivity)
            setDetailsDialogOpen(false)
          } catch (error) {
            console.error("Error updating activity:", error)
          } finally {
            setDetailsDialogOpen(false)
            setActiveButton({ id: null, action: null })
          }
        }}
      />
      <VersionHistoryDialog
        open={versionHistoryOpen}
        onClose={() => {
          setVersionHistoryOpen(false)
          setActiveButton({ id: null, action: null })
        }}
        activity={activity}
        formatDate={props.formatDate}
        onPreviewVersion={handlePreviewVersion}
        onRestoreVersion={handleRestoreVersion}
      />
      <Dialog
        open={duplicateDialogOpen}
        onClose={() => {
          setDuplicateDialogOpen(false)
          setActiveButton({ id: null, action: null })
        }}
        fullWidth
        maxWidth="sm"
      >
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
          <Button
            onClick={() => {
              setDuplicateDialogOpen(false)
              setActiveButton({ id: null, action: null })
            }}
            color="secondary"
          >
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
      <ConfirmationDialog
        confirmAction={confirmShareActivity}
        confirmationMsg={
          !activity.shareTocommunity
            ? "Are you sure you want to share this Activity in Community"
            : "Are you sure you want to remove this Activity from Community"
        }
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false)
          setActiveButton({ id: null, action: null })
        }}
      />
    </Paper>
  )
}
