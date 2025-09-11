"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import ScrollAnimation from '@/components/common/ScrollAnimation';
import Carousel from '@/components/carousel/carousel';
import ScrollLinked from '@/components/wave/scrollLinked';
import WhatWeDo from '@/app/(frontend)/what-we-do/page';
import Photo from './(frontend)/events/photo';
// import ImportantDocuments from './(frontend)/docs-links/page';
import { motion } from "framer-motion";
// import NewsDisplay from './(frontend)/news/page';
import ThematicAreas from '@/components/common/ThematicArea';
import Events from '@/app/(frontend)/events/page'

export default function HomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

  const images = [
  {
    title: "Smart Debt Recovery Solutions",
    subtitle: "AI-powered strategies to maximize collections",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "Cutting-Edge IT Infrastructure",
    subtitle: "Secure servers, cloud solutions, and scalable systems",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "Automated Payment Tracking",
    subtitle: "Real-time monitoring for faster settlements",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "AI & Analytics in Debt Collection",
    subtitle: "Predictive insights for better recovery rates",
     bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "Client-Centric IT Services",
    subtitle: "Tailored tech solutions for financial institutions",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "Secure FinTech Applications",
    subtitle: "Low-cost, scalable, and compliant platforms",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "Data Security & Compliance",
    subtitle: "Protecting sensitive financial information",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  },
  {
    title: "24/7 IT Support & Monitoring",
    subtitle: "Ensuring uptime and smooth operations",
    bgImage: "https://knock-off-dues.s3.ap-south-1.amazonaws.com/gallery/1757507241514-about-new.jpg",
  }
];



    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-orange-50 to-cyan-50 text-gray-800 dark:text-white dark:from-gray-900 dark:to-gray-800">
            <Header />
            <main className="flex-grow">
                <ScrollLinked />

                {/* Hero Section */}
                <section className="relative min-h-screen pt-24 overflow-hidden shadow-xl">
                    <Carousel images={images} />
                </section>

                {/* What We Do */}
                <section className=" px-4">
                    <WhatWeDo customLimit={2} />
                </section>

             

                {/*  Events */}
                <section className="">
                    <div className="container mx-auto max-w-6xl px-4">
                        <ScrollAnimation animation="fade" delay={400}>

                            <Events customLimit={1} />
                        </ScrollAnimation>
                    </div>
                </section>

                {/* Photo */}
                <section className=" bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto max-w-6xl px-4">
                        <ScrollAnimation animation="fade" delay={400}>
                            <Photo customLimit={6} />
                        </ScrollAnimation>
                    </div>
                </section>

                {/* News */}
                {/* <section >
                    <div className="container mx-auto max-w-6xl px-4">
                        <ScrollAnimation animation="fade" delay={400}>
                            <NewsDisplay customLimit={3} />
                        </ScrollAnimation>
                    </div>
                </section> */}

                {/* Important Documents */}
                {/* <section className="py-12 bg-gradient-to-b from-white to-orange-50 dark:from-gray-900 dark:to-gray-800">
                    <div className="container mx-auto max-w-6xl px-4">
                        <ScrollAnimation animation="fade" delay={400}>
                            <ImportantDocuments />
                        </ScrollAnimation>
                    </div>
                </section> */}
                <section className="py-12 px-4">
                    <ThematicAreas />
                </section>
            </main>
            <Footer />
        </div>
    );
}

// environment variables
// JWT_SECRET=your_super_secret_key_here
// NEXT_PUBLIC_API_URL=http://localhost:3000/api
// MONGODB_URI="mongodb://localhost:27017"
// MONGODB_DB="db_wincoe"
