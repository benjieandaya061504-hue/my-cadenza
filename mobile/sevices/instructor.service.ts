// services/instructor.service.ts
import api from './api';
import type { InstructorDashboardData } from '../types/instructor.ts';

/**
 * Fetches the instructor dashboard summary: assigned clients,
 * today's schedule, and upcoming lessons.
 *
 * Expected backend endpoint: GET /instructor/dashboard
 */
export async function getInstructorDashboard(): Promise<InstructorDashboardData> {
  const response = await api.get('/instructor/dashboard');
  return response.data;
}

export default {
  getInstructorDashboard,
};