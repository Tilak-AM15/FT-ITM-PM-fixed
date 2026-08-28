import React, {
  useState,
  useEffect,
} from 'react';

import { userApi } from '../../api/endpoints';
import { Modal } from '../../components/Modal';

import {
  Users,
  Plus,
  Search,
  Briefcase,
  Mail,
  DollarSign,
} from 'lucide-react';

const ROLES = [
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
  },
  {
    value: 'ADMIN',
    label: 'Admin / PMO',
  },
  {
    value: 'PROJECT_MANAGER',
    label: 'Project Manager',
  },
  {
    value: 'TEAM_LEAD',
    label: 'Team Lead',
  },
  {
    value: 'EMPLOYEE',
    label: 'Employee / Developer',
  },
  {
    value: 'MANAGEMENT',
    label: 'Management',
  },
  {
    value: 'FINANCE_HR',
    label: 'Finance / HR',
  },
];

export const UserManagement = () => {

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [roleFilter, setRoleFilter] =
    useState('ALL');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [username, setUsername] =
    useState('');

  const [email, setEmail] =
    useState('');

  const demoMode =
    import.meta.env.VITE_DEMO_MODE !==
    'false';

  const [password, setPassword] =
    useState(
      demoMode
        ? 'password123'
        : ''
    );

  const [fullName, setFullName] =
    useState('');

  const [role, setRole] =
    useState('EMPLOYEE');

  const [department, setDepartment] =
    useState('Engineering');

  const [designation, setDesignation] =
    useState('Full Stack Developer');

  const [hourlyRate, setHourlyRate] =
    useState(65);

  const [submitting, setSubmitting] =
    useState(false);

  const loadUsers = async () => {
    try {

      const res =
        await userApi.getAll();

      setUsers(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (err) {

      console.error(
        'Failed to load users:',
        err
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      await userApi.create({
        username,
        email,
        password,
        fullName,
        role,
        department,
        designation,
        hourlyRate:
          Number(hourlyRate),
      });

      setIsModalOpen(false);

      setUsername('');
      setEmail('');
      setFullName('');

      await loadUsers();

    } catch (err) {

      console.error(
        'Failed to create user:',
        err
      );

    } finally {

      setSubmitting(false);

    }
  };

  const filteredUsers =
    users.filter((u) => {

      const search =
        searchTerm.toLowerCase();

      const matchSearch =
        u.fullName
          ?.toLowerCase()
          .includes(search) ||

        u.username
          ?.toLowerCase()
          .includes(search) ||

        u.email
          ?.toLowerCase()
          .includes(search) ||

        u.department
          ?.toLowerCase()
          .includes(search);

      const matchRole =
        roleFilter === 'ALL' ||
        u.role === roleFilter;

      return (
        matchSearch &&
        matchRole
      );
    });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                User Directory
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Future Transformation • People & Access Management
              </p>
            </div>

          </div>

        </div>

        <button
          onClick={() =>
            setIsModalOpen(true)
          }
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>

      </div>

      {/* FILTERS */}
      <div className="glass-panel p-4">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 flex-1">

            <Search className="w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search name, email, department or username..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="bg-transparent border-none outline-none text-slate-200 w-full text-xs"
            />

          </div>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value
              )
            }
            className="form-select text-xs py-2 md:w-60"
          >

            <option value="ALL">
              All Roles
            </option>

            {ROLES.map((r) => (
              <option
                key={r.value}
                value={r.value}
              >
                {r.label}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* TABLE */}
      <div className="glass-card overflow-hidden">

        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-bold text-white">
              Organization Users
            </h2>

            <p className="text-[11px] text-slate-500 mt-1">
              {filteredUsers.length} users displayed
            </p>
          </div>

          <div className="text-[11px] text-slate-400">
            Future Transformation
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b border-white/5 bg-slate-950/40">

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Department
                </th>

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Designation
                </th>

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Email
                </th>

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Rate
                </th>

                <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-xs text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>

              ) : filteredUsers.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-xs text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>

              ) : (

                filteredUsers.map((u) => {

                  const initials =
                    u.fullName
                      ?.split(' ')
                      .map(
                        (x) => x[0]
                      )
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() ||
                    'U';

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-white/5 hover:bg-white/[0.025] transition-colors"
                    >

                      {/* EMPLOYEE */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                            {initials}
                          </div>

                          <div>

                            <div className="text-xs font-bold text-white">
                              {u.fullName ||
                                'Unnamed User'}
                            </div>

                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              @{u.username}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4">

                        <span className="inline-flex px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
                          {u.role
                            ?.replaceAll(
                              '_',
                              ' '
                            )}
                        </span>

                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-xs text-slate-300">

                          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />

                          {u.department ||
                            '—'}

                        </div>

                      </td>

                      {/* DESIGNATION */}
                      <td className="px-5 py-4 text-xs text-slate-300">
                        {u.designation ||
                          '—'}
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-xs text-slate-400">

                          <Mail className="w-3.5 h-3.5" />

                          {u.email ||
                            '—'}

                        </div>

                      </td>

                      {/* RATE */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-1.5 text-xs">

                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />

                          <span className="text-white font-semibold">
                            {u.hourlyRate ??
                              0}
                          </span>

                          <span className="text-slate-500">
                            /h
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                          {u.active === false
                            ? 'Inactive'
                            : 'Active'}

                        </span>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        title="Register User"
      >

        <form
          onSubmit={handleCreateUser}
          className="space-y-4"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="form-group">
              <label className="form-label">
                Full Name *
              </label>

              <input
                required
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="form-input text-xs"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Username *
              </label>

              <input
                required
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                className="form-input text-xs"
                placeholder="e.g. rahul"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="form-group">
              <label className="form-label">
                Email *
              </label>

              <input
                required
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password *
              </label>

              <input
                required
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="form-input text-xs"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="form-group">
              <label className="form-label">
                Role *
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="form-select text-xs"
              >
                {ROLES.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                  >
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Hourly Rate
              </label>

              <input
                type="number"
                value={hourlyRate}
                onChange={(e) =>
                  setHourlyRate(
                    e.target.value
                  )
                }
                className="form-input text-xs"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="form-group">
              <label className="form-label">
                Department
              </label>

              <input
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Designation
              </label>

              <input
                value={designation}
                onChange={(e) =>
                  setDesignation(
                    e.target.value
                  )
                }
                className="form-input text-xs"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-3">

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(false)
              }
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting
                ? 'Creating...'
                : 'Create Account'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};
