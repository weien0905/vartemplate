import { useState, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from './components/Footer';
import Nav from './components/Nav';
import Box from './components/Box';
import Templates from './components/Templates';
import Create from './components/Create';
import Home from './components/Home';
import TemplateOptions from './components/TemplateOptions';
import PrivateRoute from './components/PrivateRoute';
import jwt_decode from "jwt-decode";

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refresh token and get username if any when reloading
  useEffect(() => {
    const getUser = async () => {
      let token = localStorage.getItem('auth');
      if (token) {
        refreshToken();
      }
    }
    getUser();
  }, [])

  // Clear message when changing route
  useEffect(() => {
    setMessage(null);   
  }, [pathname])

  // Refresh token at an interval of 15 minutes
  useEffect(() => {
    let interval =  setInterval(() => {
        refreshToken()
    }, 15 * 60 * 1000)
    return () => clearInterval(interval);
  }, [token])

  // Refresh token
  const refreshToken = async () => {
    let token = localStorage.getItem('auth')
    let refresh = await JSON.parse(token).refresh
    let res = await fetch("http://localhost:8000/api/token/refresh", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            refresh: refresh
        })
    })
    let data = await res.json();

    if (res.status === 200) {
      localStorage.setItem('auth', JSON.stringify(data))
      let access = await jwt_decode(data.access);
      setToken(data);
      setUser(access.name);
    } else {
      logOut();
    }
  }

  // Remove token and navigate to index page when user logs out
  const logOut = async () => {
    setUser(null);
    localStorage.removeItem('auth');
    navigate("/");
  }

  // Set token and navigate to index page when user signs in
  const onSignUp = async (e) => {
    setMessage(null);
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const retypepassword = e.target.retypepassword.value;
    const checkterms = e.target.checkterms.checked;

    if (!username || !password || !retypepassword) {
        setMessage('Please fill in all fields.');
        return;
    }

    if (password !== retypepassword) {
        setMessage('Password and retype password are not same.');
        return;
    }

    if (!checkterms) {
        setMessage('You have to agree the terms of use of VarTemplate to proceed.');
        return;
    }

    setLoading(true);
    let res = await fetch("http://localhost:8000/api/signup", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            retypepassword: retypepassword
        })
    })
    let data = await res.json();

    // Get token upon signing up successfully
    if (res.status === 200) {
      let res = await fetch("http://localhost:8000/api/token", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    let data = await res.json();

    if (res.status === 200) {
      localStorage.setItem('auth', JSON.stringify(data))
      let access = await jwt_decode(data.access);
      setToken(data);
      setUser(access.name);
      navigate("/");
    }
    } else {
      setMessage(data.error);
    }
    setLoading(false);
  }

  // Set token and navigate to index page when user logs in
  const onLogIn = async (e) => {
    setMessage(null); 
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username || !password) {
        setMessage('Please fill in all fields.');
        return;
    }

    setLoading(true);
    let res = await fetch("http://localhost:8000/api/token", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    let data = await res.json();

    if (res.status === 200) {
      localStorage.setItem('auth', JSON.stringify(data))
      let access = await jwt_decode(data.access);
      setToken(data);
      setUser(access.name);
      if (searchParams.get("redirect")) {
        navigate(searchParams.get("redirect"))
      } else {
        navigate("/");
      }
    } else if (res.status === 401) {
      setMessage('Invalid username or password.');
    }
    setLoading(false);
  }

  return (
    <>
      <Nav user={user} onLogOut={logOut}/>
      <main className='container'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Box title="Log In" func={onLogIn} loading={loading} message={message} user={user} onClose={() => setMessage(null)}/>} />
        <Route path="/signup" element={<Box title="Sign Up" func={onSignUp} loading={loading} message={message} user={user} onClose={() => setMessage(null)}/>} />
        <Route path="/terms" element={<Box title="Terms of Use" />} />
        <Route element={<PrivateRoute />}>
          <Route path="/saved-templates" element={<Templates />} />
          <Route path="/your-templates" element={<Templates />} />
          <Route path="/create" element={<Create />} user={user} />
        </Route>
        <Route path="/search-results" element={<Templates />} />
        <Route path="/template/:id" element={<TemplateOptions user={user} />} />
        <Route path="/error" element={<Box title="Error" />} />
        <Route path="*" element={<Box title="Page does not exist" />} />
      </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
