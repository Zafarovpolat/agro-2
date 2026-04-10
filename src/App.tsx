/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import Hero from './components/Hero';
import QuickNav from './components/QuickNav';
import FeaturedProducts from './components/FeaturedProducts';
import CatalogPreview from './components/CatalogPreview';
import Stats from './components/Stats';
import Advantages from './components/Advantages';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <QuickNav />
        <FeaturedProducts />
        <CatalogPreview />
        <Stats />
        <Advantages />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
