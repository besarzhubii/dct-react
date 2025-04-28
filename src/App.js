import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import Main from './pages/Main';
import Users from './pages/Users';
import ProfileForm from './pages/ProfileForm';
import ProtectedRoute from './components/functions/ProtectedRoute';
import UserGraph from './pages/UserGraph';
import SignUp from './components/SignUp';
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<SignIn/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route element={<ProtectedRoute/>}>
          <Route path='/' element={<Navigate to='/dashboard'/>}/>
          <Route path='/dashboard' element={<Main/>}/>
          <Route path='/user-graph' element={<UserGraph/>}/>
          <Route path='/users' element={<Users/>}/>
          <Route path='/profile' element={<ProfileForm/>}/>
          <Route path='/profile' element={<ProfileForm/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
