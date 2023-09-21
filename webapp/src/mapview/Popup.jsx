import React from 'react';
import { Typography, Dialog, Stack, DialogContent, Modal, Box } from "@mui/material";

import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import CloseIcon from '@mui/icons-material/Close';

const Popup = (props) => {
	const {
		prop,
		onClose
	} = props;

	const [propInfo, setPropInfo] = React.useState(null);

	const getPropRarity = () => !propInfo ? "" : propInfo.rarity.charAt(0).toUpperCase() + propInfo.rarity.slice(1);

	React.useEffect(() => {
		if (prop) setPropInfo(prop);
	}, [prop]);

	return ( <>
		<Modal open={!!prop} onClose={onClose} sx={{
			// "& .MuiDialog-paper": { backgroundColor: "black" },
			// "& .MuiDialog-container": {
			// 	"& .MuiPaper-root": {
			// 		width: "100%",
			// 		height: "50%"
			// 	},
			// }
		}}>
			<Box sx={{ width: "100%", height: "100%", pointerEvents: "none" }}>
				<CloseIcon sx={{ position: "absolute", top: "10px", right: "10px", "&:hover": { color: "#4C9553", cursor: "pointer" } }} onClick={onClose} />
				<Stack direction="row" sx={{ height: "100%", alignItems: "center", justifyContent: "center" }} spacing={3} >
					<Stack sx={{ width: "450px", height: "50%", backgroundColor: "black", pointerEvents: "all", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16))", p: "10px", alignItems: "left" }}>
						<Stack direction="row">
							<Typography sx={{ fontSize: 40, textAlign: "left" }}> {propInfo && propInfo.name} </Typography>
							<InsertEmoticonIcon sx={{ mt: 1, ml: 1, fontSize: 40 }} />
						</Stack>
						<Typography sx={{ fontSize: 25, textAlign: "left", mt: -1, color: "grey", mb: 2 }}> {getPropRarity()} </Typography>
						<Typography sx={{ fontSize: 25, textAlign: "left" }}> {propInfo && propInfo.desc} </Typography>

						{propInfo && propInfo.getItems().length > 0 && <>
							<Typography sx={{ fontSize: 30, textAlign: "left", mt: 2 }}> Contains: </Typography>
							<Stack direction="row">
								{propInfo.getItems().map((item, i) => <InsertEmoticonIcon key={item.name + i} sx={{ fontSize: 40 }} />)}
							</Stack>
						</>}
					</Stack>

					<Stack sx={{ width: "250px", height: "50%", backgroundColor: "black", pointerEvents: "all", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16))", p: "10px", alignItems: "left" }}>
						<Typography> HELLO </Typography>
						<Typography> HELLO </Typography>
						<Typography> HELLO </Typography>
						<Typography> HELLO </Typography>
					</Stack>
				</Stack>
			</Box>
		</Modal>
	</> );
};

export default Popup;
