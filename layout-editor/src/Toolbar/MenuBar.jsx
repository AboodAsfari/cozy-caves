import React from "react";
import {
    AppBar,
    Box,
    Button,
    Checkbox,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import BrushSelector from "./BrushSelector";
import ToolbarButton from "./ToolbarButton";
import { TransitionGroup } from 'react-transition-group';

import iconMap from "../PartitionIcons";
import Tools from "../Tools";

import "../styles/MenuBar.css";

import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const MenuBar = (props) => {
    const {
        brushInfo,
        currTool,
        directoryFiles,
        fileDisplayName,
        fileEdited,
        fileHandle,
        handleFileOpen,
        handleFileSave,
        handleFileSaveAs,
        handleFolderOpen,
        handleNewLayout,
        handleNewPartition,
        layout,
        loadHandle,
        setBrushInfo,
        setCurrTool,
        setHelpOpen,
        setSettingsOpen,
        settingsOpen,
        updateActivePartition
    } = props;

    const [defaultPartitionAnchorEl, setDefaultPartitionAnchorEl] = React.useState(null);
    const [fileMenuAnchorEl, setFileMenuAnchorEl] = React.useState(null);
    const [fileListAnchorEl, setFileListAnchorEl] = React.useState(null);
    const [updater, setUpdater] = React.useState(false);

    const swapBrushes = () => {
        setBrushInfo(prev => ({
            ...prev,
            primaryBrush: prev.secondaryBrush,
            secondaryBrush: prev.primaryBrush
        }));
    }

    const setPrimaryBrush = (brush) => {
        setBrushInfo(prev => ({
            ...prev,
            primaryBrush: brush
        }));
    }

    const setSecondaryBrush = (brush) => {
        setBrushInfo(prev => ({
            ...prev,
            secondaryBrush: brush
        }));
    }

    const setFillBrush = (brush) => {
        setBrushInfo(prev => ({
            ...prev,
            fillBrush: brush
        }));
    }

    const getToolbarItems = () => {
        let ret = [];

        ret.push(<ToolbarButton key={0} iconName="stylus" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PEN} />);
        if (currTool === Tools.PEN) {
            let primaryIcon = <BrushSelector key={0.1} size={20} brush={brushInfo.primaryBrush} setBrush={setPrimaryBrush} />;
            let secondaryIcon = <BrushSelector key={0.2} size={15} mr={2} brush={brushInfo.secondaryBrush} setBrush={setSecondaryBrush} />;
            let brushSwapper = <SwapHorizIcon key={0.3} className="ToolIcon" sx={{ fontSize: 30, mt: 0.5, mr: 1 }} onClick={swapBrushes} />

            ret.push(primaryIcon);
            ret.push(brushSwapper);
            ret.push(secondaryIcon);
        }

        ret.push(<ToolbarButton key={1} iconName="ink_eraser" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.ERASER} />);
        ret.push(<ToolbarButton key={2} iconName="arrow_selector_tool" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.SELECTOR} />);
        ret.push(<ToolbarButton key={3} iconName="colorize" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PICKER} />);

        ret.push(<ToolbarButton key={4} iconName="colors" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.FILL} />);
        if (currTool === Tools.FILL) {
            let selector = <BrushSelector key={4.1} size={20} brush={brushInfo.fillBrush} setBrush={setFillBrush} />;
            ret.push(selector);
        }

        if (currTool === Tools.PEN || currTool === Tools.FILL) {
            ret.push(<Typography key={5} className="NavText" sx={{ textWrap: "nowrap" }}> Default Partition: </Typography>);
            ret.push(<>
                <Button key={6} className="NavButton" sx={{ textTransform: "none", textWrap: "nowrap" }} disableRipple
                    endIcon={<KeyboardArrowDownIcon />} onClick={(e) => setDefaultPartitionAnchorEl(e.currentTarget)}>
                    <Box sx={{ "& .icon": { color: layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].color, mr: 1, mt: 0.7 } }}> {iconMap[layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].icon]} </Box>
                    {layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].name}
                </Button>

                <Menu anchorEl={defaultPartitionAnchorEl} open={!!defaultPartitionAnchorEl} onClose={() => setDefaultPartitionAnchorEl(null)}
                   sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}
                >
                    {layout.getPartitionDisplayInfo().map((info, i) =>
                        <MenuItem key={info.name + i} onClick={() => { updateActivePartition(i - 2); setBrushInfo(prev => ({ ...prev, defaultPartition: i - 2 })); setDefaultPartitionAnchorEl(null); }}
                            className="MenuItem" sx={{ minWidth: 140 }} disableRipple>
                            <Box sx={{ color: info.color, mt: 1 }}> {iconMap[info.icon]} </Box>
                            <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> {info.name} </Typography>
                            {brushInfo.defaultPartition === i - 2 && <CheckIcon />}
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleNewPartition(); setDefaultPartitionAnchorEl(null); }} className="MenuItem" sx={{ minWidth: 140, py: "4px !important" }} disableRipple>
                        <AddIcon />
                        <Typography sx={{ ml: 1.2, mr: 2, mt: 0.4 }}> Create new partition </Typography>
                    </MenuItem>
                </Menu>
            </>);
        }

        return ret;
    }

    const handleNew = () => {
        setFileMenuAnchorEl(null);
        handleNewLayout();
    }

    const handleOpen = () => {
        setFileMenuAnchorEl(null);
        handleFileOpen();
    }

    const handleFolder = () => {
        setFileMenuAnchorEl(null);
        handleFolderOpen();
    }

    const handleSave = () => {
        setFileMenuAnchorEl(null);
        handleFileSave();
    }

    const handleSaveAs = () => {
        setFileMenuAnchorEl(null);
        handleFileSaveAs();
    }

    const handleAllowFlipX = (e) => {
        layout.setAllowFlipX(e.target.checked);
        setUpdater(!updater);
    }

    const handleAllowFlipY = (e) => {
        layout.setAllowFlipY(e.target.checked);
        setUpdater(!updater);
    }

    return (
        <>
        <AppBar position="sticky" component="nav">
            <Toolbar className="Toolbar">
                <Stack direction={"row"} sx={{ alignItems: "center", width: "100%" }}>
                    <Button className="NavButton" disabled={directoryFiles.length === 0} sx={{ textTransform: "none", textWrap: "nowrap" }} disableRipple
                        endIcon={directoryFiles.length === 0 ? null : <KeyboardArrowDownIcon />} onClick={(e) => setFileListAnchorEl(e.currentTarget)}>
                        {fileDisplayName} {fileEdited && "*"}
                    </Button>
                    <Button disableRipple className="NavButton" onClick={(e) => setFileMenuAnchorEl(e.currentTarget)}> File </Button>
                    <Button disableRipple className="NavButton"> View </Button>
                    <Divider variant="middle" sx={{ ml: 3, mr: 3.8, borderWidth: 1, borderColor: "white", height: "35px" }} />
                    <TransitionGroup style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        {getToolbarItems().map((item, i) =>
                            <Collapse orientation="horizontal" key={item.key}>
                                {item}
                            </Collapse>
                        )}
                    </TransitionGroup>
                    <Box sx={{ flexGrow: 1 }} />
                    <HelpOutlineIcon onClick={() => setHelpOpen(true)} sx={{ color: "white", "&:hover": { color: "#7da36d", cursor: "pointer" } }} />
                    
                </Stack>
            </Toolbar>
        </AppBar>

        <Menu anchorEl={fileMenuAnchorEl} open={!!fileMenuAnchorEl} onClose={() => setFileMenuAnchorEl(null)}
            sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a", minWidth: "280px" }, mt: 1 }}>
            <MenuItem onClick={handleNew} sx={{ py: "4px !important" }} className="MenuItem" disableRipple>
                <Typography> New </Typography>
                <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9", fontSize: 13 }}> SHIFT + N </Typography>
            </MenuItem>
            <MenuItem onClick={handleOpen} sx={{ py: "4px !important" }} className="MenuItem" disableRipple>
                <Typography> Open </Typography>
                <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9", fontSize: 13 }}> CTRL + O </Typography>
            </MenuItem>
            <MenuItem onClick={handleFolder} sx={{ py: "4px !important" }} className="MenuItem" disableRipple>
                <Typography> Open Folder </Typography>
                <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9", fontSize: 13 }}> CTRL + SHIFT + O </Typography>
            </MenuItem>
            <MenuItem onClick={handleSave} sx={{ py: "4px !important" }} className="MenuItem" disableRipple>
                <Typography> Save </Typography>
                <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9", fontSize: 13 }}> CTRL + S </Typography>
            </MenuItem>
            <MenuItem onClick={handleSaveAs} sx={{ py: "4px !important" }} className="MenuItem" disableRipple>
                <Typography> Save As </Typography>
                <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9", fontSize: 13 }}> CTRL + SHIFT + S </Typography>
            </MenuItem>
            <MenuItem onClick={() => { setSettingsOpen(true); setFileMenuAnchorEl(null); } } sx={{ py: "4px !important" }} className="MenuItem" disableRipple>
                <Typography> Settings </Typography>
                <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9", fontSize: 13 }}> CTRL + I </Typography>
            </MenuItem>
        </Menu>

        <Menu anchorEl={fileListAnchorEl} open={!!fileListAnchorEl} onClose={() => setFileListAnchorEl(null)}
            sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}>
            {directoryFiles.map((file, i) => fileHandle !== null && file.name === fileHandle.name ? null :
                <MenuItem key={file.name} onClick={() => { loadHandle(file); setFileListAnchorEl(null); }} className="MenuItem" sx={{ minWidth: 140, py: "6px !important" }} disableRipple>
                    <Typography> {file.name} </Typography>
                </MenuItem>
            )}
        </Menu>

        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} sx={{ "& .MuiPaper-root": { backgroundColor: "#1e1f1e", minWidth: "600px" } }}>
            <DialogTitle sx={{ color: "white", alignSelf: "center", fontSize: "40px" }}> Layout Settings </DialogTitle>
            <DialogContent >
                <Typography sx={{ fontSize: 30, color: "white" }}> Room Build Options </Typography>
                <Stack direction="row" className="Checkbox" sx={{ ml: 0 }}>
                    <Checkbox disableRipple checked={layout.getAllowFlipX()} onChange={(handleAllowFlipX)} sx={{ ml: "0px !important" }} />
                    <Typography> Allow Room Flip X </Typography>
                </Stack>
                <Stack direction="row" className="Checkbox" sx={{ ml: 0 }}>
                    <Checkbox disableRipple checked={layout.getAllowFlipY()} onChange={handleAllowFlipY} sx={{ ml: "0px !important" }} />
                    <Typography> Allow Room Flip Y </Typography>
                </Stack>

                <Typography sx={{ fontSize: 30, color: "white", mt: 4 }}> Custom Layout Metadata </Typography>
                <Typography sx={{ fontSize: 20, color: "white", ml: 1.5 }}> To Be Implemented </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSettingsOpen(false)} className="NavButton" autoFocus disableRipple> OK </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}

export default MenuBar;
