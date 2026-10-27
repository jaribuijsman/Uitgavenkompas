/* Memento illustrated icon system v1 — original SVG artwork, no fonts, letters, networks or persistent state. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoIllustratedIcons=api;})(globalThis,()=>{
"use strict";
const E="#102c22",D="#1a392b",F="#315d45",S="#7faa85",L="#c1d9b1",G="#e8bd76",Y="#ffe0a2",W="#815438",P="#e5d8ac",C="#478078";
const base='<ellipse cx="32" cy="54" rx="22" ry="4" fill="#09291e" opacity=".46"/><path d="M12 48Q10 37 7 35q7 0 10 10M53 48q1-12 7-15-9 1-11 12" fill="'+F+'" stroke="'+E+'" stroke-width="1.5"/><path d="M12 46q7-9 11-8M51 46q-7-8-11-7" fill="none" stroke="'+S+'" stroke-width="1.7"/><path d="M19 49q-1-8-8-11M44 49q4-10 11-12" fill="none" stroke="'+L+'" stroke-width="1.2" opacity=".7"/>';
const helpers={
 sheet:'<path d="M13 12h38v40H13z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M19 20h24M19 27h20M19 34h24M19 41h16" fill="none" stroke="'+W+'" stroke-width="2" stroke-linecap="round"/>',
 book:'<path d="M11 15q9-6 20 0 10-6 22 0v33q-12-6-22 1-10-7-20-1z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M31 16v32M16 21q6-2 10 0m-10 6q6-2 10 0m12-6q6-2 10 0m-10 6q6-2 10 0" fill="none" stroke="'+W+'" stroke-width="1.7"/>',
 flame:'<path d="M32 10q11 13 4 19 10-4 7 11-5 12-14 11-13-1-13-13 1-9 8-12-3 9 5 10Q24 22 32 10z" fill="'+G+'" stroke="'+W+'" stroke-width="2"/><path d="M30 29q7 9 1 16-8-2-4-12z" fill="'+Y+'"/>',
 star:'<path d="m32 8 7.7 15.7 17.3 2.5-12.5 12.2 3 17.3L32 47.4 16.5 55.7l3-17.3L7 26.2l17.3-2.5z" fill="'+G+'" stroke="'+W+'" stroke-width="2.5"/><path d="m32 16 5 12 13 1-11 9 2 12-9-7-11 7 2-12-9-9 13-1z" fill="'+Y+'" opacity=".35"/>'
};
const artwork={
 folder:'<path d="M8 24h18l6-7h23v32H8z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M12 29h39v16H12z" fill="'+G+'" stroke="'+W+'" stroke-width="2"/><path d="M15 32h31v4H15z" fill="'+Y+'" opacity=".56"/>',
 route:'<circle cx="32" cy="31" r="21" fill="'+W+'" stroke="'+E+'" stroke-width="3.5"/><circle cx="32" cy="31" r="17" fill="'+P+'" stroke="'+G+'" stroke-width="3"/><path d="M32 13v36M14 31h36" stroke="'+W+'" stroke-width="1.3" opacity=".7"/><path d="m32 17 5 15-12 14 4-17z" fill="'+C+'" stroke="'+E+'" stroke-width="1.8"/><path d="m32 17 0 15 12-9-15 5z" fill="'+G+'"/><circle cx="32" cy="31" r="3" fill="'+Y+'" stroke="'+W+'" stroke-width="1.5"/>',
 journal:'<path d="M17 8h28q4 0 4 5v39H16Q12 50 12 46V13q0-5 5-5z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M17 11h28v36H17z" fill="#a46d45"/><path d="M22 11v36" stroke="'+G+'" stroke-width="3"/><path d="M30 27q6-9 15-8-2 10-12 12-1 8-7 10" fill="'+S+'" stroke="'+D+'" stroke-width="1.8"/><path d="M28 13h13" stroke="'+Y+'" stroke-width="2.3" opacity=".7"/><path d="M14 18h6m-6 10h6m-6 10h6" stroke="'+G+'" stroke-width="2.6" stroke-linecap="round"/>',
 house:'<path d="M11 29 32 11l21 18v23H11z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M7 28 32 6l25 22-6 4-19-17-19 17z" fill="'+F+'" stroke="'+E+'" stroke-width="3"/><path d="M17 30h30v20H17z" fill="#9b6b43"/><path d="M21 34h10v10H21zM35 34h10v10H35z" fill="'+G+'" stroke="'+W+'" stroke-width="2"/><path d="M28 37h-4m16 0h-3" stroke="'+Y+'" stroke-width="1.5"/><path d="M28 50V40h8v10" fill="'+W+'" stroke="'+E+'" stroke-width="1.7"/>',
 "book-open":helpers.book,
 heart:'<path d="M32 50Q7 35 10 21q3-13 16-8l6 6 6-6q13-5 16 8 3 14-22 29z" fill="'+S+'" stroke="'+E+'" stroke-width="3"/><path d="M32 44Q14 32 16 23q1-8 9-4l7 6 7-6q8-4 9 4 2 9-16 21" fill="'+G+'" opacity=".7"/><path d="M18 21q5-7 11 3" stroke="'+Y+'" stroke-width="2" fill="none"/>',
 person:'<circle cx="32" cy="19" r="10" fill="'+P+'" stroke="'+W+'" stroke-width="2.7"/><path d="M11 51q0-20 21-20t21 20z" fill="'+S+'" stroke="'+E+'" stroke-width="3"/><path d="M20 41q12 8 24 0" fill="none" stroke="'+G+'" stroke-width="3"/>',
 lightbulb:'<path d="M20 25q0-14 12-14t12 14q0 9-7 16H27q-7-7-7-16z" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><path d="M25 25q2-10 10-10" fill="none" stroke="'+Y+'" stroke-width="3"/><path d="M28 41h8v7h-8z" fill="'+W+'" stroke="'+E+'" stroke-width="2"/><path d="M26 43h12m-11 5h10" stroke="'+P+'" stroke-width="2.4"/><path d="M32 3v5M12 15l5 4M52 15l-5 4M11 29h6M53 29h-6" stroke="'+G+'" stroke-width="2.7" stroke-linecap="round"/>',
 "folder-kanban":'<path d="M11 14h17l5 6h21v32H11z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M16 25h33v22H16z" fill="'+S+'" stroke="'+W+'" stroke-width="2"/><path d="M22 31v10M32 29v14M42 33v8" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/>',
 tools:'<path d="M16 10q11 0 12 11L47 41l-6 7-19-20Q10 28 10 17z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M48 10q-12-1-13 12L16 42l6 7 20-19q14 0 12-14l-7 6-6-5z" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><circle cx="21" cy="43" r="3" fill="'+D+'"/>',
 devices:'<rect x="10" y="13" width="44" height="30" rx="4" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><rect x="14" y="17" width="36" height="22" rx="2" fill="'+C+'" stroke="'+G+'" stroke-width="2"/><path d="M20 33q5-12 12-8l6-3 8 11z" fill="'+S+'"/><path d="M6 48h52l-4 5H10z" fill="'+P+'" stroke="'+W+'" stroke-width="2"/>',
 pet:'<path d="M16 15 8 7l1 19q-4 20 22 24 26-4 23-24l1-19-9 8q-15-6-30 0z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M18 20 13 14l1 13M47 20l5-6-1 13" fill="'+G+'"/><path d="M20 30h6m12 0h6" stroke="'+Y+'" stroke-width="3.5" stroke-linecap="round"/><path d="m28 37 4 3 4-3m-4 3v3m-12-6-9-2m9 6-9 2m33-6 9-2m-9 6 9 2" fill="none" stroke="'+P+'" stroke-width="2"/>',
 recipe:'<rect x="15" y="20" width="34" height="31" rx="7" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><rect x="18" y="25" width="28" height="18" rx="4" fill="'+G+'" opacity=".55"/><path d="M11 23h42m-31-6q-2-7 4-11m8 11q-3-8 3-12m-5 17q0-8 10-9" stroke="'+S+'" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M12 43H8v-16h4m40 16h4V27h-4" fill="'+G+'" stroke="'+W+'" stroke-width="2.4"/>',
 drink:'<path d="M12 19h37l-5 25q-12 11-27 0z" fill="'+P+'" stroke="'+W+'" stroke-width="3"/><path d="M49 22q13-3 9 13-3 8-12 6" fill="none" stroke="'+G+'" stroke-width="4"/><path d="M19 27h24l-3 12q-8 5-17 0z" fill="'+W+'"/><path d="M19 50h28" stroke="'+G+'" stroke-width="3" stroke-linecap="round"/><path d="M24 15q-4-5 1-9m11 10q-5-7 1-12" stroke="'+S+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
 travel:'<rect x="14" y="19" width="36" height="32" rx="6" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M24 19v-8q8-5 16 0v8" stroke="'+G+'" stroke-width="4" fill="none"/><path d="M22 23v25M42 23v25" stroke="'+G+'" stroke-width="2.5"/><path d="M27 31h10v8H27z" fill="'+S+'" stroke="'+D+'" stroke-width="2"/>',
 document:'<path d="M16 7h25l9 9v37H16z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M41 7v10h9" fill="'+G+'" stroke="'+W+'" stroke-width="2"/><path d="M23 23h20m-20 7h19m-19 7h14m-14 7h18" stroke="'+W+'" stroke-width="2.3" stroke-linecap="round"/>',
 search:'<circle cx="28" cy="26" r="16" fill="'+G+'" stroke="'+E+'" stroke-width="3"/><circle cx="28" cy="26" r="11" fill="'+C+'" stroke="'+P+'" stroke-width="3"/><path d="M20 21q4-7 13-5" fill="none" stroke="'+Y+'" stroke-width="2.5"/><path d="m40 40 14 14" stroke="'+W+'" stroke-width="9" stroke-linecap="round"/><path d="m40 40 14 14" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/>',
 music:'<path d="M26 15 51 9v30" fill="none" stroke="'+G+'" stroke-width="6" stroke-linejoin="round"/><path d="M26 17v27" fill="none" stroke="'+P+'" stroke-width="5"/><ellipse cx="20" cy="46" rx="8" ry="5" fill="'+W+'" stroke="'+E+'" stroke-width="2"/><ellipse cx="45" cy="40" rx="8" ry="5" fill="'+G+'" stroke="'+E+'" stroke-width="2"/>',
 camera:'<path d="M9 21h12l5-7h15l5 7h9v31H9z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><circle cx="32" cy="35" r="12" fill="'+G+'" stroke="'+E+'" stroke-width="3"/><circle cx="32" cy="35" r="7" fill="'+C+'" stroke="'+P+'" stroke-width="2.2"/><circle cx="47" cy="26" r="2" fill="'+Y+'"/>',
 fitness:'<path d="M8 24v16m8-23v30m32-23v16m-8-23v30M14 32h36" fill="none" stroke="'+W+'" stroke-width="8" stroke-linecap="round"/><path d="M8 24v16m8-23v30m32-23v16m-8-23v30M14 32h36" fill="none" stroke="'+G+'" stroke-width="3.5" stroke-linecap="round"/>',
 leaf:'<path d="M13 49Q7 14 50 10q4 39-30 40Z" fill="'+S+'" stroke="'+E+'" stroke-width="3"/><path d="M16 51q17-21 30-33M25 38l-4-14m14 4 10 2" fill="none" stroke="'+P+'" stroke-width="2.3"/>',
 lantern:'<path d="M23 19h18v32H23z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M27 25h10v20H27z" fill="'+G+'" stroke="'+Y+'" stroke-width="2"/><path d="M26 15h12l6 7H20zM22 50h20v4H22z" fill="'+P+'" stroke="'+W+'" stroke-width="2"/><path d="M26 15q-3-13 6-13t6 13" fill="none" stroke="'+G+'" stroke-width="3"/><path d="M30 39q-3-8 3-13 0 6 5 8-1 9-8 5" fill="'+Y+'"/>',
 archive:'<rect x="15" y="8" width="34" height="45" rx="4" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M17 12h30v16H17zM17 31h30v18H17z" fill="#9d6d45" stroke="'+G+'" stroke-width="1.8"/><path d="M26 20h12m-12 18h12" stroke="'+P+'" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="24" r="2" fill="'+G+'"/><circle cx="32" cy="43" r="2" fill="'+G+'"/>',
 sofa:'<rect x="12" y="22" width="40" height="25" rx="8" fill="'+S+'" stroke="'+E+'" stroke-width="3"/><rect x="9" y="33" width="46" height="17" rx="6" fill="'+F+'" stroke="'+E+'" stroke-width="2.5"/><path d="M15 50v5m34-5v5" stroke="'+G+'" stroke-width="4"/><path d="M32 23v19" stroke="'+P+'" stroke-width="2" opacity=".8"/>',
 chef:'<path d="M17 29q-14-13 0-19 8-4 15 2 11-9 18 0 10 11-3 18v19H17z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M17 32h30v16H17z" fill="'+Y+'"/><path d="M22 37v7m10-7v7m10-7v7" stroke="'+S+'" stroke-width="2"/>',
 herbs:'<path d="M22 44h20l-4 10H26z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M32 42V15M32 37q-17 0-18-13 13-1 18 7m1-7q4-14 18-12-1 15-18 19" fill="'+S+'" stroke="'+E+'" stroke-width="2.5"/><path d="M32 41q-10-8-18-5" fill="none" stroke="'+L+'" stroke-width="2"/>',
 project:'<path d="M12 13h40v38H12z" fill="'+P+'" stroke="'+W+'" stroke-width="3"/><path d="M16 20 27 10l10 9 10-8 2 29-10 8-12-9-10 9z" fill="'+C+'" stroke="'+D+'" stroke-width="2"/><path d="m18 21 9 6 10-7 10 7" fill="none" stroke="'+G+'" stroke-width="2"/><circle cx="36" cy="33" r="4" fill="'+Y+'"/>',
 scroll:'<path d="M20 12h30q6 0 6 7v28q-2 8-9 5H17Q9 52 9 45V20q1-7 11-8z" fill="'+P+'" stroke="'+W+'" stroke-width="3"/><path d="M15 22h34m-29 8h24m-24 7h22" stroke="'+W+'" stroke-width="2"/><path d="M15 49q8-3 6-11M49 12q-8 4-6 10" stroke="'+G+'" stroke-width="3" fill="none"/>',
 palette:'<path d="M32 9C10 9 5 27 13 41q4 8 12 10 8 2 10-5 1-6-5-7-3-1-1-5 3-5 10-2 12 2 15-7Q56 9 32 9z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><circle cx="20" cy="23" r="4" fill="'+L+'"/><circle cx="32" cy="18" r="4" fill="'+G+'"/><circle cx="44" cy="23" r="4" fill="'+C+'"/><circle cx="20" cy="36" r="4" fill="'+Y+'"/><path d="m45 45 11 9" stroke="'+P+'" stroke-width="4"/>',
 notebook:'<path d="M15 10h35v44H15z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M13 17h7m-7 9h7m-7 9h7m-7 9h7" stroke="'+G+'" stroke-width="3"/><path d="M24 24h19m-19 8h19m-19 8h15" stroke="'+W+'" stroke-width="2"/><path d="m39 49 10-18 5 3-10 18-6 3z" fill="'+G+'" stroke="'+W+'" stroke-width="2"/>',
 books:'<path d="M13 43h38v9H13z" fill="'+G+'" stroke="'+E+'" stroke-width="2"/><path d="M15 31h34v11H15z" fill="'+W+'" stroke="'+E+'" stroke-width="2"/><path d="M19 17h28v13H19z" fill="'+S+'" stroke="'+E+'" stroke-width="2"/><path d="M18 48h26M20 37h26M23 24h19" stroke="'+P+'" stroke-width="2.4"/><path d="M42 18v9M45 33v8" stroke="'+G+'" stroke-width="2"/>',
 sun:'<circle cx="32" cy="30" r="14" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><circle cx="28" cy="26" r="7" fill="'+Y+'" opacity=".7"/><path d="M32 4v7m0 38v7M6 30h7m38 0h7M14 12l5 5m26 26 5 5M14 48l5-5m26-26 5-5" stroke="'+G+'" stroke-width="3.7" stroke-linecap="round"/>',
 tasks:'<path d="M16 9h32v44H16z" fill="'+P+'" stroke="'+W+'" stroke-width="3"/><path d="M25 9v-5h14v5" stroke="'+G+'" stroke-width="4"/><path d="m23 23 4 4 8-9m-12 22 4 4 8-9" fill="none" stroke="'+F+'" stroke-width="3.5" stroke-linecap="round"/><path d="M37 25h7M37 42h7" stroke="'+W+'" stroke-width="2.5"/>',
 agenda:'<rect x="11" y="12" width="42" height="41" rx="4" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M11 23h42V14H11z" fill="'+G+'" stroke="'+W+'" stroke-width="2"/><path d="M21 7v11m22-11v11" stroke="'+W+'" stroke-width="5" stroke-linecap="round"/><path d="M20 32h7m9 0h7m-23 8h7m9 0h7" stroke="'+F+'" stroke-width="4" stroke-linecap="round"/>',
 groceries:'<path d="M14 28h37l-5 24H19z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="m20 28 8-13m18 13-9-13" fill="none" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/><path d="M22 34h22M23 41h19" stroke="'+P+'" stroke-width="3" stroke-linecap="round"/><path d="M27 22q-6-15 8-14 5 11-8 14" fill="'+S+'" stroke="'+F+'" stroke-width="2"/>',
 dashboard:'<path d="M10 12h20v18H10zM34 12h20v18H34zM10 34h20v19H10zM34 34h20v19H34z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M13 18h14v9H13zM37 18h14v9H37zM13 40h14v9H13zM37 40h14v9H37z" fill="'+S+'"/><path d="M17 44l5-5 4 2m14-17 4-6 4 3" stroke="'+G+'" fill="none" stroke-width="2.5"/>',
 transactions:'<path d="M9 21h43l-10-9m10 9-10 9M55 43H12l10-9m-10 9 10 9" fill="none" stroke="'+W+'" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 21h43l-10-9m10 9-10 9M55 43H12l10-9m-10 9 10 9" fill="none" stroke="'+G+'" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>',
 analysis:'<path d="M11 51h45" stroke="'+P+'" stroke-width="4" stroke-linecap="round"/><path d="M15 33h10v18H15zM29 20h10v31H29zM43 12h10v39H43z" fill="'+W+'" stroke="'+E+'" stroke-width="2"/><path d="M18 36h5v11h-5zM32 23h5v24h-5zM46 15h5v32h-5z" fill="'+G+'"/>',
 accounts:'<path d="M10 19h41v32H10z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M10 22h42v8H10z" fill="'+G+'" stroke="'+W+'" stroke-width="2"/><path d="M34 33h22v13H34z" fill="'+P+'" stroke="'+W+'" stroke-width="2"/><circle cx="47" cy="40" r="3" fill="'+W+'"/>',
 budgets:'<ellipse cx="25" cy="42" rx="17" ry="8" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><path d="M8 33v10q0 8 17 8t17-8V33" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><ellipse cx="25" cy="33" rx="17" ry="8" fill="'+Y+'" stroke="'+W+'" stroke-width="3"/><circle cx="42" cy="25" r="12" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><circle cx="42" cy="25" r="7" fill="'+Y+'"/>',
 planning:helpers.sheet,
 smartbuy:'<path d="m11 23 21-13 21 13v26L32 60 11 49z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="m11 23 21 13 21-13M32 36v23" fill="none" stroke="'+G+'" stroke-width="3"/><path d="M18 20l21 12" stroke="'+P+'" stroke-width="4"/><path d="m43 10 4-7 4 7 6 3-6 3-4 8-4-8-6-3z" fill="'+G+'" stroke="'+W+'" stroke-width="1.5"/>',
 moneycoach:'<path d="M32 5 9 14v19q0 19 23 26 23-7 23-26V14z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M32 11 16 18v15q0 14 16 19 16-5 16-19V18z" fill="'+S+'" stroke="'+G+'" stroke-width="3"/><circle cx="32" cy="32" r="10" fill="'+G+'"/><path d="M29 26q8-3 8 2 1 3-5 4t-2 7m2-18v22" stroke="'+W+'" stroke-width="2.5" fill="none"/>',
 receipts:'<path d="M14 8h36v46l-7-5-7 5-7-5-7 5-8-5z" fill="'+P+'" stroke="'+E+'" stroke-width="3"/><path d="M21 20h21M21 29h21M21 38h13" stroke="'+W+'" stroke-width="2.6"/><circle cx="42" cy="42" r="5" fill="'+G+'"/>',
 settings:'<path d="M28 6h8l2 7 6 3 7-3 5 7-5 6 1 7 6 4-4 8-8-2-6 4-2 8h-9l-2-8-6-3-8 2-4-8 6-5-1-7-5-6 5-7 7 3 6-3z" fill="'+W+'" stroke="'+E+'" stroke-width="2.5"/><circle cx="32" cy="32" r="12" fill="'+G+'" stroke="'+E+'" stroke-width="2.4"/><circle cx="32" cy="32" r="5" fill="'+F+'"/>',
 backup:'<path d="M13 25h38v29H13z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M13 27h38v7H13z" fill="'+G+'"/><path d="M23 21q1-14 14-14t14 14" fill="none" stroke="'+S+'" stroke-width="5"/><path d="M33 44v-17m-7 6 7-7 7 7" fill="none" stroke="'+Y+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
 menu:'<path d="M12 19h40M12 32h40M12 45h40" fill="none" stroke="'+W+'" stroke-width="9" stroke-linecap="round"/><path d="M12 19h40M12 32h40M12 45h40" fill="none" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/>',
 pin:'<path d="M32 6q-19 0-19 20 0 15 19 33 19-18 19-33 0-20-19-20z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><circle cx="32" cy="26" r="9" fill="'+G+'" stroke="'+E+'" stroke-width="3"/>',
 filter:'<path d="M10 12h44L38 31v18l-12 7V31z" fill="'+G+'" stroke="'+E+'" stroke-width="3"/><path d="M17 16h29" stroke="'+Y+'" stroke-width="3"/>',
 time:'<circle cx="32" cy="32" r="23" fill="'+P+'" stroke="'+W+'" stroke-width="4"/><path d="M32 17v15l9 7" stroke="'+F+'" stroke-width="3.6" fill="none" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="'+G+'"/>',
 edit:'<path d="m13 43 30-30 9 9-30 30-12 3z" fill="'+G+'" stroke="'+W+'" stroke-width="3"/><path d="m11 54 11-3-8-8z" fill="'+P+'"/><path d="m38 17 9 9" stroke="'+Y+'" stroke-width="3"/>',
 trash:'<path d="M15 20h34l-3 35H18z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M12 17h40M26 13h12" stroke="'+G+'" stroke-width="5" stroke-linecap="round"/><path d="M27 29v16m10-16v16" stroke="'+P+'" stroke-width="3" stroke-linecap="round"/>',
 plus:'<circle cx="32" cy="32" r="23" fill="'+F+'" stroke="'+G+'" stroke-width="4"/><path d="M32 18v28M18 32h28" stroke="'+Y+'" stroke-width="5" stroke-linecap="round"/>',
 check:'<path d="M14 31l12 12 25-26" fill="none" stroke="'+W+'" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 31l12 12 25-26" fill="none" stroke="'+G+'" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>',
 arrow:'<path d="M13 32h38m-14-15 15 15-15 15" stroke="'+W+'" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M13 32h38m-14-15 15 15-15 15" stroke="'+G+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
 "arrow-left":'<path d="M51 32H13m14 15L12 32l15-15" stroke="'+W+'" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M51 32H13m14 15L12 32l15-15" stroke="'+G+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
 close:'<path d="M17 17 47 47M47 17 17 47" stroke="'+W+'" stroke-width="10" stroke-linecap="round"/><path d="M17 17 47 47M47 17 17 47" stroke="'+G+'" stroke-width="4" stroke-linecap="round"/>',
 download:'<path d="M32 9v33m-13-13 13 14 13-14M13 53h38" stroke="'+W+'" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 9v33m-13-13 13 14 13-14M13 53h38" stroke="'+G+'" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 upload:'<path d="M32 52V18M19 30l13-14 13 14M13 53h38" stroke="'+W+'" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 52V18M19 30l13-14 13 14M13 53h38" stroke="'+G+'" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 link:'<path d="M27 25l8-8q9-9 17 0t0 17l-8 8M37 39l-8 8q-9 9-17 0t0-17l8-8m-2 11h28" fill="none" stroke="'+W+'" stroke-width="8" stroke-linecap="round"/><path d="M27 25l8-8q9-9 17 0t0 17l-8 8M37 39l-8 8q-9 9-17 0t0-17l8-8m-2 11h28" fill="none" stroke="'+G+'" stroke-width="3.5" stroke-linecap="round"/>',
 image:'<path d="M10 12h44v40H10z" fill="'+P+'" stroke="'+W+'" stroke-width="3"/><path d="M15 45 26 33l8 8 8-15 8 19z" fill="'+S+'" stroke="'+D+'" stroke-width="2"/><circle cx="25" cy="23" r="5" fill="'+G+'"/>',
 "credit-card":'<rect x="8" y="17" width="48" height="33" rx="5" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="M9 25h46" stroke="'+G+'" stroke-width="8"/><path d="M16 42h14" stroke="'+P+'" stroke-width="3"/>',
 shopping:'<path d="M11 18h43l-7 28H19z" fill="'+W+'" stroke="'+E+'" stroke-width="3"/><path d="m21 18 11-11 11 11M14 26h37m-31 8h26" fill="none" stroke="'+G+'" stroke-width="3"/>'
};
artwork.star=helpers.star;
const aliases={"flask-conical":"recipe",sparkles:"lightbulb","file-text":"document","panels-top-left":"folder-kanban",calendar:"agenda",notes:"journal",day:"sun",today:"sun",groceries:"groceries",wishes:"star",library:"books",household:"house",transactions:"transactions",analysis:"analysis",accounts:"accounts",budgets:"budgets",planning:"planning",dashboard:"dashboard",smartbuy:"smartbuy",moneycoach:"moneycoach",receipts:"receipts",settings:"settings",search:"search",star:"star",fitness:"fitness","archive-folder":"archive",archive:"archive",important:"star",folder:"folder",menu:"menu",image:"image",backup:"backup",copy:"document",share:"upload",web:"link",filter:"filter",clock:"time",microphone:"music",mic:"music",save:"check",bell:"lantern"};
const defaults={
 "kc2-levenspad":"route","kc2-levenspad-dagboek":"journal","kc2-levenspad-reflecties":"lantern",
 "kc2-levenspad-leren":"books","kc2-levenspad-reizen":"route","kc2-levenspad-naslag":"archive",
 "kc2-huis-wonen":"house","kc2-huis-wonen-apparaten":"devices","kc2-huis-wonen-onderhoud":"tools","kc2-huis-wonen-woning":"sofa","kc2-huis-wonen-huisdieren":"pet",
 "kc2-recepten-creaties":"chef","kc2-recepten-creaties-koken":"recipe","kc2-recepten-creaties-dranken":"drink","kc2-recepten-creaties-zelfmaken":"herbs",
 "kc2-projecten-onderzoek":"project","kc2-projecten-onderzoek-dossiers":"scroll","kc2-projecten-onderzoek-producten":"search","kc2-projecten-onderzoek-bronnen":"archive",
 "kc2-ideeen-inspiratie":"lightbulb","kc2-ideeen-inspiratie-ideeen":"notebook","kc2-ideeen-inspiratie-visueel":"palette","kc2-ideeen-inspiratie-later":"books"
};
const defaultSource={
 "kc2-levenspad":"route","kc2-levenspad-dagboek":"journal","kc2-levenspad-reflecties":"heart","kc2-levenspad-leren":"book-open","kc2-levenspad-reizen":"travel","kc2-levenspad-naslag":"document",
 "kc2-huis-wonen":"house","kc2-huis-wonen-apparaten":"devices","kc2-huis-wonen-onderhoud":"tools","kc2-huis-wonen-woning":"house","kc2-huis-wonen-huisdieren":"pet",
 "kc2-recepten-creaties":"book-open","kc2-recepten-creaties-koken":"recipe","kc2-recepten-creaties-dranken":"drink","kc2-recepten-creaties-zelfmaken":"leaf",
 "kc2-projecten-onderzoek":"folder-kanban","kc2-projecten-onderzoek-dossiers":"folder","kc2-projecten-onderzoek-producten":"search","kc2-projecten-onderzoek-bronnen":"document",
 "kc2-ideeen-inspiratie":"lightbulb","kc2-ideeen-inspiratie-ideeen":"lightbulb","kc2-ideeen-inspiratie-visueel":"camera","kc2-ideeen-inspiratie-later":"book-open"
};
function resolve(key){const alias=aliases[key]||key;return Object.hasOwn(artwork,alias)?alias:"folder";}
function collection(c){const preferred=defaults[c?.id];if(preferred&&c?.icon===defaultSource[c.id])return preferred;return resolve(c?.icon);}
function financeCategory(name){
 const n=String(name||"").toLowerCase();
 if(/inkom|salaris|loon|spaar|sparen|belegging/.test(n))return "budgets";
 if(/boodsch|supermarkt|huishoud/.test(n))return "groceries";
 if(/auto|vervoer|brandstof|benzin|parkeren/.test(n))return "travel";
 if(/wonen|huur|gas|energie|water/.test(n))return "house";
 if(/zorg|gezond|medicijn|apotheek/.test(n))return "heart";
 if(/dier|kat|hond/.test(n))return "pet";
 if(/eten|horeca|cafe|koffie|restaurant/.test(n))return "drink";
 if(/reizen|vakantie|hotel|vlieg/.test(n))return "travel";
 if(/fitness|sport|sportschool/.test(n))return "fitness";
 if(/kleding|schoenen|winkelen|aankoop/.test(n))return "shopping";
 if(/game|entertainment|digitaal|hobby/.test(n))return "smartbuy";
 if(/abonnement|internet|telefoon|electron|apparaat/.test(n))return "devices";
 if(/verzekering|beveilig/.test(n))return "moneycoach";
 if(/belasting|toeslag/.test(n))return "receipts";
 if(/rekening|bank|rente|creditcard/.test(n))return "accounts";
 return "budgets";
}
function fromGlyph(glyph){
 const g=String(glyph||"").trim();
 const m={"☀":"sun","☑":"tasks","🛒":"groceries","✦":"star","◷":"time","▤":"document","⚙":"settings","↗":"arrow","⇄":"transactions","◉":"accounts","◫":"dashboard","◔":"analysis","◎":"budgets","▦":"planning","◈":"moneycoach","▧":"receipts","✈":"travel","✚":"heart","✂":"tools","⌕":"search","◉":"accounts","🚗":"travel","🍔":"drink","💰":"budgets","🩺":"heart","👕":"shopping","📱":"devices","🛡️":"moneycoach","🏋️":"fitness","🐾":"pet","🎮":"smartbuy","🎁":"star","🧾":"receipts","🏦":"accounts","🏠":"house","☕":"drink","✨":"star","▤":"document","◈":"moneycoach","▨":"dashboard","▣":"image","⚗":"recipe","↩️":"arrow-left","🔁":"transactions","∑":"analysis","!":"moneycoach","☷":"filter","✎":"edit","✓":"check","＋":"plus","⌛":"time","⚡":"sun"};
 return m[g]||"folder";
}
let counter=0;
function svg(key,{quiet=false}={}){
 const name=resolve(key),inner=artwork[name],small=quiet||["menu","check","plus","arrow","arrow-left","close","edit","download","upload","filter","link","trash"].includes(name);
 const uid="mit"+(++counter);
 const background=small?"":base;
 return '<svg class="memento-illustrative-icon'+(small?' memento-illustrative-icon--quiet':'')+'" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="fill:none;stroke:none">'+
 '<defs><radialGradient id="'+uid+'"><stop offset="0" stop-color="#e8bd76" stop-opacity=".28"/><stop offset="1" stop-color="#e8bd76" stop-opacity="0"/></radialGradient></defs>'+
 (small?"":'<ellipse cx="32" cy="34" rx="28" ry="27" fill="url(#'+uid+')"/>')+
 background+inner+(small?'':'<circle cx="52" cy="10" r="1.6" fill="'+Y+'" opacity=".74"/>')+'</svg>';
}
function render(key){return svg(key);}
function forCollection(c){return svg(collection(c));}
function forFinance(name){return svg(financeCategory(name));}
function legacy(glyph){return svg(fromGlyph(glyph));}
return Object.freeze({render,svg,forCollection,forFinance,legacy,resolve,collection,financeCategory,fromGlyph,available:Object.freeze(Object.keys(artwork)),categoryDefaults:Object.freeze(defaults),sourceDefaults:Object.freeze(defaultSource)});
});
