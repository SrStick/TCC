import { useCallback, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { getUserID } from "./firebase";

export function useTrackUploadProgress() {
	const [ uploadProgress, setUploadProgress ] = useState(0)
	const [ filesInfo, setFilesInfo ] = useState([])

	const userUID = getUserID()

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
					type: currentFile.type,
					url: getDownloadURL(fileRef)
				}

				setFilesInfo(oldInfos => [...oldInfos, newData])
				const slicer = files.slice(1)
				if(slicer.length) {
					/* isso é pra dar tempo de ver a animação da barra. */
					setTimeout(() => addFilesToQueue(slicer), 1000)
				}

			}
		}
		if (currentFile) {
			fileExt = currentFile.name.split('.')[1]
			fileRef = ref(getStorage(), `${userUID}/${Date.now()}.${fileExt}`)
			uploadBytesResumable(fileRef, currentFile).on('state_changed', stateCallbacks)
		}
	}, [ userUID ])

	return [ uploadProgress, filesInfo, addFilesToQueue ]
}