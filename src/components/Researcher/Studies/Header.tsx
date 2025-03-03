import React, { useState } from "react"
import {
  Box,
  Button,
  Avatar,
  Popover,
  Fab,
  Typography,
  Icon,
  MenuItem,
  makeStyles,
  Theme,
  createStyles,
  DialogContent,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Menu,
  colors,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import PatientStudyCreator from "../ParticipantList/PatientStudyCreator"
import SearchBox from "../../SearchBox"
import StudyCreator from "../ParticipantList/StudyCreator"
import StudyGroupCreator from "./StudyGroupCreator"
import { Add as AddIcon, FilterList as FilterListIcon, Search as SearchIcon } from "@material-ui/icons"
import { CredentialManager } from "../../CredentialManager"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import LogoImage from "../../../icons/logo.png"
import { useLayoutStyles } from "../../GlobalStyles"

function Profile({ title, authType }) {
  return (
    <div>
      <Typography variant="body1" className="name">
        {title || "Name"}
      </Typography>
      <Typography variant="body2" className="role">
        {authType || "Role"}
      </Typography>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // header: {
    //   "& h5": {
    //     fontSize: "30px",
    //     fontWeight: "bold",
    //   },
    // },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(2, 3),
      backgroundColor: "#fff",
      borderRadius: 20,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
      marginTop: theme.spacing(2),
      width: "100%",
      minHeight: 75,
      "& h5": {
        fontSize: 25,
        fontWeight: 600,
        color: "rgba(0, 0, 0, 0.75)",
      },
    },
    titleSection: {
      display: "flex",
      alignItems: "center",
      "& h5": {
        marginLeft: theme.spacing(2),
      },
    },
    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },
    searchButton: {
      padding: 8,
      backgroundColor: "#fff",
      border: "1px solid #dadce0",
      borderRadius: 20,
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    filterButton: {
      backgroundColor: "#f1f3f4",
      color: "#5f6368",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#e8eaed",
      },
    },
    filterButtonCompact: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "60px", // Ensures enough space for the icon
      height: "40px", // Ensures proper button height
      padding: "8px", // Avoids excessive shrinking
      boxSizing: "border-box", // Ensures padding doesn’t affect width
    },
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
    profileSection: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      borderRadius: 20,
      padding: "4px 0px",
      display: "flex",
      alignItems: "center",
      // marginLeft: theme.spacing(2),
    },
    avatar: {
      width: 36,
      height: 36,
      // marginRight: theme.spacing(1),
    },
    profileInfo: {
      display: "flex",
      flexDirection: "column",
      "& .name": {
        color: theme.palette.text.primary,
        fontWeight: 500,
      },
      "& .role": {
        color: theme.palette.text.secondary,
        fontSize: "0.875rem",
      },
    },
    customPaper: {
      maxWidth: 380,
      maxHeight: 600,
      marginTop: 25,
      minWidth: 320,
      marginLeft: 15,
      borderRadius: 10,
      padding: "10px 0",
      "& h6": { fontSize: 16, fontWeight: 600 },
      "& li": {
        display: "inline-block",
        width: "100%",
        padding: "15px 30px",
        fontSize: 16,
        "&:hover": { backgroundColor: "#ECF4FF" },
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
    customPopover: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
    // customPaper: {
    //   maxWidth: 380,
    //   marginTop: 75,
    //   marginLeft: 100,
    //   borderRadius: 10,
    //   padding: "10px 0",
    //   "& h6": { fontSize: 16 },
    //   "& li": {
    //     display: "inline-block",
    //     width: "100%",
    //     padding: "15px 30px",
    //     "&:hover": { backgroundColor: "#ECF4FF" },
    //   },
    //   "& *": { cursor: "pointer" },
    // },
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
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      marginLeft: "8px",
      margin: theme.spacing(0, 1),
      // minWidth: 120,
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
  })
)

export default function Header({
  studies,
  researcherId,
  searchData,
  setParticipants,
  newStudyObj,
  updatedDataStudy,
  ...props
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [popover, setPopover] = useState(null)
  const [addParticipantStudy, setAddParticipantStudy] = useState(false)
  const [addGroup, setAddGroup] = useState(false)
  const [addStudy, setAddStudy] = useState(false)
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const headerclasses = useHeaderStyles()

  const layoutClasses = useLayoutStyles()

  const handleNewStudyData = (data) => {
    setParticipants()
    newStudyObj(data)
    updatedDataStudy(data)
  }
  const roles = ["Administrator", "User Administrator", "Practice Lead"]

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  // const handleClosePopUp = (data) => {
  //   if (data === 1) {
  //     setAddParticipantStudy(false)
  //   }
  // }
  const handleClosePopUp = (data) => {
    if (data === 1) {
      setAddParticipantStudy(false)
    } else if (data === 2) {
      setAddStudy(false)
    } else {
      setAddGroup(false)
    }
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={layoutClasses.header}>
        <Box className={headerclasses.titleSection}>
          {/* <Box className={headerclasses.logo}>
            <img src={LogoImage} alt="Logo" />
          </Box> */}
          {props.authType === "admin" && (
            <IconButton
              size="medium"
              className={headerclasses.backButton}
              onClick={() => {
                window.location.href = `/#/researcher`
              }}
            >
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          {/* <Typography variant="h5">{`${t("Studies")}`}</Typography> */}
          <Button
            variant="contained"
            className={`${classes.addButton} ${!supportsSidebar ? classes.addButtonCompact : ""}`}
            onClick={(event) => setPopover(event.currentTarget)}
          >
            {supportsSidebar ? t("+ Add") : "+"}
          </Button>
        </Box>
        <Box className={headerclasses.actionGroup}>
          <SearchBox searchData={searchData} />
          {/* <Button
            variant="contained"
            className={headerclasses.filterButton}
            startIcon={<FilterListIcon />}
          >
            {t("Filter")}
          </Button> */}
          <Button
            variant="outlined"
            className={headerclasses.togglebtn}
            startIcon={<Icon>{props.viewMode === "grid" ? "view_list" : "grid_view"}</Icon>}
            onClick={() => props.onViewModechanged(props.viewMode === "grid" ? "table" : "grid")}
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            {supportsSidebar ? (props.viewMode === "grid" ? "Table View" : "Grid View") : null}
          </Button>
          {/* <Button
            variant="contained"
            className={`${classes.filterButton} ${!supportsSidebar ? classes.filterButtonCompact : ""}`}
            startIcon={<FilterListIcon />}
          >
            {supportsSidebar ? "Filter" : null}
          </Button> */}
          <Box className={headerclasses.profileSection} onClick={(event) => setShowCustomizeMenu(event.currentTarget)}>
            <Avatar className={headerclasses.avatar}>{props.title?.charAt(0) || "U"}</Avatar>
            {supportsSidebar ? <Profile title={props.title} authType={props.authType} /> : null}
          </Box>
        </Box>
      </Box>
      {/* <Box>
          <Fab
            variant="extended"
            color="primary"
            classes={{ root: classes.btnBlue + " " + (!!popover ? classes.popexpand : "") }}
            onClick={(event) => setPopover(event.currentTarget)}
          >
            <Icon>add</Icon> <span className={classes.addText}>{`${t("Add")}`}</span>
          </Fab>
        </Box> */}
      <Popover
        classes={{ root: classes.customPopover, paper: classes.customPaper }}
        open={!!popover ? true : false}
        anchorPosition={!!popover && popover.getBoundingClientRect()}
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
        {/* <React.Fragment> */}
        <MenuItem
          onClick={() => {
            setPopover(null)
            setAddGroup(true)
          }}
        >
          <Typography variant="h6">{`${t("Add a group")}`}</Typography>
          <Typography variant="body2">{`${t("Create a new group in existing study.")}`}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPopover(null)
            setAddStudy(true)
          }}
        >
          <Typography variant="h6">{`${t("Add a new study")}`}</Typography>
          <Typography variant="body2">{`${t("Create a new study")}.`}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPopover(null)
            setAddParticipantStudy(true)
          }}
        >
          <Typography variant="h6">{`${t("Add a new group and study")}`}</Typography>
          <Typography variant="body2">{`${t("Create a new study and a group within it.")}`}</Typography>
        </MenuItem>
        {/* </React.Fragment> */}
      </Popover>
      <Menu
        id="profile-menu"
        anchorEl={showCustomizeMenu}
        open={Boolean(showCustomizeMenu)}
        onClose={() => setShowCustomizeMenu(null)}
        classes={{ paper: headerclasses.customPaper }}
      >
        {!supportsSidebar ? (
          <MenuItem>
            <Profile title={props.title} authType={props.authType} />
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => setPasswordChange(true)}>{t("Manage Credentials")}</MenuItem>
        <MenuItem divider onClick={() => setConfirmLogout(true)}>
          {t("Logout")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("https://docs.lamp.digital", "_blank")
          }}
        >
          {t("Help & Support")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("https://community.lamp.digital", "_blank")
          }}
        >
          {t("LAMP Community")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("mailto:team@digitalpsych.org", "_blank")
          }}
        >
          {t("Contact Us")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("https://docs.lamp.digital/privacy/", "_blank")
          }}
        >
          <b style={{ color: colors.grey[600] }}>{t("Privacy Policy")}</b>
        </MenuItem>
      </Menu>
      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <DialogTitle>{t("Are you sure you want to log out of LAMP right now?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("If you've made some changes, make sure they're saved before you continue to log out.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogout(false)} color="secondary">
            {t("Go Back")}
          </Button>
          <Button
            onClick={() => {
              props.onLogout()
              setConfirmLogout(false)
            }}
            color="primary"
            autoFocus
          >
            {t("Logout")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordChange} onClose={() => setPasswordChange(false)}>
        <DialogContent>
          <CredentialManager id={researcherId} />
        </DialogContent>
      </Dialog>
      <StudyGroupCreator
        studies={studies}
        researcherId={researcherId}
        onClose={() => setAddGroup(false)}
        open={addGroup}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
      />
      <StudyCreator
        studies={studies}
        researcherId={researcherId}
        open={addStudy}
        onClose={() => setAddStudy(false)}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
      />
      <PatientStudyCreator
        studies={studies}
        researcherId={researcherId}
        onClose={() => setAddParticipantStudy(false)}
        open={addParticipantStudy}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
      />
    </div>
  )
}
