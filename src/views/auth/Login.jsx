import {
	browserSessionPersistence, getAuth,
	setPersistence as setAuthPersistence, signInWithEmailAndPassword
} from "firebase/auth";

import {
	Button, Checkbox,
	Divider, FormControlLabel, Link, Stack, TextField
} from "@mui/material";


import { useCallback, useMemo, useState, useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { PasswordField } from "../../components";
import { UserContext } from "../../helper/firebase";
import { someEmpty, putEventTargetValue, putToggle } from '../../helper/short-functions';
import AuthLayout from "./AuthLayout";

export default function Login() {
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ persistAuth, setPesistAuth ] = useState(true)
	const [ singInPlaceholder, setSingInPlaceholder ] = useState('')
	
	const disableSingIn = useMemo(() => someEmpty(email, password), [ email, password ])

	const [ emailErrorMessage, setEmailErrorMessage ] = useState()
	const [ passwordErrorMessage, setPasswordErrorMessage ] = useState()

	const user = useContext(UserContext)
	const navigate = useNavigate()

	const getPlaceholder = ({ target: { value: email } }) => {
		const beforeToken = email.split('@')[0]
		if(!someEmpty(email) && beforeToken)
			setSingInPlaceholder(beforeToken)
	}

	const singIn = useCallback(async () => {
		const auth = getAuth()
		if(!persistAuth)
			await setAuthPersistence(auth, browserSessionPersistence)

		try {
			await signInWithEmailAndPassword(auth, email, password)
			user.fetchData(() => navigate('/'))
		} catch (err) {
			if (err.code === 'auth/user-not-found')
				setEmailErrorMessage('este email não está cadastrado')
			
			if (err.code === 'auth/wrong-password')
				setPasswordErrorMessage('senha incorreta')

			if (import.meta.env.DEV)
				console.log(err.toString())
		}

	}, [ email, password, persistAuth, user, navigate ])

	return (
		<AuthLayout>
			<TextField
				label="Email"
				onChange={putEventTargetValue(setEmail)}
				onBlur={getPlaceholder}
				type='email'
				error={!!emailErrorMessage}
				helperText={emailErrorMessage}
				/>
			<PasswordField
				onChange={putEventTargetValue(setPassword)}
				label='Senha'
				error={!!passwordErrorMessage}
				helperText={passwordErrorMessage}
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