import { useEffect, useState, useCallback } from "react"
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, onSnapshot, query, updateDoc } from "firebase/firestore"
import { Collections, extractData } from "../../helper/firebase"
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Stack, Dialog, AppBar, Toolbar, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material"
import { Box } from "@mui/material"

import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import { PatternFunctions, useTextPatterns } from "../../helper/hooks"
import { useRef } from "react"

function Modality() {
	const [modalities, setModalities] = useState([])
	const [clickedItemIndex, setClickedItemIndex] = useState(null)
	const [formIsOpen, setFormIsOpen] = useState(false)
	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)

	const deleteAction = useCallback(() => {
		const { id: docId } = modalities[clickedItemIndex]
		deleteDoc(doc(getFirestore(), Collections.MODALITIES, docId))
		setDeleteDialogIsOpen(false)
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
			>Nova Modalidade</Button>
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
								<Typography component='span' fontWeight='bold'>{mod.correspondingTime}h</Typography>

								<Typography component='span'>Limite:</Typography>
								<Typography component='span' fontWeight='bold'>{mod.limit}h</Typography>

								<Typography component='span'>Tipo:</Typography>
								<Typography component='span' fontWeight='bold'>{mod.type === 'Outro' ? mod.otherType : mod.type}</Typography>
							</Box>
							<Stack direction='row' mt={2}>
								<Button color='secondary' variant="contained" onClick={openFormDialog}>editar</Button>
								<Button color='error' onClickCapture={() => setDeleteDialogIsOpen(true)}>remover</Button>
							</Stack>
						</AccordionDetails>
					</Accordion>
				))}

			</Box>
			<FormDialog
				title={ (clickedItemIndex !== null ? 'Editar' : 'Nova') + ' Modalidade' }
				open={formIsOpen}
				data={modalities[clickedItemIndex]}
				onClose={closeFormDialog}
			/>

			<Dialog
				open={deleteDialogIsOpen}
				onClose={closeDeleteDialog}
			>
				<DialogTitle>Deseja realmente <b>apagar</b> essa modalidade?</DialogTitle>
				<DialogContent>
					<DialogContentText>Essa ação não pode ser desfeita!</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button color="neutral" onClick={closeDeleteDialog}>Voltar</Button>
					<Button variant="contained" color="error" onClick={deleteAction}>Confirmar</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

const defaultInnerData = { type: 'Hora' }

function FormDialog({ open, onClose, title, data }) {
	const [ innerData, setInnerData ] = useState()
	const description = useTextPatterns(PatternFunctions.limit(300))
	const limit = useTextPatterns(PatternFunctions.onlyNumbers)
	const correspondingTime = useTextPatterns(PatternFunctions.onlyNumbers)


	const types = useRef([
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
		setInnerData(oldData => ({ ...oldData, correspondingTime: correspondingTime.value }))
	}, [ correspondingTime.value ])

	const save = useCallback(() => {
		const firestore = getFirestore()
		
		const copyOfInnerData = {
			...innerData,
			correspondingTime: parseInt(innerData.correspondingTime, 10),
			limit: parseInt(innerData.limit, 10)
		}

		if(data) {
			updateDoc(doc(firestore, Collections.MODALITIES, data.id), copyOfInnerData).then(onClose)
		} else {
			addDoc(collection(firestore, Collections.MODALITIES), copyOfInnerData).then(onClose)
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
					<Button sx={{ color: 'inherit' }} onClick={save}>salvar</Button>
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
					value={innerData?.correspondingTime ?? ''}
					name='correspondingTime'
					onChange={correspondingTime.onChange}
					label='Tempo correspondente'/>

				<TextField
					value={innerData?.limit ?? ''}
					onChange={limit.onChange}
					label='Limite de aproveitamento (em horas)'/>


				<FormControl>
					<InputLabel>Tipo</InputLabel>
					<Select
						value={innerData?.type}
						onChange={updateInnerData()}
						name="type"
						label='Tipo'
					>
						{types.current.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>) }
					</Select>
					<FormHelperText>
						Informe como essa modalidade será contabilizada.
					</FormHelperText>
				</FormControl>
				{innerData?.type === 'Outro' &&
					<TextField
						value={innerData?.otherType ?? ''}
						name='otherType'
						onChange={updateInnerData()}
					/>
				}
			</Stack>
		</Dialog>
	)
}

export default Modality