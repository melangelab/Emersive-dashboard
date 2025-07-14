import React, { useState } from "react"
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
  Slide,
  Divider,
  Backdrop,
} from "@material-ui/core"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import AddIcon from "@material-ui/icons/Add"
import EditIcon from "@material-ui/icons/Edit"
import { createPortal } from "react-dom"
import { slideStyles } from "../Researcher/ParticipantList/AddButton"

import { ReactComponent as ResearcherIconFilled } from "../../icons/NewIcons/crown.svg"

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
  admin: any
  admins?: any[]
  refreshAdmins?: Function
  setName?: Function
  updateStore?: Function
}

export default function AddUpdateAdmin({
  admin,
  admins = [],
  refreshAdmins,
  setName,
  updateStore,
}: AddUpdateResearcherProps) {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: admin?.firstName ?? "",
    lastName: admin?.lastName ?? "",
    email: admin?.email ?? "",
    username: admin?.username ?? "",
    // password: "",
    // confirmPassword: "",
  })
  const [infoMsg, setInfoMsg] = useState(null)

  const [adminCreated, setAdminCreated] = useState(undefined)

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const sliderclasses = slideStyles()

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: field === "mobile" ? Number(event.target.value) : event.target.value,
    })
  }

  console.log("in the add update researcher")

  // const _checkCredential = async(email) =>{
  //   await LAMP.Credential.list()
  // }

  const addAdmin = async () => {
    const emailId = `${formData.email}`

    const duplicates = admins.filter((x) =>
      !!admin ? `${x.emailAddress}` === emailId && x.id !== admin?.id : `${x.emailAddress}` === emailId
    )

    console.log("ADMINS", admins, emailId, duplicates)

    if (duplicates.length > 0) {
      enqueueSnackbar(t("Admin with same email id already exists."), { variant: "error" })
      resetForm()
      return
    }

    try {
      if (admin) {
      } else {
        let result: any = await LAMP.Type.setAttachment(emailId, "admin", "emersive.profile", {
          role: "admin",
          firstName: formData.firstName,
          lastName: formData.lastName,
          userName: formData.username,
          emailAddress: formData.email,
          photo: null,
        })

        console.log("ADMIN CREATED SET JUST NOW AND ITS VALUE, ", result.data, result)
        setAdminCreated(result.data)

        const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        const params = new URLSearchParams({
          token: result.data.token,
          email: emailId,
          userType: "admin",
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
          const result2 = await response.json()
          enqueueSnackbar(t("✅ Email sent successfully."), { variant: "success" })
          if (result2?.result === "Credential Exists") {
            setInfoMsg(
              "A researcher already exists for this email ID. You can use the same credentials or reset them through the link sent via email."
            )
          }
          refreshAdmins?.()
          setAdminCreated(result.data)
          enqueueSnackbar(admin ? t("Successfully updated admin.") : t("Successfully created admin."), {
            variant: "success",
          })
        } else {
          const errorData = await response.json() // Get error details
          console.error("❌ Failed to send email:", errorData.message)
        }
      }
    } catch (error) {
      enqueueSnackbar(t("Failed to create a new Admin."), { variant: "error" })
    }
  }

  const handleSuccess = () => {
    if (admin) {
      // updateStore?.(researcher.id)
      setName?.(`${formData.firstName} ${formData.lastName}`.trim())
    } else {
      resetForm()
    }
    setOpen(false)
    setAdminCreated(undefined)
  }

  const resetForm = () => {
    setFormData({
      firstName: admin?.firstName ?? "",
      lastName: admin?.lastName ?? "",
      email: admin?.email ?? "",
      username: admin?.username ?? "",
    })
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <Box>
      <Fab className="add-fab-btn">
        <AddIcon onClick={() => setOpen(true)} />
      </Fab>

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
                  <p>ADD NEW ADMIN</p>
                </div>

                {!adminCreated ? (
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
                      label={t("Username")}
                      fullWidth
                      value={formData.username}
                      onChange={handleInputChange("username")}
                      required
                    />
                  </>
                ) : (
                  <>
                    <Divider />
                    <p style={{ padding: "20px", whiteSpace: "pre-line" }}>
                      New Admin - {formData?.firstName} {formData?.lastName} - has been successfully added.
                      {"\n"}A set password mail has been successfully sent to the email -{formData?.email}.{"\n"}The
                      link will expire after 24 hours.
                    </p>
                    {infoMsg ? (
                      <p style={{ padding: "20px", whiteSpace: "pre-line", marginTop: "10px" }}>{infoMsg}</p>
                    ) : null}
                    <Divider />
                  </>
                )}
                <Box style={{ justifyContent: "flex-start", padding: "8px 24px", marginTop: 0 }}>
                  {!adminCreated ? (
                    <>
                      <Button onClick={handleClose} color="primary">
                        {t("Cancel")}
                      </Button>
                      <Button
                        onClick={addAdmin}
                        color="primary"
                        disabled={!formData.firstName.trim() || !formData.lastName.trim()}
                      >
                        {t("Add")}
                      </Button>
                    </>
                  ) : (
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
                  )}
                </Box>
              </Box>
            </Slide>
          </>,
          document.body
        )}
    </Box>
  )
}
