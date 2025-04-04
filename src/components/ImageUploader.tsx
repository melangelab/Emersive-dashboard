import React, { useCallback } from "react"
import { Box, ButtonBase, Icon, Tooltip, makeStyles, Theme, createStyles } from "@material-ui/core"
import { useDropzone } from "react-dropzone"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 154,
      height: 154,
      border: "1px solid",
      borderRadius: 4,
      position: "relative",
      overflow: "hidden",
    },
    dropzone: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
    },
    preview: {
      width: "100%",
      height: "100%",
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    deleteButton: {
      position: "absolute",
      top: 0,
      right: 0,
      padding: theme.spacing(1),
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
    },
  })
)

function compress(file: File, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    const fileName = file.name
    const extension = fileName.split(".").reverse()[0]?.toLowerCase()

    reader.onerror = (error) => reject(error)

    if (extension !== "svg") {
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const elem = document.createElement("canvas")
          elem.width = width
          elem.height = height
          const ctx = elem.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          resolve(ctx?.canvas.toDataURL() || "")
        }
      }
    } else {
      reader.onload = () => resolve(reader.result as string)
    }
  })
}

interface ImageUploaderProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, disabled }) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      compress(acceptedFiles[0], 64, 64).then(onChange)
    },
    [onChange]
  )

  const onDropRejected = useCallback(
    (rejectedFiles: any[]) => {
      if (rejectedFiles[0].size / 1024 / 1024 > 5) {
        enqueueSnackbar(t("Image size should not exceed 5 MB."), { variant: "error" })
      } else if ("image" !== rejectedFiles[0].type.split("/")[0]) {
        enqueueSnackbar(t("Not supported image type."), { variant: "error" })
      }
    },
    [enqueueSnackbar, t]
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled,
  })

  return (
    <Tooltip
      title={
        !value
          ? t("Drag a photo or tap to select a photo.")
          : t("Drag a photo to replace the existing photo or tap to delete the photo.")
      }
    >
      <Box
        className={classes.root}
        {...getRootProps()}
        style={{
          borderColor: !(isDragActive || isDragAccept || !!value) ? "rgba(0, 0, 0, 0.23)" : "#fff",
          backgroundColor: isDragActive || isDragAccept ? "rgba(0, 0, 0, 0.12)" : undefined,
        }}
      >
        <ButtonBase className={classes.dropzone} onClick={() => value && onChange(null)}>
          {!value && <input {...getInputProps()} />}
          {value ? (
            <Box className={classes.preview} style={{ backgroundImage: `url(${value})` }} />
          ) : (
            <Icon fontSize="large">{!value ? "add_a_photo" : "delete_forever"}</Icon>
          )}
        </ButtonBase>
      </Box>
    </Tooltip>
  )
}
