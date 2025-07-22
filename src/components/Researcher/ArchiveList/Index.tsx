import React, { useState, useEffect } from "react"
import { Box, Grid, Backdrop, CircularProgress, Icon, makeStyles, Theme, createStyles } from "@material-ui/core"
import { Service } from "../../DBService/DBService"
import { useTranslation } from "react-i18next"
import ArchivedItemsView from "./ArchivedItemsView"
// import Header from "./Header"
import Header from "../../Header"
import { sortData } from "../Dashboard"
import useInterval from "../../useInterval"
import LAMP from "lamp-core"
import { useLayoutStyles } from "../../GlobalStyles"
import { useSnackbar } from "notistack"
import { useQuery } from "../../Utils"
import ActionsComponent from "../../Admin/ActionsComponent"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    norecordsmain: {
      minHeight: "calc(100% - 114px)",
      position: "absolute",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
  })
)

export default function ArchivedList({
  researcherId,
  title,
  studies,
  selectedStudies,
  setSelectedStudies,
  setOrder,
  order,
  getAllStudies,
  ...props
}) {
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const classes = useStyles()
  const [selected, setSelected] = useState(selectedStudies)
  const [search, setSearch] = useState(null)
  const layoutClasses = useLayoutStyles()
  const { enqueueSnackbar } = useSnackbar()
  const query = useQuery()
  const filterParam = query.get("filter")

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
      setLoading(false)
    },
    !studies || studies.length === 0 ? 60000 : null,
    true
  )

  useEffect(() => {
    if (selected !== selectedStudies) setSelected(selectedStudies)
  }, [selectedStudies])

  useEffect(() => {
    if (studies && studies.length > 0) {
      setLoading(false)
    }
  }, [studies, selected])

  useEffect(() => {
    if (filterParam) {
      console.log("Filter param changed:", filterParam)
    }
  }, [filterParam])

  const handleSearchData = (val: string) => {
    setSearch(val)
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading && !studies}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* <Header
        studies={studies}
        researcherId={researcherId}
        searchData={handleSearchData}
        selectedStudies={selected}
        setSelectedStudies={setSelectedStudies}
        setOrder={setOrder}
        order={order}
        title={props.ptitle}
        authType={props.authType}
        onLogout={props.onLogout}
      /> */}

      <Header
        authType={"Researcher"}
        title={props.ptitle}
        pageLocation={`${props.adminName ? props.adminName + " >" : ""} ${props.ptitle} > Archived Items`}
      />

      <div className="body-container">
        <ActionsComponent searchData={handleSearchData} actions={["search"]} />
        <div style={{ overflow: "auto" }}>
          {studies && studies.length > 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ArchivedItemsView
                  researcherId={researcherId}
                  searchFilter={search}
                  selectedStudies={selected}
                  studies={studies}
                />
              </Grid>
            </Grid>
          ) : (
            <Box className={classes.norecordsmain}>
              <Box display="flex" p={2} alignItems="center" className={classes.norecords}>
                <Icon>info</Icon>
                {`${t("No Studies Found")}`}
              </Box>
            </Box>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}
