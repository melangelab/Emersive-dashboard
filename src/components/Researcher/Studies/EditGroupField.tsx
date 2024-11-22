import React, { useState, useEffect, useRef } from "react"
import { Icon, IconButton, TextField, Tooltip, InputAdornment } from "@material-ui/core"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import LAMP from "lamp-core"
import { Service } from "../../DBService/DBService"

export default function EditGroupField({
  groupName,
  study,
  updateGroupName,
  onEditComplete,
  allGroups,
  ...props
}: {
  groupName?: string
  study?: any
  updateGroupName?: any
  onEditComplete?: any
  allGroups?: string[]
}) {
  const inputRef = useRef<any>()
  const [editing, setEditing] = useState(false)
  const [editComplete, setEditComplete] = useState(false)
  const [aliasGroupName, setAliasGroupName] = useState<string>()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  useEffect(() => {
    setAliasGroupName(groupName || "")
  }, [groupName])

  const validate = (name: string) => {
    if (allGroups?.includes(name.trim())) {
      enqueueSnackbar(t("Group name already exists."), { variant: "error" })
      return false
    }
    if (name.trim().length === 0) {
      enqueueSnackbar(t("Group name cannot be empty."), { variant: "error" })
      return false
    }
    return true
  }

  const saveGroupName = () => {
    if (!validate(aliasGroupName || "")) return

    // Update the group name in the study object
    const updatedGroups = study.gname.map((g: string) => (g === groupName ? aliasGroupName : g))

    study.gname = updatedGroups
    LAMP.Study.update(study.id, study)
      .then((res) => {
        Service.addData("studies", [study])
        enqueueSnackbar(t("Group name updated successfully."), { variant: "success" })
        updateGroupName(aliasGroupName)
        onEditComplete()
      })
      .catch((err) =>
        enqueueSnackbar(t("Failed to update group name: ") + err.message, {
          variant: "error",
        })
      )
  }

  return (
    <TextField
      inputRef={inputRef}
      variant="outlined"
      margin="dense"
      label={groupName || ""}
      //   label={t("Edit Group Name")}
      value={aliasGroupName || ""}
      onChange={(e) => setAliasGroupName(e.target.value)}
      onBlur={saveGroupName}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title={t("Save Group Name")}>
              <IconButton onClick={saveGroupName} onMouseDown={(e) => e.preventDefault()}>
                <Icon>check</Icon>
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  )
}
