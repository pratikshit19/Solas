import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Solas Emotional OS',
    short_name: 'Solas',
    description: 'Your Private Emotional Operating System',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
