import { Box, Typography } from "@mui/material"
import { useEffect } from "react"
import CheckIcon from '@mui/icons-material/Check';

function FeedbackBox({ visible, setVisible, action, successMessage }) {
	useEffect(() => {
		if (visible)
			setTimeout(() => {
				if (action)
					action()
				setVisible(false)
			}, 4 * 1000)
	}, [ visible, action, setVisible ])
	return (
		<Box
			bgcolor={"#4c4c4c"}
			color={"white"}
			p={1}
			position="absolute"
			bottom={0}
			mb={1}
			display={visible ? "flex" : "none"}
			columnGap={1}
		>
			<CheckIcon color="success" />
			<Typography component={"span"}>{successMessage}</Typography>
		</Box>
	)
}

export default FeedbackBox
