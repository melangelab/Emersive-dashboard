import React, { useState, useEffect } from "react"
import { Box, Chip, Fab, Tooltip, makeStyles, Theme, createStyles } from "@material-ui/core"
// Local Imports
import LAMP, { StudyService } from "lamp-core"
import MultipleSelect from "../../MultipleSelect"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { fetchGetData } from "../SaveResearcherData"
import { createPortal } from "react-dom"

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
      backgroundColor: "transparent", // Remove the pink background
    },
    chiplabel: {
      whiteSpace: "break-spaces",
    },
    // New styles for the 3D card effect
    filterContainer: {
      position: "fixed",
      maxWidth: "100%",
      minWidth: "60%",
      zIndex: 111111,
      top: "130px",
      left: "52%",
      transform: "translateX(-50%)",
      margin: "auto",
      // Card styling
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid rgba(0, 0, 0, 0.06)",
      backdropFilter: "blur(10px)",
      // Hover effects
      "&:hover": {
        transform: "translateX(-50%) translateY(-2px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        backgroundColor: "#fafafa",
      },
    },
    // Enhanced filter chips container
    enhancedFilterChips: {
      flexWrap: "wrap",
      display: "flex",
      justifyContent: "center",
      maxWidth: "100%",
      margin: "0 0 16px 0",
      width: "100%",
      gap: "8px",
    },
    // Enhanced chip styling
    enhancedChip: {
      border: "1px solid #e0e0e0",
      color: "rgba(0, 0, 0, 0.7)",
      height: "auto",
      minHeight: "36px",
      paddingTop: "8px",
      paddingBottom: "8px",
      paddingLeft: "12px",
      paddingRight: "12px",
      borderRadius: "8px",
      transition: "all 0.2s ease-in-out",
      backgroundColor: "#ffffff",
      "&:hover": {
        backgroundColor: "#f5f5f5",
        borderColor: "#bdbdbd",
        transform: "translateY(-1px)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
      "&:focus": {
        background: "#FFFFFF !important",
      },
    },
    enhancedChipPrimary: {
      background: "#ECF4FF !important",
      border: "1px solid #2196F3",
      color: "#1976D2",
      fontWeight: 600,
      "&:focus": {
        background: "#ECF4FF !important",
      },
      "&:hover": {
        backgroundColor: "#E3F2FD !important",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
      },
    },
    // Multi-select container styling
    multiSelectContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e0e0e0",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
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
    Promise.all([Service.getAll("studies", researcherId), Service.getAll("sharedstudies", researcherId)]).then(
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
    Promise.all([Service.getAll("studies", researcherId), Service.getAll("sharedstudies", researcherId)])
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
      {showFilterStudies === true &&
        createPortal(
          <div className={classes.filterContainer}>
            <Box className={classes.enhancedFilterChips}>
              {[`${t("Select All")}`, `${t("Deselect All")}`].map((item) => (
                <Tooltip key={item} title={item}>
                  <Chip
                    classes={{
                      root: classes.enhancedChip,
                      colorPrimary: classes.enhancedChipPrimary,
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
            <Box className={classes.multiSelectContainer}>
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
          </div>,
          document.body
        )}
    </Box>
  )
}
