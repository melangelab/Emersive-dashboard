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
} from "@material-ui/core"
import Header from "./Header"
import { useTranslation } from "react-i18next"
import DeleteStudy from "./DeleteStudy"
import EditStudy from "./EditStudy"
import { Service } from "../../DBService/DBService"
import useInterval from "../../useInterval"
import AddSubResearcher from "./AddSubResearcher"
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
// import { ReactComponent as SRAddFilledIcon } from "../../../icons/NewIcons/users-alt-filled.svg";

import AddParticipantToStudy from "./AddParticipantToStudy"
import { useTableStyles } from "../ActivityList/Index"
import ItemViewHeader from "../SharedStyles/ItemViewHeader"
import StudyDetailItem from "./StudyDetailItem"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as SaveFilledIcon } from "../../../icons/NewIcons/floppy-disks-filled.svg"

export const studycardStyles = makeStyles((theme: Theme) =>
  createStyles({
    dhrCard: {
      backgroundColor: "white",
      border: "1px solid #ededec",
      borderRadius: theme.spacing(2),
      padding: theme.spacing(2),
      boxShadow: theme.shadows[1],
      marginBottom: theme.spacing(6), // Add more bottom margin for action buttons
      position: "relative", // For positioning action buttons
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
      position: "absolute",
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
      zIndex: 1,
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
      zIndex: 2,
      boxShadow: "-2px 0px 4px rgba(0, 0, 0, 0.1)",
      gap: theme.spacing(1),
    },
    actionButtons: {
      display: "flex",
      // gap: theme.spacing(1),
      justifyContent: "flex-start",
      // opacity: 0,
      // transition: 'opacity 0.2s',
      "& svg": {
        width: 24,
        height: 24,
        opacity: 0.4,
        transition: "all 0.3s ease",
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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
  })
)

export const ModularTable = ({
  data,
  columns,
  actions,
  selectable = true,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortConfig,
  onSort,
  indexmap,
  ...props
}) => {
  const classes = useModularTableStyles()
  const [hoveredRow, setHoveredRow] = useState(null)
  const tabclasses = useTableStyles()

  return (
    <TableContainer component={Paper} className={tabclasses.tableRoot}>
      <Table>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRows.length === data.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                  onChange={onSelectAll}
                  className={classes.checkbox}
                />
              </TableCell>
            )}
            <TableCell className={classes.indexCell}>
              <div className={classes.headerContent}>
                <span>#</span>
                <IconButton
                  size="small"
                  className={classes.sortButton}
                  onClick={() => onSort?.("index")} // Enable sorting by index
                >
                  {sortConfig?.field === "index" ? (
                    sortConfig.direction === "asc" ? (
                      <ArrowDropUpIcon />
                    ) : (
                      <ArrowDropDownIcon />
                    )
                  ) : (
                    <ArrowDropDownIcon />
                  )}
                </IconButton>
              </div>
            </TableCell>
            {columns
              .filter((column) => column.visible)
              .map((column) => (
                <TableCell
                  key={column.id}
                  className={column.sortable ? "sortable" : ""}
                  onClick={() => column.sortable && onSort?.(column.id)}
                >
                  <div className={classes.headerContent}>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <IconButton size="small" className={classes.sortButton} onClick={() => onSort?.(column.id)}>
                        {sortConfig?.field === column.id ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowDropUpIcon />
                          ) : (
                            <ArrowDropDownIcon />
                          )
                        ) : (
                          <ArrowDropDownIcon />
                        )}
                      </IconButton>
                    )}
                  </div>
                </TableCell>
              ))}
            <TableCell className={classes.actionCell}>Actions</TableCell>
            {/* <TableCell className={classes.actionCell}>Actions</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id}
              className={classes.rowHover}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {selectable && (
                <TableCell padding="checkbox" className="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => onSelectRow?.(row.id)}
                    className={classes.checkbox}
                  />
                </TableCell>
              )}
              <TableCell className={classes.indexCell}>{indexmap[row.id || row.emailAddress] + 1}</TableCell>
              {columns
                .filter((column) => column.visible)
                .map((column) => (
                  <TableCell key={`${row.id}-${column.id}`}>
                    {props.renderCell ? props.renderCell(column, row) : column.value(row)}
                  </TableCell>
                ))}
              <TableCell className={classes.actionCell}>
                <Box className={classes.actionButtons}>
                  {actions(row)}
                  {/* {hoveredRow === row.id && actions(row)} */}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
  const [CopyDialogOpen, setCopyDialogOpen] = useState(false)
  const [studyToCopy, setStudyToCopy] = useState(null)
  const [openAPTS, setOpenAPTS] = useState(false)
  const [openASR, setOpenASR] = useState(false)
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const [viewingStudy, setViewingStudy] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [triggerSave, setTriggerSave] = useState(false)

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
      // fetchpostdata study clone here
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
  // const handleUpdateStudy = async (studyId, study) => {
  //   try {
  //     const updatedStudy = {
  //       ...study,
  //       ...(formState[studyId] || {})
  //     }
  //     const fieldsToUpdate = [ 'name', 'description', 'purpose', 'studyType', 'hasFunding', 'fundingAgency', 'hasEthicsPermission', 'ethicsPermissionDoc', 'mobile', 'email', 'state', 'piInstitution', 'collaboratingInstitutions', 'timestamps'
  //     ]
  //     LAMP.Study.update(studyId, updatedStudy)
  //     .then((res) => {
  //       Service.update("studies", {
  //         studies: [{
  //           id: studyId,
  //           ...updatedStudy
  //         }]
  //       }, "name", "id")
  //       Service.updateMultipleKeys(
  //         "studies",
  //         {
  //           studies: [{
  //             id: studyId,
  //             ...updatedStudy  // This contains all updated fields
  //           }]
  //         },
  //         fieldsToUpdate,
  //         "id"
  //       )
  //       })
  //     .catch((error) => {
  //       console.log("error updating group to newly created study", error)
  //     })
  //     enqueueSnackbar(t("Study updated successfully"), { variant: "success" })
  //     setEditStudyId(null)
  //     setFormState({})
  //     getAllStudies()
  //     handleUpdatedStudyObject(study)
  //   } catch (err) {
  //     enqueueSnackbar(t("Failed to update study: ") + err.message, { variant: "error" })
  //   }
  // }
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

  useInterval(
    () => {
      setLoading(true)
      getAllStudies()
    },
    studies !== null && (studies || []).length > 0 ? null : 2000,
    true
  )

  useEffect(() => {
    getAllStudies()
    newAdddeStudy(newStudy)
  }, [newStudy])

  useEffect(() => {
    if ((studies || []).length > 0) setAllStudies(studies)
    else setAllStudies([])
  }, [studies])

  const searchFilterStudies = async () => {
    if (!!search && search !== "") {
      let studiesList: any = await Service.getAll("studies")
      let newStudies = studiesList.filter((i) => i.name?.toLowerCase()?.includes(search?.toLowerCase()))
      setAllStudies(newStudies)
    } else {
      getAllStudies()
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

  const [columns, setColumns] = useState<TableColumn[]>([
    { id: "name", label: "Study Name", value: (s) => s.name, visible: true, sortable: true },
    { id: "description", label: "Description", value: (s) => s.description || "-", visible: true, sortable: true },
    { id: "email", label: "Email", value: (s) => s.email, visible: true, sortable: true },
    { id: "mobile", label: "Phone/Mobile", value: (s) => s.mobile, visible: true, sortable: true },
    { id: "state", label: "State", value: (s) => s.state, visible: true, sortable: true },
    { id: "purpose", label: "Study Purpose", value: (s) => s.purpose || "-", visible: false, sortable: true },
    { id: "studyType", label: "Study Type", value: (s) => s.studyType || "-", visible: false, sortable: true },
    {
      id: "piInstitution",
      label: "PI Institution",
      value: (s) => s.piInstitution || "-",
      visible: false,
      sortable: true,
    },
    { id: "adminNote", label: "Admin Notes", value: (s) => s.adminNote || "-", visible: false, sortable: true },
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
    enqueueSnackbar("Participant added successfully", { variant: "success" })
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
    if (isEditing) {
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTriggerSave(false)
    }
  }

  const handleSaveStudy = () => {
    setTriggerSave(true)
  }

  const handleSaveComplete = (updatedStudy) => {
    setViewingStudy(updatedStudy)
    setIsEditing(false)
    setTriggerSave(false)
    searchFilterStudies()
  }

  const TableView_Mod = () => {
    const [sortConfig, setSortConfig] = useState({ field: "name", direction: "desc" })
    const [selectedRows, setSelectedRows] = useState([])
    const classes = useModularTableStyles()
    const currentStudy = expandedStudyId ? allStudies?.find((s) => s.id === expandedStudyId) : null
    const [editingStudy, setEditingStudy] = useState(null)
    const [editedData, setEditedData] = useState({})
    // const [isEditing, setIsEditing] = useState(false)
    // const [editedValues, setEditedValues] = useState({})

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
        setEditedData({})
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

    const renderCell = (column: any, row: any) => {
      const columnKey = column.id
      const value = column.value(row)

      // Check if this cell should be editable
      const isEditable =
        editableColumns.includes(columnKey) && activeButton.action === "edit" && activeButton.id === row.id
      // const isEditable = editableColumns.includes(columnKey) &&
      // activeButton.id === row.id &&
      // activeButton.action === "edit" &&
      // editingStudy?.id === row.id

      if (!isEditable) {
        return <div className={classes.cellContent}>{formatValue(value, columnKey)}</div>
      }

      const fieldConfig = fieldConfigs[columnKey]

      if (fieldConfig?.type === "select") {
        return (
          <Select
            value={editedData[columnKey] ?? value}
            onChange={(e) => {
              setEditedData((prev) => ({
                ...prev,
                [columnKey]: e.target.value,
              }))
            }}
            className={classes.editableSelect}
            fullWidth
          >
            {fieldConfig.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )
      }

      if (fieldConfig?.type === "multiline") {
        return (
          <TextField
            multiline
            rows={2}
            value={editedData[columnKey] ?? value}
            onChange={(e) => {
              setEditedData((prev) => ({
                ...prev,
                [columnKey]: e.target.value,
              }))
            }}
            className={classes.editableInput}
            fullWidth
          />
        )
      }

      return (
        <TextField
          value={editedData[columnKey] ?? value}
          onChange={(e) => {
            setEditedData((prev) => ({
              ...prev,
              [columnKey]: e.target.value,
            }))
          }}
          className={classes.editableInput}
          fullWidth
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
      <Box display="flex" alignItems="center" style={{ gap: 8 }}>
        <Box component="span" className={classes.actionIcon}>
          {expandedStudyId === study.id ? (
            <ViewIcon
              className="selected"
              onClick={() => {
                setActiveButton({ id: study.id, action: "view" })
                // toggleStudyDetails(study.id)
                handleViewStudy(study)
              }}
            />
          ) : (
            <ViewIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "view" })
                // toggleStudyDetails(study.id)
                handleViewStudy(study)
              }}
            />
          )}
        </Box>

        <Box component="span" className={classes.actionIcon}>
          {activeButton.id === study.id && activeButton.action === "copy" ? (
            <CopyFilledIcon
              className="active"
              onClick={() => {
                setActiveButton({ id: study.id, action: "copy" })
                handleOpenCopyDialog(study)
              }}
            />
          ) : (
            <CopyIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "copy" })
                handleOpenCopyDialog(study)
              }}
            />
          )}
        </Box>
        <Box component="span" className={classes.actionIcon}>
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
        </Box>
        <Box component="span" className={classes.actionIcon}>
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
        </Box>
        {props.authType === "admin" && (
          <Box component="span" className={classes.actionIcon}>
            {studyToSuspend?.id === study.id ? (
              <SuspendFilledIcon
                className="selected"
                onClick={() => {
                  setActiveButton({ id: study.id, action: "suspend" })
                  handleOpenSuspendDialog(study)
                }}
              />
            ) : (
              <SuspendIcon
                onClick={() => {
                  setActiveButton({ id: study.id, action: "suspend" })
                  handleOpenSuspendDialog(study)
                }}
              />
            )}
          </Box>
        )}

        {props.authType === "admin" && (
          <Box component="span" className={classes.actionIcon}>
            <DeleteIcon
              onClick={() => {
                setActiveButton({ id: study.id, action: "delete" })
                handleOpenDialog(study, "delete")
              }}
            />
          </Box>
        )}

        <Box component="span" className={classes.actionIcon}>
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
        </Box>
        <Box component="span" className={classes.actionIcon}>
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
        </Box>
      </Box>
    )

    return (
      <>
        <ModularTable
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
            setSortConfig({
              field,
              direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
            })
          }}
          indexmap={originalIndexMap}
          renderCell={renderCell}
          // editingStudy={editingStudy}
          activeButton={activeButton}
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
            viewMode={viewMode}
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
            }}
          />
        )}

        {/* {currentStudy && (
          <StudyDetailsDialog
            study={currentStudy}
            open={!!expandedStudyId}
            onClose={() => setExpandedStudyId(null)}
            onSave={(updatedStudy) => handleUpdateStudy(expandedStudyId, updatedStudy)}
            editStudyId={expandedStudyId}
            formatDate={formatDate}
            researcherId={researcherId}
          />
        )} */}

        {/* <StudyDetailsDialog
          study={expandedStudyId ? allStudies.find(s => s.id === expandedStudyId) : null}
          open={!!expandedStudyId}
          onClose={() => setExpandedStudyId(null)}
          onSave={(updatedStudy) => handleUpdateStudy(expandedStudyId, updatedStudy)}
          editStudyId={expandedStudyId}
          formatDate={formatDate}
          researcherId={researcherId}
          // study={study}
          // open={expandedStudyId === study.id}
          // onClose={() => setExpandedStudyId(null)}
          // onSave={(updatedStudy) => handleUpdateStudy(study.id, updatedStudy)}
          // editStudyId={study.id}
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
      </>
    )
  }

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading || allStudies === null}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box>
        {viewingStudy ? (
          <ItemViewHeader
            ItemTitle="Study"
            ItemName={viewingStudy.name}
            searchData={handleSearchData}
            authType={props.authType}
            onEdit={handleEditStudy}
            onSave={() => {
              if (isEditing) {
                handleSaveStudy()
              }
            }}
            onPrevious={() => {
              const currentIndex = allStudies.findIndex((s) => s.id === viewingStudy.id)
              if (currentIndex > 0) {
                setViewingStudy(allStudies[currentIndex - 1])
              }
            }}
            onNext={() => {
              const currentIndex = allStudies.findIndex((s) => s.id === viewingStudy.id)
              if (currentIndex < allStudies.length - 1) {
                setViewingStudy(allStudies[currentIndex + 1])
              }
            }}
            onClose={handleCloseViewStudy}
          />
        ) : (
          <Header
            studies={allStudies ?? null}
            researcherId={researcherId}
            searchData={handleSearchData}
            setParticipants={searchFilterStudies}
            newStudyObj={setNewStudy}
            updatedDataStudy={handleUpdatedStudyObject}
            title={props.ptitle}
            authType={props.authType}
            onLogout={props.onLogout}
            onViewModechanged={setViewMode}
            viewMode={viewMode}
            resins={props.resins}
            VisibleColumns={columns}
            setVisibleColumns={setColumns}
          />
        )}
        <Box
          className={layoutClasses.tableContainer + " " + (!supportsSidebar ? layoutClasses.tableContainerMobile : "")}
          style={{ overflowX: "hidden" }}
        >
          {viewingStudy ? (
            <StudyDetailItem
              study={viewingStudy}
              isEditing={isEditing}
              onSave={handleSaveComplete}
              researcherId={researcherId}
              triggerSave={triggerSave}
            />
          ) : (
            <>
              {viewMode === "grid" ? (
                <Grid container spacing={3}>
                  {allStudies !== null && (allStudies || []).length > 0 ? (
                    (allStudies || []).map((study) => (
                      <Grid item lg={4} md={6} xs={12} key={study.id}>
                        <Paper className={studycardclasses.dhrCard} elevation={3}>
                          <Box display={"flex"} flexDirection={"row"}>
                            <Box flexGrow={1}>
                              <Typography className={studycardclasses.cardTitle}>
                                {study.name || "No Name provided."}
                              </Typography>
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
                            {/* <ViewIcon 
                      className={`${studycardclasses.actionIcon} ${
                        expandedStudyId === study.id ? 'selected' : ''
                      }`}
                      onClick={() => { setActiveButton({ id: study.id, action: 'view' });toggleStudyDetails(study.id)}}
                    /> */}
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
                            {props.authType === "admin" &&
                              (studyToSuspend?.id === study.id ? (
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
                              ))}
                            {props.authType == "admin" && (
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
                        {/* </Grid>
 
                  <Grid item lg={6} xs={12} key={study.id}> */}
                        {/* <Box display="flex" p={1} className={classes.studyMain}>
                      <Box flexGrow={1}>
                        <EditStudy
                          study={study}
                          upatedDataStudy={handleUpdatedStudyObject}
                          allStudies={allStudies}
                          researcherId={researcherId}
                        />
                      </Box>
                      <AddSubResearcher
                        study={study}
                        upatedDataStudy={handleUpdatedStudyObject}
                        researcherId={researcherId}
                        handleShareUpdate={(studyid, updatedStudy) => handleUpdateStudy(studyid, updatedStudy)}
                      />
                      {props.authType == "admin" && (
                        <DeleteStudy study={study} deletedStudy={handleDeletedStudy} researcherId={researcherId} />
                      )}
                      {props.authType == "admin" && (
                        <Fab
                          size="small"
                          color="primary"
                          classes={{ root: classes.btnWhite }}
                          onClick={() => {
                            handleOpenSuspendDialog(study)
                          }}
                        >
                          <Icon> {"block_outline"} </Icon>
                        </Fab>
                      )}
                      <Fab
                        size="small"
                        color="primary"
                        classes={{ root: classes.btnWhite }}
                        onClick={() => {
                          toggleStudyDetails(study.id)
                        }}
                      >
                        <Icon> visibility
                        </Icon>
                      </Fab>
                    </Box> */}
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
                            <Typography>
                              Are you sure you want to suspend the study "{studyToSuspend?.name}"?
                            </Typography>
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
              ) : (
                // <TableView />
                <TableView_Mod />
              )}
            </>
          )}
        </Box>
      </Box>
    </React.Fragment>
  )
}
