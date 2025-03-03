import React, { useEffect } from "react"
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
} from "@material-ui/core"
import ScheduleActivity from "./ScheduleActivity"
import UpdateActivity from "./UpdateActivity"
import { updateSchedule } from "./ActivityMethods"
import LAMP from "lamp-core"
import { useTranslation } from "react-i18next"
import DuplicateActivity from "./DuplicateActivity"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: 21,
          height: 19,
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
    },
    activityHeader: { padding: "12px 5px" },
    cardMain: {
      borderRadius: 16,
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
export default function ActivityItem({
  activity,
  researcherId,
  studies,
  activities,
  handleSelectionChange,
  selectedActivities,
  setActivities,
  updateActivities,
  ...props
}) {
  const classes = useStyles()
  const [checked, setChecked] = React.useState(
    selectedActivities.filter((d) => d.id === activity.id).length > 0 ? true : false
  )
  const { t } = useTranslation()
  const handleChange = (activity, event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    handleSelectionChange(activity, event.target.checked)
  }

  return (
    <Card className={`${classes.cardMain} ${activity.isCommunityActivity ? classes.communityCard : ""}`}>
      {activity.isCommunityActivity && <Box className={classes.communityBadge}>{t("Community")}</Box>}
      <Box display="flex" p={1}>
        {!activity.isCommunityActivity && (
          <Box>
            <Checkbox
              checked={checked}
              onChange={(event) => handleChange(activity, event)}
              classes={{ checked: classes.checkboxActive }}
              inputProps={{ "aria-label": "primary checkbox" }}
            />
          </Box>
        )}
        <Box flexGrow={1}>
          <CardHeader
            className={classes.activityHeader}
            title={activity.name}
            subheader={
              <Box>
                <Typography variant="subtitle1">{activity.spec?.replace("lamp.", "")}</Typography>
                <Typography variant="body2">{activity.study_name}</Typography>
                {activity.isCommunityActivity && (
                  <Typography className={classes.creatorInfo}>
                    {t("Creator")}: {activity.creator}
                  </Typography>
                )}
              </Box>
            }
          />
        </Box>
        <Box>
          <CardActions>
            {activity.isCommunityActivity ? (
              <DuplicateActivity
                activity={activity}
                studies={studies}
                researcherId={researcherId}
                searchActivities={setActivities}
              />
            ) : (
              <>
                <UpdateActivity
                  activity={activity}
                  activities={activities}
                  studies={studies}
                  setActivities={setActivities}
                  profile={0}
                  researcherId={researcherId}
                />
                <ScheduleActivity activity={activity} setActivities={setActivities} activities={activities} />
              </>
            )}
          </CardActions>
        </Box>
      </Box>
    </Card>
  )
}
