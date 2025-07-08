import React, { useState, useEffect } from "react"
import {
  Grid,
  Paper,
  Typography,
  Divider,
  TextField,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
  Button,
} from "@material-ui/core"
import LAMP from "lamp-core"
import { useSnackbar } from "notistack"
import "./global.css"
import "./Admin/admin.css"
import { PropaneSharp } from "@mui/icons-material"
import { ReactComponent as ViewInfo } from "../icons/NewIcons/overview.svg"

const ResearcherMoreInfo = ({ element }) => {
  const [activeTab, setActiveTab] = useState("submission")

  const [submissionData, setSubmissionData] = useState({
    id: null,
    userIp: null,
    sourceUrl: null,
    browser: null,
    device: null,
    user: null,
    status: null,
    submittedOn: null,
  })
  const [studiesShowData, setStudiesShowData] = useState(null)

  const fetchStudies = async () => {
    const studies = await LAMP.Study.allByResearcher(element.id)
    setStudiesShowData(studies.map((study) => study.name))
  }

  useEffect(() => {
    fetchStudies()
  }, [element])

  const communityData = {
    profile: "Community Profile",
    contributions: "Community Contributions",
    stats: [
      { title: "Assessments", count: 0 },
      { title: "Activities", count: 6 },
      { title: "Sensors", count: 0 },
    ],
  }

  return (
    <div className="more-info-content-container">
      <div className="m-f-header">
        <div className="tab-container">
          <div
            className={`tab ${activeTab === "submission" ? "active" : ""}`}
            onClick={() => setActiveTab("submission")}
          >
            Submission Info
          </div>
          <div className="separator">|</div>
          <div className={`tab ${activeTab === "studies" ? "active" : ""}`} onClick={() => setActiveTab("studies")}>
            Studies
          </div>
          <div className="separator">|</div>
          <div className={`tab ${activeTab === "community" ? "active" : ""}`} onClick={() => setActiveTab("community")}>
            Community
          </div>
        </div>

        {activeTab === "submission" && (
          <div className="submission-info">
            <div className="info-row">
              <div className="info-label">Submission ID:</div>
              <div className="info-value">{submissionData.id}</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">User IP:</div>
              <div className="info-value blue-text">{submissionData.userIp}</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">Source URL:</div>
              <div className="info-value blue-text url-text">{submissionData.sourceUrl}</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">Browser:</div>
              <div className="info-value">{submissionData.browser}</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">Device:</div>
              <div className="info-value">{submissionData.device}</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">User:</div>
              <div className="info-value">{submissionData.user}</div>
              <div className="edit-icon">🔧</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">Status:</div>
              <div className="info-value">{submissionData.status}</div>
            </div>
            <div className="info-divider"></div>

            <div className="info-row">
              <div className="info-label">Submitted On:</div>
              <div className="info-value">{submissionData.submittedOn}</div>
            </div>
            <div className="info-divider"></div>

            <div className="action-buttons">
              <button className="edit-button">
                {/* <span className="edit-icon">✏️</span> Edit */}
                Edit
              </button>
              <button className="status-button">
                Change status to <span className="dropdown-icon">▼</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "studies" && (
          <div className="studies-list">
            {studiesShowData.map((study, index) => (
              <React.Fragment key={index}>
                <div className="study-item">
                  <div className="study-name">{study}</div>
                  {/* <div
                    className={`table-actions-icon-container`}
                  >
                    <ViewInfo className="table-actions-icon" />
                  </div> */}
                </div>
                <div className="info-divider"></div>
              </React.Fragment>
            ))}
          </div>
        )}

        {activeTab === "community" && (
          <div className="community-section">
            <div className="community-item">
              <div className="item-title">{communityData.profile}</div>
              <div className="external-link-icon">↗️</div>
            </div>
            <div className="info-divider"></div>

            <div className="community-item">
              <div className="item-title">{communityData.contributions}</div>
              <div className="external-link-icon">↗️</div>
            </div>
            <div className="info-divider"></div>

            {communityData.stats.map((stat, index) => (
              <React.Fragment key={index}>
                <div className="community-stat">
                  <div className="stat-bullet">•</div>
                  <div className="stat-label">{stat.title}</div>
                  <div className="stat-count">{stat.count}</div>
                </div>
                <div className="info-divider"></div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ViewElement(props) {
  console.log("Inside the view element and the element", props.element)

  const [editedValues, setEditedValues] = useState({})
  const { enqueueSnackbar } = useSnackbar()

  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const handleSubmitPassword = async () => {
    try {
      // Validate passwords
      if (updatedPassword !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      console.log("IN THE UPDATED PASSWORD", confirmPassword)

      try {
        console.log("Attempting to update credential...")
        const credlist = await LAMP.Credential.list(props.element.id)
        const response = (await LAMP.Credential.update(props.element.id, props.element.email, {
          ...(credlist[0] as any),
          secret_key: confirmPassword,
        })) as any
        console.log("Update response:", response)

        // Check if response contains error
        if (response && response.error === "404.no-such-credentials") {
          console.log("Attempting to create new credential...")
          await LAMP.Credential.create(props.element.id, props.element.email, confirmPassword)
          enqueueSnackbar("Successfully created new credential", { variant: "success" })
        } else {
          enqueueSnackbar("Successfully updated credential", { variant: "success" })
        }
      } catch (updateError) {
        console.error("Operation error:", updateError)
        throw updateError
      }

      setShowPasswordDialog(false)
    } catch (error) {
      console.error("Final error:", error)
      enqueueSnackbar(`Failed to create/update credential: ${error.message || "Unknown error"}`, { variant: "error" })
    }
  }

  const handleCloseDialog = () => {
    setShowPasswordDialog(false)
    setPasswordError("")
    props.setActionOnViewElement(null)
  }

  const saveElement = async () => {
    const updatedElement = { ...props.element, ...editedValues }
    console.log("In the viewElement", editedValues, updatedElement)
    if (props.elementType === "researchers") {
      try {
        await LAMP.Researcher.update(updatedElement.id, updatedElement)
        props.changeElement((prev) => ({ ...prev, researcher: updatedElement }))
        props.setIsEditing(false)
        setEditedValues({})
        enqueueSnackbar("Successfully updated researcher(s)", { variant: "success" })
      } catch (error) {
        enqueueSnackbar("Failed to update researcher(s)", { variant: "error" })
        console.error("Error updating element:", error)
      }
    }
  }

  useEffect(() => {
    console.log("inside useEffect of actionOnViewElement", props.actionOnViewElement)
    if (props.actionOnViewElement === "edit") {
      if (props.isEditing) {
        props.setIsEditing(false)
      }
    } else if (props.actionOnViewElement === "save") {
      saveElement()
    } else if (props.actionOnViewElement === "passwordEdit") {
      setShowPasswordDialog(true)
    }
  }, [props.actionOnViewElement])

  const renderField = (key) => {
    const label = props.columns[key]
    const value = key.includes(".")
      ? key.split(".").reduce((obj, part) => obj && obj[part], props.element)
      : props.element[key]

    const isFieldEditable =
      props.editableColumns && props.editableColumns.includes(key) && props.actionOnViewElement === "edit"

    const handleChange = (key, value) => {
      props.setIsEditing(true)
      setEditedValues((prev) => ({
        ...prev,
        [key]: value,
      }))
    }

    return (
      <div className="view-field-container">
        <Typography className="view-label">{label}</Typography>
        {isFieldEditable ? (
          <TextField
            className="view-input"
            value={editedValues[key] ? editedValues[key] : value}
            onChange={(e) => handleChange(key, e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
          />
        ) : (
          <Typography className="view-value">{value || "-"}</Typography>
        )}
        <Divider className="view-divider" />
      </div>
    )
  }

  return (
    <Grid container className="view-element-grid">
      <Grid item md={7} className="view-element-info">
        <Paper elevation={1} className={`view-element-info-paper ${props.isEditing ? "editing-mode" : ""}`}>
          {Object.keys(props.columns).map((key) => {
            if (key === "actions") return null
            return renderField(key)
          })}
        </Paper>
      </Grid>
      <Grid item md={5}>
        <Paper elevation={4}>
          <ResearcherMoreInfo element={props.element} />
        </Paper>
      </Grid>
      <Dialog open={showPasswordDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
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
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleSubmitPassword} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
