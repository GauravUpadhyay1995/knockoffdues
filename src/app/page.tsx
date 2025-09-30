"use client";

import { useEffect, useState } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollAnimation from "@/components/common/ScrollAnimation";
import Carousel from "@/components/carousel/carousel";
import ScrollLinked from "@/components/wave/scrollLinked";
import Photo from "./(frontend)/events/photo";
import { motion } from "framer-motion";
import ThematicAreas from "@/components/common/ThematicArea";
import Events from "@/app/(frontend)/events/page";


export default function HomePage() {


    const images = [
        {
            title: "Smart Debt Recovery Solutions",
            subtitle: "AI-powered strategies to maximize collections",
            bgImage: "/images/carousel/carousel-01.png",
        },
        {
            title: "Cutting-Edge IT Infrastructure",
            subtitle: "Secure servers, cloud solutions, and scalable systems",
            bgImage: "/images/carousel/carousel-04.png",
        },
        {
            title: "Automated Payment Tracking",
            subtitle: "Real-time monitoring for faster settlements",
            bgImage: "/images/carousel/carousel-02.png",
        },
        {
            title: "AI & Analytics in Debt Collection",
            subtitle: "Predictive insights for better recovery rates",
            bgImage: "/images/carousel/carousel-03.png",
        },
        {
            title: "Client-Centric IT Services",
            subtitle: "Tailored tech solutions for financial institutions",
            bgImage: "/images/carousel/carousel-04.png",
        },
        {
            title: "Secure FinTech Applications",
            subtitle: "Low-cost, scalable, and compliant platforms",
            bgImage: "/images/carousel/carousel-02.png",
        },
        {
            title: "Data Security & Compliance",
            subtitle: "Protecting sensitive financial information",
            bgImage: "/images/carousel/carousel-01.png",
        },
        {
            title: "24/7 IT Support & Monitoring",
            subtitle: "Ensuring uptime and smooth operations",
            bgImage: "/images/carousel/carousel-04.png",
        },
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

                {/* Button to open QR modal manually */}


                {/* Events */}
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

                <section className="py-12 px-4">
                    <ThematicAreas />
                </section>
            </main>
            <Footer />


        </div>
    );
}
