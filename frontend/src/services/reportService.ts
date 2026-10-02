import api from './api';
import type { Report } from '../types/report';

export const submitReport = (data: { information_entry: number; reason: string; comment: string }) =>
  api.post<Report>('/reports/', data);

export const getReports = () =>
  api.get<Report[]>('/reports/');

export const updateReportStatus = (id: number, status: Report['status']) =>
  api.patch<Report>(`/reports/${id}/`, { status });
