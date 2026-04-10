import { motion } from 'motion/react';

const stats = [
  { value: '500+', label: 'Довольных клиентов' },
  { value: '15 лет', label: 'На рынке' },
  { value: '24/7', label: 'Поддержка' },
  { value: '1000+', label: 'Единиц техники' },
];

export default function Stats() {
  return (
    <section className="py-24 bg-dark text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/60 uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
