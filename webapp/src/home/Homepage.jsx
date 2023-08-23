import React from 'react';
import { Typography, Box, Button, Modal } from "@mui/material";
/* 
This needs to be split into multiple components
some of the boxes can probably 
*/

// Code used for modal popup https://mui.com/material-ui/react-modal/
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 460,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

const Homepage = (props) => {
    const [open, setOpen] = React.useState(false);
    const handleOpenJoin = () => setOpen(true);
    const handleJoinClose = () => setOpen(false);
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
                    <Button variant="contained" sx={{minWidth:400, minHeight: 120, margin: 2}} onClick={() => props.setActivePage("options")}>
                        <Typography variant="h2" >GENERATE</Typography>
                    </Button>
                    <Button variant="contained" sx={{minWidth:400, minHeight: 120, margin: 2}} onClick={handleOpenJoin}>
                        <Typography variant="h2" >JOIN</Typography>
                    </Button>
                    <Modal
                        open={open}
                        onClose={handleJoinClose}
                        aria-labelledby="join-modal-title"
                        aria-describedby="join-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="join-modal-title" variant="h6" component="h2">
                                This Feature is not yet implemented
                            </Typography>
                            <Typography id="join-modal-description" sx={{ mt: 2 }}>
                                The join feature hasn't been implemented yet, check back later.
                            </Typography>
                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Box>
    );
};

const HomepageGrid = () => {
    return (
        <Box display="flex" sx={{ flexGrow: 0}}>
            <Grid container spacing={2} sx={{marginTop: 10}}>
                <Grid item xs={6}>
                    <Typography variant="h5" sx={{ margin: 5}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h5" sx={{ margin: 5}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Homepage;