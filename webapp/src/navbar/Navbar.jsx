import {
    AppBar,
    Toolbar,
    Stack,
    Box,
    Typography,
} from "@mui/material";

const Navbar = (props) => {
    return (
        <Box>
            <AppBar position="fixed" component="nav">
                <Toolbar sx={{height: 70}}>
                    <Stack direction={"row"} sx={{ position: "fixed" }}>
                    <Box sx={{ ml: 2, mt: 0 }}>
                        <Typography fontSize={"30px"} component="div" onClick={() => props.setActivePage("home")}>
                            Cozy Caves: Map Generator
                        </Typography>
                    </Box>
                    </Stack>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;