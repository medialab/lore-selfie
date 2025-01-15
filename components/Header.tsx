import { NavLink } from "react-router-dom";
// import { useMemo } from "react";
import {version} from '~/package.json';
import VersionCheckBtn from "./VersionCheckBtn";
function Header() {
  // const actualHref = useMemo(() => window.location.href, [window.location.href]);
  return (
    <header>
      <div className="header-contents">
      <div>
        <h1>
          <NavLink to="/">
            <span>lore selfie</span>
            <span className="alpha-mark">alpha {version}</span>
          </NavLink>
          <VersionCheckBtn />
        </h1>
      </div>
      <nav>
        <ul>
          <li>
            {/* @todo clean following className hack */}
            <NavLink 
              // className={['daily', 'habits'].find(t => actualHref.includes(t)) ? 'is-active' : ''} 
              to="/">explorer</NavLink>
          </li>
          <li>
            <NavLink to="/annotations">organiser</NavLink>
          </li>
          <li>
            <NavLink to="/studio">exporter</NavLink>
          </li>
          <li className="secondary">
            <NavLink to="/settings">paramètres</NavLink>
          </li>
          <li className="secondary">
            <NavLink to="/about">à propos</NavLink>
          </li>
        </ul>
      </nav>
      </div>
    </header>
  )
}

export default Header;