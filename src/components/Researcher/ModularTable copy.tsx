import React, { useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import { classNames } from "primereact/utils"

import "./ModularTable.css"
import "../Admin/admin.css"

export interface TableColumn {
  id: string
  label: string
  value: (row: any) => string | number | React.ReactNode
  visible: boolean
  sortable?: boolean
}

const AVAILABLE_THEMES: {
  name: string
  className: string
  styled?: boolean
}[] = [
  { name: "Default", className: "default-theme", styled: true },
  { name: "Dark", className: "dark-theme", styled: true },
  { name: "Material", className: "material-theme", styled: true },
  { name: "Bootstrap", className: "bootstrap-theme", styled: true },
  { name: "Minimal", className: "minimal-theme", styled: true },
  { name: "Gradient", className: "gradient-theme", styled: true },
  { name: "Unstyled", className: "unstyled-theme", styled: false },
]

const ModularTableV1 = ({
  data,
  columns,
  actions,
  selectable = true,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortConfig,
  onSort,
  indexmap,
  renderCell,
  theme = "default-theme",
  unstyled = false,
  showThemeSelector = true,
  ...props
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const [selectedStudies, setSelectedStudies] = useState([])
  const [currentTheme, setCurrentTheme] = useState(theme)

  const indexBodyTemplate = (rowData: any) => {
    return indexmap[rowData.id || rowData.emailAddress] + 1
  }

  const actionBodyTemplate = (rowData: any) => {
    return actions(rowData)
  }

  const onSelectionChange = (e: any) => {
    setSelectedStudies(e.value)
    const selectedIds = e.value.map((row: any) => row.id)
    onSelectRow?.(selectedIds)
  }

  const handleThemeChange = (e: any) => {
    setCurrentTheme(e.value)
  }

  const getTableClassName = () => {
    const baseClass = "studies-datatable"
    return `${baseClass} ${currentTheme}`
  }

  return (
    <div className="table-container">
      {showThemeSelector && (
        <div className="theme-selector" style={{ marginBottom: "1rem" }}>
          <label htmlFor="theme-dropdown">Select Theme: </label>
          <Dropdown
            id="theme-dropdown"
            value={currentTheme}
            options={AVAILABLE_THEMES.map((theme) => ({
              label: theme.name,
              value: theme.className,
            }))}
            onChange={handleThemeChange}
            placeholder="Select a theme"
            style={{ width: "200px", marginLeft: "10px" }}
          />
        </div>
      )}
      <DataTable
        value={data}
        selection={selectedStudies}
        onSelectionChange={onSelectionChange}
        selectionMode={selectable ? "multiple" : null}
        dataKey="id"
        sortField={sortConfig?.field}
        sortOrder={sortConfig?.direction === "asc" ? 1 : -1}
        onSort={(e) => onSort?.(e.sortField)}
        className={getTableClassName()}
        stripedRows={!unstyled}
        showGridlines={!unstyled}
        rowHover={!unstyled}
        unstyled={unstyled}
        size="small"
        responsiveLayout="scroll"
      >
        {selectable && (
          <Column selectionMode="multiple" className="selection-column" headerClassName="selection-header" />
        )}

        <Column
          field="index"
          header="#"
          body={indexBodyTemplate}
          sortable
          className="index-column"
          headerClassName="index-header"
        />

        {columns
          .filter((column) => column.visible)
          .map((column) => (
            <Column
              key={column.id}
              field={column.id}
              header={column.label}
              body={(rowData) => (renderCell ? renderCell(column, rowData) : column.value(rowData))}
              sortable={column.sortable}
              className="data-column"
              headerClassName="data-header"
            />
          ))}

        <Column
          header="Actions"
          body={actionBodyTemplate}
          className="actions-column"
          headerClassName="actions-header"
        />
      </DataTable>
    </div>
  )
}

export default ModularTableV1
