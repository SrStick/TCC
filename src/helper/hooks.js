import { useCallback, useEffect, useRef, useState } from "react";
import { getUserID } from "./firebase";
import { getDownloadURL, ref, uploadBytesResumable, getStorage } from 'firebase/storage'

export function useTrackUploadProgress() {
	const [ uploadProgress, setUploadProgress ] = useState(0)
	const numberOfFiles = useRef(0)
	const onCompleteRef = useRef()
	const [ completedUploads, setCompletedUploads ] = useState(0)
	const [ filesInfo, setFilesInfo ] = useState([])

	const addFilesToQueue = useCallback(files => {
		const currentFile = files[0]
		let fileExt, fileRef


		const stateCallbacks = {
			next(snap) {
				const progress = (snap.bytesTransferred / snap.totalBytes) * 100
				setUploadProgress(Math.floor(progress))
			},
			complete() {
				const newData = {
					name: fileRef.name,
					originalName: currentFile.name,
					type: currentFile.type,
					url: getDownloadURL(fileRef)
				}

				setFilesInfo(oldInfos => [...oldInfos, newData])
				const slicer = files.slice(1)
				if(slicer.length)
					addFilesToQueue(slicer)

			}
		}
		if (currentFile) {
			const userUID = getUserID()
			fileExt = currentFile.name.split('.')[1]
			fileRef = ref(getStorage(), `${userUID}/${Date.now()}.${fileExt}`)
			uploadBytesResumable(fileRef, currentFile).on('state_changed', stateCallbacks)
		}
	}, [])

	useEffect(() => {
		if(numberOfFiles.current === filesInfo.length && onCompleteRef.current) {
			Promise.all(filesInfo.map(info => info.url)).then(urls => {
				const mergeURL = (data, i) => ({ ...data, url: urls[i] })
				onCompleteRef.current(filesInfo.map(mergeURL))
			})
		}
		if(filesInfo.length) {
			setCompletedUploads(completed => completed + 1)
		}
	}, [ filesInfo ])
	
	return [
		uploadProgress,
		completedUploads,
		(files, onComplete) => {
			numberOfFiles.current = files.length
			onCompleteRef.current = onComplete
			addFilesToQueue(files)
		}
	]
}

export function useTextPatterns(...filters) {
	const [ fieldValue, setFieldValue ] = useState('')
	const filtersRef = useRef(filters)
	
	const onChange = useCallback(({ target: { value } }) => {
		setFieldValue(oldValue => {
			const accepted = filtersRef.current.map(fn => fn(value)).reduce((a, b) => a && b)
			if(value.length < oldValue.length || accepted) {
				return value
			}
			return oldValue
		})
	}, [])
	
	const clearValue = useCallback(() => setFieldValue(''), [])
	
	return { value: fieldValue, onChange, clearValue }
}

export const PatternFunctions = {
	onlyNumbers: value => !isNaN(value),
	limit(value) {
		return word => word.length <= value
	}
}