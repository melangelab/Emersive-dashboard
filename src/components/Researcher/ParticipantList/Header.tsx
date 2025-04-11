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
  IconButton,
  Icon,
  useMediaQuery,
  useTheme,
  ListItemText,
} from "@material-ui/core"
import StudyFilter from "../ParticipantList/StudyFilter"
import DeleteParticipant from "./DeleteParticipant"
import AddButton from "./AddButton"
import StudyFilterList from "../ParticipantList/StudyFilterList"
import { useTranslation } from "react-i18next"
import SearchBox from "../../SearchBox"
import ToggleFeed from "./ToggeFeed"
import { FilterList as FilterListIcon } from "@material-ui/icons"
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
import { ReactComponent as PrintIcon } from "../../../icons/NewIcons/print.svg"
import { ReactComponent as DownloadIcon } from "../../../icons/NewIcons/progress-download.svg"

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
      marginRight: theme.spacing(1),
    },
    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
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
    profileSection: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      borderRadius: 20,
      padding: "4px 8px",
      display: "flex",
      alignItems: "center",
      marginLeft: theme.spacing(2),
    },
    avatar: {
      width: 36,
      height: 36,
      marginRight: theme.spacing(1),
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
  })
)

export default function Header({
  studies,
  participants,
  researcherId,
  selectedParticipants,
  searchData,
  setSelectedStudies,
  selectedStudies,
  setParticipants,
  setData,
  mode,
  order,
  setOrder,
  ...props
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [showFilterStudies, setShowFilterStudies] = useState(false)
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const headerclasses = useHeaderStyles()

  const layoutClasses = useLayoutStyles()

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement | SVGElement>(null)

  const handleShowFilterStudies = (status) => {
    setShowFilterStudies(status)
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={layoutClasses.header}>
        {/* <Box display="flex" className={classes.header}>
        <Box flexGrow={1} pt={1}> */}
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
                  window.location.href = `/admin`
                }}
              >
                <Icon>arrow_back</Icon>
              </IconButton>
            )}
            <Typography variant="h5">{`${t("Participants")}`}</Typography>
          </Box>
          {/* <Box> */}
          {/* <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}> */}
          <Box className={headerclasses.actionGroup}>
            <SearchBox searchData={searchData} />
            <RefreshIcon className={classes.actionIcon} onClick={() => props.refresh?.() || window.location.reload()} />
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
            <AddButton
              researcherId={researcherId}
              studies={studies}
              participants={participants}
              setParticipants={setParticipants}
              setSelectedStudies={setSelectedStudies}
              setData={setData}
              mode={mode}
              title={props.title}
              resemail={props.resemail}
            />
            {props.viewMode === "table" && (
              <>
                <ColumnsIcon
                  className={classes.actionIcon}
                  onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
                />
                <PrintIcon className={classes.actionIcon} />
                <DownloadIcon className={classes.actionIcon} />
              </>
            )}
            <StudyFilter setShowFilterStudies={handleShowFilterStudies} setOrder={setOrder} order={order} />
            <Box
              className={headerclasses.profileSection}
              onClick={(event) => setShowCustomizeMenu(event.currentTarget)}
            >
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
        {/* {!!showFilterStudies && (
          <Box>
            <StudyFilterList
              studies={studies}
              researcherId={researcherId}
              type="participants"
              showFilterStudies={showFilterStudies}
              selectedStudies={selectedStudies}
              setSelectedStudies={setSelectedStudies}
            />
          </Box>
        )} */}
        {(selectedParticipants || []).length > 0 && (
          <Box className={classes.optionsMain}>
            <Box
              className={classes.optionsSub}
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <ToggleFeed participants={selectedParticipants} setParticipants={setParticipants} />
              <DeleteParticipant participants={selectedParticipants} setParticipants={setParticipants} />
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
                      props.VisibleColumns?.map((col) =>
                        col.id === column.id ? { ...col, visible: !col.visible } : col
                      )
                    )
                  }}
                />
                <ListItemText primary={column.label} />
              </MenuItem>
            ))}
          </div>
        </Menu>
      </Box>
    </div>
  )
}
