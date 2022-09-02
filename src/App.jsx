import { CircularProgress, Stack, Typography } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'

import Login from './views/Login/Login';
import Home from "./views/home";
import Register from './views/UserRegister';
import UploadForm from './views/UploadForm/UploadForm';
import Modality from './views/admin/Modality';

import { getUserInfo, UserContext } from './helper/firebase';
import { Layout } from './components';

const UserProvider = UserContext.Provider

function App() {
	const [loading, setLoading] = useState(true)
	const [logged, setLogged] = useState(false)
	const [userData, setUserData] = useState()

	useEffect(() => {
		async function onChange(user) {
			setLogged(!!user)

			if (user) {
				const databaseInfo = await getUserInfo()
				setUserData({
					data: databaseInfo,
					isAdmin: databaseInfo.type !== 'common'
				})
			}
			setLoading(false)
		}

		return onAuthStateChanged(getAuth(), onChange)
	}, [])

	if (loading)
		return (
			<Stack alignItems='center'>
				<Typography variant='h1' fontSize='2rem'>Aguarde</Typography>
				<CircularProgress />
			</Stack>
		)
	else if (!logged)
		return (
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/singin' element={<Register />} />
			</Routes>
		)

	return (
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
	)
}




export default App;
