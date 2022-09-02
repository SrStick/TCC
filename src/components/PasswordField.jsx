import { Visibility, VisibilityOff } from '@mui/icons-material'
import { FormControl, IconButton, InputAdornment, OutlinedInput, InputLabel } from '@mui/material'
import { useEffect } from 'react'
import { useMemo, useState } from "react"
import { putToggle } from '../helper/short-functions'

function PasswordField({ label, containerSx, onChangeVisibility, ...props }) {

	const id = useMemo(() => `password-field-${label}`, [ label ])

	const [ showPassword, setShowPassword ] = useState(false)

	useEffect(() => {
		if (onChangeVisibility)
			onChangeVisibility(showPassword)
	}, [ showPassword, onChangeVisibility ])

	return (
		<FormControl sx={containerSx}>
			<InputLabel htmlFor={id}>{ label }</InputLabel>
			<OutlinedInput
				{ ...props }
				sx={{ bgcolor: '#fff' }}
				id={id}
				label={label}
				type={showPassword ? 'text' : 'password'}
				endAdornment={
					<InputAdornment position="end">
						<IconButton
							aria-label="toggle password visibility"
							onClick={putToggle(setShowPassword)}
							edge="end"
						>
							{showPassword ? <VisibilityOff /> : <Visibility />}
						</IconButton>
					</InputAdornment>
				}
			/>
		</FormControl>
	)
}

export default PasswordField