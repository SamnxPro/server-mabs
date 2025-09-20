import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../component/Home'

export default function PublicRoutes() {
  return (
     <Routes>
       <Route path='/' element= {<Home/>}></Route>
     </Routes>
  )
}
