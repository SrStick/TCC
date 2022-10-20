import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Box,
	AppBar,
	Toolbar,
	IconButton,
	Typography,
	Stack,
	Link as MuiLink,
} from '@mui/material'
import { useCallback, useMemo, useState, useContext } from 'react'

import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

import Menu from './Menu'
import MenuIcon from '@mui/icons-material/Menu';
import { UserContext } from '../helper/firebase'
import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom'

// const items = [
// 	{
// 		text: 'Usuários',
// 		to: '/',
// 		icon: <PeopleAltOutlinedIcon />
// 	},
// 	{
// 		text: 'Atividades',
// 		to: '/',
// 		icon: <ListIcon />
// 	},
// 	{
// 		text: 'Modalidades',
// 		to: '/modalities',
// 		icon: <ListAltIcon />
// 	},
// 	{
// 		text: 'Regulamentos',
// 		to: '/',
// 		icon: <RuleIcon />
// 	},
// 	{
// 		text: 'Sair',
// 		icon: <LogoutIcon />,
// 		action: singOut
// 	}
// ]

function MainLayout() {

	const [ menuIsOpen, setMenuIsOpen ] = useState(false)
	const [ exitDialogIsOpen, setExitDialogIsOpen ] = useState(false)
	const closeExitDialog = useCallback(() => setExitDialogIsOpen(false), [])
	const closeMenu = useCallback(() => setMenuIsOpen(false), [])

	const user = useContext(UserContext)

	const singOut = useCallback(() => user.singOut(), [user])

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
						onClick={() => setMenuIsOpen(true)}
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
			<Menu open={menuIsOpen} onClose={closeMenu} />
			<Box sx={{ m: '20px' }}>
				<Outlet />
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


const Link = props =>
	<MuiLink
		{...props}
		component={RouterNavLink}
		color={'inherit'}
		underline={'none'}
		padding={'10px'}
		borderRadius={'10%'}
	/>

export default MainLayout