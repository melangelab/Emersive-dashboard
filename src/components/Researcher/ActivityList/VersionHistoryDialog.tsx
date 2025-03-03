import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Icon,
  Paper,
  Fab,
  Divider,
  makeStyles,
  Theme,
  createStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tabs,
  Tab,
  IconButton,
} from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { useTranslation } from "react-i18next"
import { FileCopy, GetApp, PlayArrow, VolumeUp } from "@material-ui/icons"
import { handleCopyToClipboard, getAudioMimeType, getVideoMimeType } from "../../Utils"
import { useSnackbar } from "notistack"
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    versionItem: {
      marginBottom: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
    versionFlag: {
      display: "inline-flex",
      alignItems: "center",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      marginRight: theme.spacing(1),
    },
    versionInfo: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
    versionActions: {
      display: "flex",
      gap: theme.spacing(1),
    },
    btnVersion: {
      background: "#fff",
      borderRadius: "40px",
      boxShadow: "none",
      cursor: "pointer",
      minWidth: "32px",
      width: "32px",
      height: "32px",
      "&:hover": {
        background: "#fff",
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      },
    },
    // previewContent: {
    //   padding: theme.spacing(2),
    //   backgroundColor: '#f5f5f5',
    //   borderRadius: 4,
    //   overflow: 'auto',
    //   maxHeight: '400px'
    // },
    previewBox: {
      marginTop: theme.spacing(2),
    },
    tabPanel: {
      padding: theme.spacing(2),
    },
    fieldName: {
      fontWeight: "bold",
    },
    diffAdded: {
      backgroundColor: "#e6ffed",
      color: "#22863a",
    },
    diffRemoved: {
      backgroundColor: "#ffeef0",
      color: "#cb2431",
      textDecoration: "line-through",
    },
    mediaPreviewButton: {
      marginTop: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },
    copyButton: {
      position: "absolute",
      top: theme.spacing(1),
      right: theme.spacing(1),
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 1)",
      },
    },
    previewContent: {
      position: "relative",
      padding: theme.spacing(2),
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      overflow: "auto",
      maxHeight: "400px",
    },
    mediaPreviewDialog: {
      "& .MuiDialog-paper": {
        maxWidth: "90vw",
        maxHeight: "90vh",
      },
    },
    previewMedia: {
      width: "100%",
      maxHeight: "70vh",
    },
    mediaInfo: {
      padding: theme.spacing(2),
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  })
)

export default function VersionHistoryDialog({
  open,
  onClose,
  activity,
  formatDate,
  onPreviewVersion,
  onRestoreVersion,
}) {
  const classes = useStyles()
  const { t } = useTranslation()
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [expandedVersion, setExpandedVersion] = useState<string | false>(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false)
  const [mediaPreviewData, setMediaPreviewData] = useState<{
    type: "video" | "audio"
    src: string
    mimeType: string
    uploadedAt?: Date
  } | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handlePreview = (version: any) => {
    setSelectedVersion(version)
    onPreviewVersion(version)
  }

  const handleRestore = (version: any) => {
    onRestoreVersion(version)
  }

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpandedVersion(isExpanded ? panel : false)
  }

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setCurrentTab(newValue)
  }

  // compare versions
  const compareVersions = (oldVersion, newVersion, field) => {
    if (!oldVersion || !newVersion) return null

    const oldValue = oldVersion.details?.[field]
    const newValue = newVersion.details?.[field]

    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return <Typography>No changes</Typography>
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom>
            Previous
          </Typography>
          <Box className={classes.previewContent}>
            <IconButton
              size="small"
              className={classes.copyButton}
              onClick={() => handleCopyToClipboard(JSON.stringify(oldValue, null, 2), enqueueSnackbar)}
            >
              <FileCopy fontSize="small" />
            </IconButton>
            <pre>{JSON.stringify(oldValue, null, 2)}</pre>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom>
            Current
          </Typography>
          <Box className={classes.previewContent}>
            <IconButton
              size="small"
              className={classes.copyButton}
              onClick={() => handleCopyToClipboard(JSON.stringify(newValue, null, 2), enqueueSnackbar)}
            >
              <FileCopy fontSize="small" />
            </IconButton>
            <pre>{JSON.stringify(newValue, null, 2)}</pre>
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Icon style={{ marginRight: 8 }}>history</Icon>
          {t("Version History")}
        </Box>
      </DialogTitle>
      <DialogContent>
        {activity.versionHistorybuild?.map((version, index) => (
          <Accordion key={version.id} expanded={expandedVersion === version.id} onChange={handleChange(version.id)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${version.id}-content`}
              id={`panel-${version.id}-header`}
            >
              <Box className={classes.versionInfo}>
                <Box className={classes.versionFlag}>
                  <Icon fontSize="small" style={{ marginRight: 4 }}>
                    flag
                  </Icon>
                  {`v${index + 1}`}
                </Box>
                <Box>
                  <Typography variant="subtitle1">{version.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(version.date)} {version.time}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.versionActions}>
                <Fab
                  size="small"
                  className={classes.btnVersion}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreview(version)
                  }}
                  title={t("Preview Version")}
                >
                  <Icon fontSize="small">visibility</Icon>
                </Fab>
                <Fab
                  size="small"
                  className={classes.btnVersion}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestore(version)
                  }}
                  title={t("Restore Version")}
                >
                  <Icon fontSize="small">restore_page</Icon>
                </Fab>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Overview" />
                  <Tab label="Settings" />
                  <Tab label="Schedule" />
                  <Tab label="Activity Guide" />
                  <Tab label="Scoring" />
                  <Tab label="Changes" />
                </Tabs>

                <Box className={classes.tabPanel} hidden={currentTab !== 0}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography className={classes.fieldName}>Name:</Typography>
                      <Typography>{version.details?.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography className={classes.fieldName}>Type:</Typography>
                      <Typography>{version.details?.spec}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography className={classes.fieldName}>Creator:</Typography>
                      <Typography>{version.details?.creator}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography className={classes.fieldName}>Created:</Typography>
                      <Typography>{formatDate(version.details?.createdAt)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography className={classes.fieldName}>Category:</Typography>
                      <Typography>{version.details?.category?.join(", ") || "None"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography className={classes.fieldName}>Groups:</Typography>
                      <Typography>{version.details?.groups?.join(", ") || "None"}</Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Box className={classes.tabPanel} hidden={currentTab !== 1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Settings
                  </Typography>
                  {Array.isArray(version.details?.settings) ? (
                    <Box>
                      {version.details.settings.map((setting, idx) => (
                        <Paper key={idx} elevation={1} style={{ padding: "10px", marginBottom: "10px" }}>
                          <Typography variant="subtitle1">{setting.text}</Typography>
                          <Typography variant="body2">Description: {setting.description}</Typography>
                          <Typography variant="body2">Type: {setting.type || setting.type1}</Typography>
                          <Typography variant="body2">Required: {setting.required ? "Yes" : "No"}</Typography>
                          {setting.options && (
                            <Box mt={1}>
                              <Typography variant="body2">Options:</Typography>
                              <ul>
                                {setting.options.map((opt, i) => (
                                  <li key={i}>{opt.value}</li>
                                ))}
                              </ul>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box className={classes.previewContent}>
                      <IconButton
                        size="small"
                        className={classes.copyButton}
                        onClick={() =>
                          handleCopyToClipboard(JSON.stringify(version.details?.settings, null, 2), enqueueSnackbar)
                        }
                      >
                        <FileCopy fontSize="small" />
                      </IconButton>
                      <pre>{JSON.stringify(version.details?.settings, null, 2)}</pre>
                    </Box>
                  )}
                </Box>
                {/* <Box className={classes.tabPanel} hidden={currentTab !== 1}>
                  <Typography variant="subtitle2" gutterBottom>Settings</Typography>
                  <Box className={classes.previewContent}>
                    <pre>{JSON.stringify(version.details?.settings, null, 2)}</pre>
                  </Box>
                </Box> */}
                <Box className={classes.tabPanel} hidden={currentTab !== 2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Schedule
                  </Typography>
                  <Box className={classes.previewContent}>
                    <IconButton
                      size="small"
                      className={classes.copyButton}
                      onClick={() =>
                        handleCopyToClipboard(JSON.stringify(version.details?.schedule, null, 2), enqueueSnackbar)
                      }
                    >
                      <FileCopy fontSize="small" />
                    </IconButton>
                    <pre>{JSON.stringify(version.details?.schedule, null, 2)}</pre>
                  </Box>
                </Box>

                <Box className={classes.tabPanel} hidden={currentTab !== 3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Activity Guide
                  </Typography>
                  {version.details?.activityGuide ? (
                    <>
                      {version.details.activityGuide.text && (
                        <Box mb={2}>
                          <Typography className={classes.fieldName}>Text Guide:</Typography>
                          <Typography>{version.details.activityGuide.text}</Typography>
                        </Box>
                      )}
                      {version.details.activityGuide.video?.data && (
                        <Box mb={2}>
                          <Typography className={classes.fieldName}>Video Guide:</Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            className={classes.mediaPreviewButton}
                            startIcon={<PlayArrow />}
                            onClick={() => {
                              setMediaPreviewData({
                                type: "video",
                                src: version.details.activityGuide.video.data,
                                mimeType: getVideoMimeType(version.details.activityGuide.video.fileType),
                                uploadedAt: version.details.activityGuide.video.uploadedAt,
                              })
                              setMediaPreviewOpen(true)
                            }}
                          >
                            View Video
                          </Button>
                        </Box>
                      )}
                      {version.details.activityGuide.audio?.data && (
                        <Box mb={2}>
                          <Typography className={classes.fieldName}>Audio Guide:</Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            className={classes.mediaPreviewButton}
                            startIcon={<VolumeUp />}
                            onClick={() => {
                              setMediaPreviewData({
                                type: "audio",
                                src: version.details.activityGuide.audio.data,
                                mimeType: getAudioMimeType(version.details.activityGuide.audio.fileType),
                                uploadedAt: version.details.activityGuide.audio.uploadedAt,
                              })
                              setMediaPreviewOpen(true)
                            }}
                          >
                            Play Audio
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography>No activity guide available</Typography>
                  )}
                </Box>

                <Box className={classes.tabPanel} hidden={currentTab !== 4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Score Interpretation
                  </Typography>
                  {version.details?.scoreInterpretation ? (
                    Object.entries(version.details.scoreInterpretation).map(([key, schema]: [string, any]) => (
                      <Accordion key={key}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>
                            {key} - {schema.ranges?.length || 0} ranges
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box className={classes.previewContent} width="100%">
                            <IconButton
                              size="small"
                              className={classes.copyButton}
                              onClick={() => handleCopyToClipboard(JSON.stringify(schema, null, 2), enqueueSnackbar)}
                            >
                              <FileCopy fontSize="small" />
                            </IconButton>
                            <pre>{JSON.stringify(schema, null, 2)}</pre>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  ) : (
                    <Typography>No scoring information available</Typography>
                  )}
                </Box>
                <Box className={classes.tabPanel} hidden={currentTab !== 5}>
                  <Typography variant="subtitle2" gutterBottom>
                    Changes from Previous Version
                  </Typography>
                  {index > 0 ? (
                    <>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Basic Info Changes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2">Previous Name</Typography>
                              <Typography>{activity.versionHistorybuild[index - 1].details?.name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2">Current Name</Typography>
                              <Typography>{version.details?.name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2">Previous Category</Typography>
                              <Typography>
                                {activity.versionHistorybuild[index - 1].details?.category?.join(", ")}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2">Current Category</Typography>
                              <Typography>{version.details?.category?.join(", ")}</Typography>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Settings Changes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {compareVersions(activity.versionHistorybuild[index - 1], version, "settings")}
                        </AccordionDetails>
                      </Accordion>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Schedule Changes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {compareVersions(activity.versionHistorybuild[index - 1], version, "schedule")}
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Guide Changes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {compareVersions(activity.versionHistorybuild[index - 1], version, "activityGuide")}
                        </AccordionDetails>
                      </Accordion>
                      {/* more fields for comparison todo */}
                    </>
                  ) : (
                    <Typography>This is the first version</Typography>
                  )}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {!activity.versionHistorybuild?.length && (
          <Typography color="textSecondary" align="center">
            {t("No version history available")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("Close")}
        </Button>
      </DialogActions>
      <Dialog
        open={mediaPreviewOpen}
        onClose={() => setMediaPreviewOpen(false)}
        className={classes.mediaPreviewDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {mediaPreviewData?.type === "video" ? (
            <video className={classes.previewMedia} controls autoPlay>
              <source src={mediaPreviewData.src} type={mediaPreviewData.mimeType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <audio className={classes.previewMedia} controls autoPlay>
              <source src={mediaPreviewData?.src} type={mediaPreviewData?.mimeType} />
              Your browser does not support the audio tag.
            </audio>
          )}

          <Box className={classes.mediaInfo}>
            <Typography>Uploaded at: {mediaPreviewData?.uploadedAt?.toLocaleString() || "Unknown"}</Typography>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => {
                if (!mediaPreviewData) return
                const versionNumber = activity.versionHistorybuild.findIndex((v) => v.id === expandedVersion) + 1
                const fileType = mediaPreviewData.mimeType.split("/")[1]
                const filename = `${mediaPreviewData.type}_guide_${activity.creator || "researcher"}_${
                  activity.id
                }_v${versionNumber}.${fileType}`

                const link = document.createElement("a")
                link.href = mediaPreviewData.src
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              Download
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMediaPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}
