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
  FormControlLabel,
  Checkbox,
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
import { createTheme } from "@material-ui/core/styles"
import { ReactComponent as Logo } from "../../icons/Logo.svg"

import { ReactComponent as ProfileIcon } from "../../icons/NewIcons/ProfileIcon.svg"
import { ReactComponent as RefreshIcon } from "../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as TableIcon } from "../../icons/NewIcons/table-list.svg"
import { ReactComponent as TableIconFilled } from "../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as GridIcon } from "../../icons/NewIcons/objects-column.svg"
import { ReactComponent as GridIconFilled } from "../../icons/NewIcons/objects-column-filled.svg"

import { ReactComponent as FilterColumns } from "../../icons/NewIcons/columns-3.svg"
import { ReactComponent as Filter } from "../../icons/NewIcons/filters.svg"
import { ReactComponent as FilterFilled } from "../../icons/NewIcons/filters-filled.svg"
import { ReactComponent as Download } from "../../icons/NewIcons/progress-download.svg"

import "./admin.css"

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
      marginLeft: "4px",
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
  elements,
  searchData,
  refreshElements,
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

  const [tabularView, setTabularView] = useState(true)

  const layoutClasses = useLayoutStyles()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const [selectedIcon, setSelectedIcon] = useState(null)

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  console.log("PROPS ORIGINAL KEYS", props.originalColumnKeys)

  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName)
    if (iconName === "grid" && tabularView) {
      setTabularView(false)
    } else if (iconName === "table" && !tabularView) {
      setTabularView(true)
    } else if (iconName === "refresh") {
      refreshElements()
    }
  }

  const handleColumnMenuOpen = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.left + window.scrollX,
    })
    setAnchorEl(event.currentTarget)
  }

  const handleColumnMenuClose = () => {
    setAnchorEl(null)
  }

  const handleColumnToggle = (event, columnKey) => {
    event.stopPropagation()
    props.setSelectedColumns((prev) => {
      if (event.target.checked) {
        // Add the column while maintaining original order
        const newColumns = props.originalColumnKeys.filter((key) => prev.includes(key) || key === columnKey)
        return newColumns
      } else {
        // Remove the column if it's not the last one
        if (prev.length > 1) {
          return prev.filter((key) => key !== columnKey)
        }
        return prev
      }
    })
  }

  const handleSelectAllColumns = () => {
    // Set all columns in their original order
    props.setSelectedColumns([...props.originalColumnKeys])
  }

  const handleDeselectAllColumns = () => {
    // Keep only the first column from the original order
    props.setSelectedColumns([
      props.originalColumnKeys[0],
      props.originalColumnKeys[props.originalColumnKeys.length - 1],
    ])
  }

  return (
    <div className="header-container">
      <div className="action-container">
        <SearchBox searchData={searchData} />

        <div className="icon-container" onClick={() => handleIconClick("refresh")}>
          <RefreshIcon className={`refresh-icon ${selectedIcon === "refresh" ? "selected" : ""}`} />
        </div>
        <div className="icon-container" onClick={() => handleIconClick("grid")}>
          {tabularView ? (
            <GridIcon className={`grid-icon ${selectedIcon === "grid" ? "selected" : ""}`} />
          ) : (
            <GridIconFilled className="grid-icon-filled" />
          )}
        </div>
        <div className="icon-container" onClick={() => handleIconClick("table")}>
          {tabularView ? (
            <TableIconFilled className="view-icon-filled" />
          ) : (
            <TableIcon className={`view-icon ${selectedIcon === "table" ? "selected" : ""}`} />
          )}
        </div>

        {tabularView && (
          <>
            <div className="icon-container" onClick={handleColumnMenuOpen}>
              <FilterColumns className={`filter-cols-icon ${selectedIcon === "filter-cols" ? "selected" : ""}`} />
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleColumnMenuClose}
              keepMounted
              elevation={3}
              anchorReference="anchorPosition"
              anchorPosition={menuPosition}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                style: {
                  maxHeight: "300px",
                  width: "250px",
                  position: "fixed",
                },
              }}
              style={{
                position: "fixed",
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
                  onClick={handleSelectAllColumns}
                  color="primary"
                  style={{ textTransform: "none", fontSize: "0.875rem" }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleDeselectAllColumns}
                  color="primary"
                  style={{ textTransform: "none", fontSize: "0.875rem" }}
                >
                  Deselect All
                </Button>
              </div>
              <div style={{ padding: "0.5rem", overflowY: "auto" }}>
                {props.originalColumnKeys.map((key) =>
                  key !== "actions" ? (
                    <MenuItem key={key} style={{ padding: "0.25rem" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={props.selectedColumns.includes(key)}
                            onChange={(e) => handleColumnToggle(e, key)}
                            style={{ marginRight: "0.5rem" }}
                          />
                        }
                        label={props.columns[key]}
                        style={{ width: "100%" }}
                      />
                    </MenuItem>
                  ) : null
                )}
              </div>
            </Menu>
            <div className="icon-container" onClick={() => handleIconClick("filter")}>
              <Filter className={`filter ${selectedIcon === "filter" ? "selected" : ""}`} />
            </div>
            <div className="icon-container" onClick={() => handleIconClick("download")}>
              <Download className={`download-icon ${selectedIcon === "download" ? "selected" : ""}`} />
            </div>
          </>
        )}
        <AddUpdateResearcher refreshResearchers={refreshElements} researchers={elements} />
        <div className="profile-container">
          <ProfileIcon className="profile-icon" />
          <div className="profile-text-container">
            <p className="profile-text">Hi! {title}</p>
            <p className="profile-sub-text">{authType}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
