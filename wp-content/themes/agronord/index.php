<?php
/**
 * Запасной шаблон (архивы, блог).
 *
 * @package AgroNord
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main>
  <section class="page-hero">
    <div class="container">
      <h1 class="fade-up"><?php echo esc_html( wp_get_document_title() ); ?></h1>
    </div>
  </section>
  <section class="section section--soft">
    <div class="container">
      <?php if ( have_posts() ) : ?>
        <div class="products-grid">
        <?php while ( have_posts() ) : the_post(); ?>
          <article class="product-card">
            <a class="product-card-hit" href="<?php the_permalink(); ?>" aria-label="<?php the_title_attribute(); ?>"></a>
            <?php if ( has_post_thumbnail() ) : ?>
              <div class="product-card-image"><?php the_post_thumbnail( 'agro-card' ); ?></div>
            <?php endif; ?>
            <h3><?php the_title(); ?></h3>
          </article>
        <?php endwhile; ?>
        </div>
        <?php the_posts_pagination(); ?>
      <?php else : ?>
        <div class="catalog-empty">Записей пока нет.</div>
      <?php endif; ?>
    </div>
  </section>
</main>
<?php
get_footer();
