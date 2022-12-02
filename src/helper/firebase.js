import { getAuth } from "firebase/auth"
import * as Firestore from "firebase/firestore"
import { getDownloadURL, getStorage, ref } from "firebase/storage"
import { createContext, useContext, useEffect, useRef, useState } from "react"

export const Collections = {
	USERS: 'users',
	TASKS: 'tasks',
	MODALITIES: 'modalities',
	PROMOTE_LIST: 'promote_list'
}

export const Status = {
	EM_ANALISE: 'Em Análise',
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

export async function findUserByEmail(email) {
	const { getDocs, query, getFirestore, collection, where } = Firestore
	const userCollections = collection(getFirestore(), Collections.USERS)
	const q = query(userCollections, where('email', '==', email))
	return getDocs(q)
}

export async function promoteUser(email) {
	const { doc, getFirestore, updateDoc } = Firestore
	const snap = await findUserByEmail(email)
	if (!snap.empty) {
		const metaId = snap.docs.pop()
		const metaRef = doc(getFirestore(), Collections.USERS, metaId)
		return updateDoc(metaRef, { type: 'moderator' })
	}
	throw new Error('email não encontrado')
}

export function addEmailToPromoteList(email) {
	const { getFirestore, collection, addDoc, Timestamp } = Firestore
	const promoteListRef = collection(getFirestore(), Collections.PROMOTE_LIST)
	addDoc(promoteListRef, { email, date: Timestamp.now() })
}

export const UserContext = createContext()

export function useUser() {
	return useContext(UserContext)
}

export function extractData(doc) {
	return { id: doc.id, ...doc.data() }
}

export function useTaskQuery(options) {
	const [ tasks, setTasks ] = useState(null)
	const [ page, setPage ] = useState(0)
	const optionsRef = useRef(options)

	// const navigate = delta => setPage(n => n + delta)

	useEffect(() => {
		const { collection, getFirestore, query, limit, startAt, orderBy, onSnapshot } = Firestore
		const tasksCollection = collection(getFirestore(), Collections.TASKS)
		const startConstraints = [ orderBy('date'), limit(20), startAt(page) ]
		
		const options = optionsRef.current
		const userConstraints = options?.constraints ?? []
		
		const q = query(tasksCollection, ...startConstraints.concat(userConstraints))
		
		return onSnapshot(q, ({ docs }) => {
			const { foreach } = options || {}
			const tasks = docs.map(TaskFactory)
			
			if (foreach)
				tasks.forEach(foreach)

			setTasks(tasks)
		})
	}, [ page ])

	return tasks
}

function TaskFactory(doc) {
	const task = extractData(doc)
	const formatedDate = task.date.toDate().toLocaleDateString()
	task.date = formatedDate
	return task
}