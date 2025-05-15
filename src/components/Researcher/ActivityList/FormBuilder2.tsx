import React, { useEffect, useState } from "react"
import { FormBuilder } from "@formio/react"
import "./FormBuilder.css"
// import 'formiojs/dist/formio.full.css';
// import 'formiojs/dist/formio.builder.css'; // Import Formio CSS for styling
// You might need additional CSS imports for the styling
// import './FormBuilder.css'; // Add a custom CSS file for additional styling

// Define proper types
interface FormSchema {
  display?: string
  components: any[]
  type: string
  title: string
}

interface FormBuilder2Props {
  onChange: (form: FormSchema) => void
  initialComponents: any[]
  formula?: any
}

const FormBuilder2: React.FC<FormBuilder2Props> = ({ onChange, initialComponents, formula }) => {
  // Define the initial form structure with a more complete structure
  const [formState, setFormState] = useState<FormSchema>({
    display: "form",
    components: Array.isArray(initialComponents) ? initialComponents : [],
    type: "form",
    title: "Form Builder",
  })

  // More comprehensive builder options to match documentation
  const builderOptions = {
    builder: {
      basic: {
        title: "Basic",
        default: true,
        weight: 0,
        components: {
          textfield: true,
          textarea: true,
          number: true,
          password: true,
          checkbox: true,
          selectboxes: true,
          select: true,
          radio: true,
          button: true,
        },
      },
      advanced: {
        title: "Advanced",
        weight: 10,
        components: {
          email: true,
          phoneNumber: true,
          datetime: true,
          day: true,
          time: true,
          currency: true,
          survey: true,
          signature: true,
          htmlelement: true,
          content: true,
          datamap: true,
          datagrid: true,
          container: true,
          dataSource: true,
        },
      },
      layout: {
        title: "Layout",
        weight: 20,
        components: {
          panel: true,
          table: true,
          tabs: true,
          columns: true,
          fieldset: true,
          well: true,
        },
      },
      data: {
        title: "Data",
        weight: 30,
        components: {
          hidden: true,
          recaptcha: true,
          file: true,
          form: true,
        },
      },
      premium: {
        title: "Premium",
        weight: 40,
        components: {
          modaledit: true,
          modalpreview: true,
        },
      },
    },
    // Configure form display
    form: {
      // These settings affect how the form is displayed
      theme: "primary", // Use the default theme
      style: "card", // Use the default style
    },
    // Advanced configuration options
    config: {
      showBuilder: true, // Show the builder interface
      showForm: true, // Show the form preview
      showSubmitButton: true, // Show the submit button in the preview
      showCancel: true, // Show the cancel button
    },
  }

  useEffect(() => {
    // Update form state when initialComponents changes
    setFormState((prev) => ({
      ...prev,
      components: Array.isArray(initialComponents) ? initialComponents : [],
    }))
  }, [initialComponents])

  const handleChange = (schema: FormSchema) => {
    setFormState(schema)
    onChange(schema)
  }

  return (
    <>
      <div className="formio-builder-container">
        <FormBuilder form={formState} options={builderOptions} onChange={handleChange} />
      </div>
    </>
  )
}

export default FormBuilder2
