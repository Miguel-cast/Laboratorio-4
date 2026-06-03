/* canvas-bg.js — Dot Matrix WebGL background (Three.js r128, GLSL3)
   Port fiel del CanvasRevealEffect: los puntos se revelan desde el
   centro hacia los bordes con un destello breve al aparecer. */
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const dpr = Math.min(window.devicePixelRatio, 2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const res = new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr);

  // Opacidades aleatorias por punto (como el componente original)
  const opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0];
  const colorVecs = Array.from({ length: 6 }, () => new THREE.Vector3(1, 1, 1)); // blanco

  const uniforms = {
    u_time:       { value: 0.0 },
    u_resolution: { value: res },
    u_opacities:  { value: opacities },
    u_colors:     { value: colorVecs },
    u_total_size: { value: 22.0 }, // separación de la malla
    u_dot_size:   { value: 5.0 },  // tamaño del punto (≈ dotSize 6 del original)
  };

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms,
    transparent: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
    depthTest: false,

    vertexShader: `
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
    `,

    fragmentShader: `
      precision mediump float;
      in vec2 fragCoord;

      uniform float u_time;
      uniform float u_opacities[10];
      uniform vec3  u_colors[6];
      uniform float u_total_size;
      uniform float u_dot_size;
      uniform vec2  u_resolution;

      out vec4 fragColor;

      const float PHI = 1.61803398874989484820459;

      float rand(vec2 p) {
        return fract(tan(distance(p * PHI, p) * 0.5) * p.x);
      }

      void main() {
        vec2 st = fragCoord;
        st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
        st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

        float vis = step(0.0, st.x) * step(0.0, st.y);
        vec2 cell = vec2(floor(st.x / u_total_size), floor(st.y / u_total_size));

        // Parpadeo: cada punto cambia de opacidad cada ~5s
        float show_off = rand(cell);
        float r = rand(cell * floor(u_time / 5.0 + show_off + 5.0));
        float op = u_opacities[int(r * 10.0)];

        // Máscara del píxel del punto
        op *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
        op *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
        op *= vis;

        vec3 color = u_colors[int(show_off * 6.0)];

        // Reveal desde el centro (intro) — factor de velocidad 0.5 como el original
        vec2 center_cell = floor(u_resolution / (2.0 * u_total_size));
        float dist = distance(center_cell, cell);
        float t = u_time * 0.5;
        float reveal_off = dist * 0.01 + rand(cell) * 0.15;

        op *= step(reveal_off, t);
        // Destello breve cuando aparece cada punto
        op *= clamp((1.0 - step(reveal_off + 0.1, t)) * 1.25, 1.0, 1.25);

        fragColor = vec4(color, op);
        fragColor.rgb *= fragColor.a; // premultiplica alpha
      }
    `,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  })();

  window.addEventListener("resize", () => {
    const d = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    res.set(window.innerWidth * d, window.innerHeight * d);
  });
})();
