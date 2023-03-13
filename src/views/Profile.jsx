import { Stack, Typography, Button, TextField, Box } from "@mui/material"
import {
	EmailAuthProvider,
	getAuth,
	reauthenticateWithCredential,
	updateEmail,
	updateProfile,
} from "firebase/auth"
import { useState } from "react"
import { PasswordField, InfoBox } from "../components"
import ChangePasswordPanel from "../components/ChangePasswordPanel"
import { useUser } from "../helper/firebase"
import { putEventTargetValue, captalize } from "../helper/short-functions"

function ActionLabel({ action, title, info }) {
	const [showAction, setShowAction] = useState(false)

	return (
		<>
			<Stack
				onMouseEnter={() => setShowAction(true)}
				onMouseLeave={() => setShowAction(false)}
				direction="row"
				alignItems="center"
				columnGap={1}
				minHeight={"40px"}
			>
				<Typography component="h6" fontWeight="bold">
					{title}
				</Typography>
				{showAction && action}
			</Stack>
			<Box sx={{ mb: 2 }} component="span">
				{info}
			</Box>
		</>
	)
}

function Content() {
	const dbUser = useUser()
	const user = getAuth().currentUser
	const [toUpdateInfo, setToUpdateInfo] = useState()
	const [fieldValue, setFieldValue] = useState("")
	const [providedPassword, setProvidedPassword] = useState("")
	const [passwordError, setPasswordError] = useState('')
	const [showChangePasswordPanel, setShowChangePasswodPanel] = useState(false)

	const [name, setName] = useState(user.displayName)
	const [email, setEmail] = useState(user.email)

	const [fieldError, setFieldError] = useState('')

	const setInfoMessage = InfoBox.useInfoMessage()

	const clearState = () => {
		setFieldValue("")
		setPasswordError('')
		setProvidedPassword("")
		setToUpdateInfo("")
		setShowChangePasswodPanel(false)
	}

	const artigo = toUpdateInfo === "senha" ? "a" : "o"

	const doUpdate = async () => {
		switch (toUpdateInfo) {
			case "nome":
				await updateProfile(user, { displayName: fieldValue })
				setInfoMessage("Nome Atualizado com sucesso!")
				setName(fieldValue)
				clearState()
				break
			case "email":
				if(!fieldValue.endsWith('@gsuite.iff.edu.br')) {
					setFieldError('insira um email institucional!')
				} else {
					try {
						const { user: reUser } = await reauthenticateWithCredential(
							user,
							EmailAuthProvider.credential(user.email, providedPassword)
						)
						await updateEmail(reUser, fieldValue)
						setInfoMessage("email atualizado com sucesso!")
						setEmail(fieldValue)
					} catch (error) {
						switch (error.code) {
							case 'auth/email-already-in-use':
								setFieldError('esse email já está em uso')
							break

							case 'auth/wrong-password':
								setPasswordError('senha incorreta')
							break
						}
					}
				}
				break
		}
	}

	const hideUpdateOnEcape = ({ key }) => {
		if (key === "Escape") {
			clearState()
		}
	}

	return (
		<Stack>
			<ActionLabel
				title="Nome"
				info={name}
				action={
					<Button
						onClick={() => {
							clearState()
							setToUpdateInfo("nome")
						}}
						size="small"
						color="neutral"
					>Editar</Button>
				}
			/>
			<ActionLabel
				title="Email"
				info={email}
				action={
					<Button
						onClick={() => {
							clearState()
							setToUpdateInfo("email")
						}}
						size="small"
						color="neutral"
					>Editar</Button>
				}
			/>
			<ActionLabel title="Matrícula" info={dbUser.info.registry} />

			<Button
				sx={{ alignSelf: "flex-start" }}
				variant="outlined"
				onClick={() => {
					clearState()
					setShowChangePasswodPanel(true)
				}}
			>
				Alterar Senha
			</Button>

			{toUpdateInfo && (
				<Stack rowGap={1} alignItems="center">
					<TextField
						label={`Nov${artigo} ${captalize(toUpdateInfo)}`}
						value={fieldValue}
						onChange={putEventTargetValue(setFieldValue)}
						onKeyUp={hideUpdateOnEcape}
						error={!!fieldError}
						helperText={fieldError || (toUpdateInfo === 'email' && 'somente emails institucionais serão aceitos (exemplo@gsuite.iff.edu.br)')}
						sx={{ alignSelf: "center" }}
					/>
					{toUpdateInfo === "email" && (
						<PasswordField
							label={"Digite sua senha"}
							value={providedPassword}
							onChange={putEventTargetValue(setProvidedPassword)}
							onKeyUp={hideUpdateOnEcape}
							error={!!passwordError}
							helperText={passwordError}
						/>
					)}
					<Button variant="contained" onClick={doUpdate}>
						Atualizar {toUpdateInfo}
					</Button>
				</Stack>
			)}
			{showChangePasswordPanel && <ChangePasswordPanel hideTitle />}
		</Stack>
	)
}

function Profile() {
	return (
		<InfoBox.Wrapper>
			<Content />
		</InfoBox.Wrapper>
	)
}

export default Profile
