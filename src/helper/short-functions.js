export function putEventTargetValue(setFunction, Converter) {
	return ({ target: { value } }) => {
		if (Converter) setFunction(Converter(value))
		else setFunction(value)
	}
}

export function putToggle(setFunction) {
	return () => setFunction(prevValue => !prevValue)
}

export function percentCalc(currentValue, totalValue) {
	return Math.round((currentValue / totalValue) * 100)
}

export function someEmpty(...values) {
	return values.some(v => v.trim() === '')
}

export function captalize(string) {
	return string.split(/ +/).map(word => word[0].toUpperCase() + word.substring(1))
}