import React, { useEffect, useRef, useState } from "react"
import {
  Box,
  Button,
  Avatar,
  Popover,
  Fab,
  Typography,
  Icon,
  MenuItem,
  makeStyles,
  Theme,
  createStyles,
  DialogContent,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Menu,
  colors,
  IconButton,
  useMediaQuery,
  useTheme,
  Checkbox,
  ListItemText,
  Backdrop,
  Slide,
  Divider,
  FormControl,
  InputLabel,
  Select,
  ListSubheader,
  FormControlLabel,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import PatientStudyCreator from "../ParticipantList/PatientStudyCreator"
import SearchBox from "../../SearchBox"
import StudyCreator from "../ParticipantList/StudyCreator"
import StudyGroupCreator from "./StudyGroupCreator"
import { CredentialManager } from "../../CredentialManager"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { ReactComponent as Logo } from "../../../icons/Logo.svg"
import { useLayoutStyles } from "../../GlobalStyles"
import { ReactComponent as RefreshIcon } from "../../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import { ReactComponent as GridViewIcon } from "../../../icons/NewIcons/objects-column.svg"
import { ReactComponent as TableViewIcon } from "../../../icons/NewIcons/table-list.svg"
import { ReactComponent as GridViewFilledIcon } from "../../../icons/NewIcons/objects-column-filled.svg"
import { ReactComponent as TableViewFilledIcon } from "../../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as ColumnsIcon } from "../../../icons/NewIcons/columns-3.svg"
import { ReactComponent as FilterIcon } from "../../../icons/NewIcons/filters.svg"
import { ReactComponent as FilterFilledIcon } from "../../../icons/NewIcons/filters-filled.svg"
import { ReactComponent as PrintIcon } from "../../../icons/NewIcons/print.svg"
import { ReactComponent as DownloadIcon } from "../../../icons/NewIcons/progress-download.svg"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { spliceActivity, spliceCTActivity } from "../ActivityList/ActivityMethods"
import { useSnackbar } from "notistack"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import { DatePicker } from "@material-ui/pickers/DatePicker/DatePicker"

function Profile({ title, authType }) {
  return (
    <div>
      <Typography variant="body1" className="name">
        {title || "Name"}
      </Typography>
      <Typography variant="body2" className="role">
        {authType || "Role"}
      </Typography>
    </div>
  )
}
interface StudyData {
  id: string
  name: string
  participants: string[]
  activities: string[]
  sensors: string[]
}

interface DownloadSelection {
  studyId: string
  items: {
    participants: string[]
    activities: string[]
    sensors: string[]
  }
}
interface AttachmentResponse {
  data?: any
  error?: any
}
interface DownloadState {
  anchor: null | HTMLElement | SVGElement
  selectedStudies: DownloadSelection[]
  includeEvents: boolean
  format: "json" | "csv" | "excel" | "pdf"
  dateRange: {
    startDate: Date | null
    endDate: Date | null
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // header: {
    //   "& h5": {
    //     fontSize: "30px",
    //     fontWeight: "bold",
    //   },
    // },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(2, 3),
      backgroundColor: "#fff",
      borderRadius: 20,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
      marginTop: theme.spacing(2),
      width: "100%",
      minHeight: 75,
      "& h5": {
        fontSize: 25,
        fontWeight: 600,
        color: "rgba(0, 0, 0, 0.75)",
      },
    },
    titleSection: {
      display: "flex",
      alignItems: "center",
      "& h5": {
        marginLeft: theme.spacing(2),
      },
    },
    actionGroup: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },
    searchButton: {
      padding: 8,
      backgroundColor: "#fff",
      border: "1px solid #dadce0",
      borderRadius: 20,
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    filterButton: {
      backgroundColor: "#f1f3f4",
      color: "#5f6368",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#e8eaed",
      },
    },
    filterButtonCompact: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "60px", // Ensures enough space for the icon
      height: "40px", // Ensures proper button height
      padding: "8px", // Avoids excessive shrinking
      boxSizing: "border-box", // Ensures padding doesn’t affect width
    },
    addbutton: {
      backgroundColor: "#4285f4",
      color: "#fff",
      padding: "8px 24px",
      borderRadius: 20,
      textTransform: "none",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "#3367d6",
      },
    },
    addButtonCompact: {
      width: theme.spacing(5), // Ensures some width
      height: theme.spacing(5),
      flexShrink: 0,
      minWidth: "unset",
      fontSize: "1.5rem",

      // boxSizing: "content-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    profileSection: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      borderRadius: 20,
      padding: "4px 0px",
      display: "flex",
      alignItems: "center",
      // marginLeft: theme.spacing(2),
    },
    avatar: {
      width: 36,
      height: 36,
      // marginRight: theme.spacing(1),
    },
    profileInfo: {
      display: "flex",
      flexDirection: "column",
      "& .name": {
        color: theme.palette.text.primary,
        fontWeight: 500,
      },
      "& .role": {
        color: theme.palette.text.secondary,
        fontSize: "0.875rem",
      },
    },
    customPaper: {
      maxWidth: 380,
      maxHeight: 600,
      marginTop: 25,
      minWidth: 320,
      marginLeft: 15,
      borderRadius: 10,
      padding: "10px 0",
      "& h6": { fontSize: 16, fontWeight: 600 },
      "& li": {
        display: "inline-block",
        width: "100%",
        padding: "15px 30px",
        fontSize: 16,
        "&:hover": { backgroundColor: "#ECF4FF" },
      },
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
    customPopover: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
    // customPaper: {
    //   maxWidth: 380,
    //   marginTop: 75,
    //   marginLeft: 100,
    //   borderRadius: 10,
    //   padding: "10px 0",
    //   "& h6": { fontSize: 16 },
    //   "& li": {
    //     display: "inline-block",
    //     width: "100%",
    //     padding: "15px 30px",
    //     "&:hover": { backgroundColor: "#ECF4FF" },
    //   },
    //   "& *": { cursor: "pointer" },
    // },
    popexpand: {
      backgroundColor: "#fff",
      color: "#618EF7",
      zIndex: 11111,
      "& path": { fill: "#618EF7" },
      "&:hover": { backgroundColor: "#f3f3f3" },
    },
    addText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
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
    logo: {
      width: theme.spacing(5), // Scales dynamically (5 * 8px = 40px)
      height: theme.spacing(5),
      borderRadius: "50%",
      marginLeft: "4px",
    },
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
    addButton: {
      backgroundColor: "#4CAF50",
      padding: theme.spacing(1),
      borderRadius: "40%",
      width: 40,
      height: 40,
      minWidth: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      "& path": {
        fill: "#FFFFFF",
      },
      "&:hover": {
        backgroundColor: "#45a049",
      },
    },
  })
)
function convertToCSV(data: any[]): string {
  if (!data.length) return ""
  const headers = Object.keys(data[0])
  const rows = data.map((obj) => headers.map((header) => JSON.stringify(obj[header])).join(","))
  return [headers.join(","), ...rows].join("\n")
}

async function convertToExcel(data: any[]): Promise<Blob> {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data")
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

async function convertToPDF(data: any[]): Promise<Blob> {
  const doc = new jsPDF()
  doc.text(JSON.stringify(data, null, 2), 10, 10)
  return doc.output("blob")
}

export default function Header({
  studies,
  researcherId,
  searchData,
  setParticipants,
  newStudyObj,
  updatedDataStudy,
  refreshStudies,
  ...props
}) {
  const classes = useStyles()
  const sliderclasses = slideStyles()
  const { t } = useTranslation()
  const [popover, setPopover] = useState(null)
  const [addParticipantStudy, setAddParticipantStudy] = useState(false)
  const [addGroup, setAddGroup] = useState(false)
  const [addStudy, setAddStudy] = useState(false)
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordChange, setPasswordChange] = useState(false)
  const headerclasses = useHeaderStyles()
  const layoutClasses = useLayoutStyles()
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement | SVGElement>(null)
  const handleNewStudyData = (data) => {
    setParticipants()
    newStudyObj(data)
    updatedDataStudy(data)
  }
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const roles = ["Administrator", "User Administrator", "Practice Lead"]
  const [slideOpen, setSlideOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<"none" | "study" | "group" | "participant">("none")
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  // const handleClosePopUp = (data) => {
  //   if (data === 1) {
  //     setAddParticipantStudy(false)
  //   } else if (data === 2) {
  //     setAddStudy(false)
  //   } else {
  //     setAddGroup(false)
  //   }
  // }
  const handleClosePopUp = (data) => {
    if (activeModal === "none") {
      setSlideOpen(false)
    }
    if (data === 1) {
      setAddParticipantStudy(false)
      setActiveModal("none")
    } else if (data === 2) {
      setAddStudy(false)
      setActiveModal("none")
    } else {
      setAddGroup(false)
      setActiveModal("none")
    }
  }

  const handleSlideOpen = (type: "study" | "group" | "participant") => {
    setSlideOpen(true)
    setActiveModal(type)

    switch (type) {
      case "study":
        setAddStudy(true)
        break
      case "group":
        setAddGroup(true)
        break
      case "participant":
        setAddParticipantStudy(true)
        break
    }
    console.log("handleSlideOpen - clicked with", type)
  }
  const handleBackdropClick = () => {
    if (activeModal === "none") {
      setSlideOpen(false)
    }
  }

  const [downloadState, setDownloadState] = useState<DownloadState>({
    anchor: null,
    selectedStudies: [],
    includeEvents: false,
    format: "json",
    dateRange: {
      startDate: null,
      endDate: null,
    },
  })

  const [studiesData, setStudiesData] = useState<StudyData[]>([])

  useEffect(() => {
    const fetchStudiesData = async () => {
      try {
        const studies = (await Service.getAll("studies")) || []
        const enrichedStudies = await Promise.all(
          studies.map(async (study) => {
            const participants = await LAMP.Participant.allByStudy(study.id)
            const activities = await LAMP.Activity.allByStudy(study.id)
            const sensors = await LAMP.Sensor.allByStudy(study.id)

            return {
              id: study.id,
              name: study.name,
              participants: participants.map((p) => p.id),
              activities: activities.map((a) => a.id),
              sensors: sensors.map((s) => s.id),
            }
          })
        )
        setStudiesData(enrichedStudies)
      } catch (error) {
        console.error("Error fetching studies data:", error)
        enqueueSnackbar(t("Failed to load studies data"), { variant: "error" })
      }
    }
    fetchStudiesData()
  }, [])

  const downloadData = async () => {
    try {
      const { selectedStudies, includeEvents, format, dateRange } = downloadState
      let allData: any[] = []

      // Process each selected study
      for (const selection of selectedStudies) {
        const study = studiesData.find((s) => s.id === selection.studyId)
        if (!study) continue

        // Gather participants data
        if (selection.items.participants.length > 0) {
          const participantsData = await Promise.all(
            selection.items.participants.map(async (participantId) => {
              const participant = await LAMP.Participant.view(participantId)
              let data = { ...participant, study_name: study.name, activity_events: [], sensor_events: [] }

              // Include events if requested
              if (includeEvents) {
                const query =
                  dateRange.startDate && dateRange.endDate
                    ? `?start=${dateRange.startDate.toISOString()}&end=${dateRange.endDate.toISOString()}`
                    : ""

                const [activityEvents, sensorEvents] = await Promise.all([
                  LAMP.ActivityEvent.allByParticipant(participantId + query),
                  LAMP.SensorEvent.allByParticipant(participantId + query),
                ])

                data.activity_events = activityEvents
                data.sensor_events = sensorEvents
              }

              return data
            })
          )
          allData.push(...participantsData)
        }

        // Gather activities data
        if (selection.items.activities.length > 0) {
          const activitiesData = await Promise.all(
            selection.items.activities.map(async (activityId) => {
              const activity = await LAMP.Activity.view(activityId)

              // Get activity details based on type
              if (activity.spec === "lamp.survey") {
                try {
                  const res = (await LAMP.Type.getAttachment(
                    activityId,
                    "lamp.dashboard.survey_description"
                  )) as AttachmentResponse

                  return spliceActivity({
                    raw: { ...activity, study_name: study.name },
                    tag: res?.error ? undefined : res?.data,
                  })
                } catch (e) {
                  console.error(`Error fetching survey details for ${activityId}:`, e)
                  return { ...activity, study_name: study.name }
                }
              } else if (!["lamp.survey"].includes(activity.spec)) {
                try {
                  const res = (await LAMP.Type.getAttachment(
                    activityId,
                    "emersive.activity.details"
                  )) as AttachmentResponse

                  return spliceCTActivity({
                    raw: { ...activity, study_name: study.name },
                    tag: res?.error ? undefined : res?.data,
                  })
                } catch (e) {
                  console.error(`Error fetching activity details for ${activityId}:`, e)
                  return { ...activity, study_name: study.name }
                }
              }
              return { ...activity, study_name: study.name }
            })
          )
          allData.push(...activitiesData)
        }

        // Gather sensors data
        if (selection.items.sensors.length > 0) {
          const sensorsData = await Promise.all(
            selection.items.sensors.map(async (sensorId) => {
              const sensor = await LAMP.Sensor.view(sensorId)
              return { ...sensor, study_name: study.name }
            })
          )
          allData.push(...sensorsData)
        }
      }

      // Format and download the data
      let content: any
      let fileName = `lamp_export_${new Date().toISOString().split("T")[0]}`

      switch (format) {
        case "json":
          content = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" })
          fileName += ".json"
          break

        case "csv":
          content = new Blob([convertToCSV(allData)], { type: "text/csv" })
          fileName += ".csv"
          break

        case "excel":
          content = await convertToExcel(allData)
          fileName += ".xlsx"
          break

        case "pdf":
          content = await convertToPDF(allData)
          fileName += ".pdf"
          break
      }

      // Trigger download
      saveAs(content, fileName)

      enqueueSnackbar(t("Data exported successfully"), { variant: "success" })
      setDownloadState({ ...downloadState, anchor: null }) // Close menu
    } catch (error) {
      console.error("Download failed:", error)
      enqueueSnackbar(t("Failed to export data"), { variant: "error" })
    }
  }
  const convertToCSV = (data: any[]): string => {
    if (!data.length) return ""

    // Get all possible headers from all objects
    const headers = Array.from(new Set(data.reduce((acc, obj) => [...acc, ...Object.keys(obj)], [] as string[])))

    // Create CSV rows
    const rows = data.map((obj) =>
      headers
        .map((header) => {
          // Use type assertion to tell TypeScript that header is a valid key
          const value = obj[header as keyof typeof obj]
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value).replace(/"/g, '""')
          }
          return value === null || value === undefined ? "" : String(value)
        })
        .join(",")
    )

    return [headers.join(","), ...rows].join("\n")
  }

  const convertToExcel = async (data: any[]): Promise<Blob> => {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => {
        // Process each item to ensure proper Excel formatting
        const processedItem = { ...item }
        Object.keys(processedItem).forEach((key) => {
          if (typeof processedItem[key] === "object" && processedItem[key] !== null) {
            processedItem[key] = JSON.stringify(processedItem[key])
          }
        })
        return processedItem
      })
    )

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "LAMP Data")

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    return new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }

  const convertToPDF = async (data: any[]): Promise<Blob> => {
    const doc = new jsPDF()

    // Configure PDF settings
    doc.setFontSize(10)
    let yPos = 10

    // Add title
    doc.setFontSize(16)
    doc.text("LAMP Data Export", 10, yPos)
    yPos += 10
    doc.setFontSize(10)

    // Add export date
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, yPos)
    yPos += 10

    // Process each item
    data.forEach((item, index) => {
      // Add page break if needed
      if (yPos > 280) {
        doc.addPage()
        yPos = 10
      }

      // Add item header
      doc.setFontSize(12)
      doc.text(`Item ${index + 1}:`, 10, yPos)
      yPos += 7
      doc.setFontSize(10)

      // Add item data
      Object.entries(item).forEach(([key, value]) => {
        // Add page break if needed
        if (yPos > 280) {
          doc.addPage()
          yPos = 10
        }

        let displayValue = value
        if (typeof value === "object" && value !== null) {
          displayValue = JSON.stringify(value)
        }

        doc.text(`${key}: ${displayValue}`, 15, yPos)
        yPos += 5
      })

      yPos += 5 // Add space between items
    })

    return doc.output("blob")
  }

  const downloadData_prev = async (type: string, format: string, startDate?: Date, endDate?: Date) => {
    try {
      let data: any[] = []
      switch (type) {
        case "studies":
          const studiesData = await Service.getAll("studies")
          data = studiesData || []
          break

        case "activities":
          const activities = (await Service.getAll("activities")) || []
          for (let x of activities) {
            delete x["study_id"]
            delete x["study_name"]
            let activityData = await LAMP.Activity.view(x.id)
            x.settings = activityData.settings
            if (x.spec === "lamp.survey") {
              try {
                const res = (await LAMP.Type.getAttachment(
                  x.id,
                  "lamp.dashboard.survey_description"
                )) as AttachmentResponse
                let activity = spliceActivity({
                  raw: { ...x, tableData: undefined },
                  tag: res?.error ? undefined : res?.data,
                })
                data.push(activity)
              } catch (e) {}
            } else if (!["lamp.survey"].includes(x.spec)) {
              try {
                const res = (await LAMP.Type.getAttachment(x.id, "emersive.activity.details")) as AttachmentResponse
                let activity = spliceCTActivity({
                  raw: { ...x, tableData: undefined },
                  tag: res?.error ? undefined : res?.data,
                })
                data.push(activity)
              } catch (e) {}
            } else data.push({ ...x, tableData: undefined })
          }
          break

        case "participants":
          const participantsData = await Service.getAll("participants")
          data = participantsData || []
          break

        case "sensors":
          const sensorsData = await Service.getAll("sensors")
          data = sensorsData || []
          break

        case "activity_events":
          const query = startDate && endDate ? `?start=${startDate.toISOString()}&end=${endDate.toISOString()}` : ""
          data = await LAMP.ActivityEvent.allByParticipant(researcherId + query)
          break

        case "sensor_events":
          const query2 = startDate && endDate ? `?start=${startDate.toISOString()}&end=${endDate.toISOString()}` : ""
          data = await LAMP.SensorEvent.allByParticipant(researcherId + query2)
          break
      }

      // Convert data based on format
      let content, fileName
      switch (format) {
        case "json":
          content = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
          fileName = `${type}_export.json`
          saveAs(new Blob([content], { type: "text/plain;charset=utf-8" }), fileName)
          break

        case "csv":
          content = convertToCSV(data)
          fileName = `${type}_export.csv`
          saveAs(new Blob([content], { type: "text/csv;charset=utf-8" }), fileName)
          break

        case "excel":
          content = await convertToExcel(data)
          fileName = `${type}_export.xlsx`
          saveAs(content, fileName)
          break

        case "pdf":
          content = await convertToPDF(data)
          fileName = `${type}_export.pdf`
          saveAs(content, fileName)
          break
      }

      enqueueSnackbar(t("Data exported successfully"), { variant: "success" })
    } catch (error) {
      console.error("Download failed:", error)
      enqueueSnackbar(t("Failed to export data"), { variant: "error" })
    }
  }

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={layoutClasses.header}>
        <Box className={headerclasses.header}>
          <Box className={headerclasses.titleSection}>
            {supportsSidebar ? (
              <Box className={headerclasses.logo}>
                <Logo className={classes.logo} />
              </Box>
            ) : null}
            {props.authType === "admin" && (
              <IconButton
                size="medium"
                className={headerclasses.backButton}
                onClick={() => {
                  window.location.href = `/`
                }}
              >
                <Icon>arrow_back</Icon>
              </IconButton>
            )}
            <Typography variant="h5">{`${t("Studies")}`}</Typography>
          </Box>
          <Box className={headerclasses.actionGroup}>
            <SearchBox searchData={searchData} />
            <RefreshIcon className={classes.actionIcon} onClick={() => refreshStudies()} />
            {props.viewMode === "grid" ? (
              <GridViewFilledIcon
                className={`${classes.actionIcon} ${props.viewMode === "grid" ? "active" : ""}`}
                onClick={() => props.onViewModechanged("grid")}
              />
            ) : (
              <GridViewIcon
                className={`${classes.actionIcon} active`}
                onClick={() => props.onViewModechanged("grid")}
              />
            )}
            {props.viewMode === "table" ? (
              <TableViewFilledIcon
                className={`${classes.actionIcon} ${props.viewMode === "table" ? "active" : ""}`}
                onClick={() => props.onViewModechanged("table")}
              />
            ) : (
              <TableViewIcon
                className={`${classes.actionIcon} active`}
                onClick={() => props.onViewModechanged("table")}
              />
            )}
            <AddIcon
              className={classes.addButton}
              onClick={(event) =>
                // setPopover(event.currentTarget)
                setSlideOpen(true)
              }
            />
            {props.viewMode === "table" && (
              <>
                <ColumnsIcon
                  className={classes.actionIcon}
                  onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
                />
                <FilterIcon
                  className={classes.actionIcon}
                  // onClick={(event) => setPopover(event.currentTarget)}
                />
                {/* <PrintIcon
                  className={classes.actionIcon}
                  // onClick={(event) => setPopover(event.currentTarget)}
                /> */}
                <DownloadIcon
                  className={classes.actionIcon}
                  onClick={(event) =>
                    setDownloadState({
                      ...downloadState,
                      anchor: event.currentTarget,
                    })
                  }
                />
              </>
            )}
            <Box
              className={headerclasses.profileSection}
              onClick={(event) => setShowCustomizeMenu(event.currentTarget)}
            >
              <Avatar className={headerclasses.avatar}>{props.title?.charAt(0) || "U"}</Avatar>
              {supportsSidebar ? <Profile title={props.title} authType={props.authType} /> : null}
            </Box>
          </Box>
        </Box>
      </Box>
      {/* <Box>
          <Fab
            variant="extended"
            color="primary"
            classes={{ root: classes.btnBlue + " " + (!!popover ? classes.popexpand : "") }}
            onClick={(event) => setPopover(event.currentTarget)}
          >
            <Icon>add</Icon> <span className={classes.addText}>{`${t("Add")}`}</span>
          </Fab>
        </Box> */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        keepMounted
        elevation={3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        getContentAnchorEl={null}
        PaperProps={{
          style: {
            maxHeight: "300px",
            width: "250px",
            marginTop: "8px",
          },
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            borderBottom: "1px solid rgb(229, 231, 235)",
            padding: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            zIndex: 50,
          }}
        >
          <Button
            size="small"
            onClick={() => {
              props.setVisibleColumns?.(props.VisibleColumns?.map((col) => ({ ...col, visible: true })))
            }}
            color="primary"
            style={{ textTransform: "none", fontSize: "0.875rem" }}
          >
            {t("Select All")}
          </Button>
          <Button
            size="small"
            onClick={() => {
              props.setVisibleColumns?.(
                props.VisibleColumns?.map((col, index) => ({
                  ...col,
                  visible: index === 0,
                }))
              )
            }}
            color="primary"
            style={{ textTransform: "none", fontSize: "0.875rem" }}
          >
            {t("Deselect All")}
          </Button>
        </div>
        <div style={{ padding: "0.5rem", overflowY: "auto" }}>
          {props.VisibleColumns?.map((column) => (
            <MenuItem key={column.id}>
              <Checkbox
                checked={column.visible}
                onChange={() => {
                  props.setVisibleColumns?.(
                    props.VisibleColumns?.map((col) => (col.id === column.id ? { ...col, visible: !col.visible } : col))
                  )
                }}
              />
              <ListItemText primary={column.label} />
            </MenuItem>
          ))}
        </div>
      </Menu>
      <Backdrop className={sliderclasses.backdrop} open={slideOpen} onClick={handleBackdropClick} />
      <Slide direction="left" in={slideOpen} mountOnEnter unmountOnExit>
        <Box className={sliderclasses.slidePanel}>
          <Box className={sliderclasses.icon}>
            <UserIcon />
          </Box>
          <Typography variant="h6">ADD NEW STUDY</Typography>
          <Divider className={sliderclasses.divider} />
          <Typography variant="body2" paragraph>
            Studies are <strong>researcher</strong> specific.
          </Typography>
          <Divider className={sliderclasses.divider} />
          <Typography variant="body2" paragraph>
            Add a new Study under researcher <strong>{props.title}</strong>.
          </Typography>
          <Typography variant="body1" paragraph>
            If you have decided the Groups for the Study by now, proceed with this.
          </Typography>
          <Button className={sliderclasses.button} onClick={() => handleSlideOpen("participant")}>
            Add Study & Group
          </Button>
          <Typography variant="body1" paragraph className={sliderclasses.headings}>
            Or create a Study and add the Groups later.
          </Typography>
          <Button className={sliderclasses.button} onClick={() => handleSlideOpen("study")}>
            Add a Study
          </Button>
          <Divider className={sliderclasses.divider} />
          <Typography variant="body2" paragraph>
            Add a new Group under an existing Study.
          </Typography>
          <Button className={sliderclasses.button} onClick={() => handleSlideOpen("group")}>
            Add a group
          </Button>
        </Box>
      </Slide>
      <Popover
        classes={{ root: classes.customPopover, paper: classes.customPaper }}
        open={!!popover ? true : false}
        anchorPosition={!!popover && popover.getBoundingClientRect()}
        anchorReference="anchorPosition"
        onClose={() => setPopover(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {/* <React.Fragment> */}
        <MenuItem
          onClick={() => {
            setPopover(null)
            setAddGroup(true)
          }}
        >
          <Typography variant="h6">{`${t("Add a group")}`}</Typography>
          <Typography variant="body2">{`${t("Create a new group in existing study.")}`}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPopover(null)
            setAddStudy(true)
          }}
        >
          <Typography variant="h6">{`${t("Add a new study")}`}</Typography>
          <Typography variant="body2">{`${t("Create a new study")}.`}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPopover(null)
            setAddParticipantStudy(true)
          }}
        >
          <Typography variant="h6">{`${t("Add a new group and study")}`}</Typography>
          <Typography variant="body2">{`${t("Create a new study and a group within it.")}`}</Typography>
        </MenuItem>
        {/* </React.Fragment> */}
      </Popover>
      <Menu
        id="profile-menu"
        anchorEl={showCustomizeMenu}
        open={Boolean(showCustomizeMenu)}
        onClose={() => setShowCustomizeMenu(null)}
        classes={{ paper: headerclasses.customPaper }}
      >
        {!supportsSidebar ? (
          <MenuItem>
            <Profile title={props.title} authType={props.authType} />
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => setPasswordChange(true)}>{t("Manage Credentials")}</MenuItem>
        <MenuItem divider onClick={() => setConfirmLogout(true)}>
          {t("Logout")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("https://docs.lamp.digital", "_blank")
          }}
        >
          {t("Help & Support")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("https://community.lamp.digital", "_blank")
          }}
        >
          {t("LAMP Community")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("mailto:team@digitalpsych.org", "_blank")
          }}
        >
          {t("Contact Us")}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setShowCustomizeMenu(null)
            window.open("https://docs.lamp.digital/privacy/", "_blank")
          }}
        >
          <b style={{ color: colors.grey[600] }}>{t("Privacy Policy")}</b>
        </MenuItem>
      </Menu>
      {/* <Menu
        anchorEl={downloadMenu.anchor}
        open={Boolean(downloadMenu.anchor)}
        onClose={() => setDownloadMenu({...downloadMenu, anchor: null})}
      >
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>{t("Select Data Type")}</InputLabel>
            <Select
              value={downloadMenu.type}
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => 
                setDownloadMenu({...downloadMenu, type: e.target.value as DownloadType})}
            >
              <MenuItem value="studies">{t("Studies")}</MenuItem>
              <MenuItem value="activities">{t("Activities")}</MenuItem>
              <MenuItem value="participants">{t("Participants")}</MenuItem>
              <MenuItem value="sensors">{t("Sensors")}</MenuItem>
              <MenuItem value="activity_events">{t("Activity Events")}</MenuItem>
              <MenuItem value="sensor_events">{t("Sensor Events")}</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>

        {(downloadMenu.type === 'activity_events' || downloadMenu.type === 'sensor_events') && (
          <MenuItem>
            <Box display="flex" flexDirection="column">
              <DatePicker
                label={t("Start Date")}
                value={downloadMenu.startDate}
                onChange={(date) => setDownloadMenu({...downloadMenu, startDate: date})}
              />
              <DatePicker
                label={t("End Date")}
                value={downloadMenu.endDate}
                onChange={(date) => setDownloadMenu({...downloadMenu, endDate: date})}
              />
            </Box>
          </MenuItem>
        )}

        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>{t("Select Format")}</InputLabel>
            <Select
              value={downloadMenu.format}
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => 
                setDownloadMenu({...downloadMenu, format: e.target.value as DownloadFormat})}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>

        <MenuItem onClick={() => {
          downloadData(
            downloadMenu.type, 
            downloadMenu.format,
            downloadMenu.startDate,
            downloadMenu.endDate
          )
          setDownloadMenu({...downloadMenu, anchor: null})
        }}>
          <Button fullWidth variant="contained" color="primary">
            {t("Download")}
          </Button>
        </MenuItem>
      </Menu> */}
      <Menu
        anchorEl={downloadState.anchor}
        open={Boolean(downloadState.anchor)}
        onClose={() => setDownloadState({ ...downloadState, anchor: null })}
        PaperProps={{
          style: {
            maxHeight: "80vh",
            width: "400px",
          },
        }}
      >
        {/* Studies Selection */}
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>{t("Select Studies")}</InputLabel>
            <Select
              multiple
              value={downloadState.selectedStudies.map((s) => s.studyId)}
              onChange={(e) => {
                const selectedIds = e.target.value as string[]
                const newSelections = selectedIds.map((id) => ({
                  studyId: id,
                  items: { participants: [], activities: [], sensors: [] },
                }))
                setDownloadState({ ...downloadState, selectedStudies: newSelections })
              }}
              renderValue={(selected) => `${(selected as string[]).length} studies selected`}
            >
              <MenuItem>
                <Button
                  onClick={() => {
                    setDownloadState({
                      ...downloadState,
                      selectedStudies: studiesData.map((s) => ({
                        studyId: s.id,
                        items: { participants: [], activities: [], sensors: [] },
                      })),
                    })
                  }}
                >
                  {t("Select All")}
                </Button>
                <Button
                  onClick={() => {
                    setDownloadState({ ...downloadState, selectedStudies: [] })
                  }}
                >
                  {t("Deselect All")}
                </Button>
              </MenuItem>
              <Divider />
              {studiesData.map((study) => (
                <MenuItem key={study.id} value={study.id}>
                  <Checkbox checked={downloadState.selectedStudies.some((s) => s.studyId === study.id)} />
                  <ListItemText primary={study.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>

        {/* For each selected study, show its items */}
        {downloadState.selectedStudies.map((selection) => {
          const study = studiesData.find((s) => s.id === selection.studyId)
          if (!study) return null

          return (
            <React.Fragment key={study.id}>
              <ListSubheader>{study.name}</ListSubheader>

              {/* Participants */}
              <MenuItem>
                <FormControl fullWidth>
                  <InputLabel>{t("Participants")}</InputLabel>
                  <Select
                    multiple
                    value={selection.items.participants}
                    onChange={(e) => {
                      const newSelections = downloadState.selectedStudies.map((s) =>
                        s.studyId === study.id
                          ? { ...s, items: { ...s.items, participants: e.target.value as string[] } }
                          : s
                      )
                      setDownloadState({ ...downloadState, selectedStudies: newSelections })
                    }}
                  >
                    <MenuItem>
                      <Button
                        onClick={() => {
                          const newSelections = downloadState.selectedStudies.map((s) =>
                            s.studyId === study.id
                              ? { ...s, items: { ...s.items, participants: study.participants } }
                              : s
                          )
                          setDownloadState({ ...downloadState, selectedStudies: newSelections })
                        }}
                      >
                        {t("Select All")}
                      </Button>
                      <Button
                        onClick={() => {
                          const newSelections = downloadState.selectedStudies.map((s) =>
                            s.studyId === study.id ? { ...s, items: { ...s.items, participants: [] } } : s
                          )
                          setDownloadState({ ...downloadState, selectedStudies: newSelections })
                        }}
                      >
                        {t("Deselect All")}
                      </Button>
                    </MenuItem>
                    {study.participants.map((id) => (
                      <MenuItem key={id} value={id}>
                        <Checkbox checked={selection.items.participants.includes(id)} />
                        <ListItemText primary={id} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MenuItem>

              {/* Similar sections for Activities and Sensors */}
              {/* ... */}
            </React.Fragment>
          )
        })}

        {/* Events Option */}
        <MenuItem>
          <FormControlLabel
            control={
              <Checkbox
                checked={downloadState.includeEvents}
                onChange={(e) => setDownloadState({ ...downloadState, includeEvents: e.target.checked })}
              />
            }
            label={t("Include Events")}
          />
        </MenuItem>

        {/* Date Range (if events included) */}
        {downloadState.includeEvents && (
          <MenuItem>
            <Box display="flex" flexDirection="column" style={{ gap: 2 }}>
              <DatePicker
                label={t("Start Date")}
                value={downloadState.dateRange.startDate}
                onChange={(date) =>
                  setDownloadState({
                    ...downloadState,
                    dateRange: { ...downloadState.dateRange, startDate: date },
                  })
                }
              />
              <DatePicker
                label={t("End Date")}
                value={downloadState.dateRange.endDate}
                onChange={(date) =>
                  setDownloadState({
                    ...downloadState,
                    dateRange: { ...downloadState.dateRange, endDate: date },
                  })
                }
              />
            </Box>
          </MenuItem>
        )}

        {/* Format Selection */}
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>{t("Download Format")}</InputLabel>
            <Select
              value={downloadState.format}
              onChange={(e) =>
                setDownloadState({
                  ...downloadState,
                  format: e.target.value as typeof downloadState.format,
                })
              }
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>

        {/* Download Button */}
        <MenuItem>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={downloadData}
            disabled={downloadState.selectedStudies.length === 0}
          >
            {t("Download")}
          </Button>
        </MenuItem>
      </Menu>

      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <DialogTitle>{t("Are you sure you want to log out of LAMP right now?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("If you've made some changes, make sure they're saved before you continue to log out.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogout(false)} color="secondary">
            {t("Go Back")}
          </Button>
          <Button
            onClick={() => {
              props.onLogout()
              setConfirmLogout(false)
            }}
            color="primary"
            autoFocus
          >
            {t("Logout")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordChange} onClose={() => setPasswordChange(false)}>
        <DialogContent>
          <CredentialManager id={researcherId} />
        </DialogContent>
      </Dialog>
      <StudyGroupCreator
        studies={studies}
        researcherId={researcherId}
        onClose={() => {
          setAddGroup(false)
          handleClosePopUp(3)
        }}
        open={addGroup}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
      <StudyCreator
        studies={studies}
        researcherId={researcherId}
        open={addStudy}
        onclose={() => {
          setAddStudy(false)
          handleClosePopUp(2)
        }}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
      <PatientStudyCreator
        studies={studies}
        researcherId={researcherId}
        onclose={() => {
          setAddParticipantStudy(false)
          handleClosePopUp(1)
        }}
        open={addParticipantStudy}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
    </div>
  )
}
