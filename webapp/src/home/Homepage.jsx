import React from 'react';
import { Typography, Box, Button, Modal } from "@mui/material";
import "../style/Homepage.css";
import CloseIcon from '@mui/icons-material/Close';

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
        <Box sx={{width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Box id="titleContainer">
                    <Typography variant="h1" id="welcomeShadow">WELCOME!</Typography>
                    <Typography variant="h1" id="welcomeOutline">WELCOME!</Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontSize: 20, mt: -1 }}> Click GENERATE to start, or JOIN if you think we implemented that feature. </Typography>
                </Box>
                <Box display="flex" flexDirection="row" sx={{ flexGrow: 1, mt: 10}}>
                    <Button variant="contained" className="HomeButton" sx={{bgcolor: "#4C9553", "&:hover": {bgcolor: "#9B55C6"}, mr: "40px !important"}} onClick={() => props.setActivePage("options")} disableRipple>
                        <Typography variant="h2">GENERATE</Typography>
                    </Button>
                    <Button variant="contained" className="HomeButton" sx={{color: "black", bgcolor: "white", "&:hover": {bgcolor: "#9B55C6", color: "white"}, ml: "40px !important"}} onClick={handleOpenJoin} disableRipple>
                        <Typography variant="h2">JOIN</Typography>
                    </Button>
                    <Modal
                        open={open}
                        onClose={handleJoinClose}
                        aria-labelledby="join-modal-title"
                        aria-describedby="join-modal-description"
                    >
                        <Box sx={style} color="primary.main">
                            <CloseIcon sx={{ position: "absolute", top: "5px", right: "5px", "&:hover": {color: "#9B55C6", cursor: "pointer"}}} onClick={handleJoinClose}/>
                            <Typography id="join-modal-title" variant="h6" component="h2">
                                You had too much faith in us.
                            </Typography>
                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Box>
    );
};

export default Homepage;