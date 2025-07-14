import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Icon,
  Grid,
  makeStyles,
  Theme,
  createStyles,
  Backdrop,
  CircularProgress,
  Button,
  Paper,
  Typography,
  FormControl,
  Switch,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Divider,
  ButtonGroup,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  useMediaQuery,
  useTheme,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  ListItemText,
  Tooltip,
  Slide,
} from "@material-ui/core"
// import Header from "./Header"
import { useTranslation } from "react-i18next"
import DeleteStudy from "./DeleteStudy"
import EditStudy from "./EditStudy"
import { Service } from "../../DBService/DBService"
import useInterval from "../../useInterval"
import AddSubResearcher, { getAccessLevelLabel } from "./AddSubResearcher"
import { useLayoutStyles } from "../../GlobalStyles"
import LAMP from "lamp-core"
import { useSnackbar } from "notistack"
import StudyDetailsDialog from "./StudyDetailsDialog"
import { ReactComponent as UserAddIcon } from "../../../icons/NewIcons/user-add.svg"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/copy.svg"
import { ReactComponent as SuspendIcon } from "../../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as UserAddFilledIcon } from "../../../icons/NewIcons/user-add-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/copy-filled.svg"
import { ReactComponent as SuspendFilledIcon } from "../../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as DeletedIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as SuspendedIcon } from "../../../icons/NewIcons/stop-circle-filled.svg"
import { formatDate_alph, formatLastUse, getItemFrequency } from "../../Utils"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as SRAddIcon } from "../../../icons/NewIcons/users-alt.svg"
import { ReactComponent as SRAddFilledIcon } from "../../../icons/NewIcons/users-alt-filled.svg"
import { ReactComponent as ArrowDropDownIcon } from "../../../icons/NewIcons/sort-circle-down.svg"
import { ReactComponent as ArrowDropUpIcon } from "../../../icons/NewIcons/sort-circle-up.svg"
// import { ReactComponent as AddIcon } from "../../../icons/NewIcons/add.svg"
import AddIcon from "@material-ui/icons/Add"
// import { ReactComponent as SRAddFilledIcon } from "../../../icons/NewIcons/users-alt-filled.svg";

import AddParticipantToStudy from "./AddParticipantToStudy"
import { useTableStyles } from "../ActivityList/Index"
import ItemViewHeader from "../SharedStyles/ItemViewHeader"
import StudyDetailItem from "./StudyDetailItem"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../../icons/NewIcons/floppy-disks-filled.svg"
import { fetchGetData, fetchPostData } from "../SaveResearcherData"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { InputTextarea } from "primereact/inputtextarea"
import CommonTable, { TableColumn as CommonTableColumn } from "../CommonTable"
import ActionsComponent from "../../Admin/ActionsComponent"

import Header from "../../Header"
import "../../Admin/admin.css"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as UserIcon } from "../../../icons/NewIcons/users.svg"
import StudyCreator from "../ParticipantList/StudyCreator"
import StudyGroupCreator from "./StudyGroupCreator"
import PatientStudyCreator from "../ParticipantList/PatientStudyCreator"
import { FilterMatchMode } from "primereact/api"
import { createPortal } from "react-dom"

export const studycardStyles = makeStyles((theme: Theme) =>
  createStyles({
    dhrCard: {
      backgroundColor: "white",
      border: "1px solid #ededec",
      borderRadius: theme.spacing(2),
      padding: theme.spacing(2),
      boxShadow: theme.shadows[1],
      marginBottom: theme.spacing(6), // Add more bottom margin for action buttons
      position: "relative",
      "&:hover $actionButton": {
        backgroundColor: "#2196F3",
        color: "white",
      },
      transition: "box-shadow 0.3s ease",
      "&:hover": {
        boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.5)",
      },
      "&:focus": {
        boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.5)",
      },
      "&:hover $actionButtons": {
        opacity: 1,
      },
    },
    activeIcon: {
      "& svg": {
        width: 20,
        height: 20,
        "& path": {
          fill: "#ffc002",
        },
      },
    },
    titleDivider: {
      margin: `${theme.spacing(1)}px -${theme.spacing(2)}px ${theme.spacing(2)}px -${theme.spacing(2)}px`,
    },
    gridDivider: {
      margin: `${theme.spacing(1)}px ${theme.spacing(2)}px -${theme.spacing(2)}px`,
    },
    cardTitle: {
      // fontWeight: 'bold',
      marginBottom: theme.spacing(1),
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    cardSubtitle: {
      // color: theme.palette.text.secondary,
      // fontSize: '0.8rem',
      marginBottom: theme.spacing(1),
      fontSize: "0.875rem",
      color: "rgba(0, 0, 0, 0.6)",
    },
    cardMetadata: {
      fontSize: "0.75rem",
      color: "#06B0F0",
      marginBottom: theme.spacing(2),
      // fontSize: '0.8rem',
      // marginBottom: theme.spacing(2),
      // color: theme.palette.text.secondary,
    },
    statsGrid: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: theme.spacing(2),
    },
    statItem: {
      textAlign: "center",
      cursor: "pointer",
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      // '&:hover': {
      //   backgroundColor: '#FDEDE8',
      // },
      "&.selected": {
        backgroundColor: "rgba(253, 237, 232, 0.3)", // '#FDEDE8',
      },
    },
    statNumber: {
      fontSize: "2rem",
      fontWeight: 500,
      lineHeight: 1,
    },
    statLabel: {
      fontSize: "0.75rem",
      color: "rgba(0, 0, 0, 0.6)",
      marginTop: theme.spacing(0.5),
    },
    groupsSection: {
      marginTop: theme.spacing(2),
    },
    // groupItem: {
    //   padding: theme.spacing(1.5),
    //   borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    //   "&:last-child": {
    //     borderBottom: "none",
    //   },
    // },
    groupItem: {
      padding: theme.spacing(2, 1.5),
      borderBottom: "1px dashed rgba(0, 0, 0, 0.12)",
      "&:last-child": {
        borderBottom: "none",
      },
    },
    // groupName: {
    //   fontSize: "0.875rem",
    //   fontWeight: 500,
    // },
    groupName: {
      fontSize: "1rem",
      fontWeight: 500,
      marginBottom: theme.spacing(1),
      color: "rgba(0, 0, 0, 0.87)",
    },
    groupDesc: {
      fontSize: "0.75rem",
      color: "rgba(0, 0, 0, 0.6)",
    },
    groupCount: {
      fontSize: "0.875rem",
      color: "#215F9A",
    },
    groupitem: {
      fontSize: "0.75rem",
      color: "rgba(0, 0, 0, 0.6)",
    },

    cardStatsContainer: {
      display: "flex",
      justifyContent: "space-between",
      textAlign: "center",
    },
    cardStatNumber: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    cardStatLabel: {
      fontSize: "0.7rem",
      color: theme.palette.text.secondary,
    },
    groupColor: { color: "#E91E63" },
    assessmentColor: { color: "#2196F3" },
    activityColor: { color: "#4CAF50" },
    sensorColor: { color: "#9C27B0" },
    actionButtonsContainer: {
      position: "sticky",
      bottom: -45,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      justifyContent: "center",
      gap: theme.spacing(1),
      zIndex: 1,
    },
    actionButton: {
      // backgroundColor: '#06B0F0',
      // color: '#06B0F0',
      padding: theme.spacing(1),
      borderRadius: "4px",
      // '&:hover': {
      //   backgroundColor: '#215F9A',
      //   color: 'white',
      // },
      "&:selected": {
        backgroundColor: "#4F95DA",
        color: "white",
      },
      width: 32,
      height: 32,
      minWidth: "unset",
      transition: "background-color 0.3s, color 0.3s",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#06B0F0",
        color: "#FFFFFF",
      },
      "&.selected": {
        backgroundColor: "#4F95DA",
        color: "#FFFFFF",
      },
      "&.active": {
        backgroundColor: "#215F9A",
        color: "#FFFFFF",
      },
    },
    actionButtons: {
      position: "absolute",
      bottom: -45,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      marginLeft: "auto",
      justifyContent: "center",
      gap: theme.spacing(1),
      "& button": {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        color: "#FFFFFF",
        "&:hover": {
          backgroundColor: "#06B0F0",
        },
        "&.selected": {
          backgroundColor: "#4F95DA",
        },
      },
      // zIndex: 1,
    },
    tabContainer: {
      marginTop: theme.spacing(2),
    },
    tabPanel: {
      padding: theme.spacing(2, 0),
      maxHeight: 200,
      overflowY: "auto",
    },
    stateChip: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      justifyContent: "flex-end",
      "& svg": {
        width: 20,
        height: 20,
        "& path": {
          fill: "#EB8367",
        },
      },
      "& .activeIcon path": {
        fill: "#ffc002 !important",
      },
    },
    stateIndicator: {
      padding: "4px 12px",
      borderRadius: "16px",
      fontSize: "0.75rem",
      textTransform: "capitalize",
      height: "auto",
      backgroundColor: "#06B0F0",
      color: "white",
      "&.production": {
        backgroundColor: "#EB8367",
      },
    },
    groupList: {
      maxHeight: "200px",
      overflowY: "auto",
      marginTop: theme.spacing(2),
      "&::-webkit-scrollbar": {
        width: "4px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#888",
      },
    },
    bulletList: {
      listStylePosition: "outside",
      padding: theme.spacing(0, 0, 0, 3),
      margin: theme.spacing(1, 0),
      "& li": {
        marginBottom: theme.spacing(0.5),
        "& p": {
          display: "inline",
        },
      },
    },
    actionIcon: {
      width: 24,
      height: 24,
      cursor: "pointer",
      transition: "all 0.3s ease",
      opacity: 0.4,
      "& path": {
        fill: "#000000",
      },
      "&:hover": {
        opacity: 1,
        "& path": {
          fill: "#06B0F0",
        },
      },
      "&.selected": {
        opacity: 1,
        "& path": {
          fill: "#4F95DA",
        },
      },
      "&.active": {
        opacity: 1,
        "& path": {
          fill: "#215F9A",
        },
      },
      "&:hover path": {
        fill: "#06B0F0",
      },
      "&.selected path": {
        fill: "#4F95DA",
      },
      "&.active path": {
        fill: "#215F9A",
      },
    },
    sharedCard: {
      background: "#F8F4FF", // Light purple background
      border: "1px solid #d8aedf ",
      position: "relative",
    },
    sharedBadge: {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      background: "#d8aedf",
      color: "white",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
    },
  })
)

// modular table components defined here
export interface TableColumn {
  id: string
  label: string
  value: (row: any) => string | number | React.ReactNode
  visible: boolean
  sortable?: boolean
}

export const useModularTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRoot: {
      height: "100%",
      minHeight: "calc(100vh - 200px)",
      "& .MuiTableContainer-root": {
        minHeight: "calc(100vh - 250px)",
      },
      "& .MuiTable-root": {
        tableLayout: "fixed",
        borderCollapse: "separate",
        borderSpacing: 0,
      },
      "& .MuiTableCell-head": {
        backgroundColor: "#fff",
        fontWeight: 600,
        position: "relative",
        borderBottom: "1px solid #e0e0e0",
        padding: "16px 8px",
        "&.sortable": {
          cursor: "pointer",
          userSelect: "none",
          "&:hover .sortIcon": {
            opacity: 1,
          },
        },
      },
      "& .MuiTableRow-root": {
        borderBottom: "1px solid #f0f0f0",
      },
      "& .MuiTableCell-body": {
        padding: theme.spacing(1.5),
        color: "#333",
        borderBottom: "1px solid #f0f0f0",
        "&.checkbox": {
          width: 48,
          padding: theme.spacing(0, 1),
        },
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
      "& .actionCell": {
        position: "sticky",
        right: 0,
        backgroundColor: "#fff",
        zIndex: 2,
        boxShadow: "-2px 0px 4px rgba(0, 0, 0, 0.1)",
      },
    },
    sortButton: {
      // marginLeft: theme.spacing(0.5),
      // display: 'inline-flex',
      "& svg": {
        // fontSize: '5rem',
        opacity: 0.6,
        fill: "black",
        width: 15,
        height: 15,
      },
    },
    indexCell: {
      width: "40px",
      color: "#5d93f4",
      textAlign: "center",
      fontWeight: "normal",
    },
    checkbox: {
      padding: theme.spacing(0.5),
      color: "#ccc",
      "&.Mui-checked": {
        color: "#7599FF",
      },
      "& .MuiSvgIcon-root": {
        borderRadius: "4px",
        width: "18px",
        height: "18px",
      },
    },
    categoryHeader: {
      backgroundColor: "#FFF",
      padding: theme.spacing(1, 2),
      "& .MuiTypography-root": {
        fontWeight: 500,
        color: "rgba(0, 0, 0, 0.87)",
      },
    },
    scrollShadow: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: 20,
      background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
      pointerEvents: "none",
      zIndex: 12,
    },
    headerCell: {
      backgroundColor: "#fff",
      color: theme.palette.text.primary,
      fontWeight: 500,
      position: "sticky",
      top: 0,
      zIndex: 10,
      "&.sticky-left": {
        left: 0,
        zIndex: 11,
      },
      "&.sticky-right": {
        right: 0,
        zIndex: 11,
      },
    },
    actionCell: {
      position: "sticky",
      right: 0,
      backgroundColor: "#fff",
      zIndex: 1,
      boxShadow: "-2px 0px 4px rgba(0, 0, 0, 0.1)",
      gap: theme.spacing(1),
    },
    actionCellHeader: {
      position: "sticky",
      right: 0,
      backgroundColor: "#fff",
      zIndex: 2,
      boxShadow: "-2px 0px 4px rgba(0, 0, 0, 0.1)",
      gap: theme.spacing(1),
    },
    actionButtons: {
      display: "flex",
      gap: theme.spacing(1),
      justifyContent: "flex-start",
      // opacity: 0,
      // transition: 'opacity 0.2s',
      minWidth: "320px",
      flexWrap: "nowrap", // Prevent wrapping
      "& > *": {
        flexShrink: 0, // Prevent icons from shrinking
      },
      "& svg": {
        width: 24,
        height: 24,
        opacity: 0.4,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "& path": {
          fill: "rgba(0, 0, 0, 0.8)",
        },
        "&:hover": {
          opacity: 1,
          "& path": {
            fill: "#06B0F0",
          },
        },
      },
    },
    "& .p-datatable": {
      "& .p-datatable-tbody > tr": {
        "&:hover": {
          backgroundColor: "#f5f5f5 !important",
        },
        "& td": {
          position: "relative",
          verticalAlign: "middle",
        },
      },
      "& .p-datatable-thead > tr > th": {
        verticalAlign: "middle",
      },
      "& .p-datatable-action-buttons": {
        display: "flex",
        gap: theme.spacing(1),
        minWidth: "320px",
        justifyContent: "flex-start",
        "& > *": {
          flexShrink: 0,
        },
      },
    },
    rowHover: {
      "&:hover": {
        backgroundColor: "#f5f5f5",
        "& $actionButtons svg": {
          opacity: 1,
        },
      },
    },
    actionIcon: {
      width: 24,
      height: 24,
      cursor: "pointer",
      transition: "all 0.3s ease",
      opacity: 0.4,
      display: "inline-flex", // Changed from flex to inline-flex
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
      "& path": {
        fill: "#000", //  'rgba(0, 0, 0, 0.4)',
      },
      "&:hover": {
        opacity: 1,
        "& path": {
          fill: "#06B0F0",
        },
      },
      "&.selected": {
        opacity: 1,
        "& path": {
          fill: "#4F95DA",
        },
      },
      "&.active": {
        opacity: 1,
        "& path": {
          fill: "#215F9A",
        },
      },
    },
    disabledIconContainer: {
      opacity: "0.4",
      cursor: "not-allowed",
    },
    disabledIcon: {
      pointerEvents: "none",
      opacity: "0.4",
    },
    headerContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    columnSelector: {
      marginBottom: theme.spacing(2),
      minWidth: 100,
    },
    columnHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    columnTitle: {
      display: "flex",
      alignItems: "center",
    },
    rowNumber: {
      color: "#6c757d",
      fontWeight: 500,
      textAlign: "center",
    },
    headerAction: {
      display: "flex",
      alignItems: "center",
    },
    manageStudyDialog: { maxWidth: 700 },
    cellContent: {
      whiteSpace: "pre-wrap",
      maxWidth: 200,
      overflow: "hidden",
      textOverflow: "ellipsis",
      padding: theme.spacing(1),
    },
    editableInput: {
      width: "100%",
      padding: theme.spacing(1),
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: theme.shape.borderRadius,
      "&:focus": {
        outline: "none",
        borderColor: theme.palette.primary.dark,
      },
    },
    editableSelect: {
      minWidth: 120,
      "& .MuiSelect-root": {
        padding: theme.spacing(1),
      },
    },
  })
)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      position: "fixed",
      top: "100px", // Equivalent to mt={14}
      height: "calc(100vh - 102.2px)",
      left: "140px",
      width: "89%",
      borderRadius: 20,
      padding: "0 5px 0 5px", // Set top padding to 0
      zIndex: 20,
      // overflowY: "auto",
      backgroundColor: "white",
      // padding: theme.spacing(0, 2),
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: "100%",
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
    },
    // tableContainer: {
    //   "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
    //   "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
    //   "& div.MuiInput-underline": {
    //     "& span.material-icons": {
    //       width: 81,
    //       height: 19,
    //       fontSize: 27,
    //       lineHeight: "23PX",
    //       color: "rgba(0, 0, 0, 0.4)",
    //     },
    //     "& button": { display: "none" },
    //   },
    //   [theme.breakpoints.down("sm")]: {
    //     marginBottom: 80,
    //   },
    // },
    tableContainerMobile: {
      // Reset the left property from the parent
      left: "50%",
      // Center using transform
      transform: "translateX(-50%)",
      // Adjust width for mobile view
      width: "98%",
      // Add some margin to account for any potential sidebar
      margin: "0 auto",
      padding: "0 5px 0 5px",
      height: "calc(100vh - 222px)",
    },
    backdrop: {
      zIndex: 111111,
      color: "rgba(255, 255, 255, 0.4)",
    },
    studyMain: {
      background: "#E0E0E0",
      borderRadius: theme.spacing(2), //16,
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: theme.shadows[4],
      },
      marginRight: "11px",
    },
    norecords: {
      "& span": { marginRight: 5 },
    },
    btnWhite: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      marginLeft: "8px",
      margin: theme.spacing(0, 1),
      // minWidth: 120,
      color: "#7599FF",
      "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
    },
    studyDetailsContainer: {
      backgroundColor: "#f5f5f5",
      borderRadius: theme.spacing(1),
      padding: theme.spacing(3),
    },
    statsContainer: {
      backgroundColor: "#fff",
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[1],
    },
    sectionTitle: {
      color: theme.palette.primary.main,
      fontWeight: 600,
      marginBottom: theme.spacing(2),
    },
    detailRow: {
      marginBottom: theme.spacing(2),
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    fileUpload: {
      marginTop: theme.spacing(1),
    },
    actionButtons: {
      display: "flex",
      justifyContent: "flex-end",
      // gap: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
    manageStudyDialog: { maxWidth: 700 },
    "& .p-datatable .p-datatable-tbody > tr > td": {
      padding: "12px 8px",
      verticalAlign: "middle",
    },
    "& .p-datatable .p-datatable-thead > tr > th": {
      padding: "12px 8px",
      verticalAlign: "middle",
    },
    "& .p-datatable .p-datatable-tbody > tr:hover": {
      backgroundColor: "#f5f5f5 !important",
    },
    "& .p-datatable-action-buttons, & .action-buttons-container": {
      display: "flex !important",
      gap: "8px !important",
    },
  })
)

export const ACCESS_LEVELS = {
  VIEW: 1,
  EDIT: 2,
  ALL: 4,
}

export const getResearcherAccessLevel = (study, researcherId) => {
  const researcher = study.sub_researchers?.find((r) => r.ResearcherID === researcherId)
  return researcher?.access_scope || null
}

export const canEditStudy = (study, researcherId) => {
  if (!study.isShared) return true // Owner has full rights
  const accessLevel = getResearcherAccessLevel(study, researcherId)
  return accessLevel === ACCESS_LEVELS.EDIT || accessLevel === ACCESS_LEVELS.ALL
}

export const canViewStudy = (study, researcherId) => {
  if (!study.isShared) return true // Owner has full rights
  const accessLevel = getResearcherAccessLevel(study, researcherId)
  return accessLevel >= ACCESS_LEVELS.VIEW
}

const AddStudy = ({ studies, researcherId, newStudyObj, refreshStudies, updatedDataStudy, ...props }) => {
  const [slideOpen, setSlideOpen] = useState(false)
  const sliderclasses = slideStyles()
  const [addParticipantStudy, setAddParticipantStudy] = useState(false)
  const [addGroup, setAddGroup] = useState(false)
  const [addStudy, setAddStudy] = useState(false)
  const [activeModal, setActiveModal] = useState<"none" | "study" | "group" | "participant">("none")

  const handleSlideOpen = (type: "study" | "group" | "participant") => {
    setSlideOpen(true)
    setActiveModal(type)

    switch (type) {
      case "study":
        setAddStudy(true)
        break
      case "group":
        setAddGroup(true)
        break
      case "participant":
        setAddParticipantStudy(true)
        break
    }
    console.log("handleSlideOpen - clicked with", type)
  }

  const handleClosePopUp = (data) => {
    if (activeModal === "none") {
      setSlideOpen(false)
    }
    if (data === 1) {
      setAddParticipantStudy(false)
      setActiveModal("none")
    } else if (data === 2) {
      setAddStudy(false)
      setActiveModal("none")
    } else {
      setAddGroup(false)
      setActiveModal("none")
    }
  }

  const handleBackdropClick = () => {
    if (activeModal === "none") {
      setSlideOpen(false)
    }
  }

  const handleNewStudyData = (data) => {
    newStudyObj(data)
    updatedDataStudy(data)
    refreshStudies()
  }

  return (
    <div className="add-icon-container">
      <Fab
        className="add-fab-btn"
        onClick={(event) => setSlideOpen(true)}
        style={{ backgroundColor: "#008607", color: "white" }}
      >
        <AddIcon className="add-icon" />
      </Fab>
      {slideOpen &&
        createPortal(
          <>
            <Backdrop className={sliderclasses.backdrop} open={slideOpen} onClick={handleBackdropClick} />
            <Slide direction="left" in={slideOpen} mountOnEnter unmountOnExit>
              <Box className={sliderclasses.slidePanel}>
                <Box className={sliderclasses.icon}>
                  <UserIcon />
                </Box>
                <Typography variant="h6">ADD NEW STUDY</Typography>
                <Divider className={sliderclasses.divider} />
                <Typography variant="body2" paragraph>
                  Studies are <strong>researcher</strong> specific.
                </Typography>
                <Divider className={sliderclasses.divider} />
                <Typography variant="body2" paragraph>
                  Add a new Study under researcher <strong>{props.title}</strong>.
                </Typography>
                <Typography variant="body1" paragraph>
                  If you have decided the Groups for the Study by now, proceed with this.
                </Typography>
                <Button className={sliderclasses.button} onClick={() => handleSlideOpen("participant")}>
                  Add Study & Group
                </Button>
                <Typography variant="body1" paragraph className={sliderclasses.headings}>
                  Or create a Study and add the Groups later.
                </Typography>
                <Button className={sliderclasses.button} onClick={() => handleSlideOpen("study")}>
                  Add a Study
                </Button>
                <Divider className={sliderclasses.divider} />
                <Typography variant="body2" paragraph>
                  Add a new Group under an existing Study.
                </Typography>
                <Button className={sliderclasses.button} onClick={() => handleSlideOpen("group")}>
                  Add a group
                </Button>
              </Box>
            </Slide>{" "}
          </>,
          document.body
        )}
      <StudyGroupCreator
        studies={studies}
        researcherId={researcherId}
        onClose={() => {
          setAddGroup(false)
          handleClosePopUp(3)
        }}
        open={addGroup}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
      <StudyCreator
        studies={studies}
        researcherId={researcherId}
        open={addStudy}
        onclose={() => {
          setAddStudy(false)
          handleClosePopUp(2)
        }}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
      <PatientStudyCreator
        studies={studies}
        researcherId={researcherId}
        onclose={() => {
          setAddParticipantStudy(false)
          handleClosePopUp(1)
        }}
        open={addParticipantStudy}
        handleNewStudy={handleNewStudyData}
        closePopUp={handleClosePopUp}
        resins={props.resins}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        setSlideOpen={setSlideOpen}
      />
    </div>
  )
}

export default function StudiesList({
  title,
  researcherId,
  studies,
  upatedDataStudy,
  deletedDataStudy,
  searchData,
  getAllStudies,
  newAdddeStudy,
  ...props
}) {
  const classes = useStyles()
  const studycardclasses = studycardStyles()
  const { t } = useTranslation()
  const [search, setSearch] = useState(null)
  const [allStudies, setAllStudies] = useState(null)
  const [newStudy, setNewStudy] = useState(null)
  const [sharedStudies, setSharedStudies] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const layoutClasses = useLayoutStyles()
  // const [showDetails, setShowDetails] = useState(false)
  // const [editMode, setEditMode] = useState(false)
  const [editStudyId, setEditStudyId] = useState(false)
  const [expandedStudyId, setExpandedStudyId] = useState(null)
  const toggleStudyDetails = (studyId) => {
    setExpandedStudyId(expandedStudyId === studyId ? null : studyId)
  }
  const editStudyDetails = (studyId) => {
    setEditStudyId(editStudyId === studyId ? null : studyId)
  }
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [formState, setFormState] = useState({})
  const [detailsStudyId, setDetailsStudyId] = useState(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [studyToSuspend, setStudyToSuspend] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [tabularView, setTabularView] = useState(false)
  const [CopyDialogOpen, setCopyDialogOpen] = useState(false)
  const [studyToCopy, setStudyToCopy] = useState(null)
  const [openAPTS, setOpenAPTS] = useState(false)
  const [openASR, setOpenASR] = useState(false)
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [viewingStudy, setViewingStudy] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)
  const [allresearchers, setAllResearchers] = useState([])

  const columnsNames = {
    name: "Study Name",
    description: "Description",
    email: "Email",
    mobile: "Phone/Mobile",
    state: "State",
    purpose: "Study Purpose",
    studyType: "Study Type",
    piInstitution: "PI Institution",
    isShared: "Ownership",
    adminNote: "Admin Notes",
  }
  const originalColumnKeys = Object.keys(columnsNames)
  const visible_columns = {
    name: "Study Name",
    description: "Description",
    email: "Email",
    mobile: "Phone/Mobile",
    state: "State",
    isShared: "Ownership",
  }

  const [selectedColumns, setSelectedColumns] = useState<string[]>(Object.keys(visible_columns))

  const handleOpenSuspendDialog = (study) => {
    setStudyToSuspend(study)
    setSuspendDialogOpen(true)
  }

  const handleCloseSuspendDialog = () => {
    setSuspendDialogOpen(false)
    setStudyToSuspend(null)
  }

  const handleOpenCopyDialog = (study) => {
    setStudyToCopy(study)
    setCopyDialogOpen(true)
  }

  const handleCloseCopyDialog = () => {
    setCopyDialogOpen(false)
    setStudyToCopy(null)
    setActiveButton({ id: null, action: "null" })
  }
  const confirmSuspend = () => {
    if (studyToSuspend) {
      const updatedStudy = {
        ...studyToSuspend,
        timestamps: {
          ...studyToSuspend.timestamps,
          suspendedAt: new Date(),
        },
      }
      handleUpdateStudy(studyToSuspend.id, updatedStudy)
      handleCloseSuspendDialog()
    }
  }

  const confirmCopy = () => {
    if (studyToCopy) {
      // TODO fetchpostdata study clone here
      handleCloseCopyDialog()
    }
  }
  const suspend = (studyid, study) => {
    const updatedStudy = {
      ...study,
      timestamps: {
        ...study.timestamps,
        suspendedAt: new Date(),
      },
    }
    handleUpdateStudy(studyid, updatedStudy)
  }
  const refreshingStudies = async () => {
    setLoading(true)
    await getAllStudies()
    setLoading(false)
  }
  const handleFormChange = (study, field, value) => {
    const updatedForm = {
      ...formState,
      [study.id]: {
        ...(formState[study.id] || study),
        [field]: value,
      },
    }
    setFormState(updatedForm)
  }
  const handleUpdateStudy = async (studyId, updatedStudy) => {
    try {
      const study = allStudies.find((s) => s.id === studyId)
      if (!canEditStudy(study, researcherId)) {
        enqueueSnackbar(t("You don't have permission to update this study"), { variant: "error" })
        return
      }
      setLoading(true)
      LAMP.Study.update(studyId, updatedStudy)
        .then((res) => {
          Service.updateMultipleKeys(
            "studies",
            { studies: [{ id: studyId, ...updatedStudy }] },
            [
              "name",
              "description",
              "purpose",
              "studyType",
              "hasFunding",
              "fundingAgency",
              "hasEthicsPermission",
              "ethicsPermissionDoc",
              "mobile",
              "email",
              "state",
              "piInstitution",
              "collaboratingInstitutions",
              "sub_researchers",
              "timestamps",
              "adminNote",
            ],
            "id"
          )
        })
        .catch((error) => {
          console.log("error updating group to newly created study", error)
        })
      await LAMP.Study.update(studyId, updatedStudy)
      const fieldlist = [
        "name",
        "description",
        "purpose",
        "studyType",
        "hasFunding",
        "fundingAgency",
        "hasEthicsPermission",
        "ethicsPermissionDoc",
        "mobile",
        "email",
        "state",
        "piInstitution",
        "collaboratingInstitutions",
        "timestamps",
        "sub_researchers",
        "adminNote",
      ]
      await Service.updateMultipleKeys("studies", { studies: [{ id: studyId, ...updatedStudy }] }, fieldlist, "id")
      await getAllStudies()
      getAllStudies()
      setEditStudyId(null)
      enqueueSnackbar(t("Study updated successfully"), { variant: "success" })
    } catch (err) {
      enqueueSnackbar(t("Failed to update study: ") + err.message, { variant: "error" })
    }
  }

  const [activeButton, setActiveButton] = useState({ id: null, action: null })
  const [selectedTab, setSelectedTab] = useState({ id: null, tab: null })
  const stats = (study) => {
    return [
      {
        value: study.gname?.length || 0,
        label: "GROUPS",
        color: "#ca74c8",
        key: "groups",
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
    ]
  }

  const getGroupDetails = (study) => {
    const allParticipantsCount = study.participants?.length || 0

    const groups = [
      {
        name: "All Groups Combined",
        desc: "All Patients included in study",
        count: allParticipantsCount,
      },
      ...(study.gname?.map((groupName, index) => ({
        name: `Group ${index + 1}: ${groupName}`,
        desc: index === 0 ? "Control Group" : "Study Group",
        count: study.participants?.filter((participant) => participant.group_name?.includes(groupName)).length || 0,
      })) || []),
    ]
    return groups
  }

  const getSharedStudies = async () => {
    try {
      const sharedStudiesData = await Service.getAll("sharedstudies")
      setSharedStudies(sharedStudiesData || [])
    } catch (error) {
      console.error("Error getting shared studies from ServiceDB:", error)
      setSharedStudies([])
    }
  }

  useInterval(
    () => {
      console.log("loading.. recurring")
      setLoading(true)
      getAllStudies()
      setLoading(false)
    },
    // studies !== null && (studies || []).length > 0 ? null : 60000,
    (!studies || studies.length === 0) && (!props.sharedstudies || props.sharedstudies.length === 0) ? 1000 : null,
    true
  )

  useEffect(() => {
    getAllStudies()
    newAdddeStudy(newStudy)
    getSharedStudies()
  }, [newStudy])

  useEffect(() => {
    combineStudies()
  }, [studies, sharedStudies])

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
        const response = await fetchGetData(authString, `researcher/others/list`, "researcher")
        setAllResearchers(response.data)
      } catch (error) {
        console.error("Error fetching researchers:", error)
      }
    }

    fetchResearchers()
  }, [])

  const getparent = (parent) => {
    const researcher = allresearchers.find((r) => r.id === parent)
    return researcher ? researcher.name : parent
    // fallback to ID if name not found
  }
  const combineStudies = () => {
    const combinedStudies = [...(studies || []).map((study) => ({ ...study, isShared: false })), ...sharedStudies]
    setAllStudies(combinedStudies)
  }
  const searchFilterStudies = async () => {
    if (!!search && search !== "") {
      const studiesList = await Service.getAll("studies")
      const sharedStudiesList = await Service.getAll("sharedstudies")
      const allStudiesList = [
        ...(studiesList || []).map((study) => ({ ...study, isShared: false })),
        ...(sharedStudiesList || []),
      ]
      let newStudies = allStudiesList.filter((i) => i.name?.toLowerCase()?.includes(search?.toLowerCase()))
      setAllStudies(newStudies)
    } else {
      getAllStudies()
      combineStudies()
    }
    setLoading(false)
  }

  useEffect(() => {
    if (allStudies !== null) setLoading(false)
  }, [allStudies])

  useEffect(() => {
    searchFilterStudies()
  }, [search])

  const handleUpdatedStudyObject = (data) => {
    setAllStudies((prevStudies) => {
      const updatedStudies = [...(prevStudies || []), { ...newStudy, isShared: false }]
      return updatedStudies
    })
    upatedDataStudy(data)
  }

  const handleDeletedStudy = (data) => {
    deletedDataStudy(data)
    searchData(search)
  }

  const handleSearchData = (val) => {
    setSearch(val)
  }

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "Not available"
  }

  const [columns, setColumns] = useState<CommonTableColumn[]>([
    {
      id: "id",
      label: "Study ID",
      value: (s) => s.id,
      visible: false,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "name",
      label: "Study Name",
      value: (s) => s.name,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "description",
      label: "Description",
      value: (s) => s.description || "-",
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "email",
      label: "Email",
      value: (s) => s.email,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "mobile",
      label: "Phone/Mobile",
      value: (s) => s.mobile,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "state",
      label: "State",
      value: (s) => s.state,
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "purpose",
      label: "Study Purpose",
      value: (s) => s.purpose || "-",
      visible: false,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "studyType",
      label: "Study Type",
      value: (s) => s.studyType || "-",
      visible: false,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "piInstitution",
      label: "PI Institution",
      value: (s) => s.piInstitution || "-",
      visible: false,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "isShared",
      label: "Ownership",
      value: (s) => (s.isShared ? `${getparent(s.parent)}` : "Owner"),
      visible: true,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      id: "adminNote",
      label: "Admin Notes",
      value: (s) => s.adminNote || "-",
      visible: false,
      sortable: true,
      filterable: true,
      filterType: "text",
    },
  ])

  const [openAddResearcherDialog, setOpenAddResearcherDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedStudyForDialog, setSelectedStudyForDialog] = useState(null)
  const [dialogType, setDialogType] = useState(null)

  const handleOpenDialog = (study, type) => {
    setSelectedStudyForDialog(study)
    setDialogType(type)
  }

  useEffect(() => {
    console.log(selectedStudyForDialog, dialogType)
    if (selectedStudyForDialog && dialogType) {
      if (dialogType === "delete") {
        setOpenDeleteDialog(true)
      } else if (dialogType === "addResearcher") {
        setOpenAddResearcherDialog(true)
      }
    }
  }, [selectedStudyForDialog, dialogType])

  const handleCloseDialog = () => {
    console.log("closed")
    setOpenDeleteDialog(false)
    setOpenAddResearcherDialog(false)
    setSelectedStudyForDialog(null)
    setDialogType(null)
    setActiveButton({ id: null, action: null })
  }

  const handleParticipantAdded = (newParticipant) => {
    // Optional: Perform any actions after participant is added
    // enqueueSnackbar("Participant added successfully", { variant: "success" })
    // Optionally refresh studies or participants
    getAllStudies()
    setSelectedStudyForDialog(null)
    setActiveButton({ id: null, action: null })
  }
  const originalIndexMap = useMemo(() => {
    return (allStudies || []).reduce((acc, study, index) => {
      acc[study.id] = index
      return acc
    }, {})
  }, [allStudies])

  const handleViewStudy = (study) => {
    if (!canViewStudy(study, researcherId)) {
      enqueueSnackbar(t("You don't have permission to view this study"), { variant: "error" })
      return
    }
    console.log(study)
    setViewingStudy(study)
    setIsEditing(false)
    setTriggerSave(false)
  }

  const handleCloseViewStudy = () => {
    setViewingStudy(null)
    setIsEditing(false)
    setTriggerSave(false)
    setActiveButton({ id: null, action: null })
  }

  const handleEditStudy = () => {
    if (!viewingStudy || !canEditStudy(viewingStudy, researcherId)) {
      enqueueSnackbar(t("You don't have permission to edit this study"), { variant: "error" })
      return
    }

    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTriggerSave(false)
    }
  }

  const handleSaveStudy = () => {
    if (!viewingStudy || !canEditStudy(viewingStudy, researcherId)) {
      enqueueSnackbar(t("You don't have permission to save changes to this study"), { variant: "error" })
      return
    }
    setTriggerSave(true)
  }

  const handleSaveComplete = (updatedStudy) => {
    setViewingStudy(updatedStudy)
    setIsEditing(false)
    setTriggerSave(false)
    searchFilterStudies()
  }

  const TableView_Mod = () => {
    const [sortConfig, setSortConfig] = useState({ field: null, direction: null })
    const [selectedRows, setSelectedRows] = useState([])
    const classes = useModularTableStyles()
    const currentStudy = expandedStudyId ? allStudies?.find((s) => s.id === expandedStudyId) : null
    const [editingStudy, setEditingStudy] = useState(null)
    const [editedData, setEditedData] = useState({})
    // const [isEditing, setIsEditing] = useState(false)
    // const [editedValues, setEditedValues] = useState({})
    const [filters, setFilters] = useState({})
    useEffect(() => {
      setEditedData({ inital: "empty" })
      console.warn("initial editedData set to empty")
    }, [])
    useEffect(() => {
      console.log("editedData changed:", editedData)
    }, [editedData])

    const editableColumns = [
      "name",
      "description",
      "email",
      "mobile",
      "purpose",
      "studyType",
      "state",
      "piInstitution",
      "adminNote",
    ]
    const fieldConfigs = {
      purpose: {
        type: "select",
        options: [
          { value: "practice", label: t("Practice") },
          { value: "support", label: t("Support") },
          { value: "research", label: t("Research") },
          { value: "other", label: t("Other") },
        ],
      },
      studyType: {
        type: "select",
        options: [
          { value: "DE", label: t("Descriptive") },
          { value: "CC", label: t("Case Control") },
          { value: "CO", label: t("Cohort") },
          { value: "OB", label: t("Observational") },
          { value: "RCT", label: t("RCTs") },
          { value: "OC", label: t("Other Clinical trials") },
        ],
      },
      state: {
        type: "select",
        options: [
          { value: "production", label: "Production" },
          { value: "development", label: "Development" },
        ],
      },
      // adminNote: {
      //   type: "multiline"
      // },
      description: {
        type: "multiline",
      },
    }

    const handleEditClick = (study) => {
      console.log("handleEditClick from study", study)
      if (activeButton.id === study.id && activeButton.action === "edit") {
        // If clicking edit on currently editing study, cancel edit mode
        setEditingStudy(null)
        setEditedData({})
        setActiveButton({ id: null, action: null })
      } else {
        // Start editing new study
        setEditingStudy(study)
        // setEditedData({})
        setActiveButton({ id: study.id, action: "edit" })
      }
    }

    const handleSaveClick = async (study) => {
      if (Object.keys(editedData).length > 0) {
        const errors = validateFields(editedData)

        if (errors.length > 0) {
          errors.forEach((error) => {
            enqueueSnackbar(error, { variant: "error" })
          })
          return
        }

        const updatedStudy = {
          ...study,
          ...editedData,
        }

        await handleUpdateStudy(study.id, updatedStudy)
        setEditingStudy(null)
        setEditedData({})
        setActiveButton({ id: null, action: null })
      }
    }

    // const handleCellValueChange = (studyId, field, value) => {
    //   setEditedValues(prev => ({
    //     ...prev,
    //     [field]: value
    //   }))
    // }

    const formatValue = (value: any, key: string) => {
      if (!value) return "--"
      if (typeof value === "string") {
        const words = value.split(" ")
        return words.length > 3 ? (
          <>
            {words.slice(0, 3).join(" ")} <br /> {words.slice(3).join(" ")}
          </>
        ) : (
          value
        )
      }
      return value
    }

    // const handleCellEdit = (rowIndex: number, columnKey: string, value: any) => {
    //   setEditedData((prev) => ({
    //     ...prev,
    //     [`${rowIndex}-${columnKey}`]: value,
    //   }))
    //   setIsEditing(true)
    // }

    const validateFields = (data) => {
      const errors = []

      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Invalid email format")
      }

      if (data.mobile && !/^\+?[\d\s-]{10,}$/.test(data.mobile)) {
        errors.push("Invalid phone number format")
      }

      return errors
    }

    const initFilters = () => {
      const baseFilters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }

      columns.forEach((col) => {
        baseFilters[col.id] = { value: null, matchMode: FilterMatchMode.CONTAINS }
      })

      return baseFilters
    }

    const filterMatchModeOptions = [
      { label: "Contains", value: FilterMatchMode.CONTAINS },
      { label: "Equals", value: FilterMatchMode.EQUALS },
      { label: "Starts With", value: FilterMatchMode.STARTS_WITH },
      { label: "Ends With", value: FilterMatchMode.ENDS_WITH },
    ]

    useEffect(() => {
      setFilters(initFilters())
    }, [])

    const renderCell = (column: any, row: any) => {
      const hasEditAccess = canEditStudy(row, researcherId)
      console.log("hasEditAccess", hasEditAccess)
      const columnKey = column.id
      const value = column.value(row)
      if (columnKey === "isShared") {
        return (
          <div>
            {row.isShared ? (
              <span className="p-tag p-tag-info p-tag-rounded">
                {`${getparent(row.parent)}(${getAccessLevelLabel(getResearcherAccessLevel(row, researcherId))})`}
              </span>
            ) : (
              "Owner"
            )}
          </div>
        )
      }
      // Check if this cell should be editable
      const isEditable =
        editableColumns.includes(columnKey) &&
        activeButton.action === "edit" &&
        activeButton.id === row.id &&
        hasEditAccess
      // const isEditable = editableColumns.includes(columnKey) &&
      // activeButton.id === row.id &&
      // activeButton.action === "edit" &&
      // editingStudy?.id === row.id

      if (!isEditable) {
        return <div>{formatValue(value, columnKey)}</div>
      }

      const fieldConfig = fieldConfigs[columnKey]

      if (fieldConfig?.type === "select") {
        return (
          <Dropdown
            value={editedData[columnKey] ?? value}
            onChange={(e) => {
              setEditedData((prev) => ({
                ...prev,
                [columnKey]: e.value,
              }))
            }}
            options={fieldConfig.options}
            optionLabel="label"
            optionValue="value"
            className="w-full"
          ></Dropdown>
        )
      }

      if (fieldConfig?.type === "multiline") {
        return (
          <InputTextarea
            rows={2}
            value={editedData[columnKey] ?? value}
            onChange={(e) => {
              setEditedData((prev) => ({
                ...prev,
                [columnKey]: e.target.value,
              }))
            }}
            className="w-full"
          />
        )
      }

      return (
        <InputText
          value={editedData[columnKey] ?? value}
          onChange={(e) => {
            console.log("InputText changed", e.target.value, columnKey, "editedData:", editedData, "value:", value)
            setEditedData((prev) => ({
              ...prev,
              [columnKey]: e.target.value,
            }))
          }}
          className="w-full"
        />
      )
    }

    const sortedData = useMemo(() => {
      if (!allStudies) return []

      const sortableData = [...allStudies]
      if (sortConfig.field === "index") {
        sortableData.sort((a, b) => {
          const aIndex = originalIndexMap[a.id]
          const bIndex = originalIndexMap[b.id]
          return sortConfig.direction === "asc" ? aIndex - bIndex : bIndex - aIndex
        })
      } else if (sortConfig.field) {
        sortableData.sort((a, b) => {
          const aValue = a[sortConfig.field] || ""
          const bValue = b[sortConfig.field] || ""

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
          }

          return sortConfig.direction === "asc" ? (aValue > bValue ? 1 : -1) : bValue > aValue ? 1 : -1
        })
      }
      return sortableData
    }, [allStudies, sortConfig, originalIndexMap])

    const actions = (study) => (
      <div className="action-buttons-container" style={{ display: "flex", gap: "8px" }}>
        <span className={`${classes.actionIcon} action-icon-view`}>
          {expandedStudyId === study.id ? (
            <ViewIcon
              className="selected"
              onClick={() => {
                setActiveButton({ id: study.id, action: "view" })
                // toggleStudyDetails(study.id)
                handleViewStudy(study)
              }}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <ViewIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "view" })
                // toggleStudyDetails(study.id)
                handleViewStudy(study)
              }}
              style={{ cursor: "pointer" }}
            />
          )}
        </span>
        <span className={`${classes.actionIcon} action-icon-copy`}>
          {activeButton.id === study.id && activeButton.action === "copy" ? (
            <CopyFilledIcon
              className="active"
              onClick={() => {
                setActiveButton({ id: study.id, action: "copy" })
                handleOpenCopyDialog(study)
              }}
              style={{ cursor: "pointer", width: 24, height: 24 }}
            />
          ) : (
            <CopyIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "copy" })
                handleOpenCopyDialog(study)
              }}
              style={{ cursor: "pointer", width: 24, height: 24 }}
            />
          )}
        </span>
        {canEditStudy(study, researcherId) && (
          <>
            <span className={`${classes.actionIcon} action-icon-edit`}>
              {activeButton.id === study.id && activeButton.action === "edit" ? (
                <EditFilledIcon
                  className="active"
                  onClick={() => {
                    handleEditClick(study)
                  }}
                />
              ) : (
                <EditIcon
                  onClick={() => {
                    handleEditClick(study)
                  }}
                />
              )}
            </span>
            <span className={`${classes.actionIcon} action-icon-save`}>
              {activeButton.id === study.id && activeButton.action === "save" ? (
                <SaveFilledIcon
                  className="active"
                  onClick={() => {
                    setActiveButton({ id: study.id, action: "save" })
                    if (Object.keys(editedData).length > 0) {
                      handleSaveClick(study)
                    } else {
                      enqueueSnackbar("No changes made for updating.", { variant: "info", autoHideDuration: 1000 })
                    }
                    setActiveButton({ id: null, action: null })
                  }}
                />
              ) : (
                <SaveIcon
                  className={!Object.keys(editedData).length ? classes.disabledIcon : ""}
                  onClick={() => {
                    setActiveButton({ id: study.id, action: "save" })
                    if (Object.keys(editedData).length > 0) {
                      handleSaveClick(study)
                    } else {
                      enqueueSnackbar("No changes made for updating.", { variant: "info", autoHideDuration: 1000 })
                    }
                    setActiveButton({ id: null, action: null })
                  }}
                />
              )}
            </span>
          </>
        )}
        {canEditStudy(study, researcherId) && (
          <>
            <span className={`${classes.actionIcon} action-icon-suspend`}>
              {studyToSuspend?.id === study.id ? (
                <SuspendFilledIcon
                  className="selected"
                  onClick={() => {
                    setActiveButton({ id: study.id, action: "suspend" })
                    handleOpenSuspendDialog(study)
                  }}
                  style={{ cursor: "pointer", width: 24, height: 24 }}
                />
              ) : (
                <SuspendIcon
                  onClick={() => {
                    setActiveButton({ id: study.id, action: "suspend" })
                    handleOpenSuspendDialog(study)
                  }}
                  style={{ cursor: "pointer", width: 24, height: 24 }}
                />
              )}
            </span>
          </>
        )}
        {!study.isShared && (
          <span className={`${classes.actionIcon} action-icon-delete`}>
            <DeleteIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "delete" })
                handleOpenDialog(study, "delete")
              }}
            />
          </span>
        )}

        <span className={`${classes.actionIcon} action-icon-share`}>
          {props.activeButton?.id === study.id && props.activeButton?.action === "share" ? (
            <SRAddFilledIcon
              className="active"
              onClick={() => {
                setActiveButton({ id: study.id, action: "share" })
                setSelectedStudyForDialog(study)
                setOpenASR(true)
              }}
            />
          ) : (
            <SRAddIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "share" })
                setSelectedStudyForDialog(study)
                setOpenASR(true)
              }}
            />
          )}
        </span>
        <span className={`${classes.actionIcon} action-icon-add-participant`}>
          {props.activeButton?.id === study.id && props.activeButton?.action === "add_participant" ? (
            <UserAddFilledIcon
              className="active"
              onClick={() => {
                setActiveButton({ id: study.id, action: "add_participant" })
                setSelectedStudyForDialog(study)
                setOpenAPTS(true)
              }}
            />
          ) : (
            <UserAddIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "add_participant" })
                setSelectedStudyForDialog(study)
                setOpenAPTS(true)
              }}
            />
          )}
        </span>
      </div>
    )
    const categorizeItems = (items) => {
      return {
        "My Studies": items.filter((s) => !s.isShared),
        "Shared Studies": items.filter((s) => s.isShared),
      }
    }
    return (
      <>
        <CommonTable
          data={sortedData || allStudies || []}
          columns={columns.filter((col) => col.visible)}
          actions={actions}
          selectable={true}
          selectedRows={selectedRows}
          onSelectRow={(id) => {
            setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }}
          onSelectAll={() => {
            setSelectedRows((prev) => (prev.length === allStudies.length ? [] : allStudies.map((s) => s.id)))
          }}
          sortConfig={sortConfig}
          onSort={(field) => {
            console.log("sorting at", field, sortConfig)
            setSortConfig({
              field,
              direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
            })
          }}
          indexmap={originalIndexMap}
          renderCell={renderCell}
          // editingStudy={editingStudy}
          activeButton={activeButton}
          showCategoryHeaders={false}
          // categorizeItems={categorizeItems}
          categorizeItems={null}
          filters={filters}
          onFilter={(newFilters) => setFilters(newFilters)}
          filterDisplay="menu"
          filterMatchModeOptions={filterMatchModeOptions}
        />
        {selectedStudyForDialog && (
          <DeleteStudy
            study={selectedStudyForDialog}
            deletedStudy={handleDeletedStudy}
            researcherId={researcherId}
            setActiveButton={setActiveButton}
            open={openDeleteDialog}
            onClose={handleCloseDialog}
            // open={dialogType=="delete"}
            // onClose={() => {
            //   setOpenDeleteDialog(false);
            //   setSelectedStudyForDialog(null);
            //   setActiveButton({ id: null, action: null });
            // }}
            viewMode={tabularView}
          />
        )}
        {selectedStudyForDialog && (
          <AddSubResearcher
            study={selectedStudyForDialog}
            upatedDataStudy={handleUpdatedStudyObject}
            researcherId={researcherId}
            handleShareUpdate={(studyid, updatedStudy) => handleUpdateStudy(studyid, updatedStudy)}
            setActiveButton={setActiveButton}
            activeButton={activeButton}
            open={openASR}
            onclose={() => {
              setOpenASR(false)
              setActiveButton({ id: null, action: null })
            }}
          />
        )}
        {selectedStudyForDialog && (
          <AddParticipantToStudy
            study={selectedStudyForDialog}
            researcherId={researcherId}
            onParticipantAdded={handleParticipantAdded}
            title={props.ptitle}
            resemail={props.resemail}
            open={openAPTS}
            onclose={() => {
              setOpenAPTS(false)
              setActiveButton({ id: null, action: null })
              refreshingStudies()
              getAllStudies()
            }}
          />
        )}
        <Dialog
          open={suspendDialogOpen}
          onClose={handleCloseSuspendDialog}
          scroll="paper"
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
          classes={{ paper: classes.manageStudyDialog }}
        >
          <DialogTitle>Suspend Study</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to suspend the study "{studyToSuspend?.name}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSuspendDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={confirmSuspend} color="primary">
              Suspend
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={CopyDialogOpen}
          onClose={handleCloseCopyDialog}
          scroll="paper"
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
          classes={{ paper: classes.manageStudyDialog }}
        >
          <DialogTitle>Copy Study</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to copy the study "{studyToCopy?.name}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCopyDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={confirmCopy} color="primary">
              Copy
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || allStudies === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {viewingStudy ? (
        <Header
          authType={LAMP.Auth._type}
          title={props.ptitle}
          pageLocation={`${props.ptitle} > Studies > ${viewingStudy.name}`}
        />
      ) : (
        // <ItemViewHeader
        //   ItemTitle="Study"
        //   ItemName={viewingStudy.name}
        //   searchData={handleSearchData}
        //   authType={props.authType}
        //   onEdit={handleEditStudy}
        //   onSave={() => {
        //     if (isEditing) {
        //       handleSaveStudy()
        //     }
        //   }}
        //   onPrevious={() => {
        //     const currentIndex = allStudies.findIndex((s) => s.id === viewingStudy.id)
        //     if (currentIndex > 0) {
        //       const previousStudy = allStudies[currentIndex - 1]
        //       if (canViewStudy(previousStudy, researcherId)) {
        //         setViewingStudy(allStudies[currentIndex - 1])
        //       } else {
        //         enqueueSnackbar(t("You don't have permission to view this study"), { variant: "error" })
        //       }
        //     }
        //   }}
        //   onNext={() => {
        //     const currentIndex = allStudies.findIndex((s) => s.id === viewingStudy.id)
        //     if (currentIndex < allStudies.length - 1) {
        //       const nextStudy = allStudies[currentIndex + 1]
        //       if (canViewStudy(nextStudy, researcherId)) {
        //         setViewingStudy(allStudies[currentIndex + 1])
        //       } else {
        //         enqueueSnackbar(t("You don't have permission to view this study"), { variant: "error" })
        //       }
        //     }
        //   }}
        //   onClose={handleCloseViewStudy}
        //   disabledBtns={!canEditStudy(viewingStudy, researcherId)}
        // />
        <Header authType={LAMP.Auth._type} title={props.ptitle} pageLocation={`${props.ptitle} > Studies`} />
        // <Header
        //   studies={allStudies ?? null}
        //   researcherId={researcherId}
        //   searchData={handleSearchData}
        //   setParticipants={searchFilterStudies}
        //   newStudyObj={setNewStudy}
        //   updatedDataStudy={handleUpdatedStudyObject}
        //   title={props.ptitle}
        //   authType={props.authType}
        //   onLogout={props.onLogout}
        //   onViewModechanged={setViewMode}
        //   viewMode={viewMode}
        //   resins={props.resins}
        //   VisibleColumns={columns}
        //   setVisibleColumns={setColumns}
        //   refreshStudies={refreshingStudies}
        // />
      )}
      {viewingStudy ? (
        <div className="body-container">
          <ActionsComponent
            actions={["edit", "save", "left", "right", "cancel"]}
            onEdit={handleEditStudy}
            onSave={() => {
              if (isEditing) {
                handleSaveStudy()
              }
            }}
            onPrevious={() => {
              const currentIndex = allStudies.findIndex((s) => s.id === viewingStudy.id)
              if (currentIndex > 0) {
                const previousStudy = allStudies[currentIndex - 1]
                if (canViewStudy(previousStudy, researcherId)) {
                  setViewingStudy(allStudies[currentIndex - 1])
                } else {
                  enqueueSnackbar(t("You don't have permission to view this study"), { variant: "error" })
                }
              }
            }}
            onNext={() => {
              const currentIndex = allStudies.findIndex((s) => s.id === viewingStudy.id)
              if (currentIndex < allStudies.length - 1) {
                const nextStudy = allStudies[currentIndex + 1]
                if (canViewStudy(nextStudy, researcherId)) {
                  setViewingStudy(allStudies[currentIndex + 1])
                } else {
                  enqueueSnackbar(t("You don't have permission to view this study"), { variant: "error" })
                }
              }
            }}
            onClose={handleCloseViewStudy}
          />
          <StudyDetailItem
            study={viewingStudy}
            isEditing={isEditing}
            onSave={handleSaveComplete}
            researcherId={researcherId}
            triggerSave={triggerSave}
          />
        </div>
      ) : (
        <div className="body-container">
          <ActionsComponent
            searchData={handleSearchData}
            refreshElements={refreshingStudies}
            setSelectedColumns={setColumns}
            VisibleColumns={columns}
            setVisibleColumns={setColumns}
            addComponent={
              <AddStudy
                researcherId={researcherId}
                studies={allStudies ?? null}
                newStudyObj={setNewStudy}
                refreshStudies={searchFilterStudies}
                updatedDataStudy={handleUpdatedStudyObject}
              />
            }
            actions={["refresh", "search", "grid", "table", "download"]}
            tabularView={tabularView}
            setTabularView={setTabularView}
            studies={allStudies ?? null}
            downloadTarget={"studies"}
          />
          {!tabularView ? (
            <div className="content-container" style={{ overflow: "auto" }}>
              <Grid container spacing={3} className="cards-grid">
                {allStudies !== null && (allStudies || []).length > 0 ? (
                  (allStudies || []).map((study) => (
                    <Grid item lg={4} md={6} xs={12} key={study.id}>
                      <Paper className={studycardclasses.dhrCard} elevation={3}>
                        <Box display={"flex"} flexDirection={"row"}>
                          <Box flexGrow={1}>
                            <Typography className={studycardclasses.cardTitle}>
                              {study.name || "No Name provided."}
                            </Typography>
                            {study.isShared && (
                              <Chip
                                label={`Shared by ${getparent(study.parent)}(${getAccessLevelLabel(
                                  getResearcherAccessLevel(study, researcherId)
                                )})`}
                                size="small"
                                style={{
                                  backgroundColor: "#E3F2FD",
                                  color: "#1976D2",
                                  margin: "4px 0",
                                }}
                              />
                            )}
                          </Box>
                          <div className={studycardclasses.stateChip}>
                            {study.timestamps?.deletedAt && <DeletedIcon />}
                            {study.timestamps?.suspendedAt && <SuspendedIcon />}
                            {!study.timestamps?.deletedAt && !study.timestamps?.suspendedAt && (
                              <div
                                className={`${studycardclasses.stateIndicator} ${
                                  study.state === "production" ? "production" : ""
                                }`}
                              >
                                {study.state}
                              </div>
                            )}
                          </div>
                        </Box>
                        <Divider className={studycardclasses.titleDivider} />
                        <Typography className={studycardclasses.cardSubtitle}>
                          {`SID ${study.id} - ${study.description || "No Description provided."}`}
                        </Typography>
                        <Typography className={studycardclasses.cardMetadata}>
                          {`Participants: ${study.participants?.length || 0} | Start: ${formatDate_alph(
                            study.timestamp
                          )} | Shared: ${study.sub_researchers?.length || 0}`}
                        </Typography>

                        <Grid container className={studycardclasses.statsGrid}>
                          {stats(study).map((stat) => (
                            <Grid
                              item
                              xs={3}
                              key={stat.key}
                              className={`${studycardclasses.statItem} ${
                                selectedTab.id === study.id && selectedTab.tab === stat.key ? "selected" : ""
                              }`}
                              onClick={() => {
                                selectedTab.id === study.id && selectedTab.tab === stat.key
                                  ? setSelectedTab({ id: null, tab: null })
                                  : setSelectedTab({ id: study.id, tab: stat.key })
                              }}
                            >
                              <Typography className={studycardclasses.statNumber} style={{ color: stat.color }}>
                                {stat.value}
                              </Typography>
                              <Typography className={studycardclasses.statLabel}>{stat.label}</Typography>
                            </Grid>
                          ))}
                        </Grid>
                        {selectedTab.id === study.id && <Divider className={studycardclasses.gridDivider} />}
                        {selectedTab.id === study.id && selectedTab.tab === "groups" && (
                          <Box className={studycardclasses.groupList}>
                            {getGroupDetails(study).map((group, index) => (
                              <Box key={index} className={studycardclasses.groupItem}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography className={studycardclasses.groupName}>{group.name}</Typography>
                                    <Typography className={studycardclasses.groupDesc}>{group.desc}</Typography>
                                  </Box>
                                  <Typography className={studycardclasses.groupCount}>{group.count}</Typography>
                                  <Typography className={studycardclasses.groupitem}>Participants</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                        {/* {selectedTab.id === study.id && selectedTab.tab === "assessments" && (
                            <Box className={studycardclasses.groupList}>
                              {study.activities
                                ?.filter((a) => a.category?.includes("assess"))
                                .map((assessment, index) => (
                                  <Box key={index} className={studycardclasses.groupItem}>
                                    <Typography className={studycardclasses.groupName}>{assessment.name}</Typography>
                                    <Typography className={studycardclasses.groupDesc}>{assessment.spec}</Typography>
                                    <Typography className={studycardclasses.groupDesc}>Frequency : </Typography>
                                    <Typography className={studycardclasses.groupDesc}>Last use :</Typography>
                                    <Typography className={studycardclasses.groupDesc}>total times completed : </Typography>
                                  </Box>
                                ))}
                            </Box>
                          )} */}
                        {selectedTab.id === study.id && selectedTab.tab === "assessments" && (
                          <Box className={studycardclasses.groupList}>
                            {study.assessments?.length > 0 ? (
                              study.assessments
                                // ?.filter((a) => a.category?.includes("assess"))
                                .map((assessment, index) => (
                                  <Box key={index} className={studycardclasses.groupItem}>
                                    <Typography className={studycardclasses.groupName}>
                                      {assessment.name} [ID-{assessment.id}]: {assessment.spec}
                                    </Typography>
                                    <ul className={studycardclasses.bulletList}>
                                      <li>
                                        <Typography className={studycardclasses.groupDesc}>
                                          Frequency: {assessment.frequency || "Every Day"}
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography className={studycardclasses.groupDesc}>
                                          Total times completed: {assessment.completedCount || 0}
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography className={studycardclasses.groupDesc}>
                                          Last Use: {assessment.lastUse || "Never"}
                                        </Typography>
                                      </li>
                                    </ul>
                                  </Box>
                                ))
                            ) : (
                              <Typography>No Assessments present at this moment.</Typography>
                            )}
                          </Box>
                        )}
                        {/* {selectedTab.id === study.id && selectedTab.tab === "activities" && (
                            <Box className={studycardclasses.groupList}>
                              {study.activities?.map((activity, index) => (
                                <Box key={index} className={studycardclasses.groupItem}>
                                  <Typography className={studycardclasses.groupName}>{activity.name}</Typography>
                                  <Typography className={studycardclasses.groupDesc}>{activity.spec}</Typography>
                                  <Typography className={studycardclasses.groupDesc}>Frequency : </Typography>
                                  <Typography className={studycardclasses.groupDesc}>Last use :</Typography>
                                  <Typography className={studycardclasses.groupDesc}>total times completed : </Typography>
                                </Box>
                              ))}
                            </Box>
                          )} */}
                        {selectedTab.id === study.id && selectedTab.tab === "activities" && (
                          <Box className={studycardclasses.groupList}>
                            {study.activities?.length > 0 ? (
                              study.activities?.map((activity, index) => (
                                <Box key={index} className={studycardclasses.groupItem}>
                                  <Typography className={studycardclasses.groupName}>
                                    {activity.name} [ID-{activity.id}]: {activity.spec}
                                  </Typography>
                                  <ul className={studycardclasses.bulletList}>
                                    <li>
                                      <Typography className={studycardclasses.groupDesc}>
                                        Frequency: {getItemFrequency(activity, "activities")}
                                      </Typography>
                                    </li>
                                    <li>
                                      <Typography className={studycardclasses.groupDesc}>
                                        Total times completed: {activity.completedCount || 0}
                                      </Typography>
                                    </li>
                                    <li>
                                      <Typography className={studycardclasses.groupDesc}>
                                        Last Use: {formatLastUse(activity.lastUse) || "Never"}
                                      </Typography>
                                    </li>
                                  </ul>
                                </Box>
                              ))
                            ) : (
                              <Typography>No Activities present at this moment.</Typography>
                            )}
                          </Box>
                        )}
                        {/* {selectedTab.id === study.id && selectedTab.tab === "sensors" && (
                            <Box className={studycardclasses.groupList}>
                              {study.sensors?.map((sensor, index) => (
                                <Box key={index} className={studycardclasses.groupItem}>
                                  <Typography className={studycardclasses.groupName}>{sensor.name}</Typography>
                                  <Typography className={studycardclasses.groupDesc}>{sensor.spec}</Typography>
                                  <Typography className={studycardclasses.groupDesc}>Frequency : {sensor.settings?.frequency || "NA"}</Typography>
                                  <Typography className={studycardclasses.groupDesc}>Last use :</Typography>
                                </Box>
                              ))}
                            </Box>
                          )} */}
                        {selectedTab.id === study.id && selectedTab.tab === "sensors" && (
                          <Box className={studycardclasses.groupList}>
                            {study.sensors?.length > 0 ? (
                              study.sensors?.map((sensor, index) => (
                                <Box key={index} className={studycardclasses.groupItem}>
                                  <Typography className={studycardclasses.groupName}>
                                    {sensor.name} [ID-{sensor.id}]: {sensor.spec}
                                  </Typography>
                                  <ul className={studycardclasses.bulletList}>
                                    <li>
                                      <Typography className={studycardclasses.groupDesc}>
                                        Frequency: {getItemFrequency(sensor, "sensors")}
                                      </Typography>
                                    </li>
                                    <li>
                                      <Typography className={studycardclasses.groupDesc}>
                                        Last Use: {formatLastUse(sensor.lastUse) || "Never"}
                                      </Typography>
                                    </li>
                                  </ul>
                                </Box>
                              ))
                            ) : (
                              <Typography>No Sensors present at this moment.</Typography>
                            )}
                          </Box>
                        )}
                        <Box className={studycardclasses.actionButtons}>
                          {expandedStudyId === study.id ? (
                            <ViewIcon
                              className={`${studycardclasses.actionIcon} selected`}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "view" })
                                // toggleStudyDetails(study.id)
                                handleViewStudy(study)
                              }}
                            />
                          ) : (
                            <ViewIcon
                              className={studycardclasses.actionIcon}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "view" })
                                // toggleStudyDetails(study.id)
                                handleViewStudy(study)
                              }}
                            />
                          )}
                          {activeButton.id === study.id && activeButton.action === "copy" ? (
                            <CopyFilledIcon
                              className={`${studycardclasses.actionIcon} active`}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "copy" })
                                handleOpenCopyDialog(study)
                              }}
                            />
                          ) : (
                            <CopyIcon
                              className={`${studycardclasses.actionIcon} ${
                                activeButton.id === study.id && activeButton.action === "copy" ? "active" : ""
                              }`}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "copy" })
                                handleOpenCopyDialog(study)
                              }}
                            />
                          )}
                          {canEditStudy(study, researcherId) && (
                            <>
                              {studyToSuspend?.id === study.id ? (
                                <SuspendFilledIcon
                                  className={`${studycardclasses.actionIcon} selected`}
                                  onClick={() => {
                                    setActiveButton({ id: study.id, action: "suspend" })
                                    handleOpenSuspendDialog(study)
                                  }}
                                />
                              ) : (
                                <SuspendIcon
                                  className={`${studycardclasses.actionIcon} ${
                                    studyToSuspend?.id === study.id ? "selected" : ""
                                  }`}
                                  onClick={() => {
                                    setActiveButton({ id: study.id, action: "suspend" })
                                    handleOpenSuspendDialog(study)
                                  }}
                                />
                              )}
                            </>
                          )}
                          {/* {props.authType == "admin" && ( */}
                          {!study.isShared && (
                            <DeleteStudy
                              study={study}
                              deletedStudy={handleDeletedStudy}
                              researcherId={researcherId}
                              setActiveButton={setActiveButton}
                            />
                          )}
                          {activeButton.id === study.id && activeButton.action === "share" ? (
                            <SRAddFilledIcon
                              className={`${studycardclasses.actionIcon} active`}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "share" })
                                setSelectedStudyForDialog(study)
                                setOpenASR(true)
                              }}
                            />
                          ) : (
                            <SRAddIcon
                              className={studycardclasses.actionIcon}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "share" })
                                setSelectedStudyForDialog(study)
                                setOpenASR(true)
                              }}
                            />
                          )}
                          {activeButton.id === study.id && activeButton.action === "add_participant" ? (
                            <UserAddFilledIcon
                              className={`${studycardclasses.actionIcon} active`}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "add_participant" })
                                setSelectedStudyForDialog(study)
                                setOpenAPTS(true)
                              }}
                            />
                          ) : (
                            <UserAddIcon
                              className={studycardclasses.actionIcon}
                              onClick={() => {
                                setActiveButton({ id: study.id, action: "add_participant" })
                                setSelectedStudyForDialog(study)
                                setOpenAPTS(true)
                              }}
                            />
                          )}
                        </Box>
                      </Paper>
                      {selectedStudyForDialog && (
                        <AddParticipantToStudy
                          study={selectedStudyForDialog}
                          researcherId={researcherId}
                          onParticipantAdded={handleParticipantAdded}
                          title={props.ptitle}
                          resemail={props.resemail}
                          open={openAPTS}
                          onclose={() => {
                            setOpenAPTS(false)
                            setActiveButton({ id: null, action: null })
                            refreshingStudies()
                            getAllStudies()
                          }}
                        />
                      )}
                      {selectedStudyForDialog && (
                        <AddSubResearcher
                          study={selectedStudyForDialog}
                          upatedDataStudy={handleUpdatedStudyObject}
                          researcherId={researcherId}
                          handleShareUpdate={(studyid, updatedStudy) => handleUpdateStudy(studyid, updatedStudy)}
                          setActiveButton={setActiveButton}
                          activeButton={activeButton}
                          open={openASR}
                          onclose={() => {
                            setOpenASR(false)
                            setActiveButton({ id: null, action: null })
                          }}
                        />
                      )}
                      {/* <StudyDetailsDialog
                      study={study}
                      open={expandedStudyId === study.id}
                      onClose={() => setExpandedStudyId(null)}
                      onSave={(updatedStudy) => handleUpdateStudy(study.id, updatedStudy)}
                      // currentFormState={formState[study.id] || study}
                      // handleFormChange={handleFormChange}
                      editStudyId={study.id}
                      formatDate={formatDate}
                      researcherId={researcherId}
                    /> */}
                      <Dialog
                        open={suspendDialogOpen}
                        onClose={handleCloseSuspendDialog}
                        scroll="paper"
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                        classes={{ paper: classes.manageStudyDialog }}
                      >
                        <DialogTitle>Suspend Study</DialogTitle>
                        <DialogContent>
                          <Typography>Are you sure you want to suspend the study "{studyToSuspend?.name}"?</Typography>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleCloseSuspendDialog} color="secondary">
                            Cancel
                          </Button>
                          <Button onClick={confirmSuspend} color="primary">
                            Suspend
                          </Button>
                        </DialogActions>
                      </Dialog>
                      <Dialog
                        open={CopyDialogOpen}
                        onClose={handleCloseCopyDialog}
                        scroll="paper"
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                        classes={{ paper: classes.manageStudyDialog }}
                      >
                        <DialogTitle>Copy Study</DialogTitle>
                        <DialogContent>
                          <Typography>Are you sure you want to copy the study "{studyToCopy?.name}"?</Typography>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleCloseCopyDialog} color="secondary">
                            Cancel
                          </Button>
                          <Button onClick={confirmCopy} color="primary">
                            Copy
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Grid>
                  ))
                ) : (
                  <Grid item lg={6} xs={12}>
                    <Box display="flex" alignItems="center" className={classes.norecords}>
                      <Icon>info</Icon>
                      {`${t("No Records Found")}`}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </div>
          ) : (
            <React.Fragment>
              <TableView_Mod />
            </React.Fragment>
          )}
        </div>
      )}
    </React.Fragment>
  )
}
