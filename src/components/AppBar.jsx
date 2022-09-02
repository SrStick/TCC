import { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import PropTypes from 'prop-types';

import logo from '../assets/iff.png'

import { Link as RouterLink } from 'react-router-dom'

const pages = ['Products', 'Pricing', 'Blog'];

const ResponsiveAppBar = ({ settings, title, avatarUrl }) => {
	const [anchorElNav, setAnchorElNav] = useState(null);
	const [anchorElUser, setAnchorElUser] = useState(null);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	}
	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	}

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	}

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	}

	return (
		<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Box
						component='img'
						sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, maxWidth: '1em' }}
						src={logo}
						alt='logo'
					/>
					<Typography
						variant="h6"
						noWrap
						component={RouterLink}
						to='/'
						sx={{
							mr: 2,
							display: { xs: 'none', md: 'flex' },
							fontFamily: 'monospace',
							fontWeight: 700,
							letterSpacing: '.3rem',
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						LOGO
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}
						>
							{pages.map((page) => (
								<MenuItem key={page} onClick={handleCloseNavMenu}>
									<Typography textAlign="center">{page}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
					<Box
						component='img'
						sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, maxWidth: '1em' }}
						src={logo}
						alt='logo'
					/>
					<Typography
						variant="h5"
						noWrap
						component={RouterLink}
						to='/'
						sx={{
							display: { xs: 'flex', md: 'none' },
							flexGrow: 1,
							fontFamily: 'monospace',
							fontWeight: 700,
							letterSpacing: '.3rem',
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						LOGO
					</Typography>
					<Divider sx={{ mx: 2, borderColor: '#fff' }} orientation="vertical" flexItem />
					<Typography
						sx={{flexGrow: 1, display: { xs: 'none', md: 'flex'}}}
						component='h1'
						variant='h5'
						fontWeight='bold'
					>{title}</Typography>
					<Box sx={{ flexGrow: 0 }}>
						<Tooltip title="Abrir Opções">
							<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
								<Avatar alt="Avater" src={avatarUrl} />
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: '45px' }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={!!anchorElUser}
							onClose={handleCloseUserMenu}
						>
							{Object.entries(settings).map(([ label, action ]) => (
								<MenuItem
									key={label}
									onClick={() => {
										action()
										setAnchorElUser(null)
									}}
								>
									<Typography textAlign="center">{label}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

ResponsiveAppBar.propTypes = {
	settings: PropTypes.objectOf(PropTypes.func).isRequired,
	title: PropTypes.string.isRequired,
	avatarUrl: PropTypes.string
}

export default ResponsiveAppBar;
