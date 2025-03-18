import React from 'react';
import { VideoPlayer } from '../VideoPlayer';

const meditationVideos = [
  { id: 'O-6f5wQXSu8', title: 'Guided Meditation for Inner Peace' },
  { id: 'inpok4MKVLM', title: '5-Minute Meditation You Can Do Anywhere' },
  { id: '2DXqMBXmP8Q', title: 'Powerful Release of Letting Go, Guided Meditation'},
  { id: 'y3O22mqcnPI', title: 'let Go and Trust God , Guided Meditation'}
];

const Meditation = () => {
  return (
    <div className="space-y-5">
      <section className="bg-white rounded-lg shadow-md p-15">
        <h2 className="text-2xl font-bold mb-3">Meditation Guide</h2>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Take a moment to breathe, relax, and center yourself. Choose from our curated selection of meditation videos to help you find inner peace and mindfulness.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Meditation Videos</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {meditationVideos.map((video) => (
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

export default Meditation;