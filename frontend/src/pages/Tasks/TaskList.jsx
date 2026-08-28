import React, { useState, useEffect } from 'react';
import { taskApi, projectApi, userApi } from '../../api/endpoints';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TaskList = () => {
  const { user, hasRole } = useAuth();

  const navigate = useNavigate();

  // =========================================================
  // DATA
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
  // CREATE TASK MODAL
  // =========================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projectId, setProjectId] = useState('');

  // =========================================================
  // SINGLE TASK FORM
  // =========================================================

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // BULK TASK FORM
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
    Array.from(
      { length: 15 },
      () => createEmptyTaskRow()
    )
  );

  const [bulkSubmitting, setBulkSubmitting] =
    useState(false);

  const [bulkProgress, setBulkProgress] = useState({
    completed: 0,
    total: 0,
  });

  // =========================================================
  // LOAD TASKS + PROJECTS
  // =========================================================

  const loadTasks = async () => {
    setLoading(true);

    try {
      const [taskResult, projectResult] =
        await Promise.allSettled([
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
          projectMap.set(
            String(project.id),
            project
          );
        }
      });

      // -------------------------------------------------------
      // Add projects discovered from tasks
      // -------------------------------------------------------

      taskData.forEach((task) => {
        if (
          task?.projectId != null &&
          !projectMap.has(
            String(task.projectId)
          )
        ) {
          projectMap.set(
            String(task.projectId),
            {
              id: task.projectId,
              name:
                task.projectName ||
                `Project ${task.projectId}`,
              projectCode:
                task.projectCode || '',
            }
          );
        }
      });

      const finalProjects =
        Array.from(projectMap.values());

      setProjects(finalProjects);

      // -------------------------------------------------------
      // Keep current project if valid
      // Otherwise select first project
      // -------------------------------------------------------

      if (finalProjects.length > 0) {
        setProjectId((currentProjectId) => {
          const valid =
            finalProjects.some(
              (project) =>
                String(project.id) ===
                String(currentProjectId)
            );

          return valid
            ? currentProjectId
            : String(
                finalProjects[0].id
              );
        });
      } else {
        setProjectId('');
      }

      console.log(
        'Task page projects:',
        finalProjects
      );

      console.log(
        'Task page tasks:',
        taskData
      );
    } catch (error) {
      console.error(
        'Unexpected task page loading error:',
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

      const response =
        await userApi.getAll();

      const users =
        Array.isArray(response?.data)
          ? response.data
          : [];

      const activeUsers =
        users.filter(
          (employee) =>
            employee &&
            employee.id != null &&
            employee.active !== false
        );

      setEmployees(activeUsers);

      console.log(
        'Available employees:',
        activeUsers
      );
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
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = async () => {
    setIsModalOpen(true);

    await Promise.all([
      loadTasks(),
      loadEmployees(),
    ]);
  };

  // =========================================================
  // CLOSE CREATE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (
      submitting ||
      bulkSubmitting
    ) {
      return;
    }

    setIsModalOpen(false);
  };

  // =========================================================
  // SELECTED PROJECT
  // IMPORTANT:
  // Keep these variables component-scoped.
  // =========================================================

  const selectedProject = projects.find(
    (project) =>
      String(project.id) ===
      String(projectId)
  );

  // =========================================================
  // PROJECT MEMBER IDS
  // =========================================================

  const projectMemberIds =
    Array.isArray(
      selectedProject?.members
    )
      ? selectedProject.members
          .map(
            (member) =>
              member?.user?.id
          )
          .filter(
            (id) => id != null
          )
      : [];

  // =========================================================
  // ASSIGNABLE EMPLOYEES
  // =========================================================

  const assignableEmployees =
    projectMemberIds.length > 0
      ? employees.filter(
          (employee) =>
            projectMemberIds.some(
              (id) =>
                Number(id) ===
                Number(employee.id)
            ) ||
            Number(employee.id) ===
              Number(
                selectedProject
                  ?.projectManager?.id
              )
        )
      : employees;

  // =========================================================
  // ASSIGNEE CHANGE
  // =========================================================

  const handleAssigneeChange = (e) => {
    const selectedIds =
      Array.from(
        e.target.selectedOptions,
        (option) =>
          Number(option.value)
      );

    setAssigneeIds(selectedIds);
  };

  // =========================================================
  // REMOVE ASSIGNEE
  // =========================================================

  const removeAssignee = (id) => {
    setAssigneeIds(
      (current) =>
        current.filter(
          (employeeId) =>
            Number(employeeId) !==
            Number(id)
        )
    );
  };

  // =========================================================
  // RESET SINGLE TASK FORM
  // =========================================================

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setEstimatedHours(16);
    setDueDate('');
    setAssigneeIds([]);

    if (projects.length > 0) {
      setProjectId(
        String(projects[0].id)
      );
    } else {
      setProjectId('');
    }
  };

  // =========================================================
  // CREATE SINGLE TASK
  // =========================================================

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!projectId) {
      alert(
        'Please select a project.'
      );
      return;
    }

    if (!title.trim()) {
      alert(
        'Please enter a task title.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        projectId:
          Number(projectId),

        taskOwnerId:
          user?.id
            ? Number(user.id)
            : undefined,

        title:
          title.trim(),

        description:
          description.trim(),

        priority,

        estimatedHours:
          Number(
            estimatedHours
          ),

        dueDate:
          dueDate || undefined,

        assigneeIds:
          assigneeIds.map(
            Number
          ),
      };

      console.log(
        'Creating task:',
        payload
      );

      await taskApi.create(
        payload
      );

      alert(
        'Task created successfully.'
      );

      setIsModalOpen(false);

      resetForm();

      await loadTasks();
    } catch (error) {
      console.error(
        'Failed to create task:',
        error
      );

      console.error(
        'Backend response:',
        error?.response?.data
      );

      alert(
        error?.response?.data
          ?.message ||
          'Failed to create task. Please check the backend response.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // BULK TASK FUNCTIONS
  // =========================================================

  const updateBulkTask = (
    index,
    field,
    value
  ) => {
    setBulkTasks(
      (current) =>
        current.map(
          (task, i) =>
            i === index
              ? {
                  ...task,
                  [field]:
                    value,
                }
              : task
        )
    );
  };

  // =========================================================
  // UPDATE BULK ASSIGNEES
  // =========================================================

  const updateBulkAssignees = (
    index,
    selectedIds
  ) => {
    setBulkTasks(
      (current) =>
        current.map(
          (task, i) =>
            i === index
              ? {
                  ...task,
                  assigneeIds:
                    selectedIds.map(
                      Number
                    ),
                }
              : task
        )
    );
  };

  // =========================================================
  // ADD BULK ROWS
  // =========================================================

  const addBulkTaskRows = (
    count = 5
  ) => {
    setBulkTasks(
      (current) => [
        ...current,
        ...Array.from(
          {
            length: count,
          },
          () =>
            createEmptyTaskRow()
        ),
      ]
    );
  };

  // =========================================================
  // REMOVE BULK ROW
  // =========================================================

  const removeBulkTaskRow = (
    index
  ) => {
    setBulkTasks(
      (current) =>
        current.filter(
          (_, i) =>
            i !== index
        )
    );
  };

  // =========================================================
  // DUPLICATE BULK ROW
  // =========================================================

  const duplicateBulkTaskRow = (
    index
  ) => {
    setBulkTasks(
      (current) => {
        const source =
          current[index];

        const copy = {
          ...source,

          title:
            source.title
              ? `${source.title} - Copy`
              : '',

          assigneeIds: [
            ...(source.assigneeIds ||
              []),
          ],
        };

        return [
          ...current.slice(
            0,
            index + 1
          ),

          copy,

          ...current.slice(
            index + 1
          ),
        ];
      }
    );
  };

  // =========================================================
  // CLEAR BULK TASKS
  // =========================================================

  const clearBulkTasks = () => {
    setBulkTasks(
      Array.from(
        {
          length: 15,
        },
        () =>
          createEmptyTaskRow()
      )
    );
  };

  // =========================================================
  // BULK CREATE
  // =========================================================

  const handleBulkCreate = async (
    e
  ) => {
    e.preventDefault();

    if (!projectId) {
      alert(
        'Please select a project.'
      );
      return;
    }

    const validRows =
      bulkTasks.filter(
        (task) =>
          task.title &&
          task.title.trim()
      );

    if (
      validRows.length === 0
    ) {
      alert(
        'Please enter at least one task title.'
      );
      return;
    }

    setBulkSubmitting(true);

    setBulkProgress({
      completed: 0,
      total:
        validRows.length,
    });

    let completed = 0;

    const failed = [];

    try {
      /*
       * Use the EXISTING task API.
       *
       * This means backend changes are not required.
       * Each row is created as an ordinary task.
       */

      for (
        const task of validRows
      ) {
        try {
          const payload = {
            projectId:
              Number(
                projectId
              ),

            taskOwnerId:
              user?.id
                ? Number(user.id)
                : undefined,

            title:
              task.title.trim(),

            description:
              task.description?.trim() ||
              '',

            priority:
              task.priority ||
              'MEDIUM',

            estimatedHours:
              Number(
                task.estimatedHours ||
                  0
              ),

            dueDate:
              task.dueDate ||
              undefined,

            assigneeIds:
              (
                task.assigneeIds ||
                []
              ).map(Number),
          };

          console.log(
            'Creating bulk task:',
            payload
          );

          await taskApi.create(
            payload
          );

          completed += 1;

          setBulkProgress({
            completed,
            total:
              validRows.length,
          });
        } catch (error) {
          console.error(
            'Failed to create task:',
            task,
            error
          );

          failed.push(
            task.title
          );
        }
      }

      await loadTasks();

      if (
        failed.length > 0
      ) {
        alert(
          `${completed} task(s) created successfully.\n\n` +
            `Failed task(s):\n` +
            failed.join('\n')
        );
      } else {
        alert(
          `${completed} task(s) created successfully.`
        );

        setIsModalOpen(
          false
        );

        clearBulkTasks();
      }
    } catch (error) {
      console.error(
        'Bulk task creation failed:',
        error
      );

      alert(
        'Unable to complete bulk task creation.'
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
          status:
            newStatus,

          progressPercentage:
            newStatus ===
            'COMPLETED'
              ? 100
              : newStatus ===
                  'IN_PROGRESS'
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

  const filteredTasks =
    tasks.filter(
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
          statusFilter ===
            'ALL' ||
          task.status ===
            statusFilter;

        const matchPriority =
          priorityFilter ===
            'ALL' ||
          task.priority ===
            priorityFilter;

        return (
          matchSearch &&
          matchStatus &&
          matchPriority
        );
      }
    );

  // =========================================================
  // GET EMPLOYEE
  // =========================================================

  const getEmployeeById = (
    id
  ) => {
    return employees.find(
      (employee) =>
        Number(employee.id) ===
        Number(id)
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">

              <CheckSquare className="w-5 h-5 text-indigo-400" />

            </div>

            <div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading">
                Tasks Management
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Future Transformation • Manage assignments, deadlines and execution.
              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate(
                '/kanban'
              )
            }
            className="btn btn-secondary btn-sm"
          >

            <ListTodo className="w-4 h-4 text-cyan-400" />

            <span>
              Kanban Board
            </span>

          </button>

          {hasRole(
            'SUPER_ADMIN',
            'ADMIN',
            'PROJECT_MANAGER',
            'TEAM_LEAD'
          ) && (
            <button
              onClick={
                openCreateModal
              }
              className="btn btn-primary btn-sm"
            >

              <Plus className="w-4 h-4" />

              <span>
                Create Tasks
              </span>

            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="glass-panel p-4">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 w-full lg:w-96">

            <Search className="w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search tasks, codes or projects..."
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="bg-transparent border-none outline-none text-slate-200 w-full text-xs"
            />

          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="form-select text-xs py-2"
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
              value={
                priorityFilter
              }
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
              className="form-select text-xs py-2"
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

      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <div className="glass-card p-4">

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Total Tasks
          </p>

          <p className="text-xl font-extrabold text-white mt-1">
            {tasks.length}
          </p>

        </div>

        <div className="glass-card p-4">

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            In Progress
          </p>

          <p className="text-xl font-extrabold text-cyan-300 mt-1">
            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'IN_PROGRESS'
              ).length
            }
          </p>

        </div>

        <div className="glass-card p-4">

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Completed
          </p>

          <p className="text-xl font-extrabold text-emerald-300 mt-1">
            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'COMPLETED'
              ).length
            }
          </p>

        </div>

        <div className="glass-card p-4">

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Overdue
          </p>

          <p className="text-xl font-extrabold text-rose-300 mt-1">
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

      <div className="glass-card p-5">

        {loading ? (

          <div className="flex items-center justify-center py-20">

            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />

          </div>

        ) : filteredTasks.length ===
          0 ? (

          <div className="text-center py-16 text-slate-400">

            <CheckSquare className="w-9 h-9 mx-auto mb-3 opacity-30" />

            <p className="text-xs">
              No tasks found matching your filter criteria.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table className="modern-table">

              <thead>

                <tr>

                  <th>
                    Code
                  </th>

                  <th>
                    Task
                  </th>

                  <th>
                    Project
                  </th>

                  <th>
                    Assignees
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Hours
                  </th>

                  <th>
                    Due Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredTasks.map(
                  (task) => (

                    <tr
                      key={
                        task.id
                      }
                    >

                      <td className="font-mono text-xs font-bold text-indigo-400">
                        {task.taskCode ||
                          `TASK-${task.id}`}
                      </td>

                      <td>

                        <div className="font-semibold text-slate-200 text-xs">
                          {task.title}
                        </div>

                        <div className="text-[10px] text-slate-500 mt-1">
                          {task.moduleName ||
                            'General'}
                        </div>

                      </td>

                      <td>

                        <span className="text-xs text-slate-300 font-medium block truncate max-w-xs">
                          {task.projectName ||
                            '—'}
                        </span>

                      </td>

                      <td>

                        <div className="flex flex-wrap items-center gap-1">

                          {task.assignees &&
                          task.assignees
                            .length >
                            0 ? (

                            task.assignees.map(
                              (
                                assignee
                              ) => (

                                <span
                                  key={
                                    assignee.id
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-200"
                                >

                                  <Users className="w-3 h-3 text-indigo-400" />

                                  {assignee.fullName ||
                                    assignee.username}

                                </span>

                              )
                            )

                          ) : (

                            <span className="text-xs text-slate-500">
                              Unassigned
                            </span>

                          )}

                        </div>

                      </td>

                      <td>

                        <StatusBadge
                          status={
                            task.priority
                          }
                        />

                      </td>

                      <td className="text-xs font-semibold text-slate-200">

                        {task.actualHours ||
                          0}

                        h /{' '}

                        {task.estimatedHours ||
                          0}

                        h

                      </td>

                      <td className="text-xs text-slate-400">

                        <span
                          className={
                            task.isOverdue
                              ? 'text-rose-400 font-bold'
                              : ''
                          }
                        >
                          {task.dueDate ||
                            'No date'}
                        </span>

                      </td>

                      <td>

                        <StatusBadge
                          status={
                            task.status
                          }
                        />

                      </td>

                      <td>

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
                          className="form-select text-[11px] py-1 px-2 w-28 bg-slate-900"
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

      <Modal
        isOpen={
          isModalOpen
        }
        onClose={
          closeCreateModal
        }
        title="Create Tasks"
      >

        <div className="space-y-5">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

            <div>

              <h3 className="text-sm font-bold text-white">
                Bulk Task Creation
              </h3>

              <p className="text-[11px] text-slate-400 mt-1">
                Create multiple tasks under the selected project and assign them to team members.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  addBulkTaskRows(
                    5
                  )
                }
                disabled={
                  bulkSubmitting
                }
                className="btn btn-secondary btn-sm"
              >

                <PlusCircle className="w-4 h-4" />

                Add 5

              </button>

              <button
                type="button"
                onClick={
                  clearBulkTasks
                }
                disabled={
                  bulkSubmitting
                }
                className="btn btn-secondary btn-sm"
              >
                Clear
              </button>

            </div>

          </div>

          {/* PROJECT */}

          <div className="form-group">

            <label className="form-label">
              Project *
            </label>

            <select
              value={
                projectId
              }
              onChange={(e) =>
                setProjectId(
                  e.target.value
                )
              }
              className="form-select text-xs"
              required
              disabled={
                loadingFormData &&
                projects.length ===
                  0
              }
            >

              <option value="">
                {projects.length ===
                0
                  ? 'No projects available'
                  : 'Select Project'}
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
                      ? ` (${project.projectCode})`
                      : ''}

                  </option>

                )
              )}

            </select>

            {projects.length ===
              0 && (

              <p className="text-[11px] text-amber-400 mt-1">
                No projects are available for this account.
              </p>

            )}

          </div>

          {/* TASK COUNT */}

          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">

            <div className="flex items-center gap-2">

              <Layers className="w-4 h-4 text-indigo-400" />

              <span className="text-xs text-slate-300">
                Task rows
              </span>

            </div>

            <strong className="text-sm text-white">
              {
                bulkTasks.length
              }
            </strong>

          </div>

          {/* BULK FORM */}

          <form
            onSubmit={
              handleBulkCreate
            }
          >

            <div className="border border-white/10 rounded-xl overflow-hidden">

              <div className="overflow-x-auto max-h-[55vh]">

                <table className="w-full min-w-[1150px]">

                  <thead className="sticky top-0 z-10 bg-slate-950">

                    <tr className="border-b border-white/10">

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 w-10">
                        #
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 min-w-[220px]">
                        Task
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 min-w-[230px]">
                        Assignee(s)
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 w-32">
                        Priority
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 w-28">
                        Hours
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 w-36">
                        Due Date
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 min-w-[220px]">
                        Description
                      </th>

                      <th className="px-3 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500 w-24">
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
                          className="border-b border-white/5 hover:bg-white/[0.02]"
                        >

                          {/* NUMBER */}

                          <td className="px-3 py-3 text-xs text-slate-500 font-mono">
                            {index +
                              1}
                          </td>

                          {/* TITLE */}

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
                              placeholder="Task title"
                              className="form-input text-xs w-full"
                            />

                          </td>

                          {/* ASSIGNEES */}

                          <td className="px-3 py-3">

                            <select
                              multiple
                              value={(
                                task.assigneeIds ||
                                []
                              ).map(
                                String
                              )}
                              onChange={(
                                e
                              ) => {

                                const selected =
                                  Array.from(
                                    e
                                      .target
                                      .selectedOptions,
                                    (
                                      option
                                    ) =>
                                      Number(
                                        option.value
                                      )
                                  );

                                updateBulkAssignees(
                                  index,
                                  selected
                                );

                              }}
                              className="form-select text-xs min-h-[82px] w-full"
                              disabled={
                                loadingFormData
                              }
                            >

                              {assignableEmployees.length ===
                              0 ? (

                                <option
                                  value=""
                                  disabled
                                >

                                  {loadingFormData
                                    ? 'Loading employees...'
                                    : projectMemberIds.length >
                                        0
                                      ? 'No active project members'
                                      : 'No active employees'}

                                </option>

                              ) : (

                                assignableEmployees.map(
                                  (
                                    employee
                                  ) => (

                                    <option
                                      key={
                                        employee.id
                                      }
                                      value={
                                        employee.id
                                      }
                                    >

                                      {employee.fullName ||
                                        employee.username}

                                      {employee.username &&
                                      employee.fullName
                                        ? ` (${employee.username})`
                                        : ''}

                                    </option>

                                  )
                                )

                              )}

                            </select>

                            <p className="text-[9px] text-slate-500 mt-1">
                              Ctrl/Cmd + click for multiple.
                            </p>

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
                              className="form-select text-xs"
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
                              className="form-input text-xs w-full"
                            />

                          </td>

                          {/* DATE */}

                          <td className="px-3 py-3">

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
                              className="form-input text-xs w-full"
                            />

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
                              className="form-input text-xs w-full"
                            />

                          </td>

                          {/* ACTIONS */}

                          <td className="px-3 py-3">

                            <div className="flex items-center justify-center gap-1">

                              <button
                                type="button"
                                title="Duplicate task"
                                onClick={() =>
                                  duplicateBulkTaskRow(
                                    index
                                  )
                                }
                                disabled={
                                  bulkSubmitting
                                }
                                className="p-2 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                              >

                                <Copy className="w-3.5 h-3.5" />

                              </button>

                              {bulkTasks.length >
                                1 && (

                                <button
                                  type="button"
                                  title="Remove task"
                                  onClick={() =>
                                    removeBulkTaskRow(
                                      index
                                    )
                                  }
                                  disabled={
                                    bulkSubmitting
                                  }
                                  className="p-2 rounded-md text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
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

            {/* PROGRESS */}

            {bulkSubmitting && (

              <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">

                <div className="flex justify-between text-[11px] mb-2">

                  <span className="text-slate-300">
                    Creating tasks...
                  </span>

                  <span className="text-indigo-300 font-semibold">
                    {
                      bulkProgress.completed
                    }
                    /
                    {
                      bulkProgress.total
                    }
                  </span>

                </div>

                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-indigo-500 transition-all"
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

            {/* BUTTONS */}

            <div className="flex justify-between items-center gap-2 pt-4">

              <div className="text-[10px] text-slate-500">

                {bulkTasks.length}{' '}
                task rows • Empty rows will be skipped

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    closeCreateModal
                  }
                  disabled={
                    bulkSubmitting
                  }
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    bulkSubmitting ||
                    !projectId
                  }
                  className="btn btn-primary btn-sm"
                >

                  {bulkSubmitting
                    ? `Creating ${bulkProgress.completed}/${bulkProgress.total}...`
                    : `Create ${bulkTasks.length} Tasks`}

                </button>

              </div>

            </div>

          </form>

        </div>

      </Modal>

    </div>
  );
};
