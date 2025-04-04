import React, { useEffect, useState } from "react"

import { Button, TextField, DialogContent, DialogActions, DialogTitle, Dialog, Typography } from "@material-ui/core"

import SearchBox from "./SearchBox"
import { ReactComponent as Edit } from "../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as Save } from "../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as ProfileIcon } from "../icons/NewIcons/ProfileIcon.svg"
import { ReactComponent as PasswordEdit } from "../icons/NewIcons/password-lock.svg"
import { ReactComponent as Cancel } from "../icons/NewIcons/circle-xmark.svg"
import { ReactComponent as ArrowRight } from "../icons/NewIcons/arrow-alt-circle-right.svg"
import { ReactComponent as ArrowLeft } from "../icons/NewIcons/arrow-alt-circle-left.svg"
import LAMP from "lamp-core"
import "./Admin/admin.css"
import { useSnackbar } from "notistack"

export default function ViewResearcherHeader(props) {
  const [activeButton, setActiveButton] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleIconClick = (iconType) => {
    console.log("ACTION SET on ELEMENT, ", iconType)
    if (iconType === "cancel") {
      if (props.isEditing) props.setIsEditing(false)
      props.changeElement({ researcher: null, idx: null })
    } else if (iconType === "right") {
      props.changeElement((prev) => ({ ...prev, idx: (prev.idx + 1) % props.length }))
    } else if (iconType === "left") {
      props.changeElement((prev) => ({
        ...prev,
        idx: (prev.idx - 1 + props.length) % props.length,
      }))
    } else if (iconType === "edit") {
      // props.setIsEditing(true);
      if (activeButton === iconType) {
        setActiveButton(null)
        props.setIsEditing(false)
        props.setActionOnViewElement("")
        return
      } else {
        setActiveButton("edit")
      }
    }
    console.log("ACTION SET on ELEMENT, ", iconType)
    props.setActionOnViewElement(iconType)
  }

  useEffect(() => {
    if (!props.isEditing) setActiveButton(null)
  }, [props.isEditing])

  return (
    <div className="header-container">
      <p>
        {props.elementType}
        {" > "}
        {props.element.researcher?.firstName} {props.element.researcher?.lastName}
      </p>
      <div className="table-actions-container">
        <div
          className={`table-actions-icon-container ${activeButton === "edit" ? "active" : ""}`}
          onClick={() => handleIconClick("edit")}
        >
          <Edit className="table-actions-icon" />
        </div>
        <div
          className={`table-actions-icon-container ${props.isEditing ? "" : "disabled"}`}
          onClick={() => handleIconClick("save")}
        >
          <Save className={`table-actions-icon ${props.isEditing ? "" : "disabled-icon"}`} />
        </div>
        <div className="table-actions-icon-container" onClick={() => handleIconClick("passwordEdit")}>
          <PasswordEdit className="table-actions-icon" />
        </div>
        <div className="table-actions-icon-container" onClick={() => handleIconClick("left")}>
          <ArrowLeft className="table-actions-icon" />
        </div>
        <div className="table-actions-icon-container" onClick={() => handleIconClick("right")}>
          <ArrowRight className="table-actions-icon" />
        </div>
        <div className="table-actions-icon-container" onClick={() => handleIconClick("cancel")}>
          <Cancel className="table-actions-icon" />
        </div>
        <div className="profile-container">
          <ProfileIcon className="profile-icon" />
          <div className="profile-text-container">
            <p className="profile-text">Hi! {props.title}</p>
            <p className="profile-text">{props.authType}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
