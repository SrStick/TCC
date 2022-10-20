import { Avatar, Divider, Drawer, ListItemIcon, Stack } from '@mui/material'
import { useCallback, useContext } from 'react'

import { UserContext } from '../helper/firebase'
import { getAuth } from 'firebase/auth';
import { useNavigate } from "react-router-dom";


import Typography from '@mui/material/Typography';
import ListIcon from '@mui/icons-material/List';
import RuleIcon from '@mui/icons-material/Rule';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';


function Menu({ open, onClose }) {
    const user = useContext(UserContext)
    const navigate = useNavigate()

    const singOut = useCallback(() => user.singOut(), [user])

    const items = [
        {
            text: 'Usuários',
            to: '/',
            icon: <PeopleAltOutlinedIcon />
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
            action: singOut
        }
    ]

    const onItemClick = useCallback(({ to, action }) => {
        return () => {
            if(to)
                navigate(to)
            else
                action()
            onClose()
        }
    }, [ navigate, onClose ])

    return (
        <Drawer anchor='left' open={open} onClose={onClose}>
            <Stack alignItems='center' justifyContent='center' bgcolor={'primary.dark'} gap={1} p={1} >
                <Avatar alt='foto do usuário' src={getAuth().currentUser.photoURL}/>
                <Typography px={1} fontSize='1.3rem' color="#fff">{user.info.name}</Typography>
            </Stack>
            <Divider/>
            <List>
                {items.map(item => (
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