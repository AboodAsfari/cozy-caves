import React from 'react';
import { Typography, TextField, Stack, Slider } from "@mui/material";

const SettingsSlider = (props) => {
    const {
        declareEdited,
        max,
        min,
        name,
        setValid,
        setValue,
        value
    } = props;

    const handleChange = (e) => {
        if (e.target.value.length > 0 && (isNaN(e.target.value) || parseInt(e.target.value).toString() !== e.target.value)) return;
        declareEdited();
        setValid(isValid(e.target.value));
        setValue(e.target.value);
    }

    const isValid = (checkValue = value) => checkValue >= min && checkValue <= max;

    return (
        <Stack>
            <Stack direction="row" className="settings-text-field">
                <Typography sx={{ color: isValid() ? "white" : "#d4242c !important"}}> {name}: </Typography>
                <TextField size="small" value={value} onChange={handleChange} inputProps={{ style: { color: isValid() ? "" : "#d4242c" } }} />
            </Stack>
            <Slider className="settings-slider" value={isNaN(parseInt(value)) ? min : parseInt(value)} 
                onChange={(e) => { setValue(e.target.value); declareEdited(); } } name={name} min={min} max={max}/>
        </Stack>
    );
}

export default SettingsSlider;
