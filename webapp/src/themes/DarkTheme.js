import { createTheme } from "@mui/material";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#000000",
        },
        primary: {
            main: "#000000",
        },
        secondary: {
            main: "#4C9553", //put bright green color here
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: "#000000",
                },
            }
        }
    },
    typography: {
        h1: {
            fontSize: "10rem",
            fontWeight: 100,
        },
        h2: {
            fontSize: "4rem",
            fontWeight: 100,
        },
        h3: {
            fontSize: "2.5rem",
            fontWeight: 100,
        }
    }
});

export default darkTheme;
  