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
} from "@material-ui/core"
import { MoreVert, Edit, Delete, Visibility, SignalWifi4Bar, SignalWifiOff } from "@material-ui/icons"
import { ReactComponent as Sensors } from "../../icons/NewIcons/sensor-on.svg"
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
    sensorTitle: {
      fontSize: "1.2rem",
      fontWeight: 600,
      color: "#333",
      marginBottom: theme.spacing(0.5),
    },
    sensorDescription: {
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
    sensorTypeChip: {
      backgroundColor: "#75d36d",
      color: "white",
    },
    statusChip: {
      "&.active": {
        backgroundColor: "#4CAF50",
        color: "white",
      },
      "&.inactive": {
        backgroundColor: "#F44336",
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
    sensorIcon: {
      display: "flex",
      alignItems: "center",
      marginBottom: theme.spacing(1),
    },
    frequencyInfo: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
  })
)

interface Sensor {
  id: string
  name: string
  spec: string
  settings?: {
    frequency?: number
    resolution?: number
  }
  studyID?: string
}

interface SensorDevlabProps {
  sensors: Sensor[]
  refreshData: () => void
  isLoading: boolean
  search: string
}

const SensorDevlab: React.FC<SensorDevlabProps> = ({ sensors, refreshData, isLoading, search }) => {
  const classes = useStyles()
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)

  useEffect(() => {
    if (search.trim()) {
      const filtered = sensors.filter(
        (sensor) =>
          sensor.name?.toLowerCase().includes(search.toLowerCase()) ||
          sensor.spec?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredSensors(filtered)
    } else {
      setFilteredSensors(sensors)
    }
  }, [sensors, search])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sensor: Sensor) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedSensor(sensor)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedSensor(null)
  }

  const handleView = () => {
    if (selectedSensor) {
      console.log("View sensor:", selectedSensor)
      // Add view logic here
    }
    handleMenuClose()
  }

  const handleEdit = () => {
    if (selectedSensor) {
      console.log("Edit sensor:", selectedSensor)
      // Add edit logic here
    }
    handleMenuClose()
  }

  const handleDelete = async () => {
    if (selectedSensor) {
      try {
        await LAMP.Sensor.delete(selectedSensor.id)
        refreshData()
        console.log("Sensor deleted:", selectedSensor.id)
      } catch (error) {
        console.error("Error deleting sensor:", error)
      }
    }
    handleMenuClose()
  }

  const getSensorTypeColor = (spec: string) => {
    const type = spec?.toLowerCase() || ""
    if (type.includes("accelerometer")) return "#FF5722"
    if (type.includes("gyroscope")) return "#9C27B0"
    if (type.includes("gps") || type.includes("location")) return "#2196F3"
    if (type.includes("heart") || type.includes("health")) return "#E91E63"
    if (type.includes("step") || type.includes("activity")) return "#4CAF50"
    return "#75d36d"
  }

  const getSensorIcon = (spec: string) => {
    const type = spec?.toLowerCase() || ""
    if (type.includes("gps") || type.includes("location")) return <SignalWifi4Bar />
    if (type.includes("heart") || type.includes("health")) return <SignalWifi4Bar />
    return <Sensors />
  }

  const formatSensorType = (spec: string) => {
    const type = spec?.toLowerCase() || ""
    if (type.includes("accelerometer")) return "Accelerometer"
    if (type.includes("gyroscope")) return "Gyroscope"
    if (type.includes("gps") || type.includes("location")) return "GPS/Location"
    if (type.includes("heart")) return "Heart Rate"
    if (type.includes("step")) return "Step Counter"
    if (type.includes("activity")) return "Activity Recognition"
    return spec || "Unknown Sensor"
  }

  const formatFrequency = (frequency: number) => {
    if (frequency >= 1000) {
      return `${frequency / 1000}Hz`
    }
    return `${frequency}ms`
  }

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    )
  }

  if (filteredSensors.length === 0) {
    return (
      <div className={classes.emptyState}>
        <Typography variant="h6">
          {search.trim() ? "No sensors found matching your search" : "No sensors available"}
        </Typography>
        <Typography variant="body2" style={{ marginTop: "8px" }}>
          {search.trim() ? "Try adjusting your search terms" : "Sensors will appear here once created"}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <Grid container spacing={3}>
        {filteredSensors.map((sensor) => (
          <Grid item xs={12} sm={6} md={4} key={sensor.id}>
            <Card className={classes.card}>
              <CardContent>
                <div className={classes.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div className={classes.sensorIcon}>
                      {getSensorIcon(sensor.spec)}
                      <Typography className={classes.sensorTitle} style={{ marginLeft: "8px" }}>
                        {sensor.name || "Unnamed Sensor"}
                      </Typography>
                    </div>
                    <Chip
                      label={formatSensorType(sensor.spec)}
                      className={classes.chip}
                      size="small"
                      style={{
                        backgroundColor: getSensorTypeColor(sensor.spec),
                        color: "white",
                      }}
                    />
                  </div>
                  <IconButton className={classes.actionButton} onClick={(e) => handleMenuOpen(e, sensor)}>
                    <MoreVert />
                  </IconButton>
                </div>

                {sensor.settings && (
                  <div className={classes.frequencyInfo}>
                    {sensor.settings.frequency && (
                      <Chip
                        label={`Freq: ${formatFrequency(sensor.settings.frequency)}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {sensor.settings.resolution && (
                      <Chip label={`Res: ${sensor.settings.resolution}`} size="small" variant="outlined" />
                    )}
                  </div>
                )}

                <div className={classes.metadata}>
                  <span>ID: {sensor.id}</span>
                  <span>
                    <SignalWifi4Bar fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
                    Active
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

export default SensorDevlab
