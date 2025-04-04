import React, { useState } from "react"

import {
  Fab,
  Box,
  TextField,
  Slide,
  Menu,
  MenuItem,
  colors,
  Grid,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core"
import { ResponsiveMargin } from "./Utils"
import { ReactComponent as Logo } from "../icons/Logo.svg"
import { ReactComponent as LineArt } from "../icons/login_line_drawing.svg"
import { useTranslation } from "react-i18next"
import { Autocomplete } from "@mui/material"
import LAMP from "lamp-core"

const SetPassword = ({ token, onComplete, title, userType }) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [submitClick, setSubmitClick] = useState(false)
  const { t, i18n } = useTranslation()

  // Dialog state
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const showAlert = (message) => {
    setAlertMessage(message)
    setAlertOpen(true)
  }

  const handleCloseAlert = () => {
    setAlertOpen(false)
  }

  const validateForm = () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      showAlert("Passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setSubmitClick(true)

    const baseURL = process.env.REACT_APP_NODE_SERVER_URL || "api.lamp.digital"
    const params = new URLSearchParams({
      token: token,
      userType: userType,
    }).toString()

    try {
      const response = await fetch(`${baseURL}/set-password?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        showAlert("Password reset successfully")
        onComplete()
      } else {
        showAlert("Error resetting password")
        setSubmitClick(false)
      }
    } catch (error) {
      showAlert("Error connecting to server")
      setSubmitClick(false)
    }
  }

  return (
    <>
      <Slide direction="right" in={true} mountOnEnter unmountOnExit>
        <ResponsiveMargin>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            style={{ minHeight: "100vh", height: "100vh", width: "100vw" }}
          >
            {supportsSidebar && (
              <Grid item xs={12} md={7} className="line-art-container">
                <div className="line-art-div">
                  <LineArt className="line-art" />
                </div>
                <span className="platform-name">emersive</span>
                <span className="platform-desc">MOBILE SENSING RESEARCH</span>
              </Grid>
            )}
            <Grid item xs={12} md={supportsSidebar ? 5 : 12} className="grid-item">
              <div className="card-container">
                <Logo className="logo-component" />
                <h1
                  style={{
                    margin: "0px",
                    marginBottom: "20px",
                    alignSelf: "center",
                    fontWeight: "300",
                  }}
                >
                  Set Password
                </h1>
                <form onSubmit={handleSubmit}>
                  <Box>
                    <TextField
                      required
                      name="password"
                      type="password"
                      margin="normal"
                      variant="outlined"
                      style={{ width: "100%", height: 50 }}
                      placeholder={`${t("New Password")}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        className: "textfield-style",
                        autoCapitalize: "off",
                      }}
                    />

                    <TextField
                      required
                      name="confirmPassword"
                      type="password"
                      margin="normal"
                      variant="outlined"
                      style={{ width: "100%", height: 50, marginBottom: "25px" }}
                      placeholder={`${t("Confirm Password")}`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        className: "textfield-style",
                        autoCapitalize: "off",
                      }}
                    />

                    <Box className="button-nav" width={1} textAlign="center">
                      <Fab
                        variant="extended"
                        type="submit"
                        style={{ background: "#7599FF", color: "White" }}
                        className={submitClick ? "loginDisabled" : ""}
                      >
                        {`Submit`}
                        <input
                          type="submit"
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0,
                            width: "100%",
                            opacity: 0,
                          }}
                          disabled={submitClick}
                        />
                      </Fab>
                    </Box>
                  </Box>
                </form>
              </div>
            </Grid>
          </Grid>
        </ResponsiveMargin>
      </Slide>

      {/* Alert Dialog */}
      <Dialog
        open={alertOpen}
        onClose={handleCloseAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{alertMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlert} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SetPassword
