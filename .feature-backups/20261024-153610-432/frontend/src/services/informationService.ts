import api from './api';
import type { InformationEntry } from '../types/information';
import type { Category } from '../types/category';
import type { Destination } from '../types/destination';

export const getInformation = (params?: { search?: string; category?: string; destination?: string }) =>
  api.get<InformationEntry[]>('/information/', { params });

export const getAllInformation = () =>
  api.get<InformationEntry[]>('/information/');

export const getInformationById = (id: number) =>
  api.get<InformationEntry>(`/information/${id}/`);

export const getCategories = () =>
  api.get<Category[]>('/categories/');

export const getDestinations = () =>
  api.get<Destination[]>('/destinations/');
