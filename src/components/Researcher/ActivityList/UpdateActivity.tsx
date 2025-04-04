import React, { useState, useEffect } from "react"
import { Icon, Fab, makeStyles, Theme, createStyles, Link } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import ConfirmationDialog from "../../ConfirmationDialog"
import LAMP from "lamp-core"
import { studycardStyles, useModularTableStyles } from "../Studies/Index"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

export default function UpdateActivity({
  activity,
  activities,
  studies,
  setActivities,
  profile,
  researcherId,
  ...props
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [confirmationDialog, setConfirmationDialog] = useState(0)
  const [participantCount, setParticipantCount] = useState(0)
  const activitycardclasses = studycardStyles()
  const mtstyles = useModularTableStyles()
  useEffect(() => {
    console.log("inside update activity", activity)
  }, [])

  useEffect(() => {
    if (!!profile) {
      LAMP.Participant.allByStudy(activity.study_id).then((result) => {
        setParticipantCount(result.length)
      })
    }
  }, [])

  const confirmAction = (status: string) => {
    if (status === "Yes") {
      console.log("inside update activity", activity)
      window.location.href = `/#/researcher/${researcherId}/activity/${activity.id}`
    }
    setConfirmationDialog(0)
    props.setActiveButton?.({ id: null, action: null })
  }

  return (
    <span>
      {/* {!!profile ? (
        <Fab
          size="small"
          color="primary"
          classes={{ root: classes.btnWhite }}
          onClick={(event) => {
            participantCount > 1
              ? setConfirmationDialog(3)
              : (window.location.href = `/#/researcher/${researcherId}/activity/${activity.id}`)
          }}
        >
          <Icon>mode_edit</Icon>
        </Fab>
      ) : (
        <Link href={`/#/researcher/${researcherId}/activity/${activity.id}`} underline="none">
          <Icon>mode_edit</Icon>
        </Link>
      )} */}
      {props.activeButton?.id === activity.id && props.activeButton?.action === "edit" ? (
        <EditFilledIcon
          className={`${mtstyles.actionIcon} active`}
          onClick={(event) => {
            props.setActiveButton?.({ id: activity.id, action: "edit" })
            participantCount > 1
              ? setConfirmationDialog(3)
              : (window.location.href = `/#/researcher/${researcherId}/activity/${activity.id}`)
          }}
        />
      ) : (
        <EditIcon
          className={mtstyles.actionIcon}
          onClick={(event) => {
            props.setActiveButton?.({ id: activity.id, action: "edit" })
            participantCount > 1
              ? setConfirmationDialog(3)
              : (window.location.href = `/#/researcher/${researcherId}/activity/${activity.id}`)
          }}
        />
      )}

      <ConfirmationDialog
        confirmationDialog={confirmationDialog}
        open={confirmationDialog > 0 ? true : false}
        onClose={() => {
          setConfirmationDialog(0)
          props.setActiveButton?.({ id: null, action: null })
        }}
        confirmAction={confirmAction}
        confirmationMsg={
          !!profile && participantCount > 1
            ? t(
                "Changes done to this activity will reflect for all the participants under the group. Are you sure you want to proceed?"
              )
            : ""
        }
      />
    </span>
  )
}
