import { Avatar, Divider, Drawer, ListItemIcon, Stack } from '@mui/material'
import { useCallback, useRef, useEffect } from 'react'

import { getAuth } from 'firebase/auth';
import { useNavigate } from "react-router-dom";

import Typography from '@mui/material/Typography';
import ListIcon from '@mui/icons-material/List';
import RuleIcon from '@mui/icons-material/Rule';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import BeenhereIcon from '@mui/icons-material/Beenhere';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { useShowDialog } from '../helper/dialog-state-holders';
import { useUser } from '../helper/firebase';


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
            text: 'Sair',
            icon: <LogoutIcon />,
            action: showDialog('exit')
        }
    ])

    const userInfo = useUser()

    useEffect(() => {
        if(!userInfo.type === 'admin') {
            items.current.splice(0, 1)
            items.current.splice(2, 1)
        }
    }, [ userInfo ])

    const onItemClick = useCallback(({ to, action }) => {
        return () => {
            if(to)
                navigate(to)
            else
                action()
            onClose()
        }
    }, [ navigate, onClose ])

    const { currentUser } = getAuth()

    return (
        <Drawer anchor='left' open={open} onClose={onClose}>
            <Stack alignItems='center' justifyContent='center' bgcolor={'primary.dark'} gap={1} p={1} >
                <Avatar alt='foto do usuário' src={currentUser.photoURL}/>
                <Typography px={1} fontSize='1.3rem' color="#fff">{currentUser.displayName}</Typography>
            </Stack>
            <Divider/>
            <List>
                {items.current.map(item => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton onClick={onItemClick(item)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    )
}



export default Menu