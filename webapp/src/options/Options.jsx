import React from 'react';
import { Typography,Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, Stack, Slider, Menu } from "@mui/material";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CheckIcon from '@mui/icons-material/Check';

const DungeonBuilder = require('@cozy-caves/dungeon-generation');

const Options = (props) => {
    const {
        open,
        setActivePage
    } = props;

    const [presetAnchor, setPresetAnchor] = React.useState(null);
    
    const [presetSelected, setPresetSelected] = React.useState("Custom");
    const [width, setWidth] = React.useState(50);
    const [height, setHeight] = React.useState(50);
    const [roomSize, setRoomSize] = React.useState(7);
    const [totalCoverage, setTotalCoverage] = React.useState(50);
    const [seed, setSeed] = React.useState("Cozy Cave");

    const [widthValid, setWidthValid] = React.useState(true);
    const [heightValid, setHeightValid] = React.useState(true);
    const [roomSizeValid, setRoomSizeValid] = React.useState(true);
    const [coverageValid, setCoverageValid] = React.useState(true);

    const declareEdited = () => { if (presetSelected !== "Custom") setPresetSelected("Custom"); }

    const setPreset = (preset) => {
        setPresetSelected(preset);
        if (preset !== "Custom") {
            let presetSettings = new DungeonBuilder().getPresets()[preset];
            setWidth(presetSettings[0]);
            setHeight(presetSettings[1]);
            setRoomSize(presetSettings[2]);
            setTotalCoverage(presetSettings[3]);
            setSeed(Math.random());
        }   
    }

    const generate = () => {
        props.setMapSettings({
            preset: presetSelected,
            seed: seed,
            width: width,
            height: height,
            roomSize: roomSize,
            totalCoverage: totalCoverage
        });

        props.setDungeon(new DungeonBuilder()
            .setSeed(seed)
            .setSize(Number(width), Number(height))
            .setMinRoomSize(Number(roomSize))
            .setTotalCoverage(Number(totalCoverage))
            .build()
        );

        props.setActivePage("map");
    }

    return (
        <>
        <Dialog fullWidth open={open} onClose={() => setActivePage("home")} sx={{ "& .MuiDialog-paper": { backgroundColor: "black" }, 
            "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                    width: "100%",
                    maxWidth: "750px",
                },
            } }}
        >
            <DialogTitle sx={{ fontSize: 50, mb: 1 }}> Map Generation Options </DialogTitle>
            <DialogContent sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={5} sx={{ justifyContent: "center" }}>
                    <Stack>
                        <SettingsSlider name="Width" value={width} setValue={setWidth} min={5} max={200} setValid={setWidthValid} declareEdited={declareEdited} />
                        <SettingsSlider name="Height" value={height} setValue={setHeight} min={5} max={200} setValid={setHeightValid} declareEdited={declareEdited} />
                        <SettingsSlider name="Room Size" value={roomSize} setValue={setRoomSize} min={6} max={15} setValid={setRoomSizeValid} declareEdited={declareEdited} />
                        <SettingsSlider name="Room Density" value={totalCoverage} setValue={setTotalCoverage} min={0} max={100} setValid={setCoverageValid} declareEdited={declareEdited} />
                    </Stack>

                    <Stack>
                        <Button className="settings-dropdown" disableRipple onClick={(e) => setPresetAnchor(e.currentTarget)} sx={{ "&:hover": { backgroundColor: "transparent" } }}
                            endIcon={<KeyboardArrowDownIcon sx={{ transform: presetAnchor ? "rotate(0deg)" : "rotate(-90deg)", transition: "all 0.2s" }} />}>
                            <Typography sx={{ color: "white", fontSize: 25, userSelect: "none" }}> Preset: {presetSelected} </Typography>
                        </Button>

                        <Stack direction="row" className="settings-text-field" sx={{ mt: 0 }}>
                            <Typography> Seed: </Typography>
                            <TextField size="small" value={seed} onChange={(e) => { setSeed(e.target.value); declareEdited(); } } sx={{ width: "100% !important", mt: "4px" }} inputProps={{ style: { fontSize: 22 } }} />
                            <ShuffleIcon sx={{ mt: 0.7, "&:hover": { cursor: "pointer", color: "#4C9553" } }} onClick={() => setSeed(Math.random())} />
                        </Stack>

                        <Box sx={{ flexGrow: 1 }} />
                        <Button disableRipple className="settings-button" sx={{ backgroundColor: "white", mb: 1, "&:hover": { backgroundColor: "#9B55C6" } }}> Load File </Button>
                        <Button disableRipple className="settings-button" sx={{ backgroundColor: !widthValid || !heightValid || !roomSizeValid || !coverageValid ? "grey" : "#4C9553", mb: 1.5, color: "white", "&:hover": { backgroundColor: "#9B55C6" } }} 
                            disabled={!widthValid || !heightValid || !roomSizeValid || !coverageValid} onClick={generate}> Generate </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
        <Menu anchorEl={presetAnchor} open={!!presetAnchor} onClose={() => setPresetAnchor(null)}
            sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#4C9553" }, mt: 0.7 }}>
            <DropdownItem name="Small" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
            <DropdownItem name="Medium" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
            <DropdownItem name="Large" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
            <DropdownItem name="Custom" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
        </Menu>
        </>
    );
};

const SettingsSlider = (props) => {
    const {
        declareEdited,
        max,
        min,
        name,
        setValid,
        setValue,
        value
    } = props;

    const handleChange = (e) => {
        if (e.target.value.length > 0 && (isNaN(e.target.value) || parseInt(e.target.value).toString() !== e.target.value)) return;
        declareEdited();
        console.log(value);
        setValid(isValid(e.target.value));
        setValue(e.target.value);
    }

    const isValid = (checkValue = value) => checkValue >= min && checkValue <= max;

    return (
        <Stack>
            <Stack direction="row" className="settings-text-field">
                <Typography sx={{ color: isValid() ? "white" : "#d4242c !important"}}> {name}: </Typography>
                <TextField size="small" value={value} onChange={handleChange} inputProps={{ style: { color: isValid() ? "" : "#d4242c" } }} />
            </Stack>
            <Slider className="settings-slider" value={isNaN(parseInt(value)) ? min : parseInt(value)} 
                onChange={(e) => { setValue(e.target.value); declareEdited(); } } name={name} min={min} max={max}/>
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

export default Options;