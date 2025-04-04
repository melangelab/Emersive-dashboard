import React, { useState } from "react"
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Button,
  Avatar,
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
} from "@material-ui/core"
import StudyFilter from "../ParticipantList/StudyFilter"
import StudyFilterList from "../ParticipantList/StudyFilterList"
import SearchBox from "../../SearchBox"
import { useTranslation } from "react-i18next"
import { CredentialManager } from "../../CredentialManager"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { ReactComponent as Logo } from "../../../icons/Logo.svg"
import { useLayoutStyles } from "../../GlobalStyles"
import LAMP from "lamp-core"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      "& h5": {
        fontSize: "30px",
        fontWeight: "bold",
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
      // backgroundColor: "#f1f3f4",
      marginLeft: "4px",
      // marginRight: theme.spacing(3),
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
  studies,
  searchData,
  setSelectedStudies,
  selectedStudies,
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

  const updateResearcherLoggedIn = async () => {
    console.log("1.5result before update timing")
    let result = await LAMP.Researcher.update(researcherId, { loggedIn: false } as ResearcherData)
    console.log("2result afyer update timing", result)
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={layoutClasses.header}>
        <Box className={headerclasses.titleSection}>
          <Box className={headerclasses.logo}>
            <Logo className={classes.logo} />
          </Box>
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
          <Typography variant="h5">{`${t("Archive")}`}</Typography>
        </Box>
        <Box className={headerclasses.actionGroup}>
          <SearchBox searchData={searchData} />
          <StudyFilter setShowFilterStudies={handleShowFilterStudies} setOrder={setOrder} order={order} />
          <Box className={headerclasses.profileSection} onClick={(event) => setShowCustomizeMenu(event.currentTarget)}>
            <Avatar className={headerclasses.avatar}>{props.title?.charAt(0) || "U"}</Avatar>
            <Box className={headerclasses.profileInfo}>
              <Typography className="name">{props.title || "Name"}</Typography>
              <Typography className="role">{props.authType || "Role"}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box>
        <StudyFilterList
          studies={studies}
          researcherId={researcherId}
          type="archive"
          showFilterStudies={showFilterStudies}
          selectedStudies={selectedStudies}
          setSelectedStudies={setSelectedStudies}
        />
      </Box>
      <Menu
        id="profile-menu"
        anchorEl={showCustomizeMenu}
        open={Boolean(showCustomizeMenu)}
        onClose={() => setShowCustomizeMenu(null)}
        classes={{ paper: headerclasses.customPaper }}
      >
        <MenuItem disabled divider>
          <b>{props.title}</b>
        </MenuItem>
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
    </div>
  )
}
