import React from 'react';
import { Typography,Box, Button, TextField, Grid, Select, MenuItem, FormControl } from "@mui/material";
import InputSlider from './InputSlider';

const DungeonBuilder = require('@cozy-caves/dungeon-generation');

const Options = (props) => {

    // Store dungeon options
    const [dungeonWidth, setDungeonWidth] = React.useState(50);
    const [dungeonHeight, setDungeonHeight] = React.useState(50);
    const [roomSize, setMinRoomSize] = React.useState(7);
    const [totalCoverage, setTotalCoverage] = React.useState(50);
    const [dungeonSeed, setDungeonSeed] = React.useState("Cozy Cave");

    const [presetSelected, setPresetSelected] = React.useState("Small");
    
    // Options validation
        <Grid item></Grid>
    const [widthValid, setWidthValid] = React.useState(true);
    const [heightValid, setHeightValid] = React.useState(true);
    const [roomSizeValid, setRoomSizeValid] = React.useState(true);
    const [coverageValid, setCoverageValid] = React.useState(true);

    const minWidth = 5;
    const minHeight = 5;
    const minRoomSize = 6;

    const maxWidth = 200;
    const maxHeight = 200;
    const maxRoomSize = 15;

    const inputWidth = 3;

    const presets = [
        "Small",
        "Medium",
        "Large",
        "Custom"
    ];

    // Handle option changes
    const handleInputChange = (event, eventProps) => {
        let value = Number(event.target.value);
        eventProps.setValid(value >= eventProps.min && value <= eventProps.max);
        if(!Number.isNaN(value)) eventProps.setValue(value);
        setPresetSelected("Custom");
    };

    const handleSeedChange = (event) => {
        setDungeonSeed(event.target.value);
    };

    const handlePresetChange = (event) => {
        setPresetSelected(event.target.value);
    };

    // Create dungeon using options and set it in the parent
    const createDungeon = () => {
        let dungeonBuilder = new DungeonBuilder();
        let dungeon;
        if(presetSelected !== "Custom") {
            dungeon = dungeonBuilder.setPreset(presetSelected).build();
        } else {
            dungeon = dungeonBuilder
                                .setSeed(dungeonSeed)
                                .setSize(Number(dungeonHeight), Number(dungeonWidth))
                                .setMinRoomSize(Number(roomSize))
                                .setTotalCoverage(Number(totalCoverage))
                                .build();
        }
        props.setDungeon(dungeon);
        props.setActivePage("map");
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ flexGrow: 1}}>
            <Typography variant="h4" marginY={3} sx={{ textAlign: "center", color: "white" }}> Map Settings </Typography>
            <Box paddingX={3} paddingY={3} borderRadius={5} bgcolor={"black"}>
                <Grid container spacing={3}>
                    <InputSlider name="Height" xs={inputWidth} value={dungeonHeight} min={minHeight} max={maxHeight}
                        handleChange={(e) => handleInputChange(e, {value: dungeonHeight, setValue: setDungeonHeight, setValid: setHeightValid, min: minHeight, max: maxHeight})}
                    />
                    <InputSlider name="Width" xs={inputWidth} value={dungeonWidth} min={minWidth} max={maxWidth}
                        handleChange={(e) => handleInputChange(e, {value: dungeonWidth, setValue: setDungeonWidth, setValid: setWidthValid, min: minWidth, max: maxWidth})}
                    />  
                    <InputSlider name="Room Size" xs={inputWidth} value={roomSize} min={minRoomSize} max={maxRoomSize}
                        handleChange={(e) => handleInputChange(e, {value: roomSize, setValue: setMinRoomSize, setValid: setRoomSizeValid, min: minRoomSize, max: maxRoomSize})}
                    />
                    <InputSlider name="Floor Coverage" xs={inputWidth} value={totalCoverage} 
                        handleChange={(e) => handleInputChange(e, {value: totalCoverage, setValue: setTotalCoverage, setValid: setCoverageValid, min: 0, max: 100})} min={0} max={100}
                    />
                    <Grid item xs={inputWidth}>
                        <Grid item>
                            <TextField value={dungeonSeed} label="Dungeon Seed" fullWidth onChange={handleSeedChange}/>
                        </Grid>
                        <Grid item color={"white"} textAlign={"left"}>
                            Seed for random generation <br/> (Leave blank for random seed)
                        </Grid>
                    </Grid>
                    <Grid item xs={inputWidth} textAlign={"left"}>
                        <Select
                            fullWidth
                            labelId="preset-select-label"
                            id="preset-select"
                            value={presetSelected}
                            label="Preset"
                            onChange={handlePresetChange}
                        >
                            {presets.map((preset) => (  
                                <MenuItem
                                    key={preset} 
                                    value={preset}
                                >
                                    {preset}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ display: "flex", justifyItems: "center" }}>
                    <Button variant="contained" sx={{minWidth:100, minHeight: 20, margin: 2}} disabled={!widthValid || !heightValid} onClick={createDungeon}>
                        <Typography variant="h4" >Create</Typography>
                    </Button>
                    <Button variant="contained" sx={{minWidth:100, minHeight: 50, margin: 2}} onClick={() => props.setActivePage("home")}>
                        <Typography variant="h4" >Back</Typography>
                    </Button>
                </Box>
        </Box>
    );
};

export default Options;