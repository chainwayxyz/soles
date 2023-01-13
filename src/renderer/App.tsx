import { Button, Page } from '@geist-ui/core';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import { AiOutlineHome, AiOutlineCode } from 'react-icons/ai';
import './App.css';
import Home from './Home';
import Logs from './Logs';

export default function App() {
  return (
    <Router>
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
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'lighter',
            padding: '12px',
            fontSize: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          })}
        >
          <AiOutlineHome />
          Home
        </NavLink>
        <NavLink
          to="/logs"
          end
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'lighter',
            padding: '12px',
            fontSize: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          })}
        >
          <AiOutlineCode />
          Logs
        </NavLink>
      </nav>
      <div
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: '10px',
        }}
      >
        <Routes>
          <Route path="/logs" element={<Logs />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
