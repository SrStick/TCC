import ArticleIcon from '@mui/icons-material/Article';
import { Typography } from '@mui/material';

function FileView({ file }) {
	const imgStyle = {
		padding: '4px',
		border: '1px solid #dee2e6',
		borderRadius: '4px',
		cursor: 'pointer'
	};

	if (/image\/.{3,}/.test(file.type)) {
		return (
			<img
				src={file.url}
				alt={file.alt}
				style={imgStyle}
				width='210'
				onClick={({ target: { src } }) => window.open(src, '_blank')} />
		);
	} else {
		return (
			<a 
				href={file.url}
				target='blank'
				className='flex-col-center'
				style={{
					padding: '10px'
				}}
			>
				<ArticleIcon />
				<Typography>{file.originalName}</Typography>
			</a>
		);
	}
}

export default FileView