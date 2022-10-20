import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined"
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material"

function TaskView({ task, onFileClick }) {
	return (
		<ListItem
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