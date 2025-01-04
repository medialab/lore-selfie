import { NavLink } from "react-router-dom";
function Header() {
  return (
    <header>
      <div className="header-contents">
      <div>
        <h1>
          <NavLink to="/">
            <span>lore selfie</span>
            <span className="alpha-mark">alpha</span>
          </NavLink>
        </h1>
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/">explorer</NavLink>
          </li>
          <li>
            <NavLink to="/annotations">organiser</NavLink>
          </li>
          <li>
            <NavLink to="/studio">exporter</NavLink>
          </li>
          <li>
            <NavLink to="/settings">paramètres</NavLink>
          </li>
          {/* <li>
            <NavLink to="/participate">Participer à la recherche</NavLink>
          </li> */}
          <li>
            <NavLink to="/about">à propos</NavLink>
          </li>
        </ul>
      </nav>
      </div>
    </header>
  )
}

export default Header;