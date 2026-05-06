import { useState } from 'react'
import { motion } from 'framer-motion'

interface FacilityMapProps {
  onSelectZone: (zone: string) => void;
  selectedZone: string | null;
}

export function FacilityMap({ onSelectZone, selectedZone }: FacilityMapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  const zones = [
    { id: 'zone-a', name: 'Court A (Premium)', path: "M 10 50 L 150 20 L 250 80 L 110 110 Z", cx: 130, cy: 65 },
    { id: 'zone-b', name: 'Court B (Standard)', path: "M 160 15 L 300 0 L 400 60 L 260 75 Z", cx: 280, cy: 37 },
    { id: 'zone-c', name: 'VIP Lounge', path: "M 120 120 L 270 85 L 370 145 L 220 180 Z", cx: 245, cy: 132 },
  ]

  return (
    <div className="relative w-full h-64 bg-surface-container-low rounded-[28px] border border-outline-variant/20 overflow-hidden shadow-inner flex flex-col items-center justify-center perspective-[1000px]">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Live Interactive Map
        </h4>
      </div>

      {/* 3D Map Container */}
      <motion.div 
        className="relative w-[400px] h-[200px]"
        initial={{ rotateX: 60, rotateZ: -20, scale: 0.8 }}
        animate={{ rotateX: 60, rotateZ: -20, scale: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <svg viewBox="0 0 420 200" className="w-full h-full overflow-visible drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]">
          {zones.map((zone) => {
            const isSelected = selectedZone === zone.id
            const isHovered = hoveredZone === zone.id
            
            return (
              <g key={zone.id} 
                 onMouseEnter={() => setHoveredZone(zone.id)}
                 onMouseLeave={() => setHoveredZone(null)}
                 onClick={() => onSelectZone(zone.id)}
                 className="cursor-pointer transition-all duration-300">
                
                {/* 3D Extrusion (Shadow/Base) */}
                <path 
                  d={zone.path} 
                  transform="translate(0, 10)"
                  className="fill-surface-container-high stroke-outline-variant/30"
                  strokeWidth="1"
                />
                
                {/* Top Surface */}
                <motion.path 
                  d={zone.path} 
                  animate={{ y: isSelected ? -10 : isHovered ? -5 : 0 }}
                  className={`stroke-[2px] transition-colors duration-300 ${
                    isSelected 
                      ? 'fill-primary/40 stroke-primary' 
                      : isHovered 
                      ? 'fill-surface-container-highest stroke-primary/50' 
                      : 'fill-surface-container stroke-outline-variant/50'
                  }`}
                />
                
                {/* Text Label on Map */}
                <motion.text
                  x={zone.cx}
                  y={zone.cy}
                  animate={{ y: isSelected ? zone.cy - 10 : isHovered ? zone.cy - 5 : zone.cy }}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className={`text-[8px] font-bold font-headline select-none pointer-events-none transition-colors duration-300 ${
                    isSelected || isHovered ? 'fill-white' : 'fill-on-surface-variant'
                  }`}
                  style={{ transform: 'rotateX(-60deg) rotateZ(20deg)', transformOrigin: `${zone.cx}px ${zone.cy}px` }}
                >
                  {zone.name.split(' ')[0]}
                </motion.text>
              </g>
            )
          })}
        </svg>
      </motion.div>

      {/* Floating Info Card */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div>
          {selectedZone ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-high/90 backdrop-blur-md px-4 py-2 rounded-xl border border-primary/30">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-0.5">Selected Area</span>
              <span className="text-sm font-bold text-white">{zones.find(z => z.id === selectedZone)?.name}</span>
            </motion.div>
          ) : (
            <div className="bg-surface-container/80 backdrop-blur-md px-4 py-2 rounded-xl border border-outline-variant/10 text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Select a court on the map
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
