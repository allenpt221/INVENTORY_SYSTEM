import { Route, Routes } from "react-router-dom"
import LogIn from "./Pages/LogIn"

function App() {

  return (
    <div className="p-2">      
      <Routes>
          <Route path="/" element={<LogIn />}/>
      </Routes>

    </div>
  )
}

export default App
