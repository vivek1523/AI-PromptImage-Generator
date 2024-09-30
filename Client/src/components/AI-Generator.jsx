import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./AI-Generator.css"; 
 
const generateImageAPI = async (prompt) =>{
  const response = await axios.post('http://localhost:7000/generate-image', { prompt });

  return response.data.imageMongoDB.url
}

const GenerateImage = () => {
  const [prompt, setPrompt] = useState("");

  const mutation = useMutation({
    mutationFn: generateImageAPI,
    mutationKey: ["generate-image"],
  });

  const handleGenerateImage = () => {
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }
    mutation.mutate(prompt);
  };

  {mutation.isSuccess && (
  <div className="image-container">
    <img src={mutation.data.url} />
  </div>
)}

  console.log(mutation?.data);
  return (
    <>
      <div className="header">
        <h1 className="title">AI Image Generator using HUGGING FACE API</h1>
        <p className="description">
          Enter a prompt in the input field below to generate a unique image
          using AI.
        </p>
        <p className="Errors">{mutation.isError && "Something Went Wrong Please Try Again!"}</p>
      </div>
      <div className="container">
        <input
          type="text"
          placeholder="Enter prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input-prompt"
        />
        <button
          onClick={handleGenerateImage}
          disabled={mutation.isLoading}
          className="generate-btn"
        >
          {mutation.isPending ? "Generating..." : "Generate Image"}
        </button>
        {mutation.isSuccess && (
          <div className="image-container">
            <img src={mutation.data} alt="Generated" />
          </div>
        )}
      </div> 
    </>
  );
};

export default GenerateImage;