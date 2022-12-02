import { useContext, createContext } from "react"

const DialogContext = createContext()

const useShowDialog = () => useContext(DialogContext)

export { useShowDialog, DialogContext }