import { motion } from 'motion/react';

export default function CTA() {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden relative">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-8 leading-tight"
          >
            Не нашли нужную технику? <br className="hidden md:block" />
            Мы поможем подобрать идеальное решение!
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-4 items-center justify-center"
          >
            <input
              type="text"
              placeholder="Ваше имя"
              className="w-full md:w-64 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 transition-all"
            />
            <input
              type="tel"
              placeholder="Телефон"
              className="w-full md:w-64 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 transition-all"
            />
            <button className="w-full md:w-auto bg-white text-primary px-10 py-4 rounded-lg font-bold hover:bg-accent hover:text-dark transition-all shadow-lg">
              ОТПРАВИТЬ ЗАЯВКУ
            </button>
          </motion.div>
          
          <p className="mt-6 text-white/60 text-xs">
            Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности
          </p>
        </div>
      </div>
    </section>
  );
}
