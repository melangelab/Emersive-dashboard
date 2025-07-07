// Core Imports
import React, { useState, useEffect } from "react"
import {
  Fab,
  Box,
  TextField,
  Slide,
  Menu,
  MenuItem,
  Icon,
  IconButton,
  colors,
  Grid,
  makeStyles,
  createStyles,
  Link,
  Theme,
  Divider,
  Typography,
  Select,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import TranslateIcon from "@mui/icons-material/Translate"
import LAMP from "lamp-core"
import locale_lang from "../locale_map.json"
import { Service } from "./DBService/DBService"

// Local Imports
import { ResponsiveMargin } from "./Utils"
import { ReactComponent as Logo } from "../icons/Logo.svg"
import { ReactComponent as LineArt } from "../icons/login_line_drawing.svg"
// import { ReactComponent as LoginBackground } from "../icons/login_background.svg"
import LoginBackground from "../icons/blob_bg_1.png"
import TopLeft from "../icons/corner-top-left.png"
import BottomRight from "../icons/corner-bottom-right.png"
import { ReactComponent as Logotext } from "../icons/mindLAMP.svg"

import { useTranslation } from "react-i18next"
import { Autocomplete } from "@mui/material"

// google login
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import HelpIcon from "@mui/icons-material/Help"
import { HelpCenterOutlined } from "@mui/icons-material"
import "./Login.css"
// import jwtDecode from "jwt-decode"

import ForgotPasswordForm from "./ForgotPasswordForm"

// put in env
// const MINIORANGE_AUTH_ENDPOINT = "https://mindlampihub.xecurify.com/moas/login/idp/openidsso"
// const MINIORANGE_TOKEN_ENDPOINT = "https://mindlampihub.xecurify.com/moas/login/rest/oauth/token"
// const MINIORANGE_USERINFO_ENDPOINT = "https://mindlampihub.xecurify.com/moas/login/rest/oauth/getuserinfo"
const MINIORANGE_AUTH_ENDPOINT = "https://mindlampihub.xecurify.com/moas/idp/openidsso"
const MINIORANGE_TOKEN_ENDPOINT = "https://mindlampihub.xecurify.com/moas/rest/oauth/token"
const MINIORANGE_USERINFO_ENDPOINT = "https://mindlampihub.xecurify.com/moas/rest/oauth/getuserinfo"
const MINIORANGE_CLIENT_ID = "6s_rx-3lpJNQxnU"
const MINIORANGE_CLIENT_SECRET = "g2Cstn9sNC5niJh6yK3dD3KLtW4"
// const MINIORANGE_REDIRECT_URI = "http://localhost:3000/oauth/callback"
const MINIORANGE_REDIRECT_URI = `${window.location.origin}/auth/callback` // Make sure this matches your MiniOrange app configuration

const GOOGLE_CLIENT_ID = "777556044651-vbh5cmbk8rbll6qlg7nftvp3je52imff.apps.googleusercontent.com"
interface GoogleJwtPayload {
  email: string
  email_verified: boolean
  name: string
  picture: string
  given_name: string
  family_name: string
  locale: string
  iat: number
  exp: number
  sub: string
}

type SuggestedUrlOption = {
  label: string
}

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     logoLogin: {
//       width: 90,
//       margin: "0 auto 30px",
//       textAlign: "center",
//       [theme.breakpoints.down("xs")]: {
//         width: 69,
//         marginBottom: 30,
//       },
//     },
//     logoText: {
//       width: "100%",
//       textAlign: "center",
//       [theme.breakpoints.down("xs")]: {
//         width: "80%",
//         margin: "0 auto",
//       },
//       "& svg": { width: "100%", height: 41, marginBottom: 10 },
//     },
//     textfieldStyle: {
//       "& input": { backgroundColor: "#f5f5f5", borderRadius: 10 },
//       "& fieldset": { border: 0 },
//     },
//     buttonNav: {
//       "& button": { width: 200, "& span": { textTransform: "capitalize", fontSize: 16, fontWeight: "bold" } },
//     },
//     linkBlue: { color: "#6083E7", fontWeight: "bold", cursor: "pointer", "&:hover": { textDecoration: "underline" } },
//     loginContainer: { height: "90vh", paddingTop: "3%" },
//     loginInner: { maxWidth: 320 },
//     loginDisabled: {
//       opacity: 0.5,
//     },
//     dividerContainer: {
//       display: "flex",
//       alignItems: "center",
//       margin: "20px 0",
//     },
//     divider: {
//       flex: 1,
//     },
//     dividerText: {
//       margin: "0 10px",
//       color: theme.palette.text.secondary,
//     },
//     googleButton: {
//       width: "100%",
//       marginBottom: "20px",
//       "& > div": {
//         width: "100% !important",
//       },
//     },
//     miniorangeButton: {
//       width: "100%",
//       marginBottom: "20px",
//       backgroundColor: "#FF6B4A",
//       color: "white",
//       padding: "10px",
//       borderRadius: "4px",
//       cursor: "pointer",
//       textAlign: "center",
//       "&:hover": {
//         backgroundColor: "#E85E40",
//       },
//     },
//     miniOrangeButton: {
//       width: "100%",
//       marginBottom: "20px",
//       backgroundColor: "#FF6B2B",
//       color: "white",
//       padding: "10px",
//       borderRadius: "4px",
//       cursor: "pointer",
//       border: "none",
//       fontWeight: "bold",
//       "&:hover": {
//         backgroundColor: "#E55A1A",
//       },
//     },
//   })
// )

export default function Login({ setIdentity, lastDomain, onComplete, ...props }) {
  const { t, i18n } = useTranslation()
  // defaultaddress = "lamp-aiims.ihub-anubhuti-iiitd.org:3000" 192.168.21.214:3000

  const [state, setState] = useState({
    serverAddress:
      lastDomain ??
      (process.env.NODE_ENV === "development" && process.env.REACT_APP_PORT === "8000"
        ? "192.168.21.214:8000"
        : "emersive.io"),
    id: undefined,
    password: undefined,
  })
  console.log(
    lastDomain,
    process.env.NODE_ENV === "development" && process.env.REACT_APP_PORT === "8000",
    process.env.NODE_ENV === "development" && process.env.REACT_APP_PORT === "8000"
      ? "192.168.21.214:8000"
      : "emersive.io"
  )
  console.log("state and node env", state, process.env.NODE_ENV, process.env.REACT_APP_PORT)
  const [srcLocked, setSrcLocked] = useState(false)
  const [tryitMenu, setTryitMenu] = useState<Element>()
  const [helpMenu, setHelpMenu] = useState<Element>()
  const [loginClick, setLoginClick] = useState(false)
  const [options, setOptions] = useState([])
  const { enqueueSnackbar } = useSnackbar()
  // const classes = useStyles()
  const userLanguages = ["en-US", "es-ES", "hi-IN", "de-DE", "da-DK", "fr-FR", "ko-KR", "it-IT", "zh-CN", "zh-HK"]

  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // selecting language button
  const [fabMenu, setFabMenu] = useState(null)
  // const [open, setOpen] = useState(false)
  // const handleOpen = () => setOpen(true)
  // const handleClose = () => setOpen(false)

  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))

  const getSelectedLanguage = () => {
    const matched_codes = Object.keys(locale_lang).filter((code) => code.startsWith(navigator.language))
    const lang = matched_codes.length > 0 ? matched_codes[0] : "en-US"
    return i18n.language ? i18n.language : userLanguages.includes(lang) ? lang : "en-US"
  }

  const [selectedLanguage, setSelectedLanguage]: any = useState(getSelectedLanguage())

  useEffect(() => {
    const cachedOptions = localStorage.getItem("cachedOptions")
    let options: SuggestedUrlOption[]
    if (!cachedOptions) {
      options = [{ label: "api.lamp.digital" }]
    } else {
      options = JSON.parse(cachedOptions).filter((o) => typeof o?.label !== "undefined")
    }
    setOptions(options)
    let query = window.location.hash.split("?")
    if (!!query && query.length > 1) {
      let src = Object.fromEntries(new URLSearchParams(query[1]))["src"]
      if (typeof src === "string" && src.length > 0) {
        setState((state) => ({ ...state, serverAddress: src }))
        setSrcLocked(true)
      }
    }
  }, [])

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage])

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential)
      // const googleUser = {
      //   id: decoded.email.split("@")[0],
      //   password: credentialResponse.credential,
      //   serverAddress: state.serverAddress || lastDomain,
      // }
      const googleUser = {
        id: " _google_ " + decoded.email, //.split(".org")[0],
        password: credentialResponse.credential, //decoded.email.split("@")[0],
        // loginType: '_google_',
        // token: credentialResponse.credential,
        serverAddress: state.serverAddress || lastDomain,
      }
      console.log("oauth user", googleUser)
      setLoginClick(true)

      try {
        const res = await setIdentity(googleUser)

        console.log("returned", res)

        if (res.authType === "participant") {
          localStorage.setItem("lastTab" + res.identity.id, JSON.stringify(new Date().getTime()))
          await LAMP.SensorEvent.create(res.identity.id, {
            timestamp: Date.now(),
            sensor: "lamp.analytics",
            data: {
              type: "login",
              device_type: "Dashboard",
              user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
              login_method: "google",
            },
          } as any)
          await LAMP.Type.setAttachment(res.identity.id, "me", "lamp.participant.timezone", timezoneVal())
        }

        localStorage.setItem(
          "LAMP_user_" + res.identity.id,
          JSON.stringify({
            language: selectedLanguage,
          })
        )

        await Service.deleteDB()
        await Service.deleteUserDB()

        setLoginClick(false)
        onComplete()
      } catch (err) {
        enqueueSnackbar(`${t("Failed to authenticate with Google credentials.")}`, {
          variant: "error",
        })
        setLoginClick(false)
      }
    } catch (error) {
      enqueueSnackbar(`${t("Error processing Google sign-in.")}`, {
        variant: "error",
      })
      setLoginClick(false)
    }
  }
  const handleGoogleError = () => {
    enqueueSnackbar(`${t("Google sign-in was unsuccessful.")}`, {
      variant: "error",
    })
  }

  const [miniOrangeLoading, setMiniOrangeLoading] = useState(false)
  const generateState = () => {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0].toString(36)
  }
  const handleMiniOrangeLogin = () => {
    try {
      setMiniOrangeLoading(true)

      // Generate and store state
      const oauthState = generateState()
      sessionStorage.setItem("miniOrangeState", oauthState)
      sessionStorage.setItem("miniOrangeServerAddress", state.serverAddress)

      // Build authorization URL parameters
      const params = new URLSearchParams({
        response_type: "code",
        client_id: MINIORANGE_CLIENT_ID,
        redirect_uri: MINIORANGE_REDIRECT_URI,
        // 'http://localhost:8080/auth/callback',
        scope: "openid email profile",
        state: oauthState,
        prompt: "login", // Force authentication
      })

      const authUrl = `${MINIORANGE_AUTH_ENDPOINT}?${params.toString()}`
      console.log("Redirecting to:", authUrl)

      window.location.href = authUrl
    } catch (error) {
      console.error("MiniOrange auth error:", error)
      enqueueSnackbar(`${t("Error during MiniOrange authentication.")}`, {
        variant: "error",
      })
    } finally {
      setMiniOrangeLoading(false)
    }
  }
  useEffect(() => {
    const handleCallback = async () => {
      // Only run this if we're on the callback route
      if (!window.location.pathname.includes("/auth/callback")) return

      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      const receivedState = urlParams.get("state")
      const storedState = sessionStorage.getItem("miniOrangeState")

      console.log("Callback received:", {
        hasCode: !!code,
        state: receivedState,
        storedState,
        stateMatch: receivedState === storedState,
      })

      if (!code) {
        console.error("No code received in callback")
        enqueueSnackbar(`${t("Authentication failed - no code received")}`, {
          variant: "error",
        })
        return
      }

      if (receivedState !== storedState) {
        console.error("State mismatch - possible CSRF attempt")
        enqueueSnackbar(`${t("Authentication failed - state mismatch")}`, {
          variant: "error",
        })
        return
      }

      try {
        setLoginClick(true)

        const tokenResponse = await fetch(MINIORANGE_TOKEN_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: MINIORANGE_CLIENT_ID,
            client_secret: MINIORANGE_CLIENT_SECRET,
            redirect_uri: MINIORANGE_REDIRECT_URI,
            //  'http://localhost:8080/auth/callback',
          }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.error("Token Error:", errorText)
          throw new Error("Token exchange failed")
        }

        const tokenData = await tokenResponse.json()

        const userInfoResponse = await fetch(MINIORANGE_USERINFO_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        })

        if (!userInfoResponse.ok) {
          throw new Error("Failed to get user info")
        }

        const userData = await userInfoResponse.json()

        // Create user object for setIdentity
        const miniOrangeUser = {
          id: `_miniorange_${userData.email || userData.sub}`,
          password: tokenData.access_token,
          serverAddress: sessionStorage.getItem("miniOrangeServerAddress") || state.serverAddress,
        }

        const res = await setIdentity(miniOrangeUser)

        // Clean up
        sessionStorage.removeItem("miniOrangeState")
        sessionStorage.removeItem("miniOrangeServerAddress")

        onComplete()
      } catch (error) {
        console.error("Callback handling error:", error)
        enqueueSnackbar(`${t("Failed to complete authentication.")}`, {
          variant: "error",
        })
      } finally {
        setLoginClick(false)
        setMiniOrangeLoading(false)
      }
    }

    handleCallback()
  }, [])

  const handleMiniOrangeLogin2 = async () => {
    try {
      setMiniOrangeLoading(true)

      // Generate and store state
      const oauthState = generateState()
      sessionStorage.setItem("miniOrangeState", oauthState)
      sessionStorage.setItem("miniOrangeServerAddress", state.serverAddress)

      // Build authorization URL parameters
      const params = new URLSearchParams({
        response_type: "code",
        client_id: MINIORANGE_CLIENT_ID,
        redirect_uri: MINIORANGE_REDIRECT_URI,
        scope: "openid email profile",
        state: oauthState,
      })

      // Log request parameters for debugging
      console.log("Auth Request Parameters:", {
        endpoint: MINIORANGE_AUTH_ENDPOINT,
        params: Object.fromEntries(params.entries()),
        fullUrl: `${MINIORANGE_AUTH_ENDPOINT}?${params.toString()}`,
      })
      try {
        // Make a test request first to check endpoint
        const response = await fetch(`${MINIORANGE_AUTH_ENDPOINT}?${params.toString()}`)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Auth Error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // If test succeeds, proceed with actual redirect
        window.location.href = `${MINIORANGE_AUTH_ENDPOINT}?${params.toString()}`
      } catch (error) {
        console.error("Network or Auth Error:", error)
        enqueueSnackbar(`${t("Error connecting to authentication server.")}`, {
          variant: "error",
        })
      }
    } catch (error) {
      console.error("MiniOrange auth error:", error)
      enqueueSnackbar(`${t("Error during MiniOrange authentication.")}`, {
        variant: "error",
      })
    } finally {
      setMiniOrangeLoading(false)
    }
  }

  // Separate callback handler
  const handleMiniOrangeCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const receivedState = urlParams.get("state")
    const storedState = sessionStorage.getItem("miniOrangeState")

    console.log("Callback Parameters:", {
      code: code ? "present" : "missing",
      receivedState,
      storedState,
      match: receivedState === storedState,
    })

    if (code && receivedState === storedState) {
      try {
        setLoginClick(true)

        // Log token request parameters
        console.log("Token Request Parameters:", {
          endpoint: MINIORANGE_TOKEN_ENDPOINT,
          code,
          redirect_uri: MINIORANGE_REDIRECT_URI,
        })

        const tokenResponse = await fetch(MINIORANGE_TOKEN_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: MINIORANGE_CLIENT_ID,
            client_secret: MINIORANGE_CLIENT_SECRET,
            redirect_uri: MINIORANGE_REDIRECT_URI,
          }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.error("Token Error:", {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            body: errorText,
          })
          throw new Error("Token exchange failed")
        }

        const data = await tokenResponse.json()
        console.log("Token Response:", {
          hasAccessToken: !!data.access_token,
          tokenType: data.token_type,
          scope: data.scope,
        })

        // Continue with your existing login logic...
      } catch (error) {
        console.error("Callback handling error:", error)
        enqueueSnackbar(`${t("Failed to complete authentication.")}`, {
          variant: "error",
        })
      } finally {
        setLoginClick(false)
        setMiniOrangeLoading(false)
      }
    }
  }

  // try this todo
  const handleMiniOrangeLogin_1 = async () => {
    try {
      setMiniOrangeLoading(true)

      // First, get authorization token
      const authResponse = await fetch(MINIORANGE_AUTH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: MINIORANGE_CLIENT_ID,
          client_secret: MINIORANGE_CLIENT_SECRET,
          grant_type: "client_credentials",
          scope: "openid email profile",
        }),
      })

      if (!authResponse.ok) {
        throw new Error("Failed to get authorization token")
      }

      const authData = await authResponse.json()

      // Now get user info using the access token
      const userInfoResponse = await fetch(MINIORANGE_USERINFO_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      })

      if (!userInfoResponse.ok) {
        throw new Error("Failed to get user info")
      }

      const userData = await userInfoResponse.json()

      // Create user object for setIdentity
      const miniOrangeUser = {
        id: "_miniorange_" + userData.email,
        password: authData.access_token,
        serverAddress: state.serverAddress || lastDomain,
      }

      setLoginClick(true)

      try {
        const res = await setIdentity(miniOrangeUser)

        if (res.authType === "participant") {
          localStorage.setItem("lastTab" + res.identity.id, JSON.stringify(new Date().getTime()))
          await LAMP.SensorEvent.create(res.identity.id, {
            timestamp: Date.now(),
            sensor: "lamp.analytics",
            data: {
              type: "login",
              device_type: "Dashboard",
              user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
              login_method: "miniorange",
            },
          } as any)
          await LAMP.Type.setAttachment(res.identity.id, "me", "lamp.participant.timezone", timezoneVal())
        }

        localStorage.setItem(
          "LAMP_user_" + res.identity.id,
          JSON.stringify({
            language: selectedLanguage,
          })
        )

        await Service.deleteDB()
        await Service.deleteUserDB()

        setLoginClick(false)
        onComplete()
      } catch (err) {
        console.error("SetIdentity error:", err)
        enqueueSnackbar(`${t("Failed to authenticate with MiniOrange.")}`, {
          variant: "error",
        })
        setLoginClick(false)
      }
    } catch (error) {
      console.error("MiniOrange auth error:", error)
      enqueueSnackbar(`${t("Error during MiniOrange authentication.")}`, {
        variant: "error",
      })
    } finally {
      setMiniOrangeLoading(false)
    }
  }

  // const handleMiniOrangeLogin = () => {
  //   setMiniOrangeLoading(true)
  //   const authUrl = `${MINIORANGE_AUTH_ENDPOINT}?client_id=${MINIORANGE_CLIENT_ID}&redirect_uri=${MINIORANGE_REDIRECT_URI}&response_type=code&scope=openid email profile`
  //   console.log("authUrl", authUrl)
  //   window.location.href = authUrl
  // }
  // useEffect(() => {
  //   const handleMiniOrangeCallback = async () => {
  //     const urlParams = new URLSearchParams(window.location.search)
  //     const code = urlParams.get("code")
  //     console.log("entry to miniorange")
  //     if (code) {
  //       try {
  //         // Exchange code for token
  //         const tokenResponse = await fetch(MINIORANGE_TOKEN_ENDPOINT, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/x-www-form-urlencoded",
  //           },
  //           body: new URLSearchParams({
  //             grant_type: "authorization_code",
  //             code,
  //             client_id: MINIORANGE_CLIENT_ID,
  //             client_secret: MINIORANGE_CLIENT_SECRET,
  //             redirect_uri: MINIORANGE_REDIRECT_URI,
  //           }),
  //         })

  //         const tokenData = await tokenResponse.json()

  //         // Get user info using access token
  //         const userInfoResponse = await fetch(MINIORANGE_USERINFO_ENDPOINT, {
  //           headers: {
  //             Authorization: `Bearer ${tokenData.access_token}`,
  //           },
  //         })

  //         const userData = await userInfoResponse.json()

  //         // Format user data similar to Google login
  //         const miniOrangeUser = {
  //           id: "_miniorange_" + userData.email,
  //           password: tokenData.access_token,
  //           serverAddress: state.serverAddress || lastDomain,
  //         }

  //         setLoginClick(true)

  //         try {
  //           const res = await setIdentity(miniOrangeUser)

  //           if (res.authType === "participant") {
  //             localStorage.setItem("lastTab" + res.identity.id, JSON.stringify(new Date().getTime()))
  //             await LAMP.SensorEvent.create(res.identity.id, {
  //               timestamp: Date.now(),
  //               sensor: "lamp.analytics",
  //               data: {
  //                 type: "login",
  //                 device_type: "Dashboard",
  //                 user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
  //                 login_method: "miniorange",
  //               },
  //             } as any)
  //             await LAMP.Type.setAttachment(res.identity.id, "me", "lamp.participant.timezone", timezoneVal())
  //           }

  //           localStorage.setItem(
  //             "LAMP_user_" + res.identity.id,
  //             JSON.stringify({
  //               language: selectedLanguage,
  //             })
  //           )

  //           await Service.deleteDB()
  //           await Service.deleteUserDB()

  //           setLoginClick(false)
  //           onComplete()
  //         } catch (err) {
  //           enqueueSnackbar(`${t("Failed to authenticate with MiniOrange credentials.")}`, {
  //             variant: "error",
  //           })
  //           setLoginClick(false)
  //         }
  //       } catch (error) {
  //         enqueueSnackbar(`${t("Error processing MiniOrange sign-in.")}`, {
  //           variant: "error",
  //         })
  //         setLoginClick(false)
  //       }
  //     }
  //   }

  //   handleMiniOrangeCallback()
  // }, [])

  const handleMiniorangeLogin = async () => {
    try {
      // Generate random state for security
      const state = Math.random().toString(36).substring(7)
      localStorage.setItem("miniorange_state", state)

      // Construct auth URL with required parameters
      const authUrl =
        `${MINIORANGE_AUTH_ENDPOINT}?` +
        `client_id=${MINIORANGE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(MINIORANGE_REDIRECT_URI)}&` +
        `state=${state}&` +
        `response_type=code&` +
        `scope=openid profile email`

      // Redirect to MinioRange login
      window.location.href = authUrl
    } catch (error) {
      enqueueSnackbar(`${t("Error initiating MinioRange login.")}`, {
        variant: "error",
      })
    }
  }

  useEffect(() => {
    const handleMiniorangeCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      const returnedState = urlParams.get("state")
      const savedState = localStorage.getItem("miniorange_state")

      if (code && returnedState === savedState) {
        try {
          // Exchange code for token
          const tokenResponse = await fetch(MINIORANGE_TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              client_id: MINIORANGE_CLIENT_ID,
              client_secret: MINIORANGE_CLIENT_SECRET,
              redirect_uri: MINIORANGE_REDIRECT_URI,
            }),
          })

          const tokenData = await tokenResponse.json()

          if (tokenData.access_token) {
            // Get user info using access token
            const userResponse = await fetch("https://login.xecurify.com/moas/rest/oauth/user", {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
              },
            })
            const userData = await userResponse.json()

            // Create user object similar to Google login
            const miniorangeUser = {
              id: `_miniorange_${userData.email}`,
              password: tokenData.access_token,
              serverAddress: state.serverAddress || lastDomain,
            }

            setLoginClick(true)
            const res = await setIdentity(miniorangeUser)

            // Handle successful login similar to Google login
            if (res.authType === "participant") {
              localStorage.setItem("lastTab" + res.identity.id, JSON.stringify(new Date().getTime()))
              await LAMP.SensorEvent.create(res.identity.id, {
                timestamp: Date.now(),
                sensor: "lamp.analytics",
                data: {
                  type: "login",
                  device_type: "Dashboard",
                  user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
                  login_method: "miniorange",
                },
              })
            }

            localStorage.setItem(
              "LAMP_user_" + res.identity.id,
              JSON.stringify({
                language: selectedLanguage,
              })
            )

            await Service.deleteDB()
            await Service.deleteUserDB()

            setLoginClick(false)
            onComplete()
          }
        } catch (error) {
          enqueueSnackbar(`${t("Failed to authenticate with MinioRange.")}`, {
            variant: "error",
          })
          setLoginClick(false)
        }
      }
    }

    handleMiniorangeCallback()
  }, [])

  let handleServerInput = (value) => {
    setState({ ...state, serverAddress: value?.label ?? value })
  }

  let handleChange = (event) =>
    setState({
      ...state,
      [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    })

  let handleLogin = (event: any, mode?: string): void => {
    event.preventDefault()
    console.log("clicked login", event, mode, state)
    if (!!state.serverAddress && !options.find((item) => item?.label == state.serverAddress)) {
      options.push({ label: state.serverAddress })
      localStorage.setItem("cachedOptions", JSON.stringify(options))
    }
    console.log(state)
    setOptions(options)
    setLoginClick(true)
    if (mode === undefined && (!state.id || !state.password)) {
      enqueueSnackbar(`${t("Incorrect username, password, or server address.")}`, {
        variant: "error",
      })
      setLoginClick(false)
      return
    }
    setIdentity({
      id: !!mode ? `${mode}@demo.lamp.digital` : state.id,
      password: !!mode ? "demo" : state.password,
      serverAddress: !!mode ? "demo.lamp.digital" : state.serverAddress,
    })
      .then(async (res) => {
        console.log("$%#%#%#%#%# REs", res)
        if (res.authType === "participant") {
          localStorage.setItem("lastTab" + res.identity.id, JSON.stringify(new Date().getTime()))
          LAMP.SensorEvent.create(res.identity.id, {
            timestamp: Date.now(),
            sensor: "lamp.analytics",
            data: {
              type: "login",
              device_type: "Dashboard",
              user_agent: `LAMP-dashboard/${process.env.REACT_APP_GIT_SHA} ${window.navigator.userAgent}`,
            },
          } as any).then((res) => console.dir(res))
          LAMP.Type.setAttachment(res.identity.id, "me", "lamp.participant.timezone", timezoneVal())
          const part_full = (await LAMP.Participant.view(res.identity.id)) as any
          const partici = {
            ...part_full,
            isLoggedIn: true,
            systemTimestamps: {
              ...part_full.systemTimestamps,
              lastLoginTime: new Date(),
            },
          }
          await LAMP.Participant.update(res.identity.id, partici)
            .then((ans) => {
              console.log("update participant", partici, "receives", ans, "id")
              console.dir(partici)
              console.dir(ans)
            })
            .catch((error) => {
              console.log("update send", partici, "error", error)
            })
        }
        if (res.authType === "researcher") {
          console.log("111HEEEEEEEElOOO reached")
          if (res.auth.serverAddress === "demo.lamp.digital") {
            let studiesSelected =
              localStorage.getItem("studies_" + res.identity.id) !== null
                ? JSON.parse(localStorage.getItem("studies_" + res.identity.id))
                : []
            if (studiesSelected.length === 0) {
              let studiesList = [res.identity.name]
              localStorage.setItem("studies_" + res.identity.id, JSON.stringify(studiesList))
              localStorage.setItem("studyFilter_" + res.identity.id, JSON.stringify(1))
            }
          } else {
            console.log("HEEEEEEEElOOO reached")
            let researcherT = res.identity
            researcherT.timestamps.lastLoginAt = new Date().getTime()
            researcherT.loggedIn = true
            let result = await LAMP.Researcher.update(researcherT.id, researcherT)
            console.log("result afyer update timing", result)
          }
        }
        // process.env.REACT_APP_LATEST_LAMP === "true"
        //   ? enqueueSnackbar(`${t("Note: This is the latest version of LAMP.")}`, { variant: "info" })
        //   : enqueueSnackbar(`${t("Note: This is NOT the latest version of LAMP")}`, { variant: "info" })
        localStorage.setItem(
          "LAMP_user_" + res.identity.id,
          JSON.stringify({
            language: selectedLanguage,
          })
        )
        ;(async () => {
          await Service.deleteDB()
          await Service.deleteUserDB()
        })()
        setLoginClick(false)
        onComplete()
      })
      .catch((err) => {
        // console.warn("error with auth request", err)
        enqueueSnackbar(`${t("Incorrect username, password, or server address.")}`, {
          variant: "error",
        })
        if (!srcLocked)
          enqueueSnackbar(`${t("Are you sure you're logging into the right Emersive server?")}`, { variant: "info" })
        setLoginClick(false)
      })
  }
  const timezoneVal = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezone
  }

  const [rememberMe, setRememberMe] = useState<boolean>(false)

  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked)
  }

  return (
    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
      <ResponsiveMargin>
        <Grid
          container
          // spacing={2}
          justifyContent="center"
          alignItems="center"
          style={{ minHeight: "100vh", height: "100vh", width: "100vw" }}
        >
          {supportsSidebar && (
            <Grid item xs={12} md={7} className="line-art-container">
              {/*<div className="line-art-div">*/}
              {/*<LineArt className="line-art" />*/}
              {/*</div>*/}
              <img className="corner top-left-corner" src={TopLeft} alt="top left corner" />
              <img className="corner bottom-right-corner" src={BottomRight} alt="bottom right corner" />

              <Logo className="logo-component" style={{ zIndex: 1 }} />
              <div className="platform-name">emersive</div>
              <div className="platform-tag">MOBILE SENSING RESEARCH</div>
            </Grid>
          )}
          <Grid item xs={12} md={supportsSidebar ? 5 : 12} className="grid-item">
            <div className="fab-container">
              <Fab
                color="primary"
                aria-label="select language"
                // onClick={handleOpen}
                onClick={(event) => setFabMenu(event.currentTarget)} // Open menu on click
                size="small"
                // style={{ position: "fixed", top: 16, right: 16 }}
              >
                <TranslateIcon />
              </Fab>
              <Menu
                anchorEl={fabMenu} // Position menu relative to Fab
                open={Boolean(fabMenu)} // Open the menu if fabMenu is set
                onClose={() => setFabMenu(null)} // Close menu on selection or outside click
              >
                {Object.keys(locale_lang).map((key) => {
                  if (userLanguages.includes(key)) {
                    return (
                      <MenuItem
                        key={key}
                        value={key}
                        onClick={() => {
                          setSelectedLanguage(key) // Set language on click
                          setFabMenu(null) // Close menu
                        }}
                      >
                        {`${locale_lang[key].native} (${locale_lang[key].english})`}
                      </MenuItem>
                    )
                  }
                })}
              </Menu>
              <Fab
                size="small"
                color="primary"
                aria-label="help"
                // style={{ position: "fixed", top: 8, right: 8 }}
                onClick={(event) => setHelpMenu(event.currentTarget)}
              >
                {/* <HelpCenterOutlined/> */}
                <HelpIcon style={{ fontSize: "2.5 rem" }} />
                {/* <Icon style={{ fontSize: "2rem", color:"#23c433" }}>help</Icon> */}
              </Fab>
              <Menu
                id="simple-menu"
                anchorEl={helpMenu}
                keepMounted
                open={Boolean(helpMenu)}
                onClose={() => setHelpMenu(undefined)}
              >
                <MenuItem
                  dense
                  onClick={() => {
                    setHelpMenu(undefined)
                    window.open("https://docs.lamp.digital", "_blank")
                  }}
                >
                  <b style={{ color: colors.grey["600"] }}>{`${t("Help & Support")}`}</b>
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => {
                    setHelpMenu(undefined)
                    window.open("https://community.lamp.digital", "_blank")
                  }}
                >
                  <b style={{ color: colors.grey["600"] }}>LAMP {`${t("Community")}`}</b>
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => {
                    setHelpMenu(undefined)
                    window.open("mailto:team@digitalpsych.org", "_blank")
                  }}
                >
                  <b style={{ color: colors.grey["600"] }}>{`${t("Contact Us")}`}</b>
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => {
                    setHelpMenu(undefined)
                    window.open("https://docs.lamp.digital/privacy/", "_blank")
                  }}
                >
                  <b style={{ color: colors.grey["600"] }}>{`${t("Privacy Policy")}`}</b>
                </MenuItem>
              </Menu>
            </div>
            <div className="card-container">
              {showForgotPassword ? (
                <>
                  <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
                </>
              ) : (
                <>
                  <h1
                    style={{
                      margin: "0px",
                      marginBottom: "5px",
                      alignSelf: "flex-start", // This centers only the h1
                      fontWeight: "900",
                      fontSize: "40px",
                    }}
                  >
                    Sign in
                  </h1>
                  {/*<span style={{alignSelf:"flex-start" , width:"100%"}}>*/}
                  {/*  <div>Don't have a study account ?</div>*/}
                  {/*  <a href="https://example.com">Sign up</a>*/}
                  {/*</span>*/}

                  <form style={{ width: "100%" }} onSubmit={(e) => handleLogin(e)}>
                    <Box display="flex" flexDirection="column">
                      <TextField
                        required
                        name="id"
                        type="email"
                        margin="normal"
                        variant="outlined"
                        style={{ width: "100%", height: 50, marginTop: 30, marginBottom: 30 }}
                        placeholder={`${t("Email")}`}
                        value={state.id || ""}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          className: "textfield-style",
                          autoCapitalize: "off",
                        }}
                      />

                      <TextField
                        required
                        name="password"
                        type="password"
                        margin="normal"
                        variant="outlined"
                        style={{ width: "100%", height: 50, marginBottom: 20 }}
                        placeholder="Password"
                        value={state.password || ""}
                        onChange={handleChange}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            handleLogin(event)
                          }
                        }}
                        InputProps={{
                          className: "textfield-style",
                          autoCapitalize: "off",
                        }}
                      />
                      {/*<div className="forgot-container">*/}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%", // or set as needed
                          fontFamily: "sans-serif",
                          fontSize: "16px",
                        }}
                      >
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <input
                            type="checkbox"
                            style={{ cursor: "pointer" }}
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                          />
                          Remember me
                        </label>
                        <h4
                          style={{
                            padding: "0px",
                            fontWeight: 200,
                            color: "rgb(26, 115, 232)",
                            cursor: "pointer",
                          }}
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot Password?
                        </h4>
                      </div>

                      {/*</div>*/}

                      <Box className="button-nav" width={1} textAlign="center">
                        <Fab
                          variant="extended"
                          type="submit"
                          onClick={handleLogin}
                          className={loginClick ? "loginDisabled" : ""}
                          style={{
                            background: "#cf825a", // Match your image's purple shade
                            color: "white",
                            width: "100%",
                            height: "56px", // Consistent height (adjust as needed)
                            borderRadius: "999px", // Pill shape
                            fontWeight: "500",
                            fontSize: "16px",
                            textTransform: "none",
                            position: "relative",
                          }}
                        >
                          {t("Sign in")}
                          <input
                            type="submit"
                            disabled={loginClick}
                            style={{
                              cursor: "pointer",
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              right: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                              border: "none",
                              margin: 0,
                              padding: 0,
                            }}
                          />
                        </Fab>
                      </Box>

                      <div
                        style={{
                          alignSelf: "center",
                          marginTop: "20px",
                          fontSize: "clamp(0.5rem, 1.666vw + 0.333rem, 1.333rem)",
                          fontWeight: "200",
                        }}
                      >
                        -------or-------
                      </div>
                      {/* google login here */}
                      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <div className="google-button" style={{ width: "100%", marginBottom: "20px" }}>
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            shape="pill"
                            text="signin_with"
                            locale={selectedLanguage}
                            size="large"
                            width="100%" // Ensures the button takes the full width
                            containerProps={{
                              style: {
                                width: "100%",
                                display: "flex",
                                justifyContent: "center", // Center the button
                              },
                            }}
                          />
                        </div>
                      </GoogleOAuthProvider>

                      {/* <div className="divider-container">
                        <Divider className="divider" />
                        <Typography variant="body2" className="divider-text">
                          {t("or")}
                        </Typography>
                        <Divider className="divider" />
                      </div>

                      <button
                        className="miniorange-button"
                        onClick={handleMiniOrangeLogin}
                        disabled={miniOrangeLoading}
                      >
                        {miniOrangeLoading ? t("Loading...") : t("Continue with MiniOrange")}
                      </button> */}

                      {/* <Box textAlign="center" width={1} mt={4} mb={4}>
                        <Link
                          underline="none"
                          className="link-blue"
                          onClick={(event) => setTryitMenu(event.currentTarget)}
                        >
                          {`${t("Try it")}`}
                        </Link>
                        <br />
                        <Link
                          underline="none"
                          className="link-blue"
                          onClick={(event) => window.open("https://www.digitalpsych.org/studies.html", "_blank")}
                        >
                          {`${t("Research studies using Emersive")}`}
                        </Link>
                        <Menu
                          keepMounted
                          open={Boolean(tryitMenu)}
                          anchorPosition={tryitMenu?.getBoundingClientRect()}
                          anchorReference="anchorPosition"
                          onClose={() => setTryitMenu(undefined)}
                        >
                          <MenuItem disabled divider>
                            <b>{`${t("Try Emersive out as a...")}`}</b>
                          </MenuItem>
                          <MenuItem
                            onClick={(event) => {
                              setTryitMenu(undefined)
                              handleLogin(event, "researcher")
                            }}
                          >
                            {`${t("Researcher")}`}
                          </MenuItem>
                          <MenuItem
                            divider
                            onClick={(event) => {
                              setTryitMenu(undefined)
                              handleLogin(event, "clinician")
                            }}
                          >
                            {`${t("Clinician")}`}
                          </MenuItem>
                          <MenuItem
                            onClick={(event) => {
                              setTryitMenu(undefined)
                              handleLogin(event, "participant")
                            }}
                          >
                            {`${t("Participant")}`}
                          </MenuItem>
                          <MenuItem
                            onClick={(event) => {
                              setTryitMenu(undefined)
                              handleLogin(event, "patient")
                            }}
                          >
                            {`${t("User")}`}
                          </MenuItem>
                        </Menu>
                      </Box> */}
                    </Box>
                  </form>
                </>
              )}
            </div>
          </Grid>
        </Grid>
      </ResponsiveMargin>
    </Slide>
  )
}
