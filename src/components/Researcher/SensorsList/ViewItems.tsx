import React, { useState } from "react"
import {
  Grid,
  Paper,
  Typography,
  Divider,
  TextField,
  Box,
  makeStyles,
  Theme,
  createStyles,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Checkbox,
  Chip,
  InputLabel,
} from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"
import { ImageUploader } from "../../ImageUploader"
import { useTranslation } from "react-i18next"

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    viewGrid: {
      margin: 0,
      width: "100%",
      height: "calc(100vh - 100px)",
      overflow: "hidden",
    },
    infoContainer: {
      width: "100%",
      height: "100%",
      paddingRight: 0,
    },
    infoPaper: {
      padding: theme.spacing(3),
      position: "relative",
      height: "100%",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: 4,
      overflow: "auto",
      "&.editing-mode": {
        backgroundColor: "#fafafa",
      },
    },
    fieldContainer: {
      marginBottom: theme.spacing(2),
    },
    viewLabel: {
      fontWeight: 500,
      color: "rgba(0, 0, 0, 0.7)",
      fontSize: "0.9rem",
    },
    viewValue: {
      fontSize: "1rem",
      wordBreak: "break-word",
      padding: "8px 0",
      color: theme.palette.text.primary,
      "&.email-value": {
        color: "#06B0F0",
      },
    },
    viewInput: {
      margin: "8px 0",
    },
    viewDivider: {
      margin: "8px 0",
    },
    sideContainer: {
      width: "100%",
      height: "100%",
    },
    sidePaper: {
      height: "100%",
      padding: 0,
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: 4,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    tabsContainer: {
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      display: "flex",
      backgroundColor: "#FFFFFF",
      flexWrap: "wrap",
      width: "100%",
    },
    tab: {
      padding: "16px 16px",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.875rem",
      whiteSpace: "nowrap",
      flex: "1 1 auto",
      textAlign: "center",
      minWidth: "fit-content",
    },
    activeTab: {
      borderBottom: "3px solid #1a7dfb",
      color: "#1a7dfb",
    },
    inactiveTab: {
      color: "rgba(0, 0, 0, 0.7)",
    },
    tabContent: {
      padding: theme.spacing(2),
      flexGrow: 1,
      overflowY: "auto",
      height: "100%",
    },
    editButton: {
      backgroundColor: "#1a7dfb",
      color: "#fff",
      borderRadius: 4,
      textTransform: "none",
      padding: "6px 16px",
      fontSize: "0.875rem",
      "&:hover": {
        backgroundColor: "#1667d9",
      },
    },
    changeStatusButton: {
      backgroundColor: "#fff",
      color: "#1a7dfb",
      border: "1px solid #1a7dfb",
      borderRadius: 4,
      textTransform: "none",
      padding: "6px 16px",
      fontSize: "0.875rem",
      marginLeft: theme.spacing(2),
      "&:hover": {
        backgroundColor: "rgba(26, 125, 251, 0.05)",
      },
    },
    dropdownIcon: {
      fontSize: "0.75rem",
      marginLeft: theme.spacing(1),
    },
    buttonContainer: {
      display: "flex",
      marginTop: theme.spacing(2),
    },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
    },
    infoLabel: {
      fontWeight: 500,
      color: "rgba(0, 0, 0, 0.7)",
      fontSize: "0.9rem",
      flex: "0 0 25%",
    },
    infoValue: {
      fontSize: "0.9rem",
      flex: "1 1 auto",
      wordBreak: "break-word",
      "&.blue-text": {
        color: "#1a7dfb",
      },
      "&.url-text": {
        textDecoration: "underline",
      },
    },
    editIconButton: {
      padding: 4,
      marginLeft: theme.spacing(1),
    },
    editIconContainer: {
      display: "flex",
      alignItems: "center",
    },
    versionBadge: {
      backgroundColor: "#f0f0f0",
      padding: "2px 6px",
      borderRadius: 4,
      fontSize: "0.75rem",
      marginLeft: theme.spacing(1),
      color: "rgba(0, 0, 0, 0.6)",
    },
    imageUploader: {
      marginBottom: theme.spacing(2),
      "& img": {
        maxWidth: "100%",
        height: "auto",
        borderRadius: theme.shape.borderRadius,
      },
    },
    streakSettings: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
    },
    multiSelect: {
      "& .MuiSelect-select": {
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing(0.5),
      },
    },
    selectedChip: {
      margin: theme.spacing(0.25),
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
    selectFormControl: {
      margin: "8px 0",
      minWidth: 120,
      width: "100%",
    },
  })
)

export interface FieldConfig {
  id: string
  label: string
  value: any
  editable?: boolean
  hide?: boolean
  type?: "text" | "multiline" | "multiselect" | "multi-text" | "select" | "date" | "email" | "phone" | "image"
  options?: { value: string; label: string; disabled?: boolean }[]
}

export interface TabConfig {
  id: string
  label: string
  content: React.ReactNode
}

export interface SubmissionInfo {
  version?: string
  versionNumber?: string
  userIp?: string
  sourceUrl?: string
  browser?: string
  device?: string
  user?: string
  status?: string
  submittedOn?: string
  onChangeStatus?: () => void
  isEditing?: boolean
  onEdit?: () => void
  onSave?: () => void
  onUserEdit?: () => void
  editableFields?: string[]
}

interface ViewItemsProps {
  fields: FieldConfig[]
  tabs?: TabConfig[]
  isEditing: boolean
  onEdit?: () => void
  onSave?: (updatedValues: Record<string, any>) => void
  editedValues?: Record<string, any>
  setEditedValues?: (values: Record<string, any>) => void
  title?: string
  loading?: boolean
  submissionInfo?: SubmissionInfo
  additionalContent?: React.ReactNode
  footerButtons?: React.ReactNode
}

const ViewItems: React.FC<ViewItemsProps> = ({
  fields,
  tabs = [],
  isEditing,
  onEdit,
  onSave,
  editedValues = {},
  setEditedValues = () => {},
  title,
  loading = false,
  submissionInfo,
  additionalContent,
  footerButtons,
}) => {
  const classes = useStyles()
  const [activeTab, setActiveTab] = useState("developer")
  const [currentTextValue, setCurrentTextValue] = useState("")
  const { t } = useTranslation()

  const handleValueChange = (field, value) => {
    if ((isEditing || submissionInfo.isEditing) && setEditedValues) {
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

  const renderSubmissionInfo = () => (
    <div>
      {submissionInfo?.version && (
        <div className={classes.infoRow}>
          <div className={classes.infoLabel}>Version:</div>
          <div className={classes.infoValue}>
            {submissionInfo.version}
            {submissionInfo.versionNumber && (
              <span className={classes.versionBadge}>#{submissionInfo.versionNumber}</span>
            )}
          </div>
        </div>
      )}
      {submissionInfo?.userIp && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>User IP:</div>
            <div className={classes.infoValue}>
              <span className="blue-text">{submissionInfo.userIp}</span>
            </div>
          </div>
          <Divider />
        </>
      )}
      {submissionInfo?.sourceUrl && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>Source URL:</div>
            <div className={classes.infoValue}>
              {submissionInfo.isEditing ? (
                <TextField
                  size="small"
                  variant="outlined"
                  value={editedValues?.developer_info?.sourceUrl}
                  onChange={(e) => handleValueChange("developer_info.sourceUrl", e.target.value)}
                  fullWidth
                />
              ) : (
                <span className="blue-text url-text">{submissionInfo.sourceUrl}</span>
              )}
            </div>
          </div>
          <Divider />
        </>
      )}
      {submissionInfo?.browser && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>Browser:</div>
            <div className={classes.infoValue}>{submissionInfo.browser}</div>
          </div>
          <Divider />
        </>
      )}
      {submissionInfo?.device && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>Device:</div>
            <div className={classes.infoValue}>{submissionInfo.device}</div>
          </div>
          <Divider />
        </>
      )}
      {submissionInfo?.user && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>User:</div>
            <div className={classes.infoValue}>
              {submissionInfo.isEditing ? (
                <TextField
                  size="small"
                  variant="outlined"
                  value={editedValues?.developer_info?.user}
                  onChange={(e) => handleValueChange("developer_info.user", e.target.value)}
                  fullWidth
                />
              ) : (
                submissionInfo.user
              )}
            </div>
            {submissionInfo.onUserEdit && (
              <IconButton className={classes.editIconButton} size="small" onClick={submissionInfo.onUserEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </div>
          <Divider />
        </>
      )}
      {submissionInfo?.status && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>Status:</div>
            <div className={classes.infoValue}>{submissionInfo.status}</div>
          </div>
          <Divider />
        </>
      )}
      {submissionInfo?.submittedOn && (
        <>
          <div className={classes.infoRow}>
            <div className={classes.infoLabel}>Submitted On:</div>
            <div className={classes.infoValue}>{submissionInfo.submittedOn}</div>
          </div>
          <Divider />
        </>
      )}
      <div className={classes.buttonContainer}>
        {submissionInfo.isEditing ? (
          <Button variant="contained" className={classes.editButton} onClick={submissionInfo.onSave}>
            Save Changes
          </Button>
        ) : (
          <Button variant="contained" className={classes.editButton} onClick={submissionInfo.onEdit}>
            <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Edit
          </Button>
        )}
        {submissionInfo?.onChangeStatus && (
          <Button variant="outlined" className={classes.changeStatusButton} onClick={submissionInfo.onChangeStatus}>
            Change status to <span className={classes.dropdownIcon}>▼</span>
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Grid container spacing={0} className={classes.viewGrid}>
      <Grid item xs={12} md={7} className={classes.infoContainer}>
        <Paper elevation={1} className={`${classes.infoPaper} ${isEditing ? "editing-mode" : ""}`}>
          {fields.map((field) => (
            <Box key={field.id} className={classes.fieldContainer}>
              <Typography className={classes.viewLabel}>{field.label}</Typography>

              {isEditing && field.editable ? (
                field.type === "image" ? (
                  <Box className={classes.imageUploader}>
                    <ImageUploader
                      value={editedValues[field.id] || field.value}
                      onChange={(value) => handleValueChange(field.id, value)}
                      disabled={!isEditing}
                    />
                  </Box>
                ) : field.type === "multi-text" ? (
                  <Box>
                    <TextField
                      className={classes.viewInput}
                      value={currentTextValue}
                      onChange={(e) => setCurrentTextValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && currentTextValue.trim()) {
                          const currentValues = editedValues[field.id] || []
                          if (!currentValues.includes(currentTextValue.trim())) {
                            handleValueChange(field.id, [...currentValues, currentTextValue.trim()])
                            setCurrentTextValue("")
                          }
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder={t("Press Enter to add")}
                    />
                    <Box display="flex" flexWrap="wrap" mt={1}>
                      {(editedValues[field.id] || []).map((value, index) => (
                        <Chip
                          key={index}
                          label={value}
                          onDelete={() => {
                            const newValues = [...(editedValues[field.id] || [])]
                            newValues.splice(index, 1)
                            handleValueChange(field.id, newValues)
                          }}
                          className={classes.selectedChip}
                        />
                      ))}
                    </Box>
                  </Box>
                ) : field.type === "select" ? (
                  <TextField
                    className={classes.viewInput}
                    value={editedValues[field.id] !== undefined ? editedValues[field.id] : field.value}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    select
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : field.type === "multiselect" ? (
                  <FormControl variant="outlined" size="small" className={classes.selectFormControl}>
                    <InputLabel id={`${field.id}-label`} />
                    {/* {field.label}</InputLabel> */}
                    <Select
                      labelId={`${field.id}-label`}
                      multiple
                      value={editedValues[field.id] !== undefined ? editedValues[field.id] : field.value}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      className={classes.multiSelect}
                      renderValue={(selected: string[]) => (
                        <Box display="flex" flexWrap="wrap" style={{ gap: 0.5 }}>
                          {selected.map((value) => {
                            const option = field.options?.find((opt) => opt.value === value)
                            return (
                              <Chip
                                key={value}
                                label={option?.label || value}
                                className={classes.selectedChip}
                                size="small"
                              />
                            )
                          })}
                        </Box>
                      )}
                      label={field.label}
                    >
                      {field.options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Checkbox
                            checked={
                              (editedValues[field.id] !== undefined ? editedValues[field.id] : field.value)?.indexOf(
                                option.value
                              ) > -1
                            }
                          />
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    className={classes.viewInput}
                    value={editedValues[field.id] !== undefined ? editedValues[field.id] : field.value}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    multiline={field.type === "multiline"}
                    minRows={field.type === "multiline" ? 3 : 1}
                    type={field.type === "phone" ? "tel" : field.type === "email" ? "email" : "text"}
                  />
                )
              ) : field.type === "image" ? (
                <Box className={classes.imageUploader}>
                  {field.value ? (
                    <img src={field.value} alt="Activity" />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No image uploaded
                    </Typography>
                  )}
                </Box>
              ) : field.type === "multiselect" ? (
                <Box display="flex" flexWrap="wrap" style={{ gap: 1 }}>
                  {(field.value || []).map((value: string) => {
                    const option = field.options?.find((opt) => opt.value === value)
                    return <Chip key={value} label={option?.label || value} size="small" variant="outlined" />
                  })}
                </Box>
              ) : field.type === "multi-text" ? (
                <Box display="flex" flexWrap="wrap" style={{ gap: 1 }}>
                  {(field.value || []).map((value: string, index: number) => (
                    <Chip key={index} label={value} size="small" variant="outlined" className={classes.selectedChip} />
                  ))}
                </Box>
              ) : (
                <Typography className={`${classes.viewValue} ${field.type === "email" ? "email-value" : ""}`}>
                  {field.value || "-"}
                </Typography>
              )}
              <Divider className={classes.viewDivider} />
            </Box>
          ))}
          {additionalContent}
          {additionalContent && <Divider className={classes.viewDivider} />}
          {footerButtons}
          {isEditing && onSave && (
            <Button
              variant="contained"
              className={classes.editButton}
              onClick={() => onSave(editedValues)}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={5} className={classes.sideContainer}>
        <Paper elevation={3} className={classes.sidePaper}>
          <div className={classes.tabsContainer}>
            <div
              className={`${classes.tab} ${activeTab === "developer" ? classes.activeTab : classes.inactiveTab}`}
              onClick={() => setActiveTab("developer")}
            >
              Developer Info
            </div>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`${classes.tab} ${activeTab === tab.id ? classes.activeTab : classes.inactiveTab}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <Box className={classes.tabContent}>
            {activeTab === "developer" ? renderSubmissionInfo() : tabs.find((tab) => tab.id === activeTab)?.content}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default ViewItems
