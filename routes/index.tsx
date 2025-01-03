import { Route, Routes } from "react-router-dom"

import About from "./About"
import Home from "./Home"
import Participate from "./Participate";
import Studio from "./Studio";
import Lorectionary from "./Lorectionary";
import Settings from "./Settings";
import Channels from "./Channels";

export const Routing = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/studio" element={<Studio />} />
    <Route path="/lore" element={<Lorectionary />} />
    <Route path="/channels" element={<Channels />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/participate" element={<Participate />} />
  </Routes>
)