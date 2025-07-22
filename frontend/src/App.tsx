import { Route, Routes } from "react-router-dom"
import LogIn from "./Pages/LogIn"
import SignUp from "./Pages/Signup"

function App() {

  return (
    <div className="">      
      <Routes>
          <Route path="/" element={<LogIn />}/>
          <Route path="/signup" element={<SignUp />}/>

      </Routes>

    </div>
  )
}

export default App
