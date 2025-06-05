'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Trophy, 
  Users, 
  Star,
  Sword,
  Shield,
  Crown,
  Sparkles,
  CheckCircle,
  Play
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LandingPage() {
  const { user } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Quest Generation",
      description: "Transform any boring task into an epic RPG quest with the power of AI"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Level Up System",
      description: "Gain XP and level up your character as you complete real-world achievements"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "RPG Stats",
      description: "Build your Strength, Wisdom, Endurance, and Charisma through different quest types"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Quests",
      description: "Share your adventures and compete with friends on epic leaderboards"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Developer",
      content: "Herofy turned my boring daily routine into an epic adventure. I actually look forward to doing chores now!",
      avatar: "👩‍💻"
    },
    {
      name: "Marcus Rodriguez",
      role: "Student",
      content: "Finally, a productivity app that doesn't feel like work. My study sessions are now legendary quests!",
      avatar: "🧙‍♂️"
    },
    {
      name: "Lisa Johnson",
      role: "Entrepreneur",
      content: "The gamification is brilliant. I've completed more goals in 3 months than I did all last year.",
      avatar: "⚡"
    }
  ];

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome back, <span className="text-gradient">Hero</span>! 🎯
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Ready to continue your epic journey? Your quests await!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Continue Adventure
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/profile"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 transition-colors inline-flex items-center justify-center"
              >
                View Profile
                <Trophy className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <motion.div
            className="text-center"
            {...fadeInUp}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Transform Your Life Into an Epic Adventure
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Turn Tasks Into
              <span className="text-gradient block">Epic Quests</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Stop struggling with boring to-do lists. Herofy transforms your daily tasks into exciting RPG quests, 
              complete with XP, leveling, and character progression. Become the hero of your own life story.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link
                href="/signup"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
              >
                Start Your Adventure
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 transition-colors inline-flex items-center justify-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Hero Demo */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">See the Magic in Action:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">❌ Boring Task:</h4>
                    <p className="text-gray-600">"Do laundry"</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 rounded-lg text-white">
                    <h4 className="font-medium mb-2">⚔️ Epic Quest:</h4>
                    <p className="text-sm opacity-90">"Cleanse the Cursed Garments of Chaos"</p>
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-300 mr-1" />
                      <span className="text-yellow-300 font-semibold">+50 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Heroes Choose Herofy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More than just gamification - it's a complete system for turning your life into an epic adventure
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Journey to Heroism
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps to transform your life into an epic adventure
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: <Sword className="w-8 h-8" />, title: "Add Your Task", desc: "Enter any boring task or goal" },
              { step: "2", icon: <Sparkles className="w-8 h-8" />, title: "AI Transforms It", desc: "Watch it become an epic quest" },
              { step: "3", icon: <Trophy className="w-8 h-8" />, title: "Complete & Level Up", desc: "Gain XP and improve your stats" },
              { step: "4", icon: <Crown className="w-8 h-8" />, title: "Become a Hero", desc: "Build habits that last forever" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join Thousands of Heroes
            </h2>
            <p className="text-xl text-gray-600">
              See how Herofy is transforming lives around the world
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{testimonial.avatar}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Become a Hero?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of people who have transformed their lives with Herofy. 
              Your epic adventure starts with a single quest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Start Free Adventure
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}