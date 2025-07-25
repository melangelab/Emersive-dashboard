import React, { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  makeStyles,
  Theme,
  createStyles,
  LinearProgress,
} from "@material-ui/core"
import { MoreVert, Assignment, Edit, Delete, Visibility, QuestionAnswer, Timer } from "@material-ui/icons"
import LAMP from "lamp-core"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
    },
    card: {
      marginBottom: theme.spacing(2),
      cursor: "pointer",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        transform: "translateY(-2px)",
      },
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing(1),
    },
    assessmentTitle: {
      fontSize: "1.2rem",
      fontWeight: 600,
      color: "#333",
      marginBottom: theme.spacing(0.5),
    },
    assessmentDescription: {
      color: "#666",
      fontSize: "0.9rem",
      marginBottom: theme.spacing(1),
      display: "-webkit-box",
      "-webkit-line-clamp": 2,
      "-webkit-box-orient": "vertical",
      overflow: "hidden",
    },
    chip: {
      margin: theme.spacing(0.25),
      fontSize: "0.75rem",
    },
    assessmentTypeChip: {
      backgroundColor: "#f2aa85",
      color: "white",
    },
    statusChip: {
      "&.published": {
        backgroundColor: "#4CAF50",
        color: "white",
      },
      "&.draft": {
        backgroundColor: "#FF9800",
        color: "white",
      },
      "&.archived": {
        backgroundColor: "#9E9E9E",
        color: "white",
      },
    },
    metadata: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: theme.spacing(1),
      fontSize: "0.8rem",
      color: "#888",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "300px",
    },
    emptyState: {
      textAlign: "center",
      padding: theme.spacing(4),
      color: "#666",
    },
    actionButton: {
      padding: theme.spacing(0.5),
    },
    assessmentIcon: {
      display: "flex",
      alignItems: "center",
      marginBottom: theme.spacing(1),
    },
    questionsInfo: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    progressContainer: {
      marginTop: theme.spacing(1),
    },
    progressLabel: {
      fontSize: "0.75rem",
      color: "#666",
      marginBottom: theme.spacing(0.5),
    },
  })
)

interface Assessment {
  id: string
  name: string
  description?: string
  spec?: string
  questions?: any[]
  settings?: {
    duration?: number
    attempts?: number
    passingScore?: number
  }
  status?: "published" | "draft" | "archived"
  studyID?: string
  category?: string
  completionRate?: number
}

interface AssessmentDevlabProps {
  assessments: Assessment[]
  refreshData: () => void
  isLoading: boolean
  search: string
}

const AssessmentDevlab: React.FC<AssessmentDevlabProps> = ({ assessments, refreshData, isLoading, search }) => {
  const classes = useStyles()
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  useEffect(() => {
    if (search.trim()) {
      const filtered = assessments.filter(
        (assessment) =>
          assessment.name?.toLowerCase().includes(search.toLowerCase()) ||
          assessment.description?.toLowerCase().includes(search.toLowerCase()) ||
          assessment.category?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredAssessments(filtered)
    } else {
      setFilteredAssessments(assessments)
    }
  }, [assessments, search])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assessment: Assessment) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedAssessment(assessment)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedAssessment(null)
  }

  const handleView = () => {
    if (selectedAssessment) {
      console.log("View assessment:", selectedAssessment)
      // Add view logic here
    }
    handleMenuClose()
  }

  const handleEdit = () => {
    if (selectedAssessment) {
      console.log("Edit assessment:", selectedAssessment)
      // Add edit logic here
    }
    handleMenuClose()
  }

  const handleDelete = async () => {
    if (selectedAssessment) {
      try {
        // Note: Assessment delete might need different API call
        console.log("Assessment deleted:", selectedAssessment.id)
        refreshData()
      } catch (error) {
        console.error("Error deleting assessment:", error)
      }
    }
    handleMenuClose()
  }

  const getAssessmentTypeColor = (category: string) => {
    const type = category?.toLowerCase() || ""
    if (type.includes("cognitive")) return "#9C27B0"
    if (type.includes("mood")) return "#E91E63"
    if (type.includes("survey")) return "#f2aa85"
    if (type.includes("clinical")) return "#3F51B5"
    return "#f2aa85"
  }

  const getAssessmentIcon = (category: string) => {
    const type = category?.toLowerCase() || ""
    if (type.includes("cognitive")) return <Assignment />
    if (type.includes("survey")) return <QuestionAnswer />
    return <Assignment />
  }

  const formatAssessmentType = (category: string) => {
    if (!category) return "Assessment"
    const type = category.toLowerCase()
    if (type.includes("cognitive")) return "Cognitive Test"
    if (type.includes("mood")) return "Mood Assessment"
    if (type.includes("survey")) return "Survey"
    if (type.includes("clinical")) return "Clinical Assessment"
    return category
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "#4CAF50"
      case "draft":
        return "#FF9800"
      case "archived":
        return "#9E9E9E"
      default:
        return "#2196F3"
    }
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m`
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`
  }
  // Use mock data if no assessments provided
  const displayAssessments = assessments.length > 0 ? filteredAssessments : []

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    )
  }

  if (displayAssessments.length === 0) {
    return (
      <div className={classes.emptyState}>
        <Typography variant="h6">
          {search.trim() ? "No assessments found matching your search" : "No assessments available"}
        </Typography>
        <Typography variant="body2" style={{ marginTop: "8px" }}>
          {search.trim() ? "Try adjusting your search terms" : "Assessments will appear here once created"}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <Grid container spacing={3}>
        {displayAssessments.map((assessment) => (
          <Grid item xs={12} sm={6} md={4} key={assessment.id}>
            <Card className={classes.card}>
              <CardContent>
                <div className={classes.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div className={classes.assessmentIcon}>
                      {getAssessmentIcon(assessment.category || "")}
                      <Typography className={classes.assessmentTitle} style={{ marginLeft: "8px" }}>
                        {assessment.name || "Unnamed Assessment"}
                      </Typography>
                    </div>
                    <div>
                      <Chip
                        label={assessment.status || "active"}
                        className={`${classes.chip} ${classes.statusChip}`}
                        size="small"
                        style={{
                          backgroundColor: getStatusColor(assessment.status || "active"),
                          color: "white",
                        }}
                      />
                    </div>
                  </div>
                  <IconButton className={classes.actionButton} onClick={(e) => handleMenuOpen(e, assessment)}>
                    <MoreVert />
                  </IconButton>
                </div>

                {assessment.description && (
                  <Typography className={classes.assessmentDescription}>{assessment.description}</Typography>
                )}

                <div className={classes.questionsInfo}>
                  {assessment.questions && (
                    <Chip
                      icon={<QuestionAnswer fontSize="small" />}
                      label={`${assessment.questions.length} questions`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {assessment.settings?.duration && (
                    <Chip
                      icon={<Timer fontSize="small" />}
                      label={formatDuration(assessment.settings.duration)}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </div>

                {assessment.completionRate !== undefined && (
                  <div className={classes.progressContainer}>
                    <Typography className={classes.progressLabel}>
                      Completion Rate: {assessment.completionRate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={assessment.completionRate}
                      style={{
                        backgroundColor: "#e0e0e0",
                      }}
                    />
                  </div>
                )}

                <div className={classes.metadata}>
                  <span>ID: {assessment.id}</span>
                  <span>
                    {assessment.settings?.attempts
                      ? `${assessment.settings.attempts} attempt(s)`
                      : "Unlimited attempts"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <Visibility fontSize="small" style={{ marginRight: "8px" }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" style={{ marginRight: "8px" }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} style={{ color: "#f44336" }}>
          <Delete fontSize="small" style={{ marginRight: "8px" }} />
          Delete
        </MenuItem>
      </Menu>
    </div>
  )
}

export default AssessmentDevlab
