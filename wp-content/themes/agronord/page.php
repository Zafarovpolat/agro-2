<?php
/**
 * Обычная страница: вёрстка целиком лежит в контенте записи,
 * динамические блоки подставляют шорткоды плагина каталога.
 *
 * @package AgroNord
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main>
<?php
while ( have_posts() ) :
	the_post();
	the_content();
endwhile;
?>
</main>
<?php
get_footer();
