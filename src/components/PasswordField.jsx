import { Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { putToggle } from '../helper/short-functions'

function PasswordField({ onChangeVisibility, ...props }) {

	const [ showPassword, setShowPassword ] = useState(false)

	useEffect(() => {
		if (onChangeVisibility)
			onChangeVisibility(showPassword)
	}, [ showPassword, onChangeVisibility ])

	return (
			<TextField
				{ ...props }
				type={showPassword ? 'text' : 'password'}
				InputProps={{
					endAdornment:
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								onClick={putToggle(setShowPassword)}
								edge="end"
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
					</InputAdornment>
				}}
			/>
	)
}

export default PasswordField