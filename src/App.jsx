import { CircularProgress, createTheme, Stack, ThemeProvider, Typography } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'

import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Home from "./views/home";

import UploadForm from './views/UploadForm/UploadForm';
import Modality from './views/admin/Modality';

import { getUserInfo, UserContext } from './helper/firebase';
import { Layout } from './components';
import { useCallback } from 'react';

const UserProvider = UserContext.Provider

function App() {
	const [loading, setLoading] = useState(true)
	const [logged, setLogged] = useState(false)
	const [userData, setUserData] = useState()

	const loadUserData = useCallback(async user => {
			setLoading(true)
			setLogged(!!user)

			if (user) {
				const databaseInfo = await getUserInfo()
				setUserData({
					data: databaseInfo,
					isAdmin: databaseInfo.type !== 'common',
					singOut() {
						setLogged(false)
						getAuth().signOut()
					}
				})
			}
			setLoading(false)
	}, [])

	useEffect(() => {
		const unsub = onAuthStateChanged(getAuth(), user => {
			loadUserData(user)
			unsub()
		})
	}, [ loadUserData ])

	if (loading)
		return (
			<ThemeProvider theme={theme}>
				<Stack alignItems='center'>
					<Typography variant='h1' fontSize='2rem'>Aguarde</Typography>
					<CircularProgress />
				</Stack>
			</ThemeProvider>
		)
	else if (!logged)
		return (
			<ThemeProvider theme={theme}>
				<Routes>
					<Route path='/' element={<Login onSingIn={loadUserData} />} />
					<Route path='/singin' element={<Register onCreateUser={loadUserData}/>} />
				</Routes>
			</ThemeProvider>
		)

	return (
		<ThemeProvider theme={theme}>
			<UserProvider value={userData}>
				<Routes>
					<Route path='/' element={<Layout/>}>
						<Route index element={<Home/>}/>
						{!userData.isAdmin ? (
							<>
								<Route path='upload-form' element={<UploadForm />} />
							</>
						) : (
							<>
								<Route path='modalities' element={<Modality />} />
							</>
						)}
					</Route>
				</Routes>
			</UserProvider>
		</ThemeProvider>
	)
}

const theme = createTheme({
	palette: {
		type: 'light',
		primary: {
			main: '#32a041',
		},
		secondary: {
			main: '#c8191e',
		},
		error: {
			main: '#dc3545',
		},
		warning: {
			main: '#ffc107',
		},
		success: {
			main: '#28a745',
		}
	}
})



export default App;
