import { motion } from 'motion/react';
import { Tractor, Shovel as Tool, Wheat, Settings, Truck, Droplets } from 'lucide-react';

const categories = [
  { name: 'Тракторы', icon: Tractor },
  { name: 'Комбайны', icon: Wheat },
  { name: 'Плуги', icon: Tool },
  { name: 'Сеялки', icon: Droplets },
  { name: 'Прицепы', icon: Truck },
  { name: 'Запчасти', icon: Settings },
];

export default function QuickNav() {
  return (
    <section className="py-12 bg-white border-b border-gray/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {categories.map((cat, index) => (
            <motion.a
              key={cat.name}
              href={`#${cat.name.toLowerCase()}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-md">
                <cat.icon className="w-8 h-8" />
              </div>
              <span className="text-sm font-semibold text-dark group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
