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
import { Label } from "./ui/label"
 
export function CardWithForm() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [desc, setDesc] = useState(''); // Text field
  const [image, setImage] = useState(null); // File input
  const dispatch = useDispatch()

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
    <Card style={{background:'#262626',border:"none"}} className="w-[450px] h-[400px] text-white">
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
    </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={()=> dispatch(closed())} className="text-black" variant="outline">Cancel</Button>
        <Button onClick={(e)=>createPost(e)}>Create</Button>
      </CardFooter>
    </Card>
  )
}
