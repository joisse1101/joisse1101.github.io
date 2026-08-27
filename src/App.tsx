import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "@joisse1101/ui-library/ui-library.css";
import { MainLayout } from '@joisse1101/ui-library';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

import Post from './pages/posts/Post';
import Note from './pages/notes/Note';

export default function App() {
  return (
    <BrowserRouter> 
      <Routes>
        {/* Parent route using the layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* <Route path="about" element={<About />} /> */}
          <Route path="posts" element={<div>post main page</div>} />
          <Route path="posts/:postId" element={<Post />} />
          <Route path="notes/:noteId" element={<Note />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}