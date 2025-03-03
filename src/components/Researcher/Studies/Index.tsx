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
  Button,
  Paper,
  Typography,
  FormControl,
  Switch,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Divider,
  ButtonGroup,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import DeleteStudy from "./DeleteStudy"
import EditStudy from "./EditStudy"
import { Service } from "../../DBService/DBService"
import useInterval from "../../useInterval"
import AddSubResearcher from "./AddSubResearcher"
import { useLayoutStyles } from "../../GlobalStyles"
import LAMP from "lamp-core"
import { useSnackbar } from "notistack"
import StudyDetailsDialog from "./StudyDetailsDialog"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      position: "fixed",
      top: "100px", // Equivalent to mt={14}
      height: "calc(100vh - 102.2px)",
      left: "140px",
      width: "89%",
      borderRadius: 20,
      padding: "0 5px 0 5px", // Set top padding to 0
      zIndex: 20,
      // overflowY: "auto",
      backgroundColor: "white",
      // padding: theme.spacing(0, 2),
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: "100%",
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
    },
    // tableContainer: {
    //   "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
    //   "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
    //   "& div.MuiInput-underline": {
    //     "& span.material-icons": {
    //       width: 81,
    //       height: 19,
    //       fontSize: 27,
    //       lineHeight: "23PX",
    //       color: "rgba(0, 0, 0, 0.4)",
    //     },
    //     "& button": { display: "none" },
    //   },
    //   [theme.breakpoints.down("sm")]: {
    //     marginBottom: 80,
    //   },
    // },
    tableContainerMobile: {
      // Reset the left property from the parent
      left: "50%",
      // Center using transform
      transform: "translateX(-50%)",
      // Adjust width for mobile view
      width: "98%",
      // Add some margin to account for any potential sidebar
      margin: "0 auto",
      padding: "0 5px 0 5px",
      height: "calc(100vh - 222px)",
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    studyMain: {
      background: "#E0E0E0",
      borderRadius: theme.spacing(2), //16,
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: theme.shadows[4],
      },
      marginRight: "11px",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      marginLeft: "8px",
      margin: theme.spacing(0, 1),
      // minWidth: 120,
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    studyDetailsContainer: {
      backgroundColor: "#f5f5f5",
      borderRadius: theme.spacing(1),
      padding: theme.spacing(3),
    },
    statsContainer: {
      backgroundColor: "#fff",
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[1],
    },
    sectionTitle: {
      color: theme.palette.primary.main,
      fontWeight: 600,
      marginBottom: theme.spacing(2),
    },
    detailRow: {
      marginBottom: theme.spacing(2),
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    fileUpload: {
      marginTop: theme.spacing(1),
    },
    actionButtons: {
      display: "flex",
      justifyContent: "flex-end",
      gap: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
  })
)

export default function StudiesList({
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
  const [newStudy, setNewStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const layoutClasses = useLayoutStyles()
  // const [showDetails, setShowDetails] = useState(false)
  // const [editMode, setEditMode] = useState(false)
  const [editStudyId, setEditStudyId] = useState(false)
  const [expandedStudyId, setExpandedStudyId] = useState(null)
  const toggleStudyDetails = (studyId) => {
    setExpandedStudyId(expandedStudyId === studyId ? null : studyId)
  }
  const editStudyDetails = (studyId) => {
    setEditStudyId(editStudyId === studyId ? null : studyId)
  }
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [formState, setFormState] = useState({})
  const [detailsStudyId, setDetailsStudyId] = useState(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [studyToSuspend, setStudyToSuspend] = useState(null)
  const [viewMode, setViewMode] = useState("grid")

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const handleOpenSuspendDialog = (study) => {
    setStudyToSuspend(study)
    setSuspendDialogOpen(true)
  }

  const handleCloseSuspendDialog = () => {
    setSuspendDialogOpen(false)
    setStudyToSuspend(null)
  }

  const confirmSuspend = () => {
    if (studyToSuspend) {
      const updatedStudy = {
        ...studyToSuspend,
        timestamps: {
          ...studyToSuspend.timestamps,
          suspendedAt: new Date(),
        },
      }
      handleUpdateStudy(studyToSuspend.id, updatedStudy)
      handleCloseSuspendDialog()
    }
  }

  const suspend = (studyid, study) => {
    const updatedStudy = {
      ...study,
      timestamps: {
        ...study.timestamps,
        suspendedAt: new Date(),
      },
    }
    handleUpdateStudy(studyid, updatedStudy)
  }

  const handleFormChange = (study, field, value) => {
    const updatedForm = {
      ...formState,
      [study.id]: {
        ...(formState[study.id] || study),
        [field]: value,
      },
    }
    setFormState(updatedForm)
  }
  const handleUpdateStudy = async (studyId, updatedStudy) => {
    try {
      setLoading(true)
      LAMP.Study.update(studyId, updatedStudy)
        .then((res) => {
          Service.updateMultipleKeys(
            "studies",
            { studies: [{ id: studyId, ...updatedStudy }] },
            [
              "name",
              "description",
              "purpose",
              "studyType",
              "hasFunding",
              "fundingAgency",
              "hasEthicsPermission",
              "ethicsPermissionDoc",
              "mobile",
              "email",
              "state",
              "piInstitution",
              "collaboratingInstitutions",
              "timestamps",
            ],
            "id"
          )
        })
        .catch((error) => {
          console.log("error updating group to newly created study", error)
        })
      await LAMP.Study.update(studyId, updatedStudy)
      const fieldlist = [
        "name",
        "description",
        "purpose",
        "studyType",
        "hasFunding",
        "fundingAgency",
        "hasEthicsPermission",
        "ethicsPermissionDoc",
        "mobile",
        "email",
        "state",
        "piInstitution",
        "collaboratingInstitutions",
        "timestamps",
      ]
      await Service.updateMultipleKeys("studies", { studies: [{ id: studyId, ...updatedStudy }] }, fieldlist, "id")
      await getAllStudies()
      getAllStudies()
      setEditStudyId(null)
      enqueueSnackbar(t("Study updated successfully"), { variant: "success" })
    } catch (err) {
      enqueueSnackbar(t("Failed to update study: ") + err.message, { variant: "error" })
    }
  }
  // const handleUpdateStudy = async (studyId, study) => {
  //   try {
  //     const updatedStudy = {
  //       ...study,
  //       ...(formState[studyId] || {})
  //     }
  //     const fieldsToUpdate = [ 'name', 'description', 'purpose', 'studyType', 'hasFunding', 'fundingAgency', 'hasEthicsPermission', 'ethicsPermissionDoc', 'mobile', 'email', 'state', 'piInstitution', 'collaboratingInstitutions', 'timestamps'
  //     ]
  //     LAMP.Study.update(studyId, updatedStudy)
  //     .then((res) => {
  //       Service.update("studies", {
  //         studies: [{
  //           id: studyId,
  //           ...updatedStudy
  //         }]
  //       }, "name", "id")
  //       Service.updateMultipleKeys(
  //         "studies",
  //         {
  //           studies: [{
  //             id: studyId,
  //             ...updatedStudy  // This contains all updated fields
  //           }]
  //         },
  //         fieldsToUpdate,
  //         "id"
  //       )
  //       })
  //     .catch((error) => {
  //       console.log("error updating group to newly created study", error)
  //     })
  //     enqueueSnackbar(t("Study updated successfully"), { variant: "success" })
  //     setEditStudyId(null)
  //     setFormState({})
  //     getAllStudies()
  //     handleUpdatedStudyObject(study)
  //   } catch (err) {
  //     enqueueSnackbar(t("Failed to update study: ") + err.message, { variant: "error" })
  //   }
  // }

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
    },
    studies !== null && (studies || []).length > 0 ? null : 2000,
    true
  )

  useEffect(() => {
    getAllStudies()
    newAdddeStudy(newStudy)
  }, [newStudy])

  useEffect(() => {
    if ((studies || []).length > 0) setAllStudies(studies)
    else setAllStudies([])
  }, [studies])

  const searchFilterStudies = async () => {
    if (!!search && search !== "") {
      let studiesList: any = await Service.getAll("studies")
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

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "Not available"
  }

  const TableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Study Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Purpose</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Participants</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allStudies?.map((study) => (
            <TableRow key={study.id}>
              <TableCell>{study.name}</TableCell>
              <TableCell>{study.description || "-"}</TableCell>
              <TableCell>{study.purpose}</TableCell>
              <TableCell>{study.state}</TableCell>
              <TableCell>{study.participants?.length || 0}</TableCell>
              <TableCell>
                <Box display="flex">
                  <Fab size="small" className={classes.btnWhite} onClick={() => toggleStudyDetails(study.id)}>
                    <Icon>visibility</Icon>
                  </Fab>
                  <AddSubResearcher
                    study={study}
                    upatedDataStudy={handleUpdatedStudyObject}
                    researcherId={researcherId}
                    handleShareUpdate={handleUpdateStudy}
                  />
                  {props.authType === "admin" && (
                    <>
                      <DeleteStudy study={study} deletedStudy={handleDeletedStudy} researcherId={researcherId} />
                      <Fab size="small" className={classes.btnWhite} onClick={() => handleOpenSuspendDialog(study)}>
                        <Icon>block_outline</Icon>
                      </Fab>
                    </>
                  )}
                </Box>
                <StudyDetailsDialog
                  study={study}
                  open={expandedStudyId === study.id}
                  onClose={() => setExpandedStudyId(null)}
                  onSave={(updatedStudy) => handleUpdateStudy(study.id, updatedStudy)}
                  // currentFormState={formState[study.id] || study}
                  // handleFormChange={handleFormChange}
                  editStudyId={study.id}
                  formatDate={formatDate}
                  researcherId={researcherId}
                />
                <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
                  <DialogTitle>Suspend Study</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to suspend the study "{studyToSuspend?.name}"?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseSuspendDialog} color="secondary">
                      Cancel
                    </Button>
                    <Button onClick={confirmSuspend} color="primary">
                      Suspend
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
  const renderStudyDetails = (study) => {
    const currentFormState = formState[study.id] || study
    return (
      <Paper className={classes.studyDetailsContainer}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Study ID" value={study.id} disabled />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Study Name"
                  value={currentFormState.name || ""}
                  disabled={editStudyId !== study.id}
                  onChange={(e) => handleFormChange(study, "name", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={currentFormState.description || ""}
                  disabled={editStudyId !== study.id}
                  onChange={(e) => handleFormChange(study, "description", e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Study Configuration */}
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Study Purpose</InputLabel>
                  <Select
                    value={currentFormState.purpose || ""}
                    disabled={editStudyId !== study.id}
                    onChange={(e) => handleFormChange(study, "purpose", e.target.value)}
                  >
                    <MenuItem value="practice">Practice</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                    <MenuItem value="research">Research</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {currentFormState.purpose === "research" && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Study Type</InputLabel>
                    <Select
                      value={currentFormState.studyType || ""}
                      disabled={editStudyId !== study.id}
                      onChange={(e) => handleFormChange(study, "studyType", e.target.value)}
                    >
                      <MenuItem value="DE">Descriptive</MenuItem>
                      <MenuItem value="CC">Case Control</MenuItem>
                      <MenuItem value="CO">Cohort</MenuItem>
                      <MenuItem value="OB">Observational</MenuItem>
                      <MenuItem value="RCT">RCTs</MenuItem>
                      <MenuItem value="OC">Other Clinical trials</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Funding & Ethics */}
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Funding & Ethics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <FormControl component="fieldset">
                <Typography>Has Funding</Typography>
                <Switch
                  checked={currentFormState.hasFunding || false}
                  disabled={editStudyId !== study.id}
                  onChange={(e) => handleFormChange(study, 'hasFunding', e.target.checked)}
                />
              </FormControl> */}
                <ButtonGroup>
                  <Button
                    variant={currentFormState.hasFunding ? "contained" : "outlined"}
                    onClick={() => handleFormChange(study, "hasFunding", true)}
                    disabled={editStudyId !== study.id}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!currentFormState.hasFunding ? "contained" : "outlined"}
                    onClick={() => handleFormChange(study, "hasFunding", false)}
                    disabled={editStudyId !== study.id}
                  >
                    No
                  </Button>
                </ButtonGroup>
              </Grid>
              {currentFormState.hasFunding && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Funding Agency"
                    value={currentFormState.fundingAgency || ""}
                    disabled={editStudyId !== study.id}
                    onChange={(e) => handleFormChange(study, "fundingAgency", e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography>Ethics Permission</Typography>
                  <Switch
                    checked={currentFormState.hasEthicsPermission || false}
                    disabled={editStudyId !== study.id}
                    onChange={(e) => handleFormChange(study, "hasEthicsPermission", e.target.checked)}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          {/* Study Status & Statistics */}
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Study Status & Statistics
            </Typography>
            <Box className={classes.statsContainer}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">State</Typography>
                  <Typography>{study.state}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Participants</Typography>
                  <Typography>{study.participants?.length || 0}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Activities</Typography>
                  <Typography>{study.activities?.length || 0}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Timestamps */}
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Important Dates
            </Typography>
            <Grid container spacing={2}>
              {study.timestamps &&
                Object.entries(study.timestamps).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <Typography variant="subtitle2">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Typography>
                    <Typography>{formatDate(value)}</Typography>
                  </Grid>
                ))}
              <Grid item xs={6} key={"createdat"}>
                <Typography variant="subtitle2"> Created at </Typography>
                <Typography>{formatDate(study.timestamp)} </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box className={classes.actionButtons}>
          {editStudyId == study.id ? (
            <>
              <Button variant="contained" color="primary" onClick={() => handleUpdateStudy(study.id, currentFormState)}>
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setFormState((prev) => ({ ...prev, [study.id]: undefined }))
                  editStudyDetails(study.id)
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="contained" color="primary" onClick={() => editStudyDetails(study.id)}>
              Edit Study
            </Button>
          )}
        </Box>
      </Paper>
    )
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || allStudies === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box>
        <Header
          studies={allStudies ?? null}
          researcherId={researcherId}
          searchData={handleSearchData}
          setParticipants={searchFilterStudies}
          newStudyObj={setNewStudy}
          updatedDataStudy={handleUpdatedStudyObject}
          title={props.ptitle}
          authType={props.authType}
          onLogout={props.onLogout}
          onViewModechanged={setViewMode}
          viewMode={viewMode}
          resins={props.resins}
        />
        <Box
          className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
        >
          {viewMode === "grid" ? (
            <Grid container spacing={3}>
              {allStudies !== null && (allStudies || []).length > 0 ? (
                (allStudies || []).map((study) => (
                  <Grid item lg={6} xs={12} key={study.id}>
                    <Box display="flex" p={1} className={classes.studyMain}>
                      <Box flexGrow={1}>
                        <EditStudy
                          study={study}
                          upatedDataStudy={handleUpdatedStudyObject}
                          allStudies={allStudies}
                          researcherId={researcherId}
                        />
                      </Box>
                      <AddSubResearcher
                        study={study}
                        upatedDataStudy={handleUpdatedStudyObject}
                        researcherId={researcherId}
                        handleShareUpdate={(studyid, updatedStudy) => handleUpdateStudy(studyid, updatedStudy)}
                      />
                      {props.authType == "admin" && (
                        <DeleteStudy study={study} deletedStudy={handleDeletedStudy} researcherId={researcherId} />
                      )}
                      {props.authType == "admin" && (
                        <Fab
                          size="small"
                          color="primary"
                          classes={{ root: classes.btnWhite }}
                          onClick={() => {
                            // suspend(study.id, study)
                            handleOpenSuspendDialog(study)
                          }}
                        >
                          <Icon> {"block_outline"} </Icon>
                        </Fab>
                      )}
                      <Fab
                        size="small"
                        color="primary"
                        classes={{ root: classes.btnWhite }}
                        onClick={() => {
                          toggleStudyDetails(study.id)
                        }}
                      >
                        <Icon>
                          {/* {expandedStudyId === study.id ? 'expand_less' : 'expand_more'}  */}
                          visibility
                        </Icon>
                      </Fab>
                      {/* <Button
                        variant="outlined"
                        onClick={() => toggleStudyDetails(study.id)}
                        className={classes.btnWhite}
                        startIcon={
                          <Icon>
                            {expandedStudyId === study.id ? 'expand_less' : 'expand_more'}
                          </Icon>
                        }        
                      >
                    {expandedStudyId === study.id ? 'Hide Details' : 'Show Details'}
                    </Button> */}
                    </Box>
                    {/* {expandedStudyId === study.id && (
                    <Box px={2} pb={2}>
                      <Divider style={{ margin: '16px 0' }} />
                      {renderStudyDetails(study)}
                    </Box>
                  )} */}
                    <StudyDetailsDialog
                      study={study}
                      open={expandedStudyId === study.id}
                      onClose={() => setExpandedStudyId(null)}
                      onSave={(updatedStudy) => handleUpdateStudy(study.id, updatedStudy)}
                      // currentFormState={formState[study.id] || study}
                      // handleFormChange={handleFormChange}
                      editStudyId={study.id}
                      formatDate={formatDate}
                      researcherId={researcherId}
                    />
                    <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog}>
                      <DialogTitle>Suspend Study</DialogTitle>
                      <DialogContent>
                        <Typography>Are you sure you want to suspend the study "{studyToSuspend?.name}"?</Typography>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseSuspendDialog} color="secondary">
                          Cancel
                        </Button>
                        <Button onClick={confirmSuspend} color="primary">
                          Suspend
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>
                ))
              ) : (
                <Grid item lg={6} xs={12}>
                  <Box display="flex" alignItems="center" className={classes.norecords}>
                    <Icon>info</Icon>
                    {`${t("No Records Found")}`}
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            <TableView />
          )}
        </Box>
      </Box>
    </React.Fragment>
  )
}
