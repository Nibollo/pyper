import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
            <h1 className="text-9xl font-black text-slate-100 absolute select-none pointer-events-none">404</h1>
            <div className="relative z-10">
                <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Página no encontrada</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Lo sentimos, la página que estás buscando no existe o ha sido movida.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-primary text-white font-bold py-4 px-8 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/25 uppercase tracking-widest text-xs"
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
}
