import React from 'react';
import { Typography,Box, Button, TextField, Grid } from "@mui/material";

const DungeonBuilder = require('@cozy-caves/dungeon-generation');


const Options = (props) => {

    // Store dungeon options
    const [dungeonHeight, setDungeonHeight] = React.useState(50);
    const [dungeonWidth, setDungeonWidth] = React.useState(50);
    const [minGap, setMinGap] = React.useState(5);
    const [maxDepth, setMaxDepth] = React.useState(5);
    const [totalCoverage, setTotalCoverage] = React.useState(50);
    const [dungeonSeed, setDungeonSeed] = React.useState("Cozy Cave");
    
    const textFieldWidth = 2;
    const descriptionWidth = 4;

    const handleHeightChange = (event) => {
        setDungeonHeight(Number(event.target.value));
    };
    const handleWidthChange = (event) => {
        setDungeonWidth(Number(event.target.value));
    };
    const handleMinGapChange = (event) => {
        setMinGap(Number(event.target.value));
    };
    const handleMaxDepthChange = (event) => {
        setMaxDepth(Number(event.target.value));
    };
    const handleTotalCoverageChange = (event) => {
        setTotalCoverage(Number(event.target.value));
    };
    const handleSeedChange = (event) => {
        setDungeonSeed(event.target.value);
    };


    // Create dungeon using options and set it in the parent
    const createDungeon = () => {
        let dungeonBuilder = new DungeonBuilder(dungeonSeed);
        let dungeon = dungeonBuilder
                            .setSize(dungeonWidth, dungeonHeight)
                            .setMinGap(minGap)
                            .setMaxDepth(maxDepth)
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
                        <TextField value={dungeonHeight} label="Dungeon Height" fullWidth onChange={handleHeightChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"}textAlign={"left"}>
                        How many tiles tall the dungeon is.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonWidth} label="Dungeon Width" fullWidth onChange={handleWidthChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"}textAlign={"left"}>
                        How many tiles wide the dungeon is.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={minGap} label="Minimum Partition Gap" fullWidth onChange={handleMinGapChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Minimum gap between two partitions (Dictates minimum room size).
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={maxDepth} label="Max Recursion Depth" fullWidth onChange={handleMaxDepthChange}/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Maximum recursion depth for BSP.
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
                    <Button variant="contained" sx={{minWidth:100, minHeight: 20, margin: 2}} onClick={createDungeon}>
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