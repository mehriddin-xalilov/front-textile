import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Sahifa almashganda tepaga qaytaradi.
 * Brauzerning "orqaga/oldinga" tugmasida esa avvalgi joy saqlanadi (POP).
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, navType]);

  return null;
};
