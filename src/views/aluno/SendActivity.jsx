import { Fab, Stack, TextField, Typography, LinearProgress, Button, Select, MenuItem, FormControl, InputLabel, Box, Tooltip } from "@mui/material"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useCallback, useEffect, useState } from "react";
import { useTrackUploadProgress } from "../../helper/hooks";
import { someEmpty, percentCalc, putEventTargetValue } from '../../helper/short-functions'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, Timestamp } from "firebase/firestore";
import { Collections, extractData, getUserID, Status, useUser } from "../../helper/firebase";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const DESCRIPTION_LIMIT = 300

const allowedFileTypes = ['png', 'jpg', 'jpeg', 'jpe', 'pdf']


function SendActivity() {
	const [ files, setFiles ] = useState([])
	const [ modalityId, setModalityId ] = useState('default')
	const [ modalities, setModalities ] = useState([])
	const [ description, setDescription ] = useState('')
	const [ descriptionSizeProgress, setDescriptionSizeProgress ] = useState(0)
	const [ sendButtonClicked, setSendButtonClicked ] = useState(false)

	const [ uploadProgress, completedUploads, trackFiles ] = useTrackUploadProgress()

	const notAllowedFileType = useMemo(() => {
		const notAllowed = file => {
			const fileExt = file.name.split('.')[1]
			return !fileExt || allowedFileTypes.every(v => v !== fileExt)
		}
		return files.some(notAllowed)
	}, [ files ])

	const [ modiltyIsDefautOnSend, setModiltyIsDefautOnSend ] = useState(false)

	const user = useUser()
	const navigate = useNavigate()


	useEffect(() => {
		const modalitiesCollection = collection(getFirestore(), Collections.MODALITIES)
		console.time('filterMods')
		getDocs(modalitiesCollection).then(async ({ docs }) => {
			const allowedModalities = []
			for (const modality of docs) {
				const userRef = doc(
					getFirestore(),
					Collections.MODALITIES,
					modality.id,
					Collections.USER_TIMES,
					getUserID()
				)
				const withTotalDoc = await getDoc(userRef)
				const isAllowed = withTotalDoc.get('total') < modality.get('limit')
				if ((withTotalDoc.exists() && isAllowed) || !withTotalDoc.exists()) 
					allowedModalities.push(extractData(modality))
			}
			console.timeEnd('filterMods')
			setModalities(allowedModalities)
		})
	}, [])




	useEffect(() => {
		setDescriptionSizeProgress(percentCalc(description.length, DESCRIPTION_LIMIT))
	}, [ description ])




	const removeFile = useCallback(name => {
		setFiles(prevValue => prevValue.filter(file => file.name !== name));
	}, [])




	const onDescriptionChange = useCallback(({ target: { value: text } }) => {
		const progress = percentCalc(text.length, DESCRIPTION_LIMIT)
		if(progress <= 100 || text.length < description.length) {
			setDescription(text)
		}
	}, [ description ])




	const onPasteDescription = ev => {
		ev.preventDefault()
		const pastedContent = ev.clipboardData.getData('text/plain')
		setDescription(oldDescription => 
			(oldDescription + pastedContent).substring(0, DESCRIPTION_LIMIT).trim()
		)
	}

	const onFinishUpload = useCallback(files => {
		addDoc(collection(getFirestore(), Collections.TASKS), {
			description,
			modality: modalities.find(mod => mod.id === modalityId),
			status: Status.EM_ANALISE,
			date: Timestamp.now(),
			author: {
				uid: getUserID(),
				name: user.info.name
			},
			files
		}).then(() => navigate('/'))
	}, [ description, modalityId, modalities, user, navigate ])

	const beginUpload = useCallback(() => {
		const modalityIsDefault = modalityId === 'default'
		if(!modalityIsDefault) {
			setSendButtonClicked(true)
			trackFiles(files, onFinishUpload)
		}
		
		setModiltyIsDefautOnSend(modalityIsDefault)
	}, [ files, trackFiles, onFinishUpload, modalityId ])

	return (
		<>
			<Stack alignItems='center' spacing={2}>
				<FormControl sx={{ width: '400px' }}>
					<InputLabel>Modalidade</InputLabel>
					<Select
						label="Modalidade"
						onChange={putEventTargetValue(setModalityId)}
						value={modalityId}
					>
						<MenuItem value='default'>Escolha uma modalidade</MenuItem>
						{modalities.map(({ description, id }) =>
							<MenuItem key={description} value={id}>{description}</MenuItem>
						)}
					</Select>
				</FormControl>
				{ modiltyIsDefautOnSend && (
					<Typography fontStyle='italic' color='error'>
						Selecione uma modalidade
					</Typography>
				)}
				<Box sx={{ pt: 3 }}>
					<LinearProgress
						variant="determinate"
						value={descriptionSizeProgress}
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Descrição"
						minRows={4}
						value={description}
						onChange={onDescriptionChange}
						multiline
						onPaste={onPasteDescription}
					/>
				</Box>
				<Fab color="primary" component='label'>
					<UploadFileIcon/>
					<input
						type='file'
						accept={allowedFileTypes.map(s => '.' + s).join(',')}
						hidden
						multiple
						onChange={e => setFiles(Array.from(e.target.files))}
					/>
				</Fab>
				{ notAllowedFileType &&
				<Typography fontStyle='italic' color='error'>
					São permitidos somente arquivos em PDF ou imagens.
				</Typography>
				}
				<Stack direction='row' spacing={2} sx={{ border: '1px solid #e0e0e0', p: '15px' }}>
					{files.map(({ name }) => <FileItem key={name} name={name} onClose={removeFile} />)}
				</Stack>
				
				<LinearProgress
					sx={{ width: '25%' }}
					variant='determinate'
					value={uploadProgress}
					color="secondary"
				/>
				<Typography variant="body1" component='span'>
					{completedUploads}/{files.length}
				</Typography>
				
				<Button
					variant="contained"
					endIcon={<SendIcon/>}
					onClick={beginUpload}
					disabled={ sendButtonClicked || notAllowedFileType || files.length === 0 || someEmpty(description)}
				>Enviar</Button>
			</Stack>
		</>
	)
}

function FileItem({ name, onClose, onDoubleClick }) {
	return (
		<Stack alignItems='center' onDoubleClick={onDoubleClick}>
			<CloseIcon
				color="error"
				fontSize="0.7rem"
				titleAccess="remover item"
				onClick={() => onClose(name)}
			/>
			{name.includes('.pdf') ? <ArticleIcon color="secondary" /> : <InsertPhotoIcon color="secondary" />}
			<Tooltip title={name}>
				<Typography
					textTransform='uppercase'
					fontSize='0.7rem'
					variant="subtitle1"
					fontWeight='bold'
					bgcolor='secondary.main'
					color='white'
					px='5px'
					whiteSpace='nowrap'
					overflow='hidden'
					textOverflow='ellipsis'
					maxWidth='9ch'
				>{name}</Typography>
			</Tooltip>
		</Stack>
	)
}

export default SendActivity