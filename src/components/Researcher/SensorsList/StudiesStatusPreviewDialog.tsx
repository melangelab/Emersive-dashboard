import React from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar } from "@mui/material"

interface DynamicTableProps<T extends Record<string, any>> {
  data: T[]
  className?: string
  excludeKeys?: string[] // Optional array of keys to exclude from the table
}

interface DynamicTableProps<T extends Record<string, any>> {
  data: T[]
  className?: string
  excludeKeys?: string[] // Optional array of keys to exclude from the table
}

const StudiesPreviewTable = <T extends Record<string, any>>({
  data,
  className = "",
  excludeKeys = [],
}: DynamicTableProps<T>) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>No data available</div>
  }

  // Get all unique keys from all objects in the data array
  const allKeys = data.reduce((keys: string[], item) => {
    Object.keys(item).forEach((key) => {
      if (!keys.includes(key) && !excludeKeys.includes(key)) {
        keys.push(key)
      }
    })
    return keys
  }, [])

  // Function to format the header text (capitalize and replace underscores with spaces)
  const formatHeaderText = (text: string): string => {
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to format cell value based on its type
  const formatCellValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return "-"
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No"
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "-"
      }
      // For dates or other objects
      if (value instanceof Date) {
        return value.toLocaleDateString()
      }
      return JSON.stringify(value)
    }

    return String(value)
  }

  // Styles
  const tableStyles = {
    container: {
      overflowX: "auto" as const,
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      marginBottom: "24px",
      backgroundColor: "#ffffff",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      fontSize: "14px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    },
    thead: {
      backgroundColor: "#f9fafb",
      borderBottom: "2px solid #e5e7eb",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left" as const,
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      color: "#374151",
      borderBottom: "1px solid #e5e7eb",
    },
    tbody: {
      backgroundColor: "#ffffff",
    },
    tr: {
      borderBottom: "1px solid #e5e7eb",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    },
    td: {
      padding: "12px 16px",
      fontSize: "14px",
      color: "#4b5563",
      maxWidth: "250px",
      overflow: "auto",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    },
    evenRow: {
      backgroundColor: "#f9fafb",
    },
  }

  return (
    <div style={{ ...tableStyles.container, ...(className ? { className } : {}) }}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.thead}>
          <tr>
            {allKeys.map((key) => (
              <th key={key} scope="col" style={tableStyles.th}>
                {formatHeaderText(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={tableStyles.tbody}>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                ...tableStyles.tr,
                ...(rowIndex % 2 === 1 ? tableStyles.evenRow : {}),
              }}
            >
              {allKeys.map((key) => (
                <td key={`${rowIndex}-${key}`} style={tableStyles.td}>
                  {formatCellValue(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface StudiesPreviewDialogProps {
  open: boolean
  onClose: () => void
  data: Record<string, any>[]
}

interface DynamicTableProps<T extends Record<string, any>> {
  data: T[]
  excludeKeys?: string[]
}

const StudiesPreviewDialog: React.FC<StudiesPreviewDialogProps> = ({ open, onClose, data }) => {
  const [notification, setNotification] = React.useState<{
    open: boolean
    message: string
  }>({ open: false, message: "" })

  // Function to handle selecting all data
  const handleSelectAll = () => {
    try {
      // Convert data to a formatted JSON string
      const jsonString = JSON.stringify(data, null, 2)

      // Copy to clipboard
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          setNotification({
            open: true,
            message: "All data copied to clipboard",
          })
        })
        .catch((err) => {
          console.error("Failed to copy data: ", err)
          setNotification({
            open: true,
            message: "Failed to copy data to clipboard",
          })
        })
    } catch (error) {
      console.error("Error processing data: ", error)
      setNotification({
        open: true,
        message: "Error processing data",
      })
    }
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg">
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            gap: "25px",
          }}
        >
          <span>Studies Preview</span>
          <Button
            onClick={handleSelectAll}
            variant="outlined"
            color="primary"
            size="small"
            style={{ marginLeft: "auto" }}
          >
            Copy All Data
          </Button>
        </DialogTitle>
        <DialogContent style={{ padding: "0" }}>
          <StudiesPreviewTable data={data} />
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px" }}>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        message={notification.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  )
}

export default StudiesPreviewDialog
