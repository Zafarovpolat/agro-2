<?php
/**
 * Шапка сайта.
 *
 * @package AgroNord
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$agro_phone     = agro_opt( 'phone', '+373 60 123 456' );
$agro_phone_raw = agro_opt( 'phone_raw', '+37360123456' );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="<?php echo esc_url( agro_logo_url() ); ?>" type="image/svg+xml">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

  <!-- ===== Header ===== -->
  <header class="header<?php echo is_front_page() ? '' : ' scrolled'; ?>" id="header">
    <div class="container header-inner">
      <div class="header-left">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="header-logo">
          <img src="<?php echo esc_url( agro_logo_url() ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" />
        </a>
        <nav class="header-nav">
          <?php agro_nav( 'primary' ); ?>
        </nav>
      </div>
      <div class="header-actions">
        <a href="tel:<?php echo esc_attr( $agro_phone_raw ); ?>" class="header-phone">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <?php echo esc_html( $agro_phone ); ?>
        </a>
        <a href="<?php echo esc_url( agro_fav_url() ); ?>" class="header-fav" aria-label="Избранное">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span class="header-fav-badge is-empty" data-fav-count>0</span>
        </a>
        <div class="lang-switch">
          <button class="lang-btn active" data-lang="ru">RU</button>
          <button class="lang-btn" data-lang="ro">RO</button>
        </div>
        <button class="menu-toggle" aria-label="Меню">
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
    <!-- Mobile menu -->
    <div class="mobile-menu">
      <?php agro_nav( 'primary' ); ?>
      <a class="mobile-menu-fav" aria-label="Избранное" title="Избранное" href="<?php echo esc_url( agro_fav_url() ); ?>">
        <span class="mobile-fav-label" data-i18n="fav.title">Избранное</span>
        <span class="mobile-fav-count is-empty" data-fav-count>0</span>
      </a>
      <div class="mobile-menu-footer">
        <a href="tel:<?php echo esc_attr( $agro_phone_raw ); ?>" class="mobile-menu-phone">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <?php echo esc_html( $agro_phone ); ?>
        </a>
      </div>
    </div>
  </header>
