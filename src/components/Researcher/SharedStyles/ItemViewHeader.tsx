import React from "react"
import { Box, Typography, IconButton, Icon, useMediaQuery, useTheme } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { useHeaderStyles } from "../SharedStyles/HeaderStyles"
import { ReactComponent as EditIcon } from "../../../icons/NewIcons/text-box-edit.svg"
import { ReactComponent as SaveIcon } from "../../../icons/NewIcons/floppy-disks.svg"
import { ReactComponent as PreviousIcon } from "../../../icons/NewIcons/arrow-alt-circle-left.svg"
import { ReactComponent as NextIcon } from "../../../icons/NewIcons/arrow-alt-circle-right.svg"
import { ReactComponent as CloseIcon } from "../../../icons/NewIcons/rectangle-list.svg"
import { ReactComponent as Logo } from "../../../icons/Logo.svg"
import SearchBox from "../../SearchBox"
import { useLayoutStyles } from "../../GlobalStyles"

interface ItemViewHeaderProps {
  ItemTitle: string
  ItemName: string
  authType: string
  searchData?: Function
  onEdit?: () => void
  onSave?: () => void
  onPrevious?: () => void
  onNext?: () => void
  onClose?: () => void
  disabledBtns?: Boolean
}

const ItemViewHeader: React.FC<ItemViewHeaderProps> = ({
  ItemTitle,
  ItemName,
  authType,
  searchData,
  onEdit,
  onSave,
  onPrevious,
  onNext,
  onClose,
  disabledBtns,
}) => {
  const headerclasses = useHeaderStyles()
  const { t } = useTranslation()
  const supportsSidebar = useMediaQuery(useTheme().breakpoints.up("md"))
  const layoutClasses = useLayoutStyles()

  return (
    <div className={layoutClasses.fixedContentContainer}>
      <Box className={headerclasses.header}>
        <Box className={headerclasses.titleSection}>
          {supportsSidebar ? (
            <Box className={headerclasses.logo}>
              <Logo className={headerclasses.logo} />
            </Box>
          ) : null}
          {authType === "admin" && (
            <IconButton
              className={headerclasses.backButton}
              onClick={() => {
                window.location.href = `/admin`
              }}
            >
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          <Typography variant="h5">{t(ItemTitle)} &gt;</Typography>
          <Typography variant="h5">{ItemName}</Typography>
        </Box>
        <Box className={headerclasses.actionGroup}>
          <SearchBox searchData={searchData} />
          {/* <EditIcon className={headerclasses.actionIcon} onClick={onEdit} />
        <SaveIcon className={headerclasses.actionIcon} onClick={onSave} /> */}
          <EditIcon
            className={`${headerclasses.actionIcon} ${disabledBtns ? headerclasses.disabledIcon : ""}`}
            onClick={!disabledBtns ? onEdit : undefined}
            style={{ cursor: disabledBtns ? "not-allowed" : "pointer" }}
          />
          <SaveIcon
            className={`${headerclasses.actionIcon} ${disabledBtns ? headerclasses.disabledIcon : ""}`}
            onClick={!disabledBtns ? onSave : undefined}
            style={{ cursor: disabledBtns ? "not-allowed" : "pointer" }}
          />
          <PreviousIcon className={headerclasses.actionIcon} onClick={onPrevious} />
          <NextIcon className={headerclasses.actionIcon} onClick={onNext} />
          <CloseIcon className={headerclasses.actionIcon} onClick={onClose} />
        </Box>
      </Box>
    </div>
  )
}

export default ItemViewHeader
