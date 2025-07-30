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
  Slide,
  Backdrop,
} from "@material-ui/core"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import AddUser from "./AddUser"
import StudyCreator from "./StudyCreator"
import PatientStudyCreator from "../ParticipantList/PatientStudyCreator"
import AddUserGroup from "../ParticipantList/AddUserGroup"
// import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import AddIcon from "@material-ui/icons/Add"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"
import { createPortal } from "react-dom"
import "../../Admin/admin.css"
import { openDB } from "idb"

export const slideStyles = makeStyles((theme: Theme) =>
  createStyles({
    slidePanel: {
      position: "fixed",
      display: "flex",
      flexDirection: "column",
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "#fff",
      boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      padding: theme.spacing(3),
      zIndex: 1300,
      width: "30%",
      color: "#000",
      height: "100vh",
      overflowY: "auto",
      overflowX: "hidden", // Prevent horizontal scrolling
      paddingRight: theme.spacing(2), // Add some right padding for scroll bar
      paddingBottom: theme.spacing(4), // Add bottom padding
      WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      scrollbarWidth: "thin", // Thin scrollbar for Firefox
      "&::-webkit-scrollbar": {
        width: "8px", // Scrollbar width for Chrome, Safari, and newer versions of Opera
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0,0,0,0.2)", // Light scrollbar thumb
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "rgba(0,0,0,0.1)", // Light scrollbar track
      },
    },
    TabSlidePanel: {
      top: "100px",
    },
    divider: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(1),
    },
    headings: {
      marginTop: theme.spacing(4),
    },
    submitbutton: {
      marginTop: theme.spacing(2),
      backgroundColor: "#E8F5E9",
      color: "#2E7D32",
      "&:hover": {
        backgroundColor: "#C8E6C9",
      },
      border: "1px solid #2E7D32",
      borderRadius: "4px",
      padding: theme.spacing(1, 3),
    },
    button: {
      marginTop: theme.spacing(2),
      backgroundColor: "#FDEDE8",
      color: "#EB8367",
      "&:hover": {
        backgroundColor: "#FCD2C2",
      },
      border: "1px solid #EB8367",
      borderRadius: "4px",
      padding: theme.spacing(1, 3),
    },
    icon: {
      backgroundColor: "#EB8367",
      borderRadius: "50%",
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "50px",
      height: "50px",
      "& svg": {
        fill: "#FFFFFF",
        width: "24px",
        height: "24px",
      },
    },
    field: {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    backdrop: {
      zIndex: 1299,
      color: "rgba(255, 255, 255, 0.1)",
    },
    endbuttonsbox: {
      position: "sticky",
      bottom: 0,
      backgroundColor: "white",
      zIndex: 1310,
      pt: 2,
      mt: 2,
      borderTop: "1px solid rgba(0,0,0,0.12)",
    },
    menuitem: {
      display: "inline-block",
      width: "100%",
      padding: "8px 30px",
      minWidth: "300px",
      "&:hover": { backgroundColor: "#ECF4FF" },
    },
    menuLinks: {
      display: "block",
      fontSize: "1rem",
      color: "rgba(0, 0, 0, 0.87)",
      padding: "8px 30px",
      textTransform: "capitalize",
      "&:hover": { backgroundColor: "#ECF4FF" },
      borderTop: "1px solid rgba(0,0,0,0.1)",
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-start",
      gap: theme.spacing(1),
    },
    researcherRow: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(2),
      borderBottom: "1px solid rgba(0,0,0,0.12)",
      marginBottom: theme.spacing(1),
      "&:last-child": {
        borderBottom: "none",
      },
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.02)",
      },
    },

    content: {
      flex: 1,
      overflowY: "auto",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      maxHeight: "calc(100vh - 400px)", // Adjust based on your header/footer height
      padding: theme.spacing(1),
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: "3px",
      },
    },

    checkboxLabel: {
      flex: "1 1 auto",
      marginRight: theme.spacing(2),
      "& .MuiFormControlLabel-label": {
        fontSize: "0.95rem",
        color: "rgba(0,0,0,0.87)",
      },
    },

    checkbox: {
      padding: theme.spacing(0.5),
      color: "#ccc",
      "&.Mui-checked": {
        color: "#EB8367",
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.2rem",
      },
    },

    select: {
      minWidth: 120,
      "& .MuiSelect-select": {
        padding: theme.spacing(1),
        fontSize: "0.9rem",
        backgroundColor: "transparent",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: "4px",
      },
      "& .MuiSelect-icon": {
        color: "rgba(0,0,0,0.54)",
      },
      "&:before, &:after": {
        display: "none",
      },
    },

    diffContainer: {
      padding: theme.spacing(2),
      backgroundColor: "rgba(0,0,0,0.02)",
      borderRadius: theme.spacing(1),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      maxHeight: "calc(100vh - 300px)",
      overflowY: "auto",
    },
    diffRow: {
      padding: theme.spacing(1.5),
      backgroundColor: "#e6ffed",
      borderRadius: theme.spacing(0.5),
      marginBottom: theme.spacing(1),
      fontFamily: "monospace",
      fontSize: "0.9rem",
      "& span": {
        color: "#22863a",
      },
      border: "1px solid rgba(46, 160, 67, 0.2)",
    },

    // addButton: {
    //   marginTop: theme.spacing(2),
    //   backgroundColor: "#FDEDE8",
    //   color: "#EB8367",
    //   "&:hover": {
    //     backgroundColor: "#FCD2C2",
    //   },
    //   border: "1px solid #EB8367",
    //   borderRadius: "4px",
    //   padding: theme.spacing(1, 3),
    // },
  })
)
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
  const sliderclasses = slideStyles()
  const [open, setOpen] = useState(false)
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
    <div className="add-icon-container">
      <Fab
        className="add-fab-btn"
        onClick={(event) => setOpen(true)}
        style={{ backgroundColor: "#008607", color: "white" }}
      >
        <AddIcon className="add-icon" />
      </Fab>
      {open &&
        createPortal(
          <>
            <Backdrop open={open} className={sliderclasses.backdrop} onClick={() => setOpen(false)}>
              <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <Box className={sliderclasses.slidePanel} onClick={(e) => e.stopPropagation()}>
                  <Box className={sliderclasses.icon}>
                    <UserIcon />
                  </Box>
                  <Typography variant="h6">ADD NEW PARTICIPANTS</Typography>
                  <Divider className={sliderclasses.divider} />
                  <Typography variant="body2" paragraph>
                    Participants are <strong>researcher</strong> & <strong>study</strong> specific. Admins should add
                    participants only in special circumstances, if researchers are unable to do so due to technical
                    reasons. (Account locked, Password lost etc.)
                  </Typography>
                  <Divider className={sliderclasses.divider} />
                  <Button
                    className={sliderclasses.button}
                    onClick={() => {
                      setOpen(false)
                      setAddUser(true)
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Slide>
            </Backdrop>
            <Popover
              classes={{ root: classes.customPopover, paper: classes.customPaper }}
              open={!!popover ? true : false}
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
              </React.Fragment>
            </Popover>
          </>,
          document.body
        )}
      <AddUser
        researcherId={researcherId}
        studies={studies}
        open={addUser}
        onClose={() => setAddUser(false)}
        handleNewStudy={handleNewStudyData}
        participants={props.participants}
        setParticipants={setParticipants}
        closePopUp={handleClosePopUp}
        title={props.title}
        resemail={props.resemail}
      />
    </div>
  )
}
