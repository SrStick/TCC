import { CircularProgress } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'

import Login from './views/Login/Login';
import Home from "./views/Home/Home";
import Register from './views/Register/Register';
import UploadForm from './views/UploadForm/UploadForm';
import { getUserInfo, UserInfoContext } from './helper/firebase';

function App() {
  const [ loading, setLoading ] = useState(true)
  const [ logged, setLogged ] = useState(false)
  const [ userInfo, setUserInfo ] = useState()

  useEffect(() => {
    async function onChange(user) {
      setLogged(!!user)

      if(user) {
        const databaseInfo = await getUserInfo()
        setUserInfo({
          data: databaseInfo,
          isAdmin: () => databaseInfo.type !== 'common'
        })
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    return onAuthStateChanged(getAuth(), onChange)
  }, [])

  if (loading)
    return (
      <div>
        <h1>Aguarde</h1>
        <CircularProgress/>
      </div>
    )
  else if (!logged)
    return (
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/singin' element={<Register/>}/>
      </Routes>
    )
  else
    return (
      <Routes>
          <Route
            path='/'
            element={(
              <UserInfoContext.Provider value={userInfo}>
                <Home/>
              </UserInfoContext.Provider>
            )}
          />
          <Route path='/upload-form' element={<UploadForm/>}/>
      </Routes>
    )
}




export default App;
