'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
}

export default function About() {
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const backgroundResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/page-backgrounds/about`);
        if (backgroundResponse.ok) {
          const backgroundData = await backgroundResponse.json();
          if (backgroundData.success && backgroundData.data) {
            const imageUrl = backgroundData.data.imageUrl;
            // Add API URL prefix if the URL is a relative path
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
            setHeaderBackgroundImage(fullImageUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch background image:', error);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members`);
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchBackgroundImage();
    fetchTeamMembers();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative py-24 overflow-hidden"
        style={{
          backgroundImage: headerBackgroundImage ? `url('${headerBackgroundImage}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgb(17, 24, 39)',
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Empowering E-Commerce Success
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            9tangle is the premier learning platform for eBay consultants and sellers. 
            We bridge the gap between ambition and achievement through expert-led education.
          </motion.p>
        </div>
      </section>

      {/* Our Story & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2023, 9tangle emerged from a simple observation: the e-commerce landscape is vast, 
                but the roadmap to success is often unclear. We set out to create a sanctuary of knowledge 
                where aspiring entrepreneurs could find clarity, strategy, and community.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we are proud to host a community of thousands of sellers who are redefining what it 
                means to build a business online. Our curriculum is constantly evolving, ensuring that our 
                students are always ahead of the curve.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <span className="text-6xl">🚀</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide every course we create and every interaction we have with our community.
            </p>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "💡",
                title: "Innovation",
                desc: "We stay ahead of market trends to provide cutting-edge strategies."
              },
              {
                icon: "🤝",
                title: "Community",
                desc: "We believe in the power of shared knowledge and mutual support."
              },
              {
                icon: "⭐",
                title: "Excellence",
                desc: "We are committed to the highest quality in education and service."
              }
            ].map((value, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet The Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The experts behind the platform, dedicated to your success.
            </p>
          </div>

          {loadingTeam ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-48 h-48 mx-auto rounded-full mb-6 overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl.startsWith('http') ? member.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${member.imageUrl}`}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-5xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">{member.bio}</p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: "Shahnam Khan", role: "Founder & CEO", color: "bg-blue-100" },
                { name: "Michael Chen", role: "Head of Education", color: "bg-purple-100" },
                { name: "Emma Davis", role: "Community Manager", color: "bg-pink-100" }
              ].map((member, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className={`w-48 h-48 mx-auto rounded-full ${member.color} mb-6 overflow-hidden relative flex items-center justify-center text-4xl font-bold text-gray-400 group-hover:scale-105 transition-transform duration-300`}>
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of successful sellers who have transformed their businesses with 9tangle.
          </p>
          <Link 
            href="/courses" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-300 shadow-lg"
          >
            Explore Courses
          </Link>
        </div>
      </section>
    </main>
  );
}
