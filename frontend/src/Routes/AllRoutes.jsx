import React from 'react'
import { Chatbot } from '../Components/Chatbot'
import {Routes,Route} from "react-router-dom"

export const AllRoutes = () => {
  return (
    <Routes>
        <Route path = "/" element = {<Chatbot/>} />
    </Routes>
  )
}
