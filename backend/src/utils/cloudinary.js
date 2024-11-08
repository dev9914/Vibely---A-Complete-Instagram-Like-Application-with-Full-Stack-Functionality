import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: "duugiiwo0", 
  api_key: "818123743591333",
  api_secret: "aQWgm4H_4ytCMOsPk0SJ51XeQbk"
});

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null


//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         // file has been uploaded successfull
//         //console.log("file is uploaded on cloudinary ", response.url);
//         fs.unlinkSync(localFilePath)
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
//         return null;
//     }
// }

const uploadOnCloudinary = async (localFilePaths) => {
    try {
        if (!localFilePaths || localFilePaths.length === 0) return null; // Ensure there are files to upload

        // Map over the array of file paths and upload each file
        const uploadPromises = localFilePaths.map(async (filePath) => {
            // Upload each file to Cloudinary
            const response = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
            });

            // Remove the local file after uploading
            fs.unlinkSync(filePath);

            return response; // Return the Cloudinary response for this file
        });

        // Wait for all files to be uploaded and return the responses
        const uploadResults = await Promise.all(uploadPromises);
        return uploadResults; // Return an array of Cloudinary responses

    } catch (error) {
        // Clean up: If an error occurs, remove all files
        localFilePaths.forEach((filePath) => fs.unlinkSync(filePath)); // Delete local files
        return null;
    }
};



export {uploadOnCloudinary}