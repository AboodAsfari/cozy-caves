import React from 'react';
import { Typography,Box, Button, TextField, Grid } from "@mui/material";

const DungeonBuilder = require('@cozy-caves/dungeon-generation');


const Options = (props) => {

    // Store dungeon options
    const [dungeonWidth, setDungeonWidth] = React.useState(50);
    const [dungeonHeight, setDungeonHeight] = React.useState(50);
    const [minRoomSize, setMinRoomSize] = React.useState(7);
    const [totalCoverage, setTotalCoverage] = React.useState(50);
    const [dungeonSeed, setDungeonSeed] = React.useState("Cozy Cave");
    
    // Options validation
    const [widthValid, setWidthValid] = React.useState(true);
    const [heightValid, setHeightValid] = React.useState(true);
    const [roomSizeValid, setRoomSizeValid] = React.useState(true);
    const [coverageValid, setCoverageValid] = React.useState(true);

    const textFieldWidth = 2;
    const descriptionWidth = 4;

    const minWidth = 2;
    const minHeight = 2;
    const maxWidth = 500;
    const maxHeight = 500;

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
        setMinRoomSize(Number(event.target.value));
    };
    const handleTotalCoverageChange = (event) => {
        setTotalCoverage(Number(event.target.value));
    };
    const handleSeedChange = (event) => {
        setDungeonSeed(event.target.value);
    };

    // Helper text for validation
    const getWidthHelperText = () => {
        return dungeonWidth > maxWidth ? "Width must be less than " + maxWidth : dungeonWidth < minWidth ? "Width must be greater than " + minWidth : "";
    };
    const getHeightHelperText = () => {
        return dungeonHeight > maxHeight ? "Height must be less than " + maxHeight : dungeonHeight < minHeight ? "Height must be greater than " + minHeight : "";
    };

    // Create dungeon using options and set it in the parent
    const createDungeon = () => {
        let dungeonBuilder = new DungeonBuilder(dungeonSeed);
        let dungeon = dungeonBuilder
                            .setSize(dungeonWidth, dungeonHeight)
                            .setMinRoomSize(minRoomSize)
                            .setTotalCoverage(totalCoverage)
                            .build();
        props.setDungeon(dungeon);
        props.setActivePage("map")
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ flexGrow: 1}}>
            <Typography variant="h4" marginY={3} sx={{ textAlign: "center", color: "white" }}> Map Settings </Typography>
            <Box paddingX={3} paddingY={3} borderRadius={5} bgcolor={"black"}>
                <Grid container spacing={2}>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonHeight} label="Dungeon Height" onChange={handleHeightChange}
                        error={!heightValid} helperText={ getHeightHelperText() }/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"}textAlign={"left"}>
                        How tall the dungeon is.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonWidth} label="Dungeon Width" onChange={handleWidthChange}
                        error={!widthValid} helperText={ getWidthHelperText() }/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"}textAlign={"left"}>
                        How wide the dungeon is.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={minRoomSize} label="Minimum Room Size" fullWidth onChange={handleMinRoomSizeChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Will be used for both the width and height of the floor. 
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={totalCoverage} label="Floor Coverage" fullWidth onChange={handleTotalCoverageChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}> 
                        Desired total percent floor coverage of the map.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonSeed} label="Dungeon Seed" fullWidth onChange={handleSeedChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Seed for random generation (Leave blank for random seed)
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