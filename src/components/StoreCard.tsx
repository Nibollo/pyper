'use client';

interface Store {
    id: string;
    name: string;
    address: string;
    image_url?: string;
    schedule?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
}

interface StoreCardProps {
    store: Store;
    onViewInMap: (id: string) => void;
    isSelected?: boolean;
}

export default function StoreCard({ store, onViewInMap, isSelected }: StoreCardProps) {
    const whatsappNumber = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';

    return (
        <div 
            className={`group bg-white dark:bg-slate-900/50 p-5 rounded-3xl border w-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 ${isSelected ? 'border-primary ring-2 ring-primary/10' : 'border-slate-100 dark:border-slate-800'}`}
        >
            <div className="flex gap-6 items-start">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                    {store.image_url ? (
                        <img 
                            src={store.image_url} 
                            alt={store.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">store</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg line-clamp-1">{store.name}</h4>
                        <button 
                            onClick={() => onViewInMap(store.id)}
                            className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            VER EN MAPA
                        </button>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">{store.address}</p>

                    <div className="space-y-1.5 mb-4">
                        {store.schedule && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="material-symbols-outlined text-sm opacity-50">schedule</span>
                                <span>{store.schedule}</span>
                            </div>
                        )}
                        {store.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="material-symbols-outlined text-sm opacity-50">call</span>
                                <span>{store.phone}</span>
                            </div>
                        )}
                        {store.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="material-symbols-outlined text-sm opacity-50">mail</span>
                                <span className="truncate">{store.email}</span>
                            </div>
                        )}
                    </div>

                    {store.whatsapp && (
                        <a 
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-green-500/20 active:scale-95 group/wa"
                        >
                            <span className="material-symbols-outlined text-base">chat</span>
                            WHATSAPP DIRECTO
                            <span className="material-symbols-outlined text-sm transition-transform group-hover/wa:translate-x-1">arrow_forward</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
