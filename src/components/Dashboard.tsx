import React, { useState } from 'react';
import { Package, Clock, CheckCircle, TrendingUp, User, LogOut, Home, List, X, MapPin, Phone, DollarSign } from 'lucide-react';
import { Order, OrderStatus, User as UserType } from '../types';
import { mockOrders } from '../data/mockOrders';
import OrderCard from './OrderCard';
import StatsCard from './StatsCard';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

interface PopupData {
  title: string;
  items: Array<{ label: string; value: string; icon?: React.ComponentType<any> }>;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<PopupData | null>(null);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: 'accepted' as OrderStatus } : order
    ));
  };

  const handleDeclineOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const [status, setStatus] = useState<'online' | 'offline' | 'busy'>('online');
  const [showDropdown, setShowDropdown] = useState(false);

  const statusOptions = {
    online: { label: 'Online', color: 'green' },
    offline: { label: 'Offline', color: 'gray' },
    busy: { label: 'Busy', color: 'red' },
  };

  const handleRecentOrderClick = (orderId: string) => {
    setActiveTab('orders');
    setSelectedOrderId(orderId);
    // Clear selection after a brief moment to allow for scroll/highlight effect
    setTimeout(() => setSelectedOrderId(null), 2000);
  };

  const handleStatsClick = (type: string) => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      inProgress: orders.filter(o => ['accepted', 'driver_at_pickup', 'picked', 'driver_at_dropoff'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'completed').length,
      todayEarnings: orders.reduce((sum, order) => sum, 0),
    };

    let popupContent: PopupData;

    switch (type) {
      case 'total':
        popupContent = {
          title: 'Total Orders',
          items: [
            { label: 'All Orders', value: stats.total.toString(), icon: Package },
            { label: 'Pending', value: stats.pending.toString(), icon: Clock },
            { label: 'In Progress', value: stats.inProgress.toString(), icon: TrendingUp },
            { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle },
          ]
        };
        break;
      case 'pending':
        const pendingOrders = orders.filter(o => o.status === 'pending');
        popupContent = {
          title: 'Pending Orders',
          items: pendingOrders.map(order => ({
            label: order.customerName,
            value: ``,
            icon: Clock
          }))
        };
        break;
      case 'inProgress':
        const inProgressOrders = orders.filter(o => ['accepted', 'driver_at_pickup', 'picked', 'driver_at_dropoff'].includes(o.status));
        popupContent = {
          title: 'In Progress Orders',
          items: inProgressOrders.map(order => ({
            label: order.customerName,
            value: order.status.replace('_', ' ').toUpperCase(),
            icon: TrendingUp
          }))
        };
        break;
      default:
        return;
    }

    setPopupData(popupContent);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['accepted', 'driver_at_pickup', 'picked', 'driver_at_dropoff'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    todayEarnings: orders.reduce((sum, order) => sum, 0),
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Driver Status */}
            <div
              className="bg-white rounded-3xl shadow-lg p-6 active:scale-95 transition-transform cursor-pointer"
              onClick={() => handleStatsClick('driver')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{user.driver.name}</h2>
                    <p className="text-gray-600">{user.driver.id}</p>
                    <div className="relative mt-1 w-fit">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-${statusOptions[status].color}-500`}></div>
                        <button
                          onClick={() => setShowDropdown(prev => !prev)}
                          className="text-sm font-semibold text-gray-700 focus:outline-none"
                        >
                          {statusOptions[status].label}
                        </button>
                      </div>

                      {showDropdown && (
                        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-md w-32">
                          {Object.entries(statusOptions).map(([key, val]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setStatus(key as 'online' | 'offline' | 'busy');
                                setShowDropdown(false);
                              }}
                              className={`flex items-center space-x-2 px-4 py-2 w-full text-sm hover:bg-gray-100 ${status === key ? 'font-semibold text-blue-600' : 'text-gray-800'
                                }`}
                            >
                              <span className={`w-2 h-2 rounded-full bg-${val.color}-500`}></span>
                              <span>{val.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>


                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="p-3 bg-red-50 rounded-full text-red-600 hover:bg-red-100 transition-colors active:scale-95"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => handleStatsClick('total')}
                className="col-span-2"
              >
                <StatsCard
                  title="Total Orders"
                  value={stats.total.toLocaleString()}
                  icon={Package}
                  color="blue"
                />
              </div>
              <div onClick={() => handleStatsClick('pending')}>
                <StatsCard
                  title="Pending"
                  value={stats.pending.toString()}
                  icon={Clock}
                  color="yellow"
                />
              </div>
              <div onClick={() => handleStatsClick('inProgress')}>
                <StatsCard
                  title="In Progress"
                  value={stats.inProgress.toString()}
                  icon={TrendingUp}
                  color="purple"
                />
              </div>
            </div>


            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-blue-600 font-semibold text-sm"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl active:scale-95 transition-transform cursor-pointer"
                    onClick={() => handleRecentOrderClick(order.id)}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Incoming Orders</h2>
              <p className="text-gray-600 text-sm">Manage your delivery orders</p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders available</h3>
                <p className="text-gray-600">New orders will appear here when available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`transition-all duration-500 ${selectedOrderId === order.id ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
                      }`}
                  >
                    <OrderCard
                      order={order}
                      onAccept={handleAcceptOrder}
                      onDecline={handleDeclineOrder}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="h-12 bg-blue-600"></div>

      {/* Header */}
      <div className="bg-blue-600 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">
          {activeTab === 'home' ? 'Dashboard' : 'Orders'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pb-24 overflow-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-2xl transition-all ${activeTab === 'home'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Home size={24} />
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-2xl transition-all relative ${activeTab === 'orders'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <List size={24} />
            <span className="text-xs font-semibold">Orders</span>
            {stats.pending > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{stats.pending}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Popup Modal */}
      {popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{popupData.title}</h3>
              <button
                onClick={() => setPopupData(null)}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {popupData.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      {Icon && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Icon size={16} className="text-blue-600" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}