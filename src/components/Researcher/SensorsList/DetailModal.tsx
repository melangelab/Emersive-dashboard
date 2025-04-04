import React from "react"
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Backdrop,
  Divider,
} from "@material-ui/core"

interface DetailModalProps {
  open: boolean
  onClose: () => void
  title: string
  content: any
  contentType: "json" | "participants" | "studies"
}

const DetailModal: React.FC<DetailModalProps> = ({ open, onClose, title, content, contentType }) => {
  if (!open) return null

  const renderContent = () => {
    switch (contentType) {
      case "json":
        return (
          <Box p={2} maxHeight="400px" overflow="auto">
            {JSON.stringify(content, null, 2)}
          </Box>
        )

      case "participants":
        return (
          <Box p={2} maxHeight="400px" overflow="auto">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Participant ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Last Logged At</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(content || []).map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.participant_id}</TableCell>
                    <TableCell>{user.lastLoggedAt ? new Date(user.lastLoggedAt).toLocaleString() : "Never"}</TableCell>
                  </TableRow>
                ))}
                {(content || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No participants
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )

      case "studies":
        return (
          <Box p={2} maxHeight="400px" overflow="auto">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Study Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Study ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Groups</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(content || []).map((study, index) => (
                  <TableRow key={index}>
                    <TableCell>{study.name}</TableCell>
                    <TableCell>{study.study_id}</TableCell>
                    <TableCell>{(study.groups || []).join(", ") || "None"}</TableCell>
                  </TableRow>
                ))}
                {(content || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No studies
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )

      default:
        return <Typography>No content to display</Typography>
    }
  }

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      style={{
        zIndex: 999999,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        style={{
          minWidth: "500px",
          maxWidth: "80vw",
          maxHeight: "80vh",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <Box p={2} bgcolor="#f5f5f5">
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Divider style={{ margin: `4px -8px 8px -8px` }} />
        {renderContent()}
      </Paper>
    </Backdrop>
  )
}

export default DetailModal
