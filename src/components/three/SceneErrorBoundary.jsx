import { Component } from 'react'

/**
 * SceneErrorBoundary
 *
 * Contains failures from a 3D scene (chunk load, WebGL context creation,
 * or errors thrown inside the R3F tree) so they never blank the page.
 * Renders the provided static fallback instead.
 */
export default class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('SceneErrorBoundary: 3D scene failed, showing fallback', error, info)
    if (typeof this.props.onError === 'function') {
      this.props.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
