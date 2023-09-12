import React, { useState, useEffect } from 'react';
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
  const { name, desc, category, rarity } = content || {};
  
  // State variable to hold items
  const [items, setItems] = useState([]);

  // useEffect to parse items from content.toString()
  useEffect(() => {
    if (content) {
      const contentString = content.toString();
      const itemsMatch = contentString.match(/items: \[([^\]]+)\]/);
      if (itemsMatch) {
        const itemsString = itemsMatch[1];
        const itemsArray = itemsString.split(',').map(item => item.trim());
        setItems(itemsArray);
      } else {
        setItems([]);
      }
    }
  }, [content]);

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
          <strong>Category:</strong> {category}
          <br />
          <strong>Rarity:</strong> {rarity}
          <br />
          <strong>Contains Items:</strong>
          <ul>
            {items.length > 0 ? (
              items.map((item, index) => (
                <li key={index}>{item}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </Typography>
      </Box>
    </Modal>
  );
};

export default Popup;