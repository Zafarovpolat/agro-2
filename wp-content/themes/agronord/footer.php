<?php
/**
 * Подвал сайта.
 *
 * @package AgroNord
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$agro_phone     = agro_opt( 'phone', '+373 60 123 456' );
$agro_phone_raw = agro_opt( 'phone_raw', '+37360123456' );
$agro_email     = agro_opt( 'email', 'info@agronord.md' );
$agro_address   = agro_opt( 'address', 'г. Бельцы, ул. Индустриальная, 15' );
$agro_cat_url   = agro_catalog_url();

$agro_socials = array(
	'facebook'  => array( agro_opt( 'facebook' ),  'Facebook',  '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>' ),
	'instagram' => array( agro_opt( 'instagram' ), 'Instagram', '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>' ),
	'twitter'   => array( agro_opt( 'twitter' ),   'Twitter',   '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>' ),
	'youtube'   => array( agro_opt( 'youtube' ),   'YouTube',   '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>' ),
);
?>
  <!-- ===== Footer ===== -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="footer-brand"><img src="<?php echo esc_url( agro_logo_url() ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" /></a>
          <p class="footer-desc" data-i18n="footer.desc"><?php echo esc_html( agro_opt( 'footer_desc', 'Ваш надёжный партнёр в мире сельскохозяйственной техники. Мы предлагаем только лучшие решения для вашего бизнеса.' ) ); ?></p>
          <div class="footer-socials">
            <?php foreach ( $agro_socials as $key => $s ) : ?>
              <a href="<?php echo esc_url( $s[0] ? $s[0] : '#' ); ?>" aria-label="<?php echo esc_attr( $s[1] ); ?>"<?php echo $s[0] ? ' target="_blank" rel="noopener"' : ''; ?>>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><?php echo $s[2]; // phpcs:ignore WordPress.Security.EscapeOutput ?></svg>
              </a>
            <?php endforeach; ?>
          </div>
        </div>
        <div>
          <h4 data-i18n="footer.nav">Навигация</h4>
          <ul class="footer-links">
            <li><a href="<?php echo esc_url( $agro_cat_url ); ?>" data-i18n="footer.nav.catalog">Каталог техники</a></li>
            <?php foreach ( array( 'about' => array( 'О компании', 'footer.nav.about' ), 'service' => array( 'Сервис и запчасти', 'footer.nav.service' ), 'contacts' => array( 'Контакты', 'nav.contacts' ) ) as $slug => $l ) :
              $p = get_page_by_path( $slug );
              if ( ! $p ) { continue; } ?>
              <li><a href="<?php echo esc_url( get_permalink( $p ) ); ?>" data-i18n="<?php echo esc_attr( $l[1] ); ?>"><?php echo esc_html( $l[0] ); ?></a></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <div>
          <h4 data-i18n="footer.categories">Категории</h4>
          <ul class="footer-links">
            <?php
            $agro_cats = array(
              'tractors' => array( 'Тракторы', 'footer.cat.tractors' ),
              'combines' => array( 'Комбайны', 'footer.cat.combines' ),
              'plows'    => array( 'Почвообработка', 'footer.cat.soil' ),
              'seeders'  => array( 'Посев и посадка', 'footer.cat.seeding' ),
              'parts'    => array( 'Запчасти', 'footer.cat.parts' ),
            );
            foreach ( $agro_cats as $slug => $l ) : ?>
              <li><a href="<?php echo esc_url( add_query_arg( 'cat', $slug, $agro_cat_url ) ); ?>" data-i18n="<?php echo esc_attr( $l[1] ); ?>"><?php echo esc_html( $l[0] ); ?></a></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <div>
          <h4 data-i18n="footer.contacts">Контакты</h4>
          <ul class="footer-contact">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              <span data-ro="<?php echo esc_attr( agro_opt( 'address_ro', 'mun. Bălți, str. Industrială, 15' ) ); ?>"><?php echo esc_html( $agro_address ); ?></span>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:<?php echo esc_attr( $agro_phone_raw ); ?>"><?php echo esc_html( $agro_phone ); ?></a>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <a href="mailto:<?php echo esc_attr( $agro_email ); ?>"><?php echo esc_html( $agro_email ); ?></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p data-i18n="footer.copy">&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?>. Все права защищены.</p>
        <div class="footer-bottom-links">
          <?php
          $agro_privacy = get_privacy_policy_url();
          if ( $agro_privacy ) : ?>
            <a href="<?php echo esc_url( $agro_privacy ); ?>" data-i18n="footer.privacy">Политика конфиденциальности</a>
          <?php endif; ?>
          <?php if ( has_nav_menu( 'footer' ) ) { agro_nav( 'footer' ); } ?>
        </div>
      </div>
    </div>
  </footer>

<?php wp_footer(); ?>
</body>
</html>
