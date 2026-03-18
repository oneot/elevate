import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Card from '../components/Card.jsx'
import { getAnalyticsSummary } from '../lib/analyticsApi.js'
import { isApiConfigured } from '../lib/apiClient.js'
import { useAuth } from '../hooks/useAuth.js'

function Dashboard() {
  const { msalInstance } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const summary = await getAnalyticsSummary({ msalInstance })
        if (isMounted) setData(summary)
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [msalInstance])

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Card className="py-12 text-center">
          <div className="space-y-2">
            <div className="inline-block w-8 h-8 border-4 border-neutral-200 border-t-ms-blue rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-500 mt-2">통계 불러오는 중...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200/50 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
        데이터를 불러올 수 없습니다: {error}
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {!isApiConfigured ? (
        <div className="rounded-lg border border-amber-200/50 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
          API가 아직 연결되지 않아 Mockup 통계를 보여주고 있습니다.
        </div>
      ) : null}

      <div>
        <h2 className="text-3xl font-bold text-gradient">Dashboard</h2>
        <p className="text-sm text-neutral-500 mt-1">블로그 트래픽 및 주요 통계</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col items-center justify-center py-6">
          <p className="text-sm text-neutral-500 font-medium tracking-wide">누적 페이지뷰 (PV)</p>
          <p className="text-3xl font-bold text-ms-blue mt-2">{data?.totalPv.toLocaleString()}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <p className="text-sm text-neutral-500 font-medium tracking-wide">순 방문자 (UV)</p>
          <p className="text-3xl font-bold text-ms-green mt-2">{data?.totalUv.toLocaleString()}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <p className="text-sm text-neutral-500 font-medium tracking-wide">평균 페이지 체류시간</p>
          <p className="text-3xl font-bold text-neutral-800 mt-2">{data?.avgTimeOnPage}</p>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card colorScheme="blue" className="space-y-6">
          <h3 className="text-lg font-semibold text-neutral-800">일간 트래픽 추이 (최근 7일)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyTrend || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0F6CBD' }}
                />
                <Line type="monotone" dataKey="pv" stroke="#0F6CBD" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card colorScheme="slate" className="space-y-6 h-full">
          <h3 className="text-lg font-semibold text-neutral-800">인기 포스트</h3>
          <ul className="space-y-4">
            {(data?.topPosts || []).map((post, index) => (
              <li key={post.slug} className="flex flex-col gap-1 pb-3 border-b border-neutral-100 last:border-0">
                <div className="text-sm font-medium text-neutral-900 line-clamp-1 flex gap-2">
                  <span className="text-neutral-400 font-bold w-4">{index + 1}.</span> 
                  {post.title}
                </div>
                <div className="text-xs text-neutral-500 ml-6 flex justify-between items-center">
                  <span>/{post.slug}</span>
                  <span className="font-semibold text-ms-blue">{post.views.toLocaleString()} views</span>
                </div>
              </li>
            ))}
            {(!data?.topPosts || data.topPosts.length === 0) && (
              <p className="text-sm text-neutral-500">데이터가 없습니다.</p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
