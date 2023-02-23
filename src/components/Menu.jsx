import React from 'react'
import { Avatar, Divider, Drawer, ListItemIcon, ListItemText, Stack, Collapse } from '@mui/material'
import { useCallback, useRef, useEffect } from 'react'
import { getAuth } from 'firebase/auth';
import { useNavigate } from "react-router-dom";

import Typography from '@mui/material/Typography';
import ListIcon from '@mui/icons-material/List';
import RuleIcon from '@mui/icons-material/Rule';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useShowDialog } from '../helper/dialog-state-holders';
import { UserType, useUser } from '../helper/firebase';


function Menu({ open, onClose }) {
    const navigate = useNavigate()
    const showDialog = useShowDialog()
    const items = useRef([
        {
            text: 'Progresso',
            to: '/progress',
            icon: <BeenhereIcon/>
        },
        {
            text: 'Atividades',
            to: '/',
            icon: <ListIcon />
        },
        {
            text: 'Modalidades',
            to: '/modalities',
            icon: <ListAltIcon />
        },
        {
            text: 'Regulamentos',
            to: '/',
            icon: <RuleIcon />
        },
        {
            text: 'Cadastrar Moderador',
            to: '/new-moderator',
            icon: <SupervisorAccountIcon />
        },
        {
            text: 'Sair',
            icon: <LogoutIcon />,
            action: showDialog('exit')
        }
    ])

    const userInfo = useUser()
    const [openItem, setOpenItem] = React.useState(false);

    /* useEffect(() => {
        function remove(to) {
            const itemsValue = items.current
            const position = itemsValue.findIndex(item => item.to === to)
            if(position != -1)
                itemsValue.splice(position, 1)
        }

        if(userInfo.type === UserType.COMMON) {
            remove('/modalities')
            remove('/new-moderator')
        } else if (userInfo.type === UserType.ADMIN) {
            remove('/progress')
        } else {
            remove('/progress')
            remove('/new-moderator')
        }
    }, [ userInfo ]) */

   /*  const onItemClick = useCallback(({ to, action }) => {
        return () => {
            if(to)
                navigate(to)
            else
                action()
            onClose()
        }
    }, [ navigate, onClose ]) */

    const { currentUser } = getAuth()

    const renderMenuAluno = () => {
        return (
            <List
				component="nav"
				aria-labelledby="nested-list-subheader"
				sx={{
                    width: 300,
                }}
			>
				<ListItemButton onClick={() => setOpenItem(!openItem)}>
					<ListItemIcon>
                        <ListIcon />
					</ListItemIcon>
					<ListItemText primary="Atividades" />
					{openItem ? <ExpandLessIcon /> : <ExpandMoreIcon />}
				</ListItemButton>

				<Collapse in={openItem} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/send-activity')}>
                            <ListItemText primary="Submeter Atividades" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/progress')}>
                            <ListItemText primary="Listar Atividades" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/modalities')}>
                            <ListItemText primary="Visualizar Situação" />
                        </ListItemButton>
					</List>
				</Collapse>

                <ListItemButton onClick={() => navigate('/modalities')}>
                    <ListItemIcon color='red'>
                        <RuleIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Regulamentos'} />
                </ListItemButton>

                <ListItemButton onClick={() =>  showDialog('exit')}>
                    <ListItemIcon color='red'>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Sair'} />
                </ListItemButton>
               
			</List>
        )
    }

    const renderMenuAdmin = () => {
        return (
            <List
                component="nav"
                aria-labelledby="nested-list-subheader"
                sx={{
                    width: 300,
                }}
            >
                <ListItemButton onClick={() => setOpenItem(!openItem)}>
                    <ListItemIcon>
                        <ListIcon />
                    </ListItemIcon>
                    <ListItemText primary="Atividades" />
                    {openItem ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>

                <Collapse in={openItem} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/send-activity')}>
                            <ListItemText primary="Submeter Atividades" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/progress')}>
                            <ListItemText primary="Listar Atividades" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/modalities')}>
                            <ListItemText primary="Visualizar Situação" />
                        </ListItemButton>
                    </List>
                </Collapse>

                <ListItemButton onClick={() => navigate('/modalities')}>
                    <ListItemIcon color='red'>
                        <RuleIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Regulamentos'} />
                </ListItemButton>

                <ListItemButton onClick={() => showDialog('exit')}>
                    <ListItemIcon color='red'>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Sair'} />
                </ListItemButton>
           
            </List>
        )
    }

    return (
        <Drawer anchor='left' open={open} onClose={onClose}>
            <Stack alignItems='center' justifyContent='center' bgcolor={'primary.dark'} gap={1} p={1} >
                <Avatar alt='foto do usuário' src={currentUser.photoURL}/>
                <Typography px={1} fontSize='1.3rem' color="#fff">{currentUser.displayName}</Typography>
            </Stack>
            {userInfo.type === UserType.COMMON ? renderMenuAluno() : renderMenuAdmin()}
        </Drawer>
    )
}



export default Menu