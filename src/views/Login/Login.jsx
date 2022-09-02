import {
	signInWithEmailAndPassword,
	getAuth,
	setPersistence as setAuthPersistence,
	browserSessionPersistence
} from "firebase/auth";

import {
	Button,
	TextField,
	Link,
	Box,
	FormControlLabel,
	Checkbox,
	Divider,
	Stack
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import logo from '../../assets/iff-logo.png';

import { putEventTargetValue, putToggle } from '../../helper/short-functions'
import { PasswordField } from "../../components";
import './styles.css'

export default function Login() {
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ persistAuth, setPesistAuth ] = useState(true)
	const [ disableSingIn, setDisableSingIn ] = useState(true)

	useEffect(() => {
		setDisableSingIn(email.trim() === '' || password.trim() === '')
	}, [email, password])

	const singIn = useCallback(async () => {
		const auth = getAuth()
		if(!persistAuth)
			await setAuthPersistence(auth, browserSessionPersistence)

		try {
			await signInWithEmailAndPassword(auth, email, password)
		} catch ({ code }) {
			// Fazer validação
		}
	}, [email, password, persistAuth])

	return (
		<Stack className="login-container">
			<Stack className="logo-container">
				<img className="logo" src={logo} alt="iff logo" />
			</Stack>
			<Stack className="login-form">
				<TextField
					sx={{bgcolor: '#fff', width: '100%' }}
					label="Email"
					onChange={putEventTargetValue(setEmail)}
				/>
				<PasswordField
					onChange={putEventTargetValue(setPassword)}
					label='Senha'
				/>
				<Button className="btn-submit"
					onClick={singIn}
					variant="contained"
					disabled={disableSingIn}
				>Entrar</Button>
				<Box sx={{ typography: 'body1'}} className="flex-col-center">
					<span>
						Não tem uma conta?
						<Link component={RouterLink} to='/singin' ml='5px'>Registre-se</Link>
					</span>
					<span>
						Esqueceu a senha? {/* ver depois */}
					</span>
					<Divider sx={{ alignSelf: 'stretch', mt: '10px' }} />
					<FormControlLabel
						sx={{ m: '0', userSelect: 'none' }}
						label='Permanecer Logado.'
						control={<Checkbox onChange={putToggle(setPesistAuth)} checked={persistAuth}/>}
					/>
				</Box>
			</Stack>
		</Stack>
	)
}