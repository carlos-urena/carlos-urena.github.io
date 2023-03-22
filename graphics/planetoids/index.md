---
usemathjax: true
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

$$
   \newcommand{\cv}{\mathbf{v}}
$$

Written March 22, 2023.

# Procedural generation of planetoids:

In this page I explain how to use a procedural generation algorithm to create an indexed mesh which resembles a planet or _planetoid_. I start from a (high resolution) unit radius sphere and then I radially displace the vertexes using Perlin Noise. An example mesh (for a particular set of parameter values) is seen here:

![Final planetoid image](imgs/img11.png "Final planetoid image" | width=100px)

These generation algorithms has been tested in C++, but can be adapted to other programming languages, running from scratch or on games engines.


## (1) Sphere generation

The generation algorithm must use a high resolution sphere, as we want to add high rersolution variations to enhance realism. Generating a high resolution sphere can be easily done by using the usual parametrization of the sphere, based on longitude and latitude angles (that is, by rotating a semicircunference going from south to north pole). However, this method produces triangles with a high variation in area and proportions, as it yields very small triangles near the poles and quite big ones near the equator. 

To solve this, we use a regular polyedron (more concretelly a platonic solid), whose vertexes are in the unit radius sphere, and which includes just equalateral triangles, all of them congruent (same area and edges length). From all the platonic solids meeting this requeriment, I choose the Icosahedron, because this is the platonic solid with the largest number of triangles (20). 


Once the Icosahedron has been generated, I split each original triangle in 4 triangles, which replace the original one. Thus I obtain a 80 triangles mesh. This process can be repeated $$n$$ times, each time subdividing every triangle in the mesh, so in the end we get an indexed mesh with exactly $$20\cdot 4^n$$ triangles. 

In order to subdivide a triangle in four, three new vertexes are added to the mesh vertex table. Each new vertex is in the middle point of each edge of the original triangle. The three original vertexes, along with the three new ones, are used as vertexes for the new 4 triangles, which are also equilateral. These new triangles are added to the triangles table, while the original triangle is removed from that table.


This process leads to a mesh with the shape of an Icosahedron, made of small triangles, all of them with equal area. Each triangle is in one of the the original Icosahdreon faces planes. As we want to obtain a sphere, we must modify the position of the new vertexes during the subdivision step: when a new vertex is computed (in the middle point of an edge), it is normalized before adding it to the vertexes table, that is, we displace the new vertex radially so it meets the unit-radius sphere surface. This normalization implies that the new four triangles are not exactly the same area, but the area diferences are very small as compared to the area diference you obtain with lat-lon sphere generation algorithm. this can be verified visually, as you can asses by observing the final high-resolution sphere mesh.


## (2) Vertex displacement

After computing the sphere, we need to modify the vertexes positions to give it a characteristical _bumpy_ look. The natural option for this is to apply a radial displacement to each vertex, that is, to use a scalar factor $$f_i$$ to modify the distance from the origin to the $$i$$-th vertex. This yields a mesh resembling a planet whose height is different at each point, where _height_ here means _distance to the planet center_. If we name $$\cv_i$$ to the original position of the vertex and $$\cv_i'$$ the displaced position, we will compute the latter from the former as:

$$
     \cv_i' ~=~ f_i\, \cv_i
$$ 

Here, we assume we are using a cartesian coordinate frame whose origin is in the planet-center