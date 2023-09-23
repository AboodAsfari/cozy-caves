import React from 'react';
import {
    Box,
    Button,
    Collapse,
    Dialog,
    DialogTitle,
    Grow,
    Popper,
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
        dungeon,
        mapSettings,
        pixiApp,
        setMapSettings,
        setDungeon,
        viewport
    } = props;

    const [open, setOpen] = React.useState(true);
    const [currPanel, setCurrPanel] = React.useState(null);
    const [loadingAnimation, setLoadingAnimation] = React.useState(false);
    const [copiedSnackbar, setCopiedSnackbar] = React.useState(false);
    const [downloadLabel, setDownloadLabel] = React.useState("Download");

    const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
    const [downloadMenuAnchor, setDownloadMenuAnchor] = React.useState(null);
    
    const [downloadFileContents, setDownloadFileContents] = React.useState(null);
    const [downloadImageContents, setDownloadImageContents] = React.useState(null);

    React.useEffect(() => setLoadingAnimation(false), [dungeon]);

    const regenerateMap = () => {
        const newSettings = { ...mapSettings, seed: Math.random() };
        generateMap(newSettings);
    }

    const generateMap = (newSettings) => {
        function requestNewMap() {
            setLoadingAnimation(true);
            
            setDungeon(new DungeonBuilder()
                .setSeed(newSettings.seed.toString())
                .setSize(Number(newSettings.width), Number(newSettings.height))
                .setMinRoomSize(Number(newSettings.roomSize))
                .setTotalCoverage(Number(newSettings.totalCoverage))
                .build()    
            );

            setMapSettings(newSettings);
        }

        viewport.current.resetCamera(true, 250, () => {
            setTimeout(() => setLoadingAnimation(true), 150);

            viewport.current.animate({
                position: { x: -viewport.current.worldScreenWidth * 2, y: viewport.current.center.y}, 
                time: 500, 
                ease: "easeInCubic", 
                callbackOnComplete: requestNewMap
            });
        });
    }

    const loadMap = (dungeonData, newSettings) => {
        function requestNewMap() {
            setLoadingAnimation(true);
            
            setDungeon(dungeonData);
            setMapSettings(newSettings);
        }

        viewport.current.resetCamera(true, 250, () => {
            setTimeout(() => setLoadingAnimation(true), 150);

            viewport.current.animate({
                position: { x: -viewport.current.worldScreenWidth * 2, y: viewport.current.center.y}, 
                time: 500, 
                ease: "easeInCubic", 
                callbackOnComplete: requestNewMap
            });
        });
    }
    
    const printMap = async () => {
        let width = viewport.current.worldScreenWidth;
        let height = viewport.current.worldScreenHeight;
        let center = viewport.current.center;

        viewport.current.resetCamera(); 

        const printingTab = window.open("", "", "");
        setTimeout(async function(){
            let canvasImage = await pixiApp.current.renderer.extract.image(pixiApp.current.stage);
            viewport.current.moveCenter(center.x, center.y);
            viewport.current.fit(true, width, height);
            if(!printingTab) return;
            printingTab.document.write('<img src="'+canvasImage.src+'"/>');
            printingTab.document.close();  
            printingTab.focus();
            printingTab.print();
            printingTab.close();
        }, 100);   
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

    const getFileContents = async (isImage = false) => {
        if (isImage) return (await pixiApp.current.renderer.extract.image(pixiApp.current.stage)).src;
        else {
            let serializableDungeon = { 
                mapSettings: mapSettings,
                dungeon: dungeon.map((room) => room.getSerializableRoom())
            };

            let serializedDungeon = JSON.stringify(serializableDungeon, null, 4);
            return "data:text/plain;charset=utf-8," + serializedDungeon;
        }
    }

    const toolHover = (e, name) => {
        if (name === "Download") {
            getFileContents(false).then(fileContents => setDownloadFileContents(fileContents));
            getFileContents(true).then(fileContents => setDownloadImageContents(fileContents));
            setDownloadMenuAnchor(e.currentTarget);
            setDownloadMenuOpen(true);
        }
    }

    const toolHoverOut = (e, name) => {
        if (name === "Download") setDownloadMenuOpen(false);
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
        download: { name: "Download", icon: <FileDownloadOutlinedIcon id="download" /> },
        print: { name: "Print", icon: <PrintOutlinedIcon />, method: printMap },
    }

    return (<>
        <Box id="toolbar-toggle"> <Hamburger size={25} toggled={open} toggle={setOpen} direction="right" /> </Box>
        <Stack direction="row" sx={{ position: 'absolute', top: '70px ', right: '0', height: "100vh" }}>
            <TransitionGroup component={null} >
                <Collapse direction="left" sx={{ position: "relative"}}>
                    <RemoveIcon className="zoom-button" sx={{ right: "92px !important" }} onClick={() => viewport.current.scaleZoom(2/3)} />
                    <AddIcon className="zoom-button"sx={{ right: "52px !important" }} onClick={() => viewport.current.scaleZoom(1.5)} />   
                    <CenterFocusStrongSharpIcon className="zoom-button" sx={{ fontSize: "37px !important", bottom: "83px !important" }} onClick={() => viewport.current.resetCamera(true)} /> 
                </Collapse>

                {currPanel && <Collapse orientation='horizontal'>
                    {currPanel === "settings" &&  <MapSettingsPanel mapSettings={mapSettings} generateMap={generateMap} loadMap={loadMap} />}
                </Collapse>}

                {open && <Collapse orientation='horizontal'>
                    <Stack className="toolbar">
                        {Object.values(tools).map((tool) => (
                            <Tooltip key={tool.name} title={tool.name === "Download" ? "" : tool.name} placement="left" className="toolbar-tooltip">
                                <Button className="toolbar-button" disableRipple onMouseEnter={(e) => toolHover(e, tool.name)} onMouseLeave={(e) => toolHoverOut(e, tool.name)}
                                    onClick={tool.method} sx={{ color: getToolbarButtonColors(tool.name) }}> 
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

        <Popper anchorEl={downloadMenuAnchor} open={downloadMenuOpen} onMouseEnter={() => setDownloadMenuOpen(true)} 
            onMouseLeave={() => setDownloadMenuOpen(false)} onClose={() => setDownloadMenuOpen(false)} placement="left" transition>
            {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                    <Box>
                        <Box sx={{ width: "calc(50px + 3rem)", height: "30px", backgroundColor: "#4C9553", position: "absolute", top: -40, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography sx={{ fontSize: 17, mb: -0.5, userSelect: "none" }}> { downloadLabel } </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ backgroundColor: "#4C9553", height: "31px", width: "50px", mr: 1, justifyContent: "center", alignItems: "center", px: 3, py: 1 }}>
                            <a href={downloadImageContents} download={"cozy-map.png"} onMouseOver={() => setDownloadLabel("Image")} onMouseOut={() => setDownloadLabel("Download")}> 
                                <ImageIcon sx={{ fontSize: 30, color: "white", p: 0.5, "&:hover": { cursor: "pointer", backgroundColor: "#000", borderRadius: "5px" } }} />
                            </a>
                            <a href={downloadFileContents} download={"cozy-map.json"} onMouseOver={() => setDownloadLabel("Loadable File")} onMouseOut={() => setDownloadLabel("Download")}> 
                                <FilePresentIcon sx={{ fontSize: 30, color: "white", p: 0.5, "&:hover": { cursor: "pointer", backgroundColor: "#000", borderRadius: "5px" } }} />
                            </a>
                        </Stack>
                    </Box>
                </Grow>
            )}
        </Popper>

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