const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('textures/earth_daymap.jpg', 
    () => {
        console.log('Earth texture loaded successfully');
    }, 
    undefined, 
    (error) => {
        console.error('Error loading Earth texture:', error);
    }
);
const cloudsTexture = textureLoader.load('textures/earth_clouds.jpg', 
    () => {
        console.log('Cloud texture loaded successfully');
    }, 
    undefined, 
    (error) => {
        console.error('Error loading cloud texture:', error);
    }
);

const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const cloudsMaterial = new THREE.MeshBasicMaterial({ map: cloudsTexture, transparent: true, opacity: 0.5 });
const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
scene.add(clouds);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5).normalize();
scene.add(directionalLight);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.005;
    clouds.rotation.y += 0.005;
    renderer.render(scene, camera);
}
animate();

async function loadNEOs() {
    try {
        const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-10-06&end_date=2024-10-06&api_key=qQQOf8z0bSfsHPgICqJX0GVkXHLecryP9v80qFCA`);
        const neos = response.data.near_earth_objects['2024-10-06'];
        console.log('NEOs loaded:', neos.length);

        const infoDiv = document.getElementById('info');
        infoDiv.innerHTML = '';

        neos.forEach(neo => {
            const neoGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const neoMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const neoMesh = new THREE.Mesh(neoGeometry, neoMaterial);

            neoMesh.position.x = Math.random() * 4 - 2;
            neoMesh.position.y = Math.random() * 4 - 2;
            neoMesh.position.z = Math.random() * 4 - 2;

            scene.add(neoMesh);
            neoMesh.userData = { name: neo.name };

            if (neo.estimated_diameter && neo.estimated_diameter.kilometers) {
                const diameter = neo.estimated_diameter.kilometers.estimated_diameter_max;
                const neoInfo = document.createElement('div');
                neoInfo.style.color = 'white';
                neoInfo.innerText = `Name: ${neo.name}, Size: ${diameter} km`;
                infoDiv.appendChild(neoInfo);
            } else {
                const neoInfo = document.createElement('div');
                neoInfo.style.color = 'white';
                neoInfo.innerText = `Name: ${neo.name}, Size: Data not available`;
                infoDiv.appendChild(neoInfo);
            }
        });
    } catch (error) {
        console.error('Error loading NEOs:', error);
    }
}

loadNEOs();
