import {
    AppBar,
    Toolbar,
    Stack,
    Box,
    Typography,
} from "@mui/material";

const Navbar = (props) => {
    const handleGoHome = () => {
        props.toggleTransitionPanel(() => {
            props.setActivePage("home");
            props.toggleTransitionPanel();
        });
    }

    return (
        <Box>
            <AppBar position="fixed" component="nav">
                <Toolbar sx={{height: 70}}>
                    <Stack direction={"row"} sx={{ position: "fixed" }}>
                    <Box sx={{ ml: 2, mt: 0 }}>
                        <Typography fontSize={"30px"} component="div" sx={{"&:hover": { cursor: "pointer"}}} onClick={handleGoHome}>
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