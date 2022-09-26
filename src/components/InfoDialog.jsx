import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"

import FileView from "./FileView"
import { Box, Divider, Slide, Typography } from "@mui/material"
import { forwardRef } from "react"

const isValidModality = modality => typeof modality === 'object'

const SlideTransition = forwardRef((props, ref) => (
	<Slide direction="up" ref={ref} {...props} />
))

function InfoDialog({ open, onClose, task }) {
	const { modality, files } = task ?? {}
	return (
		<Dialog open={open} onClose={onClose} TransitionComponent={SlideTransition} keepMounted>
			<DialogTitle>Informações</DialogTitle>
			<DialogContent>
				{ isValidModality(modality) && (
					<Box mb={'20px'}>
						<Divider sx={{ mb: 1 }}>
							<Typography component='h3' variant="h6">Modalidade</Typography>
						</Divider>
						<Typography variant="body1">{modality.description}</Typography>
					</Box>
				)}
				{ files && (
					<>
						<Divider sx={{ mb: 1 }}>
							<Typography component='h3' variant="h6">Arquivos</Typography>
						</Divider>
						<Box
							sx={{
								display: 'grid',
								gap: '5px',
								gridTemplateColumns: 'repeat(3, 1fr)'
							}}
						>
							{files.map(file =>
								<FileView
									key={file.name}
									alt={file.name}
									type={file.type}
									url={file.url}
								/>
							)}
						</Box>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default InfoDialog