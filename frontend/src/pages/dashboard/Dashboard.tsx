import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Calendar, MessageSquare, RefreshCw, Shield, ShoppingCart, Users, Package, Clock, DollarSign } from 'lucide-react'
import { getAccountStats } from '@/api/accounts'
import { type AdminStats, type TodayStats, getAdminStats, getTodayStats } from '@/api/admin'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { OrderAmountChart } from '@/components/common/OrderAmountChart'

interface DashboardStats {
  totalAccounts: number
  totalKeywords: number
  activeAccounts: number
  totalOrders: number
  todayReplyCount: number
  yesterdayReplyCount: number
  accountLimit: number | null
  usedAccountCount: number
  remainingAccountCount: number | null
}

export function Dashboard() {
  const { addToast } = useUIStore()
  const { isAuthenticated, token, _hasHydrated, user } = useAuthStore()
  const [statsLoading, setStatsLoading] = useState(true)
  const [adminStatsLoading, setAdminStatsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalAccounts: 0,
    totalKeywords: 0,
    activeAccounts: 0,
    totalOrders: 0,
    todayReplyCount: 0,
    yesterdayReplyCount: 0,
    accountLimit: null,
    usedAccountCount: 0,
    remainingAccountCount: null,
  })
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null)

  /** 加载基础统计数据 */
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      
      // 调用后端统计接口，一次性获取所有统计数据
      const statsData = await getAccountStats()
      
      setStats({
        totalAccounts: statsData.total_accounts,
        totalKeywords: statsData.total_keywords,
        activeAccounts: statsData.active_accounts,
        totalOrders: statsData.total_orders,
        todayReplyCount: statsData.today_reply_count,
        yesterdayReplyCount: statsData.yesterday_reply_count,
        accountLimit: statsData.account_limit ?? user?.account_limit ?? null,
        usedAccountCount: statsData.used_account_count,
        remainingAccountCount: statsData.remaining_account_count ?? null,
      })
    } catch (error) {
      addToast({ type: 'error', message: '加载统计数据失败' })
    } finally {
      setStatsLoading(false)
    }
  }

  /** 加载管理员统计数据 */
  const loadAdminStats = async () => {
    if (!user?.is_admin) {
      setAdminStatsLoading(false)
      return
    }
    try {
      setAdminStatsLoading(true)
      const [adminResult, todayResult] = await Promise.all([
        getAdminStats(),
        getTodayStats(),
      ])
      if (adminResult.success && adminResult.data) {
        setAdminStats(adminResult.data)
      }
      if (todayResult.success && todayResult.data) {
        setTodayStats(todayResult.data)
      }
    } catch {
      // ignore
    } finally {
      setAdminStatsLoading(false)
    }
  }

  /** 加载所有数据（异步独立加载） */
  const loadDashboard = () => {
    if (!_hasHydrated || !isAuthenticated || !token) return
    
    // 异步独立加载各个模块，不互相等待
    loadStats()
    loadAdminStats()
  }

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !token) return
    loadDashboard()
  }, [_hasHydrated, isAuthenticated, token])

  /** 核心指标：首屏主角，只放运营每天最先看的 4 个数 */
  const primaryCards = [
    { icon: Users, label: '账号总数', value: stats.totalAccounts, hint: `启用 ${stats.activeAccounts}` },
    { icon: Activity, label: '启用账号', value: stats.activeAccounts, hint: stats.totalAccounts ? `占比 ${Math.round((stats.activeAccounts / stats.totalAccounts) * 100)}%` : '暂无账号' },
    { icon: MessageSquare, label: '今日回复', value: stats.todayReplyCount, hint: `昨日 ${stats.yesterdayReplyCount}` },
    { icon: ShoppingCart, label: '订单总数', value: stats.totalOrders, hint: '累计' },
  ]

  /** 次要指标：额度与配置，压缩为一条信息带 */
  const secondaryItems = [
    { label: '关键词', value: stats.totalKeywords },
    { label: '昨日回复', value: stats.yesterdayReplyCount },
    { label: '账号额度', value: stats.accountLimit ?? '不限' },
    { label: '已用额度', value: stats.usedAccountCount },
    { label: '剩余额度', value: stats.remainingAccountCount ?? '不限' },
  ]

  /** 骨架屏组件 */
  const SkeletonCard = () => (
    <div className="kpi-card animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-4" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="page-title">仪表盘</h1>
          <p className="page-description">账号、回复与订单的实时概况</p>
        </div>
        <button onClick={loadDashboard} className="btn-ios-secondary">
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading
          ? Array.from({ length: primaryCards.length }).map((_, index) => <SkeletonCard key={index} />)
          : primaryCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  className="kpi-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="kpi-label">{card.label}</span>
                    <span className="kpi-icon">
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="kpi-value">{card.value ?? '-'}</p>
                  <p className="kpi-hint">{card.hint}</p>
                </motion.div>
              )
            })}
      </div>

      {/* 次要指标信息带 */}
      {!statsLoading && (
        <div className="vben-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-slate-100 dark:divide-slate-700/70 lg:divide-x">
            {secondaryItems.map((item) => (
              <div key={item.label} className="px-4 py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Stats - 管理员专属 */}
      {user?.is_admin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="vben-card"
        >
          <div className="vben-card-header">
            <h2 className="vben-card-title flex items-center gap-2">
              <Shield className="w-4 h-4" />
              全局统计（管理员）
            </h2>
          </div>
          <div className="vben-card-body">
            {adminStatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : adminStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.total_users}</p>
                  <p className="text-sm text-slate-500">总用户数</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.total_cookies}</p>
                  <p className="text-sm text-slate-500">总账号数</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.active_cookies}</p>
                  <p className="text-sm text-slate-500">活跃账号</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.online_cookies ?? 0}</p>
                  <p className="text-sm text-slate-500">在线账号</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.password_configured}</p>
                  <p className="text-sm text-slate-500">已配置密码</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.total_cards}</p>
                  <p className="text-sm text-slate-500">总卡券数</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.total_keywords}</p>
                  <p className="text-sm text-slate-500">总关键词</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.total_orders}</p>
                  <p className="text-sm text-slate-500">总订单数</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.today_reply_count}</p>
                  <p className="text-sm text-slate-500">今日回复</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{adminStats.yesterday_reply_count}</p>
                  <p className="text-sm text-slate-500">昨日回复</p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* 订单金额趋势折线图（所有用户可见） */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <OrderAmountChart />
      </motion.div>

      {/* Today Stats - 今日统计（管理员专属） */}
      {user?.is_admin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="vben-card"
        >
          <div className="vben-card-header">
            <h2 className="vben-card-title flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              今日统计（管理员）
            </h2>
          </div>
          <div className="vben-card-body">
            {adminStatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : todayStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{todayStats.today_users}</p>
                  <p className="text-sm text-slate-500">今日新增用户</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{todayStats.today_accounts}</p>
                  <p className="text-sm text-slate-500">今日新增账号</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{todayStats.today_orders}</p>
                  <p className="text-sm text-slate-500">今日订单</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{todayStats.today_agent_orders ?? 0}</p>
                  <p className="text-sm text-slate-500">今日代销订单</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-blue-500 text-xl font-bold">￥</span>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">¥{todayStats.today_amount?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-slate-500">今日订单金额</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{todayStats.today_shipped}</p>
                  <p className="text-sm text-slate-500">今日已发货</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{todayStats.today_pending}</p>
                  <p className="text-sm text-slate-500">今日待处理</p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  )
}
