import { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Phone, Mail, User } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDeliveryStaff() {
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    // Load staff from localStorage
    const savedStaff = localStorage.getItem('deliveryStaff');
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    }
  }, []);

  const saveToLocalStorage = (staffList) => {
    localStorage.setItem('deliveryStaff', JSON.stringify(staffList));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    
    const newStaff = {
      id: Date.now().toString(),
      ...formData,
      status: 'not_assigned',
      createdAt: new Date().toISOString()
    };

    const updatedStaff = [...staff, newStaff];
    setStaff(updatedStaff);
    saveToLocalStorage(updatedStaff);
    
    setFormData({ name: '', phone: '', email: '' });
    setShowAddModal(false);
  };

  const handleEditStaff = (e) => {
    e.preventDefault();
    
    const updatedStaff = staff.map(s => 
      s.id === editingStaff.id 
        ? { ...s, ...formData }
        : s
    );

    setStaff(updatedStaff);
    saveToLocalStorage(updatedStaff);
    
    setFormData({ name: '', phone: '', email: '' });
    setEditingStaff(null);
  };

  const handleDeleteStaff = (id) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      const updatedStaff = staff.filter(s => s.id !== id);
      setStaff(updatedStaff);
      saveToLocalStorage(updatedStaff);
    }
  };

  const toggleStatus = (id) => {
    const updatedStaff = staff.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'assigned' ? 'not_assigned' : 'assigned' }
        : s
    );
    setStaff(updatedStaff);
    saveToLocalStorage(updatedStaff);
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      phone: staffMember.phone,
      email: staffMember.email
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingStaff(null);
    setFormData({ name: '', phone: '', email: '' });
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Delivery Staff</h1>
            <p className="text-gray-600">Manage your delivery team</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">Add Staff</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{staff.length}</h3>
            <p className="text-sm text-gray-600">Total Staff</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {staff.filter(s => s.status === 'assigned').length}
            </h3>
            <p className="text-sm text-gray-600">Currently Assigned</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {staff.filter(s => s.status === 'not_assigned').length}
            </h3>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <Truck size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No delivery staff yet</h3>
              <p className="text-gray-500 mb-6">Add your first delivery staff member to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Staff</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="text-primary-600" size={20} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <Phone size={14} />
                          <span>{member.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <Mail size={14} />
                          <span>{member.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(member.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            member.status === 'assigned'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {member.status === 'assigned' ? 'Assigned' : 'Not Assigned'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Staff Modal */}
        {(showAddModal || editingStaff) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
              </div>

              <form onSubmit={editingStaff ? handleEditStaff : handleAddStaff} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Enter staff name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
