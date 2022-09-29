import {
	Button,
	List,
	Stack
} from "@mui/material";

import { useState } from "react";
import { TaskView, InfoDialog } from "../../components";

import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { useTaskQuery, getUserID } from '../../helper/firebase';
import { where } from "firebase/firestore";
import { useMemo } from "react";


function CommumUserHome() {
	const tasksOptions = useMemo(() => ({
		constraints: [ where('author.uid', '==', getUserID()) ],
		foreach: task => delete task.author,
	}), [])
	
	const tasks = useTaskQuery(tasksOptions)

	const [clickedTask, setClickedTask] = useState()
	
	const navigate = useNavigate()


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
					onClick={() => navigate('/send-activity', { state: { headerTitle: 'Nova Atividade' } })}
				>Nova atividade</Button>
			</Stack>

			<InfoDialog
				open={!!clickedTask}
				onClose={() => setClickedTask(null)}
				task={clickedTask}
			/>
		</>
	)
}

export default CommumUserHome