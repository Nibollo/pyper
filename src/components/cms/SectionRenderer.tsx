'use client';

import React from 'react';

interface Section {
    id: string;
    type: 'hero' | 'rich-text' | 'grid' | 'cta';
    [key: string]: any;
}

interface SectionRendererProps {
    sections: Section[];
}

// Simple helper to render basic markdown-ish formatting (Bold, Italic, Link)
const renderText = (text: string) => {
    if (!text) return null;

    let processed = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
        .replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: processed }} />;
};

export default function SectionRenderer({ sections }: SectionRendererProps) {
    if (!sections || !Array.isArray(sections)) return null;

    return (
        <div className="flex flex-col">
            {sections.map((section) => (
                <div key={section.id}>
                    {renderSection(section)}
                </div>
            ))}
        </div>
    );
}

function renderSection(section: Section) {
    switch (section.type) {
        case 'hero':
            return (
                <section className={`${section.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-primary text-white'} py-40 px-6 shadow-sm relative overflow-hidden`}>
                    <div className="max-w-5xl mx-auto relative z-10 text-center">
                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">
                            {section.title}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-80 leading-relaxed max-w-3xl mx-auto mb-10 font-medium">
                            {section.subtitle}
                        </p>
                        <div className="w-24 h-2 bg-white/20 mx-auto rounded-full"></div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary-foreground/10 rounded-full blur-[80px]"></div>
                </section>
            );

        case 'rich-text':
            const isImage = section.icon && section.icon.startsWith('http');
            const hasIcon = section.icon && !isImage && section.icon !== 'description';

            return (
                <section className="py-20 px-6 md:py-32">
                    <div className={`max-w-5xl mx-auto ${isImage ? 'grid grid-cols-1 md:grid-cols-2 gap-20 items-center' : 'max-w-3xl'}`}>
                        <div className={`${isImage ? (section.imagePosition === 'right' ? 'order-1' : 'order-2 md:order-1') : 'w-full'}`}>
                            {hasIcon && (
                                <div className="mb-8 w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">{section.icon}</span>
                                </div>
                            )}
                            {section.title && (
                                <h2 className="text-4xl md:text-5xl font-black mb-8 text-slate-900 tracking-tight leading-tight uppercase">
                                    {section.title}
                                </h2>
                            )}
                            <div className="prose prose-slate prose-xl max-w-none text-slate-600 leading-[1.8] font-light italic-serif-support">
                                {renderText(section.body)}
                            </div>
                        </div>

                        {isImage && (
                            <div className={`${section.imagePosition === 'right' ? 'order-2' : 'order-1 md:order-2'} bg-slate-50 rounded-[60px] p-0 aspect-square flex items-center justify-center border border-slate-100 shadow-inner group overflow-hidden relative`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <img src={section.icon} alt={section.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        )}
                    </div>
                </section>
            );

        case 'grid':
            return (
                <section className="bg-slate-50 py-32 px-6 border-y border-slate-100">
                    <div className="max-w-6xl mx-auto">
                        {section.title && (
                            <div className="text-center mb-20">
                                <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase">{section.title}</h2>
                                <div className="w-16 h-1 bg-primary mx-auto mt-6"></div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {section.items?.map((item: any, i: number) => (
                                <div key={i} className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/20 group">
                                    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
                                        <span className="material-symbols-outlined text-primary text-3xl">{item.icon || 'star'}</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-6 text-slate-900 leading-tight">{item.title}</h3>
                                    <div className="text-slate-500 text-base leading-relaxed font-medium">
                                        {renderText(item.description)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case 'cta':
            return (
                <section className="py-32 px-6">
                    <div className={`${section.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-primary text-white'} max-w-6xl mx-auto rounded-[60px] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/20`}>
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">{section.title}</h2>
                            <div className={`${section.theme === 'dark' ? 'text-slate-400' : 'text-white/80'} text-xl mb-12 font-medium`}>
                                {renderText(section.subtitle)}
                            </div>
                            {section.buttonText && (
                                <a
                                    href={section.buttonLink || '#'}
                                    className="bg-white text-slate-900 px-12 py-5 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
                                >
                                    {section.buttonText}
                                    <span className="material-symbols-outlined font-black">arrow_forward</span>
                                </a>
                            )}
                        </div>
                        {/* Decorative background for CTA */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    </div>
                </section>
            );

        default:
            return <div className="p-4 bg-red-50 text-red-500">Unknown section type: {section.type}</div>;
    }
}
