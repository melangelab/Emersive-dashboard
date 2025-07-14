import React, { useState, useEffect } from "react"
import { Grid, Card, CardContent, Typography } from "@material-ui/core"
import { ReactComponent as ProfileIcon } from "../../icons/NewIcons/ProfileIcon.svg"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import LAMP from "lamp-core"
import AdminHeader from "../Header"

const DonutChart = ({ data }) => {
  const formattedData = [
    { name: "Android", value: data.android_user_count },
    { name: "iOS", value: data.ios_user_count },
  ]

  const COLORS = ["#8BC34A", "#A5D6FF"] // Green and light blue

  console.log("Formatted Data for Donut Chart:", formattedData)

  // Custom label renderer with better positioning
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const radius = outerRadius + 30 // Increase this value to move labels further out
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14" // Increased from 12 to 14
        fontWeight="bold" // Added bold for better visibility
      >
        {`${name}: ${value}`}
      </text>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {formattedData.reduce((sum, item) => sum + item.value, 0) === 0 ? (
        <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <Typography variant="h6" style={{ textAlign: "center", color: "#888" }}>
            None of the participants logged in yet
          </Typography>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const AdminDashboard = (props) => {
  const [data, setData] = useState({
    android_user_count: null,
    ios_user_count: null,
    researchers: null,
    participants: null,
    studies: null,
    assessments: null,
    activities: null,
    sensors: null,
  })

  useEffect(() => {
    console.log("Component mounted:", "ADMINDASHBOARD", LAMP.Auth._me, LAMP.Auth._auth)
    // console.log("Tags attached to the type", LAMP.Type.getAttachment(LAMP., undefined))
  }, [])

  const detailsGraph = async () => {
    try {
      const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
      const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
      const filter_type = "device_type"
      const params = new URLSearchParams({
        sensor_spec: "lamp.analytics",
        ignore_binary: "true",
        data_type: "login",
      }).toString()

      const response = await fetch(`${baseURL}/sensor_event/${filter_type}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + authString,
        },
      })

      const result = await response.json()

      if (!result || !result.data) throw new Error("Invalid response")

      console.log("HEY GOT THE FILTER TYPE RESULT,", result.data)
      setData((prevData) => ({ ...prevData, ...result.data }))
    } catch (error) {
      console.error("Error fetching device count:", error)
    }
  }

  const dataCount = async () => {
    // Implementation needed

    const researchers = await LAMP.Researcher.all(null)
    const participants = await LAMP.Participant.all(undefined)
    const studies = await LAMP.Study.all(null)
    const sensors = await LAMP.Sensor.all(null)
    const activities = await LAMP.Activity.all(null)
    console.log("RESEARCHERS %^%^%^%^^%^%^%^%^%^%", researchers.length)
    setData((prevData) => ({
      ...prevData,
      researchers: researchers.length,
      assessments: 0,
      participants: participants.length,
      studies: studies.length,
      sensors: sensors.length,
      activities: activities.length,
    }))
  }

  useEffect(() => {
    detailsGraph()
    dataCount()
  }, [])

  return (
    <>
      <AdminHeader
        adminType={props.adminType}
        authType={props.authType}
        title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
        pageLocation="Dashboard"
      />
      <Grid container spacing={2} className="admin-dashboard-container">
        <Grid item xs={12} sm={6} md={6} className="dashboard-column">
          <Grid container spacing={2}>
            <Grid item md={6} style={{ height: "100%" }}>
              <Card style={{ height: "100%" }}>
                <CardContent className="column-card-content">
                  <Typography variant="h5" className="card-content-text">
                    App Details
                  </Typography>
                  {data.android_user_count !== null && data.ios_user_count !== null ? (
                    <DonutChart data={data} />
                  ) : (
                    <Typography>Loading...</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item md={6}>
              <Card className="column-card">
                <CardContent className="column-card-content">
                  <Typography variant="h5" className="card-content-text">
                    Storage Details
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="dashboard-column">
          <Card className="column-card">
            <CardContent className="column-card-content">
              <Typography
                variant="h2"
                className={`card-content-numerical ${data.researchers ? "" : "loading"}`}
                style={{ color: "#EB8367" }}
              >
                {data.researchers ?? "Loading..."}
              </Typography>
              <Typography variant="h5" className="card-content-text">
                RESEARCHERS
              </Typography>
            </CardContent>
          </Card>
          <Card className="column-card">
            <CardContent className="column-card-content">
              <Typography
                variant="h2"
                className={`card-content-numerical ${data.participants ? "" : "loading"}`}
                style={{ color: "#06B0F0" }}
              >
                {data.participants ?? "Loading..."}
              </Typography>
              <Typography variant="h5" className="card-content-text">
                PARTICIPANTS
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2} className="dashboard-column">
          {["studies", "assessments", "activities", "sensors"].map((key, index) => (
            <Card key={index} className="column-card">
              <CardContent className="column-card-content">
                <Typography
                  className={`card-content-numerical-2ndcol ${data[key] ? "" : "loading"}`}
                  style={{ color: ["#feb199", "green", "purple", "rgb(252, 118, 235)"][index] }}
                >
                  {data[key] ?? "Loading..."}
                </Typography>
                <Typography variant="h5" className="card-content-text">
                  {key.toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </>
  )
}

export default AdminDashboard
