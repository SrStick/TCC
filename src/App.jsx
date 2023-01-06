import { CircularProgress, createTheme, Stack, ThemeProvider, Typography } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, Suspense, lazy, useRef, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom'

import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Error404 from './views/404'

import { getUserInfo, UserContext } from './helper/firebase';
import { MainLayout } from './components';
import { useNavigate } from 'react-router-dom'

/* HOME */
import CoordenadorHome from "./views/coordenador/Home"
import StudentHome from "./views/aluno/Home"

const SendActivity = lazy(() => import('./views/aluno/SendActivity'))
const Progress = lazy(() => import('./views/aluno/Progress'))
const Modality = lazy(() => import('./views/coordenador/Modalities'))

const UserProvider = UserContext.Provider

function renderExtraRoutes(type) {
	if(type === 'commun') {
		return (
			<>
				<Route path='send-activity' element={<SendActivity />} />
				<Route path='progress' element={<Progress />} />
			</>
		)
	}

	if(type === 'admin') {
		return (
			<>
				<Route path='new-moderator' element={<Register/>} />
				<Route path='modalities' element={<Modality />} />
			</>
		)
	}
	

	return <Route path='modalities' element={<Modality />} />

}

function App() {
	const [ loading, setLoading ] = useState(true)
	const [ logged, setLogged ] = useState(false)

	
	const navigate = useNavigate()
	
	const inLoadSrean = useCallback(todoFunction => {
		setLoading(true)
		todoFunction().then(() => setLoading(false))
	}, [])
	
	const userRef = useRef({
		fetchData(beforeLoading) {
			inLoadSrean(async () => {
				const data = await getUserInfo()
				this.info = data
				this.type = data.type
				setLogged(true)
				if (beforeLoading) beforeLoading()
			})
		},
		subscribe(fun) {
			this.unsubscribe = onAuthStateChanged(getAuth(), user => {
				if (user) this.fetchData(fun)
				else setLoading(false)
			})
			return this.unsubscribe
		},
		singOut() {
			inLoadSrean(async () => {
				setLogged(false)
				navigate('/')
				await getAuth().signOut()
			})
		}
	})

	useEffect(() => userRef.current.subscribe(), [])
	
	if (loading)
		return <Loading />
	else if (!logged)
		return (
			<ThemeProvider theme={theme}>
				<UserProvider value={userRef.current}>
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
			<UserProvider value={userRef.current}>
				<Suspense fallback={<Loading/>}>
					<Routes>
						<Route path='/' element={<MainLayout/>}>
							{renderExtraRoutes(getUserType())}
							<Route index element={getUserType() !== 'commun' ? <CoordenadorHome/> : <StudentHome/>}/>
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
