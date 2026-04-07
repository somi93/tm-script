# Tactics Page – Task List

## In Progress
- [ ] Fix normalization bug — only normalize touched rows; fix getTargetRanks (1→C, 2→CL+CR, 3→CL+C+CR)
- [ ] Ghost placeholders — visibility:hidden by default, shown only during drag (fieldEl.is-dragging class)
- [ ] Remove tabs — replace with 3-col layout: field | player list | settings+orders
- [ ] Field height = 100dvh, width auto from aspect-ratio 2/3
- [ ] Player list ordering: starters by posIndex asc, then SUB1-5, then rest (no chip)
- [ ] Player list position column = formation position (e.g., DC playing DMC shows DMC chip); native pos moved right

## Done
- [x] 2-col layout (field+bench left, squad table right)
- [x] SVG pitch background (280x420, centered lines, penalty areas)
- [x] 5-col pitch grid with getVisualCols (GK center, FWD only CL/C/CR, rest all 5)
- [x] Remove page header
- [x] Remove TmSectionCard wrapper
- [x] Full-width override
- [x] Bench below field (grid layout)
- [x] DnD (field↔field, field↔bench, sidebar→field/bench)
- [x] r5/routine from TmPlayerDB
- [x] normalizeField skeleton (symmetric centering per row)
