import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/main.scss';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import GrannySquare from './pages/projects/GrannySquare';
import HabitTracker from './pages/projects/HabitTracker';
// import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Parent route using the layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* <Route path="about" element={<About />} /> */}
          <Route path="/projects/granny-square" element={<GrannySquare />} />
          <Route path="/projects/habit-tracker" element={<HabitTracker />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}