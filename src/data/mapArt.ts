export interface MapArtInfo {
  name: string;
  splash: string;
  location: string;
  accentColor: string;
}

export const MAP_ART: Record<string, MapArtInfo> = {
  Ascent: {
    name: 'Ascent',
    splash: '/maps/ascent.jpg',
    location: 'Veneza, Itália',
    accentColor: '#c084fc',
  },
  Haven: {
    name: 'Haven',
    splash: '/maps/haven.jpg',
    location: 'Thimphu, Butão',
    accentColor: '#f59e0b',
  },
  Bind: {
    name: 'Bind',
    splash: '/maps/bind.jpg',
    location: 'Rabat, Marrocos',
    accentColor: '#fb923c',
  },
  Split: {
    name: 'Split',
    splash: '/maps/split.jpg',
    location: 'Tóquio, Japão',
    accentColor: '#34d399',
  },
  Lotus: {
    name: 'Lotus',
    splash: '/maps/lotus.jpg',
    location: 'Ghats Ocidentais, Índia',
    accentColor: '#f472b6',
  },
  Sunset: {
    name: 'Sunset',
    splash: '/maps/sunset.jpg',
    location: 'Los Angeles, EUA',
    accentColor: '#fb7185',
  },
  Abyss: {
    name: 'Abyss',
    splash: '/maps/abyss.jpg',
    location: 'Jan Mayen, Noruega',
    accentColor: '#38bdf8',
  },
  Pearl: {
    name: 'Pearl',
    splash: '/maps/pearl.jpg',
    location: 'Lisboa, Portugal',
    accentColor: '#22d3ee',
  },
  Icebox: {
    name: 'Icebox',
    splash: '/maps/icebox.jpg',
    location: 'Ilha Bennett, Rússia',
    accentColor: '#60a5fa',
  },
  Breeze: {
    name: 'Breeze',
    splash: '/maps/breeze.jpg',
    location: 'Triângulo das Bermudas',
    accentColor: '#2dd4bf',
  },
  Fracture: {
    name: 'Fracture',
    splash: '/maps/fracture.jpg',
    location: 'Santa Fé, EUA',
    accentColor: '#a3e635',
  },
  Corrode: {
    name: 'Corrode',
    splash: '/maps/corrode.jpg',
    location: 'Monte Saint-Michel, França',
    accentColor: '#a855f7',
  },
};

export function getMapArt(mapName?: string | null): MapArtInfo {
  if (!mapName) return MAP_ART.Ascent;
  return MAP_ART[mapName] || MAP_ART.Ascent;
}
