import { Box, Button, FormControl, InputAdornment, InputLabel, Link, OutlinedInput, TextField, Typography } from "@mui/material";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { collection, getFirestore, setDoc } from 'firebase/firestore'
import { useState } from "react";
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { PasswordField } from "../components";

import { putEventTargetValue } from '../helper/short-functions'
import { Colllections } from "../helper/firebase";

export default function Register() {
	const [ name, setName ] = useState('')
	const [ registry, setRegistry ] = useState('')
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ passwordConfirmation, setPasswordConfirmation ] = useState('')

	const [ showPassword, setShowPassword ] = useState(false)

	const navigate = useNavigate()

	const singUp = async () => {
		const filledEmail = email + '@gsuite.iff.edu.br'
		if(password === passwordConfirmation) {
			let newCredentials

			try {
				newCredentials = await createUserWithEmailAndPassword(getAuth(), filledEmail, password)
			} catch (err) {
				// exibir erro genérioco, ex. usuário ou senha inválidos
			}
			if (newCredentials) {
				await setDoc(collection(getFirestore(), Colllections.USERS, newCredentials.user.uid), {
					name,
					registry,
					amountOfHors: 0,
					type: 'common'
				})
				navigate('home')
			}
		} else {
			// exibir erro para as senhas incorretas
		}
	}

	const fieldStyle = { mb: '10px', bgcolor: '#fff', width: '400px' }

	return (
		<div style={{ height: '85vh' }}>
			<Box sx={{ mt: '10vh' }} className='flex-col-center'>
				<TextField sx={fieldStyle} label='Nome'  onBlur={putEventTargetValue(setName)}/>
				<TextField sx={fieldStyle} label='Matrícula' onBlur={putEventTargetValue(setRegistry)}/>
				<FormControl>
					<InputLabel>Email</InputLabel>
					<OutlinedInput
						sx={fieldStyle}
						label='Email'
						onBlur={putEventTargetValue(setEmail)}
						endAdornment={
							<InputAdornment position="end">@gsuite.iff.edu.br</InputAdornment>
						}
					/>
				</FormControl>
				<PasswordField
					label='Senha'
					containerSx={fieldStyle}
					onBlur={putEventTargetValue(setPassword)}
					onChangeVisibility={setShowPassword}
				/>
				<TextField
					sx={fieldStyle}
					label='Confirmar senha'
					type={showPassword ? 'text' : 'password'}
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