import {  Box } from '@mui/material'
import { useCallback, useContext } from 'react'

import { UserContext } from '../helper/firebase'
import './styles.css'
import { Link as RouterLink, useNavigate } from "react-router-dom";


/* MENU */
import * as React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Typography from '@mui/material/Typography';
import ListIcon from '@mui/icons-material/List';
import RuleIcon from '@mui/icons-material/Rule';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';


/*  */
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

function Menu() {
    const user = useContext(UserContext)
    const navigate = useNavigate()


	const singOut = useCallback(() => user.singOut(), [ user ])

    const getUserType = (type) => {
        switch (type) {
            case 'admin':
                return 'Coordenador'
        
            default:
                return 'Aluno'
        }
    }

    const items = [
        {
            text: 'Usuários',
            to: '/',
            icon: <PeopleAltOutlinedIcon/>
        },
        {
            text: 'Atividades',
            to: '/',
            icon: <ListIcon/>
        },
        {
            text: 'Modalidades',
            to: '/modalities',
            icon: <ListAltIcon/>
        },
        {
            text: 'Regulamentos',
            to: '/',
            icon: <RuleIcon/>
        }
    ];


	return (
		<Box className="menu" style={{display: 'flex', flexDirection: 'column'}}>
            <Box style={{display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15}}>
                <AccountCircleIcon style={{height: 40, width: 40, color: 'white'}}/>
                <Typography color="white">{getUserType(user.info.type)}</Typography>
            </Box>

            <Box className="menu-items">

                {/* <List>
                    {items.map((item, index) => (
                    <ListItem key={index} disablePadding className="menu-item">
                        <ListItemButton onClick={() => navigate(item.to)}>
                            {item.icon}
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                    <ListItem disablePadding className="menu-item">
                        <ListItemButton onClick={singOut}>
                            <LogoutIcon/>
                            <ListItemText primary="Sair" />
                        </ListItemButton>
                    </ListItem>
                </List> */}

                <a className="menu-item" href="/" >
                    <PeopleAltOutlinedIcon/>
                    <Typography>Usuários</Typography>
                </a>
                <a className="menu-item" href="/" >
                    <ListIcon/>
                    <Typography>Atividades</Typography>
                </a>
                <a className="menu-item" href="/modalities" >
                    <ListAltIcon/>
                    <Typography>Modalidades</Typography>
                </a>
                <a className="menu-item" href="/" >
                    <RuleIcon/>
                    <Typography>Regulamentos</Typography>
                </a>
                <button className="menu-item btn-logout" onClick={singOut} >
                    <LogoutIcon/>
					Sair
				</button>
            </Box>
        
		</Box>
	)
}


export default Menu