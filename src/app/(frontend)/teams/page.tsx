'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFacebook,
  FiLinkedin,
  FiInstagram,
  FiTwitter,
  FiGithub,
  FiMail,
  FiGlobe,
  FiYoutube,
  FiX,
} from "react-icons/fi";
import useSWR from 'swr';
import { encrypt, decrypt } from "@/lib/crypto";

// 🧠 Types
type TeamMember = {
  _id: string;
  name: string;
  designation: string;
  department: string;
  profileImage: string;
  description?: string;
  isSteering: boolean;
  socialLinks: Record<string, string>;
};

type EncryptedResponse = {
  data: string;
};

// 🔐 Secure Fetcher that decrypts server response
const decryptingFetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    try {
      const encryptedErr = (await res.json()) as EncryptedResponse;
      if (encryptedErr?.data) {
        const decryptedErr = decrypt<any>(encryptedErr.data);
        throw new Error(decryptedErr?.message || `Request failed: ${res.status}`);
      }
    } catch (e) {
      throw new Error(`Request failed: ${res.status}`);
    }
  }

  const encrypted = (await res.json()) as EncryptedResponse;

  if (!encrypted?.data) {
    throw new Error("Malformed response: missing encrypted data");
  }

  // Decrypt the encrypted server payload
  const decrypted = decrypt<any>(encrypted.data);

  // decrypted = { success, message, data: { totalRecords, teams, ... } }
  return decrypted;
};

// 🎨 Social icon map
const socialIconMap: Record<
  string,
  { icon: JSX.Element; color: string; isEmail?: boolean }
> = {
  facebook: { icon: <FiFacebook />, color: "indigo" },
  linkedin: { icon: <FiLinkedin />, color: "blue" },
  instagram: { icon: <FiInstagram />, color: "pink" },
  twitter: { icon: <FiTwitter />, color: "sky" },
  github: { icon: <FiGithub />, color: "gray" },
  gmail: { icon: <FiMail />, color: "rose", isEmail: true },
  youtube: { icon: <FiYoutube />, color: "red" },
  portfolio: { icon: <FiGlobe />, color: "green" },
};

// 🧩 Main Component
export default function UniversityTeams() {
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  // Encrypt query payload once
  const encryptedPayload = React.useMemo(
    () => encodeURIComponent(encrypt('from=frontend&perPage=1000&page=1')),
    []
  );

  // Use SWR with auto-decrypting fetcher
  const { data, error, isLoading } = useSWR(
    `/api/v1/admin/teams/list?data=${encryptedPayload}`,
    decryptingFetcher
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!data?.data?.teams?.length) return <EmptyState />;

  const teamMembers = data.data.teams;

  const steeringMembers = teamMembers
    .filter(member => member.isSteering)
    .sort((a, b) => (a.showingOrder ?? Infinity) - (b.showingOrder ?? Infinity));

  const regularMembers = teamMembers
    .filter(member => !member.isSteering)
    .sort((a, b) => (a.showingOrder ?? Infinity) - (b.showingOrder ?? Infinity));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -50, rotateX: 90 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1.2, ease: [0.42, 0, 0.58, 1] } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 80, scale: 0.8, rotateY: 15 },
    visible: { opacity: 1, y: 0, scale: 1, rotateY: 0, transition: { duration: 0.8, ease: "easeInOut" } },
    hover: { y: -15, scale: 1.03, rotateY: 5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", transition: { duration: 0.4, ease: "easeOut" } }
  };

  const imageVariants = {
    hidden: { scale: 0.7, opacity: 0, filter: 'blur(4px)' },
    visible: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeInOut" } },
    hover: { scale: 1.1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-cyan-50">
      <main className="overflow-hidden">
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col items-center">
              <div className="w-full">
                <motion.h2
                  className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={titleVariants}
                >
                  Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Team</span>
                </motion.h2>

                <motion.p
                  className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed text-center max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  viewport={{ once: true }}
                >
                  The brilliant minds driving innovation and excellence at our center
                </motion.p>

                <motion.div
                  className="mt-16"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                >
                  {/* Regular Team Section */}
                  {regularMembers.length > 0 && (
                    <>
                      <motion.h3
                        className="text-xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={titleVariants}
                      >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Core Team</span>
                      </motion.h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {regularMembers.map((member, i) => (
                          <TeamMemberCard
                            key={member._id}
                            member={member}
                            index={i}
                            variants={{ card: cardVariants, image: imageVariants }}
                            onClick={handleMemberClick}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Steering Committee Section */}
                  {steeringMembers.length > 0 && (
                    <>
                      <motion.h3
                        className="text-xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={titleVariants}
                      >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Steering Committee</span>
                      </motion.h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                        {steeringMembers.map((member, i) => (
                          <TeamMemberCard
                            key={member._id}
                            member={member}
                            index={i}
                            variants={{ card: cardVariants, image: imageVariants }}
                            onClick={handleMemberClick}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MemberModal
        member={selectedMember}
        onClose={closeModal}
        variants={{ modal: modalVariants, backdrop: backdropVariants }}
      />
    </div>
  );
}

// 🧱 Card Component
function TeamMemberCard({
  member, index, variants, onClick,
}: {
  member: TeamMember;
  index: number;
  variants: {
    card: typeof cardVariants;
    image: typeof imageVariants;
  };
  onClick: (member: TeamMember) => void;
}) {
  return (
    <motion.div
      className="shadow-xl text-center relative overflow-hidden border border-gray-100 group cursor-pointer bg-gradient-to-r from-orange-50 to-cyan-50 p-8 rounded-3xl dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900"
      variants={variants.card}
      whileHover="hover"
      onClick={() => onClick(member)}
    >
      <motion.div
        className="w-40 h-40 mx-auto mb-6 relative rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl group-hover:border-orange-400 transition-all duration-500"
        variants={variants.image}
      >
        <Image src={member.profileImage} alt={member.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>

      <motion.h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {member.name}
      </motion.h3>
      <motion.p className="text-md text-gray-500 dark:text-gray-400 mb-4 font-medium">
        {member.designation}
      </motion.p>

      {member.department && (
        <p className="text-sm text-orange-500 dark:text-orange-400 mb-6">
          {member.department}
        </p>
      )}

      <motion.div className="flex flex-wrap justify-center gap-4 mt-4">
        {member.socialLinks &&
          Object.entries(member.socialLinks).map(([key, value]) => {
            const platform = socialIconMap[key];
            if (!platform || !value) return null;
            const href = platform.isEmail ? `mailto:${value}` : value;
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-${platform.color}-100 text-${platform.color}-600 hover:bg-${platform.color}-200 transition`}
              >
                {platform.icon}
              </a>
            );
          })}
      </motion.div>
    </motion.div>
  );
}

// 🧩 State Components
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">Failed to load team members</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">No team members found</p>
    </div>
  );
}

// 🧱 Modal Component
function MemberModal({
  member, onClose, variants,
}: {
  member: TeamMember | null;
  onClose: () => void;
  variants: { modal: any; backdrop: any };
}) {
  if (!member) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants.backdrop}
          onClick={onClose}
        />

        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants.modal}
        >
          <div className="bg-gradient-to-r from-orange-100 to-cyan-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={onClose}
            >
              <FiX className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div className="relative">
                <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-lg">
                  <Image src={member.profileImage} alt={member.name} fill className="object-cover" />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  {member.socialLinks &&
                    Object.entries(member.socialLinks).map(([key, value]) => {
                      const platform = socialIconMap[key];
                      if (!platform || !value) return null;
                      const href = platform.isEmail ? `mailto:${value}` : value;
                      return (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-10 h-10 flex items-center justify-center rounded-full bg-${platform.color}-100 text-${platform.color}-600 hover:bg-${platform.color}-200 transition`}
                        >
                          {platform.icon}
                        </a>
                      );
                    })}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h2>
                <p className="text-xl text-orange-500 dark:text-orange-400 font-medium mb-4">
                  {member.designation}
                </p>
                {member.department && (
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {member.department}
                  </p>
                )}
                <motion.div
                  className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: member.description }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
