import React, { useState } from "react"
import { Fab, Box, TextField, IconButton } from "@material-ui/core"
import { useSnackbar } from "notistack"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import { useTranslation } from "react-i18next"
import axios from "axios"

export default function ForgotPasswordForm({ onBack }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    console.log("****URL FINAL****", `${process.env.REACT_APP_NODE_SERVER_URL}/auth/forgot-password`)

    try {
      await axios.post(`${process.env.REACT_APP_NODE_SERVER_URL}/auth/forgot-password`, { email })
      enqueueSnackbar(t("Password reset link has been sent to your email"), { variant: "success" })
      onBack()
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("Failed to send reset link. Please try again.")
      enqueueSnackbar(errorMessage, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: "100%", minWidth: "420px" }}>
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
