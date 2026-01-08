import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fade-enter');
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation.current) {
      setTransitionStage('fade-exit');
    }
  }, [location]);

  useEffect(() => {
    if (transitionStage === 'fade-exit') {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('fade-enter');
        prevLocation.current = location.pathname;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children, location.pathname]);

  return (
    <div className={`page-transition ${transitionStage}`}>
      {displayChildren}
    </div>
  );
}

// Simple fade transition wrapper for individual components
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`fade-in-element ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Stagger animation for lists
interface StaggerListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggerList({ children, staggerDelay = 50, className = '' }: StaggerListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
