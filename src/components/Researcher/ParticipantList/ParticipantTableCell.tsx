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
} from "@material-ui/core"
import NotificationSettings from "./NotificationSettings"
import Credentials from "../../Credentials"
import ParticipantName from "./ParticipantName"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbardashboard: {
      minHeight: 100,
      padding: "0 10px",
      "& h5": {
        color: "rgba(0, 0, 0, 0.75)",
        textAlign: "left",
        fontWeight: "600",
        fontSize: 30,
        width: "calc(100% - 96px)",
      },
    },
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
    participantHeader: { padding: "12px 5px 0", wordBreak: "break-all" },
    moreBtn: {},
    participantSub: { padding: "0 5px", "&:last-child": { paddingBottom: 10 } },
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
  })
)

export default function ParticipantTableCell({
  participant,
  visibleColumns,
  onParticipantSelect,
  handleSelectionChange,
  selectedParticipants,
  researcherId,
  ...props
}) {
  const propsclasses = props.useStyles()
  const classes = useStyles()
  const [checked, setChecked] = useState(selectedParticipants.filter((d) => d.id === participant.id).length > 0)
  const [openSettings, setOpenSettings] = useState(false)
  useEffect(() => {}, [])

  const handleChange = (participant, event) => {
    setChecked(event.target.checked)
    handleSelectionChange(participant, event.target.checked)
  }

  return (
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          checked={checked}
          onChange={(event) => handleChange(participant, event)}
          className={classes.checkboxActive}
        />
      </TableCell>

      {visibleColumns.map((column) => (
        <TableCell key={column.id}>
          {column.id === "name" ? (
            <ParticipantName
              participant={participant}
              updateParticipant={props.updateParticipant}
              openSettings={openSettings}
            />
          ) : (
            column.value(participant)
          )}
        </TableCell>
      ))}

      <TableCell
        align="right"
        // className={classes.actionCell}
      >
        <Box display="flex" style={{ gap: 1 }} justifyContent="flex-end">
          {props.notificationColumn && <NotificationSettings participant={participant} />}
          <Credentials user={participant} />
          <IconButton
            className={classes.settingslink}
            component={Link}
            href={`/#/researcher/${researcherId}/participant/${participant.id}/settings`}
          >
            <Icon>settings</Icon>
          </IconButton>
          {/* <Link
              href={`/#/researcher/${researcherId}/participant/${participant?.id}/settings`}
              underline="none"
              className={classes.settingslink}
            >
              <Icon>settings</Icon>
            </Link> */}
          <IconButton className={classes.btnWhite} onClick={() => onParticipantSelect(participant.id)}>
            <Icon>arrow_forward</Icon>
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  )
}
