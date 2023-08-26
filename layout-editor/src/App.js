import React, { useState } from "react";
import { 
  AppBar,
  ThemeProvider, 
  Toolbar,
  Stack,
  Box,
  Typography,
  Grid,
  Button,
  Divider,
  Slide,
  Collapse,
  Menu,
  MenuItem
} from "@mui/material";
import GridTile from "./GridTile";
import "./App.css";
import { Point } from "@cozy-caves/utils";
import Tools from "./Tools";
import CheckIcon from '@mui/icons-material/Check';
import { TransitionGroup } from 'react-transition-group';

const Layout = require("@cozy-caves/room-generation").Layout;

const App = () => {
  const width = 10;
  const height = 8;
  const [layout, setLayout] = useState(new Layout());
  const [currTool, setCurTool] = useState(Tools.PEN);
  const [primaryBrush, setPrimaryBrush] = useState("floor");
  const [secondaryBrush, setSecondaryBrush] = useState("wall");
  const [dragButton, setDragButton] = useState(-1);

  const getToolbarItems = () => {
    let ret = [];
    ret.push(<ToolbarButton key={0} iconName="stylus" currTool={currTool} setCurTool={setCurTool} desiredTool={Tools.PEN} />);
    if (currTool === Tools.PEN) {
      let primaryIcon = <BrushSelector key={3} size={20} brush={primaryBrush} setBrush={setPrimaryBrush} />;
      let secondaryIcon = <BrushSelector key={4} size={15} mt={0.6} brush={secondaryBrush} setBrush={setSecondaryBrush} />;

      ret.push(primaryIcon);
      ret.push(secondaryIcon);
    }
    ret.push(<ToolbarButton key={1} iconName="ink_eraser" currTool={currTool} setCurTool={setCurTool} desiredTool={Tools.ERASER} />);
    ret.push(<ToolbarButton key={2} iconName="arrow_selector_tool" currTool={currTool} setCurTool={setCurTool} desiredTool={Tools.SELECTOR} />);

    return ret;
  }

  return (
    <Box>
      <AppBar position="sticky" component="nav">
        <Toolbar className="Toolbar">
          <Stack direction={"row"} sx={{ alignItems: "center" }}>
            <NavButton buttonText="File" />
            <NavButton buttonText="View" />
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
      </AppBar>

      <Box sx={{ mt: 2.5 }}>
        {[...Array(height)].map((x, i) => 
          <Stack direction="row" key={i} sx={{ ml: 2, mt: "-4px" }} spacing="-4px">
            {[...Array(width)].map((x, j) => 
              <GridTile key={j} pos={new Point(j, i)} currTool={currTool} layout={layout} dragButton={dragButton} setDragButton={setDragButton} /> )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

const NavButton = (props) => {
  const {
    buttonText
  } = props;

  return (
    <Button disableRipple sx={{
      color: "white",
      backgroundColor: "transparent",
      fontWeight: 600,
      fontSize: "1rem",
      textTransform: "none",
      ml: 1,
      "&:hover": {
        backgroundColor: "transparent",
        color: "#7da36d"
      }
    }}> {buttonText} </Button>
  );
}

const ToolbarButton = (props) => {
  const {
    iconName,
    currTool,
    setCurTool,
    desiredTool
  } = props;
  
  return (
    <span className={ "material-symbols-outlined ToolIcon" } onClick={() => setCurTool(desiredTool)}
      style={{ fontSize: 30, userSelect: "none", color: currTool === desiredTool ? "#7da36d" : "white", marginRight: 10 }}> 
      {iconName} 
    </span>    
  );
}

const BrushSelector = (props) => {
  const {
    size,
    mt,
    brush,
    setBrush
  } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const getBrushIcon = (brush) => {
    if (brush === "none") return "noTileIcon.png";
    if (brush === "floor") return "floorIcon.png";
    if (brush === "wall") return "wallIcon.png";
  }

  return (
    <>
    <Box className="PenBrushIcon" sx={{ width: size, height: size, mt: mt }} onClick={(e) => setAnchorEl(e.currentTarget)}> 
        <img className="PixelArt" src={getBrushIcon(brush)} alt="brush selector" style={{ width: "100%", height: "100%"}} /> 
    </Box>

    <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} 
      sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}>
      <BrushMenuItem brush={brush} setBrush={setBrush} handleClose={() => setAnchorEl(null)} getBrushIcon={getBrushIcon} brushName="none" />
      <BrushMenuItem brush={brush} setBrush={setBrush} handleClose={() => setAnchorEl(null)} getBrushIcon={getBrushIcon} brushName="floor" />
      <BrushMenuItem brush={brush} setBrush={setBrush} handleClose={() => setAnchorEl(null)} getBrushIcon={getBrushIcon} brushName="wall" />
    </Menu>
    </>
  );
}

const BrushMenuItem = (props) => {
  const {
    brush,
    setBrush,
    handleClose,
    getBrushIcon,
    brushName
  } = props;

  return (
    <MenuItem onClick={() => { setBrush(brushName); handleClose(); }} className="BrushMenuItem" sx={{ minWidth: 140 }} disableRipple> 
      <img className="PixelArt" src={getBrushIcon(brushName)} alt="brush selector" style={{ width: "20px", height: "100%" }} /> 
      <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> {brushName[0].toUpperCase() + brushName.slice(1).toLowerCase()} </Typography>
      {brush === brushName && <CheckIcon />}
    </MenuItem>
  );
}

export default App;
