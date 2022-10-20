import {
	List,
	Stack,
	Typography
} from "@mui/material";

import { useState } from "react";
import { TaskView, InfoDialog } from "../../components";

import { useTaskQuery, getUserID } from '../../helper/firebase';
import { where } from "firebase/firestore";


function CommumUserHome() {
	const tasks = useTaskQuery({
		constraints: [ where('author.uid', '==', getUserID()) ],
		foreach: task => delete task.author,
	})

	const [clickedTask, setClickedTask] = useState()

	return (
		<>
			<IfBlock condition={!tasks.length}>
				<Stack alignItems={'center'} justifyContent={'center'} bgcolor={'neutral.main'}>
					<Typography color={'neutral.contrastText'} padding={2}>Comece adicionando uma atividade.</Typography>
				</Stack>
			</IfBlock>

			<List sx={{ maxWidth: 260 }}>
				{tasks.map(task =>
					<TaskView
						key={task.id}
						task={task}
						onFileClick={() => setClickedTask(task)}
					/>
				)}
			</List>

			<InfoDialog
				open={!!clickedTask}
				onClose={() => setClickedTask(null)}
				task={clickedTask}
			/>
		</>
	)
}

const IfBlock = ({ condition, children }) => {
	if (condition) return children
}

export default CommumUserHome