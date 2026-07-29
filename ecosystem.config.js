module.exports = {
    apps: [
      {
        name: "after-festichill-frontend",
        script: "npm",
        args: "run start",
        cwd: "./",
        port: 3040,
        env: {
          PORT: 3040,
        }
      },
    ],
  };