import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CTFHub from './pages/CTFHub';
import Challenge from './pages/Challenge';
import CoursesHub from './pages/CoursesHub';
import Course from './pages/Course';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="ctf" element={<CTFHub />} />
        <Route path="ctf/:id" element={<Challenge />} />
        <Route path="courses" element={<CoursesHub />} />
        <Route path="courses/:id" element={<Course />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;