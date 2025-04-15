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
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column" }}>
        <IconButton onClick={onBack} style={{ position: "absolute", left: -24, top: -24 }}>
          <ArrowBackIcon />
        </IconButton>

        <h1
          style={{
            marginTop: "20px",
            alignSelf: "center",
          }}
        >
          {t("Forgot Password")}
        </h1>

        <h4
          style={{
            marginTop: "20px",
            alignSelf: "center",
          }}
        >
          {t("Provide your email address to receive the reset link")}
        </h4>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box style={{ width: "100%" }}>
            <TextField
              required
              name="email"
              type="email"
              margin="normal"
              variant="outlined"
              style={{ width: "100%", height: 50, marginTop: "40px" }}
              placeholder={t("Enter your email address")}
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
              style={{ width: "100%", borderRadius: "10px", padding: "10px", marginTop: "10px" }}
              displayEmpty // ✅ This makes the placeholder visible
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

            <Box textAlign="center" width={1} mt={4}>
              <Box className="buttonNav" width={1} textAlign="center">
                <Fab
                  variant="extended"
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#7599FF",
                    color: "White",
                    width: "200px",
                  }}
                >
                  {loading ? t("Sending...") : t("Send Reset Link")}
                </Fab>
              </Box>
            </Box>

            <Box textAlign="center" width={1} mt={4}>
              <span onClick={onBack} className="linkBlue" style={{ cursor: "pointer" }}>
                {t("Back to Login")}
              </span>
            </Box>
          </Box>
        </form>
      </div>
    </div>
  )
}
