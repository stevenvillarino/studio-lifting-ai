'use client';

   import React, { useEffect, useRef } from 'react';
   import mermaid from 'mermaid';

   // Define a unique ID for the Mermaid container
   const MERMAID_DOM_ID = 'mermaid-diagram-container';

   interface MermaidDiagramProps {
     chart: string; // The Mermaid diagram definition string
   }

   // Basic configuration for Mermaid
   mermaid.initialize({
     startOnLoad: false, // We will manually trigger rendering
     theme: 'default', // Or 'dark', 'forest', 'neutral'
     // securityLevel: 'loose', // If you need to load external resources, consider security implications
   });

   const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
     const containerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
       if (containerRef.current && chart) {
         // Clear previous diagram before rendering a new one
         const renderMermaid = async () => {
           try {
             if (!containerRef.current) return;
             containerRef.current.innerHTML = ''; // Clear previous
             const { svg } = await mermaid.render(MERMAID_DOM_ID, chart); // Await and destructure
             if (containerRef.current) { // Check again in case component unmounted
               containerRef.current.innerHTML = svg;
               // Potentially call bindFunctions if it's part of the RenderResult and needed
             }
           } catch (error) {
             console.error('Mermaid rendering error:', error);
             if (containerRef.current) { // Check again
               containerRef.current.innerHTML = 'Error rendering diagram.';
             }
           }
         };
         renderMermaid();
       }
     }, [chart]);

     // If using mermaid.render, the SVG is inserted into the div by mermaid itself.
     // The containerRef div needs to exist with the content (chart definition) for mermaid.render to find it.
     // A more robust approach for React is to use the callback of mermaid.render to set the SVG content.
     // The div below is where the SVG will be placed.
     return <div ref={containerRef} id={MERMAID_DOM_ID} className="mermaid-diagram">{/* Mermaid chart will be rendered here */}</div>;
   };

   export default MermaidDiagram;
