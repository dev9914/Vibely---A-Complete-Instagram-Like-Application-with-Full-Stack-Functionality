import { useState } from 'react'
import './SignIn.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CheckboxDemo } from '../components/Remeberme'

const SignIn = () => {
  const navigate = useNavigate()
  const ApiUrl = import.meta.env.VITE_API_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    }
    if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };

  const login = async() =>{
    try {
      const response = await axios.post(`${ApiUrl}/users/login`,{
        email: email,
        password:password
      })

      setEmail('')
      setPassword('')
      if (response.data.data.accessToken) {
        const token = response.data.data.accessToken;
        const expirationTime = Date.now() + 12 * 60 * 60 * 1000; // Set expiration to 12 hours

        // Store token and expiration time in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiry', expirationTime);

        // Redirect to the home page
        navigate('/');
    } else {
        setError('Login failed');
    }

      // console.log(response.data.data.accessToken)
      return response.data
    } catch (error) {
      console.log(error?.response.data.errors)
      setError(error?.response.data.errors)
      setEmail('')
      setPassword('')
    }
    
  }

  const handleLogin = ()=> {
    setError("");

    // Check if email is provided and if it ends with '@gmail.com'
    if (!email) {
      return setError("Email is required");
    } else if (!email.endsWith("@gmail.com")) {
      return setError("Email must end with '@gmail.com'");
    }
    if(!password) {
      return setError("Password is required")
    }
    login()
  }


  return (<>
    <div style={{height:'100vh',marginLeft:'-15vw'}} className='text-white flex justify-center items-center'>
       <div className='maincard rounded-md'>
        <div className='m-7'>
            <div className='flex'>
            {/* <img src={icon} className='mr-2' style={{width:'25px', height:"25px"}} alt="" /> */}
            <h1 className='text-xl mb-4 text-blue-500 font-sans font-semibold'>Vibely</h1>
            </div>
            <h1 className='text-3xl font-sans font-semibold'>Buyer Sign In</h1>
            <div className='flex flex-col mt-6'>
                <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Email</label>
                <input type="text" autoComplete="off" value={email} onChange={handleInputChange} name="email" id="2" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='your@gmail.com' />
            </div>
            <div className='flex flex-col mt-4'>
                <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Password</label>
                <input type="password" autoComplete="off" value={password} onChange={handleInputChange} name="password" id="1" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='• • • • • •' />
            </div>
            {error && <p className='text-red-600 ml-4'>{error}</p>}
            <div className='mt-3'>
            {/* <FormControlLabel control={<Checkbox />} className='text-sm' label="Remember me" /> */}
            <CheckboxDemo />
            </div>
            <div onClick={handleLogin} className='bg-white mt-5 rounded-lg cursor-pointer h-10 flex justify-center'>
            <button className='text-black font-sans font-semibold'>Sign In</button>
            </div>
            <div className='flex justify-center mt-3 text-white'>
                <p className='mr-1'>Don't have an account?</p>
                <Link to='/signup'>
                <p className='font-semibold font-sans underline cursor-pointer'>Sign Up</p>
                </Link>
            </div>
        </div>
       </div>
    </div>
    </>
  )
}

export default SignIn
