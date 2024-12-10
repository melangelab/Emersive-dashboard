import React, { useState, useEffect } from "react"
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

export default function SharedStudyElement({
  sharedstudies,
  ownedby,
  upatedDataStudy,
  allStudies,
  researcherId,
  ...props
}) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { t, i18n } = useTranslation()
  const [editStudy, setEditStudy] = useState(false)
  const [editStudyName, setEditStudyName] = useState("")
  const [aliasStudyName, setAliasStudyName] = useState("")
  const [studyArray, setStudyNameArray] = useState([])
  const [Gpopover, setGpopover] = useState(null)
  const [editGroupIndex, setEditGroupIndex] = useState(null)
  const [editGroup, setEditGroup] = useState(false)
  const [editGroupName, setEditGroupName] = useState("")
  const [openDialogDeleteStudy, setOpenDialogDeleteStudy] = useState(false)
  const [ownerName, setOwnerName] = useState<string | null>(null)
  const [subResearcherNamesMap, setSubResearcherNamesMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const result = await LAMP.Researcher.view(ownedby)
        setOwnerName(result.name)
      } catch (error) {
        console.error("Error fetching owner details:", error)
        setOwnerName("Unknown")
      }
    }
    if (ownedby) {
      fetchOwnerName()
    }
  }, [ownedby])

  useEffect(() => {
    const fetchSubResearcherNames = async () => {
      const namesMap: Record<string, string[]> = {}
      for (const study of sharedstudies) {
        try {
          const names = await Promise.all(
            [...new Set(study.sub_researchers.map((sr) => sr.ResearcherID))].map(async (rid) => {
              if (typeof rid !== "string") return "Invalid ID"
              if (rid === researcherId) return "You"
              const result = await LAMP.Researcher.view(rid)
              if (typeof result === "object" && result !== null && "name" in result) {
                const researcher = result as { name?: string }
                return researcher.name || "Unknown Researcher"
              }
              return "Unknown Researcher"
            })
          )
          namesMap[study.id] = names
        } catch (error) {
          console.error("Error fetching sub-researcher names:", error)
        }
      }
      setSubResearcherNamesMap(namesMap)
    }

    if (sharedstudies && sharedstudies.length > 0) fetchSubResearcherNames()
  }, [sharedstudies, researcherId])

  const handleCloseDeleteStudy = () => {
    setOpenDialogDeleteStudy(false)
  }

  const removefromsharedStudy = () => {
    console.log("deleting", editGroupIndex, "from ")
    LAMP.Researcher.view(ownedby)
      .then((result) => {
        console.log("owned by", result.name)
      })
      .catch((error) => {
        console.error("Error fetching researcher data:", error)
      })
    // const updatedGroups = study.gname.filter((_, i) => i !== editGroupIndex)
    // study.gname = updatedGroups
    // LAMP.Study.update(study.id, study)
    //   .then((res) => {
    //     Service.addData("studies", [study])
    //     console.log("deleteGroup", res)
    //   })
    //   .catch((error) => {
    //     console.log("error updating group to newly created study", error)
    //   })
    setOpenDialogDeleteStudy(false)
  }

  return (
    <Box display="flex" alignItems="center">
      <Box flexGrow={1} pl={1}>
        <Typography variant="h6">
          {ownerName ? `Owned by Researcher: ${ownerName}` : "Fetching owner information..."}
        </Typography>
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
          <span className={classes.addText}>{`${t("Studies")}`}</span>
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
          {sharedstudies && sharedstudies.length > 0 ? (
            sharedstudies.map((study, index) => (
              <MenuItem key={index}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box width="100%" flexGrow={1} pl={1}>
                    <Typography variant="body1">{`Study: ${study.name}`}</Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{
                        wordWrap: "break-word", // Ensures words wrap within the Box
                        overflow: "hidden", // Prevents text overflow
                        whiteSpace: "normal", // Allows multi-line wrapping
                      }}
                    >
                      {/* {`Sub-Researchers: ${
                    study.sub_researchers.length === 1 &&
                    study.sub_researchers[0].ResearcherID === researcherId
                      ? "You"
                      : study.sub_researchers
                          .filter((sr) => sr.ResearcherID !== researcherId)
                          .map((sr) => sr.ResearcherID)
                          .concat("You")
                          .join(", ")
                  }`} */}
                      {`Sub-Researchers: ${
                        subResearcherNamesMap[study.id] ? subResearcherNamesMap[study.id].join(", ") : "Fetching..."
                      }`}{" "}
                    </Typography>
                  </Box>
                  <Box>
                    <Fab
                      size="small"
                      color="primary"
                      classes={{ root: classes.btnWhite }}
                      onClick={(event) => {
                        setEditGroup(true)
                        setEditGroupName(study)
                        setEditGroupIndex(index)
                      }}
                    >
                      <Icon>arrow_forward</Icon>
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
                      BackdropProps={{
                        invisible: true,
                      }}
                    >
                      <DialogContent dividers={false} classes={{ root: classes.activityContent }}>
                        <Box mt={2} mb={2}>
                          {`${t("Are you sure you want to exit this study?")}`}
                        </Box>
                        <DialogActions>
                          <Box textAlign="center" width={1} mb={3}>
                            <Button onClick={() => removefromsharedStudy()} color="primary" autoFocus>
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
          <MenuItem
            onClick={() => {
              setGpopover(null)
              setEditGroup(false)
              setEditGroupName("")
              setEditGroupIndex(null)
            }}
          >
            <Typography variant="h6">{`${t("Close this panel")}`}</Typography>
          </MenuItem>
        </React.Fragment>
      </Popover>
    </Box>
  )
}
