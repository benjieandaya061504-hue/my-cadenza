// types/instructor.ts

export type LessonStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export interface AssignedClient {
  id: string;
  name: string;
  avatarUrl?: string;
  course: string; // enrolled course / instrument
  package: string; // selected lesson package
  totalSessions: number;
  completedSessions: number;
}

export interface ScheduledLesson {
  id: string;
  clientId: string;
  clientName: string;
  course: string;
  date: string; // ISO date, e.g. '2026-06-22'
  startTime: string; // '14:00'
  endTime: string; // '15:00'
  studioRoom: string;
  status: LessonStatus;
}

export interface InstructorDashboardData {
  instructorName: string;
  assignedClients: AssignedClient[];
  todaySchedule: ScheduledLesson[];
  upcomingLessons: ScheduledLesson[];
}