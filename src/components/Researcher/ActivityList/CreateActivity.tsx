import React, { useState, useEffect, useCallback, useMemo } from "react"
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
import MoodTrackerBuilder from "./MoodTrackerBuilder"

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "24px 24px 54px 24px",
    width: "100%",
    margin: "0 auto",
    // height: "100%",
    // overflowY: "hidden",
  },
}))

interface CreateActivityProps {
  studies: Array<any>
  selectedSpec?: any
  researcherId: string
  onSave: (newActivity: any) => void
  onCancel: () => void
  sharedstudies?: Array<any>
}

const CreateActivity: React.FC<CreateActivityProps> = ({
  studies,
  selectedSpec,
  researcherId,
  onSave,
  onCancel,
  sharedstudies,
}) => {
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
    let isSubscribed = true
    console.log("CreateActivity mounted")
    const loadSchemaList = () => {
      if (isSubscribed) {
        setSchemaListObj(SchemaList())
      }
    }

    loadSchemaList()

    return () => {
      isSubscribed = false
    }
  }, [])

  useEffect(() => {
    console.log("editedValues after changes : ", editedValues)
  }, [editedValues])

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
    console.log("editedValues.spec changed:", editedValues.spec)
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
    console.log("editedValues.study_id changed:", editedValues.study_id)
  }, [editedValues.study_id, studies])

  // Memoize the DynamicForm onChange handler
  const handleDynamicFormChange = useCallback((x) => {
    console.log("Settings updated:", x)
    setEditedValues((prev) => {
      // Only update if settings actually changed
      const newSettings = x.settings || {}
      if (JSON.stringify(prev.settings) !== JSON.stringify(newSettings)) {
        return {
          ...prev,
          settings: newSettings,
        }
      }
      return prev
    })
  }, [])
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
      options: studies
        .map((study) => ({
          value: study.id,
          label: study.name,
        }))
        .concat(
          sharedstudies.map((study) => ({
            value: study.id,
            label: study.name,
          }))
        ),
    },
    {
      id: "groups",
      label: t("Groups"),
      value: editedValues.groups,
      editable: true,
      type: "multiselect",
      options:
        (
          studies.find((s) => s.id === editedValues.study_id) ||
          sharedstudies.find((s) => s.id === editedValues.study_id)
        )?.gname.map((group) => ({
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
  const additionalContent = useMemo(
    () => (
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
                  console.log("FormBuilder data:", formData)
                  setEditedValues((prev) => ({
                    ...prev,
                    formula4Fields: formData.formula,
                    settings: formData.fields,
                  }))
                }}
                formFieldsProp={Array.isArray(editedValues.settings) || []}
                formula={editedValues.formula4Fields}
              />
            ) : editedValues.spec === "lamp.mood_tracker" ? (
              <MoodTrackerBuilder
                onChange={(data) => {
                  setEditedValues((prev) => ({ ...prev, settings: data }))
                }}
                oldFields={Array.isArray(editedValues.settings) || []}
              />
            ) : Object.keys(schemaListObj).includes(editedValues.spec) ? (
              <DynamicForm
                schema={schemaListObj[editedValues.spec]}
                initialData={{
                  settings: editedValues.settings,
                  spec: editedValues.spec,
                }}
                // onChange={(x) => {
                //   console.log("Settings updated:", x)
                //   setEditedValues((prev) => ({
                //     ...prev,
                //     settings: x.settings || {},
                //   }))
                //   console.log("editedValues after settings change:", editedValues)
                // }}
                onChange={handleDynamicFormChange}
              />
            ) : null}
          </Box>
        )}
      </Box>
    ),
    [
      editedValues.showInFeed,
      editedValues.streak,
      editedValues.spec,
      editedValues.settings,
      editedValues.formula4Fields,
      schemaListObj,
      handleDynamicFormChange,
      t,
    ]
  )

  const validateFormBuilder = () => {
    if (!editedValues.settings || !Array.isArray(editedValues.settings)) {
      return false
    }
    return editedValues.settings.length > 0 && editedValues.settings.every((field) => field.text?.trim())
  }
  const handleSave = async () => {
    let isSubscribed = true
    // Validate required fields
    if (!editedValues.name || !editedValues.spec || !editedValues.study_id) {
      enqueueSnackbar(t("Please fill in all required fields"), { variant: "error" })
      return
    }

    if (editedValues.spec === "lamp.mood_tracker") {
      if (editedValues.settings[0].options.length === 0) {
        enqueueSnackbar(t("Please select at least one emotion/upper rate limit"), { variant: "error" })
        return
      } else if (editedValues.settings[0].settings.upperRatingLimit === "") {
        enqueueSnackbar(t("Please select upper rate limit"), { variant: "error" })
        return
      }
    }

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
      let newActivityId
      if (activityData.spec === "lamp.form_builder") {
        console.log("CREATING ACTIVIITY activityData", activityData)
        const result = (await LAMP.Activity.create(editedValues.study_id, {
          ...activityData,
          // settings: editedValues.settings,
          // formula4Fields: editedValues.formula4Fields,
        } as any)) as any
        newActivityId = result.data ? result.data : result
        console.log("CREATED ACTIVITY", result.data)
      } else if (activityData.spec === "lamp.survey") {
        // const result = await saveSurveyActivity({
        //   ...activityData,
        //   studyID: editedValues.study_id,
        // })
        // newActivityId = result.data
        const result = (await LAMP.Activity.create(editedValues.study_id, {
          ...activityData,
          settings: editedValues.settings,
        } as any)) as any
        console.log("result", result)
        newActivityId = result.data ? result.data : result
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
      console.log("newActivityId", newActivityId)
      // // Create activity in LAMP
      // const newActivityId = await LAMP.Activity.create(editedValues.study_id, activityData)
      // if (!newActivityId) {
      //   throw new Error("Failed to create activity")
      // }
      // const result = await LAMP.Activity.view(newActivityId)
      // console.log("result", result)
      // Set additional details as attachments
      await LAMP.Type.setAttachment(newActivityId, "me", "emersive.activity.details", {
        description: editedValues.description,
        photo: editedValues.photo,
        streak: editedValues.streak,
        showFeed: editedValues.showInFeed,
      })

      // Prepare data for local DB
      // const newActivity = {
      //   id: newActivityId,
      //   ...activityData,
      //   settings: editedValues.settings,
      //   schedule: [],
      //   description: editedValues.description,
      //   formula4Fields: editedValues.formula4Fields,
      //   photo: editedValues.photo,
      //   showFeed: editedValues.showInFeed,
      //   streak: editedValues.streak,
      //   study_id: editedValues.study_id,
      //   study_name: studies.find((s) => s.id === editedValues.study_id)?.name,
      // }
      // console.log("newActivity", newActivity)
      // // Add to local DB
      // await Service.addData("activities", [newActivity])
      const studiesObject = await Service.getData("studies", editedValues.study_id)
      const activitydata = await LAMP.Activity.view(newActivityId)
      const newActivity = {
        id: newActivityId,
        ...activitydata,
        settings: editedValues.settings,
        description: editedValues.description,
        formula4Fields: editedValues.formula4Fields,
        photo: editedValues.photo,
        showFeed: editedValues.showInFeed,
        streak: editedValues.streak,
        study_id: editedValues.study_id,
        study_name: studies.find((s) => s.id === editedValues.study_id)?.name,
      }
      console.log("newActivity", newActivity)
      await Service.addData("activities", [newActivity])
      const updatedActivities = [...(studiesObject?.activities || []), activitydata ?? newActivity]
      console.log("UPDATED ACTIVITIES", updatedActivities)
      const updatedStudy = {
        ...studiesObject,
        activities: updatedActivities,
        activity_count: updatedActivities.length ?? 1,
      }
      console.log("UPDATED STUDY", updatedStudy)
      await LAMP.Study.update(editedValues.study_id, updatedStudy)
      await Service.update(
        "studies",
        {
          studies: [
            {
              id: editedValues.study_id,
              ...updatedStudy,
            },
          ],
        },
        "name",
        "id"
      )
      await Service.updateMultipleKeys(
        "studies",
        {
          studies: [
            {
              id: studiesObject.id,
              activity_count: studiesObject.activity_count ? studiesObject.activity_count + 1 : 1,
              activities: updatedActivities,
            },
          ],
        },
        ["activity_count", "activities"],
        "id"
      )
      if (isSubscribed) {
        enqueueSnackbar(t("Activity created successfully"), { variant: "success" })
        const activitydata = await LAMP.Activity.view(newActivityId)
        const newActivity = {
          id: newActivityId,
          ...activitydata,
          settings: editedValues.settings,
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
        // await Service.addData("activities", [activitydata])
        onSave(activitydata)
      }
    } catch (error) {
      if (isSubscribed) {
        console.error("Error creating activity:", error)
        enqueueSnackbar(t("Failed to create activity"), { variant: "error" })
      }
    } finally {
      if (isSubscribed) {
        setLoading(false)
      }
    }

    return () => {
      isSubscribed = false
    }
  }

  const footerButtons = (
    <Box display="flex" justifyContent="flex-end" style={{ gap: 2 }} mt={1} mb={1}>
      <Button onClick={onCancel}>{t("Cancel")}</Button>
      <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
        {loading ? t("Creating...") : t("Create Activity")}
      </Button>
    </Box>
  )

  const handleChange = (newValues: any) => {
    console.log("newValues", newValues)
  }

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
