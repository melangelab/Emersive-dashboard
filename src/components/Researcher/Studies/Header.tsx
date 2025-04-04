import React, { useRef, useState } from "react"
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
  Checkbox,
  ListItemText,
  Backdrop,
  Slide,
  Divider,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import PatientStudyCreator from "../ParticipantList/PatientStudyCreator"
import SearchBox from "../../SearchBox"
import StudyCreator from "../ParticipantList/StudyCreator"
import StudyGroupCreator from "./StudyGroupCreator"
import { CredentialManager } from "../../CredentialManager"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { ReactComponent as Logo } from "../../../icons/Logo.svg"
import { useLayoutStyles } from "../../GlobalStyles"
import { ReactComponent as RefreshIcon } from "../../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import { ReactComponent as GridViewIcon } from "../../../icons/NewIcons/objects-column.svg"
import { ReactComponent as TableViewIcon } from "../../../icons/NewIcons/table-list.svg"
import { ReactComponent as GridViewFilledIcon } from "../../../icons/NewIcons/objects-column-filled.svg"
import { ReactComponent as TableViewFilledIcon } from "../../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as ColumnsIcon } from "../../../icons/NewIcons/columns-3.svg"
import { ReactComponent as FilterIcon } from "../../../icons/NewIcons/filters.svg"
import { ReactComponent as FilterFilledIcon } from "../../../icons/NewIcons/filters-filled.svg"
import { ReactComponent as PrintIcon } from "../../../icons/NewIcons/print.svg"
import { ReactComponent as DownloadIcon } from "../../../icons/NewIcons/progress-download.svg"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"

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
    addbutton: {
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
    logo: {
      width: theme.spacing(5), // Scales dynamically (5 * 8px = 40px)
      height: theme.spacing(5),
      borderRadius: "50%",
      marginLeft: "4px",
    },
    actionIcon: {
      width: 40,
      height: 40,
      minWidth: 40,
      cursor: "pointer",
      transition: "all 0.3s ease",
      padding: theme.spacing(0.5),
      borderRadius: "25%",
      "& path": {
        fill: "rgba(0, 0, 0, 0.4)",
      },
      "&.active path": {
        fill: "#06B0F0",
      },
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        "& path": {
          fill: "#06B0F0",
        },
      },
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
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
  const sliderclasses = slideStyles()
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
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement | SVGElement>(null)
  const handleNewStudyData = (data) => {
    setParticipants()
    newStudyObj(data)
    updatedDataStudy(data)
  }
  const roles = ["Administrator", "User Administrator", "Practice Lead"]
  const [slideOpen, setSlideOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<"none" | "study" | "group" | "participant">("none")
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  // const handleClosePopUp = (data) => {
  //   if (data === 1) {
  //     setAddParticipantStudy(false)
  //   } else if (data === 2) {
  //     setAddStudy(false)
  //   } else {
  //     setAddGroup(false)
  //   }
  // }
  const handleClosePopUp = (data) => {
    if (activeModal === "none") {
      setSlideOpen(false)
    }
    if (data === 1) {
      setAddParticipantStudy(false)
      setActiveModal("none")
    } else if (data === 2) {
      setAddStudy(false)
      setActiveModal("none")
    } else {
      setAddGroup(false)
      setActiveModal("none")
    }
  }

  const handleSlideOpen = (type: "study" | "group" | "participant") => {
    setSlideOpen(true)
    setActiveModal(type)

    switch (type) {
      case "study":
        setAddStudy(true)
        break
      case "group":
        setAddGroup(true)
        break
      case "participant":
        setAddParticipantStudy(true)
        break
    }
    console.log("handleSlideOpen - clicked with", type)
  }
  const handleBackdropClick = () => {
    if (activeModal === "none") {
      setSlideOpen(false)
    }
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={layoutClasses.header}>
        <Box className={headerclasses.header}>
          <Box className={headerclasses.titleSection}>
            {supportsSidebar ? (
              <Box className={headerclasses.logo}>
                <Logo className={classes.logo} />
              </Box>
            ) : null}
            {props.authType === "admin" && (
              <IconButton
                size="medium"
                className={headerclasses.backButton}
                onClick={() => {
                  window.location.href = `/`
                }}
              >
                <Icon>arrow_back</Icon>
              </IconButton>
            )}
            <Typography variant="h5">{`${t("Studies")}`}</Typography>
          </Box>
          <Box className={headerclasses.actionGroup}>
            <SearchBox searchData={searchData} />
            <RefreshIcon className={classes.actionIcon} onClick={() => window.location.reload()} />
            {props.viewMode === "grid" ? (
              <GridViewFilledIcon
                className={`${classes.actionIcon} ${props.viewMode === "grid" ? "active" : ""}`}
                onClick={() => props.onViewModechanged("grid")}
              />
            ) : (
              <GridViewIcon
                className={`${classes.actionIcon} active`}
                onClick={() => props.onViewModechanged("grid")}
              />
            )}
            {props.viewMode === "table" ? (
              <TableViewFilledIcon
                className={`${classes.actionIcon} ${props.viewMode === "table" ? "active" : ""}`}
                onClick={() => props.onViewModechanged("table")}
              />
            ) : (
              <TableViewIcon
                className={`${classes.actionIcon} active`}
                onClick={() => props.onViewModechanged("table")}
              />
            )}
            <AddIcon
              className={classes.addButton}
              onClick={(event) =>
                // setPopover(event.currentTarget)
                setSlideOpen(true)
              }
            />
            {props.viewMode === "table" && (
              <>
                <ColumnsIcon
                  className={classes.actionIcon}
                  onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
                />
                <FilterIcon
                  className={classes.actionIcon}
                  // onClick={(event) => setPopover(event.currentTarget)}
                />
                <PrintIcon
                  className={classes.actionIcon}
                  // onClick={(event) => setPopover(event.currentTarget)}
                />
                <DownloadIcon
                  className={classes.actionIcon}
                  // onClick={(event) => setPopover(event.currentTarget)}
                />
              </>
            )}
            <Box
              className={headerclasses.profileSection}
              onClick={(event) => setShowCustomizeMenu(event.currentTarget)}
            >
              <Avatar className={headerclasses.avatar}>{props.title?.charAt(0) || "U"}</Avatar>
              {supportsSidebar ? <Profile title={props.title} authType={props.authType} /> : null}
            </Box>
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
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        keepMounted
        elevation={3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        getContentAnchorEl={null}
        PaperProps={{
          style: {
            maxHeight: "300px",
            width: "250px",
            marginTop: "8px",
          },
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            borderBottom: "1px solid rgb(229, 231, 235)",
            padding: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            zIndex: 50,
          }}
        >
          <Button
            size="small"
            onClick={() => {
              props.setVisibleColumns?.(props.VisibleColumns?.map((col) => ({ ...col, visible: true })))
            }}
            color="primary"
            style={{ textTransform: "none", fontSize: "0.875rem" }}
          >
            {t("Select All")}
          </Button>
          <Button
            size="small"
            onClick={() => {
              props.setVisibleColumns?.(
                props.VisibleColumns?.map((col, index) => ({
                  ...col,
                  visible: index === 0,
                }))
              )
            }}
            color="primary"
            style={{ textTransform: "none", fontSize: "0.875rem" }}
          >
            {t("Deselect All")}
          </Button>
        </div>
        <div style={{ padding: "0.5rem", overflowY: "auto" }}>
          {props.VisibleColumns?.map((column) => (
            <MenuItem key={column.id}>
              <Checkbox
                checked={column.visible}
                onChange={() => {
                  props.setVisibleColumns?.(
                    props.VisibleColumns?.map((col) => (col.id === column.id ? { ...col, visible: !col.visible } : col))
                  )
                }}
              />
              <ListItemText primary={column.label} />
            </MenuItem>
          ))}
        </div>
      </Menu>
      <Backdrop className={sliderclasses.backdrop} open={slideOpen} onClick={handleBackdropClick} />
      <Slide direction="left" in={slideOpen} mountOnEnter unmountOnExit>
        <Box className={sliderclasses.slidePanel}>
          <Box className={sliderclasses.icon}>
            <UserIcon />
          </Box>
          <Typography variant="h6">ADD NEW STUDY</Typography>
          <Divider className={sliderclasses.divider} />
          <Typography variant="body2" paragraph>
            Studies are <strong>researcher</strong> specific.
          </Typography>
          <Divider className={sliderclasses.divider} />
          <Typography variant="body2" paragraph>
            Add a new Study under researcher <strong>{props.title}</strong>.
          </Typography>
          <Typography variant="body1" paragraph>
            If you have decided the Groups for the Study by now, proceed with this.
          </Typography>
          <Button className={sliderclasses.button} onClick={() => handleSlideOpen("participant")}>
            Add Study & Group
          </Button>
          <Typography variant="body1" paragraph className={sliderclasses.headings}>
            Or create a Study and add the Groups later.
          </Typography>
          <Button className={sliderclasses.button} onClick={() => handleSlideOpen("study")}>
            Add a Study
          </Button>
          <Divider className={sliderclasses.divider} />
          <Typography variant="body2" paragraph>
            Add a new Group under an existing Study.
          </Typography>
          <Button className={sliderclasses.button} onClick={() => handleSlideOpen("group")}>
            Add a group
          </Button>
        </Box>
      </Slide>
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
        onClose={() => {
          setAddGroup(false)
          handleClosePopUp(3)
        }}
        open={addGroup}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
      <StudyCreator
        studies={studies}
        researcherId={researcherId}
        open={addStudy}
        onclose={() => {
          setAddStudy(false)
          handleClosePopUp(2)
        }}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
      <PatientStudyCreator
        studies={studies}
        researcherId={researcherId}
        onclose={() => {
          setAddParticipantStudy(false)
          handleClosePopUp(1)
        }}
        open={addParticipantStudy}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
    </div>
  )
}
