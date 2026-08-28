import React, { useEffect, useRef, useState } from 'react';
import { taskApi, projectApi, userApi } from '../../api/endpoints';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  CheckSquare,
  Search,
  Plus,
  ListTodo,
  Users,
  X,
  Copy,
  Trash2,
  PlusCircle,
  Layers,
  ChevronDown,
  Check,
  Calendar,
  Clock,
  FolderKanban,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TaskList = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // MAIN DATA
  // =========================================================

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);

  // =========================================================
  // FILTERS
  // =========================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // =========================================================
  // MODAL
  // =========================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  // =========================================================
  // PROJECT
  // =========================================================

  const [projectId, setProjectId] = useState('');

  // =========================================================
  // BULK TASK ROWS
  // DEFAULT = 5
  // =========================================================

  const createEmptyTaskRow = () => ({
    title: '',
    description: '',
    priority: 'MEDIUM',
    estimatedHours: 8,
    dueDate: '',
    assigneeIds: [],
  });

  const [bulkTasks, setBulkTasks] = useState(
    Array.from({ length: 5 }, () => createEmptyTaskRow())
  );

  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [bulkProgress, setBulkProgress] = useState({
    completed: 0,
    total: 0,
  });

  // Which assignee dropdown is currently open
  const [openAssigneeRow, setOpenAssigneeRow] = useState(null);

  const assigneeDropdownRef = useRef(null);

  // =========================================================
  // LOAD TASKS
  // =========================================================

  const loadTasks = async () => {
    setLoading(true);

    try {
      const [taskResult, projectResult] = await Promise.allSettled([
        taskApi.getMyTasks(),
        projectApi.getAll(),
      ]);

      const taskData =
        taskResult.status === 'fulfilled' &&
        Array.isArray(taskResult.value?.data)
          ? taskResult.value.data
          : [];

      const projectData =
        projectResult.status === 'fulfilled' &&
        Array.isArray(projectResult.value?.data)
          ? projectResult.value.data
          : [];

      if (taskResult.status === 'rejected') {
        console.error(
          'Failed to load tasks:',
          taskResult.reason
        );
      }

      if (projectResult.status === 'rejected') {
        console.error(
          'Failed to load projects:',
          projectResult.reason
        );
      }

      setTasks(taskData);

      // -------------------------------------------------------
      // Build project map
      // -------------------------------------------------------

      const projectMap = new Map();

      projectData.forEach((project) => {
        if (project?.id != null) {
          projectMap.set(String(project.id), project);
        }
      });

      // -------------------------------------------------------
      // Add projects found from tasks
      // -------------------------------------------------------

      taskData.forEach((task) => {
        if (
          task?.projectId != null &&
          !projectMap.has(String(task.projectId))
        ) {
          projectMap.set(String(task.projectId), {
            id: task.projectId,
            name:
              task.projectName ||
              `Project ${task.projectId}`,
            projectCode: task.projectCode || '',
          });
        }
      });

      const finalProjects = Array.from(projectMap.values());

      setProjects(finalProjects);

      if (finalProjects.length > 0) {
        setProjectId((current) => {
          const exists = finalProjects.some(
            (project) =>
              String(project.id) === String(current)
          );

          return exists
            ? current
            : String(finalProjects[0].id);
        });
      } else {
        setProjectId('');
      }
    } catch (error) {
      console.error(
        'Unexpected task loading error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = async () => {
    try {
      setLoadingFormData(true);

      const response = await userApi.getAll();

      const users =
        Array.isArray(response?.data)
          ? response.data
          : [];

      const activeUsers = users.filter(
        (employee) =>
          employee &&
          employee.id != null &&
          employee.active !== false
      );

      setEmployees(activeUsers);
    } catch (error) {
      console.error(
        'Failed to load employees:',
        error
      );

      setEmployees([]);
    } finally {
      setLoadingFormData(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadTasks();
    loadEmployees();
  }, []);

  // =========================================================
  // CLOSE ASSIGNEE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target)
      ) {
        setOpenAssigneeRow(null);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // SELECTED PROJECT
  // =========================================================

  const selectedProject = projects.find(
    (project) =>
      String(project.id) === String(projectId)
  );

  // =========================================================
  // PROJECT MEMBERS
  // =========================================================

  const projectMemberIds =
    Array.isArray(selectedProject?.members)
      ? selectedProject.members
          .map((member) => {
            if (member?.user?.id != null) {
              return member.user.id;
            }

            if (member?.id != null) {
              return member.id;
            }

            return null;
          })
          .filter((id) => id != null)
      : [];

  // =========================================================
  // ASSIGNABLE EMPLOYEES
  //
  // If project members are available, show those.
  // Otherwise show all active employees.
  // =========================================================

  const assignableEmployees =
    projectMemberIds.length > 0
      ? employees.filter((employee) =>
          projectMemberIds.some(
            (id) =>
              Number(id) === Number(employee.id)
          )
        )
      : employees;

  // =========================================================
  // OPEN MODAL
  // =========================================================

  const openCreateModal = async () => {
    setIsModalOpen(true);

    await Promise.all([
      loadTasks(),
      loadEmployees(),
    ]);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (bulkSubmitting) {
      return;
    }

    setOpenAssigneeRow(null);
    setIsModalOpen(false);
  };

  // =========================================================
  // UPDATE TASK ROW
  // =========================================================

  const updateBulkTask = (
    index,
    field,
    value
  ) => {
    setBulkTasks((current) =>
      current.map((task, i) =>
        i === index
          ? {
              ...task,
              [field]: value,
            }
          : task
      )
    );
  };

  // =========================================================
  // ADD ONE TASK ROW
  // =========================================================

  const addTaskRow = () => {
    setBulkTasks((current) => [
      ...current,
      createEmptyTaskRow(),
    ]);
  };

  // =========================================================
  // REMOVE TASK ROW
  // =========================================================

  const removeTaskRow = (index) => {
    setBulkTasks((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  // =========================================================
  // DUPLICATE TASK
  // =========================================================

  const duplicateTaskRow = (index) => {
    setBulkTasks((current) => {
      const source = current[index];

      const copy = {
        ...source,
        title: source.title
          ? `${source.title} - Copy`
          : '',
        assigneeIds: [
          ...(source.assigneeIds || []),
        ],
      };

      return [
        ...current.slice(0, index + 1),
        copy,
        ...current.slice(index + 1),
      ];
    });
  };

  // =========================================================
  // RESET TASK ROWS
  // =========================================================

  const resetBulkTasks = () => {
    setBulkTasks(
      Array.from(
        { length: 5 },
        () => createEmptyTaskRow()
      )
    );
  };

  // =========================================================
  // TOGGLE ASSIGNEE
  // =========================================================

  const toggleAssignee = (
    rowIndex,
    employeeId
  ) => {
    setBulkTasks((current) =>
      current.map((task, index) => {
        if (index !== rowIndex) {
          return task;
        }

        const currentIds =
          task.assigneeIds || [];

        const exists = currentIds.some(
          (id) =>
            Number(id) ===
            Number(employeeId)
        );

        return {
          ...task,
          assigneeIds: exists
            ? currentIds.filter(
                (id) =>
                  Number(id) !==
                  Number(employeeId)
              )
            : [
                ...currentIds,
                Number(employeeId),
              ],
        };
      })
    );
  };

  // =========================================================
  // CLEAR ALL ASSIGNEES FOR ROW
  // =========================================================

  const clearAssignees = (rowIndex) => {
    setBulkTasks((current) =>
      current.map((task, index) =>
        index === rowIndex
          ? {
              ...task,
              assigneeIds: [],
            }
          : task
      )
    );
  };

  // =========================================================
  // GET EMPLOYEE
  // =========================================================

  const getEmployee = (id) => {
    return employees.find(
      (employee) =>
        Number(employee.id) === Number(id)
    );
  };

  // =========================================================
  // GET ASSIGNEE LABEL
  // =========================================================

  const getAssigneeLabel = (ids) => {
    if (!ids || ids.length === 0) {
      return 'Select assignee(s)';
    }

    if (ids.length === 1) {
      const employee = getEmployee(ids[0]);

      return (
        employee?.fullName ||
        employee?.username ||
        'Selected'
      );
    }

    return `${ids.length} employees selected`;
  };

  // =========================================================
  // CREATE TASKS
  // =========================================================

  const handleBulkCreate = async (event) => {
    event.preventDefault();

    if (!projectId) {
      alert('Please select a project.');
      return;
    }

    const validRows = bulkTasks.filter(
      (task) =>
        task.title &&
        task.title.trim()
    );

    if (validRows.length === 0) {
      alert(
        'Please enter at least one task title.'
      );
      return;
    }

    setBulkSubmitting(true);

    setBulkProgress({
      completed: 0,
      total: validRows.length,
    });

    let completed = 0;
    const failed = [];

    try {
      for (const task of validRows) {
        try {
          const payload = {
            projectId: Number(projectId),

            taskOwnerId:
              user?.id != null
                ? Number(user.id)
                : undefined,

            title: task.title.trim(),

            description:
              task.description?.trim() || '',

            priority:
              task.priority || 'MEDIUM',

            estimatedHours:
              Number(
                task.estimatedHours || 0
              ),

            dueDate:
              task.dueDate || undefined,

            assigneeIds:
              (task.assigneeIds || []).map(
                Number
              ),
          };

          console.log(
            'Creating task:',
            payload
          );

          await taskApi.create(payload);

          completed += 1;

          setBulkProgress({
            completed,
            total: validRows.length,
          });
        } catch (error) {
          console.error(
            'Failed to create task:',
            task,
            error
          );

          failed.push(task.title);
        }
      }

      await loadTasks();

      if (failed.length > 0) {
        alert(
          `${completed} task(s) created successfully.\n\n` +
            `Failed task(s):\n` +
            failed.join('\n')
        );
      } else {
        alert(
          `${completed} task(s) created successfully.`
        );

        setIsModalOpen(false);
        setOpenAssigneeRow(null);
        resetBulkTasks();
      }
    } catch (error) {
      console.error(
        'Bulk creation failed:',
        error
      );

      alert(
        'Unable to complete task creation.'
      );
    } finally {
      setBulkSubmitting(false);

      setBulkProgress({
        completed: 0,
        total: 0,
      });
    }
  };

  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = async (
    taskId,
    newStatus
  ) => {
    try {
      await taskApi.updateStatus(
        taskId,
        {
          status: newStatus,
          progressPercentage:
            newStatus === 'COMPLETED'
              ? 100
              : newStatus === 'IN_PROGRESS'
                ? 50
                : 0,
        }
      );

      await loadTasks();
    } catch (error) {
      console.error(
        'Failed to update status:',
        error
      );
    }
  };

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = tasks.filter(
    (task) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const matchSearch =
        !search ||
        task.title
          ?.toLowerCase()
          .includes(search) ||
        task.taskCode
          ?.toLowerCase()
          .includes(search) ||
        task.projectName
          ?.toLowerCase()
          .includes(search);

      const matchStatus =
        statusFilter === 'ALL' ||
        task.status === statusFilter;

      const matchPriority =
        priorityFilter === 'ALL' ||
        task.priority === priorityFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchPriority
      );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-200">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">

              <CheckSquare className="w-5 h-5 text-indigo-600" />

            </div>

            <div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                Tasks Management
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Future Transformation • Manage assignments,
                deadlines and execution.
              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() =>
              navigate('/kanban')
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >

            <ListTodo className="w-4 h-4 text-indigo-600" />

            Kanban Board

          </button>

          {hasRole(
            'SUPER_ADMIN',
            'ADMIN',
            'PROJECT_MANAGER',
            'TEAM_LEAD'
          ) && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
            >

              <Plus className="w-4 h-4" />

              Create Tasks

            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search tasks, task codes or projects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-indigo-500"
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="TO_DO">
              To Do
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="BLOCKED">
              Blocked
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
            className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-indigo-500"
          >

            <option value="ALL">
              All Priorities
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>

        </div>

      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Tasks
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {tasks.length}
          </p>

        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            In Progress
          </p>

          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'IN_PROGRESS'
              ).length
            }
          </p>

        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Completed
          </p>

          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'COMPLETED'
              ).length
            }
          </p>

        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Overdue
          </p>

          <p className="text-2xl font-bold text-rose-600 mt-1">
            {
              tasks.filter(
                (task) =>
                  task.isOverdue
              ).length
            }
          </p>

        </div>

      </div>

      {/* =====================================================
          TASK TABLE
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {loading ? (

          <div className="flex items-center justify-center py-20">

            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />

          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="text-center py-20">

            <CheckSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />

            <h3 className="text-sm font-semibold text-slate-700">
              No tasks found
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px]">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Task
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Project
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Assignees
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Hours
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Due Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredTasks.map(
                  (task) => (

                    <tr
                      key={task.id}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-4 py-4">

                        <div className="flex items-start gap-3">

                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">

                            <CheckSquare className="w-4 h-4 text-indigo-600" />

                          </div>

                          <div className="min-w-0">

                            <div className="font-semibold text-sm text-slate-800">
                              {task.title}
                            </div>

                            <div className="text-xs text-indigo-600 font-mono mt-1">
                              {task.taskCode ||
                                `TASK-${task.id}`}
                            </div>

                            <div className="text-[11px] text-slate-400 mt-1">
                              {task.moduleName ||
                                'General'}
                            </div>

                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-2">

                          <FolderKanban className="w-4 h-4 text-slate-400" />

                          <span className="text-sm text-slate-700">
                            {task.projectName ||
                              '—'}
                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-4">

                        {task.assignees &&
                        task.assignees.length >
                          0 ? (

                          <div className="flex flex-wrap gap-1.5">

                            {task.assignees.map(
                              (assignee) => (

                                <span
                                  key={
                                    assignee.id
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-medium"
                                >

                                  <Users className="w-3 h-3" />

                                  {assignee.fullName ||
                                    assignee.username}

                                </span>

                              )
                            )}

                          </div>

                        ) : (

                          <span className="text-xs text-slate-400">
                            Unassigned
                          </span>

                        )}

                      </td>

                      <td className="px-4 py-4">

                        <StatusBadge
                          status={
                            task.priority
                          }
                        />

                      </td>

                      <td className="px-4 py-4">

                        <span className="text-sm text-slate-700">
                          {task.actualHours ||
                            0}
                          h /{' '}
                          {task.estimatedHours ||
                            0}
                          h
                        </span>

                      </td>

                      <td className="px-4 py-4">

                        <div
                          className={
                            task.isOverdue
                              ? 'text-sm font-semibold text-rose-600'
                              : 'text-sm text-slate-600'
                          }
                        >
                          {task.dueDate ||
                            'No date'}
                        </div>

                      </td>

                      <td className="px-4 py-4">

                        <StatusBadge
                          status={
                            task.status
                          }
                        />

                      </td>

                      <td className="px-4 py-4">

                        <select
                          value={
                            task.status
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value
                            )
                          }
                          className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none"
                        >

                          <option value="TO_DO">
                            To Do
                          </option>

                          <option value="IN_PROGRESS">
                            In Progress
                          </option>

                          <option value="BLOCKED">
                            Blocked
                          </option>

                          <option value="COMPLETED">
                            Completed
                          </option>

                          <option value="CANCELLED">
                            Cancelled
                          </option>

                        </select>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          CREATE TASK MODAL
      ====================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">

          <div className="w-full max-w-[1500px] max-h-[94vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">

                  <Layers className="w-5 h-5 text-indigo-600" />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Create Tasks
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Add multiple tasks to a project and assign team members.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeCreateModal
                }
                disabled={
                  bulkSubmitting
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================== */}

            <div className="flex-1 overflow-y-auto">

              <form
                onSubmit={
                  handleBulkCreate
                }
                className="p-6"
              >

                {/* =================================================
                    PROJECT SELECTION
                ================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 mb-5">

                  <div>

                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Project *
                    </label>

                    <div className="relative">

                      <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />

                      <select
                        value={
                          projectId
                        }
                        onChange={(e) =>
                          setProjectId(
                            e.target.value
                          )
                        }
                        disabled={
                          loadingFormData &&
                          projects.length ===
                            0
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >

                        <option value="">
                          {projects.length ===
                          0
                            ? 'No projects available'
                            : 'Select project'}
                        </option>

                        {projects.map(
                          (project) => (

                            <option
                              key={
                                project.id
                              }
                              value={
                                project.id
                              }
                            >

                              {project.name ||
                                'Unnamed Project'}

                              {project.projectCode
                                ? ` • ${project.projectCode}`
                                : ''}

                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </div>

                  {/* TASK COUNT */}

                  <div className="flex items-end">

                    <div className="px-5 py-3 rounded-xl bg-indigo-50 border border-indigo-100 min-w-[150px]">

                      <div className="flex items-center justify-between gap-6">

                        <span className="text-xs text-indigo-700 font-medium">
                          Task rows
                        </span>

                        <span className="text-xl font-bold text-indigo-700">
                          {
                            bulkTasks.length
                          }
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    TOOLBAR
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

                  <div>

                    <h3 className="text-sm font-bold text-slate-800">
                      Task Details
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Start with 5 tasks. Add more individually whenever needed.
                    </p>

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        addTaskRow
                      }
                      disabled={
                        bulkSubmitting
                      }
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                    >

                      <Plus className="w-4 h-4" />

                      Add Task

                    </button>

                    <button
                      type="button"
                      onClick={
                        resetBulkTasks
                      }
                      disabled={
                        bulkSubmitting
                      }
                      className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                    >

                      Reset

                    </button>

                  </div>

                </div>

                {/* =================================================
                    TASK TABLE
                ================================================== */}

                <div className="border border-slate-200 rounded-xl overflow-visible">

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[1280px]">

                      <thead>

                        <tr className="bg-slate-50 border-b border-slate-200">

                          <th className="w-12 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            #
                          </th>

                          <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 min-w-[230px]">
                            Task
                          </th>

                          <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 min-w-[250px]">
                            Assignee(s)
                          </th>

                          <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 w-[145px]">
                            Priority
                          </th>

                          <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 w-[125px]">
                            Hours
                          </th>

                          <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 w-[165px]">
                            Due Date
                          </th>

                          <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 min-w-[250px]">
                            Description
                          </th>

                          <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 w-[100px]">
                            Actions
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {bulkTasks.map(
                          (
                            task,
                            index
                          ) => (

                            <tr
                              key={
                                index
                              }
                              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition"
                            >

                              {/* NUMBER */}

                              <td className="px-3 py-3 text-center">

                                <div className="w-7 h-7 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                                  {index +
                                    1}
                                </div>

                              </td>

                              {/* TASK */}

                              <td className="px-3 py-3">

                                <input
                                  type="text"
                                  value={
                                    task.title
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateBulkTask(
                                      index,
                                      'title',
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  placeholder="Enter task title"
                                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />

                              </td>

                              {/* =================================================
                                  ASSIGNEE DROPDOWN
                              ================================================== */}

                              <td className="px-3 py-3">

                                <div
                                  className="relative"
                                  ref={
                                    openAssigneeRow ===
                                    index
                                      ? assigneeDropdownRef
                                      : null
                                  }
                                >

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenAssigneeRow(
                                        openAssigneeRow ===
                                          index
                                          ? null
                                          : index
                                      )
                                    }
                                    disabled={
                                      loadingFormData ||
                                      bulkSubmitting
                                    }
                                    className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-2 text-left hover:border-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                  >

                                    <div className="flex items-center gap-2 min-w-0">

                                      <Users className="w-4 h-4 text-indigo-500 shrink-0" />

                                      <span className="text-xs text-slate-700 truncate">

                                        {getAssigneeLabel(
                                          task.assigneeIds
                                        )}

                                      </span>

                                    </div>

                                    <ChevronDown
                                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                                        openAssigneeRow ===
                                        index
                                          ? 'rotate-180'
                                          : ''
                                      }`}
                                    />

                                  </button>

                                  {/* DROPDOWN */}

                                  {openAssigneeRow ===
                                    index && (

                                    <div className="absolute z-[100] left-0 right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">

                                      <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">

                                        <span className="text-[11px] font-bold text-slate-600">
                                          Select assignees
                                        </span>

                                        {task.assigneeIds?.length >
                                          0 && (

                                          <button
                                            type="button"
                                            onClick={() =>
                                              clearAssignees(
                                                index
                                              )
                                            }
                                            className="text-[10px] text-indigo-600 font-semibold hover:underline"
                                          >
                                            Clear
                                          </button>

                                        )}

                                      </div>

                                      <div className="max-h-[240px] overflow-y-auto">

                                        {loadingFormData ? (

                                          <div className="p-4 text-center text-xs text-slate-400">
                                            Loading employees...
                                          </div>

                                        ) : assignableEmployees.length ===
                                          0 ? (

                                          <div className="p-4 text-center text-xs text-slate-400">
                                            No employees available.
                                          </div>

                                        ) : (

                                          assignableEmployees.map(
                                            (
                                              employee
                                            ) => {

                                              const selected =
                                                (
                                                  task.assigneeIds ||
                                                  []
                                                ).some(
                                                  (
                                                    id
                                                  ) =>
                                                    Number(
                                                      id
                                                    ) ===
                                                    Number(
                                                      employee.id
                                                    )
                                                );

                                              return (

                                                <button
                                                  key={
                                                    employee.id
                                                  }
                                                  type="button"
                                                  onClick={() =>
                                                    toggleAssignee(
                                                      index,
                                                      employee.id
                                                    )
                                                  }
                                                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-indigo-50 transition ${
                                                    selected
                                                      ? 'bg-indigo-50'
                                                      : ''
                                                  }`}
                                                >

                                                  <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                                      selected
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-slate-300 bg-white'
                                                    }`}
                                                  >

                                                    {selected && (

                                                      <Check className="w-3 h-3 text-white" />

                                                    )}

                                                  </div>

                                                  <div className="min-w-0">

                                                    <div className="text-xs font-semibold text-slate-700 truncate">

                                                      {employee.fullName ||
                                                        employee.username}

                                                    </div>

                                                    {employee.username &&
                                                      employee.fullName && (

                                                        <div className="text-[10px] text-slate-400 truncate">

                                                          @
                                                          {
                                                            employee.username
                                                          }

                                                        </div>

                                                      )}

                                                  </div>

                                                </button>

                                              );
                                            }
                                          )

                                        )}

                                      </div>

                                    </div>

                                  )}

                                </div>

                                {/* SELECTED ASSIGNEE CHIPS */}

                                {task.assigneeIds?.length >
                                  0 && (

                                  <div className="flex flex-wrap gap-1 mt-1.5">

                                    {task.assigneeIds
                                      .slice(0, 3)
                                      .map(
                                        (
                                          id
                                        ) => {

                                          const employee =
                                            getEmployee(
                                              id
                                            );

                                          return (

                                            <span
                                              key={
                                                id
                                              }
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-[9px] text-indigo-700"
                                            >

                                              {
                                                employee?.fullName ||
                                                employee?.username
                                              }

                                            </span>

                                          );
                                        }
                                      )}

                                    {task.assigneeIds.length >
                                      3 && (

                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500">

                                        +
                                        {task.assigneeIds.length -
                                          3}

                                      </span>

                                    )}

                                  </div>

                                )}

                              </td>

                              {/* PRIORITY */}

                              <td className="px-3 py-3">

                                <select
                                  value={
                                    task.priority
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateBulkTask(
                                      index,
                                      'priority',
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-indigo-500"
                                >

                                  <option value="LOW">
                                    Low
                                  </option>

                                  <option value="MEDIUM">
                                    Medium
                                  </option>

                                  <option value="HIGH">
                                    High
                                  </option>

                                  <option value="CRITICAL">
                                    Critical
                                  </option>

                                </select>

                              </td>

                              {/* HOURS */}

                              <td className="px-3 py-3">

                                <div className="relative">

                                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={
                                      task.estimatedHours
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateBulkTask(
                                        index,
                                        'estimatedHours',
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-indigo-500"
                                  />

                                </div>

                              </td>

                              {/* DUE DATE */}

                              <td className="px-3 py-3">

                                <div className="relative">

                                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />

                                  <input
                                    type="date"
                                    value={
                                      task.dueDate
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateBulkTask(
                                        index,
                                        'dueDate',
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    className="w-full pl-9 pr-2 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-indigo-500"
                                  />

                                </div>

                              </td>

                              {/* DESCRIPTION */}

                              <td className="px-3 py-3">

                                <input
                                  type="text"
                                  value={
                                    task.description
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateBulkTask(
                                      index,
                                      'description',
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  placeholder="Short description"
                                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-indigo-500"
                                />

                              </td>

                              {/* ACTIONS */}

                              <td className="px-3 py-3">

                                <div className="flex items-center justify-center gap-1">

                                  <button
                                    type="button"
                                    title="Duplicate"
                                    onClick={() =>
                                      duplicateTaskRow(
                                        index
                                      )
                                    }
                                    disabled={
                                      bulkSubmitting
                                    }
                                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center transition"
                                  >

                                    <Copy className="w-3.5 h-3.5" />

                                  </button>

                                  {bulkTasks.length >
                                    1 && (

                                    <button
                                      type="button"
                                      title="Remove"
                                      onClick={() =>
                                        removeTaskRow(
                                          index
                                        )
                                      }
                                      disabled={
                                        bulkSubmitting
                                      }
                                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition"
                                    >

                                      <Trash2 className="w-3.5 h-3.5" />

                                    </button>

                                  )}

                                </div>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* =================================================
                    PROGRESS
                ================================================== */}

                {bulkSubmitting && (

                  <div className="mt-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-xs font-semibold text-indigo-800">
                        Creating tasks...
                      </span>

                      <span className="text-xs font-bold text-indigo-700">

                        {
                          bulkProgress.completed
                        }

                        /

                        {
                          bulkProgress.total
                        }

                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">

                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{
                          width:
                            bulkProgress.total >
                            0
                              ? `${
                                  (bulkProgress.completed /
                                    bulkProgress.total) *
                                  100
                                }%`
                              : '0%',
                        }}
                      />

                    </div>

                  </div>

                )}

                {/* =================================================
                    FOOTER
                ================================================== */}

                <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div className="text-xs text-slate-400">

                    <strong className="text-slate-600">
                      {
                        bulkTasks.filter(
                          (task) =>
                            task.title?.trim()
                        ).length
                      }
                    </strong>{' '}
                    task(s) ready to create

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        closeCreateModal
                      }
                      disabled={
                        bulkSubmitting
                      }
                      className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        bulkSubmitting ||
                        !projectId
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    >

                      {bulkSubmitting ? (

                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />

                          Creating...
                        </>

                      ) : (

                        <>
                          <Plus className="w-4 h-4" />

                          Create Tasks
                        </>

                      )}

                    </button>

                  </div>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};
