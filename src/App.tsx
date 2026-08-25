import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/main.scss';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import GrannySquare from './pages/projects/GrannySquare';
// import About from './pages/About';
import GoalTracker from './pages/projects/GoalTracker';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Parent route using the layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* <Route path="about" element={<About />} /> */}
          <Route path="/projects/granny-square" element={<GrannySquare />} />
          <Route path="/projects/goal-tracker" element={<GoalTracker />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}