import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	List,
	Stack
} from "@mui/material";

import { useEffect, useState } from "react";
import { FileView, TaskView } from "../../components";

import AddIcon from '@mui/icons-material/Add';
import * as Firebase from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import * as FirebaseAux from '../../helper/firebase';

function TaskFactory(data) {
	delete data.authorID
	return oldTasks => [...oldTasks, data]
}

function Home() {
	const [tasks, setTasks] = useState([])
	const [clickedTask, setClickedTask] = useState()

	const navigate = useNavigate()

	useEffect(() => {
		const { Colllections, getUserID } = FirebaseAux
		const { query, onSnapshot, where, limit, collection, getFirestore } = Firebase
		
		const tasksPath = collection(getFirestore(), Colllections.TASKS)
		const q = query(tasksPath, where('authorID', '==', getUserID()), limit(20))
		setTasks([])

		return onSnapshot(q, changes => {
			for (const { type, doc } of changes.docChanges()) {
				if(type === 'added') {
					const data = { id: doc.id, ...doc.data() }
					setTasks(TaskFactory(data))
				}
			}
		})
	}, [])

	return (
		<>
			<List sx={{ width: '100%', maxWidth: 260 }}>
				{tasks.map(task =>
					<TaskView
						key={task.id}
						task={task}
						onFileClick={() => setClickedTask(task)}
					/>
				)}
			</List>

			<Stack alignItems='center'>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => navigate('/upload-form')}
				>Nova atividade</Button>
			</Stack>

			<Dialog open={!!clickedTask} onClose={() => setClickedTask(null) }>
				<DialogTitle>Arquivos</DialogTitle>
				<DialogContent>
					<Stack direction='row' divider={<Divider orientation="vertical" flexItem />}>
						{clickedTask && clickedTask.files.map(file =>
							<FileView key={file.name} type={file.type} url={file.url}/> 
						)}
					</Stack>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default Home
