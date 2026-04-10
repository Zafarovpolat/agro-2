import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <a href="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block">
              AGRO<span className="text-primary">TECH</span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Ваш надежный партнер в мире сельскохозяйственной техники. Мы предлагаем только лучшие решения для вашего бизнеса.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Навигация</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Каталог техники</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">О компании</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Сервис и запчасти</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Новости</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Контакты</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-6">Категории</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Тракторы</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Комбайны</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Почвообработка</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Посев и посадка</a></li>
              <li><a href="#" className="text-white/60 hover:text-primary transition-colors">Защита растений</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Контакты</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-white/60 text-sm">г. Краснодар, ул. Сельскохозяйственная, 101</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+78001234567" className="text-white/60 hover:text-primary transition-colors text-sm">+7 (800) 123-45-67</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:info@agrotech.ru" className="text-white/60 hover:text-primary transition-colors text-sm">info@agrotech.ru</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white/5 mb-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-xs">
          <p>© 2026 AGROTECH. Все права защищены.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Публичная оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
