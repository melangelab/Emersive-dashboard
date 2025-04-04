// Create a new file: DuplicateActivity.tsx
import React, { useState } from "react"
import {
  Icon,
  Fab,
  makeStyles,
  Theme,
  createStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { useModularTableStyles } from "../Studies/Index"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/arrow-circle-down.svg"

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
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width: "100%",
    },
  })
)

export default function DuplicateActivity({
  activity,
  studies,
  researcherId,
  activeButton,
  setActiveButton,
  ...props
}) {
  const classes = useStyles()
  const mtstyles = useModularTableStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStudy, setSelectedStudy] = useState("")
  const [loading, setLoading] = useState(false)

  const handleDuplicate = async () => {
    if (!selectedStudy) {
      enqueueSnackbar(t("Please select a study"), { variant: "error" })
      return
    }

    setLoading(true)
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
      const result = (await LAMP.Activity.create(selectedStudy, newActivity)) as any
      const newActivityId = result.data
      await Service.addData("activities", [
        {
          id: newActivityId,
          ...newActivity,
          study_id: selectedStudy,
        },
      ])

      setDialogOpen(false)
      if (props.searchActivities) {
        props.searchActivities()
      }
      enqueueSnackbar(t("Activity duplicated successfully"), { variant: "success" })
      console.log(newActivityId)
    } catch (error) {
      console.error("Error duplicating activity:", error)
      enqueueSnackbar(t("Failed to duplicate activity"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {activeButton.id === activity.id && activeButton.action === "copy" ? (
        <CopyFilledIcon
          className={`${mtstyles.actionIcon} active`}
          onClick={() => {
            setActiveButton({ id: activity.id, action: "copy" })
            setDialogOpen(true)
          }}
        />
      ) : (
        <CopyIcon
          className={mtstyles.actionIcon}
          onClick={() => {
            setActiveButton({ id: activity.id, action: "copy" })
            setDialogOpen(true)
          }}
        />
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
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
            <FormControl className={classes.formControl}>
              <InputLabel>{t("Select Destination Study")}</InputLabel>
              <Select value={selectedStudy} onChange={(e) => setSelectedStudy(e.target.value as string)}>
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
              setActiveButton({ id: null, action: null })
              setDialogOpen(false)
            }}
            color="secondary"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => {
              setActiveButton({ id: null, action: null })
              handleDuplicate()
            }}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon>content_copy</Icon>}
          >
            {loading ? t("Duplicating...") : t("Duplicate")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
