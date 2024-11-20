// /components/providers/theme-provider.tsx
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <NextThemeProvider defaultTheme="light" attribute="class">
      {children}
    </NextThemeProvider>
  );
};

export default ThemeProvider;