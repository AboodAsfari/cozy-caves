import React from 'react';
import {
    Box,
    Button,
    Collapse,
    Slide,
    Snackbar,
    Stack,
    Tooltip,
} from "@mui/material";
import "../style/Toolbar.css"

import Hamburger from 'hamburger-react'
import { TransitionGroup } from 'react-transition-group';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import LoopIcon from '@mui/icons-material/Loop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DungeonBuilder from '@cozy-caves/dungeon-generation';
import MapSettingsPanel from './MapSettingsPanel';

export default function ToolBar(props) {
    const {
        zoom,
        dungeon,
        intialRender,
        mapSettings,
        setIntialRender,
        setMapSettings,
        setDungeon,
        stageRef
    } = props;

    const [open, setOpen] = React.useState(true);
    const [currPanel, setCurrPanel] = React.useState(null);
    const [loadingAnimation, setLoadingAnimation] = React.useState(false);
    const [copiedSnackbar, setCopiedSnackbar] = React.useState(false);

    React.useEffect(() => {
        if (intialRender) {
            setIntialRender(false);
            return;
        }

        requestAnimationFrame(() => {
            let viewport = stageRef.current.mountNode.containerInfo.children[0];
            if (!viewport) return;

            setLoadingAnimation(false);
            viewport.fitHeight(viewport.maxY, true, true, true);
            viewport.moveCenter(viewport.worldScreenWidth * 2, viewport.maxY/2);
            viewport.animate({position: { x: viewport.maxX/2, y: viewport.maxY/2}, time: 500});
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dungeon]);

    const regenerateMap = () => {
        const newSettings = { ...mapSettings, seed: Math.random() };
        generateMap(newSettings);
    }

    const generateMap = (newSettings) => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];
        setLoadingAnimation(true);

        function requestNewMap() {
            setDungeon(new DungeonBuilder()
                .setSeed(newSettings.seed.toString())
                .setSize(Number(newSettings.width), Number(newSettings.height))
                .setMinRoomSize(Number(newSettings.roomSize))
                .setTotalCoverage(Number(newSettings.totalCoverage))
                .build()
            );

            setMapSettings(newSettings);
        }

        viewport.animate({position: { x: -viewport.worldScreenWidth * 2, y: viewport.center.y}, time: 500, callbackOnComplete: requestNewMap});
    }

    const toggleSettings = () => {
        if (currPanel === "settings") setCurrPanel(null);
        else setCurrPanel("settings");
    }

    const copyShareLink = () => {
        let url = window.location.href;
        url += "?width=" + mapSettings.width + "&height=" + mapSettings.height + "&roomSize=" + 
            mapSettings.roomSize + "&totalCoverage=" + mapSettings.totalCoverage + "&seed=" + mapSettings.seed;
        navigator.clipboard.writeText(url);
        setCopiedSnackbar(true);
    }

    const getToolbarButtonColors = (name) => {
        if (currPanel === "settings" && name === "Settings") return "#4C9553 !important";
        return "";
    }

    const tools = {
        regenerate: { name: "Regenerate", icon: <LoopIcon />, method: regenerateMap },
        info: { name: "Info", icon: <InfoOutlinedIcon />, method: () => { } },
        settings: { name: "Settings", icon: <TuneOutlinedIcon />, method: toggleSettings },
        share: { name: "Share", icon: <ShareOutlinedIcon />, method: copyShareLink },
        download: { name: "Download", icon: <FileDownloadOutlinedIcon />, method: () => { } },
        print: { name: "Print", icon: <PrintOutlinedIcon />, method: () => { } },
    }

    return (<>
        <Box id="toolbar-toggle"> <Hamburger size={25} toggled={open} toggle={setOpen} direction="right" /> </Box>
        <Stack direction="row" sx={{ position: 'absolute', top: '70px ', right: '0', height: "100vh" }}>
            <TransitionGroup component={null} >
                <Collapse direction="left" sx={{ position: "relative"}}>
                    <RemoveIcon className="zoom-button" sx={{ right: "60px !important" }} onClick={() => zoom(2/3)} />
                    <AddIcon className="zoom-button" onClick={() => zoom(1.5)} />   
                </Collapse>

                {currPanel && <Collapse orientation='horizontal'>
                    {currPanel === "settings" &&  <MapSettingsPanel mapSettings={mapSettings} generateMap={generateMap} />}
                </Collapse>}

                {open && <Collapse orientation='horizontal'>
                    <Stack className="toolbar">
                        {Object.values(tools).map((tool) => (
                            <Tooltip key={tool.name} title={tool.name} placement="left" className="toolbar-tooltip">
                                <Button className="toolbar-button" disableRipple onClick={tool.method} sx={{ color: getToolbarButtonColors(tool.name) }}> 
                                    {tool.icon} 
                                </Button>
                            </Tooltip>
                        ))}
                    </Stack>
                </Collapse>}
            </TransitionGroup>
        </Stack>
        <Slide in={loadingAnimation} direction={loadingAnimation ? "down" : "up"}>
            <Box className="lds-dual-ring" sx={{ position: "absolute", top: "calc(50% - 100px)", right: "53%" }} />
        </Slide>
        <Snackbar
            sx={{ "& .MuiPaper-root": { fontSize: 20, backgroundColor: "#4C9553", color: "white" } }}
            open={copiedSnackbar}
            autoHideDuration={3000}
            onClose={() => setCopiedSnackbar(false)}
            message="Link Copied to Clipboard!"
            action={<CloseIcon sx={{ mt: -0.5, "&:hover": { cursor: "pointer", color: "black" } }} onClick={() => setCopiedSnackbar(false)} />}
        />
    </>);
}