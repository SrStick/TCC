import { Button, FormControl, FormHelperText, InputAdornment, InputLabel, Link, OutlinedInput, TextField, Typography } from "@mui/material";
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
					amountOfHors: 0,
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
		.then(() => user.fetchData(() => navigate('/')))
		.catch(error => {
			const { field, message } = error
			setError({ [field]: message })
			if (process.env.NODE_ENV === 'development')
				console.error(error)
		})
	}

	const containerStyle = { mb: '10px', width: '100%' }
	const inputProps = { style: { backgroundColor: '#fff' } }

	return (
		<AuthLayout>
			<TextField
				sx={containerStyle}
				inputProps={inputProps}
				label='Nome completo'
				onBlur={putEventTargetValue(setName)}
				error={error.name}
				helperText={error.name}
			/>
			<TextField
				sx={containerStyle}
				inputProps={inputProps}
				label='Matrícula'
				onBlur={putEventTargetValue(setRegistry)}
			/>
			<FormControl sx={containerStyle}>
				<InputLabel>Email</InputLabel>
				<OutlinedInput
					sx={inputProps.style}
					label='Email'
					onBlur={putEventTargetValue(setEmail)}
					error={!!error.email}
					defaultValue={state?.placeholder}
					endAdornment={
						<InputAdornment position="end">@gsuite.iff.edu.br</InputAdornment>
					}
				/>
				<FormHelperText error={!!error.email}>{error.email}</FormHelperText>
			</FormControl>
			<PasswordField
				label='Senha'
				containerSx={containerStyle}
				error={!!error.pass}
				onBlur={putEventTargetValue(setPassword)}
				onChangeVisibility={setShowPassword}
			/>
			<TextField
				sx={containerStyle}
				inputProps={inputProps}
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