import React, { useEffect, useMemo, useRef, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import { classNames } from "primereact/utils"
import { FilterMatchMode } from "primereact/api"
import "./CommonTable.css"
import "../Admin/admin.css"
import { Button } from "primereact/button"

export interface TableColumn {
  id: string
  label: string
  value: (row: any) => string | number | React.ReactNode
  visible: boolean
  sortable?: boolean
  renderCell?: (row: any) => React.ReactNode
  filterable?: boolean
  filterType?: "text" | "dropdown" | "numeric" | "date" | "boolean"
  filterOptions?: { label: string; value: any }[]
  filterField?: string
  filterPlaceholder?: string
  filterElement?: (options: any) => React.ReactNode
  filterMatchMode?: string
}

const AVAILABLE_THEMES: {
  name: string
  className: string
  styled?: boolean
  filters?: Record<string, any>
  onFilter?: (filters: Record<string, any>) => void
  filterDisplay?: "menu" | "row"
}[] = [
  { name: "Default", className: "default-theme", styled: true },
  { name: "Dark", className: "dark-theme", styled: true },
  { name: "Material", className: "material-theme", styled: true },
  { name: "Bootstrap", className: "bootstrap-theme", styled: true },
  { name: "Minimal", className: "minimal-theme", styled: true },
  { name: "Gradient", className: "gradient-theme", styled: true },
  { name: "Unstyled", className: "unstyled-theme", styled: false },
]

const CommonTable = ({
  data,
  columns,
  actions,
  selectable = true,
  selectedRows = [],
  onSelectRow = (selectedIds?: any) => {},
  onSelectAll = () => {},
  sortConfig = { field: null, direction: null },
  onSort = (sortField?: string) => {},
  indexmap = {},
  renderCell = null,
  theme = "default-theme",
  unstyled = false,
  showThemeSelector = true,
  categorizeItems,
  showCategoryHeaders = true,
  filters = {},
  onFilter = (filters) => {},
  filterDisplay = "menu" as "menu" | "row",
  filterMatchModeOptions = null,
  itemclass = "items",
  key = null,
  ...props
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [selectedStudies, setSelectedStudies] = useState([])
  const [currentTheme, setCurrentTheme] = useState(theme)
  const [headerHeight, setHeaderHeight] = useState(50)
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  // const prevColumnsRef = useRef<TableColumn[] | null>(null);

  // useEffect(() => {
  //   console.log("CommonTable received columns:", columns);
  //   if (prevColumnsRef.current) {
  //     // Check if columns array reference has changed
  //     console.log(
  //       "Columns array reference changed:",
  //       prevColumnsRef.current !== columns
  //     );
  //     // Check if column objects have new references
  //     const columnIds = columns.map((col) => col.id);
  //     const prevColumnIds = prevColumnsRef.current.map((col) => col.id);
  //     console.log(
  //       "Column IDs match:",
  //       JSON.stringify(columnIds) === JSON.stringify(prevColumnIds)
  //     );
  //     // Check each column object for reference changes
  //     columns.forEach((col, index) => {
  //       const prevCol = prevColumnsRef.current?.[index];
  //       if (prevCol && prevCol.id === col.id) {
  //         console.log(
  //           `Column ${col.id} reference changed:`,
  //           prevCol !== col
  //         );
  //         console.log(
  //           `Column ${col.id} renderCell reference changed:`,
  //           prevCol.renderCell !== col.renderCell
  //         );
  //       }
  //     });
  //   }
  //   // Update previous columns
  //   prevColumnsRef.current = columns;
  // }, [columns]);

  const indexBodyTemplate = (rowData: any) => {
    const index = indexmap[rowData.id] !== undefined ? indexmap[rowData.id] + 1 : 0
    return index
  }

  const actionBodyTemplate = (rowData: any) => {
    return actions(rowData)
  }

  const onGlobalFilterChange = (e: any) => {
    setGlobalFilterValue(e.target.value)
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

  const getDefaultFilterElement = (column: TableColumn, options: any) => {
    switch (column.filterType) {
      case "dropdown":
        return (
          <Dropdown
            value={options.value || null}
            options={column.filterOptions || []}
            onChange={(e) => {
              options.filterCallback(e.value)
              if (filterDisplay === "row") {
                options.filterApplyCallback(e.value)
              }
            }}
            placeholder={column.filterPlaceholder || `Select ${column.label}`}
            className="p-column-filter"
            showClear
            style={{ minWidth: "12rem" }}
          />
        )
      case "numeric":
        return (
          <InputText
            type="number"
            value={options.value || ""}
            onChange={(e) => {
              options.filterCallback(e.target.value)
              if (filterDisplay === "row") {
                options.filterApplyCallback(e.target.value)
              }
            }}
            placeholder={column.filterPlaceholder || `Filter by ${column.label}`}
            className="p-column-filter"
          />
        )
      case "date":
        return (
          <InputText
            type="date"
            value={options.value || ""}
            onChange={(e) => {
              options.filterCallback(e.target.value)
              if (filterDisplay === "row") {
                options.filterApplyCallback(e.target.value)
              }
            }}
            placeholder={column.filterPlaceholder || `Filter by ${column.label}`}
            className="p-column-filter"
          />
        )
      case "boolean":
        return (
          <Dropdown
            value={options.value || ""}
            options={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
            onChange={(e) => {
              options.filterCallback(e.value)
              if (filterDisplay === "row") {
                options.filterApplyCallback(e.value)
              }
            }}
            placeholder={column.filterPlaceholder || `Filter by ${column.label}`}
            className="p-column-filter"
            showClear
          />
        )
      case "text":
      default:
        return (
          <InputText
            value={options.value || ""}
            onChange={(e) => {
              options.filterCallback(e.target.value)
              if (filterDisplay === "row") {
                options.filterApplyCallback(e.target.value)
              }
              // options.filterApplyCallback?.(e.target.value);
            }}
            placeholder={column.filterPlaceholder || `Filter by ${column.label}`}
            className="p-column-filter"
          />
        )
    }
  }

  const processedData = useMemo(() => {
    if (!categorizeItems) return data
    const categorized = categorizeItems(data)
    if (!showCategoryHeaders) {
      return Object.values(categorized).flat()
    }

    // Add category property to each item for grouping
    const dataWithCategories = []
    Object.entries(categorized).forEach(([category_row, items]) => {
      ;(items as any[]).forEach((item) => {
        dataWithCategories.push({
          ...item,
          category_row: category_row,
        })
      })
    })

    return dataWithCategories
  }, [data, categorizeItems, showCategoryHeaders])

  const categoryHeaderTemplate = (data) => {
    return (
      <div
      // className="category-header"
      >
        {data.category_row}
      </div>
    )
  }

  const paginatorLeft = (options) => (
    <span>
      Total {options.totalRecords} {itemclass}
    </span>
  )
  const pgtemplate = {
    layout:
      "CurrentPageDropdown RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink",
    RowsPerPageDropdown: (options) => {
      const dropdownOptions = [
        { label: 5, value: 5 },
        { label: 10, value: 10 },
        { label: 20, value: 20 },
        { label: 50, value: 50 },
        { label: 100, value: 100 },
      ]

      return (
        <React.Fragment>
          <span className="mx-1" style={{ color: "var(--text-color)", userSelect: "none" }}>
            Items per page:{" "}
          </span>
          <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
        </React.Fragment>
      )
    },
    CurrentPageReport: (options) => {
      return (
        <span style={{ color: "var(--text-color)", userSelect: "none", width: "120px", textAlign: "center" }}>
          {options.first} - {options.last} of {options.totalRecords}
        </span>
      )
    },
  }

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerElement = document.querySelector(".studies-datatable .p-datatable-thead")
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height
        setHeaderHeight(height)
        document.documentElement.style.setProperty("--header-height", `${height}px`)
      }
    }

    setTimeout(calculateHeaderHeight, 100) // Small delay to ensure DOM is ready
  }, [currentTheme])
  return (
    <div className="table-container">
      {/* {showThemeSelector && (
        <div className="theme-selector" style={{ marginBottom: '1rem' }}>
          <label htmlFor="theme-dropdown">Select Theme: </label>
          <Dropdown
            id="theme-dropdown"
            value={currentTheme}
            options={AVAILABLE_THEMES.map(theme => ({ 
              label: theme.name, 
              value: theme.className 
            }))}
            onChange={handleThemeChange}
            placeholder="Select a theme"
            style={{ width: '200px', marginLeft: '10px' }}
          />
        </div>
      )} */}
      <DataTable
        key={key}
        value={processedData}
        selection={selectedStudies}
        onSelectionChange={onSelectionChange}
        filters={filters}
        onFilter={(e) => {
          onFilter(e.filters)
        }}
        globalFilterFields={columns.filter((col) => col.filterable).map((col) => col.id)}
        filterDisplay={filterDisplay}
        globalFilter={globalFilterValue}
        emptyMessage="No records found"
        loading={false}
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
        rowGroupMode={categorizeItems ? "subheader" : undefined}
        groupRowsBy={categorizeItems ? "category_row" : undefined}
        rowGroupHeaderTemplate={showCategoryHeaders && categorizeItems ? categoryHeaderTemplate : undefined}
        // sortMode={showCategoryHeaders && categorizeItems ? "single" : "multiple"}
        scrollable={true} // ={ categorizeItems}
        scrollHeight="90%"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        paginatorTemplate={pgtemplate}
        // paginatorTemplate="CurrentPageDropdown RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        // currentPageReportTemplate="{first} - {last} of {totalRecords}"
        paginatorLeft={paginatorLeft}
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
              filter={column.filterable}
              filterField={column.filterField || column.id}
              filterPlaceholder={column.filterPlaceholder}
              filterElement={
                column.filterElement
                  ? (options) => column.filterElement!(options)
                  : column.filterable
                  ? (options) => getDefaultFilterElement(column, options)
                  : undefined
              }
              filterMatchMode={
                column.filterMatchMode ||
                (column.filterType === "text"
                  ? FilterMatchMode.CONTAINS
                  : column.filterType === "dropdown"
                  ? FilterMatchMode.EQUALS
                  : FilterMatchMode.CONTAINS)
              }
              filterMatchModeOptions={column.filterMatchModeOptions || filterMatchModeOptions}
              showFilterMenu={column.filterable && filterDisplay === "menu"}
              showFilterMatchModes={column.filterable && filterDisplay === "menu"}
              showFilterOperator={column.filterable && filterDisplay === "menu"}
              showClearButton={column.filterable}
              showApplyButton={column.filterable && filterDisplay === "menu"}
              body={(rowData) => {
                if (column.renderCell) {
                  return column.renderCell(rowData)
                }
                if (renderCell) {
                  return renderCell(column, rowData)
                }
                return column.value ? column.value(rowData) : null
              }}
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
          excludeGlobalFilter
        />
      </DataTable>
    </div>
  )
}

export default CommonTable
