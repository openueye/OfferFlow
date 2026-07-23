'use client'
import { useState, useMemo } from 'react'
import { useApp } from '../store/AppContext'
import TaskModal from '../components/TaskModal'
import ConfirmDialog from '../components/ConfirmDialog'

const TYPE_STYLE = {
  面试: 'bg-blue-50 text-blue-700 dark:text-blue-400 border-blue-200',
  'OA / 笔试': 'bg-cyan-50 text-cyan-700 dark:text-cyan-400 border-cyan-200',
  Deadline: 'bg-red-50 text-red-700 dark:text-red-400 border-red-200',
  'Follow-up': 'bg-green-50 text-green-700 dark:text-green-400 border-green-200',
  准备任务: 'bg-purple-50 text-purple-700 dark:text-purple-400 border-purple-200',
  其他: 'bg-gray-100 text-gray-700 dark:text-white/45 border-gray-200',
}

const TYPE_DOT = {
  面试: 'bg-blue-500',
  'OA / 笔试': 'bg-cyan-500',
  Deadline: 'bg-red-500',
  'Follow-up': 'bg-green-500',
  准备任务: 'bg-purple-500',
  其他: 'bg-gray-500',
}

const PRIORITY_CLASS = {
  高: 'text-red-600 dark:text-red-400',
  中: 'text-amber-600 dark:text-amber-400',
  低: 'text-gray-500 dark:text-offer-muted',
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function isSameLocalDate(dateStr1, dateStr2) {
  try {
    const a = new Date(dateStr1)
    const b = new Date(dateStr2)
    return (
      !isNaN(a.getTime()) &&
      !isNaN(b.getTime()) &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  } catch {
    return false
  }
}

function formatWeekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[d.getDay()]
}

export default function Schedule() {
  const { jobs, tasks, addToast, updateTask, deleteTask } = useApp()

  const [viewMode, setViewMode] = useState('list')
  const [activeFilter, setActiveFilter] = useState('全部')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [defaultDate, setDefaultDate] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const today = todayStr()

  const jobMap = useMemo(() => {
    const map = {}
    jobs.forEach((j) => {
      map[j.id] = j
    })
    return map
  }, [jobs])

  // Filter tasks by type or date
  const filtered = useMemo(() => {
    if (activeFilter === '全部') return tasks
    if (activeFilter === '今天') {
      const now = new Date()
      return tasks.filter((t) => t.date && isSameLocalDate(t.date, now))
    }
    return tasks.filter((t) => t.type === activeFilter)
  }, [tasks, activeFilter])

  // Today incomplete tasks
  const todayTasks = useMemo(() => {
    return filtered
      .filter((t) => t.date === today && !t.done)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }, [filtered, today])

  // Next 7 days grouped
  const next7Days = useMemo(() => {
    const days = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayTasks = filtered
        .filter((t) => t.date === dateStr && !t.done)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      days.push({ date: dateStr, tasks: dayTasks })
    }
    return days
  }, [filtered])

  // Month calendar data
  const monthData = useMemo(() => {
    const { year, month } = currentMonth
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        day: d,
        dateStr,
        tasks: filtered.filter((t) => t.date === dateStr),
        isToday: dateStr === today,
      })
    }
    return cells
  }, [currentMonth, filtered, today])

  const filterOptions = useMemo(() => {
    const set = new Set(tasks.map((t) => t.type))
    return ['全部', '今天', ...Array.from(set)]
  }, [tasks])

  const monthLabel = `${currentMonth.year}年${currentMonth.month + 1}月`

  const navigateMonth = (delta) => {
    setCurrentMonth((prev) => {
      let m = prev.month + delta
      let y = prev.year
      if (m < 0) {
        m = 11
        y--
      } else if (m > 11) {
        m = 0
        y++
      }
      return { year: y, month: m }
    })
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setDefaultDate('')
    setModalOpen(true)
  }

  const handleDateClick = (dateStr) => {
    setEditingTask(null)
    setDefaultDate(dateStr)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTask(null)
    setDefaultDate('')
  }

  const handleDelete = async () => {
    await deleteTask(deletingId)
    setConfirmOpen(false)
    setDeletingId(null)
    addToast('事项已删除', 'success')
  }

  const toggleDone = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const newDone = !task.done
    await updateTask(id, { done: newDone })
    addToast(newDone ? '事项已完成' : '已取消完成', 'success')
  }

  const doneCount = filtered.filter((t) => t.done).length

  return (
    <div className="px-6 py-6">
      <div className="mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white">日程待办</h1>
        <p className="text-sm text-gray-400 dark:text-white/45 mt-1">管理你的求职日程和任务</p>
      </div>

      {/* Toolbar */}
      <div className="card-modern p-5 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${viewMode === 'list' ? 'border-purple-400/60 bg-purple-600/25 text-white font-semibold shadow-sm shadow-purple-950/20' : 'border-white/10 bg-white/[0.03] text-gray-300 dark:text-white/65 hover:bg-white/[0.07] hover:text-white'}`}
            >
              列表
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${viewMode === 'month' ? 'border-purple-400/60 bg-purple-600/25 text-white font-semibold shadow-sm shadow-purple-950/20' : 'border-white/10 bg-white/[0.03] text-gray-300 dark:text-white/65 hover:bg-white/[0.07] hover:text-white'}`}
            >
              月历
            </button>
          </div>

          {/* Type / date filter */}
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${activeFilter === f ? 'border-purple-400/60 bg-purple-600/25 text-white font-semibold shadow-sm shadow-purple-950/20' : 'border-white/10 bg-white/[0.03] text-gray-300 dark:text-white/65 hover:bg-white/[0.07] hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => handleDateClick(today)}
              className="btn-gradient h-9 px-4 rounded-lg text-white text-sm font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新建事项
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {/* Today */}
          <div className="card-modern p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">今天</h2>
              <span className="text-sm text-gray-500 dark:text-white/45">{today}</span>
            </div>
            <TaskCards
              tasks={todayTasks}
              jobMap={jobMap}
              onToggle={toggleDone}
              onEdit={handleEdit}
              onDelete={(id) => {
                setDeletingId(id)
                setConfirmOpen(true)
              }}
            />
          </div>

          {/* Next 7 Days */}
          <div className="card-modern p-5">
            <h2 className="text-base font-semibold text-white mb-4">未来 7 天</h2>
            <div className="space-y-5">
              {next7Days.map(({ date, tasks: dayTasks }) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-offer-muted font-medium">
                      {date} <span className="text-offer-muted/60 ml-1">{formatWeekday(date)}</span>
                    </h3>
                    <button
                      onClick={() => handleDateClick(date)}
                      className="text-xs text-offer-accent hover:text-offer-primary transition-colors"
                    >
                      + 添加
                    </button>
                  </div>
                  {dayTasks.length > 0 ? (
                    <TaskCards
                      tasks={dayTasks}
                      jobMap={jobMap}
                      compact
                      onToggle={toggleDone}
                      onEdit={handleEdit}
                      onDelete={(id) => {
                        setDeletingId(id)
                        setConfirmOpen(true)
                      }}
                    />
                  ) : (
                    <p className="text-xs text-offer-muted/50 py-2 text-center">暂无待办</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Done */}
          {doneCount > 0 && (
            <div className="card-modern p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">已完成</h2>
                <span className="text-sm text-gray-500 dark:text-white/45">{doneCount} 项</span>
              </div>
              <div className="space-y-1.5">
                {filtered
                  .filter((t) => t.done)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 30)
                  .map((t) => {
                    const job = t.jobId ? jobMap[t.jobId] : null
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] group hover:bg-white/[0.04] transition-colors"
                      >
                        <button
                          onClick={() => toggleDone(t.id)}
                          className="w-4 h-4 rounded-full border-2 border-offer-primary bg-offer-primary flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-offer-muted line-through truncate">
                            {t.title}
                          </p>
                          <p className="text-xs text-offer-muted/50">
                            {t.date}
                            {t.startTime ? ` ${t.startTime}` : ''}
                            {job ? ` · ${job.companyName}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Month View */
        <div className="card-modern p-5">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-offer-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-white font-semibold">{monthLabel}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-offer-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="text-center text-xs text-offer-muted py-2 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 border-t border-l border-white/5">
            {monthData.map((cell, i) => (
              <div
                key={i}
                onClick={() => cell && handleDateClick(cell.dateStr)}
                className={`min-h-[95px] border-r border-b border-white/5 p-1.5 cursor-pointer transition-colors hover:bg-white/[0.04] ${cell?.isToday ? 'bg-offer-primary/10 border-offer-primary/30' : ''}`}
              >
                {cell && (
                  <>
                    <div
                      className={`text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ${cell.isToday ? 'bg-offer-primary text-white font-bold' : 'text-offer-muted'}`}
                    >
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {cell.tasks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(t)
                          }}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] leading-tight truncate ${t.done ? 'opacity-40' : ''} ${TYPE_STYLE[t.type] || 'bg-gray-500/10 text-gray-400 dark:text-white/45 border-gray-500/20'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_DOT[t.type] || 'bg-gray-500'}`}
                          />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {cell.tasks.length > 3 && (
                        <div className="text-[10px] text-offer-muted/60 px-1">
                          +{cell.tasks.length - 3} 更多
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        task={editingTask}
        defaultDate={defaultDate}
        onClose={handleCloseModal}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="确认删除"
        message="确定要删除这个事项吗？此操作不可恢复。"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setDeletingId(null)
        }}
      />
    </div>
  )
}

/* ===== TaskCards component ===== */
function TaskCards({ tasks, jobMap, compact, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <div className="py-6 text-center text-offer-muted text-sm">暂无待办事项</div>
  }

  return (
    <div className="space-y-2">
      {tasks.map((t) => {
        const job = t.jobId ? jobMap[t.jobId] : null
        return (
          <div
            key={t.id}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-offer-primary/30 transition-all group"
          >
            {/* Checkbox */}
            <button
              onClick={() => onToggle(t.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${t.done ? 'border-offer-primary bg-offer-primary' : 'border-offer-muted hover:border-offer-accent'}`}
            >
              {t.done && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(t)}>
              <p
                className={`text-sm truncate ${t.done ? 'text-offer-muted line-through' : 'text-white'}`}
              >
                {t.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TYPE_STYLE[t.type] || 'bg-gray-500/10 text-gray-400 dark:text-white/45 border-gray-500/20'}`}
                >
                  {t.type}
                </span>
                {t.startTime && (
                  <span className="text-xs text-offer-muted">
                    {t.startTime}
                    {t.endTime ? `-${t.endTime}` : ''}
                  </span>
                )}
                {!compact && (
                  <span
                    className={`text-[10px] ${PRIORITY_CLASS[t.priority] || 'text-offer-muted'}`}
                  >
                    {t.priority}
                  </span>
                )}
                {job && (
                  <span className="text-[10px] text-offer-accent/70 truncate max-w-[130px]">
                    {job.companyName}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(t)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-offer-muted hover:text-white hover:bg-white/10 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-offer-muted hover:text-red-400 hover:bg-white/10 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
