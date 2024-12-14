

import { 
  // MemoryRouter as Router,
  HashRouter as Router,
 } from "react-router-dom"
import Header from "~components/Header";

import { Routing } from "~routes";

import "~/styles/App.scss"

function App() {
  return (
    <div className="App">
        <Router>
          <Header />
          <Routing />
        </Router>
    </div>
  )
}

export default App;