// src/components/FormBuilder2/FormBuilderWrapper.tsx

import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Paper } from "@material-ui/core"
import FormBuilder2 from "./FormBuilder2"

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: "relative",
    zIndex: 1,
    "& .formio-builder-container": {
      // Additional wrapper styles if needed
    },
  },
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    position: "relative",
  },
}))

const FormBuilderWrapper: React.FC = () => {
  const classes = useStyles()

  const handleFormChange = (form: any) => {
    console.log("Form changed:", form)
  }

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.paper}>
        <FormBuilder2 onChange={handleFormChange} initialComponents={[]} />
      </Paper>
    </div>
  )
}

export default FormBuilderWrapper
