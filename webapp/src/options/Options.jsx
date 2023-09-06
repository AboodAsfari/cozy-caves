import React from 'react';
import { Typography,Box, Button, TextField, Grid } from "@mui/material";
import InputSlider from './InputSlider';

const DungeonBuilder = require('@cozy-caves/dungeon-generation');

const Options = (props) => {

    // Store dungeon options
    const [dungeonWidth, setDungeonWidth] = React.useState(50);
    const [dungeonHeight, setDungeonHeight] = React.useState(50);
    const [roomSize, setMinRoomSize] = React.useState(7);
    const [totalCoverage, setTotalCoverage] = React.useState(50);
    const [dungeonSeed, setDungeonSeed] = React.useState("Cozy Cave");
    
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

    // Handle option changes
    const handleWidthChange = (event) => {
        let value = Number(event.target.value);
        setWidthValid(value >= minWidth && value <= maxWidth);
        if(!Number.isNaN(value)) setDungeonWidth(event.target.value);
    };
    const handleHeightChange = (event) => {
        let value = Number(event.target.value);
        setHeightValid(value >= minHeight && value <= maxHeight);
        if(!Number.isNaN(value)) setDungeonHeight(event.target.value);
    };
    const handleMinRoomSizeChange = (event) => {
        let value = Number(event.target.value);
        setRoomSizeValid(value >= minRoomSize && value <= maxRoomSize);
        if(!Number.isNaN(value)) setMinRoomSize(value);
    };
    const handleTotalCoverageChange = (event) => {
        let value = Number(event.target.value);
        if(Number.isNaN(value)) return; 
        value = value > 100 ? 100 : value;
        value = value < 0 ? 0 : value;
        setTotalCoverage(value);
    };
    const handleSeedChange = (event) => {
        setDungeonSeed(event.target.value);
    };

    // Create dungeon using options and set it in the parent
    const createDungeon = () => {
        let dungeonBuilder = new DungeonBuilder(dungeonSeed);
        let dungeon = dungeonBuilder
                            .setSize(Number(dungeonHeight), Number(dungeonWidth))
                            .setMinRoomSize(Number(roomSize))
                            .setTotalCoverage(Number(totalCoverage))
                            .build();
        props.setDungeon(dungeon);
        props.setActivePage("map");
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ flexGrow: 1}}>
            <Typography variant="h4" marginY={3} sx={{ textAlign: "center", color: "white" }}> Map Settings </Typography>
            <Box paddingX={3} paddingY={3} borderRadius={5} bgcolor={"black"}>
                <Grid container spacing={2}>
                    <InputSlider name="Height" xs={inputWidth} value={dungeonHeight} handleChange={handleHeightChange} min={minHeight} max={maxHeight}/>
                    <InputSlider name="Width" xs={inputWidth} value={dungeonWidth} handleChange={handleWidthChange} min={minWidth} max={maxWidth}/>  
                    <InputSlider name="Room Size" xs={inputWidth} value={roomSize} handleChange={handleMinRoomSizeChange} min={minRoomSize} max={maxRoomSize}/>
                    <InputSlider name="Floor Coverage" xs={inputWidth} value={totalCoverage} handleChange={handleTotalCoverageChange} min={0} max={100}/>
                    <Grid item xs={inputWidth}>
                        <Grid item>
                            <TextField value={dungeonSeed} label="Dungeon Seed" fullWidth onChange={handleSeedChange}/>
                        </Grid>
                        <Grid item color={"white"} textAlign={"left"}>
                            Seed for random generation <br/> (Leave blank for random seed)
                        </Grid>
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