import React from 'react';
import { Box, Modal, Typography } from '@mui/material';

const style = {
  width: 460,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Popup = ({ isOpen, content, onClose, clickX, clickY }) => {
  // Dimensions of the popup
  const popupWidth = 460;
  const popupHeight = 200;

  // Calculate the top and left positions for the popup
  const popupStyle = {
    position: 'fixed',
    top: clickY - popupHeight + 50,
    left: clickX - popupWidth / 2 - 30,
    ...style,
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="popup-modal-title"
      aria-describedby="popup-modal-description"
    >
      <Box sx={popupStyle}>
        <Typography id="popup-modal-title" variant="h6" component="h2" sx={{ color: 'black' }}>
          Information Viewer
        </Typography>
        <Typography id="popup-modal-description" sx={{ mt: 2, color: 'black' }}>
          {content.toString()}
        </Typography>
      </Box>
    </Modal>
  );
};

export default Popup;