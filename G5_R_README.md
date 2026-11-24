# G5-R Cinematic Product Atelier
Independent version of Rizet Ngan personal portfolio.

Render architecture: Guided mode shows true Blender/Cycles photographs, and Mini switches to live WebGL. Do not misrepresent the photographs as freely navigable live 3D.

Development: Blender 5.1.2, Poly Haven CC0 meshes/PBR/HDRI, tevy CC0 devices, official Khronos KTX-Software 4.4.2 to decode compressed textures, glTF Transform 4.3.0, Three.js r128.

Production scripts: tools/build-g5-r-final.py, tools/render-g5-r-snug-env.py, tools/export-g5-r-studio.py, tools/integrate-g5-r.py, tools/g5r-node/convert-full.mjs. Local original CC0 download cache and fully packed Blender production source are gitignored at art-assets/g5-r/, not included in public web downloads.

Website: index.html, actape.html, snug.html and g5r.css render without WebGL; studio.html and accompanying scripts handle Guided/Mini. Published content under preview/g5r/ independently of old G5 and E2.

See docs/qa/g5r/QA_REPORT.md for verified real-browser results and limitations.
