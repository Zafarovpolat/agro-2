import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

const products = [
  { id: 1, name: 'Плуг оборотный 5-корпусный', image: 'https://picsum.photos/seed/plow/400/400' },
  { id: 2, name: 'Культиватор стерневой', image: 'https://picsum.photos/seed/cultivator/400/400' },
  { id: 3, name: 'Опрыскиватель прицепной', image: 'https://picsum.photos/seed/sprayer/400/400' },
  { id: 4, name: 'Разбрасыватель удобрений', image: 'https://picsum.photos/seed/spreader/400/400' },
  { id: 5, name: 'Косилка дисковая', image: 'https://picsum.photos/seed/mower/400/400' },
  { id: 6, name: 'Пресс-подборщик', image: 'https://picsum.photos/seed/baler/400/400' },
  { id: 7, name: 'Борона дисковая', image: 'https://picsum.photos/seed/harrow/400/400' },
  { id: 8, name: 'Жатка для кукурузы', image: 'https://picsum.photos/seed/header/400/400' },
];

export default function CatalogPreview() {
  return (
    <section id="catalog" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">Каталог техники</h2>
            <p className="text-gray max-w-lg">
              Широкий выбор оборудования для любых сельскохозяйственных задач.
            </p>
          </div>
          <button className="text-primary font-bold hover:underline hidden md:block">
            Смотреть все товары
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square bg-light rounded-xl overflow-hidden mb-4 shadow-sm transition-shadow hover:shadow-md">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-dark hover:text-primary transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-dark px-6 py-2 rounded-lg font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Подробнее
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-dark group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </motion.div>
          ))}
        </div>
        
        <button className="w-full mt-12 btn-secondary md:hidden">
          Смотреть все товары
        </button>
      </div>
    </section>
  );
}
