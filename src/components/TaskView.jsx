import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined"
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material"

function TaskView({ task, onFileClick }) {
	return (
		<ListItem
			sx={{
				bgcolor: '#fff',
				borderRadius: 1,
				boxShadow: '4px 4px 10px 0px rgba(0,0,0,0.25)'
			}}
			secondaryAction={
				<IconButton onClick={onFileClick} edge="end">
					<FilePresentOutlinedIcon />
				</IconButton>
			}
		>
			<ListItemText
				primary={task.description}
				secondary={
					<>
						<Typography
							sx={{ display: 'inline' }}
							component="span"
							variant="body2"
							color="text.primary"
						>
							{task.status}
						</Typography>
						{' - '}<time>{task.date}</time>
					</>
				}
			/>
		</ListItem>
	)
}

export default TaskView