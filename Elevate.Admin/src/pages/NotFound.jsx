import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Card from '../components/Card.jsx'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fadeIn">
      <Card colorScheme="orange" className="max-w-md mx-auto">
        <div className="space-y-4 py-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-ms-orange/10">
              <AlertCircle className="w-12 h-12 text-ms-orange" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">페이지를 찾을 수 없습니다</h2>
          <p className="text-sm text-slate-500">요청하신 페이지가 존재하지 않습니다.</p>
          <Link
            to="/posts"
            className="inline-block rounded-lg bg-ms-blue px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-ms-blue/90 hover:shadow-glass-hover hover:-translate-y-0.5"
          >
            포스트 목록으로
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default NotFound
