import React, { useState, useEffect } from "react"
import {
  Box,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Icon,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  makeStyles,
  Theme,
  createStyles,
  Slide,
  Divider,
  Backdrop,
} from "@material-ui/core"

import { useSnackbar } from "notistack"
import LAMP, { Participant } from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import NewPatientDetail from "./NewPatientDetail"
import { slideStyles } from "./AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: 21,
          height: 19,
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    activityContent: {
      padding: "25px 25px 0",
    },
    errorMsg: { color: "#FF0000", fontSize: 12 },
    addNewDialog: {
      maxWidth: 350,
      [theme.breakpoints.up("sm")]: {
        maxWidth: "auto",
        minWidth: 400,
      },
    },
  })
)

export default function AddUser({
  researcherId,
  studies,
  participants,
  setParticipants,
  handleNewStudy,
  closePopUp,
  open,
  resemail,
  ...props
}: {
  researcherId: any
  studies: any
  participants: any
  setParticipants?: Function
  handleNewStudy: Function
  closePopUp: Function
  open: any
  resemail: any
} & DialogProps) {
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const [selectedStudy, setSelectedStudy] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [showErrorMsg, setShowErrorMsg] = useState(true)
  const [studyBtnClicked, setStudyBtnClicked] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [newId, setNewId] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [notes, setNotes] = useState("")
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false)
  const validate = (element) => {
    return !(typeof element === "undefined" || (typeof element !== "undefined" && element?.trim() === ""))
  }
  const handleChangeStudy = (event) => {
    setShowErrorMsg(false)
    setSelectedStudy(event.target.value)
    setSelectedGroup("")
  }
  const handleChangeGroup = (event) => {
    setSelectedGroup(event.target.value)
  }

  const resetForm = () => {
    setSelectedStudy("")
    setSelectedGroup("")
    setFirstName("")
    setLastName("")
    setEmail("")
    setMobile("")
    setNotes("")
  }

  let createStudy = async () => {
    if (selectedStudy === "") {
      setShowErrorMsg(true)
      return false
    } else {
      setIsCreatingParticipant(true)
      setStudyBtnClicked(true)
      let newCount = 1
      let ids = []
      for (let i = 0; i < newCount; i++) {
        let idData = ((await LAMP.Participant.create(selectedStudy, { study_code: "001", email: email } as any)) as any)
          .data
        let id = typeof idData === "object" ? idData.id : idData
        let newParticipant: any = {}
        if (typeof idData === "object") {
          newParticipant = idData
        } else {
          newParticipant["id"] = idData
        }

        const duplicates = participants.filter((x) => `${x.emailAddress}` === email)

        if (duplicates.length > 0) {
          enqueueSnackbar(t("Participant with same email id already exists."), { variant: "error" })
          resetForm()
          return
        }

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

        // if (!!((await LAMP.Credential.create(id, `${id}@lamp.com`, id, "Temporary Login")) as any).error) {
        //   enqueueSnackbar(`${t("Could not create credential for id.", { id: id })}`, { variant: "error" })
        // }

        if (response.error) {
          enqueueSnackbar(`${t("Could not create credential for id.", { id: id })}`, { variant: "error" })
        } else {
          newParticipant.study_id = selectedStudy
          newParticipant.study_name = studies.filter((study) => study.id === selectedStudy)[0]?.name
          newParticipant.group_name = selectedGroup
          newParticipant.firstName = firstName
          newParticipant.lastName = lastName
          newParticipant.email = email
          newParticipant.mobile = mobile
          newParticipant.researcherNote = notes
          Service.addData("participants", [newParticipant])
          Service.updateCount("studies", selectedStudy, "participant_count")
          Service.getData("studies", selectedStudy).then((studiesObject) => {
            handleNewStudy(studiesObject)
          })
          console.log("LAMP.Participant.allByStudy", await LAMP.Participant.allByStudy(selectedStudy))
          setNewId(newParticipant.id)
          // const updParticipant : Participant = {
          //   ...newParticipant,
          //   group_name: selectedGroup,
          // }
          console.log("here", newParticipant, idData)
          Service.getDataByKey("participants", [newParticipant.id], "id").then((data) => {
            console.log("updated participants", data)
          })
          await LAMP.Type.setAttachment(id, "me", "lamp.group_name", selectedGroup)
          await LAMP.Participant.update(newParticipant.id, newParticipant).then((res) =>
            console.log("updaqted partiicpant", res)
          )
          const currentStudy = studies.find((study) => study.id === selectedStudy)
          const timestamps = currentStudy.timestamps || {}
          const updatedTimestamps = {
            ...timestamps,
            lastEnrollmentAt: new Date(),
            firstEnrollmentAt: timestamps.firstEnrollmentAt || new Date(), // Set only if not already set
          }

          const studyParticipants = currentStudy?.participants
          const participantCreated = await LAMP.Participant.view(newParticipant.id)
          const updatedParticipants = [...studyParticipants, participantCreated]

          const updatedStudy = {
            ...currentStudy,
            participants: updatedParticipants,
            timestamps: updatedTimestamps,
          }

          // WHAT IS THE BELOW LOGIC and its not present in the AddParticipantToStudy

          const fieldsToUpdate = ["timestamps"]
          LAMP.Study.update(selectedStudy, updatedStudy).then((res) => {
            Service.update(
              "studies",
              {
                studies: [
                  {
                    id: selectedStudy,
                    ...updatedStudy,
                  },
                ],
              },
              "name",
              "id"
            )
            Service.updateMultipleKeys(
              "studies",
              {
                studies: [
                  {
                    id: selectedStudy,
                    ...updatedStudy,
                  },
                ],
              },
              fieldsToUpdate,
              "id"
            )
          })
          await Service.updateMultipleKeys(
            "studies",
            {
              studies: [
                {
                  id: selectedStudy,
                  timestamps: updatedTimestamps,
                },
              ],
            },
            ["timestamps"],
            "id"
          )
        }
        // const _owner = await LAMP.Type.parent(id)
        // await LAMP.Researcher.update(_owner.data.Researcher, {"timestamps.lastActivityAt": new Date()} as any).then(()=>console.log("successfully updated for participant", id))
        ids = [...ids, id]
      }
      setParticipants()
    }
    setSelectedStudy("")
    closePopUp(2)
    setIsCreatingParticipant(false)
    // props.onClose as any
  }

  const createNewStudy = () => {
    let lampAuthId = LAMP.Auth._auth.id
    if (
      LAMP.Auth._type === "researcher" &&
      (lampAuthId === "researcher@demo.lamp.digital" || lampAuthId === "clinician@demo.lamp.digital")
    ) {
      createDemoStudy()
    } else {
      createStudy()
    }
  }

  const createDemoStudy = () => {
    if (selectedStudy === "") {
      setShowErrorMsg(true)
      return false
    } else {
      let studyName = studies.filter((study) => study.id === selectedStudy)[0]?.name
      setStudyBtnClicked(true)
      let newParticipant: any = {}
      newParticipant.id = "U" + crypto.getRandomValues(new Uint32Array(1))[0].toString().substring(0, 8)
      newParticipant.study_id = selectedStudy
      newParticipant.study_name = studyName
      Service.addData("participants", [newParticipant])
      Service.updateCount("studies", selectedStudy, "participant_count")
      Service.getData("studies", selectedStudy).then((studiesObject) => {
        handleNewStudy(studiesObject)
      })
      setNewId(newParticipant.id)
      closePopUp(2)
      setSelectedStudy("")
      setParticipants()
    }
    setSelectedStudy("")
    closePopUp(2)
    // props.onClose as any
  }

  const handleEnter = () => {
    setSelectedStudy("")
    setSelectedGroup("")
    setShowErrorMsg(true)
  }

  const handleAddParticipant = async () => {
    createNewStudy()
    enqueueSnackbar("Participant added successfully!", { variant: "success" })
    setConfirmationOpen(true)
  }

  return (
    <React.Fragment>
      <Backdrop
        className={sliderclasses.backdrop}
        open={open}
        onClick={
          !isCreatingParticipant
            ? () => {
                resetForm()
                ;(props.onClose as any)()
              }
            : undefined
        }
      />
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Box className={sliderclasses.slidePanel}>
          <Box className={sliderclasses.icon}>
            <UserIcon />
          </Box>
          <Typography variant="h6" className={sliderclasses.headings}>
            ADD NEW PARTICIPANTS
          </Typography>
          <Divider className={sliderclasses.divider} />
          <TextField
            label="Researcher :"
            fullWidth
            disabled
            margin="normal"
            value={props.title || researcherId}
            onChange={(e) => {}}
            className={sliderclasses.field}
          />
          <TextField
            label="Select Study"
            fullWidth
            margin="normal"
            select
            value={selectedStudy}
            onChange={(e) => setSelectedStudy(e.target.value)}
            className={sliderclasses.field}
          >
            {studies.map((study) => (
              <MenuItem key={study.id} value={study.id}>
                {study.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Select Group"
            fullWidth
            margin="normal"
            select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className={sliderclasses.field}
          >
            {((selectedStudy && studies.find((study) => study.id === selectedStudy)?.gname) || []).map(
              (groupName, index) => (
                <MenuItem key={index} value={groupName}>
                  {groupName}
                </MenuItem>
              )
            )}
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
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={sliderclasses.field}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={sliderclasses.field}
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
          />
          <Button className={sliderclasses.button} onClick={handleAddParticipant}>
            Add
          </Button>
        </Box>
      </Slide>
      <Slide direction="left" in={confirmationOpen} mountOnEnter unmountOnExit>
        <Box className={sliderclasses.slidePanel}>
          <Box className={sliderclasses.icon}>
            <UserIcon />
          </Box>
          <Typography variant="h6">ADD NEW PARTICIPANTS</Typography>
          <Divider />
          <Typography variant="body2" paragraph>
            New participant -{" "}
            <strong>
              {firstName} {lastName}
            </strong>{" "}
            - has been successfully added to the study{" "}
            <strong>
              {selectedStudy}, Group {selectedGroup}
            </strong>
            . An account creation link has been successfully sent to the email - <a href={`mailto:${email}`}>{email}</a>
            .
          </Typography>
          <Typography variant="body2" paragraph>
            A copy has also been successfully sent to the researcher{" "}
            <strong>{props.title || "Unknown Researcher"}</strong> at <a href={`mailto:${resemail}`}>{resemail}</a>.
          </Typography>
          <Divider />
          <Button
            className={sliderclasses.button}
            onClick={
              !isCreatingParticipant
                ? () => {
                    setConfirmationOpen(false)
                    resetForm()
                    props.onClose
                  }
                : undefined
            }
            disabled={isCreatingParticipant}
          >
            Exit
          </Button>
        </Box>
      </Slide>
      {/* {!!newId && <NewPatientDetail id={newId} />} */}
    </React.Fragment>
  )
}
