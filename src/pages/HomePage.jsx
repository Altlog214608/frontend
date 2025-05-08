import React, { useEffect, useRef } from 'react';
import '../components/common/css/FallingPanels.css';
import Matter from 'matter-js';

const panelInfo = [
  '태양광 패널 1 설명',
  '태양광 패널 2 설명',
  '태양광 패널 3 설명',
  '태양광 패널 4 설명',
  '태양광 패널 5 설명',
  '태양광 패널 6 설명',
  '태양광 패널 7 설명',
  '태양광 패널 8 설명',
  '태양광 패널 9 설명',
  '태양광 패널 10 설명',
  '태양광 패널 1 설명',
  '태양광 패널 2 설명',
  '태양광 패널 3 설명',
  '태양광 패널 4 설명',
  '태양광 패널 5 설명',
  '태양광 패널 6 설명',
  '태양광 패널 7 설명',
  '태양광 패널 8 설명',
  '태양광 패널 9 설명',
  '태양광 패널 10 설명'
];

const FallingPanelsCanvas = () => {
  const sceneRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const {
      Engine, Render, Runner, World,
      Bodies, Mouse, MouseConstraint,
      Events, Query
    } = Matter;

    const engine = Engine.create();
    const runner = Runner.create();
    const width = window.innerWidth;
    const height = window.innerHeight;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#e5f3ff',
      }
    });

    const ground = Bodies.rectangle(width / 2, height + 20, width, 40, {
      isStatic: true,
      render: { fillStyle: '#888' }
    });
    const leftWall = Bodies.rectangle(-10, height / 2, 20, height, {
      isStatic: true,
      render: { visible: false }
    });
    const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, {
      isStatic: true,
      render: { visible: false }
    });
    const ceiling = Bodies.rectangle(width / 2, -10, width, 20, {
      isStatic: true,
      render: { visible: false }
    });
    
    World.add(engine.world, [ground, leftWall, rightWall]);

    // 사각형 패널 생성 (크기 확대)
    const panels = panelInfo.map((info, i) => {
      const x = width / 2 + (Math.random() * 90 - 10);
      const y = -100 - i * 100;
      const angle = Math.random() * 0.3 - 0.15;

      const body = Bodies.rectangle(x, y, 250, 90, {
        restitution: 0.7,
        friction: 0.1,
        angle: Math.random() * 0.2 - 0.1,
        inertia: Infinity,           // 회전 관성 무한 → 회전 거의 없음
        angularVelocity: 0,          // 초기 회전 속도 0
        angularDamping: 1,           // 회전 저항 최대
        render: {
          sprite: {
            texture: require('../assets/SimulationPage/solarpanel2.png'),
            xScale: 1.5,
            yScale: 1,
          }
        },
        label: info
      });

      return body;
    });

    World.add(engine.world, panels);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    World.add(engine.world, mouseConstraint);

    Events.on(mouseConstraint, 'mousemove', event => {
      const found = Query.point(panels, event.mouse.position);
      if (found.length > 0) {
        const panel = found[0];
        infoRef.current.style.display = 'block';
        infoRef.current.innerText = panel.label;
        infoRef.current.style.left = `${event.mouse.absolute.x + 10}px`;
        infoRef.current.style.top = `${event.mouse.absolute.y - 30}px`;
      } else {
        infoRef.current.style.display = 'none';
      }
    });

    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return (
    <div ref={sceneRef} className="falling-panel-scene">
      <div ref={infoRef} className="hover-info" />
    </div>
  );
};

export default FallingPanelsCanvas;
