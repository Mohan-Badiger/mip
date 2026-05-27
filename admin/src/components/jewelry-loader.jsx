import React from 'react';

/**
 * Premium, modern, and creative jewelry-themed loading animation.
 * Features an SVG-faceted diamond with shimmering facets, floating animation,
 * and twinkling sparkles.
 */
export default function JewelryLoader({ size = "lg", label = "Loading Exquisite Craftsmanship..." }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28"
  };

  return (
    <div className="flex flex-col items-center justify-center font-primary text-center py-6 select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer-facet {
          0%, 100% { fill-opacity: 0.1; }
          50% { fill-opacity: 0.7; }
        }
        @keyframes float-jewel {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes twinkle-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(90deg); }
        }
        @keyframes text-fade {
          0%, 100% { opacity: 0.6; letter-spacing: 0.2em; }
          50% { opacity: 1; letter-spacing: 0.26em; }
        }
        
        .facet-1 { animation: shimmer-facet 2.4s infinite ease-in-out; }
        .facet-2 { animation: shimmer-facet 2.1s infinite ease-in-out 0.3s; }
        .facet-3 { animation: shimmer-facet 2.7s infinite ease-in-out 0.6s; }
        .facet-4 { animation: shimmer-facet 2.2s infinite ease-in-out 0.9s; }
        .facet-5 { animation: shimmer-facet 2.5s infinite ease-in-out 1.2s; }
        .facet-6 { animation: shimmer-facet 2.3s infinite ease-in-out 1.5s; }
        .facet-7 { animation: shimmer-facet 2.6s infinite ease-in-out 1.8s; }
        .facet-8 { animation: shimmer-facet 2s infinite ease-in-out 2.1s; }
        
        .sparkle-1 { animation: twinkle-sparkle 2s infinite ease-in-out; }
        .sparkle-2 { animation: twinkle-sparkle 2.5s infinite ease-in-out 0.7s; }
        .sparkle-3 { animation: twinkle-sparkle 2.2s infinite ease-in-out 1.4s; }
      `}} />
      
      <div className="relative" style={{ animation: 'float-jewel 4s infinite ease-in-out' }}>
        {/* Sparkle Stars */}
        <svg className="absolute -top-3 -right-3 w-4 h-4 text-brand-gold fill-current sparkle-1" viewBox="0 0 24 24">
          <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
        </svg>
        <svg className="absolute -bottom-2 -left-3 w-3 h-3 text-brand-gold fill-current sparkle-2" viewBox="0 0 24 24">
          <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
        </svg>
        <svg className="absolute top-6 -left-5 w-3.5 h-3.5 text-brand-gold fill-current sparkle-3" viewBox="0 0 24 24">
          <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
        </svg>

        {/* Central Diamond SVG */}
        <svg 
          className={`${sizeClasses[size] || sizeClasses.lg} text-brand-gold fill-none stroke-[1.2] stroke-current`}
          viewBox="0 0 100 100"
          style={{ filter: 'drop-shadow(0 0 8px rgba(179, 146, 84, 0.25))' }}
        >
          {/* Facets with individual classes */}
          {/* Table (Top Center) */}
          <polygon points="30,22 70,22 65,40 35,40" fill="currentColor" className="facet-1" />
          
          {/* Crown Left */}
          <polygon points="30,22 35,40 15,40" fill="currentColor" className="facet-2" />
          
          {/* Crown Right */}
          <polygon points="70,22 65,40 85,40" fill="currentColor" className="facet-3" />
          
          {/* Bottom Left */}
          <polygon points="15,40 35,40 50,83" fill="currentColor" className="facet-4" />
          
          {/* Bottom Center-Left */}
          <polygon points="35,40 50,45 50,83" fill="currentColor" className="facet-5" />
          
          {/* Bottom Center-Right */}
          <polygon points="50,45 65,40 50,83" fill="currentColor" className="facet-6" />
          
          {/* Bottom Right */}
          <polygon points="65,40 85,40 50,83" fill="currentColor" className="facet-7" />
          
          {/* Center Star Facet */}
          <polygon points="35,40 65,40 50,45" fill="currentColor" className="facet-8" />
        </svg>
      </div>

      {label && (
        <div className="mt-4 flex flex-col gap-1 items-center">
          <span className="text-[11px] font-bold text-brand-brown tracking-[0.25em] uppercase" style={{ animation: 'text-fade 2s infinite ease-in-out' }}>
            MIP
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
