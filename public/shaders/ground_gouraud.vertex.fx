#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform float mat_shininess;
uniform vec2 texture_scale;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);
    
    // Sample heightmap to displace vertex position in Y direction
    vec2 ground_coords = vec2((world_pos.xz / ground_size) + 0.5);
    float height = texture(heightmap, ground_coords).r * height_scalar;
    world_pos.y += height;

   // Calculate lighting at each vertex
   vec3 model_position = world_pos.xyz;
   vec3 model_normal = normalize(vec3(0.0, 1.0, 0.0)); // Assume normal is always pointing up for ground
   vec3 norm = normalize(model_normal);
   vec3 cam = normalize(model_position - camera_position);
   vec3 light;
   vec3 diffuse;
   vec3 specular;
   
   for (int i = 0; i < num_lights; i++) {
        light = normalize(light_positions[i] - model_position);
        diffuse += clamp(light_colors[i] * dot(norm, light), 0.0, 1.0);
        specular += clamp(light_colors[i] * pow(dot(normalize(reflect(light, norm)), cam), mat_shininess), 0.0, 1.0);
    }
    
    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = clamp(diffuse, 0.0, 1.0);
    specular_illum = clamp(specular, 0.0, 1.0);

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
