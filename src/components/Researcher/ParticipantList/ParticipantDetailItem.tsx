import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  Divider,
  IconButton,
  Collapse,
  MenuItem,
  MuiThemeProvider,
  Button,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Card,
  CardContent,
  Chip,
} from "@material-ui/core"
import ViewItems, { FieldConfig, TabConfig } from "../SensorsList/ViewItems"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import CloseIcon from "@material-ui/icons/Close"
import { DeveloperInfo, fetchUserIp } from "../ActivityList/ActivityDetailItem"
import { fetchResult } from "../SaveResearcherData"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import { ca } from "date-fns/locale"
import DateFnsUtils from "@date-io/date-fns"
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers"
import { localeMap, userLanguages } from "../ActivityList/ScheduleRow"
import locale_lang from "../../../locale_map.json"
import { VariableSizeList as List } from "react-window"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100%",
      overflow: "hidden",
    },
    statusBox: {
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      display: "flex",
      alignItems: "center",
      marginBottom: theme.spacing(2),
    },
    statusIndicator: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      marginRight: theme.spacing(1),
    },
    statusActive: {
      backgroundColor: "#e8f5e9",
      "& $statusIndicator": {
        backgroundColor: "#43a047",
      },
    },
    statusInactive: {
      backgroundColor: "#ffebee",
      "& $statusIndicator": {
        backgroundColor: "#e53935",
      },
    },
    rootContainer: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    tabContent: {
      padding: theme.spacing(2),
    },
    statisticsCard: {
      padding: theme.spacing(2),
      height: "100%",
      textAlign: "center",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
      },
    },
    scheduleItem: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: "#f5f5f5",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: theme.spacing(2),
      padding: theme.spacing(2),
    },
    statItem: {
      cursor: "pointer",
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
      },
      "&.selected": {
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      },
    },
    statNumber: {
      fontSize: "2rem",
      fontWeight: 500,
      textAlign: "center",
    },
    statLabel: {
      color: "rgba(0, 0, 0, 0.6)",
      fontSize: "0.875rem",
      textAlign: "center",
      marginTop: theme.spacing(1),
    },
    groupList: {
      marginTop: theme.spacing(2),
    },
    groupItem: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(1),
      backgroundColor: "#f5f5f5",
      borderRadius: theme.shape.borderRadius,
    },
    groupName: {
      fontWeight: 500,
      marginBottom: theme.spacing(0.5),
    },
    groupDesc: {
      color: "rgba(0, 0, 0, 0.6)",
      fontSize: "0.875rem",
    },
    datePicker: {
      "& div": { paddingRight: 0, maxWidth: 175 },
      "& p.MuiTypography-alignCenter": { textTransform: "capitalize" },
      "& h4.MuiTypography-h4 ": { textTransform: "capitalize" },
      "& span": { textTransform: "capitalize" },
    },
    datePickerDiv: {
      "& h4.MuiTypography-h4": { textTransform: "capitalize" },
      "& span.MuiPickersCalendarHeader-dayLabel": { textTransform: "capitalize" },
    },
  })
)

const CustomSelect = ({ options, value, onChange, label, required = false, fullWidth = true }) => {
  const [isOtherMode, setIsOtherMode] = useState(
    options.some((opt) => opt.value === "Other") && value !== "Other" && !options.some((opt) => opt.value === value)
  )

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value
    if (selectedValue === "Other") {
      setIsOtherMode(true)
      onChange("")
    } else {
      setIsOtherMode(false)
      onChange(selectedValue)
    }
  }

  const handleTextChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <TextField
      fullWidth={fullWidth}
      select={!isOtherMode}
      label={label}
      value={value}
      onChange={isOtherMode ? handleTextChange : handleSelectChange}
      variant="outlined"
      required={required}
      SelectProps={{ native: false }}
      InputProps={{
        endAdornment: isOtherMode && (
          <MenuItem
            component="div"
            onClick={() => setIsOtherMode(false)}
            // style={{ cursor: 'pointer', position: 'absolute', right: 5 }}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: 8,
              top: 2,
              opacity: 0.8,
              backgroundColor: "rgba(240, 240, 240, 0.9)",
              zIndex: 1000,
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.60rem",
              color: "#1976d2",
              border: "1px solid #e0e0e0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            ⤴ Back to options
          </MenuItem>
        ),
      }}
    >
      {!isOtherMode &&
        options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
    </TextField>
  )
}
interface ParticipantDetailItemProps {
  participant: any
  isEditing: boolean
  onSave: (updatedParticipant: any) => void
  studies: Array<any>
  triggerSave?: boolean
  stats?: (participant: any, study: any) => any[]
  sharedstudies: Array<any>
}

interface EventItemData {
  events: any[]
  selectedTab: string
  onToggleExpanded: (index: number) => void
  expandedItems: Set<number>
}

// Virtualized Event Item Component
const EventItem: React.FC<{
  index: number
  style: React.CSSProperties
  data: EventItemData
}> = React.memo(({ index, style, data }) => {
  const { events, selectedTab, onToggleExpanded, expandedItems } = data
  const event = events[index]
  const isExpanded = expandedItems.has(index)

  if (!event) {
    return (
      <div style={style}>
        <Card variant="outlined" style={{ margin: "4px 8px", height: "60px", overflow: "hidden" }}>
          <CardContent style={{ padding: "8px" }}>
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div style={style}>
      <Card variant="outlined" style={{ margin: "4px 8px", minHeight: "60px" }}>
        <CardContent style={{ padding: "8px" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box flex={1}>
              <Typography variant="body2" color="textPrimary">
                <strong>#{index + 1}</strong> - {event.timestamp}
              </Typography>
              {selectedTab === "sensors" && (
                <Typography variant="caption" color="textSecondary">
                  Sensor: {event.sensor}
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={() => onToggleExpanded(index)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box mt={1} pt={1} borderTop="1px solid #eee">
              {selectedTab === "activities" && event.temporal_slices && <ActivityEventDetails event={event} />}
              {selectedTab === "sensors" && event.data && <SensorEventDetails event={event} />}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </div>
  )
})

// Activity Event Details Component
const ActivityEventDetails: React.FC<{ event: any }> = React.memo(({ event }) => (
  <Box pl={1} maxHeight={400} overflow="auto" width="100%" boxSizing="border-box">
    <Typography variant="subtitle2" color="primary" gutterBottom>
      Activity Details:
    </Typography>
    {event.temporal_slices?.map((slice: any, sliceIdx: number) => (
      <Box key={sliceIdx} mb={2} pl={2} bgcolor="#f9f9f9" borderRadius={1} borderLeft="3px solid #1976d2">
        <Typography variant="body2">
          <strong>Item:</strong> {slice.item}
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
          <strong>Value:</strong> {slice.value || "N/A"}
        </Typography>
        {slice.emotions && Object.keys(slice.emotions).length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="textSecondary">
              <strong>Emotions:</strong>
            </Typography>
            <Box display="flex" flexWrap="wrap" mt={0.5} style={{ gap: 4 }}>
              {Object.entries(slice.emotions).map(([emotion, value]) => (
                <Chip key={emotion} label={`${emotion}: ${value}`} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
        <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, display: "block" }}>
          <strong>Duration:</strong> {slice.duration} ms
        </Typography>
      </Box>
    ))}

    {event.static_data?.story_responses && <StaticDataDetails staticData={event.static_data} />}
  </Box>
))

// Sensor Event Details Component
const SensorEventDetails: React.FC<{ event: any }> = React.memo(({ event }) => {
  const renderDataValue = useCallback((key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return (
          <Box key={key} mb={1}>
            <Typography variant="body2">
              <strong>{key}:</strong> Array ({value.length} items)
            </Typography>
            <Box ml={2}>
              {value.map((item, idx) => (
                <Typography key={idx} variant="caption" display="block">
                  [{idx}]: {typeof item === "object" ? JSON.stringify(item) : String(item)}
                </Typography>
              ))}
            </Box>
          </Box>
        )
      } else {
        const entries = Object.entries(value)
        return (
          <Box key={key} mb={1}>
            <Typography variant="body2">
              <strong>{key}:</strong>
            </Typography>
            <Box ml={2}>
              {entries.map(([subKey, subValue]) => (
                <Typography key={subKey} variant="caption" display="block">
                  {subKey}: {String(subValue).substring(0, 50)}
                  {String(subValue).length > 50 ? "..." : ""}
                </Typography>
              ))}
            </Box>
          </Box>
        )
      }
    }

    return (
      <Typography key={key} variant="body2">
        <strong>{key}:</strong> {String(value)}
      </Typography>
    )
  }, [])

  return (
    <Box pl={1} maxHeight={400} overflow="auto" width="100%" boxSizing="border-box">
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Sensor Data:
      </Typography>
      {event.data && typeof event.data === "object" ? (
        Object.entries(event.data).map(([key, value]) => renderDataValue(key, value))
      ) : (
        <Typography variant="body2">{String(event.data)}</Typography>
      )}
    </Box>
  )
})

// Static Data Details Component
const StaticDataDetails: React.FC<{ staticData: any }> = React.memo(({ staticData }) => (
  <Box mt={2} pt={2} borderTop="1px solid #e0e0e0">
    <Typography variant="subtitle2" color="primary">
      <strong>Responses:</strong>
    </Typography>
    <Box ml={2} mt={1}>
      {Object.keys(staticData.story_responses || {}).map((storyKey) => {
        const storyIndex = storyKey.replace("story_", "")
        const audioKey = `story_${storyIndex}_audio`
        const audioValue = staticData.audio_recordings?.[audioKey]

        return (
          <Box key={storyKey} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="body2" color="textPrimary" gutterBottom>
              <strong>Story {Number(storyIndex) + 1}:</strong>
            </Typography>
            <Box ml={2}>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                <strong>Response:</strong> {staticData.story_responses[storyKey]}
              </Typography>
              {audioValue && (
                <Box mt={1}>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 4 }}>
                    <strong>Audio:</strong>
                  </Typography>
                  <audio controls style={{ width: "100%", maxWidth: "300px" }}>
                    <source src={audioValue} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  </Box>
))

// Main Item Component (for sensors/activities list)
const ItemCard: React.FC<{
  item: any
  index: number
  selectedTab: string
  onToggleItem: (index: number) => void
  expandedItems: Set<number>
}> = React.memo(({ item, index, selectedTab, onToggleItem, expandedItems }) => {
  const isExpanded = expandedItems.has(index)
  const eventCount = item.events?.length || (item.lastEvent ? 1 : 0)

  const getIcon = () => {
    switch (selectedTab) {
      // case 'sensors': return <SensorsIcon color="primary" />
      // case 'activities': return <ActivityIcon color="primary" />
      // case 'assessments': return <AssessmentIcon color="primary" />
      default:
        return null
    }
  }

  return (
    <Accordion expanded={isExpanded} onChange={() => onToggleItem(index)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" width="100%">
          {/* {getIcon()} */}
          <Box ml={2} flex={1}>
            <Typography variant="h6">{item.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {item.spec}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <Chip
                label={`${eventCount} events`}
                size="small"
                color={eventCount > 0 ? "primary" : "default"}
                variant="outlined"
              />
              {item.lastEvent && (
                <Chip
                  label={`Last: ${item.lastEvent.timestamp}`}
                  size="small"
                  variant="outlined"
                  style={{ marginLeft: 8 }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box width="100%">
          <VirtualizedEventList item={item} selectedTab={selectedTab} />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
})

// Virtualized Event List Component
const VirtualizedEventList: React.FC<{
  item: any
  selectedTab: string
}> = React.memo(({ item, selectedTab }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const listRef = useRef<any>(null) // Add ref for the List component

  const events = useMemo(() => {
    if (item.events && item.events.length > 0) {
      return item.events
    } else if (item.lastEvent) {
      return [item.lastEvent]
    }
    return []
  }, [item.events, item.lastEvent])

  const handleToggleExpanded = useCallback((index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })

    // Reset item sizes when expansion state changes
    if (listRef.current) {
      listRef.current.resetAfterIndex(0)
    }
  }, [])

  // Calculate dynamic item height based on expanded state and content
  const getItemSize = useCallback(
    (index: number) => {
      const baseHeight = 80
      if (!expandedItems.has(index)) {
        return baseHeight
      }

      const event = events[index]
      if (!event) return baseHeight

      if (selectedTab === "sensors") {
        const dataEntries = event.data ? Object.keys(event.data).length : 0
        const arrayDataCount = event.data
          ? Object.values(event.data).reduce((count: number, val: any) => {
              return count + (Array.isArray(val) ? val.length : 0)
            }, 0)
          : 0
        const hasNestedData =
          event.data &&
          Object.values(event.data).some((val: any) => typeof val === "object" && val !== null && !Array.isArray(val))

        let expandedHeight = 150
        expandedHeight += dataEntries * 25
        expandedHeight += (arrayDataCount as number) * 20
        if (hasNestedData) expandedHeight += 50

        return Math.min(expandedHeight, 800)
      } else if (selectedTab === "activities") {
        const sliceCount = event.temporal_slices?.length || 0
        const hasStaticData = event.static_data?.story_responses
        const staticDataCount = hasStaticData ? Object.keys(event.static_data.story_responses).length : 0

        let expandedHeight = 150 // Base expanded height

        // Calculate height for temporal slices (more accurate)
        expandedHeight += sliceCount * 100 // Each slice needs about 140px

        // Add height for emotions in slices
        if (event.temporal_slices) {
          event.temporal_slices.forEach((slice: any) => {
            if (slice.emotions && Object.keys(slice.emotions).length > 0) {
              expandedHeight += 50 // Extra height for emotion chips
            }
          })
        }

        // Calculate height for static data (more accurate)
        if (hasStaticData) {
          expandedHeight += 100 // Header and padding
          expandedHeight += staticDataCount * 120 // Each story response

          // Add extra height if audio is present
          Object.keys(event.static_data.story_responses).forEach((storyKey) => {
            const storyIndex = storyKey.replace("story_", "")
            const audioKey = `story_${storyIndex}_audio`
            if (event.static_data.audio_recordings?.[audioKey]) {
              expandedHeight += 80 // Audio player height
            }
          })
        }

        return Math.min(expandedHeight, 500) // Increased max height for activities
      }

      return 200
    },
    [expandedItems, selectedTab, events]
  )

  const itemData: EventItemData = useMemo(
    () => ({
      events,
      selectedTab,
      expandedItems,
      onToggleExpanded: handleToggleExpanded,
    }),
    [events, selectedTab, expandedItems, handleToggleExpanded]
  )

  if (events.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No events found.
      </Typography>
    )
  }

  // Calculate total height more accurately
  const totalHeight = Math.min(
    events.reduce((total, _, index) => total + getItemSize(index), 0),
    800 // Maximum container height
  )

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Events ({events.length})
      </Typography>
      <Box height={totalHeight} width="100%">
        <List
          ref={listRef} // Add ref
          height={totalHeight}
          itemCount={events.length}
          itemSize={getItemSize}
          itemData={itemData}
          overscanCount={3} // Reduce overscan for better performance
        >
          {EventItem}
        </List>
      </Box>
    </Box>
  )
})

const AsyncStatsContent: React.FC<{
  selectedTab: any
  study: any
  participant: any
  classes: any
}> = ({ selectedTab, study, participant, classes }) => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 1)))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 1))
  )
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(new Date())
  const [applyFilter, setApplyFilter] = useState<boolean>(false)
  const { t, i18n } = useTranslation()
  const [dateRangeEnabled, setDateRangeEnabled] = useState<boolean>(false)

  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : userLanguages.includes(lang) ? lang : "en-US"
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        let newItems: any[] = []
        const endpoint = dateRangeEnabled
          ? `participant/mode/6?from_date=${startDate?.getTime()}&to_date=${endDate?.getTime()}&participant_id=${
              participant.id
            }&tab=${selectedTab.tab}`
          : "participant/mode/5"
        const studyID = study?.id ? study.id : participant.study_id
        const result = await fetchResult(authString, studyID, endpoint, "study")
        const participantData = result.participants?.find((p: any) => p.id === participant.id)
        console.log("participantData", participantData, endpoint)

        if (selectedTab.tab === "assessments") {
          newItems = study.activities?.filter((a: any) => a.category?.includes("assess")) || []
        } else if (selectedTab.tab === "activities") {
          if (dateRangeEnabled && participantData?.activity_events) {
            const activityMap = new Map()
            ;(study.activities || []).forEach((activity: any) => {
              activityMap.set(activity.id, { ...activity, events: [] })
            })

            participantData.activity_events.forEach((event: any) => {
              if (activityMap.has(event.activity)) {
                const activity = activityMap.get(event.activity)
                activity.events.push({
                  ...event,
                  timestamp: new Date(event.timestamp).toLocaleString(),
                })
              }
            })

            newItems = Array.from(activityMap.values())
          } else {
            newItems = (study.activities || []).map((activity: any) => {
              const activityEvent = participantData?.last_activity_events?.find(
                (e: any) => e.activity_id === activity.id
              )
              return {
                ...activity,
                lastEvent: activityEvent?.last_event
                  ? {
                      ...activityEvent.last_event,
                      timestamp: new Date(activityEvent.last_event.timestamp).toLocaleString(),
                    }
                  : null,
              }
            })
          }
        } else if (selectedTab.tab === "sensors") {
          if (dateRangeEnabled && participantData?.sensor_events) {
            const sensorMap = new Map()
            ;(study.sensors || []).forEach((sensor: any) => {
              sensorMap.set(sensor.spec, { ...sensor, events: [] })
            })

            participantData.sensor_events.forEach((event: any) => {
              if (sensorMap.has(event.sensor)) {
                const sensor = sensorMap.get(event.sensor)
                sensor.events.push({
                  ...event,
                  timestamp: new Date(event.timestamp).toLocaleString(),
                })
              }
            })

            newItems = Array.from(sensorMap.values())
          } else {
            newItems = (study.sensors || []).map((sensor: any) => {
              const sensorEvent = participantData?.last_sensor_events?.find((s: any) => s.sensor_spec === sensor.spec)
              console.log("sensorEvent", sensorEvent)
              return {
                ...sensor,
                lastEvent: sensorEvent?.last_event
                  ? {
                      ...sensorEvent.last_event,
                      timestamp: new Date(sensorEvent.last_event.timestamp).toLocaleString(),
                    }
                  : null,
              }
            })
          }
        }
        setItems(newItems)
      } catch (err) {
        console.error("Failed to fetch stats:", err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedTab, study, participant, dateRangeEnabled, startDate, endDate, applyFilter])

  const handleStartDateChange = (date: Date | null) => {
    if (date && date.isValid && date.isValid()) {
      const newDate = new Date(date.getTime())
      newDate.setHours(0, 0, 0, 0)
      setSelectedStartDate(newDate)
    } else {
      setSelectedStartDate(null)
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date && date.isValid && date.isValid()) {
      const newDate = new Date(date.getTime())
      newDate.setHours(23, 59, 59, 999)
      setSelectedEndDate(newDate)
    } else {
      setSelectedEndDate(null)
    }
  }

  const handleToggleDateRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabled = e.target.checked
    setDateRangeEnabled(newEnabled)
    if (newEnabled && (!startDate || !endDate)) {
      setStartDate(selectedStartDate || new Date(new Date().setDate(new Date().getDate() - 1)))
      setEndDate(selectedEndDate || new Date())
      setApplyFilter((prev) => !prev)
    }
  }

  const handleApplyFilter = () => {
    if (selectedStartDate && selectedEndDate) {
      setStartDate(selectedStartDate)
      setEndDate(selectedEndDate)
      setApplyFilter((prev) => !prev)
    }
  }

  const isFilterReady = () => {
    return dateRangeEnabled && selectedStartDate && selectedEndDate
  }

  const handleToggleItem = useCallback((index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }, [])

  if (loading) {
    return <Typography className={classes.groupName}>Loading...</Typography>
  }

  if (items.length === 0) {
    return <Typography className={classes.groupName}>{`No ${selectedTab.tab} present at this moment.`}</Typography>
  }

  // Performance logging (same as original)
  if (selectedTab.tab === "sensors" && items.length > 0) {
    console.log("=== RECENT 5 SENSOR ITEMS ===")
    const sensorSummary = items.map((sensor) => {
      let recentItems: any[] = []

      if (dateRangeEnabled && sensor.events) {
        recentItems = sensor.events.slice(0, 5).map((event: any) => {
          if (event.sensor === "lamp.call_log" && event.data?.value?.length > 0) {
            const trimmedValue = event.data.value.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 5)

            return {
              timestamp: event.timestamp,
              sensor: event.sensor,
              data: {
                ...event.data,
                value: trimmedValue,
              },
            }
          }

          return {
            timestamp: event.timestamp,
            sensor: event.sensor,
            data: event.data,
          }
        })
      } else if (sensor.lastEvent) {
        let eventData = sensor.lastEvent.data
        if (sensor.spec === "lamp.call_log" && eventData?.value?.length > 0) {
          eventData = {
            ...eventData,
            value: eventData.value.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 5),
          }
        }

        recentItems = [
          {
            timestamp: sensor.lastEvent.timestamp,
            sensor: sensor.spec,
            data: eventData,
          },
        ]
      }

      return {
        sensorName: sensor.name,
        sensorSpec: sensor.spec,
        totalEvents: dateRangeEnabled ? sensor.events?.length || 0 : sensor.lastEvent ? 1 : 0,
        recentItems: recentItems,
      }
    })

    console.log(JSON.stringify(sensorSummary, null, 2))
  }

  return (
    <Box className={classes.groupList}>
      <Box mb={2} display="flex" flexDirection="row" alignItems="center">
        <MuiPickersUtilsProvider locale={localeMap[getSelectedLanguage()]} utils={DateFnsUtils}>
          <Box display="flex" alignItems="center" flexWrap="wrap">
            <Box mr={2} mb={1}>
              <KeyboardDatePicker
                disabled={!dateRangeEnabled}
                margin="normal"
                id="start-date-picker"
                label="Start Date"
                format="MM/dd/yyyy"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change start date",
                }}
                className={classes.datePicker}
                variant="inline"
                inputVariant="outlined"
                clearable
                autoOk
                size="small"
                error={dateRangeEnabled && !startDate}
                helperText={dateRangeEnabled && !startDate ? "Please select a valid date" : ""}
              />
            </Box>
            <Box mr={2} mb={1}>
              <KeyboardDatePicker
                disabled={!dateRangeEnabled}
                margin="normal"
                clearable
                autoOk
                variant="inline"
                inputVariant="outlined"
                className={classes.datePicker}
                error={dateRangeEnabled && !endDate}
                helperText={dateRangeEnabled && !endDate ? "Please select a valid date" : ""}
                id="end-date-picker"
                label="End Date"
                format="MM/dd/yyyy"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change end date",
                }}
                size="small"
              />
            </Box>
            {dateRangeEnabled && (
              <Box ml={2} mb={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleApplyFilter}
                  disabled={!isFilterReady()}
                >
                  {t("Apply Filter")}
                </Button>
              </Box>
            )}
            <Box mb={1} display="flex" alignItems="center">
              <Box component="label" mr={1}>
                <Typography variant="body2">Enable Date Range</Typography>
              </Box>
              <Switch
                id="date-range-toggle"
                checked={dateRangeEnabled}
                onChange={handleToggleDateRange}
                color="primary"
                size="small"
              />
            </Box>
          </Box>
        </MuiPickersUtilsProvider>
      </Box>
      <Divider style={{ marginBottom: 16 }} />

      {/* Performance Stats */}
      <Box mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography variant="subtitle2" color="textSecondary">
          Performance Stats: {items.length} items loaded,{" "}
          {items.reduce((total, item) => total + (item.events?.length || (item.lastEvent ? 1 : 0)), 0)} total events
        </Typography>
      </Box>

      {/* Virtualized Items List */}
      <Box>
        {items.map((item, index) => (
          <ItemCard
            key={`${item.spec || item.id}-${index}`}
            item={item}
            index={index}
            selectedTab={selectedTab.tab}
            onToggleItem={handleToggleItem}
            expandedItems={expandedItems}
          />
        ))}
      </Box>
    </Box>
  )
}

const AsyncStatsContent_prev: React.FC<{
  selectedTab: any
  study: any
  participant: any
  classes: any
}> = ({ selectedTab, study, participant, classes }) => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 1)) // Default to previous day
  )
  const [endDate, setEndDate] = useState<Date | null>(new Date()) // Default to today
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 1))
  )
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(new Date())
  const [applyFilter, setApplyFilter] = useState<boolean>(false)
  const { t, i18n } = useTranslation()
  const [dateRangeEnabled, setDateRangeEnabled] = useState<boolean>(false)
  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : userLanguages.includes(lang) ? lang : "en-US"
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        let newItems: any[] = []
        const endpoint = dateRangeEnabled
          ? `participant/mode/6?from_date=${startDate?.getTime()}&to_date=${endDate?.getTime()}&participant_id=${
              participant.id
            }`
          : "participant/mode/5"
        const studyID = study?.id ? study.id : participant.study_id
        const result = await fetchResult(authString, studyID, endpoint, "study")
        // const result = await fetchResult(authString, study.id, "participant/mode/5", "study")
        const participantData = result.participants?.find((p) => p.id === participant.id)
        console.log("participantData", participantData, endpoint)
        if (selectedTab.tab === "assessments") {
          newItems = study.activities?.filter((a) => a.category?.includes("assess")) || []
        } else if (selectedTab.tab === "activities") {
          if (dateRangeEnabled && participantData?.activity_events) {
            // When date range is enabled, use the activity events in the date range
            const activityMap = new Map()
            ;(study.activities || []).forEach((activity) => {
              activityMap.set(activity.id, { ...activity, events: [] })
            })

            // Group events by activity
            participantData.activity_events.forEach((event) => {
              if (activityMap.has(event.activity)) {
                const activity = activityMap.get(event.activity)
                activity.events.push({
                  ...event,
                  timestamp: new Date(event.timestamp).toLocaleString(),
                })
              }
            })

            newItems = Array.from(activityMap.values())
          } else {
            newItems = (study.activities || []).map((activity) => {
              const activityEvent = participantData?.last_activity_events?.find((e) => e.activity_id === activity.id)
              return {
                ...activity,
                lastEvent: activityEvent?.last_event
                  ? {
                      ...activityEvent.last_event,
                      timestamp: new Date(activityEvent.last_event.timestamp).toLocaleString(),
                    }
                  : null,
              }
            })
          }
        } else if (selectedTab.tab === "sensors") {
          if (dateRangeEnabled && participantData?.sensor_events) {
            // When date range is enabled, use the sensor events in the date range
            const sensorMap = new Map()
            ;(study.sensors || []).forEach((sensor) => {
              sensorMap.set(sensor.spec, { ...sensor, events: [] })
            })

            // Group events by sensor
            participantData.sensor_events.forEach((event) => {
              if (sensorMap.has(event.sensor)) {
                const sensor = sensorMap.get(event.sensor)
                sensor.events.push({
                  ...event,
                  timestamp: new Date(event.timestamp).toLocaleString(),
                })
              }
            })

            newItems = Array.from(sensorMap.values())
          } else {
            newItems = (study.sensors || []).map((sensor) => {
              const sensorEvent = participantData?.last_sensor_events?.find((s) => s.sensor_spec === sensor.spec)
              console.log("sensorEvent", sensorEvent)
              return {
                ...sensor,
                lastEvent: sensorEvent?.last_event
                  ? {
                      ...sensorEvent.last_event,
                      timestamp: new Date(sensorEvent.last_event.timestamp).toLocaleString(),
                    }
                  : null,
              }
            })
          }
        }
        setItems(newItems)
      } catch (err) {
        console.error("Failed to fetch stats:", err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedTab, study, participant, dateRangeEnabled, startDate, endDate, applyFilter])

  const handleStartDateChange = (date: Date | null) => {
    // setStartDate(date)
    if (date && date.isValid && date.isValid()) {
      const newDate = new Date(date.getTime())
      newDate.setHours(0, 0, 0, 0)
      setSelectedStartDate(newDate)
      // setStartDate(newDate)
    } else {
      setSelectedStartDate(null)
      // setStartDate(null)
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    // setEndDate(date)
    if (date && date.isValid && date.isValid()) {
      const newDate = new Date(date.getTime())
      newDate.setHours(23, 59, 59, 999)
      setSelectedEndDate(newDate)
      // setEndDate(newDate)
    } else {
      setSelectedEndDate(null)
      // setEndDate(null)
    }
  }

  const handleToggleDateRange = (e) => {
    const newEnabled = e.target.checked
    setDateRangeEnabled(newEnabled)
    if (newEnabled && (!startDate || !endDate)) {
      setStartDate(selectedStartDate || new Date(new Date().setDate(new Date().getDate() - 1)))
      setEndDate(selectedEndDate || new Date())
      setApplyFilter((prev) => !prev) // Trigger filter when enabling date range
    }
  }
  const handleApplyFilter = () => {
    if (selectedStartDate && selectedEndDate) {
      setStartDate(selectedStartDate)
      setEndDate(selectedEndDate)
      setApplyFilter((prev) => !prev) // Toggle to trigger useEffect
    }
  }

  const isFilterReady = () => {
    return dateRangeEnabled && selectedStartDate && selectedEndDate
  }

  const renderSensorData = (data: any) => {
    if (!data) return <Typography variant="body2">No data available</Typography>

    if (typeof data !== "object") {
      return <Typography variant="body2">{String(data)}</Typography>
    }

    return (
      <Box pl={1}>
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} mb={1}>
            <Typography variant="body2">
              <strong>{key}:</strong>{" "}
              {typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  if (loading) {
    return <Typography className={classes.groupName}>Loading...</Typography>
  }

  if (items.length === 0) {
    return <Typography className={classes.groupName}>{`No ${selectedTab.tab} present at this moment.`}</Typography>
  }

  console.log("items", items)
  console.log(
    "Items with static_data:",
    items.filter(
      (item) => item.lastEvent && item.lastEvent.static_data && Object.keys(item.lastEvent.static_data).length > 0
    )
  )
  console.log("Last events with static_data:", items.map((item) => item.lastEvent?.static_data).filter(Boolean))

  if (selectedTab.tab === "sensors" && items.length > 0) {
    console.log("=== RECENT 5 SENSOR ITEMS ===")

    const sensorSummary = items.map((sensor) => {
      let recentItems = []

      if (dateRangeEnabled && sensor.events) {
        // Sort events by timestamp (most recent first) and take top 5
        recentItems = sensor.events.slice(0, 5).map((event) => {
          // Special handling for lamp.call_log
          if (event.sensor === "lamp.call_log" && event.data?.value?.length > 0) {
            // Sort and slice value array inside data
            const trimmedValue = event.data.value.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)

            return {
              timestamp: event.timestamp,
              sensor: event.sensor,
              data: {
                ...event.data,
                value: trimmedValue,
              },
            }
          }

          return {
            timestamp: event.timestamp,
            sensor: event.sensor,
            data: event.data,
          }
        })
      } else if (sensor.lastEvent) {
        // Handle lastEvent
        let eventData = sensor.lastEvent.data
        if (sensor.spec === "lamp.call_log" && eventData?.value?.length > 0) {
          eventData = {
            ...eventData,
            value: eventData.value.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
          }
        }

        recentItems = [
          {
            timestamp: sensor.lastEvent.timestamp,
            sensor: sensor.spec,
            data: eventData,
          },
        ]
      }

      return {
        sensorName: sensor.name,
        sensorSpec: sensor.spec,
        totalEvents: dateRangeEnabled ? sensor.events?.length || 0 : sensor.lastEvent ? 1 : 0,
        recentItems: recentItems,
      }
    })

    console.log(JSON.stringify(sensorSummary, null, 2))
  }
  return (
    <Box className={classes.groupList}>
      <Box mb={2} display="flex" flexDirection="row" alignItems="center">
        <MuiPickersUtilsProvider locale={localeMap[getSelectedLanguage()]} utils={DateFnsUtils}>
          <Box display="flex" alignItems="center" flexWrap="wrap">
            <Box mr={2} mb={1}>
              <KeyboardDatePicker
                disabled={!dateRangeEnabled}
                margin="normal"
                id="start-date-picker"
                label="Start Date"
                format="MM/dd/yyyy"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change start date",
                }}
                className={classes.datePicker}
                variant="inline"
                inputVariant="outlined"
                clearable
                autoOk
                size="small"
                error={dateRangeEnabled && !startDate}
                helperText={dateRangeEnabled && !startDate ? "Please select a valid date" : ""}
              />
            </Box>
            <Box mr={2} mb={1}>
              <KeyboardDatePicker
                disabled={!dateRangeEnabled}
                margin="normal"
                clearable
                autoOk
                variant="inline"
                inputVariant="outlined"
                className={classes.datePicker}
                error={dateRangeEnabled && !endDate}
                helperText={dateRangeEnabled && !endDate ? "Please select a valid date" : ""}
                id="end-date-picker"
                label="End Date"
                format="MM/dd/yyyy"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change end date",
                }}
                size="small"
              />
            </Box>
            {dateRangeEnabled && (
              <Box ml={2} mb={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleApplyFilter}
                  disabled={!isFilterReady()}
                >
                  {t("Apply Filter")}
                </Button>
              </Box>
            )}
            <Box mb={1} display="flex" alignItems="center">
              <Box
                component="label"
                //  htmlFor="date-range-toggle"
                mr={1}
              >
                <Typography variant="body2">Enable Date Range</Typography>
              </Box>
              <Switch
                id="date-range-toggle"
                checked={dateRangeEnabled}
                onChange={handleToggleDateRange}
                color="primary"
                size="small"
              />
            </Box>
          </Box>
        </MuiPickersUtilsProvider>
      </Box>
      <Divider style={{ marginBottom: 16 }} />
      {items.map((item, index) => (
        <Box key={index} className={classes.groupItem}>
          <Typography className={classes.groupName}>{item.name}</Typography>
          <Typography className={classes.groupDesc}>{item.spec}</Typography>
          {dateRangeEnabled && item.events ? (
            <Box mt={1}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle2" color="textSecondary">
                  Events: {item.events.length}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  style={{ marginLeft: 8 }}
                >
                  {expandedIndex === index ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={expandedIndex === index} timeout="auto" unmountOnExit>
                <Box mt={1} pl={2} borderLeft="3px solid #ccc">
                  {item.events.length > 0 ? (
                    item.events.map((event: any, eventIdx: number) => (
                      <Box key={eventIdx} mb={2} pb={1} borderBottom="1px dashed #eee">
                        <Typography variant="body2" color="textPrimary">
                          <strong>Timestamp:</strong> {event.timestamp}
                        </Typography>
                        {selectedTab.tab === "activities" && (
                          <Box mt={1} pl={2}>
                            {event.temporal_slices?.map((slice: any, sliceIdx: number) => (
                              <Box key={sliceIdx} mb={1}>
                                <Typography variant="body2" color="textPrimary">
                                  <strong>Item:</strong> {slice.item}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Value:</strong> {slice.value || "N/A"}
                                </Typography>
                                {Object.keys(slice.emotions || {}).length > 0 && (
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Emotions:</strong>{" "}
                                    {Object.entries(slice.emotions)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(", ")}
                                  </Typography>
                                )}
                                <Typography variant="body2" color="textSecondary">
                                  <strong>Duration:</strong> {slice.duration} ms
                                </Typography>
                              </Box>
                            ))}
                            {/* Show static data if present */}
                            {event.static_data && (
                              <Box mt={2}>
                                <Typography variant="subtitle2" color="textPrimary">
                                  <strong>Responses:</strong>
                                </Typography>
                                <Box ml={2} mt={1}>
                                  {Object.keys(event.static_data.story_responses || {}).map((storyKey) => {
                                    const storyIndex = storyKey.replace("story_", "")
                                    const audioKey = `story_${storyIndex}_audio`
                                    const audioValue = event.static_data.audio_recordings?.[audioKey]

                                    return (
                                      <Box key={storyKey} mb={2}>
                                        <Typography variant="body2" color="textSecondary">
                                          <strong>Story {storyIndex}:</strong>
                                        </Typography>
                                        <Box ml={2}>
                                          <Typography variant="body2" color="textSecondary">
                                            <strong>Response:</strong> {event.static_data.story_responses[storyKey]}
                                          </Typography>
                                          {audioValue && (
                                            <Box mt={1}>
                                              <Typography variant="body2" color="textSecondary">
                                                <strong>Audio:</strong>
                                              </Typography>
                                              <audio controls>
                                                <source src={audioValue} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                              </audio>
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    )
                                  })}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}
                        {selectedTab.tab === "sensors" && (
                          <Box mt={1}>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Sensor Data:</strong>
                            </Typography>
                            {renderSensorData(event.data)}
                          </Box>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No events found in the selected date range.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>
          ) : (
            item.lastEvent && (
              <Box mt={1}>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Event: {item.lastEvent.timestamp}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    style={{ marginLeft: 8 }}
                  >
                    {expandedIndex === index ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
                <Collapse in={expandedIndex === index} timeout="auto" unmountOnExit>
                  {selectedTab.tab === "activities" && (
                    <Box mt={1} pl={2} borderLeft="3px solid #ccc">
                      {item.lastEvent.temporal_slices.map((slice: any, idx: number) => (
                        <Box key={idx} mb={1}>
                          <Typography variant="body2" color="textPrimary">
                            <strong>Item:</strong> {slice.item}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Value:</strong> {slice.value || "N/A"}
                          </Typography>
                          {Object.keys(slice.emotions || {}).length > 0 && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Emotions:</strong>{" "}
                              {Object.entries(slice.emotions)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                            </Typography>
                          )}
                          <Typography variant="body2" color="textSecondary">
                            <strong>Duration:</strong> {slice.duration} ms
                          </Typography>
                        </Box>
                      ))}
                      {item.lastEvent.static_data && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" color="textPrimary">
                            <strong>Responses:</strong>
                          </Typography>
                          <Box ml={2} mt={1}>
                            {Object.keys(item.lastEvent.static_data.story_responses || {}).map((storyKey) => {
                              const storyIndex = storyKey.replace("story_", "")
                              const audioKey = `story_${storyIndex}_audio`
                              const audioValue = item.lastEvent.static_data.audio_recordings?.[audioKey]

                              return (
                                <Box key={storyKey} mb={2}>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Story {Number(storyIndex) + 1}:</strong>
                                  </Typography>
                                  <Box ml={2}>
                                    <Typography variant="body2" color="textSecondary">
                                      <strong>Response:</strong> {item.lastEvent.static_data.story_responses[storyKey]}
                                    </Typography>
                                    {audioValue && (
                                      <Box mt={1}>
                                        <Typography variant="body2" color="textSecondary">
                                          <strong>Audio:</strong>
                                        </Typography>
                                        <audio controls>
                                          <source src={audioValue} type="audio/mpeg" />
                                          Your browser does not support the audio element.
                                        </audio>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              )
                            })}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                  {selectedTab.tab === "sensors" && item.lastEvent.data && (
                    <Box mt={1} pl={2} borderLeft="3px solid #ccc">
                      <Typography variant="body2" color="textPrimary">
                        <strong>Sensor Data:</strong>
                      </Typography>
                      {renderSensorData(item.lastEvent.data)}
                    </Box>
                  )}
                </Collapse>
              </Box>
            )
          )}
        </Box>
      ))}
    </Box>
  )
}

const ParticipantDetailItem: React.FC<ParticipantDetailItemProps> = ({
  participant,
  isEditing,
  onSave,
  studies,
  triggerSave,
  stats,
  sharedstudies,
}) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [isDeveloperInfoEditing, setIsDeveloperInfoEditing] = useState(false)
  const [currentHealthId, setCurrentHealthId] = useState("")
  const [selectedTab, setSelectedTab] = useState({ id: null, tab: null })
  const [editedValues, setEditedValues] = useState({
    firstName: "",
    name: "",
    lastName: "",
    email: "",
    mobile: "",
    userAge: "",
    gender: "",
    address: "",
    caregiverName: "",
    caregiverRelation: "",
    caregiverMobile: "",
    caregiverEmail: "",
    researcherNote: "",
    hospitalId: "",
    otherHealthIds: [],
    language: "",
    group_name: "",
    developer_info: {
      version: "",
      versionNumber: "",
      userIp: "",
      sourceUrl: "",
      browser: "",
      device: "",
      user: "",
      status: "",
      submittedOn: "",
    },
    demographics: {
      maritalStatus: "",
      educationYears: "",
      educationCategory: "",
      occupation: "",
      socioEconomicStatus: "",
      familyType: "",
      religion: "",
    },
  })

  console.log("ParticipantDetailItem", participant, editedValues)

  const handleSaveDeveloperInfo = async () => {
    setLoading(true)
    try {
      const userip = await fetchUserIp()
      const developerInfo = {
        ...editedValues.developer_info,
        userIp: userip,
        browser: navigator.userAgent
          ? navigator.userAgent.match(/chrome|firefox|safari|edge|opera/i)?.[0] || "Chrome"
          : "Chrome",
        device:
          navigator.userAgent && /windows/i.test(navigator.userAgent)
            ? "Windows"
            : navigator.userAgent && /mac/i.test(navigator.userAgent)
            ? "Mac OS"
            : "Windows",
        submittedOn: new Date().toLocaleString(),
      }

      await LAMP.Type.setAttachment(participant.id, "me", "emersive.participant.developer_info", {
        developer_info: developerInfo,
      })

      await Service.updateMultipleKeys(
        "participants",
        { participants: [{ id: participant.id, developer_info: developerInfo }] },
        ["developer_info"],
        "id"
      )

      setEditedValues((prev) => ({
        ...prev,
        developer_info: developerInfo,
      }))

      enqueueSnackbar(t("Developer info updated successfully"), { variant: "success" })
      setIsDeveloperInfoEditing(false)
    } catch (error) {
      console.error("Error updating developer info:", error)
      enqueueSnackbar(t("Failed to update developer info"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const mobileRegex = /^[0-9]{10}$/

      if (!emailRegex.test(editedValues.email)) {
        throw new Error(t("Invalid email format"))
      }
      if (!mobileRegex.test(editedValues.mobile)) {
        throw new Error(t("Mobile number must be 10 digits"))
      }
      console.log("handleSave", participant, editedValues)
      // Update in LAMP backend
      await LAMP.Participant.update(participant.id, editedValues)

      // Update in local DB
      const fieldtoupdate = [
        "firstName",
        "lastName",
        "email",
        "mobile",
        "userAge",
        "gender",
        "address",
        "caregiverName",
        "caregiverRelation",
        "caregiverMobile",
        "caregiverEmail",
        "researcherNote",
        "hospitalId",
        "otherHealthIds",
        "language",
        "group_name",
        "name",
        "username",
      ]

      await Service.updateMultipleKeys(
        "participants",
        {
          participants: [
            {
              id: participant.id,
              ...{
                ...editedValues,
                username: editedValues.name,
              },
            },
          ],
        },
        fieldtoupdate,
        "id"
      )
      await LAMP.Type.setAttachment(
        participant.id,
        "me",
        "emersive.participant.demographics",
        editedValues.demographics
      )
      enqueueSnackbar(t("Participant updated successfully"), { variant: "success" })
      const participantdetailsnew = await LAMP.Participant.view(participant.id)
      const senddetails = {
        ...participantdetailsnew,
        ...editedValues,
        name: editedValues.name,
        username: editedValues.name,
      }
      onSave(senddetails)
    } catch (error) {
      console.error("Error updating participant:", error)
      enqueueSnackbar(t("Failed to update participant: ") + error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDemographicsChange = (field, value) => {
    console.log("handleDemographicsChange", field, value)
    if (isEditing) {
      setEditedValues((prev) => ({
        ...prev,
        demographics: {
          ...prev.demographics,
          [field]: value,
        },
      }))
    }
  }

  const demographicOptions = {
    maritalStatus: [
      // Empty default option
      { value: "Married", label: "Married" },
      { value: "Single", label: "Single" },
      { value: "Separated", label: "Separated" },
      { value: "Divorced", label: "Divorced" },
      { value: "Widowed", label: "Widowed" },
      { value: "Not known", label: "Not known" },
      { value: "Other", label: "Other" },
    ],
    educationCategory: [
      { value: "Illiterate", label: "Illiterate" },
      { value: "Primary", label: "Primary" },
      { value: "Secondary", label: "Secondary" },
      { value: "Higher Secondary", label: "Higher Secondary" },
      { value: "Graduate", label: "Graduate" },
      { value: "Other", label: "Other" },
    ],
    occupation: [
      { value: "Student", label: "Student" },
      { value: "Professional", label: "Professional" },
      { value: "Semi Profession", label: "Semi Profession" },
      { value: "Clerical/Shop/Farm", label: "Clerical/Shop/Farm" },
      { value: "Skilled Worker", label: "Skilled Worker" },
      { value: "Semi Skilled Worker", label: "Semi Skilled Worker" },
      { value: "Unskilled Worker", label: "Unskilled Worker" },
      { value: "Homemaker", label: "Homemaker" },
      { value: "Unemployed", label: "Unemployed" },
      { value: "Not known", label: "Not known" },
    ],
    socioEconomicStatus: [
      { value: "Lower", label: "Lower" },
      { value: "Upper lower", label: "Upper lower" },
      { value: "Lower middle", label: "Lower middle" },
      { value: "Upper middle", label: "Upper middle" },
      { value: "Upper", label: "Upper" },
    ],
    familyType: [
      { value: "Nuclear", label: "Nuclear" },
      { value: "Joint", label: "Joint" },
      { value: "Extended", label: "Extended" },
      { value: "Extended-Nuclear", label: "Extended-Nuclear" },
      { value: "Other", label: "Other" },
    ],
    religion: [
      { value: "Hinduism", label: "Hinduism" },
      { value: "Islam", label: "Islam" },
      { value: "Christianity", label: "Christianity" },
      { value: "Sikhism", label: "Sikhism" },
      { value: "Buddhism", label: "Buddhism" },
      { value: "Other", label: "Other" },
    ],
  }

  // Define fields for the ViewItems component
  const fields: FieldConfig[] = [
    {
      id: "firstName",
      label: t("First Name"),
      value: participant?.firstName || "",
      editable: true,
      type: "text",
    },
    {
      id: "lastName",
      label: t("Last Name"),
      value: participant?.lastName || "",
      editable: true,
      type: "text",
    },
    {
      id: "name",
      label: t("Username"),
      value: participant?.name || "",
      editable: true,
      type: "text",
    },
    {
      id: "email",
      label: t("Email"),
      value: participant?.email || "",
      editable: true,
      type: "email",
    },
    {
      id: "mobile",
      label: t("Mobile"),
      value: participant?.mobile || "",
      editable: true,
      type: "phone",
    },
    {
      id: "userAge",
      label: t("Age"),
      value: participant?.userAge || "",
      editable: true,
      type: "text",
    },
    {
      id: "gender",
      label: t("Gender"),
      value: participant?.gender || "",
      editable: true,
      type: "select",
      options: [
        { value: "male", label: t("Male") },
        { value: "female", label: t("Female") },
        { value: "other", label: t("Other") },
      ],
    },
    // {
    //   id: "language",
    //   label: t("Language"),
    //   value: participant?.language || "en_US",
    //   editable: true, style={{justifyContent:'center'}}
    //   type: "select",
    //   options: [
    //     { value: "en_US", label: t("English") },
    //     { value: "es_ES", label: t("Spanish") },
    //     // Add more language options
    //   ],
    // },
    {
      id: "address",
      label: t("Address"),
      value: participant?.address || "",
      editable: true,
      type: "multiline",
    },
    {
      id: "researcherNote",
      label: t("Research Note"),
      value: participant?.researcherNote || "",
      editable: true,
      type: "multiline",
    },
    {
      id: "hospitalId",
      label: t("Hospital ID"),
      value: participant?.hospitalId || "",
      editable: true,
      type: "text",
    },
    {
      id: "otherHealthIds",
      label: t("Other Health IDs"),
      value: participant?.otherHealthIds || [],
      editable: true,
      type: "multi-text",
    },
  ]
  const renderStatsTabContent = (selectedTab, study, classes) => {
    let items = []
    const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

    switch (selectedTab.tab) {
      case "assessments":
        items = study.activities?.filter((a) => a.category?.includes("assess")) || []
        break
      case "activities":
        items = study.activities || []
        break
      case "sensors":
        // try {
        //   // Get last sensor events for all sensors
        //   const result = await fetchResult(
        //     ,
        //     study.id,
        //     "participant/mode/5",
        //     "study"
        //   )

        //   // Find this participant's data
        //   const participantData = result.find(p => p.id === participant.id)

        //   items = (study.sensors || []).map(sensor => {
        //     const lastEvent = participantData?.sensors?.find(s => s.spec === sensor.spec)?.lastEvent
        //     return {
        //       ...sensor,
        //       lastEvent: lastEvent ? {
        //         timestamp: new Date(lastEvent.timestamp).toLocaleString(),
        //         data: lastEvent.data,
        //       } : null
        //     }
        //   })
        // } catch (error) {
        //   console.error("Error fetching sensor events:", error)
        items = study.sensors || []
        // }
        break
      default:
        return null
    }
    return (
      <Box className={classes.groupList}>
        {items.length === 0 ? (
          <Typography className={classes.groupName}>{`No ${selectedTab.tab} present at this moment.`}</Typography>
        ) : (
          items.map((item, index) => (
            <Box key={index} className={classes.groupItem}>
              <Typography className={classes.groupName}>{item.name}</Typography>
              <Typography className={classes.groupDesc}>{item.spec}</Typography>
              {item.lastEvent && (
                <Box mt={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Event: {item.lastEvent.timestamp}
                  </Typography>
                  {selectedTab.tab === "activities" && (
                    <Typography variant="body2" color="textSecondary">
                      Type: {item.lastEvent.type}
                      {item.lastEvent.data && <span>, Value: {JSON.stringify(item.lastEvent.data)}</span>}
                    </Typography>
                  )}
                  {selectedTab.tab === "sensors" && item.lastEvent.data && (
                    <Typography variant="body2" color="textSecondary">
                      Data: {JSON.stringify(item.lastEvent.data)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>
    )
  }
  // Statistics content
  const statisticsContent_prev = stats ? (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        {t("Statistics")}
      </Typography>
      <Grid container spacing={2}>
        {stats(
          participant,
          studies.find((s) => s.id === participant.study_id)
        ).map((stat) => (
          <Grid item xs={12} sm={4} key={stat.key}>
            <Paper className={classes.statisticsCard} style={{ backgroundColor: `${stat.color}10` }}>
              <Typography variant="h4" style={{ color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="body2">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  ) : null

  const statisticsContent = stats ? (
    <Box>
      <Box className={classes.statsGrid}>
        {stats(
          participant,
          studies.find((s) => s.id === participant.study_id) || sharedstudies.find((s) => s.id === participant.study_id)
        ).map((stat) => (
          <Box
            key={stat.key}
            className={`${classes.statItem} ${
              selectedTab.id === participant.id && selectedTab.tab === stat.key ? "selected" : ""
            }`}
            onClick={() => {
              selectedTab.id === participant.id && selectedTab.tab === stat.key
                ? setSelectedTab({ id: null, tab: null })
                : setSelectedTab({ id: participant.id, tab: stat.key })
            }}
            style={{ backgroundColor: `${stat.color}10` }}
          >
            <Typography className={classes.statNumber} style={{ color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography className={classes.statLabel}>{stat.label}</Typography>
          </Box>
        ))}
      </Box>
      {selectedTab.id === participant.id && (
        <>
          {/* <Divider style={{ margin: '16px 0' }} /> */}
          {/* {renderStatsTabContent(
              selectedTab,
              studies.find(s => s.id === participant.study_id),
              classes
            )} */}
          <AsyncStatsContent
            selectedTab={selectedTab}
            study={
              studies.find((s) => s.id === participant.study_id) ||
              sharedstudies.find((s) => s.id === participant.study_id)
            }
            participant={participant}
            classes={classes}
          />
        </>
      )}
    </Box>
  ) : null

  const socioDemographicsContent = (
    <Box className={classes.tabContent}>
      {isEditing ? (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {/* <TextField
            fullWidth
            select
            label={t("Marital Status")}
            value={editedValues.demographics.maritalStatus}
            onChange={(e) => handleDemographicsChange("maritalStatus", e.target.value)}
            variant="outlined"
            required
            SelectProps={{native: false }}
          >
          {demographicOptions.maritalStatus.map(option => (
            <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
          ))}
          </TextField>
          {editedValues.demographics.maritalStatus === "Other" && (
            <TextField
              fullWidth
              label={t("Please specify")}
              value={editedValues.demographics.maritalStatus || ""}
              onChange={(e) => handleDemographicsChange("maritalStatus", e.target.value)}
              variant="outlined"
              margin="normal"
              size="small"
            />
          )} */}
            <CustomSelect
              options={demographicOptions.maritalStatus}
              value={editedValues.demographics.maritalStatus}
              onChange={(value) => handleDemographicsChange("maritalStatus", value)}
              label={t("Marital Status")}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t("Education (in years)")}
              value={editedValues.demographics.educationYears}
              onChange={(e) => handleDemographicsChange("educationYears", e.target.value)}
              variant="outlined"
              required
              type="number"
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              options={demographicOptions.educationCategory}
              value={editedValues.demographics.educationCategory}
              onChange={(value) => handleDemographicsChange("educationCategory", value)}
              label={t("Education Category")}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              options={demographicOptions.occupation}
              value={editedValues.demographics.occupation}
              onChange={(value) => handleDemographicsChange("occupation", value)}
              label={t("Occupation")}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              options={demographicOptions.socioEconomicStatus}
              value={editedValues.demographics.socioEconomicStatus}
              onChange={(value) => handleDemographicsChange("socioEconomicStatus", value)}
              label={t("Socio-economic status")}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              options={demographicOptions.familyType}
              value={editedValues.demographics.familyType}
              onChange={(value) => handleDemographicsChange("familyType", value)}
              label={t("Type of Family")}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              options={demographicOptions.religion}
              value={editedValues.demographics.religion}
              onChange={(value) => handleDemographicsChange("religion", value)}
              label={t("Religion")}
              required
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Marital Status")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.maritalStatus || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Education (in years)")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.educationYears || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Education Category")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.educationCategory || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Occupation")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.occupation || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Socio-economic status")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.socioEconomicStatus || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Type of Family")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.familyType || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t("Religion")}</Typography>
            <Typography variant="body2">{editedValues.demographics?.religion || "-"}</Typography>
          </Grid>
        </Grid>
      )}
    </Box>
  )

  // Create tabs configuration
  const tabs: TabConfig[] = [
    {
      id: "caregiver",
      label: t("Caregiver Information"),
      content: (
        <Box className={classes.tabContent}>
          <Typography variant="subtitle2">{isEditing}</Typography>
          {isEditing ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("Caregiver Name")}
                  value={editedValues.caregiverName}
                  onChange={(e) => handleValueChange("caregiverName", e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("Caregiver Relation")}
                  value={editedValues.caregiverRelation}
                  onChange={(e) => handleValueChange("caregiverRelation", e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("Caregiver Mobile")}
                  value={editedValues.caregiverMobile}
                  onChange={(e) => handleValueChange("caregiverMobile", e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("Caregiver Email")}
                  value={editedValues.caregiverEmail}
                  onChange={(e) => handleValueChange("caregiverEmail", e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Caregiver Name")}</Typography>
                <Typography>{participant.caregiverName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Caregiver Relation")}</Typography>
                <Typography>{participant.caregiverRelation}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Caregiver Mobile")}</Typography>
                <Typography>{participant.caregiverMobile}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Caregiver Email")}</Typography>
                <Typography>{participant.caregiverEmail}</Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      ),
    },
    {
      id: "study",
      label: t("Study Information"),
      content: (
        <Box className={classes.tabContent}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">{t("Study ID")}</Typography>
              <Typography>{participant.study_id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">{t("Study Name")}</Typography>
              <Typography>{participant.study_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">{t("Group Name")}</Typography>
              <Typography>{participant.group_name}</Typography>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      id: "socioDemographics",
      label: t("Socio Demographics"),
      content: socioDemographicsContent,
    },
    {
      id: "system",
      label: t("System Information"),
      content: (
        <Box className={classes.tabContent}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                className={`${classes.statusBox} ${
                  participant.isLoggedIn ? classes.statusActive : classes.statusInactive
                }`}
              >
                <span className={classes.statusIndicator} />
                <Typography>{participant.isLoggedIn ? t("Currently Active") : t("Currently Inactive")}</Typography>
              </Box>
            </Grid>
            {participant.isSuspended && (
              <Grid item xs={12}>
                <Box
                  className={`${classes.statusBox} ${
                    participant.isSuspended ? classes.statusActive : classes.statusInactive
                  }`}
                >
                  <span className={classes.statusIndicator} />
                  <Typography>
                    {participant.isSuspended ? t("Currently Suspended") : t("Currently not in Suspension")}
                  </Typography>
                </Box>
              </Grid>
            )}
            {participant.systemTimestamps && (
              <Box className={classes.scheduleItem}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">{t("Created At")}</Typography>
                    <Typography variant="body2">
                      {new Date(participant.systemTimestamps.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">{t("Last Login")}</Typography>
                    <Typography variant="body2">
                      {participant.systemTimestamps.lastLoginTime
                        ? new Date(participant.systemTimestamps.lastLoginTime).toLocaleString()
                        : t("Never")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">{t("Last Activity")}</Typography>
                    <Typography variant="body2">
                      {participant.systemTimestamps.lastActivityTime
                        ? new Date(participant.systemTimestamps.lastActivityTime).toLocaleString()
                        : t("Never")}
                    </Typography>
                  </Grid>
                  {participant.systemTimestamps.suspensionTime && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">{t("Suspended On")}</Typography>
                      <Typography variant="body2">
                        {new Date(participant.systemTimestamps.suspensionTime).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  {participant.systemTimestamps.deletedAt && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">{t("Deleted At")}</Typography>
                      <Typography variant="body2">
                        {new Date(participant.systemTimestamps.deletedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Grid>
        </Box>
      ),
    },
    {
      id: "stats",
      label: t("Statistics"),
      content: statisticsContent,
    },
  ]
  const handleValueChange = (field, value) => {
    if (isEditing && setEditedValues) {
      if (field.startsWith("developer_info.")) {
        const fieldName = field.split(".")[1]
        setEditedValues((prev) => ({
          ...prev,
          developer_info: {
            ...prev.developer_info,
            [fieldName]: value,
          },
        }))
      } else {
        setEditedValues((prev) => ({
          ...prev,
          [field]: value,
        }))
      }
    }
  }

  const getSubmissionInfo = () => {
    const developerInfo: DeveloperInfo = {
      version: editedValues.developer_info?.version || "v1.0",
      userIp: editedValues.developer_info?.userIp || "NA",
      sourceUrl: editedValues.developer_info?.sourceUrl || "NA",
      browser: editedValues.developer_info?.browser || "NA",
      device: editedValues.developer_info?.device || "NA",
      user: editedValues.developer_info?.user || participant.id,
      status: editedValues.developer_info?.status || "Active",
      submittedOn: editedValues.developer_info?.submittedOn || new Date().toLocaleString(),
    }
    return {
      ...developerInfo,
      onChangeStatus: () => {
        const newStatus = developerInfo.status === "Active" ? "Inactive" : "Active"
        // handleChangeStatus(newStatus)
      },
      isEditing: isDeveloperInfoEditing,
      onEdit: () => setIsDeveloperInfoEditing(true),
      onSave: handleSaveDeveloperInfo,
      editableFields: ["sourceUrl", "user"],
    }
  }

  useEffect(() => {
    if (participant) {
      const initializeData = async () => {
        try {
          // Fetch developer info
          let developer_info = null
          try {
            const devRes = (await LAMP.Type.getAttachment(participant.id, "emersive.participant.developer_info")) as any
            if (devRes.error === undefined && devRes.data) {
              developer_info = Array.isArray(devRes.data) ? devRes.data[0] : devRes.data
            }
          } catch (error) {
            console.error("Error fetching developer info:", error)
          }
          console.log("developer_info:", developer_info)
          let demographics_set = null
          try {
            const demographicsData = (await LAMP.Type.getAttachment(
              participant.id,
              "emersive.participant.demographics"
            )) as any
            if (demographicsData.error === undefined && demographicsData.data) {
              demographics_set = Array.isArray(demographicsData.data) ? demographicsData.data[0] : demographicsData.data
              if (demographics_set) {
                setEditedValues((prev) => ({ ...prev, demographics: demographics_set }))
              }
            }
          } catch (error) {
            console.error("Error fetching demographics data:", error)
          }
          setEditedValues({
            firstName: participant.firstName || "",
            lastName: participant.lastName || "",
            name: participant.name || "",
            email: participant.email || "",
            mobile: participant.mobile || "",
            userAge: participant.userAge || "",
            gender: participant.gender || "",
            address: participant.address || "",
            caregiverName: participant.caregiverName || "",
            caregiverRelation: participant.caregiverRelation || "",
            caregiverMobile: participant.caregiverMobile || "",
            caregiverEmail: participant.caregiverEmail || "",
            researcherNote: participant.researcherNote || "",
            hospitalId: participant.hospitalId || "",
            otherHealthIds: participant.otherHealthIds || [],
            language: participant.language || "en_US",
            group_name: participant.group_name || "",
            developer_info: developer_info || {},
            demographics: demographics_set || {
              maritalStatus: "",
              educationYears: "",
              educationCategory: "",
              occupation: "",
              socioEconomicStatus: "",
              familyType: "",
              religion: "",
            },
          })
        } catch (error) {
          console.error("Error initializing participant data:", error)
        }
      }
      initializeData()
    }
  }, [participant])

  useEffect(() => {
    if (triggerSave && isEditing) {
      handleSave()
    }
  }, [triggerSave])
  return (
    <div className={classes.rootContainer}>
      <ViewItems
        fields={fields}
        tabs={tabs}
        isEditing={isEditing}
        editedValues={editedValues}
        setEditedValues={setEditedValues}
        onSave={handleSave}
        additionalContent={null}
        submissionInfo={getSubmissionInfo()}
      />
    </div>
  )
}

export default ParticipantDetailItem
