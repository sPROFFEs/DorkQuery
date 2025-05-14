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
      <Route path="hacklabs/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="hacklabs/ctf" element={<CTFHub />} />
        <Route path="hacklabs/ctf/:id" element={<Challenge />} />
        <Route path="hacklabs/courses" element={<CoursesHub />} />
        <Route path="hacklabs/courses/:id" element={<Course />} />
        <Route path="hacklabs/*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;