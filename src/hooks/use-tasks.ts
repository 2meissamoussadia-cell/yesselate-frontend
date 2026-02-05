import { useState, useCallback, useEffect } from 'react';
import type { Task, AddTaskPayload, UpdateTaskPayload } from '@/lib/api/tasksClient';
import { listTasks, addTask, updateTask, removeTask } from '@/lib/api/tasksClient';
import { logger } from '@/lib/utils/logger';

export function useTasks(demandId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!demandId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listTasks(demandId);
      setTasks(data);
    } catch (e: unknown) {
      setError(e as Error);
      logger.error(`Failed to fetch tasks for demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useTasks', demandId });
    } finally {
      setLoading(false);
    }
  }, [demandId]);

  const addTaskEntry = useCallback(
    async (payload: AddTaskPayload) => {
      setLoading(true);
      setError(null);
      try {
        const newTask = await addTask(demandId, payload);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error(`Failed to add task to demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useTasks', demandId });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  const updateTaskEntry = useCallback(
    async (taskId: string, payload: UpdateTaskPayload) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTask = await updateTask(demandId, taskId, payload);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        return updatedTask;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error(`Failed to update task ${taskId} in demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useTasks', demandId, taskId });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  const removeTaskEntry = useCallback(
    async (taskId: string) => {
      setLoading(true);
      setError(null);
      try {
        await removeTask(demandId, taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        return true;
      } catch (e: unknown) {
        setError(e as Error);
        logger.error(`Failed to remove task ${taskId} from demand ${demandId}`, e instanceof Error ? e : undefined, { component: 'useTasks', demandId, taskId });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [demandId]
  );

  useEffect(() => {
    if (demandId) {
      fetchTasks();
    }
  }, [demandId, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetch: fetchTasks,
    add: addTaskEntry,
    update: updateTaskEntry,
    remove: removeTaskEntry,
  };
}

