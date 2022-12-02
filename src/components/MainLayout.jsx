import {
	AppBar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Link as MuiLink, Stack, TextField, Toolbar
} from '@mui/material';
import { useCallback, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';

import MenuIcon from '@mui/icons-material/Menu';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';
import { promoteUser, useUser } from '../helper/firebase';
import { putEventTargetValue } from '../helper/short-functions';
import Menu from './Menu';
import { DialogContext } from '../helper/dialog-state-holders';


function MainLayout() {

	const [ menuIsOpen, setMenuIsOpen ] = useState(false)
	const [ exitDialogIsOpen, setExitDialogIsOpen ] = useState(false)
	const [ promoteDialogIsOpen, setPromoteDialogIsOpen ] = useState(false)
	const [ toPromoteEmail, setToPromoteEmail ] = useState('')

	const showDialog = useCallback((name, visible = true) => {
		let fn
		switch (name) {
			case 'exit': fn = setExitDialogIsOpen; break
			case 'promote': fn = setPromoteDialogIsOpen; break
			case 'menu': fn = setMenuIsOpen
		}
		return () => fn(visible)
	}, [])

	const user = useUser()

	return (
		<Box>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
						onClick={showDialog('menu')}
					>
						<MenuIcon />
					</IconButton>
					<Stack
						letterSpacing={1}
						direction={'row'}
						alignItems={'center'}
						flexGrow={1}
						spacing={2}
					>
						<Link to={'/'}><HomeIcon /></Link>
						{ user.isAdmin ?
							<>
								<Link to={'/modalities'}>Modalidades</Link>
							</>
							:
							<>
								<Link sx={{ display: 'flex', alignItems: 'center' }} to={'/send-activity'}>
									<AddIcon sx={{ mr: 1 }} /><span>Nova Atividade</span>
								</Link>
							</>
						}
					</Stack>
				</Toolbar>
			</AppBar>
			<DialogContext.Provider value={showDialog}>
				<Menu open={menuIsOpen} onClose={showDialog('menu', false)} />
				<Box sx={{ m: '20px' }}>
					<Outlet />
				</Box>
			</DialogContext.Provider>

			<Dialog open={exitDialogIsOpen} onClose={showDialog('exit', false)}>
				<DialogTitle>Atenção</DialogTitle>
				<DialogContent>Deseja realmente sair</DialogContent>
				<DialogActions>
					<Button onClick={user.singOut}>Sim</Button>
					<Button variant='outlined' color='error' onClick={showDialog('exit', false)}>Não</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={promoteDialogIsOpen} onClose={showDialog('promote', false)}>
				<DialogTitle>Promoção</DialogTitle>
				<DialogContent>
					<DialogContentText>Digite o email do usuário que deseja que se torne um ?.</DialogContentText>
					<TextField onBlur={putEventTargetValue(setToPromoteEmail)} fullWidth />
				</DialogContent>
				<DialogActions>
					<Button onClick={promoteUser.bind(null, toPromoteEmail)}>Confirmar</Button>
					<Button onClick={showDialog('promote', false)}>Voltar</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}


const Link = props =>
	<MuiLink
		{...props}
		component={RouterNavLink}
		color={'inherit'}
		underline={'none'}
		padding={'10px'}
		borderRadius={'5%'}
	/>

export default MainLayout