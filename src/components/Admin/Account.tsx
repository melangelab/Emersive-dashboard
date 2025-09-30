import React, { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { ReactComponent as ProfileIcon } from "../../icons/NewIcons/ProfileIcon.svg"
import { Visibility, VisibilityOff, Edit, Close, Check } from "@material-ui/icons"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { Service } from "../DBService/DBService"
import Header from "../Header"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: theme.spacing(0, 2),
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(2, 0),
    borderBottom: "1px solid #E0E0E0",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  profileIcon: {
    width: 40,
    height: 40,
  },
  profileTextContainer: {
    "& p": {
      margin: 0,
      lineHeight: 1.4,
    },
    "& p:first-child": {
      fontWeight: 500,
      fontSize: "1rem",
      color: "#000000",
    },
    "& p:last-child": {
      color: "#666666",
      fontSize: "0.875rem",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  tabsContainer: {
    display: "flex",
    borderBottom: "1px solid #E0E0E0",
    marginTop: theme.spacing(1),
    backgroundColor: "#FFFFFF",
  },
  tab: {
    padding: theme.spacing(2, 3),
    cursor: "pointer",
    fontSize: "1rem",
    position: "relative",
    color: "rgba(0, 0, 0, 0.8)",
    opacity: 0.8,
    "&:after": {
      content: '""',
      position: "absolute",
      right: 0,
      top: "25%",
      height: "50%",
      width: 1,
      backgroundColor: "#E0E0E0",
    },
    "&:last-child:after": {
      display: "none",
    },
  },
  activeTab: {
    color: "#000000",
    opacity: 1,
    fontWeight: 500,
  },
  formContainer: {
    width: "100%",
    height: "100%",
    padding: theme.spacing(4, 2),
    backgroundColor: "#FFFFFF",
    overflow: "hidden", // No scroll here
  },
  formField: {
    marginBottom: theme.spacing(3),
  },
  inputLabel: {
    color: "#666666",
    marginBottom: theme.spacing(1),
    fontSize: "1rem",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
    },
  },
  updateButton: {
    backgroundColor: "#06B0F0",
    color: "#FFFFFF",
    padding: "10px 30px",
    textTransform: "none",
    borderRadius: 4,
    fontSize: "1rem",
    "&:hover": {
      backgroundColor: "#0596cc",
    },
  },
  profileDetails: {
    marginTop: theme.spacing(2),
  },
  userPhoto: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "#FDEDE8",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  passwordReset: {
    maxWidth: 600,
  },
  socialConnect: {
    maxWidth: 600,
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(2),
  },
  deleteAccount: {
    maxWidth: 600,
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(2),
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  gridItem: {
    width: "100%",
    // height: "100%",
    // display: "flex",
    // flexDirection: "column",
    // justifyContent: "center",
    // alignItems: "center",
  },
  profileSection: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "40%",
  },
  profileHeader: {
    marginBottom: theme.spacing(2),
    fontWeight: 500,
    color: "#333",
  },
  existingDetails: {
    "& .MuiTextField-root": {
      marginBottom: theme.spacing(2),
    },
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
  },
  editIcon: {
    cursor: "pointer",
    color: "#666666",
    "&:hover": {
      color: "#000000",
    },
  },
  fieldContainer: {
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 500,
    marginBottom: theme.spacing(2),
    color: "#333",
  },
  socialConnectButtons: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  deleteAccountSection: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
}))

// Data normalization utilities
const normalizeProfileData = (data, userType) => {
  if (userType === "Researcher") {
    return {
      id: data._id || data.id,
      userName: data.username || data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.email || data.emailAddress,
      password: data.password,
      photo: data.photo || null,
      role: "Researcher",
      // Additional researcher fields
      address: data.address,
      institution: data.institution,
      mobile: data.mobile,
      status: data.status,
      projectAccess: data.ProjectAccess || [],
      participantCount: data.participantCount || 0,
      studyCount: data.studyCount || 0,
      loggedIn: data.loggedIn || false,
    }
  } else {
    // Admin/System Admin
    return {
      id: data.id || data._id,
      userName: data.userName || data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.emailAddress || data.email,
      password: data.password,
      photo: data.photo || null,
      role: data.role === "admin" ? "Admin" : "System Admin",
      token: data.token,
      // Optional admin profile details
      address: data.address || "",
      institution: data.institution || "",
      mobile: data.mobile || "",
    }
  }
}

// Field configuration for different user types
const getEditableFields = (userType, userId, isDefaultProfile = false) => {
  // If using default profile (N/A values), no fields should be editable
  if (isDefaultProfile) {
    return []
  }

  const baseFields = ["firstName", "lastName"]

  if (userType === "Researcher") {
    return [...baseFields, "userName", "address", "institution", "mobile"]
  } else {
    // Admin fields - email not editable for system admin
    const adminFields = [...baseFields, "userName", "address", "institution", "mobile"]
    // if (userId !== "admin") {
    //   adminFields.push('emailAddress')
    // }
    return adminFields
  }
}

// Default profile helpers
const getDefaultProfile = (userType, userId) => {
  if (userType !== "Researcher" && (userId === "admin" || userType === "System Admin")) {
    return {
      id: "admin",
      userName: "admin",
      firstName: "System",
      lastName: "Administrator",
      emailAddress: "N/A",
      password: "",
      photo: null,
      role: "System Admin",
      token: undefined,
      address: "",
      institution: "",
      mobile: "",
    }
  }
  return {
    id: userId || "N/A",
    userName: "N/A",
    firstName: "N/A",
    lastName: "N/A",
    emailAddress: "N/A",
    password: "",
    photo: null,
    role: userType || "N/A",
    address: "",
    institution: "",
    mobile: "",
  }
}

const Account = ({ onLogout, setIdentity, userType, userId, title, pageLocation, ...props }) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  // State management
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Password update state
  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Editing state
  const [editingFields, setEditingFields] = useState({})
  const [tempValues, setTempValues] = useState({})

  // Determine if we're using a default profile (N/A values)
  const isDefaultProfile = profile?.data?.firstName === "N/A" || profile?.data?.firstName === "System"

  // Get editable fields based on user type
  const editableFields = getEditableFields(userType, userId, isDefaultProfile)

  useEffect(() => {
    fetchUserData()
  }, [userId, userType])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let userData

      if (userType === "Researcher") {
        // Fetch researcher data
        userData = await LAMP.Researcher.view(userId)
        console.log("Researcher data fetched:", userData)
      } else {
        // Fetch admin/system admin data
        const response: any = await LAMP.Type.getAttachment(userId, "emersive.profile")

        if (!response || !response.data || !response.data[0]) {
          // Fallback to hard-coded system admin profile or N/A profile
          userData = getDefaultProfile(userType, userId)
        } else {
          userData = response.data[0]
        }

        // Add current user ID
        const temp: any = LAMP.Auth._me
        userData.id = temp.id
      }

      if (userId !== "admin") {
        try {
          const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
          const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
          const params = new URLSearchParams({
            access_key: userType === "Researcher" ? userData.email : userData.emailAddress,
          }).toString()

          const credentialResponse = await fetch(`${baseURL}/view-credential?${params}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + authString,
            },
          })

          const credentialData = await credentialResponse.json()
          console.log("Credential data fetched:", credentialData.data)
          userData.password = credentialData.data
        } catch (credError) {
          console.warn("Could not fetch credential data:", credError)
        }
      }

      // Normalize the data
      const normalizedData = normalizeProfileData(userData, userType)
      setProfile({ data: normalizedData })

      // Determine if this is a default profile
      const isDefaultProfile = normalizedData.firstName === "N/A" || normalizedData.firstName === "System"

      // Get editable fields based on whether it's a default profile
      const currentEditableFields = getEditableFields(userType, userId, isDefaultProfile)

      // Initialize temp values
      const initialTempValues = {}
      currentEditableFields.forEach((field) => {
        initialTempValues[field] = normalizedData[field] || ""
      })
      setTempValues(initialTempValues)
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Graceful fallback: use default profile and render with N/A values
      const fallback = getDefaultProfile(userType, userId)
      setProfile({ data: fallback })

      // Initialize temp values for default profile (no editable fields)
      const currentEditableFields = getEditableFields(userType, userId, true)
      const initialTempValues = {}
      currentEditableFields.forEach((field) => {
        initialTempValues[field] = fallback[field] || ""
      })
      setTempValues(initialTempValues)

      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartEditing = (field) => {
    if (!editableFields.includes(field)) return

    setEditingFields((prev) => ({ ...prev, [field]: true }))
    setTempValues((prev) => ({ ...prev, [field]: profile.data[field] || "" }))
  }

  const handleCancelEditing = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }))
    setTempValues((prev) => ({ ...prev, [field]: profile.data[field] || "" }))
  }

  const handleFieldChange = (field) => (event) => {
    setTempValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const mapFieldsToActuals = (field) => {
    switch (field) {
      case "userName":
        return "username"
      case "emailAddress":
        return "email"
      default:
        return field
    }
  }

  const handleSaveField = async (field) => {
    ;``
    try {
      const updatedProfile = {
        ...profile,
        data: {
          ...profile.data,
          [field]: tempValues[field],
        },
      }

      setProfile(updatedProfile)
      setEditingFields((prev) => ({ ...prev, [field]: false }))

      // Save to backend based on user type
      if (userType === "Researcher") {
        // Update researcher data
        const updateResearcher = { ...profile.data, [mapFieldsToActuals(field)]: tempValues[field] }
        console.log("Updating researcher data:", updateResearcher)
        await LAMP.Researcher.update(userId, updateResearcher)
      } else {
        // Update admin profile attachment
        await LAMP.Type.setAttachment(userId, LAMP.Auth._type, "emersive.profile", {
          ...updatedProfile.data,
          role: updatedProfile.data.role === "Admin" ? "admin" : "system_admin",
        })
      }

      enqueueSnackbar(`${field} updated successfully`, { variant: "success" })
    } catch (error) {
      console.error("Error updating field:", error)
      enqueueSnackbar(`Failed to update ${field}`, { variant: "error" })

      // Revert on error
      setTempValues((prev) => ({
        ...prev,
        [field]: profile.data[field] || "",
      }))
      setEditingFields((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handlePasswordUpdate = async () => {
    try {
      if (updatedPassword !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      // if (updatedPassword.length < 6) {
      //   setPasswordError("Password must be at least 6 characters long")
      //   return
      // }
      let response
      let typeId

      if (userType === "Researcher") {
        const resp: any = LAMP.Type.getAttachment(profile.data.emailAddress, "emersive.profile")
        if (!resp || !resp.data || !resp.data[0]) {
          typeId = null
        } else {
          typeId = userId
        }
      } else {
        typeId = null
      }

      response = await LAMP.Credential.update(
        typeId,
        profile.data.emailAddress,
        JSON.stringify({ secret_key: updatedPassword })
      )

      // Update identity
      const res = await setIdentity({
        id: LAMP.Auth._auth.id,
        password: confirmPassword,
        serverAddress: LAMP.Auth._auth.serverAddress,
      })

      if (res.userType === "researcher") {
        if (res.auth.serverAddress === "demo.lamp.digital") {
          const studiesSelected = JSON.parse(localStorage.getItem("studies_" + res.identity.id) || "[]")
          if (studiesSelected.length === 0) {
            const studiesList = [res.identity.name]
            localStorage.setItem("studies_" + res.identity.id, JSON.stringify(studiesList))
            localStorage.setItem("studyFilter_" + res.identity.id, JSON.stringify(1))
          }
        } else {
          const researcherData = res.identity
          researcherData.timestamps.lastLoginAt = new Date().getTime()
          researcherData.loggedIn = true
          await LAMP.Researcher.update(researcherData.id, researcherData)
        }
      }

      await Service.deleteDB()
      await Service.deleteUserDB()

      // Update profile with new password
      setProfile((prev) => ({
        ...prev,
        data: { ...prev.data, password: confirmPassword },
      }))

      setShowPasswordDialog(false)
      setUpdatedPassword("")
      setConfirmPassword("")
      setPasswordError("")

      enqueueSnackbar("Password updated successfully", { variant: "success" })
    } catch (error) {
      console.error("Password update error:", error)
      enqueueSnackbar(`Failed to update password: ${error.message || "Unknown error"}`, { variant: "error" })
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    try {
      if (userType === "Researcher") {
        await LAMP.Researcher.delete(userId)
      } else {
        // Handle admin deletion logic if needed
        console.log("Admin account deletion requested")
      }

      enqueueSnackbar("Account deleted successfully", { variant: "success" })
      if (onLogout) {
        onLogout()
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      enqueueSnackbar("Failed to delete account", { variant: "error" })
    }
  }

  const renderField = (fieldKey, label, type = "text", readOnly = false) => {
    const isEditable = editableFields.includes(fieldKey) && !readOnly
    const isEditing = editingFields[fieldKey]
    const value = isEditing ? tempValues[fieldKey] : profile?.data?.[fieldKey] || ""

    return (
      <div className={classes.formField}>
        <Typography className={classes.inputLabel}>{label}</Typography>
        <TextField
          fullWidth
          variant="outlined"
          type={type}
          value={value}
          onChange={handleFieldChange(fieldKey)}
          className={classes.textField}
          disabled={!isEditing || readOnly}
          InputProps={{
            readOnly: readOnly,
            endAdornment: isEditable && (
              <InputAdornment position="end">
                {!isEditing ? (
                  <IconButton onClick={() => handleStartEditing(fieldKey)}>
                    <Edit className={classes.editIcon} />
                  </IconButton>
                ) : (
                  <>
                    <IconButton onClick={() => handleSaveField(fieldKey)}>
                      <Check className={classes.editIcon} />
                    </IconButton>
                    <IconButton onClick={() => handleCancelEditing(fieldKey)}>
                      <Close className={classes.editIcon} />
                    </IconButton>
                  </>
                )}
              </InputAdornment>
            ),
          }}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    )
  }

  // Do not hard-stop on error; render page with N/A/defaults instead

  const canDeleteAccount = userId !== "admin" && userType !== "System Admin" && !isDefaultProfile
  const disableGoogleConnect =
    (userType !== "Researcher" && !!(profile?.data?.emailAddress && profile.data.emailAddress !== "N/A")) ||
    isDefaultProfile

  return (
    <React.Fragment>
      <Header authType={userType} title={title} pageLocation={pageLocation} />
      <div className="body-container">
        <div className={classes.formContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} className={classes.gridItem}>
              {/* Basic Fields */}
              {renderField("id", "ID", "text", true)}
              {renderField("role", "Role", "text", true)}
              {renderField("userName", "Username")}
              {renderField("firstName", "First Name")}
              {renderField("lastName", "Last Name")}
              {renderField("emailAddress", "Email Address")}

              {/* Researcher-specific fields */}
              {userType === "Researcher" && (
                <>
                  {renderField("address", "Address")}
                  {renderField("institution", "Institution")}
                  {renderField("mobile", "Mobile")}
                  <div className={classes.formField}>
                    <Typography className={classes.inputLabel}>Status</Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={profile?.data?.status || ""}
                      className={classes.textField}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                  <div className={classes.formField}>
                    <Typography className={classes.inputLabel}>Participant Count</Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={profile?.data?.participantCount || 0}
                      className={classes.textField}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                  <div className={classes.formField}>
                    <Typography className={classes.inputLabel}>Study Count</Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={profile?.data?.studyCount || 0}
                      className={classes.textField}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </>
              )}

              {/* Password Field */}
              <div className={classes.formField}>
                <Typography className={classes.inputLabel}>Password</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  value={showPassword && profile?.data?.password ? profile.data.password : "••••••••"}
                  className={classes.textField}
                  disabled={true}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {userId !== "admin" && !isDefaultProfile && (
                          <IconButton onClick={() => setShowPasswordDialog(true)}>
                            <Edit className={classes.editIcon} />
                          </IconButton>
                        )}
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </Grid>

            {/* Right Column */}
            <Grid
              item
              xs={12}
              md={6}
              className={classes.gridItem}
              style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}
            >
              {/* Profile Photo */}
              {/* <div> */}
              <div className={classes.profileSection}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                  <div className={classes.userPhoto}>
                    <ProfileIcon style={{ width: 80, height: 80 }} />
                  </div>
                </div>
              </div>

              {/* Social Connect Section */}
              <div className={classes.socialConnect}>
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Typography className={classes.sectionTitle}>Social Connect</Typography>
                  <Typography variant="body2" style={{ marginBottom: "16px", color: "#666" }}>
                    Connect your account with these services for simplified login and enhanced features.
                  </Typography>
                </div>
                <div className={classes.socialConnectButtons}>
                  <Button
                    variant="contained"
                    disabled={disableGoogleConnect}
                    style={{
                      backgroundColor: "#4285F4",
                      color: "#FFFFFF",
                      textTransform: "none",
                      padding: "12px 20px",
                    }}
                  >
                    Connect with Google
                  </Button>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className={classes.deleteAccount}>
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Typography className={classes.sectionTitle} style={{ color: "#EB8367" }}>
                    Delete Your Account
                  </Typography>
                  <Typography variant="body2" style={{ marginBottom: "16px", color: "#666" }}>
                    Warning: This action cannot be undone. All your data, settings, and information will be permanently
                    deleted.
                  </Typography>
                </div>
                {!showDeleteConfirmation ? (
                  <div className={classes.deleteAccountSection}>
                    <Button
                      variant="contained"
                      disabled={!canDeleteAccount}
                      style={{
                        backgroundColor: "#EB8367",
                        color: "#FFFFFF",
                        textTransform: "none",
                        opacity: !canDeleteAccount ? 0.5 : 1,
                        width: "fit-content",
                      }}
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                    {!canDeleteAccount && (
                      <Typography variant="body2" style={{ color: "#EB8367", marginTop: "8px" }}>
                        This account cannot be deleted.
                      </Typography>
                    )}
                  </div>
                ) : (
                  <div className={classes.deleteAccountSection}>
                    <Typography variant="body2" style={{ marginBottom: "12px", color: "#666" }}>
                      Are you sure you want to delete your account? This action cannot be undone.
                    </Typography>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <input
                        type="checkbox"
                        checked={confirmDelete}
                        onChange={(e) => setConfirmDelete(e.target.checked)}
                        id="confirm-delete"
                      />
                      <label htmlFor="confirm-delete" style={{ marginLeft: "8px", fontSize: "14px" }}>
                        I understand this action is permanent and cannot be reversed
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <Button
                        variant="contained"
                        style={{
                          backgroundColor: "#EB8367",
                          color: "#FFFFFF",
                          textTransform: "none",
                          fontSize: "14px",
                          padding: "8px 16px",
                        }}
                        onClick={handleConfirmDelete}
                        disabled={!confirmDelete}
                      >
                        Confirm Delete
                      </Button>
                      <Button
                        variant="outlined"
                        style={{
                          fontSize: "14px",
                          padding: "8px 16px",
                        }}
                        onClick={() => {
                          setShowDeleteConfirmation(false)
                          setConfirmDelete(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* </div> */}
            </Grid>
          </Grid>

          {/* Password Change Dialog */}
          <Dialog
            open={showPasswordDialog}
            onClose={() => {
              setShowPasswordDialog(false)
              setPasswordError("")
              setUpdatedPassword("")
              setConfirmPassword("")
            }}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Reset Password</DialogTitle>
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
              <Button
                onClick={() => {
                  setShowPasswordDialog(false)
                  setPasswordError("")
                  setUpdatedPassword("")
                  setConfirmPassword("")
                }}
                color="primary"
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordUpdate} color="primary" variant="contained">
                Update Password
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Account
