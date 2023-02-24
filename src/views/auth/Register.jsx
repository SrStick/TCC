import { Button, Link, TextField, Typography } from "@mui/material";
import {
	createUserWithEmailAndPassword as createUser,
	getAuth,
	updateProfile
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { PasswordField } from "../../components";

import { Collections, UserType, useUser } from "../../helper/firebase";
import { someEmpty, putEventTargetValue } from '../../helper/short-functions';
import ValidationError from "../../helper/ValidationError";
import AuthLayout from "./AuthLayout";
import { useTextPatterns, PatternFunctions } from "../../helper/hooks";

function geratePassword() {
	const simbols = '!@#$%^&*()_+{}:"<>?\\|[];\',./'
	const alpha = 'abcdefghijklmnopqrstuvwxyz'
	const numbers = '0123456789'

	function random(arg) {
		const isArrayOrString = Array.isArray(arg) || typeof arg === 'string'
		const n = Math.floor(Math.random() * (isArrayOrString ? arg.length : arg))
		if(isArrayOrString)
			return arg[n]

		return n
	}
	
	const password = []
	const size = 8
	const globalUsedSpots = new Set()

	function setRandomInPassword(elementArray, times = 1) {
		const usedSpots = new Set()

		if(globalUsedSpots.size != size) {
			while(usedSpots.size != times) {
				const spot = random(size)
				if(!globalUsedSpots.has(spot))
					usedSpots.add(spot)
			}
		
			for(const spot of usedSpots) {
				password[spot] = random(elementArray)
				globalUsedSpots.add(spot)
			}
		}
	}
	
		setRandomInPassword(numbers, 2)
		setRandomInPassword(alpha, 2)
		setRandomInPassword(alpha.toUpperCase(), 2)
		setRandomInPassword(simbols, 2)

	return password.join('')
}

export default function Register() {
	
	const autoGaratedPass = useMemo(geratePassword, [])
	
	const [ name, setName ] = useState('')
	const registry = useTextPatterns(PatternFunctions.onlyNumbers, PatternFunctions.limit(12))
	const [ email, setEmail ] = useState('')
	
	
	const { state, pathname } = useLocation()
	const isModerationRegister = pathname === '/new-moderator'
	
	const [ password, setPassword ] = useState(isModerationRegister ? autoGaratedPass : '')
	const [ passwordConfirmation, setPasswordConfirmation ] = useState(isModerationRegister ? autoGaratedPass : '')

	const [ showPassword, setShowPassword ] = useState(isModerationRegister)
	const [ error, setError ] = useState({})

	const navigate = useNavigate()

	const user = useUser()


	const singUp = () => {
		const { currentUser: initialUser } = getAuth()

		user.unsubscribe()

		async function trySingUp() {

			const emptyMessage = 'preencha este campo'

			const fieldsMap = new Map()
				.set('name', name)
				.set('registry', registry.value)
				.set('email', email)
				.set('password', password)
			
			for (const [k, v] of fieldsMap.entries()) {
				if(someEmpty(v))
					throw new ValidationError(emptyMessage, k)
			}

			if (password !== passwordConfirmation)
				throw new ValidationError('senhas não conferem', 'password')
			
			const mandatoryPart = 'gsuite.iff.edu.br'

			let numberOfAts = 0
			for(const char of email) {
				if(char === '@')
					numberOfAts++
			}

			if(numberOfAts === 0 || numberOfAts > 1)
				throw new ValidationError('email inválido', 'email')

			const brokenEmail = email.split('@')
			if(brokenEmail[1] !== mandatoryPart)
				throw new ValidationError(`só é possível cadastrar emails institucionais. Ex. aluno@${mandatoryPart}`, 'email')

			let promoteData

			if(!isModerationRegister) {
				const promoteListRef = doc(getFirestore(), Collections.PROMOTE_LIST, email)
	
				promoteData = await getDoc(promoteListRef)
			}

			let user
			try {
				user = await createUser(getAuth(), email, password).then(({ user }) => user)
			} catch (error) {
				if (error.code === 'auth/weak-password')
					throw new ValidationError('a senha deve ter o mínimo de seis caracteres', 'password', error.code)
				if (error.code === 'auth/email-already-exists')
					throw new ValidationError('email já cadastrado', 'email', error.code)
			}

			const newDoc = {
				name,
				registry: registry.value,
				type: promoteData?.exists() || isModerationRegister ? UserType.MODERATOR : UserType.COMMON
			}

			if (isModerationRegister) 
				newDoc.firstAccess = true

			try {
				await setDoc(doc(getFirestore(), Collections.USERS, user.uid), newDoc)
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
			const subscribe = () => user.subscribe(() => navigate('/'))
			if(isModerationRegister)
				getAuth().updateCurrentUser(initialUser).then(subscribe)
			else
				subscribe()
		})
		.catch(error => {
			const { field, message } = error
			setError({ [field]: message })
			if (process.env.NODE_ENV === 'development')
				console.error(error)
		})
	}

	return (
		<AuthLayout hideLogo={isModerationRegister}>
			{isModerationRegister &&
				<>
					<Typography
						variant="h2"
						fontSize='2.5rem'
						component='h1'
						mb={2}
						color='error'
					>Cadastro de Moderadores</Typography>
				</>
			}
			<TextField
				label='Nome completo'
				onBlur={putEventTargetValue(setName)}
				error={!!error.name}
				helperText={error.name}
			/>
			<TextField
				label='Matrícula'
				value={registry.value}
				onChange={registry.onChange}
				error={!!error.registry}
				helperText={error.registry}
			/>
			<TextField
				label='Email'
				error={!!error.email}
				helperText={error.email ?? 'só é possível cadastrar emails institucionais (exemplo@gsuite.iff.edu.br)'}
				defaultValue={state?.placeholder}
				onBlur={putEventTargetValue(setEmail)}
			/>
			<PasswordField
				label='Senha'
				show={showPassword}
				defaultValue={password}
				error={!!error.password}
				helperText='mínimo de 6 caracteres'
				onBlur={putEventTargetValue(setPassword)}
				onChangeVisibility={setShowPassword}
				/>
			<TextField
				label='Confirmar senha'
				defaultValue={passwordConfirmation}
				type={showPassword ? 'text' : 'password'}
				error={!!error.password}
				helperText={error.password}
				onBlur={putEventTargetValue(setPasswordConfirmation)}
			/>
			{ !isModerationRegister && 
				<Typography component='p' variant="body1" mb="5px">
					Já tem uma conta? <Link to="/" component={RouterLink}>Entre aqui</Link>
				</Typography>
			}
			<Button onClick={singUp} variant="contained">Cadastrar-se</Button>
		</AuthLayout>
	)
}