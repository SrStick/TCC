import { useCallback, useEffect, useReducer, useState } from "react";
import { getUserID } from "./firebase";
import * as Storage from 'firebase/storage'

export function useTrackUploadProgress() {
	const [ uploadProgress, setUploadProgress ] = useState(0)
	const [ filesInfo, setFilesInfo ] = useState([])

	const addFilesToQueue = useCallback(files => {
		const currentFile = files[0]
		let fileExt, fileRef

		const { getDownloadURL, ref, uploadBytesResumable, getStorage } = Storage

		const stateCallbacks = {
			next(snap) {
				const progress = (snap.bytesTransferred / snap.totalBytes) * 100
				setUploadProgress(Math.floor(progress))
			},
			complete() {
				const newData = {
					name: fileRef.name,
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
	
	return [ uploadProgress, filesInfo, addFilesToQueue ]
}

export function useUploadHook(files) {
	const [ info, dispatch ] = useReducer((state, action) => {
		if (action.type === 'update') {
			let totalBytes = state.totalBytes ?? 0
			totalBytes += action.bytes
			const progress = totalBytes / state.totalSize * 100
			return { ...state, progress: Math.floor(progress) }
		}

		if (action.type === 'set_size') {
			return { ...state, totalSize: action.value }
		}
	}, { totalSize: 0, progress: 0 })
	
	useEffect(() => {
		const userUID = getUserID()
		const totalSize = files.map(file => file.size).reduce((a, b) => a + b)
		dispatch({ type: 'set_size', value: totalSize })
		for (const file of files) {
			const fileExt = file.name.split('.')[1]
			const fileRef = Storage.ref(Storage.getStorage(), `${userUID}/${Date.now()}.${fileExt}`)
			Storage.uploadBytesResumable(fileRef, file).on('state_changed', {
				next(snap) {
					dispatch({ type: 'update', bytes: snap.bytesTransferred })
				}
			})
		}
	}, [ files ])
}