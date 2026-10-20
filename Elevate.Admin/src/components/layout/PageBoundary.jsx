import { Component } from 'react'
import { Button, Card } from '../ui/index.js'

export default class PageBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('[PageBoundary] 페이지 표시 실패', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="ea-container ea-section">
          <Card className="space-y-4 py-12 text-center">
            <p role="alert">페이지를 표시하지 못했습니다. 연결 상태를 확인한 뒤 새로고침해 주세요.</p>
            <Button onClick={() => window.location.reload()}>새로고침</Button>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
