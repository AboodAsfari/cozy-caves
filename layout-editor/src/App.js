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
  Divider
} from "@mui/material";
import GridTile from "./GridTile";
import "./App.css";
import { Point } from "@cozy-caves/utils";
import Tools from "./Tools";
import CreateIcon from '@mui/icons-material/Create';

const Layout = require("@cozy-caves/room-generation").Layout;

const App = () => {
  const width = 10;
  const height = 8;
  const [layout, setLayout] = useState(new Layout());
  const [currTool, setCurTool] = useState(Tools.PEN);
  const [dragButton, setDragButton] = useState(-1);

  const handleMouseUp = (e) => {
    if (e.button === 2 && dragButton === 2) {
      // Stop dropdown menu here.
    } 
  };

  return (
    <Box onMouseUp={handleMouseUp}>
      <AppBar position="sticky" component="nav">
        <Toolbar className="Toolbar">
          <Stack direction={"row"} sx={{ alignItems: "center" }}>
            <NavButton buttonText="File" />
            <NavButton buttonText="View" />
            <Divider variant="middle" flexItem sx={{ ml: 4, mr: 3.8, borderWidth: 1, borderColor: "white" }} />
            <ToolbarButton iconName="stylus" currTool={currTool} setCurTool={setCurTool} desiredTool={Tools.PEN} />
            <ToolbarButton iconName="ink_eraser" currTool={currTool} setCurTool={setCurTool} desiredTool={Tools.ERASER} />
            <ToolbarButton iconName="arrow_selector_tool" currTool={currTool} setCurTool={setCurTool} desiredTool={Tools.SELECTOR} />
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

export default App;
