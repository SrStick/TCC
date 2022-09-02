import { useEffect, useState, useCallback } from "react"
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, onSnapshot, query, updateDoc } from "firebase/firestore"
import { Layout } from "../../components"
import { Colllections } from "../../helper/firebase"
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Stack, Dialog, AppBar, Toolbar, IconButton, TextField } from "@mui/material"
import { Box } from "@mui/material"

import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import { putEventTargetValue } from "../../helper/short-functions"

function Modality() {
	const [modalities, setModalities] = useState([])
	const [clickedItemIndex, setClickedItemIndex] = useState()
	const [formIsOpen, setFormIsOpen] = useState(false)

	const deleteAction = useCallback(() => {
		const { id: docId } = modalities[clickedItemIndex]
		deleteDoc(doc(getFirestore(), Colllections.MODALITIES, docId))
	}, [ modalities, clickedItemIndex ])

	const closeFormDialog = useCallback(() => {
		setFormIsOpen(false)
		setClickedItemIndex(null)
	}, [])
	
	const openFormDialog = useCallback(() => setFormIsOpen(true), [])

	useEffect(() => {
		const modalities = collection(getFirestore(), Colllections.MODALITIES)
		const q = query(modalities, limit(20))

		if(process.env.NODE_ENV === 'development') setModalities([])

		return onSnapshot(q, snap => {
			for (const { type, doc, oldIndex } of snap.docChanges()) {
				const newData = { id: doc.id, ...doc.data() }

				switch (type) {
					case 'added':
						setModalities(oldValue => [ ...oldValue, newData ])
					break;

					case 'modified':
						setModalities(oldValue => {
							const copy = [ ...oldValue ]
							copy[oldIndex] = newData
							return copy
						})
					break
					
					case 'removed':
						setModalities(oldValue => {
							const copy = [ ...oldValue ]
							copy.splice(oldIndex, 1)
							return copy
						})
				}
			}
		})
	}, [])

	return (
		<Layout headerTitle='Modalidades' indent>
			<Button startIcon={<AddIcon/>} variant='contained'>Nova Modalidade</Button>
			<Box mt='10px'>
				{modalities.map(mod => (
					<Accordion key={mod.id} onClickCapture={() => setClickedItemIndex(mod.id)}>
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
				title={ (clickedItemIndex ? 'Editar' : 'Nova') + ' Modalidade' }
				open={formIsOpen}
				data={modalities[clickedItemIndex]}
				onClose={closeFormDialog}
			/>
		</Layout>
	)
}

function FormDialog({ open, onClose, title, data }) {
	const [description, setDescription] = useState('')
	const [limit, setLimit] = useState(0)
	const [parity, setParity] = useState(0)

	const save = useCallback(() => {
		const firestore = getFirestore()
		const newData = { description, limit, parity }
		if(data) {
			updateDoc(doc(firestore, Colllections.MODALITIES, data.id), newData).then(onClose)
		} else {
			addDoc(collection(firestore, Colllections.MODALITIES), newData).then(onClose)
		}
	}, [ data, description, limit, parity, onClose ])

	return (
		<Dialog fullScreen open={open} onClose={onClose}>
			<AppBar sx={{ position: 'relative' }}>
				<Toolbar>
					<IconButton edge='start' color='inherit' onClick={onClose}>
						<CloseIcon/>
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						{title}
					</Typography>
					<Button onClick={save}>salvar</Button>
				</Toolbar>
			</AppBar>
			<Stack>
				<TextField
					multiline
					defaultValue={data?.description}
					onBlur={putEventTargetValue(setDescription)}
					label='Descrição'
				/>
				<TextField
					defaultValue={data?.limit}
					onBlur={putEventTargetValue(setLimit)}
					type='number'
					label='Limite'
				/>
				<TextField
					defaultValue={data?.parity}
					onBlur={putEventTargetValue(setParity)}
					type='number'
					label='Paridade'/>
			</Stack>
		</Dialog>
	)
}

export default Modality