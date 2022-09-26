import { useTaskQuery } from "../../helper/firebase"
import { InfoDialog } from '../../components'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Slide, TextField, Tooltip, Typography } from "@mui/material"
import { useState, useCallback, useMemo, forwardRef } from "react";

import InfoIcon from '@mui/icons-material/InfoOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

const SlideTransition = forwardRef((props, ref) => 
	<Slide direction="up" ref={ref} {...props} />
)

function AdminHome() {

	const taskOptions = useMemo(() => ({ bindModality: true }), [])
	const tasks = useTaskQuery(taskOptions)

	const [ clickedIndex, setClickedIndex ] = useState(null)
	const [ infoIsOpen, setInfoIsOpen ] = useState(false)
	const [ openStatusChange, setOpenStatusChange ] = useState(false)
	const [ rejectCurrentTask, setRejectCurrentTask ] = useState(false)

	const toRow = useCallback(({ id, description, date, author }, index) => (
		<tr key={id}>
			<td>{description}</td>
			<td>{date}</td>
			<td>{author.name}</td>
			<td onClickCapture={() => setClickedIndex(index)}>
				<Tooltip title="Mais informações">
					<IconButton color='info' onClickCapture={() => setInfoIsOpen(true)}>
						<InfoIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title="Avaliar">
					<IconButton onClick={() => setOpenStatusChange(true)}>
						<FactCheckIcon />
					</IconButton>
				</Tooltip>
			</td>
		</tr>
	), [])

	const closeStatusChangeDialog = useCallback(() => {
		setRejectCurrentTask(false)
		setOpenStatusChange(false)
	}, [])

	return (
		<>
			<table>
				<thead>
					<tr>
						<th>Descrição</th>
						<th>Data</th>
						<th>Autor</th>
						<th>Ações</th>
					</tr>
				</thead>
				<tbody>
					{tasks.map(toRow)}
				</tbody>
			</table>

			<Dialog
				open={openStatusChange}
				TransitionComponent={SlideTransition}
				keepMounted
			>
				<DialogTitle>Atenção</DialogTitle>
				<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{ !rejectCurrentTask ?
						<>
							<Typography>
								O aluno {tasks[clickedIndex]?.author.name} reinvindica receber {' '}
								<Typography component='span' fontWeight='bold'>? horas</Typography>.
							</Typography>
							<Divider/>
							<Typography>
								Para confirar digite o número de horas requeridas no campo a baixo ou inseira outro
								valor que ele receberá por essa atividade.
							</Typography>
							<TextField placeholder="12" />
						</>
						:
						<>
							<Typography>Dexe algum comentário para, por exemplo, explicar o motivo.</Typography>
							<TextField multiline minRows={3} />
						</>
					}
				</DialogContent>
				<DialogActions>
					<Button
						color="neutral"
						sx={{ mr: 'auto' }}
						onClick={closeStatusChangeDialog}
					>Voltar</Button>

					<Button
						startIcon={ <CloseIcon/> }
						color="error"
						variant="outlined"
						onClick={() => {
							if(!rejectCurrentTask) {
								setRejectCurrentTask(true)
							} else {
								console.log('atividade rejeitada');
								closeStatusChangeDialog()
							}
						}}
					>{rejectCurrentTask ? 'Confirmar' : 'Rejeitar'}</Button>

					{!rejectCurrentTask &&
						<Button
							startIcon={ <CheckIcon/> }
							variant="outlined"
						>Confirmar</Button>
					}
				</DialogActions>
			</Dialog>
			
			<InfoDialog
				open={infoIsOpen}
				onClose={() => setInfoIsOpen(false)}
				task={tasks[clickedIndex]}
			/>
		</>
	)
}

export default AdminHome