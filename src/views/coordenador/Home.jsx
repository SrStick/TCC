import { InfoDialog } from '../../components'
import {
	Button, Dialog,
	DialogActions, DialogContent,
	DialogTitle, IconButton,
	Slide, TextField,
	Tooltip, Typography,
	Skeleton, InputAdornment,
	MenuItem, InputLabel,
	Select, FormControl, Stack,
	Table, TableBody,
	TableCell, TableContainer,
	TableHead, TableRow,
	Paper, Toolbar
} from "@mui/material"
import { useState, useRef, useCallback, forwardRef, useEffect, useMemo } from "react";

import InfoIcon from '@mui/icons-material/InfoOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

/* FIREBASE */
import { Collections, useTaskQuery, getUserID, Status, useUser } from '../../helper/firebase';
import { doc, getFirestore, increment, Timestamp, updateDoc, deleteField, where, runTransaction } from 'firebase/firestore/lite';
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
	const clickedIndex = useRef(null)
	const [ infoIsOpen, setInfoIsOpen ] = useState(false)
	const [ openStatusChange, setOpenStatusChange ] = useState(false)
	const [ rejectCurrentTask, setRejectCurrentTask ] = useState(false)
	const [ filter, setFilter ] = useState('all')
	const [ showFeedback, setShowFeedback ] = useState(false)
	const [ sent, setSent ] = useState(false)

	const pendingTasks = useTaskQuery({
		constraints: [ where('status', '==', Status.EM_ANALISE) ]
	})
	const userTasks = useTaskQuery({
		constraints: [ where('reply.author.uid', '==', getUserID()) ]
	})

	const tasks = useMemo(() => {
		const tasks = []
		
		if (pendingTasks.isLoading || userTasks.isLoading)
			return []

		const length = pendingTasks.data.length || userTasks.data.length || 0

		for (let i = 0; i < length; i++) {
			const pending = pendingTasks.data[i]
			const usr = userTasks.data[i]
			if (pending && usr) {
				if (pending.id === usr.id)
					tasks.push(usr)
				else
					tasks.push(pending, usr)
			} else if (!pending && usr)
				tasks.push(usr)
			else
				tasks.push(pending)
			}

			return tasks
	}, [ pendingTasks, userTasks ])

	const user = useUser()

	const visibleTasks = useMemo(() => {
		if(filter === 'all')
			return tasks

		return tasks.filter(task => task.status === Status.EM_ANALISE)
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
		replyHours.setValue('')
		comments.setValue('')
	}, [comments, replyHours])

	const sendReply = useCallback(status => {
		setSent(true)
		const firestore = getFirestore()
		const currentTask = visibleTasks[clickedIndex.current]
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
		const editedPart = { status, reply }
		window.dispatchEvent(new CustomEvent('editdoc', { detail: { id: currentTask.id, ...editedPart} }))

		runTransaction(firestore, async transition => {

			transition.update(doc(firestore, Collections.TASKS, currentTask.id), editedPart)
			transition.update(doc(firestore, Collections.MODALITIES, modalityId), { canBeDeleted: false })

			if(status === Status.COMPUTADO) {
				transition.set(currentModalityUserTime, { total: increment(reply.hours) })
			}
		}).then(() => {
			setShowFeedback(true)
			setTimeout(closeStatusChangeDialog, 2 * 1000)
		})
	}, [user.info.name, replyHours.value, visibleTasks, comments.value, closeStatusChangeDialog ])

	const rendererRows = useCallback(() => {

		const toInfoRow = (task, index) => (
			<TableRow key={task.id}>
				<TableCell>{task.getShortDescription()}</TableCell>
				<TableCell>{task.date}</TableCell>
				<TableCell>{task.author.name}</TableCell>
				<TableCell
					onClickCapture={() => clickedIndex.current = index}
					sx={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center' }}
				>
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

		if (pendingTasks.isLoading || userTasks.isLoading)
			return <ShadowRows/>

		if(visibleTasks.length === 0)
			return (
				<TableRow>
					<TableCell sx={{ fontStyle: 'italic', color: 'neutral.main' }} colSpan='4' align='center'>Vazio</TableCell>
				</TableRow>
			)
		
		return visibleTasks.map(toInfoRow)
	}, [ visibleTasks, pendingTasks.isLoading, userTasks.isLoading ])

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

			<Button
				disabled={!pendingTasks.grownUp() && !userTasks.grownUp()}
				onClick={() => {
					if (pendingTasks.grownUp())
						pendingTasks.next()
					if	(userTasks.grownUp())
						userTasks.next()
				}}
			>Carregar mais dados</Button>

			<Dialog
				open={openStatusChange}
				TransitionComponent={SlideTransition}
				keepMounted
			>
				<DialogTitle>Avaliação</DialogTitle>
				<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Stack border={1} borderColor='#c4c4c4' rowGap={1} padding={1}>
						<span>
							Ganho por envio: {visibleTasks[clickedIndex.current]?.modality.amount}h
						</span>
						<span>
							Limite: {visibleTasks[clickedIndex.current]?.modality.limit}h
						</span>
						<span>
							Unidade: {visibleTasks[clickedIndex.current]?.modality.getTypeDesc()}
						</span>
					</Stack>
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
							<Typography>Descreva o motivo da rejeição do envio desta atividade</Typography>
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
							disabled={someEmpty(replyHours.value) || sent}
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
				task={visibleTasks.length !== 0 ? visibleTasks[clickedIndex.current] : null}
			/>
		</>
	)
}



export default AdminHome