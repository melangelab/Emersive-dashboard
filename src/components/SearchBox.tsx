import React, { useState, useEffect } from "react"
import { Box, InputBase, Icon, makeStyles, Theme, createStyles, useMediaQuery, useTheme } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import "./Admin/admin.css"

interface StyleProps {
  isExpanded: boolean
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
  createStyles({
    search: {
      position: "relative",
      borderRadius: 50,
      backgroundColor: "#fff",
      border: "1px solid #dadce0",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
      transition: theme.transitions.create("width"),
      width: ({ isExpanded }) => (isExpanded ? 300 : 33),
      height: 33,
    },
    searchCompact: {
      width: ({ isExpanded }) => (isExpanded ? 122 : 33),
    },
    searchIcon: {
      // padding: theme.spacing(0, 1),
      padding: "0px 4px 4px 4px",
      height: "100%",
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: 1,
    },
    searchIcon2: {
      width: 20,
      height: 20,
    },
    inputRoot: {
      color: "inherit",
    },
    inputBase: {
      width: "100%",
      opacity: ({ isExpanded }) => (isExpanded ? 1 : 0),
      transition: theme.transitions.create("opacity"),
    },
    inputInput: {
      padding: "4px 10px",
      paddingLeft: 40,
      width: "100%",
    },
  })
)

export default function Header({ searchData, ...props }: { searchData: Function }) {
  // const classes = useStyles()
  const [search, setSearch] = useState("")
  const { t, i18n } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = useStyles({ isExpanded })
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  useEffect(() => {
    searchData(search)
  }, [search])

  const handleSearchClick = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setSearch("")
      searchData("")
    }
  }

  return (
    <div className={`search-icon-container ${isExpanded ? "search-icon-container2" : ""}`}>
      {/* <div className={`${classes.search} ${supportsSidebar ? "" : classes.searchCompact}`}>
        <div className={classes.searchIcon} onClick={handleSearchClick}>
          <Icon className={classes.searchIcon2}>search</Icon>
        </div> */}
      <div className={`search ${isExpanded ? "search-expanded" : ""}`}>
        <div className="search-icon" onClick={handleSearchClick}>
          <Icon className="search-icon-inner">search</Icon>
        </div>
        <InputBase
          placeholder={isExpanded ? `${t("Search by name")}` + "…" : ""}
          classes={{
            root: classes.inputBase,
            input: classes.inputInput,
          }}
          inputProps={{ "aria-label": "search" }}
          onChange={(e) => {
            setSearch(e.target.value)
            searchData(e.target.value)
          }}
          onBlur={() => {
            if (!search) {
              setIsExpanded(false)
            }
          }}
          value={search}
        />
      </div>
    </div>
  )
}
