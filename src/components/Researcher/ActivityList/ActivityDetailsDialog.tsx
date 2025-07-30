import React, { useEffect, useRef, useState } from "react"
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  DialogContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  makeStyles,
  Theme,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  DialogActions,
} from "@material-ui/core"
import { VideocamOutlined, AudiotrackOutlined, DescriptionOutlined, GetApp } from "@material-ui/icons"
import CloseIcon from "@material-ui/icons/Close"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import { availableActivitySpecs, games } from "../ActivityList/Index"
import { Mic, MicOff, Stop } from "@material-ui/icons"
import { FileType } from "lucide-react"

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    position: "relative",
    backgroundColor: "#7599FF",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  content: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  scoreRangeItem: {
    border: "1px solid #e0e0e0",
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
  },
  scheduleItem: {
    border: "1px solid #e0e0e0",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  guideTab: {
    minHeight: 48,
    padding: theme.spacing(2),
  },
  videoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    justifyContent: "center",
    // alignItems: 'center',
    // height: '100vh',
    // width: '100wh',
  },
  previewDialog: {
    "& .MuiDialog-paper": {
      maxWidth: "90vw",
      maxHeight: "90vh",
    },
  },
  previewVideo: {
    width: "100%",
    maxHeight: "70vh",
  },
  videoInfo: {
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoPreview: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
      opacity: 0.8,
    },
  },
  uploadSection: {
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(1),
    textAlign: "center",
    border: "2px dashed #ccc",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.background.paper,
    },
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
  },
  previewSection: {
    marginTop: theme.spacing(2),
    "& video, & audio": {
      width: "100%",
      marginTop: theme.spacing(1),
    },
  },
  mediaControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  videoPreviewBox: {
    justifyItems: "center",
    width: "90%",
    aspectRatio: "20/9",
    backgroundColor: "#1a237e", // Dark blue background
    borderRadius: theme.spacing(2),
    position: "relative",
    overflow: "hidden",
    marginBottom: theme.spacing(3),
  },
  videoFeed: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  controlsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(4),
    padding: theme.spacing(2),
  },
  recordButton: {
    width: 64,
    height: 64,
    backgroundColor: "#f44336", // Red color
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&.recording": {
      borderRadius: 8,
      backgroundColor: "#000",
    },
  },
  micButton: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    "&.disabled": {
      backgroundColor: "#e0e0e0",
      color: "#9e9e9e",
    },
  },
  timer: {
    position: "absolute",
    top: theme.spacing(2),
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  previewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    "& video": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
  },
  audioPreview: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: "#f5f5f5",
    "& audio": {
      width: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  audioRecordingSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  audioPreviewBox: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    borderRadius: theme.spacing(1),
    "& audio": {
      width: "70%",
    },
  },
}))

export default function ActivityDetailsDialog({ activity, open, onClose, onSave, ...props }) {
  const classes = useStyles()
  const [formState, setFormState] = useState(activity)
  const [isEditing, setIsEditing] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [scoreSection, setScoreSection] = useState("")
  const [guideTab, setGuideTab] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{
    src: string
    type: "recorded" | "uploaded"
    timestamp?: Date
    duration?: number
  } | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [audioRecording, setAudioRecording] = useState(false)
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [audioRecordingTime, setAudioRecordingTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioPreviewRef = useRef<HTMLAudioElement>(null)
  const [isUploadedVideo, setisUploadedVideo] = useState(false)
  const [updateSettings, setUpdateSettings] = useState(false)
  const handleVideoPreview = (video: string, type: "recorded" | "uploaded") => {
    setSelectedVideo({
      src: video,
      type,
      timestamp: new Date(),
      duration: previewRef.current?.duration || videoRef.current?.duration,
    })
    setPreviewDialogOpen(true)
    console.log(formState.activityGuide.video)
  }
  const handlestoredVideoPreview = () => {
    setSelectedVideo({
      src: activity.activityGuide.video?.data,
      type: activity.activityGuide.video?.fileType,
      timestamp: activity.activityGuide.video?.uploadedAt,
      duration: previewRef.current?.duration || videoRef.current?.duration,
    })
    setPreviewDialogOpen(true)
    console.log("handlestoredVideoPreview", activity.activityGuide.video)
  }

  const [newRange, setNewRange] = useState({
    min: 0,
    max: 0,
    interpretation: "",
    severity: "low",
  })

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // setRecordedChunks([])
      // if (previewRef.current) {
      //   previewRef.current.src = ''
      // }
      const reader = new FileReader()
      reader.onloadend = () => {
        const mimeType = file.type || "video/webm"
        const dataUrl = reader.result as string
        handleFormChange("activityGuide", {
          ...formState.activityGuide,
          video: {
            data: dataUrl.startsWith("data:") ? dataUrl : `data:${mimeType}base64,${dataUrl.split(",")[1]}`,
            fileType: mimeType.split("/")[1], // 'webm' or 'mp4'
            uploadedAt: new Date(),
          },
        })
        // handleFormChange('activityGuide', {
        //   ...formState.activityGuide,
        //   video: { data : reader.result , fileType: file.type , uploadedAt: new Date()}
        // })
        setisUploadedVideo(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const mimeType = file.type || "audio/webm"
        const dataUrl = reader.result as string
        handleFormChange("activityGuide", {
          ...formState.activityGuide,
          audio: {
            data: dataUrl.startsWith("data:") ? dataUrl : `data:${mimeType}base64,${dataUrl.split(",")[1]}`,
            fileType: mimeType.split("/")[1],
            uploadedAt: new Date(),
          },
        })
        // handleFormChange('activityGuide', {
        //   ...formState.activityGuide,
        //   audio: { data : reader.result , fileType: file.type , uploadedAt: new Date()}
        // })
      }
      reader.readAsDataURL(file)
    }
  }
  // const handleFormChange = (field, value) => {
  //   setFormState(prev => ({
  //     ...prev,
  //     [field]: value
  //   }))

  //   console.log("handleFormChange", formState)
  // }
  const handleFormChange = (field, value) => {
    setFormState((prev) => {
      if (field === "activityGuide") {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            ...value,
          },
        }
      }
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const addScoreRange = () => {
    if (!scoreSection) {
      enqueueSnackbar("Please select a score section", { variant: "error" })
      return
    }

    const currentScoring = formState.scoreInterpretation || {}
    const currentSection = currentScoring[scoreSection] || {
      type: "numeric",
      ranges: [],
    }

    currentSection.ranges.push(newRange)

    setFormState((prev) => ({
      ...prev,
      scoreInterpretation: {
        ...currentScoring,
        [scoreSection]: currentSection,
      },
    }))

    setNewRange({
      min: 0,
      max: 0,
      interpretation: "",
      severity: "low",
    })
  }

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formState.name?.trim()) {
        enqueueSnackbar("Activity name is required", { variant: "error" })
        return
      }
      if (!formState.spec) {
        enqueueSnackbar("Activity type is required", { variant: "error" })
        return
      }

      // Update in LAMP backend
      console.log("formState", formState)
      setUpdateSettings(true)
      onSave(formState)
      console.log("Activity updated successfully", formState)
      enqueueSnackbar("Activity updated successfully", { variant: "success", autoHideDuration: 1000 })
      setIsEditing(false)
    } catch (error) {
      enqueueSnackbar(`Failed to update activity: ${error.message}`, { variant: "error" })
    }
  }

  // recording functionality here
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [recording])

  const startCamera = async () => {
    if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      enqueueSnackbar("Camera access not supported in this browser or insecure context.", { variant: "error" })
      return
    }
    try {
      const mediaStream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: audioEnabled,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      enqueueSnackbar(`Error accessing camera: ${err.message || err}`, { variant: "error" })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const toggleRecording = () => {
    if (!recording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const startRecording = () => {
    if (stream) {
      if (formState.activityGuide?.video) {
        handleFormChange("activityGuide", {
          ...formState.activityGuide,
          video: null,
        })
        setisUploadedVideo(false)
      }
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        const videoURL = URL.createObjectURL(blob)

        setRecordedChunks(chunks)

        if (previewRef.current) {
          previewRef.current.src = videoURL
          previewRef.current.load() // Force load
          previewRef.current.onloadeddata = () => {
            previewRef.current?.play()
          }
        }
        // setRecordedChunks(chunks)
        const reader = new FileReader()
        reader.onloadend = () => {
          handleFormChange("activityGuide", {
            ...formState.activityGuide,
            video: { data: reader.result, fileType: "webm", uploadedAt: new Date() },
          })
        }
        reader.readAsDataURL(blob)
      }
      recorder.start()
      setRecording(true)
      setRecordingTime(0)
    }
  }

  // const stopRecording = () => {
  //   if (mediaRecorder && mediaRecorder.state !== 'inactive') {
  //     mediaRecorder.stop()
  //     setRecording(false)
  //   }
  // }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      setRecording(false)
      // const blob = new Blob(recordedChunks, { type: 'video/webm' })
      // const reader = new FileReader()
      // reader.onloadend = () => {
      //   handleFormChange('activityGuide', {
      //     ...formState.activityGuide,
      //     video: { data : reader.result , fileType: 'webm', uploadedAt: new Date() }
      //   })
      //   console.log("acitivity guide here", formState.activityGuide, reader.result)
      // }
      // reader.readAsDataURL(blob)
    }
  }

  const toggleMic = () => {
    setAudioEnabled(!audioEnabled)
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled
      })
    }
  }

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)

      const recorder = new MediaRecorder(stream)
      setAudioRecorder(recorder)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const audioURL = URL.createObjectURL(blob)
        if (audioPreviewRef.current) {
          audioPreviewRef.current.src = audioURL
          audioPreviewRef.current.load() // Force load
        }
        setAudioChunks(chunks)

        const reader = new FileReader()
        reader.onloadend = () => {
          handleFormChange("activityGuide", {
            ...formState.activityGuide,
            audio: { data: reader.result, fileType: "webm", uploadedAt: new Date() },
          })
        }
        reader.readAsDataURL(blob)
      }

      recorder.start()
      setAudioRecording(true)
      setAudioRecordingTime(0)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      enqueueSnackbar(`Error accessing microphone: ${err.message || err}`, { variant: "error" })
    }
  }

  const stopAudioRecording = () => {
    if (audioRecorder && audioRecorder.state !== "inactive") {
      audioRecorder.stop()
      setAudioRecording(false)
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
        setAudioStream(null)
      }
    }
  }

  useEffect(() => {
    if (guideTab === 1 && isEditing) {
      if (!stream) {
        startCamera()
      }
    }
  }, [guideTab, isEditing])
  useEffect(() => {
    if (isEditing && formState.activityGuide?.video?.data && guideTab === 1) {
      setisUploadedVideo(true)
    }
  }, [isEditing, guideTab])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (audioRecording) {
      interval = setInterval(() => {
        setAudioRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [audioRecording])

  const handleclosing = () => {
    if (recording) {
      stopRecording()
    }
    if (audioRecording) {
      stopAudioRecording()
    }
    stopCamera()
    setStream(null)
    setRecordedChunks([])
    setAudioChunks([])
    onClose()
  }
  const getVideoMimeType = (fileType: string | undefined): string => {
    if (!fileType) return "video/mp4" // Default change if diff required
    if (fileType.startsWith("video/")) return fileType
    const mimeTypeMap: { [key: string]: string } = {
      webm: "video/webm",
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      m4v: "video/mp4",
      mkv: "video/x-matroska",
    }
    return mimeTypeMap[fileType.toLowerCase()] || `video/${fileType}`
  }
  const getAudioMimeType = (fileType: string | undefined): string => {
    if (!fileType) return "audio/mpeg"
    if (fileType.startsWith("audio/")) return fileType
    const mimeTypeMap: { [key: string]: string } = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      aac: "audio/aac",
      m4a: "audio/mp4",
      flac: "audio/flac",
      webm: "audio/webm",
    }
    return mimeTypeMap[fileType.toLowerCase()] || `audio/${fileType}`
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleclosing}
      TransitionProps={{
        onExited: () => {
          stopCamera()
          setStream(null)
          setRecordedChunks([])
        },
      }}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleclosing}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Activity Details
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent className={classes.content}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Activity Name"
                  value={formState.name || ""}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    value={formState.spec || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleFormChange("spec", e.target.value)}
                    required
                  >
                    {availableActivitySpecs.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec.replace("lamp.", "")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Activity Guide"
                  value={formState.activityGuide || ''}
                  disabled={!isEditing}
                  onChange={(e) => handleFormChange('activityGuide', e.target.value)}
                />
              </Grid> */}
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Activity Guide
            </Typography>
            <Tabs
              value={guideTab}
              onChange={(e, newValue) => setGuideTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<DescriptionOutlined />} label="Text" className={classes.guideTab} />
              <Tab icon={<VideocamOutlined />} label="Video" className={classes.guideTab} />
              <Tab icon={<AudiotrackOutlined />} label="Audio" className={classes.guideTab} />
            </Tabs>
            {guideTab === 0 && (
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Text Guide"
                value={formState.activityGuide?.text || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  handleFormChange("activityGuide", {
                    ...formState.activityGuide,
                    text: e.target.value,
                  })
                }
                placeholder="Enter instructions or description for the activity..."
              />
            )}
            {guideTab === 1 && (
              <Box className={classes.videoContainer}>
                {isEditing && (
                  <Box>
                    <Box className={classes.videoPreviewBox}>
                      <video ref={videoRef} className={classes.videoFeed} autoPlay muted playsInline />
                      {recording && (
                        <Typography className={classes.timer}>
                          {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
                        </Typography>
                      )}
                    </Box>
                    <Box className={classes.controlsContainer}>
                      {recordedChunks.length > 0 && (
                        <Box
                          className={classes.previewThumbnail}
                          onClick={() => handleVideoPreview(previewRef.current?.src || "", "recorded")}
                        >
                          <video ref={previewRef} autoPlay muted loop />
                        </Box>
                      )}
                      <Box
                        className={`${classes.recordButton} ${recording ? "recording" : ""}`}
                        onClick={toggleRecording}
                      >
                        {recording ? <Stop /> : null}
                      </Box>
                      <Box className={`${classes.micButton} ${!audioEnabled ? "disabled" : ""}`} onClick={toggleMic}>
                        {audioEnabled ? <Mic /> : <MicOff />}
                      </Box>
                    </Box>
                  </Box>
                )}
                {isEditing ? (
                  <Box className={classes.uploadSection}>
                    <Typography variant="subtitle1" gutterBottom>
                      Or upload a video file:
                    </Typography>
                    <input
                      type="file"
                      hidden
                      ref={videoInputRef}
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={!isEditing}
                    />
                    {formState.activityGuide?.video?.data && (
                      <Box
                        className={classes.videoPreview}
                        onClick={() => handleVideoPreview(formState.activityGuide.video.data, "uploaded")}
                      >
                        <video width="200" height="120" src={formState.activityGuide.video.data} controls />
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFormChange("activityGuide", {
                              ...formState.activityGuide,
                              video: null,
                            })
                            setisUploadedVideo(false)
                          }}
                        >
                          Remove Video
                        </Button>
                      </Box>
                    )}
                    <Box
                      onClick={() => {
                        // if (recordedChunks.length === 0) {
                        videoInputRef.current?.click()
                        // } else {
                        //   enqueueSnackbar("Please remove recorded video first", { variant: "warning" })
                        // }
                      }}
                    >
                      <VideocamOutlined style={{ fontSize: 48, color: "#666" }} />
                      <Typography>Click to upload video guide</Typography>
                    </Box>
                  </Box>
                ) : formState.activityGuide?.video ? (
                  <Box className={classes.videoPreview}>
                    <video
                      width="100%"
                      height="auto"
                      controls
                      style={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                        maxHeight: "300px",
                      }}
                    >
                      <source
                        src={formState.activityGuide?.video?.data}
                        type={getVideoMimeType(formState.activityGuide?.video?.fileType)}
                      />
                      Your browser does not support the video tag.
                    </video>
                    <Box display="flex" alignItems="center" style={{ gap: 1 }} marginTop={1}>
                      <Typography variant="body1" style={{ marginTop: 8 }} onClick={() => handlestoredVideoPreview()}>
                        Click to view video
                      </Typography>
                      <IconButton
                        onClick={() => {
                          const audioUrl =
                            formState.activityGuide?.video?.data ||
                            (audioChunks.length > 0 ? URL.createObjectURL(new Blob(audioChunks)) : "")
                          const link = document.createElement("a")
                          link.href = audioUrl
                          link.download = `video_guide_${activity.id}_${new Date().getTime()}.webm`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        <GetApp />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box className={classes.videoPreview}>
                    <Typography variant="caption" style={{ marginTop: 8 }}>
                      No video file uploaded or recorded yet.
                    </Typography>
                  </Box>
                )}
                <Dialog
                  open={previewDialogOpen}
                  onClose={() => setPreviewDialogOpen(false)}
                  className={classes.previewDialog}
                  maxWidth="lg"
                  fullWidth
                >
                  <DialogContent>
                    {/* <video 
                      className={classes.previewVideo}
                      controls 
                      src={selectedVideo?.src}
                      autoPlay
                    /> */}
                    <video
                      width="100%"
                      height="auto"
                      controls
                      style={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                        maxHeight: "300px",
                      }}
                    >
                      <source
                        src={formState.activityGuide?.video?.data}
                        type={getVideoMimeType(formState.activityGuide?.video?.fileType)}
                      />
                      Your browser does not support the video tag.
                    </video>

                    <Box className={classes.videoInfo}>
                      <Typography>
                        {selectedVideo?.type === "recorded" ? "Recorded" : "Uploaded"} at:{" "}
                        {selectedVideo?.timestamp?.toLocaleString()}
                      </Typography>
                      <Typography>
                        Duration: {selectedVideo?.duration ? Math.round(selectedVideo.duration) + "s" : "N/A"}
                      </Typography>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}
            {/* {guideTab === 1 && (
              <Box>
                <Box className={classes.videoPreviewBox}>
                  <video
                    ref={videoRef}
                    className={classes.videoFeed}
                    autoPlay
                    muted
                    playsInline
                  />
                  {recording && (
                    <Typography className={classes.timer}>
                      {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
                    </Typography>
                  )}
                </Box>
                <Box className={classes.controlsContainer}>
                  {recordedChunks.length > 0 && (
                    <Box className={classes.previewThumbnail}>
                      <video ref={previewRef} autoPlay muted loop />
                    </Box>
                  )}
                  <Box
                    className={`${classes.recordButton} ${recording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                  >
                    {recording ? <Stop /> : null}
                  </Box>
                  <Box
                    className={`${classes.micButton} ${!audioEnabled ? 'disabled' : ''}`}
                    onClick={toggleMic}
                  >
                    {audioEnabled ? <Mic /> : <MicOff />}
                  </Box>
                </Box>
              </Box>
            )} */}
            {/* {guideTab === 1 && (
              <Box className={classes.uploadSection} onClick={() => isEditing && videoInputRef.current?.click()}>
              <input
                type="file"
                hidden
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={!isEditing}
              />
              {formState.activityGuide?.video ? (
                <Box className={classes.previewSection}>
                  <video controls src={formState.activityGuide.video} />
                  {isEditing && (
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFormChange('activityGuide', {
                          ...formState.activityGuide,
                          video: null
                        })
                      }}
                    >
                      Remove Video
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  <VideocamOutlined style={{ fontSize: 48, color: '#666' }} />
                  <Typography>
                    {isEditing ? 'Click to upload video guide' : 'No video guide uploaded'}
                  </Typography>
                </>
              )}
            </Box>
            )} */}
            {/* {guideTab === 2 && (
              <Box className={classes.videoContainer}>
                {isEditing && (
                  <Box>
                    <Box className={classes.controlsContainer}>
                      {audioChunks.length > 0 && (
                        <Box className={classes.previewThumbnail}>
                          <audio ref={audioPreviewRef} controls />
                        </Box>
                      )}
                      <Box
                        className={`${classes.recordButton} ${audioRecording ? 'recording' : ''}`}
                        onClick={() => audioRecording ? stopAudioRecording() : startAudioRecording()}
                      >
                        {audioRecording ? <Stop /> : <Mic />}
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {isEditing ? (
                  <Box className={classes.uploadSection}>
                    <Typography variant="subtitle1" gutterBottom>
                      Or upload an audio file:
                    </Typography>
                    <input
                      type="file"
                      hidden
                      ref={audioInputRef}
                      accept="audio/*"
                      onChange={handleAudioUpload}
                    />
                    {formState.activityGuide?.audio && (
                      <Box className={classes.audioPreview}>
                        <audio controls src={formState.activityGuide.audio} />
                        <Button 
                          variant="outlined" 
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFormChange('activityGuide', {
                              ...formState.activityGuide,
                              audio: null
                            })
                          }}
                        >
                          Remove Audio
                        </Button>
                      </Box>
                    )}
                    <Box onClick={() => audioInputRef.current?.click()}>
                      <AudiotrackOutlined style={{ fontSize: 48, color: '#666' }} />
                      <Typography>Click to upload audio guide</Typography>
                    </Box>
                  </Box>
                ) : (
                  formState.activityGuide?.audio ? (
                    <Box className={classes.audioPreview}>
                      <audio 
                        controls 
                        src={formState.activityGuide.audio}
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="caption" align="center">
                        No audio file uploaded or recorded yet.
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            )} */}
            {guideTab === 2 && (
              <Box className={classes.videoContainer}>
                {isEditing && (
                  <>
                    {/* Recording section */}
                    <Box className={classes.controlsContainer} sx={{ justifyContent: "center", mb: 4 }}>
                      <Box
                        className={`${classes.recordButton} ${audioRecording ? "recording" : ""}`}
                        onClick={() => (audioRecording ? stopAudioRecording() : startAudioRecording())}
                        style={{
                          width: "80px",
                          height: "80px",
                          backgroundColor: "#e74c3c",
                        }}
                      >
                        {audioRecording ? <Stop /> : <Mic style={{ fontSize: 32 }} />}
                      </Box>
                      {audioRecording && (
                        <Typography variant="h6" style={{ position: "absolute", top: "-30px" }}>
                          {new Date(audioRecordingTime * 1000).toISOString().substr(14, 5)}
                        </Typography>
                      )}
                    </Box>

                    {/* Upload section */}
                    <Box className={classes.uploadSection} onClick={() => audioInputRef.current?.click()}>
                      <Typography variant="subtitle1" align="center" gutterBottom>
                        Or upload an audio file:
                      </Typography>
                      <input type="file" hidden ref={audioInputRef} accept="audio/*" onChange={handleAudioUpload} />
                      <Box style={{ cursor: "pointer" }}>
                        <AudiotrackOutlined style={{ fontSize: 48, color: "#666" }} />
                        <Typography>Click to upload audio guide</Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {/* Preview section for both recorded and uploaded audio */}
                {(formState.activityGuide?.audio || audioChunks.length > 0) && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        width: "100%",
                      }}
                    >
                      {formState.activityGuide?.audio ? (
                        <audio controls style={{ flexGrow: 1 }}>
                          <source
                            src={formState.activityGuide.audio.data}
                            type={getAudioMimeType(formState.activityGuide.audio.fileType)}
                          />
                          Your browser does not support the audio element.
                        </audio>
                      ) : audioChunks.length > 0 ? (
                        <audio controls src={URL.createObjectURL(new Blob(audioChunks))} style={{ flexGrow: 1 }} />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No audio available
                        </Typography>
                      )}
                      <IconButton
                        style={{ width: "auto" }}
                        onClick={() => {
                          const audioUrl =
                            formState.activityGuide?.audio?.data ||
                            (audioChunks.length > 0 ? URL.createObjectURL(new Blob(audioChunks)) : "")
                          const link = document.createElement("a")
                          link.href = audioUrl
                          link.download = `audio_guide_${activity.id}_${new Date().getTime()}.webm`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        size="small"
                      >
                        <GetApp />
                      </IconButton>

                      {isEditing && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            handleFormChange("activityGuide", {
                              ...formState.activityGuide,
                              audio: null,
                            })
                            setAudioChunks([])
                          }}
                        >
                          Remove Audio
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            {/* {guideTab === 2 && (
              <Box className={classes.uploadSection} onClick={() => isEditing && audioInputRef.current?.click()}>
              <input
                type="file"
                hidden
                ref={audioInputRef}
                accept="audio/*"
                onChange={handleAudioUpload}
                disabled={!isEditing}
              />
              {formState.activityGuide?.audio ? (
                <Box className={classes.previewSection}>
                  <audio controls src={formState.activityGuide.audio} />
                  {isEditing && (
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFormChange('activityGuide', {
                          ...formState.activityGuide,
                          audio: null
                        })
                      }}
                    >
                      Remove Audio
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  <AudiotrackOutlined style={{ fontSize: 48, color: '#666' }} />
                  <Typography>
                    {isEditing ? 'Click to upload audio guide' : 'No audio guide uploaded'}
                  </Typography>
                </>
              )}
            </Box>
            )} */}
          </Grid>
          {/* Score Interpretation */}
          {/* {isEditing && ( */}
          <Grid item xs={12} className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Score Interpretation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Score Section</InputLabel>
                  <Select
                    value={scoreSection}
                    onChange={(e: React.ChangeEvent<{ value: any }>) => setScoreSection(e.target.value as string)}
                  >
                    <MenuItem value="total">Total Score</MenuItem>
                    <MenuItem value="speed">Speed</MenuItem>
                    <MenuItem value="accuracy">Accuracy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {scoreSection && (
                <>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Score"
                      value={newRange.min}
                      disabled={!isEditing}
                      onChange={(e) => setNewRange({ ...newRange, min: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Score"
                      value={newRange.max}
                      disabled={!isEditing}
                      onChange={(e) => setNewRange({ ...newRange, max: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Interpretation"
                      value={newRange.interpretation}
                      disabled={!isEditing}
                      onChange={(e) => setNewRange({ ...newRange, interpretation: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Severity</InputLabel>
                      <Select
                        value={newRange.severity}
                        onChange={(e) =>
                          setNewRange({
                            ...newRange,
                            severity: e.target.value as "low" | "moderate" | "high" | "severe",
                          })
                        }
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="moderate">Moderate</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="severe">Severe</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={addScoreRange}>
                      Add Range
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>

            <Box mt={2}>
              {Object.entries(formState.scoreInterpretation || {}).map(([section, schema]: [string, any]) => (
                <Box key={section} mb={2}>
                  <Typography variant="subtitle1">{section}</Typography>
                  <List>
                    {(schema?.ranges || []).map((range: any, index: number) => (
                      <ListItem key={index} className={classes.scoreRangeItem}>
                        <ListItemText
                          primary={`${range.min} - ${range.max}: ${range.interpretation}`}
                          secondary={`Severity: ${range.severity}`}
                        />
                        {isEditing && (
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={() => {
                                const newRanges = [...(schema.ranges || [])]
                                newRanges.splice(index, 1)
                                handleFormChange("scoreInterpretation", {
                                  ...formState.scoreInterpretation,
                                  [section]: { ...schema, ranges: newRanges },
                                })
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          </Grid>
          {/* )} */}

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" mt={4}>
            {isEditing ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFormState(activity)
                    setIsEditing(false)
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                Edit Activity
              </Button>
            )}
          </Box>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}
