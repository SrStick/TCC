import { Visibility, VisibilityOff } from '@mui/icons-material'
import { FormControl, IconButton, InputAdornment, OutlinedInput, InputLabel, FormHelperText } from '@mui/material'
import { useEffect } from 'react'
import { useMemo, useState } from "react"
import { putToggle } from '../helper/short-functions'

function PasswordField({ label, containerSx, error, onChangeVisibility, ...props }) {

	const id = useMemo(() => `password-field-${label}`, [ label ])

	const [ showPassword, setShowPassword ] = useState(false)

	useEffect(() => {
		if (onChangeVisibility)
			onChangeVisibility(showPassword)
	}, [ showPassword, onChangeVisibility ])

	return (
		<FormControl sx={{ width: '100%', ...containerSx }}>
			<InputLabel htmlFor={id}>{ label }</InputLabel>
			<OutlinedInput
				{ ...props }
				sx={{ bgcolor: '#fff' }}
				id={id}
				label={label}
				error={!!error}
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
			<FormHelperText error={!!error}>{error}</FormHelperText>
		</FormControl>
	)
}

export default PasswordField