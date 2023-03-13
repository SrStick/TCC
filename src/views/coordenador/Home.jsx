import { InfoDialog } from '../../components'
import {
	Button, Dialog,
	DialogActions, DialogContent,
	DialogTitle, IconButton,
	Slide, TextField,
	Tooltip, Typography,
	Skeleton, InputAdornment,
	FormControl,
	MenuItem, InputLabel, Select
} from "@mui/material"
import { useState, useRef, useCallback, forwardRef, useEffect, useMemo } from "react";

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
import Toolbar from '@mui/material/Toolbar';

/* FIREBASE */
import { Collections, useTaskQuery, getUserID, Status, useUser } from '../../helper/firebase';
import { doc, getFirestore, increment, setDoc, Timestamp, updateDoc, deleteField, where } from 'firebase/firestore';
import { PatternFunctions, useTextPatterns } from '../../helper/hooks';
import { someEmpty, putEventTargetValue } from '../../helper/short-functions';
import ChangePasswordPanel from '../../components/ChangePasswordPanel';

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
	const [ filter, setFilter ] = useState('all')
	const [ showFeedback, setShowFeedback ] = useState(false)

	const tasks = useTaskQuery({
		constranints: [ where('status', '==', Status.EM_ANALISE), where('reply.uid', '==', getUserID()) ]
	})
	const user = useUser()

	const visibleTasks = useMemo(() => {
		const data = tasks.data
		if(filter === 'all')
			return data

		return data.filter(task => task.status === Status.EM_ANALISE)
	}, [ tasks, filter ])


	const comments = useTextPatterns(PatternFunctions.limit(200))

	const isFirstAccessOfModerator = useRef(user.info.firstAccess)
	
	useEffect(() => {
		if(isFirstAccessOfModerator.current) {
			updateDoc(doc(getFirestore(), Collections.USERS, getUserID()), { firstAccess: deleteField() })
		}
	}, [ user ])

	const replyHours = useTextPatterns(PatternFunctions.onlyNumbers)

	const closeStatusChangeDialog = useCallback(() => {
		setRejectCurrentTask(false)
		setOpenStatusChange(false)
		setShowFeedback(false)
		replyHours.clearValue()
		comments.clearValue()
	}, [comments, replyHours])

	const sendReply = useCallback(status => {
		const firestore = getFirestore()
		const currentTask = visibleTasks[clickedIndex]
		const modalityId = currentTask.modality.id

		const reply = {
			author: { name: user.info.name, uid: getUserID() },
			date: Timestamp.now()
		}

		if (comments.value)
			reply.comments = comments.value

		const currentModalityUserTime = doc(
			firestore,
			Collections.MODALITIES,
			modalityId,
			Collections.USER_TIMES,
			currentTask.author.uid
		)

		if(status === Status.COMPUTADO) {
			reply.hours = parseFloat(replyHours.value)
		}

		const asyncActions = [
			updateDoc(doc(firestore, Collections.TASKS, currentTask.id), { status, reply })
		]

		if(status === Status.COMPUTADO) {
			asyncActions.push(setDoc(currentModalityUserTime, { total: increment(reply.hours) }))
		}

	return Promise.all(asyncActions).then(() => {
		setShowFeedback(true)
		setTimeout(closeStatusChangeDialog, 5 * 1000)
	})
	}, [user.info.name, replyHours.value, visibleTasks, clickedIndex, comments.value, closeStatusChangeDialog ])

	const rendererRows = useCallback(() => {

		const toInfoRow = (task, index) => (
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
						<div style={{ display: 'inline-block' }}>
							<IconButton disabled={task.status !== Status.EM_ANALISE} onClick={() => setOpenStatusChange(true)}>
								<FactCheckIcon />
							</IconButton>
						</div>
					</Tooltip>
				</TableCell>
			</TableRow> 
		)

		if(tasks.isLoading)
			return <ShadowRows/>

		if(visibleTasks.length === 0)
			return (
				<TableRow>
					<TableCell sx={{ fontStyle: 'italic', color: 'neutral.main' }} colSpan='4' align='center'>Vazio</TableCell>
				</TableRow>
			)
		
		return visibleTasks.map(toInfoRow)
	}, [ tasks, visibleTasks ])

	return (
		<>
			{isFirstAccessOfModerator.current && <ChangePasswordPanel/>}
			<Paper>
				<Toolbar sx={{ pl: { sm: 2 }, display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant='h6'>Quadro de avaliação</Typography>
					<FormControl>
					<InputLabel>Filtro</InputLabel>
						<Select
							value={filter}
							label='Filtro'
							onChange={putEventTargetValue(setFilter)}
							fullWidth
							size='small'
						>
							<MenuItem value='all'>Todas as atividades</MenuItem>
							<MenuItem value='pending'>Atividades não avaliadas</MenuItem>
						</Select>
					</FormControl>
				</Toolbar>
				<TableContainer>
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
							{rendererRows()}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			<Button disabled={!tasks.grownUp()} onClick={() => tasks.next()}>Carregar mais dados</Button>

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
							<TextField onChange={comments.onChange}  multiline minRows={3} />
						</>
					}

					<Typography
						px={2}
						py={1}
						color='#fff'
						bgcolor='success.main'
						display={showFeedback ? 'block': 'none'}
					>Alteração bem sucedida</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						color="neutral"
						sx={{ mr: "auto" }}
						onClick={closeStatusChangeDialog}
					>Voltar</Button>

					<Button
						startIcon={ <CloseIcon/> }
						color="error"
						variant="outlined"
						disabled={rejectCurrentTask && someEmpty(comments.value) }
						onClick={() => {
							if(!rejectCurrentTask) {
								setRejectCurrentTask(true)
							} else {
								sendReply(Status.NEGADO)
							}
						}}
					>{rejectCurrentTask ? 'Confirmar' : 'Rejeitar'}</Button>

					{!rejectCurrentTask &&
						<Button
							startIcon={ <CheckIcon/> }
							variant="outlined"
							disabled={someEmpty(replyHours.value)}
							onClick={() => {
								sendReply(Status.COMPUTADO)
							}}
						>Confirmar</Button>
					}
				</DialogActions>
			</Dialog>
			
			<InfoDialog
				open={infoIsOpen}
				onClose={() => setInfoIsOpen(false)}
				task={visibleTasks.length !== 0 ? visibleTasks[clickedIndex] : null}
			/>
		</>
	)
}



export default AdminHome