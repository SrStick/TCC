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
	FormControlLabel,
	Checkbox,
	Divider,
	Stack,
} from "@mui/material";


import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";


import { putEventTargetValue, putToggle } from '../../helper/short-functions'
import { PasswordField } from "../../components";
import AuthLayout from "./AuthLayout";

export default function Login({ onSingIn }) {
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

		let credentials
		try {
			credentials = await signInWithEmailAndPassword(auth, email, password)
		} catch (err) {
			if (process.env.NODE_ENV === 'development')
				console.log(err.toString())
		}
		if(credentials)
			onSingIn(credentials.user)

	}, [email, password, persistAuth, onSingIn])

	return (
		<AuthLayout>
			<TextField
				sx={{ bgcolor: '#fff', width: '85%' }}
				label="Email"
				onChange={putEventTargetValue(setEmail)}
				onBlur={getPlaceholder}
				type='email'
			/>
			<PasswordField
				onChange={putEventTargetValue(setPassword)}
				label='Senha'
				containerSx={{ width: '85%' }}
			/>
			<Button
				onClick={singIn}
				variant="contained"
				disabled={disableSingIn}
			>Entrar</Button>
			<Stack sx={{ typography: 'body1' }} alignItems='center'>
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
			</Stack>
		</AuthLayout>
	)
}