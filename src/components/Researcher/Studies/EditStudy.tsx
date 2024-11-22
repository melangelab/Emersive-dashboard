import React, { useState } from "react"
import {
  Box,
  Fab,
  Icon,
  makeStyles,
  Theme,
  createStyles,
  Popover,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import EditStudyField from "./EditStudyField"
import { useTranslation } from "react-i18next"
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined"
import { Service } from "../../DBService/DBService"
import LAMP from "lamp-core"
import EditGroupField from "./EditGroupField"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    disabledButton: {
      color: "#4C66D6 !important",
      opacity: 0.5,
    },
    studyName: { minWidth: 200, alignItems: "center", display: "flex" },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      marginLeft: "8px",
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    addText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
    customPopover: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
    customPaper: {
      maxWidth: 380,
      marginTop: 50,
      marginLeft: 100,
      borderRadius: 10,
      padding: "10px 0",
      "& h6": { fontSize: 16 },
      "& li": {
        // display: "inline-block",
        width: "100%",
        padding: "15px 30px",
        "&:hover": { backgroundColor: "#ECF4FF" },
      },
      "& *": { cursor: "pointer" },
    },
    manageStudyDialog: { maxWidth: 700 },
    activityContent: {
      padding: "25px 50px 0",
    },
    popexpand: {
      backgroundColor: "#fff",
      color: "#618EF7",
      zIndex: 11111,
      "& path": { fill: "#618EF7" },
      "&:hover": { backgroundColor: "#f3f3f3" },
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
      [theme.breakpoints.down("sm")]: {
        minWidth: "auto",
      },
    },
  })
)

export default function EditStudy({ study, upatedDataStudy, allStudies, researcherId, ...props }) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { t, i18n } = useTranslation()
  const [editStudy, setEditStudy] = useState(false)
  const [editStudyName, setEditStudyName] = useState("")
  const [aliasStudyName, setAliasStudyName] = useState("")
  const [studyArray, setStudyNameArray] = useState([])
  const [openDialogStudies, setOpenDialogManageStudies] = useState(false)
  const [Gpopover, setGpopover] = useState(null)
  const [editGroupIndex, setEditGroupIndex] = useState(null)
  const [editGroup, setEditGroup] = useState(false)
  const [editGroupName, setEditGroupName] = useState("")
  const [aliasGroupName, setAliasGroupName] = useState("")
  const [openDialogDeleteStudy, setOpenDialogDeleteStudy] = useState(false)

  const updateStudyName = (data) => {
    setEditStudy(false)
    setAliasStudyName(data)
    let oldNameArray = Object.assign({}, studyArray)
    oldNameArray[editStudyName] = data
    setStudyNameArray(oldNameArray)
    upatedDataStudy(oldNameArray)
    console.log("updatestudyname", oldNameArray)
  }

  const callbackModal = () => {
    setOpenDialogManageStudies(false)
  }

  const editStudyField = (selectedRows, event) => {
    setEditStudy(true)
    setEditStudyName(selectedRows)
  }

  const handleCloseDeleteStudy = () => {
    setOpenDialogDeleteStudy(false)
  }

  const deleteGroup = () => {
    console.log("deleting", editGroupIndex, "from ", study)
    const updatedGroups = study.gname.filter((_, i) => i !== editGroupIndex)
    study.gname = updatedGroups
    LAMP.Study.update(study.id, study)
      .then((res) => {
        Service.addData("studies", [study])
        console.log("deleteGroup", res)
      })
      .catch((error) => {
        console.log("error updating group to newly created study", error)
      })

    setOpenDialogDeleteStudy(false)
  }

  return (
    <Box display="flex" alignItems="center">
      <Box flexGrow={1} pl={1}>
        {
          editStudy && study.id == editStudyName ? (
            <Box flexGrow={1} className={classes.studyName}>
              <EditStudyField
                study={study.id}
                studyName={study.name}
                editData={editStudy}
                editStudyName={editStudyName}
                updateName={updateStudyName}
                callbackModal={callbackModal}
                allStudies={allStudies}
                researcherId={researcherId}
              />
            </Box>
          ) : aliasStudyName && editStudyName === study.id ? (
            `${t(aliasStudyName)}`
          ) : studyArray[study.id] ? (
            `${t(studyArray[study.id])}`
          ) : (
            <>
              <div>{`Study: ${t(study.name)}`}</div>
              <div>{`Group: ${
                study.gname && study.gname.length > 0 ? study.gname.join(", ") : "No group available"
              }`}</div>
            </>
          )
          // (
          //   `${t(study.name)}`
          // )
        }
      </Box>
      <Box>
        <Fab
          size="small"
          color="primary"
          disabled={study.id > 1 ? true : false}
          classes={{ root: classes.btnWhite, disabled: classes.disabledButton }}
          onClick={(event) => {
            editStudyField(study.id, event)
          }}
        >
          <Icon>create</Icon>
        </Fab>
      </Box>
      <Box>
        <Fab
          size="small"
          variant="extended"
          color="primary"
          classes={{
            root: classes.btnWhite + " " + (!!Gpopover ? classes.popexpand : ""),
            disabled: classes.disabledButton,
          }}
          onClick={(event) => setGpopover(event.currentTarget)}
        >
          {/* <Icon size="small"> */}
          <ExpandCircleDownOutlinedIcon style={{ fontSize: "1em" }} />
          {/* </Icon>  */}
          <span className={classes.addText}>{`${t("Group")}`}</span>
        </Fab>
      </Box>
      <Popover
        classes={{ root: classes.customPopover, paper: classes.customPaper }}
        open={!!Gpopover ? true : false}
        anchorPosition={!!Gpopover && Gpopover.getBoundingClientRect()}
        anchorReference="anchorPosition"
        onClose={() => setGpopover(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <React.Fragment>
          {study.gname && study.gname.length > 0 ? (
            study.gname.map((group, index) => (
              <MenuItem key={index} onClick={() => console.log(`Clicked on group: ${group}`)}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box flexGrow={1} pl={1}>
                    {editGroup && editGroupName === group ? (
                      <EditGroupField
                        groupName={group}
                        study={study}
                        updateGroupName={(newName) => {
                          const updatedGroups = [...study.gname]
                          updatedGroups[index] = newName
                          setEditGroup(false)
                          setAliasGroupName(newName)
                        }}
                        onEditComplete={() => setEditGroup(false)}
                        allGroups={study.gname}
                      />
                    ) : (
                      <Typography variant="body1">{group}</Typography>
                    )}
                  </Box>
                  <Box>
                    <Fab
                      size="small"
                      color="primary"
                      classes={{ root: classes.btnWhite }}
                      onClick={(event) => {
                        setEditGroup(true)
                        setEditGroupName(group)
                        setEditGroupIndex(index)
                      }}
                    >
                      <Icon>create</Icon>
                    </Fab>
                  </Box>
                  <Box
                  // display="flex" alignItems="center" pl={1}
                  >
                    <Fab
                      size="small"
                      color="primary"
                      disabled={study.id > 1 ? true : false}
                      classes={{ root: classes.btnWhite, disabled: classes.disabledButton }}
                      onClick={() => {
                        setOpenDialogDeleteStudy(true)
                        setEditGroupIndex(index)
                      }}
                    >
                      <Icon>delete_outline</Icon>
                    </Fab>
                    <Dialog
                      open={openDialogDeleteStudy}
                      onClose={handleCloseDeleteStudy}
                      scroll="paper"
                      aria-labelledby="alert-dialog-slide-title"
                      aria-describedby="alert-dialog-slide-description"
                      classes={{ paper: classes.manageStudyDialog }}
                    >
                      <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
                        <Box mt={2} mb={2}>
                          {`${t("Are you sure you want to delete this group?")}`}
                        </Box>
                        <DialogActions>
                          <Box textAlign="center" width={1} mb={3}>
                            <Button onClick={() => deleteGroup()} color="primary" autoFocus>
                              {`${t("Delete")}`}
                            </Button>
                            <Button
                              onClick={() => {
                                handleCloseDeleteStudy()
                              }}
                            >
                              {`${t("Cancel")}`}
                            </Button>
                          </Box>
                        </DialogActions>
                      </DialogContent>
                    </Dialog>
                  </Box>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body1">{t("No group available")}</Typography>
            </MenuItem>
          )}
          {/* <MenuItem
              onClick={() => {
                console.log("checking data here for editstudy", study, allStudies)
                Service.getAll("studies").then((obj)=> {console.log(obj)})
                // setGpopover(null)
                // setAddGroup(true)
              }}
            >
            <Box display="flex" alignItems="center">
              <Box flexGrow={1} pl={1}>
              <Box flexGrow={1}>
              <Typography variant="h6">{`${t("Add a group")}`}</Typography>
              </Box>
              <Box>
              <Fab
                    size="small"
                    color="primary"
                    disabled={study.id > 1 ? true : false}
                    classes={{ root: classes.btnWhite, disabled: classes.disabledButton }}
                    onClick={(event) => {
                      editGroupField(study.id, event)
                    }}
                  >
                    <Icon>create</Icon>
              </Fab>
              </Box>
              </Box>
              </Box>
            </MenuItem> */}
          <MenuItem
            onClick={() => {
              setGpopover(null)
              setEditGroup(false)
              setEditGroupName("")
              setEditGroupIndex(null)
              // setAddStudy(true)
            }}
          >
            <Typography variant="h6">{`${t("Close this panel")}`}</Typography>
          </MenuItem>
        </React.Fragment>
      </Popover>
    </Box>
  )
}
