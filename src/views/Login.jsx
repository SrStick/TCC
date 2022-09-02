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
	Typography,
	Stack
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import logo from '../iff.png';

import { putEventTargetValue, putToggle } from '../helper/short-functions'
import { PasswordField } from "../components";

export default function Login() {
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ persistAuth, setPesistAuth ] = useState(true)
	const [ disableSingIn, setDisableSingIn ] = useState(true)
	const [ singInPlaceholder, setSingInPlaceholder ] = useState('')

	useEffect(() => {
		setDisableSingIn(email.trim() === '' || password.trim() === '')
	}, [email, password])

	const getPlaceholder = ({ target: { value: email } }) => {
		const beforeToken = email.split('@')[0]
		if(email.trim() && beforeToken)
			setSingInPlaceholder(beforeToken)
	}

	const singIn = useCallback(async () => {
		const auth = getAuth()
		if(!persistAuth)
			await setAuthPersistence(auth, browserSessionPersistence)

		try {
			await signInWithEmailAndPassword(auth, email, password)
		} catch (err) {
			if (process.env.NODE_ENV === 'development')
				console.log(err.toString())
		}
	}, [email, password, persistAuth])

	return (
		<Stack alignItems='center' mt='20px'>
			<img width='150' src={logo} alt="react logo" />
			<Typography m='0' variant="h2" component='h1'>Bem-vindo</Typography>
			<Stack style={{ minWidth: '350px' }}>
				<TextField
					sx={{ mt: '15px', bgcolor: '#fff' }}
					label="Email"
					onChange={putEventTargetValue(setEmail)}
					onBlur={getPlaceholder}
				/>
				<PasswordField
					containerSx={{ mt: '15px' }}
					onChange={putEventTargetValue(setPassword)}
					label='Senha'
				/>
				<Box sx={{ typography: 'body1', bgcolor: '#fff', mt: '15px', p: '10px' }} className="flex-col-center">
					<span>
						Não tem uma conta?
						<Link
							component={RouterLink}
							to='/singin'
							state={{ placeholder: singInPlaceholder }}
							ml='5px'>Registre-se</Link>
					</span>
					<span>
						Esqueceu a senha? {/* ver depois */}
					</span>
					<Divider sx={{ mt: '10px' }} flexItem />
					<FormControlLabel
						sx={{ m: '0', userSelect: 'none' }}
						label='Permanecer Logado.'
						control={<Checkbox onChange={putToggle(setPesistAuth)} checked={persistAuth}/>}
					/>
				</Box>
				<Button
					sx={{ mt:'15px' }}
					onClick={singIn}
					variant="contained"
					disabled={disableSingIn}
				>Entrar</Button>
			</Stack>
		</Stack>
	)
}