<?php
/**
 * AgroNord — функции темы.
 *
 * @package AgroNord
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'AGRO_THEME_VER', '1.0.0' );

/* ------------------------------------------------------------------ */
/*  Поддержка возможностей WordPress                                   */
/* ------------------------------------------------------------------ */
function agro_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'custom-logo', array(
		'height'      => 80,
		'width'       => 300,
		'flex-height' => true,
		'flex-width'  => true,
	) );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'customize-selective-refresh-widgets' );

	register_nav_menus( array(
		'primary' => 'Главное меню',
		'footer'  => 'Меню в подвале',
	) );

	// Размеры под карточки каталога и галерею товара.
	add_image_size( 'agro-card', 640, 480, true );
	add_image_size( 'agro-hero', 1600, 900, true );
}
add_action( 'after_setup_theme', 'agro_setup' );

/* ------------------------------------------------------------------ */
/*  Стили и скрипты                                                     */
/* ------------------------------------------------------------------ */
function agro_assets() {
	$uri = get_template_directory_uri();
	$dir = get_template_directory();

	wp_enqueue_style(
		'agro-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'agro-main', $uri . '/assets/css/style.css', array( 'agro-fonts' ), filemtime( $dir . '/assets/css/style.css' ) );

	wp_enqueue_script( 'agro-i18n', $uri . '/assets/js/i18n.js', array(), filemtime( $dir . '/assets/js/i18n.js' ), true );
	wp_enqueue_script( 'agro-main', $uri . '/assets/js/main.js', array( 'agro-i18n' ), filemtime( $dir . '/assets/js/main.js' ), true );
	wp_enqueue_script( 'agro-shop', $uri . '/assets/js/shop.js', array( 'agro-i18n', 'agro-main' ), filemtime( $dir . '/assets/js/shop.js' ), true );
}
add_action( 'wp_enqueue_scripts', 'agro_assets' );

/* ------------------------------------------------------------------ */
/*  Хелперы (страхуют тему, если плагин каталога отключён)              */
/* ------------------------------------------------------------------ */
if ( ! function_exists( 'agro_opt' ) ) {
	function agro_opt( $key, $default = '' ) { return $default; }
}

/** Логотип: из настроек темы либо файл в теме. */
function agro_logo_url() {
	$id = (int) get_theme_mod( 'custom_logo' );
	if ( $id ) {
		$src = wp_get_attachment_image_src( $id, 'full' );
		if ( $src ) { return $src[0]; }
	}
	return get_template_directory_uri() . '/assets/logo.svg';
}

/** Ссылка на страницу каталога. */
function agro_catalog_url() {
	$id = (int) get_option( 'agro_page_catalog' );
	return $id ? get_permalink( $id ) : home_url( '/catalog/' );
}

/** Ссылка на страницу «Избранное». */
function agro_fav_url() {
	$id = (int) get_option( 'agro_page_fav' );
	return $id ? get_permalink( $id ) : home_url( '/favorites/' );
}

/* ------------------------------------------------------------------ */
/*  Контент страниц — сырая вёрстка, без автопараграфов                 */
/* ------------------------------------------------------------------ */
function agro_raw_content( $content ) {
	if ( is_singular() && get_post_meta( get_the_ID(), '_agro_raw_html', true ) ) {
		remove_filter( 'the_content', 'wpautop' );
		remove_filter( 'the_content', 'wptexturize' );
	}
	return $content;
}
add_filter( 'the_content', 'agro_raw_content', 1 );

/* ------------------------------------------------------------------ */
/*  Меню: плоский список ссылок, как в исходной вёрстке                 */
/* ------------------------------------------------------------------ */
/**
 * Подбирает ключ словаря для пункта меню.
 *
 * Пункты меню создаёт администратор, поэтому жёстко привязаться к тексту
 * нельзя: ищем по связанной странице, затем по адресу и лишь в последнюю
 * очередь по заголовку. Без ключа ссылка останется на русском — i18n.js
 * переводит только элементы с data-i18n.
 *
 * @param object $item Пункт меню.
 * @return string Ключ словаря или пустая строка.
 */
function agro_nav_i18n_key( $item ) {
	$by_slug = array(
		'catalog'  => 'nav.catalog',
		'about'    => 'nav.about',
		'service'  => 'nav.service',
		'contacts' => 'nav.contacts',
	);

	// 1. По связанной странице — самый надёжный способ.
	if ( ! empty( $item->object_id ) && 'page' === $item->object ) {
		$id = (int) $item->object_id;
		if ( $id === (int) get_option( 'agro_page_catalog' ) ) {
			return 'nav.catalog';
		}
		$slug = get_post_field( 'post_name', $id );
		if ( isset( $by_slug[ $slug ] ) ) {
			return $by_slug[ $slug ];
		}
	}

	// 2. По адресу ссылки — работает и для произвольных пунктов.
	$path = (string) wp_parse_url( (string) $item->url, PHP_URL_PATH );
	foreach ( $by_slug as $slug => $key ) {
		if ( preg_match( '~/' . preg_quote( $slug, '~' ) . '/?$~', $path ) ) {
			return $key;
		}
	}

	// 3. По заголовку — на случай внешних ссылок.
	$by_title = array(
		'каталог'          => 'nav.catalog',
		'каталог техники'  => 'nav.catalog',
		'о нас'            => 'nav.about',
		'о компании'       => 'nav.about',
		'сервис'           => 'nav.service',
		'сервис и запчасти' => 'nav.service',
		'контакты'         => 'nav.contacts',
	);
	$title = function_exists( 'mb_strtolower' )
		? mb_strtolower( trim( (string) $item->title ), 'UTF-8' )
		: strtolower( trim( (string) $item->title ) );

	return isset( $by_title[ $title ] ) ? $by_title[ $title ] : '';
}

class Agro_Nav_Walker extends Walker_Nav_Menu {
	public function start_lvl( &$output, $depth = 0, $args = null ) {}
	public function end_lvl( &$output, $depth = 0, $args = null ) {}
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$cur  = in_array( 'current-menu-item', (array) $item->classes, true ) ? ' class="is-current"' : '';
		$key  = agro_nav_i18n_key( $item );
		$attr = '';
		if ( $key ) {
			// data-i18n-ru хранит заголовок, заданный в админке: при возврате
			// на русский показываем именно его, а не слово из словаря.
			$attr = ' data-i18n="' . esc_attr( $key ) . '" data-i18n-ru="' . esc_attr( $item->title ) . '"';
		}
		$output .= '<a href="' . esc_url( $item->url ) . '"' . $cur . $attr . '>' . esc_html( $item->title ) . '</a>';
	}
	public function end_el( &$output, $item, $depth = 0, $args = null ) {}
}

/** Навигация: меню из админки, иначе — страницы по умолчанию. */
function agro_nav( $location = 'primary' ) {
	if ( has_nav_menu( $location ) ) {
		wp_nav_menu( array(
			'theme_location' => $location,
			'container'      => false,
			'items_wrap'     => '%3$s',
			'depth'          => 1,
			'walker'         => new Agro_Nav_Walker(),
			'fallback_cb'    => false,
		) );
		return;
	}
	$fallback = array(
		'catalog'  => array( agro_catalog_url(), 'Каталог', 'nav.catalog' ),
		'about'    => array( home_url( '/about/' ), 'О нас', 'nav.about' ),
		'service'  => array( home_url( '/service/' ), 'Сервис', 'nav.service' ),
		'contacts' => array( home_url( '/contacts/' ), 'Контакты', 'nav.contacts' ),
	);
	foreach ( $fallback as $slug => $l ) {
		$page = get_page_by_path( $slug );
		$url  = $page ? get_permalink( $page ) : $l[0];
		printf( '<a href="%s" data-i18n="%s">%s</a>', esc_url( $url ), esc_attr( $l[2] ), esc_html( $l[1] ) );
	}
}

/* ------------------------------------------------------------------ */
/*  Мелочи                                                              */
/* ------------------------------------------------------------------ */
// Убираем лишний мусор из <head>.
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );

// Разрешаем загрузку SVG администратору (нужно для логотипа).
function agro_allow_svg( $mimes ) {
	if ( current_user_can( 'manage_options' ) ) { $mimes['svg'] = 'image/svg+xml'; }
	return $mimes;
}
add_filter( 'upload_mimes', 'agro_allow_svg' );

/* ------------------------------------------------------------------ */
/*  SEO-разметка карточки техники                                      */
/* ------------------------------------------------------------------ */
function agro_product_head() {
	if ( ! is_singular( 'agro_product' ) || ! function_exists( 'agro_get_product' ) ) { return; }
	$p = agro_get_product( get_the_ID() );
	if ( ! $p ) { return; }

	$desc = wp_trim_words( $p['desc_ru'], 28 );
	$img  = $p['images'][0] ?? '';
	$avail = in_array( $p['status'], array( 'stock' ), true ) ? 'https://schema.org/InStock'
		: ( 'sold' === $p['status'] ? 'https://schema.org/SoldOut' : 'https://schema.org/PreOrder' );

	echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
	echo '<meta property="og:type" content="product">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( $p['name_ru'] ) . '">' . "\n";
	echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
	if ( $img ) { echo '<meta property="og:image" content="' . esc_url( $img ) . '">' . "\n"; }
	echo '<meta property="og:url" content="' . esc_url( $p['url'] ) . '">' . "\n";

	$ld = array(
		'@context'    => 'https://schema.org',
		'@type'       => 'Product',
		'name'        => $p['name_ru'],
		'description' => $desc,
		'sku'         => $p['serial'],
		'brand'       => array( '@type' => 'Brand', 'name' => $p['brand'] ?: 'AgroNord' ),
		'offers'      => array(
			'@type'         => 'Offer',
			'url'           => $p['url'],
			'priceCurrency' => 'EUR',
			'availability'  => $avail,
		),
	);
	if ( $img )        { $ld['image'] = $img; }
	if ( $p['price'] ) { $ld['offers']['price'] = $p['price']; }

	echo '<script type="application/ld+json">' . wp_json_encode( $ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}
add_action( 'wp_head', 'agro_product_head', 5 );
