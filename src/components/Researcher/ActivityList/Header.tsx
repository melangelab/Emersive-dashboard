import React, { useState } from "react"
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Button,
  Avatar,
  FormControlLabel,
  Checkbox,
  Menu,
  MenuItem,
  colors,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Icon,
  IconButton,
  useMediaQuery,
  useTheme,
  ListItemText,
} from "@material-ui/core"
import AddActivity from "./AddActivity"
import StudyFilter from "../ParticipantList/StudyFilter"
import ExportActivity from "./ExportActivity"
import DeleteActivity from "./DeleteActivity"
import StudyFilterList from "../ParticipantList/StudyFilterList"
import SearchBox from "../../SearchBox"
import { useTranslation } from "react-i18next"
import { CredentialManager } from "../../CredentialManager"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { ReactComponent as Logo } from "../../../icons/Logo.svg"
import { useLayoutStyles } from "../../GlobalStyles"
import AddUpdateResearcher from "../../Admin/AddUpdateResearcher"
import LAMP from "lamp-core"
import { ReactComponent as RefreshIcon } from "../../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import { ReactComponent as GridViewIcon } from "../../../icons/NewIcons/objects-column.svg"
import { ReactComponent as TableViewIcon } from "../../../icons/NewIcons/table-list.svg"
import { ReactComponent as GridViewFilledIcon } from "../../../icons/NewIcons/objects-column-filled.svg"
import { ReactComponent as TableViewFilledIcon } from "../../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as ColumnsIcon } from "../../../icons/NewIcons/columns-3.svg"
import { ReactComponent as FilterIcon } from "../../../icons/NewIcons/filters.svg"
import { ReactComponent as PrintIcon } from "../../../icons/NewIcons/print.svg"
import { ReactComponent as DownloadIcon } from "../../../icons/NewIcons/progress-download.svg"
import Download from "../../Download"

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
    optionsMain: {
      background: "#ECF4FF",
      borderTop: "1px solid #C7C7C7",

      marginTop: 20,
      width: "99.4vw",
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50vw",
      marginRight: "-50vw",
    },
    optionsSub: { width: 1030, maxWidth: "80%", margin: "0 auto", padding: "10px 0" },
    showFeed: { marginTop: "10px" },
    logo: {
      width: theme.spacing(5), // Scales dynamically (5 * 8px = 40px)
      height: theme.spacing(5),
      borderRadius: "50%",
      marginLeft: "4px",
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
    profileSection: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      borderRadius: 20,
      padding: "4px 0px",
      display: "flex",
      alignItems: "center",
    },
    avatar: {
      width: 36,
      height: 36,
    },
  })
)

interface ResearcherData {
  id: string
  loggedIn: boolean
  [key: string]: any
}

export default function Header({
  researcherId,
  activities,
  studies,
  selectedActivities,
  searchData,
  setSelectedStudies,
  selectedStudies,
  setActivities,
  setOrder,
  order,
  ...props
}) {
  const classes = useStyles()
  const [showFilterStudies, setShowFilterStudies] = useState(false)
  const { t } = useTranslation()
  const handleShowFilterStudies = (data) => {
    setShowFilterStudies(data)
  }
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const headerclasses = useHeaderStyles()

  const layoutClasses = useLayoutStyles()

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement | SVGElement>(null)

  const updateResearcherLoggedIn = async () => {
    console.log("1.5result before update timing")
    let result = await LAMP.Researcher.update(researcherId, { loggedIn: false } as ResearcherData)
    console.log("2result afyer update timing", result)
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={headerclasses.header}>
        <Box className={headerclasses.titleSection}>
          {supportsSidebar ? (
            <Box className={headerclasses.logo}>
              <Logo className={classes.logo} />
            </Box>
          ) : null}
          {props.authType === "admin" && (
            <IconButton
              className={headerclasses.backButton}
              onClick={() => {
                window.location.href = `/`
              }}
            >
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          <Typography variant="h5">{`${t("Activities")}`}</Typography>
        </Box>
        {/* <Box> */}
        <Box className={headerclasses.actionGroup}>
          <SearchBox searchData={searchData} />
          <RefreshIcon className={classes.actionIcon} onClick={() => window.location.reload()} />
          {props.viewMode === "grid" ? (
            <GridViewFilledIcon
              className={`${classes.actionIcon} ${props.viewMode === "grid" ? "active" : ""}`}
              onClick={() => props.onViewModechanged("grid")}
            />
          ) : (
            <GridViewIcon className={`${classes.actionIcon} active`} onClick={() => props.onViewModechanged("grid")} />
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
          {/* <Button
            variant="outlined"
            className={headerclasses.togglebtn}
            startIcon={<Icon>{props.viewMode === "grid" ? "view_list" : "grid_view"}</Icon>}
            onClick={() => props.onViewModechanged(props.viewMode === "grid" ? "table" : "grid")}
          >
            {supportsSidebar ? (props.viewMode === "grid" ? "Table View" : "Grid View") : null}
          </Button> */}
          <AddActivity
            activities={activities}
            studies={studies}
            studyId={null}
            setActivities={setActivities}
            researcherId={researcherId}
            showCreateForm={props.showCreateForm}
            setShowCreateForm={props.setShowCreateForm}
            setSelectedSpec={props.setSelectedSpec}
          />
          {props.viewMode === "table" && (
            <>
              <ColumnsIcon
                className={classes.actionIcon}
                onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
              />
              <PrintIcon className={classes.actionIcon} />
              <Download studies={studies} target="activities" />
            </>
          )}
          <StudyFilter setShowFilterStudies={handleShowFilterStudies} setOrder={setOrder} order={order} />
          <Box className={headerclasses.profileSection} onClick={(event) => setShowCustomizeMenu(event.currentTarget)}>
            <Avatar className={headerclasses.avatar}>{props.title?.charAt(0) || "U"}</Avatar>
            {supportsSidebar ? <Profile title={props.title} authType={props.authType} /> : null}
          </Box>
        </Box>
      </Box>
      <Box>
        <StudyFilterList
          studies={studies}
          researcherId={researcherId}
          type="activities"
          showFilterStudies={showFilterStudies}
          selectedStudies={selectedStudies}
          setSelectedStudies={setSelectedStudies}
        />
      </Box>
      {(selectedActivities || []).length > 0 && (
        <Box className={classes.optionsMain}>
          <Box className={classes.optionsSub}>
            <ExportActivity activities={selectedActivities} />
            <DeleteActivity activities={selectedActivities} setActivities={setActivities} />
          </Box>
        </Box>
      )}
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
            onClick={async () => {
              await updateResearcherLoggedIn()
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
            <MenuItem
              key={column.id}
              onClick={() => {
                props.setVisibleColumns?.(
                  props.VisibleColumns?.map((col) => (col.id === column.id ? { ...col, visible: !col.visible } : col))
                )
              }}
            >
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
    </div>
  )
}
