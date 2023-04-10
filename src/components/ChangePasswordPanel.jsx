import { PasswordField } from "."
import { Button, TextField, Typography, Card } from "@mui/material"
import { useState } from "react"
import { someEmpty, putEventTargetValue } from "../helper/short-functions"
import {
	EmailAuthProvider,
	getAuth,
	reauthenticateWithCredential,
	updatePassword,
} from "firebase/auth"

export default function ChangePasswordPanel({ hideTitle }) {
	const [newPasswordIsVisible, setNewPasswordIsvisible] = useState(false)
	const [oldPassword, setOldPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confimation, setConfimation] = useState("")
	const [errorMessage, setErrorMesssage] = useState()
	const [success, setSuccess] = useState(false)
	const [closed, setClosed] = useState(false)

	async function send() {
		if (newPassword != confimation)
			setErrorMesssage("a nova senha não é igual a sua confirmação")
		else {
			const user = getAuth().currentUser
			const credential = EmailAuthProvider.credential(user.email, oldPassword)
			try {
				const { user: authUser } = await reauthenticateWithCredential(
					user,
					credential
				)
				await updatePassword(authUser, newPassword)
				setSuccess(true)
				setTimeout(() => setClosed(true), 1000 * 5)
			} catch (err) {
				switch (err.code) {
					case "auth/wrong-password":
						setErrorMesssage("senha atual incorreta")
					break
					case "auth/weak-password":
						setErrorMesssage("a senha deve conter, no mínimo, 6 caracteres")
					break
				}
			}
		}
	}

	if (closed) return null

	if (success)
		return (
			<Card sx={{ bgcolor: "success.main" }}>
				<Typography p={1} color="#fff">
					Senha alterada com sucesso
				</Typography>
			</Card>
		)

	return (
		<div className="flex-col-center">
			<Card
				sx={{
					display: "flex",
					flexDirection: "column",
					px: 5,
					py: 2,
					mb: 2,
					rowGap: 2,
				}}
			>
				{!hideTitle && <Typography variant="h6">Altere sua senha</Typography>}
				<PasswordField
					label="Senha atual"
					value={oldPassword}
					onChange={putEventTargetValue(setOldPassword)}
				/>
				<PasswordField
					label="Nova senha"
					value={newPassword}
					onChange={putEventTargetValue(setNewPassword)}
					onChangeVisibility={setNewPasswordIsvisible}
				/>
				<TextField
					label="Confirmar nova senha"
					value={confimation}
					type={newPasswordIsVisible ? "text" : "password"}
					onChange={putEventTargetValue(setConfimation)}
				/>
				{errorMessage && (
					<Typography fontSize="italic" color="error">
						{errorMessage}
					</Typography>
				)}
				<Button
					disabled={someEmpty(oldPassword, newPassword, confimation)}
					onClick={send}
				>
					Alterar senha
				</Button>
			</Card>
		</div>
	)
}
