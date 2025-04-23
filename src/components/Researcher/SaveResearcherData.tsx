import { Service } from "../DBService/DBService"
import demo_db from "../../demo_db.json"
import LAMP from "lamp-core"

interface StudyObject {
  id: string
  name: string
  gname: Array<any>
  participants: Array<any>
  activities: Array<any>
  sensors: Array<any>
  sub_researchers?: {
    ResearcherID: string
    access_scope: number
  }[]

  description?: string
  purpose: "practice" | "support" | "research" | "other"
  studyType?: string
  piInstitution: string
  collaboratingInstitutions: string[]
  hasFunding: boolean
  fundingAgency?: string
  hasEthicsPermission: boolean
  ethicsPermissionDoc?: string
  adminNote?: string
  mobile?: number
  email?: string
  state: "development" | "production" | "complete"
  timestamps?: {
    sharedAt?: Date
    productionAt?: Date
    completedAt?: Date
    firstEnrollmentAt?: Date
    lastEnrollmentAt?: Date
    suspendedAt?: Date
  }
  timestamp?: Date
}

export const fetchGetData = async (authString, route, modalType) => {
  const baseUrl = "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")

  try {
    const response = await fetch(`${baseUrl}/${route}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching data from ${route}:`, error)
    throw error
  }
}

export const fetchResult = async (authString, id, type, modal) => {
  const baseUrl = "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")
  let result = await (
    await fetch(`${baseUrl}/${modal}/${id}/_lookup/${type}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      },
    })
  ).json()
  return result
}

export const fetchPostData = async (authString, id, type, modal, methodType, bodyData) => {
  const baseUrl = "https://" + (!!LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital")
  let result = await (
    await fetch(`${baseUrl}/${modal}/${id}/${type}`, {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      },
      body: JSON.stringify(bodyData),
    })
  ).json()
  return result
}

const saveStudiesAndParticipants = (result, studies, researcherId) => {
  console.log("saveStudiesAndParticipants", result)
  let participants = []
  let activities = []
  let sensors = []
  let studiesList = []
  result.studies.map((study) => {
    participants = participants.concat(study.participants)
    activities = activities.concat(study.activities)
    sensors = sensors.concat(study.sensors)
  })
  studies.map((study) => {
    studiesList = studiesList.concat(study.name)
  })

  let studiesSelected =
    localStorage.getItem("studies_" + researcherId) !== null
      ? JSON.parse(localStorage.getItem("studies_" + researcherId))
      : []
  if (studiesSelected.length === 0) {
    localStorage.setItem("studies_" + researcherId, JSON.stringify(studiesList))
    localStorage.setItem("studyFilter_" + researcherId, JSON.stringify(1))
  }
  Service.addData("studies", studies)
  participants.map((p) => {
    Service.getDataByKey("participants", [p.id], "id").then((data) => {
      console.log("cached participants before", data)
    })
  })
  Service.addData("participants", participants)
  console.log("pariticipants logged", participants)
  participants.map((p) => {
    Service.getDataByKey("participants", [p.id], "id").then((data) => {
      console.log("cached participants", data)
    })
  })
  Service.addData(
    "sensors",
    sensors.map((sensor) => ({
      ...sensor,
      studies: sensor.studies || [],
      statusInUsers: sensor.statusInUsers || [],
    }))
  )
  // Service.addData("activities", activities)
  Service.addData(
    "activities",
    activities.map((activity) => ({
      ...activity,
      creator: activity.creator || "",
      createdAt: activity.createdAt || new Date(),
      currentVersion: activity.currentVersion || null,
      versionHistory: activity.versionHistory || [],
      device: activity.device || null,
      reminder: activity.reminder || null,
      groups: activity.groups || [],
      sharingStudies: activity.sharingStudies || [],
      scoreInterpretation: activity.scoreInterpretation || {},
      activityGuide: activity.activityGuide || null,
    }))
  )
}

export const saveStudyData = (result, type) => {
  Service.update("studies", result, type === "activities" ? "activity_count" : "sensor_count", "study_id")
  Service.addData(type, result[type])
}
const saveSettings = (newVal, key) => {
  Service.update("participants", newVal, key, "id")
}

export const saveDemoData = () => {
  Service.addData("researcher", [{ id: "researcher1" }])
  Service.addData("participants", demo_db.Participant)
  Service.addData("studies", demo_db.Study)
  Service.addData("activities", demo_db.Activity)
  Service.addData("sensors", demo_db.Sensor)
  Service.updateValues("activities", { activities: [{ study_id: "study1", study_name: "Demo" }] }, [
    "study_id",
    "study_name",
  ])
  Service.updateValues("sensors", { sensors: [{ study_id: "study1", study_name: "Demo" }] }, ["study_id", "study_name"])
  Service.updateValues(
    "studies",
    {
      studies: [{ participant_count: 1, sensor_count: demo_db.Sensor.length, activity_count: demo_db.Activity.length }],
    },
    ["sensor_count", "activity_count", "participant_count"]
  )
}

export const saveDataToCache = (authString, id) => {
  Service.addData("researcher", [{ id: id }])
  LAMP.API.query(
    "($studyList := $LAMP.Study.list('" +
    id +
    "');" +
    "$unitySettings := $LAMP.Tag.get('" +
    id +
    "','to.unityhealth.psychiatry.enabled');" +
    " $filterAudioOut := function() { $ ~> |$|{}, ['audio']| };" + // `settings` field has been masked out from activities in this query to avoid responses that are too heavy to handle by the server. This can happen when many of the activities that are being queried contain some kind of heavy content (such as audio files).
      " $list :={'unity_settings': $LAMP.Tag.get('" +
      id +
      "','to.unityhealth.psychiatry.enabled')," +
      "'studies':[$map($studyList,function($study){{'name': $study.name,'id':$study.id, 'description': $study.description, 'purpose': $study.purpose, 'studyType': $study.studyType, 'piInstitution': $study.piInstitution, 'collaboratingInstitutions': $study.collaboratingInstitutions, 'hasFunding': $study.hasFunding, 'fundingAgency': $study.fundingAgency, 'hasEthicsPermission': $study.hasEthicsPermission, 'ethicsPermissionDoc': $study.ethicsPermissionDoc, 'mobile': $study.mobile, 'email': $study.email, 'state': $study.state, 'timestamps': $study.timestamps, 'timestamp': $study.timestamp, 'gname':$study.gname, 'adminNote':$study.adminNote ," +
      "'participants':[$map($LAMP.Participant.list($study.id),function($p){{" +
      "'name': $LAMP.Tag.get($p.id,'lamp.name')[0], 'is_deleted': $LAMP.Tag.get($p.id,'lamp.is_deleted'), 'unity_settings' : $unitySettings ? " +
      "$LAMP.Tag.get($p.id,'to.unityhealth.psychiatry.settings') : null,'id':$p.id, 'study_id' : $study.id, 'study_name': $study.name, 'group_name': $LAMP.Tag.get($p.id,'lamp.group_name'),'firstName': $p.firstName, 'lastName': $p.lastName, 'username': $p.username, 'email': $p.email, 'mobile': $p.mobile, 'researcherNote': $p.researcherNote, 'userAge': $p.userAge, 'isLoggedIn': $p.isLoggedIn, 'systemTimestamps': $p.systemTimestamps, 'gender': $p.gender, 'address': $p.address, 'caregiverName': $p.caregiverName,'caregiverRelation': $p.caregiverRelation, 'caregiverMobile': $p.caregiverMobile, 'caregiverEmail': $p.caregiverEmail, 'hospitalId': $p.hospitalId, 'otherHealthIds': $p.otherHealthIds, 'isSuspended': $p.isSuspended" +
      "}})]," +
      "'activities':[$map($LAMP.Activity.list($study.id, false, false, true),function($activity){{'name': " +
      " $activity.name, 'spec': $activity.spec, 'category': $activity.category, 'formula4Fields': $activity.formula4Fields, 'schedule': $activity.schedule, 'settings':$activity.settings, 'id':$activity.id, " +
      " 'creator': $activity.creator, 'createdAt': $activity.createdAt, 'currentVersion': $activity.currentVersion, 'versionHistory': $activity.versionHistory, 'device': $activity.device, 'reminder': $activity.reminder, 'groups': $activity.groups, 'sharingStudies': $activity.sharingStudies, 'scoreInterpretation': $activity.scoreInterpretation, 'activityGuide': $activity.activityGuide, 'versionHistorybuild': $activity.versionHistorybuild, 'includeVersions': $activity.includeVersions, 'shareTocommunity': $activity.shareTocommunity," +
      "'study_id' : $study.id, 'study_name': $study.name}})]," +
      "'sensors':[$map($LAMP.Sensor.list($study.id),function($sensor){{'name': " +
      " $sensor.name,'id':$sensor.id,'spec': $sensor.spec,'study_id': $study.id, 'group':$sensor.group, 'study_name': $study.name, 'studies':$sensor.studies, 'statusInUsers':$sensor.statusInUsers, 'settings':$sensor.settings}})]," +
      "'sub_researchers':$study.sub_researchers}})]})"
  ).then((data: any) => {
    console.log("saveDataToCache", data)
    let studies = Object.values(data?.studies || []).map((study: StudyObject) => {
      return {
        id: study?.id || "",
        name: study?.name || "",
        description: study?.description,
        purpose: study?.purpose || "practice",
        studyType: study?.studyType,
        piInstitution: study?.piInstitution || "",
        collaboratingInstitutions: study?.collaboratingInstitutions || [],
        hasFunding: study?.hasFunding || false,
        fundingAgency: study?.fundingAgency,
        hasEthicsPermission: study?.hasEthicsPermission || false,
        ethicsPermissionDoc: study?.ethicsPermissionDoc,
        adminNote: study?.adminNote,
        mobile: study?.mobile,
        email: study?.email,
        state: study?.state || "development",
        timestamps: study?.timestamps || {
          sharedAt: null,
          productionAt: null,
          completedAt: null,
          firstEnrollmentAt: null,
          lastEnrollmentAt: null,
          suspendedAt: null,
        },
        participants: study?.participants || data?.participants || [],
        activities: study?.activities || data?.activities || [],
        sensors: study?.sensors || data?.sensors || [],
        timestamp: study?.timestamp,
        gname: study?.gname || [],
        participant_count: (study?.participants || data?.participants || []).length,
        activity_count: (study?.activities || data?.activities || []).length,
        sensor_count: (study?.sensors || data?.sensors || []).length,
        sub_researchers: (study?.sub_researchers || []).map((researcher: any) => ({
          ResearcherID: researcher.ResearcherID,
          access_scope: researcher.access_scope,
        })),
      }
    })
    saveStudiesAndParticipants(data, studies, id)
    studies.map((study) => {
      fetchResult(authString, study.id, "participant/mode/1", "study").then((sensors) => {
        saveSettings(sensors, "accelerometer")
        saveSettings(sensors, "analytics")
        saveSettings(sensors, "gps")
        fetchResult(authString, study.id, "participant/mode/2", "study").then((events) => {
          saveSettings(events, "active")
        })
      })
    })
  })
}
