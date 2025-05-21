import React, { useState, useEffect } from "react"
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

const AsyncStatsContent: React.FC<{
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
          ? `participant/mode/6?from_date=${startDate?.getTime()}&to_date=${endDate?.getTime()}`
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
                                {/* {event.static_data.story_responses && (
                                  <Box ml={2} mt={1}>
                                    {Object.entries(event.static_data.story_responses).map(([key, value]) => (
                                      <Typography key={key} variant="body2" color="textSecondary">
                                        <strong>{key}:</strong> {value}
                                      </Typography>
                                    ))}
                                  </Box>
                                )} */}
                                {/* {event.static_data.sentiment && (
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Sentiment:</strong> {event.static_data.sentiment}
                                  </Typography>
                                )} */}
                                {/* {event.static_data.audio_recordings && (
                                  <Box mt={2}>
                                    <Typography variant="subtitle2" color="textPrimary">
                                      <strong>Audio Recordings:</strong>
                                    </Typography>
                                    <Box ml={2}>
                                      {Object.entries(event.static_data.audio_recordings).map(([key, value]) => (
                                        <Box key={key} mt={1}>
                                          <Typography variant="body2" color="textSecondary">
                                            <strong>{key}:</strong>
                                          </Typography>
                                          <audio controls>
                                            <source src={value as string} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                          </audio>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                )} */}
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
                {/* {selectedTab.tab === "activities" && item.lastEvent.temporal_slices && (
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
                        <strong>Emotions:</strong> {Object.entries(slice.emotions).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <strong>Duration:</strong> {slice.duration} ms
                    </Typography>
                  </Box>
                ))}
              </Box>
            )} */}
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

                          {/* {item.lastEvent.static_data.story_responses && (
                            <Box ml={2} mt={1}>
                              {Object.entries(item.lastEvent.static_data.story_responses).map(([key, value]) => (
                                <Typography key={key} variant="body2" color="textSecondary">
                                  <strong>{key}:</strong> {value}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          {item.lastEvent.static_data.sentiment && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Sentiment:</strong> {item.lastEvent.static_data.sentiment}
                            </Typography>
                          )}
                          {item.lastEvent.static_data.audio_recordings && (
                            <Box mt={2}>
                              <Typography variant="subtitle2" color="textPrimary">
                                <strong>Audio Recordings:</strong>
                              </Typography>
                              <Box ml={2}>
                                {Object.entries(item.lastEvent.static_data.audio_recordings).map(([key, value]) => (
                                  <Box key={key} mt={1}>
                                    <Typography variant="body2" color="textSecondary">
                                      <strong>{key}:</strong>
                                    </Typography>
                                    <audio controls>
                                      <source src={value as string} type="audio/mpeg" />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )} */}
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
          studies.find((s) => s.id === participant.study_id)
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
