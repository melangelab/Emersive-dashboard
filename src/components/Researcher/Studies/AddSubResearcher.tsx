import React, { useState, useEffect } from "react"
import {
  Box,
  Icon,
  Button,
  Fab,
  Dialog,
  DialogContent,
  DialogActions,
  makeStyles,
  Theme,
  createStyles,
  MenuItem,
  Select,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { fetchPostData } from "../SaveResearcherData"
import PersonAddIcon from "@mui/icons-material/PersonAdd"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    disabledButton: {
      color: "#4C66D6 !important",
      opacity: 0.5,
    },
    activityContent: {
      padding: "25px 50px 0",
    },
    manageStudyDialog: { maxWidth: 700 },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",

      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
  })
)

export default function AddSubResearcher({ study, upatedDataStudy, researcherId, ...props }) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  //   const [openDialogDeleteStudy, setOpenDialogDeleteStudy] = useState(false)
  const [studyIdForAddingSR, setStudyIdForAddingSR] = useState("")
  const [availableResearchers, setAvailableResearchers] = useState<any[]>([])
  const [selectedResearchers, setSelectedResearchers] = useState<{ [id: string]: { accessScope: number } }>({})
  const [openDialog, setOpenDialog] = useState(false)

  // useEffect(() => {
  //   const fetchResearchers = async () => {
  //     try {
  //       const researchers = await LAMP.Researcher.all()
  //       console.log("all researcher", researchers)
  //       setAvailableResearchers(researchers)
  //       setLoading(false)
  //     } catch (error) {
  //       console.error("Error fetching researchers:", error)
  //       setLoading(false)
  //     }
  //   }
  //   fetchResearchers()
  // }, [])

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const researchers = await LAMP.Researcher.all()
        console.log("All researchers:", researchers)
        const filteredResearchers = researchers.filter((r) => r.id !== researcherId)
        setAvailableResearchers(filteredResearchers)
        const subResearchersWithAccessScope = {}
        study.sub_researchers.forEach((subResearcher) => {
          if (subResearcher.ResearcherID !== researcherId) {
            subResearchersWithAccessScope[subResearcher.ResearcherID] = {
              accessScope: subResearcher.access_scope,
            }
          }
        })
        setSelectedResearchers(subResearchersWithAccessScope)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching researchers:", error)
        setLoading(false)
      }
    }
    fetchResearchers()
  }, [study, researcherId])

  const addSubResearcher = async (studyId, subResearcherId, accessScope) => {
    let authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
    let bodyData = {
      sub_researcher_id: subResearcherId,
      access_scope: accessScope,
    }
    let authId = researcherId
    let bodyData2 = {
      id: researcherId,
    }
    try {
      let response = await fetchPostData(authString, studyId, "addsubresearcher", "study", "PUT", bodyData)
      console.log("Sub-researcher added successfully:", response)
    } catch (error) {
      console.error("Failed to add sub-researcher:", error)
    }
  }

  const handleSelect = (id, checked) => {
    setSelectedResearchers((prev) => ({
      ...prev,
      [id]: checked ? { accessScope: 1 } : undefined, // Default access scope: 'view'
    }))
  }
  const handleAccessScopeChange = (id, scope) => {
    setSelectedResearchers((prev) => ({
      ...prev,
      [id]: { ...prev[id], accessScope: scope },
    }))
  }
  const handleAddResearchers = async () => {
    for (const [researcherId, value] of Object.entries(selectedResearchers)) {
      if (value && value.accessScope) {
        await addSubResearcher(study.id, researcherId, value.accessScope)
        const updatedStudy = {
          ...study,
          timestamps: {
            ...study.timestamps,
            sharedAt: new Date(),
          },
        }
        props.handleShareUpdate(study.id, updatedStudy)
      }
    }
    enqueueSnackbar(t("Sub-researchers added successfully."), { variant: "success" })
    setOpenDialog(false)
  }

  const handleCloseStudy = () => {
    setOpenDialog(false)
  }

  return (
    <React.Fragment>
      <Box display="flex" alignItems="center" pl={1}>
        <Fab
          size="small"
          color="primary"
          disabled={study.id > 1 ? true : false}
          classes={{ root: classes.btnWhite, disabled: classes.disabledButton }}
          onClick={() => {
            setStudyIdForAddingSR(study.id)
            setOpenDialog(true)
          }}
        >
          <PersonAddIcon style={{ fontSize: "1.25rem" }} />
        </Fab>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseStudy}
        scroll="paper"
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        classes={{ paper: classes.manageStudyDialog }}
      >
        <DialogTitle>{t("Add Sub-Researchers to Study")}</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Typography>{t("Loading available researchers...")}</Typography>
          ) : availableResearchers.length === 0 ? (
            <Typography>{t("No researchers available.")}</Typography>
          ) : (
            availableResearchers.map((researcher) => (
              <Box display="flex" alignItems="center" key={researcher.id} mb={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!selectedResearchers[researcher.id]}
                      onChange={(e) => handleSelect(researcher.id, e.target.checked)}
                    />
                  }
                  label={researcher.name || t("Unknown Researcher")}
                />
                {selectedResearchers[researcher.id] && (
                  <Select
                    value={selectedResearchers[researcher.id].accessScope}
                    onChange={(e) => handleAccessScopeChange(researcher.id, e.target.value)}
                    style={{ marginLeft: "16px", minWidth: "120px" }}
                  >
                    <MenuItem value={1}>{t("View")}</MenuItem>
                    <MenuItem value={2}>{t("Edit")}</MenuItem>
                    <MenuItem value={4}>{t("All")}</MenuItem>
                  </Select>
                )}
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddResearchers} color="primary">
            {t("Add")}
          </Button>
          <Button
            onClick={() => {
              setOpenDialog(false)
            }}
          >
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
