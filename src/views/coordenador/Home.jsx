import { InfoDialog } from '../../components'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slide, TextField, Tooltip, Typography, Skeleton, InputAdornment } from "@mui/material"
import { useState, useCallback, forwardRef } from "react";

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
import { Collections, useTaskQuery, getUserID, Status, useUser } from '../../helper/firebase';
import { doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore';
import { PatternFunctions, useTextPatterns } from '../../helper/hooks';

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
	const [ clickedIndex, setClickedIndex ] = useState(null)
	const [ infoIsOpen, setInfoIsOpen ] = useState(false)
	const [ openStatusChange, setOpenStatusChange ] = useState(false)
	const [ rejectCurrentTask, setRejectCurrentTask ] = useState(false)
	
	const tasks = useTaskQuery()
	const user = useUser()

	const replyHours = useTextPatterns(PatternFunctions.onlyNumbers)

	const sendReply = useCallback((id, ok = true, comments) => {
		const reply = {
			author: { name: user.info.name, uid: getUserID() },
			date: Timestamp.now(),
			hours: parseInt(replyHours.value, 10)
		}

		if (comments)
			reply.comments = comments

		return updateDoc(doc(getFirestore(), Collections.TASKS, id), {
			status: ok ? Status.COMPUTADO : Status.NEGADO,
			reply
		})
	}, [ user.info.name, replyHours.value ])

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
						<TableCell>Data de Envio</TableCell>
						<TableCell>Autor</TableCell>
						<TableCell align="center">Ações</TableCell>
					</TableRow>
					</TableHead>
					<TableBody>
						{tasks?.length ? tasks.map(toInfoRow) : <ShadowRows/>}
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
							<Typography>Digite o valor que ele receberá por essa atividade.</Typography>
							<TextField
								InputProps={{
									endAdornment:
										<InputAdornment position="end">horas</InputAdornment>
								}}
								onChange={replyHours.onChange}
								value={replyHours.value}
							/>
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
								sendReply(currentTask.id).then(() => setOpenStatusChange(false))
							}}
						>Confirmar</Button>
					}
				</DialogActions>
			</Dialog>
			
			<InfoDialog
				open={infoIsOpen}
				onClose={() => setInfoIsOpen(false)}
				task={tasks ? tasks[clickedIndex] : null}
			/>
		</>
	)
}



export default AdminHome