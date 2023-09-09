import React from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Slider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "../style/Toolbar.css"

import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShuffleIcon from '@mui/icons-material/Shuffle';

const MapSettingsPanel = () => {
    const [presetAnchor, setPresetAnchor] = React.useState(null);
    
    const [presetSelected, setPresetSelected] = React.useState("Custom");
    const [width, setWidth] = React.useState(50);
    const [height, setHeight] = React.useState(50);
    const [roomSize, setRoomSize] = React.useState(7);
    const [totalCoverage, setTotalCoverage] = React.useState(50);
    const [seed, setSeed] = React.useState("Cozy Cave");

    return (
        <Stack sx={{ backgroundColor: "rgba(0,0,0,0.9)", width: "250px", height: "calc(100vh - 70px)", pt: 1, px: 2, alignItems: "left" }}>
            <Typography sx={{ fontSize: 35, textAlign: "left", userSelect: "none" }}> Map Settings </Typography> 
            <Button className="settings-dropdown" disableRipple onClick={(e) => setPresetAnchor(e.currentTarget)}
                endIcon={<KeyboardArrowDownIcon sx={{ transform: presetAnchor ? "rotate(0deg)" : "rotate(-90deg)", transition: "all 0.2s" }} />}>
                <Typography sx={{ color: "white", fontSize: 25, userSelect: "none" }}> Preset: {presetSelected} </Typography>
            </Button>

            <SettingsSlider name="Width" value={width} setValue={setWidth} min={5} max={200} />
            <SettingsSlider name="Height" value={height} setValue={setHeight} min={5} max={200} />
            <SettingsSlider name="Room Size" value={roomSize} setValue={setRoomSize} min={6} max={15} />
            <SettingsSlider name="Room Density" value={totalCoverage} setValue={setTotalCoverage} min={0} max={100} />
            <Stack direction="row" className="settings-text-field">
                <Typography> Seed: </Typography>
                <TextField size="small" value={seed} onChange={(e) => setSeed(e.target.value)} sx={{ width: "100% !important", mt: "4px" }} inputProps={{ style: { fontSize: 22 } }} />
                <ShuffleIcon sx={{ mt: 0.7, "&:hover": { cursor: "pointer", color: "#4C9553" } }} onClick={() => setSeed(Math.random())} />
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            <Button disableRipple className="settings-button" sx={{ backgroundColor: "white", mb: 1, "&:hover": { backgroundColor: "#9B55C6" } }}> Load File </Button>
            <Button disableRipple className="settings-button" sx={{ backgroundColor: "#4C9553", mb: 2.5, color: "white", "&:hover": { backgroundColor: "#9B55C6" } }}> Generate </Button>

            <Menu anchorEl={presetAnchor} open={!!presetAnchor} onClose={() => setPresetAnchor(null)}
                sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#4C9553" }, mt: 0.7 }}>
                <DropdownItem name="Small" setValue={setPresetSelected} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
                <DropdownItem name="Medium" setValue={setPresetSelected} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
                <DropdownItem name="Large" setValue={setPresetSelected} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
                <DropdownItem name="Custom" setValue={setPresetSelected} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
            </Menu>
        </Stack>
    );
}

const SettingsSlider = (props) => {
    const {
        max,
        min,
        name,
        setValue,
        value
    } = props;

    const handleChange = (e) => {
        if (e.target.value.length > 0 && (isNaN(e.target.value) || parseInt(e.target.value).toString() !== e.target.value)) return;
        setValue(e.target.value);
    }

    const isValid = () => {
        return value >= min && value <= max;
    }

    return (
        <Stack>
            <Stack direction="row" className="settings-text-field">
                <Typography sx={{ color: isValid() ? "white" : "#d4242c !important"}}> {name}: </Typography>
                <TextField size="small" value={value} onChange={handleChange} inputProps={{ style: { color: isValid() ? "" : "#d4242c" } }} />
            </Stack>
            <Slider className="settings-slider" value={isNaN(parseInt(value)) ? min : parseInt(value)} onChange={(e) => setValue(e.target.value)} name={name} min={min} max={max}/>
        </Stack>
    );
}

const DropdownItem = (props) => {
    const {
        name,
        handleClose,
        setValue,
        value,
    } = props;

    return (
        <MenuItem onClick={() => { setValue(name); handleClose(); }} sx={{ minWidth: 140, py: "3px !important" }} disableRipple>
            <Typography sx={{ mr: 3, mt: 0.5, fontSize: 18 }}> {name} </Typography>
            {value === name && <CheckIcon />}
        </MenuItem>
    );
}

export default MapSettingsPanel;
