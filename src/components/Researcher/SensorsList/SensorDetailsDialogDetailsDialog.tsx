import React, { useState } from "react"
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  DialogContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  makeStyles,
  Theme,
  Switch,
  Chip,
  Paper,
} from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    position: "relative",
    backgroundColor: "#7599FF",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  content: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(4),
  },
  switchLabel: {
    marginRight: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  statusBox: {
    padding: theme.spacing(1, 3),
    borderRadius: theme.spacing(0.5),
    minWidth: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginRight: theme.spacing(1),
  },
  statusActive: {
    backgroundColor: "#e8f5e9",
    border: "1px solid #43a047",
    "& $statusIndicator": {
      backgroundColor: "#43a047",
    },
    "& .MuiTypography-root": {
      color: "#2e7d32",
    },
  },
  statusInactive: {
    backgroundColor: "#ffebee",
    border: "1px solid #e53935",
    "& $statusIndicator": {
      backgroundColor: "#e53935",
    },
    "& .MuiTypography-root": {
      color: "#c62828",
    },
  },
}))

export default function SensorDetailsDialog({ sensor, open, onClose, onSave, formatDate, researcherId, ...props }) {
  const classes = useStyles()
  const [formState, setFormState] = useState(sensor)
  const [isEditing, setIsEditing] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [merror, setMError] = useState(false)

  const handleFormChange = (field, value) => {
    if (field === "userAge") {
      const age = parseInt(value, 10)
      if (isNaN(age) || age <= 0 || age > 120) {
        enqueueSnackbar("Age must be a valid number between 1 and 120", { variant: "error" })
        return
      }
    }

    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      let flagreturn = false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formState["email"])) {
        enqueueSnackbar("Invalid email format", { variant: "error" })
        flagreturn = true
      }
      if (!emailRegex.test(formState["caregiverEmail"])) {
        enqueueSnackbar("Invalid Caregiver email", { variant: "error" })
        flagreturn = true
      }
      const mobileRegex = /^[0-9]{10}$/
      if (!mobileRegex.test(formState["mobile"])) {
        enqueueSnackbar("Mobile number must be 10 digits", { variant: "error" })
        flagreturn = true
      }
      if (!mobileRegex.test(formState["caregiverMobile"])) {
        enqueueSnackbar("CareGiver Mobile number must be 10 digits", { variant: "error" })
        flagreturn = true
      }

      if (flagreturn) return

      await LAMP.Sensor.update(sensor.id, formState)
      await LAMP.Sensor.update(sensor.id, formState)
        .then((res) => {
          console.log("update sends", formState, "receives", res, "id", sensor.id)
        })
        .catch((error) => {
          console.log("update send", formState, "error", error)
        })

      LAMP.Sensor.view(sensor.id).then((res) => {
        console.log("after update", res)
      })
      // Update in local DB
      const fieldtoupdate = [
        "firstName",
        "lastName",
        "username",
        "email",
        "mobile",
        "language",
        "theme",
        "emergency_contact",
        "helpline",
        "group_name",
        "researcherNote",
        "userAge",
        "gender",
        "address",
        "caregiverName",
        "caregiverRelation",
        "caregiverMobile",
        "caregiverEmail",
        "researcherNote",
        "hospitalId",
        "otherHealthIds",
        "isSuspended",
        "systemTimestamps",
      ]
      await Service.updateMultipleKeys(
        "sensors",
        {
          sensors: [
            {
              id: sensor.id,
              ...formState,
            },
          ],
        },
        fieldtoupdate,
        "id"
      )

      enqueueSnackbar("Sensor updated successfully", { variant: "success" })
      // onSave(formState); TODO
      setIsEditing(false)
    } catch (error) {
      enqueueSnackbar(`Failed to update sensor: ${error.message}`, { variant: "error" })
    }
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Sensor Details
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent className={classes.content}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formState.firstName || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("firstName", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formState.lastName || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("lastName", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formState.email || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Mobile"
                  type="tel"
                  value={formState.mobile || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("mobile", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formState.userAge || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("userAge", parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formState.gender || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleFormChange("gender", e.target.value)}
                    required
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Address"
                  value={formState.address || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Caregiver Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Caregiver Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Caregiver Name"
                  value={formState.caregiverName || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("caregiverName", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formState.caregiverRelation || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("caregiverRelation", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Caregiver Mobile"
                  type="tel"
                  error={merror}
                  helperText={merror ? "Enter a valid 10-digit number" : ""}
                  inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
                  value={formState.caregiverMobile || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("caregiverMobile", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Caregiver Email"
                  type="email"
                  value={formState.caregiverEmail || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("caregiverEmail", e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* System Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Typography className={classes.switchLabel}>Login Status:</Typography>
                  {/* <Switch
                    checked={formState.isLoggedIn}
                    disabled
                  /> */}
                  <Paper
                    elevation={0}
                    className={`${classes.statusBox} ${
                      formState.isLoggedIn ? classes.statusActive : classes.statusInactive
                    }`}
                  >
                    <span className={classes.statusIndicator} />
                    <Typography variant="body2">{formState.isLoggedIn ? "Logged In" : "Not Logged In"}</Typography>
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Created On</Typography>
                <Typography>{formatDate(formState.systemTimestamps?.createdAt)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Last Login</Typography>
                <Typography>{formatDate(formState.systemTimestamps?.lastLoginTime)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Last Activity</Typography>
                <Typography>{formatDate(formState.systemTimestamps?.lastActivityTime)}</Typography>
              </Grid>
              {formState.systemTimestamps?.suspensionTime && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Suspended On</Typography>
                  <Typography>{formatDate(formState.systemTimestamps.suspensionTime)}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Additional Settings */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Additional Settings
            </Typography>
            <Grid container spacing={2}>
              {/* <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={formState.emergency_contact || ''}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange('emergency_contact', e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Helpline"
                  value={formState.helpline || ''}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange('helpline', e.target.value)}
                />
              </Grid> */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Hospital ID"
                  value={formState.hospitalId || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("hospitalId", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Other Health IDs
                </Typography>
                <Box>
                  {formState.otherHealthIds?.map((id, index) => (
                    <Chip
                      key={index}
                      label={id}
                      onDelete={
                        isEditing
                          ? () => {
                              const newIds = [...formState.otherHealthIds]
                              newIds.splice(index, 1)
                              handleFormChange("otherHealthIds", newIds)
                            }
                          : undefined
                      }
                      className={classes.chip}
                    />
                  ))}
                  {isEditing && (
                    <Button
                      size="small"
                      onClick={() => {
                        const id = prompt("Enter health ID")
                        if (id) {
                          handleFormChange("otherHealthIds", [...(formState.otherHealthIds || []), id])
                        }
                      }}
                    >
                      Add ID
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box className={classes.actionButtons}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFormState(sensor)
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                Edit Sensor
              </Button>
            )}
          </Box>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}
