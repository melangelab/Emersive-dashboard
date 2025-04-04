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
} from "@material-ui/core"
import ViewItems, { FieldConfig, TabConfig } from "../SensorsList/ViewItems"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"

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
  })

  useEffect(() => {
    if (participant) {
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
      })
    }
  }, [participant])

  useEffect(() => {
    if (triggerSave && isEditing) {
      handleSave()
    }
  }, [triggerSave])

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
    {
      id: "language",
      label: t("Language"),
      value: participant?.language || "en_US",
      editable: true,
      type: "select",
      options: [
        { value: "en_US", label: t("English") },
        { value: "es_ES", label: t("Spanish") },
        // Add more language options
      ],
    },
    {
      id: "address",
      label: t("Address"),
      value: participant?.address || "",
      editable: true,
      type: "multiline",
    },
  ]

  // Create tabs configuration
  const tabs: TabConfig[] = [
    {
      id: "caregiver",
      label: t("Caregiver Information"),
      content: (
        <Box className={classes.tabContent}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("Caregiver Details")}
              </Typography>
            </Grid>
            {/* Add caregiver form fields here */}
          </Grid>
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
            {/* Add more study information */}
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
            {/* Add more system information */}
          </Grid>
        </Box>
      ),
    },
  ]

  // Statistics content
  const statisticsContent = stats ? (
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

  return (
    <div className={classes.rootContainer}>
      <ViewItems
        fields={fields}
        tabs={tabs}
        isEditing={isEditing}
        editedValues={editedValues}
        setEditedValues={setEditedValues}
        onSave={handleSave}
        additionalContent={statisticsContent}
        submissionInfo={{
          version: "v1.0",
          user: participant.id,
          status: participant.isLoggedIn ? "Online" : "Offline",
          submittedOn: participant.systemTimestamps?.lastLoginTime
            ? new Date(participant.systemTimestamps.lastLoginTime).toLocaleString()
            : t("Never"),
          device: participant.deviceToken || "-",
          browser: participant.browserInfo || "-",
        }}
      />
    </div>
  )
}

export default ParticipantDetailItem
