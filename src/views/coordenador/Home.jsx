import { InfoDialog } from '../../components'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Slide, TextField, Tooltip, Typography, Box } from "@mui/material"
import { useState, useCallback, forwardRef, useEffect } from "react";

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
import * as Firestore from "firebase/firestore"


const SlideTransition = forwardRef((props, ref) => 
	<Slide direction="up" ref={ref} {...props} />
)


function AdminHome() {

	const [tasks, setTasks] = useState([])
	const [ clickedIndex, setClickedIndex ] = useState(null)
	const [ infoIsOpen, setInfoIsOpen ] = useState(false)
	const [ openStatusChange, setOpenStatusChange ] = useState(false)
	const [ rejectCurrentTask, setRejectCurrentTask ] = useState(false)

	useEffect(() => {
		loadTasks()
    }, []);

	const loadTasks = async () => {
		const { collection, getFirestore, query, limit, orderBy, onSnapshot, getDoc } = Firestore
		const tasksCollection = collection(getFirestore(), 'tasks')
		const finalConstraints = [ limit(20), orderBy('date') ]

		const q = query(tasksCollection, ...finalConstraints)
		
		return onSnapshot(q, async snap => {

			let array = []
			for (const { doc} of snap.docChanges()) {
				const newData = { id: doc.id, ...doc.data() }

				const formatedDate = newData.date.toDate().toLocaleDateString()
				newData.date = formatedDate

				const modalityRef = Firestore.doc(getFirestore(), 'modalities', newData.modality)
				const modalityData = await getDoc(modalityRef).then(snap => snap.data())
				newData.modality = modalityData
				
				array.push(newData)
			}
			
			setTasks(array)
		})
	}

	const closeStatusChangeDialog = useCallback(() => {
		setRejectCurrentTask(false)
		setOpenStatusChange(false)
	}, [])

	return (
		<>	
			<Box style={{marginBottom: 15}}>
				<Typography variant='h3' fontSize='2rem'>Atividades</Typography>
			</Box>

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
						{tasks.map((task, index) => (
							<TableRow key={task.id}>
								<TableCell component="th" scope="row">{task.description}</TableCell>
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
						))}
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
								O aluno {tasks[clickedIndex]?.author.name} reinvindica receber {' '}
								<Typography component='span' fontWeight='bold'>? horas</Typography>.
							</Typography>
							<Divider/>
							<Typography>
								Para confirar digite o número de horas requeridas no campo a baixo ou inseira outro
								valor que ele receberá por essa atividade.
							</Typography>
							<TextField placeholder="12" />
						</>
						:
						<>
							<Typography>Dexe algum comentário para, por exemplo, explicar o motivo.</Typography>
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