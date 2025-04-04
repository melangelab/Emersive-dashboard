import React, { useState, useEffect } from "react"
import { Box, Fab, Button, Icon, makeStyles, Theme, createStyles, useMediaQuery, useTheme } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { Add as AddIcon, FilterList as FilterListIcon, Search as SearchIcon } from "@material-ui/icons"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { ReactComponent as FilterIcon } from "../../../icons/NewIcons/filters.svg"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tagFilteredBg: {
      color: "#5784EE !important",
      "& path": { fill: "#5784EE !important", fillOpacity: 1 },
    },
    btnFilter: {
      color: "rgba(0, 0, 0, 0.4)",
      fontSize: 12,
      lineHeight: "32px",
      cursor: "pointer",
      textTransform: "capitalize",
      boxShadow: "none",
      background: "transparent",
      // margin: "0 15px",
      padding: "0 0px",
      "& svg": { marginRight: 10 },
    },
    filterText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
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

export interface Researcher {
  id?: string
}
export interface Studies {
  name?: string
}
export default function StudyFilter({ setShowFilterStudies, setOrder, order, ...props }) {
  const [showFilter, setShowFilter] = useState(false)
  const classes = useStyles()
  const { t } = useTranslation()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const headerClasses = useHeaderStyles()

  useEffect(() => {
    setShowFilterStudies(showFilter)
  }, [showFilter])

  return (
    <Box
      className={headerClasses.filterContainer + " " + (!supportsSidebar ? headerClasses.filterContainerBottom : null)}
    >
      <FilterIcon
        className={classes.actionIcon}
        onClick={() => {
          showFilter === true ? setShowFilter(false) : setShowFilter(true)
        }}
      />
      <Fab
        variant="extended"
        className={classes.btnFilter + " " + (showFilter === true ? classes.tagFilteredBg : "")}
        onClick={setOrder}
      >
        <Icon>sort_by_alpha</Icon>
        {order === true ? <Icon>arrow_downward</Icon> : <Icon>arrow_upward</Icon>}
      </Fab>
    </Box>
  )
}
