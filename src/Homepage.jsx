import { Typography,Box, Button } from "@mui/material";

const Homepage = (props) => {

  return (
    <Box>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="h1" >WELCOME</Typography>
            <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, marginTop: 10, marginBottom: 0 }} color="primary.main">
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="right">
                    <Typography variant="h5" sx={{ marginLeft: 20, marginRight:2}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                    <Button variant="contained" sx={{minWidth:300, minHeight: 100, margin: 5}}>
                        <Typography variant="h3" >GENERATE</Typography>
                    </Button>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="left">
                    <Typography variant="h5" sx={{ marginLeft: 2, marginRight:20}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                    <Button variant="contained" sx={{minWidth:300, minHeight: 100, margin: 5}}>
                        <Typography variant="h3" >JOIN</Typography>
                    </Button>
                </Box>
            </Box>
        </Box>
    </Box>
  );
};

export default Homepage;