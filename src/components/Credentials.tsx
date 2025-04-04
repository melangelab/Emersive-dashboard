import React, { useState } from "react"
import { Box, MenuItem, Fab, Icon, makeStyles, Theme, createStyles } from "@material-ui/core"
import { CredentialManager } from "./CredentialManager"
import ResponsiveDialog from "./ResponsiveDialog"
import { useTranslation } from "react-i18next"
import { ReactComponent as PasswordIcon } from "../icons/NewIcons/password-lock.svg"
import { ReactComponent as PasswordFilledIcon } from "../icons/NewIcons/password-lock-filled.svg"

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
      <ResponsiveDialog
        transient
        open={!!openPasswordReset}
        onClose={() => {
          setOpenPasswordReset(undefined)
          props.setActiveButton?.({ id: null, action: null })
        }}
      >
        <CredentialManager style={{ margin: 16 }} id={openPasswordReset} />
      </ResponsiveDialog>
    </Box>
  )
}
