import React, { useState, useMemo } from "react"
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
} from "@material-ui/core"
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward"
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward"
import { useModularTableStyles } from "../Studies/Index"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRoot: {
      height: "100%",
      "& .MuiTableContainer-root": {
        backgroundColor: "#fff",
        borderRadius: 4,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
      },
      "& .MuiTable-root": {
        borderCollapse: "separate",
        borderSpacing: 0,
      },
      "& .MuiTableHead-root": {
        backgroundColor: "#fff",
        "& .MuiTableCell-head": {
          padding: "16px",
          color: "rgba(0, 0, 0, 0.87)",
          fontWeight: 500,
          borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 2,
        },
      },
      "& .MuiTableBody-root": {
        "& .MuiTableRow-root:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
      },
      "& .MuiTableCell-body": {
        padding: "12px 16px",
        fontSize: "0.875rem",
        color: "rgba(0, 0, 0, 0.87)",
        borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
      },
    },
    headerCell: {
      backgroundColor: "#fff",
      color: theme.palette.text.primary,
      fontWeight: 500,
      position: "sticky",
      top: 0,
      zIndex: 10,
      "&.sticky-left": {
        left: 0,
        zIndex: 11,
      },
      "&.sticky-right": {
        right: 0,
        zIndex: 11,
      },
    },
    checkboxColumn: {
      width: 48,
      padding: "0 12px !important",
    },
    actionCell: {
      position: "sticky",
      right: 0,
      backgroundColor: "#fff",
      boxShadow: "-2px 0px 4px rgba(0, 0, 0, 0.1)",
      gap: theme.spacing(1),
      zIndex: 2,
      minWidth: 160,
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "1px",
        backgroundColor: "rgba(224, 224, 224,1)",
      },
    },
    sortButton: {
      padding: 4,
      marginLeft: 4,
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    categoryHeader: {
      backgroundColor: "#F5F5F5",
      padding: theme.spacing(1, 2),
      "& .MuiTypography-root": {
        fontWeight: 500,
        color: "rgba(0, 0, 0, 0.87)",
      },
    },
    cell: {
      // whiteSpace: 'nowrap',
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: 400,
      whiteSpace: "normal",
      wordBreak: "break-word",
      overflowWrap: "break-word",
    },
    checkboxActive: {
      color: "#7599FF !important",
      padding: theme.spacing(0.5),
      "&.Mui-checked": {
        color: "#7599FF",
      },
      "& .MuiSvgIcon-root": {
        borderRadius: "4px",
        width: "18px",
        height: "18px",
      },
    },
    actionButtons: {
      display: "flex",
      gap: theme.spacing(1),
      opacity: 0.7,
      transition: "opacity 0.2s ease",
      "&:hover": {
        opacity: 1,
      },
      justifyContent: "flex-start",
    },
    copyableCell: {
      cursor: "copy",
      position: "relative",
      fontWeight: 500,
      color: "#215F9A",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    versionBadge: {
      display: "inline-flex",
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.spacing(0.5),
      backgroundColor: "#FDEDE8",
      color: "#EB8367",
      alignItems: "center",
      gap: theme.spacing(0.5),
      fontWeight: 500,
    },
    studyCell: {
      cursor: "pointer",
      "&:hover .studyId": {
        display: "block",
      },
      whiteSpace: "normal",
      wordBreak: "break-word",
      overflowWrap: "break-word",
    },
  })
)

// Define column configuration
export interface ColumnConfig {
  id: string
  label: string
  getValue: (item: any) => any
  visible: boolean
  sortable?: boolean
  renderCell?: (item: any) => React.ReactNode
  width?: string | number
}

// Interface for the ModularTable component
export interface ModularTableProps {
  data: any[]
  columns: ColumnConfig[]
  selectedItems: any[]
  onSelectionChange: (item: any, checked: boolean) => void
  actions: (item: any) => React.ReactNode
  getItemKey: (item: any) => string
  categorizeItems?: (items: any[]) => Record<string, any[]>
  onSelectAll?: (selected: boolean) => void
  emptyStateMessage?: string
  customClasses?: any
}

const ModularTable: React.FC<ModularTableProps> = ({
  data,
  columns,
  selectedItems,
  onSelectionChange,
  actions,
  getItemKey,
  categorizeItems,
  onSelectAll,
  emptyStateMessage = "No records found",
  customClasses,
}) => {
  const classes = useStyles()
  const modClasses = useModularTableStyles()

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  })

  // Handle sort click
  const handleSort = (columnId: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === columnId && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key: columnId, direction })
  }

  // Sort items based on current sort configuration
  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return data

    // Special handling for index column sorting
    if (sortConfig.key === "index") {
      // When sorting by index, we simply keep or reverse the current order
      const sorted = [...data]
      return sortConfig.direction === "desc" ? sorted.reverse() : sorted
    }

    // For other columns, sort by the column values
    return [...data].sort((a, b) => {
      const column = columns.find((col) => col.id === sortConfig.key)
      if (!column) return 0

      const aValue = column.getValue(a)
      const bValue = column.getValue(b)

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig, columns])

  const categorizedItems = useMemo(() => {
    if (categorizeItems) {
      return categorizeItems(sortedItems)
    }
    // Default - no categories
    return { Items: sortedItems }
  }, [sortedItems, categorizeItems])

  // Handle select all
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(event.target.checked)
    } else {
      // Default implementation if onSelectAll not provided
      if (event.target.checked) {
        const allSelected = data.map((item) => getItemKey(item))
        data.forEach((item) => onSelectionChange(item, true))
      } else {
        data.forEach((item) => onSelectionChange(item, false))
      }
    }
  }

  // Calculate if all or some items are selected
  const isAllSelected = data.length > 0 && selectedItems.length === data.length
  const isSomeSelected = selectedItems.length > 0 && selectedItems.length < data.length

  // Check if an item is selected
  const isItemSelected = (item: any) => {
    return selectedItems.some((selected) => getItemKey(selected) === getItemKey(item))
  }
  const calculateCategoryIndices = (categorizedItems: Record<string, any[]>) => {
    const indexMap = new Map()
    let startIndex = 1 // Start from 1

    Object.entries(categorizedItems).forEach(([category, items]) => {
      items.forEach((item, idx) => {
        // Calculate category-based index
        indexMap.set(getItemKey(item), startIndex + idx)
      })
      startIndex += items.length
    })

    return indexMap
  }

  const calculateCategoryStartIndex = (items: any[]) => {
    let startIndex = 0
    const indexMap = new Map<string, number>()

    if (categorizeItems) {
      const categorized = categorizeItems(items)
      Object.entries(categorized).forEach(([category, categoryItems]) => {
        categoryItems.forEach((item, idx) => {
          indexMap.set(getItemKey(item), startIndex + idx)
        })
        startIndex += categoryItems.length
      })
    } else {
      items.forEach((item, idx) => {
        indexMap.set(getItemKey(item), idx)
      })
    }

    return indexMap
  }

  const itemIndices = useMemo(() => {
    const originalIndexMap = new Map()

    if (categorizeItems) {
      const originalCategorized = categorizeItems(data)
      let originalStartIndex = 1

      Object.entries(originalCategorized).forEach(([category, categoryItems]) => {
        categoryItems.forEach((item, idx) => {
          originalIndexMap.set(getItemKey(item), originalStartIndex + idx)
        })
        originalStartIndex += categoryItems.length
      })
    } else {
      data.forEach((item, idx) => {
        originalIndexMap.set(getItemKey(item), idx + 1)
      })
    }

    if (sortConfig.key === "index") {
      const indexMap = new Map()
      if (categorizeItems) {
        const categorized = categorizeItems(data)
        let startIndex = 1
        const categoryEntries = Object.entries(categorizedItems)
        categoryEntries.forEach(([category, items]) => {
          const categoryItems = [...items]
          if (sortConfig.direction === "desc") {
            categoryItems.reverse()
          }
          categoryItems.forEach((item, idx) => {
            indexMap.set(getItemKey(item), startIndex + idx)
          })
          startIndex += items.length
        })
      } else {
        const items = sortConfig.direction === "asc" ? sortedItems : [...sortedItems].reverse()

        items.forEach((item, idx) => {
          indexMap.set(getItemKey(item), idx + 1)
        })
      }
      return indexMap
    } else {
      return originalIndexMap
    }
  }, [data, categorizedItems, sortConfig, getItemKey, categorizeItems])

  const itemIndices_prev = useMemo(() => {
    if (sortConfig.key === "index") {
      const indexMap = new Map()
      const flatItems = Object.values(categorizedItems).flat()

      if (sortConfig.direction === "asc") {
        flatItems.forEach((item, idx) => {
          indexMap.set(getItemKey(item), idx + 1)
        })
      } else {
        flatItems.forEach((item, idx) => {
          indexMap.set(getItemKey(item), flatItems.length - idx)
        })
      }
      return indexMap
    }
    return calculateCategoryIndices(categorizedItems)
  }, [categorizedItems, sortConfig, getItemKey])
  return (
    <TableContainer component={Paper} className={customClasses?.tableContainer || classes.tableRoot}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={isSomeSelected}
                checked={isAllSelected}
                onChange={handleSelectAllClick}
                className={classes.checkboxActive}
              />
            </TableCell>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className={`${classes.headerCell} ${column.sortable ? "sortable" : ""}`}
                style={{ width: column.width }}
              >
                <Box className={modClasses.columnHeader}>
                  <span>{column.label}</span>
                  {column.sortable && (
                    <IconButton size="small" className={classes.sortButton} onClick={() => handleSort(column.id)}>
                      {sortConfig.key === column.id ? (
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
            <TableCell className={`${classes.headerCell} sticky-right`}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(categorizedItems).map(([category, categoryItems]) =>
            categoryItems.length > 0 ? (
              <React.Fragment key={category}>
                {/* Only render category headers if we have more than one category */}
                {Object.keys(categorizedItems).length > 1 && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className={classes.categoryHeader}>
                      <Typography variant="subtitle1">{category}</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Render items in this category */}
                {categoryItems.map((item) => (
                  <TableRow key={getItemKey(item)} hover selected={isItemSelected(item)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected(item)}
                        onChange={(event) => onSelectionChange(item, event.target.checked)}
                        className={classes.checkboxActive}
                      />
                    </TableCell>

                    {columns.map((column) => (
                      <TableCell
                        key={`${getItemKey(item)}-${column.id}`}
                        className={classes.cell}
                        align={column.id === "index" ? "center" : "left"}
                      >
                        {column.id === "index"
                          ? itemIndices.get(getItemKey(item))
                          : column.renderCell
                          ? column.renderCell(item)
                          : column.getValue(item)}
                      </TableCell>
                    ))}

                    <TableCell className={classes.actionCell}>
                      <Box className={classes.actionButtons}>{actions(item)}</Box>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ) : null
          )}

          {/* Empty state */}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + 2} align="center">
                <Box p={3}>
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
  )
}

export default ModularTable
