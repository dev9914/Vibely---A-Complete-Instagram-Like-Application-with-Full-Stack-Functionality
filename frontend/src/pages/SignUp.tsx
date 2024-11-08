import { useState } from 'react'
import './SignIn.css'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from "react-router-dom"

const SignUp = () => {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmpassword, setconfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullname, setfullName] = useState('')
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState({});

  const handleInputChange = (e) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    }
    if (e.target.name === "password") {
      setPassword(e.target.value);
    }
    if (e.target.name === "username") {
      setUsername(e.target.value);
    }
    if (e.target.name === "confirmPassword") {
      setconfirmPassword(e.target.value);
    }
    if (e.target.name === "fullname") {
      setfullName(e.target.value);
    } 
    if (e.target.name === "image") {
    // Handle image upload
    setAvatar(e.target.files[0]);
    console.log(avatar)
  }
  };

  // const SignUp = async() =>{
  //   try {
  //     const response = await axios.post(`${url}/users/register`,{
  //       email: email,
  //       username:username,
  //       password:password,
  //       fullName:fullname,
  //       avatar:''
  //     })
  //     setEmail('')
  //     setPassword('')
  //     setconfirmPassword('')
  //     setfullName('')
  //     setUsername('')
  //     if(response.data.data.accessToken){
  //       navigate('/')
  //     }else {
  //       setError('login failed')
  //     }

  //     return response.data
  //   } catch (error) {
  //     console.log(error)
  //     console.log(error?.response.data.errors)
  //     setError(error?.response.data.errors)
  //     setEmail('')
  //     setPassword('')
  //     setconfirmPassword('')
  //     setfullName('')
  //     setUsername('')
  //   }
    
  // }

  const SignUp = async () => {
    try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", confirmpassword);
    
    // Append the image if it exists
    if (avatar) {
      formData.append("avatar", avatar);
      console.log(avatar) // 'productImage' should match what the backend expects
    }

    const response = await axios.post(
        `${apiUrl}/users/register`, // API endpoint URL
        formData, {headers: {
          'Content-Type': 'multipart/form-data',
        },}
      )
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

  setEmail('')
  setPassword('')
  setconfirmPassword('')
  setError('')
  setUsername('')
  setAvatar('')
  setfullName('')
  console.log(response.data.data)
  return response.data

    } catch (error) {
        console.log(error)
    }
  };

  const handleSignUp = ()=> {
    setError("");

  // Check if email is provided and if it ends with '@gmail.com'
  if (!email) {
    return setError("Email is required");
  } else if (!email.endsWith("@gmail.com")) {
    return setError("Email must end with '@gmail.com'");
  }

    if(!email) {
      return setError("Email and password is required")
    }
    if(!password) {
      return setError("Password is required")
    }
    if(!(password === confirmpassword)) {
        return setError("Password and Confirm Password should be same")
    }
    if(!username) {
      return setError("Password is required")
    }
    if(!fullname) {
      return setError("Password is required")
    }
    if(!avatar) {
      return setError("Password is required")
    }
    SignUp()
  }

  return (<>
    <div style={{height:'110vh',marginLeft:'-15vw'}} className='text-white flex justify-center'>
    <div className='maincardsignup mt-3 rounded-md'>
     <div className='m-7'>
         <div className='flex'>
         {/* <img src={icon} className='mr-2' style={{width:'25px', height:"25px"}} alt="" /> */}
         <h1 className='text-xl mb-4 text-blue-500 font-sans font-semibold'>Vibely</h1>
         </div>
         <h1 className='text-3xl font-sans font-semibold'>Sign Up</h1>
         <div className='flex flex-col mt-4'>
             <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Username</label>
             <input type="text" autoComplete="off" value={username} onChange={handleInputChange} name="username" id="" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='Enter your username' />
         </div>
         <div className='flex flex-col mt-4'>
             <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>FullName</label>
             <input type="text" autoComplete="off" value={fullname} onChange={handleInputChange} name="fullname" id="" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='Enter your username' />
         </div>
         <div className='flex flex-col mt-6'>
             <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Email</label>
             <input autoComplete="off" type="text" value={email} onChange={handleInputChange} name="email" id="" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='your@gmail.com' />
         </div>
         <div className='flex flex-col mt-4'>
             <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Product Image</label>
             <input
        type="file"
        name="image"
        onChange={handleInputChange}
        accept="image/*" // Only allow image files
      />
         </div>
         <div className='flex flex-col mt-4'>
             <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Password</label>
             <input autoComplete="off" type="password" value={password} onChange={handleInputChange} name="password" id="" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='• • • • • •' />
         </div>
         <div className='flex flex-col mt-4'>
             <label htmlFor="" className='text-gray-500 ml-1 text-md mb-2 font-sans font-semibold'>Confirm Password</label>
             <input autoComplete="off" type="password" value={confirmpassword} onChange={handleInputChange} name="confirmPassword" id="" className='bg-black text-sm placeholder-opacity-5 text-gray-200 h-10 pl-3 rounded-lg' placeholder='• • • • • •' />
         </div>
         {error && <p className='text-red-600 ml-4'>{error}</p>}
         <div className='mt-3'>
         </div>
         <div onClick={handleSignUp} className='bg-white mt-5 rounded-lg cursor-pointer h-10 flex justify-center'>
         <button className='text-black font-sans font-semibold'>Sign Up</button>
         </div>
         <div className='flex justify-center mt-3 text-white'>
             <p className='mr-1'>Already have an account?</p>
             <Link to='/signin'>
             <p className='font-semibold font-sans underline cursor-pointer'>Sign In</p>
             </Link>
         </div>
     </div>
    </div>
 </div>
 </>
  )
}

export default SignUp
