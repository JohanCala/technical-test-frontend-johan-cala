import React, { useState, useEffect } from 'react';
import { Task } from '@/src/types/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>, id?: number) => Promise<void>;
  taskData?: Task;
  isEditMode: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskData, isEditMode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');

  // Efecto para inicializar los valores cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && taskData) {
        // Si estamos en modo edición y hay taskData, llenamos los campos con esos datos
        setTitle(taskData.title || '');
        setDescription(taskData.description || '');
        setStatus(taskData.status as 'pending' | 'in-progress' | 'completed');
        setDueDate(taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '');
      } else {
        // Si no estamos en modo edición, limpiamos los campos para un nuevo registro
        setTitle('');
        setDescription('');
        setStatus('pending');
        setDueDate('');
      }
    }
  }, [isOpen, isEditMode, taskData]);

  const handleSubmit = async () => {
    const isoDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;

    const task = { 
      title, 
      description, 
      status, 
      dueDate: isoDueDate 
    };

    if (isEditMode && taskData?.id) {
      // Llamada a onSave con el ID para actualizar
      await onSave(task, taskData.id);
    } else {
      // Llamada a onSave sin ID para crear una nueva tarea
      await onSave(task);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl p-4 mx-auto bg-white rounded-lg shadow dark:bg-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6m-6-6l6-6m-6 6l-6 6" />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="ml-3 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            {isEditMode ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
