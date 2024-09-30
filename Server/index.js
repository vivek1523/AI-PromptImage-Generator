import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import { config, uploader } from 'cloudinary';
import mongoose from 'mongoose';  
import axios from 'axios'
import { imageModel } from './Models/imageModel.js'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;


// const corsOrigin = {
//     origin: ["https://ai-promptimage-generator-client.onrender.com/"],
// }

app.use(express.json());
app.use(cors()); 

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("MongoDB Connected Successfully");
}).catch((error) => {
    console.log(`MongoDB Connection Error: ${error}`);
});

config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
}); 

const HUGGINGFACE_API_URL = process.env.HUGGINGFACE_API_URL;
const HUGGINGFACE_API_KEY = process.env.HUGGING_FACE_TOKEN_KEY;

app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;
    
    const startTime = Date.now();
    try {
        console.log(`requesting image generation from Hugging Face API...`);

        const response = await axios.post(
            HUGGINGFACE_API_URL,
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
                timeout: 60000
            }
        );

        const midTime = Date.now();
        console.log(`Image generated from Hugging Face in ${midTime - startTime} ms`);

        const mimeType = response.headers['content-type'];
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const imageUrl = `data:${mimeType};base64,${base64Image}`;

        console.log('Image generated, now uploading to Cloudinary...');

        const ImageCloudinary = await uploader.upload(imageUrl, {
            folder: 'AI-Image-Generator',
        });

        console.log('Image uploaded to Cloudinary successfully.');

        const imageMongoDB = await imageModel.create({
            prompt: prompt,
            url: ImageCloudinary.secure_url,
            public_id: ImageCloudinary.public_id,
        }); 

        const endTime = Date.now();
        console.log(`Process completed in ${endTime - startTime} ms`);

        res.status(200).json({ imageMongoDB });
    } catch (error) {
        const errorTime = Date.now();
        console.error('Error generating or uploading image:', error.message || error);
        console.log(`Process failed after ${errorTime - startTime} ms`);
        res.status(500).json({ message: 'Error generating image' });
    }
});
 
app.get('/stored-images', async(req,res)=>{
   try {
      const StoredImages = await imageModel.find();

      res.status(200).json(StoredImages)
   } catch (error) {
    res.status(404).send({message: "Error Getting Stored Images"})
   }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
