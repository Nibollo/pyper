'use client';

import { useConfig } from '@/context/ConfigContext';
import styles from './servicios.module.css';

export default function ServiciosPage() {
    const { settings } = useConfig();

    const services = [
        {
            title: 'Servicio Técnico',
            description: 'Mantenimiento preventivo y correctivo de notebooks, PCs e impresoras. Instalación de software y limpieza de hardware.',
            image: '/images/services/tech.png'
        },
        {
            title: 'Impresión y Fotocopias',
            description: 'Impresiones en blanco y negro y color en diferentes gramajes. Fotocopias nitidas y de alta calidad.',
            image: '/images/services/printing.png'
        },
        {
            title: 'Encuadernado y Plastificado',
            description: 'Protege tus documentos y trabajos prácticos con nuestros servicios de encuadernación y plastificación.',
            image: '/images/services/binding.png'
        },
        {
            title: 'Sublimación Personalizada',
            description: 'Personalizamos tazas, remeras y útiles escolares con el diseño que prefieras. Ideal para regalos o uniformes.',
            image: '/images/services/sublimation.png'
        },
        {
            title: 'Instalación de Licencias',
            description: 'Venta e instalación de licencias originales de Windows, Office y Antivirus para garantizar tu seguridad.',
            image: '/images/services/licenses.png'
        },
        {
            title: 'Kits Escolares Personalizados',
            description: 'Nos traes tu lista y nosotros armamos el kit completo, ahorrándote tiempo y dinero.',
            image: '/images/services/kits.png'
        }
    ];

    const handleConsult = (serviceTitle: string) => {
        const phone = settings.whatsapp || '5959XXXXXXXX';
        const message = `Hola! Me gustaría consultar sobre el servicio de *${serviceTitle}* que vi en la web.`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className={styles.servicios}>
            <header className={styles.header}>
                <div className="container">
                    <h1>Servicios y Soluciones</h1>
                    <p>Más que productos, soluciones reales para el día a día de estudiantes y padres.</p>
                </div>
            </header>

            <section className="section container">
                <div className={styles.grid}>
                    {services.map((svc, index) => (
                        <div key={index} className={styles.serviceCard}>
                            <div className={styles.imageContainer}>
                                <img src={svc.image} alt={svc.title} className={styles.serviceImage} />
                            </div>
                            <h3>{svc.title}</h3>
                            <p>{svc.description}</p>
                            <button
                                className={styles.contactBtn}
                                onClick={() => handleConsult(svc.title)}
                            >
                                Consultar por WhatsApp
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaBox}>
                        <h2>¿Tienes una solicitud especial?</h2>
                        <p>Escríbenos y encontraremos la mejor solución para ti.</p>
                        <button
                            onClick={() => handleConsult('Solicitud Especial')}
                            className="btn btn-primary"
                        >
                            Hablar con un asesor
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
