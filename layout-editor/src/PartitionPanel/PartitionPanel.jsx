import React from "react";
import {
    Box,
    TextField,
    Typography,
    Stack
} from "@mui/material";
import PartitionIconPopover from "./PartitionIconPopover";

import iconMap from "../PartitionIcons";

import "../styles/PartitionPanel.css";

import UnlockIcon from '@mui/icons-material/LockOpenOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';

const PartitionPanel = (props) => {
    const {
        locked,
        partition,
        setLocked,
        update
    } = props;

    const [iconAnchor, setIconAnchor] = React.useState(null);

    return (
        <Box className="PartitionPanel" sx={{ p: 3, pb: 0 }}>
            {!partition ?
                <Typography className="PartitionHeaderText">
                    No editable partitions found. <br />
                    Create a partition to start editing!
                </Typography> :
                <Box>
                    <Stack direction="row" sx={{ alignItems: "center" }}>
                        <Box sx={{
                            "& .icon": {
                                fontSize: 50, mr: 1, color: partition.getPartitionColor(),
                                "&:hover": { cursor: "pointer", color: "white" }
                            }
                        }} onClick={(e) => setIconAnchor(e.currentTarget)}>
                            {iconMap[partition.getPartitionIcon()]}
                        </Box>
                        <TextField className="PartitionFieldHeader" size="small" InputProps={{ className: "PartitionFieldHeader PartitionHeaderText" }}
                            value={partition.getPartitionName()} onChange={(e) => { partition.setPartitionName(e.target.value); update(); }} />

                        {locked ? <LockIcon className="LockToggle" onClick={() => setLocked(false)} /> : <UnlockIcon className="LockToggle" onClick={() => setLocked(true)} />}
                    </Stack>

                    <PartitionIconPopover partition={partition} iconAnchor={iconAnchor} setIconAnchor={setIconAnchor} update={update} />
                </Box>
            }
        </Box>
    );
}

export default PartitionPanel;
