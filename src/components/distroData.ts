export interface Distro {
  id: string;
  name: string;
  descriptionEs: string;
  descriptionEn: string;
  minRam: number; // en GB
  minCpuCores: number;
  minStorage: number; // en GB
  useCase: 'general' | 'gaming' | 'developer' | 'privacy' | 'server';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const distros: Distro[] = [
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    descriptionEs: 'La distribución más popular y recomendada para todo tipo de usuarios.',
    descriptionEn: 'The most popular distribution, highly recommended for all users.',
    minRam: 2,
    minCpuCores: 2,
    minStorage: 25,
    useCase: 'general',
    difficulty: 'beginner'
  },
  {
    id: 'linux-mint',
    name: 'Linux Mint',
    descriptionEs: 'Interfaz clásica, familiar y extremadamente ligera, perfecta para migrar desde Windows.',
    descriptionEn: 'Classic layout, familiar and very lightweight, perfect for Windows migrants.',
    minRam: 2,
    minCpuCores: 1,
    minStorage: 20,
    useCase: 'general',
    difficulty: 'beginner'
  },
  {
    id: 'pop-os',
    name: 'Pop!_OS',
    descriptionEs: 'Excelente soporte para tarjetas gráficas híbridas y optimizada para gaming y desarrollo.',
    descriptionEn: 'Great support for hybrid graphics cards, optimized for gaming and development.',
    minRam: 4,
    minCpuCores: 2,
    minStorage: 20,
    useCase: 'gaming',
    difficulty: 'beginner'
  },
  {
    id: 'arch-linux',
    name: 'Arch Linux',
    descriptionEs: 'Distribución "Rolling Release" minimalista para usuarios que desean control absoluto.',
    descriptionEn: 'Minimalist Rolling Release distribution for users wanting absolute control.',
    minRam: 1,
    minCpuCores: 1,
    minStorage: 10,
    useCase: 'developer',
    difficulty: 'advanced'
  },
  {
    id: 'debian',
    name: 'Debian',
    descriptionEs: 'Roca sólida y súper estable. La base del ecosistema Linux, ideal para servidores.',
    descriptionEn: 'Rock solid and ultra stable. The bedrock of Linux, ideal for servers.',
    minRam: 1,
    minCpuCores: 1,
    minStorage: 10,
    useCase: 'server',
    difficulty: 'intermediate'
  }
];
