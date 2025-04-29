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
  Backdrop,
  Slide,
  Divider,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import { Service } from "../../DBService/DBService"
import { fetchGetData, fetchPostData } from "../SaveResearcherData"
import { ReactComponent as SRAddIcon } from "../../../icons/NewIcons/users-alt.svg"
import { ReactComponent as SRAddFilledIcon } from "../../../icons/NewIcons/users-alt-filled.svg"
import { slideStyles } from "../ParticipantList/AddButton"

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
    actionIcon: {
      width: 24,
      height: 24,
      cursor: "pointer",
      transition: "all 0.3s ease",
      "& path": {
        fill: "rgba(0, 0, 0, 0.4)",
        transition: "fill 0.3s ease",
      },
      "&:hover path": {
        fill: "#06B0F0",
      },
      "&.selected path": {
        fill: "#4F95DA",
      },
      "&.active path": {
        fill: "#215F9A",
      },
    },
    field: {
      marginBottom: theme.spacing(2),
    },
  })
)

export default function AddSubResearcher({ study, upatedDataStudy, researcherId, open, onclose, ...props }) {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [availableResearchers, setAvailableResearchers] = useState<any[]>([])
  const [selectedResearchers, setSelectedResearchers] = useState<{ [id: string]: { accessScope: number } }>({})
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [changes, setChanges] = useState([])
  const [originalResearchers, setOriginalResearchers] = useState<{ [id: string]: { accessScope: number } }>({})

  // console.log("Study ID for adding sub-researcher:", study)
  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        console.log(authString)
        const response = await fetchGetData(authString, `researcher/others/list`, "researcher")
        // console.log("Researchers with access scope:", response)
        const researchers = response.data
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
        console.log("subResearchersWithAccessScope", subResearchersWithAccessScope)
        setOriginalResearchers(JSON.parse(JSON.stringify(subResearchersWithAccessScope)))
        setSelectedResearchers(JSON.parse(JSON.stringify(subResearchersWithAccessScope)))
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
      return response
    } catch (error) {
      console.error("Failed to add sub-researcher:", error)
      return null
    }
  }

  const removeSubResearcher = async (studyId, subResearcherId) => {
    let authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
    let bodyData = {
      sub_researcher_id: subResearcherId,
    }
    try {
      let response = await fetchPostData(authString, studyId, "removesubresearcher", "study", "PUT", bodyData)
      console.log("Sub-researcher removed successfully:", response)
      return response
    } catch (error) {
      console.error("Failed to remove sub-researcher:", error)
      return null
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
  const getAccessLevelLabel = (scope) => {
    switch (scope) {
      case 1:
        return "View"
      case 2:
        return "Edit"
      case 4:
        return "All"
      default:
        return "Unknown"
    }
  }

  const handleConfirmChanges = async () => {
    const validResearcherIds = availableResearchers.map((r) => r.id)
    let currentStudyObj = { ...study }
    for (const [researcherId, value] of Object.entries(selectedResearchers)) {
      // Check if researcher is new or has changed access scope
      // if (!validResearcherIds.includes(researcherId)) continue
      const isNew = !originalResearchers[researcherId]
      const hasChanged = !isNew && originalResearchers[researcherId]?.accessScope !== value?.accessScope

      if ((isNew || hasChanged) && value && value.accessScope) {
        console.log("Adding or updating sub-researcher:", study.id, researcherId, value.accessScope)
        // const currentStudy = await addSubResearcher(study.id, researcherId, value.accessScope)
        const response = await addSubResearcher(currentStudyObj.id, researcherId, value.accessScope)

        const updatedStudy = {
          // ...study,
          // ...currentStudy?.["data"],
          ...currentStudyObj,
          ...response?.["data"],

          timestamps: {
            // ...study.timestamps,
            // ...currentStudy?.["data"]?.timestamps,
            ...currentStudyObj.timestamps,
            ...response?.["data"]?.timestamps,
            sharedAt: new Date(),
          },
        }
        // props.handleShareUpdate(study.id, updatedStudy)
        props.handleShareUpdate(currentStudyObj.id, updatedStudy)
        currentStudyObj = updatedStudy
      }
    }

    // Handle removals - researchers who were originally present but are now missing
    for (const [researcherId, value] of Object.entries(originalResearchers)) {
      if (!selectedResearchers[researcherId]) {
        // const currentStudy = await removeSubResearcher(study.id, researcherId)
        const response = await removeSubResearcher(currentStudyObj.id, researcherId)
        const updatedStudy = {
          // ...study,
          // ...currentStudy?.["data"],
          ...currentStudyObj,
          ...response?.["data"],
          timestamps: {
            // ...study.timestamps,
            // ...currentStudy?.["data"]?.timestamps,
            ...currentStudyObj.timestamps,
            ...response?.["data"]?.timestamps,
            sharedAt: new Date(),
          },
        }
        // props.handleShareUpdate(study.id, updatedStudy)
        props.handleShareUpdate(currentStudyObj.id, updatedStudy)
        currentStudyObj = updatedStudy
      }
    }
    enqueueSnackbar(t("Sub-researchers updated successfully."), { variant: "success" })
    setConfirmationOpen(false)
    onclose()
  }

  const handleAddResearchers = async () => {
    const changesArray = []
    const validResearcherIds = availableResearchers.map((r) => r.id)
    for (const [researcherId, value] of Object.entries(selectedResearchers)) {
      if (!validResearcherIds.includes(researcherId)) continue
      const researcher = availableResearchers.find((r) => r.id === researcherId)
      if (!originalResearchers[researcherId] && value) {
        changesArray.push({
          researcher: researcher?.name || researcher?.id || "NA",
          accessLevel: getAccessLevelLabel(value.accessScope),
          action: "added",
          type: "new",
        })
      } else if (
        originalResearchers[researcherId] &&
        value &&
        originalResearchers[researcherId].accessScope !== value.accessScope
      ) {
        changesArray.push({
          researcher: researcher?.name || researcher?.id || "NA",
          oldAccessLevel: getAccessLevelLabel(originalResearchers[researcherId].accessScope),
          newAccessLevel: getAccessLevelLabel(value.accessScope),
          action: "modified",
          type: "modified",
        })
      } else if (originalResearchers[researcherId] && !value) {
        changesArray.push({
          researcher: researcher?.name || researcher?.id || "NA",
          accessLevel: getAccessLevelLabel(originalResearchers[researcherId].accessScope),
          action: "removed",
          type: "removed",
        })
      }
    }

    if (changesArray.length > 0) {
      setChanges(changesArray)
      setConfirmationOpen(true)
    } else {
      enqueueSnackbar(t("No changes to apply."), { variant: "info" })
    }
  }

  return (
    <React.Fragment>
      <Backdrop
        className={sliderclasses.backdrop}
        style={{ backgroundColor: "transparent" }}
        open={open}
        onClick={onclose}
      >
        <Slide direction="left" in={open && !confirmationOpen} mountOnEnter unmountOnExit>
          <Box
            className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Box className={sliderclasses.icon}>
              <SRAddFilledIcon />
            </Box>
            <Typography variant="h6">ADD SUB-RESEARCHERS</Typography>
            <Divider className={sliderclasses.divider} />
            <Box className={sliderclasses.content}>
              {loading ? (
                <Typography>{t("Loading available researchers...")}</Typography>
              ) : availableResearchers.length === 0 ? (
                <Typography>{t("No researchers available.")}</Typography>
              ) : (
                availableResearchers.map((researcher) => (
                  <Box key={researcher.id} className={sliderclasses.researcherRow}>
                    <FormControlLabel
                      className={sliderclasses.checkboxLabel}
                      control={
                        <Checkbox
                          checked={!!selectedResearchers[researcher.id]}
                          onChange={(e) => handleSelect(researcher.id, e.target.checked)}
                          className={sliderclasses.checkbox}
                        />
                      }
                      label={researcher.name || t("Unknown Researcher")}
                    />
                    {selectedResearchers[researcher.id] && (
                      <Select
                        value={selectedResearchers[researcher.id].accessScope}
                        onChange={(e) => handleAccessScopeChange(researcher.id, e.target.value)}
                        className={sliderclasses.select}
                      >
                        <MenuItem value={1}>{t("View")}</MenuItem>
                        <MenuItem value={2}>{t("Edit")}</MenuItem>
                        <MenuItem value={4}>{t("All")}</MenuItem>
                      </Select>
                    )}
                  </Box>
                ))
              )}
            </Box>
            <Box display="flex" justifyContent="flex-start" style={{ gap: 8 }} mt={2}>
              <Button className={sliderclasses.button} onClick={onclose} color="primary">
                {t("Cancel")}
              </Button>
              <Button
                className={sliderclasses.submitbutton}
                onClick={handleAddResearchers}
                color="primary"
                variant="contained"
                disabled={Object.keys(selectedResearchers).length === 0}
              >
                {t("Review Changes")}
              </Button>
            </Box>
          </Box>
        </Slide>
        <Slide direction="left" in={confirmationOpen} mountOnEnter unmountOnExit>
          <Box
            className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Box className={sliderclasses.icon}>
              <SRAddFilledIcon />
            </Box>
            <Typography variant="h6" className={sliderclasses.headings}>
              CONFIRM CHANGES
            </Typography>
            <Divider className={sliderclasses.divider} />

            <Box className={sliderclasses.diffContainer}>
              <Typography variant="subtitle1" gutterBottom>
                The following changes will be applied:
              </Typography>

              {/* {changes.map((change, index) => (
                <Box key={index} className={sliderclasses.diffRow} bgcolor="#e6ffed" p={2} borderRadius={1} mb={1}>
                  <Typography variant="body2" style={{ fontFamily: "monospace" }}>
                    <span style={{ color: "#22863a" }}>
                      + Adding {change.researcher} with {change.accessLevel} access
                    </span>
                  </Typography>
                </Box>
              ))} */}
              {changes.length === 0 ? (
                <Typography variant="body2">No changes to apply</Typography>
              ) : (
                changes.map((change, index) => (
                  <Box
                    key={index}
                    className={sliderclasses.diffRow}
                    bgcolor={change.type === "new" ? "#e6ffed" : change.type === "removed" ? "#ffeef0" : "#f1f8ff"}
                    p={2}
                    borderRadius={1}
                    mb={1}
                  >
                    <Typography variant="body2" style={{ fontFamily: "monospace" }}>
                      {change.type === "new" && (
                        <span style={{ color: "#22863a" }}>
                          + Adding {change.researcher} with {change.accessLevel} access
                        </span>
                      )}
                      {change.type === "modified" && (
                        <span style={{ color: "#0366d6" }}>
                          ~ Changing {change.researcher} access from {change.oldAccessLevel} to {change.newAccessLevel}
                        </span>
                      )}
                      {change.type === "removed" && (
                        <span style={{ color: "#d73a49" }}>
                          - Removing {change.researcher} ({change.accessLevel} access)
                        </span>
                      )}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>

            <Box className={sliderclasses.buttonContainer}>
              <Button className={sliderclasses.button} onClick={() => setConfirmationOpen(false)}>
                {t("Back")}
              </Button>
              <Button className={sliderclasses.submitbutton} onClick={handleConfirmChanges}>
                {t("Confirm")}
              </Button>
            </Box>
          </Box>
        </Slide>
      </Backdrop>
    </React.Fragment>
  )
}
