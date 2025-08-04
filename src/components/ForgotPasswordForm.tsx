import React, { useState } from "react"
import { Fab, Box, TextField, IconButton, Select, MenuItem } from "@material-ui/core"
import { useSnackbar } from "notistack"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import { useTranslation } from "react-i18next"
import axios from "axios"

export default function ForgotPasswordForm({ onBack }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [userType, setUserType] = useState(null)

  const userOptions = { admin: "Admin", researcher: "Researcher", participant: "Participant" }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    const serverAddress =
      process.env.NODE_ENV === "development" && process.env.REACT_APP_PORT === "8000"
        ? "https://192.168.21.214:8000"
        : "https://emersive.io"

    console.log("SERVER ADDRESS", serverAddress, process.env.NODE_ENV, process.env.REACT_APP_PORT)

    try {
      await axios.post(`${serverAddress}/auth/forgot-password-mail`, { email, userType })
      enqueueSnackbar(t("Password reset link has been sent to your email"), { variant: "success" })
      onBack()
    } catch (error) {
      console.log("TTTT", error, error.response?.data?.error)
      const errorMessage = error.response?.data?.error || t("Failed to send reset link. Please try again.")
      enqueueSnackbar(errorMessage, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <h1 className="forgot-password-title">{t("Forgot Password ?")}</h1>

        <h4 className="forgot-password-subtitle">
          {t("Please enter the address you'd like your password reset information sent to")}
        </h4>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <Box className="forgot-password-form-box">
            <TextField
              required
              name="email"
              type="email"
              margin="normal"
              variant="outlined"
              className="forgot-password-email-field"
              placeholder={t("Email address*")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                className: "textfield-style",
                autoCapitalize: "off",
                disabled: loading,
              }}
            />

            <Select
              required
              labelId="select-label"
              value={userType || ""}
              onChange={(e) => setUserType(e.target.value)}
              className="forgot-password-select"
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select an option
              </MenuItem>

              {Object.entries(userOptions).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>

            <Box className="forgot-password-button-container">
              <Box className="forgot-password-button-wrapper buttonNav">
                <Fab variant="extended" type="submit" disabled={loading} className="forgot-password-submit-button">
                  {loading ? t("Sending...") : t("Send Reset Link")}
                </Fab>
              </Box>
            </Box>

            <Box className="forgot-password-back-container">
              <span className="forgot-password-back-text">
                Return to{" "}
                <a onClick={onBack} className="forgot-password-back-link">
                  Sign in
                </a>
              </span>
            </Box>
          </Box>
        </form>
      </div>
    </div>
  )
}
