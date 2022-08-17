import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined"
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material"
import { Fragment } from "react"

function TaskView({ task, onFileClick }) {
	return (
		<ListItem
			secondaryAction={(
				<IconButton onClick={onFileClick} edge="end">
					<FilePresentOutlinedIcon />
				</IconButton>
			)}
		>
			<ListItemText
				primary="lorem ashjdf sdfsdf fddfdf"
				secondary={
					<Fragment>
						<Typography
							sx={{ display: 'inline' }}
							component="span"
							variant="body2"
							color="text.primary"
						>
							{task.status}
						</Typography>
						{' - ' + task.date}
					</Fragment>
				}
			/>
		</ListItem>
	)
}

export default TaskView