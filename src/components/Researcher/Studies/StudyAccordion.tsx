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
  InputAdornment,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Checkbox,
} from "@material-ui/core"
import { Business, CheckCircle, CloudUpload, Visibility, Description } from "@material-ui/icons"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import ViewItems, { FieldConfig, TabConfig } from "../SensorsList/ViewItems"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { DeveloperInfo, fetchUserIp } from "../ActivityList/ActivityDetailItem"
import { ImageUploader } from "../../ImageUploader"
import { useHistory } from "react-router-dom"
import { fetchGetData, fetchPostData } from "../SaveResearcherData"
import { ReactComponent as EmptyCircleIcon } from "../../../icons/NewIcons/circle-dashed.svg"
import { ReactComponent as CheckCircleIcon } from "../../../icons/NewIcons/check-circle.svg"
import { ReactComponent as AccordionExpandIcon } from "../../../icons/NewIcons/angle-circle-down.svg"
import { ReactComponent as Edit } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as Save } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as DesignIcon } from "../../../icons/NewIcons/customize-computer.svg"
import { ReactComponent as LiveIcon } from "../../../icons/NewIcons/lightbulb-on.svg"
import { ReactComponent as EndIcon } from "../../../icons/NewIcons/folder-minus.svg"
import { ReactComponent as LockIcon } from "../../../icons/NewIcons/lock.svg"

import clsx from "clsx"
import { studycardStyles } from "./Index"
import { getAccessLevelLabel } from "./AddSubResearcher"
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootContainer: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      // position: "absolute",
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
      backgroundColor: "pink",
    },
    tabContent: {
      // padding: theme.spacing(2),
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
      color: "#fffff",
      fontWeight: 600,
      marginBottom: theme.spacing(2),
    },
    documentViewer: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(1),
    },
    documentControls: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing(2),
    },
    ethicsSection: {
      backgroundColor: "#f8f9fa",
      borderRadius: theme.spacing(2),
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    uploadSection: {
      border: `2px dashed ${theme.palette.grey[300]}`,
      borderRadius: theme.spacing(1),
      padding: theme.spacing(3),
      textAlign: "center",
      marginTop: theme.spacing(2),
      backgroundColor: "#ffffff",
      transition: "border-color 0.3s ease",
      "&:hover": {
        borderColor: theme.palette.primary.main,
      },
    },
    fileInput: {
      display: "none",
    },
    uploadButton: {
      margin: theme.spacing(1),
    },
    viewButton: {
      backgroundColor: "#ffffff",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: "#ffffff",
      },
    },
    buttonLabel: {
      marginLeft: theme.spacing(1),
    },
    statusChip: {
      margin: theme.spacing(1),
    },
    description: {
      fontSize: 48,
      color: theme.palette.grey[400],
    },
    buttonBase: {
      "&.selected": {
        backgroundColor: "#1976d2",
        color: "#ffffff",
      },
      "&.unselected": {
        backgroundColor: "transparent",
        color: "#1976d2",
      },
      "&.disabled": {
        opacity: 0.7,
      },
    },
    fieldContainer: {
      marginBottom: theme.spacing(2),
    },
    imageUploader: {
      marginBottom: theme.spacing(2),
      "& img": {
        maxWidth: "100%",
        height: "auto",
        borderRadius: theme.shape.borderRadius,
      },
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
    viewDivider: {
      margin: "8px 0",
    },
    accordionContainer: {
      margin: "24px 40px", // Add left and right spacing
      borderRadius: "16px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e0e0e0",
      overflow: "auto",
    },
    // Custom Accordion Styles
    customAccordion: {
      backgroundColor: "#ffffff",
      borderRadius: "0 !important", // Remove individual border radius
      marginBottom: "0 !important", // Remove individual margins
      boxShadow: "none !important", // Remove individual shadows
      border: "none !important", // Remove individual borders
      borderBottom: "1px solid #e0e0e0 !important", // Add separator between accordions
      "&:before": {
        display: "none",
      },
      "&:first-child": {
        borderTopLeftRadius: "16px !important",
        borderTopRightRadius: "16px !important",
      },
      "&:last-child": {
        borderBottomLeftRadius: "16px !important",
        borderBottomRightRadius: "16px !important",
        borderBottom: "none !important",
      },
      "&.Mui-expanded": {
        margin: "0 !important",
      },
    },
    customAccordionSummary: {
      backgroundColor: "#ffffff",
      borderRadius: "0",
      minHeight: "64px",
      padding: "0 24px",
      "&.Mui-expanded": {
        borderBottom: "1px solid #e0e0e0",
      },
      "& .MuiAccordionSummary-content": {
        alignItems: "center",
        margin: "16px 0",
      },
      "& .MuiAccordionSummary-expandIcon": {
        color: "#666666",
        "&.Mui-expanded": {
          transform: "rotate(180deg)",
        },
      },
    },
    customAccordionDetails: {
      padding: "24px",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
    },
    accordionHeader: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
    accordionTitle: {
      fontSize: "16px",
      fontWeight: 500,
      color: "#333333",
      marginLeft: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    statusIcon: {
      width: "24px",
      height: "24px",
      "& path": {
        fill: "#4CAF50",
      },
      "&.empty path": {
        fill: "#CCCCCC",
      },
    },
    prodIcon: {
      "& path": {
        fill: "#CCCCCC",
      },
    },
    statusLockIcon: {
      width: "24px",
      height: "24px",
      "& path": {
        fill: "#CCCCCC",
      },
    },
    accordionActions: {
      display: "flex",
      gap: "12px",
      // marginTop: '24px',
      // paddingTop: '16px',
      // borderTop: '1px solid #f0f0f0',
      width: "100%",
      justifyContent: "flex-start",
    },
    actionButton: {
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: 500,
      textTransform: "none",
      minWidth: "80px",
      border: "1px solid",
      backgroundColor: "transparent",
      "&.add": {
        borderColor: "#2196F3",
        color: "#2196F3",
        "&:hover": {
          backgroundColor: "rgba(33, 150, 243, 0.04)",
        },
      },
      "&.save": {
        borderColor: "#4CAF50",
        color: "#4CAF50",
        "&:hover": {
          backgroundColor: "rgba(76, 175, 80, 0.04)",
        },
      },
      "&.exit": {
        borderColor: "#f44336",
        color: "#f44336",
        "&:hover": {
          backgroundColor: "rgba(244, 67, 54, 0.04)",
        },
      },
      "&.complete": {
        borderColor: "#FF9800",
        color: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        "&:hover": {
          backgroundColor: "rgba(255, 152, 0, 0.6)",
        },
        "&.completed": {
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          borderColor: "#4CAF50",
          color: "#4CAF50",
        },
      },
    },
    completeIcon: {
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      border: "2px solid currentColor",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&.completed": {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
        color: "white",
      },
    },
    sharingSection: {
      backgroundColor: "#f8f9fa",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
    },
    selectResearcher: {
      marginBottom: "16px",
      "& .MuiSelect-root": {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      },
    },
    sharedWithList: {
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      padding: "16px",
      marginTop: "16px",
    },
    sharedItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid #f0f0f0",
      "&:last-child": {
        borderBottom: "none",
      },
    },
    sharedItemInfo: {
      flex: 1,
    },
    sharedItemName: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#333333",
    },
    sharedItemDate: {
      fontSize: "12px",
      color: "#999999",
      marginTop: "2px",
    },
    sharedItemActions: {
      display: "flex",
      gap: "8px",
    },
    iconButton: {
      width: "32px",
      height: "32px",
      backgroundColor: "#ADC9E9",
      "&.svg": {
        fill: "#ADC9E9",
      },
      "&:hover": {
        backgroundColor: "#e0e0e0",
      },
    },
    accordionIcon: {
      height: "32px",
      width: "32px",
    },
    stateProgress: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(3, 0),
      position: "relative",
    },
    stateItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      // marginRight: theme.spacing(4),
      // '&:last-child': {
      //   marginRight: 0,
      // },
    },
    stateIconContainer: {
      width: 60,
      height: 60,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing(1),
      transition: "all 0.3s ease",
      border: "2px solid transparent",
      "&.clickable": {
        cursor: "pointer",
        "&:hover": {
          transform: "scale(1.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
      },
      "&.active": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        // border: '2px solid #ffffff',
      },
    },
    stateIcon: {
      width: 24,
      height: 24,
      fill: "white",
    },
    stateLabel: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#333333",
      textAlign: "center",
      marginTop: theme.spacing(0.5),
    },
    stateConnector: {
      width: 32,
      height: 2,
      backgroundColor: "#000000",
    },
    stateSlideBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1299,
    },
    stateSlide: {
      position: "fixed",
      top: 0,
      right: 0,
      width: 500,
      height: "100%",
      backgroundColor: "white",
      boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
      zIndex: 1300,
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
      display: "flex",
      flexDirection: "column",
    },
    stateSlideVisible: {
      transform: "translateX(0)",
    },
    stateSlideContent: {
      padding: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "left",
      // textAlign: 'center',
      height: "100%",
    },
    stateSlideIconContainer: {
      width: 80,
      height: 80,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing(3),
    },
    stateSlideIcon: {
      width: 40,
      height: 40,
    },
    stateSlideTitle: {
      fontSize: "1.5rem",
      fontWeight: 700,
      marginBottom: theme.spacing(2),
      color: "#333",
      letterSpacing: "0.5px",
    },
    stateSlideTopDivider: {
      width: "100%",
      height: 1,
      backgroundColor: "#E5E7EB",
      marginBottom: theme.spacing(3),
    },
    stateSlideDescription: {
      color: "#666",
      lineHeight: 1.6,
      marginBottom: theme.spacing(3),
      fontSize: "1rem",
      maxWidth: "400px",
    },
    stateSlideButton: {
      padding: theme.spacing(1.5, 4),
      fontSize: "1rem",
      fontWeight: 600,
      textTransform: "none",
      borderRadius: "8px",
      border: "1px solid",
      borderColor: "#FF9800",
      color: "#ff8000ff",
      backgroundColor: "rgba(255, 153, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(1),
      minWidth: "200px",
      "&:disabled": {
        backgroundColor: "#CCCCCC",
        color: "#666666",
      },
    },
    statsGrid: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "1px solid #dbdbdb",
      borderTop: "1px solid #dbdbdb",
      background: "#ffffff",
    },
  })
)
const getButtonClasses = (isSelected: boolean, isDisabled: boolean, classes: any) => {
  return clsx(classes.buttonBase, isSelected ? "selected" : "unselected", isDisabled && "disabled")
}

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

interface StudyAccordionProps {
  study: any
  isEditing: boolean
  onSave: (updatedStudy: any) => void
  researcherId: string
  triggerSave?: boolean
  authType?: any
}

const StudyAccordion: React.FC<StudyAccordionProps> = ({
  study,
  isEditing,
  onSave,
  researcherId,
  triggerSave,
  authType,
}) => {
  const history = useHistory()
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [isDeveloperInfoEditing, setIsDeveloperInfoEditing] = useState(false)
  const [collaboratingInstitutions, setCollaboratingInstitutions] = useState<string>("")
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [isDocumentLoading, setIsDocumentLoading] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    nickname: "",
    description: "",
    type: "",
    notes: "",
  })
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null)
  const [researcherFormData, setResearcherFormData] = useState({
    researcherId: "",
    accessScope: 1,
  })
  const [editingResearcherIndex, setEditingResearcherIndex] = useState<number | null>(null)
  const [availableResearchers, setAvailableResearchers] = useState([])
  const [showStateSlide, setShowStateSlide] = useState(false)
  const [selectedStateAction, setSelectedStateAction] = useState(null)

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
  const [tempEditedValues, setTempEditedValues] = useState(editedValues)

  useEffect(() => {
    const fetchInstitutions = async () => {
      const institutionsSet = new Set<string>()

      await Promise.all(
        tempEditedValues.sub_researchers?.map(async (researcher) => {
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

  useEffect(() => {
    const fetchAvailableResearchers = async () => {
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        const response = await fetchGetData(authString, `researcher/others/list`, "researcher")
        const researchers = response.data
        console.log("fetchAvailableResearchers:", researchers)
        const filteredResearchers = researchers.filter((r) => r.id !== researcherId && r.id !== study.parent)
        setAvailableResearchers(filteredResearchers)
      } catch (error) {
        console.error("Error fetching researchers:", error)
      }
    }
    fetchAvailableResearchers()
  }, [])

  const handleSaveSection = (sectionId: string) => {
    setEditedValues(tempEditedValues)
    enqueueSnackbar(t("Changes saved"), { variant: "success" })
  }

  const handleExitSection = (sectionId: string) => {
    setTempEditedValues(editedValues)
    if (sectionId === "groups") {
      setGroupFormData({
        name: "",
        nickname: "",
        description: "",
        type: "",
        notes: "",
      })
      setEditingGroupIndex(null)
    }
    if (sectionId === "researchers") {
      setResearcherFormData({
        researcherId: "",
        accessScope: 1,
      })
      setEditingResearcherIndex(null)
    }
    setExpanded(false)
    enqueueSnackbar(t("Changes discarded"), { variant: "info" })
  }

  const handleMarkComplete = async (sectionId: string) => {
    setIsCompleting(true)
    try {
      setEditedValues(tempEditedValues)
      await handleSave()
      setCompletedSections((prev) => new Set([...prev, sectionId]))
      enqueueSnackbar(t("Section marked as complete"), { variant: "success" })
    } catch (error) {
      console.error("Error completing section:", error)
      enqueueSnackbar(t("Failed to mark section as complete"), { variant: "error" })
    } finally {
      setIsCompleting(false)
    }
  }

  const handleAddGroup = () => {
    if (groupFormData.name.trim()) {
      const currentGroups = tempEditedValues.gname || []
      if (!currentGroups.includes(groupFormData.name.trim())) {
        handleValueChange("gname", [...currentGroups, groupFormData.name.trim()])
        setGroupFormData({
          name: "",
          nickname: "",
          description: "",
          type: "",
          notes: "",
        })
        enqueueSnackbar(t("Group added"), { variant: "success" })
      } else {
        enqueueSnackbar(t("Group name already exists"), { variant: "warning" })
      }
    } else {
      enqueueSnackbar(t("Group name is required"), { variant: "error" })
    }
  }

  const handleEditGroup = (index: number) => {
    const groupName = tempEditedValues.gname[index]
    setGroupFormData((prev) => ({ ...prev, name: groupName }))
    setEditingGroupIndex(index)
    enqueueSnackbar(t("Edit the group name in the form and click save"), { variant: "info" })
  }

  const handleSaveGroupEdit = (index: number) => {
    if (groupFormData.name.trim() && editingGroupIndex === index) {
      const currentGroups = [...(tempEditedValues.gname || [])]
      const newName = groupFormData.name.trim()

      const nameExists = currentGroups.some((name, i) => i !== index && name === newName)

      if (!nameExists) {
        currentGroups[index] = newName
        handleValueChange("gname", currentGroups)
        setEditingGroupIndex(null)
        setGroupFormData({
          name: "",
          nickname: "",
          description: "",
          type: "",
          notes: "",
        })
        enqueueSnackbar(t("Group updated"), { variant: "success" })
      } else {
        enqueueSnackbar(t("Group name already exists"), { variant: "warning" })
      }
    }
  }

  const handleDeleteGroup = (index: number) => {
    const currentGroups = [...(tempEditedValues.gname || [])]
    const deletedGroupName = currentGroups[index]
    currentGroups.splice(index, 1)
    handleValueChange("gname", currentGroups)

    // Reset editing state if we were editing this group
    if (editingGroupIndex === index) {
      setEditingGroupIndex(null)
      setGroupFormData({
        name: "",
        nickname: "",
        description: "",
        type: "",
        notes: "",
      })
    }

    enqueueSnackbar(t(`Group "${deletedGroupName}" deleted`), { variant: "success" })
  }

  const handleAddResearcher = () => {
    if (researcherFormData.researcherId && researcherFormData.accessScope) {
      const currentResearchers = tempEditedValues.sub_researchers || []

      // Check if researcher already exists
      const existingResearcher = currentResearchers.find((r) => r.ResearcherID === researcherFormData.researcherId)

      if (!existingResearcher) {
        const newResearcher = {
          ResearcherID: researcherFormData.researcherId,
          access_scope: researcherFormData.accessScope,
        }

        handleValueChange("sub_researchers", [...currentResearchers, newResearcher])
        setResearcherFormData({
          researcherId: "",
          accessScope: 1,
        })
        enqueueSnackbar(t("Researcher added"), { variant: "success" })
      } else {
        enqueueSnackbar(t("Researcher already added to this study"), { variant: "warning" })
      }
    } else {
      enqueueSnackbar(t("Please select researcher and access privilege"), { variant: "error" })
    }
  }

  const handleEditResearcher = (index: number) => {
    const researcher = tempEditedValues.sub_researchers[index]
    setResearcherFormData({
      researcherId: researcher.ResearcherID,
      accessScope: researcher.access_scope,
    })
    setEditingResearcherIndex(index)
    enqueueSnackbar(t("Edit the researcher details in the form and click save"), { variant: "info" })
  }

  const handleSaveResearcherEdit = (index: number) => {
    if (researcherFormData.researcherId && editingResearcherIndex === index) {
      const currentResearchers = [...(tempEditedValues.sub_researchers || [])]

      // Check if new researcher ID already exists (excluding current index)
      const researcherExists = currentResearchers.some(
        (r, i) => i !== index && r.ResearcherID === researcherFormData.researcherId
      )

      if (!researcherExists) {
        currentResearchers[index] = {
          ResearcherID: researcherFormData.researcherId,
          access_scope: researcherFormData.accessScope,
        }

        handleValueChange("sub_researchers", currentResearchers)
        setEditingResearcherIndex(null)
        setResearcherFormData({
          researcherId: "",
          accessScope: 1,
        })
        enqueueSnackbar(t("Researcher updated"), { variant: "success" })
      } else {
        enqueueSnackbar(t("Researcher already exists in this study"), { variant: "warning" })
      }
    }
  }

  const handleDeleteResearcher = (index: number) => {
    const currentResearchers = [...(tempEditedValues.sub_researchers || [])]
    const deletedResearcher = currentResearchers[index]
    currentResearchers.splice(index, 1)
    handleValueChange("sub_researchers", currentResearchers)

    // Reset editing state if we were editing this researcher
    if (editingResearcherIndex === index) {
      setEditingResearcherIndex(null)
      setResearcherFormData({
        researcherId: "",
        accessScope: 1,
      })
    }
    enqueueSnackbar(t("Researcher removed from study"), { variant: "success" })
  }

  const handleStateChange = async (newState) => {
    try {
      setLoading(true)
      const updatedTimestamps = {
        ...editedValues.timestamps,
        productionAt: newState === "production" ? new Date() : editedValues.timestamps.productionAt,
        completedAt: newState === "complete" ? new Date() : editedValues.timestamps.completedAt,
      }
      console.log("handleStateChange", newState, tempEditedValues)
      const updatedValues = { ...editedValues, state: newState, timestamps: updatedTimestamps }
      setEditedValues(updatedValues)
      setTempEditedValues(updatedValues)
      await handleSaveWithValues(updatedValues)
      setShowStateSlide(false)
      enqueueSnackbar(t(`Study moved to ${newState} mode`), { variant: "success" })
    } catch (error) {
      console.error("Error changing study state:", error)
      enqueueSnackbar(t("Failed to change study state"), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

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
    // {
    //   id: "gname",
    //   label: t("Groups"),
    //   value: study?.gname || "",
    //   editable: true,
    //   type: "multi-text",
    // },
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
      editable: authType == "admin",
      type: "multiline",
    },
    {
      id: "createdAt",
      label: t("Created At"),
      value: study?.timestamp ? new Date(study.timestamp).toLocaleDateString() : t("Not available"),
      editable: false,
      type: "text",
    },
    ...(study?.timestamps
      ? Object.entries(study.timestamps).map(([key, value]) => ({
          id: key,
          label: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          value: value ? new Date(value as string).toLocaleDateString() : t("Not available"),
          editable: false,
          type: "text" as const,
        }))
      : []),
  ]

  const groupFields: FieldConfig[] = [
    {
      id: "groupName",
      label: t("Group Name"),
      value: groupFormData.name,
      editable: true,
      type: "text",
    },
    // {
    //   id: "groupNickname",
    //   label: t("Group Nickname"),
    //   value: groupFormData.nickname,
    //   editable: true,
    //   type: "text"
    // },
    // {
    //   id: "groupDescription",
    //   label: t("Group Description"),
    //   value: groupFormData.description,
    //   editable: true,
    //   type: "multiline"
    // },
    // {
    //   id: "groupType",
    //   label: t("Group Type"),
    //   value: groupFormData.type,
    //   editable: true,
    //   type: "text"
    // },
    // {
    //   id: "notes",
    //   label: t("Notes"),
    //   value: groupFormData.notes,
    //   editable: true,
    //   type: "multiline"
    // }
  ]

  const sharingFields: FieldConfig[] = [
    {
      id: "researcherId",
      label: t("Researcher"),
      value: researcherFormData.researcherId,
      editable: true,
      hide: true,
      options: availableResearchers.map((researcher) => ({
        value: researcher.id,
        label: researcher.name || researcher.id,
      })),
      type: "select",
    },
    {
      id: "accessScope",
      label: t("Access Scope"),
      value: researcherFormData.accessScope,
      editable: true,
      hide: true,
      options: [
        { value: 1, label: getAccessLevelLabel(1) },
        { value: 2, label: getAccessLevelLabel(2) },
        { value: 4, label: getAccessLevelLabel(4) },
      ],
      type: "select",
    },
  ]

  // Create tab contents

  const FundingAndEthicsContent = () => (
    <Box className={classes.tabContent}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.ethicsSection} elevation={0}>
            <Typography variant="h6" className={classes.sectionTitle}>
              {t("Funding Status")}
            </Typography>
            <ButtonGroup variant="contained" color="primary" className={classes.buttonGroup}>
              <Button
                variant={tempEditedValues.hasFunding ? "contained" : "outlined"}
                className={getButtonClasses(tempEditedValues.hasFunding, !isEditing, classes)}
                onClick={() => handleValueChange("hasFunding", true)}
                disabled={!isEditing && study.state !== "development"}
                // startIcon={<AttachMoney />}
              >
                {t("Has Funding")}
              </Button>
              <Button
                variant={!tempEditedValues.hasFunding ? "contained" : "outlined"}
                className={getButtonClasses(!tempEditedValues.hasFunding, !isEditing, classes)}
                onClick={() => handleValueChange("hasFunding", false)}
                disabled={!isEditing || study.state !== "development"}
                // startIcon={<MoneyOff />}
              >
                {t("No Funding")}
              </Button>
            </ButtonGroup>
          </Paper>
        </Grid>

        {tempEditedValues.hasFunding && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("Funding Agency")}
              defaultValue={tempEditedValues.fundingAgency}
              onBlur={(e) => handleValueChange("fundingAgency", e.target.value)}
              disabled={!isEditing || study.state !== "development"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper className={classes.ethicsSection} elevation={0}>
            <Typography variant="h6" className={classes.sectionTitle}>
              {t("Ethics Permission")}
            </Typography>
            <ButtonGroup variant="contained" color="primary" className={classes.buttonGroup}>
              <Button
                variant={tempEditedValues.hasEthicsPermission ? "contained" : "outlined"}
                // color={editedValues.hasEthicsPermission ? "primary" : "default"}
                className={getButtonClasses(
                  tempEditedValues.hasEthicsPermission,
                  !isEditing || study.state !== "development",
                  classes
                )}
                onClick={() => handleValueChange("hasEthicsPermission", true)}
                disabled={!isEditing || study.state !== "development"}
                // startIcon={<CheckCircle />}
              >
                {t("Has Permission")}
              </Button>
              <Button
                variant={!tempEditedValues.hasEthicsPermission ? "contained" : "outlined"}
                // color={!editedValues.hasEthicsPermission ? "primary" : "default"}
                className={getButtonClasses(
                  !tempEditedValues.hasEthicsPermission,
                  !isEditing || study.state !== "development",
                  classes
                )}
                onClick={() => handleValueChange("hasEthicsPermission", false)}
                disabled={!isEditing || study.state !== "development"}
                // startIcon={<Cancel />}
              >
                {t("No Permission")}
              </Button>
            </ButtonGroup>

            {tempEditedValues.hasEthicsPermission && (
              <Box className={classes.uploadSection}>
                <input
                  accept=".pdf,.doc,.docx"
                  className={classes.fileInput}
                  id="ethics-file-input"
                  type="file"
                  onChange={(e) => {
                    const EPfile = e.target.files?.[0]
                    if (EPfile) uploadDoc(EPfile)
                  }}
                  disabled={!isEditing || study.state !== "development"}
                />

                <Box display="flex" flexDirection="column" alignItems="center">
                  <Description className={classes.description} />
                  <Typography variant="body1" color="textSecondary">
                    {t("Drag and drop your ethics permission document here or click to browse")}
                  </Typography>

                  <Box>
                    <label htmlFor="ethics-file-input">
                      <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        disabled={!isEditing || study.state !== "development"}
                        className={classes.uploadButton}
                        startIcon={<CloudUpload />}
                      >
                        {t("Upload Document")}
                      </Button>
                    </label>

                    {tempEditedValues.ethicsPermissionDoc && (
                      <Button
                        variant="outlined"
                        className={classes.viewButton}
                        onClick={fetchEthicsDocument}
                        disabled={isDocumentLoading}
                        startIcon={isDocumentLoading ? <CircularProgress size={20} /> : <Visibility />}
                      >
                        {isDocumentLoading ? t("Loading...") : t("View Document")}
                      </Button>
                    )}
                  </Box>
                </Box>

                {tempEditedValues.ethicsPermissionDoc && (
                  <Chip
                    label={t("Document uploaded")}
                    color="primary"
                    icon={<CheckCircle />}
                    className={classes.statusChip}
                  />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
  type ResearcherInfo = {
    name: string
    accessScope: string
    researcherId: string
    accessScopeValue: number
  }
  const ResearchersContent = () => {
    const [validResearchers, setValidResearchers] = useState<ResearcherInfo[] | null>(null)
    const [ResearcherNames, setResearcherNames] = useState({})
    console.log(editedValues.sub_researchers)
    if (validResearchers === null) {
      const fetchValidResearchers = async () => {
        const results: ResearcherInfo[] = []
        const rnames = {}
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
                researcherId: researcher.ResearcherID,
                accessScopeValue: researcher.access_scope,
              })
              rnames[researcher.ResearcherID] = researchers.name
            } catch {
              console.log("check this")
              results.push({
                name: researcher.ResearcherID,
                accessScope: getAccessScope(researcher.access_scope),
                researcherId: researcher.ResearcherID,
                accessScopeValue: researcher.access_scope,
              })
            }
          }) || []
        )
        setValidResearchers(results)
        setResearcherNames(rnames)
      }

      fetchValidResearchers()
      return <CircularProgress />
    }

    if (validResearchers === null) {
      return <CircularProgress />
    }
    const getName = (rID) => {
      return ResearcherNames[rID] ? ResearcherNames[rID] : rID
    }

    return (
      <Box className={classes.tabContent}>
        {/* <List>
          {validResearchers.map((researcher, index) => (
            <ListItem key={index}>
              <ListItemText primary={researcher.name} secondary={`Access: ${researcher.accessScope}`} />
            </ListItem>
          ))}
        </List> */}
        <Grid container spacing={3}>
          {isEditing && study.state === "development" && (
            <Grid item xs={6}>
              <Box>
                {sharingFields.map((field) => (
                  <Box key={field.id} className={classes.fieldContainer}>
                    <Typography className={classes.viewLabel}>{field.label}</Typography>
                    {
                      isEditing &&
                        (field.type === "select" ? (
                          <TextField
                            className={classes.viewInput}
                            value={field.value}
                            onChange={(e) => {
                              console.log("sharing clicked", field.options, field.id, availableResearchers)
                              const newValue =
                                field.id === "accessPrivilege" ? parseInt(e.target.value) : e.target.value
                              setResearcherFormData((prev) => ({
                                ...prev,
                                [field.id]: newValue,
                              }))
                            }}
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
                        ) : (
                          <TextField
                            className={classes.viewInput}
                            value={field.value}
                            onChange={(e) => {
                              const fieldMap = {
                                researcherName: "researcherName",
                                accessPrivilege: "accessPrivilege",
                              }
                              setResearcherFormData((prev) => ({
                                ...prev,
                                [fieldMap[field.id]]: e.target.value,
                              }))
                            }}
                            fullWidth
                            variant="outlined"
                            size="small"
                          />
                        ))
                      //   : (
                      //   <Typography className={classes.viewValue}>
                      //     {field.type === "select" && field.options ?
                      //       field.options.find(opt => opt.value === field.value)?.label || field.value :
                      //       field.value || "-"
                      //     }
                      //   </Typography>
                      // )
                    }
                    <Divider className={classes.viewDivider} />
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
          <Grid item xs={6}>
            <Typography variant="h6" className={classes.sectionTitle}>
              {t("Shared With")}:
            </Typography>
            {tempEditedValues.sub_researchers && tempEditedValues.sub_researchers.length > 0 ? (
              <List>
                {tempEditedValues.sub_researchers.map((SR, index) => (
                  <ListItem key={index} className={classes.sharedItem}>
                    <ListItemText
                      primary={`${index + 1}. ${getName(SR.ResearcherID)}`}
                      secondary={` Access: ${getAccessLevelLabel(SR.access_scope)}`}
                    />

                    <Box className={classes.sharedItemActions}>
                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleEditResearcher(index)}
                        title={t("Edit")}
                        disabled={!isEditing || study.state !== "development"}
                      >
                        <Edit style={{ width: 16, height: 16 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleSaveResearcherEdit(index)}
                        title={t("Save")}
                        disabled={editingResearcherIndex !== index || !isEditing || study.state !== "development"}
                      >
                        <Save style={{ width: 16, height: 16 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        className={classes.iconButton}
                        onClick={() => handleDeleteResearcher(index)}
                        title={t("Delete")}
                        disabled={!isEditing || study.state !== "development"}
                      >
                        <DeleteIcon style={{ width: 16, height: 16 }} />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                {t("No researchers added yet")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    )
  }

  const getStateColor = (state, currentState) => {
    if (state === currentState) {
      switch (state) {
        case "development":
          return "#5A9FD4"
        case "production":
          return "#FF8C42"
        case "complete":
          return "#6B7280"
        default:
          return "#E5E7EB"
      }
    }
    return "#E5E7EB"
  }

  const isStateClickable = (targetState, currentState) => {
    if (currentState === "development") {
      return targetState === "production"
    } else if (currentState === "production") {
      return targetState === "complete" || targetState === "development"
    } else if (currentState === "complete") {
      return targetState === "development"
    }
    return false
  }

  // const StudyStateContent = () => (
  //   <Box className={classes.tabContent}>
  //     <FormControl fullWidth>
  //       <InputLabel>{t("State")}</InputLabel>
  //       <Select
  //         value={editedValues.state || "development"}
  //         disabled={!isEditing}
  //         onChange={(e) => {
  //           const newstate = e.target.value
  //           handleValueChange("state", newstate)
  //           handleValueChange("timestamps", {
  //             ...editedValues.timestamps,
  //             productionAt: newstate === "production" ? new Date() : editedValues.timestamps.productionAt,
  //             completedAt: newstate === "complete" ? new Date() : editedValues.timestamps.completedAt,
  //           })
  //         }}
  //       >
  //         <MenuItem value="development">{t("Development")}</MenuItem>
  //         <MenuItem value="production">{t("Production")}</MenuItem>
  //         <MenuItem value="complete">{t("Complete")}</MenuItem>
  //       </Select>
  //     </FormControl>
  //   </Box>
  // )

  const StateSlide = () => {
    if (!showStateSlide || !selectedStateAction) return null

    const getSlideContent = () => {
      switch (selectedStateAction) {
        case "production":
          return {
            icon: LiveIcon,
            title: "LIVE",
            description:
              "A study can only be made live after all the steps have been completed and have been marked so.\n\nIf everything is in order, kindly proceed",
            buttonText: "GO LIVE",
            action: () => handleStateChange("production"),
          }
        case "complete":
          return {
            icon: EndIcon,
            title: "END",
            description:
              "This study has ended and is preserved here only for data viewing. Re-initiate this study to development mode to make this study active again.",
            buttonText: "END STUDY",
            action: () => handleStateChange("complete"),
          }
        case "development":
          return {
            icon: DesignIcon,
            title: "DESIGN",
            description: "Return this study to development mode to make changes and modifications.",
            buttonText: "RETURN TO DESIGN MODE",
            action: () => handleStateChange("development"),
          }
        default:
          return null
      }
    }

    const content = getSlideContent()
    if (!content) return null
    const IconComponent = content.icon

    return (
      <>
        <Box className={classes.stateSlideBackdrop} onClick={() => setShowStateSlide(false)} />
        <Box className={`${classes.stateSlide} ${showStateSlide ? classes.stateSlideVisible : ""}`}>
          <Box className={classes.stateSlideContent}>
            <Box className={classes.stateSlideIconContainer}>
              <IconComponent className={classes.stateSlideIcon} />
            </Box>
            <Typography className={classes.stateSlideTitle}>{content.title} MODE</Typography>
            <Divider className={classes.stateSlideTopDivider} />
            <Typography className={classes.stateSlideDescription}>
              {content.description.split("\n\n").map((paragraph, index) => (
                <span key={index}>
                  {paragraph}
                  {index < content.description.split("\n\n").length - 1 && (
                    <>
                      <br />
                      <br />
                    </>
                  )}
                </span>
              ))}
            </Typography>
            <Divider className={classes.stateSlideTopDivider} />
            <Button onClick={content.action} disabled={loading} className={classes.stateSlideButton}>
              {content.buttonText}
            </Button>
          </Box>
        </Box>
      </>
    )
  }

  const StudyStateProgress = () => {
    const currentState = editedValues.state || "development"

    const states = [
      {
        key: "development",
        label: "DESIGN",
        icon: DesignIcon,
        // nextState: 'production'
      },
      {
        key: "production",
        label: "LIVE",
        icon: LiveIcon,
        // nextState: 'complete'
      },
      {
        key: "complete",
        label: "END",
        icon: EndIcon,
        // nextState: null
      },
    ]

    return (
      <Box className={classes.stateProgress}>
        {states.map((state, index) => {
          const IconComponent = state.icon
          const isActive = currentState === state.key
          const isClickable = isStateClickable(state.key, currentState)

          return (
            <React.Fragment key={state.key}>
              <Box className={classes.stateItem}>
                <Box
                  className={`${classes.stateIconContainer} ${isActive ? "active" : ""} ${
                    isClickable ? "clickable" : ""
                  }`}
                  style={{ backgroundColor: getStateColor(state.key, currentState) }}
                  onClick={() => {
                    if (isClickable) {
                      setSelectedStateAction(state.key)
                      setShowStateSlide(true)
                    }
                  }}
                >
                  <IconComponent className={classes.stateIcon} />
                </Box>
                <Typography className={classes.stateLabel}>{state.label}</Typography>
              </Box>
              {index < states.length - 1 && <Box className={classes.stateConnector} />}
            </React.Fragment>
          )
        })}
      </Box>
    )
  }

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

  // Handler functions
  const handleValueChange = (field: string, value: any) => {
    setTempEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    return handleSaveWithValues(editedValues)
  }

  const handleSaveWithValues = async (valuesToSave = editedValues) => {
    setLoading(true)
    try {
      // Validation
      if (!valuesToSave.name?.trim()) {
        throw new Error(t("Study name is required"))
      }

      const { developer_info, ...studyData } = valuesToSave
      console.log("developer_info from valuesToSave", developer_info)
      console.log("studyData from valuesToSave", studyData)
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
      // onSave(studyData)
      const updatedStudyobj = await LAMP.Study.view(study.id)
      console.log("updating study globally with :", updatedStudyobj)
      onSave(updatedStudyobj)
    } catch (error) {
      console.error("Error updating study:", error)
      enqueueSnackbar(t("Failed to update study: ") + error.message, { variant: "error" })
    } finally {
      setLoading(false)
    }
  }
  const fetchEthicsDocument = async () => {
    setIsDocumentLoading(true)
    try {
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const baseUrl =
        "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")
      const response = await fetch(`${baseUrl}/study/${study.id}/ethicsPermissionDoc`, {
        headers: {
          Authorization: "Basic " + btoa(authString),
        },
      })
      console.log("fetchEthicsDocument", response)
      if (!response.ok) throw new Error("Failed to fetch document")
      const contentType = response.headers.get("content-type")
      let fileExtension = ".pdf"
      if (contentType) {
        switch (contentType) {
          case "application/pdf":
            fileExtension = ".pdf"
            break
          case "application/msword":
            fileExtension = ".doc"
            break
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            fileExtension = ".docx"
            break
        }
      }

      const blob = await response.blob()
      const fileName = `study-${study.id}-ethics${fileExtension}`
      if (contentType === "application/pdf") {
        const blobUrl = URL.createObjectURL(blob)
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
          const iframe = document.createElement("iframe")
          iframe.style.display = "none"
          document.body.appendChild(iframe)

          iframe.contentWindow?.document.write(
            `<html><body style="margin:0;"><embed width="100%" height="100%" src="${blobUrl}" type="application/pdf"></body></html>`
          )

          const newWindow = window.open(blobUrl, "_blank")
          if (newWindow) {
            newWindow.document.title = fileName
          }

          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 100)
        } else {
          const newWindow = window.open(blobUrl, "_blank")
          if (newWindow) {
            newWindow.document.title = fileName
          }
        }
      } else {
        // For non-PDF files, trigger download with proper filename
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      setDocumentUrl(null)
      // const url = URL.createObjectURL(blob);
      // setDocumentUrl(url);
      // window.open(url, '_blank');
    } catch (error) {
      console.error("Failed to fetch document:", error)
      enqueueSnackbar(t("Failed to fetch document"), { variant: "error" })
    } finally {
      setIsDocumentLoading(false)
    }
  }

  const uploadDoc = async (EPfile: File) => {
    const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
    const baseUrl = "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")

    // Create FormData for file upload
    const formData = new FormData()
    formData.append("file", EPfile)
    try {
      const response = await fetch(`${baseUrl}/study/${study.id}/uploadEthicsPermissionDoc`, {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(authString),
        },
        body: formData, // Don't set Content-Type - browser will set it with boundary for FormData
      })
      const result = await response.json()
      console.log("result", result, result.data.ethicsPermissionDoc)
      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }
      handleValueChange("ethicsPermissionDoc", result.data.ethicsPermissionDoc)
      enqueueSnackbar(t("Document uploaded successfully"), { variant: "success" })
    } catch (error) {
      console.error("Failed to upload document:", error)
      enqueueSnackbar(t("Failed to upload document: ") + error.message, { variant: "error" })
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
          const initialData = {
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
          }
          setEditedValues(initialData)
          setTempEditedValues(initialData)
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

  const [expanded, setExpanded] = useState<string | false>(false)

  const handleAccordionChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const [currentTextValue, setCurrentTextValue] = useState("")

  const renderField = (field: FieldConfig) => {
    return (
      <Box key={field.id} className={classes.fieldContainer}>
        <Typography className={classes.viewLabel}>{field.label}</Typography>

        {isEditing && study.state === "development" && field.editable ? (
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
                    const currentValues = tempEditedValues[field.id] || []
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
                {(tempEditedValues[field.id] || []).map((value, index) => (
                  <Chip
                    key={index}
                    label={value}
                    onDelete={() => {
                      const newValues = [...(tempEditedValues[field.id] || [])]
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
              value={tempEditedValues[field.id] !== undefined ? tempEditedValues[field.id] : field.value}
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
                value={tempEditedValues[field.id] !== undefined ? tempEditedValues[field.id] : field.value}
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
                        (tempEditedValues[field.id] !== undefined ? tempEditedValues[field.id] : field.value)?.indexOf(
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
              value={tempEditedValues[field.id] !== undefined ? tempEditedValues[field.id] : field.value}
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
          !field.hide && (
            <Typography className={`${classes.viewValue} ${field.type === "email" ? "email-value" : ""}`}>
              {field.value || "-"}
            </Typography>
          )
        )}
        <Divider className={classes.viewDivider} />
      </Box>
    )
  }

  const stats = (study) => {
    return [
      {
        value: study.gname?.length || 0,
        label: "GROUPS",
        color: "#ca74c8",
        key: "groups",
      },
      {
        value: study.participants?.length || 0,
        label: "PARTICIPANTS",
        color: "#06B0F0",
        key: "participants",
      },
      {
        value: study.assessments?.length || 0,
        label: "ASSESSMENTS",
        color: "#06B0F0",
        key: "assessments",
      },
      {
        value: study.activities?.length || 0,
        label: "ACTIVITIES",
        color: "#06B0F0",
        key: "activities",
      },
      {
        value: study.sensors?.length || 0,
        label: "SENSORS",
        color: "#75d36d",
        key: "sensors",
      },
      {
        value: study.sub_researchers?.length || 0,
        label: "Shared",
        color: "#06B0F0",
        key: "sub_researchers",
      },
    ]
  }
  const [selectedTab, setSelectedTab] = useState({ id: null, tab: null })
  const studycardclasses = studycardStyles()

  const isAccordionComplete = (sectionId: string, editedValues: any) => {
    // if (editedValues.state !== "development" && editedValues.state !== undefined) {
    //   switch(editedValues.state){
    //     case "production":  return "lockedProd"
    //     case "complete":  return "lockedComp"
    //   }
    //   return "locked"
    // }

    switch (sectionId) {
      case "study-basics":
        return !!(editedValues.name && editedValues.description && editedValues.purpose)
      case "funding-ethics":
        return !!(
          editedValues.hasFunding !== undefined &&
          editedValues.hasEthicsPermission !== undefined &&
          (!editedValues.hasFunding || editedValues.fundingAgency) &&
          (!editedValues.hasEthicsPermission || editedValues.ethicsPermissionDoc)
        )
      case "researchers":
        return !!(editedValues.sub_researchers && editedValues.sub_researchers.length > 0)
      case "groups":
        return !!(editedValues.gname && editedValues.gname.length > 0)
      case "participants":
        return !!(editedValues.participants && editedValues.participants.length > 0)
      case "activities":
        return !!(editedValues.activities && editedValues.activities.length > 0)
      case "sensors":
        return !!(editedValues.sensors && editedValues.sensors.length > 0)
      case "study-state":
        return !!editedValues.state
      default:
        return false
    }
  }

  const accordionSections = [
    {
      id: "study-basics",
      title: t("Study Basics"),
      content: (
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} key={field.id}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
      ),
      showActions: true,
    },
    {
      id: "funding-ethics",
      title: t("Funding & Ethics"),
      content: <FundingAndEthicsContent />,
      showActions: true,
    },
    // {
    //   id: "statistics",
    //   title: t("Statistics"),
    //   content: <StatisticsContent />,
    // },
    {
      id: "groups",
      title: t("Groups"),
      content: (
        <Box className={classes.tabContent}>
          <Grid container spacing={3}>
            {/* Left side - Group form */}
            {isEditing && study.state === "development" && (
              <Grid item xs={6}>
                <Box>
                  {groupFields.map((field) => (
                    <Box key={field.id} className={classes.fieldContainer}>
                      <Typography className={classes.viewLabel}>{field.label}</Typography>
                      {
                        isEditing && (
                          <TextField
                            className={classes.viewInput}
                            value={field.value}
                            onChange={(e) => {
                              const fieldMap = {
                                groupName: "name",
                                // groupNickname: 'nickname',
                                // groupDescription: 'description',
                                // groupType: 'type',
                                // notes: 'notes'
                              }
                              setGroupFormData((prev) => ({
                                ...prev,
                                [fieldMap[field.id]]: e.target.value,
                              }))
                            }}
                            fullWidth
                            variant="outlined"
                            size="small"
                            multiline={field.type === "multiline"}
                            minRows={field.type === "multiline" ? 3 : 1}
                          />
                        )
                        // : (
                        //   <Typography className={classes.viewValue}>
                        //     {field.value || "-"}
                        //   </Typography>
                        // )
                      }
                      <Divider className={classes.viewDivider} />
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
            {/* Right side - Groups list */}
            <Grid item xs={6}>
              <Typography variant="h6" className={classes.sectionTitle}>
                {t("Groups added to the study")}:
              </Typography>

              {tempEditedValues.gname && tempEditedValues.gname.length > 0 ? (
                <List>
                  {tempEditedValues.gname.map((groupName, index) => (
                    <ListItem key={index} className={classes.sharedItem}>
                      <Box className={classes.sharedItemInfo}>
                        <Typography className={classes.sharedItemName}>
                          {t("Group")} {index + 1}: {groupName}
                        </Typography>
                        <Typography className={classes.sharedItemDate}>
                          {/* Add additional group info here if needed */}
                        </Typography>
                      </Box>

                      <Box className={classes.sharedItemActions}>
                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => handleEditGroup(index)}
                          title={t("Edit")}
                          disabled={!isEditing || study.state !== "development"}
                        >
                          <Edit style={{ width: 16, height: 16 }} />
                        </IconButton>

                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => handleSaveGroupEdit(index)}
                          title={t("Save")}
                          disabled={editingGroupIndex !== index || !isEditing || study.state !== "development"}
                        >
                          <Save style={{ width: 16, height: 16 }} />
                        </IconButton>

                        <IconButton
                          size="small"
                          className={classes.iconButton}
                          onClick={() => handleDeleteGroup(index)}
                          title={t("Delete")}
                          disabled={!isEditing || study.state !== "development"}
                        >
                          <DeleteIcon style={{ width: 16, height: 16 }} />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {t("No groups added yet")}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      ),
      showActions: true,
      addHandler: () => handleAddGroup(),
    },
    {
      id: "participants",
      title: t("Participants"),
      content: (
        <Box className={classes.tabContent}>
          {/* <Typography variant="h6" className={classes.sectionTitle}>
            {t("Participants")} ({editedValues.participants?.length || 0})
          </Typography> */}
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
                <ListItemText
                  primary={
                    participant.name
                      ? participant.name
                      : participant.username
                      ? participant.username
                      : participant.firstName || participant.lastName
                      ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
                      : participant.id
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ),
      showActions: false,
      addHandler: () => {
        console.log("Add handler for participants")
      },
    },
    {
      id: "activities",
      title: t("Activities"),
      content: (
        <Box className={classes.tabContent}>
          {/* <Typography variant="h6" className={classes.sectionTitle}>
            {t("Activities")} ({editedValues.activities?.length || 0})
          </Typography> */}
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
        </Box>
      ),
      addHandler: () => {
        console.log("Add handler for activities")
      },
    },
    {
      id: "sensors",
      title: t("Sensors"),
      content: (
        <Box className={classes.tabContent}>
          {/* <Typography variant="h6" className={classes.sectionTitle}>
            {t("Sensors")} ({editedValues.sensors?.length || 0})
          </Typography> */}
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
        </Box>
      ),
      addHandler: () => {
        console.log("Add handler for sensors")
      },
    },
    {
      id: "researchers",
      title: t("Sharing"),
      content: <ResearchersContent />,
      showActions: true,
      addHandler: () => handleAddResearcher(),
    },
  ]

  return (
    <React.Fragment>
      <Grid container className={classes.statsGrid}>
        {stats(study).map((stat) => (
          <Grid
            item
            xs={2}
            key={stat.key}
            className={`${studycardclasses.statItem} ${
              selectedTab.id === study.id && selectedTab.tab === stat.key ? "selected" : ""
            }`}
            // onClick={() => {
            //   selectedTab.id === study.id && selectedTab.tab === stat.key
            //     ? setSelectedTab({ id: null, tab: null })
            //     : setSelectedTab({ id: study.id, tab: stat.key })
            // }}
          >
            <Typography className={studycardclasses.statNumber} style={{ color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography className={studycardclasses.statLabel}>{stat.label}</Typography>
          </Grid>
        ))}
      </Grid>
      <StudyStateProgress />
      <StateSlide />
      <Box className={classes.accordionContainer}>
        {accordionSections.map((section, index) => {
          const completionStatus = isAccordionComplete(section.id, study.state === "development" ? editedValues : study)
          const isComplete = completionStatus === true
          const isPLocked = study.state === "production"
          const isCLocked = study.state === "complete"
          const isExpanded = expanded === section.id

          return (
            <Accordion
              key={section.id}
              expanded={isExpanded}
              onChange={handleAccordionChange(section.id)}
              className={classes.customAccordion}
              elevation={0}
            >
              <AccordionSummary
                expandIcon={<AccordionExpandIcon className={classes.accordionIcon} />}
                className={classes.customAccordionSummary}
              >
                <Box className={classes.accordionHeader}>
                  {section.showActions &&
                    (isCLocked ? (
                      <LockIcon className={classes.statusLockIcon} />
                    ) : (
                      <>
                        {isComplete ? (
                          <CheckCircleIcon className={`${classes.statusIcon} ${isPLocked && classes.prodIcon}`} />
                        ) : (
                          <EmptyCircleIcon className={`${classes.statusIcon} empty`} />
                        )}
                        {isPLocked && <LockIcon className={classes.statusLockIcon} />}
                      </>
                    ))}
                  <Typography className={classes.accordionTitle}>{section.title}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails className={classes.customAccordionDetails}>
                <Box style={{ flex: 1 }}>{section.content}</Box>
                {isEditing && study.state === "development" && section.showActions && (
                  <Box className={classes.accordionActions}>
                    {section.addHandler && (
                      <Button
                        className={`${classes.actionButton} add`}
                        variant="outlined"
                        onClick={section.addHandler}
                        disabled={isPLocked || isCLocked}
                      >
                        ADD
                      </Button>
                    )}
                    <Button
                      className={`${classes.actionButton} save`}
                      variant="outlined"
                      onClick={() => handleSaveSection(section.id)}
                      disabled={isPLocked || isCLocked}
                    >
                      SAVE
                    </Button>
                    <Button
                      className={`${classes.actionButton} exit`}
                      variant="outlined"
                      onClick={() => handleExitSection(section.id)}
                    >
                      EXIT
                    </Button>
                    <Button
                      className={`${classes.actionButton} complete ${
                        completedSections.has(section.id) ? "completed" : ""
                      }`}
                      variant="outlined"
                      onClick={() => handleMarkComplete(section.id)}
                      disabled={isCompleting || isPLocked || isCLocked}
                    >
                      <Box
                        className={`${classes.completeIcon} ${completedSections.has(section.id) ? "completed" : ""}`}
                      >
                        {completedSections.has(section.id) && "✓"}
                      </Box>
                      MARK AS COMPLETE
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Box>
    </React.Fragment>
  )
}

export default StudyAccordion
