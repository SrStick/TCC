import { getAuth } from "firebase/auth"
import { getDoc, getDocs, query, collection, where, getFirestore, doc, limitToLast, endBefore, limit, startAfter, orderBy } from "firebase/firestore/lite"
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
	NEGADO: 'Rejeitada',
	COMPUTADO: 'Validada'
}

export const UserType = {
	COMMON: 'common',
	ADMIN: 'admin',
	MODERATOR: 'moderator'
}

export function getUserInfo() {
	const path = doc(getFirestore(), Collections.USERS, getUserID())
	return getDoc(path).then(snap => snap.data())
}

export function getUserID() {
	return getAuth().currentUser?.uid
}

export async function findUserByEmail(email) {
	const userCollections = collection(getFirestore(), Collections.USERS)
	const q = query(userCollections, where('email', '==', email))
	return getDocs(q)
}

export const UserContext = createContext()

export function useUser() {
	return useContext(UserContext)
}

export function extractData(doc) {
	return { id: doc.id, ...doc.data() }
}

export function useTaskQuery(options) {
	const [ taskStack, setTaskStack ] = useState([])
	const [ filterByStatus, setFilterByStatus ] = useState('all')
	
	const optionsRef = useRef(options)
	const lastDocsRef = useRef()
	const [ lastDoc, setLastDoc ] = useState()
	
	const [ isLoading, setIsLoading ] = useState(true)

	useEffect(() => {
		const startConstraints = [ orderBy('date', 'desc'), limit(20) ]

		const hasFilter = filterByStatus !== 'all'
		if (!Object.values(Status).includes(filterByStatus) && hasFilter)
			throw new Error("Invalid Status")

		if (lastDoc)
			startConstraints.push(startAfter(lastDoc))

		if(hasFilter)
			startConstraints.push(where('status', '==', filterByStatus))
		
		const options = optionsRef.current
		const userConstraints = options?.constraints ?? []
		
		const q = buildQuery(Collections.TASKS, ...startConstraints.concat(userConstraints))

		getDocs(q).then(({ docs }) => {
			const { foreach } = options || {}
			if(foreach)
				docs.forEach(foreach)

			lastDocsRef.current = docs
			
			setTaskStack(docs.map(TaskFactory))
			setIsLoading(false)
		})

		const onAddDoc = ({ detail: addedDoc }) => {
			setTaskStack(oldValue => ([ TaskFactory(addedDoc), ...oldValue ]))
		}
		const onEditDoc = ({ detail: { id, status, reply: { author, date } } }) => {
			setTaskStack(oldValue => {
				const copy = [...oldValue]
				const oldDocIndex = copy.findIndex(doc => doc.id === id)
				const oldDoc = copy[oldDocIndex]
				copy[oldDocIndex] = {
					...oldDoc,
					status,
					reply: {
						author,
						date: formatDate(date)
					}
				}
				return copy
			})
		}

		window.addEventListener('adddoc', onAddDoc)
		window.addEventListener('editdoc', onEditDoc)

		return () => {
			window.removeEventListener('adddoc', onAddDoc)
			window.removeEventListener('editdoc', onEditDoc)
		}
	}, [ lastDoc, filterByStatus ])

	const grownUp = () => !isLoading && lastDocsRef.current?.length !== 0

	const next = useCallback(() => {
		if (grownUp())
			setLastDoc(lastDocsRef.current.at(-1))

	}, [])

	return {
		data: taskStack,
		next,
		isLoading,
		grownUp,
		showOnly: setFilterByStatus
	}
}

function formatDate(timestemp, showTime) {
	const date = timestemp.toDate()
	const dateString = [ date.getDate(), date.getMonth(), date.getFullYear() ]
		.map(datePart => datePart < 10 ? '0' + datePart : datePart)
		.join('/')
	return !showTime ? dateString : `${dateString} ${date.getHours()}:${date.getMinutes()}`
}

function TaskFactory(doc) {

	const task = extractData(doc)
	task.date = formatDate(task.date)

	if(task.reply) task.reply.date = formatDate(task.reply.date, true)

	task.modality.getTypeDesc = function() {
		return this.otherType || this.type
	}

	task.getShortDescription = function() {
		const descLength = this.description.length
		const shortDescription = this.description.substring(0, 297) + '...'
		return descLength > 300 ? shortDescription : this.description
	}

	return task
}

export function useTimeGetter() {
	const [ progresData, setProgressData ] = useState(null)

	const [ limits, setLimits ] = useState()
	const limitsRef = useRef()
	const lastMove = useRef(0)
	

	useEffect(() => {
		const pageSize = 15
		let q

		if(lastMove.current === 1)
			q = buildQuery(Collections.MODALITIES, startAfter(limits.last), limit(pageSize))
		else if(lastMove.current === -1)
			q = buildQuery(Collections.MODALITIES, endBefore(limits.first), limitToLast(pageSize))
		else
			q = buildQuery(Collections.MODALITIES, limit(pageSize))

		getDocs(q).then(async ({ docs }) => {
			// items de subcoleções diferentes podem ter o mesmo id 
			let tempId = 0 
			const returnedData = []
			limitsRef.current = { first: docs.at(0), last: docs.at(-1) }
			for (const modMeta of docs) {
				const userTimeRef = doc(getFirestore(), Collections.MODALITIES, modMeta.id, Collections.USER_TIMES, getUserID())
				const userTimeData = await getDoc(userTimeRef)
				const modData = extractData(modMeta)
				if (userTimeData.exists()) {
					const userTime = userTimeData.get('total')

					returnedData.push({
						id: ++tempId,
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

function buildQuery(collectionName, ...constraints) {
	const c = collection(getFirestore(), collectionName)
	return query(c, ...constraints)
}