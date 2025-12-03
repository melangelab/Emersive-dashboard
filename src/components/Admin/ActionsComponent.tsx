import React, { useState, useEffect } from "react"
import dayjs from "dayjs"
import AddUpdateResearcher from "./AddUpdateResearcher"

import { Button, Menu, MenuItem, Checkbox, FormControlLabel, ListItemText, Tooltip } from "@material-ui/core"

import { useTranslation } from "react-i18next"

import { ReactComponent as RefreshIcon } from "../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as TableIcon } from "../../icons/NewIcons/table-list.svg"
import { ReactComponent as TableIconFilled } from "../../icons/NewIcons/table-list-filled.svg"
import { ReactComponent as GridIcon } from "../../icons/NewIcons/objects-column.svg"
import { ReactComponent as GridIconFilled } from "../../icons/NewIcons/objects-column-filled.svg"
import { ReactComponent as FilterColumns } from "../../icons/NewIcons/columns-3.svg"
import { ReactComponent as Filter } from "../../icons/NewIcons/filters.svg"
import { ReactComponent as FilterFilled } from "../../icons/NewIcons/filters-filled.svg"
import { ReactComponent as Download } from "../../icons/NewIcons/progress-download.svg"
import { ReactComponent as Edit } from "../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as Save } from "../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as PasswordEdit } from "../../icons/NewIcons/password-lock.svg"
import { ReactComponent as Cancel } from "../../icons/NewIcons/circle-xmark.svg"
import { ReactComponent as ArrowRight } from "../../icons/NewIcons/arrow-alt-circle-right.svg"
import { ReactComponent as ArrowLeft } from "../../icons/NewIcons/arrow-alt-circle-left.svg"
import StudyFilter from "../Researcher/ParticipantList/StudyFilter"

import "./admin.css"
import SearchBox from "../SearchBox"
import { processSize } from "react-monaco-editor/lib/utils"
import StudyFilterList from "../Researcher/ParticipantList/StudyFilterList"
import DownloadComponent from "../Download"

const ActionsComponent = ({ ...props }) => {
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement | SVGElement>(null)

  const { t } = useTranslation()

  const [showFilterStudies, setShowFilterStudies] = useState(false)

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null)
  }

  const handleColumnMenuOpen = (event) => {
    // const buttonRect = event.currentTarget.getBoundingClientRect()
    setColumnMenuAnchor(event.currentTarget)
  }

  const handleSelectAllColumns = () => {
    props.setSelectedColumns([...props.originalColumnKeys])
  }

  const handleDeselectAllColumns = () => {
    props.setSelectedColumns([
      props.originalColumnKeys[0],
      props.originalColumnKeys[props.originalColumnKeys.length - 1],
    ])
  }

  const handleColumnToggle = (event, columnKey) => {
    event.stopPropagation()
    props.setSelectedColumns((prev) => {
      if (event.target.checked) {
        const newColumns = props.originalColumnKeys.filter((key) => prev.includes(key) || key === columnKey)
        return newColumns
      } else {
        if (prev.length > 1) {
          return prev.filter((key) => key !== columnKey)
        }
        return prev
      }
    })
  }

  const actionsDb = {
    refresh: {
      name: "Refresh",
      icon: RefreshIcon,
      iconName: "refresh-icon",
      handlerName: "refresh",
    },
    grid: {
      name: "Grid View",
      icon: GridIcon,
      iconName: "grid-icon",
      handlerName: "grid",
    },
    table: {
      name: "Table View",
      icon: TableIcon,
      iconName: "view-icon",
      handlerName: "table",
    },
    edit: {
      name: "Edit",
      icon: Edit,
      iconName: "edit-icon",
      handlerName: "edit",
    },
    save: {
      name: "Save",
      icon: Save,
      iconName: "save-icon",
      handlerName: "save",
    },
    passwordEdit: {
      name: "Password Edit",
      icon: PasswordEdit,
      iconName: "password-edit-icon",
      handlerName: "passwordEdit",
    },
    left: {
      name: "Previous",
      icon: ArrowLeft,
      iconName: "left-icon",
      handlerName: "left",
    },
    right: {
      name: "Next",
      icon: ArrowRight,
      iconName: "right-icon",
      handlerName: "right",
    },
    cancel: {
      name: "Cancel",
      icon: Cancel,
      iconName: "cancel-icon",
      handlerName: "cancel",
    },
  }

  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName)
    if (iconName === "grid" && props.tabularView) {
      props.setTabularView(false)
    } else if (iconName === "table" && !props.tabularView) {
      props.setTabularView(true)
    } else if (iconName === "refresh") {
      props.refreshElements()
    } else if (iconName === "edit") {
      props?.onEdit()
    } else if (iconName === "save") {
      props?.onSave()
    } else if (iconName === "passwordEdit") {
      props?.onPasswordEdit()
    } else if (iconName === "left") {
      props?.onPrevious()
    } else if (iconName === "right") {
      props?.onNext()
    } else if (iconName === "cancel") {
      props?.onClose()
    }
  }

  const renderActionIcon = (action) => {
    const actionData = actionsDb[action]
    if (!actionData || !actionData.icon) return null

    const IconComponent = actionData.icon
    // For grid/table actions, derive selected state from props.tabularView
    let isSelected = selectedIcon === actionData.handlerName
    if (action === "grid") {
      isSelected = !props.tabularView
    } else if (action === "table") {
      isSelected = Boolean(props.tabularView)
    }

    const handleClick = (e) => {
      if (action === "filter-cols") {
        handleColumnMenuOpen(e) // Pass the actual event
      } else {
        handleIconClick(actionData.handlerName)
      }
    }

    return (
      <Tooltip title={actionData.name}>
        <div
          key={action}
          className={`icon-container ${isSelected ? "selected" : ""}`}
          onClick={handleClick}
          // title={actionData.name}
        >
          <IconComponent className={actionData.iconName} />
        </div>
      </Tooltip>
    )
  }

  const handleShowFilterStudies = (status) => {
    setShowFilterStudies(status)
  }

  return (
    <div className="action-container">
      {props.actions?.includes("search") && (
        <Tooltip title={t("Search")}>
          <div>
            <SearchBox searchData={props.searchData} />
          </div>
        </Tooltip>
      )}

      {props.actions?.includes("filter") && (
        <>
          <StudyFilter setShowFilterStudies={handleShowFilterStudies} setOrder={props.setOrder} order={props.order} />
          <StudyFilterList
            studies={props.studies}
            researcherId={props.researcherId}
            type={props.tabType}
            showFilterStudies={showFilterStudies}
            selectedStudies={props.selectedStudies}
            setSelectedStudies={props.setSelectedStudies}
          />
        </>
      )}

      {props.actions?.map(renderActionIcon)}

      {props.actions?.includes("table") && props.tabularView ? (
        <>
          <Tooltip title={t("Filter Columns")}>
            <div className="icon-container" onClick={handleColumnMenuOpen}>
              <FilterColumns className={`filter-cols-icon ${selectedIcon === "filter-cols" ? "selected" : ""}`} />
            </div>
          </Tooltip>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={() => setColumnMenuAnchor(null)}
            keepMounted
            elevation={3}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            getContentAnchorEl={null}
            PaperProps={{
              style: {
                maxHeight: "300px",
                width: "250px",
                marginTop: "8px",
              },
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                borderBottom: "1px solid rgb(229, 231, 235)",
                padding: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                zIndex: 50,
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  props.setVisibleColumns?.(props.VisibleColumns?.map((col) => ({ ...col, visible: true })))
                }}
                color="primary"
                style={{ textTransform: "none", fontSize: "0.875rem" }}
              >
                {t("Select All")}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  props.setVisibleColumns?.(
                    props.VisibleColumns?.map((col, index) => ({
                      ...col,
                      visible: index === 0,
                    }))
                  )
                }}
                color="primary"
                style={{ textTransform: "none", fontSize: "0.875rem" }}
              >
                {t("Deselect All")}
              </Button>
            </div>
            <div style={{ padding: "0.5rem", overflowY: "auto" }}>
              {props.VisibleColumns?.map((column) => (
                <MenuItem key={column.id}>
                  <Checkbox
                    checked={column.visible}
                    onChange={() => {
                      props.setVisibleColumns?.(
                        props.VisibleColumns?.map((col) =>
                          col.id === column.id ? { ...col, visible: !col.visible } : col
                        )
                      )
                    }}
                  />
                  <ListItemText primary={column.label} />
                </MenuItem>
              ))}
            </div>
          </Menu>
          {/* {props.actions?.includes("filter") && (
              <div className="icon-container" onClick={() => handleIconClick("filter")}>
                <Filter className={`filter ${selectedIcon === "filter" ? "selected" : ""}`} />
              </div>
            )} */}
          {props.actions?.includes("download") && (
            <Tooltip title={t("Download Data")}>
              <div className="icon-container" onClick={() => handleIconClick("download")}>
                {/* <Download className={`download-icon ${selectedIcon === "download" ? "selected" : ""}`} /> */}
                <DownloadComponent
                  studies={props?.studies}
                  researchers={props?.researchers}
                  target={props.downloadTarget}
                />
              </div>
            </Tooltip>
          )}
        </>
      ) : null}
      {props.addComponent && (
        <Tooltip title={props.addLabel ? props.addLabel : t("Add")}>
          <div>{props.addComponent}</div>
        </Tooltip>
      )}
    </div>
  )
}

export default ActionsComponent
