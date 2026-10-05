module.exports = {
  apps: [
    {
      name: 'poseplease-server',
      script: 'node',
      args: '--experimental-strip-types src/index.ts',
      cwd: './apps/server',
      env: {
        PORT: 2567,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'poseplease-web',
      script: 'npm',
      args: 'run start --workspace=@poseplease/web',
      cwd: './',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
};
