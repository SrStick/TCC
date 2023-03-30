import { useEffect, useState, useCallback, useRef } from "react"
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, onSnapshot, query, updateDoc } from "firebase/firestore"
import { Collections, extractData } from "../../helper/firebase"
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Button, Stack, Dialog, AppBar, Toolbar, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import { PatternFunctions, useTextPatterns } from "../../helper/hooks"
import { someEmpty } from "../../helper/short-functions"
import FeedbackBox from "../../components/FeedbackBox";

function Modality() {
	const [modalities, setModalities] = useState([])
	const [clickedItemIndex, setClickedItemIndex] = useState(null)
	const [formIsOpen, setFormIsOpen] = useState(false)
	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
	const [ showFeedback, setShowFeedback ] = useState(false)

	const deleteAction = useCallback(() => {
		const { id: docId } = modalities[clickedItemIndex]

		deleteDoc(doc(getFirestore(), Collections.MODALITIES, docId))
			.then(() => {
				closeDeleteDialog()
				setShowFeedback(true)
			})
	}, [ modalities, clickedItemIndex ])

	const closeFormDialog = useCallback(() => {
		setFormIsOpen(false)
		setClickedItemIndex(null)
	}, [])
	
	const openFormDialog = useCallback(() => setFormIsOpen(true), [])
	const closeDeleteDialog = useCallback(() => setDeleteDialogIsOpen(false), [])

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
					setClickedItemIndex(null)
					openFormDialog()
				}}
			>Novo Grupo</Button>
			<Box mt='10px'>
				{modalities.map((mod, index) => (
					<Accordion key={mod.id} onClickCapture={() => setClickedItemIndex(index)}>
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
				title={ (clickedItemIndex !== null ? 'Editar' : 'Novo') + ' Grupo' }
				open={formIsOpen}
				data={modalities[clickedItemIndex]}
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

const defaultInnerData = { type: 'default' }

function FormDialog({ open, onClose, title, data }) {
	const [ innerData, setInnerData ] = useState()
	const description = useTextPatterns(PatternFunctions.limit(300))
	const limit = useTextPatterns(PatternFunctions.onlyNumbers)
	const amount = useTextPatterns(PatternFunctions.onlyNumbers)


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

	useEffect(() => {
		if(data) {
			setInnerData(data)
		} else {
			setInnerData(defaultInnerData)
		}
	}, [data])

	const updateInnerData = useCallback(Conversor => {
		return ({ target: { value, name }}) => {
			setInnerData(oldData => ({ ...oldData, [name]: Conversor ? Conversor(value) : value }))
		}
	}, [])

	useEffect(() => {
		setInnerData(oldData => ({ ...oldData, limit: limit.value }))
	}, [ limit.value ])

	useEffect(() => {
		setInnerData(oldData => ({ ...oldData, description: description.value }))
	}, [ description.value ])

	useEffect(() => {
		setInnerData(oldData => ({ ...oldData, amount: amount.value }))
	}, [ amount.value ])

	const save = useCallback(() => {
		const firestore = getFirestore()
		
		const saveObject = {}
		for (const [k, v] of Object.entries(innerData)) {
			saveObject[k] = !isNaN(v) ? parseFloat(v) : v
		}

		saveObject.canBeDeleted = true

		if(data) {
			updateDoc(doc(firestore, Collections.MODALITIES, data.id), saveObject).then(onClose)
		} else {
			addDoc(collection(firestore, Collections.MODALITIES), saveObject).then(onClose)
		}
	}, [ data, innerData, onClose ])

	const exit = useCallback(() => {
		onClose()
		setInnerData(defaultInnerData)
	}, [ onClose ])

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
						disabled={someEmpty(description.value, amount.value, limit.value) || innerData.type === types.current[0]}
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
					value={innerData?.description ?? ''}
					onChange={description.onChange}
					label='Descrição'/>

				<TextField
					value={innerData?.amount ?? ''}
					name='amount'
					onChange={amount.onChange}
					label='Quantidade (em horas)'/>

				<TextField
					value={innerData?.limit ?? ''}
					onChange={limit.onChange}
					label='Limite de aproveitamento (em horas)'/>


				<FormControl>
					<InputLabel>Unidade</InputLabel>
					<Select
						value={innerData?.type}
						onChange={updateInnerData()}
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
				{innerData?.type === types.current.at(-1) &&
					<TextField
						value={innerData?.otherType ?? ''}
						name='otherType'
						placeholder="especifique uma unidade"
						onChange={updateInnerData()}
					/>
				}
				<Typography fontStyle='italic' color='neutral.main'>Todos os campos são obrigatórios</Typography>
			</Stack>
		</Dialog>
	)
}

export default Modality