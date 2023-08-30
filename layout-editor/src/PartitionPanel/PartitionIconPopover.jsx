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

const PartitionIconPopover = (props) => {
  const {
    partition,
    iconAnchor,
    setIconAnchor,
    update
  } = props;

  return (
    <Popover className="PartitionIconPanel" open={!!iconAnchor} anchorEl={iconAnchor} onClose={() => setIconAnchor(null)} sx={{ mt: 1 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Stack sx={{ alignItems: "center", justifyContent: "space-evenly", width: "300px" }}>
            <Stack direction="row" spacing={3}>
                <Button disableRipple sx={{ textTransform: "none", color: "white", fontSize: 20, "&:hover": { backgroundColor: "transparent" } }}> Icon </Button>
                <Button disableRipple sx={{ textTransform: "none", color: "white", fontSize: 20, "&:hover": { backgroundColor: "transparent" } }}> Color </Button>
            </Stack>
            <Divider flexItem sx={{ mb: 2 }} />
            <Grid container sx={{ alignItems: "center", justifyContent: "space-evenly" }}>
                {Object.keys(iconMap).map((key) => (
                    <Grid item key={key} xs={4} sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }} 
                        onClick={() => { partition.setPartitionIcon(key); update(); setIconAnchor(null); }}>
                        <Box className="PartitionIcon">
                            {iconMap[key]}
                        </Box>
                    </Grid>
                ))}
                
            </Grid>
        </Stack>
    </Popover>
  );
}
  
export default PartitionIconPopover;
  