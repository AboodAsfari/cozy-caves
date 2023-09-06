import { Input, Slider, Typography, Grid } from "@mui/material";

const InputSlider = (props) => {
    return (
            <Grid item xs={props.xs}>
                <Typography color={"white"}>
                    {props.name}
                </Typography>
                <Slider
                    value={props.value}
                    onChange={props.handleChange}
                    aria-labelledby="height-input-slider"
                    min={props.min}
                    max={props.max}
                />
                <Input
                    value={props.value}
                    size="small"
                    onChange={props.handleChange}
                        inputProps={{
                        step: 10,
                        min: props.min,
                        max: props.max,
                    }}
                />
        </Grid>
    );
}

export default InputSlider;