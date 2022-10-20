import { useEffect, useState, useCallback } from "react"
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, onSnapshot, query, updateDoc } from "firebase/firestore"
import { Collections, extractData } from "../../helper/firebase"
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Stack, Dialog, AppBar, Toolbar, IconButton, TextField } from "@mui/material"
import { Box } from "@mui/material"

import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import { putEventTargetValue } from "../../helper/short-functions"

function Modality() {
	const [modalities, setModalities] = useState([])
	const [clickedItemIndex, setClickedItemIndex] = useState(null)
	const [formIsOpen, setFormIsOpen] = useState(false)

	const deleteAction = useCallback(() => {
		const { id: docId } = modalities[clickedItemIndex]
		deleteDoc(doc(getFirestore(), Collections.MODALITIES, docId))
	}, [ modalities, clickedItemIndex ])

	const closeFormDialog = useCallback(() => {
		setFormIsOpen(false)
		setClickedItemIndex(null)
	}, [])
	
	const openFormDialog = useCallback(() => setFormIsOpen(true), [])

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
								<Typography component='span'>Limite:</Typography>
								<Typography component='span' fontWeight='bold'>{mod.limit}h</Typography>

								<Typography component='span'>Paridade:</Typography>
								<Typography component='span' fontWeight='bold'>1:{mod.parity}</Typography>
							</Box>
							<Stack direction='row' mt={2}>
								<Button color='secondary' variant="contained" onClick={openFormDialog}>editar</Button>
								<Button color='error' onClickCapture={deleteAction}>remover</Button>
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
		</>
	)
}

function FormDialog({ open, onClose, title, data }) {
	const [description, setDescription] = useState('')
	const [limit, setLimit] = useState(0)
	const [parity, setParity] = useState(0)

	useEffect(() => {
		if(data) {
			setDescription(data.description)
			setLimit(data.limit)
			setParity(data.parity)
		} else {
			setDescription('')
			setLimit(0)
			setParity(0)
		}
	}, [data])

	const save = useCallback(() => {
		const firestore = getFirestore()
		const newData = { description, limit, parity }
		if(data) {
			updateDoc(doc(firestore, Collections.MODALITIES, data.id), newData).then(onClose)
		} else {
			addDoc(collection(firestore, Collections.MODALITIES), newData).then(onClose)
		}
	}, [ data, description, limit, parity, onClose ])

	return (
		<Dialog fullScreen open={open} onClose={onClose}>
			<AppBar sx={{ position: 'relative', mb: '25px' }}>
				<Toolbar>
					<IconButton edge='start' color='inherit' onClick={onClose}>
						<CloseIcon/>
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						{title}
					</Typography>
					<Button sx={{ color: 'inherit' }} onClick={save}>salvar</Button>
				</Toolbar>
			</AppBar>
			<Stack spacing={2}>
				<TextField
					multiline
					value={description}
					onChange={putEventTargetValue(setDescription)}
					label='Descrição'/>
				<TextField
					value={limit}
					onChange={putEventTargetValue(setLimit, Number)}
					type='number'
					label='Limite'/>
				<TextField
					value={parity}
					onChange={putEventTargetValue(setParity, Number)}
					type='number'
					label='Paridade'/>
			</Stack>
		</Dialog>
	)
}

export default Modality