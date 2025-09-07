import React, { useState, useRef } from "react"
import {
  Box,
  DialogContent,
  makeStyles,
  Theme,
  createStyles,
  Fab,
  Icon,
  Dialog,
  DialogActions,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
  Paper,
  Slide,
  Backdrop,
} from "@material-ui/core"
import ClickAwayListener from "@material-ui/core/ClickAwayListener"

import Popper from "@material-ui/core/Popper"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import AddIcon from "@material-ui/icons/Add"
import EditIcon from "@material-ui/icons/Edit"
import "./admin.css"
import { createPortal } from "react-dom"
import { ReactComponent as ResearcherIconFilled } from "../../icons/NewIcons/crown.svg"
import { slideStyles } from "../Researcher/ParticipantList/AddButton"

enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      backgroundColor: "#4285f4",
      color: "#fff",
      // padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "#3367d6",
      },
      fontSize: "1rem",
    },
    addButtonCompact: {
      width: theme.spacing(5), // Ensures some width
      height: theme.spacing(5),
      flexShrink: 0,
      minWidth: "unset",
      fontSize: "1.5rem",

      // boxSizing: "content-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dialogContent: {
      minWidth: 400,
      padding: theme.spacing(2),
    },
    btnWhite: {
      background: "#fff",
      height: "40px",
      borderRadius: "50%",
      boxShadow: "none",
      color: "#7599FF",
      "&:hover": {
        color: "#5680f9",
        background: "#fff",
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      },
    },
  })
)

interface AddUpdateResearcherProps {
  researcher?: any
  researchers?: any[]
  refreshResearchers?: Function
  setName?: Function
  updateStore?: Function
}

export default function AddUpdateResearcher({
  researcher,
  researchers = [],
  refreshResearchers,
  setName,
  updateStore,
}: AddUpdateResearcherProps) {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: researcher?.firstName ?? "",
    lastName: researcher?.lastName ?? "",
    email: researcher?.email ?? "",
    mobile: researcher?.mobile ?? "",
    institution: researcher?.institution ?? "",
    username: researcher?.username ?? "",
    address: researcher?.address ?? "",
    adminNote: researcher?.adminNote ?? "",
  })
  const [researcherCreated, setResearcherCreated] = useState(undefined)
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const anchorRef = useRef(null)
  const [dialogPos, setDialogPos] = useState({ top: 0, left: 0 })

  const sliderclasses = slideStyles()

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    })
  }

  const addResearcher = async () => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    const duplicates = researchers.filter((x) =>
      !!researcher
        ? `${x.firstName} ${x.lastName}`.toLowerCase() === fullName.toLowerCase() && x.id !== researcher?.id
        : `${x.firstName} ${x.lastName}`.toLowerCase() === fullName.toLowerCase()
    )

    if (duplicates.length > 0) {
      enqueueSnackbar(t("Investigator with same name already exists."), { variant: "error" })
      return
    }

    const researcherObj = new Researcher()
    Object.assign(researcherObj, {
      ...formData,
      status: UserStatus.ACTIVE,
    })

    try {
      if (researcher) {
        await LAMP.Researcher.update(researcher.id, researcherObj)
      } else {
        let resultR = (await LAMP.Researcher.create(researcherObj)) as any
        if (!!resultR.error) {
          return resultR.error
        }
        setResearcherCreated(researcherObj)
        const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        const params = new URLSearchParams({
          token: resultR.data.token,
          email: researcherObj.email,
          userType: "researcher",
          parentEmail: LAMP.Auth._auth.id === "admin" ? null : LAMP.Auth._auth.id,
        }).toString()

        const response = await fetch(`${baseURL}/send-password-email?${params}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + authString,
          },
        })

        if (response.ok) {
          const result = await response.json()
          enqueueSnackbar(t("✅ Email sent successfully."), { variant: "success" })
          refreshResearchers?.()
          setResearcherCreated(researcherObj)
          enqueueSnackbar(t("Successfully created investigator."), { variant: "success" })
        } else {
          const errorData = await response.json() // Get error details
          enqueueSnackbar("❌ Failed to send email:", { variant: "error" })
        }
      }
    } catch (error) {
      enqueueSnackbar(t("Failed to create a new investigator."), { variant: "error" })
    }
  }

  const handleSuccess = () => {
    if (researcher) {
      updateStore?.(researcher.id)
      setName?.(`${formData.firstName} ${formData.lastName}`.trim())
    } else {
      resetForm()
    }
    setOpen(false)
    setResearcherCreated(undefined)
  }

  const resetForm = () => {
    setFormData({
      firstName: researcher?.firstName ?? "",
      lastName: researcher?.lastName ?? "",
      email: researcher?.email ?? "",
      mobile: researcher?.mobile ?? "",
      institution: researcher?.institution ?? "",
      username: researcher?.username ?? "",
      adminNote: researcher?.adminNote ?? "",
      address: researcher?.address ?? "",
      // password: researcher?.password ?? "",
      // confirmPassword: researcher?.confirmPassword ?? "",
    })
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <div className="add-icon-container">
      {researcher ? (
        <Fab size="small" classes={{ root: classes.btnWhite }} onClick={() => setOpen(true)}>
          <Icon>edit</Icon>
        </Fab>
      ) : (
        <button className="add-pill-btn" ref={anchorRef as any} onClick={() => setOpen((prev) => !prev)} type="button">
          <span className="plus-circle">
            <AddIcon className="add-icon" />
          </span>
          <span className="pill-label">RESEARCHER</span>
        </button>
      )}

      {open &&
        createPortal(
          <>
            <Backdrop className={sliderclasses.backdrop} open={open} onClick={() => setOpen(false)} />
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
              <Box className={sliderclasses.slidePanel} onClick={(e) => e.stopPropagation()}>
                <div className="add-researcher-header">
                  <div className="add-researcher-icon">
                    <ResearcherIconFilled />
                  </div>
                  <p>ADD NEW RESEARCHER</p>
                </div>

                {!researcherCreated ? (
                  <>
                    <TextField
                      margin="dense"
                      label={t("First Name")}
                      fullWidth
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      required
                    />
                    <TextField
                      margin="dense"
                      label={t("Last Name")}
                      fullWidth
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      required
                    />
                    <TextField
                      margin="dense"
                      label={t("Email")}
                      type="email"
                      fullWidth
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      required
                    />
                    <TextField
                      margin="dense"
                      label={t("Mobile")}
                      type="number"
                      fullWidth
                      value={formData.mobile}
                      onChange={handleInputChange("mobile")}
                    />
                    <TextField
                      margin="dense"
                      label={t("Institution")}
                      fullWidth
                      value={formData.institution}
                      onChange={handleInputChange("institution")}
                    />
                    <TextField
                      margin="dense"
                      label={t("Username")}
                      fullWidth
                      value={formData.username}
                      onChange={handleInputChange("username")}
                      required
                    />
                    <TextField
                      margin="dense"
                      label={t("Address")}
                      fullWidth
                      value={formData.address}
                      onChange={handleInputChange("address")}
                    />
                    <TextField
                      margin="dense"
                      label={t("Admin Note")}
                      fullWidth
                      multiline
                      rows={4}
                      value={formData.adminNote}
                      onChange={handleInputChange("adminNote")}
                    />

                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <Button onClick={handleClose} color="primary">
                        {t("Cancel")}
                      </Button>
                      <Button
                        onClick={addResearcher}
                        color="primary"
                        disabled={!formData.firstName.trim() || !formData.lastName.trim()}
                      >
                        {t("Add")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Divider />
                    <p style={{ padding: "20px", whiteSpace: "pre-line" }}>
                      New Researcher - {researcherCreated?.firstName} {researcherCreated?.lastName} - has been
                      successfully added.
                      {"\n"}A set password mail has been successfully sent to the email - {researcherCreated?.email}.
                      {"\n"}
                      The link will expire after 24 hours.
                    </p>
                    <Divider />
                    <div style={{ marginTop: 16 }}>
                      <button
                        onClick={handleSuccess}
                        style={{
                          backgroundColor: "#FEE2D4",
                          color: "#C06E3C",
                          border: "none",
                          borderRadius: "12px",
                          padding: "10px 24px",
                          fontSize: "16px",
                          fontWeight: "500",
                          cursor: "pointer",
                          boxShadow: "none",
                          textTransform: "uppercase",
                        }}
                      >
                        EXIT
                      </button>
                    </div>
                  </>
                )}
              </Box>
            </Slide>
          </>,
          document.body
        )}
    </div>
  )
}
