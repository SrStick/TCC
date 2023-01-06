import { Stack, useTheme } from "@mui/material"
import logo from '../../assets/iff.png'

function AuthLayout({ hideLogo, children }) {
	const theme = useTheme()

	return (
		<Stack
			sx={{
				height:  !hideLogo ? '100vh' : undefined,
				flexDirection: 'row',
				'.MuiFormControl-root': { width: '85%' },
				'.MuiInputBase-root': {
					bgcolor: theme.palette.mode === 'light' ? '#fff' : '#464649'
				},
				[theme.breakpoints.down('md')]: {
					marginTop: '40px',
					flexDirection: 'column'
				}
			}
		}>
			{!hideLogo &&
			<Stack
			alignItems='center'
			justifyContent='center'
			width='100%'
			borderRight='1px solid #bdbdbd'
			>
				<img
					src={logo}
					alt='logo do iff'
					style={{ width: '20vw' }}
					/>
			</Stack>
			}
			<Stack
				alignItems='center'
				justifyContent='center'
				width='100%'
				gap='10px'
				padding='35px'
				>
					{children}
			</Stack>
		</Stack>
	)
}

export default AuthLayout