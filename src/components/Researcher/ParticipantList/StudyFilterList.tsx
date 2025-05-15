import React, { useState, useEffect } from "react"
import { Box, Chip, Fab, Tooltip, makeStyles, Theme, createStyles } from "@material-ui/core"
// Local Imports
import LAMP, { StudyService } from "lamp-core"
import MultipleSelect from "../../MultipleSelect"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { fetchGetData } from "../SaveResearcherData"

export interface NewStudy {
  id?: string
  study_name?: string
  group_name?: string
}
export interface Study {
  id?: string
  name?: string
  group_name?: string
}
export interface Researcher {
  id?: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    badgeCount: {
      color: "#6083E7",
      paddingLeft: 10,
    },
    multiselect: {
      border: "1px solid #C6C6C6",
      // background: "green",
      color: "rgba(0, 0, 0, 0.4)",
      height: "auto",
      minHeight: "32px",
      paddingTop: "5px",
      paddingBottom: "5px",
      "&:focus": { background: "#FFFFFF !important" },
    },
    multiselectPrimary: {
      background: "#ECF4FF !important",
      border: "1px solid #ECF4FF",
      color: "rgba(0, 0, 0, 0.75)",
      fontWeight: 500,
      "&:focus": { background: "#ECF4FF !important" },
    },
    filterChips: {
      flexWrap: "wrap",
      display: "flex",
      justifyContent: "center",
      maxWidth: 1055,
      margin: "15px auto 0",
      width: "100%",
      backgroundColor: "pink",
    },
    chiplabel: { whiteSpace: "break-spaces" },
  })
)

export default function StudyFilterList({
  studies,
  researcherId,
  type,
  showFilterStudies,
  setSelectedStudies,
  selectedStudies,
  updateCount,
  ...props
}: {
  studies?: Array<any>
  researcherId?: string
  type?: string
  showFilterStudies?: Boolean
  setSelectedStudies?: Function
  selectedStudies?: Array<string>
  updateCount?: number
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [studiesCount, setStudiesCount] = useState(null)
  const [studs, setStuds] = useState(studies)
  const [allStudies, setAllStudies] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [deSelectAll, setDeselectAll] = useState(false)
  const [researchers, setResearchers] = useState([])
  const headerClasses = useHeaderStyles()

  useEffect(() => {
    // refreshStudies()
    Promise.all([Service.getAll("studies"), Service.getAll("sharedstudies")]).then(
      ([localStudiesData, sharedStudiesData]) => {
        updateStudiesState(localStudiesData || [], sharedStudiesData || [])
      }
    )
  }, [])

  // useEffect(() => {
  //   refreshStudies()
  // }, [studies])

  useEffect(() => {
    fetchResearchers()
  }, [])

  const fetchResearchers = async () => {
    try {
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const response = await fetchGetData(authString, `researcher/others/list`, "researcher")
      setResearchers(response.data || [])
    } catch (e) {
      console.error("Failed to fetch researchers", e)
    }
  }

  const updateStudiesState = (localStudies, sharedStudies) => {
    const all = [...localStudies, ...sharedStudies]
    setStuds(all)
    const studiesArray = all.map((obj) => obj.name)
    setAllStudies(studiesArray)

    // Update counts immediately after studies are updated
    const studiesData = filterStudyData(all)
    setStudiesCount(studiesData)

    console.log(all, studiesArray, "Updated studies state")
  }

  const refreshStudies = () => {
    Promise.all([Service.getAll("studies"), Service.getAll("sharedstudies")])
      .then(([localStudiesData, sharedStudiesData]) => {
        // const localStudies = localStudiesData || [];
        // const sharedStudies = sharedStudiesData || [];
        // const all = [...localStudies, ...sharedStudies];
        // setStuds(all);
        // const studiesArray = all.map((obj) => obj.name);
        // setAllStudies(studiesArray);
        // console.log(all, studiesArray, sharedStudies, "Filter all studies");
        updateStudiesState(localStudiesData || [], sharedStudiesData || [])
      })
      .catch((error) => {
        console.error("Error fetching studies:", error)
      })
  }

  useEffect(() => {
    let isMounted = true
    refreshStudies()
    return () => {
      isMounted = false
    }
  }, [updateCount])

  useEffect(() => {
    // let studiesData = filterStudyData(studs)
    // console.log("Filter study data", updateCount, type, studiesData)
    let studiesData = studs ? filterStudyData(studs) : {}
    console.log("Filter study data in studies change effect", updateCount, type, studiesData)
    setStudiesCount(studiesData)
  }, [studs])

  const filterStudyData = (dataArray) => {
    return Object.assign(
      {},
      ...dataArray.map((item) => ({
        [item.name]:
          type === "participants" || updateCount === 1
            ? item.participant_count
            : type === "activities" || updateCount === 2
            ? item.activity_count
            : type === "sensors" || updateCount === 3
            ? item.sensor_count
            : 0,
      }))
    )
  }

  const getFilterTypeStorage = () => {
    return localStorage.getItem("studyFilter_" + researcherId) !== null
      ? JSON.parse(localStorage.getItem("studyFilter_" + researcherId))
      : 0
  }

  return (
    <Box>
      {showFilterStudies === true && (
        <Box
          mt={1}
          style={{
            position: "fixed",
            maxWidth: "100%",
            minWidth: "60%",
            zIndex: 111111,
            backgroundColor: "grey",
            top: "98px",
            left: "50%",
            transform: "translateX(-50%)",
            margin: "auto",
          }}
        >
          <Box className={headerClasses.filterChips}>
            {[`${t("Select All")}`, `${t("Deselect All")}`].map((item) => (
              <Tooltip key={item} style={{ margin: 4 }} title={item}>
                <Chip
                  classes={{
                    root: classes.multiselect,
                    colorPrimary: classes.multiselectPrimary,
                    label: classes.chiplabel,
                  }}
                  label={
                    <section>
                      <b>{`${t(item)}`}</b>
                    </section>
                  }
                  color={
                    (getFilterTypeStorage() === 1 &&
                      item === "Select All" &&
                      selectedStudies.length === studs.length) ||
                    (getFilterTypeStorage() === 2 && item === "Deselect All" && selectedStudies.length === 0) ||
                    (item === "Deselect All" && selectedStudies.length === 0)
                      ? "primary"
                      : undefined
                  }
                  onClick={(x) => {
                    let allStudiesArray = []
                    let selectAllStudy = false
                    let deselectAllStudy = false
                    let flagData = 0 // 0 = "", 1 = "Select All", 2 = "Deselect All"
                    if (item === "Select All") {
                      allStudiesArray = allStudies
                      selectAllStudy = true
                      deselectAllStudy = false
                      flagData = 1
                    } else if (item === "Deselect All") {
                      selectAllStudy = false
                      deselectAllStudy = true
                      flagData = 2
                    } else {
                      selectAllStudy = false
                      deselectAllStudy = false
                    }
                    setSelectAll(selectAllStudy)
                    setDeselectAll(deselectAllStudy)
                    localStorage.setItem("studies_" + researcherId, JSON.stringify(allStudiesArray))
                    localStorage.setItem("studyFilter_" + researcherId, JSON.stringify(flagData))
                    setSelectedStudies(allStudiesArray)
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          <Box>
            {
              <MultipleSelect
                selected={selectedStudies}
                items={(studs || []).map((x) => `${x.name}`)}
                showZeroBadges={false}
                badges={studiesCount}
                onChange={(x) => {
                  localStorage.setItem("studies_" + researcherId, JSON.stringify(x))
                  setSelectedStudies(x)
                  let flagData = 0 // 0 = "", 1 = "Select All", 2 = "Deselect All"
                  if (allStudies.length !== x.length) {
                    setDeselectAll(false)
                    setSelectAll(false)
                  } else {
                    setSelectAll(true)
                    setDeselectAll(false)
                    flagData = 1
                  }
                  localStorage.setItem("studyFilter_" + researcherId, JSON.stringify(flagData))
                }}
              />
            }
          </Box>
        </Box>
      )}
    </Box>
  )
}
