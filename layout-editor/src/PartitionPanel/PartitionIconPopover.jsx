import React from "react";
import {
    Box,
    Popover,
    Stack,
    Typography
} from "@mui/material";
import { HexColorPicker, HexColorInput } from "react-colorful";

import "../styles/PartitionPanel.css";

const PartitionIconPopover = (props) => {
    const {
        iconAnchor,
        partition,
        setIconAnchor,
        update
    } = props;

    const counter = React.useRef(0);

    return (
        <Popover className="PartitionIconPanel" open={!!iconAnchor} anchorEl={iconAnchor} onClose={() => { setIconAnchor(null); }} sx={{ mt: 1 }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Stack sx={{ alignItems: "center", justifyContent: "space-evenly", width: "320px" }}>
                <Typography sx={{ color: "white", fontSize: 20, mt: 1 }}> Partition Color </Typography>
                <Box className="ColorPicker" sx={{ height: "242px", width: "300px" }}>
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
            </Stack>
        </Popover>
    );
}

export default PartitionIconPopover;
