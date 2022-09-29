class ValidationError extends Error {
	constructor(message, field, code) {
		super(message)
		this.field = field
		this.code = code
	}
}

export default ValidationError