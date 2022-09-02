import { useContext } from "react"
import { UserContext } from "../../helper/firebase"
import Admin from "./Admin"
import CommumUser from "./CommumUser"

function Home() {
	const user = useContext(UserContext)
	return !user.isAdmin ? <CommumUser/> : <Admin/>
}

export default Home