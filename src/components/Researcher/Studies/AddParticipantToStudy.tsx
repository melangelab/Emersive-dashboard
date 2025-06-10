import React, { useState } from "react"
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Backdrop,
  Slide,
  Button,
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"
import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      backgroundColor: "#4CAF50",
      padding: theme.spacing(1),
      borderRadius: "40%",
      width: 40,
      height: 40,
      minWidth: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      "& path": {
        fill: "#FFFFFF",
      },
      "&:hover": {
        backgroundColor: "#45a049",
      },
    },
    field: {
      marginBottom: theme.spacing(2),
    },
  })
)

export default function AddParticipantToStudy({
  study,
  researcherId,
  onParticipantAdded,
  title,
  resemail,
  open,
  onclose,
}) {
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [notes, setNotes] = useState("")
  const [newParticipantId, setNewParticipantId] = useState(null)

  const resetForm = () => {
    setSelectedGroup("")
    setFirstName("")
    setLastName("")
    setEmail("")
    setMobile("")
    setNotes("")
  }

  const validateForm = () => {
    if (!selectedGroup) {
      enqueueSnackbar("Please select a group", { variant: "error" })
      return false
    }
    if (!firstName || !lastName) {
      enqueueSnackbar("First Name and Last Name are required", { variant: "error" })
      return false
    }
    return true
  }

  const handleAddParticipant = async () => {
    if (!validateForm()) return

    try {
      const participantData = {
        study_id: study.id,
        study_name: study.name,
        group_name: selectedGroup,
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobile: mobile,
        researcherNote: notes,
      }

      const participants = await Service.getAll("participants")
      const duplicates = Array.isArray(participants) ? participants.filter((x) => `${x.emailAddress}` === email) : []

      if (duplicates.length > 0) {
        enqueueSnackbar(t("Participant with same email id already exists."), { variant: "error" })
        resetForm()
        return
      }

      let idData = ((await LAMP.Participant.create(study.id, {
        study_id: study.id,
        study_name: study.name,
        group_name: selectedGroup,
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobile: mobile,
        researcherNote: notes,
      } as any)) as any).data

      console.log("Before sending email")

      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const params = new URLSearchParams({
        token: idData.token,
        email: email,
        userType: "participant",
      }).toString()

      const response: any = await fetch(`${baseURL}/send-password-email?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + authString,
        },
      })

      console.log("After sending email")

      if (response.error) {
        enqueueSnackbar(`${t("Could not create credential for id.", { id: idData.id })}`, { variant: "error" })
      }

      const participantId = typeof idData === "object" ? idData.id : idData

      await LAMP.Type.setAttachment(participantId, "me", "lamp.group_name", selectedGroup)

      const currentStudy = (await LAMP.Study.view(study.id)) as any
      const timestamps = currentStudy.timestamps || {}
      const updatedTimestamps = {
        ...timestamps,
        lastEnrollmentAt: new Date(),
        firstEnrollmentAt: timestamps.firstEnrollmentAt || new Date(),
      }

      const studyParticipants = currentStudy?.participants
      const participantCreated = await LAMP.Participant.view(participantId)
      const updatedParticipants = [...studyParticipants, participantCreated]

      await LAMP.Study.update(study.id, {
        ...currentStudy,
        participants: updatedParticipants,
        timestamps: updatedTimestamps,
      })

      await Service.addData("participants", [
        {
          ...participantData,
          id: participantId,
        },
      ])
      await Service.updateCount("studies", study.id, "participant_count")
      setNewParticipantId(participantId)
      setConfirmationOpen(true)
      onParticipantAdded?.({
        ...participantData,
        id: participantId,
      })

      enqueueSnackbar("Participant added successfully", { variant: "success" })
    } catch (error) {
      console.error("Error adding participant:", error)
      enqueueSnackbar("Failed to add participant", { variant: "error" })
    }
  }

  return (
    <>
      <Backdrop
        className={sliderclasses.backdrop}
        style={{
          backgroundColor: "transparent",
        }}
        open={open}
        onClick={() => onclose()}
      >
        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
          <Box
            className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}
            onClick={(e) => e.stopPropagation()}
            // style={{
            //     top:"100px",
            // }}
          >
            {!confirmationOpen ? (
              <>
                <Box className={sliderclasses.icon}>
                  <UserIcon />
                </Box>
                <Typography variant="h6">ADD NEW PARTICIPANT</Typography>
                <Divider className={sliderclasses.divider} />

                <TextField
                  label="Researcher"
                  fullWidth
                  disabled
                  margin="normal"
                  value={title || researcherId}
                  className={sliderclasses.field}
                />

                <TextField
                  label="Select Study"
                  fullWidth
                  disabled
                  margin="normal"
                  value={study.name}
                  className={sliderclasses.field}
                />

                <TextField
                  label="Select Group"
                  fullWidth
                  margin="normal"
                  select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={sliderclasses.field}
                >
                  {(study.gname || []).map((groupName, index) => (
                    <MenuItem key={index} value={groupName}>
                      {groupName}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography variant="h6" className={sliderclasses.headings}>
                  PARTICIPANT DETAILS
                </Typography>
                <Divider className={sliderclasses.divider} />

                <TextField
                  label="First Name"
                  fullWidth
                  margin="normal"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={sliderclasses.field}
                  required
                />

                <TextField
                  label="Last Name"
                  fullWidth
                  margin="normal"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={sliderclasses.field}
                  required
                />

                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={sliderclasses.field}
                  type="email"
                />

                <TextField
                  label="Mobile Number"
                  fullWidth
                  margin="normal"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={sliderclasses.field}
                />

                <TextField
                  label="Notes"
                  fullWidth
                  margin="normal"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={sliderclasses.field}
                  multiline
                  rows={3}
                />

                <Button className={sliderclasses.button} onClick={handleAddParticipant} fullWidth>
                  Add Participant
                </Button>
              </>
            ) : (
              <>
                <Box className={sliderclasses.icon}>
                  <UserIcon />
                </Box>
                <Typography variant="h6">PARTICIPANT ADDED</Typography>
                <Divider />
                <Typography variant="body2" paragraph>
                  New participant -{" "}
                  <strong>
                    {firstName} {lastName}
                  </strong>{" "}
                  - has been successfully added to the study <strong>{study.name}</strong>, Group{" "}
                  <strong>{selectedGroup}</strong>.
                </Typography>
                <Typography variant="body2" paragraph>
                  Participant ID: <strong>{newParticipantId}</strong>
                </Typography>
                <Divider />
                <Button
                  className={sliderclasses.button}
                  onClick={() => {
                    setConfirmationOpen(false)
                    resetForm()
                    onclose()
                  }}
                  fullWidth
                >
                  Close
                </Button>
              </>
            )}
          </Box>
        </Slide>
      </Backdrop>
    </>
  )
}
