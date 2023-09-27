import React from 'react';
import {
    Box,
    Button,
    Menu,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "../style/Toolbar.css"

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import DungeonBuilder from '@cozy-caves/dungeon-generation';
import SettingsDropdownItem from '../options/SettingsDropdownItem';
import SettingsSlider from '../options/SettingsSlider';
import { Room } from '@cozy-caves/room-generation';

const MapSettingsPanel = (props) => {
    const {
        generateMap,
        loadMap,
        mapSettings
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

    React.useEffect(() => {
        if (!mapSettings) return;
        setPresetSelected(mapSettings.preset);
        setWidth(mapSettings.width);
        setHeight(mapSettings.height);
        setRoomSize(mapSettings.roomSize);
        setTotalCoverage(mapSettings.totalCoverage);
        setSeed(mapSettings.seed);
    }, [mapSettings]);

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

    const declareEdited = () => { if (presetSelected !== "Custom") setPresetSelected("Custom"); }

    const loadFile = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.click();

        input.addEventListener("change", () => {
            let file = input.files[0];
            if (file) {
                let reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = e => {
                    let fileContents = e.target.result;
                    let mapInfo = JSON.parse(fileContents);

                    let newMap = mapInfo.dungeon.map(room => Room.fromSerializableRoom(room));
                    loadMap(newMap, mapInfo.mapSettings);
                }
            }
        });
    }

    const generate = () => {
        if (!widthValid || !heightValid || !roomSizeValid || !coverageValid) return;
        const newSettings = {
            preset: presetSelected,
            width: Math.max(roomSize, width),
            height: Math.max(roomSize, height),
            roomSize: roomSize,
            totalCoverage: totalCoverage,
            seed: seed
        }
        generateMap(newSettings);
    }

    return (
        <Stack sx={{ backgroundColor: "rgba(0,0,0,0.9)", width: "250px", height: "calc(100vh - 70px)", pt: 1, px: 2, alignItems: "left" }}>
            <Typography sx={{ fontSize: 35, textAlign: "left", userSelect: "none" }}> Map Settings </Typography> 
            <Button className="settings-dropdown" disableRipple onClick={(e) => setPresetAnchor(e.currentTarget)}
                endIcon={<KeyboardArrowDownIcon sx={{ transform: presetAnchor ? "rotate(0deg)" : "rotate(-90deg)", transition: "all 0.2s" }} />}>
                <Typography sx={{ color: "white", fontSize: 25, userSelect: "none" }}> Preset: {presetSelected} </Typography>
            </Button>

            <SettingsSlider name="Width" value={Math.max(roomSize, width)} setValue={setWidth} min={5} max={200} setValid={setWidthValid} declareEdited={declareEdited} />
            <SettingsSlider name="Height" value={Math.max(roomSize, height)} setValue={setHeight} min={5} max={200} setValid={setHeightValid} declareEdited={declareEdited} />
            <SettingsSlider name="Room Size" value={roomSize} setValue={setRoomSize} min={6} max={15} setValid={setRoomSizeValid} declareEdited={declareEdited} />
            <SettingsSlider name="Room Density" value={totalCoverage} setValue={setTotalCoverage} min={0} max={100} setValid={setCoverageValid} declareEdited={declareEdited} />
            <Stack direction="row" className="settings-text-field">
                <Typography> Seed: </Typography>
                <TextField size="small" value={seed} onChange={(e) => { setSeed(e.target.value); declareEdited(); } } sx={{ width: "100% !important", mt: "4px" }} inputProps={{ style: { fontSize: 22 } }} />
                <ShuffleIcon sx={{ mt: 0.7, "&:hover": { cursor: "pointer", color: "#4C9553" } }} onClick={() => setSeed(Math.random())} />
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            <Button disableRipple className="settings-button" sx={{ backgroundColor: "white", mb: 1, "&:hover": { backgroundColor: "#9B55C6" } }} onClick={loadFile}> Load File </Button>
            <Button disableRipple className="settings-button" sx={{ backgroundColor: !widthValid || !heightValid || !roomSizeValid || !coverageValid ? "grey" : "#4C9553", mb: 2.5, color: "white", "&:hover": { backgroundColor: "#9B55C6" } }} 
                disabled={!widthValid || !heightValid || !roomSizeValid || !coverageValid} onClick={generate}> Generate </Button>

            <Menu anchorEl={presetAnchor} open={!!presetAnchor} onClose={() => setPresetAnchor(null)}
                sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#4C9553" }, mt: 0.7 }}>
                <SettingsDropdownItem name="Small" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
                <SettingsDropdownItem name="Medium" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
                <SettingsDropdownItem name="Large" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
                <SettingsDropdownItem name="Custom" setValue={setPreset} value={presetSelected} handleClose={() => setPresetAnchor(null)} />
            </Menu>
        </Stack>
    );
}

export default MapSettingsPanel;
