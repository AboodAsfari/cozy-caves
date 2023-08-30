import React from "react";
import { 
    Box,
    Button,
    Card,
    Divider,
    Grid,
    Popover,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "../styles/PartitionPanel.css";

import iconMap from "../PartitionIcons";

import { HexColorPicker, HexColorInput } from "react-colorful";

const PartitionIconPopover = (props) => {
  const {
    partition,
    iconAnchor,
    setIconAnchor,
    update
  } = props;

  const [colorMenu, setColorMenu] = React.useState(false);
  const counter = React.useRef(0);

    React.useEffect(() => {
        if (!!iconAnchor) setColorMenu(false);
    }, [iconAnchor]);

  return (
    <Popover className="PartitionIconPanel" open={!!iconAnchor} anchorEl={iconAnchor} onClose={() => { setIconAnchor(null); }} sx={{ mt: 1 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Stack sx={{ alignItems: "center", justifyContent: "space-evenly", width: "320px" }}>
            <Stack direction="row" spacing={3}>
                <Button disableRipple onClick={() => setColorMenu(false)} sx={{ textTransform: "none", color: "white", fontSize: 20, "&:hover": { color: "#7da36d", backgroundColor: "transparent" } }}> Icon </Button>
                <Button disableRipple onClick={() => setColorMenu(true)} sx={{ textTransform: "none", color: "white", fontSize: 20, "&:hover": { color: "#7da36d", backgroundColor: "transparent" } }}> Color </Button>
            </Stack>
            <Divider flexItem sx={{ mb: 0 }} />
            <Box sx={{ height: "242px", width: "300px" }}>
                {!colorMenu ?
                <Grid container sx={{ alignItems: "center", justifyContent: "space-evenly", mt: 2 }}>
                    {Object.keys(iconMap).map((key) => (
                        <Grid item key={key} xs={4} sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }} 
                            onClick={() => { partition.setPartitionIcon(key); update(); setIconAnchor(null); }}>
                            <Box className="PartitionIcon">
                                {iconMap[key]}
                            </Box>
                        </Grid>
                    ))}
                </Grid> :
                <Box className="ColorPicker"> 
                    <HexColorPicker color={partition.getPartitionColor()} onChange={(color) => { 
                        partition.setPartitionColor(color); 
                        counter.current++;
                        if (counter.current > 3) {
                            update();
                            counter.current = 0;
                        } 
                    }} />
                    <HexColorInput color={partition.getPartitionColor()} onChange={(color) => { partition.setPartitionColor(color); update(); }} />
                </Box>
                }
            </Box>
        </Stack>
    </Popover>
  );
}
  
export default PartitionIconPopover;
  