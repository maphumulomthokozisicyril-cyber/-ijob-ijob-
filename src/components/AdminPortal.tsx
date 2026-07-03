import React, { useState, useEffect } from "react";
import { Users, BarChart3, TrendingUp, DollarSign, Activity, Star, CheckCircle, ShieldAlert, Zap, ArrowLeftRight } from "lucide-react";
import { User, TargetField } from "../types";

interface AdminPortalProps {
  onBackToDashboard: () => void;
}

export default function AdminPortal({ onBackToDashboard }: AdminPortalProps) {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Read actual registered users from localStorage
    const usersJson = localStorage.getItem("ijob_registered_users");
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Ensure we have some realistic seed data for display if empty
    if (users.length === 0) {
      const seedUsers: User[] = [
        { email: "sarah.connor@gmail.com", name: "Sarah Connor", industry: "Tech/IT", isPremium: true, registeredAt: new Date(Date.now() - 3600000 * 24).toISOString() },
        { email: "mike.ross@pearson.com", name: "Mike Ross", industry: "Finance", isPremium: false, registeredAt: new Date(Date.now() - 3600000 * 48).toISOString() },
        { email: "harvey.specter@specter.com", name: "Harvey Specter", industry: "Sales & Marketing", isPremium: true, registeredAt: new Date(Date.now() - 3600000 * 72).toISOString() },
        { email: "clara.oswald@healthcare.nhs", name: "Clara Oswald", industry: "Healthcare", isPremium: false, registeredAt: new Date(Date.now() - 3600000 * 96).toISOString() },
        { email: "admin@ijobijob.com", name: "Platform Admin", industry: "Tech/IT", isPremium: true, registeredAt: new Date(Date.now() - 3600000 * 120).toISOString() },
      ];
      localStorage.setItem("ijob_registered_users", JSON.stringify(seedUsers));
      setRegisteredUsers(seedUsers);
    } else {
      setRegisteredUsers(users);
    }
  }, []);

  const togglePremium = (email: string) => {
    const updated = registeredUsers.map((u) => {
      if (u.email === email) {
        return { ...u, isPremium: !u.isPremium };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem("ijob_registered_users", JSON.stringify(updated));

    // Also update current session if the current user matches
    const current = localStorage.getItem("ijob_current_user");
    if (current) {
      const currentUserObj: User = JSON.parse(current);
      if (currentUserObj.email === email) {
        currentUserObj.isPremium = !currentUserObj.isPremium;
        localStorage.setItem("ijob_current_user", JSON.stringify(currentUserObj));
      }
    }
  };

  // Compute stats
  const totalUsers = registeredUsers.length;
  const premiumUsers = registeredUsers.filter((u) => u.isPremium).length;
  const conversionRate = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const monthlyRevenue = premiumUsers * 19;

  // Compute Industry counts
  const industryCounts: Record<TargetField, number> = {
    "Customer Service/Call Center": 0,
    "Tech/IT": 0,
    "Sales & Marketing": 0,
    "Healthcare": 0,
    "Finance": 0,
    "Administrative": 0,
    "Hospitality": 0,
    "Other": 0,
  };

  registeredUsers.forEach((u) => {
    if (u.industry in industryCounts) {
      industryCounts[u.industry]++;
    } else {
      industryCounts["Other"]++;
    }
  });

  const filteredUsers = registeredUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="admin-analytics-portal">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-sm border border-red-100 uppercase tracking-widest font-mono">
            SECURE ADM-PORTAL
          </span>
          <h1 className="text-xl font-bold font-display text-neutral-900 mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" /> Platform Operations Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time analytics and user management portal for admin@ijobijob.com.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
        >
          Return to Member Workspace
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-950" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Registered Leads</span>
              <span className="text-3xl font-extrabold text-neutral-900 font-mono mt-2 block">{totalUsers}</span>
            </div>
            <div className="bg-neutral-100 p-2.5 rounded-xl border border-neutral-200">
              <Users className="w-5 h-5 text-neutral-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Premium Passes</span>
              <span className="text-3xl font-extrabold text-neutral-900 font-mono mt-2 block">{premiumUsers}</span>
            </div>
            <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100">
              <Zap className="w-5 h-5 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Monthly Revenue</span>
              <span className="text-3xl font-extrabold text-neutral-900 font-mono mt-2 block">${monthlyRevenue}</span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Conversion rate</span>
              <span className="text-3xl font-extrabold text-neutral-900 font-mono mt-2 block">{conversionRate}%</span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Industry Breakdowns */}
        <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs lg:col-span-1">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-neutral-600" /> Field Popularity Analysis
          </h3>
          <div className="space-y-4">
            {Object.entries(industryCounts).map(([ind, count]) => {
              const maxVal = Math.max(...Object.values(industryCounts), 1);
              const barWidth = Math.round((count / maxVal) * 100);

              return (
                <div key={ind} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-neutral-800">
                    <span className="truncate max-w-[200px]">{ind}</span>
                    <span className="font-mono bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded-md text-[10px]">
                      {count} {count === 1 ? "lead" : "leads"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2.5 rounded-lg overflow-hidden">
                    <div
                      className="bg-neutral-900 h-full transition-all duration-500 rounded-lg"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Management List */}
        <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs lg:col-span-2 flex flex-col h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 mb-4 border-b border-neutral-100 shrink-0">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-neutral-600" /> Platform Registration Log ({registeredUsers.length})
            </h3>
            
            <input
              type="text"
              placeholder="Filter leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:border-neutral-950 w-full sm:w-48"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden border border-neutral-150 rounded-xl">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50 text-[10px] uppercase tracking-wider font-mono font-bold text-neutral-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left">User details</th>
                      <th className="px-4 py-2.5 text-left">Industry Field</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white text-xs text-neutral-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-400 font-medium">
                          No registration leads match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.email} className="hover:bg-neutral-50/50">
                          <td className="px-4 py-3">
                            <div className="font-bold text-neutral-900">{user.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{user.email}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-800">
                            {user.industry}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.isPremium
                                ? "bg-sky-50 text-sky-700 border border-sky-100"
                                : "bg-neutral-50 text-neutral-600 border border-neutral-200"
                            }`}>
                              {user.isPremium ? (
                                <>
                                  <Zap className="w-3 h-3 fill-sky-600" /> Premium
                                </>
                              ) : (
                                "Free Plan"
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => togglePremium(user.email)}
                              className="text-[10px] bg-neutral-950 hover:bg-neutral-850 text-white font-bold py-1 px-2 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                            >
                              <ArrowLeftRight className="w-2.5 h-2.5" /> Plan Toggle
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
