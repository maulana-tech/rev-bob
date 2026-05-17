import { useEffect, useRef } from 'react';
import './Landing.css';

export default function Landing() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const particleCount = 50;
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            alpha: number;
        }> = [];
        const colors = ['#ff4444', '#ff6666', '#ff8888'];
        let width = 0;
        let height = 0;
        let animFrame = 0;

        function resize() {
            if (!canvas) return;
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function createParticle() {
            const drift = Math.random() * 0.3 + 0.1;
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * drift,
                vy: (Math.random() - 0.5) * drift,
                size: Math.random() * 2.5 + 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.5 + 0.3,
            };
        }

        function populate() {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) particles.push(createParticle());
        }

        function drawConnections() {
            if (!ctx) return;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180 && (i + j) % 3 === 0) {
                        const opacity = (1 - dist / 180) * 0.12;
                        ctx.strokeStyle = `rgba(255, 68, 68, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
        }

        function update() {
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -40) p.x = width + 40;
                if (p.x > width + 40) p.x = -40;
                if (p.y < -40) p.y = height + 40;
                if (p.y > height + 40) p.y = -40;
            });
        }

        function draw() {
            if (!ctx) return;
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.shadowBlur = 14;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function render() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            update();
            drawConnections();
            draw();
            animFrame = requestAnimationFrame(render);
        }

        function onResize() {
            resize();
            populate();
        }

        onResize();
        render();
        window.addEventListener('resize', onResize);

        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener('resize', onResize);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="page-shell">
            <div className="bg-grid"></div>
            <div className="bg-orb bg-orb-1"></div>
            <div className="bg-orb bg-orb-2"></div>
            <div className="bg-orb bg-orb-3"></div>

            <nav className="nav">
                <a className="nav-brand-wrap" href="/">
                    <div className="nav-brand-icon">❖</div>
                    <span className="nav-brand">Rev BOB</span>
                </a>
                <div className="nav-actions">
                    <a className="nav-link" href="https://github.com/maulana-tech/rev-bob" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                    <a className="nav-link" href="#capabilities">
                        Features
                    </a>
                    <a className="nav-link" href="#mcp">
                        MCP
                    </a>
                    <a className="nav-button" href="/app">
                        Launch App &rarr;
                    </a>
                </div>
            </nav>

            <main>
                <section className="hero">
                    <canvas ref={canvasRef} id="particle-canvas" className="hero-canvas" aria-hidden="true"></canvas>
                    <div className="hero-inner fade-in is-visible">
                        <div className="badge">
                            <span className="badge-dot"></span>
                            Dependency Propagation Engine
                        </div>
                        <h1 className="hero-title">Rev BOB</h1>
                        <div className="hero-subtitle">
                            Parse any codebase. Map every dependency.
                            <br />
                            See the blast radius before you break anything.
                        </div>
                        <div className="hero-actions">
                            <a className="button-primary" href="/app">
                                Launch App &rarr;
                            </a>
                            <a className="button-secondary" href="https://github.com/maulana-tech/rev-bob" target="_blank" rel="noreferrer">
                                View on GitHub
                            </a>
                        </div>
                    </div>
                    <a className="scroll-indicator" href="#capability" aria-label="Scroll down">
                        scroll
                        <span>&darr;</span>
                    </a>
                </section>

                <section id="capability" className="capability">
                    <div className="section-inner">
                        <div className="section-label">Core Capability</div>
                        <div className="statement-list">
                            <div className="statement reveal-on-scroll">
                                <div className="statement-number">01</div>
                                <div className="statement-text">Upload any JS/TS repository as a ZIP or connect via GitHub</div>
                            </div>
                            <div className="statement reveal-on-scroll">
                                <div className="statement-number">02</div>
                                <div className="statement-text">Get a live interactive dependency graph instantly</div>
                            </div>
                            <div className="statement reveal-on-scroll">
                                <div className="statement-number">03</div>
                                <div className="statement-text">Click any node. See the blast radius. Before you touch anything.</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="capabilities" className="features">
                    <div className="section-inner">
                        <div className="section-label fade-in reveal-on-scroll">Capabilities</div>
                        <div className="features-grid">
                            <article className="feature-card fade-in reveal-on-scroll">
                                <div className="feature-icon">◎</div>
                                <h3 className="feature-title">Blast Radius BFS</h3>
                                <p className="feature-description">
                                    Trace dependency propagation outward from any node and quantify exactly how far a risky change can travel.
                                </p>
                            </article>
                            <article className="feature-card fade-in reveal-on-scroll">
                                <div className="feature-icon">⬡</div>
                                <h3 className="feature-title">Dependency Graph</h3>
                                <p className="feature-description">
                                    Render files, functions, classes, and methods as a live graph with structural edges you can inspect in motion.
                                </p>
                            </article>
                            <article className="feature-card fade-in reveal-on-scroll">
                                <div className="feature-icon">⌘</div>
                                <h3 className="feature-title">AI Codebase Query</h3>
                                <p className="feature-description">
                                    Ask plain-English questions and get graph-grounded call chains that stay anchored to real nodes in your codebase.
                                </p>
                            </article>
                            <article className="feature-card fade-in reveal-on-scroll">
                                <div className="feature-icon">≋</div>
                                <h3 className="feature-title">Process Detection</h3>
                                <p className="feature-description">
                                    Surface meaningful runtime flows from trigger to side effect, then inspect them as generated Mermaid diagrams.
                                </p>
                            </article>
                            <article className="feature-card fade-in reveal-on-scroll">
                                <div className="feature-icon">◈</div>
                                <h3 className="feature-title">Risk Scoring</h3>
                                <p className="feature-description">
                                    Highlight the most connected components so you can prioritize refactors around the modules most likely to create damage.
                                </p>
                            </article>
                            <article className="feature-card fade-in reveal-on-scroll">
                                <div className="feature-icon">⎙</div>
                                <h3 className="feature-title">Intelligence Report</h3>
                                <p className="feature-description">
                                    Generate an architecture brief with hotspots, onboarding paths, and actionable codebase intelligence in one pass.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <section id="mcp" className="mcp">
                    <div className="section-inner mcp-layout">
                        <div className="fade-in reveal-on-scroll">
                            <div className="mcp-badge">MCP Server</div>
                            <h2 className="mcp-title">Give your AI coding assistant a map.</h2>
                            <div className="mcp-copy">
                                Rev BOB runs as an MCP server on port 3002. Connect it to Claude Code, Cursor, or Antigravity. Your AI now has full
                                dependency context while coding.
                            </div>
                            <div className="pill-row">
                                <span className="tool-pill">rev-bob_status</span>
                                <span className="tool-pill">rev-bob_blast_radius</span>
                                <span className="tool-pill">rev-bob_get_callers</span>
                                <span className="tool-pill">rev-bob_get_dependencies</span>
                                <span className="tool-pill">rev-bob_query</span>
                            </div>
                        </div>

                        <div className="code-block fade-in reveal-on-scroll" aria-label="MCP configuration example">
                            <div className="code-header">
                                <span className="code-dot"></span>
                                <span className="code-dot"></span>
                                <span className="code-dot"></span>
                            </div>
                            <span className="code-comment">// Add to your MCP client</span>
                            <br />
                            <span className="code-punctuation">{'{'}</span>
                            <br />
                            &nbsp;&nbsp;
                            <span className="code-key">&quot;name&quot;</span>
                            <span className="code-punctuation">:</span> <span className="code-value">&quot;Rev BOB&quot;</span>
                            <span className="code-punctuation">,</span>
                            <br />
                            &nbsp;&nbsp;
                            <span className="code-key">&quot;url&quot;</span>
                            <span className="code-punctuation">:</span> <span className="code-value">&quot;http://localhost:3002/sse&quot;</span>
                            <span className="code-punctuation">,</span>
                            <br />
                            &nbsp;&nbsp;
                            <span className="code-key">&quot;type&quot;</span>
                            <span className="code-punctuation">:</span> <span className="code-value">&quot;sse&quot;</span>
                            <br />
                            <span className="code-punctuation">{'}'}</span>
                        </div>
                    </div>
                </section>

                <section className="tech">
                    <div className="section-inner">
                        <div className="section-label fade-in reveal-on-scroll">Built With</div>
                        <div className="tech-row fade-in reveal-on-scroll">
                            <span className="tech-item">React</span>
                            <span className="tech-item">TypeScript</span>
                            <span className="tech-item">Sigma.js</span>
                            <span className="tech-item">Graphology</span>
                            <span className="tech-item">ForceAtlas2</span>
                            <span className="tech-item">Express</span>
                            <span className="tech-item">Babel</span>
                            <span className="tech-item">NVIDIA AI</span>
                            <span className="tech-item">IBM Watsonx</span>
                            <span className="tech-item">Mermaid.js</span>
                            <span className="tech-item">MCP</span>
                            <span className="tech-item">Railway</span>
                            <span className="tech-item">Vercel</span>
                        </div>
                    </div>
                </section>

                <section className="cta">
                    <div className="section-inner fade-in reveal-on-scroll">
                        <h2 className="cta-title">Upload your codebase.</h2>
                        <p className="cta-copy">JS &middot; TS &middot; JSX &middot; TSX &middot; PY &middot; JSON &middot; YAML</p>
                        <div className="cta-actions">
                            <a className="cta-button" href="/app">
                                Launch Rev BOB &rarr;
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="footer-inner">
                    <div className="footer-brand">Rev BOB &mdash; 2026</div>
                    <a className="footer-link" href="https://github.com/maulana-tech/rev-bob" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                </div>
            </footer>
        </div>
    );
}
