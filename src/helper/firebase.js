import { getAuth } from "firebase/auth"
import * as Firestore from "firebase/firestore"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

export const Collections = {
	USERS: 'users',
	TASKS: 'tasks',
	MODALITIES: 'modalities',
	USERS_TIMES: 'users_time',
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

	const sevenDaysLater = new Date()
	sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
	addDoc(promoteListRef, { email, validity: Timestamp.fromDate(sevenDaysLater) })
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

function formatDate(timestemp, showTime) {
	const date = timestemp.toDate()
	const [ dateString, time ] = date.toLocaleString().split(' ')
	const [ hours, minutes ] = time.split(':')
	return !showTime ? dateString : `${dateString} ${hours}:${minutes}` 
}

function TaskFactory(doc) {

	const task = extractData(doc)
	task.date = formatDate(task.date)

	if(task.reply) task.reply.date = formatDate(task.reply.date, true)

	return task
}

export function useTimeGetter() {
	const [ progresData, setProgressData ] = useState(null)
	const [ page, setPage ] = useState(0)

	useEffect(() => {
		const { collection, query, getFirestore, getDocs, getDoc, doc, limit, startAt } = Firestore
		const modalitiesRef = collection(getFirestore(), Collections.MODALITIES)
		const q = query(modalitiesRef, startAt(page), limit(15))

		getDocs(q).then(async ({ docs }) => {
			const returnedData = []
			for (const { ref: { path: modPath }, data : getModData } of docs) {
				const userTimeRef = doc(getFirestore(), modPath, getUserID())
				const userTimeData = await getDoc(getFirestore(), userTimeRef)
				if (userTimeData.exists()) {
					const modData = getModData()
					const userTime = userTimeData.get('total')

					returnedData.push({
						modality: modData,
						userTime,
						progress: modData.userTime / modData.limit * 100
					})
				}
			}
			setProgressData(returnedData)
		})
	}, [ page ])

	const goTo = useCallback(delta => setPage(oldPage => oldPage + delta), [])

	return { data: progresData, goTo }
}