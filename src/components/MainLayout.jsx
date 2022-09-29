import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material'
import { useCallback, useMemo, useState, useContext, View } from 'react'
import { getAuth } from 'firebase/auth'

import Menu from './Menu'
import { UserContext } from '../helper/firebase'
import { Outlet, useLocation } from 'react-router-dom'
import './styles.css'

function MainLayout() {

	const [ exitDialogIsOpen, setExitDialogIsOpen ] = useState(false)
	
	const closeExitDialog = useCallback(() => setExitDialogIsOpen(false), [])

	const user = useContext(UserContext)

	const singOut = useCallback(() => user.singOut(), [ user ])

	const { state } = useLocation()

	const appBarSettings = useMemo(() => {
		const settings = {}

		if (user.isAdmin) {
			settings['Novo Membro de Colegiado'] = () => console.log('colocar link para a criação de adm')
		}
		settings['Meu Perfil'] = () => console.log('colocar link pro perfil')
		settings['Sair'] = () => setExitDialogIsOpen(true)


		return settings
	}, [ user ])

	const getHederTitle = useCallback(() => {
		if (state)
			return state.headerTitle
		return 'Início'
	}, [ state ])

	return (
		<Box className="container">
			<Box className="aside-left">
				<Menu/>
			</Box>
			<Box className="main">
				{/* ROUTER */}
				<Box sx={{ my: '20px' }}>
					<Outlet/>
				</Box>
			</Box>
			{/* <Dialog open={exitDialogIsOpen} onClose={closeExitDialog}>
				<DialogTitle>Deseja realmente sair?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Sua conta será desconectada e você terá que fazer login novamente.
					</DialogContentText>
					<DialogActions>
						<Button color="error" variant="outlined" onClick={singOut}>
							Confirmar
						</Button>

						<Button onClick={closeExitDialog}>Voltar</Button>
					</DialogActions>
				</DialogContent>
			</Dialog> */}
		</Box>
	)
}


export default MainLayout