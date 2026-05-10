'use client';

import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { PropertyPanel } from '@/components/PropertyPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './page.module.css';

export default function Home() {
  useKeyboardShortcuts();

  return (
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
  );
}
