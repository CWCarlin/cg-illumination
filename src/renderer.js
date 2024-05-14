import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh, StandardMaterial, VertexData } from '@babylonjs/core';

const BASE_URL = import.meta.env.BASE_URL || '/';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [500, 500],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.53, 0.81, 0.92, 1.0),
                materials: null,
                ground_subdivisions: [500, 500],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.53, 0.81, 0.92, 1.0),
                materials: null,
                ground_subdivisions: [500, 500],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        
        // Create custom mesh
        let triangleMesh = new Mesh('triangleMesh', scene);
        let vertexData = new VertexData();
        let vertices = [
            new Vector3(0, 0, 0),
            new Vector3(1, 0, 0),
            new Vector3(1, 1, 0),
            new Vector3(0, 1, 0),
            
            new Vector3(0.5, 0.5, 1),
            new Vector3(0.25, 0.25, 2),
            new Vector3(0.75, 0.25, 2),
            new Vector3(0.75, 0.75, 2),
            new Vector3(0.25, 0.75, 2),
            new Vector3(0.5, 0.5, 3),
            
            new Vector3(0.5, 0.25, 1),
            new Vector3(0.75, 0.5, 1),
            new Vector3(0.5, 0.75, 1),
            new Vector3(0.25, 0.5, 1),
            
            new Vector3(0.75, 0.25, 1),
            new Vector3(0.75, 0.75, 1),
            
            new Vector3(0.5, 0.75, 1),
            
            new Vector3(0.25, 0.75, 1),
            new Vector3(0.25, 0.25, 1),
            new Vector3(0.5, 0.25, 1)
        ];
        let indices = [
            0, 1, 2,
            0, 2, 3,
            
            4, 5, 6,
            4, 6, 7,
            4, 7, 8,
            4, 8, 9,
            
            0, 1, 10,
            1, 2, 11,
            2, 3, 12,
            3, 0, 13,
            1, 11, 10,
            2, 12, 11,
            3, 13, 12,
            0, 10, 13,
            2, 4, 14,
            4, 5, 14,
            5, 6, 14,
            6, 7, 14,
            7, 8, 14,
            8, 9, 14,
            9, 4, 14,
            4, 9, 5,
        ];
        
        // Calculate normals
    let normals = [];
    for (let i = 0; i < vertices.length; i++) {
        normals.push(Vector3.Zero());
    }

    // Calculate face normals and add to vertex normals
    for (let i = 0; i < indices.length; i += 3) {
        let i1 = indices[i];
        let i2 = indices[i + 1];
        let i3 = indices[i + 2];

        let v1 = vertices[i1];
        let v2 = vertices[i2];
        let v3 = vertices[i3];

        let edge1 = v2.subtract(v1);
        let edge2 = v3.subtract(v1);
        let normal = Vector3.Cross(edge1, edge2).normalize();

        // Add face normal to vertex normals
        normals[i1] = normals[i1].add(normal);
        normals[i2] = normals[i2].add(normal);
        normals[i3] = normals[i3].add(normal);
    }

    // Normalize vertex normals
    for (let i = 0; i < normals.length; i++) {
        normals[i] = normals[i].normalize();
    }

    // Assign normals to vertexData
    vertexData.normals = normals.map(v => v.x).concat(normals.map(v => v.y), normals.map(v => v.z));


        vertexData.positions = vertices.map(v => v.x).concat(vertices.map(v => v.y), vertices.map(v => v.z));
        vertexData.indices = indices;
        vertexData.applyToMesh(triangleMesh);
        // Customize the appearance of the triangle
        triangleMesh.metadata = {
            mat_color: new Color3(0.20, 0.45, 0.50),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        triangleMesh.material = materials['illum_' + this.shading_alg];
        triangleMesh.scaling = new Vector3(5, 5, 5); // Make it larger
        current_scene.models.push(triangleMesh);

    
        scene.onKeyboardObservable.add((key_press) => {
            switch (key_press.event.key) {
                case 'w':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.0, -0.5));
                    break;
                case 'a':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(-0.5, 0.0, 0.0));
                    break;
                case 's':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.0, 0.5));
                    break;
                case 'd':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.5, 0.0, 0.0));
                    break;
                case 'r':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.5, 0.0));
                    break;
                case 'f':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, -0.5, 0.0));
                    break;
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs

            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, .99, .91);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/invert.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        let box0 = CreateBox('box0', {width: 1, height: 1, depth: 1}, scene);
        box0.position = new Vector3(0.0, 5.0, 2.0);
        box0.metadata = {
            mat_color: new Color3(0.55, 0.15, 0.85),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 20,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box0.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box0);

        let box1 = CreateBox('box1', {width: 1, height: 1, depth: 1}, scene);
        box1.position = new Vector3(0.0, 6.0, 2.0);
        box1.metadata = {
            mat_color: new Color3(0.15, 0.85, 0.75),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box1.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box1);

        let box2 = CreateBox('box2', {width: 1, height: 1, depth: 1}, scene);
        box2.position = new Vector3(0.0, 7.0, 2.0);
        box2.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box2.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box2);

        scene.onKeyboardObservable.add((key_press) => {
            switch (key_press.event.key) {
                case 'w':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.0, -0.5));
                    break;
                case 'a':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(-0.5, 0.0, 0.0));
                    break;
                case 's':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.0, 0.5));
                    break;
                case 'd':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.5, 0.0, 0.0));
                    break;
                case 'r':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.5, 0.0));
                    break;
                case 'f':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, -0.5, 0.0));
                    break;
            }
        });

        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, .99, .91);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Create point light sources
        let light1 = new PointLight('light1', new Vector3(1.0, 1.0, 5.0), scene);
        light1.diffuse = new Color3(1.0, 0, 0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

                        // Create point light sources
        let light2 = new PointLight('light2', new Vector3(2.0, 1.0, 5.0), scene);
        light2.diffuse = new Color3(0, 0, 1.0);
        light2.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light2);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/fuji.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        

        for (let i = 0; i <= 20; i ++) {
            // Create other models
            let sphere = CreateSphere('sphere' + i, {segments: 32}, scene);
            sphere.position = new Vector3(i-10, 3.0, i-10);
            sphere.metadata = {
                mat_color: new Color3(i/20, i/20, i/20),
                mat_texture: white_texture,
                mat_specular: new Color3(1.0, 1.0, 1.0),
                mat_shininess: 16,
                texture_scale: new Vector2(1.0, 1.0)
            }
            sphere.material = materials['illum_' + this.shading_alg];
            current_scene.models.push(sphere);
        }


        scene.onKeyboardObservable.add((key_press) => {
            switch (key_press.event.key) {
                case 'w':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.0, -0.5));
                    break;
                case 'a':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(-0.5, 0.0, 0.0));
                    break;
                case 's':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.0, 0.5));
                    break;
                case 'd':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.5, 0.0, 0.0));
                    break;
                case 'r':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, 0.5, 0.0));
                    break;
                case 'f':
                    current_scene.lights[this.active_light].position.addInPlace(new Vector3(0.0, -0.5, 0.0));
                    break;
            }
        });

        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
