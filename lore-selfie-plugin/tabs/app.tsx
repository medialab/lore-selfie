

import { MemoryRouter } from "react-router-dom"
import Header from "~components/Header";

import { Routing } from "~routes";

import "~/styles/App.scss"

function App() {
  return (
    <div className="App">
        <MemoryRouter>
          <Header />
          <Routing />
        </MemoryRouter>
    </div>
  )
}

export default App;