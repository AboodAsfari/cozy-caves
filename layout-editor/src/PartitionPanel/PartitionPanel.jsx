import React from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Checkbox,
    TextField,
    Typography,
    Stack,
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";
import PartitionIconPopover from "./PartitionIconPopover";

import iconMap from "../PartitionIcons";

import "../styles/PartitionPanel.css";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CenterDot from '@mui/icons-material/FiberManualRecord';
import UnlockIcon from '@mui/icons-material/LockOpenOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';

const PartitionPanel = (props) => {
    const {
        locked,
        partition,
        setLocked,
        update
    } = props;

    const [tempIncrementX, setTempIncrementX] = React.useState(0);
    const [tempIncrementY, setTempIncrementY] = React.useState(0);

    const [xAccordionOpen, setXAccordionOpen] = React.useState(false);
    const [yAccordionOpen, setYAccordionOpen] = React.useState(false);

    const [iconAnchor, setIconAnchor] = React.useState(null);
    const [updater, setUpdater] = React.useState(false);

    React.useEffect(() => {
        if (!partition) return;
        setTempIncrementX(partition.getIncrementAmtX());
        setTempIncrementY(partition.getIncrementAmtY());
    }, [partition]);

    const handleLockScaling = (e) => {
        partition.setLockRatio(e.target.checked);
        if (e.target.checked) {
            partition.setLockX(false);
            partition.setLockY(false);
        }
        setUpdater(!updater);
    };

    const handleLockXScaling = (e) => {
        partition.setLockX(e.target.checked);
        setUpdater(!updater);
    };

    const handleLockYScaling = (e) => {
        partition.setLockY(e.target.checked);
        setUpdater(!updater);
    };

    const handleSplitScalingX = (e) => {
        partition.setSplitScalingOnX(e.target.checked);
        setUpdater(!updater);
    };

    const handleSplitScalingY = (e) => {
        partition.setSplitScalingOnY(e.target.checked);
        setUpdater(!updater);
    }

    const handleTempIncrementX = (e) => {
        if (e.target.value.length === 0) setTempIncrementX("");
        else if (isNaN(parseInt(e.target.value)) || parseInt(e.target.value) <= 0) return;
        else setTempIncrementX(parseInt(e.target.value));
    };

    const handleTempIncrementY = (e) => {
        if (e.target.value.length === 0) setTempIncrementY("");
        else if (isNaN(parseInt(e.target.value)) || parseInt(e.target.value) <= 0) return;
        else setTempIncrementY(parseInt(e.target.value));
    }

    const handleIncrementX = (e) => {
        if (tempIncrementX.length === 0 || isNaN(parseInt(tempIncrementX)) || parseInt(tempIncrementX) <= 0
            || (partition.getXDir() === 0 && parseInt(tempIncrementX) % 2 === 1)) {
            setTempIncrementX(partition.getIncrementAmtX());
            return;
        }
        partition.setIncrementAmtX(parseInt(tempIncrementX));
    };

    const handleIncrementY = (e) => {
        if (tempIncrementY.length === 0 || isNaN(parseInt(tempIncrementY)) || parseInt(tempIncrementY) <= 0
            || (partition.getYDir() === 0 && parseInt(tempIncrementY) % 2 === 1)) {
            setTempIncrementY(partition.getIncrementAmtY());
            return;
        }
        partition.setIncrementAmtY(parseInt(tempIncrementY));
    }

    const handleXDir = (e, val) => {
        if (val === null) return;
        let currIncrementAmt = partition.getIncrementAmtX();
        if (val === 0 && currIncrementAmt % 2 === 1) {
            setTempIncrementX(currIncrementAmt + 1);
            partition.setIncrementAmtX(currIncrementAmt + 1); 
        }
        partition.setXDir(val)
        setUpdater(!updater);
    };

    const handleYDir = (e, val) => {
        if (val === null) return;
        let currIncrementAmt = partition.getIncrementAmtY();
        if (val === 0 && currIncrementAmt % 2 === 1) {
            setTempIncrementY(currIncrementAmt + 1);
            partition.setIncrementAmtY(currIncrementAmt + 1); 
        }
        partition.setYDir(val)
        setUpdater(!updater);
    }

    return (
        <Box className="PartitionPanel" sx={{ p: 3, pb: 0 }}>
            {!partition ?
                <Typography className="PartitionHeaderText">
                    No editable partitions found. <br />
                    Create a partition to start editing!
                </Typography> :
                <Box>
                    <Stack>
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

                        <Stack direction="row" className="Checkbox">
                            <Checkbox disableRipple checked={partition.ratioLocked()} onChange={handleLockScaling} />
                            <Typography> Lock Scaling Ratio </Typography>
                        </Stack>
                        <Stack direction="row" className="Checkbox">
                            <Checkbox disableRipple disabled={partition.ratioLocked()} checked={partition.xLocked()} onChange={handleLockXScaling} />
                            <Typography> Lock X Scaling </Typography>
                        </Stack>
                        <Stack direction="row" className="Checkbox">
                            <Checkbox disableRipple disabled={partition.ratioLocked()} checked={partition.yLocked()} onChange={handleLockYScaling} />
                            <Typography> Lock Y Scaling </Typography>
                        </Stack>

                        <ScalingAxisAccordion isX={true} partition={partition} handleDir={handleXDir} handleIncrement={handleIncrementX}
                            handleSplitScaling={handleSplitScalingX} handleTempIncrement={handleTempIncrementX} 
                            tempIncrement={tempIncrementX} accordionOpen={xAccordionOpen} setAccordionOpen={setXAccordionOpen} />

                        <ScalingAxisAccordion isX={false} partition={partition} handleDir={handleYDir} handleIncrement={handleIncrementY}
                            handleSplitScaling={handleSplitScalingY} handleTempIncrement={handleTempIncrementY} 
                            tempIncrement={tempIncrementY} accordionOpen={yAccordionOpen} setAccordionOpen={setYAccordionOpen} />

                    </Stack>

                    <PartitionIconPopover partition={partition} iconAnchor={iconAnchor} setIconAnchor={setIconAnchor} update={update} />
                </Box>
            }
        </Box>
    );
}

const ScalingAxisAccordion = (props) => {
    const {
        accordionOpen,
        isX,
        handleDir,
        handleIncrement,
        handleSplitScaling,
        handleTempIncrement,
        partition,
        setAccordionOpen,
        tempIncrement
    } = props;

    const getLocked = () => isX ? partition.xLocked() : partition.yLocked();

    const getSplitScaling = () => isX ? partition.isSplitScalingOnX() : partition.isSplitScalingOnY();
    const getDir = () => isX ? partition.getXDir() : partition.getYDir();

    const getIcons = () => {
        if (isX) return [<ArrowBackIcon />, <CenterDot />, <ArrowForwardIcon />];
        return [<ArrowUpwardIcon />, <CenterDot />, <ArrowDownwardIcon />];
    }

    const getScalingNames = () => {
        if (isX) return ["Left", "Center", "Right"];
        return ["Top", "Center", "Bottom"];
    }

    const handleChange = () => {
        if (getLocked()) return;
        setAccordionOpen(!accordionOpen);
    }

    return (
        <Accordion disableGutters disabled={getLocked()} expanded={accordionOpen && !getLocked()} onChange={handleChange} className="ScalingAccordion" 
            sx={{ mt: 2, borderTop: "2px solid " + (isX ? (getLocked() ? "grey" : "white") : (getLocked() && partition.xLocked() ? "grey" : "white")), borderBottom: isX ? "none" : "2px solid " + (getLocked() ? "grey" : "white") }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
            <Typography> { isX ? "X" : "Y" } Scaling </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack>
                    <Stack direction="row" className="Checkbox" sx={{ ml: "-11px !important" }}>
                        <Checkbox disableRipple checked={getSplitScaling()} onChange={handleSplitScaling} />
                        <Typography> Use Split Scaling  </Typography>
                    </Stack>
                    <Stack direction="row">
                        <Typography> Scaling Increment: </Typography>
                        <TextField size="small" value={tempIncrement} onChange={handleTempIncrement} onBlur={handleIncrement} />
                    </Stack>
                    
                    <Stack direction="row" sx={{ alignItems: "center" }} spacing={2}>
                        <ToggleButtonGroup className="directionToggle" value={getDir()} exclusive onChange={handleDir}>
                            {getIcons().map((icon, i) => <ToggleButton key={i} value={i - 1}> {icon} </ToggleButton>)}
                        </ToggleButtonGroup>
                        <Typography> Scaling: { getScalingNames()[getDir() + 1] } </Typography>
                    </Stack>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}

export default PartitionPanel;
