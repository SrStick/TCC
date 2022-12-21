import { getAuth } from "firebase/auth"
import * as Firestore from "firebase/firestore"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

export const Collections = {
	USERS: 'users',
	TASKS: 'tasks',
	MODALITIES: 'modalities',
	USER_TIMES: 'user_times',
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
	const [ lastDoc, setLastDoc ] = useState()
	const lastDocRef = useRef()

	useEffect(() => {
		const { collection, query, getFirestore, getDocs, getDoc, doc, limit, startAfter, orderBy } = Firestore
		const modalitiesRef = collection(getFirestore(), Collections.MODALITIES)
		let q
		if(lastDoc)
			q = query(modalitiesRef, orderBy('limit', 'desc'), startAfter(lastDoc), limit(15))
		else
			q = query(modalitiesRef, orderBy('limit', 'desc'), limit(15))

		getDocs(q).then(async ({ docs }) => {
			const returnedData = []
			lastDocRef.current = docs.at(-1)
			for (const modMeta of docs) {
				const userTimeRef = doc(getFirestore(), Collections.MODALITIES, modMeta.id, Collections.USER_TIMES, getUserID())
				const userTimeData = await getDoc(userTimeRef)
				if (userTimeData.exists()) {
					const modData = modMeta.data()
					const userTime = userTimeData.get('total')

					returnedData.push({
						modality: modData,
						userTime,
						progress: Math.floor(userTime / modData.limit * 100)
					})
				}
			}
			setProgressData(returnedData)
		})
	}, [ lastDoc ])

	const next = useCallback(() => setLastDoc(lastDocRef.current), [])

	return { data: progresData, next }
}

export function useTimeGetterV2() {

	const computedTasks = useTaskQuery({ constraints: [ Firestore.where('status', '==', Status.COMPUTADO) ] })

	useEffect(() => {
		if (computedTasks) {
			const modIDs = computedTasks.map(task => task.modality.id)
			const idSet = new Set(modIDs)

			const r = new Map()
			for (const modId of idSet) {
				for (const task of computedTasks) {
					if(task.modality.id === modId) {
						const v = r.get(modId)
						if (v) {
							r.set(modId, v + task.reply.hors)
						} else {
							r.set(modId, task.reply.hors)
						}
					}
				}
			}
		}
	}, [computedTasks])
}