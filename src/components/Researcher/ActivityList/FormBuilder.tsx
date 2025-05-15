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
  Modal,
} from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon, Description } from "@mui/icons-material"

import QuestionLogic from "./QuestionLogic"
import { descriptionId } from "@rjsf/utils"
import { None } from "vega"

const FormBuilder = ({ onChange, formFieldsProp, formula }) => {
  const [formFields, setFormFields] = useState(formFieldsProp || [])
  const initializedRef = useRef(false)
  const prevFormFieldsRef = useRef(formFields)
  const [selectedFieldType, setSelectedFieldType] = useState("")
  const [selectedFormulaType, setSelectedFormulaType] = useState("")

  console.log("formFieldProp", formFieldsProp)

  const [fieldsFormula, setFieldsFormula] = useState(formula)

  console.log("Fields Formula", fieldsFormula)

  // Sync form fields with parent component when needed
  useEffect(() => {
    // if (onChange) {
    //   onChange({ fields: formFields, formula: fieldsFormula })
    // }
    console.log("inside onChange useEffect")
    if (
      onChange &&
      initializedRef.current
      // (JSON.stringify(prevFormFieldsRef.current) !== JSON.stringify(formFields) ||
      //   prevFormFieldsRef.current !== formFields)
    ) {
      console.log("before useEffect onChange called")
      onChange({ fields: formFields, formula: fieldsFormula })
      if (
        JSON.stringify(prevFormFieldsRef.current) !== JSON.stringify(formFields) ||
        prevFormFieldsRef.current !== formFields
      ) {
        prevFormFieldsRef.current = formFields
      }
    }
  }, [formFields, fieldsFormula])

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

  useEffect(() => {
    initializedRef.current = true
  }, [])

  useEffect(() => {}, [formFieldsProp, formula])

  const scrollBoxRef = useRef(null)

  const addField = () => {
    if (!selectedFieldType) return

    const newField = {
      id: Date.now(),
      type: selectedFieldType,
      label: "",
      description: "",
      logic: null,
      required: false,
      useInCalculation: false,
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
    setFormFields(formFields?.filter((field) => field.id !== fieldId))
  }

  const updateField = (fieldId, updates) => {
    // If the update includes useInCalculation and it's being turned on
    if (Object.prototype.hasOwnProperty.call(updates, "useInCalculation") && updates.useInCalculation) {
      const field = formFields.find((f) => f.id === fieldId)

      // Check if the field has options
      if (["dropdown", "checkbox", "radio"].includes(field.type)) {
        // Validate that all options have non-null values
        const hasInvalidOptions = field.options.some(
          (option) => option.value === null || option.value === undefined || option.value === ""
        )

        if (hasInvalidOptions) {
          // Show error message or alert
          alert("All options must have values before using this field in calculations")
          // Return early without updating
          return
        }
      }
    }

    // Proceed with normal update if validation passes
    setFormFields(formFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))

    // Update fields4Calc if necessary
    if (Object.prototype.hasOwnProperty.call(updates, "useInCalculation")) {
      setFields4Calc((prevFields4Calc) => {
        const isChecked = updates.useInCalculation
        const updatedField = formFields.find((field) => field.id === fieldId)

        if (isChecked) {
          return [...prevFields4Calc, updatedField]
        } else {
          return prevFields4Calc.filter((field) => field.id !== updatedField.id)
        }
      })
    }
  }

  const addOption = (fieldId) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            options: [...field.options, { id: Date.now(), label: "", value: null, description: "" }],
          }
        }
        return field
      })
    )
  }

  const [fields4Calc, setFields4Calc] = useState(formFields?.filter((field) => field.useInCalculation))

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
                  label={`Option ${index + 1} label`}
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...field.options]
                    newOptions[index] = { ...option, label: e.target.value }
                    updateField(field.id, { options: newOptions })
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label={`Option ${index + 1} value (number)`}
                  // Allow empty string
                  value={option.value === null ? "" : option.value}
                  onChange={(e) => {
                    const newOptions = [...field.options]
                    // If empty string, set value to null
                    const newValue = e.target.value === "" ? null : Number(e.target.value)
                    newOptions[index] = { ...option, value: newValue }
                    updateField(field.id, { options: newOptions })
                  }}
                  // If field is used in calculation, show error state for empty values
                  error={field.useInCalculation && (option.value === null || option.value === "")}
                  helperText={
                    field.useInCalculation && (option.value === null || option.value === "")
                      ? "Value required for calculations"
                      : ""
                  }
                />
                <TextField
                  size="small"
                  label={`Option ${index + 1} description`}
                  value={option.description}
                  onChange={(e) => {
                    const newOptions = [...field.options]
                    newOptions[index] = { ...option, description: e.target.value }
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

  const [error4Fields, setError4Fields] = useState("")

  const handleFormulaType = (value) => {
    let formula = ""
    if (value === "Sum All") {
      formula = fields4Calc.map((field) => `(${field.label})`).join(" + ")
    } else if (value === "Multiply all") {
      formula = fields4Calc.map((field) => `(${field.label})`).join(" x ")
    } else if (value === "Subtract all") {
      formula = fields4Calc.map((field) => `(${field.label})`).join(" - ")
    }
    setFieldsFormula(formula)
    // Clear error if formula is set successfully
  }

  const handleSelectChange = (value) => {
    setSelectedFormulaType(value)
    if (fields4Calc.length < 2) {
      setError4Fields("Please select at least two fields to perform a calculation.")
      return
    } else {
      setError4Fields("")
    }
    handleFormulaType(value)
  }

  useEffect(() => {
    console.log("#$#$#$#$#$#", selectedFormulaType)
    if (selectedFormulaType != "") {
      if (fields4Calc.length > 1) {
        setError4Fields("")
        handleFormulaType(selectedFormulaType)
        return
      } else {
        setError4Fields("Please select at least two fields to perform a calculation.")
        setFieldsFormula("")
      }
    }
  }, [fields4Calc])

  const [showLogicWindow, setShowLogicWindow] = useState(false)

  const [currentField, setCurrentField] = useState(null)

  const [currentFieldIndx, setCurrentFieldIndx] = useState(null)

  const handleAddLogicClick = (field, indx) => {
    setCurrentField(field) // Set the selected form field
    setCurrentFieldIndx(indx)
    setShowLogicWindow(true) // Open the modal
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
            {formFields.map((field, indx) => (
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

                    {["number", "dropdown", "checkbox", "radio"].includes(field.type) ? (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <div
                          style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
                        >
                          <FormControlLabel
                            style={{ textAlign: "center" }} // Centers label text if needed
                            control={
                              <Checkbox
                                checked={field.useInCalculation}
                                onChange={(e) => updateField(field.id, { useInCalculation: e.target.checked })}
                              />
                            }
                            label="Use in calculation"
                          />
                        </div>
                      </>
                    ) : null}
                    <Divider sx={{ my: 2 }} />
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <Button
                        style={{ borderRadius: "10px", backgroundColor: "#0099ff", color: "white" }}
                        onClick={() => handleAddLogicClick(field, indx)}
                      >
                        {field.logic ? "Edit Logic" : "Add Logic"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Modal
          open={showLogicWindow}
          onClose={() => setShowLogicWindow(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: 2,
              boxShadow: 24,
              maxWidth: "60%",
              height: "90%",
              width: "100%",
              // overflow:"auto"
            }}
          >
            <QuestionLogic
              updateField={updateField}
              onClose={() => setShowLogicWindow(false)}
              formFields={formFields}
              field={currentField}
              qIndx={currentFieldIndx}
            />
          </Box>
        </Modal>
      </Grid>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Align items in a row
          justifyContent: "center", // Center items horizontally
          alignItems: "center", // Center items vertically
          // marginTop: "3%",
          padding: "10px 0",
        }}
      >
        <FormControl sx={{ width: 400 }}>
          <InputLabel>Calculation Type</InputLabel>
          <Select
            value={selectedFormulaType}
            label="Formula Type"
            onChange={(e) => {
              handleSelectChange(e.target.value)
            }}
          >
            {["Sum All", "Multiply all", "Subtract all", "Custom"].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error4Fields && (
          <Typography color="error" variant="body2">
            {error4Fields}
          </Typography>
        )}

        {fieldsFormula && !error4Fields && (
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Generated Formula: {fieldsFormula}
          </Typography>
        )}

        {selectedFormulaType === "Custom" && !error4Fields ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column", // Align items in a row
              justifyContent: "center", // Center items horizontally
              alignItems: "center", // Center items vertically
              // marginTop: "3%",
              // padding: "10px 0"
            }}
          >
            {fields4Calc.length > 0 ? <></> : null}
          </div>
        ) : null}
      </Box>
      {/* </Grid> */}
    </Grid>
  )
}

export default FormBuilder
