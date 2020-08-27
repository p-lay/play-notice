module.exports = {
  apps: [
    {
      name: 'notice-prod',
      script: './dist/main.js',
      exec_mode: 'cluster',
      instances: 1,
      env: {
        NODE_ENV: 'PROD',
      },
    },
  ],
}
