import { makeStyles, Theme } from "@material-ui/core"

export const useHeaderStyles = makeStyles((theme: Theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 1),
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
    marginTop: theme.spacing(2),
    width: "100%",
    minHeight: 75,
    "& h5": {
      fontSize: 25,
      fontWeight: 600,
      color: "rgba(0, 0, 0, 0.75)",
    },
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    "& h5": {
      // marginLeft: theme.spacing(2),
    },
    marginRight: theme.spacing(1),
    gap: theme.spacing(1),
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  filterButton: {
    backgroundColor: "#f1f3f4",
    color: "#5f6368",
    padding: "8px 24px",
    borderRadius: 20,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#e8eaed",
    },
  },
  profileSection: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
    borderRadius: 20,
    padding: "4px 4px 4px 0px",
    display: "flex",
    alignItems: "center",
    // marginLeft: theme.spacing(2),
  },
  avatar: {
    width: 36,
    height: 36,
    marginRight: theme.spacing(1),
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    "& .name": {
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
    "& .role": {
      color: theme.palette.text.secondary,
      fontSize: "0.875rem",
    },
  },
  disabledIcon: {
    opacity: 0.5,
    pointerEvents: "none",
  },
  customPaper: {
    maxWidth: 380,
    maxHeight: 600,
    marginTop: 25,
    minWidth: 320,
    marginLeft: 15,
    borderRadius: 10,
    padding: "10px 0",
    "& h6": { fontSize: 16, fontWeight: 600 },
    "& li": {
      display: "inline-block",
      width: "100%",
      padding: "15px 30px",
      fontSize: 16,
      "&:hover": { backgroundColor: "#ECF4FF" },
    },
  },
  logo: {
    width: 40,
    height: 40,
    // marginRight: theme.spacing(3),
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  },
  // Common options styles
  optionsMain: {
    background: "#ECF4FF",
    borderTop: "1px solid #C7C7C7",
    marginTop: 20,
    width: "99.4vw",
    position: "relative",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
  },
  optionsSub: {
    width: 1030,
    maxWidth: "80%",
    margin: "0 auto",
    padding: "10px 0",
  },
  // Additional common button styles
  addButton: {
    backgroundColor: "#4285f4",
    color: "#fff",
    padding: "8px 24px",
    borderRadius: 20,
    textTransform: "none",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    "&:hover": {
      backgroundColor: "#3367d6",
    },
  },
  backButton: {
    // marginRight: theme.spacing(2),
    color: "#5f6368",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
    padding: "4px",
  },
  togglebtn: {
    background: "#fff",
    borderRadius: "40px",
    boxShadow: "none",
    cursor: "pointer",
    textTransform: "capitalize",
    fontSize: "16px",
    // marginLeft: "8px",
    margin: theme.spacing(0, 0),
    // minWidth: 120,
    color: "#7599FF",
    "&:hover": { color: "#5680f9", background: "#fff", boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)" },
  },

  filterContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    height: "35px",
  },

  filterContainerBottom: {
    flexDirection: "column",
  },

  filterChips: {
    // borderRadius: "15px",
    flexWrap: "wrap",
    display: "flex",
    justifyContent: "center",
    margin: "0px auto 0",
    maxWidth: "100%",

    backgroundColor: "white",
    padding: theme.spacing(1),
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
    // zIndex: 102,
    left: 0,
  },
  multiselect: {
    border: "1px solid #C6C6C6",
    // background: "green",
    color: "rgba(0, 0, 0, 0.4)",
    height: "auto",
    minHeight: "32px",
    paddingTop: "5px",
    paddingBottom: "5px",
    "&:focus": { background: "#FFFFFF !important" },
  },
  multiselectPrimary: {
    background: "#ECF4FF !important",
    border: "1px solid #ECF4FF",
    color: "rgba(0, 0, 0, 0.75)",
    // color: "black",
    fontWeight: 500,
    "&:focus": { background: "#ECF4FF !important" },
  },
  chiplabel: { whiteSpace: "break-spaces" },
  actionIcon: {
    width: 40,
    height: 40,
    minWidth: 40,
    cursor: "pointer",
    transition: "all 0.3s ease",
    padding: theme.spacing(0.5),
    borderRadius: "25%",
    "& path": {
      fill: "rgba(0, 0, 0, 0.4)",
    },
    "&.active path": {
      fill: "#06B0F0",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      "& path": {
        fill: "#06B0F0",
      },
    },
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}))
