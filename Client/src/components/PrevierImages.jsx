import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./PreviewImage.css";

const fetchImageAPI = async () =>{
  const response = await axios.get('https://ai-promptimage-generator-server.onrender.com');

  return response.data
}

export default function Gallery() {
  const { data } = useQuery({
    queryKey: ["images"],
    queryFn: fetchImageAPI,
  });
  const [lightboxDisplay, setLightboxDisplay] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const openLightbox = (url) => {
    setCurrentImage(url);
    setLightboxDisplay(true);
  };

  const closeLightbox = () => {
    setLightboxDisplay(false);
  };

  return (
    <>
      <div className="gallery">
        {data?.map((image, index) => (
          <div
            key={index}
            className={`image-container image-${index + 1}`}
            onClick={() => openLightbox(image.url)}
          >
            <img
              src={image.url}
              alt={`Artwork ${index + 1}`}
              className="gallery-image"
            />
          </div>
        ))}
      </div>

      {lightboxDisplay && (
        <div className="lightbox" onClick={closeLightbox}>
          <span className="close-btn">&times;</span>
          <img className="lightbox-image" src={currentImage} alt="Artwork" />
        </div>
      )}
    </>
  );
}
