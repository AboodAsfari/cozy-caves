import React from 'react';
import {
    Box,
    Button,
    Collapse,
    Dialog,
    DialogTitle,
    Slide,
    Snackbar,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import "../style/Toolbar.css"

import Hamburger from 'hamburger-react'
import { TransitionGroup } from 'react-transition-group';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CenterFocusStrongSharpIcon from '@mui/icons-material/CenterFocusStrongSharp';
import CloseIcon from '@mui/icons-material/Close';
import LoopIcon from '@mui/icons-material/Loop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DungeonBuilder from '@cozy-caves/dungeon-generation';
import MapSettingsPanel from './MapSettingsPanel';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import ImageIcon from '@mui/icons-material/Image';

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
    const [centeringAnimation, setCenteringAnimation] = React.useState(false);
    const [copiedSnackbar, setCopiedSnackbar] = React.useState(false);
    const [downloadDialog, setDownloadDialog] = React.useState(false);
    const [downloadLabel, setDownloadLabel] = React.useState("...");
    
    const [downloadFileContents, setDownloadFileContents] = React.useState(null);
    const [downloadImageContents, setDownloadImageContents] = React.useState(null);

    React.useEffect(() => {
        getFileContents(false).then(fileContents => setDownloadFileContents(fileContents));

        if (intialRender) {
            setIntialRender(false);
            return;
        }

        requestAnimationFrame(() => {
            let viewport = stageRef.current.mountNode.containerInfo.children[0];
            if (!viewport) return;

            setLoadingAnimation(false);
            // Check if the image is taller than it is wide
            let fitYAxis = viewport.maxY/viewport.maxX > viewport.screenHeight/viewport.screenWidth;
            // Update the amount the user can zoom out by
            viewport.plugins.plugins["clamp-zoom"].options.minScale =  (fitYAxis ? (viewport.screenHeight-70)/viewport.maxY : viewport.screenWidth/viewport.maxX) / 1.5;
            // Fit the image to the screen
            if(fitYAxis){
                // Account for Navbar
                viewport.setZoom(((viewport.screenHeight-70)/viewport.maxY)/1.1, true, true, true);
            } else {
                viewport.fitWidth(viewport.maxX*1.1, true, true, true);
            }
            // Find the height of the image after fitting
            // This is used to center the image
            // Account for Navbar
            let fitHeight = viewport.screenHeight/((viewport.screenHeight+70)/viewport.maxY);
            // Move into correct position before animation
            viewport.moveCenter(viewport.worldScreenWidth * 2, fitHeight/2);
            // Move to center of screen
            viewport.animate({position: { x: viewport.maxX/2, y: fitHeight/2}, time: 500, ease: "easeOutCubic"});
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dungeon]);

    const regenerateMap = () => {
        const newSettings = { ...mapSettings, seed: Math.random() };
        generateMap(newSettings);
    }

    const generateMap = (newSettings) => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];
        setTimeout(() => setLoadingAnimation(true), 150);

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

        viewport.animate({position: { x: -viewport.worldScreenWidth * 2, y: viewport.center.y}, time: 500, ease: "easeInCubic", callbackOnComplete: requestNewMap});
    }

    const loadMap = (dungeonData, newSettings) => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];
        setLoadingAnimation(true);

        function requestNewMap() {
            setDungeon(dungeonData);
            setMapSettings(newSettings);
        }

        viewport.animate({position: { x: -viewport.worldScreenWidth * 2, y: viewport.center.y}, time: 500, callbackOnComplete: requestNewMap});
    }
    
    const printMap = () => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];
        if (!viewport) return;
        let width = viewport.worldScreenWidth, height = viewport.worldScreenHeight, center = viewport.center;
        centerMap();    
        setTimeout(async function(){
            if (!stageRef.current) return;
            const WinPrint = window.open('', '', "left=0,top=0,width="+window.screen.width+",height="+window.screen.height+",toolbar=0,scrollbars=0,status=0");
            let canvasImage = await stageRef.current.app.renderer.extract.image(stageRef.current.app.stage);
            viewport.moveCenter(center.x, center.y);
            viewport.fit(true, width, height);
            if(!WinPrint) {
                return;
            }
            WinPrint.document.write('<img src="'+canvasImage.src+'"/>');
            WinPrint.document.close();  
            WinPrint.focus();
            WinPrint.print();
            WinPrint.close();
        }, 500);   
    }

    const centerMap = () => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];
        if (!viewport || loadingAnimation || centeringAnimation) return;
        setCenteringAnimation(true);
        const fitYAxis = viewport.maxY/viewport.maxX > viewport.screenHeight/viewport.screenWidth;
        let position= { x: viewport.maxX/2, y: (viewport.screenHeight/((viewport.screenHeight+70)/viewport.maxY))/2};
        let scale = (fitYAxis ? (viewport.screenHeight-70)/viewport.maxY : viewport.screenWidth/viewport.maxX) / 1.5;
        viewport.animate({position: position, scale: scale, time: 500, ease: "easeInOutCubic"});
        setTimeout(() => setCenteringAnimation(false), 500);
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

    const openDownloadDialog = () => {
        getFileContents(true).then(fileContents => setDownloadImageContents(fileContents));
        setDownloadDialog(true);
    }

    const getFileContents = async (isImage = false) => {
        if (isImage) return (await stageRef.current.app.renderer.extract.image(stageRef.current.app.stage)).src;
        else {
            let serializableDungeon = { 
                mapSettings: mapSettings,
                dungeon: dungeon.map((room) => room.getSerializableRoom())
            };

            let serializedDungeon = JSON.stringify(serializableDungeon, null, 4);
            return "data:text/plain;charset=utf-8," + serializedDungeon;
        }
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
        download: { name: "Download", icon: <FileDownloadOutlinedIcon id="download" />, method: openDownloadDialog },
        print: { name: "Print", icon: <PrintOutlinedIcon />, method: printMap },
    }

    return (<>
        <Box id="toolbar-toggle"> <Hamburger size={25} toggled={open} toggle={setOpen} direction="right" /> </Box>
        <Stack direction="row" sx={{ position: 'absolute', top: '70px ', right: '0', height: "100vh" }}>
            <TransitionGroup component={null} >
                <Collapse direction="left" sx={{ position: "relative"}}>
                    <RemoveIcon className="zoom-button" sx={{ right: "92px !important" }} onClick={() => zoom(2/3)} />
                    <AddIcon className="zoom-button"sx={{ right: "52px !important" }} onClick={() => zoom(1.5)} />   
                    <CenterFocusStrongSharpIcon className="zoom-button" sx={{ fontSize: "37px !important", bottom: "83px !important" }} onClick={() => centerMap()} /> 
                </Collapse>

                {currPanel && <Collapse orientation='horizontal'>
                    {currPanel === "settings" &&  <MapSettingsPanel mapSettings={mapSettings} generateMap={generateMap} loadMap={loadMap} />}
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

        <Dialog open={downloadDialog} onClose={() => setDownloadDialog(false)}>
            <DialogTitle sx={{ fontSize: 50, px: 10, userSelect: "none" }}> Download Map </DialogTitle>
            <Stack direction="row" sx={{ alignSelf: "center" }} spacing={5} onMouseOut={() => setDownloadLabel("...")}>
                <a href={downloadImageContents} download={"cozy-map.png"} onMouseOver={() => setDownloadLabel("Download as Image")}> 
                    <ImageIcon sx={{ fontSize: 100, color: "white", "&:hover": { cursor: "pointer", color: "#4C9553" } }} />
                </a>

                <a href={downloadFileContents} download={"cozy-map.json"} onMouseOver={() => setDownloadLabel("Download as Loadable File")}> 
                    <FilePresentIcon sx={{ fontSize: 100, color: "white", "&:hover": { cursor: "pointer", color: "#4C9553" } }} />
                </a>
            </Stack>
            <Typography sx={{ fontSize: 30, pb: 2, visibility: downloadLabel !== "..." ? "visible" : "hidden" }}>{downloadLabel} </Typography>
            <CloseIcon sx={{ position: "absolute", top: "5px", right: "5px", "&:hover": {color: "#9B55C6", cursor: "pointer"}}} onClick={() => setDownloadDialog(false)}/>
        </Dialog>

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