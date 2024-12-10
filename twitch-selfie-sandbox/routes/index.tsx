import { Route, Routes } from "react-router-dom"

import About from "./About"
import Home from "./Home"
import Participate from "./Participate";
import Studio from "./Studio";
import Lorectionary from "./Lorectionary";

export const Routing = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/studio" element={<Studio />} />
    <Route path="/lorectionary" element={<Lorectionary />} />
    <Route path="/participate" element={<Participate />} />
  </Routes>
)