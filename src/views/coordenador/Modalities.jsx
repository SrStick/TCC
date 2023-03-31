import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, onSnapshot, query, updateDoc } from "firebase/firestore"
import { Collections, extractData } from "../../helper/firebase"
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Button, Stack, Dialog, AppBar, Toolbar, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import { putEventTargetValue, someEmpty } from "../../helper/short-functions"
import FeedbackBox from "../../components/FeedbackBox";

function Modality() {
	const [modalities, setModalities] = useState([])
	const clickedItemIndex = useRef(null)
	const [formIsOpen, setFormIsOpen] = useState(false)
	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
	const [ showFeedback, setShowFeedback ] = useState(false)

	
	const closeFormDialog = useCallback(() => {
		setFormIsOpen(false)
		clickedItemIndex.current = null
	}, [])
	
	const openFormDialog = useCallback(() => setFormIsOpen(true), [])
	const closeDeleteDialog = useCallback(() => setDeleteDialogIsOpen(false), [])
	
	const deleteAction = useCallback(() => {
		const { id: docId } = modalities[clickedItemIndex.current]

		deleteDoc(doc(getFirestore(), Collections.MODALITIES, docId))
			.then(() => {
				closeDeleteDialog()
				setShowFeedback(true)
			})
	}, [ modalities, closeDeleteDialog ])

	useEffect(() => {
		const modalities = collection(getFirestore(), Collections.MODALITIES)
		const q = query(modalities, limit(20))

		return onSnapshot(q, ({ docs }) => {
			setModalities(docs.map(extractData))
		})
	}, [])

	return (
		<>
			<Button
				startIcon={<AddIcon/>}
				variant='contained'
				onClick={() => {
					clickedItemIndex.current = null
					openFormDialog()
				}}
			>Novo Grupo</Button>
			<Box mt='10px'>
				{modalities.map((mod, index) => (
					<Accordion key={mod.id} onClickCapture={() => clickedItemIndex.current = index}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography>{mod.description}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: 'max-content max-content',
									columnGap: .5
								}}
							>
								<Typography component='span'>Tempo Correspondente:</Typography>
								<Typography component='span' fontWeight='bold'>{mod.amount}h</Typography>

								<Typography component='span'>Limite:</Typography>
								<Typography component='span' fontWeight='bold'>{mod.limit}h</Typography>

								<Typography component='span'>Tipo:</Typography>
								<Typography component='span' fontWeight='bold'>{mod.otherType || mod.type}</Typography>
							</Box>
							<Stack direction='row' mt={2}>
								<Button color='secondary' variant="contained" onClick={openFormDialog}>editar</Button>
								<Button color='error' disabled={!mod.canBeDeleted} onClickCapture={() => setDeleteDialogIsOpen(true)}>remover</Button>
							</Stack>
						</AccordionDetails>
					</Accordion>
				))}

				<FeedbackBox
					visible={showFeedback}
					setVisible={setShowFeedback}
					successMessage='Grupo apagado com sucesso'
				/>
			</Box>
			<FormDialog
				title={ (clickedItemIndex.current !== null ? 'Editar' : 'Novo') + ' Grupo' }
				open={formIsOpen}
				data={modalities[clickedItemIndex.current]}
				onClose={closeFormDialog}
			/>

			<Dialog
				open={deleteDialogIsOpen}
				onClose={closeDeleteDialog}
			>
				<DialogTitle>Deseja realmente <b>apagar</b> essa grupo?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Essa ação não pode ser desfeita!
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button color="neutral" onClick={closeDeleteDialog}>Voltar</Button>
					<Button variant="contained" color="error" onClick={deleteAction}>Confirmar</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

function FormDialog({ open, onClose, title, data }) {

	const [ amount, setAmount ] = useState('')
	const [ description, setDescription ] = useState('')
	const [ limit, setLimit ] = useState('')
	const [ type, setType ] = useState('default')
	const [ otherType, setOtherType ] = useState('')

	
	const clearStete = useCallback(() => {
		setAmount('')
		setDescription('')
		setLimit('')
		setOtherType('')
		setType('default')
	}, [])
	
	const types = useRef([
		'default',
		'Hora',
		'Dia',
		'Semestre',
		'Publicação',
		'Inscrição',
		'Apresentação',
		'Evento',
		'Exercício de Cargo',
		'Outro'
	])
	
	const formIsInvalid = useMemo(() =>
		description.length > 300 || isNaN(amount) || isNaN(limit)
		|| type === types.current[0] || someEmpty(description, amount, limit),
	[description, amount, limit, type])

	useEffect(() => {
		if(data) {
			setDescription(data.description)
			setLimit(data.limit.toString())
			setAmount(data.amount.toString())
			setType(data.type)
			setOtherType(data.otherType)
		} else {
			clearStete()
		}
	}, [data, clearStete])

	const save = useCallback(() => {
		const firestore = getFirestore()
		
		const saveObject = {
			description,
			amount,
			limit,
			type,
			otherType,
			canBeDeleted: true
		}
		for (const [k, v] of Object.entries(saveObject)) {
			saveObject[k] = !isNaN(v) ? parseFloat(v) : v
		}

		if(data) {
			updateDoc(doc(firestore, Collections.MODALITIES, data.id), saveObject).then(onClose)
		} else {
			addDoc(collection(firestore, Collections.MODALITIES), saveObject).then(onClose)
		}
	}, [ data, description, amount, limit, type, otherType, onClose ])

	const exit = useCallback(() => {
		onClose()
		clearStete()
	}, [ onClose, clearStete ])

	return (
		<Dialog fullScreen open={open} onClose={exit}>
			<AppBar sx={{ position: 'relative', mb: '25px' }}>
				<Toolbar>
					<IconButton edge='start' color='inherit' onClick={exit}>
						<CloseIcon/>
					</IconButton>
					<Typography ml={2} flex={1} variant="h6" component="div">
						{title}
					</Typography>
					<Button
						sx={{ color: 'inherit' }}
						disabled={formIsInvalid}
						onClick={save}
					>salvar</Button>
				</Toolbar>
			</AppBar>
			<Stack
				spacing={2}
				alignItems='center'
				sx={{ '> *': { width: '30%' } }}
			>
				<TextField
					multiline
					value={description}
					onChange={putEventTargetValue(setDescription)}
					error={description.length > 300}
					label='Descrição'/>

				<TextField
					value={amount}
					onChange={putEventTargetValue(setAmount)}
					error={isNaN(amount)}
					label='Quantidade (em horas)'/>

				<TextField
					value={limit}
					onChange={putEventTargetValue(setLimit)}
					error={isNaN(limit)}
					label='Limite de aproveitamento (em horas)'/>

				<FormControl>
					<InputLabel>Unidade</InputLabel>
					<Select
						value={type}
						onChange={putEventTargetValue(setType)}
						name="type"
						label='Unidade'
					>
						{types.current.map(type =>
							<MenuItem key={type} value={type}>
								{type === types.current[0] ? 'Selecione uma unidade' : type}
							</MenuItem>
						)}
					</Select>
					<FormHelperText>
						Informe como esse grupo será contabilizada.
					</FormHelperText>
				</FormControl>
				{type === types.current.at(-1) &&
					<TextField
						value={otherType}
						placeholder="especifique uma unidade"
						onChange={putEventTargetValue(setOtherType)}
					/>
				}
				<Typography fontStyle='italic' color='neutral.main'>Todos os campos são obrigatórios</Typography>
			</Stack>
		</Dialog>
	)
}

export default Modality