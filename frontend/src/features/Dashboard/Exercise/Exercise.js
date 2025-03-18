import React from 'react';
import { VideoPlayer } from '../VideoPlayer';

const exerciseVideos = [
  { id: 'ml6cT4AZdqI', title: '30-Minute Full Body Workout' },
  { id: 'sTANio_2E0Q', title: 'Beginner Yoga Flow' },
];

 const Exercise = () => {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-md p-14">
        <h2 className="text-2xl font-bold mb-4">Daily Exercise</h2>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Choose from our collection of exercise and yoga videos to stay active and healthy. Remember to warm up before starting any exercise routine.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Workout Videos</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {exerciseVideos.map((video) => (
            <div key={video.id}>
              <VideoPlayer videoId={video.id} title={video.title} />
              <h3 className="mt-2 text-lg font-semibold">{video.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Exercise;