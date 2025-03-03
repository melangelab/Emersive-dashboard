import React, { useState } from "react"
import StudyFilter from "../ParticipantList/StudyFilter"
import AddSensor from "./AddSensor"
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
} from "@material-ui/core"
import DeleteSensor from "./DeleteSensor"
import StudyFilterList from "../ParticipantList/StudyFilterList"
import SearchBox from "../../SearchBox"
import { useTranslation } from "react-i18next"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { CredentialManager } from "../../CredentialManager"
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
  })
)

interface SensorSettings {
  frequency?: number
}

interface SettingsInfo {
  "lamp.analytics": SensorSettings
  "lamp.gps": SensorSettings
  "lamp.accelerometer": SensorSettings
  "lamp.accelerometer.motion": SensorSettings
  "lamp.accelerometer.device_motion": SensorSettings
  "lamp.device_state": SensorSettings
  "lamp.steps": SensorSettings
  "lamp.nearby_device": SensorSettings
  "lamp.telephony": SensorSettings
  "lamp.sleep": SensorSettings
  "lamp.ambient": SensorSettings
}

export default function Header({
  studies,
  researcherId,
  selectedSensors,
  searchData,
  setSelectedStudies,
  selectedStudies,
  setSensors,
  setChangeCount,
  setOrder,
  order,
  title,
  authType,
  onLogout,
  settingsInfo,
  ...props
}: {
  studies?: Array<Object>
  researcherId?: string
  selectedSensors?: Array<Object>
  searchData?: Function
  setSelectedStudies?: Function
  selectedStudies: Array<string>
  setSensors?: Function
  setChangeCount?: Function
  setOrder?: Function
  order?: boolean
  title?: string
  authType?: string
  onLogout?: Function
  settingsInfo?: SettingsInfo
}) {
  const classes = useStyles()
  const layoutClasses = useLayoutStyles()
  const [showFilterStudies, setShowFilterStudies] = useState(false)
  const { t } = useTranslation()
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const headerclasses = useHeaderStyles()

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const handleShowFilterStudies = (data) => {
    setShowFilterStudies(data)
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      {/* <Box display="flex" className={classes.header}>
        <Box flexGrow={1} pt={1}>
          <Typography variant="h5">{`${t("Sensors")}`}</Typography>
        </Box>
        <Box>
          <StudyFilter setShowFilterStudies={handleShowFilterStudies} setOrder={setOrder} order={order} />
        </Box>
        <SearchBox searchData={searchData} />
        <Box>
          <AddSensor studies={studies} setSensors={setSensors} />
        </Box>
      </Box> */}
      <Box className={layoutClasses.header}>
        <Box className={headerclasses.titleSection}>
          {/* <Box className={headerclasses.logo}>
          <img src={LogoImage} alt="Logo" />
        </Box> */}
          {authType === "admin" && (
            <IconButton
              className={headerclasses.backButton}
              onClick={() => {
                window.location.href = `/#/researcher`
              }}
            >
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          {/* <Typography variant="h5">{`${t("Sensors")}`}</Typography> */}
          <AddSensor studies={studies} setSensors={setSensors} settingsInfo={settingsInfo} />
        </Box>
        <Box className={headerclasses.actionGroup}>
          <SearchBox searchData={searchData} />
          <StudyFilter setShowFilterStudies={handleShowFilterStudies} setOrder={setOrder} order={order} />
          <Box className={headerclasses.profileSection} onClick={(event) => setShowCustomizeMenu(event.currentTarget)}>
            <Avatar className={headerclasses.avatar}>{title?.charAt(0) || "U"}</Avatar>
            {supportsSidebar ? <Profile title={title} authType={authType} /> : null}
          </Box>
        </Box>
      </Box>
      {showFilterStudies && (
        <Box>
          <StudyFilterList
            studies={studies}
            researcherId={researcherId}
            type="sensors"
            showFilterStudies={showFilterStudies}
            selectedStudies={selectedStudies}
            setSelectedStudies={setSelectedStudies}
          />
        </Box>
      )}

      {(selectedSensors || []).length > 0 && (
        <Box className={headerclasses.optionsMain}>
          <Box className={headerclasses.optionsSub}>
            <DeleteSensor sensors={selectedSensors} setSensors={setSensors} />
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
        {/* <MenuItem disabled divider>
          <b>{title}</b>
        </MenuItem> */}
        {!supportsSidebar ? (
          <MenuItem>
            <Profile title={title} authType={authType} />
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
      <Dialog open={passwordChange} onClose={() => setPasswordChange(false)}>
        <DialogContent>
          <CredentialManager id={researcherId} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
