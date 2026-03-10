'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import styles from './SmartSearch.module.css';
import Link from 'next/link';

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Todos');
    const [results, setResults] = useState<Product[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                setIsDropdownOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                let dbQuery = supabase
                    .from('products')
                    .select('*')
                    .ilike('name', `%${query}%`)
                    .eq('active', true)
                    .limit(5);

                if (category !== 'Todos') {
                    dbQuery = dbQuery.ilike('category', `%${category}%`);
                }

                const { data, error } = await dbQuery;

                if (data) {
                    setResults(data);
                    setIsDropdownOpen(true);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query, category]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            router.push(`/buscar?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}`);
            setIsDropdownOpen(false);
        }
    };

    return (
        <div className={styles.searchContainer} ref={dropdownRef}>
            <form className={styles.searchBox} onSubmit={handleSearch}>
                <select
                    className={styles.categorySelect}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Seleccionar categoría"
                >
                    <option value="Todos">Todas las categorías</option>
                    <option value="Libreria">Librería</option>
                    <option value="Tecnologia">Tecnología</option>
                    <option value="Kits">Kits Escolares</option>
                </select>

                <div className={styles.inputWrapper}>
                    <span className="material-symbols-outlined text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código o categoría..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim().length >= 2 && setIsDropdownOpen(true)}
                    />
                    {isLoading && (
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    )}
                </div>

                <button type="submit" className={styles.searchButton}>
                    <span>Buscar</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </form>

            {isDropdownOpen && results.length > 0 && (
                <div className={styles.resultsDropdown}>
                    {results.map((product) => (
                        <Link
                            key={product.id}
                            href={`/productos/${product.slug}`}
                            className={styles.resultItem}
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <div className={styles.resultImage}>
                                {(product.main_image || product.image_url) ? (
                                    <img src={product.main_image || product.image_url} alt={product.name} />
                                ) : (
                                    <span className="material-symbols-outlined text-slate-300">image</span>
                                )}
                            </div>
                            <div className={styles.resultInfo}>
                                <h4>{product.name}</h4>
                                <p>Gs. {product.price.toLocaleString('es-PY')}</p>
                            </div>
                        </Link>
                    ))}
                    <Link
                        href={`/buscar?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}`}
                        className={styles.viewAll}
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        Ver todos los resultados ({results.length}+)
                    </Link>
                </div>
            )}

            {isDropdownOpen && query.trim().length >= 2 && results.length === 0 && !isLoading && (
                <div className={styles.resultsDropdown}>
                    <div className="p-8 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-20">search_off</span>
                        <p className="font-bold">No encontramos resultados</p>
                        <p className="text-sm">Intenta con otros términos o categorías</p>
                    </div>
                </div>
            )}
        </div>
    );
}
