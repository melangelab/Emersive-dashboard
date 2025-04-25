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
  ListItemText,
} from "@material-ui/core"
import DeleteSensor from "./DeleteSensor"
import StudyFilterList from "../ParticipantList/StudyFilterList"
import SearchBox from "../../SearchBox"
import { useTranslation } from "react-i18next"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { CredentialManager } from "../../CredentialManager"
import { ReactComponent as Logo } from "../../../icons/Logo.svg"
import { useLayoutStyles } from "../../GlobalStyles"
import { ReactComponent as RefreshIcon } from "../../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as GridViewIcon } from "../../../icons/NewIcons/objects-column.svg"
import { ReactComponent as TableViewIcon } from "../../../icons/NewIcons/table-list.svg"
import { ReactComponent as GridViewFilledIcon } from "../../../icons/NewIcons/objects-column-filled.svg"
import { ReactComponent as TableViewFilledIcon } from "../../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as ColumnsIcon } from "../../../icons/NewIcons/columns-3.svg"
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
    logo: {
      width: theme.spacing(5), // Scales dynamically (5 * 8px = 40px)
      height: theme.spacing(5),
      borderRadius: "50%",
      marginLeft: "4px",
    },
  })
)

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
  [key: string]: any
}) {
  const classes = useStyles()
  const layoutClasses = useLayoutStyles()
  const [showFilterStudies, setShowFilterStudies] = useState(false)
  const { t } = useTranslation()
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const headerclasses = useHeaderStyles()
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement | SVGElement>(null)
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
      <Box className={headerclasses.header}>
        <Box className={headerclasses.titleSection}>
          {supportsSidebar ? (
            <Box className={headerclasses.logo}>
              <Logo className={classes.logo} />
            </Box>
          ) : null}
          {authType === "admin" && (
            <IconButton
              className={headerclasses.backButton}
              onClick={() => {
                window.location.href = `/`
              }}
            >
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          <Typography variant="h5">{`${t("Sensors")}`}</Typography>
          {/* <Typography variant="h5">{`${t("Sensors")}`}</Typography> */}
        </Box>
        <Box className={headerclasses.actionGroup}>
          <SearchBox searchData={searchData} />
          <RefreshIcon className={headerclasses.actionIcon} onClick={() => window.location.reload()} />
          {props.viewMode === "grid" ? (
            <GridViewFilledIcon
              className={`${headerclasses.actionIcon} ${props.viewMode === "grid" ? "active" : ""}`}
              onClick={() => props.onViewModechanged("grid")}
            />
          ) : (
            <GridViewIcon
              className={`${headerclasses.actionIcon} active`}
              onClick={() => props.onViewModechanged("grid")}
            />
          )}
          {props.viewMode === "table" ? (
            <TableViewFilledIcon
              className={`${headerclasses.actionIcon} ${props.viewMode === "table" ? "active" : ""}`}
              onClick={() => props.onViewModechanged("table")}
            />
          ) : (
            <TableViewIcon
              className={`${headerclasses.actionIcon} active`}
              onClick={() => props.onViewModechanged("table")}
            />
          )}
          {props.viewMode === "table" && (
            <>
              <ColumnsIcon
                className={headerclasses.actionIcon}
                onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
              />
              <PrintIcon className={headerclasses.actionIcon} />
              <DownloadIcon className={headerclasses.actionIcon} />
            </>
          )}
          <AddSensor
            studies={studies}
            setSensors={setSensors}
            researcherId={researcherId}
            title={title}
            resemail={props.resemail}
          />
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
              style={{ padding: "0.25rem" }}
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
