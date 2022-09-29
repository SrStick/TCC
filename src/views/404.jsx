import { Link, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

function NotFound() {
	return (
		<div
			style={{
				backgroundColor: '#32a041',
				color: 'white',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				fontSize: '2.5rem',
				height: '100vh',
				paddingTop: '15px',
				fontFamily: 'monospace'
			}}
		>
			<Typography
				variant="h1"
				fontFamily='inherit'
				textTransform='uppercase'
				fontSize='inherit'
			>página não encontrada</Typography>
			<div style={{ fontSize: '150px' }}>
				<span style={{ display: 'block' }}>{'(>_<)'}</span>
			</div>
			<Link component={RouterLink} to='/' color='#fff' fontFamily='inherit' mt='25px'>Voltar</Link>
		</div>
	)
}

export default NotFound