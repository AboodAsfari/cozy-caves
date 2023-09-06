import React from 'react';
import { Typography, Box, Button, Modal } from "@mui/material";
import "../style/Homepage.css";
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
        <Box sx={{width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Box id="titleContainer">
                    <Typography variant="h1" id="welcomeShadow">WELCOME</Typography>
                    <Typography variant="h1" id="welcomeOutline">WELCOME</Typography>
                </Box>
                <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, mt: 8}}>
                    <Box>
                        <Typography variant="h6" sx={{ ml: 20, mr:2, textAlign: 'right'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ ml: 2, mr:20, textAlign: 'left'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                    </Box>
                </Box>
                
                <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, mt: 10}}>
                    <Button variant="contained" className="HomeButton" sx={{bgcolor: "#4C9553", "&:hover": {bgcolor: "black"}}} onClick={() => props.setActivePage("options")}>
                        <Typography variant="h2">GENERATE</Typography>
                    </Button>
                    <Button variant="contained" className="HomeButton" sx={{color: "black", bgcolor: "white", "&:hover": {bgcolor: "black", color: "white"}}} onClick={handleOpenJoin}>
                        <Typography variant="h2">JOIN</Typography>
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