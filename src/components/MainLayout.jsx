import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material'
import { useCallback, useMemo, useState, useContext } from 'react'
import { getAuth } from 'firebase/auth'

import AppBar from './AppBar'
import { UserContext } from '../helper/firebase'
import { Outlet, useLocation } from 'react-router-dom'

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
		<>
			<AppBar
				settings={appBarSettings}
				title={getHederTitle()}
				avatarUrl={getAuth().currentUser.photoURL}
			/>
			<Box sx={{ my: '20px' }}>
				<Outlet/>
			</Box>
			<Dialog open={exitDialogIsOpen} onClose={closeExitDialog}>
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
			</Dialog>
		</>
	)
}

export default MainLayout