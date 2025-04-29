import React, { useState, useEffect, useRef } from "react"
import {
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  List,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"
import ViewItems, { FieldConfig } from "../SensorsList/ViewItems"
import { VideocamOutlined, AudiotrackOutlined, DescriptionOutlined, GetApp } from "@material-ui/icons"
import { Mic, MicOff, Stop } from "@material-ui/icons"
import CloseIcon from "@material-ui/icons/Close"
import { ImageUploader } from "../../ImageUploader"
import { useStyles as ViewItemsStyles } from "../SensorsList/ViewItems"
import { SchemaList } from "./ActivityMethods"
import DynamicForm from "../../shared/DynamicForm"
import FormBuilder from "./FormBuilder"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      maxHeight: "300px",
      overflow: "auto",
      border: "1px solid rgba(224, 224, 224, 1)",
      borderRadius: 4,
    },
    table: {
      minWidth: 300,
    },
    tableCell: {
      fontSize: "0.875rem",
      padding: "8px 16px",
    },
    tableHeader: {
      fontWeight: 600,
      backgroundColor: "#f5f5f5",
    },
    codeBlock: {
      maxHeight: "300px",
      overflow: "auto",
      marginTop: theme.spacing(1),
      padding: theme.spacing(2),
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
      fontFamily: "monospace",
      fontSize: "0.875rem",
    },
    viewDivider: {
      margin: "8px 0",
    },
    developerInfoContainer: {
      marginTop: theme.spacing(1),
    },
    developerInfoItem: {
      marginBottom: theme.spacing(1.5),
    },
    infoLabel: {
      fontWeight: 600,
      display: "inline-block",
      width: "80px",
      fontSize: "0.875rem",
    },
    infoValue: {
      display: "inline-block",
      fontSize: "0.875rem",
    },
    rootContainer: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    videoPreview: {
      width: "100%",
      borderRadius: theme.shape.borderRadius,
      overflow: "hidden",
      marginTop: theme.spacing(2),
    },
    audioPreview: {
      width: "100%",
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
      backgroundColor: "#f5f5f5",
      borderRadius: theme.shape.borderRadius,
    },
    mediaControls: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing(1),
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
    scoreRange: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: "#f5f5f5",
    },
    rangeItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: theme.spacing(1),
      borderBottom: "1px solid #e0e0e0",
      "&:last-child": {
        borderBottom: "none",
      },
    },
    scheduleItem: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: "#f5f5f5",
    },
    videoContainer: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(3),
      justifyContent: "center",
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
  })
)

export interface DeveloperInfo {
  version?: string
  versionNumber?: string
  userIp?: string
  sourceUrl?: string
  browser?: string
  device?: string
  user?: string
  status?: string
  submittedOn?: string
}

export const fetchUserIp = async () => {
  try {
    const response = await fetch("https://api64.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error("Error fetching IP:", error)
    return "Unavailable"
  }
}

interface ActivityDetailItemProps {
  activity: any
  isEditing: boolean
  onSave: (updatedActivity: any) => void
  studies: Array<any>
  triggerSave?: boolean
}

const ActivityDetailItem: React.FC<ActivityDetailItemProps> = ({
  activity,
  isEditing,
  onSave,
  studies,
  triggerSave,
}) => {
  const classes = useStyles()
  const Viewitemsclasses = ViewItemsStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "video" | "audio"
    src: string
    mimeType: string
  } | null>(null)
  const [schemaListObj, setSchemaListObj] = useState({})
  // Add state for developer info editing
  const [isDeveloperInfoEditing, setIsDeveloperInfoEditing] = useState(false)

  // Additional state variables for scoreInterpretation and ActivityGuideContent
  const [guideTab, setGuideTab] = useState(0)
  const [scoreSection, setScoreSection] = useState("")
  // const videoInputRef = useRef<HTMLInputElement>(null)
  // const audioInputRef = useRef<HTMLInputElement>(null)
  // const [stream, setStream] = useState<MediaStream | null>(null)
  // const [recording, setRecording] = useState(false)
  // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  // const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  // const [recordingTime, setRecordingTime] = useState(0)
  // const [audioEnabled, setAudioEnabled] = useState(true)
  // const videoRef = useRef<HTMLVideoElement>(null)
  // const previewRef = useRef<HTMLVideoElement>(null)
  // const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  // const [audioRecording, setAudioRecording] = useState(false)
  // const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null)
  // const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  // const [audioRecordingTime, setAudioRecordingTime] = useState(0)
  // const audioRef = useRef<HTMLAudioElement>(null)
  // const audioPreviewRef = useRef<HTMLAudioElement>(null)
  // Add new range for score interpretation
  const [newRange, setNewRange] = useState({
    min: 0,
    max: 0,
    interpretation: "",
    severity: "low",
  })
  // const [activityImage, setActivityImage] = useState<string | null>(null);
  // const [selectedStudy, setSelectedStudy] = useState("");
  // const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  // const [showInFeed, setShowInFeed] = useState(true);
  // const [streakSettings, setStreakSettings] = useState({
  //   enabled: false,
  //   title: "",
  //   description: ""
  // });
  const [activityImage, setActivityImage] = useState(activity?.photo || null)
  const [activityDesc, setActivityDesc] = useState(activity?.description || null)
  const [selectedStudy, setSelectedStudy] = useState(activity?.study_id || "")
  const [selectedGroups, setSelectedGroups] = useState(activity?.groups || [])
  const [showInFeed, setShowInFeed] = useState(activity?.showInFeed ?? true)
  const [streakSettings, setStreakSettings] = useState({
    enabled: activity?.streak?.enabled ?? false,
    title: activity?.streak?.title || "",
    description: activity?.streak?.description || "",
  })
  // const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  // const [isPreviewReady, setIsPreviewReady] = useState(false)
  // const [videoData, setVideoData] = useState({
  //   stream: null,
  //   chunks: [],
  //   previewUrl: null,
  // })
  // const [videoPreviewBlob, setVideoPreviewBlob] = useState<Blob | null>(null)
  // const [videoStreamActive, setVideoStreamActive] = useState(false)

  // Form state
  const [editedValues, setEditedValues] = useState<{
    name: string
    description: string
    spec: string
    settings: any
    activityGuide: any
    category: string[]
    study: string
    groups: string[]
    image: string | null
    schedule: any[]
    formula4Fields: any
    scoreInterpretation: any
    developer_info?: {
      version?: string
      versionNumber?: string
      userIp?: string
      sourceUrl?: string
      browser?: string
      device?: string
      user?: string
      status?: string
      submittedOn?: string
    }
  }>({
    name: "",
    description: "",
    spec: "",
    settings: {},
    activityGuide: {},
    category: [],
    study: "",
    groups: [],
    image: null,
    schedule: [],
    scoreInterpretation: {},
    developer_info: {},
    formula4Fields: null,
  })
  console.log("Received activity", activity)
  LAMP.Activity.view(activity.id).then((res) => {
    console.log("Activity view response", res)
  })
  const [creatorName, setcreatorName] = useState(activity?.creator || "")
  useEffect(() => {
    const fetchname = async () => {
      const res = await LAMP.Researcher.view(activity?.creator)
      if (res) {
        setcreatorName(res.name)
      }
    }
    fetchname()
  }, [activity])
  // Video recording functions
  // const startCamera = async () => {
  //   if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
  //     enqueueSnackbar("Camera access not supported in this browser or insecure context.", { variant: "error" })
  //     return
  //   }
  //   try {
  //     const mediaStream = await window.navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: audioEnabled,
  //     })
  //     setStream(mediaStream)
  //     setVideoStreamActive(true)
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = mediaStream
  //       videoRef.current.play().catch((err) => console.error("Error playing video:", err))
  //     }
  //   } catch (err) {
  //     console.error("Error accessing camera:", err)
  //     enqueueSnackbar(`Error accessing camera: ${err.message || err}`, { variant: "error" })
  //   }
  // }

  // const stopCamera = () => {
  //   if (stream) {
  //     stream.getTracks().forEach((track) => track.stop())
  //     setStream(null)
  //     setVideoStreamActive(false)
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = null
  //     }
  //   }
  // }

  // const toggleRecording = () => {
  //   if (!recording) {
  //     startRecording()
  //   } else {
  //     stopRecording()
  //   }
  // }

  // const startRecording = () => {
  //   if (!stream || !videoStreamActive) {
  //     enqueueSnackbar("Camera stream not available", { variant: "error" })
  //     return
  //   }
  //   if (stream) {
  //     const updatedActivityGuide = {
  //       ...editedValues.activityGuide,
  //       video: null,
  //     }

  //     setEditedValues((prev) => ({
  //       ...prev,
  //       activityGuide: updatedActivityGuide,
  //     }))

  //     const recorder = new MediaRecorder(stream)
  //     setMediaRecorder(recorder)
  //     const chunks: Blob[] = []

  //     recorder.ondataavailable = (e) => {
  //       if (e.data.size > 0) {
  //         chunks.push(e.data)
  //       }
  //     }

  //     recorder.onstop = () => {
  //       const videoBlob = new Blob(chunks, { type: "video/webm" })

  //       setVideoPreviewBlob(videoBlob)
  //       const videoURL = URL.createObjectURL(videoBlob)

  //       setRecordedChunks(chunks)
  //       const stableVideoURL = URL.createObjectURL(videoBlob)
  //       setVideoPreviewUrl(stableVideoURL) // Add new state for video URL

  //       // if (previewRef.current) {
  //       //   previewRef.current.src = stableVideoURL
  //       //   previewRef.current.load()
  //       //   previewRef.current.onloadeddata = () => {
  //       //     console.log(previewRef.current)
  //       //     previewRef.current?.play()
  //       //   }
  //       // }

  //       const reader = new FileReader()
  //       reader.onloadend = () => {
  //         const updatedActivityGuide = {
  //           ...editedValues.activityGuide,
  //           video: {
  //             data: reader.result,
  //             fileType: "webm",
  //             uploadedAt: new Date(),
  //           },
  //         }

  //         setEditedValues((prev) => ({
  //           ...prev,
  //           activityGuide: updatedActivityGuide,
  //         }))
  //       }
  //       reader.readAsDataURL(videoBlob)
  //       // return () => {
  //       //   URL.revokeObjectURL(stableVideoURL);
  //       // };
  //     }

  //     recorder.start()
  //     setRecording(true)
  //     setRecordingTime(0)
  //   }
  // }

  // const stopRecording = () => {
  //   if (mediaRecorder && mediaRecorder.state !== "inactive") {
  //     mediaRecorder.stop()
  //     setRecording(false)
  //   }
  // }

  // const toggleMic = () => {
  //   setAudioEnabled(!audioEnabled)
  //   if (stream) {
  //     stream.getAudioTracks().forEach((track) => {
  //       track.enabled = !audioEnabled
  //     })
  //   }
  // }

  // Audio recording functions
  // const startAudioRecording = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  //     setAudioStream(stream)

  //     const recorder = new MediaRecorder(stream)
  //     setAudioRecorder(recorder)
  //     const chunks: Blob[] = []

  //     recorder.ondataavailable = (e) => {
  //       if (e.data.size > 0) {
  //         chunks.push(e.data)
  //       }
  //     }

  //     recorder.onstop = () => {
  //       const blob = new Blob(chunks, { type: "audio/webm" })
  //       const audioURL = URL.createObjectURL(blob)
  //       if (audioPreviewRef.current) {
  //         audioPreviewRef.current.src = audioURL
  //         audioPreviewRef.current.load()
  //       }
  //       setAudioChunks(chunks)

  //       const reader = new FileReader()
  //       reader.onloadend = () => {
  //         const updatedActivityGuide = {
  //           ...editedValues.activityGuide,
  //           audio: {
  //             data: reader.result,
  //             fileType: "webm",
  //             uploadedAt: new Date(),
  //           },
  //         }

  //         setEditedValues((prev) => ({
  //           ...prev,
  //           activityGuide: updatedActivityGuide,
  //         }))
  //       }
  //       reader.readAsDataURL(blob)
  //     }

  //     recorder.start()
  //     setAudioRecording(true)
  //     setAudioRecordingTime(0)
  //   } catch (err) {
  //     console.error("Error accessing microphone:", err)
  //     enqueueSnackbar(`Error accessing microphone: ${err.message || err}`, { variant: "error" })
  //   }
  // }

  // const stopAudioRecording = () => {
  //   if (audioRecorder && audioRecorder.state !== "inactive") {
  //     audioRecorder.stop()
  //     setAudioRecording(false)
  //     if (audioStream) {
  //       audioStream.getTracks().forEach((track) => track.stop())
  //       setAudioStream(null)
  //     }
  //   }
  // }

  // File upload handlers
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const mimeType = file.type || "video/webm"
        const dataUrl = reader.result as string

        const updatedActivityGuide = {
          ...editedValues.activityGuide,
          video: {
            data: dataUrl.startsWith("data:") ? dataUrl : `data:${mimeType}base64,${dataUrl.split(",")[1]}`,
            fileType: mimeType.split("/")[1],
            uploadedAt: new Date(),
          },
        }

        setEditedValues((prev) => ({
          ...prev,
          activityGuide: updatedActivityGuide,
        }))
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

        const updatedActivityGuide = {
          ...editedValues.activityGuide,
          audio: {
            data: dataUrl.startsWith("data:") ? dataUrl : `data:${mimeType}base64,${dataUrl.split(",")[1]}`,
            fileType: mimeType.split("/")[1],
            uploadedAt: new Date(),
          },
        }

        setEditedValues((prev) => ({
          ...prev,
          activityGuide: updatedActivityGuide,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Score interpretation methods
  const addScoreRange = () => {
    if (!scoreSection) {
      enqueueSnackbar("Please select a score section", { variant: "error" })
      return
    }

    const currentScoring = editedValues.scoreInterpretation || {}
    const currentSection = currentScoring[scoreSection] || {
      type: "numeric",
      ranges: [],
    }

    currentSection.ranges.push(newRange)

    setEditedValues((prev) => ({
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

  // Initialize form data
  // useEffect(() => {
  //   if (activity) {
  //     setSelectedStudy(activity.study_id);
  //     setSelectedGroups(activity.groups || []);
  //   }
  //   // Load saved developer info from tags
  //   // LAMP.Type.getAttachment(activity.id, "emersive.activity.developer_info").then((res:any)=>{ console.log("emersive.activity.developer_info", res); })
  //   // LAMP.Type.getAttachment(activity.id, "emersive.activity.details").then((res:any)=>{ console.log("emersive.activity.details", res); })
  //   if (activity?.id) {
  //     const devres = await LAMP.Type.getAttachment(activity.id, "emersive.activity.developer_info")
  //     let developer_info = null;
  //     if (devres.error === undefined && devres.data) {
  //       developer_info = devres.data;
  //     }
  //     let activity_description = null;
  //     const res = await LAMP.Type.getAttachment(activity.id, "emersive.activity.details")
  //     if (res.data) {
  //       const attachmentData = res.data;
  //       activity_description =  attachmentData.description
  //       setActivityImage(attachmentData.photo)
  //       setStreakSettings(attachmentData.streak || {
  //         enabled: false,
  //         title: "",
  //         description: ""
  //       })
  //       setShowInFeed(attachmentData.showInFeed ?? true)
  //       console.log("Loaded activity details:", attachmentData);
  //     }
  //     setEditedValues({
  //       name: activity?.name || "",
  //       description: activity?.description || activity_description || "",
  //       spec: activity?.spec || "",
  //       study: activity.study_id || "",
  //       groups: activity.groups || [],
  //       image: activity.photo || null,
  //       settings: activity?.settings || {},
  //       activityGuide: activity?.activityGuide || {},
  //       category: activity?.category || [],
  //       schedule: activity?.schedule || [],
  //       scoreInterpretation: activity?.scoreInterpretation || {},
  //       developer_info: developer_info || {}
  //     });
  //   }
  // }, [activity]);
  useEffect(() => {
    setSchemaListObj(SchemaList())
  }, [])
  useEffect(() => {
    const initializeData = async () => {
      if (!activity?.id) return

      try {
        // Set initial basic values
        setSelectedStudy(activity.study_id)
        setSelectedGroups(activity.groups || [])

        // Fetch developer info
        let developer_info = null
        const devRes = (await LAMP.Type.getAttachment(activity.id, "emersive.activity.developer_info")) as any
        if (devRes.error == undefined && devRes.data) {
          developer_info = Array.isArray(devRes.data) ? devRes.data[0] : devRes.data
        }
        console.log("devRes", devRes, developer_info)

        // Fetch activity details
        let activity_description = activity?.description
        let activity_image = activity?.photo
        let activity_streak = {
          enabled: false,
          title: "",
          description: "",
        }
        let activity_showInFeed = true

        const detailsRes = (await LAMP.Type.getAttachment(activity.id, "emersive.activity.details")) as any
        if (detailsRes.data) {
          const attachmentData = Array.isArray(detailsRes.data) ? detailsRes.data[0] : detailsRes.data
          activity_description = attachmentData.description || activity_description
          activity_image = attachmentData.photo || activity_image
          activity_streak = attachmentData.streak || activity_streak
          activity_showInFeed = attachmentData.showInFeed ?? activity_showInFeed
        }
        console.log("detailsRes", detailsRes, activity_description, activity_image)

        // Set all states at once after getting all data
        setActivityDesc(activity_description)
        setActivityImage(activity_image)
        setStreakSettings(activity_streak)
        setShowInFeed(activity_showInFeed)

        // Set edited values with all fetched data
        setEditedValues({
          name: activity?.name || "",
          description: activity_description || "",
          spec: activity?.spec || "",
          study: activity.study_id || "",
          groups: activity.groups || [],
          image: activity_image,
          settings: activity?.settings || {},
          activityGuide: activity?.activityGuide || {},
          category: activity?.category || [],
          schedule: activity?.schedule || [],
          scoreInterpretation: activity?.scoreInterpretation || {},
          developer_info: developer_info || {},
          formula4Fields: activity?.formula4Fields || "",
        })
      } catch (error) {
        console.error("Error initializing activity data:", error)
        // Set default values in case of error
        setEditedValues({
          name: activity?.name || "",
          description: activity?.description || "",
          spec: activity?.spec || "",
          study: activity.study_id || "",
          groups: activity.groups || [],
          image: activity?.photo || null,
          settings: activity?.settings || {},
          activityGuide: activity?.activityGuide || {},
          category: activity?.category || [],
          schedule: activity?.schedule || [],
          scoreInterpretation: activity?.scoreInterpretation || {},
          developer_info: {},
          formula4Fields: activity?.formula4Fields || "",
        })
      }
    }

    initializeData()
  }, [activity])

  useEffect(() => {
    if (triggerSave && isEditing) {
      handleSave()
    }
  }, [triggerSave])

  // useEffect(() => {
  //   let interval: NodeJS.Timeout
  //   if (recording) {
  //     interval = setInterval(() => {
  //       setRecordingTime((prev) => prev + 1)
  //     }, 1000)
  //   }
  //   return () => clearInterval(interval)
  // }, [recording])

  // useEffect(() => {
  //   let interval: NodeJS.Timeout
  //   if (audioRecording) {
  //     interval = setInterval(() => {
  //       setAudioRecordingTime((prev) => prev + 1)
  //     }, 1000)
  //   }
  //   return () => clearInterval(interval)
  // }, [audioRecording])

  // useEffect(() => {
  //   // Handle camera initialization
  //   if (guideTab === 1 && isEditing) {
  //     startCamera()
  //   }

  //   return () => {
  //     // Cleanup
  //     stopCamera()
  //     if (videoPreviewUrl) {
  //       URL.revokeObjectURL(videoPreviewUrl)
  //     }
  //     setVideoPreviewBlob(null)
  //     setVideoPreviewUrl(null)
  //     setIsPreviewReady(false)
  //   }
  // }, [guideTab, isEditing])

  // useEffect(() => {
  //   if (previewRef.current && videoPreviewUrl) {
  //     previewRef.current.load()
  //   }
  // }, [videoPreviewUrl])

  const handleSaveDeveloperInfo = async () => {
    setLoading(true)
    try {
      const currentDate = new Date().toISOString()
      const userip = await fetchUserIp()
      console.log("userip", userip)
      const developerInfo = {
        ...editedValues.developer_info,
        userIp: userip, // Default
        browser: navigator.userAgent
          ? navigator.userAgent.match(/chrome|firefox|safari|edge|opera/i)?.[0] || "Chrome"
          : "Chrome",
        device:
          navigator.userAgent && /windows/i.test(navigator.userAgent)
            ? "Windows"
            : navigator.userAgent && /mac/i.test(navigator.userAgent)
            ? "Mac OS"
            : navigator.userAgent && /android/i.test(navigator.userAgent)
            ? "Android"
            : navigator.userAgent && /iphone|ipad/i.test(navigator.userAgent)
            ? "iOS"
            : "Windows",
        submittedOn: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
          new Date().getDate()
        ).padStart(2, "0")} ${String(new Date().getHours()).padStart(2, "0")}:${String(
          new Date().getMinutes()
        ).padStart(2, "0")}:${String(new Date().getSeconds()).padStart(2, "0")}`,
      }

      await LAMP.Type.setAttachment(activity.id, "me", "emersive.activity.developer_info", {
        developer_info: developerInfo,
      })

      await Service.updateMultipleKeys(
        "activities",
        {
          activities: [
            {
              id: activity.id,
              developer_info: developerInfo,
            },
          ],
        },
        ["developer_info"],
        "id"
      )

      setEditedValues((prev) => ({
        ...prev,
        developer_info: developerInfo,
      }))

      enqueueSnackbar(t("Successfully updated developer info."), {
        variant: "success",
      })

      setIsDeveloperInfoEditing(false)
    } catch (error) {
      console.error("Error updating developer info:", error)
      enqueueSnackbar(t("An error occurred while updating the developer info."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (newStatus) => {
    setLoading(true)
    try {
      const developerInfo = {
        ...editedValues.developer_info,
        status: newStatus || "Read",
      }

      await LAMP.Type.setAttachment(activity.id, "me", "emersive.activity.developer_info", {
        developer_info: developerInfo,
      })

      await Service.updateMultipleKeys(
        "activities",
        {
          activities: [
            {
              id: activity.id,
              developer_info: developerInfo,
            },
          ],
        },
        ["developer_info"],
        "id"
      )

      setEditedValues((prev) => ({
        ...prev,
        developer_info: developerInfo,
      }))

      enqueueSnackbar(t("Status updated successfully."), {
        variant: "success",
      })
    } catch (error) {
      console.error("Error updating status:", error)
      enqueueSnackbar(t("An error occurred while updating the status."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = {
        name: editedValues.name?.trim(),
        spec: editedValues.spec,
        settings: editedValues.settings,
        activityGuide: editedValues.activityGuide,
        category: editedValues.category,
        groups: editedValues.groups,
        scoreInterpretation: editedValues.scoreInterpretation,
        photo: editedValues.image,
        showFeed: showInFeed,
        streak: streakSettings,
      }
      // TODO Add more fields for updates
      const result = await LAMP.Activity.update(activity.id, updateData as any)
      await LAMP.Type.setAttachment(activity.id, "me", "emersive.activity.developer_info", {
        developer_info: editedValues.developer_info,
      })
      await LAMP.Type.setAttachment(activity.id, "me", "emersive.activity.details", {
        description: editedValues.description,
        photo: editedValues.image,
        streak: streakSettings,
        showFeed: showInFeed,
      })
      console.log("save handler", updateData, editedValues)
      // Update in local DB
      await Service.updateMultipleKeys(
        "activities",
        {
          activities: [
            {
              id: activity.id,
              ...updateData,
            },
          ],
        },
        Object.keys(updateData),
        "id"
      )

      enqueueSnackbar(t("Successfully updated activity."), {
        variant: "success",
      })

      onSave({
        ...activity,
        ...updateData,
      })
    } catch (error) {
      console.error("Error updating activity:", error)
      enqueueSnackbar(t("An error occurred while updating the activity."), {
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewMedia = (type: "video" | "audio", src: string, mimeType: string) => {
    setSelectedMedia({
      type,
      src,
      mimeType,
    })
    setPreviewDialogOpen(true)
  }

  const getVideoMimeType = (fileType: string | undefined): string => {
    if (!fileType) return "video/mp4" // Default
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

  // Define fields for the ViewItems component
  const fields: FieldConfig[] = [
    {
      id: "name",
      label: t("Name"),
      value: activity?.name || "",
      editable: true,
    },
    {
      id: "image",
      label: t("Activity Image"),
      value: activityImage,
      editable: true,
      type: "image",
    },
    {
      id: "spec",
      label: t("Activity Type"),
      value: activity?.spec?.replace("lamp.", "") || "",
      editable: false,
    },
    {
      id: "description",
      label: t("Activity Description"),
      value: activityDesc || activity?.description || "",
      editable: true,
      type: "multiline",
    },
    {
      id: "study_name",
      label: t("Study Name"),
      value: activity?.study_name || "",
      editable: false,
    },
    // {
    //   id: "study",
    //   label: t("Choose Study"),
    //   value: selectedStudy,
    //   editable: true,
    //   hide: true,
    //   type: "select",
    //   options: studies.map((study) => ({
    //     value: study.id,
    //     label: study.name,
    //   })),
    // },
    {
      id: "groups",
      label: t("Groups"),
      value: selectedGroups,
      editable: true,
      type: "multiselect",
      options:
        studies
          .find((s) => s.id === selectedStudy)
          ?.gname.map((group) => ({
            value: group,
            label: group,
            disabled: false,
          })) || [],
    },
    {
      id: "id",
      label: t("Activity ID"),
      value: activity?.id || "",
      editable: false,
    },
    {
      id: "category",
      label: t("Customize which Tab this Activity appears in"),
      value: activity?.category || [], // Should be an array
      editable: true,
      type: "multiselect",
      options: [
        { value: "assess", label: t("Assess") },
        { value: "learn", label: t("Learn") },
        { value: "manage", label: t("Manage") },
        { value: "prevent", label: t("Portal") },
      ],
    },
    {
      id: "version",
      label: t("Current Version"),
      value: activity?.currentVersion?.name || "v1.0",
      editable: false,
    },
    {
      id: "creator",
      label: t("Creator"),
      value: creatorName || "",
      editable: false,
    },
    {
      id: "createdAt",
      label: t("Created At"),
      value: activity?.createdAt ? new Date(activity.createdAt).toLocaleString() : "",
      editable: false,
    },
  ]

  const additionalSettings = (
    <Box className={Viewitemsclasses.fieldContainer}>
      <Typography className={Viewitemsclasses.viewLabel}>{t("Participant Feed")}</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={showInFeed}
            onChange={(e) => {
              setShowInFeed(e.target.checked)
              setEditedValues((prev) => ({
                ...prev,
                showInFeed: e.target.checked,
              }))
            }}
            disabled={!isEditing}
          />
        }
        label={t("Show this activity in participant feed.")}
      />
      <Divider className={Viewitemsclasses.viewDivider} />
      <Typography className={Viewitemsclasses.viewLabel}>{t("Streak Settings")}</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={streakSettings.enabled}
            onChange={(e) => {
              const newSettings = {
                ...streakSettings,
                enabled: e.target.checked,
              }
              setStreakSettings(newSettings)
              setEditedValues((prev) => ({
                ...prev,
                streak: newSettings,
              }))
            }}
            disabled={!isEditing}
          />
        }
        label={t("Enable streak popup")}
      />
      {streakSettings.enabled && (
        <Box className={Viewitemsclasses.fieldContainer}>
          <TextField
            fullWidth
            className={Viewitemsclasses.viewInput}
            label={t("Streak Title")}
            value={streakSettings.title}
            onChange={(e) => {
              const newSettings = {
                ...streakSettings,
                title: e.target.value,
              }
              setStreakSettings(newSettings)
              setEditedValues((prev) => ({
                ...prev,
                streak: newSettings,
              }))
            }}
            disabled={!isEditing}
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            className={Viewitemsclasses.viewInput}
            multiline
            minRows={3}
            label={t("Streak Description")}
            value={streakSettings.description}
            onChange={(e) => {
              const newSettings = {
                ...streakSettings,
                description: e.target.value,
              }
              setStreakSettings(newSettings)
              setEditedValues((prev) => ({
                ...prev,
                streak: newSettings,
              }))
            }}
            disabled={!isEditing}
            variant="outlined"
            size="small"
          />
        </Box>
      )}
    </Box>
  )

  // Create tab content for settings
  const SettingsContent = () => {
    const [localSettings, setLocalSettings] = useState(editedValues.settings || {})
    const [localFormula, setLocalFormula] = useState(editedValues.formula4Fields || "")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const handleSaveSettings = () => {
      setEditedValues((prev) => ({
        ...prev,
        formula4Fields: localFormula,
        settings: localSettings,
      }))
      setHasUnsavedChanges(false)
      enqueueSnackbar(t("Settings saved. Click Save at the bottom of the page to apply all changes."), {
        variant: "success",
      })
    }
    useEffect(() => {
      setLocalSettings(editedValues.settings || {})
      setLocalFormula(editedValues.formula4Fields || "")
      setHasUnsavedChanges(false)
    }, [editedValues.spec]) // Only update when spec changes to prevent loops

    return (
      <Box mt={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            {t("Activity Settings")}
          </Typography>
          <Box>
            {hasUnsavedChanges && (
              <Typography variant="body2" color="error" style={{ marginRight: 16 }}>
                {t("You have unsaved changes")}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              // disabled={!hasUnsavedChanges || !isEditing}
            >
              {t("Save Settings")}
            </Button>
          </Box>
        </Box>
        {editedValues.spec === "lamp.form_builder" ? (
          <FormBuilder
            onChange={(formData) => {
              setLocalFormula(formData.formula)
              setLocalSettings(formData.fields)
              setHasUnsavedChanges(true)
            }}
            formFieldsProp={localSettings}
            formula={localFormula}
          />
        ) : Object.keys(schemaListObj).includes(editedValues.spec) ? (
          <DynamicForm
            schema={schemaListObj[editedValues.spec]}
            initialData={{
              settings: localSettings,
              spec: editedValues.spec,
            }}
            onChange={(x) => {
              console.log("Settings updated locally:", x)
              setLocalSettings(x.settings || {})
              setHasUnsavedChanges(true)
            }}
          />
        ) : (
          <Box className={classes.codeBlock}>
            <pre>{JSON.stringify(activity?.settings || {}, null, 2)}</pre>
          </Box>
        )}
      </Box>
    )
  }

  // const ActivityGuideContent = () => (
  //   <Box>
  //     <Tabs
  //       value={guideTab}
  //       onChange={(e, newValue) => setGuideTab(newValue)}
  //       indicatorColor="primary"
  //       textColor="primary"
  //       style={{ marginBottom: 16 }}
  //     >
  //       <Tab icon={<DescriptionOutlined />} label={t("Text")} />
  //       <Tab icon={<VideocamOutlined />} label={t("Video")} />
  //       <Tab icon={<AudiotrackOutlined />} label={t("Audio")} />
  //     </Tabs>

  //     {guideTab === 0 && (
  //       <TextField
  //         fullWidth
  //         multiline
  //         rows={4}
  //         variant="outlined"
  //         label={t("Text Guide")}
  //         value={editedValues.activityGuide?.text || ""}
  //         disabled={!isEditing}
  //         onChange={(e) => {
  //           const updatedActivityGuide = {
  //             ...editedValues.activityGuide,
  //             text: e.target.value,
  //           }

  //           setEditedValues((prev) => ({
  //             ...prev,
  //             activityGuide: updatedActivityGuide,
  //           }))
  //         }}
  //         placeholder={t("Enter instructions or description for the activity...")}
  //       />
  //     )}

  //     {guideTab === 1 && (
  //       <Box className={classes.videoContainer || ""}>
  //         {isEditing ? (
  //           <>
  //             <Box className={classes.videoPreviewBox || ""}>
  //               <video ref={videoRef} className={classes.videoFeed || ""} autoPlay muted playsInline
  //                 style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
  //                 />
  //               {recording && (
  //                 <Typography className={classes.timer || ""}>
  //                   {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
  //                 </Typography>
  //               )}
  //             </Box>
  //             <Box className={classes.controlsContainer || ""}>
  //               {/* {recordedChunks.length > 0 && (
  //                 <Box
  //                   className={classes.previewThumbnail || ""}
  //                   onClick={() => handleViewMedia("video", previewRef.current?.src || "", "video/webm")}
  //                 >
  //                   <video ref={previewRef} autoPlay muted loop />
  //                 </Box>
  //               )} */}
  //               {videoPreviewBlob && (
  //                 <Box className={classes.previewThumbnail}>
  //                   <div style={{ position: 'relative', width: '100%', height: '100%' }}>
  //                     <video
  //                       ref={previewRef}
  //                       key={videoPreviewUrl || 'preview'} // Add key to force remount
  //                       src={videoPreviewUrl}
  //                       autoPlay
  //                       muted
  //                       loop
  //                       playsInline
  //                       controls={false}
  //                       style={{ width: "100%", height: "100%", objectFit: "cover" }}
  //                       onLoadedData={() => setIsPreviewReady(true)}
  //                     />
  //                     {!isPreviewReady && (
  //                       <div style={{
  //                         position: 'absolute',
  //                         top: 0,
  //                         left: 0,
  //                         right: 0,
  //                         bottom: 0,
  //                         display: 'flex',
  //                         justifyContent: 'center',
  //                         alignItems: 'center',
  //                         backgroundColor: 'rgba(0,0,0,0.3)'
  //                       }}>
  //                         <CircularProgress size={24} color="secondary" />
  //                       </div>
  //                     )}
  //                   </div>
  //                 </Box>
  //               )}
  //               <Box
  //                 onClick={toggleRecording}
  //                 style={{
  //                   width: 64,
  //                   height: 64,
  //                   backgroundColor: "#f44336",
  //                   borderRadius: recording ? 8 : "50%",
  //                   display: "flex",
  //                   justifyContent: "center",
  //                   alignItems: "center",
  //                   cursor: "pointer",
  //                 }}
  //               >
  //                 {recording ? <Stop /> : null}
  //               </Box>
  //               <Box
  //                 onClick={toggleMic}
  //                 style={{
  //                   width: 48,
  //                   height: 48,
  //                   backgroundColor: audioEnabled ? "#fff" : "#e0e0e0",
  //                   borderRadius: "50%",
  //                   display: "flex",
  //                   justifyContent: "center",
  //                   alignItems: "center",
  //                   cursor: "pointer",
  //                 }}
  //               >
  //                 {audioEnabled ? <Mic /> : <MicOff />}
  //               </Box>
  //             </Box>

  //             <Box
  //               style={{
  //                 backgroundColor: "#f5f5f5",
  //                 borderRadius: 8,
  //                 textAlign: "center",
  //                 border: "2px dashed #ccc",
  //                 cursor: "pointer",
  //                 marginTop: 24,
  //                 padding: 16,
  //               }}
  //               onClick={() => videoInputRef.current?.click()}
  //             >
  //               <Typography variant="subtitle1" gutterBottom>
  //                 {t("Or upload a video file:")}
  //               </Typography>
  //               <input
  //                 type="file"
  //                 hidden
  //                 ref={videoInputRef}
  //                 accept="video/*"
  //                 onChange={handleVideoUpload}
  //                 disabled={!isEditing}
  //               />
  //               <VideocamOutlined style={{ fontSize: 48, color: "#666" }} />
  //               <Typography>{t("Click to upload video guide")}</Typography>
  //             </Box>
  //           </>
  //         ) : editedValues.activityGuide?.video?.data ? (
  //           <Box className={classes.videoPreview}>
  //             <video
  //               width="100%"
  //               height="auto"
  //               controls
  //               style={{
  //                 borderRadius: 8,
  //                 backgroundColor: "#f5f5f5",
  //                 maxHeight: 300,
  //               }}
  //             >
  //               <source
  //                 src={editedValues.activityGuide.video.data}
  //                 type={getVideoMimeType(editedValues.activityGuide.video.fileType)}
  //               />
  //               {t("Your browser does not support the video tag.")}
  //             </video>
  //             <Box className={classes.mediaControls}>
  //               <Button
  //                 startIcon={<VideocamOutlined />}
  //                 onClick={() =>
  //                   handleViewMedia(
  //                     "video",
  //                     editedValues.activityGuide.video.data,
  //                     getVideoMimeType(editedValues.activityGuide.video.fileType)
  //                   )
  //                 }
  //               >
  //                 {t("View Full Screen")}
  //               </Button>
  //               <IconButton
  //                 onClick={() => {
  //                   const link = document.createElement("a")
  //                   link.href = editedValues.activityGuide.video.data
  //                   link.download = `video_guide_${activity.id}_${new Date().getTime()}.${
  //                     editedValues.activityGuide.video.fileType || "webm"
  //                   }`
  //                   document.body.appendChild(link)
  //                   link.click()
  //                   document.body.removeChild(link)
  //                 }}
  //               >
  //                 <GetApp />
  //               </IconButton>
  //             </Box>
  //           </Box>
  //         ) : (
  //           <Box display="flex" justifyContent="center" alignItems="center" py={4}>
  //             <Typography variant="body1" color="textSecondary">
  //               {t("No video guide available")}
  //             </Typography>
  //           </Box>
  //         )}
  //       </Box>
  //     )}

  //     {guideTab === 2 && (
  //       <Box className={classes.videoContainer || ""}>
  //         {isEditing ? (
  //           <>
  //             <Box
  //               style={{
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 marginBottom: 32,
  //               }}
  //             >
  //               <Box
  //                 onClick={() => (audioRecording ? stopAudioRecording() : startAudioRecording())}
  //                 style={{
  //                   width: 80,
  //                   height: 80,
  //                   backgroundColor: "#e74c3c",
  //                   borderRadius: audioRecording ? 8 : "50%",
  //                   display: "flex",
  //                   justifyContent: "center",
  //                   alignItems: "center",
  //                   cursor: "pointer",
  //                 }}
  //               >
  //                 {audioRecording ? <Stop /> : <Mic style={{ fontSize: 32 }} />}
  //               </Box>
  //               {audioRecording && (
  //                 <Typography variant="h6" style={{ position: "absolute", top: "-30px" }}>
  //                   {new Date(audioRecordingTime * 1000).toISOString().substr(14, 5)}
  //                 </Typography>
  //               )}
  //             </Box>

  //             <Box
  //               style={{
  //                 backgroundColor: "#f5f5f5",
  //                 borderRadius: 8,
  //                 textAlign: "center",
  //                 border: "2px dashed #ccc",
  //                 cursor: "pointer",
  //                 marginTop: 24,
  //                 padding: 16,
  //               }}
  //               onClick={() => audioInputRef.current?.click()}
  //             >
  //               <Typography variant="subtitle1" align="center" gutterBottom>
  //                 {t("Or upload an audio file:")}
  //               </Typography>
  //               <input type="file" hidden ref={audioInputRef} accept="audio/*" onChange={handleAudioUpload} />
  //               <AudiotrackOutlined style={{ fontSize: 48, color: "#666" }} />
  //               <Typography>{t("Click to upload audio guide")}</Typography>
  //             </Box>
  //           </>
  //         ) : null}

  //         {(editedValues.activityGuide?.audio?.data || audioChunks.length > 0) && (
  //           <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
  //             <Box
  //               style={{
  //                 display: "flex",
  //                 alignItems: "center",
  //                 gap: 5,
  //                 width: "100%",
  //               }}
  //             >
  //               {editedValues.activityGuide?.audio?.data ? (
  //                 <audio controls style={{ flexGrow: 1 }}>
  //                   <source
  //                     src={editedValues.activityGuide.audio.data}
  //                     type={getAudioMimeType(editedValues.activityGuide.audio.fileType)}
  //                   />
  //                   {t("Your browser does not support the audio element.")}
  //                 </audio>
  //               ) : audioChunks.length > 0 ? (
  //                 <audio
  //                   controls
  //                   src={URL.createObjectURL(new Blob(audioChunks))}
  //                   style={{ flexGrow: 1 }}
  //                   ref={audioPreviewRef}
  //                 />
  //               ) : (
  //                 <Typography variant="body2" color="textSecondary">
  //                   {t("No audio available")}
  //                 </Typography>
  //               )}

  //               <IconButton
  //                 style={{ width: "auto" }}
  //                 onClick={() => {
  //                   const audioUrl =
  //                     editedValues.activityGuide?.audio?.data ||
  //                     (audioChunks.length > 0 ? URL.createObjectURL(new Blob(audioChunks)) : "")
  //                   const link = document.createElement("a")
  //                   link.href = audioUrl
  //                   link.download = `audio_guide_${activity.id}_${new Date().getTime()}.webm`
  //                   document.body.appendChild(link)
  //                   link.click()
  //                   document.body.removeChild(link)
  //                 }}
  //                 size="small"
  //               >
  //                 <GetApp />
  //               </IconButton>

  //               {isEditing && (
  //                 <Button
  //                   variant="outlined"
  //                   size="small"
  //                   onClick={() => {
  //                     const updatedActivityGuide = {
  //                       ...editedValues.activityGuide,
  //                       audio: null,
  //                     }

  //                     setEditedValues((prev) => ({
  //                       ...prev,
  //                       activityGuide: updatedActivityGuide,
  //                     }))
  //                     setAudioChunks([])
  //                   }}
  //                 >
  //                   {t("Remove Audio")}
  //                 </Button>
  //               )}
  //             </Box>
  //           </Box>
  //         )}

  //         {!editedValues.activityGuide?.audio?.data && audioChunks.length === 0 && !isEditing && (
  //           <Box display="flex" justifyContent="center" alignItems="center" py={4}>
  //             <Typography variant="body1" color="textSecondary">
  //               {t("No audio guide available")}
  //             </Typography>
  //           </Box>
  //         )}
  //       </Box>
  //     )}
  //   </Box>
  // )

  const ActivityGuideContent = () => {
    // References for media elements
    const videoRef = useRef(null)
    const previewRef = useRef(null)
    const audioPreviewRef = useRef(null)
    const videoInputRef = useRef(null)
    const audioInputRef = useRef(null)

    // Video recording states
    const [stream, setStream] = useState(null)
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [recordedChunks, setRecordedChunks] = useState([])
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState(null)
    const [videoPreviewBlob, setVideoPreviewBlob] = useState(null)
    const [isPreviewReady, setIsPreviewReady] = useState(false)
    const [videoStreamActive, setVideoStreamActive] = useState(false)

    // Audio recording states
    const [audioStream, setAudioStream] = useState(null)
    const [audioRecording, setAudioRecording] = useState(false)
    const [audioRecorder, setAudioRecorder] = useState(null)
    const [audioChunks, setAudioChunks] = useState([])
    const [audioRecordingTime, setAudioRecordingTime] = useState(0)
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null)

    // Initialize camera when tab changes to video
    useEffect(() => {
      if (guideTab === 1 && isEditing) {
        startCamera()
      }

      return () => {
        // Clean up resources when component unmounts or tab changes
        stopCamera()
        if (videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl)
        }
        if (audioPreviewUrl) {
          URL.revokeObjectURL(audioPreviewUrl)
        }
      }
    }, [guideTab, isEditing])

    // Handle recording time updates
    useEffect(() => {
      let interval
      if (recording) {
        interval = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      }
      return () => clearInterval(interval)
    }, [recording])

    useEffect(() => {
      let interval
      if (audioRecording) {
        interval = setInterval(() => {
          setAudioRecordingTime((prev) => prev + 1)
        }, 1000)
      }
      return () => clearInterval(interval)
    }, [audioRecording])

    // Start camera for video recording
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          enqueueSnackbar("Camera access not supported in this browser or insecure context.", { variant: "error" })
          return
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioEnabled,
        })

        setStream(mediaStream)
        setVideoStreamActive(true)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err)
            enqueueSnackbar(`Error playing video: ${err.message || err}`, { variant: "error" })
          })
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        enqueueSnackbar(`Error accessing camera: ${err.message || err}`, { variant: "error" })
      }
    }

    // Stop camera
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
        setVideoStreamActive(false)
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }

    // Toggle microphone for video recording
    const toggleMic = () => {
      setAudioEnabled(!audioEnabled)
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !audioEnabled
        })
      }
    }

    // Toggle video recording
    const toggleRecording = () => {
      if (!recording) {
        startRecording()
      } else {
        stopRecording()
      }
    }

    // Start video recording
    const startRecording = () => {
      if (!stream || !videoStreamActive) {
        enqueueSnackbar("Camera stream not available", { variant: "error" })
        return
      }

      // Clear any previous recording data
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
        setVideoPreviewUrl(null)
      }
      setVideoPreviewBlob(null)
      setRecordedChunks([])
      setIsPreviewReady(false)

      try {
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" })
        setMediaRecorder(recorder)
        const chunks = []

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data)
          }
        }

        recorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: "video/webm" })
          setRecordedChunks(chunks)
          setVideoPreviewBlob(videoBlob)

          const videoURL = URL.createObjectURL(videoBlob)
          setVideoPreviewUrl(videoURL)

          // Load video preview
          if (previewRef.current) {
            previewRef.current.src = videoURL
            previewRef.current.load()
          }

          // Save to activity guide
          const reader = new FileReader()
          reader.onloadend = () => {
            const updatedActivityGuide = {
              ...editedValues.activityGuide,
              video: {
                data: reader.result,
                fileType: "webm",
                uploadedAt: new Date(),
              },
            }

            setEditedValues((prev) => ({
              ...prev,
              activityGuide: updatedActivityGuide,
            }))
          }
          reader.readAsDataURL(videoBlob)
        }

        recorder.start()
        setRecording(true)
        setRecordingTime(0)
      } catch (err) {
        console.error("Error starting recording:", err)
        enqueueSnackbar(`Error starting recording: ${err.message || err}`, { variant: "error" })
      }
    }

    // Stop video recording
    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop()
        setRecording(false)
      }
    }

    // Handle video upload from file
    const handleVideoUpload = (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        // Clear previous video
        if (videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl)
        }

        const newVideoUrl = URL.createObjectURL(file)
        setVideoPreviewUrl(newVideoUrl)
        setVideoPreviewBlob(file)
        setIsPreviewReady(false)

        // Read file as data URL for saving
        const reader = new FileReader()
        reader.onloadend = () => {
          const fileType = file.type.split("/")[1] || "webm"
          const updatedActivityGuide = {
            ...editedValues.activityGuide,
            video: {
              data: reader.result,
              fileType: fileType,
              uploadedAt: new Date(),
            },
          }

          setEditedValues((prev) => ({
            ...prev,
            activityGuide: updatedActivityGuide,
          }))
        }
        reader.readAsDataURL(file)
      } catch (err) {
        console.error("Error handling video upload:", err)
        enqueueSnackbar(`Error uploading video: ${err.message || err}`, { variant: "error" })
      }
    }

    // Start audio recording
    const startAudioRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioStream(stream)

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
        setAudioRecorder(recorder)
        const chunks = []

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data)
          }
        }

        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: "audio/webm" })
          setAudioChunks(chunks)

          const audioURL = URL.createObjectURL(audioBlob)
          setAudioPreviewUrl(audioURL)

          if (audioPreviewRef.current) {
            audioPreviewRef.current.src = audioURL
            audioPreviewRef.current.load()
          }

          // Save to activity guide
          const reader = new FileReader()
          reader.onloadend = () => {
            const updatedActivityGuide = {
              ...editedValues.activityGuide,
              audio: {
                data: reader.result,
                fileType: "webm",
                uploadedAt: new Date(),
              },
            }

            setEditedValues((prev) => ({
              ...prev,
              activityGuide: updatedActivityGuide,
            }))
          }
          reader.readAsDataURL(audioBlob)
        }

        recorder.start()
        setAudioRecording(true)
        setAudioRecordingTime(0)
      } catch (err) {
        console.error("Error accessing microphone:", err)
        enqueueSnackbar(`Error accessing microphone: ${err.message || err}`, { variant: "error" })
      }
    }

    // Stop audio recording
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

    // Handle audio upload from file
    const handleAudioUpload = (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        if (audioPreviewUrl) {
          URL.revokeObjectURL(audioPreviewUrl)
        }

        const audioURL = URL.createObjectURL(file)
        setAudioPreviewUrl(audioURL)

        if (audioPreviewRef.current) {
          audioPreviewRef.current.src = audioURL
          audioPreviewRef.current.load()
        }

        const reader = new FileReader()
        reader.onloadend = () => {
          const fileType = file.type.split("/")[1] || "webm"
          const updatedActivityGuide = {
            ...editedValues.activityGuide,
            audio: {
              data: reader.result,
              fileType: fileType,
              uploadedAt: new Date(),
            },
          }

          setEditedValues((prev) => ({
            ...prev,
            activityGuide: updatedActivityGuide,
          }))
        }
        reader.readAsDataURL(file)
      } catch (err) {
        console.error("Error handling audio upload:", err)
        enqueueSnackbar(`Error uploading audio: ${err.message || err}`, { variant: "error" })
      }
    }

    // Helper function to get video mime type
    const getVideoMimeType = (fileType) => {
      if (!fileType) return "video/mp4"
      if (fileType.startsWith("video/")) return fileType

      const mimeTypeMap = {
        webm: "video/webm",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        m4v: "video/mp4",
        mkv: "video/x-matroska",
      }

      return mimeTypeMap[fileType.toLowerCase()] || `video/${fileType}`
    }

    // Helper function to get audio mime type
    const getAudioMimeType = (fileType) => {
      if (!fileType) return "audio/mpeg"
      if (fileType.startsWith("audio/")) return fileType

      const mimeTypeMap = {
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
      <Box>
        <Tabs
          value={guideTab}
          onChange={(e, newValue) => setGuideTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          style={{ marginBottom: 16 }}
        >
          <Tab icon={<DescriptionOutlined />} label={t("Text")} />
          <Tab icon={<VideocamOutlined />} label={t("Video")} />
          <Tab icon={<AudiotrackOutlined />} label={t("Audio")} />
        </Tabs>

        {guideTab === 0 && (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label={t("Text Guide")}
            value={editedValues.activityGuide?.text || ""}
            disabled={!isEditing}
            onChange={(e) => {
              const updatedActivityGuide = {
                ...editedValues.activityGuide,
                text: e.target.value,
              }

              setEditedValues((prev) => ({
                ...prev,
                activityGuide: updatedActivityGuide,
              }))
            }}
            placeholder={t("Enter instructions or description for the activity...")}
          />
        )}

        {guideTab === 1 && (
          <Box className={classes.videoContainer}>
            {isEditing ? (
              <>
                {/* Video Recording Box */}
                <Box
                  className={classes.videoPreviewBox}
                  style={{
                    backgroundColor: "#1a237e",
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                    width: "100%",
                    maxWidth: "600px",
                    margin: "0 auto",
                    marginBottom: 3,
                  }}
                >
                  <video
                    ref={videoRef}
                    className={classes.videoFeed}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  {recording && (
                    <Typography
                      style={{
                        position: "absolute",
                        top: 16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: "#fff",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        padding: "4px 12px",
                        borderRadius: "4px",
                      }}
                    >
                      {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
                    </Typography>
                  )}
                </Box>

                {/* Video Controls */}
                <Box
                  className={classes.controlsContainer}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                    padding: 2,
                    marginBottom: 3,
                  }}
                >
                  {/* Video Preview Thumbnail */}
                  {videoPreviewUrl && (
                    <Box
                      className={classes.previewThumbnail}
                      onClick={() => handleViewMedia("video", videoPreviewUrl, "video/webm")}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "2px solid #3f51b5",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <video
                        ref={previewRef}
                        src={videoPreviewUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onLoadedData={() => setIsPreviewReady(true)}
                      />

                      {!isPreviewReady && (
                        <Box
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.3)",
                          }}
                        >
                          <CircularProgress size={24} color="secondary" />
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Record Button */}
                  <Box
                    onClick={toggleRecording}
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: "#f44336",
                      borderRadius: recording ? 2 : "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      // "&:hover": {
                      //   opacity: 0.9,
                      //   transform: "scale(1.05)"
                      // }
                    }}
                  >
                    {recording ? <Stop /> : null}
                  </Box>

                  {/* Microphone Toggle Button */}
                  <Box
                    onClick={toggleMic}
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: audioEnabled ? "#fff" : "#e0e0e0",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      // "&:hover": {
                      //   opacity: 0.9
                      // }
                    }}
                  >
                    {audioEnabled ? <Mic /> : <MicOff />}
                  </Box>
                </Box>

                {/* Video Upload Box */}
                <Box
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    border: "2px dashed #ccc",
                    cursor: "pointer",
                    marginTop: 3,
                    padding: 2,
                    transition: "all 0.2s ease",
                    // "&:hover": {
                    //   borderColor: "#3f51b5",
                    //   backgroundColor: "#f0f0f0"
                    // }
                  }}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {t("Or upload a video file:")}
                  </Typography>
                  <input
                    type="file"
                    hidden
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={!isEditing}
                  />
                  <VideocamOutlined style={{ fontSize: 48, color: "#666" }} />
                  <Typography>{t("Click to upload video guide")}</Typography>
                </Box>
              </>
            ) : (
              <>
                {/* View Mode Video Preview */}
                {editedValues.activityGuide?.video?.data ? (
                  <Box className={classes.videoPreview} sx={{ mt: 2 }}>
                    <video
                      width="100%"
                      height="auto"
                      controls
                      style={{
                        borderRadius: 8,
                        backgroundColor: "#f5f5f5",
                        maxHeight: 400,
                      }}
                    >
                      <source
                        src={editedValues.activityGuide.video.data}
                        type={getVideoMimeType(editedValues.activityGuide.video.fileType)}
                      />
                      {t("Your browser does not support the video tag.")}
                    </video>
                    <Box
                      className={classes.mediaControls}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        // mt: 1
                      }}
                    >
                      <Button
                        startIcon={<VideocamOutlined />}
                        onClick={() =>
                          handleViewMedia(
                            "video",
                            editedValues.activityGuide.video.data,
                            getVideoMimeType(editedValues.activityGuide.video.fileType)
                          )
                        }
                      >
                        {t("View Full Screen")}
                      </Button>
                      <IconButton
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = editedValues.activityGuide.video.data
                          link.download = `video_guide_${activity.id}_${new Date().getTime()}.${
                            editedValues.activityGuide.video.fileType || "webm"
                          }`
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
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={4}
                    sx={{
                      // backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                      mt: 2,
                    }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      {t("No video guide available")}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {guideTab === 2 && (
          <Box className={classes.videoContainer}>
            {isEditing ? (
              <>
                {/* Audio Recording UI */}
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    // mb: 3,
                    position: "relative",
                  }}
                >
                  {/* Audio Recording Timer */}
                  {audioRecording && (
                    <Typography
                      variant="h4"
                      style={{
                        // mb: 2,
                        fontWeight: "bold",
                        color: "#f44336",
                      }}
                    >
                      {new Date(audioRecordingTime * 1000).toISOString().substr(14, 5)}
                    </Typography>
                  )}

                  {/* Audio Record Button */}
                  <Box
                    onClick={() => (audioRecording ? stopAudioRecording() : startAudioRecording())}
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#e74c3c",
                      borderRadius: audioRecording ? 2 : "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      // "&:hover": {
                      //   opacity: 0.9,
                      //   transform: "scale(1.05)"
                      // }
                    }}
                  >
                    {audioRecording ? <Stop /> : <Mic style={{ fontSize: 32 }} />}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    //  style={{ mt: 2 }}
                  >
                    {audioRecording ? t("Recording in progress...") : t("Click to start recording")}
                  </Typography>
                </Box>

                {/* Audio File Upload */}
                <Box
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    border: "2px dashed #ccc",
                    cursor: "pointer",
                    padding: 2,
                    transition: "all 0.2s ease",
                    // "&:hover": {
                    //   borderColor: "#3f51b5",
                    //   backgroundColor: "#f0f0f0"
                    // }
                  }}
                  onClick={() => audioInputRef.current?.click()}
                >
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    {t("Or upload an audio file:")}
                  </Typography>
                  <input type="file" hidden ref={audioInputRef} accept="audio/*" onChange={handleAudioUpload} />
                  <AudiotrackOutlined
                    style={{
                      fontSize: 48,
                      color: "#666",
                      //  my: 1
                    }}
                  />
                  <Typography>{t("Click to upload audio guide")}</Typography>
                </Box>
              </>
            ) : null}

            {/* Audio Preview */}
            {(editedValues.activityGuide?.audio?.data || audioPreviewUrl) && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  {editedValues.activityGuide?.audio?.data ? (
                    <audio controls style={{ flexGrow: 1 }} src={editedValues.activityGuide.audio.data}>
                      <source type={getAudioMimeType(editedValues.activityGuide.audio.fileType)} />
                      {t("Your browser does not support the audio element.")}
                    </audio>
                  ) : audioPreviewUrl ? (
                    <audio controls src={audioPreviewUrl} style={{ flexGrow: 1 }} ref={audioPreviewRef} />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      {t("No audio available")}
                    </Typography>
                  )}

                  <Box style={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => {
                        const audioUrl = editedValues.activityGuide?.audio?.data || audioPreviewUrl
                        if (!audioUrl) return

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
                        color="secondary"
                        onClick={() => {
                          const updatedActivityGuide = {
                            ...editedValues.activityGuide,
                            audio: null,
                          }

                          setEditedValues((prev) => ({
                            ...prev,
                            activityGuide: updatedActivityGuide,
                          }))

                          if (audioPreviewUrl) {
                            URL.revokeObjectURL(audioPreviewUrl)
                            setAudioPreviewUrl(null)
                          }
                          setAudioChunks([])
                        }}
                      >
                        {t("Remove Audio")}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* No Audio Message */}
            {!editedValues.activityGuide?.audio?.data && !audioPreviewUrl && !isEditing && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={4}
                style={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  // mt: 2
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  {t("No audio guide available")}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    )
  }

  // Create tab content for activity guide
  const ActivityGuideContent_prev = () => (
    <Box>
      {editedValues.activityGuide && (
        <>
          {editedValues.activityGuide.text && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                {t("Text Guide")}
              </Typography>
              <Paper elevation={0} className={classes.codeBlock}>
                <Typography variant="body2">{editedValues.activityGuide.text}</Typography>
              </Paper>
            </Box>
          )}

          {editedValues.activityGuide.video?.data && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                {t("Video Guide")}
              </Typography>
              <Box className={classes.videoPreview}>
                <video width="100%" height="auto" controls style={{ borderRadius: 8, maxHeight: 300 }}>
                  <source
                    src={editedValues.activityGuide.video.data}
                    type={getVideoMimeType(editedValues.activityGuide.video.fileType)}
                  />
                  {t("Your browser does not support the video tag.")}
                </video>
                <Box className={classes.mediaControls}>
                  <Button
                    startIcon={<VideocamOutlined />}
                    onClick={() =>
                      handleViewMedia(
                        "video",
                        editedValues.activityGuide.video.data,
                        getVideoMimeType(editedValues.activityGuide.video.fileType)
                      )
                    }
                  >
                    {t("View Full Screen")}
                  </Button>
                  <IconButton
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = editedValues.activityGuide.video.data
                      link.download = `video_guide_${activity.id}_${new Date().getTime()}.${
                        editedValues.activityGuide.video.fileType || "webm"
                      }`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <GetApp />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}

          {editedValues.activityGuide.audio?.data && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                {t("Audio Guide")}
              </Typography>
              <Box className={classes.audioPreview}>
                <audio controls style={{ width: "100%" }}>
                  <source
                    src={editedValues.activityGuide.audio.data}
                    type={getAudioMimeType(editedValues.activityGuide.audio.fileType)}
                  />
                  {t("Your browser does not support the audio element.")}
                </audio>
                <Box className={classes.mediaControls}>
                  <Typography variant="caption">
                    {t("Uploaded")}: {new Date(editedValues.activityGuide.audio.uploadedAt).toLocaleString()}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = editedValues.activityGuide.audio.data
                      link.download = `audio_guide_${activity.id}_${new Date().getTime()}.${
                        editedValues.activityGuide.audio.fileType || "webm"
                      }`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <GetApp />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}

          {!editedValues.activityGuide.text &&
            !editedValues.activityGuide.video?.data &&
            !editedValues.activityGuide.audio?.data && (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <Typography variant="body1" color="textSecondary">
                  {t("No activity guide available")}
                </Typography>
              </Box>
            )}
        </>
      )}
    </Box>
  )
  const ScoreInterpretationContent = () => (
    <Box>
      {isEditing && (
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t("Score Section")}</InputLabel>
              <Select
                value={scoreSection}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => setScoreSection(e.target.value as string)}
              >
                <MenuItem value="total">{t("Total Score")}</MenuItem>
                <MenuItem value="speed">{t("Speed")}</MenuItem>
                <MenuItem value="accuracy">{t("Accuracy")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {scoreSection && (
            <>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("Min Score")}
                  value={newRange.min}
                  onChange={(e) => setNewRange({ ...newRange, min: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("Max Score")}
                  value={newRange.max}
                  onChange={(e) => setNewRange({ ...newRange, max: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={t("Interpretation")}
                  value={newRange.interpretation}
                  onChange={(e) => setNewRange({ ...newRange, interpretation: e.target.value })}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>{t("Severity")}</InputLabel>
                  <Select
                    value={newRange.severity}
                    onChange={(e) =>
                      setNewRange({
                        ...newRange,
                        severity: e.target.value as "low" | "moderate" | "high" | "severe",
                      })
                    }
                  >
                    <MenuItem value="low">{t("Low")}</MenuItem>
                    <MenuItem value="moderate">{t("Moderate")}</MenuItem>
                    <MenuItem value="high">{t("High")}</MenuItem>
                    <MenuItem value="severe">{t("Severe")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={addScoreRange}>
                  {t("Add Range")}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {Object.keys(editedValues.scoreInterpretation || {}).length > 0 ? (
        Object.entries(editedValues.scoreInterpretation).map(([section, data]: [string, any]) => (
          <Box key={section} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Typography>
            <Paper elevation={0} className={classes.scoreRange}>
              <List>
                {data.ranges &&
                  data.ranges.map((range, index) => (
                    <ListItem key={index} className={classes.rangeItem}>
                      <ListItemText
                        primary={`${range.min} - ${range.max}: ${range.interpretation}`}
                        secondary={`${t("Severity")}: ${range.severity}`}
                      />
                      {isEditing && (
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={() => {
                              const newRanges = [...(data.ranges || [])]
                              newRanges.splice(index, 1)

                              const updatedScoreInterpretation = {
                                ...editedValues.scoreInterpretation,
                                [section]: { ...data, ranges: newRanges },
                              }

                              setEditedValues((prev) => ({
                                ...prev,
                                scoreInterpretation: updatedScoreInterpretation,
                              }))
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Box>
        ))
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <Typography variant="body1" color="textSecondary">
            {t("No score interpretation available")}
          </Typography>
        </Box>
      )}
    </Box>
  )

  const ScheduleContent = () => (
    <Box>
      {activity?.schedule && activity.schedule.length > 0 ? (
        activity.schedule.map((item, index) => (
          <Box key={index} className={classes.scheduleItem}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Start Date")}</Typography>
                <Typography variant="body2">{new Date(item.start_date).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Time")}</Typography>
                <Typography variant="body2">{new Date(item.time).toLocaleTimeString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Repeat Interval")}</Typography>
                <Typography variant="body2">{item.repeat_interval || t("None")}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">{t("Custom Times")}</Typography>
                <Typography variant="body2">
                  {item.custom_time
                    ? Array.isArray(item.custom_time)
                      ? item.custom_time.map((t) => new Date(t).toLocaleTimeString()).join(", ")
                      : t("No custom times")
                    : t("No custom times")}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <Typography variant="body1" color="textSecondary">
            {t("No schedule configured")}
          </Typography>
        </Box>
      )}
    </Box>
  )

  // Create tab content for version history
  const VersionHistoryContent = () => (
    <Box>
      <Box className={classes.tableContainer}>
        <Table size="small" className={classes.table} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Version")}</TableCell>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Name")}</TableCell>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Date")}</TableCell>
              <TableCell className={`${classes.tableCell} ${classes.tableHeader}`}>{t("Time")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activity?.versionHistory && activity.versionHistory.length > 0 ? (
              activity.versionHistory.map((version, index) => (
                <TableRow key={version.id || index}>
                  <TableCell className={classes.tableCell}>{`v${index + 1}`}</TableCell>
                  <TableCell className={classes.tableCell}>{version.name}</TableCell>
                  <TableCell className={classes.tableCell}>
                    {version.date ? new Date(version.date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className={classes.tableCell}>{version.time || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t("No version history")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )

  // Create submission info for the Developer tab
  const getSubmissionInfo = () => {
    // Ensure developer_info has default values to prevent TypeScript errors
    const developerInfo: DeveloperInfo = {
      version: editedValues.developer_info?.version || activity?.currentVersion?.name || "v1.0",
      versionNumber: editedValues.developer_info?.versionNumber || "0",
      userIp: editedValues.developer_info?.userIp || "NA",
      sourceUrl: editedValues.developer_info?.sourceUrl || "NA",
      browser: editedValues.developer_info?.browser || "NA",
      device: editedValues.developer_info?.device || "NA",
      user: editedValues.developer_info?.user || "NA",
      status: editedValues.developer_info?.status || "Read",
      submittedOn:
        editedValues.developer_info?.submittedOn ||
        (activity?.createdAt ? new Date(activity.createdAt).toLocaleString() : "NA"),
    }
    console.log("developerInfo", developerInfo)
    return {
      ...developerInfo,
      onChangeStatus: () => {
        const newStatus = developerInfo.status === "Read" ? "Active" : "Read"
        handleChangeStatus(newStatus)
      },
      isEditing: isDeveloperInfoEditing,
      onEdit: () => setIsDeveloperInfoEditing(true),
      onSave: handleSaveDeveloperInfo,
      // Let the component know which fields are editable
      editableFields: ["sourceUrl", "user"],
    }
  }

  return (
    <div className={classes.rootContainer}>
      <ViewItems
        fields={fields}
        tabs={[
          {
            id: "settings",
            label: t("Settings"),
            content: <SettingsContent />,
          },
          {
            id: "activityGuide",
            label: t("Activity Guide"),
            content: <ActivityGuideContent />,
          },
          {
            id: "scoreInterpretation",
            label: t("Score Interpretation"),
            content: <ScoreInterpretationContent />,
          },
          {
            id: "schedule",
            label: t("Schedule"),
            content: <ScheduleContent />,
          },
          {
            id: "versionHistory",
            label: t("Version History"),
            content: <VersionHistoryContent />,
          },
        ]}
        isEditing={isEditing}
        onSave={handleSave}
        onEdit={() => console.log("Edit clicked")}
        editedValues={editedValues}
        setEditedValues={setEditedValues}
        loading={loading}
        submissionInfo={getSubmissionInfo()}
        additionalContent={additionalSettings}
      />

      {/* Media Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        className={classes.previewDialog}
      >
        <DialogTitle>{selectedMedia?.type === "video" ? t("Video Preview") : t("Audio Preview")}</DialogTitle>
        <DialogContent>
          {selectedMedia?.type === "video" ? (
            <video className={classes.previewVideo} controls autoPlay>
              <source src={selectedMedia.src} type={selectedMedia.mimeType} />
              {t("Your browser does not support the video tag.")}
            </video>
          ) : (
            <audio controls autoPlay style={{ width: "100%" }}>
              <source src={selectedMedia?.src} type={selectedMedia?.mimeType} />
              {t("Your browser does not support the audio element.")}
            </audio>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)} color="primary">
            {t("Close")}
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (selectedMedia) {
                const link = document.createElement("a")
                link.href = selectedMedia.src
                const fileType = selectedMedia.mimeType.split("/")[1]
                link.download = `${selectedMedia.type}_guide_${activity.id}_${new Date().getTime()}.${fileType}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }
            }}
          >
            {t("Download")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ActivityDetailItem
