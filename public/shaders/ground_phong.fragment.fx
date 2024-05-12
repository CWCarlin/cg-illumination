#version 300 es
precision mediump float;

// Input
in vec3 model_position;
in vec3 model_normal;
in vec2 model_uv;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {
    vec3 cam = normalize(model_position - camera_position);
    vec3 norm = normalize(model_normal);
    vec3 diffuse;
    vec3 specular;
    vec3 light;
    for (int i = 0; i < num_lights; i++) {
        light = normalize(light_positions[i] - model_position);
        diffuse += clamp(light_colors[i] * dot(norm, light), 0.0, 1.0);
        specular += clamp(mat_specular * light_colors[i] * pow(dot(normalize(reflect(light, norm)), cam), mat_shininess), 0.0, 1.0);
    }

    diffuse = clamp(diffuse, 0.0, 1.0);
    specular = clamp(specular, 0.0, 1.0);

    FragColor = vec4(mat_color * (ambient + diffuse + specular) * texture(mat_texture, model_uv).rgb, 1.0);
}
