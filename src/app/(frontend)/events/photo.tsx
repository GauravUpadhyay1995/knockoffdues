'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type GalleryImage = {
  url: string;
  mimetype: string;
  size: number;
  _id: string;
};

type GalleryVideo = {
  url: string;
  _id: string;
  thumbnail?: string;
  title?: string;
  description?: string;
};

type GalleryItem = {
  _id: string;
  title: string;
  images: GalleryImage[];
  video_url: GalleryVideo[];
  isActive: boolean;
  createdAt: string;
};

// Section entrance
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Optimized image/video slide transitions
const mediaVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 150 : -150,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 150 : -150,
    opacity: 0,
  }),
};

export default function Gallery({ customLimit = 0 }: { customLimit?: number }) {
  const [zoom, setZoom] = useState(1);
  const [isModalVideoPlaying, setIsModalVideoPlaying] = useState(false);

  const router = useRouter();
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | 'all' | null>(null);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/gallery/list?customLimit=${customLimit}&from=frontend&perPage=10000&page=1`,
    fetcher
  );

  useEffect(() => {
    setHasMounted(true);
    if (data?.data?.galleries?.length) {
      setSelectedGallery('all');
    }
  }, [data]);

  // Flattened media
  const currentImages =
    selectedGallery === 'all'
      ? data?.data?.galleries?.flatMap(g => g.images) || []
      : selectedGallery?.images || [];

  const currentVideos =
    selectedGallery === 'all'
      ? data?.data?.galleries?.flatMap(g => g.video_url) || []
      : selectedGallery?.video_url || [];

  // Helpers
  function extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  function extractGoogleDriveFileId(url: string): string | null {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : null;
  }

  function getVideoThumbnail(videoUrl: string): string {
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const id = extractYouTubeVideoId(videoUrl);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    }
    if (videoUrl.includes("drive.google.com")) {
      const id = extractGoogleDriveFileId(videoUrl);
      return id ? `https://drive.google.com/thumbnail?id=${id}` : '';
    }
    return '';
  }

  // Modal handlers
  const openModal = (index: number) => {
    if (activeTab === 'images') {
      setSelectedImage(currentImages[index]);
      setSelectedVideo(null);
    } else {
      setSelectedVideo(currentVideos[index]);
      setSelectedImage(null);
      setIsModalVideoPlaying(true);
    }
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setIsModalVideoPlaying(false);
    setZoom(1);
  };

  const navigate = (dir: 'prev' | 'next') => {
    const isNext = dir === 'next';
    setDirection(isNext ? 1 : -1);

    const items = activeTab === 'images' ? currentImages : currentVideos;
    if (!items.length) return;

    const newIndex = isNext
      ? (currentIndex + 1) % items.length
      : (currentIndex - 1 + items.length) % items.length;

    if (activeTab === 'images') {
      setSelectedImage(currentImages[newIndex]);
      setSelectedVideo(null);
    } else {
      setSelectedVideo(currentVideos[newIndex]);
      setSelectedImage(null);
      setIsModalVideoPlaying(true);
    }
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative">
      <section className="container mx-auto px-4 mb-4 mt-4">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={hasMounted ? 'visible' : 'hidden'}
          className="max-w-7xl mx-auto"
        >
          {/* Title */}
          <motion.h2
            className="text-3xl font-bold text-orange-600 text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gallery & Video
          </motion.h2>

          {/* Filter + Tabs */}
          {data?.data?.galleries?.length > 0 && (
            <div className="flex justify-center gap-4 mb-4">
              <select
                value={selectedGallery === 'all' ? 'all' : selectedGallery?._id || ''}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    setSelectedGallery('all');
                  } else {
                    const sel = data.data.galleries.find((g: GalleryItem) => g._id === e.target.value);
                    setSelectedGallery(sel || null);
                  }
                }}
                className="px-4 py-2 border border-orange-400 rounded-md text-gray-700 shadow-sm"
              >
                <option value="all">All Images & Videos</option>
                {data.data.galleries.map((gallery: GalleryItem) => (
                  <option key={gallery._id} value={gallery._id}>
                    {gallery.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSelectedGallery('all');
                  setActiveTab('images');
                }}
                className="px-4 py-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition"
              >
                <ArrowPathIcon className="h-5 w-5 inline-block mr-1" />
                Reset
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  activeTab === 'images' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  activeTab === 'videos' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                Videos
              </button>
            </div>
          </div>

          {/* Loader / Error */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">
              Failed to load media
            </div>
          )}

          {/* Media Grid */}
          {!isLoading && !error && (
            <>
              {activeTab === 'images' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(customLimit > 0 ? currentImages.slice(0, customLimit) : currentImages).map((image, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-80 border-6  hover:border-3 border-orange-900 hover:border-orange-500"

                      onClick={() => openModal(index)}
                    >
                      <img
                        src={image.url}
                        alt={`Gallery ${index}`}
                        loading="lazy"
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(customLimit > 0 ? currentVideos.slice(0, customLimit) : currentVideos).map((video, index) => (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-xl overflow-hidden shadow hover:scale-105 transition cursor-pointer"
                      onClick={() => openModal(index)}
                    >
                      <div className="relative aspect-video bg-gray-200">
                        {video.url.includes('youtube.com') ||
                        video.url.includes('youtu.be') ||
                        video.url.includes('drive.google.com') ? (
                          <img
                            src={getVideoThumbnail(video.url)}
                            alt="Video thumbnail"
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                          <FiPlay className="text-white w-10 h-10" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-center text-gray-800 dark:text-gray-500">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-gray-500">{video.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {(selectedImage || selectedVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative w-full max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow"
              >
                <XMarkIcon className="h-6 w-6 text-orange-600" />
              </button>

              {/* Media */}
              <div className="relative w-full h-[70vh] bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <AnimatePresence custom={direction} mode="wait">
                  {selectedImage ? (
                    <motion.img
                      key={selectedImage.url}
                      src={selectedImage.url}
                      alt="Gallery"
                      custom={direction}
                      variants={mediaVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: 'spring', stiffness: 200, damping: 25 },
                        opacity: { duration: 0.2 },
                      }}
                      style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <motion.div
                      key={selectedVideo?.url}
                      custom={direction}
                      variants={mediaVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: 'spring', stiffness: 200, damping: 25 },
                        opacity: { duration: 0.2 },
                      }}
                      className="w-full h-full"
                    >
                      {selectedVideo?.url.includes('youtube.com') ||
                      selectedVideo?.url.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full rounded-xl"
                          src={`https://www.youtube.com/embed/${extractYouTubeVideoId(
                            selectedVideo.url
                          )}?autoplay=1`}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : selectedVideo?.url.includes('drive.google.com') ? (
                        <iframe
                          className="w-full h-full rounded-xl"
                          src={`https://drive.google.com/file/d/${extractGoogleDriveFileId(
                            selectedVideo.url
                          )}/preview`}
                          allow="autoplay"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          ref={modalVideoRef}
                          src={selectedVideo?.url}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay
                          playsInline
                          onPlay={() => setIsModalVideoPlaying(true)}
                          onPause={() => setIsModalVideoPlaying(false)}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-2 bg-orange-100 rounded-lg p-2">
                <button onClick={() => navigate('prev')}>
                  <ChevronLeftIcon className="h-8 w-8 text-orange-600" />
                </button>
                <span className="text-orange-600 font-medium">
                  {currentIndex + 1} / {activeTab === 'images' ? currentImages.length : currentVideos.length}
                </span>
                <button onClick={() => navigate('next')}>
                  <ChevronRightIcon className="h-8 w-8 text-orange-600" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
