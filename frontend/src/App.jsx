import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import Scholarships from "./pages/Scholarships"
import Recommend from "./pages/Recommend"
import About from "./pages/About"
import ScholarshipDetails from "./pages/ScholarshipDetails"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Applications from "./pages/Applications"
import Reminders from "./pages/Reminders"
import EditProfile from "./pages/EditProfile"

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/scholarships/details"
          element={<ScholarshipDetails />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />
      </Routes>

    </BrowserRouter>
  )
}

export default App