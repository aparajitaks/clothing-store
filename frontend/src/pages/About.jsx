import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './About.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <motion.div
          className="about-hero__content container"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="about-eyebrow">Our Heritage</p>
          <h1 className="about-title">Woven with Purpose,<br />Crafted for Daily Elegance</h1>
          <p className="about-hero__sub">
            TEYA COLLECTIONS is dedicated to the art of the Indian kurta. We honor centuries-old
            handloom and embroidery traditions, refined for the modern woman's everyday grace and celebration.
          </p>
        </motion.div>
      </section>

      {/* Image + Story Block */}
      <section className="about-story container">
        <motion.div
          className="about-story__image-wrap"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900"
            alt="TEYA COLLECTIONS master artisan embroidery"
            className="about-story__image"
          />
        </motion.div>
        <motion.div
          className="about-story__text"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="about-section-label">Our Story</p>
          <h2 className="about-section-title">The Art of the Kurta</h2>
          <p>
            Founded with deep reverence for Indian textiles, TEYA COLLECTIONS was born
            from a singular belief: the kurta is the most versatile, graceful, and timeless garment in the Indian wardrobe.
          </p>
          <p>
            We partner with master artisans across Chanderi, Lucknow, Jaipur, and Bengal — uniting
            delicate hand-embroidery, authentic block prints, and pure handspun cottons and linens
            into silhouettes designed for today.
          </p>
          <p>
            Each kurta carries its own provenance: the weave, the artisan touch, and the natural fibers that breathe
            with you. We believe mindful craftsmanship is true luxury.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="container about-values__inner">
          <motion.div
            className="about-values__header"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="about-section-label">Our Commitments</p>
            <h2 className="about-section-title" style={{ textAlign: 'center' }}>What We Stand For</h2>
          </motion.div>
          <div className="about-values__grid">
            {[
              {
                title: 'Artisan First',
                text: 'Every purchase directly supports the weaver and craftsperson behind the piece. We ensure fair wages and dignified working conditions throughout our supply chain.',
              },
              {
                title: 'Authentic Provenance',
                text: 'We source exclusively from certified GI-tagged regions and verified traditional craft clusters across India. No fast-fashion reproductions.',
              },
              {
                title: 'Sustainable Craft',
                text: 'Natural fibers, vegetable dyes, and zero-waste cutting practices are standard in our production process, not afterthoughts.',
              },
              {
                title: 'Heirloom Quality',
                text: 'Our garments are created to be worn, preserved, and eventually passed on — not discarded after a season. This is clothing as cultural inheritance.',
              },
            ].map((val, i) => (
              <motion.div
                key={val.title}
                className="about-value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="about-value-card__num">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="about-value-card__title">{val.title}</h3>
                <p className="about-value-card__text">{val.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="about-cta__title">Experience the Collection</h2>
          <p className="about-cta__sub">
            Every stitch tells a story. Discover yours.
          </p>
          <Link to="/shop" className="btn-primary about-cta__btn">Explore Kurtas</Link>
        </motion.div>
      </section>
    </div>
  );
}
