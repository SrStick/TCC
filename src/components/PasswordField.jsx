import { Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useState } from 'react'

function PasswordField({ onChangeVisibility, ...props }) {

	const [ showPassword, setShowPassword ] = useState(false)

	return (
			<TextField
				{ ...props }
				type={showPassword ? 'text' : 'password'}
				InputProps={{
					endAdornment:
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								edge="end"
								onClick={() => {
									setShowPassword(prevValue => !prevValue)
									if (onChangeVisibility)
										onChangeVisibility(showPassword)
								}}
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
					</InputAdornment>
				}}
			/>
	)
}

export default PasswordField