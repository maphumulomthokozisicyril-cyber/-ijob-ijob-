import React, { useState } from "react";
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, DollarSign, Briefcase, Tag, AlertCircle } from "lucide-react";
import { KanbanTask, TargetField } from "../types";

interface KanbanTrackerProps {
  tasks: KanbanTask[];
  onTasksChange: (tasks: KanbanTask[]) => void;
  selectedIndustry: TargetField;
}

export default function KanbanTracker({
  tasks,
  onTasksChange,
  selectedIndustry,
}: KanbanTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [industry, setIndustry] = useState<TargetField>(selectedIndustry);
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    const newTask: KanbanTask = {
      id: Math.random().toString(36).substr(2, 9),
      companyName: companyName.trim(),
      roleTitle: roleTitle.trim(),
      industry,
      column: "Applied",
      salary: salary.trim() || undefined,
      notes: notes.trim() || undefined,
      dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    onTasksChange([...tasks, newTask]);

    // Reset Form
    setCompanyName("");
    setRoleTitle("");
    setSalary("");
    setNotes("");
    setShowAddForm(false);
  };

  const moveTask = (id: string, direction: "left" | "right") => {
    const updated = tasks.map((task) => {
      if (task.id !== id) return task;

      let newColumn: "Applied" | "Interviewing" | "Offered" = task.column;
      if (task.column === "Applied" && direction === "right") {
        newColumn = "Interviewing";
      } else if (task.column === "Interviewing" && direction === "left") {
        newColumn = "Applied";
      } else if (task.column === "Interviewing" && direction === "right") {
        newColumn = "Offered";
      } else if (task.column === "Offered" && direction === "left") {
        newColumn = "Interviewing";
      }

      return { ...task, column: newColumn };
    });

    onTasksChange(updated);
  };

  const deleteTask = (id: string) => {
    onTasksChange(tasks.filter((t) => t.id !== id));
  };

  const columns: Array<{ title: "Applied" | "Interviewing" | "Offered"; bg: string; text: string }> = [
    { title: "Applied", bg: "bg-neutral-100/70 border-neutral-200", text: "text-neutral-700" },
    { title: "Interviewing", bg: "bg-sky-50/40 border-sky-100", text: "text-sky-800" },
    { title: "Offered", bg: "bg-emerald-50/40 border-emerald-100", text: "text-emerald-800" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs" id="kanban-tracker-utility">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-bold font-display text-neutral-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-neutral-850" /> Universal Kanban Board
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your recruitment stages across multiple companies and industries.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-neutral-900 hover:bg-neutral-850 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Add New Application Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                required
                placeholder="Google, Stripe, etc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Role Title</label>
              <input
                type="text"
                required
                placeholder="Product QA Lead, Account Rep..."
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Target Field</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as TargetField)}
                className="w-full bg-white px-2 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              >
                <option value="Customer Service/Call Center">Customer Service/Call Center</option>
                <option value="Tech/IT">Tech/IT</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Administrative">Administrative</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Comp / Salary (Optional)</label>
              <input
                type="text"
                placeholder="$90k, $45/hr"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">Notes or Follow-up Date (Optional)</label>
            <input
              type="text"
              placeholder="E.g., Spoke with Jane. Need to submit screening questions by Friday."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-bold px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Add Card
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ title, bg, text }) => {
          const columnTasks = tasks.filter((t) => t.column === title);

          return (
            <div key={title} className={`rounded-2xl border p-4 ${bg} flex flex-col min-h-[350px]`}>
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${text}`}>
                  {title}
                </span>
                <span className="bg-white/80 border border-neutral-200 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              {/* Card List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div className="border border-dashed border-neutral-200 rounded-xl p-6 text-center text-[11px] text-neutral-400 font-medium">
                    No cards here.
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-xl border border-neutral-150 p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 group">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs font-extrabold text-neutral-900 leading-tight">
                            {task.companyName}
                          </h4>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          {task.roleTitle}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="bg-neutral-50 border border-neutral-150 text-[9px] font-bold text-neutral-500 px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-mono">
                          <Tag className="w-2.5 h-2.5" /> {task.industry}
                        </span>
                        {task.salary && (
                          <span className="bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-700 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            <DollarSign className="w-2.5 h-2.5 shrink-0" /> {task.salary}
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-[10px] leading-relaxed text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                        <span className="text-[9px] text-neutral-400 flex items-center gap-1 font-medium font-mono">
                          <Calendar className="w-2.5 h-2.5" /> Added {task.dateAdded}
                        </span>

                        {/* Move Card Buttons */}
                        <div className="flex gap-1.5">
                          {task.column !== "Applied" && (
                            <button
                              onClick={() => moveTask(task.id, "left")}
                              className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 p-1 rounded-md transition-colors"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {task.column !== "Offered" && (
                            <button
                              onClick={() => moveTask(task.id, "right")}
                              className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 p-1 rounded-md transition-colors"
                              title="Move forward"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
