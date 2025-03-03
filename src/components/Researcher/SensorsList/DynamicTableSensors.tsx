import React, { useState, useEffect, CSSProperties, ReactNode } from "react"
import { get } from "lodash"
import dayjs from "dayjs"
import {
  Box,
  Fab,
  CardActions,
  Backdrop,
  CircularProgress,
  Icon,
  makeStyles,
  createStyles,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@material-ui/core"
import { Theme } from "@material-ui/core/styles"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import ConfirmationDialog from "../../ConfirmationDialog"
import { Service } from "../../DBService/DBService"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import { ReactComponent as ColumnIcon } from "../../icons/Pictogrammers-Material-Table-filter.svg"
import { ColorLens } from "@mui/icons-material"
import PreviewIcon from "@material-ui/icons/Visibility"
import StudiesPreviewDialog from "./StudiesStatusPreviewDialog"

interface ColumnConfig {
  [key: string]: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "14px",
      color: "#7599FF",
      "& svg": { marginRight: 8 },
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    btnActive: {
      background: "#7599FF",
      color: "#fff",
      "&:hover": {
        background: "#5680f9",
        color: "#fff",
      },
    },
    buttoncontainer: {
      position: "sticky",
      top: 0,
      backgroundColor: theme.palette.background.paper,
      display: "flex",
      justifyContent: "space-between",
      padding: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.divider}`,
      zIndex: 1,
    },
    columnMenu: {
      maxHeight: "300px",
      overflowY: "auto",
      padding: theme.spacing(1),
      position: "sticky",
      zIndex: 60,
      width: "20%",
      top: 0,
      left: -10,
    },
    columnMenuItem: {
      padding: theme.spacing(0.5, 2),
    },
    selectButtons: {
      display: "flex",
      justifyContent: "space-between",
      padding: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    selectButton: {
      textTransform: "none",
      fontSize: "14px",
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    dialogContainer: {
      position: "fixed",
      top: "40%",
      left: "45%",
      // width: '20%',
      // height: 'auto',
      zIndex: 1111,
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2),
    },
    settingItem: {
      marginBottom: theme.spacing(1.5),
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    label: {
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
    value: {
      color: theme.palette.text.secondary,
    },
    buttonsContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: theme.spacing(2),
      marginTop: theme.spacing(3),
      paddingTop: theme.spacing(2),
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    saveButton: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    discardButton: {
      backgroundColor: theme.palette.grey[100],
      "&:hover": {
        backgroundColor: theme.palette.grey[200],
      },
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1110,
    },

    tableRow: {
      backgroundColor: "#ffffff !important", // Force white background
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "#f3f4f6 !important", // Light grey on hover
      },
    },
    selectedRow: {
      backgroundColor: "#e5e7eb !important", // Grey when selected
      "&:hover": {
        backgroundColor: "#e5e7eb !important", // Keep same grey on hover when selected
      },
    },
    copyableCell: {
      cursor: "copy",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(117, 153, 255, 0.1)",
        opacity: 0,
        transition: "opacity 0.2s ease",
      },
      "&:active::after": {
        opacity: 1,
      },
    },
    copiedTooltip: {
      position: "fixed",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      pointerEvents: "none",
      zIndex: 1000,
    },
    scrollableContainer: {
      width: "500px",
      maxWidth: "500px",
      position: "relative",
      overflow: "hidden",
      cursor: "copy",
      "&:active::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(117, 153, 255, 0.1)",
        opacity: 1,
      },
    },
    scrollableContent: {
      width: "100%",
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",
      padding: "8px 12px",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    scrollHint: {
      position: "absolute",
      right: "4px",
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.5,
      fontSize: "14px",
      pointerEvents: "none",
      // animation: '$fadeInOut 2s infinite',
    },
    //   '@keyframes fadeInOut': {
    //     '0%, 100%': {
    //       opacity: 0.2,
    //     },
    //     '50%': {
    //       opacity: 0.7,
    //     },
    //   },

    tableContainer: {
      position: "relative",
      height: "calc(100vh - 200px)", // Adjust based on your layout
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    tableWrapper: {
      flex: 1,
      overflowY: "auto",
      overflowX: "auto",
      marginTop: "10px",
    },
    headerRow: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: "rgb(213 213 213)",
      "& th": {
        position: "sticky",
        top: 0,
        backgroundColor: "rgb(213 213 213)",
      },
    },
    stickyActions: {
      position: "sticky",
      top: 0,
      zIndex: 3,
      backgroundColor: "white",
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  })
)

interface SensorData {
  id: string
  type: string
  name?: string
  settings?: any
  spec?: string
  [key: string]: any
}

interface SensorSettings {
  frequency?: number
}

interface SettingsInfo {
  "lamp.analytics": SensorSettings
  "lamp.gps": SensorSettings
  "lamp.accelerometer": SensorSettings
  "lamp.accelerometer.motion": SensorSettings
  "lamp.accelerometer.device_motion": SensorSettings
  "lamp.device_state": SensorSettings
  "lamp.steps": SensorSettings
  "lamp.nearby_device": SensorSettings
  "lamp.telephony": SensorSettings
  "lamp.sleep": SensorSettings
  "lamp.ambient": SensorSettings
}

interface DynamicTableProps {
  columns: ColumnConfig
  data: SensorData[]
  className?: string
  onRowClick?: (row: any) => void
  emptyStateMessage?: string
  isLoading?: boolean
  adminType?: string
  maxHeight?: string
  refreshSensors?: () => void
  editable_columns?: string[]
  settingsInfo?: SettingsInfo
}

type UpdateData = {
  [key: string]: any
}
interface ScrollableCellProps {
  value: string
}

interface EditableCellProps {
  columnKey: string
  value: string | number | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const CopyTooltip: React.FC<{ text: string; position: { x: number; y: number } }> = ({ text, position }) => {
  const classes = useStyles()
  return (
    <div
      className={classes.copiedTooltip}
      style={{
        left: position.x,
        top: position.y - 30, // Position above the cursor
      }}
    >
      {text}
    </div>
  )
}

interface ScrollableCellProps {
  value: string
  onCopy?: (text: string, event: React.MouseEvent) => void
}

// const ScrollableCell: React.FC<ScrollableCellProps> = React.memo(({ value, onCopy }) => {
//     const classes = useStyles();
//     const scrollRef = React.useRef<HTMLDivElement>(null);
//     const [isScrollable, setIsScrollable] = React.useState(false);
//     const [isScrolling, setIsScrolling] = React.useState(false);
//     const [startX, setStartX] = React.useState(0);
//     const [scrollLeft, setScrollLeft] = React.useState(0);
//     const [isDragging, setIsDragging] = React.useState(false);

//     React.useEffect(() => {
//         const checkScrollable = () => {
//             if (scrollRef.current) {
//                 const hasScroll = scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
//                 setIsScrollable(hasScroll);
//             }
//         };

//         checkScrollable();

//         const resizeObserver = new ResizeObserver(checkScrollable);
//         if (scrollRef.current) {
//             resizeObserver.observe(scrollRef.current);
//         }

//         return () => {
//             if (scrollRef.current) {
//                 resizeObserver.unobserve(scrollRef.current);
//             }
//         };
//     }, [value]);

//     const handleMouseDown = (e: React.MouseEvent) => {
//         if (!scrollRef.current) return;

//         setIsDragging(false);
//         setIsScrolling(true);
//         setStartX(e.pageX - scrollRef.current.offsetLeft);
//         setScrollLeft(scrollRef.current.scrollLeft);
//     };

//     const handleMouseUp = (e: React.MouseEvent) => {
//         if (!isDragging && onCopy) {
//             e.stopPropagation();
//             onCopy(value, e);
//         }
//         setIsScrolling(false);
//         setIsDragging(false);
//     };

//     const handleMouseMove = (e: React.MouseEvent) => {
//         if (!isScrolling || !scrollRef.current) return;

//         e.preventDefault();
//         const x = e.pageX - scrollRef.current.offsetLeft;
//         const walk = (x - startX) * 2;

//         if (Math.abs(walk) > 5) { // Add a small threshold to detect dragging
//             setIsDragging(true);
//         }

//         scrollRef.current.scrollLeft = scrollLeft - walk;
//     };

//     const handleWheel = (event: React.WheelEvent) => {
//         if (scrollRef.current && event.deltaY !== 0) {
//             event.preventDefault();
//             scrollRef.current.scrollLeft += event.deltaY;
//         }
//     };

//     return (
//         <div
//             className={classes.scrollableContainer}
//             onMouseDown={handleMouseDown}
//             onMouseUp={handleMouseUp}
//             onMouseMove={handleMouseMove}
//             onMouseLeave={() => {
//                 setIsScrolling(false);
//                 setIsDragging(false);
//             }}
//         >
//             <div
//                 ref={scrollRef}
//                 className={classes.scrollableContent}
//                 onWheel={handleWheel}
//             >
//                 {value}
//             </div>
//             {isScrollable && (
//                 <span className={classes.scrollHint}>⟷</span>
//             )}
//         </div>
//     );
// });

// EditableCell component with TypeScript types
const EditableCell: React.FC<EditableCellProps> = React.memo(({ columnKey, value, onChange, onClick }) => {
  return columnKey !== "settings" ? (
    <input
      type="text"
      value={value || ""}
      onChange={onChange}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "4px 8px",
        border: "1px solid #7599FF",
        borderRadius: "4px",
        fontSize: "0.875rem",
        outline: "none",
      }}
    />
  ) : (
    <p
      onClick={onClick}
      style={{
        width: "100%",
        padding: "4px 8px",
        border: "1px solid #7599FF",
        borderRadius: "4px",
        fontSize: "0.875rem",
        outline: "none",
      }}
    >
      {JSON.stringify(value)}
    </p>
  )
})

const DynamicTableSensors: React.FC<DynamicTableProps> = ({
  columns,
  data,
  onRowClick,
  className = "",
  emptyStateMessage = "No data available",
  isLoading = false,
  adminType,
  refreshSensors,
  editable_columns = [],
  settingsInfo,
}) => {
  const columnKeys = Object.keys(columns)
  const classes = useStyles()

  const [deletedIds, setDeletedIds] = useState([])
  const [deletedStudyIds, setDeletedStudyIds] = useState([])

  const [confirmStatus, setConfirmStatus] = useState(false)

  const [sensor, setSensor] = useState(null)
  const [sensors, setSensors] = useState([])
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [confirmationDialog, setConfirmationDialog] = useState(0)

  // Add new state for column selection
  const originalColumnKeys = Object.keys(columns)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columnKeys)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const [editedData, setEditedData] = useState<{ [key: string]: any }>({})
  const [isEditing, setIsEditing] = useState(false)

  const [loading, setLoading] = useState(false)
  const [settingsDialogMetaData, setSettingsDialogMetaData] = useState(null)
  const [settingsValue, setSettingsValue] = useState(null)

  const [showCopyTooltip, setShowCopyTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [previewData, setPreviewData] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false)

  useEffect(() => {
    if (confirmStatus) {
      if (deletedStudyIds.length > 0) {
        let idCounts = {}
        deletedStudyIds.forEach((x) => (idCounts[x] = (idCounts[x] || 0) + 1))
        Object.keys(idCounts).forEach(function (key) {
          Service.getData("studies", key).then((studiesObject) => {
            Service.updateMultipleKeys(
              "studies",
              {
                studies: [{ id: key, sensor_count: studiesObject.sensor_count - idCounts[key] }],
              },
              ["sensor_count"],
              "id"
            )
          })
        })
      }
    }
  }, [deletedStudyIds])

  useEffect(() => {
    if (confirmStatus) {
      if (deletedIds.length > 0) {
        Service.delete("sensors", deletedIds)
      } else {
        enqueueSnackbar(`${t("An error occured while deleting. Please try again.")}`, {
          variant: "error",
        })
      }
    }
  }, [deletedIds])

  useEffect(() => {
    console.log("researchers selected", sensors)
  }, [sensors])

  // Handle cell edit
  const handleCellEdit = (rowIndex: number, columnKey: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [`${rowIndex}-${columnKey}`]: value,
    }))
    setIsEditing(true)
  }

  const copyToClipboard = (text: string, event: React.MouseEvent) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show tooltip
        setTooltipPosition({ x: event.clientX, y: event.clientY })
        setShowCopyTooltip(true)
        // Hide tooltip after 1 second
        setTimeout(() => setShowCopyTooltip(false), 1000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  // Handle cell click for copying
  const handleCellClick = (event: React.MouseEvent, value: any, rowIndex: number, row: any) => {
    if (!activeButton && value) {
      event.stopPropagation()
      const textValue = typeof value === "object" ? JSON.stringify(value) : String(value)
      copyToClipboard(textValue, event)
    } else if (activeButton) {
      handleRowSelection(rowIndex, row)
    }
  }

  // Handle save edits
  const handleSaveEdit = async () => {
    try {
      // Group edits by row
      const rowEdits = {}
      Object.entries(editedData).forEach(([key, value]) => {
        const [rowIndex, columnKey] = key.split("-")
        if (!rowEdits[rowIndex]) rowEdits[rowIndex] = {}
        rowEdits[rowIndex][columnKey] = value
      })

      console.log("HEY THE ROWEDITS", rowEdits)

      // Update each modified row
      for (const [rowIndex, updates] of Object.entries(rowEdits)) {
        const currentSensor = data[Number(rowIndex)] as SensorData // Type assertion added
        if (!currentSensor?.id) {
          // Simplified validation
          console.error("Invalid sensor data or missing ID")
          continue
        }

        const typedUpdates = updates as UpdateData // Type assertion for updates

        const updatedSensor: SensorData = {
          // Explicit type for updatedSensor
          ...currentSensor,
          ...typedUpdates,
        }

        await LAMP.Sensor.update(updatedSensor.id, updatedSensor)
          .then((res) => {
            Service.updateMultipleKeys(
              "sensors",
              {
                sensors: [
                  {
                    id: updatedSensor.id,
                    name: updatedSensor.name.trim(),
                    spec: updatedSensor.spec,
                    settings: updatedSensor.settings,
                  },
                ],
              },
              ["name", "spec", "settings"],
              "id"
            )
          })
          .catch()
      }

      enqueueSnackbar(t("Successfully updated sensor"), { variant: "success" })
      setEditedData({})
      setIsEditing(false)
      setSelectedRow(null)
      setActiveButton(null)
      refreshSensors()
    } catch (error) {
      enqueueSnackbar(t("Failed to update sensor(s)"), { variant: "error" })
    }
  }

  // Handle discard changes
  const handleDiscardChanges = () => {
    setEditedData({})
    setIsEditing(false)
    setSelectedRow(null)
    setActiveButton(null)
  }

  const handleColumnMenuOpen = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.left + window.scrollX,
    })
    setAnchorEl(event.currentTarget)
    setActiveButton("view_column")
  }

  const handleColumnMenuClose = () => {
    setAnchorEl(null)
    setActiveButton(null)
  }

  const handleColumnToggle = (event, columnKey) => {
    event.stopPropagation()
    setSelectedColumns((prev) => {
      if (event.target.checked) {
        // Add the column while maintaining original order
        const newColumns = originalColumnKeys.filter((key) => prev.includes(key) || key === columnKey)
        return newColumns
      } else {
        // Remove the column if it's not the last one
        if (prev.length > 1) {
          return prev.filter((key) => key !== columnKey)
        }
        return prev
      }
    })
  }

  const handleSelectAllColumns = () => {
    // Set all columns in their original order
    setSelectedColumns([...originalColumnKeys])
  }

  const handleDeselectAllColumns = () => {
    // Keep only the first column from the original order
    setSelectedColumns([originalColumnKeys[0]])
  }

  const handleButtonClick = (buttonType: string) => {
    if (activeButton === buttonType) {
      // Deactivate button and clear selections
      setActiveButton(null)
      setSelectedRow(null)
      setSelectedRows([])
      setSensor(null)
      setSensors([])
    } else {
      // Activate button and clear previous selections
      setActiveButton(buttonType)
      setSelectedRow(null)
      setSelectedRows([])
      setSensor(null)
      setSensors([])
    }
  }

  const handleRowSelection = (rowIndex, row) => {
    // Only handle selection if there's an active button
    if (!activeButton) return

    // Prevent selection when clicking on editable inputs
    // if (event.target.tagName === 'INPUT') {
    //     return;
    // }

    if (activeButton === "edit" || activeButton === "arrow_forward") {
      setSelectedRow(rowIndex)
      setSensor(row)
    } else if (activeButton === "delete" || activeButton === "suspend") {
      const updatedSelection = selectedRows.includes(rowIndex)
        ? selectedRows.filter((i) => i !== rowIndex)
        : [...selectedRows, rowIndex]
      setSelectedRows(updatedSelection)
      setSensors(updatedSelection.map((index) => data[index]))
    }
  }

  // const handleRowSelection = (rowIndex: number, row: any) => {
  //     if (activeButton === 'edit' || activeButton === 'arrow_forward') {
  //         setSelectedRow(rowIndex);
  //         setSensor(row);
  //     } else if (activeButton === 'delete' || activeButton === 'suspend') {
  //         const updatedSelection = selectedRows.includes(rowIndex)
  //             ? selectedRows.filter(i => i !== rowIndex)
  //             : [...selectedRows, rowIndex];
  //         setSelectedRows(updatedSelection);
  //         setSensors(updatedSelection.map(index => data[index]));
  //         // <DeleteResearcher researcher={researcher} refreshResearchers={refreshResearchers} />
  //     }
  // };

  const confirmAction = async (status) => {
    setConfirmStatus(status === "Yes" ? true : false)
    if (status === "Yes") {
      setLoading(true)
      let successCount = 0
      let failureCount = 0

      let deletedIds = []
      let deletedStudyIds = []

      // Assuming researchers is an array of researcher objects
      for (const sensor of sensors) {
        try {
          const deleteResult = (await LAMP.Sensor.delete(sensor.id)) as any
          if (deleteResult?.error == undefined) {
            successCount++
            setDeletedIds((prev) => [...prev, sensor.id])
            setDeletedStudyIds((prev) => [...prev, sensor.study_id])
            // deletedIds.push(sensor.id)
            // deletedStudyIds.push(sensor.study_id)
          } else {
            failureCount++
          }
        } catch (error) {
          failureCount++
          console.error(`Error in deletion process for sensor ${sensor.id}:`, error)
        }
      }

      // Show appropriate notification based on results
      if (successCount > 0 && failureCount === 0) {
        enqueueSnackbar(
          successCount === 1 ? t("Successfully deleted the sensor.") : t("Successfully deleted all investigators."),
          { variant: "success" }
        )
      } else if (successCount > 0 && failureCount > 0) {
        enqueueSnackbar(
          t(`Successfully deleted ${successCount} investigator(s), but failed to delete ${failureCount}.`),
          { variant: "warning" }
        )
      } else {
        enqueueSnackbar(t("Failed to delete the investigators."), { variant: "error" })
      }
    }
    // setDeletedIds(deletedIds)
    // setDeletedStudyIds(deletedStudyIds)
    setLoading(false)
    refreshSensors()
    setConfirmationDialog(0)
    setSensors([])
    setActiveButton(null)
  }

  const formatValue = (value: any, key: string) => {
    if (!value) return "--"

    if (key.toLowerCase().includes("timestamp")) {
      return dayjs(value).format("HH:mm DD/MM/YYYY")
    }

    if (typeof value === "string") {
      const words = value.split(" ")
      return words.length > 3 ? (
        <>
          {words.slice(0, 3).join(" ")} <br /> {words.slice(3).join(" ")}
        </>
      ) : (
        value
      )
    }

    return value
  }

  const getValue = (obj: any, path: string) => {
    return path.includes(".") ? get(obj, path, "") : obj[path]
  }

  if (isLoading) return <div className="w-full p-4 text-center text-gray-500">Loading...</div>
  if (!data.length) return <div className="w-full p-4 text-center text-gray-500">{emptyStateMessage}</div>

  const handleSuspension = () => {
    console.log(sensors)
    let successCount = 0
    let failureCount = 0
    for (const sensor of sensors) {
      try {
        sensor.status = "SUSPENDED"
        sensor.timestamps.suspendedAt = new Date().getTime()
        LAMP.Researcher.update(sensor.id, sensor)
          .then((result) => {
            enqueueSnackbar("Update successful:", { variant: "success" })
            successCount++
          })
          .catch((error) => {
            enqueueSnackbar("Error updating researcher:", { variant: "error" })
            failureCount++
          })
      } catch (error) {
        enqueueSnackbar("Error updating researcher:", { variant: "error" })
        failureCount++
      }
    }
    refreshSensors()
  }

  const handleSettings = (rowIndex: number, columnKey: string, editValue: any) => {
    console.log("hello")
    setSettingsValue(editValue)
    setSettingsDialogMetaData([rowIndex, columnKey])
  }

  const renderCell = (rowIndex: number, columnKey: string, value: any, row: any) => {
    if (!row) return null

    const isEditable = editable_columns?.includes(columnKey) && activeButton === "edit" && selectedRow === rowIndex

    if (!isEditable) {
      const displayValue =
        columnKey === "settings"
          ? row[columnKey] && Object.keys(row[columnKey]).length > 0
            ? JSON.stringify(row[columnKey])
            : "--"
          : formatValue(row[columnKey], columnKey)

      if (columnKey === "studies" || columnKey === "statusInUsers") {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {typeof row[columnKey] === 'object' ? "Click to view" : "--"}
                        </div> */}
            {row[columnKey] && typeof row[columnKey] === "object" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewData(row[columnKey])
                  setIsPreviewOpen(true)
                }}
                style={{ marginLeft: "8px" }}
              >
                <PreviewIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        )
      }

      return (
        <div
          className={!activeButton ? classes.copyableCell : undefined}
          onClick={(e) => handleCellClick(e, row[columnKey], rowIndex, row)}
        >
          {displayValue}
        </div>
      )
    }

    const editValue = editedData[`${rowIndex}-${columnKey}`] ?? value
    return (
      <EditableCell
        columnKey={columnKey}
        value={editValue}
        onChange={(e) => handleCellEdit(rowIndex, columnKey, e.target.value)}
        onClick={(e) =>
          columnKey !== "settings" ? e.stopPropagation() : handleSettings(rowIndex, columnKey, editValue)
        }
      />
    )
  }

  return (
    <div
      style={{
        height: "95%",
        position: "relative",
        borderRadius: "20px",
        border: "1px solid rgb(229, 231, 235)",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {settingsDialogMetaData != null ? (
        <div className={classes.dialogContainer}>
          {Object.entries(settingsValue as { [key: string]: string | number }).map(([key, value]) => (
            <div key={key} className={classes.settingItem}>
              <span className={classes.label}>{key}:</span>
              <input
                className={classes.value}
                value={value}
                onChange={(e) =>
                  setSettingsValue((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <div className={classes.buttonsContainer}>
            <button
              onClick={() => {
                setSettingsDialogMetaData(null)
                setSettingsValue(null)
              }}
              className={classes.discardButton}
            >
              Discard Changes
            </button>
            <button
              onClick={(e) => {
                const key = `${settingsDialogMetaData[0]}-${settingsDialogMetaData[1]}`
                setEditedData((prev) => ({
                  ...prev,
                  [key]: settingsValue,
                }))
                setIsEditing(true)
                setSettingsDialogMetaData(null)
              }}
              className={classes.saveButton}
            >
              Save Settings
            </button>
          </div>
        </div>
      ) : null}
      <CardActions
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          padding: "0.5rem 0",
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {adminType !== "practice_lead" && (
          <Box
            display="flex"
            flexDirection="row"
            style={{
              justifyContent: "space-between",
              gap: "14px", // Adds consistent spacing between all flex items
            }}
          >
            <Fab
              size="small"
              style={{
                backgroundColor: "white",
                ...(activeButton === "view_column" && { backgroundColor: "#e0e0e0" }),
              }}
              onClick={handleColumnMenuOpen}
            >
              <ColumnIcon width={24} height={24}>
                view_column
              </ColumnIcon>
            </Fab>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleColumnMenuClose}
              keepMounted
              elevation={3}
              anchorReference="anchorPosition"
              anchorPosition={menuPosition}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                style: {
                  maxHeight: "300px",
                  width: "250px",
                  position: "fixed",
                },
              }}
              style={{
                position: "fixed",
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
                  onClick={handleSelectAllColumns}
                  color="primary"
                  style={{ textTransform: "none", fontSize: "0.875rem" }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleDeselectAllColumns}
                  color="primary"
                  style={{ textTransform: "none", fontSize: "0.875rem" }}
                >
                  Deselect All
                </Button>
              </div>
              <div style={{ padding: "0.5rem", overflowY: "auto" }}>
                {originalColumnKeys.map((key) => (
                  <MenuItem key={key} style={{ padding: "0.25rem" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedColumns.includes(key)}
                          onChange={(e) => handleColumnToggle(e, key)}
                          style={{ marginRight: "0.5rem" }}
                        />
                      }
                      label={columns[key]}
                      style={{ width: "100%" }}
                    />
                  </MenuItem>
                ))}
              </div>
            </Menu>

            <Fab
              size="small"
              style={{
                backgroundColor: "white",
                ...(activeButton === "delete" && { backgroundColor: "#e0e0e0" }),
              }}
              onClick={() => handleButtonClick("delete")}
            >
              <Icon>delete</Icon>
            </Fab>
            <Fab
              size="small"
              style={{
                backgroundColor: "white",
                ...(activeButton === "edit" && { backgroundColor: "#e0e0e0" }),
              }}
              onClick={() => handleButtonClick("edit")}
            >
              <Icon>edit</Icon>
            </Fab>
          </Box>
        )}
        {["delete"].includes(activeButton) && sensors.length > 0 ? (
          <Button
            className={classes.discardButton}
            onClick={(event) => (activeButton === "delete" ? setConfirmationDialog(6) : handleSuspension())}
          >
            {activeButton}
          </Button>
        ) : null}
        <ConfirmationDialog
          confirmationDialog={confirmationDialog}
          open={confirmationDialog > 0}
          onClose={() => setConfirmationDialog(0)}
          confirmAction={confirmAction}
          confirmationMsg="Are you sure you want to delete this investigator(s)?."
        />
        {isEditing && (
          <div style={{ display: "flex", gap: "8px", marginLeft: "8px" }}>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#7599FF",
                color: "white",
                // '&:hover': {
                //     backgroundColor: '#5680f9'
                // }
              }}
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              style={{
                color: "#7599FF",
                borderColor: "#7599FF",
                // '&:hover': {
                //     borderColor: '#5680f9',
                //     color: '#5680f9'
                // }
              }}
              onClick={handleDiscardChanges}
            >
              Discard Changes
            </Button>
          </div>
        )}
        <ConfirmationDialog
          confirmationDialog={confirmationDialog}
          open={confirmationDialog > 0}
          onClose={() => setConfirmationDialog(0)}
          confirmAction={confirmAction}
          confirmationMsg="Are you sure you want to delete this investigator(s)?."
        />
      </CardActions>
      {showCopyTooltip && <CopyTooltip text="Copied!" position={tooltipPosition} />}
      <StudiesPreviewDialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} data={previewData} />
      <div className={classes.tableWrapper}>
        <table
          style={{
            width: "max-content",
            minWidth: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
          }}
        >
          <thead>
            <tr
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "rgb(249, 250, 251)",
              }}
            >
              {activeButton && (
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: "rgb(213 213 213)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid rgb(229, 231, 235)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Select
                </th>
              )}
              {selectedColumns.map((key) => (
                <th
                  key={key}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: "rgb(213 213 213)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid rgb(229, 231, 235)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatValue(columns[key], "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: SensorData, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${classes.tableRow} ${
                  selectedRow === rowIndex || selectedRows.includes(rowIndex) ? classes.selectedRow : ""
                }`}
                // onClick={(e) => {!activeButton && onRowClick?.(row) && handleRowSelection(rowIndex, row)}}
                onClick={(e) => {
                  if (onRowClick) onRowClick(row)
                  handleRowSelection(rowIndex, row)
                }}
              >
                {activeButton && (
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid rgb(229, 231, 235)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeButton === "edit" || activeButton === "arrow_forward" ? (
                      <input
                        type="radio"
                        checked={selectedRow === rowIndex}
                        onChange={() => handleRowSelection(rowIndex, row)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rowIndex)}
                        onChange={() => handleRowSelection(rowIndex, row)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </td>
                )}
                {selectedColumns.map((key) => (
                  <td
                    key={`${rowIndex}-${key}`}
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgb(17, 24, 39)",
                      borderBottom: "1px solid rgb(229, 231, 235)",
                      position: "relative",
                    }}
                  >
                    {renderCell(rowIndex, key, getValue(row, key), row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DynamicTableSensors
