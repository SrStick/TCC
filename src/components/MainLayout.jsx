import {
	AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link as MuiLink, ListItemIcon, ListItemText, Menu, MenuItem, Stack, TextField, Toolbar
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser, addEmailToPromoteList, UserType } from '../helper/firebase';
import { DialogContext } from '../helper/dialog-state-holders';

import Drawer from './Drawer';
import { getAuth } from 'firebase/auth';

function MainLayout() {

	const [ drawerIsOpen, setDrawerIsOpen ] = useState(false)
	const [ exitDialogIsOpen, setExitDialogIsOpen ] = useState(false)
	const [ promoteDialogIsOpen, setPromoteDialogIsOpen ] = useState(false)
	const [ toPromoteEmail, setToPromoteEmail ] = useState('')
	const [ accountMenuAnchor, setAccountMenuAnchor ] = useState()

	const action = useRef()

	const showDialog = useCallback((name, visible = true) => {

		let fn
		switch (name) {
			case 'exit': fn = setExitDialogIsOpen; break
			case 'promote': fn = setPromoteDialogIsOpen; break
			case 'drawer': fn = setDrawerIsOpen
		}
		return () => fn(visible)
	}, [])

	const user = useUser()
	const { currentUser : { photoURL } } = getAuth()

	const navigate = useNavigate()

	useEffect(() => {
		if (!accountMenuAnchor && action.current) {
			action.current()
			action.current = null
		}
	}, [ accountMenuAnchor ])

	return (
		<Box>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="drawer-menu"
						sx={{ mr: 2 }}
						onClick={showDialog("drawer")}
					>
						<MenuIcon />
					</IconButton>
					<Stack
						letterSpacing={1}
						direction="row"
						alignItems="center"
						flexGrow={1}
						spacing={2}
					>
						<Link to="/">
							<HomeIcon />
						</Link>
						{user.type === UserType.ADMIN && (
							<>
								<Link to={"/groups"}>Grupos</Link>
							</>
						)}
						{user.type === UserType.COMMON && (
							<>
								<Link
									sx={{ display: "flex", alignItems: "center" }}
									to={"/send-activity"}
								>
									<AddIcon sx={{ mr: 1 }} />
									<span>Nova Atividade</span>
								</Link>
							</>
						)}

						<Box style={{ marginLeft: 'auto' }}>
							<IconButton
								size="large"
								aria-haspopup="true"
								onClick={ev => setAccountMenuAnchor(ev.currentTarget)}
								color="inherit"
							>
								<Avatar src={photoURL}/>
							</IconButton>
							<Menu
								anchorEl={accountMenuAnchor}
								open={!!accountMenuAnchor}
								onClose={() => setAccountMenuAnchor(null)}
								anchorOrigin={{ vertical: "bottom", horizontal:'right' }}
								keepMounted
							>
								<MenuItem
									onClick={() => {
										action.current = () => navigate('profile')
										setAccountMenuAnchor(null)
									}}
								>
									<ListItemIcon>
										<PersonIcon/>
									</ListItemIcon>
									<ListItemText>Perfil</ListItemText>
								</MenuItem>
								<MenuItem onClick={showDialog('exit')}>
									<ListItemIcon>
										<LogoutIcon/>
									</ListItemIcon>
									<ListItemText>Sair</ListItemText>
								</MenuItem>
							</Menu>
						</Box>
					</Stack>
				</Toolbar>
			</AppBar>

			<DialogContext.Provider value={showDialog}>
				<Drawer open={drawerIsOpen} onClose={showDialog("drawer", false)} />
				<Box sx={{ m: "20px" }}>
					<Outlet />
				</Box>
			</DialogContext.Provider>

			<Dialog open={exitDialogIsOpen} onClose={showDialog("exit", false)}>
				<DialogTitle>Atenção</DialogTitle>
				<DialogContent>Deseja realmente sair?</DialogContent>
				<DialogActions>
					<Button onClick={user.singOut}>Sim</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={showDialog("exit", false)}
					>
						Não
					</Button>
				</DialogActions>
			</Dialog>

			{/* <Dialog open={promoteDialogIsOpen} onClose={showDialog("promote", false)}>
				<DialogTitle>Promoção</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Digite o email do usuário que deseja que se torne um ?.
					</DialogContentText>
					<TextField
						onBlur={putEventTargetValue(setToPromoteEmail)}
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={addEmailToPromoteList.bind(null, toPromoteEmail)}>
						Confirmar
					</Button>
					<Button onClick={showDialog("promote", false)}>Voltar</Button>
				</DialogActions>
			</Dialog> */}
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