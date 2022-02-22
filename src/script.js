import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/src/ScrollTrigger.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import starVertexShader from './shaders/vertex.glsl'
import starFragmentShader from './shaders/fragment.glsl'
import Stats from 'stats.js'

/**
 * Preloader
 */

const loader = document.getElementById('preloader')
const loaderIcon = document.getElementById('loadericon')

window.addEventListener('load', () =>
{
    gsap.to(loader, {opacity: 0, ease: 'slow', duration: 3 })
    gsap.to(loaderIcon, {opacity: 0, ease: 'slow', duration: 3 })
    loader.style.zIndex = '0'
    loaderIcon.style.zIndex = '0'
})

/**
* Carousel
*/

const slides = document.querySelectorAll('.pages__carousel-item')
const links = document.querySelectorAll('.pages__carousel-links')
const totalLinks = links.length
const totalSlides = slides.length
const nextButton = document.querySelector('.next-btn')
const previousButton = document.querySelector('.prev-btn')
let slidePosition = 0

// eventlisteners
nextButton.addEventListener('click', () =>
{
   moveToNextSlide()
}) 

previousButton.addEventListener('click', () =>
{
  moveToPreviousSlide()  
})

// functions

const updateSlidePostion = () => {
    for (let slide of slides) 
    {
        slide.classList.remove('visible')
        slide.classList.add('hidden')
    }
    for (let link of links)
    {
        link.classList.remove('visible')
        link.classList.add('hidden')
    }
    slides[slidePosition].classList.add('visible')
    links[slidePosition].classList.add('visible')
}

const moveToNextSlide = () => {
    if (slidePosition === totalSlides -1 && slidePosition === totalLinks -1) 
    {
        slidePosition = 0
    } else {
        slidePosition ++
    }
    updateSlidePostion()
}

const moveToPreviousSlide = () => {
    if (slidePosition === 0) {
        slidePosition = totalSlides -1;
    } else {
        slidePosition --;
    }
    updateSlidePostion()
}

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const fontLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// planet textures
const normalTexture = textureLoader.load('./normal.jpeg')
const planetTexture = textureLoader.load('./planetTextureScaled.jpg')


/**
 * Object
 */
const objectsDistance = 3.5

// STARS
const starGeometry = new THREE.BufferGeometry()
const starCount = 150

const starPositionArray = new Float32Array(starCount * 3)
const starScaleArray = new Float32Array(starCount)

for (let i = 0; i < starCount; i++) {
    starPositionArray[i * 3 + 0] = (Math.random() - 0.5) * 10;
    starPositionArray[i * 3 + 1] = (Math.random() * 20);
    starPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 20;

    starScaleArray[i] = Math.random()
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositionArray, 3))
starGeometry.setAttribute('aScale', new THREE.BufferAttribute(starScaleArray, 1))

// shader
const starMaterial = new THREE.ShaderMaterial({
        uniforms:
        {
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSize: { value: 100 },
            uTime: { value: 0 },
        },
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.position.set(-1, -16, 0)
    scene.add(stars)
    
// planet
const planet = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.7, 64, 64),
    new THREE.MeshStandardMaterial(
        {
            metalness: 0.7,
            roughness: 0.2,
            normalMap: normalTexture,
            map: planetTexture,
        }
    )
)
planet.position.set(0, objectsDistance * 0 - .1, 0);
scene.add(planet)

/**
 * Lights
 */

const topLight = new THREE.PointLight( 0x404040, 3.5 );
topLight.position.set(0, 0, 1)
scene.add(topLight)


const bottomLight = new THREE.PointLight( 0x00adff, 0.1 );
bottomLight.position.set(0, -11, 4)
scene.add(bottomLight)

let spaceman
let mixer

gltfLoader.load(
    'spacemanAnimated.glb',
    (gltf) => 
    {
        spaceman = gltf.scene
        scene.add(spaceman)
        spaceman.position.set(0, -12, 0)

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)


// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 2
camera.position.z = 4
cameraGroup.add(camera)

// Controls
//const controls = new OrbitControls(camera, canvas)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    transparent: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */


// gsap
gsap.registerPlugin(ScrollTrigger)

//introduction
gsap.to('#name', { scrollTrigger: '#name', opacity: 1, duration: 5, ease: 'slow'});
gsap.to('#intro', { scrollTrigger: '#intro', opacity: 1, duration: 5, ease: 'slow'});

//about
gsap.to('.about__me-title',{ scrollTrigger: '.about__me-title', opacity: 1, duration: 5, ease: 'slow' })
gsap.to('.about__me-info',{ scrollTrigger: '.about__me-info', opacity: 1, duration: 5, ease: 'slow' })

// contact
const actions = document.querySelectorAll('.contact__personalia-info')
const socials = document.querySelectorAll('.fa-brands')
for (let action of actions) 
{
    action.addEventListener('mouseenter', () => 
    {
        gsap.to(action, { scale: 1.1, ease: 'slow', duration: 0.5, })
    })
    action.addEventListener('mouseleave', () => 
    {
        gsap.to(action, { scale: 1, ease: 'slow', duration: 0.5, })
    })
}

for (let social of socials) 
{
    social.addEventListener('mouseenter', () => 
    {
        gsap.to(social, { scale: 1.1, rotateZ: 45, ease: 'slow', duration: 0.5, })
    })
    social.addEventListener('mouseleave', () => 
    {
        gsap.to(social, { scale: 1, rotateZ: 0, ease: 'slow', duration: 0.5, })
    })
}

//scroll based events
let scrollY = window.scrollY
window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
})

// mouseFunction
const mouse = {}

mouse.x = 0
mouse.y = 0

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width - 0.5
    mouse.y = event.clientY / sizes.height - 0.5  
})

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    
    // update planet
    planet.rotation.y = elapsedTime * 0.075

    // rotate galaxy
    stars.rotation.y = elapsedTime * 0.0030

    //Plays the wave animation on spaceman if user is scrolled to the end of page
    if(mixer && (window.innerHeight + window.scrollY) >= document.body.offsetHeight)
    {
        mixer.update(deltaTime)
    }


    //lights
    topLight.position.y = - mouse.y
    topLight.position.x = mouse.x
    
    //update camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}



tick()