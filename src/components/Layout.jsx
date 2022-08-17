import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useCallback, useMemo, useState, Fragment } from 'react'
import { getAuth } from 'firebase/auth'

import AppBar from './AppBar'

export default function Layout({ children }) {

	const [ exitDialogIsOpen, setExitDialogIsOpen ] = useState(false)
	
	const closeExitDialog = useCallback(() => setExitDialogIsOpen(false), [])

	const singOut = useCallback(() => getAuth().signOut(), [])

	const appBarSettings = useMemo(() => {
		return {
			Sair: () => setExitDialogIsOpen(true)
		}
	}, [])

	return (
		<Fragment>
			<AppBar settings={appBarSettings}/>

			{children}
			
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
		</Fragment>
	)
}