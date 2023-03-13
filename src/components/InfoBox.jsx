import { Typography } from "@mui/material"
import { createContext, useState, useCallback, useContext } from 'react'

const Message = createContext()

const useInfoMessage = () => useContext(Message)


function Wrapper({ children }) {
  const [ message, setMessage ] = useState('')
  const [ visible, setVisible ] = useState(false)

  const showMessage = useCallback(msg => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), 5 * 1000)
  }, [])

  return (
    <>
      <Typography
        component={'div'}
        sx={{
          bgcolor: 'success.main',
          p: 1,
          color: 'white',
          display: visible ? 'block' : 'none',
          position: 'sticky',
          top: '5px',
          fontWeight: 'bold',
          letterSpacing: '.1rem'
        }}
      >{message}</Typography>

      <Message.Provider value={showMessage}>
        {children}
      </Message.Provider>
    </>
  )
}

export { useInfoMessage, Wrapper }