import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: "duugiiwo0", 
  api_key: "818123743591333",
  api_secret: "aQWgm4H_4ytCMOsPk0SJ51XeQbk"
});

const uploadOnCloudinary2 = async (localFilePath) => {
    try {
        if (!localFilePath) return null


        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
      
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
      // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary2}