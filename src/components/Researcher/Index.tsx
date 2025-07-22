// Core Imports
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import locale_lang from "../../locale_map.json"
import Dashboard from "./Dashboard"
import LAMP from "lamp-core"
import { saveDataToCache, saveDemoData } from "../../components/Researcher/SaveResearcherData"
// import { useWorker } from "@koale/useworker"
import { Service } from "../DBService/DBService"

export default function Researcher({ researcher, onParticipantSelect, mode, tab, ...props }) {
  const { t, i18n } = useTranslation()
  // const [dataWorker] = useWorker(saveDataToCache)
  // const [demoWorker] = useWorker(saveDemoData)
  // const [headerConfig, setHeaderConfig] = useState(null)

  // useEffect(() => {
  //   if (tab) {
  //     // Get header config from Dashboard
  //     const dashboardConfig = Dashboard({
  //       onParticipantSelect,
  //       researcherId: researcher.id,
  //       mode,
  //       tab
  //     })
  //     setHeaderConfig(dashboardConfig)
  //   }
  // }, [tab, researcher])

  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : lang ? lang : "en-US"
  }

  useEffect(() => {
    let language = !!localStorage.getItem("LAMP_user_" + researcher.id)
      ? JSON.parse(localStorage.getItem("LAMP_user_" + researcher.id)).language
      : getSelectedLanguage()
      ? getSelectedLanguage()
      : "en-US"
    i18n.changeLanguage(language)
    ;(async () => {
      let lampAuthId = LAMP.Auth._auth.id
      let lampAuthPswd = LAMP.Auth._auth.password
      // if (LAMP.Auth._type === "researcher") {
      //   lampAuthId === "researcher@demo.lamp.digital"
      //     ? demoWorker()
      //     : dataWorker(lampAuthId + ":" + lampAuthPswd, researcher.id)
      // } else if (LAMP.Auth._type === "admin") {
      //   if (researcher.id) {
      //     dataWorker(lampAuthId + ":" + lampAuthPswd, researcher.id)
      //   }
      // }
      if (LAMP.Auth._type === "researcher") {
        lampAuthId === "researcher@demo.lamp.digital" || lampAuthId === "clinician@demo.lamp.digital"
          ? saveDemoData()
          : saveDataToCache(lampAuthId + ":" + lampAuthPswd, researcher.id)
      } else if (LAMP.Auth._type === "admin") {
        if (researcher.id) {
          saveDataToCache(lampAuthId + ":" + lampAuthPswd, researcher.id)
        }
      }
    })()
  }, [])

  return (
    <React.Fragment>
      <Dashboard
        onParticipantSelect={onParticipantSelect}
        researcherId={researcher.id}
        mode={mode}
        tab={tab}
        authType={props.authType}
        ptitle={props.ptitle}
        goBack={props.goBack}
        onLogout={props.onLogout}
        history={props.history}
        adminName={props.adminName}
        setIdentity={props.setIdentity}
      />
    </React.Fragment>
  )
}
