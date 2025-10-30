'use client'
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, Lightbulb, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutArttag() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar></Navbar>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              About Arttag
            </h1>
            <p className="text-2xl md:text-3xl font-light max-w-3xl mx-auto">
              Where Function Meets Expression.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
            At Arttag, we believe everyday essentials should be as expressive as they are functional.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
            We're building a modern lifestyle brand that merges technology, design, and creativity — crafting premium gadgets, accessories, and bags that elevate your daily life with both style and purpose.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
            From the smallest charger to the most versatile travel bag, every Arttag product reflects a balance of innovation, artistry, and individuality — designed for those who live boldly and express freely.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Our Story</h2>
          </div>
          <div className="space-y-6 text-center">
            <p className="text-2xl font-medium text-gray-800 italic">
              "Why should functional products look ordinary?"
            </p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              What started as a creative experiment in designing skins and stickers has now evolved into a premium lifestyle brand that reimagines how we interact with our everyday essentials.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Arttag, we transform daily-use gadgets into statement pieces — combining premium quality, modern aesthetics, and personalized touches that make every product uniquely yours.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Target className="w-10 h-10 text-purple-600 mr-3" />
                <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become a global lifestyle brand that blends art and innovation, transforming everyday essentials into expressions of personality and creativity.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                We envision a world where every Arttag product — from a cable to a carry bag — is a symbol of function, emotion, and design.
              </p>
            </CardContent>
          </Card>

          {/* Mission Card */}
          <Card className="border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-10 h-10 text-indigo-600 mr-3" />
                <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-3 mt-1">•</span>
                  <span className="text-lg leading-relaxed">To deliver high-quality, design-driven gadgets and accessories that elevate everyday life.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-3 mt-1">•</span>
                  <span className="text-lg leading-relaxed">To keep the Arttag artistic essence alive in every product.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-3 mt-1">•</span>
                  <span className="text-lg leading-relaxed">To empower individuality through customization and creativity.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-3 mt-1">•</span>
                  <span className="text-lg leading-relaxed">To continuously innovate, ensuring our designs remain relevant, refined, and responsible.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Arttag Touch */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center mb-8">
            <Heart className="w-8 h-8 text-pink-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">The Arttag Touch</h2>
          </div>
          <div className="text-center space-y-6">
            <p className="text-xl font-medium text-gray-800">
              What sets us apart is our personal touch.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Every Arttag creation carries an element of art — from custom skins and free stickers to signature design details that add character to your essentials.
            </p>
            <p className="text-lg text-gray-700 font-medium max-w-4xl mx-auto">
              We don't just sell products; we craft personal experiences that resonate with your lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          Our Founders
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {/* Shivam Awasthi */}
          <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-64 flex items-center justify-center">
              <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-6xl font-bold">SA</span>
              </div>
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Shivam Awasthi</h3>
              <p className="text-purple-600 font-medium mb-4">Co-Founder, Creative Director</p>
              <p className="text-gray-700 leading-relaxed">
                A visionary artist and entrepreneur, Shivam Awasthi brings creativity, storytelling, and brand emotion to Arttag. With a background in art, music, and design, he ensures every Arttag product carries a soulful personality — merging lifestyle with self-expression.
              </p>
            </CardContent>
          </Card>

          {/* Dheeraj Awasthi */}
          <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 h-64 flex items-center justify-center">
              <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-6xl font-bold">DA</span>
              </div>
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Dheeraj Awasthi</h3>
              <p className="text-indigo-600 font-medium mb-4">Co-Founder, Operations & Strategy</p>
              <p className="text-gray-700 leading-relaxed">
                With a strong focus on innovation and execution, Dheeraj Awasthi leads product development and business strategy at Arttag. His commitment to quality, structure, and performance ensures that every Arttag product delivers premium value and lasting reliability.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Join the Arttag Lifestyle
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
            Arttag is more than just a brand — it's a statement.
          </p>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            Every gadget, every bag, and every design carries a spark of individuality that connects art with your everyday life.
          </p>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            Step into a world where innovation meets imagination, and make your essentials truly yours.
          </p>
          <div className="pt-8">
            <p className="text-2xl font-bold">
              Welcome to Arttag — Where Function Meets Expression.
            </p>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </div>
  );
}