import React, { useState, useEffect, useRef } from "react"
import {
  Grid,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  IconButton,
  Card,
  CardContent,
  Box,
  Divider,
} from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon, Description } from "@mui/icons-material"

const FormBuilder = ({ onChange, formFieldsProp }) => {
  const [formFields, setFormFields] = useState(formFieldsProp)
  const [selectedFieldType, setSelectedFieldType] = useState("")

  console.log("formFieldProp", formFieldsProp)

  // Sync form fields with parent component when needed
  useEffect(() => {
    if (onChange) {
      onChange({ fields: formFields })
    }
  }, [formFields])

  const fieldTypes = [
    { value: "singleLine", label: "Single Line Text" },
    { value: "paragraph", label: "Paragraph Text" },
    { value: "dropdown", label: "Drop Down" },
    { value: "number", label: "Number" },
    { value: "checkbox", label: "Checkboxes" },
    { value: "radio", label: "Radio Buttons" },
    { value: "name", label: "Name" }, // Added Name field
    { value: "date", label: "Date" }, // Added Date field
    { value: "time", label: "Time" }, // Added Time field
  ]

  const scrollBoxRef = useRef(null)

  const addField = () => {
    if (!selectedFieldType) return

    const newField = {
      id: Date.now(),
      type: selectedFieldType,
      label: "",
      description: "",
      required: false,
      options: [],
      settings: {
        placeholder: "",
        maxLength: "",
        minValue: "",
        maxValue: "",
        // enableRichText: false,
        showValues: false,
        // dateInputType: "",
        timeFormat: "",
        firstNamePlaceholder: "First Name",
        lastNamePlaceholder: "Last Name",
        dateFormat: "DD/MM/YYYY",
      },
    }

    setFormFields([...formFields, newField])
    setSelectedFieldType("")

    // if (scrollBoxRef.current) {
    //   scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    // }
  }

  const [prevFormFieldsLength, setPrevFormFieldsLength] = useState(formFields.length)

  useEffect(() => {
    if (formFields.length > prevFormFieldsLength) {
      // If formFields length increased, scroll to the bottom
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight
      }
    }
    // Update the previous length to the current length after each change
    setPrevFormFieldsLength(formFields.length)
  }, [formFields, prevFormFieldsLength])

  const deleteField = (fieldId) => {
    setFormFields(formFields.filter((field) => field.id !== fieldId))
  }

  const updateField = (fieldId, updates) => {
    setFormFields(formFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
  }

  const addOption = (fieldId) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            options: [...field.options, { id: Date.now(), label: "", value: "" }],
          }
        }
        return field
      })
    )
  }

  const renderFieldSettings = (field) => {
    switch (field.type) {
      case "singleLine":
        return (
          <TextField
            fullWidth
            margin="normal"
            label="Placeholder"
            value={field.settings?.placeholder || ""}
            onChange={(e) =>
              updateField(field.id, {
                settings: { ...field.settings, placeholder: e.target.value },
              })
            }
          />
        )

      case "paragraph":
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Maximum Characters"
              type="number"
              value={field.settings?.maxLength || ""}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, maxLength: e.target.value },
                })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Placeholder"
              value={field.settings?.placeholder || ""}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, placeholder: e.target.value },
                })
              }
            />
            {/* <FormControlLabel
              control={
                <Checkbox
                  checked={field.settings?.enableRichText || false}
                  onChange={(e) =>
                    updateField(field.id, {
                      settings: { ...field.settings, enableRichText: e.target.checked },
                    })
                  }
                />
              }
              label="Enable Rich Text Editor"
            /> */}
          </>
        )

      case "dropdown":
      case "checkbox":
      case "radio":
        return (
          <Box>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Options
            </Typography>
            {field.options.map((option, index) => (
              <Box key={option.id} sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  size="small"
                  label={`Option ${index + 1}`}
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...field.options]
                    newOptions[index] = { ...option, label: e.target.value }
                    updateField(field.id, { options: newOptions })
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    const newOptions = field.options.filter((opt) => opt.id !== option.id)
                    updateField(field.id, { options: newOptions })
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => addOption(field.id)} sx={{ mt: 1 }}>
              Add Option
            </Button>
          </Box>
        )

      case "number":
        return (
          <Box>
            <TextField
              fullWidth
              margin="normal"
              label="Minimum Value"
              type="number"
              value={field.settings?.minValue || ""}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, minValue: e.target.value },
                })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Maximum Value"
              type="number"
              value={field.settings?.maxValue || ""}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, maxValue: e.target.value },
                })
              }
            />
          </Box>
        )

      case "name":
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="First Name Placeholder"
              value={field.settings?.firstNamePlaceholder || "First Name"}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, firstNamePlaceholder: e.target.value },
                })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name Placeholder"
              value={field.settings?.lastNamePlaceholder || "Last Name"}
              onChange={(e) => {
                const newValue = e.target.value
                updateField(field.id, {
                  settings: {
                    ...field.settings,
                    firstNamePlaceholder: newValue,
                  },
                })
              }}
            />
          </>
        )

      case "date":
        return (
          <>
            {/* <Select
              fullWidth
              label="Date Input Type"
              value={field.settings?.dateInputType || "datePicker"}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, dateInputType: e.target.value },
                })
              }
            >
              <MenuItem value="datePicker">Date Picker</MenuItem>
            </Select> */}
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={field.settings?.dateFormat || "DD/MM/YYYY"}
                onChange={(e) =>
                  updateField(field.id, {
                    settings: { ...field.settings, dateFormat: e.target.value },
                  })
                }
                label="Date Format"
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY/MM/DD">YYYY/MM/DD</MenuItem>
              </Select>
            </FormControl>
            {/* <TextField
              fullWidth
              margin="normal"
              label="Date Format"
              value={field.settings?.dateFormat || "MM/DD/YYYY"}
              onChange={(e) =>
                updateField(field.id, {
                  settings: { ...field.settings, dateFormat: e.target.value },
                })
              }
            /> */}
          </>
        )

      // case "time":
      //   return (
      //     <>
      //       <Select
      //         fullWidth
      //         label="Time Format"
      //         value={field.settings?.timeFormat || "12"}
      //         onChange={(e) =>
      //           updateField(field.id, {
      //             settings: { ...field.settings, timeFormat: e.target.value },
      //           })
      //         }
      //       >
      //         <MenuItem value="12">12 Hour</MenuItem>
      //         {/* <MenuItem value="24">24 Hour</MenuItem> */}
      //       </Select>
      //     </>
      //   )

      default:
        return null
    }
  }

  return (
    <Grid container spacing={4} direction="column">
      {/* Column for "Add Field" section */}
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row", // Align items in a row
            justifyContent: "center", // Center items horizontally
            alignItems: "center", // Center items vertically
            gap: 2,
            marginTop: "3%",
          }}
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Add Field</InputLabel>
            <Select value={selectedFieldType} label="Add Field" onChange={(e) => setSelectedFieldType(e.target.value)}>
              {fieldTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={addField}
            disabled={!selectedFieldType}
            startIcon={<AddIcon />}
            sx={{
              height: "56px", // Match Select height
              minWidth: "auto", // Adjust width to fit content
              padding: "0 16px", // Adjust padding for consistency
            }}
          >
            Add Field
          </Button>
        </Box>
      </Grid>

      {/* Column for dynamically added fields */}
      <Grid item xs={12}>
        <Box
          ref={scrollBoxRef}
          sx={{
            maxHeight: 550, // Set the maximum height
            overflowY: "auto", // Enable vertical scrolling
            padding: 2,
          }}
        >
          <Grid container spacing={2}>
            {formFields.map((field) => (
              <Grid item xs={12} key={field.id}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 10,
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">{fieldTypes.find((t) => t.value === field.type)?.label}</Typography>
                      <IconButton onClick={() => deleteField(field.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>

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

                    <Divider sx={{ my: 2 }} />
                    {renderFieldSettings(field)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  )
}

export default FormBuilder
