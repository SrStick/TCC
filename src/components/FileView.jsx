import ArticleIcon from '@mui/icons-material/Article';
import { Typography } from '@mui/material';

function FileView({ type, url, alt }) {
	const imgStyle = {
		padding: '4px',
		border: '1px solid #dee2e6',
		borderRadius: '4px',
		cursor: 'pointer'
	};

	if (/image\/.{3,}/.test(type)) {
		return (
			<img
				src={url}
				alt={alt}
				style={imgStyle}
				width='210'
				onClick={({ target: { src } }) => window.open(src, '_blank')} />
		);
	} else {
		return (
			<a 
				href={url}
				target='blank'
				className='flex-col-center'
				style={{
					padding: '10px'
				}}
			>
				<ArticleIcon />
				<Typography>teste</Typography>
			</a>
		);
	}
}

export default FileView