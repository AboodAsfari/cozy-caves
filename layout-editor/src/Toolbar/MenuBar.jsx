import React from "react";
import { 
  Toolbar,
  Stack,
  Button,
  Divider,
  Collapse,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import "../styles/MenuBar.css";
import { TransitionGroup } from 'react-transition-group';

import Tools from "../Tools";

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleIcon from '@mui/icons-material/Circle';
import CheckIcon from '@mui/icons-material/Check';

import ToolbarButton from "./ToolbarButton";
import BrushSelector from "./BrushSelector";

const MenuBar = (props) => {
  const {
    currTool,
    setCurrTool,
    brushInfo,
    setBrushInfo,
    layout
  } = props;

  const [defaultPartitionAnchorEl, setDefaultPartitionAnchorEl] = React.useState(null);

  const swapBrushes = () => {
    setBrushInfo(prev => ({ ...prev,
      primaryBrush: prev.secondaryBrush,
      secondaryBrush: prev.primaryBrush
    }));
  }

  const setPrimaryBrush = (brush) => {
    setBrushInfo(prev => ({ ...prev,
      primaryBrush: brush
    }));
  }

  const setSecondaryBrush = (brush) => {
    setBrushInfo(prev => ({ ...prev,
      secondaryBrush: brush
    }));
  }

  const setFillBrush = (brush) => {
    setBrushInfo(prev => ({ ...prev,
      fillBrush: brush
    }));
  }

  const getToolbarItems = () => {
    let ret = [];

    ret.push(<ToolbarButton key={0} iconName="stylus" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PEN} />);
    if (currTool === Tools.PEN) {
      let primaryIcon = <BrushSelector key={0.1} size={20} brush={brushInfo.primaryBrush} setBrush={setPrimaryBrush} />;
      let secondaryIcon = <BrushSelector key={0.2} size={15} mr={2} brush={brushInfo.secondaryBrush} setBrush={setSecondaryBrush} />;
      let brushSwapper = <SwapHorizIcon key={0.3} className="ToolIcon" sx={{ fontSize: 30, mt: 0.5, mr: 1 }} onClick={swapBrushes} />

      ret.push(primaryIcon);
      ret.push(brushSwapper);
      ret.push(secondaryIcon);
    } 

    ret.push(<ToolbarButton key={1} iconName="ink_eraser" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.ERASER} />);
    ret.push(<ToolbarButton key={2} iconName="arrow_selector_tool" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.SELECTOR} />);
    ret.push(<ToolbarButton key={3} iconName="colorize" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PICKER} />);

    ret.push(<ToolbarButton key={4} iconName="colors" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.FILL} />);
    if (currTool === Tools.FILL) {
      let selector = <BrushSelector key={4.1} size={20} brush={brushInfo.fillBrush} setBrush={setFillBrush} />;
      ret.push(selector);
    } 

    if (currTool === Tools.PEN || currTool === Tools.FILL) {
      ret.push(<Typography key={5} className="NavText" sx={{ textWrap: "nowrap" }}> Default Partition: </Typography>);
      ret.push(<>
        <Button key={6} className="NavButton" sx={{ textTransform: "none" }} disableRipple 
          endIcon={<KeyboardArrowDownIcon />} onClick={(e) => setDefaultPartitionAnchorEl(e.currentTarget)}> 
          <CircleIcon sx={{ color: layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].color, mr: 1 }} />
          { layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].name } 
        </Button>
        <Menu anchorEl={defaultPartitionAnchorEl} open={!!defaultPartitionAnchorEl} onClose={() => setDefaultPartitionAnchorEl(null)} 
          sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}>
          { layout.getPartitionDisplayInfo().map((info, i) => 
          <MenuItem key={info.name} onClick={() => { setBrushInfo(prev => ({ ...prev, defaultPartition: i - 2 })); setDefaultPartitionAnchorEl(null); }} className="MenuItem" sx={{ minWidth: 140 }} disableRipple> 
            <CircleIcon sx={{ color: info.color }} />
            <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> {info.name} </Typography>
            {brushInfo.defaultPartition === i - 2 && <CheckIcon />}
          </MenuItem>
        )}
        </Menu>
      </>);
    }

    return ret;
  }

  return (
    <Toolbar className="Toolbar">
        <Stack direction={"row"} sx={{ alignItems: "center" }}>
        <Button disableRipple className="NavButton"> File </Button>
        <Button disableRipple className="NavButton"> View </Button>
        <Divider variant="middle" flexItem sx={{ ml: 4, mr: 3.8, borderWidth: 1, borderColor: "white" }} />
        <TransitionGroup style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            {getToolbarItems().map((item, i) => 
            <Collapse orientation="horizontal" key={item.key}>
                {item}
            </Collapse>
            )}
        </TransitionGroup>
        </Stack>
    </Toolbar>
  );
}

export default MenuBar;
