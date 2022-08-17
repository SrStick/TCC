export function putEventTargetValue(setFunction) {
	return ev => setFunction(ev.target.value)
}

export function putToggle(setFunction) {
	return () => setFunction(prevValue => !prevValue)
}