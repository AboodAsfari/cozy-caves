import React from 'react';
import { 
    Menu,
    MenuItem,
    Button,
    ListItemIcon,
} from "@mui/material";

import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';


export default function TooBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // fix the styling later. this is so very bad
  return (
    <div style={{ position: 'absolute', top: '90px', right: '25px' }}> 
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <ArrowDropDownOutlinedIcon/>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        
        <MenuItem>
          <ListItemIcon>
              <LoopIcon/>
          </ListItemIcon>
        </MenuItem>
        
        <MenuItem>
          <ListItemIcon>
              <InfoOutlinedIcon/>
          </ListItemIcon>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
              <TuneOutlinedIcon/>
          </ListItemIcon>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
              <ShareOutlinedIcon/>
          </ListItemIcon>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
              <FileDownloadOutlinedIcon/>
          </ListItemIcon>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
              <PrintOutlinedIcon/>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </div>
  );
}