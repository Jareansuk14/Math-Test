import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, styled } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const MathDisplay = styled('div')<{ multiline?: boolean; rows?: number }>(({ multiline, rows }) => ({
  position: 'absolute',
  top: '16.5px',
  left: '14px',
  right: '14px',
  bottom: '16.5px',
  pointerEvents: 'none',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '1rem',
  lineHeight: 1.4375,
  color: 'rgba(0, 0, 0, 0.87)',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  overflow: 'hidden',
  zIndex: 2,
  display: 'flex',
  alignItems: multiline ? 'flex-start' : 'center',
  minHeight: multiline && rows ? `${rows * 1.4375 + 0.5}rem` : 'auto',
  paddingTop: multiline ? '4px' : '0',
}));

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  required?: boolean;
  sx?: any;
}

const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  multiline = false,
  rows,
  fullWidth = false,
  required = false,
  sx,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayHeight, setDisplayHeight] = useState<number | undefined>();
  const textFieldRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure the height of rendered math content
  useEffect(() => {
    if (!isFocused && value && value.includes('$') && measureRef.current) {
      const height = measureRef.current.scrollHeight;
      setDisplayHeight(height);
    }
  }, [value, isFocused]);

  const processText = (text: string) => {
    if (!text || (!text.includes('$') && !isFocused)) {
      return text;
    }

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
            <div key={partKey++} style={{ margin: '4px 0', textAlign: 'center' }}>
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

  const processedContent = processText(value);

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      {/* Hidden element to measure content height */}
      {!isFocused && value && value.includes('$') && (
        <Box
          ref={measureRef}
          sx={{
            position: 'absolute',
            visibility: 'hidden',
            top: 0,
            left: 0,
            right: 0,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: '1rem',
            lineHeight: 1.4375,
            padding: '16.5px 14px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            zIndex: -1,
          }}
        >
          {processedContent}
        </Box>
      )}
      
      <TextField
        ref={textFieldRef}
        fullWidth={fullWidth}
        label={label}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: displayHeight && displayHeight > 56 ? `${displayHeight + 33}px` : 'auto',
          },
          '& .MuiInputBase-input': {
            color: isFocused ? 'rgba(0, 0, 0, 0.87)' : 'transparent',
            caretColor: 'rgba(0, 0, 0, 0.87)',
          },
          '& .MuiInputBase-input:focus': {
            color: 'rgba(0, 0, 0, 0.87)',
          }
        }}
      />
      {!isFocused && value && (
        <MathDisplay multiline={multiline} rows={rows}>
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: multiline ? 'flex-start' : 'center',
            alignItems: 'flex-start',
            gap: 0.5
          }}>
            {processedContent}
          </Box>
        </MathDisplay>
      )}
    </Box>
  );
};

export default MathInput; 