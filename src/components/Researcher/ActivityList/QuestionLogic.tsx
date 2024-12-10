import React, { useState, useEffect } from "react"
import { Box, Typography, IconButton, Button, Select, Checkbox, ListItemText } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { MenuItem } from "@material-ui/core"
// import { Dict } from 'vega-lite';

import { Add as AddIcon, Delete as DeleteIcon, Description } from "@mui/icons-material"

/*
single line- input
paragraph line- input
Drop down- options
Number- input
Radio- options
Name- input
Date- input
Time- input
checkboxes- 
*/

type Dict = {
  fieldId: string | null
  index: number
}

type Condition = {
  fieldId: string
  index: number
  operator: string
  value: string | string[]
  follows: string | null
}

type Rule = {
  conditions: Condition[]
  thenAction: string
  thenTarget: Dict
  elseAction?: string
}

export default function QuestionLogic({ updateField, onClose, formFields, field, qIndx }) {
  const [rules, setRules] = useState<Rule[]>(
    field.logic
      ? field.logic
      : [
          {
            conditions: [{ fieldId: field.id, index: qIndx, operator: "is", value: "", follows: null }],
            thenAction: "Go to",
            thenTarget: {
              fieldId: formFields.length - 1 <= qIndx ? formFields[qIndx].id : formFields[qIndx + 1].id,
              index: formFields.length - 1 <= qIndx ? qIndx : qIndx + 1,
            },
          },
        ]
  )

  const addCondition = (ruleIndex: number) => {
    const newRules = [...rules]
    newRules[ruleIndex].conditions[newRules[ruleIndex].conditions.length - 1].follows = "AND"
    newRules[ruleIndex].conditions.push({ fieldId: field?.id, index: qIndx, operator: "is", value: "", follows: null })
    setRules(newRules)
  }

  const addRule = () => {
    const newRules = [...rules]
    newRules.push({
      conditions: [{ fieldId: field.id, index: qIndx, operator: "is", value: "", follows: null }],
      thenAction: "Go to",
      thenTarget: {
        fieldId: formFields.length - 1 <= qIndx ? formFields[qIndx].id : formFields[qIndx + 1].id,
        index: formFields.length - 1 <= qIndx ? qIndx : qIndx + 1,
      },
    })
    setRules(newRules)
  }

  const handleConditionChange = (
    ruleIndex: number,
    conditionIndex: number,
    key: keyof Condition,
    value: string | string[],
    fieldSelectedType: "string" | null = null
  ) => {
    if (fieldSelectedType && key === "value") {
      const newRules = [...rules]
      newRules[ruleIndex].conditions[conditionIndex] = {
        ...newRules[ruleIndex].conditions[conditionIndex],
        [key]: value, // Directly update the array with the new value
      }
      setRules(newRules)
    } else {
      const newRules = [...rules]
      newRules[ruleIndex].conditions[conditionIndex] = {
        ...newRules[ruleIndex].conditions[conditionIndex],
        [key]: value,
      }
      setRules(newRules)
    }
  }

  const handleThenChange = (ruleIndex: number, key: keyof Rule, value: string) => {
    const newRules = [...rules]
    if (key === "thenTarget") {
      const matchingFieldIndex = formFields.findIndex((field) => field.id === +value)
      console.log("^&&R&R^R", value, formFields[matchingFieldIndex].label)
      newRules[ruleIndex] = {
        ...newRules[ruleIndex],
        [key]: { fieldId: formFields[matchingFieldIndex].id, index: matchingFieldIndex },
      }
    } else {
      newRules[ruleIndex] = {
        ...newRules[ruleIndex],
        [key]: value,
      }
    }
    setRules(newRules)
  }

  const handleSave = () => {
    console.log("HEY RULES PRINT", rules)
    updateField(field.id, { logic: rules })
    onClose()
  }

  const deleteCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...rules]
    newRules[ruleIndex].conditions.splice(conditionIndex, 1)
    setRules(newRules)
  }

  const deleteRule = (ruleIndex) => {
    const newRules = [...rules]
    newRules.splice(ruleIndex, 1)
    setRules(newRules)
  }

  return (
    <Box
      sx={{
        backgroundColor: "white",
        padding: 4,
        borderRadius: 2,
        boxShadow: 24,
        // maxWidth: 400,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "auto",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          textAlign: "center", // Center text alignment
        }}
      >
        Edit Logic: {field.label}
      </Typography>
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 20,
          right: 24,
          width: 48, // Increase button size
          height: 48, // Increase button size
          "& .MuiSvgIcon-root": {
            // Target the icon inside the button
            fontSize: 42, // Increase icon size
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <div
        style={{
          overflowY: "auto", // Make the rest of the content scrollable
          maxHeight: "calc(100% - 176px)", // Leave space for the fixed header
          paddingTop: "10px", // Add some space from the sticky header
        }}
      >
        <div style={{ fontFamily: "Arial, sans-serif" }}>
          {rules.map((rule, ruleIndex) => (
            <div>
              <div
                key={ruleIndex}
                style={{ width: "97%", padding: "10px", marginBottom: "20px", border: "1px solid #ddd" }}
              >
                <h2>Rule {ruleIndex + 1}</h2>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: "bold", padding: "10px" }}>If</span>
                  <div style={{ marginLeft: "30px", flex: 1 }}>
                    {rule.conditions.map((condition, conditionIndex) => (
                      <div>
                        <div key={conditionIndex} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                          <Select
                            style={{ width: "30%", borderRadius: "10px" }}
                            value={condition.fieldId}
                            onChange={(e) =>
                              handleConditionChange(ruleIndex, conditionIndex, "fieldId", e.target.value)
                            }
                          >
                            {formFields.map(
                              (fld, indx) => indx <= qIndx && <MenuItem value={fld.id}>{fld.label}</MenuItem>
                            )}
                          </Select>
                          <Select
                            style={{ width: "17%", borderRadius: "10px" }}
                            value={condition.operator}
                            onChange={(e) =>
                              handleConditionChange(ruleIndex, conditionIndex, "operator", e.target.value)
                            }
                          >
                            <MenuItem value={"is"}>is</MenuItem>
                            <MenuItem value={"is not"}>is not</MenuItem>
                          </Select>
                          {["singleLine", "paragraph", "number", "name", "date", "time"].includes(
                            formFields[rule.conditions[conditionIndex].index]?.type
                          ) ? (
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) =>
                                handleConditionChange(ruleIndex, conditionIndex, "value", e.target.value)
                              }
                              placeholder=""
                              style={{ width: "30%", borderRadius: "10px" }}
                            />
                          ) : formFields[rule.conditions[conditionIndex].index]?.type === "checkbox" ? (
                            <Select
                              style={{ width: "30%", borderRadius: "10px" }}
                              multiple
                              value={Array.isArray(condition.value) ? condition.value : []} // Ensure `value` is an array
                              onChange={(e) =>
                                handleConditionChange(
                                  ruleIndex,
                                  conditionIndex,
                                  "value",
                                  e.target.value, // Directly use the updated array of selected values
                                  formFields[rule.conditions[conditionIndex].index]?.type
                                )
                              }
                              renderValue={(selected) => (selected ? selected.join(", ") : "")} // Display as a comma-separated string
                            >
                              {formFields[rule.conditions[conditionIndex].index]?.options.map((item) => (
                                <MenuItem key={item.label} value={item.label}>
                                  <Checkbox
                                    checked={Array.isArray(condition.value) && condition.value.includes(item.label)}
                                  />
                                  <ListItemText primary={item.label} />
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <Select
                              style={{ width: "30%", borderRadius: "10px" }}
                              value={condition.value}
                              onChange={(e) =>
                                handleConditionChange(ruleIndex, conditionIndex, "value", e.target.value)
                              }
                            >
                              {formFields[rule.conditions[conditionIndex].index]?.options.map((item) => (
                                <MenuItem value={item.label}>{item.label}</MenuItem>
                              ))}
                            </Select>
                          )}
                          {console.log("#$#$@#@$#$#$", rule.conditions.length)}
                          {rule.conditions.length > 1 ? (
                            <IconButton
                              size="small"
                              style={{ marginLeft: "10px", width: "7%" }}
                              onClick={(e) => deleteCondition(ruleIndex, conditionIndex)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          ) : null}
                        </div>
                        {condition.follows && (
                          <Select
                            style={{ width: "17%", borderRadius: "10px", marginBottom: "10px" }}
                            value={condition.follows}
                            onChange={(e) =>
                              handleConditionChange(ruleIndex, conditionIndex, "follows", e.target.value)
                            }
                          >
                            <MenuItem value={"AND"}>and</MenuItem>
                            <MenuItem value={"OR"}>or</MenuItem>
                          </Select>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="contained"
                      onClick={() => addCondition(ruleIndex)}
                      startIcon={<AddIcon />}
                      sx={{
                        height: "40px", // Match Select height
                        minWidth: "auto", // Adjust width to fit content
                        padding: "0 16px", // Adjust padding for consistency
                        borderRadius: "10px",
                      }}
                    >
                      Add Field
                    </Button>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Then </span>
                  <Select
                    style={{ width: "30%", borderRadius: "10px", marginLeft: "7px" }}
                    value={rule.thenAction}
                    onChange={(e) => handleThenChange(ruleIndex, "thenAction", e.target.value)}
                  >
                    <MenuItem value={"Go to"}>Go to</MenuItem>
                    {/* Add more actions here */}
                  </Select>
                  <Select
                    style={{ width: "30%", borderRadius: "10px", marginLeft: "13px" }}
                    value={formFields[rule.thenTarget.index].id}
                    onChange={(e) => handleThenChange(ruleIndex, "thenTarget", e.target.value)}
                  >
                    {formFields.map((fld, indx) => indx >= qIndx && <MenuItem value={fld.id}>{fld.label}</MenuItem>)}
                  </Select>
                </div>
                <IconButton
                  size="small"
                  style={{
                    marginLeft: "10px",
                    marginTop: "18px",
                    display: "flex",
                    flexDirection: "row",
                    borderRadius: "12px", // Ensures the shape is rectangular
                    color: "red",
                  }}
                  onClick={(e) => deleteRule(ruleIndex)}
                >
                  <DeleteIcon />
                  <span>Delete Rule</span>
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="contained"
        onClick={() => addRule()}
        startIcon={<AddIcon />}
        sx={{
          height: "40px", // Match Select height
          minWidth: "auto", // Adjust width to fit content
          padding: "0 16px", // Adjust padding for consistency
          borderRadius: "10px",
          marginTop: "10px",
        }}
      >
        Add Rule
      </Button>
      <div style={{ position: "absolute", bottom: 20, right: 20 }}>
        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: "10px", fontSize: "25px" }}>
          Save
        </Button>
      </div>
    </Box>
  )
}
