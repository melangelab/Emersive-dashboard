import AddButton from "./Researcher/ParticipantList/AddButton"
import AddActivity from "./Researcher/ActivityList/AddActivity"
import AddSensor from "./Researcher/SensorsList/AddSensor"
// import StudyCreator from "./Researcher/Studies/StudyCreator"
import StudyFilter from "./Researcher/ParticipantList/StudyFilter"
import ShareStudyComponent from "./Researcher/Studies/SharedStudy"

interface HeaderComponent {
  AddComponent: React.ComponentType<any> | null
  FilterComponent: React.ComponentType<any> | null
}

export const getHeaderComponents = (tab: string, mode: string): HeaderComponent => {
  if (mode !== "researcher") return { AddComponent: null, FilterComponent: null }

  switch (tab) {
    case "users":
      return {
        AddComponent: AddButton,
        FilterComponent: StudyFilter,
      }
    case "activities":
      return {
        AddComponent: AddActivity,
        FilterComponent: StudyFilter,
      }
    case "sensors":
      return {
        AddComponent: AddSensor,
        FilterComponent: StudyFilter,
      }
    // case "studies":
    //   return {
    //     AddComponent: null,
    //     FilterComponent: null,
    //   }
    case "sharedstudies":
      return {
        AddComponent: ShareStudyComponent,
        FilterComponent: StudyFilter,
      }
    default:
      return {
        AddComponent: null,
        FilterComponent: null,
      }
  }
}
