import { motion } from 'motion/react';
import { ShieldCheck, Zap, Headphones, Award } from 'lucide-react';

const advantages = [
  {
    title: 'Гарантия качества',
    description: 'Вся техника проходит строгий контроль перед поставкой клиенту.',
    icon: ShieldCheck,
  },
  {
    title: 'Быстрая доставка',
    description: 'Собственная логистическая сеть обеспечивает доставку в кратчайшие сроки.',
    icon: Zap,
  },
  {
    title: 'Сервисное обслуживание',
    description: 'Квалифицированные специалисты готовы помочь 24/7.',
    icon: Headphones,
  },
  {
    title: 'Лучшие цены',
    description: 'Прямые поставки от производителей позволяют нам предлагать выгодные условия.',
    icon: Award,
  },
];

export default function Advantages() {
  return (
    <section className="py-24 bg-light">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Наши преимущества</h2>
          <p className="text-gray max-w-2xl mx-auto">
            Мы стремимся быть лучшим партнером для вашего агробизнеса, предлагая комплексные решения.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((adv, index) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-sm transition-all hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                <adv.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{adv.title}</h3>
              <p className="text-gray text-sm leading-relaxed">
                {adv.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
