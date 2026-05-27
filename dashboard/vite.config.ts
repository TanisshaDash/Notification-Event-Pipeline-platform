export default (async () => {
  const { defineConfig } = await import("vite");
  const react = (await import("@vitejs/plugin-react")).default;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  };
});