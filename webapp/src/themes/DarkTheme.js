import { createTheme } from "@mui/material";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#000000",
        },
        primary: {
            main: "#000000",
            sub: "#ffffff",
        },
        secondary: {
            main: "#4C9553",
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
        fontFamily: "'Khand', sans-serif",
        fontColor: "white",
        h1: {
            fontSize: "200px",
            fontWeight: 100,
        },
        h2: {
            fontSize: "60px",
            fontWeight: 100,
        },
        h3: {
            fontSize: "38px",
            fontWeight: 100,
        }
    }
});

export default darkTheme;
  