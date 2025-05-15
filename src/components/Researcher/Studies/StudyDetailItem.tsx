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
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
} from "@material-ui/core"
import ViewItems, { FieldConfig, TabConfig } from "../SensorsList/ViewItems"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { DeveloperInfo, fetchUserIp } from "../ActivityList/ActivityDetailItem"
import { ImageUploader } from "../../ImageUploader"
import { useHistory } from "react-router-dom"
import { fetchGetData } from "../SaveResearcherData"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    statsContainer: {
      backgroundColor: "#fff",
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[1],
    },
    buttonGroup: {
      marginBottom: theme.spacing(2),
    },
    scoreRange: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: "#f5f5f5",
    },
    groupList: {
      maxHeight: "200px",
      overflowY: "auto",
      marginTop: theme.spacing(2),
    },
    sectionTitle: {
      color: theme.palette.primary.main,
      fontWeight: 600,
      marginBottom: theme.spacing(2),
    },
  })
)

function getAccessScope(value: any) {
  const scopes = []
  if (value & 4) scopes.push("Action")
  if (value & 2) scopes.push("Edit")
  if (value & 1) scopes.push("View")
  if (value === 0) scopes.push("None")
  return scopes.join(", ")
}

interface StudyFormState {
  name: string
  description: string
  purpose: string
  studyType: string
  piInstitution: string
  hasFunding: boolean
  fundingAgency: string
  hasEthicsPermission: boolean
  ethicsPermissionDoc: null | File
  mobile: string
  email: string
  state: string
  collaboratingInstitutions: string[]
  sub_researchers: any[]
  timestamps: {
    completedAt: null | string
    deletedAt: null | string
    firstEnrollmentAt: null | string
    lastEnrollmentAt: null | string
    productionAt: null | string
    sharedAt: null | string
    suspendedAt: null | string
  }
  adminNote: string
  participants: any[]
  activities: any[]
  sensors: any[]
  gname: string[]
  developer_info: {
    version: string
    versionNumber: string
    userIp: string
    sourceUrl: string
    browser: string
    device: string
    user: string
    status: string
    submittedOn: string
  }
}

interface StudyDetailItemProps {
  study: any
  isEditing: boolean
  onSave: (updatedStudy: any) => void
  researcherId: string
  triggerSave?: boolean
}

const StudyDetailItem: React.FC<StudyDetailItemProps> = ({ study, isEditing, onSave, researcherId, triggerSave }) => {
  const history = useHistory()
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [isDeveloperInfoEditing, setIsDeveloperInfoEditing] = useState(false)
  const [collaboratingInstitutions, setCollaboratingInstitutions] = useState<string>("")

  console.log(study)
  // Form state
  const [editedValues, setEditedValues] = useState({
    name: "",
    description: "",
    purpose: "",
    studyType: "",
    piInstitution: "",
    hasFunding: false,
    fundingAgency: "",
    hasEthicsPermission: false,
    ethicsPermissionDoc: null,
    mobile: "",
    email: "",
    state: "",
    collaboratingInstitutions: [],
    sub_researchers: [],
    participants: [],
    sensors: [],
    activities: [],
    gname: [],
    timestamps: {
      completedAt: null,
      deletedAt: null,
      firstEnrollmentAt: null,
      lastEnrollmentAt: null,
      productionAt: null,
      sharedAt: null,
      suspendedAt: null,
    },
    adminNote: "",
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

  useEffect(() => {
    const fetchInstitutions = async () => {
      const institutionsSet = new Set<string>()

      await Promise.all(
        editedValues.sub_researchers?.map(async (researcher) => {
          try {
            const res = (await LAMP.Researcher.view(researcher.ResearcherID)) as any
            if (res?.institution) {
              institutionsSet.add(res.institution)
            }
          } catch (error) {
            try {
              const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
              const response = await fetchGetData(
                authString,
                `researcher/others/list/${researcher.ResearcherID}`,
                "researcher"
              )
              const researcherData = response.data[0]
              console.log("researcherData", researcherData)
              if (researcherData?.institution) {
                institutionsSet.add(researcherData.institution)
              }
            } catch (secondError) {
              console.error("Failed to fetch researcher with alternative method:", secondError)
            }
          }
        }) || []
      )

      setCollaboratingInstitutions(Array.from(institutionsSet).join(", "))
    }
    fetchInstitutions()
  }, [editedValues.sub_researchers])

  // Define fields for the ViewItems component
  const fields: FieldConfig[] = [
    {
      id: "studyId",
      label: t("Study ID"),
      value: study?.id || "",
      editable: false,
    },
    {
      id: "name",
      label: t("Study Name"),
      value: study?.name || "",
      editable: true,
    },
    {
      id: "gname",
      label: t("Groups"),
      value: study?.gname || "",
      editable: true,
      type: "multi-text",
    },
    {
      id: "mobile",
      label: t("Study Mobile"),
      value: study?.mobile || "",
      editable: true,
      type: "phone",
    },
    {
      id: "email",
      label: t("Study Email"),
      value: study?.email || "",
      editable: true,
      type: "email",
    },
    {
      id: "description",
      label: t("Description"),
      value: study?.description || "",
      editable: true,
      type: "multiline",
    },
    {
      id: "purpose",
      label: t("Study Purpose"),
      value: study?.purpose || "",
      editable: true,
      type: "select",
      options: [
        { value: "practice", label: t("Practice") },
        { value: "support", label: t("Support") },
        { value: "research", label: t("Research") },
        { value: "other", label: t("Other") },
      ],
    },
    {
      id: "studyType",
      label: t("Study Type"),
      value: study?.studyType || "",
      editable: true,
      type: "select",
      options: [
        { value: "DE", label: t("Descriptive") },
        { value: "CC", label: t("Case Control") },
        { value: "CO", label: t("Cohort") },
        { value: "OB", label: t("Observational") },
        { value: "RCT", label: t("RCTs") },
        { value: "OC", label: t("Other Clinical trials") },
      ],
      hide: editedValues.purpose !== "research",
    },
    {
      id: "piInstitution",
      label: t("PI Institution"),
      value: study?.piInstitution || "",
      editable: true,
    },
    {
      id: "collaboratingInstitutions",
      label: t("Collaborating Institutions"),
      value: collaboratingInstitutions || "",
      editable: false,
      type: "multiline",
    },
    {
      id: "adminNote",
      label: t("Admin Notes"),
      value: study?.adminNote || "",
      editable: true,
      type: "multiline",
    },
  ]

  // Create tab contents
  const FundingAndEthicsContent = () => (
    <Box className={classes.tabContent}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography gutterBottom>Has Funding</Typography>
          <ButtonGroup className={classes.buttonGroup}>
            <Button
              variant={editedValues.hasFunding ? "contained" : "outlined"}
              color={editedValues.hasFunding ? "primary" : "default"}
              onClick={() => handleValueChange("hasFunding", true)}
              disabled={!isEditing}
            >
              Yes
            </Button>
            <Button
              variant={!editedValues.hasFunding ? "contained" : "outlined"}
              color={!editedValues.hasFunding ? "primary" : "default"}
              onClick={() => handleValueChange("hasFunding", false)}
              disabled={!isEditing}
            >
              No
            </Button>
          </ButtonGroup>
        </Grid>
        {editedValues.hasFunding && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("Funding Agency")}
              defaultValue={editedValues.fundingAgency}
              onChange={(e) => handleValueChange("fundingAgency", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography gutterBottom>Ethics Permission</Typography>
          <ButtonGroup className={classes.buttonGroup}>
            <Button
              variant={editedValues.hasEthicsPermission ? "contained" : "outlined"}
              color={editedValues.hasEthicsPermission ? "primary" : "default"}
              onClick={() => handleValueChange("hasEthicsPermission", true)}
              disabled={!isEditing}
            >
              Yes
            </Button>
            <Button
              variant={!editedValues.hasEthicsPermission ? "contained" : "outlined"}
              color={!editedValues.hasEthicsPermission ? "primary" : "default"}
              onClick={() => handleValueChange("hasEthicsPermission", false)}
              disabled={!isEditing}
            >
              No
            </Button>
          </ButtonGroup>
          {editedValues.hasEthicsPermission && (
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={!isEditing}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleValueChange("ethicsPermissionDoc", file)
                }
              }}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  )
  type ResearcherInfo = {
    name: string
    accessScope: string
  }
  const ResearchersContent = () => {
    const [validResearchers, setValidResearchers] = useState<ResearcherInfo[] | null>(null)
    console.log(editedValues.sub_researchers)
    if (validResearchers === null) {
      const fetchValidResearchers = async () => {
        const results: ResearcherInfo[] = []

        await Promise.all(
          editedValues.sub_researchers?.map(async (researcher) => {
            try {
              const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
              const response = await fetchGetData(
                authString,
                `researcher/others/list/${researcher.ResearcherID}`,
                "researcher"
              )
              const researchers = response.data[0]

              // const res = await LAMP.Researcher.view(researcher.ResearcherID)
              results.push({
                name: researchers.name || researcher.ResearcherID,
                accessScope: getAccessScope(researcher.access_scope),
              })
            } catch {
              console.log("check this")
            }
          }) || []
        )

        setValidResearchers(results)
      }

      fetchValidResearchers()
      return <CircularProgress />
    }

    return (
      <Box className={classes.tabContent}>
        <List>
          {validResearchers.map((researcher, index) => (
            <ListItem key={index}>
              <ListItemText primary={researcher.name} secondary={`Access: ${researcher.accessScope}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    )
  }

  const StatisticsContent = () => (
    <Box className={classes.tabContent}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t("Groups")} ({editedValues.gname?.length || 0})
          </Typography>
          <List>
            {editedValues.gname?.map((group, index) => (
              <ListItem key={index} dense>
                <ListItemText primary={group} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t("Participants")} ({editedValues.participants?.length || 0})
          </Typography>
          <List>
            {editedValues.participants?.map((participant, index) => (
              <ListItem
                key={index}
                dense
                button
                onClick={() => {
                  localStorage.setItem("participant_filter", participant.id)
                  history.push(`/researcher/${researcherId}/users`)
                  window.location.href = `/#/researcher/${researcherId}/users?filter=${participant.id}`
                }}
              >
                <ListItemText primary={participant.name} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t("Activities")} ({editedValues.activities?.length || 0})
          </Typography>
          <List>
            {editedValues.activities?.map((activity, index) => (
              <ListItem
                key={index}
                dense
                button
                onClick={() => {
                  localStorage.setItem("activity_filter", activity.id)
                  history.push(`/researcher/${researcherId}/activities`)
                  window.location.href = `/#/researcher/${researcherId}/activities?filter=${activity.id}`
                }}
              >
                <ListItemText primary={activity.name} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t("Sensors")} ({editedValues.sensors?.length || 0})
          </Typography>
          <List>
            {editedValues.sensors?.map((sensor, index) => (
              <ListItem
                key={index}
                dense
                button
                onClick={() => {
                  localStorage.setItem("sensor_filter", sensor.id)
                  history.push(`/researcher/${researcherId}/sensors`)
                  window.location.href = `/#/researcher/${researcherId}/sensors?filter=${sensor.id}`
                }}
              >
                <ListItemText primary={sensor.name} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Box>
  )

  const StudyStateContent = () => (
    <Box className={classes.tabContent}>
      <FormControl fullWidth>
        <InputLabel>{t("State")}</InputLabel>
        <Select
          value={editedValues.state || "development"}
          disabled={!isEditing}
          onChange={(e) => {
            const newstate = e.target.value
            handleValueChange("state", newstate)
            handleValueChange("timestamps", {
              ...editedValues.timestamps,
              productionAt: newstate === "production" ? new Date() : editedValues.timestamps.productionAt,
              completedAt: newstate === "complete" ? new Date() : editedValues.timestamps.completedAt,
            })
          }}
        >
          <MenuItem value="development">{t("Development")}</MenuItem>
          <MenuItem value="production">{t("Production")}</MenuItem>
          <MenuItem value="complete">{t("Complete")}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )

  const DateContent = () => (
    <Box className={classes.tabContent}>
      <Grid container spacing={2}>
        {study.timestamps &&
          Object.entries(study.timestamps).map(([key, value]) => (
            <Grid item xs={6} key={key}>
              <Typography variant="subtitle2">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </Typography>
              <Typography>{value ? new Date(value as string).toLocaleDateString() : t("Not available")}</Typography>
            </Grid>
          ))}
        <Grid item xs={6}>
          <Typography variant="subtitle2">{t("Created at")}</Typography>
          <Typography>
            {study.timestamp ? new Date(study.timestamp).toLocaleDateString() : t("Not available")}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
  // Define tabs configuration
  const tabs: TabConfig[] = [
    {
      id: "fundingAndEthics",
      label: t("Funding & Ethics"),
      content: <FundingAndEthicsContent />,
    },
    {
      id: "researchers",
      label: t("Researchers"),
      content: <ResearchersContent />,
    },
    {
      id: "statistics",
      label: t("Statistics"),
      content: <StatisticsContent />,
    },
    {
      id: "studyState",
      label: t("Study State"),
      content: <StudyStateContent />,
    },
    {
      id: "importantDates",
      label: t("Important Dates"),
      content: <DateContent />,
    },
  ]

  // Handler functions
  const handleValueChange = (field: string, value: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validation
      if (!editedValues.name?.trim()) {
        throw new Error(t("Study name is required"))
      }

      const { developer_info, ...studyData } = editedValues
      console.log("developer_info from editedValues", developer_info)
      // Update in LAMP backend
      await LAMP.Study.update(study.id, studyData)

      // Update in local DB
      await Service.updateMultipleKeys(
        "studies",
        { studies: [{ id: study.id, ...studyData }] },
        Object.keys(studyData),
        "id"
      )
      // if (editedValues.developer_info) {
      //   await LAMP.Type.setAttachment(study.id, "me", "emersive.study.developer_info", {
      //     developer_info: editedValues.developer_info,
      //   })
      // }

      enqueueSnackbar(t("Study updated successfully"), { variant: "success" })
      onSave(studyData)
    } catch (error) {
      console.error("Error updating study:", error)
      enqueueSnackbar(t("Failed to update study: ") + error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Developer info handlers
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
            : navigator.userAgent && /android/i.test(navigator.userAgent)
            ? "Android"
            : navigator.userAgent && /iphone|ipad/i.test(navigator.userAgent)
            ? "iOS"
            : "Windows",
        submittedOn: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
          new Date().getDate()
        ).padStart(2, "0")} ${String(new Date().getHours()).padStart(2, "0")}:${String(
          new Date().getMinutes()
        ).padStart(2, "0")}:${String(new Date().getSeconds()).padStart(2, "0")}`,
      }

      console.log("setAttachment", study.id, "me", "emersive.study.developer_info", developerInfo)
      await LAMP.Type.setAttachment(
        study.id,
        "me",
        "emersive.study.developer_info",
        // [
        {
          developer_info: developerInfo,
        }
        // ]
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

  // Initialize data
  useEffect(() => {
    if (study) {
      const initializeData = async () => {
        try {
          let developer_info = null
          const devRes = (await LAMP.Type.getAttachment(study.id, "emersive.study.developer_info")) as any
          console.log("getAttachment", study.id, "emersive.study.developer_info", devRes)
          if (devRes.error === undefined && devRes.data) {
            developer_info = devRes.data[0].developer_info
            // {...devRes.data, "0":null}
          }

          setEditedValues({
            name: study.name || "",
            description: study.description || "",
            purpose: study.purpose || "",
            studyType: study.studyType || "",
            piInstitution: study.piInstitution || "",
            hasFunding: study.hasFunding || false,
            fundingAgency: study.fundingAgency || "",
            hasEthicsPermission: study.hasEthicsPermission || false,
            ethicsPermissionDoc: study.ethicsPermissionDoc || null,
            mobile: study.mobile || "",
            email: study.email || "",
            state: study.state || "",
            collaboratingInstitutions: study.collaboratingInstitutions || [],
            sub_researchers: study.sub_researchers || [],
            timestamps: study.timestamps || {},
            adminNote: study.adminNote || "",
            participants: study.participants || [],
            activities: study.activities || [],
            sensors: study.sensors || [],
            gname: study.gname || [],
            developer_info: developer_info || {
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
        } catch (error) {
          console.error("Error initializing study data:", error)
        }
      }
      initializeData()
    }
  }, [study])

  // Handle trigger save
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
        loading={loading}
        submissionInfo={{
          version: editedValues.developer_info?.version || "v1.0",
          userIp: editedValues.developer_info?.userIp || "NA",
          sourceUrl: editedValues.developer_info?.sourceUrl || "NA",
          browser: editedValues.developer_info?.browser || "NA",
          device: editedValues.developer_info?.device || "NA",
          user: editedValues.developer_info?.user || study.id,
          status: editedValues.developer_info?.status || "Active",
          submittedOn: editedValues.developer_info?.submittedOn || new Date().toLocaleString(),
          isEditing: isDeveloperInfoEditing,
          onEdit: () => setIsDeveloperInfoEditing(true),
          onSave: handleSaveDeveloperInfo,
          editableFields: ["sourceUrl", "user"],
        }}
      />
    </div>
  )
}

export default StudyDetailItem
