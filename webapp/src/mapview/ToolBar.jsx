import React from 'react';
import { 
    Menu,
    MenuItem,
    Button,
    ListItemIcon,
} from "@mui/material";
import "../style/Toolbar.css"

import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

export default function ToolBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const toggleBar = (e) => {
    if (anchorEl) setAnchorEl(null);
    else setAnchorEl(e.currentTarget);
  }

  // fix the styling later. this is so very bad
  // onClick={handleClick}
  return (
    <div style={{ position: 'absolute', top: '90px', right: '25px' }}> 
      <Button className="ToolbarToggle" disableRipple onClick={toggleBar}>  
        <ArrowDropDownOutlinedIcon className={!!anchorEl ? "open" : ""} sx={{ transform: "rotate(180deg)", fontSize: 30 }}  />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        // open={open}
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