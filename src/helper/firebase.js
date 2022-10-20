import { getAuth } from "firebase/auth"
import * as Firestore from "firebase/firestore"
import { createContext, useContext, useEffect, useRef, useState } from "react"

export const Collections = {
	USERS: 'users',
	TASKS: 'tasks',
	MODALITIES: 'modalities',
}

export const Status = {
	EM_ANALISE: 'Em Análize',
	NEGADO: 'Negodo',
	COMPUTADO: 'Computado'
}

export function getUserInfo() {
	const path = Firestore.doc(Firestore.getFirestore(), Collections.USERS, getUserID())
	return Firestore.getDoc(path).then(snap => snap.data())
}

export function getUserID() {
	return getAuth().currentUser?.uid
}

export const UserContext = createContext()

export function useUser() {
	return useContext(UserContext)
}

export function extractData(doc) {
	return { id: doc.id, ...doc.data() }
}

export function useTaskQuery(options) {
	const [ tasks, setTasks ] = useState([])
	const [ page, setPage ] = useState(0)
	const optionsRef = useRef(options)

	// const navigate = delta => setPage(n => n + delta)

	useEffect(() => {
		const { collection, getFirestore, query, limit, startAt, orderBy, onSnapshot } = Firestore
		const tasksCollection = collection(getFirestore(), Collections.TASKS)
		const finalConstraints = [ orderBy('date'), limit(20), startAt(page) ]
		
		const options = optionsRef.current
		const userConstraints = options?.constraints ?? []

			for (const constraint of userConstraints) {
				finalConstraints.push(constraint)
			}
		
		const q = query(tasksCollection, ...finalConstraints)
		
		console.log('task_query_effect')
		return onSnapshot(q, snap => {
			const { foreach, bindModality } = options || {}
			const { docs } = snap
			const tasks = docs.map(TaskFactory)

			if(bindModality) 
				tasks.forEach(bindModalityTo)
			
			if (foreach)
				tasks.forEach(foreach)

			setTasks(tasks)
		})
	}, [ page ])

	return tasks
}

export async function bindModalityTo(task) {
	const { getFirestore, getDoc, doc } = Firestore
	const modalityRef = doc(getFirestore(), Collections.MODALITIES, task.modality)
	const modalityData = await getDoc(modalityRef).then(snap => snap.data())
	task.modality = { id: modalityRef.id, ...modalityData }
}

function TaskFactory(doc) {
	const task = extractData(doc)
	const formatedDate = task.date.toDate().toLocaleDateString()
	task.date = formatedDate

	return task
}