import { createContext, useContext } from "react"

interface HeaderConfigContextType {
  studies: any[]
  setStudies: (studies: any[]) => void
  selectedStudies: string[]
  setSelectedStudies: (studies: string[]) => void
  order: boolean
  setOrder: (order: boolean) => void
}

const HeaderConfigContext = createContext<HeaderConfigContextType | undefined>(undefined)

export const useHeaderConfig = () => {
  const context = useContext(HeaderConfigContext)
  if (context === undefined) {
    throw new Error("useHeaderConfig must be used within a HeaderConfigProvider")
  }
  return context
}

export const HeaderConfigProvider = HeaderConfigContext.Provider
