import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  BarChart3, 
  Award, 
  CheckCircle, 
  Star,
  TrendingUp,
  Clock,
  FileText,
  Zap,
  Lock,
  Globe,
  ChevronRight,
  Menu,
  X,
  Trophy,
  ArrowUp
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [topStudent, setTopStudent] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel images
  const carouselImages = [
    '/src/assets/hero/hero1.jpg',
    '/src/assets/hero/hero2.jpg',
    '/src/assets/hero/hero3.jpg'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Fetch top student
  useEffect(() => {
    const fetchTopStudent = async () => {
      try {
        const response = await api.get('/students');
        // Sort by current_points descending and get the top student
        const sortedStudents = response.data.sort((a, b) => b.current_points - a.current_points);
        if (sortedStudents.length > 0) {
          setTopStudent(sortedStudents[0]);
          setTopStudents(sortedStudents.slice(0, 3)); // Get top 3
        }
      } catch (error) {
        console.error('Error fetching top student:', error);
        // Set a fallback if API fails
        setTopStudent({
          first_name: 'Sarah',
          last_name: 'M.',
          current_points: 150,
          photo_url: null
        });
      }
    };
    fetchTopStudent();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with role-based access control and audit trails.',
      color: 'primaryClr'
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Tailored dashboards for teachers, supervisors, officers, and parents.',
      color: 'accentClr'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Comprehensive insights with interactive charts and performance metrics.',
      color: 'secondaryClr'
    },
    {
      icon: Award,
      title: 'Behavior Tracking',
      description: 'Log positive achievements and incidents with evidence attachment.',
      color: 'primaryClrLight'
    },
    {
      icon: Clock,
      title: 'Instant Notifications',
      description: 'Real-time alerts for supervisors and parents on critical incidents.',
      color: 'dangerClr'
    },
    {
      icon: FileText,
      title: 'Automated Reports',
      description: 'Generate certificates and comprehensive behavior reports instantly.',
      color: 'primaryClrDark'
    }
  ];

  const stats = [
    { value: '500+', label: 'Active Students', icon: Users },
    { value: '50+', label: 'Staff Members', icon: Shield },
    { value: '2,000+', label: 'Behavior Logs', icon: FileText },
    { value: '98%', label: 'Satisfaction Rate', icon: Star }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'School Principal',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=031f54&color=fff',
      quote: 'This system transformed how we manage student behavior. The analytics help us identify patterns and intervene early.'
    },
    {
      name: 'Michael Chen',
      role: 'Teacher',
      image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=22e950&color=fff',
      quote: 'Logging incidents is now effortless. I can attach evidence and track student progress all in one place.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Parent',
      image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=2d4b83&color=fff',
      quote: 'I love receiving real-time updates about my child\'s achievements and areas for improvement. Very transparent!'
    }
  ];

  return (
    <div className="min-h-screen bg-bgDarkAll text-primaryClrText overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bgDark/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="AMSS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-primaryClr leading-tight">AMSS</span>
                <span className="text-[8px] text-secondaryClr uppercase tracking-widest font-semibold">Shaping The Future</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-secondaryClr hover:text-primaryClr transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-secondaryClr hover:text-primaryClr transition-colors">About</a>
              <a href="#testimonials" className="text-sm font-medium text-secondaryClr hover:text-primaryClr transition-colors">Testimonials</a>
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                Sign In <ArrowRight size={16} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-secondaryClr hover:text-primaryClr"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-bgDark border-t border-white/10 animate-fadeInUp">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-sm font-medium text-secondaryClr hover:text-primaryClr transition-colors py-2">Features</a>
              <a href="#about" className="block text-sm font-medium text-secondaryClr hover:text-primaryClr transition-colors py-2">About</a>
              <a href="#testimonials" className="block text-sm font-medium text-secondaryClr hover:text-primaryClr transition-colors py-2">Testimonials</a>
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary w-full px-6 py-3 flex items-center justify-center gap-2"
              >
                Sign In <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primaryClr/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accentClr/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fadeInUp">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primaryClr/10 border border-primaryClr/20 rounded-full text-xs font-bold uppercase tracking-widest text-primaryClr">
                  <Zap size={12} className="inline mr-2" />
                  Next-Gen School Management
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-primaryClrText leading-tight">
                Transform Student
                <span className="block text-primaryClr mt-2">Behavior Management</span>
              </h1>
              
              <p className="text-lg text-secondaryClr leading-relaxed max-w-xl">
                Empower your school with intelligent behavior tracking, real-time analytics, and automated reporting. 
                Built for educators, trusted by institutions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-3 group shadow-2xl shadow-primaryClr/30"
                >
                  Get Started
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 text-lg border-2 border-white/10 rounded-xl hover:bg-white/5 transition-all font-bold flex items-center justify-center gap-3"
                >
                  Learn More
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-accentClr" />
                  <span className="text-xs text-secondaryClr">Secure & Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-accentClr" />
                  <span className="text-xs text-secondaryClr">Cloud-Based</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-accentClr" />
                  <span className="text-xs text-secondaryClr">GDPR Compliant</span>
                </div>
              </div>

              {/* Top Performers Showcase */}
              {topStudents.length > 0 && (
                <div className="pt-8">
                  <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Trophy size={14} className="text-accentClr" />
                    This Month's Top Performers
                  </p>
                  <div className="flex items-center gap-4">
                    {topStudents.map((student, index) => (
                      <div 
                        key={student.id || index}
                        className="relative group cursor-pointer"
                        title={`${student.first_name} ${student.last_name} - ${student.current_points} pts`}
                      >
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-3 ${
                          index === 0 ? 'border-accentClr ring-4 ring-accentClr/20' : 
                          index === 1 ? 'border-primaryClr ring-2 ring-primaryClr/20' : 
                          'border-secondaryClr ring-2 ring-secondaryClr/20'
                        } transition-transform group-hover:scale-110`}>
                          <img 
                            src={student.photo_url || `https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=${index === 0 ? '22e950' : index === 1 ? '031f54' : '2d4b83'}&color=fff`}
                            alt={`${student.first_name} ${student.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accentClr flex items-center justify-center shadow-lg">
                            <Trophy size={12} className="text-white" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-bgDark border border-white/10 rounded-full text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {student.current_points} pts
                        </div>
                      </div>
                    ))}
                    <div className="ml-2">
                      <p className="text-xs text-secondaryClr">+{topStudents.length} students</p>
                      <p className="text-xs text-accentClr font-bold">excelling this term</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Hero Carousel */}
            <div className="relative animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                {/* Floating Cards */}
                <div className="absolute -top-8 -left-8 glass-card !p-4 w-48 animate-float z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accentClr/20 flex items-center justify-center text-accentClr">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-secondaryClr">Positive Trend</p>
                      <p className="text-lg font-bold text-accentClr">+24%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -right-8 glass-card !p-4 w-56 animate-float z-20" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    {topStudent && (
                      <>
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-accentClr/30 shadow-lg">
                            <img 
                              src={topStudent.photo_url || `https://ui-avatars.com/api/?name=${topStudent.first_name}+${topStudent.last_name}&background=22e950&color=fff`}
                              alt={`${topStudent.first_name} ${topStudent.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accentClr flex items-center justify-center">
                            <Trophy size={12} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-secondaryClr">Top Performer</p>
                          <p className="text-sm font-bold">{topStudent.first_name} {topStudent.last_name}</p>
                          <p className="text-xs text-accentClr font-black">{topStudent.current_points} pts</p>
                        </div>
                      </>
                    )}
                    {!topStudent && (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-primaryClr/20 flex items-center justify-center text-primaryClr animate-pulse">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-secondaryClr">Loading...</p>
                          <p className="text-sm font-bold">Top Student</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Hero Image Carousel */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 z-10">
                  <div className="relative h-[400px] md:h-[500px]">
                    {carouselImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`School Hero ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-bgDarkAll via-transparent to-transparent"></div>
                      </div>
                    ))}
                  </div>

                  {/* Carousel Controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-primaryClr w-8'
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all z-20"
                    aria-label="Previous slide"
                  >
                    <ChevronRight size={20} className="rotate-180 text-white" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all z-20"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bgDark/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primaryClr/10 text-primaryClr mb-4">
                  <stat.icon size={28} />
                </div>
                <p className="text-3xl md:text-4xl font-black text-primaryClrText mb-2">{stat.value}</p>
                <p className="text-sm text-secondaryClr uppercase tracking-wider font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="px-4 py-2 bg-primaryClr/10 border border-primaryClr/20 rounded-full text-xs font-bold uppercase tracking-widest text-primaryClr">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-primaryClrText mt-6 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-secondaryClr max-w-2xl mx-auto">
              Comprehensive tools designed to streamline behavior management and enhance student development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card group hover:border-primaryClr/30 transition-all duration-300 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center text-${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primaryClr transition-colors">{feature.title}</h3>
                <p className="text-secondaryClr leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-bgDark/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp">
              <span className="px-4 py-2 bg-primaryClr/10 border border-primaryClr/20 rounded-full text-xs font-bold uppercase tracking-widest text-primaryClr">
                About AMSS
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-black text-primaryClrText mt-6 mb-6">
                Built for Modern Education
              </h2>
              <p className="text-lg text-secondaryClr leading-relaxed mb-6">
                Amana Model Secondary School's Behavior Tracking System is designed to foster positive student development 
                through data-driven insights and transparent communication.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time incident logging with evidence attachment',
                  'Automated approval workflows for supervisors',
                  'Comprehensive analytics and performance metrics',
                  'Parent portal for transparent communication',
                  'Automated certificate and report generation'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accentClr flex-shrink-0 mt-1" />
                    <span className="text-secondaryClr">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="glass-card !p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-bgDarkAll/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primaryClr/20 flex items-center justify-center text-primaryClr">
                      <Shield size={24} />
                    </div>
                    <div>
                      <p className="font-bold">Secure Platform</p>
                      <p className="text-xs text-secondaryClr">Enterprise-grade security</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-bgDarkAll/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-accentClr/20 flex items-center justify-center text-accentClr">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="font-bold">Multi-Role Access</p>
                      <p className="text-xs text-secondaryClr">Tailored for every user</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-bgDarkAll/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-secondaryClr/20 flex items-center justify-center text-secondaryClr">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <p className="font-bold">Advanced Analytics</p>
                      <p className="text-xs text-secondaryClr">Data-driven decisions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="px-4 py-2 bg-primaryClr/10 border border-primaryClr/20 rounded-full text-xs font-bold uppercase tracking-widest text-primaryClr">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-primaryClrText mt-6 mb-4">
              Trusted by Educators
            </h2>
            <p className="text-lg text-secondaryClr max-w-2xl mx-auto">
              See what our users have to say about transforming their school management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="glass-card hover:border-primaryClr/30 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-primaryClr/20"
                  />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-xs text-secondaryClr">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-accentClr fill-accentClr" />
                  ))}
                </div>
                <p className="text-secondaryClr italic leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primaryClr/20 to-transparent border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
          <h2 className="text-3xl md:text-5xl font-display font-black text-primaryClrText mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-lg text-secondaryClr mb-8 max-w-2xl mx-auto">
            Join hundreds of schools already using our platform to create positive learning environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary px-10 py-4 text-lg flex items-center justify-center gap-3 group shadow-2xl shadow-primaryClr/30"
            >
              Get Started Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 text-lg border-2 border-white/10 rounded-xl hover:bg-white/5 transition-all font-bold">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-bgDark border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src="/logo.png" alt="AMSS Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-display font-bold text-primaryClr leading-tight">AMSS</span>
                  <span className="text-[8px] text-secondaryClr uppercase tracking-widest font-semibold">Shaping The Future</span>
                </div>
              </div>
              <p className="text-sm text-secondaryClr max-w-sm">
                Empowering schools with intelligent behavior management and data-driven insights.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-secondaryClr hover:text-primaryClr transition-colors">Features</a></li>
                <li><a href="#about" className="text-sm text-secondaryClr hover:text-primaryClr transition-colors">About</a></li>
                <li><a href="#testimonials" className="text-sm text-secondaryClr hover:text-primaryClr transition-colors">Testimonials</a></li>
                <li><button onClick={() => navigate('/login')} className="text-sm text-secondaryClr hover:text-primaryClr transition-colors">Sign In</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-secondaryClr">
                <li>Bishoftu, Ethiopia</li>
                <li>+251 114 33 00 00</li>
                <li>info@amanaschool.edu.et</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondaryClr">
              © 2026 Amana Model Secondary School. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-secondaryClr">
              <a href="#" className="hover:text-primaryClr transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primaryClr transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primaryClr transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-primaryClr hover:bg-primaryClrLight text-white rounded-full shadow-2xl shadow-primaryClr/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-fadeInUp"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

// Floating animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

export default Landing;
