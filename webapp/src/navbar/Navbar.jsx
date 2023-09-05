import {
    AppBar,
    Toolbar,
    Stack,
    Box,
    Typography,
} from "@mui/material";

const Navbar = (props) => {
    return (
        <Box sx={{ mt: 8 }}>
            <AppBar position="fixed" component="nav">
                <Toolbar>
                    <Stack direction={"row"} sx={{ position: "fixed" }}>
                    <Box sx={{ ml: 2, mt: 0 }}>
                        <Typography variant="h6" component="div" style={{fontFamily: "frijole"}} onClick={() => props.setActivePage("home")}>
                            Cozy Caves: Map Generator
                        </Typography>
                    </Box>
                    </Stack>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

const nav = (props) => {
    return (
        <>
            <nav className="navbar">
                <Box>

                </Box>
            </nav>
        </>
    );
};

export default Navbar;