import React, { useState, useEffect } from "react"
import { Box, Fab, Button, Icon, makeStyles, Theme, createStyles, useMediaQuery, useTheme } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { Add as AddIcon, FilterList as FilterListIcon, Search as SearchIcon } from "@material-ui/icons"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"

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
      <Button
        variant="contained"
        // className={classes.btnFilter + " " + (showFilter === true ? classes.tagFilteredBg : "")}
        className={`${classes.filterButton} ${!supportsSidebar ? classes.filterButtonCompact : ""}`}
        onClick={() => {
          showFilter === true ? setShowFilter(false) : setShowFilter(true)
        }}
        startIcon={<FilterListIcon />}
      >
        {/* <Icon>filter_alt</Icon> */}
        {supportsSidebar ? "Filter" : null}
        {/* <span className={classes.filterText}>{`${t("Filter results")}`}</span>{" "} */}
        {/* {showFilter === true ? <Icon>arrow_drop_up</Icon> : <Icon>arrow_drop_down</Icon>} */}
      </Button>
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
