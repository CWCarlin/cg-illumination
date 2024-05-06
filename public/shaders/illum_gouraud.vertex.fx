#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;
uniform float mat_shininess;
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
    vec3 pos = (world * vec4(position, 1.0)).xyz;
    vec3 n = mat3(transpose(inverse(world))) * normal;

    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * light_colors[0];

    vec3 norm = normalize(n);
    vec3 light = normalize(light_positions[0] - pos);
    float diff = max(dot(norm, light), 0.0);
    vec3 diffuse = diff * light_colors[0];

    float specularStrength = 1.0;
    vec3 viewDir = normalize(camera_position - pos);
    vec3 reflectDir = reflect(-light, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    vec3 specular = specularStrength * spec * light_colors[0];

    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = diffuse;
    specular_illum = specular;

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
