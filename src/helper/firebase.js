import { getAuth } from "firebase/auth"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { createContext } from "react"

export const Colllections = {
	USERS: 'users',
	TASKS: 'tasks'
}

export const Status = {
	EM_ANALISE: 'Em Análize',
	NEGADO: 'Negodo',
	Computado: 'Computado'
}


export const UserInfoContext = createContext()

export function getUserInfo() {
	const path = doc(getFirestore(), Colllections.USERS, getUserID())
	return getDoc(path).then(snap => snap.data())
}


export function getUserID() {
	return getAuth().currentUser?.uid
}