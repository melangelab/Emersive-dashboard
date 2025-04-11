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
} from "@material-ui/core"
import ViewItems, { FieldConfig, TabConfig } from "../SensorsList/ViewItems"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import CloseIcon from "@material-ui/icons/Close"
import { DeveloperInfo, fetchUserIp } from "../ActivityList/ActivityDetailItem"
import { fetchResult } from "../SaveResearcherData"

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
  })
)

interface ParticipantDetailItemProps {
  participant: any
  isEditing: boolean
  onSave: (updatedParticipant: any) => void
  studies: Array<any>
  triggerSave?: boolean
  stats?: (participant: any, study: any) => any[]
}

const AsyncStatsContent: React.FC<{
  selectedTab: any
  study: any
  participant: any
  classes: any
}> = ({ selectedTab, study, participant, classes }) => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        let newItems: any[] = []
        const result = await fetchResult(authString, study.id, "participant/mode/5", "study")
        const participantData = result.participants?.find((p) => p.id === participant.id)
        if (selectedTab.tab === "assessments") {
          newItems = study.activities?.filter((a) => a.category?.includes("assess")) || []
        } else if (selectedTab.tab === "activities") {
          newItems = (study.activities || []).map((activity) => {
            const activityEvent = participantData?.last_activity_events?.find((e) => e.activity_id === activity.id)
            return {
              ...activity,
              lastEvent: activityEvent?.last_event
                ? {
                    timestamp: new Date(activityEvent.last_event.timestamp).toLocaleString(),
                    // type: activityEvent.last_event.type,
                    // data: activityEvent.data,
                  }
                : null,
            }
          })
        } else if (selectedTab.tab === "sensors") {
          newItems = (study.sensors || []).map((sensor) => {
            const sensorEvent = participantData?.last_sensor_events?.find((s) => s.sensor_spec === sensor.spec)
            return {
              ...sensor,
              lastEvent: sensorEvent?.last_event
                ? {
                    timestamp: new Date(sensorEvent.last_event.timestamp).toLocaleString(),
                    // data: sensorEvent.last_event.data,
                  }
                : null,
            }
          })
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
  }, [selectedTab, study, participant])

  if (loading) {
    return <Typography className={classes.groupName}>Loading...</Typography>
  }

  if (items.length === 0) {
    return <Typography className={classes.groupName}>{`No ${selectedTab.tab} present at this moment.`}</Typography>
  }

  return (
    <Box className={classes.groupList}>
      {items.map((item, index) => (
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
  })

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
      ]

      await Service.updateMultipleKeys(
        "participants",
        {
          participants: [
            {
              id: participant.id,
              ...editedValues,
            },
          ],
        },
        fieldtoupdate,
        "id"
      )

      enqueueSnackbar(t("Participant updated successfully"), { variant: "success" })
      onSave(editedValues)
    } catch (error) {
      console.error("Error updating participant:", error)
      enqueueSnackbar(t("Failed to update participant: ") + error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
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
    //   editable: true,
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
            study={studies.find((s) => s.id === participant.study_id)}
            participant={participant}
            classes={classes}
          />
        </>
      )}
    </Box>
  ) : null

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
          const devRes = (await LAMP.Type.getAttachment(participant.id, "emersive.participant.developer_info")) as any
          if (devRes.error === undefined && devRes.data) {
            developer_info = devRes.data
          }
          setEditedValues({
            firstName: participant.firstName || "",
            lastName: participant.lastName || "",
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
