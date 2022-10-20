import { CircularProgress, createTheme, Stack, ThemeProvider, Typography } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom'

import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Error404 from './views/404'

import { getUserInfo, UserContext } from './helper/firebase';
import { MainLayout } from './components';
import { useMemo } from 'react';

/* HOME */
import CoordenadorHome from "./views/coordenador/Home"
import StudentHome from "./views/aluno/Home"

const SendActivity = lazy(() => import('./views/aluno/SendActivity'))
const Modality = lazy(() => import('./views/coordenador/Modalities'))

const UserProvider = UserContext.Provider

function App() {
	const [loading, setLoading] = useState(true)
	const [logged, setLogged] = useState(false)

	const userData = useMemo(() => {
		return {
				async fetchData(beforeLoading) {
				setLoading(true)
				const data = await getUserInfo()
				this.info = data
				this.isAdmin = data.type !== 'common'
				setLogged(true)
					if(beforeLoading) beforeLoading()
				setLoading(false)
			},
			subscribe(fun) {
				this.unsubscribe = onAuthStateChanged(getAuth(), user => {
					if(user) userData.fetchData(fun)
					else setLoading(false)
				})
				return this.unsubscribe
			},
			singOut() {
				setLogged(false)
				getAuth().signOut()
			}
		}
	}, [])

	useEffect(() => userData.subscribe(), [ userData ])

	if (loading)
		return <Loading />

	else if (!logged)
		return (
			<ThemeProvider theme={theme}>
				<UserProvider value={userData}>
					<Routes>
						<Route path='/' element={<Login/>} />
						<Route path='/singin' element={<Register/>} />
						<Route path='*' element={<Error404/>}/>
					</Routes>
				</UserProvider>
			</ThemeProvider>
		)

	return (
		<ThemeProvider theme={theme}>
			<UserProvider value={userData}>
				<Suspense fallback={<Loading/>}>
					<Routes>
						<Route path='/' element={<MainLayout/>}>
							{!userData.isAdmin ? (
								<>
									<Route path='send-activity' element={<SendActivity />} />
								</>
							) : (
								<>
									<Route path='modalities' element={<Modality />} />
								</>
							)}
							<Route index element={userData.isAdmin ? <CoordenadorHome/> : <StudentHome/>}/>
						</Route>
						<Route path='*' element={<Error404/>}/>
					</Routes>
				</Suspense>
			</UserProvider>
		</ThemeProvider>
	)
}

const Loading = () => (
	<ThemeProvider theme={theme}>
		<Stack alignItems='center'>
			<Typography variant='h1' fontSize='2rem'>Aguarde</Typography>
			<CircularProgress />
		</Stack>
	</ThemeProvider>
)

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#32a041',
		},
		secondary: {
			main: '#233D4D',
		},
		error: {
			main: '#dc3545',
		},
		warning: {
			main: '#ffc107',
		},
		success: {
			main: '#28a745',
		},
		neutral: {
			main: '#6c757d',
			contrastText: '#fff',
		}
	}
})



export default App;
