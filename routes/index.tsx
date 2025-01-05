import { Route, Routes } from "react-router-dom"

import About from "./About"
import Home from "./Home"
import Participate from "./Participate";
import Studio from "./Studio";
import Annotations from "./Annotations";
import Settings from "./Settings";

export const Routing = () => (
  <Routes>
    {/* <Route path="/" element={<Home />} /> */}
    <Route path="/:tab?" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/studio" element={<Studio />} />
    <Route path="/annotations/:tab?" element={<Annotations />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/participate" element={<Participate />} />
  </Routes>
)