import { Box, Button, FormControl, InputAdornment, InputLabel, Link, OutlinedInput, TextField, Typography } from "@mui/material";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { collection, getFirestore, setDoc } from 'firebase/firestore'
import { useState } from "react";
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { PasswordField } from "../../components";

import { putEventTargetValue } from '../../helper/short-functions'
import { Colllections } from "../../helper/firebase";
import './styles.css'
import logo from '../../assets/iff-logo.png';

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

	return (
		<div className="register-container">
			<Box className="logo-container">
				<img className="logo" src={logo} alt="iff logo" />
			</Box>
			<Box className='register-form'>
				<TextField sx={{ width: '100%'}} label='Nome'  onBlur={putEventTargetValue(setName)}/>
				<TextField sx={{ width: '100%'}} label='Matrícula' onBlur={putEventTargetValue(setRegistry)}/>
				<FormControl sx={{ width: '100%'}}>
					<InputLabel>Email</InputLabel>
					<OutlinedInput
						label='Email'
						onBlur={putEventTargetValue(setEmail)}
						endAdornment={
							<InputAdornment position="end">@gsuite.iff.edu.br</InputAdornment>
						}
					/>
				</FormControl>
				<PasswordField
					label='Senha'
					onBlur={putEventTargetValue(setPassword)}
					onChangeVisibility={setShowPassword}
				/>
				<TextField
					sx={{ width: '100%'}}
					label='Confirmar senha'
					type={showPassword ? 'text' : 'password'}
					onBlur={putEventTargetValue(setPasswordConfirmation)}
				/>
				<Button className="btn-submit" onClick={singUp} variant="contained">Cadastrar-se</Button>
				<Typography component='p' variant="body1">
					Já possui uma conta conta?
				</Typography>
				<Typography component='p' variant="body1">
					<Link to="/" component={RouterLink}>Clique aqui</Link> para realizar login
				</Typography>
			</Box>
		</div>
	)
}