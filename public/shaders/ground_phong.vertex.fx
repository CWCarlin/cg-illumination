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
uniform vec2 texture_scale;

// Output
out vec3 model_position;
out vec3 model_normal;
out vec2 model_uv;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    float d = 2.0 * height_scalar * (texture(heightmap, uv).r - 0.5);
    world_pos.y += d;
    
    float forward_diff = 0.01;

    vec2 n_1 = vec2(uv.x + forward_diff, uv.y);
    vec2 n_2 = vec2(uv.x, uv.y + forward_diff);

    float d_n_1 = 2.0 * height_scalar * (texture(heightmap, n_1).r - 0.5);
    float d_n_2 = 2.0 * height_scalar * (texture(heightmap, n_2).r - 0.5);

    vec4 n_1_pos = vec4(world_pos.x + forward_diff * ground_size.x, world_pos.y + d_n_1 - d, world_pos.z, 1.0);
    vec4 n_2_pos = vec4(world_pos.x, world_pos.y + d_n_2 - d, world_pos.z + forward_diff * ground_size.y, 1.0);

    vec3 tangent = (n_1_pos - world_pos).xyz;
    vec3 bitangent = (n_2_pos - world_pos).xyz;
    vec3 normal = normalize(cross(bitangent, tangent));

    // Pass vertex position onto the fragment shader
    model_position = world_pos.xyz;
    // Pass vertex normal onto the fragment shader
    model_normal = normal;
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
