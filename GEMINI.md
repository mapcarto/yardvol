# Gemini AI - Project Analysis: bulk-cargo-volume-monitoring

## Project Overview

This project is a web application named "天巡散货体积监测系统" (Tianxun Bulk Cargo Volume Monitoring System). It is built using Vue 3, TypeScript, and Vite. The application is designed for monitoring the volume of bulk cargo, featuring a 3D visualization interface, data management, task management, and reporting capabilities.

The frontend stack includes:
- **Framework:** Vue 3
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Frameworks:** Element Plus and Ant Design Vue
- **State Management:** Pinia
- **Routing:** Vue Router
- **3D Visualization:** CesiumJS and Three.js
- **Charting:** ECharts and Chart.js
- **HTTP Client:** Axios

The application has a clean, modular structure with a dedicated `src` directory containing components, views, router, and stores. It also includes a comprehensive documentation suite in the `docs` directory.

## Building and Running

### Development

To run the application in a development environment:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Production Build

To build the application for production:

1.  **Build the project:**
    ```bash
    npm run build
    ```
    The production-ready files will be generated in the `dist` directory.

2.  **Preview the production build:**
    ```bash
    npm run preview
    ```

### Linting and Formatting

-   **Lint files:**
    ```bash
    npm run lint
    ```
-   **Format files:**
    ```bash
    npm run format
    ```

## Development Conventions

-   **Code Style:** The project uses ESLint for linting and Prettier for code formatting. The configuration for these tools can be found in the project's root directory.
-   **Component-Based Architecture:** The application follows a component-based architecture, with reusable components located in the `src/components` directory and page-level components in the `src/views` directory.
-   **State Management:** Centralized state management is handled by Pinia, with stores defined in the `src/stores` directory.
-   **Routing:** The application's routes are defined in `src/router/index.ts`, with a clear separation of concerns for different modules of the application.
-   **Styling:** The project uses SCSS for styling, with global styles and variables defined in the `src/styles` directory.
-   **Documentation:** The project has a dedicated `docs` directory with detailed documentation for users, developers, and APIs.
