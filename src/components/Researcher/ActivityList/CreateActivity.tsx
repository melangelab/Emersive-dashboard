import React, { useState, useEffect } from "react"
import { Box, Button, FormControlLabel, Paper, Switch, TextField, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { SchemaList } from "./ActivityMethods"
import ViewItems, { FieldConfig } from "../SensorsList/ViewItems"
import DynamicForm from "../../shared/DynamicForm"
import { saveTipActivity, saveSurveyActivity, saveCTestActivity } from "./ActivityMethods"
import cbtThoughtRecordInstance from "./CBTSettings"
import FormBuilder from "./FormBuilder"
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: "100%",
    margin: "0 auto",
  },
}))

interface CreateActivityProps {
  studies: Array<any>
  selectedSpec?: any
  researcherId: string
  onSave: (newActivity: any) => void
  onCancel: () => void
}

const CreateActivity: React.FC<CreateActivityProps> = ({ studies, selectedSpec, researcherId, onSave, onCancel }) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [schemaListObj, setSchemaListObj] = useState({})
  console.log("selectedSpec", selectedSpec)
  // Form state
  const [editedValues, setEditedValues] = useState({
    name: "",
    description: "",
    spec: selectedSpec.id || "",
    settings: selectedSpec.id === "lamp.cbt_thought_record" ? cbtThoughtRecordInstance.settings : {},
    formula4Fields: null,
    category: [],
    study_id: "",
    groups: [],
    photo: null,
    showInFeed: true,
    streak: {
      enabled: false,
      title: "",
      description: "",
    },
  })

  useEffect(() => {
    setSchemaListObj(SchemaList())
  }, [])

  // Load default settings when spec changes
  useEffect(() => {
    if (editedValues.spec) {
      const schema = SchemaList()[editedValues.spec]
      if (schema?.settings && editedValues.spec !== "lamp.cbt_thought_record") {
        setEditedValues((prev) => ({
          ...prev,
          settings: schema.settings,
        }))
      }
    }
  }, [editedValues.spec])

  useEffect(() => {
    if (editedValues.study_id) {
      const selectedStudy = studies.find((s) => s.id === editedValues.study_id)
      if (selectedStudy) {
        // Clear groups if they don't exist in new study
        setEditedValues((prev) => ({
          ...prev,
          groups: prev.groups.filter((g) => selectedStudy.gname.includes(g)),
        }))
      }
    }
  }, [editedValues.study_id, studies])

  // Define fields for ViewItems
  const fields: FieldConfig[] = [
    {
      id: "name",
      label: t("Activity Name"),
      value: editedValues.name,
      editable: true,
      type: "text",
    },
    {
      id: "description",
      label: t("Description"),
      value: editedValues.description,
      editable: true,
      type: "multiline",
    },
    {
      id: "spec",
      label: t("Activity Type"),
      value: editedValues.spec,
      editable: false,
      type: "select",
    },
    {
      id: "study_id",
      label: t("Study"),
      value: editedValues.study_id,
      editable: true,
      type: "select",
      options: studies.map((study) => ({
        value: study.id,
        label: study.name,
      })),
    },
    {
      id: "groups",
      label: t("Groups"),
      value: editedValues.groups,
      editable: true,
      type: "multiselect",
      options:
        studies
          .find((s) => s.id === editedValues.study_id)
          ?.gname.map((group) => ({
            value: group,
            label: group,
            disabled: false,
          })) || [],
    },

    {
      id: "category",
      label: t("Categories"),
      value: editedValues.category,
      editable: true,
      type: "multiselect",
      options: [
        { value: "assess", label: t("Assess") },
        { value: "learn", label: t("Learn") },
        { value: "manage", label: t("Manage") },
        { value: "prevent", label: t("Portal") },
      ],
    },
    {
      id: "photo",
      label: t("Activity Image"),
      value: editedValues.photo,
      editable: true,
      type: "image",
    },
  ]

  // Additional settings content
  const additionalContent = (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={editedValues.showInFeed}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                showInFeed: e.target.checked,
              }))
            }
          />
        }
        label={t("Show in Participant Feed")}
      />
      {editedValues.showInFeed && (
        <Box mt={2}>
          <FormControlLabel
            control={
              <Switch
                checked={editedValues.streak.enabled}
                onChange={(e) =>
                  setEditedValues((prev) => ({
                    ...prev,
                    streak: {
                      ...prev.streak,
                      enabled: e.target.checked,
                    },
                  }))
                }
              />
            }
            label={t("Enable Streak")}
          />
          {editedValues.streak.enabled && (
            <>
              <TextField
                fullWidth
                label={t("Streak Title")}
                value={editedValues.streak.title}
                onChange={(e) =>
                  setEditedValues((prev) => ({
                    ...prev,
                    streak: {
                      ...prev.streak,
                      title: e.target.value,
                    },
                  }))
                }
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("Streak Description")}
                value={editedValues.streak.description}
                onChange={(e) =>
                  setEditedValues((prev) => ({
                    ...prev,
                    streak: {
                      ...prev.streak,
                      description: e.target.value,
                    },
                  }))
                }
                margin="normal"
              />
            </>
          )}
        </Box>
      )}
      {editedValues.spec && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            {t("Activity Settings")}
          </Typography>
          {editedValues.spec === "lamp.form_builder" ? (
            <FormBuilder
              onChange={(formData) => {
                setEditedValues((prev) => ({
                  ...prev,
                  formula4Fields: formData.formula,
                  settings: formData.fields,
                }))
              }}
              formFieldsProp={Array.isArray(editedValues.settings) || []}
              formula={editedValues.formula4Fields}
            />
          ) : Object.keys(schemaListObj).includes(editedValues.spec) ? (
            <DynamicForm
              schema={schemaListObj[editedValues.spec]}
              initialData={{
                settings: editedValues.settings,
                spec: editedValues.spec,
              }}
              onChange={(x) => {
                console.log("Settings updated:", x)
                setEditedValues((prev) => ({
                  ...prev,
                  settings: x.settings || {},
                }))
              }}
            />
          ) : null}
        </Box>
      )}
    </Box>
  )
  const validateFormBuilder = () => {
    if (!editedValues.settings || !Array.isArray(editedValues.settings)) {
      return false
    }
    return editedValues.settings.length > 0 && editedValues.settings.every((field) => field.text?.trim())
  }
  const handleSave = async () => {
    // Validate required fields
    if (!editedValues.name || !editedValues.spec || !editedValues.study_id) {
      enqueueSnackbar(t("Please fill in all required fields"), { variant: "error" })
      return
    }
    // if (editedValues.spec === "lamp.form_builder") {
    //  if(!validateFormBuilder()) return
    // }

    setLoading(true)
    try {
      // Prepare activity data
      const activityData = {
        name: editedValues.name?.trim(),
        spec: editedValues.spec,
        settings: editedValues.settings || {},
        formula4Fields: editedValues.formula4Fields,
        schedule: null, // Set to null instead of empty array
        category: editedValues.category,
        groups: editedValues.groups,
        scoreInterpretation: {},
        activityGuide: null,
        studyID: editedValues.study_id,
        streak: editedValues.streak,
        description: editedValues.description,
        photo: editedValues.photo,
        showFeed: editedValues.showInFeed,
      } as any
      console.log("activityData", activityData)
      let newActivityId
      if (activityData.spec === "lamp.form_builder") {
        const result = await LAMP.Activity.create(editedValues.study_id, {
          ...activityData,
          settings: editedValues.settings,
          formula4Fields: editedValues.formula4Fields,
        })
        newActivityId = result
      } else if (activityData.spec === "lamp.survey") {
        const result = await saveSurveyActivity({
          ...activityData,
          studyID: editedValues.study_id,
        })
        console.log("result", result)
        newActivityId = result.data
      } else if (activityData.spec === "lamp.tips") {
        const result = await saveTipActivity({
          ...activityData,
          studyID: editedValues.study_id,
        })
        console.log("result", result)
        newActivityId = result.data
      } else {
        const result = await saveCTestActivity({
          ...activityData,
          studyID: editedValues.study_id,
        })
        console.log("result", result)
        newActivityId = result.data
      }

      // // Create activity in LAMP
      // const newActivityId = await LAMP.Activity.create(editedValues.study_id, activityData)
      if (!newActivityId) {
        throw new Error("Failed to create activity")
      }
      const result = await LAMP.Activity.view(newActivityId)
      console.log("result", result)
      // Set additional details as attachments
      await LAMP.Type.setAttachment(newActivityId, "me", "emersive.activity.details", {
        description: editedValues.description,
        photo: editedValues.photo,
        streak: editedValues.streak,
        showFeed: editedValues.showInFeed,
      })

      // Prepare data for local DB
      const newActivity = {
        id: newActivityId,
        ...activityData,
        settings: editedValues.settings,
        schedule: null,
        description: editedValues.description,
        formula4Fields: editedValues.formula4Fields,
        photo: editedValues.photo,
        showFeed: editedValues.showInFeed,
        streak: editedValues.streak,
        study_id: editedValues.study_id,
        study_name: studies.find((s) => s.id === editedValues.study_id)?.name,
      }
      console.log("newActivity", newActivity)
      // Add to local DB
      await Service.addData("activities", [newActivity])

      enqueueSnackbar(t("Activity created successfully"), { variant: "success" })
      onSave(newActivity)
    } catch (error) {
      console.error("Error creating activity:", error)
      enqueueSnackbar(t("Failed to create activity"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  const footerButtons = (
    <Box display="flex" justifyContent="flex-end" style={{ gap: 2 }} mt={2}>
      <Button onClick={onCancel}>{t("Cancel")}</Button>
      <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
        {loading ? t("Creating...") : t("Create Activity")}
      </Button>
    </Box>
  )

  return (
    <Paper className={classes.root}>
      <ViewItems
        fields={fields}
        isEditing={true}
        editedValues={editedValues}
        setEditedValues={setEditedValues}
        loading={loading}
        additionalContent={additionalContent}
        footerButtons={footerButtons}
      />
    </Paper>
  )
}

export default CreateActivity
