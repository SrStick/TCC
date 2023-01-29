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
	NEGADO: 'Negado',
	COMPUTADO: 'Validada'
}

export const UserType = {
	COMMON: 'common',
	ADMIN: 'admin',
	MODERATOR: 'moderator'
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
	const { getFirestore, setDoc, doc, Timestamp } = Firestore
	const promoteListRef = doc(getFirestore(), Collections.PROMOTE_LIST, email)

	const sevenDaysLater = new Date()
	sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
	setDoc(promoteListRef, { validity: Timestamp.fromDate(sevenDaysLater) })
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
	const [ taskStack, setTaskStack ] = useState([])

	const optionsRef = useRef(options)
	const [ lastDoc, setLastDoc ] = useState()
	const lastDocRef = useRef()

	const [ isLoading, setIsLoading ] = useState(true)

	useEffect(() => {
		const { collection, getFirestore, query, limit, startAfter, orderBy, onSnapshot } = Firestore
		const tasksCollection = collection(getFirestore(), Collections.TASKS)
		const startConstraints = [ orderBy('date', 'desc'), limit(20) ]

		if (lastDoc)
			startConstraints.push(startAfter(lastDoc))
		
		const options = optionsRef.current
		const userConstraints = options?.constraints ?? []
		
		const q = query(tasksCollection, ...startConstraints.concat(userConstraints))
		
		return onSnapshot(q, ({ docs }) => {
			const { foreach } = options || {}
			const tasks = docs.map(TaskFactory)
			lastDocRef.current = docs.at(-1)
			
			if (foreach)
				tasks.forEach(foreach)

			setTasks(tasks)
		})
	}, [ lastDoc ])

	useEffect(() => {
		if(tasks !== null) {
			setIsLoading(false)
			setTaskStack(oldValue => oldValue.concat(tasks))
		}
	} , [ tasks ])

	const next = useCallback(() => setLastDoc(lastDocRef.current), [])


	return {
		data: taskStack,
		next,
		isLoading,
		grownUp() {
			return !this.loading && tasks?.length !== 0
		}
	}
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

	const [ limits, setLimits ] = useState()
	const limitsRef = useRef()
	const lastMove = useRef(0)
	

	useEffect(() => {
		const { collection, query, getFirestore, getDocs, getDoc, doc, limit, limitToLast, endBefore, startAfter } = Firestore
		const modalitiesRef = collection(getFirestore(), Collections.MODALITIES)
		const pageSize = 15
		let q

		if(lastMove.current === 1)
			q = query(modalitiesRef, startAfter(limits.last), limit(pageSize))
		else if(lastMove.current === -1)
			q = query(modalitiesRef, endBefore(limits.first), limitToLast(pageSize))
		else
			q = query(modalitiesRef, limit(pageSize))

		getDocs(q).then(async ({ docs }) => {
			const returnedData = []
			limitsRef.current = { first: docs.at(0), last: docs.at(-1) }
			for (const modMeta of docs) {
				const userTimeRef = doc(getFirestore(), Collections.MODALITIES, modMeta.id, Collections.USER_TIMES, getUserID())
				const userTimeData = await getDoc(userTimeRef)
				const modData = extractData(modMeta)
				if (userTimeData.exists()) {
					const userTime = userTimeData.get('total')

					returnedData.push({
						id: userTimeData.id,
						modality: modData,
						userTime,
						progress: Math.floor(userTime / modData.limit * 100)
					})
				} else
					returnedData.push({ id: modData.id, modality: modData, userTime: 0, progress: 0 })
			}

			setProgressData([ ...returnedData ].sort((a, b) => b.userTime - a.userTime))
		})
	}, [ limits ])

	const move = useCallback(dir => {
		lastMove.current = dir
		setLimits(limitsRef.current)
	}, [])

	return { data: progresData, move }
}