import { Avatar, Drawer, ListItemIcon, ListItemText, Stack, Collapse, Typography, List, ListItemButton  } from '@mui/material';
import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate, Link } from "react-router-dom";

import ListIcon from '@mui/icons-material/List';
import SourceIcon from '@mui/icons-material/Source';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useShowDialog } from '../helper/dialog-state-holders';
import { UserType, useUser } from '../helper/firebase';
import { putToggle } from '../helper/short-functions';


function MDrawer({ open, onClose }) {
    const navigate = useNavigate()
    const showDialog = useShowDialog()

    const userInfo = useUser()
    const [ openUsers, setOpenUsers ] = useState(false);
    const [ openActivities, setOpenActivities ] = useState(false)

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
				<ListItemButton onClick={putToggle(setOpenActivities)}>
					<ListItemIcon>
                        <ListIcon />
					</ListItemIcon>
					<ListItemText primary="Atividades" />
					{openActivities ? <ExpandLessIcon /> : <ExpandMoreIcon />}
				</ListItemButton>

				<Collapse in={openActivities} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/send-activity')}>
                            <ListItemText primary="Submeter Atividades" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/')}>
                            <ListItemText primary="Listar Atividades" />
                        </ListItemButton>
                        <ListItemButton sx={{ paddingLeft: 5 }} onClick={() => navigate('/progress')}>
                            <ListItemText primary="Visualizar Situação" />
                        </ListItemButton>
					</List>
				</Collapse>

                <ListItemButton component='a' target='_blank' href='https://firebasestorage.googleapis.com/v0/b/tcc-extra.appspot.com/o/ppc.pdf?alt=media&token=ba17e7cf-518d-4756-bef3-617efc8debfb'>
                    <ListItemIcon color='red'>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Regulamentos'} />
                </ListItemButton>

                <ListItemButton onClick={showDialog('exit')}>
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
                { userInfo.type === UserType.ADMIN &&
                <>
                    <ListItemButton onClick={putToggle(setOpenUsers)}>
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Usuários" />
                        {openUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>

                    <Collapse in={openUsers} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ paddingLeft: 5 }} component={Link} to='new-moderator'>
                                <ListItemText primary="Adicionar colaborador" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </>
                }

                <ListItemButton component={Link} to='/'>
                    <ListItemIcon color='red'>
                        <ListIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Atividades'} />
                </ListItemButton>

                { userInfo.type === UserType.ADMIN &&
                    <ListItemButton component={Link} to='/groups'>
                        <ListItemIcon color='red'>
                            <SourceIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Grupos'} />
                    </ListItemButton>
                }

                <ListItemButton component='a' target='_blank' href='https://firebasestorage.googleapis.com/v0/b/tcc-extra.appspot.com/o/ppc.pdf?alt=media&token=ba17e7cf-518d-4756-bef3-617efc8debfb'>
                    <ListItemIcon color='red'>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Regulamentos'} />
                </ListItemButton>

                <ListItemButton onClick={showDialog('exit')}>
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



export default MDrawer