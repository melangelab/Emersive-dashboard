import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  TextField,
  makeStyles,
  Theme,
  createStyles,
  Button,
  Divider,
  Grid,
  Paper,
  CircularProgress,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },
    sectionTitle: {
      fontWeight: 600,
      marginBottom: theme.spacing(2),
      color: "#215F9A",
    },
    fieldContainer: {
      marginBottom: theme.spacing(3),
    },
    label: {
      fontWeight: 500,
      color: "#555",
      marginBottom: theme.spacing(0.5),
    },
    value: {
      fontSize: "1rem",
      wordBreak: "break-word",
    },
    editableField: {
      padding: theme.spacing(1.5),
      border: "1px solid #e0e0e0",
      borderRadius: 4,
      backgroundColor: "#f9f9f9",
    },
    textField: {
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#fff",
      },
    },
    infoCard: {
      padding: theme.spacing(2),
      height: "100%",
      backgroundColor: "#FDEDE8",
      border: "1px solid #EB8367",
    },
    infoHeader: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
    },
    editButton: {
      marginTop: theme.spacing(2),
      backgroundColor: "#06B0F0",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#059dda",
      },
    },
  })
)

interface SensorDetailViewProps {
  sensor: any
  isEditing: boolean
  onSave: (updatedSensor: any) => void
  studies: Array<any>
  triggerSave?: boolean
}

const SensorDetailView: React.FC<SensorDetailViewProps> = ({ sensor, isEditing, onSave, studies, triggerSave }) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: sensor?.name || "",
    description: sensor?.description || "",
    spec: sensor?.spec || "",
    group: sensor?.group || "",
  })

  useEffect(() => {
    setFormData({
      name: sensor?.name || "",
      description: sensor?.description || "",
      spec: sensor?.spec || "",
      group: sensor?.group || "",
    })
  }, [sensor])

  // Effect to handle save trigger from header
  useEffect(() => {
    if (triggerSave && isEditing) {
      handleSave()
    }
  }, [triggerSave])

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await LAMP.Sensor.update(sensor.id, {
        name: formData.name.trim(),
        spec: formData.spec,
        description: formData.description,
        group: formData.group,
      } as any)

      Service.updateMultipleKeys(
        "sensors",
        {
          sensors: [
            {
              id: sensor.id,
              name: formData.name.trim(),
              spec: formData.spec,
              description: formData.description,
              group: formData.group,
            },
          ],
        },
        ["name", "spec", "description", "group"],
        "id"
      )

      enqueueSnackbar(t("Successfully updated sensor."), {
        variant: "success",
      })

      onSave({
        ...sensor,
        name: formData.name.trim(),
        spec: formData.spec,
        description: formData.description,
        group: formData.group,
      })
    } catch (error) {
      console.error("Error updating sensor:", error)
      enqueueSnackbar(t("An error occurred while updating the sensor."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t("Sensor Details")}
          </Typography>

          <Box className={classes.fieldContainer}>
            <Typography className={classes.label}>{t("Name")}</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={formData.name}
                onChange={handleChange("name")}
                className={classes.textField}
              />
            ) : (
              <Box className={classes.editableField}>
                <Typography className={classes.value}>{sensor?.name || "-"}</Typography>
              </Box>
            )}
          </Box>

          <Box className={classes.fieldContainer}>
            <Typography className={classes.label}>{t("Description")}</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange("description")}
                className={classes.textField}
              />
            ) : (
              <Box className={classes.editableField}>
                <Typography className={classes.value}>{sensor?.description || "-"}</Typography>
              </Box>
            )}
          </Box>

          <Box className={classes.fieldContainer}>
            <Typography className={classes.label}>{t("Group Name")}</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={formData.group}
                onChange={handleChange("group")}
                className={classes.textField}
              />
            ) : (
              <Box className={classes.editableField}>
                <Typography className={classes.value}>{sensor?.group || "-"}</Typography>
              </Box>
            )}
          </Box>

          <Box className={classes.fieldContainer}>
            <Typography className={classes.label}>{t("Study Name")}</Typography>
            <Box className={classes.editableField}>
              <Typography className={classes.value}>{sensor?.study_name || "-"}</Typography>
            </Box>
          </Box>

          <Box className={classes.fieldContainer}>
            <Typography className={classes.label}>{t("Sensor ID")}</Typography>
            <Box className={classes.editableField}>
              <Typography className={classes.value}>{sensor?.id || "-"}</Typography>
            </Box>
          </Box>

          {isEditing && (
            <Button variant="contained" className={classes.editButton} onClick={handleSave} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : t("Save Changes")}
            </Button>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className={classes.infoCard}>
            <Typography variant="h6" className={classes.infoHeader}>
              {t("Developer Info")}
            </Typography>

            <Box className={classes.fieldContainer}>
              <Typography className={classes.label}>{t("Base")}</Typography>
              <Typography className={classes.value}>{sensor?.spec?.replace("lamp.", "") || "-"}</Typography>
            </Box>

            <Box className={classes.fieldContainer}>
              <Typography className={classes.label}>{t("Type")}</Typography>
              <Typography className={classes.value}>{sensor?.isCommunity ? "Community" : "Custom"}</Typography>
            </Box>

            <Box className={classes.fieldContainer}>
              <Typography className={classes.label}>{t("Studies")}</Typography>
              <Typography className={classes.value}>
                {sensor?.sharingStudies ? (sensor.sharingStudies?.length || 0) + 1 : sensor.studies?.length || 1}
              </Typography>
            </Box>

            <Box className={classes.fieldContainer}>
              <Typography className={classes.label}>{t("Version")}</Typography>
              <Typography className={classes.value}>{sensor?.currentVersion?.name || "v1.0"}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SensorDetailView
