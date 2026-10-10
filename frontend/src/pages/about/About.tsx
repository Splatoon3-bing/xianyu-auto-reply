/**
 * 关于页面：品牌、当前版本与主要功能
 */
import { useEffect } from 'react'
import { BarChart3, Bell, Bot, MessageSquare, Truck, UserCheck } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandMark'
import { useVersionStore } from '@/store/versionStore'

const FEATURES = [
  { title: '多账号管理', desc: '多个账号集中托管、统一监控在线状态', icon: UserCheck },
  { title: '关键词回复', desc: '按关键词与商品匹配，自动回复买家', icon: MessageSquare },
  { title: 'AI 回复', desc: '接入大模型处理关键词覆盖不到的问题', icon: Bot },
  { title: '自动发货', desc: '买家付款后自动确认发货并发送卡券', icon: Truck },
  { title: '消息通知', desc: '新消息、新订单推送到常用渠道', icon: Bell },
  { title: '数据统计', desc: '订单金额与回复量趋势一目了然', icon: BarChart3 },
]

export function About() {
  const { currentVersion, fetchCurrentVersion } = useVersionStore()

  useEffect(() => {
    fetchCurrentVersion()
  }, [fetchCurrentVersion])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="vben-card">
        <div className="vben-card-body flex flex-col sm:flex-row sm:items-center gap-4">
          <BrandLogo size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">IceGod</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">闲鱼店铺自动回复与自动发货托管</p>
          </div>
          {currentVersion && (
            <span className="badge-gray self-start sm:self-center font-mono">v{currentVersion}</span>
          )}
        </div>
      </div>

      <div className="vben-card">
        <div className="vben-card-header">
          <h2 className="vben-card-title">主要功能</h2>
        </div>
        <div className="vben-card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="stat-icon-primary w-9 h-9">
                  <feature.icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{feature.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}