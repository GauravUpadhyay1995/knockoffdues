'use client';


import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import Carousel from '@/components/carousel/carousel';
import { useSettings } from '@/context/AuthContext';
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

type Particle = {
  width: number;
  height: number;
  left: string;
  top: string;
  x: number;
  y: number;
  duration: number;
};

export default function About() {
    const { settings, isLoadingSettings } = useSettings();
  
  const images = [

    // {

    //     bgImage: "/images/about/about-new.jpg",

    // }
    // ,
    {
      title: "Know More About Us",
      subtitle: "We are committed to innovation and excellence",
      bgImage: "/images/about/about.jpg",

    }
  ];
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = [...Array(8)].map(() => ({
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 100,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="overflow-hidden">
        {/* <section className="relative h-[70vh] min-h-[610px] overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-[url('/images/about/about.png')] bg-cover bg-center"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
          >
            <motion.div
               className="absolute inset-0 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />
          </motion.div>

          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${p.width}px`,
                height: `${p.height}px`,
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [0, p.y],
                x: [0, p.x],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
            />
          ))}

          
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: [0, 1, 0], y: [0, 15, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </section> */}

        <section className="relative min-h-screen overflow-hidden shadow-xl">
          <Carousel images={images} />
        </section>
        {/* <Drawer /> */}

        <section className="py-20 px-4 container mx-auto">
          <motion.div
            className="max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem} className="mb-16">
              <motion.div
                className="w-20 h-1 bg-gradient-to-r from-orange-500 to-cyan-400 mb-6 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <motion.p
                className="text-xl text-gray-700 mb-6 leading-relaxed"
                whileHover={{ scale: 1.01 }}
              >
                The <strong className="text-orange-600">{settings?.companyName} – Innovation & Development</strong> we combine smart IT solutions with professional debt collection services to help businesses recover outstanding payments quickly, securely, and ethically.
              </motion.p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-2 gap-12 mb-16">
              <motion.div
                className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100"
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Strategic Partnership</h3>
                </div>
                <p className="text-gray-700">
                  Established via a strategic partnership between the <strong>Banks</strong> and <strong>{settings?.companyName} </strong> ,{settings?.companyName}  don’t just collect debts — we build reliable financial recovery systems that drive growth.
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-cyan-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100"
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-100 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Collaborative Ecosystem</h3>
                </div>
                <p className="text-gray-700">
                  At {settings?.companyName} , believe that sustainable debt recovery and digital transformation are only possible through collaboration. Our collaborative ecosystem brings together clients, financial institutions, technology partners, and customers on a single integrated platform.
                </p>
              </motion.div>
            </motion.div>

            <motion.div variants={staggerItem} className="mb-16">
              <motion.p
                className="text-xl text-gray-700 mb-6 leading-relaxed bg-gradient-to-r from-gray-50 to-white p-8 rounded-xl border-l-4 border-orange-500"
                whileHover={{ scale: 1.005 }}
              >
                By fostering strong partnerships and leveraging advanced IT capabilities, we create a win–win environment where businesses achieve higher recovery rates, customers experience fairness and convenience, and industries benefit from a more resilient financial system.{settings?.companyName}  fuels innovation and promotes the commercialization of life-changing  technologies.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            className="bg-gradient-to-br from-orange-400 to-blue-900 p-10 rounded-2xl shadow-2xl relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/20 rounded-full"></div>

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <span className="bg-white/20 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Core Objectives & Mission
              </h2>

              <motion.ul
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  'Technology-First Solutions',
                  'Efficient Debt Recovery',
                  'Regulatory Compliance',
                  'DCustomer-Centric Approach',
                  'Innovation & Growth'
                ].map((point, index) => (
                  <motion.li
                    key={index}
                    variants={staggerItem}
                    className="flex items-start text-white text-lg"
                    whileHover={{ x: 8 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <span className="bg-white/30 p-1 rounded-full mr-4 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {point}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 my-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { number: "150+", label: "Members", color: "from-orange-500 to-orange-600" },
              { number: "30+", label: "Collaborators", color: "from-cyan-500 to-cyan-600" },
              { number: "5+", label: "Office Branches", color: "from-indigo-500 to-indigo-600" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className={`bg-gradient-to-br ${stat.color} text-white p-8 rounded-xl shadow-lg text-center`}
                whileHover={{ scale: 1.05 }}
              >
                <motion.p
                  className="text-5xl font-bold mb-2"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", bounce: 0.4 }}
                >
                  {stat.number}
                </motion.p>
                <p className="text-xl">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

        </section>

      </main>
    </div>
  );
}
