import { Fab, Stack, TextField, Typography, LinearProgress, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Box, Tooltip } from "@mui/material"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useCallback, useEffect, useState } from "react";
import { useTrackUploadProgress } from "../../helper/hooks";
import { percentCalc, putEventTargetValue } from '../../helper/short-functions'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, Timestamp } from "firebase/firestore";
import { Collections, extractData, getUserID, Status, useUser } from "../../helper/firebase";
import { useNavigate } from "react-router-dom";

const DESCRIPTION_LIMIT = 300

function SendActivity() {
	const [ files, setFiles ] = useState([])
	const [ modalityId, setModalityId ] = useState('default')
	const [ modalities, setModalities ] = useState([])
	const [ description, setDescription ] = useState('')
	const [ descriptionSizeProgress, setDescriptionSizeProgress ] = useState(0)
	const [ uploadProgress, filesInfo, trackFiles ] = useTrackUploadProgress()

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
					Collections.USERS_TIMES,
					getUserID()
				)

				const withTotalDoc = await getDoc(userRef)
				const modalityData = extractData(modality)
				const isAllowed = withTotalDoc.get('total') < modality.get('limit')
				if(withTotalDoc.exists() && isAllowed) {
					allowedModalities.push(modalityData)
				} else 
					allowedModalities.push(modalityData)
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
			modality: modalities.filter(mod => mod.id = modalityId),
			status: Status.EM_ANALISE,
			date: Timestamp.now(),
			author: {
				uid: getUserID(),
				name: user.info.name
			},
			files
		}).then(() => navigate('/'))
	}, [ description, modalityId, modalities, user, navigate ])

	useEffect(() => {
		if (filesInfo.length === files.length && files.length !== 0) {
			const toURL = file => file.url
			const mergeInfo = (url, i) => ({ ...filesInfo[i], url })

			Promise.all(filesInfo.map(toURL))
			.then(urls => urls.map(mergeInfo))
			.then(onFinishUpload)
		}
	}, [ filesInfo, files, onFinishUpload ])

	const beginUpload = useCallback(() => trackFiles(files), [ files, trackFiles ])

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
				<Box sx={{ position: 'relative', pt: 3 }}>
					<CircularProgress
						sx={{
							alignSelf: 'center',
							position: 'absolute',
							top: 0,
							right: 0,
							mr: 1,
							mb: 1
						}}
						variant="determinate"
						value={descriptionSizeProgress}
						size='20px'
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
						accept=".png,.jpg,.jpeg,.jpe,.pdf"
						hidden
						multiple
						onChange={e => setFiles(Array.from(e.target.files))}
					/>
				</Fab>

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
					{filesInfo.length}/{files.length}
				</Typography>
				
				<Button variant="contained" endIcon={<SendIcon/>} onClick={beginUpload}>Enviar</Button>
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