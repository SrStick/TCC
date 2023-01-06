import { Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useState, useEffect } from 'react'

function PasswordField({ onChangeVisibility, show, ...props }) {
	const [ showPassword, setShowPassword ] = useState(!!show)

	useEffect(() => {
		if(onChangeVisibility)
			onChangeVisibility(showPassword)
	}, [ onChangeVisibility, showPassword ])

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
								onClick={() => setShowPassword(prevValue => !prevValue)}
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
					</InputAdornment>
				}}
			/>
	)
}

export default PasswordField