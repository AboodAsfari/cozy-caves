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

const buttonStyle = {
    minWidth: 300,
    minHeight: 100,
    m: 2,
};

const Homepage = (props) => {
    const [open, setOpen] = React.useState(false);
    const handleOpenJoin = () => setOpen(true);
    const handleJoinClose = () => setOpen(false);
    return (
        <Box sx={{maxWidth: '100vw', maxHeight: '100vh'}}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mt: 20}}>
                <Typography variant="h1">WELCOME</Typography>
                <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, mt: 8}} color="primary.main">
                    <Box>
                        <Typography variant="h6" sx={{ ml: 10, mr:2, textAlign: 'right'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ ml: 2, mr:10, textAlign: 'left'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                    </Box>
                </Box>
                <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, mt: 10}} color="secondary.main">
                    <Button variant="contained" sx={buttonStyle} onClick={() => props.setActivePage("options")}>
                        <Typography variant="h3">GENERATE</Typography>
                    </Button>
                    <Button variant="contained" sx={buttonStyle} onClick={handleOpenJoin}>
                        <Typography variant="h3">JOIN</Typography>
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

export default Homepage;