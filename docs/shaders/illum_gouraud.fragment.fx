#version 300 es
precision mediump float;

// Input
in vec2 model_uv;
in vec3 diffuse_illum;
in vec3 specular_illum;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform sampler2D mat_texture;
// light from environment
uniform vec3 ambient; // Ia

// Output
out vec4 FragColor;

void main() {
    vec3 specular = clamp(mat_specular * specular_illum, 0.0, 1.0);
    vec3 model_color = mat_color * (ambient + diffuse_illum + specular) * texture(mat_texture, model_uv).rgb;
    // Color
    FragColor = vec4(model_color, 1.0);
}
