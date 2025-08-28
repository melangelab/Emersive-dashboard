import React, { useState, useEffect } from "react"
import { ReactComponent as DownloadIcon } from "../icons/NewIcons/progress-download.svg"
import {
  Slide,
  Box,
  Backdrop,
  Checkbox,
  FormControlLabel,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Button,
  TextField,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { slideStyles } from "./Researcher/ParticipantList/AddButton"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { CircularProgress } from "@material-ui/core"
import LAMP from "lamp-core"
import { createPortal } from "react-dom"

const useStyles = makeStyles((theme) => ({
  actionIcon: {
    width: 40,
    height: 40,
    minWidth: 40,
    cursor: "pointer",
    transition: "all 0.3s ease",
    padding: theme.spacing(0.5),
    borderRadius: "25%",
    "& path": {
      fill: "rgba(0, 0, 0, 0.4)",
    },
    "&.active path": {
      fill: "#06B0F0",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      "& path": {
        fill: "#06B0F0",
      },
    },
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  studyContainer: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    border: "1px solid #ddd",
    borderRadius: theme.spacing(1),
  },
  studyHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  gnamesContainer: {
    marginLeft: theme.spacing(4),
  },
  studiesWrapper: {
    display: "flex",
    flexShrink: 0,
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: "column",
    gap: theme.spacing(2),
    minHeight: "10vh",
    maxHeight: "83vh",
    overflowY: "auto",
  },
  targetWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  itemsContainer: {
    display: "flex",
    flexShrink: 0,
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: "column",
    gap: theme.spacing(1),
    minHeight: "10vh",
    maxHeight: "83vh",
    overflowY: "auto",
    padding: theme.spacing(2),
    "& .MuiFormControlLabel-root": {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  formatSelector: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: "8px 0",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  title: {
    margin: 0,
  },
  selectionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  actionButton: {
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(0.5),
    textTransform: "none",
    fontWeight: 500,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
  },
  primaryButton: {
    backgroundColor: "#06B0F0",
    color: "white",
    "&:hover": {
      backgroundColor: "#059bce",
    },
    "&:disabled": {
      backgroundColor: "#a5d9eb",
      color: "#ffffff",
    },
  },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    "&:hover": {
      backgroundColor: "#e5e5e5",
    },
  },
  selectAllButton: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    fontSize: "0.8rem",
    textTransform: "none",
    color: "#06B0F0",
    "&:hover": {
      backgroundColor: "rgba(6, 176, 240, 0.1)",
    },
  },
  optionsContainer: {
    padding: theme.spacing(2),
    "& .MuiFormControl-root": {
      marginBottom: theme.spacing(2),
    },
  },
  dateRangeContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    "& .MuiTextField-root": {
      flex: 1,
    },
  },
  dateField: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
  },
  dateInput: {
    width: "100%",
    "& .MuiInputBase-root": {
      backgroundColor: "#fff",
    },
    "& input": {
      padding: theme.spacing(1),
    },
  },
  dateDisplay: {
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
    fontSize: "0.875rem",
  },
  dateNote: {
    display: "block",
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    fontStyle: "italic",
  },
  downloadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  loadingSpinner: {
    color: "#06B0F0",
  },
  downloadingText: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  backdropFixed: {
    pointerEvents: "none",
  },
  buttonLoadingContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  buttonProgress: {
    color: "white",
    position: "relative",
  },
  errorMessage: {
    color: theme.palette.error.main,
    textAlign: "center",
    margin: theme.spacing(2),
  },
}))

const ParticipantOptionsComponent = ({
  selectedOption,
  setSelectedOption,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  fileFormat,
  handleFormatChange,
}) => {
  const classes = useStyles()

  const formatDate = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <FormControl component="fieldset">
        <FormLabel component="legend">Select Download Option</FormLabel>
        <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
          <FormControlLabel value="onlyParticipants" control={<Radio />} label="Only Participants" />
          <FormControlLabel value="sensorEvents" control={<Radio />} label="Sensor Events" />
          <FormControlLabel value="activityEvents" control={<Radio />} label="Activity Events" />
        </RadioGroup>
      </FormControl>

      {(selectedOption === "sensorEvents" || selectedOption === "activityEvents") && (
        <>
          <div className={classes.dateRangeContainer}>
            <div className={classes.dateField}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate || ""}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className={classes.dateInput}
              />
              {startDate && (
                <Typography variant="caption" className={classes.dateDisplay}>
                  Selected: {formatDate(startDate)}
                </Typography>
              )}
            </div>

            <div className={classes.dateField}>
              <TextField
                label="End Date"
                type="date"
                value={endDate || ""}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className={classes.dateInput}
              />
              {endDate && (
                <Typography variant="caption" className={classes.dateDisplay}>
                  Selected: {formatDate(endDate)}
                </Typography>
              )}
            </div>
          </div>
          <Typography variant="caption" color="textSecondary" className={classes.dateNote}>
            Date range selection is optional. If not selected, all events will be included.
          </Typography>
        </>
      )}
    </>
  )
}

const studCols2NotDownload = ["sensors", "activities", "participants"]

function Download({ studies = null, researchers = null, target = "studies" }) {
  const classes = useStyles()
  const sliderclasses = slideStyles()

  const [downloadSlider, setDownloadSlider] = useState(false)
  const [selectedResearchers, setSelectedResearchers] = useState({})
  const [selectedStudies, setSelectedStudies] = useState({})
  const [selectedGnames, setSelectedGnames] = useState({})
  const [finalSelectedItems, setFinalSelectedItems] = useState([])
  const [fileFormat, setFileFormat] = useState("json")
  const [nextPage, setNextPage] = useState(false)

  const [selectedOption, setSelectedOption] = useState("")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [showOptionsPage, setShowOptionsPage] = useState(false)

  const [downloadLoading, setDownloadLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState(null)

  console.log("Logging studies from inside the Download", studies)

  useEffect(() => {
    return () => {
      setDownloadSlider(false)
      setNextPage(false)
      setShowOptionsPage(false)
      setSelectedStudies({})
      setFinalSelectedItems([])
      setSelectedGnames({})
      setSelectedOption("")
    }
  }, [])

  useEffect(() => {
    const studySelections = {}
    const gnameSelections = {}

    studies?.forEach((study) => {
      studySelections[study.id] = false
      if (study.gname) {
        study.gname.forEach((gname) => {
          gnameSelections[`${study.id}-${gname}`] = false
        })
      }
    })

    setSelectedStudies(studySelections)
    setSelectedGnames(gnameSelections)
  }, [studies])

  const handleResearcherSelect = (researcherId) => {
    const newSelectedResearchers = { ...selectedResearchers }

    newSelectedResearchers[researcherId] = !selectedResearchers[researcherId]

    setSelectedResearchers(newSelectedResearchers)
  }

  useEffect(() => {
    console.log("researchers updated,", selectedResearchers, selectedStudies)
    console.log(
      "Inside the researchers dict and study dict",
      !Object.values(selectedResearchers).includes(true),
      !Object.values(selectedStudies).includes(true),
      target
    )
  }, [selectedResearchers])

  const handleStudySelect = (studyId) => {
    const newSelectedStudies = { ...selectedStudies }
    const newSelectedGnames = { ...selectedGnames }

    newSelectedStudies[studyId] = !selectedStudies[studyId]

    // Select/deselect all gnames in the study
    const study = studies.find((s) => s.id === studyId)
    if (study && study.gname) {
      study.gname.forEach((gname) => {
        newSelectedGnames[`${studyId}-${gname}`] = newSelectedStudies[studyId]
      })
    }

    setSelectedStudies(newSelectedStudies)
    setSelectedGnames(newSelectedGnames)
  }

  const handleGnameSelect = (studyId, gname) => {
    const newSelectedGnames = { ...selectedGnames }
    newSelectedGnames[`${studyId}-${gname}`] = !selectedGnames[`${studyId}-${gname}`]

    // Check if all gnames in the study are selected
    const study = studies.find((s) => s.id === studyId)
    if (study && study.gname) {
      const allGnamesSelected = study.gname.every((g) => newSelectedGnames[`${studyId}-${g}`])
      setSelectedStudies((prev) => ({
        ...prev,
        [studyId]: allGnamesSelected,
      }))
    }

    setSelectedGnames(newSelectedGnames)
  }

  const handleFormatChange = (event) => {
    setFileFormat(event.target.value)
  }

  const handleSelectAll = () => {
    const newSelectedStudies = {}
    const newSelectedGnames = {}

    studies.forEach((study) => {
      newSelectedStudies[study.id] = true
      if (study.gname) {
        study.gname.forEach((gname) => {
          newSelectedGnames[`${study.id}-${gname}`] = true
        })
      }
    })

    setSelectedStudies(newSelectedStudies)
    setSelectedGnames(newSelectedGnames)
  }

  const handleDeselectAll = () => {
    const newSelectedStudies = {}
    const newSelectedGnames = {}

    studies.forEach((study) => {
      newSelectedStudies[study.id] = false
      if (study.gname) {
        study.gname.forEach((gname) => {
          newSelectedGnames[`${study.id}-${gname}`] = false
        })
      }
    })

    setSelectedStudies(newSelectedStudies)
    setSelectedGnames(newSelectedGnames)
  }

  const SelectTargetComponent = ({
    target,
    studies,
    selectedStudies,
    selectedGroups,
    finalSelectedItems,
    setFinalSelectedItems,
    onDownload,
  }) => {
    console.log("Selected studies:", selectedStudies)
    console.log("Selected groups:", selectedGroups)
    console.log("FINAL SELECTED ITEMS,", finalSelectedItems)

    const [downloadLoading, setDownloadLoading] = useState(false)

    const [selectedItems, setSelectedItems] = useState(() => {
      const initial = {}
      finalSelectedItems.forEach((item) => {
        initial[item.id] = true
      })
      console.log("Initial selected items:", initial)
      return initial
    })

    const [filteredItems, setFilteredItems] = useState([])

    useEffect(() => {
      filterItemsBySelection()
    }, [selectedStudies, selectedGroups])

    const filterItemsBySelection = () => {
      let items = []

      const selectedStudyObjects = studies.filter((study) => selectedStudies[study.id])
      console.log("Selected study objects:", selectedStudyObjects)

      selectedStudyObjects.forEach((study) => {
        switch (target) {
          case "sensors":
            const sensors =
              study.sensors?.filter((sensor) => {
                return (
                  !Object.keys(selectedGroups).length || (sensor.group && selectedGroups[`${study.id}-${sensor.group}`])
                )
              }) || []
            items = [...items, ...sensors]
            break

          case "activities":
            const activities =
              study.activities?.filter((activity) => {
                return (
                  !Object.keys(selectedGroups).length ||
                  activity.groups?.some((group) => selectedGroups[`${study.id}-${group}`])
                )
              }) || []
            items = [...items, ...activities]
            break

          case "participants":
            const participants =
              study.participants?.filter((participant) => {
                return (
                  !Object.keys(selectedGroups).length ||
                  participant.group_name?.some((group) => selectedGroups[`${study.id}-${group}`])
                )
              }) || []
            items = [...items, ...participants]
            break
        }
      })

      console.log("Filtered items:", items)

      setFilteredItems(items)
    }

    // Select all items
    const handleSelectAllItems = () => {
      const newSelectedItems = {}
      const newFinalSelectedItems = []

      filteredItems.forEach((item) => {
        newSelectedItems[item.id] = true
        newFinalSelectedItems.push(item)
      })

      setSelectedItems(newSelectedItems)
      // setFinalSelectedItems(newFinalSelectedItems)
    }

    // Deselect all items
    const handleDeselectAllItems = () => {
      setSelectedItems({})
      // setFinalSelectedItems([])
    }

    // Sync selectedItems when finalSelectedItems changes externally
    useEffect(() => {
      const newSelectedItems = {}
      finalSelectedItems.forEach((item) => {
        newSelectedItems[item.id] = true
      })
      setSelectedItems(newSelectedItems)
    }, [finalSelectedItems])

    const handleItemSelect = (item) => {
      const isCurrentlySelected = selectedItems[item.id]

      // Update local state
      setSelectedItems((prev) => ({
        ...prev,
        [item.id]: !isCurrentlySelected,
      }))
    }

    const updateParentState = () => {
      const newFinalSelectedItems = filteredItems.filter((item) => selectedItems[item.id])
      setFinalSelectedItems(newFinalSelectedItems)
    }

    const handleDownloadClick = async () => {
      const updatedFinalSelectedItems = filteredItems.filter((item) => selectedItems[item.id])

      // Update parent state
      setFinalSelectedItems(updatedFinalSelectedItems)
      if (onDownload) {
        await onDownload(updatedFinalSelectedItems) // Pass the items directly
      }
    }

    const getItemDisplay = (item) => {
      switch (target) {
        case "sensors":
          return `${item.name} (${item.spec})`
        case "activities":
          return `${item.name} (${item.spec || "No spec"})`
        case "participants":
          return `${item.firstName} ${item.lastName} (${item.id})`
        default:
          return item.name
      }
    }

    return (
      <>
        <div className={classes.headerContainer}>
          <Typography variant="h5" component="h1" className={classes.title}>
            Select {target}
          </Typography>
          <div className={classes.selectionButtons}>
            <Button
              className={`${classes.actionButton} ${classes.secondaryButton} ${classes.selectAllButton}`}
              onClick={handleSelectAllItems}
              disabled={filteredItems.length === 0}
            >
              Select All
            </Button>
            <Button
              className={`${classes.actionButton} ${classes.secondaryButton} ${classes.selectAllButton}`}
              onClick={handleDeselectAllItems}
              disabled={Object.keys(selectedItems).length === 0}
            >
              Deselect All
            </Button>
          </div>
        </div>
        <div className={classes.itemsContainer}>
          {filteredItems.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={selectedItems[item.id] || false}
                  onChange={() => handleItemSelect(item)}
                  color="primary"
                />
              }
              label={getItemDisplay(item)}
            />
          ))}
          {filteredItems.length === 0 && (
            <Typography variant="body2">No {target} available for the selected studies and groups.</Typography>
          )}
        </div>
        {target !== "participants" ? (
          <>
            {Object.values(selectedItems).includes(true) && (
              <FormControl component="fieldset" className={classes.formatSelector}>
                <FormLabel component="legend">Select Download Format</FormLabel>
                <RadioGroup row value={fileFormat} onChange={handleFormatChange}>
                  <FormControlLabel
                    value="json"
                    control={<Radio color="primary" disabled={downloadLoading} />}
                    label="JSON"
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio color="primary" disabled={downloadLoading} />}
                    label="CSV"
                  />
                  <FormControlLabel
                    value="excel"
                    control={<Radio color="primary" disabled={downloadLoading} />}
                    label="Excel"
                  />
                </RadioGroup>
              </FormControl>
            )}
          </>
        ) : null}
        <div className={classes.buttonsContainer}>
          <Button
            className={`${classes.actionButton} ${classes.secondaryButton}`}
            onClick={() => {
              updateParentState()
              setNextPage(false)
            }}
            disabled={downloadLoading}
          >
            Back
          </Button>
          {target === "participants" ? (
            <Button
              className={`${classes.actionButton} ${classes.primaryButton}`}
              onClick={() => {
                updateParentState()
                setShowOptionsPage(true)
              }}
              disabled={!Object.values(selectedItems).includes(true) || downloadLoading}
            >
              Next
            </Button>
          ) : (
            <Button
              className={`${classes.actionButton} ${classes.primaryButton}`}
              onClick={handleDownloadClick}
              disabled={!Object.values(selectedItems).includes(true) || downloadLoading}
            >
              {downloadLoading ? (
                <div className={classes.buttonLoadingContainer}>
                  <CircularProgress size={20} className={classes.buttonProgress} />
                  <span>Downloading...</span>
                </div>
              ) : (
                "Download"
              )}
            </Button>
          )}
        </div>
      </>
    )
  }

  // Function to download data as JSON
  const downloadAsJSON = (data) => {
    // If downloading studies, filter out the fields that should not be downloaded
    if (target === "studies") {
      data = data.map((study) => {
        const filteredStudy = { ...study }
        studCols2NotDownload.forEach((field) => {
          delete filteredStudy[field]
        })
        return filteredStudy
      })
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    if (target === "participants") {
      if (selectedOption === "sensorEvents") {
        link.download = `emersive_participants_sensor_events_data.json`
      } else if (selectedOption === "activityEvents") {
        link.download = `emersive_participants_activity_events_data.json`
      } else {
        link.download = `emersive_participants_data.json`
      }
    } else {
      link.download = `emersive_${target}_data.json`
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Function to download data as CSV with proper formatting
  const downloadAsCSV = (data) => {
    console.log("Data to download as CSV:", data)
    // If downloading studies, filter out the fields that should not be downloaded
    if (target === "studies") {
      data = data.map((study) => {
        const filteredStudy = { ...study }
        studCols2NotDownload.forEach((field) => {
          delete filteredStudy[field]
        })
        return filteredStudy
      })
    }

    const flattenedData = data.map((item) => {
      const flattened = {}
      console.log("FLATTENED data before", item)

      // Flatten first level properties
      for (const key in item) {
        if (Array.isArray(item[key])) {
          // Handle arrays - stringify the entire array instead of joining
          flattened[key] = JSON.stringify(item[key])
        } else if (typeof item[key] === "object" && item[key] !== null) {
          // Handle nested objects by adding them as stringified values
          flattened[key] = JSON.stringify(item[key])
        } else {
          // Handle primitive values - no need to stringify primitives for CSV
          flattened[key] = item[key]
        }
      }

      console.log("FLATTENED DATA after", flattened)
      return flattened
    })

    // Configure Papa parse with better formatting options
    const csv = Papa.unparse(flattenedData, {
      delimiter: ",",
      header: true,
      quotes: true, // Ensures all fields are quoted for better formatting
      quoteChar: '"',
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    if (target === "participants") {
      if (selectedOption === "sensorEvents") {
        link.download = `emersive_participants_sensor_events_data.csv`
      } else if (selectedOption === "activityEvents") {
        link.download = `emersive_participants_activity_events_data.csv`
      } else {
        link.download = `emersive_participants_data.csv`
      }
    } else {
      link.download = `emersive_${target}_data.csv`
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadAsExcel = (data) => {
    // If downloading studies, filter out the fields that should not be downloaded
    if (target === "studies") {
      data = data.map((study) => {
        const filteredStudy = { ...study }
        studCols2NotDownload.forEach((field) => {
          delete filteredStudy[field]
        })
        return filteredStudy
      })
    }

    // First, flatten the data to handle nested objects
    const flattenedData = data.map((item) => {
      const flattened = {}
      console.log("FLATTENED data before", item)

      // Flatten first level properties
      for (const key in item) {
        if (Array.isArray(item[key])) {
          // Handle arrays - stringify the entire array instead of joining
          flattened[key] = JSON.stringify(item[key])
        } else if (typeof item[key] === "object" && item[key] !== null) {
          // Handle nested objects by adding them as stringified values
          flattened[key] = JSON.stringify(item[key])
        } else {
          // Handle primitive values - no need to stringify primitives for CSV
          flattened[key] = item[key]
        }
      }

      console.log("FLATTENED DATA after", flattened)
      return flattened
    })

    // Create worksheet with chunked data to avoid Excel's limits
    const worksheet = XLSX.utils.json_to_sheet(flattenedData)

    // Set column widths for better formatting
    const columnWidths = []
    for (const key in flattenedData[0] || {}) {
      // Set a reasonable default column width (don't try to match content exactly)
      columnWidths.push({ wch: 30 }) // Fixed width for all columns
    }

    // Apply column widths
    worksheet["!cols"] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, target)

    // Set cell wrapping for better readability
    if (worksheet["!ref"]) {
      const range = XLSX.utils.decode_range(worksheet["!ref"])
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!worksheet[cellAddress]) continue

          // Add styling to each cell
          worksheet[cellAddress].s = {
            alignment: {
              wrapText: true,
              vertical: "top",
            },
          }
        }
      }
    }

    let fileName = ""

    if (target === "participants") {
      if (selectedOption === "sensorEvents") {
        fileName = `emersive_participants_sensor_events_data.xlsx`
      } else if (selectedOption === "activityEvents") {
        fileName = `emersive_participants_activity_events_data.xlsx`
      } else {
        fileName = `emersive_participants_data.xlsx`
      }
    } else {
      fileName = `emersive_${target}_data.xlsx`
    }

    // Generate Excel file
    XLSX.writeFile(workbook, fileName)
  }

  const fetchSensorEvents = async (items = null) => {
    const participantsToUse = items || finalSelectedItems
    const participantsId = participantsToUse.map((item) => item.id)

    // Build sensorSpecs from selectedStudyObjects
    const selectedStudyObjects = studies.filter((study) => selectedStudies[study.id])
    console.log("Selected study objects:", selectedStudyObjects)

    let sensorSpecsSet = new Set()
    selectedStudyObjects.forEach((study) => {
      const sensors =
        study.sensors?.filter((sensor) => {
          return !Object.keys(selectedGnames).length || (sensor.group && selectedGnames[`${study.id}-${sensor.group}`])
        }) || []

      sensors.forEach((sensor) => {
        if (sensor.spec) {
          sensorSpecsSet.add(sensor.spec)
        }
      })
    })

    const sensorSpecs = Array.from(sensorSpecsSet)

    if (participantsId.length === 0 || sensorSpecs.length === 0) {
      alert("Please select at least one participant and one sensor type")
      return
    }

    try {
      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

      // Build the query parameters
      const params = new URLSearchParams()
      params.append("participant_ids", participantsId.join(","))
      params.append("sensors", sensorSpecs.join(","))
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)

      console.log("PARAMS sens", participantsId, sensorSpecs, startDate, endDate, params.toString())

      const response = await fetch(`${baseURL}/participant-sensor-events?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(authString),
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      const mainData = data.data
      console.log("Fetched sensor events data:", mainData)
      // setFetchedData(mainData) // Set the fetched data here
      return mainData
    } catch (err) {
      console.error("Error fetching sensor events:", err)
      alert(`Failed to fetch sensor data: ${err.message}`)
    } finally {
      // setLoading(false)
    }
  }

  const fetchActivityEvents = async (items = null) => {
    // Use passed items or fall back to state
    const participantsToUse = items || finalSelectedItems
    console.log("Participants to use", participantsToUse)
    const participantsId = participantsToUse.map((item) => item.id)

    const selectedStudyObjects = studies.filter((study) => selectedStudies[study.id])

    let activitiesId2Fetch = []
    selectedStudyObjects.forEach((study) => {
      const activities =
        study.activities?.filter((activity) => {
          return (
            !Object.keys(selectedGnames).length ||
            (activity.groups.length > 0 && activity.groups.some((group) => selectedGnames[`${study.id}-${group}`]))
          )
        }) || []

      activities.forEach((activity) => {
        if (activity.id) {
          activitiesId2Fetch.push(activity.id)
        }
      })
    })

    if (participantsId.length === 0 || activitiesId2Fetch.length === 0) {
      alert("Please select at least one participant and one activity")
      return
    }

    try {
      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

      // Build the query parameters
      const params = new URLSearchParams()
      params.append("participant_ids", participantsId.join(","))
      params.append("activities", activitiesId2Fetch.join(","))
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)

      console.log("PARAMS", participantsId, activitiesId2Fetch, startDate, endDate, params.toString())

      const response = await fetch(`${baseURL}/participant-activity-events?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(authString),
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      const mainData = data.data
      console.log("Fetched sensor events data:", mainData)
      // setFetchedData(mainData) // Set the fetched data here
      return mainData
    } catch (err) {
      console.error("Error fetching sensor events:", err)
      alert(`Failed to fetch sensor data: ${err.message}`)
    } finally {
      // setLoading(false)
    }
  }

  const handleDownload = async (items = null) => {
    const itemsToUse = items || finalSelectedItems

    if (target === "participants") {
      let dataToDownload = itemsToUse

      try {
        setDownloadLoading(true)

        switch (selectedOption) {
          case "onlyParticipants":
            dataToDownload = itemsToUse
            break

          case "sensorEvents":
            dataToDownload = await fetchSensorEvents(itemsToUse) // Wait for the data
            break

          case "activityEvents":
            console.log("ITEMS to use and items", itemsToUse, items, finalSelectedItems)
            dataToDownload = await fetchActivityEvents(itemsToUse)
            break

          default:
            console.error("Invalid option selected")
            return
        }

        // Verify we have data before proceeding
        if (!dataToDownload) {
          throw new Error("No data available for download")
        }

        // Download the appropriate data
        switch (fileFormat) {
          case "json":
            downloadAsJSON(dataToDownload)
            break
          case "csv":
            downloadAsCSV(dataToDownload)
            break
          case "excel":
            downloadAsExcel(dataToDownload)
            break
          default:
            console.error("Invalid file format selected")
        }
      } catch (error) {
        console.error("Error during download:", error)
        alert("An error occurred during download: " + error.message)
      } finally {
        setDownloadLoading(false)
        setDownloadSlider(false)
        setNextPage(false)
        setShowOptionsPage(false)
        setSelectedOption("")
        setFetchedData(null)
        setSelectedGnames({})
        setSelectedStudies({})
        setFinalSelectedItems([])
        setStartDate(null)
        setEndDate(null)
        setFileFormat("json")
      }
      return
    }

    const dataToDownload =
      target === "studies"
        ? studies.filter((study) => selectedStudies[study.id])
        : target === "researchers"
        ? researchers.filter((researcher) => selectedResearchers[researcher.id])
        : itemsToUse

    console.log("Data to download:", dataToDownload)

    switch (fileFormat) {
      case "json":
        downloadAsJSON(dataToDownload)
        break
      case "csv":
        downloadAsCSV(dataToDownload)
        break
      case "excel":
        downloadAsExcel(dataToDownload)
        break
      default:
        console.error("Invalid file format selected")
    }

    setDownloadLoading(false)
    setDownloadSlider(false)
    setNextPage(false)
    setShowOptionsPage(false)
    setSelectedOption("")
    setFetchedData(null)
    setSelectedGnames({})
    setSelectedStudies({})
    setFinalSelectedItems([])
    setStartDate(null)
    setEndDate(null)
    setFileFormat("json")
    setSelectedResearchers({})
  }

  const showFormatSelector = () => {
    const selectedItemsCount =
      target === "studies" ? Object.values(selectedStudies).filter(Boolean).length : finalSelectedItems.length

    return selectedItemsCount > 0
  }

  const resetDownloadState = () => {
    setDownloadSlider(false)
    setNextPage(false)
    setShowOptionsPage(false)
    setSelectedOption("")
    setFetchedData(null)
    setSelectedGnames({})
    setSelectedStudies({})
    setFinalSelectedItems([])
    setStartDate(null)
    setEndDate(null)
    setSelectedResearchers({})
    setFileFormat("json")
  }

  // 6. Add function to reset all states including selected items
  const resetAllStates = () => {
    resetDownloadState()
    // Force re-initialization of selection states
    const studySelections = {}
    const gnameSelections = {}
    studies?.forEach((study) => {
      studySelections[study.id] = false
      if (study.gname) {
        study.gname.forEach((gname) => {
          gnameSelections[`${study.id}-${gname}`] = false
        })
      }
    })
    setSelectedStudies(studySelections)
    setSelectedGnames(gnameSelections)
  }

  const handleBackdropClick = () => {
    if (!downloadLoading) {
      resetAllStates()
    }
  }

  return (
    <>
      <DownloadIcon className={`download-icon `} onClick={() => setDownloadSlider(true)} />
      {createPortal(
        <>
          <Backdrop
            className={`${sliderclasses.backdrop} ${downloadLoading ? classes.backdropFixed : ""}`}
            open={downloadSlider}
            onClick={handleBackdropClick}
          />
          <Slide direction="left" in={downloadSlider} mountOnEnter unmountOnExit>
            <Box className={sliderclasses.slidePanel}>
              {downloadLoading && (
                <div className={classes.downloadingOverlay}>
                  <CircularProgress className={classes.loadingSpinner} />
                  <Typography variant="h6" className={classes.downloadingText}>
                    Preparing your download...
                  </Typography>
                  <Typography variant="body2" className={classes.downloadingText}>
                    Please wait while we process your request
                  </Typography>
                </div>
              )}
              {!nextPage ? (
                <>
                  <div className={classes.headerContainer}>
                    <Typography variant="h6" component="h1" className={classes.title}>
                      Select {studies ? "Studies" : "Researchers"}
                    </Typography>
                    <div className={classes.selectionButtons}>
                      <Button
                        className={`${classes.actionButton} ${classes.secondaryButton} ${classes.selectAllButton}`}
                        onClick={handleSelectAll}
                        disabled={downloadLoading}
                      >
                        Select All
                      </Button>
                      <Button
                        className={`${classes.actionButton} ${classes.secondaryButton} ${classes.selectAllButton}`}
                        onClick={handleDeselectAll}
                        disabled={downloadLoading}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className={classes.studiesWrapper}>
                    {studies ? (
                      <>
                        {studies.map((study) => (
                          <div key={study.id} className={classes.studyContainer}>
                            <div className={classes.studyHeader}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedStudies[study.id] || false}
                                    onChange={() => handleStudySelect(study.id)}
                                    color="primary"
                                    disabled={downloadLoading}
                                  />
                                }
                                label={`${study.name} (ID: ${study.id})`}
                              />
                            </div>
                            {study.gname && study.gname.length > 0 && (
                              <div className={classes.gnamesContainer}>
                                {study.gname.map((gname) => (
                                  <FormControlLabel
                                    key={`${study.id}-${gname}`}
                                    control={
                                      <Checkbox
                                        checked={selectedGnames[`${study.id}-${gname}`] || false}
                                        onChange={() => handleGnameSelect(study.id, gname)}
                                        color="primary"
                                        disabled={downloadLoading}
                                      />
                                    }
                                    label={gname}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {researchers.map((researcher) => (
                          <div key={researcher.id} className={classes.studyContainer}>
                            <div className={classes.studyHeader}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedResearchers[researcher.id] || false}
                                    onChange={() => handleResearcherSelect(researcher.id)}
                                    color="primary"
                                    disabled={downloadLoading}
                                  />
                                }
                                label={`${researcher.firstName} ${researcher.lastName} (Username: ${researcher.username}, ID: ${researcher.id})`}
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  {["studies", "researchers"].includes(target) ? (
                    <FormControl component="fieldset" className={classes.formatSelector}>
                      <FormLabel component="legend">Select Download Format</FormLabel>
                      <RadioGroup row value={fileFormat} onChange={handleFormatChange}>
                        <FormControlLabel
                          value="json"
                          control={<Radio color="primary" disabled={downloadLoading} />}
                          label="JSON"
                        />
                        <FormControlLabel
                          value="csv"
                          control={<Radio color="primary" disabled={downloadLoading} />}
                          label="CSV"
                        />
                        <FormControlLabel
                          value="excel"
                          control={<Radio color="primary" disabled={downloadLoading} />}
                          label="Excel"
                        />
                      </RadioGroup>
                    </FormControl>
                  ) : null}
                  <div className={classes.buttonsContainer}>
                    <Button
                      className={`${classes.actionButton} ${classes.secondaryButton}`}
                      onClick={() => {
                        setSelectedStudies({})
                        setSelectedGnames({})
                      }}
                      disabled={downloadLoading}
                    >
                      Clear selection
                    </Button>
                    {["studies", "researchers"].includes(target) ? (
                      <Button
                        className={`${classes.actionButton} ${classes.primaryButton}`}
                        onClick={async () => await handleDownload()}
                        disabled={
                          target === "studies"
                            ? !Object.values(selectedStudies).includes(true) || downloadLoading
                            : target === "researchers"
                            ? !Object.values(selectedResearchers).includes(true) || downloadLoading
                            : false
                        }
                      >
                        {downloadLoading ? (
                          <div className={classes.buttonLoadingContainer}>
                            <CircularProgress size={20} className={classes.buttonProgress} />
                            <span>Downloading...</span>
                          </div>
                        ) : (
                          "Download"
                        )}
                      </Button>
                    ) : (
                      <Button
                        className={`${classes.actionButton} ${classes.primaryButton}`}
                        onClick={() => setNextPage(true)}
                        disabled={!Object.values(selectedStudies).some(Boolean) || downloadLoading}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </>
              ) : target === "participants" ? (
                !showOptionsPage ? (
                  <>
                    <SelectTargetComponent
                      target={target}
                      studies={studies}
                      selectedStudies={selectedStudies}
                      selectedGroups={selectedGnames}
                      finalSelectedItems={finalSelectedItems}
                      setFinalSelectedItems={setFinalSelectedItems}
                      onDownload={handleDownload}
                    />
                  </>
                ) : (
                  <>
                    <div className={classes.headerContainer}>
                      <Typography variant="h5" component="h1" className={classes.title}>
                        Select Download Option
                      </Typography>
                    </div>
                    <div className={classes.itemsContainer}>
                      <ParticipantOptionsComponent
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        fileFormat={fileFormat}
                        handleFormatChange={handleFormatChange}
                      />
                      <FormControl component="fieldset" className={classes.formatSelector}>
                        <FormLabel component="legend">Select Download Format</FormLabel>
                        <RadioGroup row value={fileFormat} onChange={handleFormatChange}>
                          <FormControlLabel
                            value="json"
                            control={<Radio color="primary" disabled={downloadLoading} />}
                            label="JSON"
                          />
                          <FormControlLabel
                            value="csv"
                            control={<Radio color="primary" disabled={downloadLoading} />}
                            label="CSV"
                          />
                          <FormControlLabel
                            value="excel"
                            control={<Radio color="primary" disabled={downloadLoading} />}
                            label="Excel"
                          />
                        </RadioGroup>
                      </FormControl>
                    </div>
                    <div className={classes.buttonsContainer}>
                      <Button
                        className={`${classes.actionButton} ${classes.secondaryButton}`}
                        onClick={() => setShowOptionsPage(false)}
                        disabled={downloadLoading}
                      >
                        Back
                      </Button>
                      <Button
                        className={`${classes.actionButton} ${classes.primaryButton}`}
                        onClick={async () => await handleDownload()}
                        disabled={!selectedOption || downloadLoading}
                      >
                        {downloadLoading ? (
                          <div className={classes.buttonLoadingContainer}>
                            <CircularProgress size={20} className={classes.buttonProgress} />
                            <span>Downloading...</span>
                          </div>
                        ) : (
                          "Download"
                        )}
                      </Button>
                    </div>
                  </>
                )
              ) : ["activities", "sensors"].includes(target) ? (
                <>
                  <SelectTargetComponent
                    target={target}
                    studies={studies}
                    selectedStudies={selectedStudies}
                    selectedGroups={selectedGnames}
                    finalSelectedItems={finalSelectedItems}
                    setFinalSelectedItems={setFinalSelectedItems}
                    onDownload={handleDownload}
                  />
                </>
              ) : null}
            </Box>
          </Slide>
        </>,
        document.body
      )}
    </>
  )
}

export default Download
