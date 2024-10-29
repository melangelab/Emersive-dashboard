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
} from "@material-ui/core"
import { useSnackbar } from "notistack"
import TranslateIcon from "@mui/icons-material/Translate"
import LAMP from "lamp-core"
import locale_lang from "../locale_map.json"
import { Service } from "./DBService/DBService"

// Local Imports
import { ResponsiveMargin } from "./Utils"
import { ReactComponent as Logo } from "../icons/Logo.svg"
import { ReactComponent as Logotext } from "../icons/mindLAMP.svg"
import { useTranslation } from "react-i18next"
import { Autocomplete } from "@mui/material"

// google login
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import HelpIcon from "@mui/icons-material/Help"
import { HelpCenterOutlined } from "@mui/icons-material"
// import jwtDecode from "jwt-decode"

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
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    logoLogin: {
      width: 90,
      margin: "0 auto 30px",
      textAlign: "center",
      [theme.breakpoints.down("xs")]: {
        width: 69,
        marginBottom: 30,
      },
    },
    logoText: {
      width: "100%",
      textAlign: "center",
      [theme.breakpoints.down("xs")]: {
        width: "80%",
        margin: "0 auto",
      },
      "& svg": { width: "100%", height: 41, marginBottom: 10 },
    },
    textfieldStyle: {
      "& input": { backgroundColor: "#f5f5f5", borderRadius: 10 },
      "& fieldset": { border: 0 },
    },
    buttonNav: {
      "& button": { width: 200, "& span": { textTransform: "capitalize", fontSize: 16, fontWeight: "bold" } },
    },
    linkBlue: { color: "#6083E7", fontWeight: "bold", cursor: "pointer", "&:hover": { textDecoration: "underline" } },
    loginContainer: { height: "90vh", paddingTop: "3%" },
    loginInner: { maxWidth: 320 },
    loginDisabled: {
      opacity: 0.5,
    },
    dividerContainer: {
      display: "flex",
      alignItems: "center",
      margin: "20px 0",
    },
    divider: {
      flex: 1,
    },
    dividerText: {
      margin: "0 10px",
      color: theme.palette.text.secondary,
    },
    googleButton: {
      width: "100%",
      marginBottom: "20px",
      "& > div": {
        width: "100% !important",
      },
    },
  })
)

export default function Login({ setIdentity, lastDomain, onComplete, ...props }) {
  const { t, i18n } = useTranslation()
  // defaultaddress = "lamp-aiims.ihub-anubhuti-iiitd.org:3000"
  const [state, setState] = useState({
    serverAddress: lastDomain ?? "192.168.21.214:3000",
    id: undefined,
    password: undefined,
  })
  const [srcLocked, setSrcLocked] = useState(false)
  const [tryitMenu, setTryitMenu] = useState<Element>()
  const [helpMenu, setHelpMenu] = useState<Element>()
  const [loginClick, setLoginClick] = useState(false)
  const [options, setOptions] = useState([])
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const userLanguages = ["en-US", "es-ES", "hi-IN", "de-DE", "da-DK", "fr-FR", "ko-KR", "it-IT", "zh-CN", "zh-HK"]

  // selecting language button
  const [fabMenu, setFabMenu] = useState(null)
  // const [open, setOpen] = useState(false)
  // const handleOpen = () => setOpen(true)
  // const handleClose = () => setOpen(false)

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
      options = [
        { label: "api.lamp.digital" },
        { label: "mindlamp-api.pronet.med.yale.edu" },
        { label: "mindlamp.orygen.org.au" },
        { label: "mindlamp-qa.dmh.lacounty.gov" },
      ]
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
      .then((res) => {
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
        }
        if (res.authType === "researcher" && res.auth.serverAddress === "demo.lamp.digital") {
          let studiesSelected =
            localStorage.getItem("studies_" + res.identity.id) !== null
              ? JSON.parse(localStorage.getItem("studies_" + res.identity.id))
              : []
          if (studiesSelected.length === 0) {
            let studiesList = [res.identity.name]
            localStorage.setItem("studies_" + res.identity.id, JSON.stringify(studiesList))
            localStorage.setItem("studyFilter_" + res.identity.id, JSON.stringify(1))
          }
        }
        process.env.REACT_APP_LATEST_LAMP === "true"
          ? enqueueSnackbar(`${t("Note: This is the latest version of LAMP.")}`, { variant: "info" })
          : enqueueSnackbar(`${t("Note: This is NOT the latest version of LAMP")}`, { variant: "info" })
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
          enqueueSnackbar(`${t("Are you sure you're logging into the right mindLAMP server?")}`, { variant: "info" })
        setLoginClick(false)
      })
  }
  const timezoneVal = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezone
  }

  return (
    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
      <ResponsiveMargin>
        <div style={{ position: "fixed", top: 8, right: 16, display: "flex", alignItems: "center", gap: "8px" }}>
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

          {/* Language Selection Menu */}
          {/* <Select
        open={open}
        onClose={handleClose}
        value={selectedLanguage || "en-US"}
        onChange={(event) => {
          setSelectedLanguage(event.target.value)
          handleClose() // Close dropdown on language select
        }}
        variant="filled"
        style={{ display: "none" }} // Hide the Select visually, handled by FAB
      >
        {Object.keys(locale_lang).map((key) => {
          if (userLanguages.includes(key)) {
            return (
              <MenuItem key={key} value={key}>
                {locale_lang[key].native + " (" + locale_lang[key].english + ")"}
              </MenuItem>
            )
          }
        })}
      </Select> */}
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
        <Grid container direction="row" justifyContent="center" alignItems="center" className={classes.loginContainer}>
          <Grid item className={classes.loginInner}>
            <form onSubmit={(e) => handleLogin(e)}>
              <Box>
                <Box className={classes.logoLogin}>
                  <Logo />
                </Box>
                <Box className={classes.logoText}>
                  <Logotext />
                  <div
                    style={{
                      height: 6,
                      marginBottom: 30,
                      background:
                        "linear-gradient(90deg, rgba(255,214,69,1) 0%, rgba(255,214,69,1) 25%, rgba(101,206,191,1) 25%, rgba(101,206,191,1) 50%, rgba(255,119,91,1) 50%, rgba(255,119,91,1) 75%, rgba(134,182,255,1) 75%, rgba(134,182,255,1) 100%)",
                    }}
                  />
                </Box>
                {/* TODO remove in next commit  */}
                {/* <TextField
                  select
                  label={`${t("Select Language")}`}
                  style={{ width: "100%" }}
                  onChange={(event) => {
                    setSelectedLanguage(event.target.value)
                  }}
                  variant="filled"
                  value={selectedLanguage || "en-US"}
                >
                  {Object.keys(locale_lang).map((key, value) => {
                    if (userLanguages.includes(key)) {
                      return (
                        <MenuItem key={key} value={key}>
                          {locale_lang[key].native + " (" + locale_lang[key].english + ")"}
                        </MenuItem>
                      )
                    }
                  })}
                </TextField> */}
                <Autocomplete
                  freeSolo={true}
                  id="serever-selector"
                  options={options}
                  sx={{ width: "100%", marginTop: "12px" }}
                  value={state.serverAddress || ""}
                  // disabled
                  onChange={(event, value) => handleServerInput(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="serverAddress"
                      variant="filled"
                      value={state.serverAddress || ""}
                      onChange={(event) => handleServerInput(event.target.value)}
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      label={t("Server Address")}
                      helperText={t("Don't enter a domain if you're not sure what this option does.")}
                    />
                  )}
                />
                <TextField
                  required
                  name="id"
                  type="email"
                  margin="normal"
                  variant="outlined"
                  style={{ width: "100%", height: 50 }}
                  placeholder={`${t("my.email@address.com")}`}
                  value={state.id || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    classes: {
                      root: classes.textfieldStyle,
                    },
                    autoCapitalize: "off",
                  }}
                />

                <TextField
                  required
                  name="password"
                  type="password"
                  margin="normal"
                  variant="outlined"
                  style={{ width: "100%", height: 50, marginBottom: 40 }}
                  placeholder="•••••••••"
                  value={state.password || ""}
                  onChange={handleChange}
                  InputProps={{
                    classes: {
                      root: classes.textfieldStyle,
                    },
                  }}
                />

                <Box className={classes.buttonNav} width={1} textAlign="center">
                  <Fab
                    variant="extended"
                    type="submit"
                    style={{ background: "#7599FF", color: "White" }}
                    onClick={handleLogin}
                    className={loginClick ? classes.loginDisabled : ""}
                  >
                    {`${t("Login")}`}
                    <input
                      type="submit"
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        right: 0,
                        left: 0,
                        width: "100%",
                        opacity: 0,
                      }}
                      disabled={loginClick}
                    />
                  </Fab>
                </Box>

                {/* google login here */}
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <div className={classes.dividerContainer}>
                    <Divider className={classes.divider} />
                    <Typography variant="body2" className={classes.dividerText}>
                      {t("or")}
                    </Typography>
                    <Divider className={classes.divider} />
                  </div>

                  <div className={classes.googleButton}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      shape="rectangular"
                      theme="filled_blue"
                      text="continue_with"
                      locale={selectedLanguage}
                    />
                  </div>
                </GoogleOAuthProvider>

                <Box textAlign="center" width={1} mt={4} mb={4}>
                  <Link
                    underline="none"
                    className={classes.linkBlue}
                    onClick={(event) => setTryitMenu(event.currentTarget)}
                  >
                    {`${t("Try it")}`}
                  </Link>
                  <br />
                  <Link
                    underline="none"
                    className={classes.linkBlue}
                    onClick={(event) => window.open("https://www.digitalpsych.org/studies.html", "_blank")}
                  >
                    {`${t("Research studies using mindLAMP")}`}
                  </Link>
                  <Menu
                    keepMounted
                    open={Boolean(tryitMenu)}
                    anchorPosition={tryitMenu?.getBoundingClientRect()}
                    anchorReference="anchorPosition"
                    onClose={() => setTryitMenu(undefined)}
                  >
                    <MenuItem disabled divider>
                      <b>{`${t("Try mindLAMP out as a...")}`}</b>
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
                </Box>
              </Box>
            </form>
          </Grid>
        </Grid>
      </ResponsiveMargin>
    </Slide>
  )
}
