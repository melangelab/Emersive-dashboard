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
    padding: theme.spacing(4, 0),
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
    marginTop: theme.spacing(2),
  },
  deleteAccount: {
    maxWidth: 600,
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
}))

const Account = ({ updateStore, adminType, authType, onLogout, setIdentity, ...props }) => {
  const classes = useStyles()
  const [currentTab, setCurrentTab] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [userId, setUserId] = useState(null)
  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const { enqueueSnackbar } = useSnackbar()

  const [editingFields, setEditingFields] = useState({
    id: false,
    userName: false,
    firstName: false,
    lastName: false,
    emailAddress: false,
    password: false,
    photo: false,
  })

  const [tempValues, setTempValues] = useState({
    id: "",
    userName: "",
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    photo: "",
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleTabChange = (index) => {
    setCurrentTab(index)
  }

  const handleStartEditing = (field) => {
    console.log("Editing field:", field)
    setEditingFields((prev) => ({ ...prev, [field]: true }))
    setTempValues((prev) => ({ ...prev, [field]: profile.data[field] || "" }))
  }

  const handleCancelEditing = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }))
  }

  const handleFieldChange = (field) => (event) => {
    setTempValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSaveField = async (field) => {
    try {
      let updatedProfile

      if (field === "password") {
        updatedProfile = {
          ...profile,
          data: {
            ...profile.data,
            ["password"]: confirmPassword,
          },
        }
      } else {
        updatedProfile = {
          ...profile,
          data: {
            ...profile.data,
            [field]: tempValues[field],
          },
        }
      }

      setProfile(updatedProfile)
      setEditingFields((prev) => ({ ...prev, [field]: false }))

      if (field === "password") {
        // const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
        // const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        // const response = await fetch(`${baseURL}/update-credential`, {
        //   method: "PUT",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: "Basic " + authString,
        //   },
        //   body: {
        //     type_id: LAMP.Auth._type === "admin" ? null : profile.data.id,
        //     access_key: profile.data.emailAddress,
        //     credential: {
        //       access_key: profile.data.emailAddress,
        //       secret_key: confirmPassword
        //     }
        //   } as any
        // })
      } else {
        await LAMP.Type.setAttachment(userId, LAMP.Auth._type, "emersive.profile", updatedProfile.data)
      }

      enqueueSnackbar(`${field} updated successfully`, { variant: "success" })
    } catch (error) {
      console.error("Error updating field:", error)
      enqueueSnackbar(`Failed to update ${field}`, { variant: "error" })

      // Revert to original value on error
      setTempValues((prev) => ({
        ...prev,
        [field]: profile.data[field] || "",
      }))
    }
  }

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get the current user ID
      const userId = await LAMP.Auth._auth.id
      setUserId(userId)

      // Fetch the profile data
      let response: any = await LAMP.Type.getAttachment(userId, "emersive.profile")

      if (!response || !response.data) {
        throw new Error("Invalid profile data structure")
      }

      const temp: any = LAMP.Auth._me
      response.data[0]["id"] = temp.id

      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const params = new URLSearchParams({
        access_key: userId,
      }).toString()
      const credentialResponse: any = await fetch(`${baseURL}/view-credential?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + authString,
        },
      })

      const response2 = await credentialResponse.json()

      response.data[0]["password"] = response2.data

      console.log("FINAL PROFILE", response.data[0])
      setProfile({ data: response.data[0] })
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <div className={classes.loadingContainer}>
        <Typography color="error">{error}</Typography>
      </div>
    )
  }

  const tabs = ["Account", "Social Connect", "Delete Account"]

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    try {
      // Implement account deletion logic using LAMP API
      // await LAMP.Researcher.delete(userId);
      console.log("Account deleted successfully")
      if (onLogout) {
        onLogout()
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
    setConfirmDelete(false)
  }

  const handleCloseDialog = () => {
    setShowPasswordDialog(false)
    setPasswordError("")
  }

  const handleSubmitPassword = async () => {
    try {
      // Validate passwords
      if (updatedPassword !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      let userType = await LAMP.Auth._type
      let credlist
      let response

      if (userType === "admin") {
        credlist = await LAMP.Credential.list(null)
        console.log("CRED LIST", credlist)
        const rightAdminIndex = credlist.findIndex((cred) => cred.access_key === userId)
        response = await LAMP.Credential.update(null, userId, {
          ...(credlist[rightAdminIndex].access_key || {}),
          secret_key: confirmPassword,
        })
      } else {
        const user: any = LAMP.Auth._me
        credlist = await LAMP.Credential.list(user.id)
        response = await LAMP.Credential.update(null, userId, {
          ...(credlist[0] || {}),
          secret_key: confirmPassword,
        })
      }
      console.log("Update response:", response)

      try {
        const res = await setIdentity({
          id: LAMP.Auth._auth.id,
          password: confirmPassword,
          serverAddress: LAMP.Auth._auth.serverAddress,
        })

        console.log("Identity set result:", res)

        if (res.authType === "researcher") {
          if (res.auth.serverAddress === "demo.lamp.digital") {
            let studiesSelected =
              localStorage.getItem("studies_" + res.identity.id) !== null
                ? JSON.parse(localStorage.getItem("studies_" + res.identity.id))
                : []
            if (studiesSelected.length === 0) {
              let studiesList = [res.identity.name]
              localStorage.setItem("studies_" + res.identity.id, JSON.stringify(studiesList))
              localStorage.setItem("studyFilter_" + res.identity.id, JSON.stringify(1))
            }
          } else {
            let researcherT = res.identity
            researcherT.timestamps.lastLoginAt = new Date().getTime()
            researcherT.loggedIn = true
            await LAMP.Researcher.update(researcherT.id, researcherT)
          }
        }

        await Service.deleteDB()
        await Service.deleteUserDB()
      } catch (err) {
        console.error("Error with auth request:", err)
        enqueueSnackbar("Incorrect username, password, or server address.", { variant: "error" })
      }
      await handleSaveField("password")
      setShowPasswordDialog(false)
    } catch (error) {
      console.error("Final error:", error)
      enqueueSnackbar(`Failed to update credential: ${error.message || "Unknown error"}`, { variant: "error" })
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.headerContainer}>
        <div className={classes.profileContainer}>
          <ProfileIcon className={classes.profileIcon} />
          <div className={classes.profileTextContainer}>
            <p>Hi! {props.title}</p>
            <p>{authType}</p>
          </div>
        </div>
      </div>

      <div className={classes.tabsContainer}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`${classes.tab} ${currentTab === index ? classes.activeTab : ""}`}
            onClick={() => handleTabChange(index)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className={classes.formContainer}>
        {currentTab === 0 && (
          <>
            <Grid container spacing={4}>
              {/* Left Column - Profile Form */}
              <Grid item xs={12} md={7}>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>ID</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={profile.data.id === "" ? "NA" : profile.data.id}
                    InputProps={{ readOnly: true }}
                    className={classes.textField}
                  />
                </div>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>Role</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={
                      profile?.data?.role === "system_admin"
                        ? "System Admin"
                        : profile?.data?.role === "admin"
                        ? "Admin"
                        : profile?.data?.role === "researcher"
                        ? "Researcher"
                        : "Participant"
                    }
                    InputProps={{ readOnly: true }}
                    className={classes.textField}
                  />
                </div>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>Username</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={editingFields.userName ? tempValues.userName : profile?.data?.userName || ""}
                    onChange={handleFieldChange("userName")}
                    className={classes.textField}
                    disabled={!editingFields.userName}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {!editingFields.userName ? (
                            <IconButton onClick={() => handleStartEditing("userName")}>
                              <Edit className={classes.editIcon} />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton onClick={() => handleSaveField("userName")}>
                                <Check className={classes.editIcon} />
                              </IconButton>
                              <IconButton onClick={() => handleCancelEditing("userName")}>
                                <Close className={classes.editIcon} />
                              </IconButton>
                            </>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>First Name</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={editingFields.firstName ? tempValues.firstName : profile?.data?.firstName || ""}
                    onChange={handleFieldChange("firstName")}
                    className={classes.textField}
                    disabled={!editingFields.firstName}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {!editingFields.firstName ? (
                            <IconButton onClick={() => handleStartEditing("firstName")}>
                              <Edit className={classes.editIcon} />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton onClick={() => handleSaveField("firstName")}>
                                <Check className={classes.editIcon} />
                              </IconButton>
                              <IconButton onClick={() => handleCancelEditing("firstName")}>
                                <Close className={classes.editIcon} />
                              </IconButton>
                            </>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>Last Name</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={editingFields.lastName ? tempValues.lastName : profile?.data?.lastName || ""}
                    onChange={handleFieldChange("lastName")}
                    className={classes.textField}
                    disabled={!editingFields.lastName}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {!editingFields.lastName ? (
                            <IconButton onClick={() => handleStartEditing("lastName")}>
                              <Edit className={classes.editIcon} />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton onClick={() => handleSaveField("lastName")}>
                                <Check className={classes.editIcon} />
                              </IconButton>
                              <IconButton onClick={() => handleCancelEditing("lastName")}>
                                <Close className={classes.editIcon} />
                              </IconButton>
                            </>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>Email Address</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={editingFields.emailAddress ? tempValues.emailAddress : profile?.data?.emailAddress || ""}
                    onChange={handleFieldChange("emailAddress")}
                    className={classes.textField}
                    disabled={userId === "admin" ? true : !editingFields.emailAddress}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {userId !== "admin" && !editingFields.emailAddress ? (
                            <IconButton onClick={() => handleStartEditing("emailAddress")}>
                              <Edit className={classes.editIcon} />
                            </IconButton>
                          ) : userId !== "admin" && editingFields.emailAddress ? (
                            <>
                              <IconButton onClick={() => handleSaveField("emailAddress")}>
                                <Check className={classes.editIcon} />
                              </IconButton>
                              <IconButton onClick={() => handleCancelEditing("emailAddress")}>
                                <Close className={classes.editIcon} />
                              </IconButton>
                            </>
                          ) : null}
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className={classes.formField}>
                  <Typography className={classes.inputLabel}>Password</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={showPassword ? profile.data.password : "••••••••"} // Masked password display
                    className={classes.textField}
                    disabled={true}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {LAMP.Auth._auth.id === "admin" ? null : (
                            <IconButton onClick={() => setShowPasswordDialog(true)}>
                              <Edit className={classes.editIcon} />
                            </IconButton>
                          )}
                          <IconButton onClick={handleTogglePassword}>
                            {!showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </Grid>

              {/* Right Column - Profile Photo */}
              <Grid item xs={12} md={5} className={classes.gridItem}>
                <div className={classes.profileSection}>
                  <div className={classes.userPhoto}>
                    <ProfileIcon style={{ width: 80, height: 80 }} />
                  </div>
                </div>
              </Grid>
            </Grid>

            <Dialog open={showPasswordDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
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
                <Button onClick={handleCloseDialog} color="primary">
                  Close
                </Button>
                <Button onClick={handleSubmitPassword} color="primary" variant="contained">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* Social Connect Tab */}
        {currentTab === 1 && (
          <div className={classes.socialConnect}>
            <Typography variant="body1" style={{ marginBottom: "20px" }}>
              Connect your account with these services for simplified login and enhanced features.
            </Typography>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#4285F4",
                  color: "#FFFFFF",
                  textTransform: "none",
                  padding: "12px 20px",
                }}
              >
                Connect with Google
              </Button>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#FF6600",
                  color: "#FFFFFF",
                  textTransform: "none",
                  padding: "12px 20px",
                }}
              >
                Connect with MindOrange
              </Button>
            </div>
          </div>
        )}

        {/* Delete Account Tab */}
        {currentTab === 2 && (
          <div className={classes.deleteAccount}>
            <Typography variant="h6" style={{ color: "#EB8367", marginBottom: "10px" }}>
              Delete Your Account
            </Typography>
            <Typography variant="body1" style={{ marginBottom: "20px" }}>
              Warning: This action cannot be undone. All your data, settings, and information will be permanently
              deleted.
            </Typography>
            {!showDeleteConfirmation ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "50px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  disabled={userId === "admin"}
                  style={{
                    backgroundColor: "#EB8367",
                    color: "#FFFFFF",
                    textTransform: "none",
                    opacity: userId === "admin" ? 0.5 : 1,
                  }}
                  onClick={handleDeleteAccount}
                >
                  <span
                    style={{
                      opacity: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete Account
                  </span>
                </Button>
                {userId === "admin" && (
                  <Typography
                    variant="h6"
                    style={{
                      color: "#EB8367",
                      marginTop: "10px",
                    }}
                  >
                    This account belongs to System Admin and can't be deleted.
                  </Typography>
                )}
              </div>
            ) : (
              <div>
                <Typography variant="body1" style={{ marginBottom: "15px" }}>
                  Are you sure you want to delete your account? This action cannot be undone.
                </Typography>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    id="confirm-delete"
                  />
                  <label htmlFor="confirm-delete" style={{ marginLeft: "10px" }}>
                    I understand this action is permanent and cannot be reversed
                  </label>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "#EB8367",
                      color: "#FFFFFF",
                      textTransform: "none",
                    }}
                    onClick={handleConfirmDelete}
                    disabled={!confirmDelete}
                  >
                    Confirm Delete
                  </Button>
                  <Button variant="outlined" onClick={handleCancelDelete}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Account
