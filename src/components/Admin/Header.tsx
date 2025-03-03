import React, { useState } from "react"
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Fab,
  Icon,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  colors,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import SearchBox from "../SearchBox"
import { useTranslation } from "react-i18next"
import AddUpdateResearcher from "./AddUpdateResearcher"
import FilterListIcon from "@material-ui/icons/FilterList"
import SearchIcon from "@material-ui/icons/Search"
import AddIcon from "@material-ui/icons/Add"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { CredentialManager } from "../CredentialManager"
import LAMP from "lamp-core"
import { useLayoutStyles } from "../GlobalStyles"
import LogoImage from "../../icons/logo.png"
import { createTheme } from "@material-ui/core/styles"

// const StyledAddIcon = styled(AddIcon)({
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   width: "20px",
//   height: "20px",
// });

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(2, 3),
      backgroundColor: "#fff",
      borderRadius: 20,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
      marginBottom: theme.spacing(3),
      gap: "30px",
    },
    titleSection: {
      display: "flex",
      alignItems: "center",
      "& h5": {
        fontSize: "24px",
        fontWeight: 500,
        marginLeft: theme.spacing(2),
      },
    },
    logoAdd: {
      display: "flex",
      flexDirection: "row",
      gap: "10px",
    },
    logo: {
      width: theme.spacing(5), // Scales dynamically (5 * 8px = 40px)
      height: theme.spacing(5),
      borderRadius: "50%",
      backgroundColor: "#f1f3f4",
      marginLeft: "4px",
      // marginRight: theme.spacing(3),
    },
    spacer: {
      flexGrow: 1,
    },
    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
      // marginLeft: "auto",
    },
    filterButton: {
      backgroundColor: "#f1f3f4",
      color: "#5f6368",
      // padding: "8px 24px",
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
    searchButton: {
      padding: 8,
      backgroundColor: "#fff",
      border: "1px solid #dadce0",
      borderRadius: 20,
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    profileSection: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      borderRadius: 20,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      // marginLeft: theme.spacing(2),
      padding: "4px 8px",
      "& .MuiAvatar-root": {
        width: 36,
        height: 36,
        marginRight: theme.spacing(1),
      },
      "& .MuiTypography-root": {
        "&.name": {
          fontWeight: 500,
          marginRight: theme.spacing(0.5),
        },
        "&.role": {
          color: theme.palette.text.secondary,
          fontSize: "0.875rem",
        },
      },
    },
    profileSectionCompact: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      padding: "4px 4px 4px 0px",
      borderRadius: 20,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
  })
)

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

export default function Header({
  researchers,
  searchData,
  refreshResearchers,
  adminType,
  authType,
  title,
  onLogout,
  ...props
}) {
  const classes = useStyles()
  const { t, i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const [passwordChange, setPasswordChange] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const handleLogoutClick = () => {
    handleClose() // Close menu
    setConfirmLogout(true) // Open confirm dialog
  }

  const layoutClasses = useLayoutStyles()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={layoutClasses.header}>
        <div className={classes.logoAdd}>
          <Box className={classes.logo} />
          <AddUpdateResearcher refreshResearchers={refreshResearchers} researchers={researchers} />
        </div>
        <Box className={classes.actionGroup}>
          <SearchBox searchData={searchData} />
          {/* <Button
            variant="contained"
            className={`${classes.filterButton} ${!supportsSidebar ? classes.filterButtonCompact : ""}`}
            startIcon={<FilterListIcon />}
          >
            {supportsSidebar ? "Filter" : null}
          </Button> */}
          <Box
            className={supportsSidebar ? classes.profileSection : classes.profileSectionCompact}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <Avatar>U</Avatar>
            {supportsSidebar ? <Profile title={title} authType={authType} /> : null}
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            {!supportsSidebar ? (
              <MenuItem>
                <Profile title={title} authType={authType} />
              </MenuItem>
            ) : null}
            {authType === "admin" && (
              <MenuItem onClick={() => setPasswordChange(true)}>{t("Manage Credentials")}</MenuItem>
            )}
            <MenuItem divider onClick={handleLogoutClick}>
              {t("Logout")}
            </MenuItem>
            <MenuItem dense onClick={() => window.open("https://docs.lamp.digital", "_blank")}>
              <b style={{ color: colors.grey[600] }}>{t("Help & Support")}</b>
            </MenuItem>
            <MenuItem dense onClick={() => window.open("https://community.lamp.digital", "_blank")}>
              <b style={{ color: colors.grey[600] }}>{t("LAMP Community")}</b>
            </MenuItem>
            <MenuItem dense onClick={() => window.open("mailto:team@digitalpsych.org", "_blank")}>
              <b style={{ color: colors.grey[600] }}>{t("Contact Us")}</b>
            </MenuItem>
          </Menu>
          <Dialog open={passwordChange} onClose={() => setPasswordChange(false)}>
            <DialogContent style={{ marginBottom: 12 }}>
              <CredentialManager id={LAMP.Auth._auth.id} type={title} />
            </DialogContent>
          </Dialog>
          <Dialog
            open={confirmLogout}
            onClose={() => setConfirmLogout(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {t("Are you sure you want to log out of LAMP right now?")}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t("If you've made some changes, make sure they're saved before you continue to log out.")}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmLogout(false)} color="secondary">
                {t("Go Back")}
              </Button>
              <Button
                onClick={() => {
                  onLogout()
                  setConfirmLogout(false)
                }}
                color="primary"
                autoFocus
              >
                {t("Logout")}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </div>
  )
}
