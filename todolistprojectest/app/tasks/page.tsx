"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskModal from '../components/TaskModal';
import { Task } from '@/src/types/types';

const Navbar = ({ onFilter }: { onFilter: (status: string | null) => void }) => {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 border-gray-200 py-2.5">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
        <a href="#" className="flex items-center" onClick={() => onFilter(null)}>
          <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
            Task Manager
          </span>
        </a>
        <div className="flex space-x-4">
          <button
            onClick={() => onFilter('pending')}
            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
          >
            Pending
          </button>
          <button
            onClick={() => onFilter('in-progress')}
            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
          >
            In Progress
          </button>
          <button
            onClick={() => onFilter('completed')}
            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
          >
            Completed
          </button>
        </div>
        <div className="flex items-center lg:order-2">
          <button
            onClick={handleLogout}
            className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 py-2.5 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const TasksPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3001/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener las tareas');
        }
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data); // Inicialmente, mostrar todas las tareas
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  const handleCreate = () => {
    setEditTask(undefined);
    setModalOpen(true);
  };

  const saveTask = async (task: Partial<Task>) => {
    try {
      const token = sessionStorage.getItem('token');
      const method = task.id ? 'PATCH' : 'POST';
      const url = task.id ? `http://localhost:3001/tasks/${task.id}` : 'http://localhost:3001/tasks';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      // Actualizar la lista de tareas después de guardar o editar
      const updatedTask = await response.json();
      setTasks((prevTasks) => {
        if (task.id) {
          // Edición
          return prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        } else {
          // Creación
          return [...prevTasks, updatedTask];
        }
      });
      setFilteredTasks((prevTasks) => {
        if (task.id) {
          return prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        } else {
          return [...prevTasks, updatedTask];
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const filterTasks = (status: string | null) => {
    if (status) {
      setFilteredTasks(tasks.filter((task) => task.status === status));
    } else {
      setFilteredTasks(tasks); // Mostrar todas las tareas si el filtro es nulo
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar onFilter={filterTasks} />
      <div className="max-w-screen-xl mx-auto p-5 sm:p-10 md:p-16">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <button
            onClick={handleCreate}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 focus:outline-none"
          >
            Create Task
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {filteredTasks.map(task => (
            <div key={task.id} className="rounded overflow-hidden shadow-lg flex flex-col bg-gray-800">
              <div className="relative">
                <img
                  className="w-full"
                  src="/imagendetarea.jpg"
                  alt="Task"
                />
                <div className="text-xs absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3">
                  {task.status}
                </div>
              </div>
              <div className="px-6 py-4 mb-auto">
                <h2 className="font-medium text-lg mb-2">{task.title}</h2>
                <p className="text-gray-300 text-sm">{task.description}</p>
              </div>
              <div className="px-6 py-3 flex flex-row items-center justify-between bg-gray-700">
                <span className="py-1 text-xs text-gray-300 flex flex-row items-center">
                  <svg height="13px" width="13px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M256,0C114.837,0,0,114.837,0,256s114.837,256,256,256s256-114.837,256-256S397.163,0,256,0z M277.333,256 c0,11.797-9.536,21.333-21.333,21.333h-85.333c-11.797,0-21.333-9.536-21.333-21.333s9.536-21.333,21.333-21.333h64v-128 c0-11.797,9.536-21.333,21.333-21.333s21.333,9.536,21.333,21.333V256z" />
                    </g>
                  </svg>
                  <span className="ml-1">{new Date(task.dueDate).toLocaleDateString()}</span>
                </span>
                <button
                  onClick={() => {
                    setEditTask(task);
                    setModalOpen(true);
                  }}
                  className="py-1 text-xs text-gray-300 flex flex-row items-center"
                >
                  <span className="ml-1">Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveTask}
        taskData={editTask || undefined}
        isEditMode={!!editTask} 
      />
    </div>
  );
};

export default TasksPage;
