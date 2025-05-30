import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { id } from "vega"
import { set } from "date-fns"

const EmotionsAvailable = ["Happy", "Sad", "Angry", "Surprised", "Disgusted", "Fearful"]

const MoodTrackerBuilder = ({ oldFields, onChange }) => {
  const [fields, setFields] = useState(
    oldFields.length > 0
      ? oldFields
      : [
          {
            id: Date.now(),
            label: "",
            description: "",
            required: false,
            type: "mood",
            options: ["Happy", "Sad"],
            settings: {
              upperRatingLimit: "",
            },
          },
        ]
  )

  const [emotionToAdd, setEmotionToAdd] = useState("")

  const handleAddEmotion = (fieldId, emotionValue) => {
    const field = fields.find((field) => field.id === fieldId)
    if (emotionToAdd && !field.options.includes(emotionToAdd)) {
      const newOptions = [...field.options, emotionToAdd]
      updateField(fieldId, { options: newOptions })
      setEmotionToAdd("")
    }
  }

  const handleRatingChange = (fieldId, newRating) => {
    const field = fields.find((field) => field.id === fieldId)
  }

  useEffect(() => {
    onChange(fields)
  }, [fields])

  const handleRemoveEmotion = (fieldId, emotion) => {
    const field = fields.find((field) => field.id === fieldId)
    const newOptions = field.options.filter((e) => e !== emotion)
    updateField(fieldId, { options: newOptions })
  }

  const updateField = (id, updates) => {
    setFields((prevFields) => prevFields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  return fields.map((field, indx) => (
    <Card
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 10,
          transform: "translateY(-5px)",
        },
        p: 2,
      }}
    >
      <CardContent>
        <TextField
          fullWidth
          margin="normal"
          label="Field Label"
          value={field.label}
          required={true}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Description"
          value={field.description}
          onChange={(e) => updateField(field.id, { description: e.target.value })}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
            />
          }
          label="Required"
        />

        <Typography variant="h6">Choose an Emotion to Add</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
          <Select
            value={emotionToAdd}
            onChange={(e) => setEmotionToAdd(e.target.value)}
            displayEmpty
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="" disabled>
              Select Emotion
            </MenuItem>
            {EmotionsAvailable.filter((e) => !field.options?.includes(e)).map((emotion) => (
              <MenuItem key={emotion} value={emotion}>
                {emotion}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={(e) => handleAddEmotion(field.id, e.target)}>
            Add
          </Button>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Selected Emotions
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {field.options.map((emotion) =>
            ["Happy", "Sad"].includes(emotion) ? (
              <Chip key={emotion} label={emotion} color="primary" />
            ) : (
              <Chip
                key={emotion}
                label={emotion}
                onDelete={() => handleRemoveEmotion(field.id, emotion)}
                color="primary"
              />
            )
          )}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Set Upper Limit for Intensity Rating
        </Typography>
        <TextField
          sx={{ width: 120 }}
          margin="normal"
          type="number"
          value={field.settings?.upperRatingLimit ?? ""}
          onChange={(e) => {
            const value = e.target.value
            updateField(field.id, {
              settings: {
                upperRatingLimit: value === "" ? "" : Number(value),
              },
            })
          }}
        />
      </CardContent>
    </Card>
  ))
}

export default MoodTrackerBuilder
