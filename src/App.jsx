


import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, useAnimations } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Float, ContactShadows } from '@react-three/drei'
// ── candy options ─────────────────────────────────────────────────
const CANDIES = [
  {
    id: 'skittles',
    label: 'Rainbow Skittles',
    sub: 'Taste the rainbow',
    flavor: 'Fruity · Tangy · Bold',
    color: '#f472b6',
    accent: '#be185d',
    glb: '/c1.glb',
    price: { s: 7.99, m: 13.99, l: 19.99 },
  },
  {
    id: 'toffees',
    label: 'Caramel Toffees',
    sub: 'Old-school sweetness',
    flavor: 'Chewy · Caramel · Fruity',
    color: '#fb923c',
    accent: '#c2410c',
    glb: '/c1.glb',
    price: { s: 6.99, m: 11.99, l: 17.99 },
  },
]

const SIZES = [
  { id: 's', label: 'S', weight: '150g' },
  { id: 'm', label: 'M', weight: '300g' },
  { id: 'l', label: 'L', weight: '500g' },
]

// ── 3D model ─────────────────────────────────────────────────────
function CandyModel({ glb,activeCandy }) {
  const group = useRef()
  const { scene, animations } = useGLTF(glb)
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    // Auto-center the model using bounding box
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    // Shift model so its center is at origin
    scene.position.set(-center.x, -center.y, -center.z)

   scene.traverse((child) => {
  if (!child.isMesh) return

  const n = child.name.toLowerCase()

  // SAVE ORIGINAL MATERIAL ONCE
  if (!child.userData.originalMaterial) {
    child.userData.originalMaterial = child.material.clone()
  }

  // JAR
  if (
    n.includes('jar') ||
    n.includes('glass') ||
    n.includes('container')
  ) {
    child.material = new THREE.MeshPhysicalMaterial({
      color: '#e8eff5',
      roughness: 0.08,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    })

    return
  }

  // TOFFEES
  if (activeCandy?.id === 'toffees') {
    child.material = new THREE.MeshStandardMaterial({
      color: '#b86b3d',
      roughness: 0.45,
      metalness: 0,
    })

    return
  }

  // RESTORE ORIGINAL SKITTLES MATERIAL
  child.material = child.userData.originalMaterial.clone()
})
 }, [scene, activeCandy])

  useEffect(() => {
    if (!names.length) return
    names.forEach((name) => {
      const action = actions[name]
      if (!action) return
      action.reset()
        action.timeScale = 5 
      action.setLoop(2200, 1)
      action.clampWhenFinished = true
      action.play()
    })
  }, [actions, names, glb])

  return (
    <primitive
      ref={group}
      object={scene}
      scale={0.15}
      position={[0, 1, 0]}
    />
  )
}

function SpinnerFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.25, 12, 12]} />
      <meshStandardMaterial color="#f9a8d4" wireframe />
    </mesh>
  )
}

// ── Shopping Cart Icon ────────────────────────────────────────────
function CartIconSVG() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
function CartScene({ glb, modelKey, activeCandy }) {
  return (
    <>
      <color attach="background" args={['#ffe9ef']} />
      <fog attach="fog" args={['#ffe9ef', 14, 28]} />

      {/* Lights */}
      <ambientLight intensity={0.6} color="#fff5f8" />
      <directionalLight position={[5, 8, 5]} intensity={1.3} castShadow />
      <directionalLight position={[-4, 5, -3]} intensity={0.4} color="#ffd6e3" />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#fff0d4" />

      {/* Cart body */}
      <Cart3D />

      {/* Awning */}
      <Awning3D />

      {/* Tera model — Float ke andar */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
        <group position={[0, 0.3, 0]} scale={1.1}>
          <Suspense fallback={<SpinnerFallback />}>
        <CandyModel
  key={modelKey}
  glb={glb}
  activeCandy={activeCandy}
/>
          </Suspense>
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.18, 0]}
        opacity={0.4}
        blur={2.5}
        scale={10}
        far={4}
      />
      <Environment preset="apartment" />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={9}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}
function Cart3D() {
  return (<group position={[0, -1.2, 0]}>
    
      {/* Counter top */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.6, 0.18, 2.0]} />
        <meshStandardMaterial color="#f7e3d2" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[4.7, 0.05, 2.1]} />
        <meshStandardMaterial color="#ff5c8a" roughness={0.5} />
      </mesh>

      {/* Front panel */}
      <mesh position={[0, -0.7, 0.85]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 1.5, 0.18]} />
        <meshStandardMaterial color="#ff8aab" roughness={0.55} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, -0.7, -0.85]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 1.5, 0.18]} />
        <meshStandardMaterial color="#ff8aab" roughness={0.55} />
      </mesh>

      {/* Side panels */}
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, -0.75, 0]} castShadow>
          <boxGeometry args={[0.18, 1.6, 1.7]} />
          <meshStandardMaterial color="#ff5c8a" roughness={0.55} />
        </mesh>
      ))}

      {/* White slats — front */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i - 2.5) * 0.78, -0.7, 0.95]}>
          <boxGeometry args={[0.07, 1.4, 0.04]} />
          <meshStandardMaterial color="#fff5f0" roughness={0.5} />
        </mesh>
      ))}

      {/* White slats — back */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`b${i}`} position={[(i - 2.5) * 0.78, -0.7, -0.95]}>
          <boxGeometry args={[0.07, 1.4, 0.04]} />
          <meshStandardMaterial color="#fff5f0" roughness={0.5} />
        </mesh>
      ))}

      {/* Bottom rail front */}
      <mesh position={[0, -1.48, 0.85]}>
        <boxGeometry args={[4.5, 0.12, 0.2]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.5} />
      </mesh>

      {/* Bottom rail back */}
      <mesh position={[0, -1.48, -0.85]}>
        <boxGeometry args={[4.5, 0.12, 0.2]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.5} />
      </mesh>

      {/* 4 Wheels — front-left, front-right, back-left, back-right */}
     {[-1.7, 1.7].map((x) =>
  [0.82, -0.82].map((z) => (
    <group key={`${x}-${z}`} position={[x, -1.55, z]}>
      {/* Tyre — vertical, no rotation needed */}
      <mesh rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.42, 0.1, 16, 32]} />
        <meshStandardMaterial color="#3b2a2f" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Hub — vertical cylinder (rotate on Z axis) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.28, 16]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.4} />
      </mesh>
      {/* Spokes — in vertical wheel plane */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (Math.PI / 4) * i]}>
          <boxGeometry args={[0.74, 0.05, 0.05]} />
          <meshStandardMaterial color="#fff5f0" roughness={0.4} />
        </mesh>
      ))}
    </group>
  ))
)}

      {/* Awning posts */}
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 1.85, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3.4, 16]} />
          <meshStandardMaterial color="#fff5f0" roughness={0.4} />
        </mesh>
      ))}

      {/* Push handle */}
      <mesh position={[2.6, -0.4, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 1.4, 12]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.4} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#ffd6e3" roughness={0.9} />
      </mesh>
    </group>
  )
}
function Awning3D() {
  const stripes = 10
  const stripeW = 0.42
  const totalW = stripes * stripeW
  return (
    <group position={[0, 2.55, 0]}>
      {Array.from({ length: stripes }).map((_, i) => (
        <mesh
          key={i}
          position={[(i - stripes / 2) * stripeW + stripeW / 2, 0, 0]}
          rotation={[-0.45, 0, 0]}
          castShadow
        >
          <boxGeometry args={[stripeW - 0.02, 1.2, 0.06]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#ff5c8a' : '#fff5f0'}
            roughness={0.55}
          />
        </mesh>
      ))}
      {/* Front valance bar */}
      <mesh position={[0, -0.55, 0.5]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[totalW, 0.18, 0.07]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.5} />
      </mesh>
      {/* Scallop balls */}
      {Array.from({ length: stripes }).map((_, i) => (
        <mesh
          key={`s-${i}`}
          position={[(i - stripes / 2) * stripeW + stripeW / 2, -0.7, 0.6]}
          rotation={[-0.45, 0, 0]}
        >
          <sphereGeometry args={[0.13, 16, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#fff5f0" roughness={0.5} />
        </mesh>
      ))}
      {/* Sign board */}
      <mesh position={[0, 0.85, -0.05]} castShadow>
        <boxGeometry args={[totalW * 0.7, 0.55, 0.1]} />
        <meshStandardMaterial color="#4a2a2f" roughness={0.5} />
      </mesh>
    </group>
  )
}
// ── main app ─────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState(CANDIES[0])
  const [size, setSize] = useState(SIZES[1])
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [flash, setFlash] = useState(false)
  const [modelKey, setModelKey] = useState(0)

  const selectCandy = (c) => {
    setActive(c)
    setModelKey((k) => k + 1)
  }

  const addToCart = () => {
    const key = `${active.id}-${size.id}`
    const price = active.price[size.id]
    setCartItems((prev) => {
      const ex = prev.find((i) => i.key === key)
      return ex
        ? prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { key, candy: active, size, qty: 1, price }]
    })
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  const removeItem = (key) => {
    setCartItems((prev) => prev.filter((i) => i.key !== key))
  }

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const sizeName = { s: 'SMALL', m: 'MEDIUM', l: 'LARGE' }

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ════════════════════════════════
          LEFT — 3D stage
      ════════════════════════════════ */}
      <div style={s.left}>

        {/* header: logo + cart button */}
        <div style={s.header}>
          <div style={s.logo}>
            <div style={{ ...s.logoDot, background: active.color }} />
            <div>
              <div style={s.logoTitle}>Sugar &amp; Co.</div>
              <div style={s.logoSub}>CANDY CART · EST. 1962</div>
            </div>
          </div>

          {/* proper shopping cart icon button */}
          <button
            style={s.cartBtn}
            onClick={() => setCartOpen((o) => !o)}
          >
            <CartIconSVG />
            {cartCount > 0 && (
              <span style={{ ...s.cartBadge, background: active.color }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* striped awning banner */}
        <div style={s.banner}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              style={{
                ...s.stripe,
                background: i % 2 === 0 ? active.color : '#fff',
                opacity: i % 2 === 0 ? 0.5 : 1,
              }}
            />
          ))}
          <div style={s.bannerContent}>
            <div style={s.eyebrow}>NOW SERVING</div>
            <div style={s.heroTitle}>{active.label}</div>
            <div style={s.heroSub}>
              <em>{active.sub}</em>
            </div>
          </div>
        </div>

        {/* 3D canvas fills remaining space */}
       {/* 3D canvas fills remaining space */}
<div style={s.canvasWrap}>
  <Canvas
    shadows
   camera={{ position: [0, 1.2, 7], fov: 60 }}
    gl={{ antialias: true, alpha: true }}
    dpr={[1, 2]}
    style={{ width: '100%', height: '100%' }}
  >
    <CartScene glb={active.glb} modelKey={modelKey}  activeCandy={active}/>
  </Canvas>
</div>
      </div>

      {/* ════════════════════════════════
          RIGHT — configurator panel
      ════════════════════════════════ */}
      <div style={s.right}>
        <div style={s.rightInner}>

          <div style={s.stepLabel}>STEP 01</div>
          <h2 style={s.pickTitle}>Pick your candy</h2>
          <p style={s.pickDesc}>
            Choose a flavor and watch us fill your jar, fresh from the cart.
          </p>

          {/* candy cards */}
          <div style={s.candyList}>
            {CANDIES.map((c) => (
              <button
                key={c.id}
                className="candy-opt"
                style={{
                  ...s.candyCard,
                  ...(active.id === c.id
                    ? {
                        borderColor: c.color,
                        boxShadow: `0 4px 20px ${c.color}40`,
                        background: '#fff8fb',
                      }
                    : {}),
                }}
                onClick={() => selectCandy(c)}
              >
                <div style={{ ...s.candyDot, background: c.color }} />
                <div style={s.candyInfo}>
                  <div style={s.candyName}>{c.label}</div>
                  <div style={s.candyFlavor}>{c.flavor}</div>
                </div>
                {active.id === c.id && (
                  <div style={{ ...s.checkmark, color: c.color }}>✓</div>
                )}
              </button>
            ))}
          </div>

          <div style={s.divider} />

          {/* jar size */}
          <div style={s.rowBetween}>
            <div style={s.sectionLabel}>JAR SIZE</div>
            <div style={s.sizeCurrent}>{sizeName[size.id]}</div>
          </div>
          <div style={s.sizeBtns}>
            {SIZES.map((sz) => (
              <button
                key={sz.id}
                className="size-btn"
                style={{
                  ...s.sizeBtn,
                  ...(size.id === sz.id
                    ? {
                        background: '#1a0a10',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(26,10,16,0.22)',
                      }
                    : {}),
                }}
                onClick={() => setSize(sz)}
              >
                <span style={{ fontFamily: 'serif', fontSize: 17, fontWeight: 800 }}>
                  {sz.label}
                </span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>{sz.weight}</span>
              </button>
            ))}
          </div>

          <div style={s.divider} />

          {/* total + add button */}
          <div style={s.rowBetween}>
            <div style={s.sectionLabel}>TOTAL</div>
            <div style={s.bigPrice}>${active.price[size.id].toFixed(2)}</div>
          </div>

          <button
            className="add-btn"
            style={{
              ...s.addBtn,
              background: flash ? '#22c55e' : '#1a0a10',
            }}
            onClick={addToCart}
          >
            {flash ? '✓ Added!' : 'ADD TO CART →'}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════
          CART DRAWER
      ════════════════════════════════ */}
      {cartOpen && (
        <div style={s.drawer}>
          <div style={s.drawerHead}>
            <span style={s.drawerTitle}>Your Cart</span>
            <button style={s.closeX} onClick={() => setCartOpen(false)}>
              ✕
            </button>
          </div>

          {cartItems.length === 0 ? (
            <p style={s.emptyMsg}>Your cart is empty — pick a candy!</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.key} style={s.cartRow}>
                  <div style={{ ...s.cartDot, background: item.candy.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={s.cartItemName}>{item.candy.label}</div>
                    <div style={s.cartItemSub}>
                      {item.size.label} · {item.size.weight} × {item.qty}
                    </div>
                  </div>
                  <div style={s.cartItemPrice}>
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                  <button
                    style={s.removeBtn}
                    onClick={() => removeItem(item.key)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div style={s.cartTotalRow}>
                <span>Total</span>
                <span style={s.cartTotalPrice}>${cartTotal.toFixed(2)}</span>
              </div>

              <button style={{ ...s.checkoutBtn, background: active.color }}>
                Checkout →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── styles ────────────────────────────────────────────────────────
const s = {
  // ROOT: full viewport horizontal split
  page: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: '"DM Sans", sans-serif',
    overflow: 'hidden',
    background: '#fce4ee',
  },

  // LEFT HALF
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    background: '#fce4ee',
    minWidth: 0,
  },

  // header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 32px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoDot: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    transition: 'background 0.4s ease',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 19,
    fontWeight: 800,
    fontFamily: 'serif',
    color: '#1a0a10',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 9,
    letterSpacing: '0.12em',
    color: '#b07080',
    marginTop: 1,
  },

  // cart icon button
  cartBtn: {
    position: 'relative',
    background: '#1a0a10',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    width: 46,
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 0.15s ease',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
    color: '#fff',
    border: '2px solid #fce4ee',
  },

  // awning banner
  banner: {
    width: '100%',
    height: 148,
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stripe: {
    flex: 1,
    height: '100%',
    transform: 'skewX(-2deg)',
    transition: 'background 0.4s ease',
  },
  bannerContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 56,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: '0.18em',
    color: '#7c3348',
    fontWeight: 600,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: 800,
    color: '#1a0a10',
    fontFamily: 'serif',
    lineHeight: 1.1,
    textShadow: '0 2px 12px rgba(255,255,255,0.6)',
  },
  heroSub: { fontSize: 14, color: '#7c3348', marginTop: 4 },

  // 3D canvas: fills remaining left space
  canvasWrap: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },

  // RIGHT PANEL
  right: {
    width: 360,
    flexShrink: 0,
    background: '#fff9fb',
    boxShadow: '-4px 0 30px rgba(180,80,120,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  rightInner: {
    padding: '32px 28px 40px',
    display: 'flex',
    flexDirection: 'column',
  },

  stepLabel: {
    fontSize: 10,
    letterSpacing: '0.14em',
    color: '#b07080',
    fontWeight: 700,
    marginBottom: 6,
  },
  pickTitle: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: 800,
    color: '#1a0a10',
    marginBottom: 8,
  },
  pickDesc: {
    fontSize: 13,
    color: '#b07080',
    lineHeight: 1.55,
    marginBottom: 22,
  },

  candyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 22,
  },
  candyCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    border: '2px solid #fce4ee',
    borderRadius: 16,
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  candyDot: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    flexShrink: 0,
  },
  candyInfo: { flex: 1 },
  candyName: { fontSize: 14, fontWeight: 700, color: '#1a0a10' },
  candyFlavor: { fontSize: 11, color: '#b07080', marginTop: 2 },
  checkmark: { fontSize: 18, fontWeight: 800 },

  divider: { height: 1, background: '#fce4ee', margin: '0 0 18px' },

  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '0.14em',
    color: '#b07080',
    fontWeight: 700,
  },
  sizeCurrent: {
    fontSize: 11,
    color: '#1a0a10',
    fontWeight: 700,
    letterSpacing: '0.06em',
  },

  sizeBtns: { display: 'flex', gap: 8, marginBottom: 22 },
  sizeBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '11px 0',
    background: '#f5ecf0',
    border: '2px solid transparent',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    color: '#1a0a10',
  },

  bigPrice: {
    fontSize: 30,
    fontWeight: 800,
    fontFamily: 'serif',
    color: '#1a0a10',
  },

  addBtn: {
    width: '100%',
    padding: '15px',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'all 0.25s ease',
    marginTop: 16,
  },

  // CART DRAWER
  drawer: {
    position: 'fixed',
    right: 360,
    top: 0,
    bottom: 0,
    width: 300,
    background: '#fff9fb',
    boxShadow: '-4px 0 30px rgba(180,80,120,0.15)',
    zIndex: 100,
    padding: '0 22px 32px',
    overflowY: 'auto',
  },
  drawerHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '22px 0 14px',
    borderBottom: '1px solid #fce4ee',
    marginBottom: 14,
    position: 'sticky',
    top: 0,
    background: '#fff9fb',
    zIndex: 1,
  },
  drawerTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: 800,
    color: '#1a0a10',
  },
  closeX: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    color: '#7c3348',
  },
  emptyMsg: { color: '#b07080', padding: '18px 0', fontSize: 13 },
  cartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 0',
    borderBottom: '1px solid #fce4ee',
  },
  cartDot: { width: 28, height: 28, borderRadius: '50%', flexShrink: 0 },
  cartItemName: { fontWeight: 700, fontSize: 13, color: '#1a0a10' },
  cartItemSub: { fontSize: 11, color: '#b07080', marginTop: 2 },
  cartItemPrice: { fontWeight: 700, color: '#1a0a10', fontSize: 13 },
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 11,
    cursor: 'pointer',
    color: '#b07080',
    padding: '0 2px',
    flexShrink: 0,
  },
  cartTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 0 4px',
    fontSize: 14,
    color: '#1a0a10',
  },
  cartTotalPrice: {
    fontWeight: 800,
    fontSize: 20,
    fontFamily: 'serif',
  },
  checkoutBtn: {
    marginTop: 12,
    width: '100%',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '14px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; overflow: hidden; }

  .candy-opt:hover  { transform: translateY(-2px); }
  .size-btn:hover   { background: #ecdde4 !important; }
  .add-btn:hover    { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(26,10,16,0.28); }
`