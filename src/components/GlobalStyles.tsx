// styles.tsx

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"

export const useLayoutStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContent: {
      // backgroundColor: "#E0E0E0",
      backgroundColor: "#F0F0F0",
      maxWidth: "100vw",
      height: "100vh",
      overflowY: "hidden",
      overflowX: "hidden",
      padding: "0px",
      display: "flex",
      flexDirection: "row",
      // position:"relative"
    },
    tableContainerWidth: {
      // backgroundColor: "pink",
      maxWidth: 1055,
      width: "100%",
      [theme.breakpoints.down("md")]: {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    tableContainerWidthPad: {
      // backgroundColor: "red",
      maxWidth: 1055,
      width: "100%",
      paddingLeft: 0,
      paddingRight: 0,
    },
    tableContainerDataPortalWidth: {
      // backgroundColor: "red",
      width: "calc(100vw - 100px)",
      height: "calc(100vh - 50px)",
      paddingLeft: "0px",
      paddingRight: "0px",
      maxWidth: "100%",
      maxHeight: "100vh",
      top: "0px",
      left: "100px",
      overflow: "scroll",
      position: "absolute",
      [theme.breakpoints.down("sm")]: {
        left: "0px",
        width: "100vw",
        height: "calc(100vh - 150px)",
      },
    },

    drawerContainer: {
      maxHeight: "87.5vh",
      position: "fixed",
      top: "100px",
      left: "18px",
      bottom: 0,
      // backgroundColor: "red",
      borderRadius: 20,
      overflowY: "auto",
    },

    drawerContainerBottom: {
      height: "120px",
      width: "100vw",
      // top: "95vh",
      left: 0,

      backgroundColor: "grey",
    },

    researcherMenu: {
      // position: "sticky",
      background: "white",
      maxWidth: 120,
      border: 6,
      // top: 0,
      // top: '102px !important',
      borderRadius: 20,
      left: "0 !important",
      // marginLeft: theme.spacing(2),
      "& span": {
        fontSize: 14,
        whiteSpace: "normal",
      },
      "& div.Mui-selected": { backgroundColor: "transparent", color: "#5784EE", "& path": { fill: "#5784EE" } },
      // "& div.Mui-selected": {
      //   backgroundColor: "#5784EE",
      //   color: "#fff",
      //   borderRadius: "12px",
      //   margin: "0 8px",
      //   "& path": { fill: "#fff" }
      // },
      // overflowY: "scroll",
    },
    researcherMenuBottom: {
      position: "absolute",
      top: 0,
      // Center horizontally
      left: "50%",
      transform: "translateX(-50%)",
      // Size constraints
      maxWidth: "98%", // Use percentage instead of maxWidth for better control
      maxHeight: "120px",
      // Styling
      // backgroundColor: "yellow",
      borderRadius: "12px",
      // Add some vertical margin to ensure it's not touching the edges
      // margin: "10px 0",
      marginLeft: "0px",
      marginRight: "0px",
    },
    logResearcher: {
      // top: 102,
      height: "100%",
      // position: "sticky",
      width: 120,
      padding: theme.spacing(2),
      // overflowY: "scroll",

      /* Hide scrollbar for WebKit browsers (Chrome, Safari) */
      "&::-webkit-scrollbar": {
        display: "none",
      },

      /* Hide scrollbar for Firefox */
      scrollbarWidth: "none",

      /* Hide scrollbar for Edge/IE */
      "-ms-overflow-style": "none",
    },
    logResearcherBottom: {
      height: "120px",
      width: "98%",
      overflowX: "scroll",
    },
    fixedContentContainer: {
      position: "fixed",
      top: 0,
      left: 10,
      width: "100vw",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
    },
    header: {
      backgroundColor: "white",
      height: "80px",
      display: "flex",
      width: "98%",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(0.3, 0.3),
      borderRadius: 20,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
      margin: "auto",
      marginTop: theme.spacing(1.5),
      zIndex: 101, // Header above everything
    },

    tableContainer: {
      position: "fixed",
      top: "100px", // Equivalent to mt={14}
      height: "calc(100vh - 102.2px)",
      left: "140px",
      width: "91.5%",
      borderRadius: 20,
      padding: "0 5px 0 5px", // Set top padding to 0
      zIndex: 99,
      overflowY: "auto",
      color: "#f9f9f9",
      backgroundColor: "#f9f9f9",
      // padding: theme.spacing(0, 2),
      "& div.MuiInput-underline:before": { borderBottom: "0 !important" },
      "& div.MuiInput-underline:after": { borderBottom: "0 !important" },
      "& div.MuiInput-underline": {
        "& span.material-icons": {
          width: "100%",
          fontSize: 27,
          lineHeight: "23PX",
          color: "rgba(0, 0, 0, 0.4)",
        },
        "& button": { display: "none" },
      },
    },

    tableContainerMobile: {
      // Reset the left property from the parent
      left: "50%",
      // Center using transform
      transform: "translateX(-50%)",
      // Adjust width for mobile view
      width: "98%",
      // Add some margin to account for any potential sidebar
      margin: "0 auto",
      padding: "0 5px 0 5px",
      height: "calc(100vh - 222px)",
    },
  })
)
