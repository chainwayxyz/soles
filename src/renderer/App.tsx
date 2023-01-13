import { Button, Page } from '@geist-ui/core';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AiOutlineHome, AiOutlineCode } from 'react-icons/ai';
import './App.css';
import Home from './Home';
import Logs from './Logs';

export default function App() {
  return (
    <Router>
      {/* Create tab looking buttons */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
          width: '100%',
          backgroundColor: '#181414',
          color: 'white',
          paddingLeft: '10px',
        }}
      >
        <Link
          to="/"
          style={{
            padding: '12px',
            fontSize: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <AiOutlineHome />
          Home
        </Link>
        <Link
          to="/logs"
          style={{
            padding: '12px',
            fontSize: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <AiOutlineCode />
          Logs
        </Link>
      </nav>
      <div
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: '10px',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </div>
    </Router>
  );
}
