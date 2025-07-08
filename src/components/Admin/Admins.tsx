// Core Imports
import React, { useState, useEffect, useMemo } from "react"
import SearchBox from "../SearchBox"
import { useTranslation } from "react-i18next"

import { ReactComponent as ProfileIcon } from "../../icons/NewIcons/ProfileIcon.svg"
import { ReactComponent as RefreshIcon } from "../../icons/NewIcons/rotate-reverse.svg"
import { ReactComponent as Download } from "../../icons/NewIcons/progress-download.svg"
import { ReactComponent as DeleteIcon } from "../../icons/NewIcons/trash-xmark.svg"
import { ReactComponent as PasswordEdit } from "../../icons/NewIcons/password-lock.svg"
import { ReactComponent as PasswordEditFilled } from "../../icons/NewIcons/password-lock-filled.svg"
import { ReactComponent as Edit } from "../../icons/NewIcons/text-box-edit.svg"
import { useModularTableStyles } from "../Researcher/Studies/Index"
import { useSnackbar } from "notistack"
import LAMP from "lamp-core"
import "./admin.css"
import { Service } from "../DBService/DBService"
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Typography,
  TextField,
} from "@material-ui/core"
import { ReactComponent as ViewIcon } from "../../icons/NewIcons/overview.svg"
import { ReactComponent as ViewFilledIcon } from "../../icons/NewIcons/overview-filled.svg"
import { ReactComponent as EditIcon } from "../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as EditFilledIcon } from "../../icons/NewIcons/text-box-edit-filled.svg"
import { ReactComponent as SuspendIcon } from "../../icons/NewIcons/stop-circle.svg"
import { ReactComponent as SuspendFilledIcon } from "../../icons/NewIcons/stop-circle-filled.svg"
import { ReactComponent as DeleteFilledIcon } from "../../icons/NewIcons/trash-xmark-Deleted.svg"
import { ReactComponent as CopyIcon } from "../../icons/NewIcons/arrow-circle-down.svg"
import { ReactComponent as CopyFilledIcon } from "../../icons/NewIcons/arrow-circle-down-filled.svg"
import { ReactComponent as Save } from "../../icons/NewIcons/floppy-disks.svg"

import AddUpdateAdmin from "./AddUpdateAdmin"
import { Theme } from "@material-ui/core/styles"
import { key } from "vega"
import ConfirmationDialog from "../ConfirmationDialog"
import AdminHeader from "../Header"
import ActionsComponent from "./ActionsComponent"
import CommonTable, { TableColumn } from "../Researcher/CommonTable"
import { FilterMatchMode } from "primereact/api"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    copyableCell: {
      cursor: "copy",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(117, 153, 255, 0.1)",
        opacity: 0,
        transition: "opacity 0.2s ease",
      },
      "&:active::after": {
        opacity: 1,
      },
    },
  })
)

export default function Admins({ title, authType, adminType, history }) {
  const mtstyles = useModularTableStyles()
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [selectedAdmins, setSelectedAdmins] = useState([])
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])

  useEffect(() => {
    refreshAdmins()
  }, [])

  useEffect(() => {
    refreshAdmins()
  }, [search])

  const refreshAdmins = async () => {
    setIsLoading(true)

    console.log("HHHHHHH tested called")

    if (search.trim().length > 0) {
      const data = admins.filter((admin) =>
        (admin.firstName + " " + admin.lasttName)?.toLowerCase()?.includes(search?.toLowerCase())
      )
      console.log("Filtered Admins", data)
      setFilteredAdmins(data)
    } else {
      const res: any = await LAMP.Type.getAttachment(null, "emersive.profile")

      if (!res.error) {
        const admins_array = Array.isArray(res.data) ? res.data : [res.data]
        setAdmins(admins_array)
        setSelectedAdmins(admins_array)
        setFilteredAdmins(admins_array)
      }
    }
    setIsLoading(false)
  }

  const handleHeaderIconClick = (iconName) => {
    setSelectedIcon(iconName)
    if (iconName === "refresh") {
      refreshAdmins()
    } else if (iconName === "download") {
    }
  }

  const adminActions = (admin) => {
    return (
      <>
        <Edit
          className={mtstyles.actionIcon}
          onClick={() => {
            // setActiveButton({ id: admin.id, action: 'edit' });
            // onEditSensor(sensor);
          }}
        />

        <PasswordEdit className={mtstyles.actionIcon} />
        <DeleteIcon
          className={mtstyles.actionIcon}
          onClick={() => {
            // setActiveButton({ id: sensor.id, action: 'delete' });
            // onDeleteSensor(sensor);
          }}
        />
      </>
    )
  }

  const categorizeAdmins = (admins) => {
    console.log("categorizeItems clicked", admins)
  }

  const searchAdmins = (searchVal?: string) => {
    const selectedadmins = admins.filter((data) => data.some({ searchVal }))
  }

  const updateAdmins = (emailAddress, updatedAdmin) => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) => (admin.emailAddress === emailAddress ? { ...admin, ...updatedAdmin } : admin))
    )
  }

  const TableView_Mod = () => {
    const userId = LAMP.Auth._auth.id
    const [sortConfig, setSortConfig] = useState({ field: "name", direction: "desc" })
    const [selectedRows, setSelectedRows] = useState([])
    const classes = useModularTableStyles()
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null)
    const [confirmationDialog, setConfirmationDialog] = useState(0)
    const [activeButton, setActiveButton] = useState({ id: null, action: null })

    const [editedData, setEditedData] = useState<{ [key: string]: any }>({})
    const [isEditing, setIsEditing] = useState(false)

    const [updatedPassword, setUpdatedPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [passwordError, setPasswordError] = useState("")

    const classesTemp = useStyles()

    const [columns, setColumns] = useState<TableColumn[]>([
      {
        id: "role",
        label: "Admin role",
        value: (s) => s.role,
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        id: "userName",
        label: "Username",
        value: (s) => s.userName || "-",
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        id: "firstName",
        label: "First Name",
        value: (s) => s.firstName,
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        id: "lastName",
        label: "Last Name",
        value: (s) => s.lastName,
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        id: "emailAddress",
        label: "Email ID",
        value: (s) => s.emailAddress,
        visible: true,
        sortable: true,
        filterable: true,
        filterType: "text",
      },
    ])

    const editable_columns = ["firstName", "lastName", "userName"]

    const handleEditClick = (Admin) => {
      if (userId !== "admin") {
        alert("You are not System Admin!")
        return
      }
      if (activeButton.action === "edit") {
        setActiveButton({ id: null, action: null })
        setEditedData({})
        setSelectedAdmin(null)
        setIsEditing(false)
      } else {
        setSelectedAdmin(Admin)
        setDetailsDialogOpen(true)
        setActiveButton({ id: Admin.emailAddress, action: "edit" })
      }
    }

    const handleDeleteClick = (Admin) => {
      if (userId !== "admin") {
        alert("You are not System Admin!")
        return
      }
      setSelectedAdmin(Admin)
      setConfirmationDialog(6)
      setActiveButton({ id: Admin.emailAddress, action: "delete" })
    }

    const handlePasswordClick = (Admin) => {
      if (userId !== "admin") {
        alert("You are not System Admin!")
        return
      }
      if (activeButton.action === "passwordEdit") {
        setActiveButton({ id: null, action: null })
        setSelectedAdmin(null)
      } else {
        setActiveButton({ id: Admin.emailAddress, action: "passwordEdit" })
        setSelectedAdmin(Admin)
        setShowPasswordDialog(true)
      }
    }

    const handleSaveClick = async (Admin) => {
      if (userId !== "admin") {
        alert("You are not System Admin!")
        return
      }
      console.log("HEY ADMIN SAVED CLICKED", Admin, editedData)
      if (Object.entries(editedData).length > 0) {
        let rowEdits = {}
        Object.entries(editedData).forEach(([key, value]) => {
          const [rowIndex, columnKey] = key.split("-")
          if (!rowEdits[rowIndex]) rowEdits[rowIndex] = {}
          rowEdits[rowIndex][columnKey] = value
        })
        let updatedAdmin

        for (const [rowIndex, updates] of Object.entries(rowEdits)) {
          updatedAdmin = { ...Admin, ...(updates as any) }
          if (!updatedAdmin.emailAddress) {
            console.error("Missing admin ID")
            continue
          }
          await LAMP.Type.setAttachment(updatedAdmin.emailAddress, LAMP.Auth._type, "emersive.profile", updatedAdmin)
          updateAdmins(updatedAdmin.emailAddress, updatedAdmin)
        }
      }
      setActiveButton({ id: null, action: null })
      setEditedData({})
      setIsEditing(false)

      // const result = LAMP.Type.setAttachment();
    }

    const handleDelete = async (status) => {
      if (status === "Yes") {
        try {
          console.log("called before delete")
          await LAMP.Credential.delete(selectedAdmin.emailAddress, selectedAdmin.emailAddress)
          console.log("called after delete")

          const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
          const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password
          const params = new URLSearchParams({
            attachment_key: "emersive.profile",
            type: "admin",
            type_id: selectedAdmin.emailAddress,
          }).toString()
          const response: any = await fetch(`${baseURL}/delete-tag?${params}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + authString,
            },
          })
          // if (!response.error) {
          // }
        } catch (error) {
          console.error(error)
        }
        setConfirmationDialog(0)
        setSelectedAdmin(null)
      } else {
        setConfirmationDialog(0)
        setSelectedAdmin(null)
      }
    }

    const originalIndexMap = useMemo(() => {
      return (Array.isArray(admins) ? admins : []).reduce((acc, admin, index) => {
        acc[admin.emailAddress] = index
        return acc
      }, {})
    }, [admins])

    const sortedData = useMemo(() => {
      if (!filteredAdmins) return []

      const sortableData = [...filteredAdmins]
      if (sortConfig.field === "index") {
        sortableData.sort((a, b) => {
          const aIndex = originalIndexMap[a.emailAddress]
          const bIndex = originalIndexMap[b.emailAddress]
          return sortConfig.direction === "asc" ? aIndex - bIndex : bIndex - aIndex
        })
      } else if (sortConfig.field) {
        sortableData.sort((a, b) => {
          const aValue = a[sortConfig.field] || ""
          const bValue = b[sortConfig.field] || ""

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
          }

          return sortConfig.direction === "asc" ? (aValue > bValue ? 1 : -1) : bValue > aValue ? 1 : -1
        })
      }
      return sortableData
    }, [admins, sortConfig, originalIndexMap])

    const initFilters = () => {
      const baseFilters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
      columns.forEach((col) => {
        baseFilters[col.id] = { value: null, matchMode: FilterMatchMode.CONTAINS }
      })
      console.log("Initial filters:", baseFilters)
      return baseFilters
    }
    const [filters, setFilters] = useState(initFilters())

    useEffect(() => {
      setFilters(initFilters())
    }, [columns])

    const actions = (Admin) => {
      return (
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <Box component="span" className={classes.actionIcon}>
            {activeButton.id === Admin.emailAddress && activeButton.action === "passwordEdit" ? (
              <PasswordEditFilled className="active" onClick={() => handlePasswordClick(Admin)} />
            ) : (
              <PasswordEdit onClick={() => handlePasswordClick(Admin)} />
            )}
          </Box>
          <Box component="span" className={classes.actionIcon}>
            {activeButton.id === Admin.emailAddress && activeButton.action === "edit" ? (
              <EditFilledIcon className="active" onClick={() => handleEditClick(Admin)} />
            ) : (
              <EditIcon onClick={() => handleEditClick(Admin)} />
            )}
          </Box>
          <Box component="span" className={isEditing ? classes.actionIcon : classes.disabledIconContainer}>
            <Save onClick={() => handleSaveClick(Admin)} className={isEditing ? null : classes.disabledIcon} />
          </Box>
          <Box component="span" className={classes.actionIcon}>
            {activeButton.id === Admin.emailAddress && activeButton.action === "delete" ? (
              <DeleteFilledIcon className="active" onClick={() => handleDeleteClick(Admin)} />
            ) : (
              <DeleteIcon onClick={() => handleDeleteClick(Admin)} />
            )}
          </Box>
        </Box>
      )
    }

    const formatValue = (value: any, key: string) => {
      console.log(value, key)
      if (!value) return "--"
      // if (key.toLowerCase().includes("timestamp")) {
      //   return dayjs(value).format("HH:mm DD/MM/YYYY")
      // }

      if (typeof value === "string") {
        const words = value.split(" ")
        return words.length > 3 ? (
          <>
            {words.slice(0, 3).join(" ")} <br /> {words.slice(3).join(" ")}
          </>
        ) : (
          value
        )
      }
      return value
    }

    const handleCellEdit = (rowIndex: number, columnKey: string, value: any) => {
      setEditedData((prev) => ({
        ...prev,
        [`${rowIndex}-${columnKey}`]: value,
      }))
    }

    const renderCell = (column: any, row: any) => {
      console.log("Inside the renderCell and value of column and row", column, row)

      const columnKey = column.id
      const value = column.value(row)
      const rowIndex = originalIndexMap[row.emailAddress]

      const isEditable =
        editable_columns.includes(columnKey) && activeButton.action === "edit" && row.emailAddress === activeButton.id

      if (!isEditable) {
        return (
          <div
            className={!activeButton && columnKey != "loggedIn" ? classesTemp.copyableCell : undefined}
            // onClick={(e) => handleCellClick(e, value, rowIndex, row)}
          >
            {formatValue(value, columnKey)}
          </div>
        )
      }

      const editValue = editedData[`${rowIndex}-${columnKey}`] ?? value
      return (
        <input
          type="text"
          value={editValue || ""}
          onChange={(e) => {
            handleCellEdit(rowIndex, columnKey, e.target.value)
            setIsEditing(true)
          }}
          className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      )
    }

    console.log("Admins list", sortedData, admins, columns)

    const handleCloseDialog = () => {
      setShowPasswordDialog(false)
      setPasswordError("")
      setActiveButton({ id: null, action: null })
    }

    const handleSubmitPassword = async () => {
      try {
        if (updatedPassword !== confirmPassword) {
          setPasswordError("Passwords do not match")
          return
        }

        const baseURL = "https://" + (LAMP.Auth._auth.serverAddress || "api.lamp.digital")
        const authString = LAMP.Auth._auth.id + ":" + LAMP.Auth._auth.password

        const response = await fetch(`${baseURL}/update-credential`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + authString,
          },
          body: JSON.stringify({
            type_id: null,
            access_key: selectedAdmin.emailAddress,
            credential: {
              access_key: selectedAdmin.emailAddress,
              secret_key: confirmPassword,
            },
          }),
        })
        setShowPasswordDialog(false)
        setActiveButton({ id: null, action: null })
      } catch (error) {
        console.error("Final error:", error)
        enqueueSnackbar(`Failed to create/update credential: ${error.message || "Unknown error"}`, { variant: "error" })
      }
    }

    return (
      <>
        <CommonTable
          data={sortedData || filteredAdmins || []}
          columns={columns.filter((col) => col.visible).map((col) => ({ ...col, value: col.value, sortable: true }))}
          actions={actions}
          selectable={true}
          selectedRows={selectedRows}
          onSelectRow={(id) => {
            console.log("Selected row ID:", id)
            setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }}
          onSelectAll={() => {
            setSelectedRows((prev) => (prev.length === admins.length ? [] : admins.map((p) => p.emailAddress)))
          }}
          sortConfig={sortConfig}
          onSort={(field) => {
            setSortConfig({
              field,
              direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
            })
          }}
          indexmap={originalIndexMap}
          renderCell={renderCell}
          categorizeItems={null}
          filters={filters}
          onFilter={(newFilters) => setFilters(newFilters)}
          filterDisplay="menu" // row
        />

        <Dialog open={showPasswordDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Reset Researcher Password</DialogTitle>
          <DialogContent>
            {passwordError && (
              <Typography color="error" variant="body2" gutterBottom>
                {passwordError}
              </Typography>
            )}
            <TextField
              autoFocus
              margin="dense"
              id="new-password"
              label="New Password"
              type="password"
              fullWidth
              value={updatedPassword}
              onChange={(e) => setUpdatedPassword(e.target.value)}
            />
            <TextField
              margin="dense"
              id="confirm-password"
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
            <Button onClick={handleSubmitPassword} color="primary" variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {selectedAdmin && (
          <>
            {/* <AdminDetailsDialog
                  Admin={selectedAdmin}
                  open={detailsDialogOpen}
                  onClose={() => {
                    setDetailsDialogOpen(false);
                    setSelectedAdmin(null);
                    setActiveButton({ id: null, action: null});
                  }}
                  onSave={async (updatedAdmin) => {
                    try {
                    //   await handleUpdateAdmin(selectedAdmin.id, updatedAdmin);
                      setDetailsDialogOpen(false);
                      setSelectedAdmin(null);
                      setActiveButton({ id: null, action: null});
                    } catch (error) {
                      console.error("Error updating Admin:", error);
                    }
                  }}
                /> */}

            <ConfirmationDialog
              open={confirmationDialog > 0}
              onClose={() => {
                setConfirmationDialog(0)
                setSelectedAdmin(null)
                setActiveButton({ id: null, action: null })
              }}
              confirmAction={handleDelete}
              confirmationMsg={t("Are you sure you want to delete this Admin?")}
            />
          </>
        )}
      </>
    )
  }

  return (
    <>
      {/* <div className="header-container">
        <div className="action-container">
          <SearchBox searchData={setSearch} />
          <div className="icon-container" onClick={() => handleHeaderIconClick("refresh")}>
            <RefreshIcon className={`refresh-icon ${selectedIcon === "refresh" ? "selected" : ""}`} />
          </div>
          <div className="icon-container" onClick={() => handleHeaderIconClick("download")}>
            <Download className={`download-icon ${selectedIcon === "download" ? "selected" : ""}`} />
          </div>
          <AddUpdateAdmin refreshAdmins={refreshAdmins} admin={null} admins={admins} />
          <div className="profile-container">
            <ProfileIcon className="profile-icon" />
            <div className="profile-text-container">
              <p className="profile-text">Hi! {title}</p>
              <p className="profile-sub-text">{authType}</p>
            </div>
          </div>
        </div>
      </div> */}
      <AdminHeader
        adminType={adminType}
        authType={authType}
        title={LAMP.Auth._auth.id === "admin" ? "System Admin" : LAMP.Auth._type}
        pageLocation="Admins"
      />
      <div className="body-container">
        <ActionsComponent
          searchData={(data) => setSearch(data)}
          refreshElements={refreshAdmins}
          addComponent={<AddUpdateAdmin refreshAdmins={refreshAdmins} admin={null} admins={admins} />}
          actions={["refresh", "search"]}
        />
        <div className="table-container">
          <TableView_Mod />
        </div>
      </div>
    </>
  )
}
