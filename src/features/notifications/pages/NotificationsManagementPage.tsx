import React, { useState } from 'react';
import { Bell, Send, Calendar, Users, Image as ImageIcon, CheckCircle, Clock, ShieldCheck, Smartphone } from 'lucide-react';
import { ImageUploadField } from '../../settings/components/WebSettings/ImageUploadField';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  target: 'All Customers' | 'Delivery Boys' | 'Specific Zone';
  type: 'Instant' | 'Scheduled';
  sentAt: string;
  reachCount: number;
  status: 'Delivered' | 'Scheduled' | 'Failed';
}

const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'NOTIF-1',
    title: '🎉 Diwali Mega Gifting Live!',
    body: 'Get 50% OFF on luxury mithai and gift hampers delivered in 10 minutes.',
    target: 'All Customers',
    type: 'Instant',
    sentAt: '2026-07-27 09:30 AM',
    reachCount: 14500,
    status: 'Delivered'
  },
  {
    id: 'NOTIF-2',
    title: '⚡ Shift Bonus Active',
    body: 'Complete 5 deliveries during evening peak hours for ₹250 extra bonus.',
    target: 'Delivery Boys',
    type: 'Scheduled',
    sentAt: '2026-07-27 05:00 PM',
    reachCount: 120,
    status: 'Scheduled'
  }
];

export function NotificationsManagementPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<PushNotification['target']>('All Customers');
  const [type, setType] = useState<PushNotification['type']>('Instant');
  const [imageUrl, setImageUrl] = useState('');
  const [deepLink, setDeepLink] = useState('jaipurgifting://shop/diwali');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif: PushNotification = {
      id: `NOTIF-${Date.now()}`,
      title,
      body,
      target,
      type,
      sentAt: type === 'Instant' ? 'Just now' : 'Today at 5:00 PM',
      reachCount: target === 'All Customers' ? 15000 : 150,
      status: type === 'Instant' ? 'Delivered' : 'Scheduled'
    };
    setNotifications([newNotif, ...notifications]);
    setIsModalOpen(false);
    setTitle('');
    setBody('');
    setImageUrl('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Push Notifications (FCM)</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
              Firebase Cloud Messaging
            </span>
          </div>
          <p className="text-sm text-slate-500">Send instant or scheduled push alerts to customers and delivery partners.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Send className="h-4 w-4" /> Send Notification
        </button>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Notification Title & Body</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Delivery Time</th>
                <th className="py-3 px-4">Reach</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {notifications.map(notif => (
                <tr key={notif.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 max-w-md">
                    <p className="font-bold text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{notif.body}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {notif.target}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-700">{notif.type}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{notif.sentAt}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{notif.reachCount.toLocaleString()} devices</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${notif.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {notif.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Send Push Notification (FCM)</h3>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ⚡ Flash Sale Live!"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write message description..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="Delivery Boys">Delivery Boys</option>
                    <option value="Specific Zone">Specific Zone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dispatch Mode</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                  >
                    <option value="Instant">Instant (Now)</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <ImageUploadField
                label="Notification Rich Image (Optional)"
                value={imageUrl}
                onChange={setImageUrl}
                description="Banner image shown in expanded push notification"
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deep Link / Action URL</label>
                <input
                  type="text"
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Send via FCM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
