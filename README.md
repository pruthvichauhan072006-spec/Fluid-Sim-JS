JavaScript 2D Fluid Dynamics Engine

A real-time, high-performance 2D fluid simulation engine built entirely from scratch in vanilla JavaScript and HTML5 Canvas, while being all CPU based.

This project implements a custom physics solver based on **Smoothed Particle Hydrodynamics (SPH)** principles, optimized for the browser using **Data-Oriented Design** and **Spatial Partitioning**.

![Fluid Simulation Demo](https://github.com/user-attachments/assets/d45c05f3-8edb-4bdb-ba3a-fe7f806f3714) 

## Technical Overview

Used Principles: 

*   **Data-Oriented Design (SoA):** Particle states (positions, velocities, accelerations, densities) are decoupled into separate 1D `Float32Array` buffers. This ensures contiguous memory allocation, maximizing CPU cache hit rates and eliminating JavaScript garbage collection overhead during the physics loop.
*   **Spatial Partitioning (Grid Hashing):** Implemented a dynamic grid-based spatial hashing system. Instead of O(N²) neighbor checks, particles only compute density and pressure against local grid cells, drastically improving performance for high particle counts (up to 50,000+ capacity).
*   **Physics Integration:** Utilizes semi-implicit Euler integration with time-step sub-stepping (5 iterations per frame) to maintain mathematical stability and fluid incompressibility during high-velocity collisions.
*   **Dynamic Viscosity & Pressure:** Calculates local particle densities and applies repelling pressure forces iteratively to approximate the Navier-Stokes equations for fluid flow.

## Features & Controls

The engine features real-time interaction and multiple rendering pipelines:

*   **Render Mode 1 (Metaballs):** Density-based rendering using Canvas `Path2D` API to simulate cohesive liquid viscosity.
*   **Render Mode 2 (Velocity Mapping):** Color-mapped particle rendering based on scalar velocity vectors (Blue -> Red heat mapping).
*   **Mouse Interactions:**
    *   **Brush Mode 1:** Inject fluid (Spawn particles at mouse coordinates).
    *   **Brush Mode 2:** Apply directional kinetic force to local particle clusters.

### Keyboard Shortcuts
*   `1`: Set brush to 'Spawn Fluid'
*   `2`: Set brush to 'Apply Force'
*   `3`: Switch to Viscosity Render Mode
*   `4`: Switch to Velocity Color-Map Render Mode
*   `C`: Clear all particles

## Run Locally

Since this engine is built in vanilla JS with zero external dependencies, running it is instant:

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/fluid-sim-js.git](https://github.com/yourusername/fluid-sim-js.git

## Project Roadmap & Architectural Future

This JavaScript implementation serves as the mathematical and algorithmic foundation for a broader series of upcoming computational physics projects. By prototyping the Smoothed Particle Hydrodynamics (SPH) logic in a high-level language first, the architecture is now ready to be ported to lower-level, high-performance environments.

**Upcoming Implementations:**
*   **Embedded Systems Physics (C++ / ESP):** Porting the core particle solver to C++ to run natively on ESP microcontrollers, testing the limits of physics calculations on resource-constrained embedded hardware.
*   **Advanced Fluid Solvers:** Expanding the mathematical models beyond basic SPH to implement Eulerian (grid-based) and hybrid FLIP (Fluid-Implicit-Particle) fluid simulations.
*   **Lagrangian Mechanics:** Developing deeper particle-based Lagrangian simulations to model complex soft-body physics and thermodynamics.
