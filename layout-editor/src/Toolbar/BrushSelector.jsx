import React from "react";
import {
    Box,
    Menu,
    MenuItem,
    Typography
} from "@mui/material";

import "../styles/App.css";
import "../styles/MenuBar.css";

import CheckIcon from '@mui/icons-material/Check';

const BrushSelector = (props) => {
    const {
        brush,
        mr,
        setBrush,
        size
    } = props;

    const [anchorEl, setAnchorEl] = React.useState(null);

    const getBrushIcon = (brush) => {
        if (brush === "none") return "resources/tileIcons/noTileIcon.png";
        if (brush === "floor") return "resources/tileIcons/floorIcon.png";
        if (brush === "wall") return "resources/tileIcons/wallIcon.png";
    }

    return (
        <>
            <Box className="PenBrushIcon" sx={{ width: size, height: size, mr: mr }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                <img className="PixelArt" src={getBrushIcon(brush)} alt="brush selector" style={{ width: "100%", height: "100%" }} />
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
        <MenuItem onClick={() => { setBrush(brushName); handleClose(); }} className="MenuItem" sx={{ minWidth: 140 }} disableRipple>
            <img className="PixelArt" src={getBrushIcon(brushName)} alt="brush selector" style={{ width: "20px", height: "100%" }} />
            <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> {brushName[0].toUpperCase() + brushName.slice(1).toLowerCase()} </Typography>
            {brush === brushName && <CheckIcon />}
        </MenuItem>
    );
}

export default BrushSelector;
