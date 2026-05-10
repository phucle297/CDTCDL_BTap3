'use client';

import { Component, ReactNode } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { PropertyPanel } from '@/components/PropertyPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './page.module.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Editor crashed</h2>
          <button onClick={() => this.setState({ hasError: false })}>Retry</button>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  useKeyboardShortcuts();

  return (
    <ErrorBoundary>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>SVG Graphic Editor</h1>
        </header>
        <div className={styles.editorLayout}>
          <Toolbar />
          <Canvas />
          <PropertyPanel />
        </div>
      </main>
    </ErrorBoundary>
  );
}
