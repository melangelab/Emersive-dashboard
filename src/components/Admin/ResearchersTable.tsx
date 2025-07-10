import React, { useState, useEffect, useCallback } from "react"
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
  TextField,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
  Typography,
} from "@material-ui/core"
import { Theme } from "@material-ui/core/styles"
import LAMP, { Researcher } from "lamp-core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import ConfirmationDialog from "../ConfirmationDialog"
import { ReactComponent as ColumnIcon } from "../../icons/Pictogrammers-Material-Table-filter.svg"

import { ReactComponent as ViewResearcher } from "../../icons/NewIcons/overview.svg"
import { ReactComponent as Edit } from "../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as Save } from "../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as PasswordEdit } from "../../icons/NewIcons/password-lock.svg"
import { ReactComponent as Suspend } from "../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as UnSuspend } from "../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as Delete } from "../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as VisualizeResearcher } from "../../icons/NewIcons/arrow-left-to-arc.svg"
import { ReactComponent as RefreshIcon } from "../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as TableIcon } from "../../icons/NewIcons/table-list.svg"
import { ReactComponent as TableIconFilled } from "../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as GridIcon } from "../../icons/NewIcons/objects-column.svg"
import { ReactComponent as GridIconFilled } from "../../icons/NewIcons/objects-column-filled.svg"
import { ReactComponent as FilterColumns } from "../../icons/NewIcons/columns-3.svg"
import { ReactComponent as Filter } from "../../icons/NewIcons/filters.svg"
import { ReactComponent as FilterFilled } from "../../icons/NewIcons/filters-filled.svg"
import { ReactComponent as Download } from "../../icons/NewIcons/progress-download.svg"

import "./admin.css"
import SearchBox from "../SearchBox"
import CommonTable, { TableColumn } from "../Researcher/CommonTable"

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

const TableActionsDiv = ({
  row,
  selectedRow,
  rowIndex,
  history,
  setSelectedRow,
  activeButton,
  setActiveButton,
  setResearcherSelected,
  ...props
}) => {
  console.warn("TableActionsDiv props: row.id", row.id, "activeButton", activeButton, props.key)
  // Helper function to determine if this row has the active button
  const isActiveForThisRow = (buttonType) => activeButton.id === row.id && activeButton.action === buttonType
  const [updatedPassword, setUpdatedPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const actionTriggeredRef = React.useRef(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    console.warn("received activebutton", activeButton)
  }, [activeButton])
  // Helper function to determine suspend/unsuspend state
  const isSuspended = () => {
    return "status" in row && row.status === "SUSPENDED"
  }

  const handleActionClick = (buttonType) => {
    setResearcherSelected(row)
    setSelectedRow(rowIndex)

    if (buttonType === "arrow_forward") {
      history.push(`/researcher/${row.id}/studies`)
    } else if (buttonType === "view") {
      props.changeElement({ researcher: row, idx: rowIndex })
    } else if (buttonType === "save") {
      props.handleSaveEdit()
    } else if (buttonType === "delete") {
      props.setConfirmationDialog(6)
    } else if (["edit", "suspend", "unsuspend"].includes(buttonType)) {
      // Reset the action triggered flag when changing the active button
      actionTriggeredRef.current = false
      console.warn("Action triggered for button:", buttonType, activeButton)
      if (activeButton.id === row.id && activeButton.action === buttonType) {
        setActiveButton({ id: null, action: null })
      } else {
        setActiveButton({ id: row.id, action: buttonType })
      }
    } else if (buttonType === "passwordEdit") {
      // Open the password reset dialog
      setShowPasswordDialog(true)
      setUpdatedPassword("")
      setConfirmPassword("")
      setPasswordError("")
    }
  }

  const handleSubmitPassword = async () => {
    try {
      // Validate passwords
      if (updatedPassword !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }

      console.log("IN THE UPDATED PASSWORD", confirmPassword)

      try {
        console.log("Attempting to update credential...")
        const credlist = await LAMP.Credential.list(props.researcherSelected.id)
        const response = (await LAMP.Credential.update(props.researcherSelected.id, props.researcherSelected.email, {
          ...(credlist[0] as any),
          secret_key: confirmPassword,
        })) as any
        console.log("Update response:", response)

        // Check if response contains error
        if (response && response.error === "404.no-such-credentials") {
          console.log("Attempting to create new credential...")
          await LAMP.Credential.create(props.researcherSelected.id, props.researcherSelected.email, confirmPassword)
          enqueueSnackbar("Successfully created new credential", { variant: "success" })
        } else {
          enqueueSnackbar("Successfully updated credential", { variant: "success" })
        }
      } catch (updateError) {
        console.error("Operation error:", updateError)
        throw updateError
      }

      setShowPasswordDialog(false)
    } catch (error) {
      console.error("Final error:", error)
      enqueueSnackbar(`Failed to create/update credential: ${error.message || "Unknown error"}`, { variant: "error" })
    }
  }

  const handleCloseDialog = () => {
    setShowPasswordDialog(false)
    setPasswordError("")
  }

  useEffect(() => {
    const currentResearcher = row
    console.warn("Current researcher:", currentResearcher, actionTriggeredRef.current)
    // Only proceed if the action hasn't been triggered yet and we have the right conditions
    if (!actionTriggeredRef.current) {
      if (activeButton.action === "suspend" && activeButton.id === row.id) {
        actionTriggeredRef.current = true
        props.handleSuspension()
        setActiveButton({ id: null, action: null })
      } else if (activeButton.action === "unsuspend" && activeButton.id === row.id) {
        actionTriggeredRef.current = true
        props.handleUnSuspension()
        setActiveButton({ id: null, action: null })
      }
    }

    // Cleanup function to reset the flag when unmounting or when dependencies change
    return () => {
      // Only reset under specific conditions to prevent unwanted re-triggers
      if (activeButton.action !== "suspend" && activeButton.action !== "unsuspend") {
        actionTriggeredRef.current = false
      }
    }
  }, [activeButton, selectedRow, rowIndex, row.id])

  return (
    <>
      <div className="table-actions-container">
        {/* Visualize Researcher */}
        <div className={`table-actions-icon-container`} onClick={() => handleActionClick("arrow_forward")}>
          <VisualizeResearcher className="table-actions-icon" style={{ transform: "scaleX(-1)" }} />
        </div>

        {/* View Researcher */}
        <div className={`table-actions-icon-container`} onClick={() => handleActionClick("view")}>
          <ViewResearcher className="table-actions-icon" />
        </div>

        {/* Edit Researcher */}
        <div
          className={`table-actions-icon-container ${
            activeButton.id === row.id && activeButton.action === "edit" ? "active" : ""
          }`}
          onClick={() => handleActionClick("edit")}
        >
          <Edit className="table-actions-icon" />
        </div>

        {/* Save Researcher */}
        <div
          className={`table-actions-icon-container ${props.isEditing ? "" : "disabled-icon-container"}`}
          onClick={() => (props.isEditing ? handleActionClick("save") : null)}
        >
          <Save className={`table-actions-icon ${props.isEditing ? "" : "disabled-icon"}`} />
        </div>

        {/* Password Edit */}
        <div className="table-actions-icon-container">
          <PasswordEdit className="table-actions-icon" onClick={() => handleActionClick("passwordEdit")} />
        </div>

        {/* Suspend/Unsuspend Researcher */}
        <div
          className={`table-actions-icon-container `}
          onClick={() => handleActionClick(isSuspended() ? "unsuspend" : "suspend")}
        >
          {isSuspended() ? <UnSuspend className="table-actions-icon" /> : <Suspend className="table-actions-icon" />}
        </div>

        {/* Delete Researcher */}
        <div
          className={`table-actions-icon-container ${
            activeButton.id === row.id && activeButton.action === "delete" ? "active" : ""
          }`}
          onClick={() => handleActionClick("delete")}
        >
          <Delete className="table-actions-icon" />
        </div>
      </div>

      {/* Password Reset Dialog using Material-UI */}
      <Dialog open={showPasswordDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Reset Researcher Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Typography color="error" variant="body2" gutterBottom>
              {passwordError}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="new-password"
            label="New Password"
            type="password"
            fullWidth
            value={updatedPassword}
            onChange={(e) => setUpdatedPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            id="confirm-password"
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleSubmitPassword} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

interface ResearcherTableProps {
  editable_columns: string[]
  data: ResearcherData[]
  className?: string
  onRowClick?: (row: any) => void
  emptyStateMessage?: string
  isLoading?: boolean
  adminType?: string
  maxHeight?: string
  history?: any
  researchers?: Researcher[]
  originalColumnKeys: string[]
  selectedColumns: string[]
  refreshResearchers?: () => void
  updateStore?: () => void
  changeElement?: (value: any) => void
  onResearchersUpdate?: (updatedResearchers: ResearcherData[]) => void
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
        <circle cx="6" cy="6" r="6" />
        <circle cx="6" cy="6" r="5" style={circleStyles.dot} />
      </svg>
    </div>
  )
}

const ResearchersTable = ({
  editable_columns,
  data,
  className = "",
  onRowClick,
  emptyStateMessage = "No data available",
  isLoading = false,
  adminType,
  history,
  originalColumnKeys,
  selectedColumns,
  refreshResearchers,
  updateStore,
  changeElement,
  onResearchersUpdate,
  ...props
}) => {
  const classes = useStyles()

  const [researcherSelected, setResearcherSelected] = useState(null)
  const [researchersSelected, setResearchersSelected] = useState([])
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [confirmationDialog, setConfirmationDialog] = useState(0)

  // Add new state for column selection
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const [editedData, setEditedData] = useState<{ [key: string]: any }>({})
  const [isEditing, setIsEditing] = useState(false)

  const [showCopyTooltip, setShowCopyTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const [editingResearcher, setEditingResearcher] = useState(null)
  const [filters, setFilters] = useState({})
  const [activeButtonTable, setActiveButtonTable] = useState({ id: null, action: null })
  const [confirmationDialogTable, setConfirmationDialogTable] = useState(false)

  useEffect(() => {
    console.warn("Active button table changed:", activeButtonTable)
  }, [activeButtonTable])

  const columns: TableColumn[] = selectedColumns.map((col) => ({
    id: col.id,
    label: col.label,
    value: col.value,
    visible: true,
    sortable: col.sortable,
    filterable: true,
    filterType: "text",
  }))

  const renderCellContent = (column, row) => {
    const isEditable =
      editable_columns.includes(column.id) && activeButtonTable?.id === row.id && activeButtonTable?.action === "edit"
    if (!isEditable) {
      return (
        <div
          className={!activeButtonTable.action && column.id !== "loggedIn" ? classes.copyableCell : undefined}
          onClick={(e) => {
            if (!activeButtonTable.action && row[column.id] && column.id !== "loggedIn") {
              const textValue =
                typeof row[column.id] === "object" ? JSON.stringify(row[column.id]) : String(row[column.id])
              navigator.clipboard.writeText(textValue)
              setTooltipPosition({ x: e.clientX, y: e.clientY })
              setShowCopyTooltip(true)
              setTimeout(() => setShowCopyTooltip(false), 1000)
            }
          }}
        >
          {formatValue(row[column.id], column.id)}
        </div>
      )
    }
    const editKey = `${row.id}-${column.id}`
    const currentValue = editedData[editKey] !== undefined ? editedData[editKey] : row[column.id]

    return (
      <input
        type="text"
        value={currentValue ?? ""}
        onChange={(e) => setEditedData((prev) => ({ ...prev, [editKey]: e.target.value }))}
        className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  // Actions column
  const actions = useCallback(
    (row) => (
      <TableActionsDiv
        key={row.id + "-" + activeButtonTable.id + "-" + activeButtonTable.action}
        row={row}
        rowIndex={data.findIndex((r) => r.id === row.id)}
        history={history}
        setSelectedRow={setSelectedRow}
        selectedRow={selectedRow}
        setActiveButton={(abt) => {
          console.warn("Setting active button from row:", row.id, "with row, action:", abt)
          setActiveButtonTable({ id: abt.id, action: abt.action })
        }}
        activeButton={activeButtonTable}
        researcherSelected={editingResearcher}
        setResearcherSelected={setEditingResearcher}
        changeElement={changeElement}
        isEditing={!!editingResearcher && editingResearcher.id === row.id}
        setIsEditing={() => setEditingResearcher(row)}
        setEditedData={setEditedData}
        handleSaveEdit={async () => {
          // Save logic (similar to before)
          try {
            const rowEdits = {}
            Object.entries(editedData).forEach(([key, value]) => {
              if (key.startsWith(`${row.id}-`)) {
                const columnKey = key.replace(`${row.id}-`, "")
                rowEdits[columnKey] = value
              }
            })

            const updatedResearcher = { ...row, ...rowEdits }
            await LAMP.Researcher.update(row.id, updatedResearcher)
            enqueueSnackbar("Successfully updated researcher", { variant: "success" })
            const newEditedData = { ...editedData }
            Object.keys(newEditedData).forEach((key) => {
              if (key.startsWith(`${row.id}-`)) {
                delete newEditedData[key]
              }
            })
            setEditedData(newEditedData)
            setEditingResearcher(null)
            setActiveButtonTable({ id: null, action: null })
            onResearchersUpdate([updatedResearcher])
          } catch {
            enqueueSnackbar("Failed to update researcher", { variant: "error" })
          }
        }}
        handleSuspension={async () => {
          // Suspend logic
          try {
            const updatedResearcher = {
              ...row,
              status: "SUSPENDED",
              timestamps: {
                ...row.timestamps,
                suspendedAt: new Date().getTime(),
              },
            }

            await LAMP.Researcher.update(row.id, {
              ...updatedResearcher,
            })
            enqueueSnackbar("Suspended researcher", { variant: "success" })
            setActiveButtonTable({ id: null, action: null })
            onResearchersUpdate([updatedResearcher])
          } catch {
            enqueueSnackbar("Failed to suspend", { variant: "error" })
          }
        }}
        handleUnSuspension={async () => {
          // Unsuspend logic
          try {
            const updatedResearcher = {
              ...row,
              status: "ACTIVE",
            }
            await LAMP.Researcher.update(row.id, updatedResearcher)
            enqueueSnackbar("Unsuspended researcher", { variant: "success" })
            setActiveButtonTable({ id: null, action: null })
            onResearchersUpdate([updatedResearcher])
          } catch {
            enqueueSnackbar("Failed to unsuspend", { variant: "error" })
          }
        }}
        setConfirmationDialog={setConfirmationDialogTable}
      />
    ),
    [activeButtonTable, data, selectedRow, editingResearcher, editedData]
  )

  // const confirmActionTable = async (status) => {
  //   if (status === "Yes" && editingResearcher) {
  //     try {
  //       await LAMP.Researcher.delete(editingResearcher.id)
  //       enqueueSnackbar("Deleted researcher", { variant: "success" })
  //       refreshResearchers?.()
  //     } catch {
  //       enqueueSnackbar("Failed to delete", { variant: "error" })
  //     }
  //   }
  //   setConfirmationDialogTable(false)
  //   setEditingResearcher(null)
  // }

  const confirmActionTable = async (status) => {
    if (status === "Yes" && editingResearcher) {
      try {
        const credentials = await LAMP.Credential.list(editingResearcher.id)
        const filteredCreds = credentials.filter((c) => c.hasOwnProperty("origin"))

        await Promise.all(
          filteredCreds.map((cred) =>
            LAMP.Credential.delete(editingResearcher.id, cred["access_key"]).catch((error) => {
              console.error(`Failed to delete credential ${cred["access_key"]}:`, error)
              throw error
            })
          )
        )

        const deleteResult = (await LAMP.Researcher.delete(editingResearcher.id)) as any

        if (deleteResult?.error === undefined) {
          enqueueSnackbar(t("Successfully deleted the investigator and all associated credentials."), {
            variant: "success",
          })
        } else {
          enqueueSnackbar(t("Failed to delete the investigator."), {
            variant: "error",
          })
        }
        refreshResearchers?.()
      } catch (error) {
        enqueueSnackbar(t("Failed to delete the investigator or their credentials."), {
          variant: "error",
        })
        console.error(`Error in deletion process for researcher ${editingResearcher.id}:`, error)
      }
    }
    setConfirmationDialogTable(false)
    setEditingResearcher(null)
  }

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

      let updatedResearcher

      console.log("HEY THE ROWEDITS", rowEdits)
      // Update each modified row
      for (const [rowIndex, updates] of Object.entries(rowEdits)) {
        const currentResearcher = data[Number(rowIndex)]
        if (!currentResearcher || typeof currentResearcher !== "object") {
          console.error("Invalid researcher data")
          continue
        }

        updatedResearcher = {
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
      // refreshResearchers?.()
      onResearchersUpdate([updatedResearcher])
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

  // Add handleCellClick for copying
  const handleCellClick = (event: React.MouseEvent, value: any, rowIndex: number, row: any) => {
    if (!activeButton && value) {
      event.stopPropagation()
      const textValue = typeof value === "object" ? JSON.stringify(value) : String(value)
      copyToClipboard(textValue, event)
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

  const handleButtonClick = (buttonType: string) => {
    if (activeButton === buttonType) {
      // Deactivate button and clear selections
      setActiveButton(null)
      setSelectedRow(null)
      setSelectedRows([])
      setResearcherSelected(null)
      setResearchersSelected([])
    } else {
      // Activate button and clear previous selections
      setActiveButton(buttonType)
      setSelectedRow(null)
      setSelectedRows([])
      setResearcherSelected(null)
      setResearchersSelected([])
    }
  }

  useEffect(() => {
    console.log("researchers selected", researchersSelected)
  }, [researchersSelected])

  const confirmAction = async (status) => {
    if (status === "Yes") {
      let successCount = 0
      let failureCount = 0

      const researchersToUpdate = researchersSelected.length > 0 ? researchersSelected : [researcherSelected]
      let updatedResearchers

      // Assuming researchers is an array of researcher objects
      for (const researcher of researchersToUpdate) {
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
      // onResearchersUpdate(researchersToUpdate)
      setConfirmationDialog(0)
      setResearchersSelected([])
      setResearcherSelected(null)
      setActiveButton(null)
    } else {
      setConfirmationDialog(0)
      setResearcherSelected(null)
    }
  }

  const formatValue = (value: any, key: string) => {
    console.warn(value, key)
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

  const updateData = async (updatedResearchers) => {}

  const handleSuspension = async () => {
    try {
      console.warn("Researcher selected suspended,", researcherSelected)

      const researchersToUpdate = researchersSelected.length > 0 ? researchersSelected : [researcherSelected]
      let updatedResearchers = []
      // Create an array of promises for all updates
      const updatePromises = researchersToUpdate.map(async (researcher) => {
        try {
          const updatedResearcher = {
            ...researcher,
            status: "SUSPENDED",
            timestamps: {
              ...researcher.timestamps,
              suspendedAt: new Date().getTime(),
            },
          }

          await LAMP.Researcher.update(researcher.id, updatedResearcher)
          updatedResearchers.push(updatedResearcher)
          return { success: true, id: researcher.id }
        } catch (error) {
          console.error(`Error suspending researcher ${researcher.id}:`, error)
          return { success: false, id: researcher.id, error }
        }
      })

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises)
      const successCount = results.filter((r) => r.success).length
      const failureCount = results.filter((r) => !r.success).length

      // Show appropriate notification based on results
      if (failureCount === 0) {
        enqueueSnackbar(`Successfully suspended ${successCount} researcher(s)`, { variant: "success" })
      } else if (successCount > 0) {
        enqueueSnackbar(`Suspended ${successCount} researcher(s), failed to update ${failureCount}`, {
          variant: "warning",
        })
      } else {
        enqueueSnackbar("Failed to suspend researchers", { variant: "error" })
      }

      // Reset selections and refresh data
      setResearchersSelected([])
      setResearcherSelected(null)
      setActiveButton(null)
      setSelectedRow(null)
      setSelectedRows([])
      // refreshResearchers();
      onResearchersUpdate(updatedResearchers)
    } catch (error) {
      console.error("Error in handleSuspension:", error)
      enqueueSnackbar("Error suspending researchers", { variant: "error" })
    }
  }

  const handleUnSuspension = async () => {
    try {
      console.warn("Researcher selected unsuspected", researcherSelected)

      const researchersToUpdate = researchersSelected.length > 0 ? researchersSelected : [researcherSelected]
      let updatedResearchers = []
      // Create an array of promises for all updates
      const updatePromises = researchersToUpdate.map(async (researcher) => {
        try {
          const updatedResearcher = {
            ...researcher,
            status: "ACTIVE",
            // No need to update suspendedAt timestamp when unsuspending
          }

          await LAMP.Researcher.update(researcher.id, updatedResearcher)
          updatedResearchers.push(updatedResearcher)
          return { success: true, id: researcher.id }
        } catch (error) {
          console.error(`Error unsuspending researcher ${researcher.id}:`, error)
          return { success: false, id: researcher.id, error }
        }
      })

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises)
      const successCount = results.filter((r) => r.success).length
      const failureCount = results.filter((r) => !r.success).length

      // Show appropriate notification based on results
      if (failureCount === 0) {
        enqueueSnackbar(`Successfully unsuspended ${successCount} researcher(s)`, { variant: "success" })
      } else if (successCount > 0) {
        enqueueSnackbar(`Unsuspended ${successCount} researcher(s), failed to update ${failureCount}`, {
          variant: "warning",
        })
      } else {
        enqueueSnackbar("Failed to unsuspend researchers", { variant: "error" })
      }

      // Reset selections and refresh data
      setResearchersSelected([])
      setResearcherSelected(null)
      setActiveButton(null)
      setSelectedRow(null)
      setSelectedRows([])
      // refreshResearchers();
      onResearchersUpdate(updatedResearchers)
    } catch (error) {
      console.error("Error in handleUnSuspension:", error)
      enqueueSnackbar("Error unsuspending researchers", { variant: "error" })
    }
  }

  return (
    <React.Fragment>
      <div className="table-container">
        {showCopyTooltip && <CopyTooltip text="Copied!" position={tooltipPosition} />}
        <ConfirmationDialog
          confirmationDialog={confirmationDialogTable ? 1 : 0}
          open={!!confirmationDialogTable}
          onClose={() => setConfirmationDialogTable(false)}
          confirmAction={confirmActionTable}
          confirmationMsg="Are you sure you want to delete this investigator?"
        />
        <CommonTable
          data={data}
          columns={columns}
          actions={actions}
          selectable={true}
          selectedRows={selectedRows}
          onSelectRow={(ids) => setSelectedRows(ids)}
          onSelectAll={() => setSelectedRows(selectedRows.length === data.length ? [] : data.map((r) => r.id))}
          sortConfig={{ field: null, direction: null }}
          onSort={() => {}}
          indexmap={data.reduce((acc, r, i) => ({ ...acc, [r.id]: i }), {})}
          renderCell={renderCellContent}
          filters={filters}
          onFilter={setFilters}
          filterDisplay="menu"
          categorizeItems={null}
        />
      </div>
    </React.Fragment>
  )
  return (
    <React.Fragment>
      <div className="table-container">
        {showCopyTooltip && <CopyTooltip text="Copied!" position={tooltipPosition} />}
        <ConfirmationDialog
          confirmationDialog={confirmationDialog}
          open={confirmationDialog > 0}
          onClose={() => setConfirmationDialog(0)}
          confirmAction={confirmAction}
          confirmationMsg="Are you sure you want to delete this investigator(s)?."
        />
        <table
          style={{
            minWidth: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "auto",
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
              {selectedColumns.map((col, index) => (
                <th
                  key={col.id}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid rgb(229, 231, 235)",
                    whiteSpace: "nowrap",
                    background:
                      index === selectedColumns.length - 1
                        ? "linear-gradient(to right, rgb(213, 212, 212),rgb(183, 183, 183))" // 3D effect for last column
                        : "rgb(213, 212, 212)", // Same styling for all other columns
                    boxShadow: index === selectedColumns.length - 1 ? "-3px 0px 5px rgba(0, 0, 0, 0.2)" : "none",
                    borderLeft: index === selectedColumns.length - 1 ? "3px solid #9e9e9e" : "none",
                    zIndex: index === selectedColumns.length - 1 ? 2 : "auto",
                    position: index === selectedColumns.length - 1 ? "sticky" : "static",
                    right: index === selectedColumns.length - 1 ? 0 : "auto",
                  }}
                  className={index === selectedColumns.length - 1 ? "sticky-column" : ""}
                >
                  {formatValue(col.label, "")}
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
              >
                {selectedColumns.map((col, index) => (
                  <td
                    key={`${rowIndex}-${col.id}`}
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgb(17, 24, 39)",
                      borderBottom: "1px solid rgb(229, 231, 235)",
                      whiteSpace: "nowrap",
                      background:
                        index === selectedColumns.length - 1
                          ? "linear-gradient(to right, #ffffff, #f5f5f5)" // 3D effect for last column
                          : !Object.keys(row).includes("status") || row.status === "ACTIVE"
                          ? "white"
                          : "rgb(243, 243, 243)", // Same design for other columns #e0e0e0
                      boxShadow: index === selectedColumns.length - 1 ? "-3px 0px 5px rgba(0, 0, 0, 0.2)" : "none",
                      borderLeft: index === selectedColumns.length - 1 ? "3px solid #bdbdbd" : "none",
                      zIndex: index === selectedColumns.length - 1 ? 1 : "auto",
                      position: index === selectedColumns.length - 1 ? "sticky" : "static",
                      right: index === selectedColumns.length - 1 ? 0 : "auto",
                    }}
                    className={index === selectedColumns.length - 1 ? "sticky-column" : ""}
                  >
                    {/* {renderCell(rowIndex, key, getValue(row, key), row)} */}
                    {index === selectedColumns.length - 1 ? (
                      <TableActionsDiv
                        row={row}
                        rowIndex={rowIndex}
                        history={history}
                        setSelectedRow={setSelectedRow}
                        selectedRow={selectedRow}
                        setActiveButton={setActiveButton}
                        activeButton={activeButton}
                        researcherSelected={researcherSelected}
                        setResearcherSelected={setResearcherSelected}
                        changeElement={changeElement}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        setEditedData={setEditedData}
                        handleSaveEdit={handleSaveEdit}
                        handleSuspension={handleSuspension}
                        handleUnSuspension={handleUnSuspension}
                        setConfirmationDialog={setConfirmationDialog}
                      />
                    ) : (
                      renderCell(rowIndex, col.id, getValue(row, col.id), row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  )
}

export default ResearchersTable
