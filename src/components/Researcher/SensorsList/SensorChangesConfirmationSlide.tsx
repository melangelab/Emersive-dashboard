import React from "react"
import { Box, Typography, Slide, Button, Divider, IconButton, Icon } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { slideStyles } from "../ParticipantList/AddButton"
import { ReactComponent as SensorIcon } from "../../../icons/NewIcons/sensor-on-filled.svg"

export default function SensorChangesConfirmationSlide({ open, originalSensor, editedValues, onConfirm, onCancel }) {
  const { t } = useTranslation()
  const sliderclasses = slideStyles()

  const renderDiff = (field, oldValue, newValue) => {
    const formatValue = (value) => {
      if (typeof value === "object") {
        return JSON.stringify(value, null, 2)
      }
      return String(value || "")
    }

    const oldFormatted = formatValue(oldValue)
    const newFormatted = formatValue(newValue)

    return (
      <Box my={2} key={field}>
        <Typography variant="subtitle2" gutterBottom>
          {field}:
        </Typography>
        <Box display="flex" flexDirection="column">
          <Box bgcolor="#ffecec" p={1} borderRadius={1} mb={1}>
            <Typography variant="body2" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "#b30000" }}>- {oldFormatted}</span>
            </Typography>
          </Box>
          <Box bgcolor="#e6ffed" p={1} borderRadius={1}>
            <Typography variant="body2" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "#22863a" }}>+ {newFormatted}</span>
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Box
        className={`${sliderclasses.slidePanel} ${sliderclasses.TabSlidePanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton aria-label="close" className={sliderclasses.closeButton} onClick={onCancel}>
          <Icon>close</Icon>
        </IconButton>

        <Box className={sliderclasses.icon}>
          <SensorIcon />
        </Box>

        <Typography variant="h6" className={sliderclasses.headings}>
          {t("Confirm Sensor Changes")}
        </Typography>

        <Divider className={sliderclasses.divider} />

        <Box mt={2} maxHeight="60vh" overflow="auto" p={1}>
          <Typography variant="body1" gutterBottom>
            {t("Review the following changes to the sensor")} <strong>{originalSensor.name}</strong>:
          </Typography>

          {Object.keys(editedValues).map((field) => renderDiff(field, originalSensor[field], editedValues[field]))}

          {Object.keys(editedValues).length === 0 && (
            <Typography variant="body2" color="textSecondary">
              {t("No changes were made")}
            </Typography>
          )}
        </Box>

        <Divider className={sliderclasses.divider} />

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button onClick={onCancel} className={sliderclasses.button}>
            {t("Cancel")}
          </Button>

          <Button
            onClick={onConfirm}
            className={sliderclasses.button}
            disabled={Object.keys(editedValues).length === 0}
          >
            {t("Save Changes")}
          </Button>
        </Box>
      </Box>
    </Slide>
  )
}
