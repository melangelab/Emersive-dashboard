import { DBSchema } from "idb"
import * as idb from "idb"
const DATABASE_NAME = "LAMP-DB"

interface LampDB extends DBSchema {
  researcher: {
    key: string
    value: {
      id: string
    }
    indexes: { id: string }
  }
  studies: {
    key: string
    value: {
      id: string
      name: string
      participant_count: number
      activity_count: number
      sensor_count: number
      gname: Array<string>
    }
    indexes: { id: string }
  }
  participants: {
    key: string
    value: {
      id: string
      name: string
      is_deleted: boolean | null
      gps: Array<JSON>
      accelerometer: Array<JSON>
      active: Array<JSON>
      analytics: Array<JSON>
      study_id: string
      study_name: string
      group_name: string
      sub_researchers?: {
        ResearcherID: string
        access_scope: number
      }[]
    }
    indexes: { study_name: string; id: string }
  }
  activities: {
    key: string
    value: {
      id: string
      name: string
      spec: string
      study_id: string
      study_name: string
      formula4Fields: string
      schedule: Array<JSON>
      settings?: Array<JSON>
    }
    indexes: { study_name: string; id: string }
  }
  sensors: {
    key: string
    value: {
      id: string
      name: string
      study_id: string
      group: string
      study_name: string
      studies: any[]
      statusInUsers?: any[]
    }
    indexes: { study_name: string; id: string }
  }
  sharedstudies: {
    key: string
    value: {
      id: string
      name: string
      participant_count: number
      activity_count: number
      sensor_count: number
      gname: Array<string>
      isShared: boolean
      parent: string
      sub_researchers?: {
        ResearcherID: string
        access_scope: number
      }[]
    }
    indexes: { id: string }
  }
  devlabactivities: {
    key: string
    value: {
      id: string
      _parent: string
      activityGuide: any
      category: Array<any>
      createdAt: string
      creator: string
      currentVersion: {
        id: string
        name: string
        date: string
        time: string
      }
      device: any
      fetchedAt: string
      groups: Array<any>
      ignore_binary: boolean
      includeVersions: boolean
      isDevLabItem: boolean
      name: string
      reminder: any
      schedule: Array<any>
      scoreInterpretation: any
      settings: any
      shareTocommunity: boolean
      sharingStudies: Array<any>
      spec: string
      study_id: string
      study_name: string
      versionHistory: Array<any>
    }
    indexes: { id: string; study_name: string }
  }
}

export const dbPromise = idb.openDB<LampDB>(DATABASE_NAME, 1, {
  upgrade(lampDb) {
    if (!lampDb.objectStoreNames.contains("researcher")) {
      const researcher = lampDb.createObjectStore("researcher", { keyPath: "id" })
      researcher.createIndex("id", "id", { unique: true })
    }
    if (!lampDb.objectStoreNames.contains("studies")) {
      const studies = lampDb.createObjectStore("studies", { keyPath: "id" })
      studies.createIndex("id", "id", { unique: true })
    }
    if (!lampDb.objectStoreNames.contains("participants")) {
      const participants = lampDb.createObjectStore("participants", { keyPath: "id" })
      participants.createIndex("id", "id", { unique: true })
      participants.createIndex("study_name", "study_name")
    }
    if (!lampDb.objectStoreNames.contains("activities")) {
      const activities = lampDb.createObjectStore("activities", { keyPath: "id" })
      activities.createIndex("id", "id")
      activities.createIndex("study_name", "study_name")
    }
    if (!lampDb.objectStoreNames.contains("sensors")) {
      const sensors = lampDb.createObjectStore("sensors", { keyPath: "id" })
      sensors.createIndex("id", "id")
      sensors.createIndex("study_name", "study_name")
    }
    if (!lampDb.objectStoreNames.contains("sharedstudies")) {
      const sharedstudies = lampDb.createObjectStore("sharedstudies", { keyPath: "id" })
      sharedstudies.createIndex("id", "id", { unique: true })
    }
    if (!lampDb.objectStoreNames.contains("devlabactivities")) {
      const devlabactivities = lampDb.createObjectStore("devlabactivities", { keyPath: "id" })
      devlabactivities.createIndex("id", "id", { unique: true })
      devlabactivities.createIndex("study_name", "study_name")
    }
  },
})
