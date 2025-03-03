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
} from "@material-ui/core"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import AddIcon from "@material-ui/icons/Add"
import EditIcon from "@material-ui/icons/Edit"

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
    password: "",
    confirmPassword: "",
  })

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: field === "mobile" ? Number(event.target.value) : event.target.value,
    })
  }

  // const _checkCredential = async(email) =>{
  //   await LAMP.Credential.list()
  // }

  const addResearcher = async () => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    const duplicates = researchers.filter((x) =>
      !!researcher
        ? `${x.firstName} ${x.lastName}`.toLowerCase() === fullName.toLowerCase() && x.id !== researcher?.id
        : `${x.firstName} ${x.lastName}`.toLowerCase() === fullName.toLowerCase()
    )

    if (duplicates.length > 0) {
      enqueueSnackbar(t("Investigator with same name already exists."), { variant: "error" })
      resetForm()
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

        // If the researcher creation is successful, create the credential
        const researcherId = resultR.data // Assuming the backend returns the ID

        let result = (await LAMP.Credential.create(researcherId, formData.email, formData.password, fullName)) as any
        if (result.error) {
          return result.error
        }
      }
      handleSuccess()
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
      refreshResearchers?.()
    }
    enqueueSnackbar(researcher ? t("Successfully updated investigator.") : t("Successfully created investigator."), {
      variant: "success",
    })
    setOpen(false)
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
      password: researcher?.password ?? "",
      confirmPassword: researcher?.confirmPassword ?? "",
    })
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <Box>
      {researcher ? (
        <Fab size="small" classes={{ root: classes.btnWhite }} onClick={() => setOpen(true)}>
          <Icon>edit</Icon>
        </Fab>
      ) : (
        <Button
          variant="contained"
          className={`${classes.addButton} ${!supportsSidebar ? classes.addButtonCompact : ""}`}
          onClick={() => setOpen(true)}
        >
          {supportsSidebar ? t("+ Add") : "+"}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogContent className={classes.dialogContent}>
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
            label={t("Password")}
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange("password")}
            required
          />
          <TextField
            margin="dense"
            label={t("Confirm Password")}
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            required
            error={formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword}
            helperText={
              formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword
                ? t("Passwords do not match")
                : ""
            }
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t("Cancel")}
          </Button>
          <Button
            onClick={addResearcher}
            color="primary"
            disabled={!formData.firstName.trim() || !formData.lastName.trim()}
          >
            {researcher ? t("Update") : t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
