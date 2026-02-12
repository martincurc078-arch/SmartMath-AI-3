import React, { useEffect, useState } from 'react';
import katex from 'katex';

interface KaTeXRendererProps {
  expression: string;
  block?: boolean;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ expression, block = false, className = '' }) => {
  const [html, setHtml] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // renderToString does not check for quirks mode, unlike render
      const rendered = katex.renderToString(expression, {
        throwOnError: false,
        displayMode: block,
        strict: false,
        trust: true,
      });
      setHtml(rendered);
      setHasError(false);
    } catch (e) {
      console.error("KaTeX rendering error:", e);
      setHasError(true);
    }
  }, [expression, block]);

  if (hasError) {
    return <span className={`font-mono text-sm ${className}`}>{expression}</span>;
  }

  // Use div for block mode to ensure proper spacing, span for inline
  const Component = block ? 'div' : 'span';
  
  return <Component className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};