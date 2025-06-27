 import { Button } from "./ui/button"
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useDispatch } from "react-redux";
import { closed } from "../store/uploadpicSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "./ui/input"
import { LoadingSpinner } from "./ui/Loading";
import { Label } from "./ui/label"

export function CardWithForm() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [desc, setDesc] = useState(''); // Text field
  const [image, setImage] = useState(null); // File input
  const [showcap, setshowcap] = useState(false);
  const [cloudurl, setcloudurl] = useState('');
  const dispatch = useDispatch()

  const [autoCaption, setAutoCaption] = useState({})


const getImageURLFromServer = async () => {
  const formData = new FormData();
  formData.append('image', image); // 'image' is the field name backend expects

  try {
    const res = await axios.post(`${apiUrl}/ai/getUrl`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: localStorage.getItem('token'), // If needed
      },
    });

    const cloudinaryUrl = res.data.imageUrl; // your backend returns this
    console.log('Image URL:', cloudinaryUrl);
    setcloudurl(cloudinaryUrl)

    return cloudinaryUrl;
  } catch (err) {
    console.error('Image upload failed:', err);
  }
};

const generateAutoCaption = async (iurl)=> {
  try {
    const response = await axios.post(`${apiUrl}/ai/auto-captions`,{imageUrl : iurl}, {headers: {Authorization: localStorage.getItem('token')}} );

    setAutoCaption(response.data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

const handleUploadAndGenerate = async () => {
  const url = await getImageURLFromServer();
  if (url) {
    await generateAutoCaption(url);
  }
};

  // Handler for file input
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  useEffect(() => {
    if (image) {
      console.log(image); // Logs the image once the state is updated
    }
  }, [image]);

  const createPost = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData();
    formData.append('description', desc); // Append text input
    if (image) {
      formData.append('postImage', image);  // Append file input
    } else {
      console.error("Image is null. Please select an image.");
    }
    // console.log(formData)

    try {
      const response = await axios.post(`${apiUrl}/post/create`,formData,{headers: {Authorization: localStorage.getItem('token')}})

      // console.log(response.data)
      dispatch(closed())
      return response.data
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <Card style={{background:'#262626',border:"none"}} className={`w-[450px] ${showcap ? "h-[640px] -mt-36": "h-[450px] -mt-10"} text-white`}>
      <CardHeader>
        <CardTitle>Create post</CardTitle>
        <CardDescription>Drag your image here</CardDescription>
      </CardHeader>
      <CardContent>
      <MdOutlineAddPhotoAlternate className="ml-36" size={100}/>
      <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Upload image here</Label>
      <Input onChange={(handleImageChange)} className="mt-1 text-black" id="picture" type="file" />
      <Input type="email" value={desc} onChange={(e)=>setDesc(e.target.value)} className="text-black mt-3" placeholder="description" />
      <Button onClick={()=> {if(!image) {
        alert("Upload Image First")
      } else {
        handleUploadAndGenerate()
        setshowcap(true)
      }
      }}>✨ Suggest Captions</Button>
      {showcap && (
        <div className="bg-black opacity-80 h-[200px] p-3 flex flex-col justify-around rounded-md">
          {autoCaption?.aiCaptions?.length > 0 ? (
            autoCaption.aiCaptions.map((item, index) => (
          <div className="flex" key={index}>
            <h1 >{item} <span onClick={()=> setDesc(item.slice(3))} className="ml-2 cursor-pointer">📋 copy</span></h1>
          </div>
        ))
          ): (
            <LoadingSpinner/>
          )}
        
        <div className="flex mt-2 justify-between mr-4">
          <Button onClick={() =>{ setAutoCaption({}); generateAutoCaption(cloudurl)}}>🔁 Regenerate</Button>
          <Button onClick={()=> setshowcap(false)}>❌ Close</Button>
        </div>
      </div>
      )}
      
    </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={()=> dispatch(closed())} className="text-black" variant="outline">Cancel</Button>
        <Button onClick={(e)=>createPost(e)}>Create</Button>
      </CardFooter>
    </Card>
  )
}
