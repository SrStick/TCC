import { Card, CardContent, Typography } from "@mui/material"
import { CircularProgressWithLabel } from '../../components'
import { useTimeGetter } from "../../helper/firebase"

function toCard({ id, userTime, progress, modality: { description, limit } }) {
	return (
		<Card key={id}>
			<CardContent
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					rowGap: '1ch'
				}}
			>
				<Typography variant="h5">{description}</Typography>
					<CircularProgressWithLabel size={'4rem'} value={progress} />
					<div>
						Limite: {limit}h
					</div>
					<div>
						Horas obtidas: {userTime}h
					</div>
			</CardContent>
		</Card>
	)
}

function ProgressView() {
	const p = useTimeGetter()
	return (
		p.data && p.data.map(toCard)
	)
}

export default ProgressView