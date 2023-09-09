import React from 'react';
import { Typography, MenuItem } from "@mui/material";

import CheckIcon from '@mui/icons-material/Check';

const SettingsDropdownItem = (props) => {
    const {
        name,
        handleClose,
        setValue,
        value,
    } = props;

    return (
        <MenuItem onClick={() => { setValue(name); handleClose(); }} sx={{ minWidth: 140, py: "3px !important" }} disableRipple>
            <Typography sx={{ mr: 3, mt: 0.5, fontSize: 18 }}> {name} </Typography>
            {value === name && <CheckIcon />}
        </MenuItem>
    );
}

export default SettingsDropdownItem;
