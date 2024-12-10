import React, { useState, useEffect } from "react"
import {
  Box,
  Icon,
  Grid,
  makeStyles,
  Theme,
  createStyles,
  Backdrop,
  CircularProgress,
  Typography,
} from "@material-ui/core"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import DeleteStudy from "./DeleteStudy"
import SharedStudyElement from "./SharedStudyElement"
import { Service } from "../../DBService/DBService"
import useInterval from "../../useInterval"
import SearchBox from "../../SearchBox"
import { fetchPostData, fetchResult } from "../SaveResearcherData"
import LAMP from "lamp-core"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: 21,
          height: 19,
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
      [theme.breakpoints.down("sm")]: {
        marginBottom: 80,
      },
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    studyMain: { background: "#F8F8F8", borderRadius: 4 },
    norecords: {
      "& span": { marginRight: 5 },
    },
    header: {
      "& h5": {
        fontSize: "30px",
        fontWeight: "bold",
      },
    },
  })
)
type SharedStudiesByResearcher = {
  [owner: string]: {
    id: string
    name: string
    subResearchers: string[]
    gname?: string[]
  }[]
}
export default function SharedStudiesList({
  title,
  researcherId,
  studies,
  upatedDataStudy,
  deletedDataStudy,
  searchData,
  getAllStudies,
  newAdddeStudy,
  ...props
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [search, setSearch] = useState(null)
  const [allStudies, setAllStudies] = useState(null)
  const [sharedstudiesbyresearcher, setSharedstudies] = useState<SharedStudiesByResearcher | null>(null)
  const [newStudy, setNewStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [researchers, setResearchers] = useState(null)

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
      getSharedStudies()
    },
    studies !== null && (studies || []).length > 0 ? null : 2000,
    true
  )

  useEffect(() => {
    getAllStudies()
    getSharedStudies()
    newAdddeStudy(newStudy)
  }, [newStudy])

  // useEffect(() => {
  //   if ((studies || []).length > 0){
  //     getSharedStudies()
  //     // setAllStudies(studies)
  //     // researcher/:researcher_id/sharedstudies
  //   }
  //   else setAllStudies([])
  // }, [studies])
  useEffect(() => {
    getSharedStudies()
  }, [studies])

  // const addSubResearcher = async (studyId, subResearcherId, accessScope) => {
  //   let authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password;
  //   let bodyData = {
  //     sub_researcher_id: subResearcherId,
  //     access_scope: accessScope,
  //   };

  //   try {
  //     let response = await fetchPostData(authString, studyId, "addsubresearcher", "study", "PUT", bodyData);
  //     console.log("Sub-researcher added successfully:", response);
  //   } catch (error) {
  //     console.error("Failed to add sub-researcher:", error);
  //   }
  // };

  const getSharedStudies = async () => {
    let authId = researcherId
    let authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
    let bodyData = {
      id: researcherId,
    }
    // addSubResearcher("gxt2gywfapxt7ca1bes6", researcherId, 1);
    // addSubResearcher("ctffaz29ehhh34sn0bgn", researcherId, 2);
    // addSubResearcher("tkm4gdkg4tfft0mns5rk", researcherId, 4);
    await fetchPostData(authString, authId, "sharedstudies", "researcher", "POST", bodyData).then((studyData) => {
      // let newStudyId = studyData.data
      console.log("shared studies from server", studyData)
      setAllStudies(studyData.data)
      Service.addData("sharedstudies", studyData.data)
    })
    const studyData = await fetchPostData(authString, authId, "sharedstudies", "researcher", "POST", bodyData)
    const ownerStudiesMap = studyData.data.reduce((acc, s) => {
      const owner = s.parent
      if (!acc[owner]) {
        acc[owner] = []
      }
      acc[owner].push({
        ...s,
      })
      return acc
    }, {})
    setSharedstudies(ownerStudiesMap)
    console.log("Organized studies by owner:", ownerStudiesMap)
    Service.addData("sharedstudies", ownerStudiesMap)
  }

  const searchFilterStudies = async () => {
    if (!!search && search !== "") {
      let studiesList: any = await Service.getAll("sharedstudies")
      let newStudies = studiesList.filter((i) => i.name?.toLowerCase()?.includes(search?.toLowerCase()))
      setAllStudies(newStudies)
    } else {
      getAllStudies()
    }
    setLoading(false)
  }

  useEffect(() => {
    if (allStudies !== null) setLoading(false)
  }, [allStudies])

  useEffect(() => {
    searchFilterStudies()
  }, [search])

  const handleUpdatedStudyObject = (data) => {
    upatedDataStudy(data)
  }

  const handleDeletedStudy = (data) => {
    deletedDataStudy(data)
    searchData(search)
  }

  const handleSearchData = (val) => {
    setSearch(val)
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || allStudies === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box>
        <Box display="flex" className={classes.header}>
          <Box flexGrow={1} pt={1}>
            <Typography variant="h5">{`${t("Studies shared with you")}`}</Typography>
          </Box>
          <Box>
            <SearchBox searchData={searchData} />
          </Box>
        </Box>
        <Box className={classes.tableContainer} py={4}>
          <Grid container spacing={3}>
            {sharedstudiesbyresearcher !== null && Object.keys(sharedstudiesbyresearcher).length > 0 ? (
              Object.entries(sharedstudiesbyresearcher).map(([owner, ss]) => (
                <Grid item lg={6} xs={12} key={owner}>
                  <Box p={1} className={classes.studyMain}>
                    {/* {ss.map((study) => ( */}
                    <SharedStudyElement
                      sharedstudies={ss}
                      ownedby={owner}
                      upatedDataStudy={handleUpdatedStudyObject}
                      allStudies={allStudies}
                      researcherId={researcherId}
                    />
                    {/* ))} */}
                  </Box>
                </Grid>
              ))
            ) : (
              // {allStudies !== null && (allStudies || []).length > 0 ? (
              //   (allStudies || []).map((study) => (
              //     <Grid item lg={6} xs={12} key={study.id}>
              //       <Box display="flex" p={1} className={classes.studyMain}>
              //         <Box flexGrow={1}>
              //           <SharedStudyElement
              //             study={study}
              //             upatedDataStudy={handleUpdatedStudyObject}
              //             allStudies={allStudies}
              //             sharedstudies={sharedstudiesbyresearcher}
              //             researcherId={researcherId}
              //           />
              //         </Box>
              //       </Box>
              //     </Grid>
              //   ))
              // )
              <Grid item lg={6} xs={12}>
                <Box display="flex" alignItems="center" className={classes.norecords}>
                  <Icon>info</Icon>
                  {`${t("No Records Found")}`}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </React.Fragment>
  )
}
