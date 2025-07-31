import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardActions,
  makeStyles,
  Theme,
  createStyles,
  Checkbox,
  Paper,
  Divider,
  Backdrop,
  CircularProgress,
} from "@material-ui/core"
import UpdateSensor from "./UpdateSensor"
import { useTranslation } from "react-i18next"
import { studycardStyles, useModularTableStyles } from "../Studies/Index"
import { ReactComponent as HistoryIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as HistoryFilledIcon } from "../../../icons/NewIcons/version-history.svg"
import { ReactComponent as ShareCommunityIcon } from "../../../icons/NewIcons/refer.svg"
import { ReactComponent as ShareCommunityFilledIcon } from "../../../icons/NewIcons/refer-filled.svg"
import { ReactComponent as RemoveCommunityIcon } from "../../../icons/NewIcons/user-xmark.svg"
import { ReactComponent as RemoveCommunityFilledIcon } from "../../../icons/NewIcons/user-xmark-filled.svg"
import { ReactComponent as VersionThisIcon } from "../../../icons/NewIcons/code-merge.svg"
import { ReactComponent as VersionThisFilledIcon } from "../../../icons/NewIcons/code-merge-filled.svg"
import { ReactComponent as DeleteFilledIcon } from "../../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as ViewIcon } from "../../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as DeleteIcon } from "../../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as CopyFilledIcon } from "../../../icons/NewIcons/copy-filled.svg"
import { ReactComponent as CopyIcon } from "../../../icons/NewIcons/copy.svg"
import { devLabCardStyles } from "../ActivityList/Index"
import { Service } from "../../DBService/DBService"
import SensorDialog from "./SensorDialog"
import ConfirmationDialog from "../../ConfirmationDialog"
import { slideStyles } from "../ParticipantList/AddButton"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import CopySensor from "./CopySensor"
import { canEditSensor, canViewSensor } from "./Index"

interface CardStyles {
  activitycardclasses: any
  customStyles: any
  mtstyles: any
}

interface ActionButton {
  id: string | null
  action: string | null
}

interface ModularCardProps {
  item: any
  styles: CardStyles
  isCommunityItem?: boolean
  isEditable?: boolean
  isSharedItem?: boolean
  isSelected?: boolean
  onSelectionChange?: (item: any, checked: boolean) => void
  actions?: {
    onView?: () => void
    onSchedule?: () => void
    onUpdate?: () => void
    onVersionHistory?: () => void
    onShare?: () => void
    onVersion?: () => void
    onDelete?: () => void
    onCopy?: () => void
  }
  activeButton?: { id: any; action: any }
  setActiveButton?: ({ id, action }) => void
  getParentResearcher?: (parentResearcherId: string) => string
}

export const ModularCard: React.FC<ModularCardProps> = ({
  item,
  styles,
  isCommunityItem = false,
  isSharedItem = false,
  isEditable = false,
  isSelected = false,
  onSelectionChange,
  actions = {},
  activeButton,
  setActiveButton,
  getParentResearcher,
}) => {
  const { t } = useTranslation()

  const renderActionIcon = (
    defaultIcon: React.ReactNode,
    filledIcon: React.ReactNode,
    action: string,
    onClick: () => void
  ) => {
    return activeButton.id === item.id && activeButton.action === action
      ? React.cloneElement(filledIcon as React.ReactElement, {
          className: `${styles.mtstyles.actionIcon} active`,
          onClick: () => {
            setActiveButton({ id: item.id, action })
            onClick()
          },
        })
      : React.cloneElement(defaultIcon as React.ReactElement, {
          className: styles.mtstyles.actionIcon,
          onClick: () => {
            setActiveButton({ id: item.id, action })
            onClick()
          },
        })
  }
  // ${isSharedItem ? styles.activitycardclasses.sharedCard : ""}

  return (
    <Paper
      className={`
        ${styles.activitycardclasses.dhrCard} 
        ${isCommunityItem ? styles.activitycardclasses.communityCard : ""}
      `}
      elevation={3}
    >
      <Box display="flex" flexDirection="row">
        {isCommunityItem && <Box className={styles.activitycardclasses.communityBadge}>{t("Community")}</Box>}
        {isSharedItem && <Box className={styles.activitycardclasses.sharedBadge}>{t("Shared")}</Box>}
        <Box display="flex" p={1}>
          <Typography className={styles.activitycardclasses.cardTitle}>{item.name || "No Name provided."}</Typography>
          <Typography className={styles.customStyles.version}>{`${item.currentVersion?.name || "v1.0"}`}</Typography>
        </Box>
      </Box>

      {/* Details Section */}
      <Divider className={styles.activitycardclasses.titleDivider} />
      <Typography className={styles.activitycardclasses.cardSubtitle}>
        <strong>{t("Name")}:</strong> {item.name}
      </Typography>
      {item.description && (
        <Typography className={styles.activitycardclasses.cardSubtitle}>
          <strong>{t("Description")}:</strong> {item.description}
        </Typography>
      )}
      {item.study_name && (
        <Typography className={styles.activitycardclasses.cardSubtitle}>
          <strong>{t("Study Name")}:</strong> {item.study_name}
        </Typography>
      )}
      {item.group && (
        <Typography className={styles.activitycardclasses.cardSubtitle}>
          <strong>{t("Group Name")}:</strong> {item.group}
        </Typography>
      )}
      {/* Additional Info Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography className={styles.activitycardclasses.cardSubtitle}>
            <strong className={styles.customStyles.baseTypeDeveloperLabel}>{t("Base")}:</strong>
            <span className={styles.customStyles.baseTypeDeveloper}>{item.spec?.replace("lamp.", "")}</span>
          </Typography>
          <Typography className={styles.activitycardclasses.cardSubtitle}>
            <strong className={styles.customStyles.baseTypeDeveloperLabel}>{t("Type")}:</strong>
            <span className={styles.customStyles.baseTypeDeveloper}>{isCommunityItem ? "Community" : "Custom"}</span>
          </Typography>
          {isCommunityItem && (
            <Typography className={styles.activitycardclasses.cardSubtitle}>
              <strong className={styles.customStyles.baseTypeDeveloperLabel}>{t("Developer")}:</strong>
              <span className={styles.customStyles.baseTypeDeveloper}>{item.creator}</span>
            </Typography>
          )}
          {isSharedItem && (
            <>
              <Typography className={styles.activitycardclasses.cardSubtitle}>
                <strong className={styles.customStyles.baseTypeDeveloperLabel}>{t("Shared By")}:</strong>{" "}
                <span className={styles.customStyles.baseTypeDeveloper}>
                  {getParentResearcher(item.parentResearcher)}
                </span>
              </Typography>
            </>
          )}
        </Box>
        <Box>
          <Typography className={styles.customStyles.studiesNumber}>
            {item.sharingStudies ? (item.sharingStudies?.length || 0) + 1 : item.studies?.length || 1}
          </Typography>
          <Typography className={styles.customStyles.studiesLabel}>STUDIES</Typography>
        </Box>
      </Box>

      {/* Action Buttons Section */}
      <Box className={styles.activitycardclasses.actionButtons}>
        {isCommunityItem ? (
          // Community-specific actions
          <>
            {renderActionIcon(<ViewIcon />, <ViewFilledIcon />, "view", actions.onView || (() => {}))}
            {actions.onCopy && renderActionIcon(<CopyIcon />, <CopyFilledIcon />, "copy", actions.onCopy || (() => {}))}
          </>
        ) : (
          // Custom item actions

          <>
            {renderActionIcon(<ViewIcon />, <ViewFilledIcon />, "view", actions.onView || (() => {}))}
            {isEditable &&
              actions.onUpdate &&
              renderActionIcon(<EditIcon />, <EditFilledIcon />, "update", actions.onUpdate || (() => {}))}
            {actions.onCopy && renderActionIcon(<CopyIcon />, <CopyFilledIcon />, "copy", actions.onCopy || (() => {}))}
            {!isSharedItem &&
              actions.onDelete &&
              renderActionIcon(<DeleteIcon />, <DeleteFilledIcon />, "delete", actions.onDelete || (() => {}))}
            {/* {actions.onDelete && renderActionIcon(
              <DeleteIcon />, 
              <DeleteFilledIcon />, 
              'delete', 
              actions.onDelete || (() => {})
            )} */}
          </>
        )}
      </Box>
    </Paper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    activityHeader: { padding: "12px 5px" },
    cardMain: {
      boxShadow: "none !important ",
      background: "#E0E0E0",
      margin: "11px",
      "& span.MuiCardHeader-title": { fontSize: "16px", fontWeight: 500 },
    },
    checkboxActive: { color: "#7599FF !important" },
    communityCard: {
      background: "#F0F7FF", // Light blue background
      border: "1px solid #7599FF",
      position: "relative",
    },
    communityBadge: {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      background: "#7599FF",
      color: "white",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
    },
    creatorInfo: {
      fontSize: "0.75rem",
      color: "#666",
      marginTop: "4px",
    },
  })
)

export interface Sensors {
  isShared: boolean
  id?: string
  study_id?: string
  name?: string
  spec?: string
  study_name?: string
  isCommunity?: boolean
}
export default function SensorListItem({
  sensor,
  studies,
  handleSelectionChange,
  selectedSensors,
  setSensors,
  researcherId,
  formatDate,
  onViewSensor,
  allresearchers,
  sharedstudies,
  ...props
}: {
  sensor?: Sensors
  studies?: Array<Object>
  handleSelectionChange: Function
  selectedSensors?: any
  setSensors?: Function
  researcherId: string
  formatDate: Function
  onViewSensor?: Function
  allresearchers?: any[]
  sharedstudies?: any[]
}) {
  const { t } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [checked, setChecked] = React.useState(
    selectedSensors.filter((d) => d.id === sensor.id).length > 0 ? true : false
  )
  const mtstyles = useModularTableStyles()
  const activitycardclasses = studycardStyles()
  const customStyles = devLabCardStyles()
  const [sensorDialog, setSensorDialog] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState(0)
  const [copySensorOpen, setCopySensorOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allSensors, setAllSensors] = useState<Array<Object>>([])
  const sliderclasses = slideStyles()
  const [activeButton, setActiveButton] = useState<ActionButton>({ id: null, action: null })
  const [sensorView, setSensorView] = useState(false)
  const canEdit = canEditSensor(sensor, studies, researcherId, sharedstudies)
  const canView = canViewSensor(sensor, studies, researcherId, sharedstudies)

  const handleChange = (sensor, event) => {
    setChecked(event.target.checked)
    handleSelectionChange(sensor, event.target.checked)
  }
  console.log("sensor detaikls", sensor)
  useEffect(() => {
    getAllStudies()
  }, [sensorDialog])

  const getAllStudies = () => {
    Service.getAll("sensors").then((sensorObj) => {
      if (sensorObj) {
        setAllSensors(sensorObj)
      }
    })
  }

  const getParentResearcher = (parentResearcherId) => {
    const researcher = allresearchers.find((r) => r.id === parentResearcherId)
    return researcher ? researcher.name : parentResearcherId
  }

  const handleViewSensor = () => {
    if (sensorView) {
      handleCloseSensorView()
    } else {
      onViewSensor(sensor)
      setSensorView(true)
    }
  }

  const handleUpdateSensor = () => {
    if (sensorDialog) {
      handleCloseSensorDialog()
    } else {
      setSensorDialog(true)
    }
  }
  const handleCopySensor = () => {
    if (copySensorOpen) {
      handleCloseCopyDialog()
    } else {
      setCopySensorOpen(true)
    }
  }

  const addOrUpdateSensor = (updatedSensor?: any) => {
    setSensorDialog(false)
    setSensors()
    handleCloseSensorDialog()
  }
  const handleCloseSensorDialog = () => {
    setSensorDialog(false)
    setActiveButton({ id: null, action: null })
  }
  const handleCloseSensorView = () => {
    setSensorView(false)
    setActiveButton({ id: null, action: null })
  }

  const handleCloseCopyDialog = () => {
    setCopySensorOpen(false)
    setActiveButton({ id: null, action: null })
  }

  const handleDeleteSensor = async () => {
    try {
      setConfirmationDialog(5)
    } catch (error) {
      console.error("Error preparing sensor deletion:", error)
    }
  }
  const confirmDelete = async (status) => {
    if (status === "Yes") {
      try {
        // Start loading
        setLoading(true)

        // Delete the sensor
        await LAMP.Sensor.delete(sensor.id).then((data: any) => {
          if (!data.error) {
            setSensors()
            if (sensor.study_id) {
              Service.getData("studies", sensor.study_id).then((studyData: any) => {
                Service.updateMultipleKeys(
                  "studies",
                  {
                    studies: [
                      {
                        id: sensor.study_id,
                        sensor_count: (studyData.sensor_count || 1) - 1,
                      },
                    ],
                  },
                  ["sensor_count"],
                  "id"
                )
              })
            }
            Service.delete("sensors", [sensor.id])
            // Show success message
            enqueueSnackbar("Sensor deleted successfully", { variant: "success" })
          } else {
            // Handle deletion error
            enqueueSnackbar("Failed to delete sensor", { variant: "error" })
          }
        })
        // const deleteResult = await LAMP.Sensor.delete(sensor.id)
        // if (!deleteResult.error) {
        //   setSensors()
        //   if (sensor.study_id) {
        //     const studyData = await Service.getData("studies", sensor.study_id)
        //     await Service.updateMultipleKeys(
        //       "studies",
        //       {
        //         studies: [{
        //           id: sensor.study_id,
        //           sensor_count: (studyData.sensor_count || 1) - 1
        //         }],
        //       },
        //       ["sensor_count"],
        //       "id"
        //     )
        //   }
      } catch (error) {
        console.error("Error deleting sensor:", error)
        enqueueSnackbar("An error occurred while deleting the sensor", { variant: "error" })
      } finally {
        setLoading(false)
        setActiveButton({ id: null, action: null })
        setConfirmationDialog(0)
      }
    } else {
      setConfirmationDialog(0)
      setActiveButton({ id: null, action: null })
    }
  }

  return (
    <>
      <ModularCard
        item={sensor}
        styles={{
          activitycardclasses,
          customStyles,
          mtstyles,
        }}
        isCommunityItem={sensor.isCommunity}
        isSharedItem={sensor.isShared}
        isSelected={checked}
        isEditable={canEdit}
        onSelectionChange={handleChange}
        actions={{
          onView: handleViewSensor,
          onUpdate: handleUpdateSensor,
          onCopy: handleCopySensor,
          onDelete: handleDeleteSensor,
        }}
        activeButton={activeButton}
        setActiveButton={setActiveButton}
        getParentResearcher={getParentResearcher}
      />
      {/* <Backdrop className={sliderclasses.backdrop} open={sensorDialog} onClick={(e)=> handleCloseSensorDialog()} /> */}
      <SensorDialog
        sensor={sensor}
        onclose={() => handleCloseSensorDialog()}
        studies={studies}
        open={sensorDialog}
        type="edit"
        studyId={sensor.study_id ?? null}
        addOrUpdateSensor={addOrUpdateSensor}
        allSensors={allSensors}
        sharedstudies={sharedstudies}
      />
      <CopySensor
        sensor={sensor}
        studies={studies}
        setSensors={setSensors}
        open={copySensorOpen}
        onclose={() => handleCloseCopyDialog()}
        studyId={sensor.study_id ?? null}
        allSensors={allSensors}
      />

      <ConfirmationDialog
        confirmationDialog={confirmationDialog}
        open={confirmationDialog == 5}
        onClose={() => setConfirmationDialog(0)}
        confirmAction={confirmDelete}
        confirmationMsg={`Are you sure you want to delete ${sensor.name}?`}
      />
      {/* <ConfirmationDialog
      confirmationDialog={confirmationDialog}
      open={confirmationDialog > 0}
      onClose={() => setConfirmationDialog(0)}
      confirmAction={(val) => {
        if (val === "Yes") {
          setSensorDialog(true)
        }
        setConfirmationDialog(0)
      }}
      confirmationMsg="Changes done to this sensor will reflect for all participants under the group. Are you sure you want to proceed?"
    /> */}
    </>
  )
}
