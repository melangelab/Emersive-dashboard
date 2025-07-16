import { makeStyles, Theme, createStyles } from "@material-ui/core"

export const useCardViewStyles = makeStyles((theme: Theme) =>
  createStyles({
    indentText: {
      paddingLeft: theme.spacing(1),
    },
    cardContainer: {
      background: "#E0E0E0",
      borderRadius: 16,
      margin: 11,
      padding: theme.spacing(2),
    },
    researcherCardStudiesCountCotainer: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },
    researcherCardStudiesCountContent: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
  })
)

export const useFullWidthDividerStyles = makeStyles(() => ({
  fullWidthDivider: {
    margin: "16px -16px",
    width: "calc(100% + 32px)",
  },
}))
