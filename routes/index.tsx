import { Route, Routes } from "react-router-dom"

import About from "./About"
import AnnotationView from "./Annotations"
import Home from "./Home"
import Participate from "./Participate"
import SettingsView from "./Settings"
import Studio from "./Studio"

export const Routing = () => (
  <Routes>
    {/* <Route path="/" element={<Home />} /> */}
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/studio" element={<Studio />} />
    <Route path="/annotations/:tab?" element={<AnnotationView />} />
    <Route path="/settings" element={<SettingsView />} />
    <Route path="/participate" element={<Participate />} />
  </Routes>
)
