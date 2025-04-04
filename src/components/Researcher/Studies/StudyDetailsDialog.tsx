import React, { useEffect, useState } from "react"
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
  ButtonGroup,
  Box,
  makeStyles,
  Theme,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  ListItemSecondaryAction,
} from "@material-ui/core"
import { useHistory } from "react-router-dom"
import CloseIcon from "@material-ui/icons/Close"
import LAMP from "lamp-core"

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
  statsContainer: {
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[1],
  },
  buttonGroup: {
    marginBottom: theme.spacing(2),
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginLeft: "auto",
  },
}))

export default function StudyDetailsDialog({
  study,
  open,
  onClose,
  onSave,
  editStudyId,
  //  currentFormState,
  //  handleFormChange,
  formatDate,
  researcherId,
}) {
  const classes = useStyles()
  const [formState, setFormState] = useState(study)
  const [isEditing, setIsEditing] = useState(false)
  const history = useHistory()
  const [subResearcherDetails, setSubResearcherDetails] = useState({})

  const handleSensorClick = (sensorId: string) => {
    localStorage.setItem("sensor_filter", sensorId)
    history.push(`/researcher/${researcherId}/sensors`)
    window.location.href = `/#/researcher/${researcherId}/sensors?filter=${sensorId}`
  }
  const handleParticipantClick = (pId: string) => {
    localStorage.setItem("participant_filter", pId)
    history.push(`/researcher/${researcherId}/users`)
    window.location.href = `/#/researcher/${researcherId}/users?filter=${pId}`
  }
  const handleActivityClick = (aId: string) => {
    localStorage.setItem("activity_filter", aId)
    history.push(`/researcher/${researcherId}/activities`)
    window.location.href = `/#/researcher/${researcherId}/activities?filter=${aId}`
  }

  useEffect(() => {
    setFormState(study)
    if (study?.sub_researchers?.length) {
      fetchSubResearcherDetails(study.sub_researchers)
    }
    setIsEditing(false)
  }, [study, open])

  const handleSave = () => {
    const updatedStudy = { ...study, ...formState }
    console.log(updatedStudy, study, "handlesve")
    onSave(updatedStudy)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormState(study)
    setIsEditing(false)
  }

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const getacessscope = (value) => {
    let ans = ""
    ans += value & 4 ? "Action, " : ""
    ans += value & 2 ? "Edit, " : ""
    ans += value & 1 ? "View" : ""
    ans += value == 0 ? "None" : ""
    return ans
  }

  const fetchSubResearcherDetails = async (subResearchers) => {
    const detailsMap = {}
    await Promise.all(
      subResearchers.map(async (SR) => {
        try {
          const researcher = (await LAMP.Researcher.view(SR.ResearcherID)) as any
          detailsMap[SR.ResearcherID] = {
            name: researcher.name,
            institution: researcher.institution || "Unknown Institution",
          }
        } catch (error) {
          console.error(`Error fetching researcher ${SR.ResearcherID}:`, error)
        }
      })
    )
    setSubResearcherDetails(detailsMap)
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Study Details
          </Typography>
          {/* Action Buttons */}
          <Box className={classes.actionButtons}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" onClick={() => handleSave()}>
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleCancel()
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                Edit Study
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <DialogContent className={classes.content}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Study ID" value={study.id} disabled />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Study Name"
                  value={formState.name || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formState.description || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                {/* <TextField
                fullWidth
                type="number"
                label="Study Mobile"
                value={formState.mobile || ''}
                disabled={!isEditing}
                onChange={(e) => handleFormChange('mobile', e.target.value)}
              /> */}
                <TextField
                  fullWidth
                  type="text" // Changed from number to text to handle proper validation
                  label="Study Mobile"
                  value={formState.mobile || ""}
                  disabled={!isEditing}
                  error={!!formState.mobile && !validatePhone(formState.mobile)}
                  helperText={
                    formState.mobile && !validatePhone(formState.mobile)
                      ? "Please enter a valid 10-digit mobile number"
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 10) {
                      handleFormChange("mobile", value)
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+1</InputAdornment>, // Optional: Add country code
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Study Email"
                  value={formState.email || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Study Configuration */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Study Purpose</InputLabel>
                  <Select
                    value={formState.purpose || ""}
                    disabled={!isEditing}
                    onChange={(e) => {
                      handleFormChange("purpose", e.target.value)
                      if (e.target.value === "research") {
                        handleFormChange("studyType", "")
                      }
                    }}
                  >
                    <MenuItem value="practice">Practice</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                    <MenuItem value="research">Research</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formState.purpose === "research" && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Study Type</InputLabel>
                    <Select
                      value={formState.studyType || ""}
                      disabled={!isEditing}
                      onChange={(e) => handleFormChange("studyType", e.target.value)}
                    >
                      <MenuItem value="DE">Descriptive</MenuItem>
                      <MenuItem value="CC">Case Control</MenuItem>
                      <MenuItem value="CO">Cohort</MenuItem>
                      <MenuItem value="OB">Observational</MenuItem>
                      <MenuItem value="RCT">RCTs</MenuItem>
                      <MenuItem value="OC">Other Clinical trials</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Institution Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Institution Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>PI Institution</Typography>
                <TextField
                  fullWidth
                  required
                  label="PI Institution"
                  value={formState.piInstitution || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("piInstitution", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Collaborating Institutions</Typography>
                <TextField
                  fullWidth
                  value={
                    subResearcherDetails && typeof subResearcherDetails === "object"
                      ? Object.values(subResearcherDetails)
                          .map((detail: any) => detail.institution)
                          .join(", ")
                      : "No Institute in collaboration."
                  }
                  disabled={true}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Funding & Ethics */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Funding & Ethics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>Has Funding</Typography>
                <ButtonGroup className={classes.buttonGroup}>
                  <Button
                    variant={formState.hasFunding ? "contained" : "outlined"}
                    color={formState.hasFunding ? "primary" : "default"}
                    onClick={() => handleFormChange("hasFunding", true)}
                    disabled={!isEditing}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!formState.hasFunding ? "contained" : "outlined"}
                    color={!formState.hasFunding ? "primary" : "default"}
                    onClick={() => handleFormChange("hasFunding", false)}
                    disabled={!isEditing}
                  >
                    No
                  </Button>
                </ButtonGroup>
              </Grid>
              {formState.hasFunding && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Funding Agency"
                    value={formState.fundingAgency || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleFormChange("fundingAgency", e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography gutterBottom>Ethics Permission</Typography>
                <ButtonGroup className={classes.buttonGroup}>
                  <Button
                    variant={formState.hasEthicsPermission ? "contained" : "outlined"}
                    color={formState.hasEthicsPermission ? "primary" : "default"}
                    onClick={() => handleFormChange("hasEthicsPermission", true)}
                    disabled={!isEditing}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!formState.hasEthicsPermission ? "contained" : "outlined"}
                    color={!formState.hasEthicsPermission ? "primary" : "default"}
                    onClick={() => handleFormChange("hasEthicsPermission", false)}
                    disabled={!isEditing}
                  >
                    No
                  </Button>
                </ButtonGroup>
                {formState.hasEthicsPermission && (
                  <Grid item xs={12}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={!isEditing}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFormChange("ethicsPermissionDoc", file)
                        }
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Co Researchers
            </Typography>
            <List>
              {formState.sub_researchers?.map((researcher, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={subResearcherDetails[researcher.ResearcherID]?.["name"]}
                    secondary={`Researcher ID : ${researcher.ResearcherID}; Access: ${getacessscope(
                      researcher.access_scope
                    )}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Admin Notes */}
          <Grid item xs={12} className={classes.section}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Notes"
              value={formState.adminNote || ""}
              disabled={!isEditing}
              onChange={(e) => handleFormChange("adminNote", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study State
            </Typography>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                value={formState.state || "development"}
                disabled={!isEditing}
                onChange={(e) => {
                  const newstate = e.target.value
                  handleFormChange("state", newstate)
                  handleFormChange("timestamps", {
                    ...formState.timestamps,
                    productionAt: newstate === "production" ? new Date() : formState.timestamps.productionAt,
                    completedAt: newstate === "complete" ? new Date() : formState.timestamps.completedAt,
                  })
                }}
              >
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="production">Production</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Study Status & Statistics */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study Status & Statistics
            </Typography>
            <Box className={classes.statsContainer}>
              {/* Study State */}
              <Grid container spacing={2}>
                {/* <Grid item xs={4}>
                <Typography variant="subtitle2">State</Typography>
                <Typography>{study.state}</Typography>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Study State
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={formState.state || 'development'}
                    disabled={!isEditing}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                  >
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                    <MenuItem value="complete">Complete</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}
                <Grid item xs={4}>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    Participants ({study.participants?.length || 0})
                  </Typography>
                  {/* <Typography variant="subtitle2">Participant count</Typography>
                 <Typography>{study.participants?.length || 0}</Typography> */}
                  <List>
                    {formState.participants?.map((participant, index) => (
                      <ListItem
                        key={index}
                        dense
                        button
                        onClick={() => {
                          console.log("listitemclick", participant)
                          handleParticipantClick(participant.id)
                        }}
                      >
                        <ListItemText primary={participant.name} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    Activities ({study.activities?.length || 0})
                  </Typography>
                  {/* <Typography variant="subtitle2">Activities</Typography>
                 <Typography>{study.activities?.length || 0}</Typography> */}
                  <List>
                    {formState.activities?.map((activity, index) => (
                      <ListItem
                        key={index}
                        dense
                        button
                        onClick={() => {
                          console.log("listitemclick", activity)
                          handleActivityClick(activity.id)
                        }}
                      >
                        <ListItemText primary={activity.name} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    Sensors ({study.sensors?.length || 0})
                  </Typography>
                  {/* <Typography variant="subtitle1" gutterBottom>Sensors ({formState.sensor_count})</Typography> */}
                  <List>
                    {formState.sensors?.map((sensor, index) => (
                      <ListItem
                        key={index}
                        dense
                        button
                        onClick={() => {
                          console.log("listitemclick", sensor)
                          handleSensorClick(sensor.id)
                        }}
                      >
                        <ListItemText primary={sensor.name} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    Study Groups
                  </Typography>
                  <List>
                    {study.gname?.map((group, index) => (
                      <ListItem key={index} dense>
                        <ListItemText primary={group} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Timestamps */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Important Dates
            </Typography>
            <Grid container spacing={2}>
              {study.timestamps &&
                Object.entries(study.timestamps).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Typography variant="subtitle2">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Typography>
                    <Typography>{formatDate(value)}</Typography>
                  </Grid>
                ))}
              <Grid item xs={6}>
                <Typography variant="subtitle2">Created at</Typography>
                <Typography>{formatDate(study.timestamp)}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* <Box className={classes.actionButtons}>
        {isEditing ? (
            <>
            <Button variant="contained" color="primary" onClick={() => {
                onSave(formState)
                setIsEditing(false)
            }}>
                Save Changes
            </Button>
            <Button variant="outlined" onClick={() => {
                setFormState(study)
                setIsEditing(false)
                onClose()
            }}>
                Cancel
            </Button>
            </>
        ) : (
            <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
            Edit Study
            </Button>
        )}
       </Box> */}
      </DialogContent>
    </Dialog>
  )
}
