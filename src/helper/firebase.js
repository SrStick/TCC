import { getAuth } from "firebase/auth"
import * as Firestore from "firebase/firestore"
import { createContext, useEffect, useState } from "react"

export const Collections = {
	USERS: 'users',
	TASKS: 'tasks',
	MODALITIES: 'modalities'
}

export const Status = {
	EM_ANALISE: 'Em Análize',
	NEGADO: 'Negodo',
	Computado: 'Computado'
}

export function getUserInfo() {
	const path = Firestore.doc(Firestore.getFirestore(), Collections.USERS, getUserID())
	return Firestore.getDoc(path).then(snap => snap.data())
}

export function getUserID() {
	return getAuth().currentUser?.uid
}

export const UserContext = createContext()

export function useTaskQuery(options) {
	const [ tasks, setTasks ] = useState([])

	useEffect(() => {
		const { collection, getFirestore, query, limit, orderBy, onSnapshot, getDoc } = Firestore
		const tasksCollection = collection(getFirestore(), Collections.TASKS)
		const finalConstraints = [ limit(20), orderBy('date') ]
		const userConstraints = options?.constraints ?? []

		if (process.env.NODE_ENV === 'development') {
			setTasks([])
			console.log('clear tasks');
		}

			for (const constraint of userConstraints) {
				finalConstraints.push(constraint)
			}
		
		const q = query(tasksCollection, ...finalConstraints)
		
		console.log('task_query_effect')
		return onSnapshot(q, async snap => {
			const { foreach, bindModality } = options || {}

			for (const { doc, type, oldIndex } of snap.docChanges()) {
				const newData = { id: doc.id, ...doc.data() }

				const formatedDate = newData.date.toDate().toLocaleDateString()
				newData.date = formatedDate

				if(bindModality) {
					const modalityRef = Firestore.doc(getFirestore(), Collections.MODALITIES, newData.modality)
					const modalityData = await getDoc(modalityRef).then(snap => snap.data())
					newData.modality = modalityData
				}

				if(foreach) foreach(newData)
				
				setTasks(oldData => {
					const copy = [ ...oldData ]
					if (type === 'added')
						copy.push(newData)
					else if (type === 'removed')
						copy.splice(oldIndex, 1)
					else if(type === 'modified')
						copy[oldIndex] = newData
					return copy
				})
			}
		})
	}, [ options ])

	return tasks
}