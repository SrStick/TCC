import { Box, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useMemo } from "react"
import { CircularProgressWithLabel } from '../../components'
import { useTimeGetter } from "../../helper/firebase"

function toCard({ id, userTime, progress, modality: { description, limit } }) {
	return (
		<Paper
			key={id}
			className="flex-col-center"
			sx={{ justifyContent: "space-around", p: 1 }}
			elevation={3}
		>
			<Typography textAlign='center' variant="h5" noWrap={false}>{description}</Typography>
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

	const totalUserTime = useMemo(() => !p.data ? 0 : p.data.map(data => data.userTime).reduce((a, b) => a + b), [ p.data ])
	
	const totalProgress = useMemo(() => {
		if(p.data) {
			return Math.floor(totalUserTime / 360 * 100)
		}
		return 0
	}, [ p.data, totalUserTime ])

	const progessColor = totalProgress < 100 ? 'neutral' : 'success'

	return (
		<Stack rowGap={5}>
			<Stack direction='row' justifyContent='flex-end' columnGap={2}>
				<Stack alignItems='center'>
					<Typography component='h3' fontSize='1.5rem' textTransform='capitalize'>horas nescessárias</Typography>
					<Typography fontSize='2rem' component='span' textTransform='capitalize'>360</Typography>
				</Stack>
				<Stack alignItems='center'>
					<Typography omponent='h3' fontSize='1.5rem' textTransform='capitalize'>horas restantes</Typography>
					<Typography fontSize='2rem' component='span' textTransform='capitalize'>{360 - totalUserTime}</Typography>
				</Stack>
				<Stack alignItems='center'>
					<Typography omponent='h3' fontSize='1.5rem' textTransform='capitalize'>horas cumpridas</Typography>
					<Typography fontSize='2rem' component='span' textTransform='capitalize'>{totalUserTime}</Typography>
				</Stack>
			</Stack>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow>
							<TableCell>Grupos</TableCell>
							<TableCell>Limite de Aproveitamento</TableCell>
							<TableCell>Total Aproveitado</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{p.data && p.data.map(({ modality: { id, limit, description }, userTime }) =>
							<TableRow key={id}>
								<TableCell>{description}</TableCell>
								<TableCell>{limit}</TableCell>
								<TableCell>{userTime}</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Box
				sx={{
					display: { sm: "flex", md: "grid" },
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "1ch",
					flexDirection: "column",
				}}
			>
				{p.data && p.data.filter(date => date.userTime).map(toCard)}
			</Box>

			<Stack
				sx={{
					gridColumnEnd: "span 3",
					flexDirection: "row",
					alignItems: "center",
					columnGap: 1,
				}}
			>
				<Typography color={progessColor} fontSize={"1.5rem"}>
					Progresso Total
				</Typography>

				<LinearProgress
					variant="determinate"
					color={progessColor}
					sx={{ height: 10, flex: 1 }}
					value={totalProgress}
				/>

				<Typography color={progessColor} fontSize={"1.5rem"}>
					{totalProgress}%
				</Typography>
			</Stack>
		</Stack>
	)
}

export default ProgressView