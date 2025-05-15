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
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { slideStyles } from "./Researcher/ParticipantList/AddButton"
import * as XLSX from "xlsx"
import Papa from "papaparse"

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
    flexDirection: "column",
    gap: theme.spacing(2),
    maxHeight: "70vh",
    overflowY: "auto",
  },
  targetWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    maxHeight: "60vh",
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
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
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
}))

const studCols2NotDownload = ["sensors", "activities", "participants"]

function Download({ studies, target = "studies" }) {
  const classes = useStyles()
  const sliderclasses = slideStyles()

  const [downloadSlider, setDownloadSlider] = useState(false)
  const [selectedStudies, setSelectedStudies] = useState({})
  const [selectedGnames, setSelectedGnames] = useState({})
  const [finalSelectedItems, setFinalSelectedItems] = useState([])
  const [fileFormat, setFileFormat] = useState("json")
  const [nextPage, setNextPage] = useState(false)

  console.log("Logging studies from inside the Download", studies)

  // Initialize selected states when studies prop changes
  useEffect(() => {
    const studySelections = {}
    const gnameSelections = {}

    studies.forEach((study) => {
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

  // New functions for select all and deselect all
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
  }) => {
    console.log("Selected studies:", selectedStudies)
    console.log("Selected groups:", selectedGroups)

    // Initialize selectedItems based on finalSelectedItems
    const [selectedItems, setSelectedItems] = useState(() => {
      const initial = {}
      finalSelectedItems.forEach((item) => {
        initial[item.id] = true
      })
      return initial
    })

    const [filteredItems, setFilteredItems] = useState([])

    useEffect(() => {
      filterItemsBySelection()
    }, [selectedStudies, selectedGroups])

    const filterItemsBySelection = () => {
      let items = []

      // Get all selected studies
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
      setFinalSelectedItems(newFinalSelectedItems)
    }

    // Deselect all items
    const handleDeselectAllItems = () => {
      setSelectedItems({})
      setFinalSelectedItems([])
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

      // Update parent state
      if (!isCurrentlySelected) {
        // Add item
        setFinalSelectedItems((prev) => [...prev, item])
      } else {
        // Remove item
        setFinalSelectedItems((prev) => prev.filter((i) => i.id !== item.id))
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
      <div className={classes.targetWrapper}>
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
      </div>
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
    link.download = `${target}_data.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Function to download data as CSV with proper formatting
  const downloadAsCSV = (data) => {
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

      // Flatten first level properties
      for (const key in item) {
        if (Array.isArray(item[key])) {
          flattened[key] = item[key].join(", ")
        } else if (typeof item[key] === "object" && item[key] !== null) {
          // Handle nested objects by adding them as stringified values
          flattened[key] = JSON.stringify(item[key])
        } else {
          flattened[key] = item[key]
        }
      }

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
    link.download = `${target}_data.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Function to download data as Excel with proper formatting
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

      // Flatten first level properties
      for (const key in item) {
        if (Array.isArray(item[key])) {
          flattened[key] = item[key].join(", ")
        } else if (typeof item[key] === "object" && item[key] !== null) {
          flattened[key] = JSON.stringify(item[key])
        } else {
          flattened[key] = item[key]
        }
      }

      return flattened
    })

    const worksheet = XLSX.utils.json_to_sheet(flattenedData)

    // Set column widths for better formatting
    const columnWidths = []
    for (const key in flattenedData[0] || {}) {
      // Calculate the maximum width needed for this column
      let maxWidth = key.length // Start with header width

      // Check width of all values in this column
      flattenedData.forEach((row) => {
        const valueStr = String(row[key] || "")
        maxWidth = Math.max(maxWidth, Math.min(50, valueStr.length)) // Cap at 50 chars
      })

      columnWidths.push({ wch: maxWidth + 2 }) // Add padding
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

    // Generate Excel file
    XLSX.writeFile(workbook, `${target}_data.xlsx`)
  }

  const handleDownload = () => {
    console.log("Download clicked, items to download:", finalSelectedItems)

    // If target is studies, handle downloading studies
    const dataToDownload =
      target === "studies" ? studies.filter((study) => selectedStudies[study.id]) : finalSelectedItems

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

    setDownloadSlider(false)
    setNextPage(false)
  }

  const showFormatSelector = () => {
    const selectedItemsCount =
      target === "studies" ? Object.values(selectedStudies).filter(Boolean).length : finalSelectedItems.length

    return selectedItemsCount > 0
  }

  return (
    <>
      <DownloadIcon className={classes.actionIcon} onClick={() => setDownloadSlider(true)} />
      <Backdrop
        className={sliderclasses.backdrop}
        open={downloadSlider}
        onClick={() => {
          setDownloadSlider(false)
          setNextPage(false)
          setSelectedStudies({})
          setSelectedGnames({})
        }}
      />
      <Slide direction="left" in={downloadSlider} mountOnEnter unmountOnExit>
        <Box className={sliderclasses.slidePanel}>
          {!nextPage ? (
            <>
              <div className={classes.headerContainer}>
                <Typography variant="h5" component="h1" className={classes.title}>
                  Select studies
                </Typography>
                <div className={classes.selectionButtons}>
                  <Button
                    className={`${classes.actionButton} ${classes.secondaryButton} ${classes.selectAllButton}`}
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    className={`${classes.actionButton} ${classes.secondaryButton} ${classes.selectAllButton}`}
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className={classes.studiesWrapper}>
                {studies.map((study) => (
                  <div key={study.id} className={classes.studyContainer}>
                    <div className={classes.studyHeader}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedStudies[study.id] || false}
                            onChange={() => handleStudySelect(study.id)}
                            color="primary"
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
                              />
                            }
                            label={gname}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {showFormatSelector() && (
                <FormControl component="fieldset" className={classes.formatSelector}>
                  <FormLabel component="legend">Select Download Format</FormLabel>
                  <RadioGroup row value={fileFormat} onChange={handleFormatChange}>
                    <FormControlLabel value="json" control={<Radio color="primary" />} label="JSON" />
                    <FormControlLabel value="csv" control={<Radio color="primary" />} label="CSV" />
                    <FormControlLabel value="excel" control={<Radio color="primary" />} label="Excel" />
                  </RadioGroup>
                </FormControl>
              )}
            </>
          ) : (
            <>
              <SelectTargetComponent
                target={target}
                studies={studies}
                selectedStudies={selectedStudies}
                selectedGroups={selectedGnames}
                finalSelectedItems={finalSelectedItems}
                setFinalSelectedItems={setFinalSelectedItems}
              />

              {finalSelectedItems.length > 0 && (
                <FormControl component="fieldset" className={classes.formatSelector}>
                  <FormLabel component="legend">Select Download Format</FormLabel>
                  <RadioGroup row value={fileFormat} onChange={handleFormatChange}>
                    <FormControlLabel value="json" control={<Radio color="primary" />} label="JSON" />
                    <FormControlLabel value="csv" control={<Radio color="primary" />} label="CSV" />
                    <FormControlLabel value="excel" control={<Radio color="primary" />} label="Excel" />
                  </RadioGroup>
                </FormControl>
              )}
            </>
          )}
          <div className={classes.buttonsContainer}>
            {!nextPage ? (
              <>
                <Button
                  className={`${classes.actionButton} ${classes.secondaryButton}`}
                  onClick={() => {
                    setSelectedStudies({})
                    setSelectedGnames({})
                  }}
                >
                  Clear selection
                </Button>
                {target === "studies" ? (
                  <Button
                    className={`${classes.actionButton} ${classes.primaryButton}`}
                    onClick={handleDownload}
                    disabled={!Object.values(selectedStudies).some(Boolean)}
                  >
                    Download
                  </Button>
                ) : (
                  <Button
                    className={`${classes.actionButton} ${classes.primaryButton}`}
                    onClick={() => setNextPage(true)}
                    disabled={!Object.values(selectedStudies).some(Boolean)}
                  >
                    Next
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  className={`${classes.actionButton} ${classes.secondaryButton}`}
                  onClick={() => setNextPage(false)}
                >
                  Back
                </Button>
                <Button
                  className={`${classes.actionButton} ${classes.primaryButton}`}
                  onClick={handleDownload}
                  disabled={finalSelectedItems.length === 0}
                >
                  Download
                </Button>
              </>
            )}
          </div>
        </Box>
      </Slide>
    </>
  )
}

export default Download
