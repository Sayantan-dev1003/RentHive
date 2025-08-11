import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  )
}

export default App