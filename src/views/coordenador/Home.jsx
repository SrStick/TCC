import { InfoDialog } from '../../components'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slide, TextField, Tooltip, Typography, Skeleton } from "@mui/material"
import { useState, useCallback, forwardRef, useContext } from "react";

import InfoIcon from '@mui/icons-material/InfoOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";


/* TABELA */
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

/* FIREBASE */
import { Collections, useTaskQuery, UserContext, getUserID, Status } from '../../helper/firebase';
import { doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore';

const SlideTransition = forwardRef((props, ref) => 
	<Slide direction="up" ref={ref} {...props} />
)

const ShadowRows = () => {
	const rows = []
	const lines = 4

	for (let l = 0; l < lines; l++) {
		const cels = []
		for (let c = 0; c < 4; c++)
			cels.push(
				<TableCell key={c}>
					<Skeleton />
				</TableCell>
			)
		rows.push(<TableRow key={l} children={cels}/>)
	}
	return rows
}

function AdminHome() {
	const tasks = useTaskQuery({ bindModality: true })

	const user = useContext(UserContext)

	const [ clickedIndex, setClickedIndex ] = useState(null)
	const [ infoIsOpen, setInfoIsOpen ] = useState(false)
	const [ openStatusChange, setOpenStatusChange ] = useState(false)
	const [ rejectCurrentTask, setRejectCurrentTask ] = useState(false)

	const closeStatusChangeDialog = useCallback(() => {
		setRejectCurrentTask(false)
		setOpenStatusChange(false)
	}, [])

	const toInfoRow = useCallback((task, index) => (
		<TableRow key={task.id}>
			<TableCell>{task.description}</TableCell>
			<TableCell>{task.date}</TableCell>
			<TableCell>{task.author.name}</TableCell>
			<TableCell align="center" onClickCapture={() => setClickedIndex(index)}>
				<Tooltip title="Mais informações">
					<IconButton color='info' onClickCapture={() => setInfoIsOpen(true)}>
						<InfoIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title="Avaliar">
					<IconButton onClick={() => setOpenStatusChange(true)}>
						<FactCheckIcon />
					</IconButton>
				</Tooltip>
			</TableCell>
		</TableRow> 
	), [])

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
					<TableRow>
						<TableCell>Descrição</TableCell>
						<TableCell>Data</TableCell>
						<TableCell>Autor</TableCell>
						<TableCell align="center">Ações</TableCell>
					</TableRow>
					</TableHead>
					<TableBody>
						{tasks.length ? tasks.map(toInfoRow) : <ShadowRows/>}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog
				open={openStatusChange}
				TransitionComponent={SlideTransition}
				keepMounted
			>
				<DialogTitle>Atenção</DialogTitle>
				<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{ !rejectCurrentTask ?
						<>
							<Typography>
								Para confirmar digite o número de horas requeridas no campo a baixo ou insira outro
								valor que ele receberá por essa atividade.
							</Typography>
							<TextField placeholder="12" />
						</>
						:
						<>
							<Typography>Deixe algum comentário para, por exemplo, explicar o motivo.</Typography>
							<TextField multiline minRows={3} />
						</>
					}
				</DialogContent>
				<DialogActions>
					<Button
						color="neutral"
						sx={{ mr: 'auto' }}
						onClick={closeStatusChangeDialog}
					>Voltar</Button>

					<Button
						startIcon={ <CloseIcon/> }
						color="error"
						variant="outlined"
						onClick={() => {
							if(!rejectCurrentTask) {
								setRejectCurrentTask(true)
							} else {
								console.log('atividade rejeitada');
								closeStatusChangeDialog()
							}
						}}
					>{rejectCurrentTask ? 'Confirmar' : 'Rejeitar'}</Button>

					{!rejectCurrentTask &&
						<Button
							startIcon={ <CheckIcon/> }
							variant="outlined"
							onClick={() => {
								const currentTask = tasks[clickedIndex]
								const taskPath = doc(getFirestore(), Collections.TASKS, currentTask.id)
								
								updateDoc(taskPath, {
									status: Status.COMPUTADO,
									reply: {
										author: { name: user.info.name, uid: getUserID() },
										date: Timestamp.now()
									}
								})
								setOpenStatusChange(false)
							}}
						>Confirmar</Button>
					}
				</DialogActions>
			</Dialog>
			
			<InfoDialog
				open={infoIsOpen}
				onClose={() => setInfoIsOpen(false)}
				task={tasks[clickedIndex]}
			/>
		</>
	)
}

export default AdminHome