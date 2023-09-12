import React from 'react';
import { Box, Modal, Typography, Button } from '@mui/material';

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

  // Extract prop attributes from content
  const { name, desc, rarity, contains_items } = content || {};

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="popup-modal-title"
      aria-describedby="popup-modal-description"
    >
      <Box sx={popupStyle}>
      <Button 
        variant="contained"
        size="sm"
        color="secondary"
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          '&:hover': {
            backgroundColor: '#9b55c7',
          },
        }}
        onClick={onClose}
      >
        X
      </Button>
        <Typography id="popup-modal-title" variant="h6" component="h2" sx={{ mb: 2, color: 'black' }}>
        <strong>Information Viewer</strong>
        </Typography>
        <Typography id="popup-modal-description" sx={{ mt: 2, color: 'black', textAlign: 'left' }}>
        <strong>Name:</strong> {name}
          <br />
          <strong>Description:</strong> {desc}
          <br />
          <strong>Rarity:</strong> {rarity}
          <br />
        </Typography>
      </Box>
    </Modal>
  );
};

export default Popup;