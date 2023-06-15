import { createTheme, ThemeProvider } from '@mui/material';
import { useEffect, useState, Suspense, lazy, useRef, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom'

import Loading from './components/Loading';
const Login = lazy(() => import('./views/auth/Login'))
const Register = lazy(() => import('./views/auth/Register'))
const Error404 = lazy(() => import('./views/404'))

import { getUserInfo, UserContext } from './helper/firebase';
import { MainLayout } from './components';
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/* HOME */
const StudentHome = lazy(() => import('./views/aluno/Home')) 
const CoordenadorHome = lazy(() => import('./views/coordenador/Home'))

const SendActivity = lazy(() => import('./views/aluno/SendActivity'))
const Progress = lazy(() => import('./views/aluno/Progress'))
const Modality = lazy(() => import('./views/coordenador/Modalities'))
const Profile = lazy(() => import('./views/Profile'))

const UserProvider = UserContext.Provider

function renderExtraRoutes(type) {
	if(type === 'common') {
		return (
			<>
				<Route path='send-activity' element={<SendActivity/>} />
				<Route path='progress' element={<Progress/>} />
			</>
		)
	}

	if(type === 'admin') {
		return (
			<>
				<Route path='new-moderator' element={<Register/>} />
				<Route path='groups' element={<Modality/>} />
			</>
		)
	}
	

	return <Route path='groups' element={<Modality/>} />
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
		return (
			<ThemeProvider theme={theme}>
				<Loading />
			</ThemeProvider>
		)
	else if (!logged)
		return (
			<ThemeProvider theme={theme}>
				<UserProvider value={userRef.current}>
				<Suspense fallback={<Loading/>}>
					<Routes>
						<Route path='/' element={<Login/>} />
						<Route path='/singin' element={<Register/>} />
						<Route path='*' element={<Error404/>}/>
					</Routes>
				</Suspense>
				</UserProvider>
			</ThemeProvider>
		)
		
		return (
			<ThemeProvider theme={theme}>
			<UserProvider value={userRef.current}>
				<Suspense fallback={<Loading/>}>
					<Routes>
						<Route path='/' element={<MainLayout/>}>
							{renderExtraRoutes(userRef.current.type)}
							<Route index element={userRef.current.type !== 'common' ? <CoordenadorHome/> : <StudentHome/>}/>
							<Route path='/profile' element={<Profile/>} />
						</Route>
						<Route path='*' element={<Error404/>}/>
					</Routes>
				</Suspense>
			</UserProvider>
		</ThemeProvider>
	)
}

export const theme = createTheme({
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