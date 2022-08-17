import ArticleIcon from '@mui/icons-material/Article';

function FileView({ type, url }) {
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
				style={imgStyle}
				width='210'
				onClick={({ target: { src } }) => window.open(src, '_blank')} />
		);
	} else {
		return (
			<a href={url}>
				<ArticleIcon />
			</a>
		);
	}
}

export default FileView