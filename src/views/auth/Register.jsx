import { Button, InputAdornment, Link, TextField, Typography } from "@mui/material";
import {
	createUserWithEmailAndPassword as createUser,
	getAuth,
	updateProfile
} from "firebase/auth";
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { PasswordField } from "../../components";

import { Collections, UserContext } from "../../helper/firebase";
import { putEventTargetValue } from '../../helper/short-functions';
import ValidationError from "../../helper/ValidationError";
import AuthLayout from "./AuthLayout";
import { useContext } from "react";

export default function Register() {
	const [ name, setName ] = useState('')
	const [ registry, setRegistry ] = useState('')
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ passwordConfirmation, setPasswordConfirmation ] = useState('')

	const [ showPassword, setShowPassword ] = useState(false)
	const [ error, setError ] = useState({})

	const { state } = useLocation()
	const navigate = useNavigate()

	const user = useContext(UserContext)

	const singUp = () => {
		const filledEmail = email + '@gsuite.iff.edu.br'

		user.unsubscribe()

		async function trySingUp() {

			const emptyMessage = 'preencha este campo'

			const fieldsMap = new Map()
				.set('name', name)
				.set('registry', registry)
				.set('email', email)
				.set('password', password)
			
			for (const [k, v] of fieldsMap.entries()) {
				if(v.trim() === '')
					throw new ValidationError(emptyMessage, k)
			}

			if (password !== passwordConfirmation)
				throw new ValidationError('senhas não conferem', 'password')

			let user
			try {
				user = await createUser(getAuth(), filledEmail, password).then(({ user }) => user)
			} catch (error) {
				throw new ValidationError('email já cadastrado', 'email', error.code)
			}

			try {
				await setDoc(doc(getFirestore(), Collections.USERS, user.uid), {
					name,
					registry,
					type: 'common'
				})
			} catch (error) {
				user.delete()
			}
			
			const fullNameArray = name.split(' ')
			const firstName = fullNameArray[0]
			const lastName = fullNameArray.slice(-1)

			const initials = firstName[0] + (lastName ? lastName[0] : '')
			await updateProfile(user, {
				displayName: firstName,
				photoURL: `https://avatars.dicebear.com/api/initials/${initials.toUpperCase()}.svg`
			})
		}

		trySingUp()
		.then(() => {
			user.subscribe(() => navigate('/'))
		})
		.catch(error => {
			const { field, message } = error
			setError({ [field]: message })
			if (process.env.NODE_ENV === 'development')
				console.error(error)
		})
	}

	return (
		<AuthLayout>
			<TextField
				label='Nome completo'
				onBlur={putEventTargetValue(setName)}
				error={!!error.name}
				helperText={error.name}
			/>
			<TextField
				label='Matrícula'
				onBlur={putEventTargetValue(setRegistry)}
				error={!!error.registry}
				helperText={error.registry}
			/>
			<TextField
				label={'Email'}
				InputProps={{
					endAdornment: 
						<InputAdornment position="end">@gsuite.iff.edu.br</InputAdornment>
				}}
				error={!!error.email}
				helperText={error.email}
				defaultValue={state?.placeholder}
				onBlur={putEventTargetValue(setEmail)}
			/>
			<PasswordField
				label='Senha'
				error={error.pass}

				onBlur={putEventTargetValue(setPassword)}
				onChangeVisibility={setShowPassword}
			/>
			<TextField
				label='Confirmar senha'
				type={showPassword ? 'text' : 'password'}
				error={!!error.password}
				helperText={error.password}
				onBlur={putEventTargetValue(setPasswordConfirmation)}
			/>
			<Typography component='p' variant="body1" mb="5px">
				Já tem uma conta? <Link to="/" component={RouterLink}>Entre aqui</Link>
			</Typography>
			<Button onClick={singUp} variant="contained">Cadastrar-se</Button>
		</AuthLayout>
	)
}