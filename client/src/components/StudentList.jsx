import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { PaymentModal } from './PaymentModal';
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  CreditCard, 
  Users, 
  Home, 
  Phone, 
  Mail, 
  X, 
  Loader2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export const StudentList = ({ onDepositSuccess }) => {
  const { selectedMonth, user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStudentForDeposit, setSelectedStudentForDeposit] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roomNumber: '',
    phone: '',
    password: ''
  });

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch hostel members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    setShowPassword(false);
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        roomNumber: student.roomNumber || '',
        phone: student.phone || '',
        password: '' // Blank on edit unless changing
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        roomNumber: '',
        phone: '',
        password: '' // No default password
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await API.put(`/students/${editingStudent._id}`, formData);
      } else {
        await API.post('/students', formData);
      }
      setIsModalOpen(false);
      fetchStudents();
      setAlertDialog({
        isOpen: true,
        title: editingStudent ? 'Member Updated' : 'Member Account Created',
        message: editingStudent
          ? `Hostel member account '${formData.name}' has been updated.`
          : `New member '${formData.name}' created with login password set.`,
        type: 'success'
      });
    } catch (err) {
      setAlertDialog({
        isOpen: true,
        title: 'Save Failed',
        message: err.response?.data?.message || 'Failed to save member details.',
        type: 'error'
      });
    }
  };

  const handleConfirmDelete = (student) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Member Account (${student.name})`,
      description: `Warning: Deleting member '${student.name}' (Room ${student.roomNumber || 'N/A'}) will remove their access and history for ${selectedMonth}.`,
      confirmText: 'Delete Member Account',
      type: 'danger',
      onConfirm: async () => {
        try {
          await API.delete(`/students/${student._id}`);
          fetchStudents();
          setAlertDialog({
            isOpen: true,
            title: 'Member Deleted',
            message: `Member '${student.name}' has been removed from the directory.`,
            type: 'success'
          });
        } catch (err) {
          setAlertDialog({
            isOpen: true,
            title: 'Delete Failed',
            message: 'Failed to delete member account.',
            type: 'error'
          });
        }
      }
    });
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.roomNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Hostel Members Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage active members, room allocations, login passwords, and deposit records.
          </p>
        </div>

        {user && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition"
          >
            <UserPlus className="h-4 w-4" />
            Add New Member
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-2xl border border-slate-800 w-full sm:w-80">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, room, or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-slate-100 outline-none w-full placeholder-slate-500 font-medium"
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-slate-800">
          No members found. Click <strong>"Add New Member"</strong> to register hostel roommates.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(st => (
            <div key={st._id} className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3 animate-fade-in-up hover-rise hover-icon-bounce">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{st.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 mt-0.5">
                    <Home className="h-3 w-3 text-indigo-400" /> Room: {st.roomNumber || 'N/A'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{st.email}</span>
                </div>
                {st.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{st.phone}</span>
                  </div>
                )}
              </div>

              {user && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setSelectedStudentForDeposit(st)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Deposit Money
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(st)}
                      className="p-1.5 text-indigo-400 hover:text-indigo-200 transition"
                      title="Edit Profile & Password"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(st)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 transition"
                      title="Delete Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">
                {editingStudent ? 'Edit Member Account' : 'Register New Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address (Login Username)</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Password field created by Admin without default value */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                  {editingStudent ? 'Login Password (Leave blank to keep unchanged)' : 'Member Login Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingStudent}
                    placeholder={editingStudent ? '••••••••' : 'Enter password for member'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 pr-10 text-white outline-none focus:border-indigo-500 font-bold font-mono placeholder:font-sans placeholder:font-normal placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B-201"
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold hover:from-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  {editingStudent ? 'Update Member' : 'Create Member Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Money Payment Modal */}
      <PaymentModal
        isOpen={!!selectedStudentForDeposit}
        onClose={() => setSelectedStudentForDeposit(null)}
        student={selectedStudentForDeposit}
        monthStr={selectedMonth}
        onSuccess={() => {
          fetchStudents();
          if (onDepositSuccess) onDepositSuccess();
          setAlertDialog({
            isOpen: true,
            title: 'Deposit Recorded',
            message: `Mess deposit successfully credited for ${selectedStudentForDeposit?.name || 'member'}.`,
            type: 'success'
          });
        }}
      />

      {/* 2-Step Verification & Alert Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};
