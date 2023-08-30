import React from "react";
import { 
    Box,
    Card,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "./styles/PartitionPanel.css";

import CircleIcon from '@mui/icons-material/Circle';
import UnlockIcon from '@mui/icons-material/LockOpenOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';


const PartitionPanel = (props) => {
  const {
    partition,
    update,
    locked,
    setLocked
  } = props;

  return (
    <Box className="PartitionPanel" sx={{ p: 3, pb: 0 }}>
    {!partition ? 
        <Typography className="PartitionHeaderText"> 
            No editable partitions found. <br />
            Create a partition to start editing! 
        </Typography> : 
        <Box>
            <Stack direction="row" sx={{ alignItems: "center" }}>
                <Box sx={{ position: "relative", mr: 1, color: partition.getPartitionColor(), "&:hover": { cursor: "pointer", color: "white" } }}>
                    <CircleIcon sx={{ fontSize: 44, position: "absolute", left: 3, top: 3, color: partition.getPartitionColor() }}/>
                    <CircleIcon sx={{ fontSize: 50, color: "white", color: "inherit" }}/>
                </Box>

                <TextField className="PartitionFieldHeader" size="small" InputProps={{ className: "PartitionFieldHeader PartitionHeaderText" }} 
                    value={partition.getPartitionName()} onChange={(e) => { partition.setPartitionName(e.target.value); update(); }} />

                { locked ? <LockIcon className="LockToggle" onClick={() => setLocked(false)} /> : <UnlockIcon className="LockToggle" onClick={() => setLocked(true)} /> }
            </Stack>
        </Box>
        
    }
    </Box>
  );
}
  
export default PartitionPanel;
  