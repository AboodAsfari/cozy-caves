import React from 'react';
import { Typography,Box, Button } from "@mui/material";
/* 
This needs to be split into multiple components
some of the boxes can probably 
*/
const Homepage = (props) => {

  return (
    <Box>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="h1" >WELCOME  </Typography>
            <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, marginTop: 10, marginBottom: 0 }} color="primary.main">
                <Box>
                    <Typography variant="h5" sx={{ marginLeft: 20, marginRight:2}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ marginLeft: 2, marginRight:20}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                </Box>
            </Box>
            <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, marginTop: 10, marginBottom: 0 }} color="primary.main">
                <Button variant="contained" sx={{minWidth:400, minHeight: 120, margin: 2}}>
                    <Typography variant="h2" >GENERATE</Typography>
                </Button>
                <Button variant="contained" sx={{minWidth:400, minHeight: 120, margin: 2}}>
                    <Typography variant="h2" >JOIN</Typography>
                </Button>
            </Box>
        </Box>
    </Box>
  );
};

export default Homepage;