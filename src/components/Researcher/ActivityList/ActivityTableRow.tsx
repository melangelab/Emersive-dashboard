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
  TextField,
  Chip,
  ListItemText,
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
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as HistoryIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as HistoryFilledIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as ShareCommunityIcon } from "../../../icons/NewIcons/refer.svg"
import { ReactComponent as ShareCommunityFilledIcon } from "../../../icons/NewIcons/refer-filled.svg"
import { ReactComponent as RemoveCommunityIcon } from "../../../icons/NewIcons/user-xmark.svg"
import { ReactComponent as RemoveCommunityFilledIcon } from "../../../icons/NewIcons/user-xmark-filled.svg"
import { ReactComponent as VersionThisIcon } from "../../../icons/NewIcons/code-merge.svg"
import { ReactComponent as VersionThisFilledIcon } from "../../../icons/NewIcons/code-merge-filled.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../../icons/NewIcons/floppy-disks-filled.svg"
import { studycardStyles } from "../Studies/Index"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        "& $actionButtons": {
          opacity: 1,
        },
      },
    },
    actionCell: {
      position: "sticky",
      right: 0,
      backgroundColor: "#fff",
      boxShadow: "-2px 0px 4px rgba(0, 0, 0, 0.1)",
      gap: theme.spacing(1),
      zIndex: 2,
      minWidth: 160,
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "1px",
        backgroundColor: "rgba(224, 224, 224,1)",
      },
    },
    actionButtons: {
      display: "flex",
      gap: theme.spacing(1),
      opacity: 0.4,
      transition: "opacity 0.2s ease",
      "& svg": {
        width: 24,
        height: 24,
        opacity: 0.4,
        transition: "all 0.3s ease",
        "& path": {
          fill: "rgba(0, 0, 0, 0.8)",
        },
        "&:hover": {
          opacity: 1,
          "& path": {
            fill: "#06B0F0",
          },
        },
      },
      "& button": {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        color: "#FFFFFF",
        "&:hover": {
          backgroundColor: "#06B0F0",
        },
        "&.selected": {
          backgroundColor: "#4F95DA",
        },
      },
      justifyContent: "flex-start",
    },

    cell: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: 400,
    },
    versionBadge: {
      display: "inline-flex",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#FDEDE8",
      color: "#EB8367",
      alignItems: "center",
      gap: theme.spacing(0.5),
      fontWeight: 500,
    },
    studyCell: {
      cursor: "pointer",
      "&:hover .studyId": {
        display: "block",
      },
      maxWidth: 400,
      // minWidth:250,
      whiteSpace: "normal",
      // wordBreak: "break-word",
      // overflowWrap: "break-word",
    },
    studyId: {
      display: "none",
      position: "absolute",
      backgroundColor: "#fff",
      padding: theme.spacing(1),
      borderRadius: 4,
      boxShadow: theme.shadows[2],
      zIndex: 3,
    },
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
    idCell: {
      fontWeight: 500,
      color: "#215F9A", // Active Color
      cursor: "pointer",
    },
    scoreBox: {
      padding: theme.spacing(1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#f5f5f5",
      marginTop: theme.spacing(1),
    },
    checkboxActive: {
      color: "#7599FF !important",
      padding: theme.spacing(0.5),
      // color: "#ccc",
      "&.Mui-checked": {
        color: "#7599FF",
      },
      "& .MuiSvgIcon-root": {
        borderRadius: "4px",
        width: "18px",
        height: "18px",
      },
    },
    copyableCell: {
      cursor: "copy",
      position: "relative",
      fontWeight: 500,
      color: "#215F9A", // Active Color
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
    studyName: {
      position: "relative",
      zIndex: 1,
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
      backgroundColor: "#F0F7FF !important", // Light blue background for community rows
    },
    activeIcon: {
      color: "#EB8367 !important", // Primary Color for active icons
    },
    communityBadge: {
      display: "inline-flex",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#4F95DA", // Selected Color matching the design
      color: "white",
      alignItems: "center",
      gap: theme.spacing(0.5),
      marginLeft: theme.spacing(1),
      fontSize: "0.75rem",
    },
    editableField: {
      "& .MuiInputBase-input": {
        padding: theme.spacing(1),
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: theme.palette.primary.main,
        },
      },
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
  index,
  visibleColumns,
  selectedActivities,
  handleChange,
  researcherId,
  studies,
  onActivityUpdate,
  activities,
  setActivities,
  parentClasses,
  onViewActivity,
  editingActivity,
  onEditActivity,
  onSaveActivity,
  mode,
  onCellValueChange,
  availableSpecs,
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
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const activitycardclasses = studycardStyles()
  const editableColumns = ["name", "groups"] // TODO
  console.log("activity", activity)
  const [creatorName, setcreatorName] = useState(activity?.creator || "")
  useEffect(() => {
    const fetchname = async () => {
      const res = await LAMP.Researcher.view(activity?.creator)
      if (res) {
        setcreatorName(res.name)
      }
    }
    fetchname()
  }, [activity])
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

  useEffect(() => {
    setChecked(selectedActivities.filter((d) => d.id === activity.id).length > 0)
  }, [selectedActivities, activity.id])

  const handleCheckChange = (event) => {
    setChecked(event.target.checked)
    handleChange(activity, event.target.checked)
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
  const getCellContent = (column) => {
    if (column.id === "index") {
      return index
    }
    const getCurrentValue = (fieldId) => {
      if (isEditable && props.editedValues.hasOwnProperty(fieldId)) {
        return props.editedValues[fieldId]
      }
      return column.value(activity)
    }

    const isEditable = editableColumns.includes(column.id) && mode === "edit" && editingActivity?.id === activity.id
    if (isEditable) {
      switch (column.id) {
        case "name":
          return (
            <TextField
              defaultValue={getCurrentValue("name")}
              onChange={(e) => onCellValueChange("name", e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.editableField}
            />
          )
        // case "type":
        //   return (
        //     <FormControl fullWidth size="small" variant="outlined">
        //     <Select
        //       value={activity.spec || ''} // Ensure default value
        //       onChange={(e) => onCellValueChange("spec", e.target.value)}
        //       className={classes.editableField}
        //     >
        //       {availableSpecs.map((spec) => (
        //         <MenuItem key={spec} value={spec}>
        //           {spec} {/* Remove 'lamp.' prefix for display */}
        //         </MenuItem>
        //       ))}
        //                     {availableSpecs.map((spec) => (
        //         <MenuItem key={spec} value={spec}>
        //           {spec} {/* Remove 'lamp.' prefix for display */}
        //         </MenuItem>
        //       ))}

        //     </Select>
        //   </FormControl>
        //   )
        // case "creator":
        //   return (
        //     <TextField
        //       defaultValue={getCurrentValue("creator")}
        //       onChange={(e) => onCellValueChange("creator", e.target.value)}
        //       fullWidth
        //       size="small"
        //       variant="outlined"
        //       className={classes.editableField}
        //     />
        //   )
        case "groups":
          const availableGroups = activity.study_id ? studies.find((s) => s.id === activity.study_id)?.gname || [] : []
          return (
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                multiple
                value={getCurrentValue("groups") || []}
                onChange={(e) => onCellValueChange("groups", e.target.value)}
                renderValue={(selected: string[]) => (
                  <Box style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                className={classes.editableField}
              >
                {availableGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    <Checkbox checked={(getCurrentValue("groups") || []).indexOf(group) > -1} />
                    <ListItemText primary={group} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            // return (
            //   <TextField
            //     defaultValue={getCurrentValue("groups")?.join(", ") || ""}
            //     onChange={(e) => onCellValueChange("groups", e.target.value.split(",").map(g => g.trim()))}
            //     fullWidth
            //     size="small"
            //     variant="outlined"
            //     className={classes.editableField}
            //     helperText="Comma separated values"
            //   />
          )
        default:
          return column.value(activity)
      }
    }

    const value = column.value(activity)
    if (column.id === "id") {
      return (
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
      )
    }
    if (column.id === "study") {
      return (
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
          {/* <Typography > */}
          {activity.study_name || "No Study Name"}
          {/* </Typography> */}
          {/* <Box className={classes.studyId}>{`ID: ${activity.study_id}`}</Box> */}
        </Box>
      )
    }

    if (column.id === "version") {
      return (
        <Box className={classes.versionBadge}>
          <Icon fontSize="small">flag</Icon>
          {activity.currentVersion?.name || "v1.0"}
        </Box>
      )
    }

    if (column.id === "scoreInterpretation") {
      return (
        <Box className={classes.scoreBox}>
          {Object.entries(activity.scoreInterpretation || {}).map(([key, schema]) => (
            <Typography key={key} variant="body2">
              {key}: {(schema as ScoreInterpretationSchema).ranges.length} ranges
            </Typography>
          ))}
        </Box>
      )
    }
    if (column.id === "groups" && Array.isArray(value)) {
      return (
        <Box style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {value.map((group) => (
            <Chip key={group} label={group} size="small" />
          ))}
        </Box>
      )
    }
    if (column.id === "creator") {
      return (
        <Box
          className={classes.copyableCell}
          onClick={() => {
            window.navigator?.clipboard?.writeText?.(creatorName)
            enqueueSnackbar("Creator Name copied to clipboard", {
              variant: "success",
              autoHideDuration: 1000,
            })
          }}
        >
          {creatorName}
        </Box>
      )
    }
    return value
  }

  return (
    <>
      <TableRow
        className={classes.row}
        // hover
        // role="checkbox"
        // aria-checked={checked}
        // selected={checked}
        // className={activity.shareTocommunity ? classes.communityRow : ""}
      >
        <TableCell padding="checkbox">
          <Checkbox checked={checked} onChange={handleCheckChange} className={classes.checkboxActive} />
        </TableCell>
        {visibleColumns.map((column) => (
          <TableCell
            key={column.id}
            className={classes.cell}
            style={{
              backgroundColor: "inherit",
            }}
          >
            {getCellContent(column)}
          </TableCell>
        ))}
        {/* {visibleColumns.map((column) => (
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
                {activity.currentVersion?.name || "v1.0"}
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
        ))} */}

        <TableCell className={classes.actionCell}>
          <Box
            className={classes.actionButtons}
            // display="flex" style={{ gap: 8 }}
          >
            {activity.isCommunityActivity ? (
              <>
                {activeButton.id === activity.id && activeButton.action === "view" ? (
                  <ViewFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      // setDetailsDialogOpen(true)
                      onViewActivity(activity)
                    }}
                  />
                ) : (
                  <ViewIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      // setDetailsDialogOpen(true)
                      onViewActivity(activity)
                    }}
                  />
                )}
                {activeButton.id === activity.id && activeButton.action === "copy" ? (
                  <CopyFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "copy" })
                      setDuplicateDialogOpen(true)
                    }}
                  />
                ) : (
                  <CopyIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "copy" })
                      setDuplicateDialogOpen(true)
                    }}
                  />
                )}
              </>
            ) : (
              <>
                {activeButton.id === activity.id && activeButton.action === "view" ? (
                  <ViewFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      // setDetailsDialogOpen(true)
                      onViewActivity(activity)
                    }}
                  />
                ) : (
                  <ViewIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "view" })
                      // setDetailsDialogOpen(true)
                      onViewActivity(activity)
                    }}
                  />
                )}
                <ScheduleActivity
                  activity={activity}
                  setActivities={setActivities}
                  activities={activities}
                  activeButton={activeButton}
                  setActiveButton={setActiveButton}
                />
                {activeButton.id === activity.id && activeButton.action === "edit" ? (
                  <EditFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "edit" })
                      onEditActivity(activity)
                    }}
                  />
                ) : (
                  <EditIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "edit" })
                      onEditActivity(activity)
                    }}
                  />
                )}
                {activeButton.id === activity.id && activeButton.action === "save" ? (
                  <SaveFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "save" })
                      onSaveActivity(activity)
                    }}
                  />
                ) : (
                  <SaveIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "save" })
                      onSaveActivity(activity)
                    }}
                  />
                )}

                {/* <UpdateActivity
                  activity={activity}
                  activities={activities}
                  studies={studies}
                  setActivities={setActivities}
                  profile={0}
                  researcherId={researcherId}
                /> */}
                {activeButton.id === activity.id && activeButton.action === "history" ? (
                  <HistoryFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "history" })
                      setVersionHistoryOpen(true)
                    }}
                  />
                ) : (
                  <HistoryIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "history" })
                      setVersionHistoryOpen(true)
                    }}
                  />
                )}
                {activeButton.id === activity.id && activeButton.action === "share" ? (
                  !activity.shareTocommunity ? (
                    <ShareCommunityFilledIcon
                      className={`${activitycardclasses.actionIcon} active`}
                      onClick={() => {
                        setActiveButton({ id: activity.id, action: "history" })
                        setShareDialogOpen(true)
                      }}
                    />
                  ) : (
                    <RemoveCommunityFilledIcon
                      className={`${activitycardclasses.actionIcon} active`}
                      onClick={() => {
                        setActiveButton({ id: activity.id, action: "share" })
                        setShareDialogOpen(true)
                      }}
                    />
                  )
                ) : activity.shareTocommunity ? (
                  <RemoveCommunityIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "share" })
                      setShareDialogOpen(true)
                    }}
                  />
                ) : (
                  <ShareCommunityIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "share" })
                      setShareDialogOpen(true)
                    }}
                  />
                )}
                {activeButton.id === activity.id && activeButton.action === "version" ? (
                  <VersionThisFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "version" })
                      setConfirmationVersionDialog(true)
                    }}
                  />
                ) : (
                  <VersionThisIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "version" })
                      setConfirmationVersionDialog(true)
                    }}
                  />
                )}
                {activeButton.id === activity.id && activeButton.action === "delete" ? (
                  <DeleteFilledIcon
                    className={`${activitycardclasses.actionIcon} active`}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "delete" })
                      setConfirmationDialog(true)
                    }}
                  />
                ) : (
                  <DeleteIcon
                    className={activitycardclasses.actionIcon}
                    onClick={() => {
                      setActiveButton({ id: activity.id, action: "delete" })
                      setConfirmationDialog(true)
                    }}
                  />
                )}
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>
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
      {/* add gamecreator.tsx function here todo */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false)
          setActiveButton({ id: null, action: null })
        }}
        maxWidth="md"
        fullWidth
      >
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
          <Button
            onClick={() => {
              setPreviewDialogOpen(false)
              setActiveButton({ id: null, action: null })
            }}
            color="secondary"
          >
            {t("Close")}
          </Button>
          <Button
            onClick={() => {
              handleRestoreVersion(selectedVersion)
              setPreviewDialogOpen(false)
              setActiveButton({ id: null, action: null })
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
