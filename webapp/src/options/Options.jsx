import React from 'react';
import { Typography,Box, Button, TextField, Grid } from "@mui/material";

const Options = (props) => {

    // Store dungeon options
    const [dungeonHeight, setDungeonHeight] = React.useState(0);
    const [dungeonWidth, setDungeonWidth] = React.useState(0);
    const [minGap, setMinGap] = React.useState(0);
    const [maxDepth, setMaxDepth] = React.useState(0);
    const [totalCoverage, setTotalCoverage] = React.useState(0);
    const [dungeonSeed, setDungeonSeed] = React.useState("");

    const textFieldWidth = 2;
    const descriptionWidth = 4;

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ flexGrow: 1}}>
            <Typography variant="h4" marginY={3} sx={{ textAlign: "center", color: "white" }}> Map Settings </Typography>
            <Box paddingX={3} paddingY={3} borderRadius={5} bgcolor={"black"}>
                <Grid container spacing={2}>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonSeed} label="Dungeon Seed"/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Seed for random generation (Leave blank for random seed)
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonHeight} label="Dungeon Height"/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"}textAlign={"left"}>
                        How many tiles tall the dungeon is.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={dungeonWidth} label="Dungeon Width"/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"}textAlign={"left"}>
                        How many tiles wide the dungeon is.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={minGap} label="Minimum Partition Gap"/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Minimum gap between two partitions (Dictates minimum room size).
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={maxDepth} label="Max Recursion Depth"/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}>
                        Maximum recursion depth for BSP.
                    </Grid>
                    <Grid item xs={textFieldWidth}>
                        <TextField value={totalCoverage} label="Floor Coverage"/>
                    </Grid>
                    <Grid item xs={descriptionWidth} color={"white"} textAlign={"left"}> 
                        Desired total percent floor coverage of the map.
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ display: "flex", justifyItems: "center" }}>
                    <Button variant="contained" sx={{minWidth:100, minHeight: 20, margin: 2}} onClick={() => props.setActivePage("map")}>
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