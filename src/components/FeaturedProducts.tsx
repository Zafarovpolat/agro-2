import { motion } from 'motion/react';

const featured = [
  {
    id: 1,
    title: 'Трактор John Deere 8R',
    description: 'Максимальная мощность и эффективность для больших полей.',
    image: 'https://images.unsplash.com/photo-1594488651083-023b93be82a8?auto=format&fit=crop&q=80&w=1000',
    size: 'large',
  },
  {
    id: 2,
    title: 'Комбайн CLAAS LEXION',
    description: 'Инновационные технологии уборки урожая.',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1000',
    size: 'small',
  },
  {
    id: 3,
    title: 'Сеялка HORSCH Maestro',
    description: 'Точный высев на высоких скоростях.',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=1000',
    size: 'small',
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-24 bg-light">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featured.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                item.size === 'large' ? 'md:row-span-2 h-[600px]' : 'h-[284px]'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </p>
                <button className="mt-4 text-accent font-semibold text-sm flex items-center gap-2 group/btn">
                  Подробнее
                  <span className="block w-4 h-[2px] bg-accent transition-all group-hover/btn:w-8" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
