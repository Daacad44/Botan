import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Stars, Text3D, Center, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Code2, Terminal, Cpu, Globe, Layers, Zap, 
  Github, Twitter, Linkedin, Mail, ArrowRight, 
  ExternalLink, ChevronDown, MousePointer2,
  Activity, BarChart3, Smartphone, Monitor, Laptop
} from 'lucide-react';

// --- Assets (Generated Images) ---
const ASSETS = {
  analytics: "https://image.qwenlm.ai/public_source/65e5e981-d79d-44ec-93cf-c7ea531bef63/1e99-4b43-b82a-b3be133f9983.png",
  mobile: "https://image.qwenlm.ai/public_source/65e5e981-d79d-44ec-93cf-c7ea531bef63/1996a60e6-89e7-4a2a-9f48-4d07e9f14eb8.png",
  code: "https://image.qwenlm.ai/public_source/65e5e981-d79d-44ec-93cf-c7ea531bef63/16f49fb48-7eae-48f7-b7ad-8bc7289a86e8.png",
  dashboard: "https://image.qwenlm.ai/public_source/65e5e981-d79d-44ec-93cf-c7ea531bef63/1f0be732f-5cc8-4edf-9cad-b2e4c3e6b516.png"
};

// --- Components ---

// 1. 3D Floating Device Component
const FloatingDevice = ({ position, rotation, scale, imageUrl, type, delay = 0 }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  
  // Load texture
  const texture = useTexture(imageUrl);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t + delay) * 0.1;
      meshRef.current.rotation.z = Math.sin(t * 0.5 + delay) * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position} rotation={rotation} scale={scale}>
        {/* Screen Frame */}
        <mesh ref={meshRef} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
          {type === 'mobile' ? (
            <boxGeometry args={[1.5, 3, 0.1]} />
          ) : type === 'tablet' ? (
            <boxGeometry args={[3, 2, 0.1]} />
          ) : (
            <boxGeometry args={[3.5, 2.2, 0.1]} />
          )}
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Screen Content */}
        <mesh position={[0, 0, 0.06]}>
          {type === 'mobile' ? (
            <planeGeometry args={[1.35, 2.85]} />
          ) : type === 'tablet' ? (
            <planeGeometry args={[2.85, 1.85]} />
          ) : (
            <planeGeometry args={[3.35, 2.05]} />
          )}
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        {/* Glow Effect */}
        <pointLight position={[0, 0, 1]} intensity={hovered ? 2 : 0.5} color="#8b5cf6" distance={3} />
      </group>
    </Float>
  );
};

// 2. Hero Scene
const HeroScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#8b5cf6" />
      <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={1} color="#06b6d4" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Desktop Monitor */}
      <FloatingDevice 
        position={[2, 0.5, -2]} 
        rotation={[0, -0.3, 0.1]} 
        scale={[1.2, 1.2, 1.2]} 
        imageUrl={ASSETS.dashboard} 
        type="desktop" 
        delay={0}
      />
      
      {/* Tablet */}
      <FloatingDevice 
        position={[-2.5, -1, 0]} 
        rotation={[0, 0.4, -0.1]} 
        scale={[0.9, 0.9, 0.9]} 
        imageUrl={ASSETS.analytics} 
        type="tablet" 
        delay={1}
      />
      
      {/* Mobile */}
      <FloatingDevice 
        position={[0, -2.5, 1]} 
        rotation={[0.2, 0, 0]} 
        scale={[0.8, 0.8, 0.8]} 
        imageUrl={ASSETS.mobile} 
        type="mobile" 
        delay={2}
      />

       {/* Code Editor Laptop (Background) */}
       <FloatingDevice 
        position={[-3, 1.5, -4]} 
        rotation={[0, 0.6, 0]} 
        scale={[0.8, 0.8, 0.8]} 
        imageUrl={ASSETS.code} 
        type="desktop" 
        delay={3}
      />
    </>
  );
};

// 3. Typing Animation Component
const Typewriter = ({ text, speed = 50, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{displayedText}<span className="animate-pulse text-violet-500">_</span></span>;
};

// 4. Live Stats Card
const LiveStatCard = ({ icon: Icon, label, value, color }) => {
  const [currentVal, setCurrentVal] = useState(value);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVal(prev => {
        const change = Math.floor(Math.random() * 10) - 3;
        return Math.max(0, prev + change);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm hover:border-violet-500/50 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${color.replace('text-', 'bg-')}`} 
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, (currentVal / (value * 1.5)) * 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{currentVal}+</div>
      <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );
};

// 5. Project Card with 3D Tilt
const ProjectCard = ({ title, category, image, tags }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = event.clientX - rect.left - width / 2;
    const mouseYFromCenter = event.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[400px] perspective-1000 cursor-pointer group"
    >
      <div className="absolute inset-0 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl shadow-violet-900/20">
        {/* Dynamic Background Image */}
        <motion.img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-z-20">
          <div className="flex gap-2 mb-3">
            {tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full backdrop-blur-md">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{title}</h3>
          <p className="text-slate-400 text-sm mb-4">{category}</p>
          
          <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
            View Case Study <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Holographic Shine Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
          style={{
            x: useTransform(x, [-0.5, 0.5], ["-100%", "100%"]),
            y: useTransform(y, [-0.5, 0.5], ["-100%", "100%"]),
          }}
        />
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // Custom Cursor Logic
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-violet-500/30 overflow-x-hidden font-sans">
      
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-violet-500 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        style={{ x: cursorX, y: cursorY }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-violet-500 rounded-full pointer-events-none z-50 hidden md:block"
        style={{ x: useTransform(cursorX, v => v + 12), y: useTransform(cursorY, v => v + 12) }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center bg-slate-950/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white">B</div>
          <span className="font-bold text-xl tracking-tight text-white">Botan<span className="text-violet-500">Dev</span>.</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {['Home', 'About', 'Skills', 'Projects', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-violet-400 transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>
        <button className="px-5 py-2 bg-white text-slate-950 rounded-full font-semibold text-sm hover:bg-violet-50 hover:scale-105 transition-all flex items-center gap-2">
          Let's Talk <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
            <HeroScene />
          </Canvas>
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pointer-events-none"
        >
          <div className="pointer-events-auto space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Available for new projects
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
              I Build Digital <br />
              Experiences That <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400">Inspire.</span>
            </h1>

            <div className="h-12 text-lg md:text-xl text-slate-400 font-light">
              <Typewriter text="Full-stack developer crafting performant, scalable web systems." speed={30} />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center gap-2">
                View My Work <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-violet-500 text-white rounded-xl font-semibold transition-all flex items-center gap-2">
                Download CV <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs uppercase tracking-widest"
        >
          <span>Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* About / Stats Section */}
      <section id="about" className="py-24 relative bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-white">Turning ideas into <br/><span className="text-violet-500">real products.</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                I'm a full-stack developer with a passion for building clean, user-focused, and high-performance web applications. I merge code, design, and motion to create experiences people love.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <LiveStatCard icon={Code2} label="Years Exp" value={5} color="text-emerald-400" />
                <LiveStatCard icon={Layers} label="Projects" value={60} color="text-blue-400" />
                <LiveStatCard icon={Globe} label="Clients" value={30} color="text-violet-400" />
                <LiveStatCard icon={Zap} label="Awards" value={10} color="text-amber-400" />
              </div>
            </div>
            
            <div className="relative h-[500px] bg-slate-900 rounded-3xl border border-slate-800 p-8 overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                </div>
                
                <div className="font-mono text-sm text-slate-300 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-violet-400">const</span>
                    <span className="text-blue-400">developer</span>
                    <span className="text-white">=</span>
                    <span className="text-yellow-300">{'{'}</span>
                  </div>
                  <div className="pl-4 flex gap-2">
                    <span className="text-slate-400">name:</span>
                    <span className="text-green-400">'Botan'</span>,
                  </div>
                  <div className="pl-4 flex gap-2">
                    <span className="text-slate-400">skills:</span>
                    <span className="text-yellow-300">['React', 'Three.js', 'Node']</span>,
                  </div>
                  <div className="pl-4 flex gap-2">
                    <span className="text-slate-400">hardWorker:</span>
                    <span className="text-red-400">true</span>,
                  </div>
                  <div className="pl-4 flex gap-2">
                    <span className="text-slate-400">problemSolver:</span>
                    <span className="text-red-400">true</span>,
                  </div>
                  <div className="flex gap-2">
                    <span className="text-yellow-300">{'}'}</span>;
                  </div>
                </div>

                <div className="mt-8 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                   <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-400">System Status: Online</span>
                   </div>
                   <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500"
                        animate={{ width: ["30%", "70%", "45%", "90%"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Marquee */}
      <div className="py-12 border-y border-white/5 bg-slate-950/50 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 mx-6 items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {['React', 'Next.js', 'TypeScript', 'Tailwind', 'Three.js', 'Node.js', 'GraphQL', 'AWS', 'Figma', 'Blender'].map((tech) => (
                <span key={tech} className="text-2xl font-bold text-slate-400">{tech}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-slate-950 relative">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">Selected Work</h2>
              <p className="text-slate-400 max-w-lg">A collection of projects that push the boundaries of web technology and user experience.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
              View All Projects <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard 
              title="Nexus Dashboard" 
              category="SaaS Analytics Platform" 
              image={ASSETS.dashboard}
              tags={['React', 'D3.js', 'Node']}
            />
            <ProjectCard 
              title="Crypto Wallet" 
              category="Mobile Finance App" 
              image={ASSETS.mobile}
              tags={['React Native', 'Web3', 'Tailwind']}
            />
             <ProjectCard 
              title="DevFlow IDE" 
              category="Browser-based Code Editor" 
              image={ASSETS.code}
              tags={['Monaco', 'WebAssembly', 'Rust']}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-16 backdrop-blur-xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to start your project?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Whether you have a specific idea or just need some advice, I'm always open to discussing new opportunities.
            </p>
            
            <form className="max-w-md mx-auto space-y-4 text-left">
              <div>
                <input type="email" placeholder="Your Email" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <textarea rows="4" placeholder="Tell me about your project" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all transform hover:-translate-y-1">
                Send Message
              </button>
            </form>

            <div className="mt-12 flex justify-center gap-6">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all hover:scale-110">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 bg-slate-950 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Botan Dev. All rights reserved. Built with React & Three.js.</p>
      </footer>
    </div>
  );
}
