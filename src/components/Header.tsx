import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Phone, Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Каталог', href: '#catalog' },
    { name: 'О нас', href: '#about' },
    { name: 'Сервис', href: '#service' },
    { name: 'Контакты', href: '#contacts' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <a href="/" className="flex items-center">
            <img src="/logo.svg" alt="AGROTECH" className="h-12" />
          </a>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? 'text-gray' : 'text-white/90'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <div className="relative cursor-pointer group">
              <Heart className={`w-5 h-5 transition-colors group-hover:text-primary ${isScrolled ? 'text-dark' : 'text-white'}`} />
              <span className="absolute -top-2 -right-2 bg-accent text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </div>
            <a
              href="tel:+78001234567"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary ${
                isScrolled ? 'text-dark' : 'text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              +7 (800) 123-45-67
            </a>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? 'text-dark' : 'text-white'} />
            ) : (
              <Menu className={isScrolled ? 'text-dark' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden border-t border-gray/10"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-dark hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-gray/10 my-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-dark font-semibold">
                  <Phone className="w-4 h-4" />
                  +7 (800) 123-45-67
                </div>
                <div className="relative">
                  <Heart className="w-6 h-6 text-dark" />
                  <span className="absolute -top-2 -right-2 bg-accent text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    3
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
