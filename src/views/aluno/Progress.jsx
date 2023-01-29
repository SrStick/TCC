import { Box, Paper, Typography } from "@mui/material"
import { useMemo } from "react"
import { CircularProgressWithLabel } from '../../components'
import { useTimeGetter } from "../../helper/firebase"

function limitTitle(text) {
	const limit = 35
	if(text.length > limit)
		return text.substring(0, limit - 3) + '...'
	return text
}

function toCard({ id, userTime, progress, modality: { description, limit } }) {
	return (
		<Paper
			key={id}
			className="flex-col-center"
			sx={{ justifyContent: "space-around" }}
			elevation={3}
		>
			<Typography textAlign='center' variant="h5">{limitTitle(description)}</Typography>
			<div className="flex-col-center">
				<CircularProgressWithLabel size={'4rem'} value={progress} />
				<div>
					Limite: {limit}h
				</div>
				<div>
					Horas obtidas: {userTime}h
				</div>
			</div>
		</Paper>
	)
}

function ProgressView() {
	const p = useTimeGetter()

	const totalProgress = useMemo(() => {
		if(p.data) {
			const progress = p.data.map(data => data.userTime).reduce((a, b) => a + b)
			return progress / 360 * 100
		}
		return 0
	}, [ p.data ])
	return (
		<Box sx={{
			display: { sm: 'flex', md: 'grid' },
			gridTemplateColumns: 'repeat(3, 1fr)',
			gap: '1ch',
			flexDirection: 'column'

		}}
		>
			{ p.data && p.data.map(toCard) }
		</Box>
	)
}

export default ProgressView