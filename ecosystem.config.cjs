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
      script: 'node',
      args: 'node_modules/next/dist/bin/next start apps/web -p 3000',
      cwd: './',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
};
