import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography
} from "@mui/material";

const HelpDialog = (props) => {
    const {
        open,
        setOpen
    } = props;

    return (
        <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ style: { backgroundColor: '#1e1f1e', color: "white" }}}>
            <DialogTitle sx={{ fontSize: 40 }}> Layout Editor Keybinds </DialogTitle>
            <DialogContent sx={{ width: "89%" }}>
                <Stack>
                    <BindSectionTitle title="Tools" />
                    <BindingText name="Use Brush" binding="B" />
                    <BindingText name="Use Eraser" binding="E" />
                    <BindingText name="Use Selector" binding="V" />
                    <BindingText name="Use Eye Dropper" binding="I" />
                    <BindingText name="Use Fill Tool" binding="G" />
                    <BindingText name="Swap Brushes" binding="X" />

                    <BindSectionTitle title="File Operations" />
                    <BindingText name="New File" binding="SHIFT + N" />
                    <BindingText name="Open File" binding="CTRL + O" />
                    <BindingText name="Open Folder" binding="CTRL + SHIFT + O" />
                    <BindingText name="Save File" binding="CTRL + S" />
                    <BindingText name="Save As" binding="CTRL + SHIFT + S" />

                    <BindSectionTitle title="General" />
                    <BindingText name="Undo" binding="CTRL + Z" />
                    <BindingText name="Redo" binding="CTRL + Y" />
                    <BindingText name="Swap to Partition" binding="ALT + [0-9]" />
                    <BindingText name="Create Partition" binding="ALT + =" />
                    <BindingText name="Layout Settings" binding="CTRL + I" />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} className="NavButton" autoFocus disableRipple> OK </Button>
            </DialogActions>
        </Dialog>
    );
}

const BindSectionTitle = (props) => {
    const {
        title
    } = props;

    return (
        <Typography sx={{ fontSize: 30 }}> {title} </Typography>
    );
}

const BindingText = (props) => {
    const {
        name,
        binding
    } = props;

    return (
        <Stack direction="row" sx={{ width: "100%" }}>
            <Typography> {name} </Typography>
            <Typography sx={{ ml: "auto", textAlign: "right", color: "#dbd9d9" }}> {binding} </Typography>
        </Stack>  
    );
}

export default HelpDialog;
