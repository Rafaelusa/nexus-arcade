export function getApiUrl(): string {
  if (typeof window !== 'undefined' && (window as any).NEXUS_API_URL) {
    return (window as any).NEXUS_API_URL;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://nexus-arcade-api.onrender.com';
  }
  return 'http://localhost:3000';
}
