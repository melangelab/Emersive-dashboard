import React, { useState, useEffect } from "react"
import { Grid, Typography, Backdrop, CircularProgress, makeStyles, Theme, createStyles } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { useMediaQuery, useTheme } from "@material-ui/core"
import ActionsComponent from "./ActionsComponent"
import AssessmentDevlab from "./AssessmentDevlab"
import ActivityDevlab from "./ActivityDevlab"
import SensorDevlab from "./SensorDevlab"
import { studycardStyles } from "../Researcher/Studies/Index"
import LAMP from "lamp-core"
import { Service } from "../DBService/DBService"
import locale_lang from "../../locale_map.json"
import AdminHeader from "../Header"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    devlabMenu: {
      background: "#F8F8F8",
      maxWidth: 100,
      border: 0,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "100%",
      },
      "& span": { fontSize: 12 },
      "& div.Mui-selected": { backgroundColor: "transparent", color: "#5784EE", "& path": { fill: "#5784EE" } },
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    menuItems: {
      display: "inline-block",
      textAlign: "center",
      color: "rgba(0, 0, 0, 0.4)",
      paddingTop: 40,
      paddingBottom: 30,
      [theme.breakpoints.down("sm")]: {
        paddingTop: 16,
        paddingBottom: 9,
      },
      [theme.breakpoints.down("xs")]: {
        padding: 6,
      },
    },
    menuIcon: {
      minWidth: "auto",
      [theme.breakpoints.down("xs")]: {
        top: 5,
        position: "relative",
      },
      "& path": { fill: "rgba(0, 0, 0, 0.4)", fillOpacity: 0.7 },
    },
    btnBlue: {
      background: "#7599FF",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#fff",
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#5680f9" },
      [theme.breakpoints.up("md")]: {
        position: "absolute",
      },
    },
    tableContainerWidth: {
      maxWidth: 1055,
      width: "80%",
      [theme.breakpoints.down("md")]: {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    tableContainerWidthPad: {
      maxWidth: 1055,
      paddingLeft: 0,
      paddingRight: 0,
    },
    menuOuter: {
      paddingTop: 0,
      [theme.breakpoints.down("sm")]: {
        display: "flex",
        padding: 0,
      },
    },
    logDevlab: {
      marginTop: 50,
      zIndex: 1111,
      [theme.breakpoints.up("md")]: {
        height: "calc(100vh - 55px)",
      },
      [theme.breakpoints.down("sm")]: {
        borderBottom: "#7599FF solid 5px",
        borderRight: "#7599FF solid 5px",
      },
    },
    btnFilter: {
      color: "rgba(0, 0, 0, 0.4)",
      fontSize: 14,
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      boxShadow: "none",
      background: "transparent",
      margin: "0 15px",
      paddingRight: 0,
      "& svg": { marginRight: 10 },
    },
    tableOuter: {
      width: "100vw",
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50.6vw",
      marginRight: "-50.6vw",
      marginBottom: 30,
      marginTop: -20,
      "& input": {
        width: 350,
        [theme.breakpoints.down("md")]: {
          width: 200,
        },
      },
      "& div.MuiToolbar-root": { maxWidth: 1232, width: "100%", margin: "0 auto" },
      "& h6": { fontSize: 30, fontWeight: 600, marginLeft: 10 },
      "& button": {
        marginRight: 15,
        "& span": { color: "#7599FF" },
      },
    },
    btnCursor: {
      "&:hover div": {
        cursor: "pointer !important",
      },
      "&:hover div > svg": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > g > rect": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > g > g > path": {
        cursor: "pointer !important",
      },
      "&:hover div > svg > g > g > circle": {
        cursor: "pointer !important",
      },
      "&:hover div > span": {
        cursor: "pointer !important",
      },
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
  })
)

export default function DevLabs({ history, updateStore, adminType, authType, onLogout, ...props }) {
  const [assessments, setAssessments] = useState([])
  const [activities, setActivities] = useState([])
  const [sensors, setSensors] = useState([])
  const [studies, setStudies] = useState([])
  const [selectedTab, setSelectedTab] = useState({ id: "devlab", tab: "activities" })
  const [search, setSearch] = useState("")
  const [selectedStudies, setSelectedStudies] = useState([])
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const participantcardclasses = studycardStyles()
  const [isLoading, setIsLoading] = useState(false)
  const [tabularView, setTabularView] = useState(false)
  const [columns, setColumns] = useState([])
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [order, setOrder] = useState(localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : true)

  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : lang ? lang : "en-US"
  }

  const getAllStudies = async () => {
    try {
      setIsLoading(true)
      const studiesData = await LAMP.Study.all()
      setStudies(studiesData || [])
      // Set all studies as selected by default for DevLab
      setSelectedStudies((studiesData || []).map((study) => study.name))
    } catch (error) {
      console.error("Error fetching studies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllActivitiesForDevLab = async () => {
    try {
      setIsLoading(true)

      // Fetch all activities from LAMP API
      const allActivitiesData = (await LAMP.Activity.all()) as any[]
      console.log("DevLab - All activities fetched:", allActivitiesData)

      // Enrich activities with study information
      const enrichedActivities = await Promise.all(
        allActivitiesData.map(async (activity) => {
          try {
            // Get study information for each activity
            const studyInfo =
              studies.find((study) => study.id === activity.study_id) ||
              (await LAMP.Study.view(activity.study_id).catch(() => null))

            return {
              ...activity,
              study_name: studyInfo?.name || "Unknown Study",
              fetchedAt: new Date().toISOString(),
              isDevLabItem: true,
            }
          } catch (error) {
            console.error(`Error enriching activity ${activity.id}:`, error)
            return {
              ...activity,
              study_name: "Unknown Study",
              fetchedAt: new Date().toISOString(),
              isDevLabItem: true,
            }
          }
        })
      )

      console.warn("DevLab - Enriched activities:", enrichedActivities)

      // Save to ServiceDB with devlabactivities collection
      if (enrichedActivities && enrichedActivities.length > 0) {
        try {
          // Clear existing devlabactivities collection
          await Service.delete("devlabactivities", "all")
          // Add new data
          await Service.addData("devlabactivities", enrichedActivities)
          console.log("DevLab activities saved to ServiceDB:", enrichedActivities.length)
        } catch (serviceError) {
          console.error("Error saving to ServiceDB:", serviceError)
        }
      }

      setActivities(enrichedActivities || [])
    } catch (error) {
      console.error("Error fetching all activities for DevLab:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshDevLabData = () => {
    setIsLoading(true)

    // Fetch assessments, activities, sensors, and studies data
    Promise.all([
      fetchAllActivitiesForDevLab(),
      LAMP.Sensor.all().catch(() => []),
      // Add assessment fetching when API is available
      Promise.resolve([]), // Placeholder for assessments
      getAllStudies(),
    ])
      .then(([_, sensorsData, assessmentsData]) => {
        setSensors(sensorsData || [])
        setAssessments(assessmentsData || [])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    refreshDevLabData()
  }, [])

  useEffect(() => {
    let authId = LAMP.Auth._auth.id
    let language = !!localStorage.getItem("LAMP_user_" + authId)
      ? JSON.parse(localStorage.getItem("LAMP_user_" + authId)).language
      : getSelectedLanguage()
      ? getSelectedLanguage()
      : "en-US"
    i18n.changeLanguage(language)
  }, [])

  const stats = () => {
    return [
      {
        value: assessments?.length || 0,
        label: "ASSESSMENTS",
        color: "#f2aa85",
        key: "assessments",
      },
      {
        value: activities?.length || 0,
        label: "ACTIVITIES",
        color: "#06B0F0",
        key: "activities",
      },
      {
        value: sensors?.length || 0,
        label: "SENSORS",
        color: "#75d36d",
        key: "sensors",
      },
    ]
  }

  const getTabTitle = () => {
    switch (selectedTab.tab) {
      case "assessments":
        return "Assessments"
      case "activities":
        return "Activities"
      case "sensors":
        return "Sensors"
      default:
        return "DevLab"
    }
  }

  const renderTabContent = () => {
    switch (selectedTab.tab) {
      case "assessments":
        return (
          <AssessmentDevlab
            assessments={assessments}
            refreshData={refreshDevLabData}
            isLoading={isLoading}
            search={search}
          />
        )
      case "activities":
        return (
          <ActivityDevlab
            assessments={activities}
            refreshData={refreshDevLabData}
            isLoading={isLoading}
            search={search}
            setSearch={setSearch}
            studies={studies}
            selectedStudies={selectedStudies}
            setStudies={setStudies}
            setSelectedStudies={setSelectedStudies}
            // Remove researcher-specific props since this is admin view
            adminType={adminType}
            authType={authType}
            tabularView={tabularView}
            setTabularView={setTabularView}
            order={order}
            setOrder={setOrder}
          />
        )
      case "sensors":
        return <SensorDevlab sensors={sensors} refreshData={refreshDevLabData} isLoading={isLoading} search={search} />
      default:
        return null
    }
  }

  return (
    <React.Fragment>
      <AdminHeader
        adminType={adminType}
        authType={authType}
        title={props.title}
        pageLocation={`DevLab > ${getTabTitle()}`}
      />
      <div className="body-container">
        {selectedTab.tab !== "activities" && (
          <ActionsComponent
            searchData={(data) => setSearch(data)}
            refreshElements={refreshDevLabData}
            actions={["refresh", "search", "grid", "table", "filter-cols"]}
            tabularView={tabularView}
            setTabularView={setTabularView}
            VisibleColumns={columns}
            setVisibleColumns={setColumns}
          />
        )}

        {/* Tabs Container */}
        <Grid container style={{ display: "flex" }}>
          {stats().map((stat) => (
            <Grid
              item
              xs={2}
              key={stat.key}
              className={`${participantcardclasses.statItem} ${
                selectedTab.id === "devlab" && selectedTab.tab === stat.key ? "selected" : ""
              }`}
              onClick={() => {
                selectedTab.id === "devlab" && selectedTab.tab === stat.key
                  ? setSelectedTab({ id: null, tab: null })
                  : setSelectedTab({ id: "devlab", tab: stat.key })
              }}
            >
              <Typography className={participantcardclasses.statNumber} style={{ color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography className={participantcardclasses.statLabel}>{stat.label}</Typography>
            </Grid>
          ))}
        </Grid>
        {/* Content Container */}
        {selectedTab.tab && renderTabContent()}
      </div>

      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </React.Fragment>
  )
}
