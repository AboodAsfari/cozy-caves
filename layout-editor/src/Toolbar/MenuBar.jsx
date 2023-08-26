import React from "react";
import { 
  Toolbar,
  Stack,
  Button,
  Divider,
  Collapse,
} from "@mui/material";
import "../styles/MenuBar.css";
import { TransitionGroup } from 'react-transition-group';

import Tools from "../Tools";

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ToolbarButton from "./ToolbarButton";
import BrushSelector from "./BrushSelector";

const MenuBar = (props) => {
  const {
    currTool,
    setCurrTool,
    primaryBrush,
    setPrimaryBrush,
    secondaryBrush,
    setSecondaryBrush
  } = props;

  const swapBrushes = () => {
    setPrimaryBrush(secondaryBrush);
    setSecondaryBrush(primaryBrush);
  }

  const getToolbarItems = () => {
    let ret = [];
    ret.push(<ToolbarButton key={0} iconName="stylus" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PEN} />);
    if (currTool === Tools.PEN) {
      let primaryIcon = <BrushSelector key={0.1} size={20} brush={primaryBrush} setBrush={setPrimaryBrush} />;
      let secondaryIcon = <BrushSelector key={0.2} size={15} mr={2} brush={secondaryBrush} setBrush={setSecondaryBrush} />;
      let brushSwapper = <SwapHorizIcon key={0.3} className="ToolIcon" sx={{ fontSize: 30, mt: 0.5, mr: 1 }} onClick={swapBrushes} />

      ret.push(primaryIcon);
      ret.push(brushSwapper);
      ret.push(secondaryIcon);
    } 
    ret.push(<ToolbarButton key={1} iconName="ink_eraser" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.ERASER} />);
    ret.push(<ToolbarButton key={2} iconName="arrow_selector_tool" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.SELECTOR} />);
    ret.push(<ToolbarButton key={3} iconName="colorize" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PICKER} />);

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
