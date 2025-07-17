import React, { useState, useMemo, useEffect } from "react"
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from "@material-ui/core"
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward"
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward"
import SearchIcon from "@material-ui/icons/Search"
import CancelRoundedIcon from "@material-ui/icons/CancelRounded"
import "./EmersiveTable.css"

// Enhanced column configuration
export interface ColumnConfig {
  id: string
  label: string
  value: (item: any) => any
  visible: boolean
  sortable?: boolean
  filterable?: boolean
  filterType?: "text" | "dropdown" | "numeric" | "date" | "boolean"
  filterOptions?: { label: string; value: any }[]
  filterField?: string
  filterPlaceholder?: string
  filterMatchMode?: string
  renderCell?: (item: any) => React.ReactNode
  width?: string | number
}

// Enhanced interface for the EmersiveTable component
export interface EmersiveTableProps {
  data: any[]
  columns: ColumnConfig[]
  selectedItems?: any[]
  onSelectionChange?: (item: any, checked: boolean) => void
  onSelectAll?: (selected: boolean) => void
  selectedRows?: string[]
  onSelectRow?: (selectedIds: string[]) => void
  actions: (item: any) => React.ReactNode
  getItemKey: (item: any) => string
  categorizeItems?: (items: any[]) => Record<string, any[]>
  showCategoryHeaders?: boolean
  emptyStateMessage?: string
  customClasses?: any
  selectable?: boolean
  // New props for filtering and pagination
  filters?: Record<string, any>
  onFilter?: (filters: Record<string, any>) => void
  filterDisplay?: "menu" | "row"
  sortConfig?: { field: string | null; direction: "asc" | "desc" | null }
  onSort?: (field: string) => void
  indexmap?: Record<string, number>
  // Pagination props
  paginator?: boolean
  rows?: number
  rowsPerPageOptions?: number[]
  // Global filter
  globalFilter?: string
  onGlobalFilter?: (value: string) => void
  // Theme and styling
  theme?: string
  stripedRows?: boolean
  showGridlines?: boolean
  rowHover?: boolean
  // Items display name
  itemclass?: string
  // Key for re-rendering
  tableKey?: string
  // Data key property
  dataKeyprop?: string
}

const EmersiveTable: React.FC<EmersiveTableProps> = ({
  data,
  columns,
  selectedItems = [],
  onSelectionChange,
  onSelectAll,
  selectedRows = [],
  onSelectRow,
  actions,
  getItemKey,
  categorizeItems,
  showCategoryHeaders = true,
  emptyStateMessage = "No records found",
  customClasses,
  selectable = true,
  filters = {},
  onFilter,
  filterDisplay = "row",
  sortConfig = { field: null, direction: null },
  onSort,
  indexmap = {},
  paginator = true,
  rows = 5,
  rowsPerPageOptions = [5, 10, 20, 50, 100],
  globalFilter = "",
  onGlobalFilter,
  theme = "default-theme",
  stripedRows = true,
  showGridlines = true,
  rowHover = true,
  itemclass = "items",
  tableKey = "table",
  dataKeyprop = "id",
}) => {
  // const classes = useStyles()
  // const modClasses = useModularTableStyles()

  // Local state for pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rows)

  // Local state for global filter if not controlled
  const [localGlobalFilter, setLocalGlobalFilter] = useState(globalFilter)

  // Local state for filters if not controlled
  const [localFilters, setLocalFilters] = useState(filters)

  // Handle sort click
  const handleSort = (columnId: string) => {
    if (onSort) {
      onSort(columnId)
    }
  }

  // Apply filters to data
  const filteredItems = useMemo(() => {
    let filtered = [...data]

    // Apply global filter
    const globalFilterValue = onGlobalFilter ? globalFilter : localGlobalFilter
    if (globalFilterValue?.trim()) {
      filtered = filtered.filter((item) => {
        return columns.some((column) => {
          if (!column.filterable) return false
          const value = column.value(item)
          return value?.toString().toLowerCase().includes(globalFilterValue.toLowerCase())
        })
      })
    }

    // Apply column filters
    const activeFilters = onFilter ? filters : localFilters
    Object.entries(activeFilters).forEach(([columnId, filterValue]) => {
      if (filterValue?.value && filterValue.value !== "") {
        const column = columns.find((col) => col.id === columnId)
        if (column) {
          filtered = filtered.filter((item) => {
            const itemValue = column.value(item)
            const filterVal = filterValue.value

            switch (column.filterType) {
              case "dropdown":
                return itemValue === filterVal
              case "numeric":
                return itemValue?.toString().includes(filterVal.toString())
              case "boolean":
                return itemValue === filterVal
              case "text":
              default:
                return itemValue?.toString().toLowerCase().includes(filterVal.toLowerCase())
            }
          })
        }
      }
    })

    return filtered
  }, [data, localGlobalFilter, globalFilter, localFilters, filters, columns, onGlobalFilter, onFilter])

  // Sort filtered items
  const sortedItems = useMemo(() => {
    if (!sortConfig.field) return filteredItems

    // Special handling for index column sorting
    if (sortConfig.field === "index") {
      const sorted = [...filteredItems]
      return sortConfig.direction === "desc" ? sorted.reverse() : sorted
    }

    // For other columns, sort by the column values
    return [...filteredItems].sort((a, b) => {
      const column = columns.find((col) => col.id === sortConfig.field)
      if (!column) return 0

      const aValue = column.value(a)
      const bValue = column.value(b)

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [filteredItems, sortConfig, columns])

  // Categorize items
  const categorizedItems = useMemo(() => {
    if (categorizeItems) {
      return categorizeItems(sortedItems)
    }
    return { Items: sortedItems }
  }, [sortedItems, categorizeItems])

  // Apply pagination to categorized items
  const paginatedItems = useMemo(() => {
    if (!paginator) {
      // If no pagination, return flattened items with category headers
      const flattened = []
      Object.entries(categorizedItems).forEach(([category, items]) => {
        if (showCategoryHeaders && Object.keys(categorizedItems).length > 1) {
          flattened.push({ isCategory: true, category, items: items.length })
        }
        flattened.push(...items)
      })
      return flattened
    }

    // With pagination, we need to handle categories differently
    const result = []
    let currentIndex = 0
    const start = page * rowsPerPage
    const end = start + rowsPerPage

    Object.entries(categorizedItems).forEach(([category, items]) => {
      // Check if any items from this category should be included in current page
      const categoryStart = currentIndex
      const categoryEnd = currentIndex + items.length

      // If category has items that fall within the current page range
      if (categoryEnd > start && categoryStart < end) {
        // Add category header if needed and we have multiple categories
        if (showCategoryHeaders && Object.keys(categorizedItems).length > 1) {
          result.push({ isCategory: true, category, items: items.length })
        }

        // Calculate which items from this category to include
        const itemStart = Math.max(0, start - categoryStart)
        const itemEnd = Math.min(items.length, end - categoryStart)

        // Add the relevant items from this category
        result.push(...items.slice(itemStart, itemEnd))
      }

      currentIndex += items.length
    })

    return result
  }, [categorizedItems, showCategoryHeaders, page, rowsPerPage, paginator])

  // Calculate item indices
  const itemIndices = useMemo(() => {
    const originalIndexMap = new Map()
    data.forEach((item, idx) => {
      originalIndexMap.set(getItemKey(item), indexmap[getItemKey(item)] ?? idx + 1)
    })
    return originalIndexMap
  }, [data, indexmap, getItemKey])

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle global filter change
  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (onGlobalFilter) {
      onGlobalFilter(value)
    } else {
      setLocalGlobalFilter(value)
    }
    setPage(0) // Reset to first page when filtering
  }

  // Calculate total items count (excluding category headers)
  const totalItemsCount = useMemo(() => {
    return Object.values(categorizedItems).reduce((sum, items) => sum + items.length, 0)
  }, [categorizedItems])

  // Handle column filter change
  const handleFilterChange = (columnId: string, value: any) => {
    const newFilters = {
      ...(onFilter ? filters : localFilters),
      [columnId]: { value, matchMode: "contains" },
    }

    if (onFilter) {
      onFilter(newFilters)
    } else {
      setLocalFilters(newFilters)
    }
    setPage(0) // Reset to first page when filtering
  }

  // Handle select all
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(event.target.checked)
    } else if (onSelectRow) {
      if (event.target.checked) {
        const allIds = data.map((item) => getItemKey(item))
        onSelectRow(allIds)
      } else {
        onSelectRow([])
      }
    } else if (onSelectionChange) {
      sortedItems.forEach((item) => onSelectionChange(item, event.target.checked))
    }
  }

  // Check if item is selected
  const isItemSelected = (item: any) => {
    if (selectedRows.length > 0) {
      return selectedRows.includes(getItemKey(item))
    }
    return selectedItems.some((selected) => getItemKey(selected) === getItemKey(item))
  }

  // Calculate selection state
  const isAllSelected =
    totalItemsCount > 0 && (selectedRows.length === totalItemsCount || selectedItems.length === totalItemsCount)
  const isSomeSelected =
    (selectedRows.length > 0 || selectedItems.length > 0) &&
    (selectedRows.length < totalItemsCount || selectedItems.length < totalItemsCount)

  // Render filter input for column
  const renderFilterInput = (column: ColumnConfig) => {
    const filterValue = (onFilter ? filters : localFilters)[column.id]?.value || ""

    switch (column.filterType) {
      case "dropdown":
        return (
          <FormControl size="small" className="emersive-table-filter-select">
            <Select value={filterValue} onChange={(e) => handleFilterChange(column.id, e.target.value)} displayEmpty>
              <MenuItem value="">All</MenuItem>
              {column.filterOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case "numeric":
        return (
          <TextField
            size="small"
            type="number"
            value={filterValue}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
            placeholder={column.filterPlaceholder || `Filter ${column.label}`}
            className="emersive-table-filter-input"
            variant="outlined"
          />
        )
      case "text":
      default:
        return (
          <TextField
            size="small"
            value={filterValue}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
            placeholder={column.filterPlaceholder || `Filter ${column.label}`}
            className="emersive-table-filter-input"
            variant="outlined"
            InputProps={{
              endAdornment: filterValue ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleFilterChange(column.id, "")}>
                    <CancelRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        )
    }
  }

  useEffect(() => {
    const headerRow = document.querySelector(".emersive-table thead tr:first-of-type")
    if (headerRow) {
      const height = headerRow.getBoundingClientRect().height
      document.documentElement.style.setProperty("--emersive-header-height", `${height}px`)
    }
  }, [])

  return (
    <div className="content-container">
      {/* Global Filter */}
      {/* <TextField
        className="emersive-table-global-filter"
        placeholder="Search..."
        value={onGlobalFilter ? globalFilter : localGlobalFilter}
        onChange={handleGlobalFilterChange}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      /> */}

      <TableContainer
        component={Paper}
        className={customClasses?.tableContainer || "emersive-table-container"}
        // style={{ height: paginator ? "calc(100% - 120px)" : "100%" }}
      >
        <Table stickyHeader className="emersive-table">
          <TableHead>
            {/* Main Header Row */}
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" className="emersive-table-checkbox-column">
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={handleSelectAllClick}
                    className="emersive-table-checkbox"
                  />
                </TableCell>
              )}

              {/* Index Column */}
              <TableCell className="emersive-table-header-cell emersive-table-index-cell">
                <Box className="emersive-table-column-header">
                  <span>#</span>
                  <IconButton
                    size="small"
                    className={`emersive-table-sort-button ${sortConfig.field === "index" ? "active" : ""}`}
                    onClick={() => handleSort("index")}
                  >
                    {sortConfig.field === "index" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUpwardIcon style={{ width: 15, height: 15 }} />
                      ) : (
                        <ArrowDownwardIcon style={{ width: 15, height: 15 }} />
                      )
                    ) : (
                      <ArrowUpwardIcon style={{ width: 15, height: 15, opacity: 0.3 }} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>

              {columns
                .filter((col) => col.visible)
                .map((column) => (
                  <TableCell
                    key={column.id}
                    className={`emersive-table-header-cell ${column.sortable ? "sortable" : ""}`}
                    style={{ width: column.width }}
                  >
                    <Box className="emersive-table-column-header">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <IconButton
                          size="small"
                          className={`emersive-table-sort-button ${sortConfig.field === column.id ? "active" : ""}`}
                          onClick={() => handleSort(column.id)}
                        >
                          {sortConfig.field === column.id ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUpwardIcon style={{ width: 15, height: 15 }} />
                            ) : (
                              <ArrowDownwardIcon style={{ width: 15, height: 15 }} />
                            )
                          ) : (
                            <ArrowUpwardIcon style={{ width: 15, height: 15, opacity: 0.3 }} />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                ))}

              <TableCell className="emersive-table-header-cell sticky-right">Actions</TableCell>
            </TableRow>

            {/* Filter Row */}
            {filterDisplay === "row" && (
              <TableRow className="emersive-table-filter-row">
                {selectable && <TableCell padding="checkbox" className="emersive-table-checkbox-column"></TableCell>}
                <TableCell></TableCell> {/* Index column */}
                {columns
                  .filter((col) => col.visible)
                  .map((column) => (
                    <TableCell key={`filter-${column.id}`}>
                      {column.filterable ? renderFilterInput(column) : null}
                    </TableCell>
                  ))}
                <TableCell className="emersive-table-header-cell sticky-right"></TableCell> {/* Actions column */}
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {paginatedItems.map((item, index) => {
              // Handle category headers
              if (item.isCategory) {
                return (
                  <TableRow key={`category-${item.category}`}>
                    <TableCell
                      colSpan={columns.filter((col) => col.visible).length + (selectable ? 2 : 1) + 1}
                      className="emersive-table-category-header"
                    >
                      <Typography variant="subtitle1">{item.category}</Typography>
                    </TableCell>
                  </TableRow>
                )
              }

              // Handle regular items
              return (
                <TableRow
                  key={getItemKey(item)}
                  hover={rowHover}
                  selected={isItemSelected(item)}
                  className={stripedRows && index % 2 === 0 ? "striped" : ""}
                >
                  {selectable && (
                    <TableCell padding="checkbox" className="emersive-table-checkbox-column">
                      <Checkbox
                        checked={isItemSelected(item)}
                        onChange={(event) => {
                          if (onSelectionChange) {
                            onSelectionChange(item, event.target.checked)
                          } else if (onSelectRow) {
                            const currentSelected = selectedRows
                            const itemId = getItemKey(item)
                            if (event.target.checked) {
                              onSelectRow([...currentSelected, itemId])
                            } else {
                              onSelectRow(currentSelected.filter((id) => id !== itemId))
                            }
                          }
                        }}
                        className="emersive-table-checkbox"
                      />
                    </TableCell>
                  )}

                  {/* Index Column */}
                  <TableCell className="emersive-table-cell emersive-table-index-cell" align="center">
                    {itemIndices.get(getItemKey(item))}
                  </TableCell>

                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <TableCell key={`${getItemKey(item)}-${column.id}`} className="emersive-table-cell">
                        {column.renderCell ? column.renderCell(item) : column.value(item)}
                      </TableCell>
                    ))}

                  <TableCell className="emersive-table-action-cell">
                    <Box className="emersive-table-action-buttons">{actions(item)}</Box>
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Empty state */}
            {totalItemsCount === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.filter((col) => col.visible).length + (selectable ? 2 : 1) + 1}
                  align="center"
                >
                  <Box p={3} className="emersive-table-empty-state">
                    <Typography variant="body1" color="textSecondary">
                      {emptyStateMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {paginator && (
        <Box className="emersive-table-pagination-container">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography className="emersive-table-pagination-info">
              Total {totalItemsCount} {itemclass}
            </Typography>
            <TablePagination
              component="div"
              count={totalItemsCount}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={rowsPerPageOptions}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            />
          </Box>
        </Box>
      )}
    </div>
  )
}

export default EmersiveTable
