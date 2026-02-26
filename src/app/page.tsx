'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useConfig } from '@/context/ConfigContext';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const { heroSlides, homeSections, featureFlags, settings, loading: configLoading } = useConfig();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      // Fetch featured kits
      const { data: featured } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured_home', true)
        .eq('active', true)
        .limit(3);

      if (featured) setFeaturedProducts(featured);

      // Fetch latest products
      const { data: latest } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .not('category', 'ilike', '%kit%')
        .order('created_at', { ascending: false })
        .limit(3);

      if (latest) setLatestProducts(latest);

      // Fetch latest blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select('*')
        .eq('active', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (blogs) setLatestBlogs(blogs);

      setProductsLoading(false);
    };
    fetchHomeData();
  }, []);

  // Fallback Hero
  const mainSlide = heroSlides[0] || {
    title: 'Todo para tu educación en un solo lugar',
    subtitle: 'Potenciamos tu aprendizaje con la mejor tecnología y útiles escolares premium. Desde kits personalizados hasta soporte técnico avanzado.',
    badge_text: 'NUEVA TEMPORADA ESCOLAR 2024',
    trust_text: '+5,000 estudiantes confían en nosotros',
    button_1_text: 'Ver Catálogo Completo',
    button_1_link: '/productos',
    button_2_text: 'Kits Escolares',
    button_2_link: '/kits'
  };

  const soluciones = homeSections.filter(s => s.category === 'soluciones');
  const categories = homeSections.filter(s => s.category === 'categories');
  const stats = homeSections.filter(s => s.category === 'stats');
  const extras = homeSections.filter(s => s.category === 'extras');

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      {featureFlags.hero_slider !== false && (
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-white">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full hero-gradient organic-shape opacity-10 translate-x-1/4 -translate-y-1/4"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {mainSlide.badge_text && (
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    {mainSlide.badge_text}
                  </div>
                )}
                <h1 className="text-5xl lg:text-7xl font-black leading-tight text-slate-900">
                  {mainSlide.title.split('educación').length > 1 ? (
                    <>
                      {mainSlide.title.split('educación')[0]}
                      <span className="text-primary italic">educación</span>
                      {mainSlide.title.split('educación')[1]}
                    </>
                  ) : (
                    mainSlide.title
                  )}
                </h1>
                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                  {mainSlide.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  {mainSlide.button_1_text && (
                    <Link
                      href={mainSlide.button_1_link || '#'}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 transition-all flex items-center gap-2"
                    >
                      {mainSlide.button_1_text}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  )}
                  {mainSlide.button_2_text && (
                    <Link
                      href={mainSlide.button_2_link || '#'}
                      className="bg-white border-2 border-slate-200 hover:border-primary px-8 py-4 rounded-xl font-bold text-lg transition-all"
                    >
                      {mainSlide.button_2_text}
                    </Link>
                  )}
                </div>
                {mainSlide.trust_text && (
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-xs font-bold ring-2 ring-primary/5">P1</div>
                      <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-300 flex items-center justify-center text-xs font-bold ring-2 ring-primary/5">P2</div>
                      <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-400 flex items-center justify-center text-xs font-bold ring-2 ring-primary/5">P3</div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 underline decoration-primary/30">{mainSlide.trust_text}</p>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-white group">
                  <div className="aspect-video w-full flex items-center justify-center bg-slate-50 text-primary transition-transform duration-700 group-hover:scale-105">
                    {mainSlide.image_url ? (
                      <img src={mainSlide.image_url} alt={mainSlide.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[10rem] opacity-20">school</span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100 z-20">
                  <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Garantía</p>
                    <p className="text-sm font-black">100% Calidad Pyper</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {featureFlags.home_solutions !== false && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter">Explora por Categorías</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.length > 0 ? (
                categories.map((section) => {
                  return (
                    <Link
                      key={section.id}
                      href={section.link || '#'}
                      className="group relative overflow-hidden rounded-[2.5rem] h-[320px] p-8 flex flex-col justify-between card-hover shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      style={{ backgroundColor: section.bg_color || '#2563eb' }}
                    >
                      <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-3xl">{section.icon || 'star'}</span>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-white text-4xl font-black mb-2 tracking-tight">{section.title}</h3>
                        <p className="text-white/90 font-medium text-lg leading-tight opacity-90">{section.description}</p>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link href="/libreria" className="group relative overflow-hidden rounded-[2.5rem] bg-amber-500 h-[320px] p-8 flex flex-col justify-between card-hover transition-all duration-300 cursor-pointer">
                    <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl">edit_note</span>
                    </div>
                    <div>
                      <h3 className="text-white text-4xl font-black mb-2">Librería</h3>
                      <p className="text-white/80 font-medium">Desde lápices hasta arte profesional.</p>
                    </div>
                  </Link>
                  <Link href="/tecnologia" className="group relative overflow-hidden rounded-[2.5rem] bg-blue-600 h-[320px] p-8 flex flex-col justify-between card-hover transition-all duration-300 cursor-pointer">
                    <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl">laptop_mac</span>
                    </div>
                    <div>
                      <h3 className="text-white text-4xl font-black mb-2">Tecnología</h3>
                      <p className="text-white/80 font-medium">Equipos de alto rendimiento escolar.</p>
                    </div>
                  </Link>
                  <Link href="/kits" className="group relative overflow-hidden rounded-[2.5rem] bg-rose-500 h-[320px] p-8 flex flex-col justify-between card-hover transition-all duration-300 cursor-pointer">
                    <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl">backpack</span>
                    </div>
                    <div>
                      <h3 className="text-white text-4xl font-black mb-2">Kits Escolares</h3>
                      <p className="text-white/80 font-medium">Personalizados según tu grado.</p>
                    </div>
                  </Link>
                  <Link href="/servicios" className="group relative overflow-hidden rounded-[2.5rem] bg-emerald-600 h-[320px] p-8 flex flex-col justify-between card-hover transition-all duration-300 cursor-pointer">
                    <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl">support_agent</span>
                    </div>
                    <div>
                      <h3 className="text-white text-4xl font-black mb-2">Servicios</h3>
                      <p className="text-white/80 font-medium">Impresiones, soporte y más.</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Kits Block */}
      <section className="py-20 hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <span className="text-white/80 font-bold uppercase tracking-widest text-sm mb-2 block">
                {settings.featured_kits_subtitle || 'SELECCIÓN ESPECIAL'}
              </span>
              <h2 className="text-5xl font-black tracking-tight leading-none uppercase italic">
                {settings.featured_kits_title?.split(' ').length > 2 ? (
                  <>
                    {settings.featured_kits_title.split(' ').slice(0, 2).join(' ')} <br />
                    <span className="text-amber-400">{settings.featured_kits_title.split(' ').slice(2).join(' ')}</span>
                  </>
                ) : (
                  settings.featured_kits_title || 'KITS ESCOLARES DESTACADOS'
                )}
              </h2>
            </div>
            <Link href={settings.featured_kits_button_link || '/kits'} className="bg-white text-primary px-8 py-3 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-slate-100 transition-colors">
              {settings.featured_kits_button_text || 'Ver todos los kits'}
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <div key={product.id} className={`bg-white rounded-[2.5rem] p-4 text-slate-900 shadow-2xl transform transition-all hover:scale-105 ${idx === 0 ? 'hover:-rotate-2' : idx === 1 ? 'hover:rotate-1' : 'hover:rotate-2'}`}>
                  <div className="relative bg-slate-100 rounded-[2rem] overflow-hidden mb-6 aspect-square group flex items-center justify-center">
                    {(product.main_image || product.image_url) ? (
                      <img src={product.main_image || product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="material-symbols-outlined text-8xl text-primary/20">package_2</span>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <h4 className="text-xl font-black mb-1">{product.name}</h4>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-primary">Gs. {product.price.toLocaleString('es-PY')}</span>
                      <button
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.main_image || product.image_url || '',
                          category: product.category || 'Destacado'
                        })}
                        className="bg-primary p-3 rounded-full text-white hover:rotate-12 transition-transform shadow-lg shadow-primary/30"
                      >
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/60 font-bold italic col-span-3 text-center py-20 bg-black/5 rounded-3xl border-4 border-dashed border-white/10 uppercase tracking-widest">
                Gestiona tus kits destacados desde el panel de administración
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -z-10 bg-primary/20 w-full h-full rounded-full blur-3xl scale-125"></div>
              <div className="w-full aspect-square md:aspect-auto md:h-[500px] rounded-[3rem] shadow-2xl border-b-8 border-primary bg-white flex items-center justify-center overflow-hidden">
                {settings.services_image ? (
                  <img src={settings.services_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[12rem] text-primary/10">engineering</span>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-slate-900">
                {settings.services_title?.toLowerCase().includes('librería') ? (
                  <>
                    {settings.services_title.split(/librería/i)[0]}
                    <span className="text-primary italic">{settings.services_title.match(/librería/i)?.[0] || 'Librería'}</span>
                    {settings.services_title.split(/librería/i)[1]}
                  </>
                ) : (
                  settings.services_title || 'Mucho más que una Librería'
                )}
              </h2>
              <p className="text-lg text-slate-600">{settings.services_subtitle || 'Ofrecemos soluciones integrales para que solo te preocupes por aprender.'}</p>
              <div className="grid gap-6">
                {extras.length > 0 ? (
                  extras.map(section => (
                    <div key={section.id} className="flex gap-4 items-start p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <span className="material-symbols-outlined text-3xl">{section.icon || 'star'}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xl mb-1">{section.title}</h4>
                        <p className="text-sm text-slate-500">{section.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No hay servicios adicionales configurados.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block">CATÁLOGO ACTUALIZADO</span>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                Nuevos <span className="text-primary">Ingresos</span>
              </h2>
            </div>
            <Link href="/productos" className="border-2 border-slate-200 text-slate-900 px-8 py-3 rounded-xl font-black uppercase text-sm tracking-widest hover:border-primary hover:text-primary transition-all">
              Explorar Catálogo
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <Link href={`/productos/${product.slug}`} key={product.id} className="group bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2">
                  <div className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden mb-6 flex items-center justify-center">
                    {(product.main_image || product.image_url) ? (
                      <img src={product.main_image || product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <span className="material-symbols-outlined text-[100px] text-slate-100 italic">shopping_bag</span>
                    )}
                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      NUEVO
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 block">{product.category}</span>
                    <h4 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{product.name}</h4>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-3xl font-black text-slate-900">Gs. {product.price.toLocaleString('es-PY')}</span>
                      <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <p className="text-slate-400 font-bold italic uppercase tracking-widest">Cargando productos exclusivos...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block">CONTENIDO EDUCATIVO</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none italic mb-4">
              Blog <span className="text-primary italic">&</span> Novedades
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <Link href={`/blog/${blog.slug}`} key={blog.id} className="group bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10">
                <div className="aspect-[16/10] bg-slate-800 relative overflow-hidden">
                  {blog.cover_image ? (
                    <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 group-hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-[80px] text-slate-800 transition-all font-light">newspaper</span>
                    </div>
                  )}
                  <div className="absolute top-5 left-5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {blog.title}
                  </h3>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(blog.published_at).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })}
                    </span>
                    <div className="flex items-center gap-1 text-primary font-black text-xs uppercase group-hover:gap-2 transition-all">
                      Leer más <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all">
              Ver todo el blog
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-y-2 border-slate-100 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.length > 0 ? (
              stats.map(item => (
                <div key={item.id}>
                  <p className="text-5xl font-black text-primary mb-2">{item.title}</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{item.description}</p>
                </div>
              ))
            ) : (
              <>
                <div>
                  <p className="text-5xl font-black text-primary mb-2">15k+</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Clientes Felices</p>
                </div>
                <div>
                  <p className="text-5xl font-black text-slate-900 mb-2">120</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Colegios Aliados</p>
                </div>
                <div>
                  <p className="text-5xl font-black text-primary mb-2">24h</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Delivery Express</p>
                </div>
                <div>
                  <p className="text-5xl font-black text-slate-900 mb-2">100%</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Garantía Real</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
