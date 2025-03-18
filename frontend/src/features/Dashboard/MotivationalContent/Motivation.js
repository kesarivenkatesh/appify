import React , {useState, useEffect} from "react";
import axios from "axios";
//import "./Motivation.css";
import { VideoPlayer } from '../VideoPlayer';

const Motivation = () =>{
    const [quote, setQuote] = useState("");
    const [author, setAuthor] = useState("");

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const allVideos = [
        { id: 'g-jwWYX7Jlo', title: 'Dream - Motivational Video' },
        { id: 'mgmVOuLgFB0', title: 'Your Time Is Now' },
        { id: 'kZMR8KpbJ0s', title: 'The Power of Persistence' },
        { id: 'ZOy0YgUDwDg', title: 'Never Give Up' }
      ];

   const getNextVideo = () => {
     setCurrentVideoIndex((prevIndex) => 
       prevIndex === allVideos.length - 1 ? 0 : prevIndex + 1
     );
   }

    const quoteAPI = async () => {
        let Quotes =[];
        try{
            const data = await axios.get("http://api.quotable.io/random");
            Quotes = data.data;
            console.log(Quotes);
        } catch(error){
            console.log(error);
        }

        try{
            setQuote(Quotes.content);
            setAuthor(Quotes.author);
        } catch(error){
            console.log(error);
        }

    };

    useEffect(() => {
        quoteAPI();
    }, []);

    return (
        <div className="space-y-5">
          <section className="bg-white rounded-lg shadow-md p-15">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Daily Motivation</h2>
              <button 
                onClick={quoteAPI}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                New Quote
              </button>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-lg italic mb-2">{quote}</p>
              <p className="text-sm text-purple-600">- {author}</p>
            </div>
          </section>
    
          <section className="bg-white rounded-lg shadow-md p-14">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Motivational Videos</h2>
              <button 
                onClick={getNextVideo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next Video
              </button>
            </div>
            <div className="w-full">
              <VideoPlayer 
                videoId={allVideos[currentVideoIndex].id} 
                title={allVideos[currentVideoIndex].title} 
              />
              <h3 className="mt-2 text-lg font-semibold">{allVideos[currentVideoIndex].title}</h3>
            </div>
          </section>
        </div>
      );
};

export default Motivation;