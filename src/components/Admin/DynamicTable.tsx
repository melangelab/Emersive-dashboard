import React, { useState, useEffect } from "react"
import { get } from "lodash"
import dayjs from "dayjs"
import Credentials from "../Credentials"
import DeleteResearcher from "./DeleteResearcher"
import AddUpdateResearcher from "./AddUpdateResearcher"
import {
  Box,
  Fab,
  CardActions,
  Icon,
  makeStyles,
  createStyles,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core"
import { Theme } from "@material-ui/core/styles"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import ConfirmationDialog from "../ConfirmationDialog"
import { ReactComponent as ColumnIcon } from "/home/temp1/LampCode/LAMP-dashboard/src/icons/Pictogrammers-Material-Table-filter.svg"

interface ColumnConfig {
  [key: string]: string
}

interface ResearcherData {
  id: string
  [key: string]: any
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

    tableRow: {
      backgroundColor: "#ffffff !important",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "#f3f4f6 !important",
      },
    },
    selectedRow: {
      backgroundColor: "#e5e7eb !important",
      "&:hover": {
        backgroundColor: "#e5e7eb !important",
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
  })
)

interface DynamicTableProps {
  columns: ColumnConfig
  editable_columns: string[]
  data: ResearcherData[]
  className?: string
  onRowClick?: (row: any) => void
  emptyStateMessage?: string
  isLoading?: boolean
  adminType?: string
  maxHeight?: string
  history?: any
  refreshResearchers?: () => void
  updateStore?: () => void
}

const CopyTooltip: React.FC<{ text: string; position: { x: number; y: number } }> = ({ text, position }) => {
  const classes = useStyles()
  return (
    <div
      className={classes.copiedTooltip}
      style={{
        left: position.x,
        top: position.y - 30,
      }}
    >
      {text}
    </div>
  )
}

const StatusIndicator = ({ isOnline }) => {
  const circleStyles = {
    dot: {
      fill: isOnline ? "#22c55e" : "#ef4444", // green-500 and red-500 colors
      transition: "fill 0.2s ease-in-out",
    },
    pulse: {
      fill: isOnline ? "#22c55e" : "transparent",
      opacity: 0.25,
      animation: isOnline ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
    },
    container: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
    text: {
      fontSize: "14px",
      fontFamily: "sans-serif",
      color: "#374151", // gray-700
    },
  }

  return (
    <div style={circleStyles.container}>
      <svg width="12" height="12" viewBox="0 0 12 12">
        {/* Pulse circle */}
        <circle
          cx="6"
          cy="6"
          r="6"
          // style={circleStyles.pulse}
        />
        {/* Main status circle */}
        <circle cx="6" cy="6" r="5" style={circleStyles.dot} />
      </svg>
      {/* <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.25; }
            50% { transform: scale(1.5); opacity: 0.15; }
          }
        `}
      </style> */}
    </div>
  )
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  editable_columns,
  data,
  className = "",
  onRowClick,
  emptyStateMessage = "No data available",
  isLoading = false,
  adminType,
  history,
  refreshResearchers,
  updateStore,
}) => {
  const columnKeys = Object.keys(columns)
  const classes = useStyles()

  const [researcher, setResearcher] = useState(null)
  const [researchers, setResearchers] = useState([])
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

  const [showCopyTooltip, setShowCopyTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Handle cell edit
  const handleCellEdit = (rowIndex: number, columnKey: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [`${rowIndex}-${columnKey}`]: value,
    }))
  }

  const handleSaveEdit = async () => {
    try {
      // Group edits by row
      const rowEdits = {}
      console.log("HEY THE ROWEDITS", rowEdits)
      Object.entries(editedData).forEach(([key, value]) => {
        const [rowIndex, columnKey] = key.split("-")
        if (!rowEdits[rowIndex]) rowEdits[rowIndex] = {}
        rowEdits[rowIndex][columnKey] = value
      })

      console.log("HEY THE ROWEDITS", rowEdits)

      // Update each modified row
      for (const [rowIndex, updates] of Object.entries(rowEdits)) {
        const currentResearcher = data[Number(rowIndex)]
        if (!currentResearcher || typeof currentResearcher !== "object") {
          console.error("Invalid researcher data")
          continue
        }

        const updatedResearcher = {
          ...currentResearcher,
          ...(updates as Partial<ResearcherData>),
        } as ResearcherData

        // Ensure we have an ID before updating
        if (!updatedResearcher.id) {
          console.error("Missing researcher ID")
          continue
        }

        await LAMP.Researcher.update(updatedResearcher.id, updatedResearcher)
      }

      enqueueSnackbar("Successfully updated researcher(s)", { variant: "success" })
      setEditedData({})
      setIsEditing(false)
      setSelectedRow(null)
      setActiveButton(null)
      refreshResearchers?.()
    } catch (error) {
      enqueueSnackbar("Failed to update researcher(s)", { variant: "error" })
    }
  }

  const copyToClipboard = (text: string, event: React.MouseEvent) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setTooltipPosition({ x: event.clientX, y: event.clientY })
        setShowCopyTooltip(true)
        setTimeout(() => setShowCopyTooltip(false), 1000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  const handleRowSelection = (rowIndex: number, row: any) => {
    if (!activeButton) {
      onRowClick?.(row)
      return
    }

    if (activeButton === "edit" || activeButton === "arrow_forward") {
      setSelectedRow(rowIndex)
      setResearcher(row)
      if (activeButton === "arrow_forward") {
        history.push(`/researcher/${row.id}/studies`)
      }
    } else if (activeButton === "delete" || activeButton === "suspend") {
      const updatedSelection = selectedRows.includes(rowIndex)
        ? selectedRows.filter((i) => i !== rowIndex)
        : [...selectedRows, rowIndex]
      setSelectedRows(updatedSelection)
      setResearchers(updatedSelection.map((index) => data[index]))
    }
  }

  // Add handleCellClick for copying
  const handleCellClick = (event: React.MouseEvent, value: any, rowIndex: number, row: any) => {
    if (!activeButton && value) {
      event.stopPropagation()
      const textValue = typeof value === "object" ? JSON.stringify(value) : String(value)
      copyToClipboard(textValue, event)
    } else if (activeButton) {
      handleRowSelection(rowIndex, row)
    }
  }

  // Update renderCell to include copy functionality
  const renderCell = (rowIndex: number, columnKey: string, value: any, row: any) => {
    const isEditable = editable_columns.includes(columnKey) && activeButton === "edit" && selectedRow === rowIndex

    if (!isEditable) {
      return (
        <div
          className={!activeButton && columnKey != "loggedIn" ? classes.copyableCell : undefined}
          onClick={(e) => handleCellClick(e, value, rowIndex, row)}
        >
          {formatValue(value, columnKey)}
        </div>
      )
    }

    const editValue = editedData[`${rowIndex}-${columnKey}`] ?? value
    return (
      <input
        type="text"
        value={editValue || ""}
        onChange={(e) => {
          handleCellEdit(rowIndex, columnKey, e.target.value)
          setIsEditing(true)
        }}
        className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  const handleColumnMenuOpen = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: buttonRect.bottom + window.scrollY,
      left: buttonRect.left + window.scrollX,
    })
    setAnchorEl(event.currentTarget)
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
      setResearcher(null)
      setResearchers([])
    } else {
      // Activate button and clear previous selections
      setActiveButton(buttonType)
      setSelectedRow(null)
      setSelectedRows([])
      setResearcher(null)
      setResearchers([])
    }
  }

  useEffect(() => {
    console.log("researchers selected", researchers)
  }, [researchers])

  const confirmAction = async (status) => {
    if (status === "Yes") {
      let successCount = 0
      let failureCount = 0

      // Assuming researchers is an array of researcher objects
      for (const researcher of researchers) {
        try {
          // Get credentials first
          const credentials = await LAMP.Credential.list(researcher.id)
          const filteredCreds = credentials.filter((c) => c.hasOwnProperty("origin"))

          // Delete all credentials
          await Promise.all(
            filteredCreds.map((cred) =>
              LAMP.Credential.delete(researcher.id, cred["access_key"]).catch((error) => {
                console.error(`Failed to delete credential ${cred["access_key"]}:`, error)
                throw error
              })
            )
          )

          // After credentials are deleted, delete the researcher
          const deleteResult = (await LAMP.Researcher.delete(researcher.id)) as any

          if (deleteResult?.error === undefined) {
            enqueueSnackbar(t("Successfully deleted the investigator and all associated credentials."), {
              variant: "success",
            })
            successCount++
          } else {
            failureCount++
            enqueueSnackbar(t("Failed to delete the investigator."), {
              variant: "error",
            })
          }
        } catch (error) {
          failureCount++
          enqueueSnackbar(t("Failed to delete the investigator or their credentials."), {
            variant: "error",
          })
          console.error(`Error in deletion process for researcher ${researcher.id}:`, error)
        }
      }

      // Show appropriate notification based on results
      if (successCount > 0 && failureCount === 0) {
        enqueueSnackbar(
          successCount === 1
            ? t("Successfully deleted the investigator.")
            : t("Successfully deleted all investigators."),
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

      refreshResearchers()
      setConfirmationDialog(0)
      setResearchers([])
      setActiveButton(null)
    }
  }

  const formatValue = (value: any, key: string) => {
    console.log(value, key)
    if (key === "loggedIn") return <StatusIndicator isOnline={value} />
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

  const getCellClass = (value) => {
    if (value === null || value === undefined) {
      return "px-2 py-2 text-center whitespace-nowrap"
    }
    const wordCount = String(value).trim().split(/\s+/).length
    return `px-2 py-2 text-center ${wordCount > 3 ? "whitespace-normal" : "whitespace-nowrap"}`
  }

  const handleSuspension = () => {
    console.log(researchers)
    let successCount = 0
    let failureCount = 0
    for (const researcher of researchers) {
      try {
        researcher.status = "SUSPENDED"
        researcher.timestamps.suspendedAt = new Date().getTime()
        LAMP.Researcher.update(researcher.id, researcher)
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
    refreshResearchers()
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
        overflow: "hidden", // Changed from 'auto' to 'hidden'
      }}
    >
      {showCopyTooltip && <CopyTooltip text="Copied!" position={tooltipPosition} />}
      <CardActions
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20, // Increased z-index
          backgroundColor: "white",
          padding: "0.5rem 0",
          display: "flex",
          justifyContent: "center",
          width: "100%",
          borderBottom: "1px solid rgb(229, 231, 235)",
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
              <ColumnIcon width={24} height={24} />
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
                ...(activeButton === "edit" && { backgroundColor: "#e0e0e0" }),
              }}
              onClick={() => handleButtonClick("edit")}
            >
              <Icon>edit</Icon>
            </Fab>
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
                ...(activeButton === "suspend" && { backgroundColor: "#e0e0e0" }),
              }}
              onClick={() => handleButtonClick("suspend")}
            >
              <Icon>block</Icon>
            </Fab>
          </Box>
        )}
        {adminType !== "user_admin" && (
          <Fab
            size="small"
            style={{
              backgroundColor: "white",
              ...(activeButton === "arrow_forward" && { backgroundColor: "#e0e0e0" }),
            }}
            onClick={() => handleButtonClick("arrow_forward")}
          >
            <Icon>arrow_forward</Icon>
          </Fab>
        )}
        {["delete", "suspend"].includes(activeButton) && researchers.length > 0 ? (
          <Button onClick={(event) => (activeButton === "delete" ? setConfirmationDialog(6) : handleSuspension())}>
            {activeButton}
          </Button>
        ) : null}
        {isEditing && (
          <div style={{ display: "" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
              style={{ marginLeft: "8px", marginRight: "8px" }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setEditedData({})
                setIsEditing(false)
                setSelectedRow(null)
                setActiveButton(null)
              }}
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
      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
          marginTop: "14px",
        }}
      >
        <table
          style={{
            width: "max-content",
            minWidth: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed", // Added for better column width handling
          }}
        >
          <thead>
            <tr
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "rgb(213 213 213)",
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
                    position: "sticky",
                    top: 0,
                    zIndex: 11,
                    minWidth: "80px", // Added minimum width for select column
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
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${classes.tableRow} ${
                  selectedRow === rowIndex || selectedRows.includes(rowIndex) ? classes.selectedRow : ""
                }`}
                onClick={(e) => handleRowSelection(rowIndex, row)}
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
                      whiteSpace: "nowrap",
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

export default DynamicTable
