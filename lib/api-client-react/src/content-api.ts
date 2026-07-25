/**
 * Hand-crafted API client for site content management.
 * Covers: royal_standard, journey_steps, event_cta, products_hero,
 *         and timeslot create/delete.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface QualityCard {
  image: string;
  title: string;
  desc: string;
  detail: string;
}

export interface JourneyStep {
  image: string;
  title: string;
  desc: string;
  detail: string;
}

export interface EventCta {
  phone: string;
  backgroundImage: string;
}

export interface ProductsHero {
  backgroundImage: string;
}

export interface TimeslotInput {
  label: string;
  startHour: number;
  endHour: number;
  isActive: boolean;
  maxOrders: number;
}

// ─── Content fetch helpers ────────────────────────────────────────────────────

async function fetchContent<T>(key: string): Promise<T> {
  const res = await fetch(`/api/content/${key}`);
  if (!res.ok) throw new Error(`Failed to fetch content: ${key}`);
  const data = await res.json();
  return data.value as T;
}

async function putContent(key: string, value: unknown, token: string): Promise<void> {
  const res = await fetch(`/api/content/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Update failed");
  }
}

// ─── useGetContent ────────────────────────────────────────────────────────────

export function useGetContent<T>(key: string) {
  return useQuery<T>({
    queryKey: [`/api/content/${key}`],
    queryFn: () => fetchContent<T>(key),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

// ─── useUpdateContent ─────────────────────────────────────────────────────────

export function useUpdateContent<T>(key: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { value: T; token: string }>({
    mutationFn: ({ value, token }) => putContent(key, value, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/content/${key}`] });
    },
  });
}

// ─── uploadContentImage ───────────────────────────────────────────────────────

/** Upload an image for a content key + card index. Returns the new image URL. */
export async function uploadContentImage(
  key: string,
  index: number,
  file: File,
  token: string,
): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`/api/upload/content/${key}/${index}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Image upload failed");
  }
  const data = await res.json();
  return data.url as string;
}

// ─── useCreateTimeslot ────────────────────────────────────────────────────────

async function createTimeslot(data: TimeslotInput, token: string) {
  const res = await fetch("/api/timeslots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to create time slot");
  }
  return res.json();
}

export function useCreateTimeslot() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { data: TimeslotInput; token: string }>({
    mutationFn: ({ data, token }) => createTimeslot(data, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/timeslots"] }),
  });
}

// ─── useDeleteTimeslot ────────────────────────────────────────────────────────

async function deleteTimeslot(id: number, token: string) {
  const res = await fetch(`/api/timeslots/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to delete time slot");
  }
}

export function useDeleteTimeslot() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; token: string }>({
    mutationFn: ({ id, token }) => deleteTimeslot(id, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/timeslots"] }),
  });
}
