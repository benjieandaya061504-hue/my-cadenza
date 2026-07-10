import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Mock interceptor for development when backend is unavailable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unavailable, return mock data
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      const config = error.config;
      
      // Mock instructor dashboard
      if (config?.url === '/instructor/dashboard') {
        return Promise.resolve({
          data: {
            instructorName: 'Mr. Jean Cruz',
            stats: {
              assignedStudents: 3,
              todaySessions: 3,
              pendingProgressNotes: 4,
            },
            assignedClients: [
              { id: '1', name: 'Client 1' },
              { id: '2', name: 'Client 2' },
            ],
            todaySchedule: [
              {
                id: '1',
                studentName: 'Ana Reyes',
                studentLevel: 'Junior Intermediate',
                time: '09:00-10:00',
                location: '',
              },
              {
                id: '2',
                studentName: 'Pia Gomez',
                studentLevel: 'Piano Beginner',
                time: '11:00-12:00',
                location: 'Studio A',
              },
              {
                id: '3',
                studentName: 'Rita Valdez',
                studentLevel: 'Guitar Beginner',
                time: '14:00-15:00',
                location: 'Studio B',
              },
            ],
            upcomingLessons: [
              { id: '1', studentName: 'Lesson 1' },
              { id: '2', studentName: 'Lesson 2' },
            ],
            studentProgress: [
              { id: '1', name: 'Ana Reyes', progress: 50 },
              { id: '2', name: 'Pia Gomez', progress: 75 },
              { id: '3', name: 'Rita Valdez', progress: 30 },
            ],
          },
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
