import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  children: string;
  className?: string;
  component?: React.ElementType;
  [key: string]: any;
}

const MathRenderer: React.FC<MathRendererProps> = ({ 
  children, 
  className,
  component: Component = 'span',
  ...props 
}) => {
  if (!children) return <Component className={className} {...props}></Component>;

  const processText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let partKey = 0;

    // Find block math ($$...$$) first
    const blockMathRegex = /\$\$([^$]+)\$\$/g;
    let blockMatch: RegExpExecArray | null;
    const blockMatches: Array<{ start: number; end: number; content: string }> = [];

    while ((blockMatch = blockMathRegex.exec(text)) !== null) {
      blockMatches.push({
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length,
        content: blockMatch[1].trim()
      });
    }

    // Find inline math ($...$) but exclude block math areas
    const inlineMathRegex = /\$([^$]+)\$/g;
    let inlineMatch: RegExpExecArray | null;
    const inlineMatches: Array<{ start: number; end: number; content: string }> = [];

    while ((inlineMatch = inlineMathRegex.exec(text)) !== null) {
      // Check if this inline match is inside a block match
      const isInsideBlock = blockMatches.some(block => 
        inlineMatch!.index >= block.start && inlineMatch!.index < block.end
      );
      
      if (!isInsideBlock) {
        inlineMatches.push({
          start: inlineMatch.index,
          end: inlineMatch.index + inlineMatch[0].length,
          content: inlineMatch[1].trim()
        });
      }
    }

    // Combine and sort all matches
    const allMatches = [
      ...blockMatches.map(m => ({ ...m, type: 'block' as const })),
      ...inlineMatches.map(m => ({ ...m, type: 'inline' as const }))
    ].sort((a, b) => a.start - b.start);

    // Process the text with math expressions
    allMatches.forEach((match) => {
      // Add text before the math expression
      if (lastIndex < match.start) {
        const textBefore = text.slice(lastIndex, match.start);
        if (textBefore) {
          parts.push(<span key={partKey++}>{textBefore}</span>);
        }
      }

      // Add the math expression
      try {
        if (match.type === 'block') {
          parts.push(
            <div key={partKey++} style={{ margin: '8px 0', textAlign: 'center' }}>
              <BlockMath math={match.content} />
            </div>
          );
        } else {
          parts.push(
            <InlineMath key={partKey++} math={match.content} />
          );
        }
      } catch (error) {
        // If KaTeX fails to parse, show the original text
        console.warn('Failed to parse math:', match.content, error);
        parts.push(<span key={partKey++}>{text.slice(match.start, match.end)}</span>);
      }

      lastIndex = match.end;
    });

    // Add any remaining text after the last math expression
    if (lastIndex < text.length) {
      const textAfter = text.slice(lastIndex);
      if (textAfter) {
        parts.push(<span key={partKey++}>{textAfter}</span>);
      }
    }

    // If no math was found, return the original text
    if (parts.length === 0) {
      return text;
    }

    return parts;
  };

  const processedContent = processText(children);

  return (
    <Component className={className} {...props}>
      {processedContent}
    </Component>
  );
};

export default MathRenderer; 