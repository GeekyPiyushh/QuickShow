import { useState } from 'react'
import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/seatLayout'
import Favourite from './pages/Favourite'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import MyBookings from './pages/MyBookings'


function App() {
  
  const isAdminRoute = useLocation().pathname.startsWith('/admin') 

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/movies' element={<Movies/>}/>
        <Route path='/movies/:id' element={<MovieDetails/>}/>
        <Route path='/movies/:id/:date' element={<SeatLayout/>}/>
        <Route path='/favourite' element={<Favourite/>}/>
        <Route path='/my-bookings' element={<MyBookings/>}/>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App
