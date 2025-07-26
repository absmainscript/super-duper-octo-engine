import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CheckCircle,
  Camera,
  Stethoscope, Activity, Zap, Shield, Target,
  UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
  MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
  Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
  Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
  Timer, Calendar, Hourglass
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Specialty } from "@shared/schema";
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";

export default function SpecialtiesSection() {
  console.log('SpecialtiesSection: Componente está sendo renderizado');
  
  // Todos os hooks devem ser chamados no topo, antes de qualquer retorno condicional
  const { data: specialties = [], isLoading, error } = useQuery({
    queryKey: ["/api/specialties"],
    queryFn: async () => {
      const response = await fetch("/api/specialties");
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        throw new Error(`Falha ao carregar especialidades: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000,
  });

  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  const [isVisible, setIsVisible] = useState(true); // Forçar como true para debug
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('SpecialtiesSection: Intersection Observer configurado');
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('SpecialtiesSection: Intersection observed', entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
      console.log('SpecialtiesSection: Observer attached to ref');
    } else {
      console.log('SpecialtiesSection: Ref não está disponível');
    }

    return () => observer.disconnect();
  }, []);

  // Loading state - agora após todos os hooks
  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state - agora após todos os hooks
  if (error) {
    return (
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Especialidades</h2>
          <p className="text-red-600">Erro ao carregar especialidades</p>
        </div>
      </section>
    );
  }

  // Mapeamento completo de ícones
  const iconMap: Record<string, any> = {
    Brain, Heart, BookOpen, Users, Award, Clock, MapPin, Phone, Mail, Star,
    CheckCircle, Camera, Stethoscope, Activity, Zap, Shield, Target,
    UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
    MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
    Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
    Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
    Timer, Calendar, Hourglass
  };

  // Função para converter cor hex em RGB com alpha
  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substr(0, 2), 16);
    const g = parseInt(hexValue.substr(2, 2), 16);
    const b = parseInt(hexValue.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const activeSpecialties = specialties
    .filter((specialty: Specialty) => specialty.isActive)
    .sort((a: Specialty, b: Specialty) => a.order - b.order);

  // Debug logs mais detalhados
  console.log('=== SPECIALTIES SECTION DEBUG ===');
  console.log('Specialties raw data:', specialties);
  console.log('Specialties length:', specialties?.length);
  console.log('Active specialties:', activeSpecialties);
  console.log('Active specialties length:', activeSpecialties?.length);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Configs:', configs);
  console.log('==================================');

  // Se não há especialidades ativas, mostra uma mensagem ou seção vazia
  if (activeSpecialties.length === 0) {
    console.log('SpecialtiesSection: Renderizando estado vazio');
    return (
      <section 
        className="py-24 bg-red-100 border-4 border-red-500" 
        data-section="specialties-empty"
        style={{ minHeight: '400px' }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Especialidades (DEBUG)</h2>
          <p className="text-gray-600">Nenhuma especialidade ativa encontrada.</p>
          <p className="text-xs text-gray-500 mt-2">
            Total de especialidades: {specialties?.length || 0} | 
            Ativas: {activeSpecialties?.length || 0} | 
            Loading: {isLoading ? 'Sim' : 'Não'}
          </p>
        </div>
      </section>
    );
  }

  const specialtiesSection = configs?.find((c: any) => c.key === 'specialties_section')?.value || {};
  const badgeSettings = configs?.find((c: any) => c.key === 'badge_gradient')?.value || {};
  
  // Pega a chave do gradiente configurado no painel (tanto do 'gradient' global quanto do 'specialties' específico)
  const specialtiesGradientKey = badgeSettings.specialties || badgeSettings.gradient || 'pink-purple';

  const sectionTexts = {
    title: specialtiesSection.title || "Minhas (Especialidades)",
    subtitle: specialtiesSection.subtitle || "Áreas de atuação onde posso te ajudar a encontrar bem-estar e equilíbrio emocional"
  };

  // Para o badge, usa o CSS do gradiente configurado
  const badgeGradientCSS = BADGE_GRADIENTS[specialtiesGradientKey as keyof typeof BADGE_GRADIENTS] || "from-purple-500 to-pink-500";

  console.log('Badge settings encontradas:', badgeSettings);
  console.log('Gradiente key selecionada:', specialtiesGradientKey);
  console.log('CSS do gradiente aplicado:', badgeGradientCSS);

  console.log('SpecialtiesSection: Renderizando seção principal com', activeSpecialties.length, 'especialidades');

  return (
    <section 
      ref={ref}
      className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden"
      data-section="specialties"
      style={{ minHeight: '400px' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-100 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-block mb-4">
            <span className={`text-xs font-medium text-white px-4 py-1.5 rounded-full ${badgeGradientCSS ? `bg-gradient-to-r ${badgeGradientCSS}` : 'text-purple-600 bg-purple-50 border border-purple-100'}`}>
              ESPECIALIDADES
            </span>
          </div>

          <motion.h2 
            className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-slate-800 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {(() => {
              console.log('Processando título com gradiente:', sectionTexts.title, 'usando chave:', specialtiesGradientKey);
              return processTextWithGradient(sectionTexts.title, specialtiesGradientKey);
            })()}
          </motion.h2>

          <motion.p 
            className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {sectionTexts.subtitle}
          </motion.p>
        </motion.div>

        {/* Specialties Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {activeSpecialties.map((specialty: Specialty, index: number) => {
            const IconComponent = iconMap[specialty.icon] || Brain;
            const bgColor = hexToRgba(specialty.iconColor, 0.08);
            const borderColor = hexToRgba(specialty.iconColor, 0.2);

            return (
              <motion.div
                key={specialty.id}
                className="group relative"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.8 + index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Card */}
                <div 
                  className="relative p-8 rounded-3xl border-2 transition-all duration-500 group-hover:shadow-2xl backdrop-blur-sm"
                  style={{ 
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                  }}
                >
                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
                    style={{ backgroundColor: specialty.iconColor }}
                  />

                  {/* Icon Container */}
                  <motion.div
                    className="relative mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden"
                      style={{ backgroundColor: hexToRgba(specialty.iconColor, 0.15) }}
                    >
                      {/* Icon Background Gradient */}
                      <div 
                        className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${specialty.iconColor}20, ${specialty.iconColor}10)`
                        }}
                      />

                      <IconComponent 
                        className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110" 
                        style={{ color: specialty.iconColor }}
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">
                      {specialty.title}
                    </h3>

                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                      {specialty.description}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: specialty.iconColor }} />
                  <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: specialty.iconColor }} />
                </div>

                {/* Floating Particles */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-60"
                  style={{ backgroundColor: specialty.iconColor }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        
      </div>
    </section>
  );
}