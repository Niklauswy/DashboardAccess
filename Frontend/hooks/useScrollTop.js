import { useState, useEffect } from 'react';

export function useScrollTop(threshold = 300) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = () => {
    setShowBackToTop(window.scrollY > threshold);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return { showBackToTop, scrollToTop };
}
