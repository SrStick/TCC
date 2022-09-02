import { Box, Button, FormControl, FormHelperText, InputAdornment, InputLabel, Link, OutlinedInput, TextField, Typography } from "@mui/material";
import { 
	createUserWithEmailAndPassword as createUser,
	getAuth,
	updateProfile
} from "firebase/auth";
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { useState } from "react";
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'
import { PasswordField } from "../components";

import { putEventTargetValue } from '../helper/short-functions'
import { Colllections } from "../helper/firebase";
import { useCallback } from "react";

const CustomErrorCodes = {
	PASS_NOT_MATCH: 'pass_not_match',
	INVALID_CREDENTIALS: 'invalid_credentials',
	INVALID_REGISTRY: 'invalid_registry'
}

export default function Register() {
	const [ name, setName ] = useState('')
	const [ registry, setRegistry ] = useState('')
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ passwordConfirmation, setPasswordConfirmation ] = useState('')

	const { state: { placeholder } } = useLocation()
	const navigate = useNavigate()

	const [ showPassword, setShowPassword ] = useState(false)

	const [ error, setError ] = useState()
	const checkErrorCode = useCallback(customError => error?.code === customError, [error])

	const singUp = () => {
		const filledEmail = email + '@gsuite.iff.edu.br'
		let error

		async function trySingUp() {
			if (password !== passwordConfirmation) {
				error = { message: 'senhas não conferem', code: CustomErrorCodes.PASS_NOT_MATCH }
				throw error
			}

			const registryMatch = registry.match(/^(\d{4})\d+$/)
			const currentYear = new Date().getFullYear()
			if (!(registryMatch && registryMatch[1] == currentYear)) {
				error = { message: 'matrícula inválida', code: CustomErrorCodes.INVALID_REGISTRY }
				throw error
			}

			let user
			try {
				user = await createUser(getAuth(), filledEmail, password).then(({ user }) => user)
				const fullNameArray = name.split(' ')
				const initials = fullNameArray[0][0] + fullNameArray[1][0]
				await updateProfile(user, {
					displayName: fullNameArray[0],
					photoURL: `https://avatars.dicebear.com/api/initials/${initials.toUpperCase()}.svg`
				})
			} catch (err) {
				error = {
					message: 'email já casastrado',
					code: CustomErrorCodes.INVALID_CREDENTIALS,
					firebaseCode: err.code
				}
				throw error
			}

			await setDoc(doc(getFirestore(), Colllections.USERS, user.uid), {
				name,
				registry,
				amountOfHors: 0,
				type: 'common'
			})
		}

		trySingUp()
		.then(() => navigate('/'))
		.catch(({ message, code, firebaseCode }) => {
			setError({ message, code })
			if (firebaseCode && process.env.NODE_ENV === 'development')
				console.error(firebaseCode)
		})
	}

	const containerStyle = { mb: '10px', width: '400px' }
	const inputProps = { style: { backgroundColor: '#fff' } }

	return (
		<div style={{ height: '85vh' }}>
			<Box sx={{ mt: '10vh' }} className='flex-col-center'>
				<TextField
					sx={containerStyle}
					label='Nome completo'
					onBlur={putEventTargetValue(setName)}
					inputProps={inputProps}
				/>
				<TextField
					sx={containerStyle}
					inputProps={inputProps}
					label='Matrícula'
					error={checkErrorCode(CustomErrorCodes.INVALID_REGISTRY)}
					helperText={checkErrorCode(CustomErrorCodes.INVALID_REGISTRY) && error.message}
					onChange={putEventTargetValue(setRegistry)}
				/>
				<FormControl sx={containerStyle}>
					<InputLabel>Email</InputLabel>
					<OutlinedInput
						sx={inputProps.style}
						label='Email'
						onBlur={putEventTargetValue(setEmail)}
						error={checkErrorCode(CustomErrorCodes.INVALID_CREDENTIALS)}
						defaultValue={placeholder}
						endAdornment={
							<InputAdornment position="end">@gsuite.iff.edu.br</InputAdornment>
						}
					/>
					{checkErrorCode(CustomErrorCodes.INVALID_CREDENTIALS) &&
						<FormHelperText>{error.message}</FormHelperText>
					}
				</FormControl>
				<PasswordField
					label='Senha'
					containerSx={containerStyle}
					error={checkErrorCode(CustomErrorCodes.PASS_NOT_MATCH)}
					onBlur={putEventTargetValue(setPassword)}
					onChangeVisibility={setShowPassword}
				/>
				<TextField
					sx={containerStyle}
					inputProps={inputProps}
					label='Confirmar senha'
					type={showPassword ? 'text' : 'password'}
					error={checkErrorCode(CustomErrorCodes.PASS_NOT_MATCH)}
					helperText={checkErrorCode(CustomErrorCodes.PASS_NOT_MATCH) && error.message}
					onBlur={putEventTargetValue(setPasswordConfirmation)}
				/>
				<Typography component='p' variant="body1" mb="5px">
					Já tem uma conta? <Link to="/" component={RouterLink}>Entre aqui</Link>
				</Typography>
				<Button onClick={singUp} variant="contained">Cadastrar-se</Button>
			</Box>
		</div>
	)
}