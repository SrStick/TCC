import { Fab, Stack, TextField, Typography, LinearProgress, Button, Select, MenuItem, FormControl, InputLabel} from "@mui/material"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useCallback, useEffect, useState } from "react";
import { useTrackUploadProgress } from "../../helper/hooks";
import { putEventTargetValue } from '../../helper/short-functions'
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { Colllections, getUserID, Status } from "../../helper/firebase";


function UploadForm() {
	const [ files, setFiles ] = useState([])
	const [ modality, setModality ] = useState('')
	const [ modalities, setModalities ] = useState([])
	const [ description, setDescription ] = useState('')
	const [ uploadProgress, filesInfo, trackFiles ] = useTrackUploadProgress()

	useEffect(() => setModalities(require('../../modalities.json')), [])

	const removeFile = useCallback(name => {
		setFiles(prevValue => prevValue.filter(file => file.name !== name));
	}, [])

	const onFinishUpload = useCallback(files => {
		addDoc(collection(getFirestore(), Colllections.TASKS), {
			description,
			modality,
			status: Status.EM_ANALISE,
			date: new Date().toISOString(),
			authorID: getUserID(),
			files
		})
	}, [ description, modality ])

	useEffect(() => {
		if (filesInfo.length === files.length && files.length !== 0) {
			const toURL = file => file.url
			const putTypeAndName = (url, i) => ({
				url,
				type: filesInfo[i].type,
				name: filesInfo[i].name,
			})
			Promise.all(filesInfo.map(toURL))
			.then(urls => urls.map(putTypeAndName))
			.then(onFinishUpload)
		}
	}, [ filesInfo, files, onFinishUpload ])

	const beginUpload = useCallback(() => trackFiles(files), [ files, trackFiles ])

	return (
		<Stack alignItems='center' spacing={5}>
			<FormControl sx={{ width: '400px' }}>
				<InputLabel>Modalidade</InputLabel>
				<Select
					label="Modalidade"
					onChange={putEventTargetValue(setModality)}
					value={modality}
				>
					{modalities.map(({ grupo }, i) => (
						<MenuItem key={grupo} value={i}>{grupo}</MenuItem>
					))}
				</Select>
			</FormControl>
			<TextField
				label="Descrição"
				rows={4}
				onChange={putEventTargetValue(setDescription)}
				multiline
			/>
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
	)
}

function FileItem({ name, onClose }) {
	return (
		<Stack alignItems='center'>
			<CloseIcon
				color="error"
				fontSize="0.7rem"
				titleAccess="remover item"
				onClick={() => onClose(name)}
			/>
			{name.includes('.pdf') ? <ArticleIcon color="secondary" /> : <InsertPhotoIcon color="secondary" />}
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
		</Stack>
	)
}

export default UploadForm