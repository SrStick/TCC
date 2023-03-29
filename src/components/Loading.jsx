import { CircularProgress, Stack, Typography } from '@mui/material';

const Loading = () => (
	<Stack alignItems='center'>
		<Typography variant='h1' fontSize='2rem'>Aguarde</Typography>
		<CircularProgress />
	</Stack>
);

export default Loading