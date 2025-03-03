import React, { useState, useEffect } from "react"
import {
  Box,
  MenuItem,
  AppBar,
  Toolbar,
  Icon,
  IconButton,
  Divider,
  Grid,
  Fab,
  Typography,
  Popover,
  makeStyles,
  Theme,
  createStyles,
  Button,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import AddUser from "./AddUser"
import StudyCreator from "./StudyCreator"
import PatientStudyCreator from "../ParticipantList/PatientStudyCreator"
import AddUserGroup from "../ParticipantList/AddUserGroup"
import { Add as AddIcon, FilterList as FilterListIcon, Search as SearchIcon } from "@material-ui/icons"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      backgroundColor: "#4285f4",
      color: "#fff",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "#3367d6",
      },
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
    btnBlue: {
      background: "#7599FF",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#fff",
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#5680f9" },
      [theme.breakpoints.up("md")]: {
        position: "absolute",
      },
      [theme.breakpoints.down("sm")]: {
        minWidth: "auto",
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
    customPopover: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
    customPaper: {
      maxWidth: 450,
      maxHeight: 600,
      marginTop: 75,
      marginLeft: 100,
      borderRadius: 10,
      padding: "10px 0",
      "& h6": { fontSize: 16 },
      "& li": {
        display: "inline-block",
        width: "100%",
        padding: "8px 30px",
        "&:hover": { backgroundColor: "#ECF4FF" },
      },
      "& *": { cursor: "pointer" },
    },
    popexpand: {
      backgroundColor: "#fff",
      color: "#618EF7",
      zIndex: 11111,
      "& path": { fill: "#618EF7" },
      "&:hover": { backgroundColor: "#f3f3f3" },
    },
    addText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
  })
)

export default function AddButton({ researcherId, studies, setParticipants, setData, mode, ...props }) {
  const [addUser, setAddUser] = useState(false)
  const [addGroupUser, setAddGroupUser] = useState(false)
  const { t } = useTranslation()
  const classes = useStyles()
  const [popover, setPopover] = useState(null)
  const [addParticipantStudy, setAddParticipantStudy] = useState(false)
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const handleNewStudyData = (data) => {
    setData()
  }

  const handleClosePopUp = (data) => {
    if (data === 1) {
      setAddParticipantStudy(false)
    } else if (data === 2) {
      setAddUser(false)
    } else {
      setAddGroupUser(false)
    }
  }

  return (
    <Box>
      {/* <Fab
        variant="extended"
        color="primary"
        classes={{ root: classes.btnBlue + " " + (!!popover ? classes.popexpand : "") }}
        onClick={(event) => setPopover(event.currentTarget)}
      >
        <Icon>add</Icon> <span className={classes.addText}>{`${t("Add")}`}</span>
      </Fab> */}

      {/* <Button
        variant="contained"
        className={classes.addButton}
        startIcon={<AddIcon />}
        onClick={(event) => setPopover(event.currentTarget)}
      >
        {t("Add")}
      </Button> */}
      <Button
        variant="contained"
        className={`${classes.addButton} ${!supportsSidebar ? classes.addButtonCompact : ""}`}
        onClick={(event) => setPopover(event.currentTarget)}
      >
        {supportsSidebar ? t("+ Add") : "+"}
      </Button>
      <Popover
        classes={{ root: classes.customPopover, paper: classes.customPaper }}
        open={!!popover ? true : false}
        //anchorPosition={!!popover && popover.getBoundingClientRect()}
        anchorPosition={popover ? popover.getBoundingClientRect() : null}
        anchorReference="anchorPosition"
        onClose={() => setPopover(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <React.Fragment>
          {mode === "researcher" && (
            <MenuItem
              onClick={() => {
                setPopover(null)
                setAddUser(true)
              }}
            >
              <Typography variant="h6">{`${t("Add a user")}`}</Typography>
              <Typography variant="body2">{`${t("Create a new entry in this group.")}`}</Typography>
            </MenuItem>
          )}
          {/* {mode === "researcher" && (
            <MenuItem
              onClick={() => {
                setPopover(null)
                setAddGroupUser(true)
              }}
            >
              <Typography variant="h6">{`${t("Add a new group")}`}</Typography>
              <Typography variant="body2">{`${t("Create a new group")}.`}</Typography>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setPopover(null)
              setAddGroupUser(false)
              setAddParticipantStudy(true)
            }}
          >
            <Typography variant="h6">{`${t("Add a new user and group")}`}</Typography>
            <Typography variant="body2">{`${t("Create a user under their own group.")}`}</Typography>
          </MenuItem> */}
        </React.Fragment>
      </Popover>
      {/* <AddUserGroup
        studies={studies}
        researcherId={researcherId}
        setParticipants={setParticipants}
        open={addGroupUser}
        onClose={() => setAddGroupUser(false)}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
      /> */}
      <AddUser
        researcherId={researcherId}
        studies={studies}
        open={addUser}
        onClose={() => setAddUser(false)}
        handleNewStudy={handleNewStudyData}
        setParticipants={setParticipants}
        closePopUp={handleClosePopUp}
      />
      {/* <PatientStudyCreator
        studies={studies}
        researcherId={researcherId}
        onClose={() => setAddParticipantStudy(false)}
        open={addParticipantStudy}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
      /> */}
    </Box>
  )
}
