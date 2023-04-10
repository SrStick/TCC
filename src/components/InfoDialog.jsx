import { Dialog, DialogTitle, DialogContent, Box, Divider, Slide, Stack, Typography } from "@mui/material"
import CheckIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/FlagCircle';
import FileView from "./FileView"
import { forwardRef } from "react"
import { Status } from "../helper/firebase"

const SlideTransition = forwardRef((props, ref) => (
	<Slide direction="up" ref={ref} {...props} />
))

function InfoDialog({ open, onClose, task }) {

	const { modality, files, reply, status, description } = task ?? {}

	return (
		<Dialog open={open} onClose={onClose} TransitionComponent={SlideTransition}>
			<DialogTitle>Informações</DialogTitle>
			<DialogContent>
				{ description && (
					<Box mb={'20px'}>
						<Divider sx={{ mb: 1 }}>
							<Typography component='h3' letterSpacing='.1ch' variant="h6">Descrição</Typography>
						</Divider>
						<Typography>{description}</Typography>
					</Box>
				)}
				{ modality && (
					<Box mb={'20px'}>
						<Divider sx={{ mb: 1 }}>
							<Typography component='h3' letterSpacing='.1ch' variant="h6">Modalidade</Typography>
						</Divider>
						<Typography>{modality.description}</Typography>
					</Box>
				)}

				{reply && (
					<Box mb={2}>
						<Divider sx={{ mb: 1 }}>
							<Typography letterSpacing='.1ch' component='h3' variant="h6">Status</Typography>
						</Divider>
						<Stack alignItems='center'>
							<Stack flexDirection='row' alignItems='center' columnGap='.5ch'>
								{status === Status.COMPUTADO ? <CheckIcon color="success" /> : <FlagIcon color='error'/> }
								<Typography component='span' fontSize={'1.3rem'}>{status}</Typography>
							</Stack>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: 'max-content 1fr',
									rowGap: '1.3ch',
									columnGap: '1.5ch',
									my: 2
								}}
							>
								<Typography component='span'>Avaliador:</Typography>
								<Typography component='span'>{reply.author.name}</Typography>
								<Typography component='span'>Avaliado em:</Typography>
								<Typography component='span'>{reply.date}</Typography>
								{status === Status.COMPUTADO ?
									<>
										<Typography component='span'>Tempo obtido:</Typography>
										<Typography component='span'>{reply.hours}h</Typography>
									</>
									:
									<>
										<Typography component='span'>Comentários:</Typography>
										<Typography>{reply.comments}</Typography>
									</>
								}
							</Box>
						</Stack>
					</Box>
				)}
				{ files && (
					<Box>
						<Divider sx={{ mb: 1 }}>
							<Typography component='h3' letterSpacing='.1ch' variant="h6">Arquivos</Typography>
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
									file={file}
								/>
							)}
						</Box>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default InfoDialog