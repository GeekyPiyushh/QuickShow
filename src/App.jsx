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
import BookingSummary from './pages/BookingSummary'
import BookingSuccess from './pages/BookingSuccess'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import AddMovie from './pages/admin/AddMovie'


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
        <Route path='/booking-summary' element={<BookingSummary/>}/>
        <Route path='/booking-success' element={<BookingSuccess/>}/>

        <Route path='/admin' element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='add-movie' element={<AddMovie/>}/>
          <Route path='add-shows' element={<AddShows/>}/>
          <Route path='list-shows' element={<ListShows/>}/>
          <Route path='list-bookings' element={<ListBookings/>}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App
