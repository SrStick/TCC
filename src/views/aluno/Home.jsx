import {
	CircularProgress,
	List,
	Stack,
	Typography
} from "@mui/material";

import { useState } from "react";
import { TaskView, InfoDialog } from "../../components";

import { useTaskQuery, getUserID } from '../../helper/firebase';
import { where } from "firebase/firestore";


function CommumUserHome() {
	const {data : tasks } = useTaskQuery({
		constraints: [ where('author.uid', '==', getUserID()) ],
		foreach: task => delete task.author,
	})


	const [clickedTask, setClickedTask] = useState()

	return (
		<>
			<IfBlock condition={tasks === null || (tasks !== null && tasks.length === 0)}>
				<Stack
					alignItems={'center'}
					justifyContent={'center'}
					bgcolor={'neutral.main'}
					color={'neutral.contrastText'}
					borderRadius={1}
				>
					{ tasks !== null ?
						<Typography color={'inherit'} padding={2}>
							Bem vindo, começe adicionando uma atividade.
						</Typography>
					:
						<CircularProgress color={'inherit'} sx={{ my: 2 }}/>
					}
				</Stack>
			</IfBlock>
			<Stack alignItems={'center'}>
				<List sx={{ minWidth: 300 }}>
					{tasks.map(task =>
						<TaskView
							key={task.id}
							task={task}
							onFileClick={() => setClickedTask(task)}
						/>
					)}
				</List>
			</Stack>

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