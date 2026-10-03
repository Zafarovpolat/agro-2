<?php
/**
 * Страница 404.
 *
 * @package AgroNord
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main>
  <section class="page-hero">
    <div class="container">
      <h1 class="fade-up">Страница не найдена</h1>
      <p class="fade-up delay-1">Возможно, позиция уже продана или адрес введён с ошибкой.</p>
    </div>
  </section>
  <section class="section section--soft">
    <div class="container">
      <div class="catalog-empty">
        <p>Попробуйте начать с каталога техники.</p>
        <p><a class="btn btn-primary" href="<?php echo esc_url( agro_catalog_url() ); ?>">В каталог</a></p>
      </div>
    </div>
  </section>
</main>
<?php
get_footer();
