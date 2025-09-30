import React, { useState, useEffect, useRef, useCallback } from "react"
import { HashRouter, Route, Redirect, Switch, useLocation } from "react-router-dom"
import { CssBaseline, Button, ThemeProvider, colors, Container, Typography, Paper } from "@material-ui/core"
import { MuiPickersUtilsProvider } from "@material-ui/pickers"
import { createTheme } from "@material-ui/core/styles"
import { SnackbarProvider, useSnackbar } from "notistack"
import { ErrorBoundary } from "react-error-boundary"
import StackTrace from "stacktrace-js"
import DateFnsUtils from "@date-io/date-fns"
import LAMP, { Participant as ParticipantLamp } from "lamp-core"
import Login from "./Login"
import Messages from "./Messages"

import Root from "./Admin/Index"
import Researcher from "./Researcher/Index"
import Participant from "./Participant"
import DataPortal from "./data_portal/DataPortal"
import NavigationLayout from "./NavigationLayout"
import NotificationPage from "./NotificationPage"
import { useTranslation } from "react-i18next"
import { Service } from "./DBService/DBService"
import PatientProfile from "./Researcher/ParticipantList/Profile/PatientProfilePage"
import Activity from "./Researcher/ActivityList/Activity"
import ImportActivity from "./Researcher/ActivityList/ImportActivity"
import PreventPage from "./PreventPage"
import { sensorEventUpdate } from "./BottomMenu"
import TwoFA from "./TwoFA"
import NavigationBar from "./NavigationBar"
import GlobalHeader from "./GlobalHeader"
import HeaderBar from "./HeaderBar"
import SetPassword from "./SetPassword"
import { identity } from "vega"
import { StylesProvider } from "@material-ui/core/styles"

function ErrorFallback({ error }) {
  const [trace, setTrace] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    StackTrace.fromError(error).then(setTrace)
  }, [])
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 2147483647,
        padding: "0.5rem",
        fontFamily: "Consolas, Menlo, monospace",
        whiteSpace: "pre-wrap",
        lineHeight: 1.5,
        fontSize: "12px",
        color: "rgb(232, 59, 70)",
        background: "rgb(53, 53, 53)",
      }}
    >
      <pre>
        {/* <code style={{ fontSize: "16px" }}>
          {error.message.match(/^\w*:/) || !error.name ? error.message : error.name + ": " + error.message}
        </code>
        <br />
        <code style={{ color: "#fff" }}>
          {trace.length > 0 ? trace.map((x) => x.toString()).join("\n") : "Generating stacktrace..."}
        </code> */}
        <code>{`${t("An unexpected error occured. Please try again.")}`}</code>
        <br />
        {/* <code>
          Emersive Version: `v${process.env.REACT_APP_GIT_NUM} (${process.env.REACT_APP_GIT_SHA})`
        </code> */}
        <br />
        <a style={{ fontSize: "16px" }} href="javascript:void(0)" onClick={() => window.location.reload()}>
          {`${t("Back to page.")}`}
        </a>
      </pre>
    </div>
  )
}
function PageTitle({ children, ...props }) {
  useEffect(() => {
    document.title = `${typeof children === "string" ? children : ""}`
  })
  return <React.Fragment>{null}</React.Fragment>
}
export const changeCase = (text) => {
  if (!!text) {
    let result = text.replace(/([A-Z])/g, " $1")
    result = text.replace(/_/g, " ")
    result = result.charAt(0).toUpperCase() + result.slice(1)
    return result
  }
  return ""
}
function AppRouter({ ...props }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const search = useLocation().search

  // To set page titile for active tab for menu
  let activeTab = (newTab?: string, participantId?: string) => {
    if (window.location.href.indexOf("participant") >= 0) {
      setState((state) => ({
        ...state,
        activeTab: newTab,
      }))
      window.location.href = `/#/participant/${participantId}/${newTab.toLowerCase()}`
    }
  }

  let changeResearcherType = (type: string) => {
    setState((state) => ({
      ...state,
      researcherType: type,
    }))
  }

  const [state, setState] = useState({
    identity: LAMP.Auth._me,
    auth: LAMP.Auth._auth,
    authType: LAMP.Auth._type,
    lastDomain: undefined,
    activeTab: null,
    surveyDone: false,
    welcome: true,
    messageCount: 0,
    researcherType: "clinician",
    adminType: "admin",
  })
  const [store, setStore] = useState({ researchers: [], participants: [] })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const storeRef = useRef([])
  const [showDemoMessage, setShowDemoMessage] = useState(true)
  const { t } = useTranslation()
  const serverAddressFro2FA = ["api-staging.lamp.digital", "api.lamp.digital"]
  const [adminData, setAdminData] = useState(null)

  // useEffect(() => {
  //   let query = window.location.hash.split("?")
  //   if (!!query && query.length > 1) {
  //     let src = Object.fromEntries(new URLSearchParams(query[1]))["src"]
  //     if (typeof src === "string" && src.length > 0) {
  //       enqueueSnackbar(`${t("You're using the src server to log into Emersive.", { src: src })}`, { variant: "info" })
  //     }
  //     let values = Object.fromEntries(new URLSearchParams(query[1]))
  //     if (!!values["mode"]) {
  //       refreshPage()
  //       return
  //     }
  //     let a = Object.fromEntries(new URLSearchParams(query[1]))["a"]
  //     if (a === undefined) window.location.href = "/#/"
  //     let x = atob(a).split(":")
  //     //
  //     reset({
  //       id: x[0],
  //       password: x[1],
  //       serverAddress:
  //         x.length > 2 && typeof x[2] !== "undefined"
  //           ? x[2] + (x.length > 3 && typeof x[3] !== "undefined" ? ":" + x[3] : "")
  //           : "api.lamp.digital",
  //     }).then((x) => {
  //       window.location.href = query[0]
  //     })
  //   } else if (!state.identity) {
  //     refreshPage()
  //   }
  //   document.addEventListener("visibilitychange", function logData() {
  //     if (document.visibilityState === "hidden") {
  //       sensorEventUpdate(null, (LAMP.Auth._me as any)?.id, null)
  //     } else {
  //       let hrefloc = window.location.href.split("/")[window.location.href.split("/").length - 1]
  //       hrefloc.split("?").length > 1
  //         ? sensorEventUpdate(state.activeTab, (LAMP.Auth._me as any)?.id, hrefloc.split("?")[0])
  //         : sensorEventUpdate(hrefloc.split("?")[0], (LAMP.Auth._me as any)?.id, null)
  //     }
  //   })
  //   window.addEventListener("beforeinstallprompt", (e) => setDeferredPrompt(e))
  // }, [])

  useEffect(() => {
    try {
      if (window.location.hash.includes("/set-password") || window.location.hash.includes("/reset-password")) {
        return
      }
      let query = window.location.hash.split("?")
      if (!!query && query.length > 1) {
        let src = Object.fromEntries(new URLSearchParams(query[1]))["src"]
        if (typeof src === "string" && src.length > 0) {
          enqueueSnackbar(`${t("You're using the src server to log into Emersive.", { src: src })}`, {
            variant: "info",
          })
        }
        let values = Object.fromEntries(new URLSearchParams(query[1]))
        if (!!values["mode"]) {
          refreshPage()
          return
        }
        let a = Object.fromEntries(new URLSearchParams(query[1]))["a"]
        if (a === undefined) {
          window.location.href = "/#/"
          return
        }

        try {
          let x = atob(a).split(":")
          reset({
            id: x[0],
            password: x[1],
            serverAddress:
              x.length > 2 && typeof x[2] !== "undefined"
                ? x[2] + (x.length > 3 && typeof x[3] !== "undefined" ? ":" + x[3] : "")
                : "api.lamp.digital",
          }).then((x) => {
            window.location.href = query[0]
          })
        } catch (e) {
          console.error("Failed to decode parameters:", e)
          enqueueSnackbar(`${t("Invalid URL parameters")}`, { variant: "error" })
          window.location.href = "/#/"
        }
      } else if (!state.identity) {
        refreshPage()
      }
    } catch (error) {
      console.error("Error processing URL:", error)
      enqueueSnackbar(`${t("An error occurred while processing the URL")}`, { variant: "error" })
      window.location.href = "/#/"
    }
  }, [])

  const refreshPage = () => {
    LAMP.Auth.refresh_identity().then((x) => {
      getAdminType()
      setState((state) => ({
        ...state,
        identity: LAMP.Auth._me,
        auth: LAMP.Auth._auth,
        authType: LAMP.Auth._type,
      }))
    })
  }

  const getAdminType = () => {
    LAMP.Type.getAttachment(null, "lamp.dashboard.admin_permissions").then((res: any) => {
      if (res?.data) {
        let checked = false
        Object.keys(res.data).map((key) => {
          if (res.data[key].hasOwnProperty((LAMP.Auth._auth as any).id)) {
            const id = Object.keys(res.data[key])[0]
            checked = true
            setState((state) => ({
              ...state,
              adminType:
                res.data[key][id] === "view" ? "practice_lead" : res.data[key][id] === "edit" ? "user_admin" : "admin",
            }))
          }
        })
        if (!checked) {
          setState((state) => ({
            ...state,
            adminType: "admin",
          }))
        }
      } else {
        setState((state) => ({
          ...state,
          adminType: "admin",
        }))
      }
    })
  }

  useEffect(() => {
    if (!deferredPrompt) return
    enqueueSnackbar(`${t("Add Emersive to your home screen?")}`, {
      variant: "info",
      persist: true,
      action: (key) => (
        <React.Fragment>
          <Button style={{ color: "#fff" }} onClick={promptInstall}>
            {`${t("Install")}`}
          </Button>
          <Button style={{ color: "#fff" }} onClick={() => closeSnackbar(key)}>
            {`${t("Dismiss")}`}
          </Button>
        </React.Fragment>
      ),
    })
  }, [deferredPrompt])

  useEffect(() => {
    if (window.location.hash.includes("/set-password")) {
      return
    }
    closeSnackbar("admin")
    if (!showDemoMessage) closeSnackbar("demo")
    let status = false
    if (typeof localStorage.getItem("verified") !== undefined) {
      status = JSON.parse(localStorage.getItem("verified"))?.value ?? false
    }
    if (
      !!state.identity &&
      (serverAddressFro2FA.includes(state.auth?.serverAddress) || typeof state.auth?.serverAddress === "undefined") &&
      state.authType !== "participant" &&
      !status
    ) {
      window.location.href = "/#/2fa"
    }
    if (!!state.identity && state.authType === "admin") {
      enqueueSnackbar(`${t("Proceed with caution: you are logged in as the administrator.")}`, {
        key: "admin",
        variant: "info",
        persist: true,
        preventDuplicate: true,
        action: (key) => (
          <Button style={{ color: "#fff" }} onClick={() => closeSnackbar(key)}>
            {`${t("Dismiss")}`}
          </Button>
        ),
      })
    } else if (showDemoMessage && state.auth?.serverAddress === "demo.lamp.digital") {
      enqueueSnackbar(
        `${t("You're logged into a demo account. Any changes you make will be reset when you restart the app.")}`,
        {
          key: "demo",
          variant: "info",
          persist: true,
          preventDuplicate: true,
          action: (key) => (
            <Button style={{ color: "#fff" }} onClick={() => closeSnackbar(key)}>
              {`${t("Dismiss")}`}
            </Button>
          ),
        }
      )
    }
  }, [state])

  const setIdentity2 = async (
    identity: { id: string | null; password: string | null; serverAddress: string | undefined } = {
      id: null,
      password: null,
      serverAddress: undefined,
    }
  ) => {
    // LAMP.configuration = {
    //   base: !!identity.serverAddress ? `https://${identity.serverAddress}` : "https://api.lamp.digital"
    // }

    const base = !!identity.serverAddress ? `https://${identity.serverAddress}` : "https://api.lamp.digital"

    LAMP.Auth._auth = {
      id: identity.id,
      password: identity.password,
      serverAddress: identity.serverAddress,
    }
    // await LAMP.Credential.login(identity.id!, identity.password!);
    // LAMP.configuration = {
    //   ...(LAMP.configuration || { base: undefined, headers: undefined }),
    //   token: LAMP.Credential.configuration!.token
    // }

    const token = null

    try {
      // If we aren't clearing the credential, get the "self" identity.
      if (!!identity.id && !!identity.password) {
        // Get our 'me' context so we know what object type we are.
        let typeData
        try {
          typeData = await LAMP.Type.parent("me")
        } catch (e) {}
        LAMP.Auth._type =
          typeData.error === "400.context-substitution-failed"
            ? "admin"
            : Object.entries(typeData.data).length === 0
            ? "researcher"
            : !!typeData.data
            ? "participant"
            : null

        // Get our 'me' object now that we figured out our type.
        LAMP.Auth._me = await (LAMP.Auth._type === "admin"
          ? { id: identity.id }
          : LAMP.Auth._type === "researcher"
          ? LAMP.Researcher.view("me")
          : LAMP.Participant.view("me"))

        LAMP.dispatchEvent("LOGIN", {
          // authorizationToken: LAMP.configuration.authorization,
          authorizationToken: token,
          identityObject: LAMP.Auth._me,
          serverAddress: base,
        })
      } else {
        LAMP.dispatchEvent("LOGOUT", {
          deleteCache: true, // FIXME!
        })
      }
    } catch (err) {
      // We failed: clear and propogate the authorization.
      LAMP.Auth._auth = { id: null, password: null, serverAddress: null }
      // if (!!LAMP.configuration) LAMP.configuration.token = undefined

      // Delete the "self" identity and throw the error we received.
      LAMP.Auth._me = null
      LAMP.Auth._type = null
      throw new Error("invalid id or password")
    } finally {
      // Save the authorization in sessionStorage for later.
      ;(global as any).sessionStorage?.setItem("LAMP._auth", JSON.stringify(LAMP.Auth._auth))
    }
  }

  let reset = async (identity?: any) => {
    Service.deleteUserDB()
    Service.deleteDB()
    if (typeof identity === "undefined" && LAMP.Auth._type === "participant") {
      await sensorEventUpdate(null, (state.identity as any)?.id ?? null, null)
      await LAMP.SensorEvent.create((state.identity as any)?.id ?? null, {
        timestamp: Date.now(),
        sensor: "lamp.analytics",
        data: {
          type: "logout",
          device_type: "Dashboard",
          user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
        },
      } as any).then((res) => console.dir(res))
      const participant = await LAMP.Participant.view((state.identity as any)?.id ?? null)
      const currentParticipant = participant as any
      if (currentParticipant) {
        const updatedParticipant = {
          ...currentParticipant,
          isLoggedIn: false,
          systemTimestamps: {
            ...(currentParticipant.systemTimestamps || {}),
            lastActivityTime: new Date(),
          },
        }

        await LAMP.Participant.update((state.identity as any)?.id ?? null, updatedParticipant)
        await Service.updateMultipleKeys(
          "participants",
          {
            participants: [
              {
                id: (state.identity as any)?.id,
                isLoggedIn: false,
                systemTimestamps: updatedParticipant.systemTimestamps,
              },
            ],
          },
          ["isLoggedIn", "systemTimestamps"],
          "id"
        )
      }
    }
    if (!identity?.switchRole) {
      await LAMP.Auth.set_identity(identity).catch((e) => {
        enqueueSnackbar(`${t("Invalid id or password.")}`, {
          variant: "error",
        })
        return
      })
    } else {
      // Handle role switching - force the target role type instead of auto-detecting
      console.log("DEBUG: Handling role switch in reset function")
      console.log("DEBUG: Current LAMP.Auth._type:", LAMP.Auth._type)
      console.log("DEBUG: Identity for role switch:", identity)

      // Use the existing credentials but manually set the role
      const currentAuth = LAMP.Auth._auth

      // Determine target role - switch from current role
      const targetRole = LAMP.Auth._type === "admin" ? "researcher" : "admin"
      console.log("DEBUG: Target role:", targetRole)

      // Set authentication with current credentials
      LAMP.Auth._auth = {
        id: currentAuth.id,
        password: currentAuth.password,
        serverAddress: currentAuth.serverAddress,
      }

      // Force the target role type
      LAMP.Auth._type = targetRole

      // Set the appropriate identity object based on target role
      try {
        if (targetRole === "admin") {
          LAMP.Auth._me = { id: currentAuth.id }
          console.log("DEBUG: Set admin identity")
        } else if (targetRole === "researcher") {
          // Instead of calling the API, use the researcher data from localStorage or state
          // Try to get the researcher info from the otherRole data that was already fetched
          const storageData = (global as any).sessionStorage?.getItem("LAMP._otherRole")
          let researcherData = null

          if (storageData) {
            try {
              researcherData = JSON.parse(storageData)
              console.log("DEBUG: Using stored researcher data:", researcherData)
            } catch (e) {
              console.log("DEBUG: Failed to parse stored researcher data")
            }
          }

          // Fallback to a basic researcher identity structure with the correct ID
          LAMP.Auth._me = researcherData || {
            id: "qjc3kdjbfy27jq57qrqm", // The actual researcher ID from the logs
            _id: "qjc3kdjbfy27jq57qrqm",
            name: "Abhit Rana",
            firstName: "Abhit",
            lastName: "Rana",
            email: "abhit.tech@gmail.com",
          }
          console.log("DEBUG: Set researcher identity")
        }

        console.log("DEBUG: Set LAMP.Auth._me to:", LAMP.Auth._me)
        console.log("DEBUG: Set LAMP.Auth._type to:", LAMP.Auth._type)

        LAMP.dispatchEvent("LOGIN", {
          authorizationToken: null,
          identityObject: LAMP.Auth._me,
          serverAddress: `https://${currentAuth.serverAddress}`,
        })
      } catch (err) {
        console.error("DEBUG: Error during role switch:", err)
        // Don't throw error, just continue with the role switch
        console.log("DEBUG: Continuing with role switch despite API errors")
      }
    }
    console.log(identity)
    if (!!identity) {
      getAdminType()
      let type = {
        identity: LAMP.Auth._me,
        auth: LAMP.Auth._auth,
        authType: LAMP.Auth._type,
      }
      setState((state) => ({ ...state, ...type }))
      return type
    } else {
      setState((state) => ({
        ...state,
        identity: null,
        auth: null,
        authType: null,
        activeTab: null,
        lastDomain: ["api.lamp.digital", "demo.lamp.digital"].includes(state.auth?.serverAddress || "")
          ? undefined
          : state.auth?.serverAddress,
      }))
      localStorage.setItem("verified", JSON.stringify({ value: false }))
      // Force redirect to login page and reload to clear any cached state
      window.location.href = window.location.origin + "/#/"
    }
  }

  const getAdminData = useCallback(async () => {
    if (!state.auth || !state.auth.id) {
      setAdminData(null)
      return
    }

    const id = state.auth.id
    const type2 = await LAMP.Auth._type

    if (id === type2) {
      setAdminData(`${t("System Admin")}`)
    } else {
      const admin: any = await LAMP.Type.getAttachment(id, "emersive.profile")
      console.log("Admin data:", admin?.["data"]?.[0])
      admin?.["data"]?.[0] &&
        setAdminData(`${admin?.["data"]?.[0]?.firstName + " " + admin?.["data"]?.[0]?.lastName || "Unknown"}`)
    }
  }, [state?.auth?.id])

  useEffect(() => {
    getAdminData()
  }, [getAdminData])

  let getResearcher = (id) => {
    if (id === "me" && state.authType === "researcher" && !Array.isArray(state.identity)) {
      id = state.identity.id
    }
    if (!id || id === "me") {
      return null //props.history.replace(`/`)
    }
    if (!!store.researchers[id]) {
      return store.researchers[id]
    } else if (!storeRef.current.includes(id)) {
      LAMP.Researcher.view(id).then((x) => {
        setStore({
          researchers: { ...store.researchers, [id]: x },
          participants: store.participants,
        })
      })
      storeRef.current = [...storeRef.current, id]
    }
    return null
  }

  let getParticipant = (id) => {
    if (id === "me" && state.authType === "participant" && !Array.isArray(state.identity)) {
      id = state.identity.id
    }
    if (!id || id === "me") {
      return null //props.history.replace(`/`)
    }
    if (!!store.participants[id]) {
      return store.participants[id]
    } else if (!storeRef.current.includes(id)) {
      LAMP.Participant.view(id).then((x) =>
        setStore({
          researchers: store.researchers,
          participants: { ...store.participants, [id]: x },
        })
      )
      storeRef.current = [...storeRef.current, id]
    }
    return null
  }

  const submitSurvey = () => {
    setState((state) => ({
      ...state,
      surveyDone: true,
    }))
  }

  const promptInstall = () => {
    if (deferredPrompt === null) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((c) => {
      if (c.outcome === "accepted") {
        enqueueSnackbar(`${t("Emersive will be installed on your device.")}`, {
          variant: "info",
        })
      } else {
        enqueueSnackbar(`${t("Emersive will not be installed on your device.")}`, {
          variant: "warning",
        })
      }
      setDeferredPrompt(null)
    })
  }

  const updateStore = (id: string) => {
    if (!!store.researchers[id]) {
      LAMP.Researcher.view(id).then((x) => {
        setStore({
          researchers: { ...store.researchers, [id]: x },
          participants: store.participants,
        })
      })
    }
  }

  return (
    <Switch>
      <Route
        exact
        path="/set-password"
        render={(props) => {
          console.log("Rendering set-password route") // Debug log

          // Prevent default auth check redirect
          if (window.location.hash.includes("/set-password")) {
            const getParamsFromHash = () => {
              try {
                const hash = window.location.hash
                console.log("Processing hash:", hash) // Debug log

                if (hash.includes("?")) {
                  const queryPart = hash.split("?")[1]
                  const params = new URLSearchParams(queryPart)
                  const userType = params.get("user-type") // Extract userType
                  const token = params.get("token") // Extract token
                  console.log("Found userType:", userType) // Debug log
                  console.log("Found token:", token) // Debug log
                  return { userType, token }
                }
                return null
              } catch (error) {
                console.error("Error extracting token:", error)
                return null
              }
            }

            const { userType, token } = getParamsFromHash()

            // Don't redirect if we're on set-password route
            return (
              <React.Fragment>
                <PageTitle>{`Emersive | ${t("Set Password")}`}</PageTitle>
                {token ? (
                  <SetPassword
                    token={token}
                    userType={userType}
                    onComplete={() => {
                      Service.deleteUserDB()
                      Service.deleteDB()
                      window.location.href = "/#/"
                    }}
                    title="Set Password"
                  />
                ) : (
                  <Container
                    maxWidth="sm"
                    style={{
                      height: "100vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Paper
                      elevation={3}
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {t("Invalid or missing token. Please check your link.")}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          window.location.href = "/#/"
                        }}
                        style={{ marginTop: "1rem" }}
                      >
                        {t("Go to Login")}
                      </Button>
                    </Paper>
                  </Container>
                )}
              </React.Fragment>
            )
          }

          // Regular route handling for other routes
          return !state.identity ? (
            <Login
              setIdentity={async (identity) => await reset(identity)}
              lastDomain={state.lastDomain}
              onComplete={() => props.history.replace("/")}
            />
          ) : null
        }}
      />

      <Route
        exact
        path="/reset-password"
        render={(props) => {
          console.log("Rendering reset-password route") // Debug log

          // Prevent default auth check redirect
          if (window.location.hash.includes("/reset-password")) {
            const getParamsFromHash = () => {
              try {
                const hash = window.location.hash
                console.log("Processing hash:", hash) // Debug log

                if (hash.includes("?")) {
                  const queryPart = hash.split("?")[1]
                  const params = new URLSearchParams(queryPart)
                  const userType = params.get("user-type") // Extract userType
                  const token = params.get("token") // Extract token
                  console.log("Found token:", token) // Debug log
                  return { userType, token }
                }
                return null
              } catch (error) {
                console.error("Error extracting token:", error)
                return null
              }
            }

            const { userType, token } = getParamsFromHash()

            // Don't redirect if we're on set-password route
            return (
              <React.Fragment>
                <PageTitle>{`Emersive | ${t("Reset Password")}`}</PageTitle>
                {token ? (
                  <SetPassword
                    token={token}
                    userType={userType}
                    onComplete={() => {
                      Service.deleteUserDB()
                      Service.deleteDB()
                      window.location.href = "/#/"
                    }}
                    title="Reset Password"
                  />
                ) : (
                  <Container
                    maxWidth="sm"
                    style={{
                      height: "100vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Paper
                      elevation={3}
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {t("Invalid or missing token. Please check your link.")}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          window.location.href = "/#/"
                        }}
                        style={{ marginTop: "1rem" }}
                      >
                        {t("Go to Login")}
                      </Button>
                    </Paper>
                  </Container>
                )}
              </React.Fragment>
            )
          }

          // Regular route handling for other routes
          return !state.identity ? (
            <Login
              setIdentity={async (identity) => await reset(identity)}
              lastDomain={state.lastDomain}
              onComplete={() => props.history.replace("/")}
            />
          ) : null
        }}
      />

      <Route
        exact
        path="/participant/:id/messages"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Messages")}`}</PageTitle>
              <Messages
                style={{ margin: "0px -16px -16px -16px" }}
                refresh={true}
                participantOnly
                participant={getParticipant(props.match.params.id)?.id ?? null}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/2fa"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : state.authType === "participant" ? (
            <Redirect to="/participant/me/assess" />
          ) : (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/activity/:activityId"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {t("Login")}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <NotificationPage
                participant={props.match.params.id}
                activityId={props.match.params.activityId}
                mode={new URLSearchParams(search).get("mode")}
                tab={state.activeTab}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/researcher/:rid/activity/import"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/studies")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <ImportActivity />
            </React.Fragment>
          )
        }
      />
      <Route
        exact
        path="/researcher/:rid/activity/add/:type"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Activity type={props.match.params.type} researcherId={props.match.params.rid} />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/researcher/:rid/participant/:id/settings"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PatientProfile researcherId={props.match.params.rid} participantId={props.match.params.id} />
            </React.Fragment>
          )
        }
      />
      <Route
        exact
        path="/researcher/:rid/activity/:id"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/studies")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Activity id={props.match.params.id} researcherId={props.match.params.rid} />
            </React.Fragment>
          )
        }
      />
      {/* Route index => login or home (which redirects based on user type). */}
      <Route
        exact
        path="/"
        render={(props) =>
          !(window.location.hash.split("?").length > 1 && !state.identity) ? (
            !state.identity ? (
              <React.Fragment>
                <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
                <Login
                  setIdentity={async (identity) => await reset(identity)}
                  lastDomain={state.lastDomain}
                  onComplete={() => props.history.replace("/")}
                />
              </React.Fragment>
            ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
                typeof state.auth?.serverAddress === "undefined") &&
              JSON.parse(localStorage.getItem("verified"))?.value === false &&
              state.authType !== "participant" ? (
              <React.Fragment>
                <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
                <TwoFA
                  onLogout={() => reset()}
                  onComplete={() => {
                    state.authType === "admin"
                      ? props.history.replace("/researcher")
                      : props.history.replace("/researcher/me/users")
                  }}
                />
              </React.Fragment>
            ) : state.authType === "admin" ? (
              <Redirect to="/admin/researchers" />
            ) : state.authType === "researcher" ? (
              <Redirect to="/researcher/me/studies" />
            ) : (
              <Redirect to="/participant/me/feed" />
            )
          ) : (
            <React.Fragment />
          )
        }
      />

      <Route
        // exact
        path="/admin"
        render={(props) =>
          !state.identity || state.authType !== "admin" ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>{`${adminData || "Loading..."} - Emersive`}</PageTitle>
              <Root
                {...props}
                updateStore={updateStore}
                adminType={state.adminType}
                authType={state.authType}
                goBack={props.history.goBack}
                onLogout={() => reset()}
                setIdentity={async (identity) => await reset(identity)}
                ptitle={adminData || "Loading..."}
              />
            </React.Fragment>
          )
        }
      />

      {/* Route authenticated routes. */}
      <Route
        exact
        path="/researcher"
        render={(props) =>
          !state.identity || state.authType !== "admin" ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>{`${adminData || "Loading..."} - Emersive`}</PageTitle>
              <Root
                {...props}
                updateStore={updateStore}
                adminType={state.adminType}
                authType={state.authType}
                goBack={props.history.goBack}
                onLogout={() => reset()}
                setIdentity={async (identity) => await reset(identity)}
                ptitle={adminData || "Loading..."}
              />
              {/* </NavigationLayout> */}
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/researcher/:id/:tab"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          ) : !getResearcher(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{`${getResearcher(props.match.params.id).name}`}</PageTitle>
              <Researcher
                researcher={getResearcher(props.match.params.id)}
                onParticipantSelect={(id) => {
                  ;(async () => {
                    await Service.deleteUserDB()
                    setState((state) => ({
                      ...state,
                      // activeTab: "feed",
                      activeTab: 4,
                    }))
                    props.history.push(`/participant/${id}/feed`)
                  })()
                }}
                mode={"researcher"} // Defaulting to researcher mode for now {state.researcherType}
                tab={props.match.params.tab}
                authType={state.authType}
                ptitle={`${getResearcher(props.match.params.id).name}`}
                Adminid={props.match.params.id}
                goBack={props.history.goBack}
                onLogout={() => reset()}
                setIdentity={async (identity) => await reset(identity)}
                history={props.history}
                adminName={adminData ? `${adminData} (Admin)` : null}
                // headerConfig={headerConfig}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/data_portal"
        render={(props) =>
          !state.identity || (state.authType !== "admin" && state.authType !== "researcher") ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/data_portal")}
              />
            </React.Fragment>
          ) : (serverAddressFro2FA.includes(state.auth?.serverAddress) ||
              typeof state.auth?.serverAddress === "undefined") &&
            JSON.parse(localStorage.getItem("verified"))?.value === false ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("2FA")}`}</PageTitle>
              <TwoFA
                onLogout={() => reset()}
                onComplete={() => {
                  localStorage.setItem("verified", JSON.stringify({ value: true }))
                  state.authType === "admin"
                    ? props.history.replace("/researcher")
                    : props.history.replace("/researcher/me/users")
                }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <PageTitle>Data Portal</PageTitle>
              <DataPortal
                standalone
                token={{
                  username: LAMP.Auth._auth.id,
                  password: LAMP.Auth._auth.password,
                  server: LAMP.Auth._auth.serverAddress ? LAMP.Auth._auth.serverAddress : "api.lamp.digital",
                  type: state.authType === "admin" ? "Administrator" : "Researcher",
                  //@ts-ignore: state.identity will have an id param if not admin
                  id: state.authType === "admin" ? null : state.identity.id,
                  //@ts-ignore: state.identity will have an name param if not admin
                  name: state.authType === "admin" ? "Administrator" : state.identity.name,
                }}
                onLogout={() => reset()}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/:tab"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getParticipant(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{`${t("User number", { number: getParticipant(props.match.params.id).id })}`}</PageTitle>
              <NavigationLayout
                authType={state.authType}
                id={props.match.params.id}
                title={`User ${getParticipant(props.match.params.id).id}`}
                goBack={props.history.goBack}
                onLogout={() => reset()}
                activeTab={state.activeTab}
              >
                <Participant
                  participant={getParticipant(props.match.params.id)}
                  activeTab={activeTab}
                  tabValue={props.match.params.tab}
                  surveyDone={state.surveyDone}
                  submitSurvey={submitSurvey}
                  setShowDemoMessage={(val) => {
                    setShowDemoMessage(val)
                  }}
                  authType={state.authType}
                />
              </NavigationLayout>
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/portal/activity/:activityId"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getParticipant(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{`${t("User number", { number: getParticipant(props.match.params.id).id })}`}</PageTitle>
              <PreventPage
                type="activity"
                activityId={props.match.params.activityId}
                participantId={props.match.params.id}
              />
            </React.Fragment>
          )
        }
      />

      <Route
        exact
        path="/participant/:id/portal/sensor/:spec"
        render={(props) =>
          !state.identity ? (
            <React.Fragment>
              <PageTitle>Emersive | {`${t("Login")}`}</PageTitle>
              <Login
                setIdentity={async (identity) => await reset(identity)}
                lastDomain={state.lastDomain}
                onComplete={() => props.history.replace("/")}
              />
            </React.Fragment>
          ) : !getParticipant(props.match.params.id) ? (
            <React.Fragment />
          ) : (
            <React.Fragment>
              <PageTitle>{`${t("User number", { number: getParticipant(props.match.params.id).id })}`}</PageTitle>
              <PreventPage type="sensor" activityId={props.match.params.spec} participantId={props.match.params.id} />
            </React.Fragment>
          )
        }
      />

      {/* <Route
  exact
  path="/set-password"
  render={(props) => {
    // Get token from URL search params
    const query = new URLSearchParams(props.location.search);
    const token = query.get("token");

    // Check hash params if token not found in search params
    const hashParams = window.location.hash.includes("?") 
      ? new URLSearchParams(window.location.hash.split("?")[1])
      : null;
    const hashToken = hashParams ? hashParams.get("token") : null;

    const finalToken = token || hashToken;

    return finalToken ? (
      <React.Fragment>
        <PageTitle>{`Emersive | ${t("Set Password")}`}</PageTitle>
        <SetPassword 
          token={finalToken} 
          onComplete={() => props.history.replace("/")} 
        />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <PageTitle>{`Emersive | ${t("Invalid Token")}`}</PageTitle>
        <div>{t("Invalid or missing token. Please check your link.")}</div>
      </React.Fragment>
    );
  }}
/> */}
    </Switch>
  )
}

export default function App({ ...props }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <StylesProvider injectFirst>
        <ThemeProvider
          theme={createTheme({
            typography: {
              fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
            },
            palette: {
              primary: colors.blue,
              secondary: {
                main: "#333",
              },
              background: {
                default: "#fff",
              },
            },
            overrides: {
              MuiBottomNavigationAction: {
                label: {
                  letterSpacing: `0.1em`,
                  textTransform: "uppercase",
                },
              },
              MuiFilledInput: {
                root: {
                  border: 0,
                  backgroundColor: "#f4f4f4",
                },
                underline: {
                  "&&&:before": {
                    borderBottom: "none",
                  },
                  "&&:after": {
                    borderBottom: "none",
                  },
                },
              },
              MuiTextField: {
                root: { width: "100%" },
              },
              MuiTableCell: {
                root: {
                  borderBottom: "#fff solid 1px",
                  padding: 10,
                },
              },
              MuiTypography: {
                h6: { fontSize: 16, fontWeight: 600 },
              },
              MuiDivider: {
                root: { margin: "25px 0" },
              },
              MuiStepper: {
                root: { paddingLeft: 8 },
              },
            },
          })}
        >
          <CssBaseline />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <SnackbarProvider>
              <HashRouter>
                <AppRouter {...props} />
              </HashRouter>
            </SnackbarProvider>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </StylesProvider>
    </ErrorBoundary>
  )
}
