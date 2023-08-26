import React from "react";
import { 
  AppBar,
  Stack,
  Box,
} from "@mui/material";
import "./styles/App.css";
import "./styles/MenuBar.css";

import GridTile from "./GridTile";
import { Point } from "@cozy-caves/utils";
import Tools from "./Tools";

import MenuBar from "./Toolbar/MenuBar";

const Layout = require("@cozy-caves/room-generation").Layout;

const App = () => {
  const width = 10;
  const height = 8;
  const [layout, setLayout] = React.useState(new Layout());
  const [currTool, setCurTool] = React.useState(Tools.PEN);
  const [primaryBrush, setPrimaryBrush] = React.useState("floor");
  const [secondaryBrush, setSecondaryBrush] = React.useState("wall");
  const [dragButton, setDragButton] = React.useState(-1);

  return (
    <Box>
      <AppBar position="sticky" component="nav">
        <MenuBar currTool={currTool} setCurTool={setCurTool} primaryBrush={primaryBrush} 
          setPrimaryBrush={setPrimaryBrush} secondaryBrush={secondaryBrush} setSecondaryBrush={setSecondaryBrush} />
      </AppBar>

      <Box sx={{ mt: 2.5 }}>
        {[...Array(height)].map((x, i) => 
          <Stack direction="row" key={i} sx={{ ml: 2, mt: "-4px" }} spacing="-4px">
            {[...Array(width)].map((x, j) => 
              <GridTile key={j} pos={new Point(j, i)} currTool={currTool} layout={layout} dragButton={dragButton} setDragButton={setDragButton} 
                primaryBrush={primaryBrush} secondaryBrush={secondaryBrush} /> )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default App;
