import React, { useEffect, useState } from "react"
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Icon,
  Box,
  Link,
  makeStyles,
  Theme,
  createStyles,
  Fab,
  Paper,
  Typography,
} from "@material-ui/core"
import NotificationSettings from "./NotificationSettings"
import Credentials from "../../Credentials"
import ParticipantName from "./ParticipantName"
import ParticipantDetailsDialog from "./ParticipantDetailsDialog"
import LAMP from "lamp-core"
import { ReactComponent as SuspendIcon } from "../../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as SuspendFilledIcon } from "../../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { studycardStyles, useModularTableStyles } from "../Studies/Index"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import ConfirmationDialog from "../../ConfirmationDialog"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    cardMain: {
      borderRadius: 16,
      // boxShadow: "none !important ",
      margin: "11px",
      background: "#E0E0E0",
      "& span.MuiCardHeader-title": { fontSize: "16px", fontWeight: 500 },
    },
    checkboxActive: { color: "#7599FF !important" },
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
    settingslink: {
      background: "#fff",
      width: 40,
      height: 40,
      borderRadius: "50%",
      padding: 8,
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    settingsLink: {
      background: "#fff",
      width: 40,
      height: 40,
      borderRadius: "50%",
      padding: 8,
      color: "#7599FF",
      "&:hover": {
        color: "#5680f9",
        background: "#fff",
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      },
    },
    actionCell: {
      position: "sticky",
      right: 0,
      background: "white",
      zIndex: 1,
      padding: theme.spacing(1),
    },
    statusContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
    },
    statusBox: {
      padding: theme.spacing(1, 3),
      borderRadius: theme.spacing(0.5),
      minWidth: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      marginRight: theme.spacing(1),
    },
    statusActive: {
      backgroundColor: "#e8f5e9",
      border: "1px solid #43a047",
      "& $statusIndicator": {
        backgroundColor: "#43a047",
      },
      "& .MuiTypography-root": {
        color: "#2e7d32",
      },
    },
    statusInactive: {
      backgroundColor: "#ffebee",
      border: "1px solid #e53935",
      "& $statusIndicator": {
        backgroundColor: "#e53935",
      },
      "& .MuiTypography-root": {
        color: "#c62828",
      },
    },
  })
)

export default function ParticipantTableRow({
  participant,
  visibleColumns,
  selectedParticipants,
  handleChange,
  onParticipantSelect,
  researcherId,
  notificationColumn,
  authType,
  pStudy,
  ...props
}) {
  const classes = useStyles()
  const [checked, setChecked] = useState(selectedParticipants.filter((d) => d.id === participant.id).length > 0)
  const [openSettings, setOpenSettings] = useState(false)
  const handleCheckChange = (event) => {
    setChecked(event.target.checked)
    handleChange(participant, event.target.checked)
  }
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  useEffect(() => {
    setChecked(selectedParticipants.filter((d) => d.id === participant.id).length > 0)
  }, [selectedParticipants, participant.id])
  const ptablestyles = useModularTableStyles()
  const [user, setName] = useState(participant)

  const updateParticipant = (nameVal: string) => {
    setName({ ...user, name: nameVal })
  }
  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 mins for reference now

  const checkUserStatus = (participant) => {
    const lastActivity = new Date(participant.systemTimestamps?.lastActivityTime)
    const now = new Date()
    const timeDiff = now.getTime() - lastActivity.getTime()

    // If no participant in last 5 minutes means user logged out
    if (timeDiff > SESSION_TIMEOUT && participant.isLoggedIn) {
      LAMP.Participant.update(participant.id, {
        ...participant,
        isLoggedIn: false,
        systemTimestamps: {
          ...participant.systemTimestamps,
          lastActivityTime: lastActivity,
        },
      }).then(() => {
        participant.isLoggedIn = false
        participant.systemTimestamps = {
          ...participant.systemTimestamps,
          lastActivityTime: lastActivity,
        }
        // props.setParticipants(prev => prev.map(p =>
        //   p.id === participant.id ? {...p, isLoggedIn: false} : p
        // ));
      })
    }
    return timeDiff <= SESSION_TIMEOUT && participant.isLoggedIn
  }
  const participantcardclasses = studycardStyles()
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const handleDelete = async (status) => {
    if (status === "Yes") {
      try {
        await LAMP.Participant.delete(participant.id)
        await Service.delete("participants", [participant.id])
        await Service.updateCount("studies", participant.study_id, "participant_count", 1, 1)
        // await props.searchActivities()
        enqueueSnackbar(t("Participant deleted successfully"), { variant: "success" })
      } catch (error) {
        console.error("Error deleting participant:", error)
        enqueueSnackbar(t("Failed to delete participant"), { variant: "error" })
      }
    } else {
      setConfirmationDialog(false)
    }
    setConfirmationDialog(false)
    setActiveButton({ id: null, action: null })
  }

  const actions = () => (
    <Box display="flex" alignItems="center" style={{ gap: 8 }}>
      <Box component="span" className={ptablestyles.actionIcon}>
        {notificationColumn && <NotificationSettings participant={participant} />}
      </Box>
      <Box component="span" className={ptablestyles.actionIcon}>
        {activeButton.id === participant.id && activeButton.action === "view" ? (
          <ViewFilledIcon
            className={`${participantcardclasses.actionIcon} active`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "view" })
              onParticipantSelect(participant.id)
              setActiveButton({ id: null, action: null })
            }}
          />
        ) : (
          <ViewIcon
            className={`${participantcardclasses.actionIcon} ${
              activeButton.id === participant.id && activeButton.action === "view" ? "active" : ""
            }`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "view" })
              onParticipantSelect(participant.id)
              setActiveButton({ id: null, action: null })
            }}
          />
        )}
      </Box>
      <Box component="span" className={ptablestyles.actionIcon}>
        {activeButton.id === participant.id && activeButton.action === "edit" ? (
          <EditFilledIcon
            className={`${participantcardclasses.actionIcon} active`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "edit" })
              setDetailsDialogOpen(true)
            }}
          />
        ) : (
          <EditIcon
            className={`${participantcardclasses.actionIcon} ${
              activeButton.id === participant.id && activeButton.action === "edit" ? "active" : ""
            }`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "edit" })
              setDetailsDialogOpen(true)
            }}
          />
        )}
      </Box>
      <Box component="span" className={ptablestyles.actionIcon}>
        <Credentials user={participant} />
      </Box>
      {/* {props.authType === "admin" && ( )}*/}
      <Box component="span" className={ptablestyles.actionIcon}>
        {!participant.systemTimestamps?.suspensionTime ? (
          activeButton.id === participant.id && activeButton.action === "suspend" ? (
            <SuspendFilledIcon
              className={`${participantcardclasses.actionIcon} active`}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "suspend" })
                props.onSuspend(participant, setActiveButton)
              }}
            />
          ) : (
            <SuspendIcon
              className={participantcardclasses.actionIcon}
              onClick={() => {
                setActiveButton({ id: participant.id, action: "suspend" })
                props.onSuspend(participant, setActiveButton)
              }}
            />
          )
        ) : activeButton.id === participant.id && activeButton.action === "suspend" ? (
          <SuspendFilledIcon
            className={`${participantcardclasses.actionIcon} active`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "suspend" })
              props.onUnSuspend(participant, setActiveButton)
            }}
          />
        ) : (
          <SuspendIcon
            className={participantcardclasses.actionIcon}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "suspend" })
              props.onUnSuspend(participant, setActiveButton)
            }}
          />
        )}
      </Box>
      <Box component="span" className={ptablestyles.actionIcon}>
        {activeButton.id === participant.id && activeButton.action === "delete" ? (
          <DeleteFilledIcon
            className={`${participantcardclasses.actionIcon} active`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "delete" })
              setConfirmationDialog(true)
            }}
          />
        ) : (
          <DeleteIcon
            className={participantcardclasses.actionIcon}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "delete" })
              setConfirmationDialog(true)
            }}
          />
        )}
      </Box>
      <Box component="span" className={ptablestyles.actionIcon}>
        {activeButton.id === participant.id && activeButton.action === "settings" ? (
          <CopyFilledIcon
            className={`${participantcardclasses.actionIcon} active`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "settings" })
              window.location.href = `/#/researcher/${researcherId}/participant/${participant?.id}/settings`
            }}
          />
        ) : (
          <CopyIcon
            className={`${participantcardclasses.actionIcon} ${
              activeButton.id === participant.id && activeButton.action === "settings" ? "active" : ""
            }`}
            onClick={() => {
              setActiveButton({ id: participant.id, action: "settings" })
              window.location.href = `/#/researcher/${researcherId}/participant/${participant?.id}/settings`
            }}
          />
        )}
      </Box>
    </Box>
  )

  useEffect(() => {
    setName(user)
  }, [user])

  return (
    <>
      <TableRow hover role="checkbox" aria-checked={checked} selected={checked}>
        <TableCell padding="checkbox">
          <Checkbox checked={checked} onChange={handleCheckChange} className={classes.checkboxActive} />
        </TableCell>

        {visibleColumns.map((column) => (
          <TableCell key={column.id}>
            {/* isLoggedIn */}
            {column.id === "username" ? (
              <ParticipantName
                participant={participant}
                updateParticipant={updateParticipant}
                openSettings={openSettings}
              />
            ) : column.id === "isLoggedIn" ? (
              <Paper
                elevation={0}
                className={`${classes.statusBox} ${
                  participant.isLoggedIn ? classes.statusActive : classes.statusInactive
                }`}
              >
                {/* checkUserStatus(participant)  */}
                <span className={classes.statusIndicator} />
                <Typography variant="body2">{participant.isLoggedIn ? "Online" : "Offline"}</Typography>
              </Paper>
            ) : (
              column.value(participant)
            )}
          </TableCell>
        ))}

        <TableCell className={ptablestyles.actionCell}>
          <Box className={ptablestyles.actionButtons}>{actions()}</Box>
        </TableCell>
      </TableRow>
      <ParticipantDetailsDialog
        participant={participant}
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        onSave={async (updatedParticipant) => {
          try {
            // Call parent's update function
            await props.onParticipantUpdate(participant.id, updatedParticipant)
            setDetailsDialogOpen(false)
          } catch (error) {
            console.error("Error updating participant:", error)
          }
        }}
        formatDate={props.formatDate}
        researcherId={researcherId}
        pStudy={pStudy}
      />
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => {
          setConfirmationDialog(false)
          setActiveButton({ id: null, action: null })
        }}
        confirmAction={handleDelete}
        confirmationMsg={t("Are you sure you want to delete this Participant?")}
      />
    </>
  )
}
