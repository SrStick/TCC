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
import { Link as RouterLink, useNavigate } from "react-router-dom";


import { putEventTargetValue, putToggle } from '../../helper/short-functions'
import { PasswordField } from "../../components";
import AuthLayout from "./AuthLayout";
import { useContext } from "react";
import { UserContext } from "../../helper/firebase";

export default function Login() {
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ persistAuth, setPesistAuth ] = useState(true)
	const [ disableSingIn, setDisableSingIn ] = useState(true)
	const [ singInPlaceholder, setSingInPlaceholder ] = useState('')

	const user = useContext(UserContext)
	const navigate = useNavigate()

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
			user.fetchData(() => navigate('/'))
		} catch (err) {
			if (process.env.NODE_ENV === 'development')
				console.log(err.toString())
		}

	}, [email, password, persistAuth, user, navigate])

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