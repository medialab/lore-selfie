import { NavLink } from "react-router-dom";
function Header() {
  return (
    <header>
      <div>
        <h1>
          <NavLink to="/">Lore selfie</NavLink>
        </h1>
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/">Selfie</NavLink>
          </li>
          {/* <li>
            <NavLink to="/lorectionary">Lorectionary</NavLink>
          </li> */}
          <li>
            <NavLink to="/studio">Studio</NavLink>
          </li>
          {/* <li>
            <NavLink to="/participate">Participer à la recherche</NavLink>
          </li> */}
          <li>
            <NavLink to="/about">À propos</NavLink>
          </li>
        </ul>
      </nav>

    </header>
  )
}

export default Header;