import React, { useState } from "react"
import {
  Box,
  MenuItem,
  Fab,
  Icon,
  makeStyles,
  Theme,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  DialogActions,
  Typography,
} from "@material-ui/core"
import { CredentialManager } from "./CredentialManager"
import ResponsiveDialog from "./ResponsiveDialog"
import { useTranslation } from "react-i18next"
import { ReactComponent as PasswordIcon } from "../icons/NewIcons/password-lock.svg"
import { ReactComponent as PasswordFilledIcon } from "../icons/NewIcons/password-lock-filled.svg"
import { useSnackbar } from "notistack"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    actionIcon: {
      width: 24,
      height: 24,
      cursor: "pointer",
      transition: "all 0.3s ease",
      opacity: 0.4,
      "& path": {
        fill: "#000000",
      },
      "&:hover": {
        opacity: 1,
        "& path": {
          fill: "#06B0F0",
        },
      },
      "&.selected": {
        opacity: 1,
        "& path": {
          fill: "#4F95DA",
        },
      },
      "&.active": {
        opacity: 1,
        "& path": {
          fill: "#215F9A",
        },
      },
      "&:hover path": {
        fill: "#06B0F0",
      },
      "&.selected path": {
        fill: "#4F95DA",
      },
      "&.active path": {
        fill: "#215F9A",
      },
    },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",
      "& svg": { marginRight: 8 },
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
  })
)

export default function Credentials({ user, ...props }) {
  const classes = useStyles()
  const [openPasswordReset, setOpenPasswordReset] = useState(null)
  const { t } = useTranslation()

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = () => {
    setShowPasswordDialog(false)
    setUpdatedPassword("")
    setConfirmPassword("")
    setPasswordError("")
  }

  const handleSubmitPassword = () => {
    try {
      //   console.log("Attempting to update credential...", activeButton.id, participant)
      //   const response: any = await LAMP.Credential.update(activeButton.id, participant.email, JSON.stringify({ secret_key: confirmPassword }))
      //   console.log("Update response:", response)
      //   // Check if response contains error
      //   if (response && response.error === "404.no-such-credentials") {
      //     console.log("Attempting to create new credential...")
      //     await LAMP.Credential.create(activeButton.id, participant.email, confirmPassword)
      //     enqueueSnackbar("Successfully created new credential", { variant: "success" })
      //   } else {
      //     enqueueSnackbar("Successfully updated credential", { variant: "success" })
      //   }
      // } catch (updateError) {
      //   console.error("Operation error:", updateError)
      //   throw updateError
      // }
      // setActiveButton({ id: null, action: null })
      setConfirmPassword("")
      setUpdatedPassword("")
      setPasswordError("")
      setShowPasswordDialog(false)
    } catch (error) {
      console.error("Error updating password:", error)
      enqueueSnackbar({
        message: t(`Failed to create/update credential: ${error.message || "Unknown error"}`),
        variant: "error",
      })
      return
    }
  }

  return (
    <Box>
      {props.activeButton?.id === user.id && props.activeButton?.action === "credentials" ? (
        <PasswordFilledIcon
          className={`${classes.actionIcon} active`}
          onClick={() => {
            props.setActiveButton?.({ id: user.id, action: "credentials" })
            setOpenPasswordReset(user.id)
          }}
        />
      ) : (
        <PasswordIcon
          className={classes.actionIcon}
          onClick={() => {
            props.setActiveButton?.({ id: user.id, action: "credentials" })
            setOpenPasswordReset(user.id)
          }}
        />
      )}
      <Dialog open={showPasswordDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Reset Participant Password</DialogTitle>
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
    </Box>
  )
}
